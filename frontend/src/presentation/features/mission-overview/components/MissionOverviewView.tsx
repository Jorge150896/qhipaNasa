import {
  MissionDashboardView,
  type MissionDashboardProps,
} from '../../../shared/mission/MissionDashboardView';
import type { SensorKey } from '../../mission/types';
import type { MissionPersonalSummary as Summary } from '../types';
import { MissionPersonalSummary } from './MissionPersonalSummary';
export function MissionOverviewView({
  dashboard,
  summary,
  onOpenModule,
  onOpenRecord,
  onReviewSignal,
}: {
  dashboard: MissionDashboardProps;
  summary: Summary;
  onOpenModule(): void;
  onOpenRecord(): void;
  onReviewSignal(id: SensorKey): void;
}) {
  return (
    <>
      <MissionPersonalSummary
        data={summary}
        onOpenModule={onOpenModule}
        onOpenRecord={onOpenRecord}
        onReviewSignal={onReviewSignal}
      />
      <MissionDashboardView {...dashboard} layout="overview" />
    </>
  );
}
