import type { ExplorerRepository } from '@/domain/explorer/models';
import type { CrewJournal } from '@/domain/mission/models';
import type { KeyValueStorage } from '@/infrastructure/storage/KeyValueStorage';
import { LocalCrewJournalRepository } from '@/data/mission/LocalCrewJournalRepository';
import { SimulatedHabitatMissionRepository } from './SimulatedHabitatMissionRepository';
import { journalKey, simulatedHabitats } from './simulatedHabitats';
export class LocalSpaceExplorerRepository implements ExplorerRepository {
  constructor(private readonly storage: KeyValueStorage) {}
  async load(signal?: AbortSignal) {
    return Promise.all(
      simulatedHabitats.map(async (habitat) => {
        const snapshot = await new SimulatedHabitatMissionRepository(habitat.id).load(
          habitat.initialScenario,
          signal,
        );
        let journal: CrewJournal | null;
        try {
          journal = await new LocalCrewJournalRepository(
            this.storage,
            journalKey(habitat.id),
          ).load();
        } catch {
          journal = null;
        } // Preserve unreadable data and report unknown counts, never zero.
        return { habitat, snapshot, journal };
      }),
    );
  }
}
