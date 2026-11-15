'use client';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { createMissionDependencies } from '@/di/createMissionDependencies.client';
import { useMission } from './useMission';
import { AssistantMissionContext } from '../mission-assistant/MissionAssistantProvider';
import type { HabitatId } from '@/domain/explorer/models';
const MissionContext = createContext<ReturnType<typeof useMission> | null>(null);
export function MissionWorkspaceProvider({
  children,
  habitatId = 'odyssey',
}: {
  children: ReactNode;
  habitatId?: HabitatId;
}) {
  const dependencies = useMemo(() => createMissionDependencies(habitatId), [habitatId]);
  const workspace = useMission(dependencies);
  const setAssistantData = useContext(AssistantMissionContext);
  useEffect(() => {
    setAssistantData?.(workspace.data);
    return () => setAssistantData?.(null);
  }, [setAssistantData, workspace.data]);
  return <MissionContext value={workspace}>{children}</MissionContext>;
}
export function useMissionWorkspace() {
  const value = useContext(MissionContext);
  if (!value) throw new Error('MissionWorkspaceProvider is required.');
  return value;
}
