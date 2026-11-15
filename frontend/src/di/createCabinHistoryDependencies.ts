import { issCabinArchive } from '@/data/environment/issCabinArchive';

export function createCabinHistoryDependencies() {
  return { archive: issCabinArchive };
}
