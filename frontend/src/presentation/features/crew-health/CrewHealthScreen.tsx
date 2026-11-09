'use client';
import { useMemo } from 'react';
import { createCrewHealthDependencies } from '@/di/createCrewHealthDependencies.client';
import type { MissionData, MissionSection, SensorKey } from '../mission/types';
import type { BodySystemKey } from './types';
import { useCrewHealthViewModel } from './useCrewHealthViewModel';
import { CrewHealthView } from './components/CrewHealthView';
import './crew-health.css';
export function CrewHealthScreen({
  mission,
  habitatId,
  systemId,
  onSelectSystem,
  onNavigate,
  onSelectMetric,
}: {
  mission: MissionData;
  habitatId: string;
  systemId: BodySystemKey;
  onSelectSystem(id: BodySystemKey): void;
  onNavigate(section: MissionSection): void;
  onSelectMetric(id: SensorKey): void;
}) {
  const dependencies = useMemo(() => createCrewHealthDependencies(habitatId), [habitatId]);
  const context = useMemo(() => ({ mission, habitatId }), [mission, habitatId]);
  const model = useCrewHealthViewModel(dependencies, context, systemId);
  return (
    <CrewHealthView
      {...model}
      onSelectSystem={onSelectSystem}
      onSave={model.save}
      onReview={model.review}
      onRetry={model.retry}
      onOpenHistory={() => onNavigate('history')}
      onOpenJournal={() => onNavigate('journal')}
      onOpenObservations={() => onNavigate('observations')}
      onSelectMetric={onSelectMetric}
    />
  );
}
