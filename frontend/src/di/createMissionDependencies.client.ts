import { LocalCrewJournalRepository } from '@/data/mission/LocalCrewJournalRepository';
import { SimulatedHabitatMissionRepository } from '@/data/explorer/SimulatedHabitatMissionRepository';
import { getSimulatedHabitat, journalKey } from '@/data/explorer/simulatedHabitats';
import type { HabitatId } from '@/domain/explorer/models';
import { LoadMission } from '@/domain/usecases/LoadMission';
import {
  LoadCrewJournal,
  RecordDailyCheck,
  ReviewObservation,
} from '@/domain/usecases/ManageCrewJournal';
import { BrowserStorage } from '@/infrastructure/storage/BrowserStorage';
import { systemClock } from '@/infrastructure/SystemClock';
export function createMissionDependencies(habitatId: HabitatId = 'odyssey') {
  const journal = new LocalCrewJournalRepository(new BrowserStorage(), journalKey(habitatId));
  return {
    initialScenario: getSimulatedHabitat(habitatId).initialScenario,
    loadMission: new LoadMission(new SimulatedHabitatMissionRepository(habitatId)),
    loadJournal: new LoadCrewJournal(journal),
    recordCheck: new RecordDailyCheck(journal, systemClock),
    reviewObservation: new ReviewObservation(journal),
  };
}
