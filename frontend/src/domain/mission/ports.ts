import type { CrewJournal, DailyCheck, MissionSnapshot, ScenarioId } from './models';
export interface MissionRepository {
  load(scenario: ScenarioId, signal?: AbortSignal): Promise<MissionSnapshot>;
}
export interface CrewJournalRepository {
  load(): Promise<CrewJournal>;
  saveCheck(check: DailyCheck): Promise<CrewJournal>;
  setReviewed(observationId: string, reviewed: boolean): Promise<CrewJournal>;
}
