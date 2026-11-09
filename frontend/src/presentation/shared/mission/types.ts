import type { MissionActions, MissionData, MissionSection } from '../../features/mission/types';
export interface MissionDashboardScreenProps {
  data: MissionData;
  habitatId: string;
  actions: Pick<MissionActions, 'selectMetric' | 'selectZone'>;
  onNavigate(section: MissionSection): void;
}
