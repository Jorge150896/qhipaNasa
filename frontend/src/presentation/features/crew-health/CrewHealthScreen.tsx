'use client';
import { useMemo, type ReactNode } from 'react';
import { createCrewHealthDependencies } from '@/di/createCrewHealthDependencies.client';
import type { MissionData } from '../mission/types';
import type { BodySystemKey, CrewHealthRecordPreview, CrewHealthTimelineRecord } from './types';
import { useCrewHealthViewModel } from './useCrewHealthViewModel';
import './crew-health.css';
export function CrewHealthScreen({
  mission,
  habitatId,
  systemId,
  children,
}: {
  mission: MissionData;
  habitatId: string;
  systemId: BodySystemKey;
  children(content: {
    recordPreview: CrewHealthRecordPreview;
    timelineRecords: CrewHealthTimelineRecord[];
    timelineStatus: 'loading' | 'error' | 'ready';
  }): ReactNode;
}) {
  const dependencies = useMemo(() => createCrewHealthDependencies(habitatId), [habitatId]);
  const context = useMemo(() => ({ mission, habitatId }), [mission, habitatId]);
  const { recordPreview, ...model } = useCrewHealthViewModel(dependencies, context, systemId);
  return children({
    recordPreview,
    timelineRecords: model.data.timelineRecords,
    timelineStatus: model.loading ? 'loading' : model.error ? 'error' : 'ready',
  });
}
