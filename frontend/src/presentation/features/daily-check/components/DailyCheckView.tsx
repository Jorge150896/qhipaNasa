import type { CheckFormValues, MissionData } from '../../mission/types';
import { EmptyState, Panel } from '@/ui/Panel';
import { JournalForm } from './JournalForm';
export function DailyCheckView({
  data,
  saving,
  onSave,
}: {
  data: MissionData;
  saving: boolean;
  onSave(values: CheckFormValues): Promise<boolean>;
}) {
  return (
    <div className="journal-layout">
      <Panel>
        <JournalForm
          key={data.selected.id}
          personName={data.selected.name}
          saving={saving}
          onSave={onSave}
        />
      </Panel>
      <Panel>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">REGISTROS LOCALES</span>
            <h3>Diario de la tripulación</h3>
          </div>
          <span className="tiny-badge">{data.checks.length}</span>
        </div>
        {!data.checks.length ? (
          <EmptyState
            title="El diario empieza aquí"
            description="Guarda un chequeo con datos ficticios. Podrás consultarlo al volver a abrir la app en este navegador."
          />
        ) : (
          <div className="check-list">
            {data.checks.map((check) => (
              <article key={check.id}>
                <div className="row">
                  <strong>{check.crew}</strong>
                  <span className="badge">Local</span>
                </div>
                <p className="sub">{check.date}</p>
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
                </dl>
                {check.note && <p className="check-note">{check.note}</p>}
              </article>
            ))}
          </div>
        )}
        <p className="table-note">
          Un registro por persona y día UTC. Volver a guardar actualiza el registro del día. No se
          envía a ningún servidor.
        </p>
      </Panel>
    </div>
  );
}
