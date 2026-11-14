'use client';
import { useMemo, type ReactNode } from 'react';
import { createCrewHealthDependencies } from '@/di/createCrewHealthDependencies.client';
import type { MissionData, MissionSection, SensorKey } from '../mission/types';
import type { BodySystemKey, CrewHealthRecordPreview, CrewHealthTimelineRecord } from './types';
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
  onOpenTimelineRecord,
  children,
}: {
  mission: MissionData;
  habitatId: string;
  systemId: BodySystemKey;
  onSelectSystem(id: BodySystemKey): void;
  onNavigate(section: MissionSection): void;
  onSelectMetric(id: SensorKey): void;
  onOpenTimelineRecord(id: string): void;
  children(content: {
    healthPanel: ReactNode;
    recordPreview: CrewHealthRecordPreview;
    timelineRecords: CrewHealthTimelineRecord[];
    timelineStatus: 'loading' | 'error' | 'ready';
  }): ReactNode;
}) {
  const dependencies = useMemo(() => createCrewHealthDependencies(habitatId), [habitatId]);
  const context = useMemo(() => ({ mission, habitatId }), [mission, habitatId]);
  const { recordPreview, ...model } = useCrewHealthViewModel(dependencies, context, systemId);
  const healthPanel = (
    <CrewHealthView
      {...model}
      onSelectSystem={onSelectSystem}
      onSave={model.save}
      onReview={model.review}
      onRetry={model.retry}
      onOpenHistory={() => onNavigate('history')}
      onOpenJournal={() => onNavigate('journal')}
      onOpenObservations={() => onNavigate('observations')}
      onOpenHabitat={() => onNavigate('habitat')}
      onSelectMetric={onSelectMetric}
      onOpenTimelineRecord={onOpenTimelineRecord}
    />
  );
  return children({
    healthPanel,
    recordPreview,
    timelineRecords: model.data.timelineRecords,
    timelineStatus: model.loading ? 'loading' : model.error ? 'error' : 'ready',
  });
}
