'use client';

import { createContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { MissionData } from '../mission/types';
import { MissionAssistantScreen } from './MissionAssistantScreen';

export const AssistantMissionContext = createContext<Dispatch<
  SetStateAction<MissionData | null>
> | null>(null);

export function MissionAssistantProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MissionData | null>(null);
  return (
    <AssistantMissionContext value={setData}>
      <MissionAssistantScreen data={data}>{children}</MissionAssistantScreen>
    </AssistantMissionContext>
  );
}
