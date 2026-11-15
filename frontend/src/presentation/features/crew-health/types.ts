import type { HealthSystemId, VisionActivityId } from '@/domain/health/models';
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
  checkPrompt: string;
  sensors: SensorKey[];
  source: { title: string; url: string };
}
export interface HealthFormValues {
  state: 'no-change' | 'change' | 'not-assessed';
  note: string;
  activity: string;
  minutes: string;
  zoneId?: string;
  visionActivityId?: VisionActivityId;
}
export interface CrewHealthContext {
  mission: MissionData;
  habitatId: string;
}
interface CrewHealthHistoryEntry {
  fromDailyCheck?: boolean;
  id: string;
  date: string;
  dayLabel: string;
  state: string;
  note: string;
  activity: string;
  duration: string;
  minutes: number | null;
  visionActivity?: string;
}
export interface ExerciseEquipment {
  kind: 'bike' | 'resistance';
  label: string;
}

export interface ExerciseSessionPreview {
  entry: CrewHealthHistoryEntry;
  equipment?: ExerciseEquipment;
}

export interface CrewHealthRecordPreview {
  message: string;
  entry?: CrewHealthHistoryEntry;
  sessions?: ExerciseSessionPreview[];
}
export interface CrewHealthTimelineRecord {
  id: string;
  at: string;
  date: string;
  title: string;
  state: string;
  activity: string;
  duration?: string;
  note: string;
  zoneId?: string;
  visionActivity?: string;
}

export interface CrewHealthMessage {
  text: string;
  error: boolean;
  operation: 'entry' | 'review';
  entryId?: string;
}

export interface CrewHealthData {
  recordZones: { id: string; name: string }[];
  timelineRecords: CrewHealthTimelineRecord[];
  system: HealthSystemContent;
  systems: HealthSystemContent[];
  name: string;
  personContext: string;
  sensorDate: string;
  scope: string;
  metrics: (MetricData & { meaning: string })[];
  nextStep: { title: string; detail: string; target: 'entry' | 'readings' | 'review' };
  lastEntryDate: string;
  stateLabel: string;
  reviewed: boolean;
  reviewDate: string;
  today: string;
  history: CrewHealthHistoryEntry[];
  analysis: { summary: string; evidence: string[]; missing: string[]; next: string };
  context: { label: string; value: string }[];
  pendingObservations: string[];
}
