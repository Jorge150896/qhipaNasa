import type { MissionData } from '../../mission/types';
import type { DailyCheckViewModel } from '../types';
import { EmptyState, Panel } from '@/ui/Panel';
import { JournalForm } from './JournalForm';

export function DailyCheckView({
  data,
  saving,
  model,
}: {
  data: MissionData;
  saving: boolean;
  model: DailyCheckViewModel;
}) {
  return (
    <div className="journal-layout daily-check-layout">
      <Panel>
        <JournalForm
          personName={data.selected.name}
          saving={saving}
          updating={data.todayCheck}
          model={model}
        />
      </Panel>
      <div className="daily-check-sidebar">
        {model.telemetry.length > 0 && (
          <Panel label="Consola de mediciones">
            <div className="panel-heading">
              <h3>Consola de mediciones</h3>
            </div>
            <p className="sub">
              Instantánea simulada · {data.date} · {data.time}
            </p>
            <dl className="daily-check-sensors">
              {model.telemetry.map((metric) => (
                <div key={metric.id}>
                  <dt>{metric.shortLabel}</dt>
                  <dd>{metric.value === '—' ? 'Sin lectura' : `${metric.value} ${metric.unit}`}</dd>
                  <small>{metric.quality}</small>
                </div>
              ))}
            </dl>
          </Panel>
        )}
        <Panel>
          <div className="panel-heading">
            <h3>Diario de la tripulación</h3>
            <span className="tiny-badge">{model.checks.length}</span>
          </div>
          {!model.checks.length ? (
            <EmptyState
              title="El diario empieza aquí"
              description="Los chequeos guardados se pueden consultar al volver a abrir la app en este navegador."
            />
          ) : (
            <div className="check-list">
              {model.checks.map((check) => (
                <article key={check.id} id={`check-${encodeURIComponent(check.id)}`}>
                  <div className="row">
                    <strong>{check.crew}</strong>
                    <span className="badge">Local</span>
                  </div>
                  <p className="sub">{check.date}</p>
                  {check.contextLabel && (
                    <p className="daily-check-history-context">{check.contextLabel}</p>
                  )}
                  <dl>
                    <div>
                      <dt>Sueño</dt>
                      <dd>{check.sleep}</dd>
                    </div>
                    <div>
                      <dt>Fatiga</dt>
                      <dd>{check.fatigue}</dd>
                    </div>
                    <div>
                      <dt>Ánimo</dt>
                      <dd>{check.mood}</dd>
                    </div>
                    {check.details.map(({ label, value }) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                  {check.note && <p className="check-note">{check.note}</p>}
                </article>
              ))}
            </div>
          )}
          <p className="table-note">
            Un registro por persona y día UTC. Volver a guardar actualiza el registro de ese día.
          </p>
        </Panel>
      </div>
    </div>
  );
}
