import type { MissionDashboardScreenProps } from '../../shared/mission/types';
import type { MissionDashboardProps } from '../../shared/mission/MissionDashboardView';
import type { IconName } from '@/ui/Icon';
import type { BodySystemKey } from '../crew-health/types';
import type { MetricData, SensorKey, ZoneData } from '../mission/types';

export type CrewScreenProps = MissionDashboardScreenProps;
export interface CrewViewProps {
  onSelectBodyRegion(id: BodySystemKey): void;
  onOpenHistory(): void;
  onSelectTimelineSample(at: string): void;
  onSelectTelemetrySensor(id: SensorKey): void;
  telemetryMetric?: MetricData;
  trendInCard: boolean;
  sampleAt?: string;
  synchronizedMoment?: CrewTimelineDetail;
  onToggleSynchronization(): void;
  dashboard: Pick<
    MissionDashboardProps,
    'data' | 'habitatLabel' | 'scene' | 'mode' | 'onModeChange'
  >;
}

export interface CrewHologramData {
  title: string;
  sensorId?: SensorKey;
  entryAction: string;
  recordKind?: 'vision' | 'fitness';
  icon: IconName;
  explanation: string;
  detail: string;
  reading?: { value: string; unit: string; timestamp?: string; status?: string };
  trend?: MetricData;
  activity: string;
  context: string;
  contextTime: string;
  signalAction?: string;
}

export interface CrewModuleData {
  crewName: string;
  crewLocation: string;
  activity: string;
  occupiedId: string;
  synchronizedMoment?: CrewTimelineDetail;
  crewInSelectedModule: boolean;
  timestamp: string;
  zones: { id: string; name: string; shortName: string; code?: string }[];
  selected: ZoneData;
  origin?: CrewModuleOrigin;
}

export interface CrewModuleOrigin {
  kind: 'record' | 'snapshot' | 'sample';
  title: string;
  date: string;
  zone: { id: string; name: string };
}

export type CrewTimelineSelection =
  | { kind: 'snapshot' }
  | { kind: 'sample'; at: string; metricId: SensorKey }
  | { kind: 'record'; id: string };

export interface CrewTimelineData {
  status: 'loading' | 'error' | 'ready';
  moments: { id: string; at: string; date: string; title: string; source: string }[];
  activeMoment?: string;
  detail: CrewTimelineDetail;
}

export interface CrewTimelineDetail {
  kind: CrewModuleOrigin['kind'];
  date: string;
  at: string;
  title: string;
  source: string;
  value?: string;
  activity?: string;
  duration?: string;
  note?: string;
  zone?: { id: string; name: string };
  readings?: ZoneData['readings'];
  contextMessage?: string;
}

export type ComparisonSlot = 'first' | 'second';

export interface CrewTimelineComparison {
  label: string;
  options: { at: string; label: string }[];
  first?: CrewTimelineDetail;
  second?: CrewTimelineDetail;
  difference?: string;
}
