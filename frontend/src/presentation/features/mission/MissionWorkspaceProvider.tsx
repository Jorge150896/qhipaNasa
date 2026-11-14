'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createMissionDependencies } from '@/di/createMissionDependencies.client';
import { useMission } from './useMission';
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
  return <MissionContext value={workspace}>{children}</MissionContext>;
}
export function useMissionWorkspace() {
  const value = useContext(MissionContext);
  if (!value) throw new Error('MissionWorkspaceProvider is required.');
  return value;
}
