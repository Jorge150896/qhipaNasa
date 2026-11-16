'use client';
import { useAppLanguage, useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import {
  languageChangeConfirmation,
  requestedAppLanguage,
  speechLanguage,
} from '@/domain/assistant/AppLanguage';

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
import { speakInBrowser } from '@/infrastructure/speech/browserVoice';
import { useTumiReplyAudio } from '@/presentation/shared/tumi/useTumiReplyAudio';
import { tumiConversation, tumiUsesOpenAi } from '@/di/createTumiDependencies.client';
import type { TumiScreenContext } from '@/domain/assistant/TumiConversation';
import { isTumiMobile, subscribeToTumiViewport } from '@/presentation/shared/tumi/tumiViewport';
import { missionRoute } from '@/presentation/shared/missionRoutes';
import { AssistantActionsContext } from './AssistantActionsContext';
import type { MissionData, SensorKey } from '../mission/types';
import type { AssistantSelection } from './types';
import { useMissionAssistantViewModel } from './useMissionAssistantViewModel';
import { MissionAssistantView } from './components/MissionAssistantView';
import { captureMetricContext, getControlTip, tryAnswerMissionQuestion } from './explainMission';
import { AssistantCoachmark } from './components/AssistantCoachmark';
import { TumiAvatar } from '@/presentation/shared/tumi/TumiAvatar';
import './mission-assistant.css';
import { CursorAssistantScreen } from '../cursor-assistant/CursorAssistantScreen';
import { mapTumiContext, tumiViewForPath } from './mapTumiContext';
import { tumiViewIntroductions } from './tumiViewIntroductions';

interface Point {
  left: number;
  top: number;
}

export function MissionAssistantScreen({
  data,
  explorer = false,
  habitatId = 'odyssey',
  children,
}: {
  data: MissionData | null;
  explorer?: boolean;
  habitatId?: string;
  children: ReactNode;
}) {
  const t = useTranslation();
  const { language, selectLanguage } = useAppLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const views = useRef(
    new Map<
      symbol,
      {
        path: string;
        context: TumiScreenContext;
        priority: number;
        localAnswer?: (question: string) => string | undefined;
      }
    >(),
  );
  const viewListeners = useRef(new Set<() => void>());
  const notificationQueued = useRef(false);
  const notifyViewChange = useCallback(() => {
    if (notificationQueued.current) return;
    notificationQueued.current = true;
    queueMicrotask(() => {
      notificationQueued.current = false;
      viewListeners.current.forEach((notify) => notify());
    });
  }, []);
  const subscribeToViews = useCallback((listener: () => void) => {
    viewListeners.current.add(listener);
    return () => {
      viewListeners.current.delete(listener);
    };
  }, []);
  const registerView = useCallback(
    (
      context: TumiScreenContext,
      priority: number,
      localAnswer?: (question: string) => string | undefined,
    ) => {
      const id = Symbol();
      views.current.set(id, { path: pathname, context, priority, localAnswer });
      notifyViewChange();
      return () => {
        views.current.delete(id);
        notifyViewChange();
      };
    },
    [pathname, notifyViewChange],
  );
  function visibleViews() {
    return [...views.current.values()]
      .filter((entry) => entry.path === pathname)
      .sort((a, b) => a.priority - b.priority);
  }
  const viewIntroduction = useSyncExternalStore(
    subscribeToViews,
    () => {
      for (const { context } of visibleViews()) {
        const introduction = tumiViewIntroductions[context.view];
        if (introduction) return introduction;
      }
      if (pathname.endsWith('/sources')) return tumiViewIntroductions['Fuentes y alcance'];
    },
    () => undefined,
  );
  function getContext(reading?: ReturnType<typeof captureMetricContext>) {
    const currentViews = visibleViews();
    const mainView = currentViews[0]?.context.view;
    const context = mapTumiContext(
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
    return { ...context, language };
  }
  function getViewAnswer(question: string) {
    return visibleViews()
      .find((entry) => entry.localAnswer)
      ?.localAnswer?.(question);
  }
  const audio = useTumiReplyAudio(
    (text, callbacks) => speakInBrowser(text, callbacks, speechLanguage(language)),
    pathname,
  );
  function changeLanguageFromQuestion(question: string) {
    const requested = requestedAppLanguage(question);
    if (!requested) return;
    selectLanguage(requested);
    return languageChangeConfirmation(requested);
  }
  const model = useMissionAssistantViewModel(
    data,
    (callbacks) =>
      startLocalDictation(
        callbacks,
        t('Puedes responder en la pantalla.'),
        speechLanguage(language),
      )?.cancel,
    explorer,
    tumiUsesOpenAi ? { conversation: tumiConversation, getContext, pathname } : undefined,
    getViewAnswer,
    audio,
    changeLanguageFromQuestion,
    language,
    () => visibleViews()[0]?.context.view ?? tumiViewForPath(pathname),
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
        changeLanguageFromQuestion={changeLanguageFromQuestion}
        viewIntroduction={viewIntroduction}
        viewPath={pathname}
        getLocalReply={
          !data
            ? undefined
            : (question) =>
                getViewAnswer(question) ?? tryAnswerMissionQuestion(question, data)?.text
        }
        audio={audio}
        onOpenChat={open}
        following={following}
        onChangeMode={changeGuideMode}
        suspended={model.open || (following && !mobile) || Boolean(targetId)}
      />
      {!(targetId && point && !model.open) && (
        <MissionAssistantView
          model={model}
          replyFormat={audio.selectedFormat}
          onChangeReplyFormat={audio.select}
          audioPlaying={audio.playing}
          audioStatus={audio.status}
          onStopAudio={audio.stop}
          explorer={explorer}
          onGuide={guideTo}
          onOpenSources={openSources}
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
          <button
            ref={marker}
            type="button"
            aria-label={t('Volver al chat de Nami')}
            onClick={open}
          >
            <TumiAvatar />
          </button>
          <p role="status">{t(guide?.explanation)}</p>
        </div>
      )}
    </AssistantActionsContext>
  );
}
