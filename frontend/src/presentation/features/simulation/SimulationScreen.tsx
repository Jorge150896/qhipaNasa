import { useCallback, useEffect, useEffectEvent, useMemo } from 'react';
import { speechLanguage } from '@/domain/assistant/AppLanguage';
import { useAppLanguage, useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { monthlyWellbeingDependencies } from '@/di/createMonthlyWellbeingDependencies.client';
import { speakInBrowser } from '@/infrastructure/speech/browserVoice';
import { publicAsset } from '@/presentation/shared/publicAsset';
import { MissionSceneSlot } from '@/presentation/shared/mission/MissionSceneSlot';
import { useTumiReplyAudio } from '@/presentation/shared/tumi/useTumiReplyAudio';
import { useTumiViewContext } from '../mission-assistant/useTumiViewContext';
import { WellbeingRoutesView } from './components/WellbeingRoutesView';
import { useSimulationViewModel } from './useSimulationViewModel';
import './simulation-routes.css';
import { wellbeingRouteLabels, type SimulationScreenProps } from './types';
import { SignalCheckScreen } from './SignalCheckScreen';

export function SimulationScreen({
  crew,
  habitatId,
  onNavigate,
  signal,
  onOpenSignalEvidence,
  onOpenSignalScenario,
}: SimulationScreenProps) {
  const openSignalScenario = useEffectEvent(onOpenSignalScenario);
  useEffect(() => {
    function syncSignalScenario() {
      if (window.location.hash === '#perdida-de-senal') openSignalScenario();
    }
    syncSignalScenario();
    window.addEventListener('hashchange', syncSignalScenario);
    return () => window.removeEventListener('hashchange', syncSignalScenario);
  }, []);

  return (
    <>
      <SimulationRoutes
        key={`${habitatId}:${crew.id}`}
        crew={crew}
        habitatId={habitatId}
        onNavigate={onNavigate}
      />
      {signal && (
        <SignalCheckScreen
          key={`${signal.personId}:${signal.metric.id}`}
          personId={signal.personId}
          metric={signal.metric}
          onEvidence={() => onOpenSignalEvidence(signal.personId)}
        />
      )}
    </>
  );
}

function SimulationRoutes({
  crew,
  habitatId,
  onNavigate,
}: Pick<SimulationScreenProps, 'crew' | 'habitatId' | 'onNavigate'>) {
  const report = useMemo(
    () => monthlyWellbeingDependencies.read(habitatId, crew.id),
    [habitatId, crew.id],
  );
  const model = useSimulationViewModel(report);
  const { position, trial, guidance } = model;

  const { language } = useAppLanguage();
  const t = useTranslation();
  const audio = useTumiReplyAudio((text, callbacks) =>
    speakInBrowser(text, callbacks, speechLanguage(language)),
  );
  const summary = model.summary;
  const firstName = crew.name.split(' ')[0];
  const recommendations = guidance
    ? [
        { label: t(`Para ${firstName}`), text: guidance.personal },
        { label: t(`Para quienes interactúan con ${firstName}`), text: guidance.team },
      ]
    : [];
  const spokenRecommendations = recommendations
    .map(({ label, text }) => `${label}. ${text}`)
    .join(' ');
  const narrationText = summary && [summary, spokenRecommendations].filter(Boolean).join(' ');
  const hasSummary = Boolean(summary);
  const playSummary = useEffectEvent(() => {
    if (narrationText) audio.replayReply(narrationText, { transcript: true });
  });
  const stopSummary = audio.stop;
  useEffect(() => {
    if (!hasSummary) return;
    playSummary();
    return stopSummary;
  }, [hasSummary, stopSummary]);

  const english = language === 'en';
  const day = model.days?.[model.dayIndex]?.label;
  const route = trial ?? position?.route;
  const routeLabel = route && t(wellbeingRouteLabels[route]);
  const reason = position && t(position.reason);
  const hasPosition = Boolean(position);
  const getVisibleRouteAnswer = useCallback(
    (question: string) => {
      const normalized = question
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
      if (
        spokenRecommendations &&
        /\b(?:recomiend\w*|recomendacion(?:es)?|que (?:podemos|puedo|se puede|deberia) (?:hacer|evitar)|que evitar|recommend\w*|what (?:can|should) (?:we|i) (?:do|avoid)|what to (?:do|avoid)|advice)\b/.test(
          normalized,
        )
      ) {
        return spokenRecommendations;
      }
      if (
        !/\b(?:what (?:do you see|am i seeing|(?:does|is) this (?:show|route|screen))|(?:describe|explain) (?:this|the) (?:screen|route|simulation)|que (?:ves|se ve|muestra esta pantalla|significa esta ruta)|(?:describe|explica)(?:me)? (?:esta|la) (?:pantalla|ruta|simulacion))\b/.test(
          normalized,
        )
      )
        return;
      if (trial && routeLabel) {
        return english
          ? `With the habits you picked, ${crew.name} moves to ${routeLabel}. ${spokenRecommendations}`
          : `Con los hábitos que elegiste, ${crew.name} pasa a la ruta ${routeLabel}. ${spokenRecommendations}`;
      }
      if (hasPosition && routeLabel && day) {
        return english
          ? `${t(day)}: ${crew.name} is on the ${routeLabel} route. ${reason} ${spokenRecommendations}`
          : `En el ${day.toLowerCase()}, ${crew.name} está en la ruta ${routeLabel}. ${reason} ${spokenRecommendations}`;
      }
      return t('No hay serie simulada de bienestar para este tripulante.');
    },
    [crew.name, day, english, hasPosition, reason, routeLabel, spokenRecommendations, t, trial],
  );

  useTumiViewContext(
    'Simulación · Ruta emocional',
    [
      `${crew.name}. Ubicación en la instantánea de la misión: ${crew.location}.`,
      trial
        ? `Prueba de hábitos ficticia. Ruta de ejemplo: ${wellbeingRouteLabels[trial]}. ${model.habitFields.map(({ label, options, value }) => `${label}: ${options.find((option) => option.value === value)?.text}`).join(' · ')}. Los hábitos de la prueba no son una medición del ánimo.`
        : position
          ? `Día ${model.days?.[model.dayIndex]?.number} de la serie simulada. Ruta: ${wellbeingRouteLabels[position.route]}. ${position.reason} Sueño: ${position.sleep}. Fatiga: ${position.fatigue}. La ruta representa el autorreporte de la simulación, no la ubicación física.`
          : 'No hay serie simulada de bienestar para este tripulante.',
    ],
    0,
    getVisibleRouteAnswer,
  );

  return (
    <WellbeingRoutesView
      crewName={crew.name}
      location={crew.location}
      backdrop={publicAsset('/backgrounds/mission-nebula-4k.webp')}
      model={model}
      narration={
        summary && narrationText && route
          ? {
              text: summary,
              recommendations,
              route,
              playing: audio.playing,
              spokenWords: audio.spokenWords,
              status: audio.status,
              onPlay: () => audio.replayReply(narrationText, { transcript: true }),
              onStop: audio.stop,
            }
          : undefined
      }
      astronaut={
        <MissionSceneSlot
          mode="crew"
          transparentBackground
          selectedSensor="heartRate"
          selectedZone={crew.zoneId}
          onSelectZone={() => {}}
        />
      }
      onOpenRoute={(route) => {
        if (route === 'routine') onNavigate('crew', 'crew-module');
        else if (route === 'adjustment') onNavigate('crew', 'crew-history');
        else onNavigate('journal');
      }}
    />
  );
}
