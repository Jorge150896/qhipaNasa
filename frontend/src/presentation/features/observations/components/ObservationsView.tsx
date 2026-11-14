import { ObservationList } from './ObservationList';
import type { ObservationsScreenProps } from '../types';
export function ObservationsView({ pendingCount, ...props }: ObservationsScreenProps) {
  return (
    <>
      <div className="section-summary">
        <span className="badge amber">{pendingCount} pendientes de revisión</span>
        <p>Observaciones propias del escenario, sin detección clínica validada.</p>
      </div>
      <ObservationList {...props} />
    </>
  );
}
