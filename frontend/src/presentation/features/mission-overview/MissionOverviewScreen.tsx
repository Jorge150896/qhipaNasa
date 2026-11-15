'use client';
import { useMemo } from 'react';
import { createCrewHealthDependencies } from '@/di/createCrewHealthDependencies.client';
import { useMissionOverviewViewModel } from './useMissionOverviewViewModel';
import type { MissionOverviewScreenProps } from './types';
import { MissionOverviewView } from './components/MissionOverviewView';
import { MissionSceneSlot } from '../../shared/mission/MissionSceneSlot';
import './mission-overview.css';
export function MissionOverviewScreen({
  data,
  actions,
  habitatId,
  onNavigate,
}: MissionOverviewScreenProps) {
  const health = useMemo(() => createCrewHealthDependencies(habitatId), [habitatId]);
  const model = useMissionOverviewViewModel(habitatId, data, health.load);
  return (
    <MissionOverviewView
      summary={model.summary}
      overviewData={model.astronautOverview}
      onOpenSources={() => onNavigate('sources')}
      onStartMonitoring={() => onNavigate('monitoring')}
      onOpenModule={() => onNavigate('crew', 'crew-module')}
      onOpenRecord={() => onNavigate('crew', 'crew-health-entry')}
      onReviewSignal={(id) => {
        actions.selectMetric(id);
        onNavigate('history');
      }}
      dashboard={{
        data,
        actions,
        habitatLabel: model.habitatLabel,
        mode: model.mode,
        onModeChange: model.onModeChange,
        onOpenHistory: () => onNavigate('history'),
        onOpenDailyCheck: () => onNavigate('journal'),
        scene: (
          <MissionSceneSlot
            transparentBackground
            animateAstronaut={false}
            habitatKind={model.habitatKind}
            mode={model.mode}
            selectedSensor={data.metric.id}
            selectedZone={data.selectedZone.id}
            onSelectSensor={actions.selectMetric}
            onSelectZone={actions.selectZone}
          />
        ),
      }}
    />
  );
}
