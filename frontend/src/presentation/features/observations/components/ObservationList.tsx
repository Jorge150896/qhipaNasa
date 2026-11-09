import type { ObservationData } from '../../mission/types';
import { Icon } from '@/ui/Icon';
import { EmptyState, Panel } from '@/ui/Panel';
export function ObservationList({
  observations,
  saving,
  onReview,
}: {
  observations: ObservationData[];
  saving: boolean;
  onReview(id: string, reviewed: boolean): Promise<void>;
}) {
  if (!observations.length)
    return (
      <Panel>
        <EmptyState
          title="Sin observaciones programadas"
          description="El escenario base no incluye incidencias. Puedes probar un cambio de descanso o una pérdida de señal desde Simulación."
        />
      </Panel>
    );
  return (
    <div className="observation-list">
      {observations.map((item) => (
        <Panel key={item.id} className="observation-detail">
          <div className="panel-heading">
            <span className={`icon-chip ${item.reviewed ? '' : 'amber'}`}>
              <Icon name={item.reviewed ? 'checked' : 'alert'} />
            </span>
            <div>
              <span className="eyebrow">
                {item.category} · {item.crew}
              </span>
              <h3>{item.title}</h3>
            </div>
            <span className={`badge ${item.reviewed ? '' : 'amber'}`}>
              {item.reviewed ? 'Revisada' : 'Pendiente'}
            </span>
          </div>
          <p>{item.detail}</p>
          <div className="evidence-grid">
            <div>
              <h4>Evidencia del escenario</h4>
              <ul>
                {item.evidence.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Qué revisar a continuación</h4>
              <ul>
                {item.nextSteps.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="panel-footer">
            <span className="sub">Seguimiento local · No equivale a resolución médica</span>
            <button
              className="button secondary"
              disabled={saving}
              onClick={() => void onReview(item.id, !item.reviewed)}
            >
              <Icon name={item.reviewed ? 'refresh' : 'check'} />
              {item.reviewed ? 'Volver a pendiente' : 'Marcar como revisada'}
            </button>
          </div>
        </Panel>
      ))}
    </div>
  );
}
