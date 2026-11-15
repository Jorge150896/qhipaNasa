import { useEffect } from 'react';
import type { ObservationData } from '../../mission/types';
import { Icon } from '@/ui/Icon';
import { EmptyState, Panel } from '@/ui/Panel';
export function ObservationList({
  observations,
  saving,
  onReview,
  onOpenRelated,
}: {
  observations: ObservationData[];
  saving: boolean;
  onOpenRelated(item: ObservationData): void;
  onReview(id: string, reviewed: boolean): Promise<void>;
}) {
  useEffect(() => {
    const focusObservation = () => {
      const id = window.location.hash.slice(1);
      if (!id.startsWith('observation-')) return;
      document.getElementById(id)?.focus();
    };
    const frame = requestAnimationFrame(focusObservation);
    window.addEventListener('hashchange', focusObservation);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', focusObservation);
    };
  }, []);

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
        <section
          key={item.id}
          id={`observation-${item.id}`}
          tabIndex={-1}
          className="panel observation-detail"
        >
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
            <button type="button" className="text-button" onClick={() => onOpenRelated(item)}>
              {item.category === 'Calidad de datos' ? 'Revisar SpO₂' : 'Abrir chequeo diario'}{' '}
              <Icon name="arrow" size={14} />
            </button>
            <button
              className="button secondary"
              disabled={saving}
              onClick={() => void onReview(item.id, !item.reviewed)}
            >
              <Icon name={item.reviewed ? 'refresh' : 'check'} />
              {item.reviewed ? 'Volver a pendiente' : 'Marcar como revisada'}
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}
