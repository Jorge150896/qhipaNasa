import { LocalCrewHealthRepository } from '@/data/health/LocalCrewHealthRepository';
import {
  LoadCrewHealth,
  RecordCrewHealth,
  ReviewCrewHealth,
} from '@/domain/usecases/ManageCrewHealth';
import { BrowserStorage } from '@/infrastructure/storage/BrowserStorage';
import { systemClock } from '@/infrastructure/SystemClock';
export function createCrewHealthDependencies(habitatId: string) {
  const repository = new LocalCrewHealthRepository(new BrowserStorage(), habitatId);
  return {
    load: new LoadCrewHealth(repository),
    record: new RecordCrewHealth(repository, systemClock, { next: () => crypto.randomUUID() }),
    review: new ReviewCrewHealth(repository, systemClock),
    clock: systemClock,
  };
}
