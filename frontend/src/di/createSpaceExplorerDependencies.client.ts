import { LoadSpaceExplorer } from '@/domain/usecases/LoadSpaceExplorer';
import { LocalSpaceExplorerRepository } from '@/data/explorer/LocalSpaceExplorerRepository';
import { BrowserStorage } from '@/infrastructure/storage/BrowserStorage';
import { systemClock } from '@/infrastructure/SystemClock';
export function createSpaceExplorerDependencies() {
  return {
    loadExplorer: new LoadSpaceExplorer(
      new LocalSpaceExplorerRepository(new BrowserStorage()),
      systemClock,
    ),
  };
}
