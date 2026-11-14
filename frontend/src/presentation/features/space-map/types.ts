import type { ReactNode } from 'react';
export type DestinationKey = 'earth' | 'moon' | 'mars' | 'station' | 'ship';
export interface HabitatData {
  id: string;
  name: string;
  location: string;
  description: string;
  timestamp: string;
  scenario: string;
  crewCount: string;
  pendingChecks: string;
  pendingObservations: string;
  unavailableSensors: string;
  journalAvailable: boolean;
  crew: {
    id: string;
    name: string;
    initials: string;
    role: string;
    activity: string;
    zone: string;
    check: string;
  }[];
}
export interface DestinationData {
  id: DestinationKey;
  name: string;
  category: string;
  subtitle: string;
  crewCount: string;
  habitats: HabitatData[];
}
export interface ExplorerData {
  destinations: DestinationData[];
  totalCrew: string;
  totalHabitats: string;
  pendingChecks: string;
  today: string;
}
export interface ExplorerViewProps {
  data: ExplorerData;
  selected: DestinationData;
  scene: ReactNode;
  onSelect(id: DestinationKey): void;
  onOpenCrew(habitatId: string): void;
  onRefresh(): void;
  onOpenLaunchSites(): void;
  onOpenEarthOverview(): void;
}
