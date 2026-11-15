import { Activity, CheckCheck, Radio, ShieldCheck, Timer, TriangleAlert } from 'lucide-react';
import { Panel } from '@/ui/Panel';
import { activityOptions, type MonitoringActions, type MonitoringData } from '../types';
import styles from './monitoring.module.css';

const phases = {
  before: 'Antes de la actividad',
  during: 'Durante la actividad',
  after: 'Después de la actividad',
};
const guidance = {
  cabin:
    'Registra si la captura se realiza en reposo. Mantén las mismas condiciones al repetir para facilitar la comparación.',
  exercise:
    'Identifica el equipo de ejercicio y el momento de la captura. La fase de recuperación permite comparar lecturas; no determina aptitud física.',
  surface:
    'Identifica el vehículo o zona del recorrido y el equipo utilizado. La localización se registra manualmente; no hay geolocalización conectada.',
  eva: 'Identifica el traje o equipo de captura. Esta vista no recibe presión del traje, dosimetría ni autonomía y no autoriza una salida extravehicular.',
};
export function MonitoringView({
  data: d,
  actions: a,
  onNewSession,
}: {
  data: MonitoringData;
  actions: MonitoringActions;
  onNewSession(): void;
}) {
  const preparing = d.step === 'prepare';
  const capturing = d.step === 'capture';
  const reviewing = d.step === 'review';
  return (
    <div className={styles.root}>
      <Panel className={styles.header} label="Sesión de monitoreo">
        <div className={styles.heading}>
          <span className="icon-chip">
            <Activity size={22} />
          </span>
          <div>
            <p className="eyebrow">
              MEDICIÓN ASISTIDA · {d.mode === 'demo' ? 'DEMOSTRACIÓN SINTÉTICA' : 'CONSUMIDOR API'}
            </p>
            <h2>{d.subjectLabel}</h2>
          </div>
        </div>
        <ol className={styles.steps} aria-label="Progreso de la medición">
          {(['prepare', 'capture', 'review', 'saved'] as const).map((step, i) => (
            <li key={step} aria-current={d.step === step ? 'step' : undefined}>
              <span>{i + 1}</span>
              {['Preparación', 'Captura', 'Revisión', 'Guardado'][i]}
            </li>
          ))}
        </ol>
        <p className="sub">
          Las capturas abiertas se conservan durante esta visita a la pantalla. Guarda antes de
          cambiar de tripulante, salir o recargar.
        </p>
      </Panel>

      {d.error && (
        <div role="alert" className={styles.alert}>
          <TriangleAlert size={20} />
          <p>{d.error} Las lecturas anteriores permanecen identificadas con su hora.</p>
        </div>
      )}
      <div className={`${styles.layout} ${!preparing ? styles.activeLayout : ''}`}>
        <Panel label="Preparación de captura">
          <h3>Contexto de la medición</h3>
          {!preparing && (
            <p className="sub">
              {activityOptions.find((option) => option.id === d.activity)?.label} ·{' '}
              {phases[d.phase]} · {d.location} · {d.equipment}
            </p>
          )}
          <fieldset disabled={!preparing} hidden={!preparing} className={styles.fields}>
            <legend className="sr-only">Configurar sesión</legend>
            <label>
              Origen de las lecturas
              <select
                value={d.mode}
                onChange={(e) => a.setMode(e.target.value === 'api' ? 'api' : 'demo')}
              >
                <option value="demo">Demostración · datos sintéticos</option>
                <option value="api" disabled={!d.apiConfigured}>
                  {d.apiConfigured ? 'API · servicio externo' : 'API · sin configurar'}
                </option>
              </select>
            </label>
            {d.mode === 'api' ? (
              <>
                <p className={styles.notice}>
                  {d.apiConfigured
                    ? 'URL configurada. La conexión se verificará al capturar.'
                    : 'API sin configurar. Falta la URL y el contrato definitivo del proveedor.'}
                </p>
                <label>
                  Identificador del sujeto en la API
                  <input
                    value={d.subjectId}
                    maxLength={100}
                    autoComplete="off"
                    onChange={(e) => a.setSubjectId(e.target.value)}
                    placeholder="Identificador acordado con el proveedor"
                  />
                </label>
                <p className="sub">
                  Este identificador es independiente de los tripulantes ficticios del dashboard.
                </p>
              </>
            ) : (
              <p className="sub">
                Valores generados por ASTRA para probar el flujo. No provienen de sensores ni de
                NASA.
              </p>
            )}
            <div className={styles.activities} role="group" aria-label="Actividad de la sesión">
              {activityOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  aria-pressed={d.activity === option.id}
                  onClick={() => a.setActivity(option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.detail}</span>
                </button>
              ))}
            </div>
            <label>
              Fase de actividad
              <select
                value={d.phase}
                onChange={(e) => a.setPhase(e.target.value as MonitoringData['phase'])}
              >
                {Object.entries(phases).map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ubicación de la captura
              <input
                value={d.location}
                maxLength={100}
                onChange={(e) => a.setLocation(e.target.value)}
              />
            </label>
            <label>
              Equipo o sensores utilizados
              <input
                value={d.equipment}
                maxLength={100}
                placeholder="Ej.: banda torácica y oxímetro"
                onChange={(e) => a.setEquipment(e.target.value)}
              />
            </label>
            <p className={styles.notice}>{guidance[d.activity]}</p>
            {[
              'Confirmé la identidad de la persona.',
              'Comprobé la colocación y las instrucciones del equipo.',
              'Registré la actividad, fase y ubicación correctas.',
            ].map((label, index) => (
              <label className={styles.check} key={label}>
                <input
                  type="checkbox"
                  checked={d.checks[index]}
                  onChange={(e) => a.setCheck(index, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          {preparing && (
            <button className="button primary" disabled={!d.ready} onClick={a.begin}>
              Preparar captura
            </button>
          )}
        </Panel>

        <div className={styles.main}>
          <Panel label="Consola de captura">
            <div className={styles.heading}>
              <Radio size={20} />
              <div>
                <h3>
                  {d.running
                    ? 'Actualización periódica activa'
                    : capturing
                      ? 'Lista para recibir lecturas'
                      : preparing
                        ? 'Prepara tu sesión'
                        : reviewing
                          ? 'Revisa antes de guardar'
                          : 'Sesión guardada'}
                </h3>
                <p className="sub">
                  {d.captureCount}/20 capturas ·{' '}
                  {d.mode === 'demo' ? 'Origen sintético' : 'Origen API'} · {phases[d.phase]}
                </p>
              </div>
            </div>
            {d.busy && (
              <p role="status">
                {reviewing ? 'Guardando en este navegador…' : 'Solicitando lecturas…'}
              </p>
            )}
            {d.running && (
              <p className={styles.notice}>
                Consulta cada 5 segundos, sin solicitudes simultáneas. Se detiene ante un error o al
                llegar a 20 capturas.
              </p>
            )}
            {capturing && (
              <div className={styles.actions}>
                <button
                  className="button primary"
                  disabled={d.busy || d.running || d.captureCount >= 20}
                  onClick={a.capture}
                >
                  {d.captureCount ? 'Repetir medición' : 'Capturar lecturas'}
                </button>
                <button
                  className="button secondary"
                  disabled={d.captureCount >= 20 || (d.busy && !d.running)}
                  onClick={a.toggleRunning}
                >
                  {d.running ? 'Pausar actualización' : 'Actualizar cada 5 s'}
                </button>
                <button
                  className="button secondary"
                  disabled={!d.captureCount || d.busy}
                  onClick={a.review}
                >
                  Revisar sesión
                </button>
              </div>
            )}
            <div className={styles.metrics}>
              {d.metrics.map((metric) => (
                <article key={metric.id} className={styles.metric} aria-label={metric.label}>
                  <h4>{metric.label}</h4>
                  <strong>
                    {metric.value}
                    <small>{metric.unit}</small>
                  </strong>
                  <p>{metric.status}</p>
                  <svg
                    viewBox="0 0 200 50"
                    role="img"
                    aria-label={`Tendencia de ${metric.label}; valores en las capturas detalladas`}
                  >
                    {metric.points
                      .split('|')
                      .filter((s) => s.trim())
                      .map((points, i) => (
                        <polyline
                          key={i}
                          points={points}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      ))}
                  </svg>
                  <p>{metric.delta}</p>
                  <p className={styles.trace}>
                    {metric.at}
                    <br />
                    {metric.age}
                    <br />
                    {metric.source}
                  </p>
                </article>
              ))}
            </div>
            <p className={styles.notice}>
              <ShieldCheck size={16} />
              La calidad indica disponibilidad de datos, no un estado de salud. Los cambios se
              describen sin umbrales médicos ni autorización operativa. El resto del dashboard
              conserva sus escenarios sintéticos.
            </p>
          </Panel>

          {(reviewing || d.step === 'saved') && (
            <Panel label="Revisión de sesión">
              {reviewing ? (
                <>
                  <h3>Contexto y observaciones</h3>
                  <p className="sub">
                    {d.subjectLabel} · {d.location} · {d.equipment}
                  </p>
                  <label className={styles.fields}>
                    Nota de la sesión
                    <textarea
                      maxLength={1000}
                      value={d.note}
                      onChange={(e) => a.setNote(e.target.value)}
                      placeholder="Anota movimiento, interrupciones o problemas con los sensores."
                    />
                  </label>
                  <p className={styles.notice}>
                    Guardar conserva el registro en este navegador. No envía información a NASA ni
                    al proveedor de la API. Utiliza datos de prueba hasta disponer de autenticación
                    y almacenamiento adecuados.
                  </p>
                  <div className={styles.actions}>
                    <button
                      className="button primary"
                      disabled={d.busy || !!d.journalError || d.journalLoading}
                      onClick={a.save}
                    >
                      Guardar sesión local
                    </button>
                    <button className="button secondary" disabled={d.busy} onClick={a.resume}>
                      Volver a medir
                    </button>
                  </div>
                </>
              ) : (
                <div role="status" className={styles.heading}>
                  <CheckCheck />
                  <div>
                    <h3>Sesión guardada en este navegador</h3>
                    <p className="sub">Disponible al recargar. No sincronizada con un servidor.</p>
                  </div>
                </div>
              )}
            </Panel>
          )}

          {d.captureCount > 0 && (
            <Panel label="Capturas de la sesión">
              <h3>Lecturas y procedencia</h3>
              <p className="sub">
                La hora de recepción y la hora del dispositivo se muestran por separado. Un
                indicador omitido no hereda el valor anterior.
              </p>
              {d.attempts.map((attempt, index) => (
                <details key={attempt.id} className={styles.record}>
                  <summary>
                    Captura {index + 1} · recibida {attempt.at}
                  </summary>
                  <p className={styles.trace}>Solicitud: {attempt.id}</p>
                  {attempt.samples.length ? (
                    attempt.samples.map((sample) => (
                      <div key={sample.id} className={styles.sample}>
                        <strong>
                          {sample.label}: {sample.value}
                        </strong>
                        <p>{sample.detail}</p>
                        <small>ID: {sample.id}</small>
                      </div>
                    ))
                  ) : (
                    <p>La fuente no entregó muestras en esta captura.</p>
                  )}
                </details>
              ))}
            </Panel>
          )}
          {!preparing && (
            <button className="button secondary" disabled={d.busy} onClick={onNewSession}>
              Nueva sesión
            </button>
          )}
        </div>
      </div>
      <Panel label="Sesiones registradas">
        <div className={styles.heading}>
          <Timer size={20} />
          <div>
            <h3>Sesiones de esta persona y origen</h3>
            <p className="sub">
              Registro local separado por hábitat. Máximo 50 sesiones; ningún registro se elimina
              automáticamente.
            </p>
          </div>
        </div>
        {d.journalLoading ? (
          <p role="status">Cargando sesiones…</p>
        ) : d.journalError ? (
          <div role="alert">
            <p>{d.journalError}</p>
            <button className="button secondary" onClick={a.retryJournal}>
              Reintentar lectura del registro
            </button>
          </div>
        ) : d.sessions.length ? (
          d.sessions.map((session) => (
            <details
              className={styles.record}
              id={`session-${encodeURIComponent(session.id)}`}
              key={session.id}
            >
              <summary>
                {session.at} · {session.activity} · {session.count} capturas · {session.source}
              </summary>
              <p>{session.subject}</p>
              <p>{session.context}</p>
              <p>{session.note || 'Sin nota adicional.'}</p>
              {session.readings.map((reading, index) => (
                <p className={styles.sample} key={index}>
                  {reading}
                </p>
              ))}
            </details>
          ))
        ) : (
          <p className="sub">Todavía no hay sesiones guardadas para esta selección.</p>
        )}
      </Panel>
    </div>
  );
}
