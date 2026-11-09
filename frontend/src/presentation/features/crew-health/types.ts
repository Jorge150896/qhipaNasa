import type { HealthSystemId } from '@/domain/health/models';
import type { MetricData, MissionData, SensorKey } from '../mission/types';
export type BodySystemKey = HealthSystemId;
export interface HealthSystemContent {
  id: BodySystemKey;
  label: string;
  shortLabel: string;
  icon: 'heart' | 'activity' | 'orbit' | 'wind' | 'clipboard' | 'shield' | 'rocket';
  overview: string;
  explanation: string;
  limitation: string;
  missing: string;
  task: string;
  sensors: SensorKey[];
  source: { title: string; url: string };
}
export interface HealthFormValues {
  state: 'no-change' | 'change' | 'not-assessed';
  note: string;
  activity: string;
  minutes: string;
}
export interface CrewHealthContext {
  mission: MissionData;
  habitatId: string;
}
export interface CrewHealthData {
  system: HealthSystemContent;
  systems: HealthSystemContent[];
  name: string;
  scope: string;
  metrics: MetricData[];
  stateLabel: string;
  entryCount: string;
  reviewed: boolean;
  reviewDate: string;
  today: string;
  history: {
    id: string;
    date: string;
    state: string;
    note: string;
    activity: string;
    duration: string;
  }[];
  analysis: { summary: string; evidence: string[]; missing: string[]; next: string };
  context: { label: string; value: string }[];
  pendingObservations: string[];
}
