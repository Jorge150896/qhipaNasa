import { ObservationList } from './ObservationList';
import type { ObservationsScreenProps } from '../types';
export function ObservationsView({ pendingCount, ...props }: ObservationsScreenProps) {
  return (
    <>
      <div className="section-summary">
        <span className="badge amber">{pendingCount} pendientes de revisión</span>
        <p>Observaciones del escenario simulado.</p>
      </div>
      <ObservationList {...props} />
    </>
  );
}
