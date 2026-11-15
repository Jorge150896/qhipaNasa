'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { startLocalDictation } from '@/infrastructure/speech/localDictation';
import { tumiConversation, tumiUsesOpenAi } from '@/di/createTumiDependencies.client';
import type { TumiScreenContext } from '@/domain/assistant/TumiConversation';
import { isTumiMobile, subscribeToTumiViewport } from '@/presentation/shared/tumi/tumiViewport';
import { missionRoute } from '@/presentation/shared/missionRoutes';
import { AssistantActionsContext } from './AssistantActionsContext';
import type { MissionData, SensorKey } from '../mission/types';
import type { AssistantSelection } from './types';
import { useMissionAssistantViewModel } from './useMissionAssistantViewModel';
import { MissionAssistantView } from './components/MissionAssistantView';
import { captureMetricContext, getControlTip } from './explainMission';
import { AssistantCoachmark } from './components/AssistantCoachmark';
import { AssistantRobot } from './components/AssistantRobot';
import './mission-assistant.css';
import { CursorAssistantScreen } from '../cursor-assistant/CursorAssistantScreen';
import { mapTumiContext } from './mapTumiContext';

interface Point {
  left: number;
  top: number;
}

export function MissionAssistantScreen({
  data,
  explorer = false,
  landing = false,
  habitatId = 'odyssey',
  children,
}: {
  data: MissionData | null;
  explorer?: boolean;
  landing?: boolean;
  habitatId?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const views = useRef(
    new Map<symbol, { path: string; context: TumiScreenContext; priority: number }>(),
  );
  const registerView = useCallback(
    (context: TumiScreenContext, priority: number) => {
      const id = Symbol();
      views.current.set(id, { path: pathname, context, priority });
      return () => {
        views.current.delete(id);
      };
    },
    [pathname],
  );
  function getContext(reading?: ReturnType<typeof captureMetricContext>) {
    const currentViews = [...views.current.values()]
      .filter((entry) => entry.path === pathname)
      .sort((a, b) => a.priority - b.priority);
    const mainView = currentViews[0]?.context.view;
    return mapTumiContext(
      pathname,
      data,
      mainView
        ? {
            view: mainView,
            details: currentViews
              .map(({ context }) => context.details)
              .filter(Boolean)
              .join('\n'),
          }
        : undefined,
      reading,
    );
  }
  const model = useMissionAssistantViewModel(
    data,
    startLocalDictation,
    explorer,
    tumiUsesOpenAi ? { conversation: tumiConversation, getContext, pathname } : undefined,
  );
  const [following, setFollowing] = useState(false);
  const mobile = useSyncExternalStore(subscribeToTumiViewport, isTumiMobile, () => false);
  const describe = useCallback((id: string) => getControlTip(id, data), [data]);
  const exitCoach = useCallback(() => setFollowing(false), []);
  const [guide, setGuide] = useState<{ id: string; path: string; explanation: string }>();
  const [point, setPoint] = useState<Point>();
  if (guide && guide.path !== pathname) setGuide(undefined);
  const targetId = guide?.path === pathname ? guide.id : undefined;
  const markerReady = point !== undefined;
  const marker = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!targetId) return;
    const target = document.getElementById(`assistant-target-${targetId}`);
    if (!target) return;
    const control = target;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.dataset.assistantHighlight = 'true';
    target.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: reduced ? 'instant' : 'smooth',
    });

    function update() {
      const rect = control.getBoundingClientRect();
      const above = rect.top > 70;
      setPoint({
        left: Math.max(8, Math.min(window.innerWidth - 54, rect.left + rect.width / 2 - 22)),
        top: Math.max(
          8,
          Math.min(window.innerHeight - 54, above ? rect.top - 51 : rect.bottom + 5),
        ),
      });
    }

    function clearGuide() {
      setGuide(undefined);
    }

    update();
    target.addEventListener('click', clearGuide, { once: true });
    window.addEventListener('scroll', update, { capture: true, passive: true });
    window.addEventListener('resize', update);
    return () => {
      delete target.dataset.assistantHighlight;
      target.removeEventListener('click', clearGuide);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [targetId]);

  useEffect(() => {
    if (targetId) marker.current?.focus({ preventScroll: true });
  }, [targetId, markerReady]);

  function guideTo(id: string, explanation: string) {
    const fallback =
      id.startsWith('metric-') || id === 'compare' || id === 'history'
        ? 'crew'
        : id === 'review-check'
          ? 'journal'
          : id;
    const target = document.getElementById(`assistant-target-${id}`);
    const selected = target ? id : fallback;
    setGuide({
      id: selected,
      path: pathname,
      explanation:
        selected !== id
          ? id === 'review-check'
            ? 'Abre Monitoreo diario y completa la autoevaluación para encontrar Revisar chequeo.'
            : id === 'history'
              ? 'Abre Tripulación y elige Historial.'
              : 'Abre Tripulación para encontrar este control.'
          : explanation,
    });
    model.hide();
  }

  function open() {
    setGuide(undefined);
    model.show();
  }

  function changeGuideMode(enabled: boolean) {
    setFollowing(enabled);
    if (enabled) {
      setGuide(undefined);
      model.hide();
    }
  }

  function openSources() {
    model.hide();
    router.push(missionRoute(habitatId, 'sources'));
  }

  function askAboutReading(id: SensorKey, selection?: AssistantSelection) {
    const context = captureMetricContext(`metric-${id}`, data, selection);
    if (!context) return;
    setGuide(undefined);
    model.openWithContext(context);
  }

  return (
    <AssistantActionsContext
      value={{
        askAboutReading,
        askQuestion(question) {
          open();
          model.ask(question, { useReading: false });
        },
        registerView,
      }}
    >
      {children}
      <CursorAssistantScreen
        getContext={getContext}
        onOpenChat={landing ? undefined : open}
        following={following}
        onChangeMode={changeGuideMode}
        suspended={model.open || (following && !mobile) || Boolean(targetId)}
      />
      {!(targetId && point && !model.open) && (
        <MissionAssistantView
          model={model}
          explorer={explorer}
          landing={landing}
          onGuide={guideTo}
          onOpenSources={openSources}
          onOpen={open}
          onClose={model.hide}
          following={following}
          onChangeMode={changeGuideMode}
        />
      )}
      {following && !model.open && !targetId && (
        <AssistantCoachmark
          key={pathname}
          describe={describe}
          onExit={exitCoach}
          onAsk={(id) => {
            const context = captureMetricContext(id, data);
            if (context) model.openWithContext(context);
          }}
        />
      )}
      {targetId && point && !model.open && (
        <div
          className="assistant-guide-marker"
          style={
            {
              ...point,
              '--assistant-x': `${point.left}px`,
              '--assistant-y': `${point.top}px`,
            } as CSSProperties
          }
        >
          <button ref={marker} type="button" aria-label="Volver al chat de Tumi" onClick={open}>
            <AssistantRobot />
          </button>
          <p role="status">{guide?.explanation}</p>
        </div>
      )}
    </AssistantActionsContext>
  );
}
