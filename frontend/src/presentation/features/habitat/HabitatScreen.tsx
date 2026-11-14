'use client';
import { useMissionDashboardViewModel } from '../../shared/mission/useMissionDashboardViewModel';
import type { HabitatScreenProps } from './types';
import { HabitatView } from './components/HabitatView';
import { MissionSceneSlot } from '../../shared/mission/MissionSceneSlot';
export function HabitatScreen({ data, actions, habitatId, onNavigate }: HabitatScreenProps) {
  const model = useMissionDashboardViewModel(habitatId, 'ship');
  return (
    <HabitatView
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
