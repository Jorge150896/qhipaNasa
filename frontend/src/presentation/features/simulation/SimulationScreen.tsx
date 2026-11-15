import { useEffect, useEffectEvent, useMemo } from 'react';
import { monthlyWellbeingDependencies } from '@/di/createMonthlyWellbeingDependencies.client';
import { publicAsset } from '@/presentation/shared/publicAsset';
import { MissionSceneSlot } from '@/presentation/shared/mission/MissionSceneSlot';
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
  const { position, trial } = model;

  useTumiViewContext('Simulación · Ruta emocional', [
    `${crew.name}. Ubicación en la instantánea de la misión: ${crew.location}.`,
    trial
      ? `Prueba de hábitos ficticia. Ruta de ejemplo: ${wellbeingRouteLabels[trial]}. ${model.habitFields.map(({ label, options, value }) => `${label}: ${options.find((option) => option.value === value)?.text}`).join(' · ')}. Los hábitos de la prueba no son una medición del ánimo.`
      : position
        ? `Día ${model.days?.[model.dayIndex]?.number} de la serie simulada. Ruta: ${wellbeingRouteLabels[position.route]}. ${position.reason} Sueño: ${position.sleep}. Fatiga: ${position.fatigue}. La ruta representa el autorreporte de la simulación, no la ubicación física.`
        : 'No hay serie simulada de bienestar para este tripulante.',
  ]);

  return (
    <WellbeingRoutesView
      crewName={crew.name}
      location={crew.location}
      backdrop={publicAsset('/backgrounds/mission-nebula-4k.webp')}
      model={model}
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
