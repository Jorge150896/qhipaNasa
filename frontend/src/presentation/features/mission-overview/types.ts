import type { MissionDashboardScreenProps } from '../../shared/mission/types';
import type { MissionSection, SensorKey } from '../mission/types';
import type { CrewEntryAnchor } from '../../shared/missionRoutes';

export interface MissionOverviewScreenProps extends MissionDashboardScreenProps {
  onNavigate(section: MissionSection, anchor?: CrewEntryAnchor): void;
  onStartSignalDemo(): void;
}

type MissionPendingAction =
  { kind: 'observation'; id: string } | { kind: 'signal'; id: SensorKey } | { kind: 'check' };

export interface MissionPersonalSummary {
  activity: string;
  todayCheck: boolean;
  pending: {
    key: string;
    title: string;
    detail: string;
    actionLabel: string;
    action: MissionPendingAction;
  }[];
  location: string;
  record: { title: string; detail?: string; available: boolean };
}

export type SignalCheckState =
  | { kind: 'idle' | 'running' | 'missing' | 'error' }
  | { kind: 'available'; value: string; time: string };
