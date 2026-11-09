'use client';
import { useMissionDashboardViewModel } from '../../shared/mission/useMissionDashboardViewModel';
import type { MissionOverviewScreenProps } from './types';
import { MissionOverviewView } from './components/MissionOverviewView';
import { MissionSceneSlot } from '../../shared/mission/MissionSceneSlot';
export function MissionOverviewScreen({
  data,
  actions,
  habitatId,
  onNavigate,
}: MissionOverviewScreenProps) {
  const model = useMissionDashboardViewModel(habitatId, 'crew');
  return (
    <MissionOverviewView
      dashboard={{
        data,
        actions,
        habitatLabel: model.habitatLabel,
        mode: model.mode,
        onModeChange: model.onModeChange,
        bodyAnchor: false,
        onOpenHistory: () => onNavigate('history'),
        onOpenDailyCheck: () => onNavigate('journal'),
        scene: (
          <MissionSceneSlot
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
