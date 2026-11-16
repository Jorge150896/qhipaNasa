import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';
import type { SensorKey } from '../../mission/types';
import type { BodySystemKey, CrewHealthData, CrewHealthMessage } from '../types';
import { HealthSystemIllustration } from './HealthSystemIllustration';
interface Props {
  data: CrewHealthData;
  loading: boolean;
  error: boolean;
  saving: boolean;
  message: CrewHealthMessage | null;
  onSelectSystem(id: BodySystemKey): void;
  onReportSystem(): void;
  onReview(): Promise<void>;
  onRetry(): void;
  onOpenHistory(): void;
  onOpenJournal(): void;
  onOpenHabitat(): void;
  onSelectMetric(id: SensorKey): void;
  onOpenRecord(id: string, fromDailyCheck?: boolean): void;
}
export function CrewHealthView({
  data,
  loading,
  error,
  saving,
  message,
  onSelectSystem,
  onReportSystem,
  onReview,
  onRetry,
  onOpenHistory,
  onOpenJournal,
  onOpenHabitat,
  onSelectMetric,
  onOpenRecord,
}: Props) {
  const t = useTranslation();
  const disabled = loading || error || saving;
  return (
    <section
      className="health-workspace"
      aria-label={t('Salud por sistemas')}
      id="crew-health"
      tabIndex={-1}
    >
      <div className="health-heading">
        <div>
          <p className="eyebrow">{t('SALUD DE LA TRIPULACIÓN')}</p>
          <h2>
            {t('Salud por sistemas · ')}
            {t(data.name)}
          </h2>
          <p>{t(data.personContext)}</p>
        </div>
        <div className="health-heading-actions">
          <span className="badge">{t('Demostración')}</span>
          <a className="text-button" href="#crew-body">
            {t('Volver al astronauta')}
            <Icon name="arrow" size={14} />
          </a>
        </div>
      </div>
      <nav className="health-system-picker" aria-label={t('Sistemas corporales')}>
        {data.systems.map((system) => (
          <button
            key={system.id}
            aria-label={t(system.label)}
            aria-pressed={data.system.id === system.id}
            onClick={() => onSelectSystem(system.id)}
          >
            <Icon name={system.icon} />
            <span>{t(system.shortLabel)}</span>
          </button>
        ))}
      </nav>
      {loading && (
        <p role="status" className="health-notice">
          {t('Cargando registros locales de salud…')}
        </p>
      )}
      {error && (
        <div role="alert" className="health-notice health-error">
          <p>
            {t(
              'No se pudo leer el registro de salud. Los datos anteriores se conservan. Los sensores y las explicaciones siguen disponibles.',
            )}
          </p>
          <button className="button secondary" onClick={onRetry}>
            {t('Reintentar registro de salud')}
          </button>
        </div>
      )}
      <section className="panel health-next-step" id="crew-health-next" tabIndex={-1}>
        <div>
          <p className="eyebrow">
            {t('SIGUIENTE PASO · ')}
            {t(data.system.shortLabel)}
          </p>
          <h3>
            {t(
              loading
                ? 'Consultando autorregistros…'
                : data.nextStep.target === 'entry'
                  ? 'Informar en el monitoreo diario'
                  : data.nextStep.title,
            )}
          </h3>
          {!loading && (
            <p>
              {t(
                data.nextStep.target === 'entry'
                  ? 'Añade lo que notaste en esta área a tu chequeo del día.'
                  : data.nextStep.detail,
              )}
            </p>
          )}
          {!loading &&
            (data.nextStep.target === 'entry' ? (
              <button type="button" className="text-button" onClick={onReportSystem}>
                {t('Abrir monitoreo diario')}
                <Icon name="arrow" size={13} />
              </button>
            ) : (
              <a className="text-button" href={`#crew-health-${data.nextStep.target}`}>
                {t(data.nextStep.target === 'readings' ? 'Ver indicadores' : 'Ir al seguimiento')}
                <Icon name="arrow" size={13} />
              </a>
            ))}
        </div>
        <div className="health-next-state">
          <span>{t('Último autorregistro')}</span>
          <strong>{t(loading ? 'Consultando…' : data.stateLabel)}</strong>
          {data.lastEntryDate && <small>{t(data.lastEntryDate)}</small>}
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
                <p className="eyebrow">{t('ÁREA SELECCIONADA')}</p>
                <h3>{t(data.system.label)}</h3>
              </div>
            </div>
            <p>{t(data.system.overview)}</p>

            {data.metrics.length > 0 && (
              <p>
                {t('Telemetría sintética de la misión · ')}
                {t(data.sensorDate)}
              </p>
            )}
            {data.metrics.length ? (
              <details className="health-metric-disclosure">
                <summary>{t('Consultar indicadores del sistema')}</summary>
                <div className="health-metrics">
                  {data.metrics.map((metric) => (
                    <article key={metric.id}>
                      <div>
                        <span>{t(metric.label)}</span>
                        <strong>
                          {t(metric.value)}
                          <small>{t(metric.unit)}</small>
                        </strong>
                      </div>
                      <span
                        className={`badge ${metric.qualityTone === 'attention' ? 'amber' : ''}`}
                      >
                        {t(metric.quality)}
                      </span>
                      <p>{t(metric.meaning)}</p>
                      <p>{t(metric.lastReading)}</p>
                      <dl>
                        <div>
                          <dt>{t('Referencia de esta serie')}</dt>
                          <dd>{t(metric.comparison?.reference ?? 'Sin referencia disponible')}</dd>
                        </div>
                        <div>
                          <dt>{t('Cambio descriptivo')}</dt>
                          <dd>
                            {t(metric.comparison?.difference ?? 'Sin comparación disponible')}
                          </dd>
                        </div>
                      </dl>
                      <button
                        className="text-button"
                        onClick={() => {
                          onSelectMetric(metric.id);
                          onOpenHistory();
                        }}
                      >
                        {t('Ver serie de')}
                        {t(metric.shortLabel.toLowerCase())}
                        <Icon name="arrow" size={13} />
                      </button>
                    </article>
                  ))}
                </div>
              </details>
            ) : (
              <div className="health-empty">
                <Icon name="clipboard" />
                <p>{t('Esta área no tiene mediciones instrumentales en la demo.')}</p>
                <small>
                  {t('Un autorregistro aporta contexto y se conserva separado de los sensores.')}
                </small>
              </div>
            )}
            <div className="health-limits">
              <h4>{t('Información pendiente')}</h4>
              <p>{t(data.system.missing)}</p>
              <details>
                <summary>{t('Cómo interpretarlo y fuente científica')}</summary>
                <HealthSystemIllustration key={data.system.id} system={data.system} />
                <p>{t(data.system.limitation)}</p>
                <small>
                  {t(
                    'La primera muestra de una serie no es una referencia clínica ni un rango de normalidad.',
                  )}
                </small>
                <p>
                  <a
                    className="text-button"
                    href={data.system.source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t(data.system.source.title)}
                    <Icon name="arrow" size={13} />
                  </a>
                </p>
              </details>
            </div>
          </section>
          <section
            className="panel"
            id="crew-health-history"
            tabIndex={-1}
            aria-label={t('Historial de autorregistros')}
          >
            <div className="panel-heading">
              <div>
                <p className="eyebrow">
                  {t(data.name)} · {t(data.system.shortLabel)}
                </p>
                <h3>{t('Historial de autorregistros')}</h3>
              </div>
              <Icon name="clock" />
            </div>
            {error ? (
              <p>{t('Historial no disponible. No se interpreta como ausencia de registros.')}</p>
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
                      <strong>{t(entry.state)}</strong>
                      <time>{t(entry.date)}</time>
                    </div>
                    {entry.activity && (
                      <p>
                        {t(entry.activity)} · {t(entry.duration)}
                      </p>
                    )}
                    {entry.visionActivity && <p>{t(entry.visionActivity)}</p>}
                    {entry.note && <p>{entry.note}</p>}
                    <small>
                      {t(entry.fromDailyCheck ? 'Monitoreo diario' : 'Autorregistro anterior')}
                    </small>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => onOpenRecord(entry.id, entry.fromDailyCheck)}
                    >
                      {t(entry.fromDailyCheck ? 'Ver chequeo' : 'Ver en la línea de tiempo')}
                      {t(' ')}
                      <Icon name="arrow" size={13} />
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="health-muted">
                {t('No hay autorregistros para')}
                {t(data.name)}
                {t(' en esta área. No implica que se haya evaluado su estado.')}
              </p>
            )}
          </section>
        </div>
        <div className="health-side-column">
          <Panel>
            <div className="panel-heading">
              <h3>{t('Contexto de la persona')}</h3>
              <Icon name="users" />
            </div>
            <dl className="health-context">
              {data.context.map((item) => (
                <div key={item.label}>
                  <dt>{t(item.label)}</dt>
                  <dd>{t(item.value)}</dd>
                </div>
              ))}
            </dl>
            <div className="health-form-actions">
              <button className="text-button" onClick={onOpenJournal}>
                {t('Abrir monitoreo diario')}
                <Icon name="arrow" size={13} />
              </button>
              <button className="text-button" onClick={onOpenHabitat}>
                {t('Ver entorno de la nave')}
                <Icon name="arrow" size={13} />
              </button>
            </div>
          </Panel>
          <section className="panel health-followup" id="crew-health-review" tabIndex={-1}>
            <p className="eyebrow">{t('SEGUIMIENTO DOCUMENTAL / DEMO')}</p>
            <h3>{t(data.system.task)}</h3>
            <p>
              {t(
                error
                  ? 'Revisión desconocida'
                  : data.reviewed
                    ? 'Revisado hoy en UTC'
                    : 'Pendiente de revisión hoy en UTC',
              )}
            </p>
            {data.reviewDate && (
              <small>
                {t('Última actualización: ')}
                {t(data.reviewDate)}
              </small>
            )}
            <button
              className="button secondary full"
              disabled={disabled}
              onClick={() => void onReview()}
            >
              {t(data.reviewed ? 'Volver a pendiente' : 'Marcar revisión realizada')}
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
              {t(
                'Revisar registros no acredita una evaluación clínica ni cumple un plan de ejercicio prescrito.',
              )}
            </small>
          </section>
          <Panel className="health-analysis">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{t('ANÁLISIS CONJUNTO DE LA PERSONA')}</p>
                <h3>{t('Lectura explicable')}</h3>
              </div>
              <Icon name="sparkles" />
            </div>
            <p>{t(data.analysis.summary)}</p>
            <h4>{t('Siguiente seguimiento')}</h4>
            <p>{t(data.analysis.next)}</p>
            <details>
              <summary>{t('Datos usados y limitaciones')}</summary>
              <ul>
                {data.analysis.evidence.map((item) => (
                  <li key={item}>{t(item)}</li>
                ))}
              </ul>
              <h4>{t('Información ausente')}</h4>
              <ul>
                {data.analysis.missing.map((item) => (
                  <li key={item}>{t(item)}</li>
                ))}
              </ul>
              <p>
                {t(
                  'Resumen determinista de demo. No hay IA clínica, diagnóstico ni recomendaciones de medicación.',
                )}
              </p>
            </details>
          </Panel>
          <Panel>
            <div className="panel-heading">
              <h3>
                {t('Observaciones de ')}
                {t(data.name.split(' ')[0])}
              </h3>
              <Icon name="bell" />
            </div>
            {data.pendingObservations.length ? (
              <ul>
                {data.pendingObservations.map((item) => (
                  <li key={item}>{t(item)}</li>
                ))}
              </ul>
            ) : (
              <p className="health-muted">
                {t('Sin observaciones pendientes del escenario para esta persona.')}
              </p>
            )}
          </Panel>
        </div>
      </div>
    </section>
  );
}
