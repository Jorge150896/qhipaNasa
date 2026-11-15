'use client';
import { useMemo } from 'react';
import { createCrewHealthDependencies } from '@/di/createCrewHealthDependencies.client';
import { useMissionOverviewViewModel } from './useMissionOverviewViewModel';
import type { MissionOverviewScreenProps } from './types';
import { MissionOverviewView } from './components/MissionOverviewView';
import { SignalCheckScreen } from './SignalCheckScreen';
import './mission-overview.css';
export function MissionOverviewScreen({
  data,
  actions,
  habitatId,
  onNavigate,
  onStartSignalDemo,
}: MissionOverviewScreenProps) {
  const health = useMemo(() => createCrewHealthDependencies(habitatId), [habitatId]);
  const model = useMissionOverviewViewModel(data, health.load);
  const signal = data.selected.metrics.find((metric) => metric.qualityTone === 'attention');
  function openEvidence(id: (typeof data.selected.metrics)[number]['id']) {
    actions.selectMetric(id);
    onNavigate('history');
  }
  return (
    <MissionOverviewView
      summary={
        signal
          ? {
              ...model.summary,
              pending: model.summary.pending.filter(
                (item) => item.action.kind !== 'signal' || item.action.id !== signal.id,
              ),
            }
          : model.summary
      }
      signalPanel={
        signal && (
          <SignalCheckScreen
            key={`${habitatId}:${data.selected.id}:${data.scenario}:${signal.id}`}
            habitatId={habitatId}
            personId={data.selected.id}
            metric={signal}
            onEvidence={openEvidence}
          />
        )
      }
      onStartSignalDemo={data.scenario !== 'sensor-gap' ? onStartSignalDemo : undefined}
      onStartMonitoring={() => onNavigate('monitoring')}
      onOpenModule={() => {
        actions.selectZone(data.selected.zoneId);
        onNavigate('habitat', 'occupied-module');
      }}
      onOpenDailyCheck={() => onNavigate('journal')}
      onOpenObservation={(id) => onNavigate('observations', `observation-${id}`)}
      onOpenRecord={() => onNavigate('crew', 'crew-health-entry')}
      onReviewSignal={openEvidence}
    />
  );
}
