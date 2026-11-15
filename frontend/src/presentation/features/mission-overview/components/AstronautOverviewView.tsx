'use client';
import { useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  Check,
  Orbit,
  Radio,
  Radiation,
  Shield,
  Signal,
  Sun,
  Users,
} from 'lucide-react';
import type { AstronautOverviewData } from '../types';
import type { MetricData, SensorKey } from '../../mission/types';
import styles from './astronaut-overview.module.css';

const hazards = {
  radiation: {
    label: 'Radiación',
    title: 'Una exposición que los signos vitales no describen.',
    detail:
      'Los instrumentos aportan el contexto de radiación del entorno. Para atribuir exposición a una persona hacen falta dosimetría, ubicación, tiempo y blindaje.',
    next: 'Referencia ambiental · requiere dosimetría personal',
  },
  gravity: {
    label: 'Gravedad',
    title: 'Seguir la adaptación al esfuerzo.',
    detail:
      'Las sesiones de ejercicio y recuperación aportan contexto cardiovascular. No miden por sí solas pérdida ósea, fuerza muscular ni cambios de visión.',
    next: 'Complemento · ejercicio y seguimiento longitudinal',
  },
  isolation: {
    label: 'Aislamiento',
    title: 'El descanso y el ánimo también cuentan.',
    detail:
      'Sueño, fatiga y ánimo requieren autorregistros y seguimiento personal. Los datos de salud mental necesitan permisos específicos.',
    next: 'Complemento · chequeo diario y autorregistro',
  },
  environment: {
    label: 'Entorno',
    title: 'El módulo forma parte de la evaluación.',
    detail:
      'CO₂, presión y condiciones ambientales necesitan sensores propios. Una lectura de un módulo no se asigna a una persona sin coincidencia de ubicación y tiempo.',
    next: 'Complemento · sensores ambientales',
  },
  distance: {
    label: 'Distancia',
    title: 'Continuidad cuando la Tierra está lejos.',
    detail:
      'Conservar registros, identificar fallos y gestionar comunicaciones demoradas es parte de la autonomía. El guardado local actual no es un modo offline completo.',
    next: 'Requisito transversal · autonomía y sincronización',
  },
} as const;

export function AstronautOverviewView({
  data,
  metric,
  scene,
  mode,
  habitatLabel,
  onModeChange,
  onSelectMetric,
  onStartMonitoring,
  onSources,
}: {
  data: AstronautOverviewData;
  metric: MetricData;
  scene: ReactNode;
  mode: 'crew' | 'ship';
  habitatLabel: string;
  onModeChange(mode: 'crew' | 'ship'): void;
  onSelectMetric(id: SensorKey): void;
  onStartMonitoring(): void;
  onSources(): void;
}) {
  const [hazard, setHazard] = useState<keyof typeof hazards>('radiation');
  const selected = hazards[hazard];
  return (
    <section className={styles.console} aria-label="Resumen operacional del astronauta">
      <header className={styles.header}>
        <div>
          <p className="eyebrow">CONSOLA DE SALUD / TRIPULACIÓN</p>
          <h1>Qhipa Pacha Lab</h1>
        </div>
        <span className={styles.source}>
          <Radio size={13} />
          Instantánea sintética · {data.time}
        </span>
      </header>
      <div className={styles.layout}>
        <aside className={styles.followup} aria-label="Contexto de seguimiento">
          <p className="eyebrow">SEGUIMIENTO DE SESIÓN</p>
          <div className={styles.checkpoint}>
            <span>
              <Users size={15} />
            </span>
            <div>
              <small>TRIPULANTE</small>
              <strong>{data.name}</strong>
              <p>{data.role}</p>
            </div>
          </div>
          <div className={styles.checkpoint}>
            <span>
              <Orbit size={15} />
            </span>
            <div>
              <small>ACTIVIDAD</small>
              <strong>{data.activity}</strong>
              <p>{data.location}</p>
            </div>
          </div>
          <div className={styles.checkpoint}>
            <span>
              <Signal size={15} />
            </span>
            <div>
              <small>SEÑALES EN ÚLTIMA MUESTRA</small>
              <strong>
                {data.currentSignals}/{data.totalSignals} disponibles
              </strong>
              <p>Disponibilidad técnica, no estado de salud.</p>
            </div>
          </div>
          <div className={styles.checkpoint}>
            <span>
              <Check size={15} />
            </span>
            <div>
              <small>PROCEDENCIA</small>
              <strong>Escenario de demostración</strong>
              <p>{data.date} · Sin sensores conectados.</p>
            </div>
          </div>
          <button className="button primary" onClick={onStartMonitoring}>
            Iniciar monitoreo <ArrowUpRight size={15} />
          </button>
          <p className={styles.micro}>Preparar equipo → capturar → repetir → revisar.</p>
        </aside>

        <div className={styles.body}>
          <div className={styles.dials} role="group" aria-label="Indicadores del resumen">
            {data.metrics.map((item) => (
              <button
                key={item.id}
                id={`assistant-target-metric-${item.id}`}
                className={styles.dial}
                aria-pressed={item.id === data.selectedMetric}
                onClick={() => onSelectMetric(item.id)}
              >
                <span className={styles.dialFace}>
                  <svg viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r="44" className={styles.track} />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      className={styles.arc}
                      pathLength="100"
                      strokeDasharray={`${item.coverage * 75} 100`}
                    />
                  </svg>
                  <span className={styles.dialValue}>
                    <small>{item.label}</small>
                    <strong>{item.value}</strong>
                    <span>{item.unit}</span>
                  </span>
                </span>
                <span className={styles.quality}>{item.quality}</span>
                <span className={styles.micro}>
                  {item.available}/{item.total} muestras presentes
                </span>
              </button>
            ))}
          </div>
          <p className={styles.dialCaption}>
            Los arcos muestran cobertura de muestras; no límites médicos.
          </p>
          <section className={styles.stage} aria-label="Explorador tridimensional">
            <div className={styles.stageTop}>
              <span className="eyebrow">
                {mode === 'crew' ? 'VISTA CORPORAL / 3D' : 'VISTA DEL HÁBITAT / 3D'}
              </span>
              <div className="segmented">
                <button
                  data-assistant-control="crew-body"
                  aria-pressed={mode === 'crew'}
                  onClick={() => onModeChange('crew')}
                >
                  Astronauta
                </button>
                <button
                  data-assistant-control="crew-ship"
                  aria-pressed={mode === 'ship'}
                  onClick={() => onModeChange('ship')}
                >
                  {habitatLabel}
                </button>
              </div>
            </div>
            <div className={styles.orbit} aria-hidden="true" />
            {scene}
            <p className={styles.modelCaption}>
              Arrastra para girar · Rueda para acercar · Modelo ilustrativo
            </p>
            <div className={`scene-reading ${styles.readout}`}>
              <div>
                <span className="eyebrow">{metric.label}</span>
                <strong>
                  {metric.value}
                  <small>{metric.unit}</small>
                </strong>
              </div>
              <div>
                <span>{metric.quality}</span>
                <p>{metric.lastReading}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className={styles.context} aria-label="Radiación y riesgos de misión">
          <article className={styles.radiation}>
            <div className={styles.radiationTitle}>
              <Radiation size={22} />
              <span className="eyebrow">FOCO DE DATOS / RADIACIÓN</span>
            </div>
            <h3>Radiación ambiental</h3>
            <div className={styles.pending}>
              <strong>—</strong>
              <span>µGy/h</span>
            </div>
            <p>Sin consulta ambiental en esta vista.</p>
            <dl>
              <div>
                <dt>Fuente disponible</dt>
                <dd>NASA OSDR · RadLab</dd>
              </div>
              <div>
                <dt>Origen del histórico</dt>
                <dd>ISS / Columbus · históricos</dd>
              </div>
              <div>
                <dt>Dosimetría personal</dt>
                <dd>No disponible</dd>
              </div>
            </dl>
            <p className={styles.limit}>
              <Sun size={14} />
              La radiación medida no es exclusivamente solar.
            </p>
            <button className="text-button" onClick={onSources}>
              Fuentes y alcance <ArrowUpRight size={14} />
            </button>
          </article>
          <div className={styles.connections}>
            <p className="eyebrow">MÓDULO EXPLORADO · DEMO</p>
            <h3>{data.environment.name}</h3>
            {data.environment.readings.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>
                  {item.value} <small>{item.unit}</small>
                </strong>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <details className={styles.risks}>
        <summary>
          Los cinco peligros de la misión <span>Explorar contexto +</span>
        </summary>
        <div className={styles.riskPicker} role="group" aria-label="Explorar los cinco peligros">
          {(Object.keys(hazards) as (keyof typeof hazards)[]).map((key) => (
            <button key={key} aria-pressed={hazard === key} onClick={() => setHazard(key)}>
              {key === 'radiation' && <Radiation size={15} />} {hazards[key].label}
            </button>
          ))}
        </div>
        <div
          className={styles.riskDescription}
          role="region"
          aria-label="Contexto del peligro seleccionado"
          aria-live="polite"
        >
          <Shield size={18} />
          <div>
            <h3>{selected.title}</h3>
            <p>{selected.detail}</p>
            <small>{selected.next}</small>
          </div>
        </div>
      </details>
    </section>
  );
}
