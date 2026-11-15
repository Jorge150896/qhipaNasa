import type { MissionDashboardScreenProps } from '../../shared/mission/types';
import type { MissionSection, SensorKey } from '../mission/types';
import type { CrewEntryAnchor } from '../../shared/missionRoutes';

export interface MissionOverviewScreenProps extends MissionDashboardScreenProps {
  onNavigate(section: MissionSection, anchor?: CrewEntryAnchor): void;
}

export interface MissionPersonalSummary {
  activity: string;
  location: string;
  record: { title: string; detail?: string; available: boolean };
  signals: { id: SensorKey; label: string; quality: string }[];
}

export interface AstronautOverviewData {
  name: string;
  role: string;
  activity: string;
  location: string;
  time: string;
  date: string;
  currentSignals: number;
  totalSignals: number;
  selectedMetric: SensorKey;
  metrics: {
    id: SensorKey;
    label: string;
    value: string;
    unit: string;
    quality: string;
    available: number;
    total: number;
    coverage: number;
  }[];
  environment: { name: string; readings: { label: string; value: string; unit: string }[] };
}
