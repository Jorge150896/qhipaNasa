export const healthSystemIds = [
  'cardio',
  'fitness',
  'vision',
  'balance',
  'nutrition',
  'immune',
  'eva',
] as const;
export type HealthSystemId = (typeof healthSystemIds)[number];
export const reportedStates = ['no-change', 'change', 'not-assessed'] as const;
export interface HealthEntryInput {
  crewId: string;
  systemId: HealthSystemId;
  reportedState: (typeof reportedStates)[number];
  note: string;
  activity: string;
  minutes: number | null;
}
export interface HealthEntry extends HealthEntryInput {
  id: string;
  recordedAt: string;
}
export interface HealthReview {
  crewId: string;
  systemId: HealthSystemId;
  day: string;
  reviewed: boolean;
  recordedAt: string;
}
export interface HealthJournal {
  entries: HealthEntry[];
  reviews: HealthReview[];
}
export interface CrewHealthRepository {
  load(): Promise<HealthJournal>;
  addEntry(entry: HealthEntry): Promise<HealthJournal>;
  setReview(review: HealthReview): Promise<HealthJournal>;
}
export interface HealthIds {
  next(): string;
}
export class HealthValidationError extends Error {}
