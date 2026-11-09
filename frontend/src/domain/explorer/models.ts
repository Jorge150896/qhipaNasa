import type { CrewJournal, MissionSnapshot } from '../mission/models';
export const habitatIds = ['odyssey', 'aurora', 'selene', 'ares'] as const;
export type HabitatId = (typeof habitatIds)[number];
export const destinationIds = ['earth', 'moon', 'mars', 'station', 'ship'] as const;
export type DestinationId = (typeof destinationIds)[number];
export function isHabitatId(value: string): value is HabitatId {
  return habitatIds.some((id) => id === value);
}
export interface HabitatDescriptor {
  id: HabitatId;
  name: string;
  destination: DestinationId;
  location: string;
  description: string;
  initialScenario: MissionSnapshot['scenario'];
}
export interface ExplorerHabitat {
  habitat: HabitatDescriptor;
  snapshot: MissionSnapshot;
  journal: CrewJournal | null;
}
export interface ExplorerRepository {
  load(signal?: AbortSignal): Promise<ExplorerHabitat[]>;
}
