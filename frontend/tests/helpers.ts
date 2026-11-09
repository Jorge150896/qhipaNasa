import type { KeyValueStorage } from '@/infrastructure/storage/KeyValueStorage';
import { LocalCrewJournalRepository } from '@/data/mission/LocalCrewJournalRepository';
import { SimulatedMissionRepository } from '@/data/mission/SimulatedMissionRepository';
import { LoadMission } from '@/domain/usecases/LoadMission';
import {
  LoadCrewJournal,
  RecordDailyCheck,
  ReviewObservation,
} from '@/domain/usecases/ManageCrewJournal';
export class MemoryStorage implements KeyValueStorage {
  readonly entries = new Map<string, string>();
  read(key: string) {
    return this.entries.get(key) ?? null;
  }
  write(key: string, value: string) {
    this.entries.set(key, value);
  }
}
export const clock = { now: () => new Date('2026-11-08T20:00:00Z') };
export function createTestDependencies() {
  const journal = new LocalCrewJournalRepository(new MemoryStorage());
  return {
    loadMission: new LoadMission(new SimulatedMissionRepository()),
    loadJournal: new LoadCrewJournal(journal),
    recordCheck: new RecordDailyCheck(journal, clock),
    reviewObservation: new ReviewObservation(journal),
  };
}
