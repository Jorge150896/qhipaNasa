export type Mode = 'demo' | 'api';
export type ActivityKey = 'cabin' | 'exercise' | 'surface' | 'eva';
export const activityOptions: { id: ActivityKey; label: string; detail: string }[] = [
  { id: 'cabin', label: 'Rutina en cabina', detail: 'Reposo y condiciones de captura estables.' },
  { id: 'exercise', label: 'Ejercicio', detail: 'Compara antes, durante y después del esfuerzo.' },
  {
    id: 'surface',
    label: 'Recorrido de superficie',
    detail: 'Registra el lugar y la fase del recorrido.',
  },
  {
    id: 'eva',
    label: 'Caminata espacial',
    detail: 'Identifica el equipo y la fase de actividad extravehicular.',
  },
];
export const metricNames = {
  heartRate: 'Frecuencia cardíaca',
  temperature: 'Temperatura corporal',
  oxygen: 'Saturación periférica',
  respiration: 'Frecuencia respiratoria',
};
export interface MonitoringData {
  step: 'prepare' | 'capture' | 'review' | 'saved';
  mode: Mode;
  apiConfigured: boolean;
  subjectId: string;
  subjectLabel: string;
  activity: ActivityKey;
  phase: 'before' | 'during' | 'after';
  location: string;
  equipment: string;
  checks: boolean[];
  ready: boolean;
  busy: boolean;
  running: boolean;
  error: string;
  journalError: string;
  journalLoading: boolean;
  note: string;
  captureCount: number;
  metrics: {
    id: string;
    label: string;
    value: string;
    unit: string;
    status: string;
    source: string;
    at: string;
    age: string;
    delta: string;
    points: string;
  }[];
  attempts: {
    id: string;
    at: string;
    samples: { id: string; label: string; value: string; detail: string }[];
  }[];
  sessions: {
    id: string;
    subject: string;
    context: string;
    source: string;
    at: string;
    activity: string;
    count: number;
    note: string;
    readings: string[];
  }[];
}
export interface MonitoringActions {
  setMode(mode: Mode): void;
  setSubjectId(id: string): void;
  setActivity(id: ActivityKey): void;
  setPhase(phase: 'before' | 'during' | 'after'): void;
  setLocation(value: string): void;
  setEquipment(value: string): void;
  setCheck(index: number, value: boolean): void;
  begin(): void;
  capture(): void;
  toggleRunning(): void;
  review(): void;
  resume(): void;
  setNote(value: string): void;
  save(): void;
  reset(): void;
  retryJournal(): void;
}
