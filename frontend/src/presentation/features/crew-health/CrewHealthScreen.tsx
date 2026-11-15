'use client';
import { useMemo, type ReactNode } from 'react';
import { createCrewHealthDependencies } from '@/di/createCrewHealthDependencies.client';
import type { CrewEntryAnchor } from '../../shared/missionRoutes';
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
  onOpenModule,
  onReportSystem,
  onOpenHistory,
  onOpenTimelineRecord,
  children,
}: {
  mission: MissionData;
  habitatId: string;
  systemId: BodySystemKey;
  onSelectSystem(id: BodySystemKey): void;
  onNavigate(section: MissionSection, anchor?: CrewEntryAnchor): void;
  onSelectMetric(id: SensorKey): void;
  onOpenModule(): void;
  onReportSystem(id: BodySystemKey): void;
  onOpenHistory(): void;
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
      onReportSystem={() => onReportSystem(systemId)}
      onReview={model.review}
      onRetry={model.retry}
      onOpenHistory={onOpenHistory}
      onOpenJournal={() => onNavigate('journal')}
      onOpenHabitat={onOpenModule}
      onSelectMetric={onSelectMetric}
      onOpenRecord={(id, fromDailyCheck) => {
        if (fromDailyCheck) onNavigate('journal', `check-${encodeURIComponent(id)}`);
        else onOpenTimelineRecord(id);
      }}
    />
  );
  return children({
    healthPanel,
    recordPreview,
    timelineRecords: model.data.timelineRecords,
    timelineStatus: model.loading ? 'loading' : model.error ? 'error' : 'ready',
  });
}
