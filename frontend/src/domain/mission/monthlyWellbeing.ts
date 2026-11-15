import type { DataQuality, MetricId, Mood } from './models';

export interface WellbeingWeek {
  averageSleepHours: number;
  averageFatigue: number;
  averagePerceivedIsolation: number;
  averagePerceivedConfinement: number;
  exerciseDaysReported: number;
  averageRestingHeartRateLpm: number;
  moodDays: Partial<Record<Mood, number>>;
}

export interface WellbeingDay {
  day: number;
  dateUtc: string;
  missionDay: number;
  checkIn: {
    atUtc: string;
    sleepHours: number;
    mood: Mood;
    fatigue: number;
    exerciseDonePreviousDay: boolean;
    restInterruptions: number;
    workloadPreviousDay: string;
    note: string | null;
    proposedAnswers: {
      perceivedIsolation: number | null;
      perceivedConfinement: number | null;
      routineInterference: number | null;
      requestSupport: boolean | null;
    };
  };
  readings: readonly {
    id: MetricId;
    value: number | null;
    unit: string;
    at: string | null;
    quality: DataQuality;
  }[];
  cabin: {
    fromUtc: string;
    toUtc: string;
    airTemperatureC: number;
    co2Ppm: number;
    relativeHumidityPct: number;
    noiseDb: number;
    event: string;
  };
}

export interface MonthlyWellbeing {
  crewName: string;
  source: 'synthetic';
  trajectory: string;
  days: readonly WellbeingDay[];
  firstWeek: WellbeingWeek;
  lastWeek: WellbeingWeek;
}
