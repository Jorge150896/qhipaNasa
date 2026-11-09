'use client';
import { useCrewViewModel } from './useCrewViewModel';
import { CrewHealthScreen } from '../crew-health/CrewHealthScreen';
import type { CrewScreenProps } from './types';
import { CrewView } from './components/CrewView';
import { MissionSceneSlot } from '../../shared/mission/MissionSceneSlot';
export function CrewScreen({ data, actions, habitatId, onNavigate }: CrewScreenProps) {
  const model = useCrewViewModel(habitatId);
  return (
    <CrewView
      healthPanel={
        <CrewHealthScreen
          mission={data}
          habitatId={habitatId}
          systemId={model.healthSystem}
          onSelectSystem={model.selectHealthSystem}
          onNavigate={onNavigate}
          onSelectMetric={actions.selectMetric}
        />
      }
      dashboard={{
        data,
        actions,
        habitatLabel: model.habitatLabel,
        mode: model.mode,
        onModeChange: model.onModeChange,
        bodyAnchor: true,
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
            selectedSystem={model.healthSystem}
            onSelectSystem={(id) => {
              model.selectHealthSystem(id);
              document.getElementById('crew-health')?.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'auto'
                  : 'smooth',
                block: 'start',
              });
            }}
          />
        ),
      }}
    />
  );
}
