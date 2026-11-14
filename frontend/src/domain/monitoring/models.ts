import type { HealthMeasurement } from '../measurements/HealthMeasurement';

export type MonitoringMode = 'demo' | 'api';
export type Activity = 'cabin' | 'exercise' | 'surface' | 'eva';
export interface CaptureContext {
  activity: Activity;
  phase: 'before' | 'during' | 'after';
  location: string;
  equipment: string;
}
export interface CaptureRequest {
  requestId: string;
  subjectId: string;
  signal: AbortSignal;
}
export interface CaptureAttempt {
  id: string;
  receivedAt: string;
  measurements: readonly HealthMeasurement[];
}
export interface MonitoringSession {
  id: string;
  subjectId: string;
  subjectLabel: string;
  mode: MonitoringMode;
  context: CaptureContext;
  attempts: readonly CaptureAttempt[];
  note: string;
  savedAt: string;
}
export interface MeasurementGateway {
  capture(request: CaptureRequest): Promise<CaptureAttempt>;
}
export interface MonitoringJournal {
  load(): Promise<readonly MonitoringSession[]>;
  save(session: MonitoringSession): Promise<readonly MonitoringSession[]>;
}
