'use client';
import { useEffect, useMemo } from 'react';
import { createMonitoringDependencies } from '@/di/createMonitoringDependencies.client';
import { useMonitoringViewModel } from './useMonitoringViewModel';
import { MonitoringView } from './components/MonitoringView';

export function MonitoringScreen(props: {
  habitatId: string;
  person: { id: string; name: string; location: string };
}) {
  return <MonitoringSessionScreen key={`${props.habitatId}:${props.person.id}`} {...props} />;
}
function MonitoringSessionScreen({
  habitatId,
  person,
}: {
  habitatId: string;
  person: { id: string; name: string; location: string };
}) {
  const dependencies = useMemo(() => createMonitoringDependencies(habitatId), [habitatId]);
  const model = useMonitoringViewModel(dependencies, person);
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id.startsWith('session-')) return;
    const details = document.getElementById(id);
    if (details instanceof HTMLDetailsElement) {
      details.open = true;
      details.scrollIntoView({ block: 'center' });
    }
  }, [model.data.journalLoading]);
  return (
    <MonitoringView
      {...model}
      onNewSession={() => {
        if (
          model.data.step === 'saved' ||
          !model.data.captureCount ||
          window.confirm(
            'La sesión aún no se ha guardado. ¿Descartar estas capturas e iniciar otra?',
          )
        )
          model.actions.reset();
      }}
    />
  );
}
