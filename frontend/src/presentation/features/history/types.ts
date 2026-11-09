import type { CrewData, MetricData, SensorKey } from '../mission/types';
export interface HistoryScreenProps {
  crew: CrewData;
  metric: MetricData;
  onSelect(id: SensorKey): void;
}
