import type { ReactNode } from 'react';
import { MissionAssistantScreen } from '@/presentation/features/mission-assistant/MissionAssistantScreen';

export default function ExplorerLayout({ children }: { children: ReactNode }) {
  return (
    <MissionAssistantScreen data={null} explorer>
      {children}
    </MissionAssistantScreen>
  );
}
