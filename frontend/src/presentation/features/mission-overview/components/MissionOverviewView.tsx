import {
  MissionDashboardView,
  type MissionDashboardProps,
} from '../../../shared/mission/MissionDashboardView';
export function MissionOverviewView({ dashboard }: { dashboard: MissionDashboardProps }) {
  return (
    <>
      <MissionDashboardView {...dashboard} />
    </>
  );
}
