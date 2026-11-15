import {
  MissionDashboardView,
  type MissionDashboardProps,
} from '../../../shared/mission/MissionDashboardView';
import type { SensorKey } from '../../mission/types';
import type { AstronautOverviewData, MissionPersonalSummary as Summary } from '../types';
import { MissionPersonalSummary } from './MissionPersonalSummary';
import { AstronautOverviewView } from './AstronautOverviewView';
export function MissionOverviewView({
  dashboard,
  summary,
  overviewData,
  onOpenSources,
  onStartMonitoring,
  onOpenModule,
  onOpenRecord,
  onReviewSignal,
}: {
  dashboard: MissionDashboardProps;
  summary: Summary;
  overviewData: AstronautOverviewData;
  onOpenSources(): void;
  onStartMonitoring(): void;
  onOpenModule(): void;
  onOpenRecord(): void;
  onReviewSignal(id: SensorKey): void;
}) {
  return (
    <>
      <AstronautOverviewView
        data={overviewData}
        metric={dashboard.data.metric}
        scene={dashboard.scene}
        mode={dashboard.mode}
        habitatLabel={dashboard.habitatLabel}
        onModeChange={dashboard.onModeChange}
        onSelectMetric={dashboard.actions.selectMetric}
        onStartMonitoring={onStartMonitoring}
        onSources={onOpenSources}
      />
      <details className="lab-details">
        <summary>
          Registros, tendencias y seguimiento <span>Ampliar panel</span>
        </summary>
        <MissionPersonalSummary
          data={summary}
          onOpenModule={onOpenModule}
          onOpenRecord={onOpenRecord}
          onReviewSignal={onReviewSignal}
        />
        <MissionDashboardView {...dashboard} layout="overview" overviewPanel={<></>} />
      </details>
    </>
  );
}
