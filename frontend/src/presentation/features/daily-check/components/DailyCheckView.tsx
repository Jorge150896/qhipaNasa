import type { MissionData } from '../../mission/types';
import type { DailyCheckViewModel } from '../types';
import { EmptyState, Panel } from '@/ui/Panel';
import { Icon } from '@/ui/Icon';
import { CheckAttachments } from './CheckAttachments';
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
        {model.step < 2 && model.attachment && (
          <Panel className="daily-readings">
            <div className="panel-heading">
              <Icon name="heart" />
              <h3>Lecturas del cuerpo y del entorno</h3>
            </div>
            <p className="sub">Estas lecturas se adjuntan al guardar tu registro.</p>
            <CheckAttachments data={model.attachment} />
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
                  {check.savedAttachment && (
                    <details>
                      <summary>Ver datos adjuntos del chequeo</summary>
                      <CheckAttachments data={check.savedAttachment} />
                    </details>
                  )}
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
