import type { MetricData, ScenarioKey } from '../mission/types';
export interface SimulationScreenProps {
  selected: ScenarioKey;
  signal?: { personId: string; metric: MetricData };
  onOpenSignalEvidence(personId: string): void;
  onOpenResult(): void;
  onSelect(id: ScenarioKey): void;
}
export type SignalCheckState =
  | { kind: 'idle' | 'running' | 'missing' | 'error' }
  | { kind: 'available'; value: string; time: string };
