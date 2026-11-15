'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { startLocalDictation } from '@/infrastructure/speech/localDictation';
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
  const model = useMissionAssistantViewModel(data, startLocalDictation, explorer);
  const [following, setFollowing] = useState(false);
  const describe = useCallback((id: string) => getControlTip(id, data), [data]);
  const exitCoach = useCallback(() => setFollowing(false), []);
  const [guide, setGuide] = useState<{ id: string; path: string; explanation: string }>();
  const [point, setPoint] = useState<Point>();
  if (guide && guide.path !== pathname) setGuide(undefined);
  const targetId = guide?.path === pathname ? guide.id : undefined;
  const markerReady = point !== undefined;
  const marker = useRef<HTMLButtonElement>(null);
  const [launcherHost, setLauncherHost] = useState<HTMLDivElement | null>(null);

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
    if (target?.closest('#mission-dock-secondary') && target.getClientRects().length === 0) {
      document.getElementById('mission-dock-more')?.click();
    }
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
    <AssistantActionsContext value={{ askAboutReading, setLauncherHost }}>
      {children}
      <CursorAssistantScreen
        onOpenChat={landing ? undefined : open}
        suspended={model.open || following || Boolean(targetId)}
      />
      {!(targetId && point && !model.open) && (
        <MissionAssistantView
          model={model}
          explorer={explorer}
          landing={landing}
          launcherHost={launcherHost}
          onGuide={guideTo}
          onOpenSources={openSources}
          onOpen={open}
          onClose={model.hide}
          following={following}
          onChangeMode={(enabled) => {
            setFollowing(enabled);
            if (enabled) model.hide();
          }}
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
