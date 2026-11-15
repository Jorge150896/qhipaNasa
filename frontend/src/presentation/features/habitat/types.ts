import type { MissionDashboardScreenProps } from '../../shared/mission/types';
import type { CrewData, ZoneData } from '../mission/types';
import type { useCabinHistoryViewModel } from './useCabinHistoryViewModel';

export type CabinHistoryData = ReturnType<typeof useCabinHistoryViewModel>['data'];

export type HabitatScreenProps = Omit<MissionDashboardScreenProps, 'onNavigate'> & {
  openCrew(id: string): void;
  selectCrew(id: string): void;
  openCheck(): void;
};
export interface HabitatData {
  name: string;
  timestamp: string;
  zone: ZoneData;
  zones: { id: string; name: string; shortName: string }[];
  occupants: CrewData[];
  occupiedId: string;
  crew: Pick<CrewData, 'id' | 'name'>[];
  simulated: {
    person: CrewData;
    zone: ZoneData | undefined;
    metrics: { label: string; value: string; unit: string; quality: string; change?: string }[];
  };
}
