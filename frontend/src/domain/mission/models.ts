import type { HealthMeasurement } from '../measurements/HealthMeasurement';
import type { DailyCheckContext, DiscomfortRegion } from './dailyCheckContext';

export type ScenarioId = 'baseline' | 'sleep-change' | 'sensor-gap';
export type MetricId = 'heartRate' | 'temperature' | 'oxygen' | 'respiration';
export type DataQuality = 'available' | 'stale' | 'missing';
export type Mood = 'good' | 'neutral' | 'low';
export interface Sample {
  measurement?: HealthMeasurement;
  at: string;
  value: number | null;
}
export interface Reading {
  id: MetricId;
  unit: string;
  quality: DataQuality;
  samples: readonly Sample[];
}
export interface CrewMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  zoneId: string;
  activity: string;
  sleepHours: number;
  readings: readonly Reading[];
}
export interface HabitatZone {
  id: string;
  name: string;
  description: string;
  temperature: number;
  co2: number;
  humidity: number;
  noise: number;
}
export interface Observation {
  id: string;
  crewId: string;
  title: string;
  detail: string;
  category: 'context' | 'data-quality';
  evidence: readonly string[];
  nextSteps: readonly string[];
}
export interface MissionSnapshot {
  id: string;
  name: string;
  missionDay: number;
  capturedAt: string;
  scenario: ScenarioId;
  source: 'synthetic';
  crew: readonly CrewMember[];
  zones: readonly HabitatZone[];
  observations: readonly Observation[];
}
export interface DailyCheckInput {
  context?: DailyCheckContext;
  discomfortRegion?: DiscomfortRegion;
  crewId: string;
  sleepHours: number;
  fatigue: number;
  mood: Mood;
  note: string;
}
export interface DailyCheck extends DailyCheckInput {
  id: string;
  recordedAt: string;
}
export interface CrewJournal {
  checks: DailyCheck[];
  reviewedObservationIds: string[];
}
export interface Clock {
  now(): Date;
}
export class CheckValidationError extends Error {}
