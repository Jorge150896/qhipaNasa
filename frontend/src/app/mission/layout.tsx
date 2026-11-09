import type { ReactNode } from 'react';
import { MissionWorkspaceProvider } from '@/presentation/features/mission/MissionWorkspaceProvider';
export default function MissionLayout({ children }: { children: ReactNode }) {
  return <MissionWorkspaceProvider>{children}</MissionWorkspaceProvider>;
}
