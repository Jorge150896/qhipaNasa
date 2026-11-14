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
  onStartMonitoring,
  onOpenModule,
  onOpenRecord,
  onReviewSignal,
}: {
  dashboard: MissionDashboardProps;
  summary: Summary;
  onStartMonitoring(): void;
  onOpenModule(): void;
  onOpenRecord(): void;
  onReviewSignal(id: SensorKey): void;
}) {
  return (
    <>
      <section className="panel" aria-label="Iniciar monitoreo">
        <div className="panel-heading">
          <div>
            <h3>De la señal a una sesión de medición</h3>
            <p className="sub">
              Prepara el equipo, recibe lecturas y revisa su calidad antes de guardar.
            </p>
          </div>
          <button className="button primary" onClick={onStartMonitoring}>
            Iniciar monitoreo
          </button>
        </div>
      </section>
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
