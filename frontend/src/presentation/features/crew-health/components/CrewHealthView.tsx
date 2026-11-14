import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';
import type { SensorKey } from '../../mission/types';
import type { BodySystemKey, CrewHealthData, CrewHealthMessage, HealthFormValues } from '../types';
import { HealthEntryForm } from './HealthEntryForm';
import { HealthSystemIllustration } from './HealthSystemIllustration';
interface Props {
  data: CrewHealthData;
  loading: boolean;
  error: boolean;
  saving: boolean;
  message: CrewHealthMessage | null;
  onSelectSystem(id: BodySystemKey): void;
  onSave(values: HealthFormValues): Promise<boolean>;
  onReview(): Promise<void>;
  onRetry(): void;
  onOpenHistory(): void;
  onOpenJournal(): void;
  onOpenObservations(): void;
  onOpenHabitat(): void;
  onSelectMetric(id: SensorKey): void;
  onOpenTimelineRecord(id: string): void;
}
export function CrewHealthView({
  data,
  loading,
  error,
  saving,
  message,
  onSelectSystem,
  onSave,
  onReview,
  onRetry,
  onOpenHistory,
  onOpenJournal,
  onOpenObservations,
  onOpenHabitat,
  onSelectMetric,
  onOpenTimelineRecord,
}: Props) {
  const disabled = loading || error || saving;
  return (
    <section
      className="health-workspace"
      aria-label="Salud por sistemas"
      id="crew-health"
      tabIndex={-1}
    >
      <div className="health-heading">
        <div>
          <p className="eyebrow">SALUD DE LA TRIPULACIÓN</p>
          <h2>Autoevaluación de {data.name}</h2>
          <p>{data.personContext}</p>
        </div>
        <div className="health-heading-actions">
          <span className="badge">Demostración</span>
          <a className="text-button" href="#crew-body">
            Volver al astronauta
            <Icon name="arrow" size={14} />
          </a>
        </div>
      </div>
      <nav className="health-system-picker" aria-label="Sistemas corporales">
        {data.systems.map((system) => (
          <button
            key={system.id}
            aria-label={system.label}
            aria-pressed={data.system.id === system.id}
            onClick={() => onSelectSystem(system.id)}
          >
            <Icon name={system.icon} />
            <span>{system.shortLabel}</span>
          </button>
        ))}
      </nav>
      {loading && (
        <p role="status" className="health-notice">
          Cargando registros locales de salud…
        </p>
      )}
      {error && (
        <div role="alert" className="health-notice health-error">
          <p>
            No se pudo leer el registro de salud. Los datos anteriores se conservan. Los sensores y
            las explicaciones siguen disponibles.
          </p>
          <button className="button secondary" onClick={onRetry}>
            Reintentar registro de salud
          </button>
        </div>
      )}
      <section className="panel health-next-step" id="crew-health-next" tabIndex={-1}>
        <div>
          <p className="eyebrow">SIGUIENTE PASO · {data.system.shortLabel}</p>
          <h3>{loading ? 'Consultando autorregistros…' : data.nextStep.title}</h3>
          {!loading && <p>{data.nextStep.detail}</p>}
          {!loading && (
            <a className="text-button" href={`#crew-health-${data.nextStep.target}`}>
              {data.nextStep.target === 'entry'
                ? 'Abrir autorregistro'
                : data.nextStep.target === 'readings'
                  ? 'Ver indicadores'
                  : 'Ir al seguimiento'}
              <Icon name="arrow" size={13} />
            </a>
          )}
        </div>
        <div className="health-next-state">
          <span>Último autorregistro</span>
          <strong>{loading ? 'Consultando…' : data.stateLabel}</strong>
          {data.lastEntryDate && <small>{data.lastEntryDate}</small>}
        </div>
      </section>
      <div className="health-layout">
        <div className="health-main-column">
          <section className="panel health-system-detail" id="crew-health-readings" tabIndex={-1}>
            <div className="health-title">
              <span className="icon-chip">
                <Icon name={data.system.icon} />
              </span>
              <div>
                <p className="eyebrow">ÁREA SELECCIONADA</p>
                <h3>{data.system.label}</h3>
              </div>
            </div>
            <p>{data.system.overview}</p>
            <h4>Indicadores disponibles</h4>
            {data.metrics.length > 0 && (
              <p>Telemetría sintética de la misión · {data.sensorDate}</p>
            )}
            {data.metrics.length ? (
              <div className="health-metrics">
                {data.metrics.map((metric) => (
                  <article key={metric.id}>
                    <div>
                      <span>{metric.label}</span>
                      <strong>
                        {metric.value}
                        <small>{metric.unit}</small>
                      </strong>
                    </div>
                    <span className={`badge ${metric.qualityTone === 'attention' ? 'amber' : ''}`}>
                      {metric.quality}
                    </span>
                    <p>{metric.meaning}</p>
                    <p>{metric.lastReading}</p>
                    <dl>
                      <div>
                        <dt>Referencia de esta serie</dt>
                        <dd>{metric.comparison?.reference ?? 'Sin referencia disponible'}</dd>
                      </div>
                      <div>
                        <dt>Cambio descriptivo</dt>
                        <dd>{metric.comparison?.difference ?? 'Sin comparación disponible'}</dd>
                      </div>
                    </dl>
                    <button
                      className="text-button"
                      onClick={() => {
                        onSelectMetric(metric.id);
                        onOpenHistory();
                      }}
                    >
                      Ver serie de {metric.shortLabel.toLowerCase()}
                      <Icon name="arrow" size={13} />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="health-empty">
                <Icon name="clipboard" />
                <p>Esta área no tiene mediciones instrumentales en la demo.</p>
                <small>
                  Un autorregistro aporta contexto y se conserva separado de los sensores.
                </small>
              </div>
            )}
            <div className="health-limits">
              <h4>Información pendiente</h4>
              <p>{data.system.missing}</p>
              <details>
                <summary>Cómo interpretarlo y fuente científica</summary>
                <HealthSystemIllustration key={data.system.id} system={data.system} />
                <p>{data.system.limitation}</p>
                <small>
                  La primera muestra de una serie no es una referencia clínica ni un rango de
                  normalidad.
                </small>
                <p>
                  <a
                    className="text-button"
                    href={data.system.source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {data.system.source.title}
                    <Icon name="arrow" size={13} />
                  </a>
                </p>
              </details>
            </div>
          </section>
          <section
            className="panel"
            id="crew-health-entry"
            tabIndex={-1}
            aria-label="Autorregistro de salud"
          >
            <HealthEntryForm
              key={`${data.scope}:${data.system.id}`}
              system={data.system}
              name={data.name}
              disabled={disabled}
              zones={data.recordZones}
              onSave={onSave}
              savedEntryId={message?.entryId}
              onOpenTimelineRecord={onOpenTimelineRecord}
            />
            {message?.operation === 'entry' && (
              <p
                className={`health-notice ${message.error ? 'health-error' : ''}`}
                role={message.error ? 'alert' : 'status'}
              >
                {message.text}
              </p>
            )}
          </section>
          <section
            className="panel"
            id="crew-health-history"
            tabIndex={-1}
            aria-label="Historial de autorregistros"
          >
            <div className="panel-heading">
              <div>
                <p className="eyebrow">
                  {data.name} · {data.system.shortLabel}
                </p>
                <h3>Historial de autorregistros</h3>
              </div>
              <Icon name="clock" />
            </div>
            {error ? (
              <p>Historial no disponible. No se interpreta como ausencia de registros.</p>
            ) : data.history.length ? (
              <ol
                className={
                  data.system.id === 'vision'
                    ? 'health-history health-vision-timeline'
                    : 'health-history'
                }
              >
                {data.history.map((entry) => (
                  <li key={entry.id}>
                    <div>
                      <strong>{entry.state}</strong>
                      <time>{entry.date}</time>
                    </div>
                    {entry.activity && (
                      <p>
                        {entry.activity} · {entry.duration}
                      </p>
                    )}
                    {entry.visionActivity && <p>{entry.visionActivity}</p>}
                    {entry.note && <p>{entry.note}</p>}
                    <small>Autorregistro de demostración</small>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="health-muted">
                No hay autorregistros para {data.name} en esta área. No implica que se haya evaluado
                su estado.
              </p>
            )}
          </section>
        </div>
        <div className="health-side-column">
          <Panel>
            <div className="panel-heading">
              <h3>Contexto de la persona</h3>
              <Icon name="users" />
            </div>
            <dl className="health-context">
              {data.context.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="health-form-actions">
              <button className="text-button" onClick={onOpenJournal}>
                Abrir chequeo diario
                <Icon name="arrow" size={13} />
              </button>
              <button className="text-button" onClick={onOpenHabitat}>
                Ver entorno de la nave
                <Icon name="arrow" size={13} />
              </button>
            </div>
          </Panel>
          <section className="panel health-followup" id="crew-health-review" tabIndex={-1}>
            <p className="eyebrow">SEGUIMIENTO DOCUMENTAL / DEMO</p>
            <h3>{data.system.task}</h3>
            <p>
              {error
                ? 'Revisión desconocida'
                : data.reviewed
                  ? 'Revisado hoy en UTC'
                  : 'Pendiente de revisión hoy en UTC'}
            </p>
            {data.reviewDate && <small>Última actualización: {data.reviewDate}</small>}
            <button
              className="button secondary full"
              disabled={disabled}
              onClick={() => void onReview()}
            >
              {data.reviewed ? 'Volver a pendiente' : 'Marcar revisión realizada'}
            </button>
            {message?.operation === 'review' && (
              <p
                className={`health-notice ${message.error ? 'health-error' : ''}`}
                role={message.error ? 'alert' : 'status'}
              >
                {message.text}
              </p>
            )}
            <small>
              Revisar registros no acredita una evaluación clínica ni cumple un plan de ejercicio
              prescrito.
            </small>
          </section>
          <Panel className="health-analysis">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">ANÁLISIS CONJUNTO DE LA PERSONA</p>
                <h3>Lectura explicable</h3>
              </div>
              <Icon name="sparkles" />
            </div>
            <p>{data.analysis.summary}</p>
            <h4>Siguiente seguimiento</h4>
            <p>{data.analysis.next}</p>
            <details>
              <summary>Datos usados y limitaciones</summary>
              <ul>
                {data.analysis.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h4>Información ausente</h4>
              <ul>
                {data.analysis.missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>
                Resumen determinista de demo. No hay IA clínica, diagnóstico ni recomendaciones de
                medicación.
              </p>
            </details>
          </Panel>
          <Panel>
            <div className="panel-heading">
              <h3>Observaciones de {data.name.split(' ')[0]}</h3>
              <Icon name="bell" />
            </div>
            {data.pendingObservations.length ? (
              <ul>
                {data.pendingObservations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="health-muted">
                Sin observaciones pendientes del escenario para esta persona.
              </p>
            )}
            <button className="text-button" onClick={onOpenObservations}>
              Ver observaciones de la misión
              <Icon name="arrow" size={13} />
            </button>
          </Panel>
        </div>
      </div>
    </section>
  );
}
