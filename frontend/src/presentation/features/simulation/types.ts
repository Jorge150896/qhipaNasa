import type { WellbeingRoute } from '@/domain/mission/wellbeingRoute';
import type { CrewEntryAnchor } from '@/presentation/shared/missionRoutes';
import type { CrewData, MetricData, MissionSection } from '../mission/types';
export interface SimulationScreenProps {
  crew: CrewData;
  habitatId: string;
  onNavigate(section: MissionSection, anchor?: CrewEntryAnchor): void;
  signal?: { personId: string; metric: MetricData };
  onOpenSignalEvidence(personId: string): void;
  onOpenSignalScenario(): void;
}
export type SignalCheckState =
  | { kind: 'idle' | 'running' | 'missing' | 'error' }
  | { kind: 'available'; value: string; time: string };

export type { WellbeingRoute, HabitResult } from '@/domain/mission/wellbeingRoute';

export const wellbeingRouteLabels: Record<WellbeingRoute, string> = {
  routine: 'Bienestar',
  adjustment: 'Equilibrio',
  support: 'Atención',
};
