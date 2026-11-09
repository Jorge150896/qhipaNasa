export const sections = [
  'overview',
  'crew',
  'habitat',
  'history',
  'journal',
  'observations',
  'simulation',
  'sources',
] as const;
export type MissionSection = (typeof sections)[number];
export type SensorKey = 'heartRate' | 'temperature' | 'oxygen' | 'respiration';
export type ScenarioKey = 'baseline' | 'sleep-change' | 'sensor-gap';
export interface MetricData {
  id: SensorKey;
  label: string;
  shortLabel: string;
  value: string;
  unit: string;
  quality: string;
  comparison?: { reference: string; difference: string };
  qualityTone: 'normal' | 'attention';
  lastReading: string;
  history: { time: string; value: string; missing: boolean }[];
  chart: {
    paths: string[];
    points: { x: number; y: number | null }[];
    min: string;
    max: string;
    start: string;
    end: string;
  };
}
export interface CrewData {
  id: string;
  name: string;
  initials: string;
  role: string;
  activity: string;
  location: string;
  zoneId: string;
  sleep: string;
  metrics: MetricData[];
}
export interface ZoneData {
  id: string;
  name: string;
  description: string;
  occupants: string;
  readings: { label: string; value: string; unit: string }[];
}
export interface ObservationData {
  crewId: string;
  id: string;
  title: string;
  detail: string;
  category: string;
  crew: string;
  evidence: readonly string[];
  nextSteps: readonly string[];
  reviewed: boolean;
}
export interface MissionData {
  name: string;
  day: string;
  time: string;
  date: string;
  scenario: ScenarioKey;
  crew: CrewData[];
  selected: CrewData;
  metric: MetricData;
  zones: ZoneData[];
  selectedZone: ZoneData;
  observations: ObservationData[];
  pendingCount: string;
  checks: {
    id: string;
    crew: string;
    date: string;
    sleep: string;
    fatigue: string;
    mood: string;
    note: string;
  }[];
  todayCheck: boolean;
  analysis: { summary: string; recommendation: string; evidence: string[] };
}
export interface CheckFormValues {
  sleep: string;
  fatigue: string;
  mood: 'good' | 'neutral' | 'low';
  note: string;
}
export interface MissionActions {
  selectCrew(id: string): void;
  selectMetric(id: SensorKey): void;
  selectZone(id: string): void;
  selectScenario(id: ScenarioKey): void;
  saveCheck(values: CheckFormValues): Promise<boolean>;
  reviewObservation(id: string, reviewed: boolean): Promise<void>;
  retry(): void;
  dismissMessage(): void;
}
