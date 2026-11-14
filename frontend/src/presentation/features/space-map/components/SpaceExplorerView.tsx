import { Icon } from '@/ui/Icon';
import { useState } from 'react';
import type { ExplorerViewProps } from '../types';
export function SpaceExplorerView({
  data,
  selected,
  scene,
  onSelect,
  onOpenCrew,
  onRefresh,
  onOpenLaunchSites,
  onOpenEarthOverview,
}: ExplorerViewProps) {
  const [expandedMap, setExpandedMap] = useState(false);
  return (
    <div className="fleet-page">
      <div className="fleet-heading">
        <div>
          <p className="eyebrow">EXPLORADOR DE TRIPULACIÓN / DEMO</p>
          <h1>
            Distintos mundos.
            <br />
            <span>Una misma misión humana.</span>
          </h1>
          <p>Explora dónde viven, cómo están y qué necesita seguimiento.</p>
        </div>
        <button className="button secondary" onClick={onRefresh}>
          <Icon name="refresh" />
          Actualizar registros
        </button>
      </div>
      <div className="fleet-stats" aria-label="Resumen de la red">
        <div>
          <Icon name="users" />
          <strong>{data.totalCrew}</strong>
          <span>Tripulantes únicos</span>
        </div>
        <div>
          <Icon name="rocket" />
          <strong>{data.totalHabitats}</strong>
          <span>Hábitats de demostración</span>
        </div>
        <div>
          <Icon name="clipboard" />
          <strong>{data.pendingChecks}</strong>
          <span>Chequeos pendientes · hoy UTC</span>
        </div>
        <p>
          <span className="status-dot" /> DATOS SINTÉTICOS
          <br />
          <small>Registros locales · {data.today}</small>
        </p>
      </div>
      <div className={`fleet-layout${expandedMap ? ' fleet-layout-expanded' : ''}`}>
        <section className="fleet-map" aria-label="Exploración espacial">
          <div className="fleet-map-heading">
            <div>
              <span className="eyebrow">01 / MAPA DE LA RED</span>
              <h2>Explora el espacio</h2>
              <p>Elige un destino y descubre su tripulación.</p>
            </div>
            <button
              className="button secondary fleet-expand-map"
              aria-pressed={expandedMap}
              onClick={() => setExpandedMap((value) => !value)}
            >
              <Icon name="orbit" />
              {expandedMap ? 'Restaurar distribución' : 'Ampliar mapa'}
            </button>
          </div>
          <p className="fleet-destination-hint">Destinos · desliza para ver todos →</p>
          <div className="fleet-destinations" aria-label="Seleccionar destino">
            {data.destinations.map((destination) => (
              <button
                key={destination.id}
                aria-pressed={selected.id === destination.id}
                onClick={() => onSelect(destination.id)}
              >
                <span className={`fleet-dot fleet-dot-${destination.id}`} />
                <span>
                  {destination.name}
                  <small>{destination.crewCount} tripulantes</small>
                </span>
                <Icon name="chevron" size={14} />
              </button>
            ))}
          </div>
          {scene}
          <div className="fleet-map-caption">
            <span>
              <Icon name="orbit" />
              Arrastra para rotar · acerca con zoom · selecciona un objeto
            </span>
            <span>Órbitas y tamaños ilustrativos · datos de demostración</span>
          </div>
        </section>
        <aside className="fleet-detail" aria-label="Detalle del destino" aria-live="polite">
          <p className="eyebrow">02 / DESTINO SELECCIONADO</p>
          <div className="fleet-detail-title">
            <div>
              <span className="fleet-category">{selected.category}</span>
              <h2>{selected.name}</h2>
            </div>
            <Icon name={selected.id === 'ship' ? 'rocket' : 'orbit'} size={34} />
          </div>
          <p className="fleet-subtitle">{selected.subtitle}</p>
          {selected.id === 'earth' && (
            <div className="earth-destination-options">
              <button className="button primary" onClick={onOpenEarthOverview}>
                Ver todo de la Tierra
              </button>
              <button className="button primary" onClick={onOpenLaunchSites}>
                Explorar puntos de despegue ↗
              </button>
            </div>
          )}
          {selected.habitats.length === 0 ? (
            <p>Sin hábitats registrados para este destino.</p>
          ) : (
            selected.habitats.map((habitat) => (
              <div key={habitat.id} className="fleet-habitat">
                <div className="fleet-habitat-name">
                  <h3>{habitat.name}</h3>
                  <span>{habitat.crewCount} personas</span>
                </div>
                <p>{habitat.description}</p>
                <div className="fleet-status-grid">
                  <div>
                    <strong>{habitat.pendingChecks}</strong>
                    <span>Chequeos pendientes</span>
                  </div>
                  <div>
                    <strong>{habitat.pendingObservations}</strong>
                    <span>Observaciones sin revisar</span>
                  </div>
                  <div>
                    <strong>{habitat.unavailableSensors}</strong>
                    <span>Sensores sin dato actual</span>
                  </div>
                </div>
                {!habitat.journalAvailable && (
                  <p role="alert" className="fleet-warning">
                    No pudimos leer el diario local. Los pendientes se muestran como desconocidos.
                    Los registros guardados se conservan.
                  </p>
                )}
                <div className="fleet-scenario">
                  <Icon name="sliders" size={14} />
                  <span>Escenario inicial: {habitat.scenario}</span>
                </div>
                <h4>Tripulación a bordo</h4>
                <ul className="fleet-roster">
                  {habitat.crew.map((person) => (
                    <li key={person.id}>
                      <span className="avatar">{person.initials}</span>
                      <div>
                        <strong>{person.name}</strong>
                        <span>{person.role}</span>
                        <small>
                          {person.zone} · {person.activity}
                        </small>
                      </div>
                      <span className="fleet-check" title={person.check}>
                        <Icon
                          name={person.check === 'Chequeo registrado' ? 'checked' : 'clock'}
                          size={16}
                        />
                        <span className="sr-only">{person.check}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className="button primary fleet-enter"
                  onClick={() => onOpenCrew(habitat.id)}
                >
                  Ver tripulación e indicadores
                  <Icon name="arrow" size={17} />
                </button>
                <p className="fleet-timestamp">
                  <Icon name="clock" size={12} />
                  Instantánea simulada: {habitat.timestamp}
                </p>
              </div>
            ))
          )}
        </aside>
      </div>
      <div className="fleet-note">
        <Icon name="sparkles" />
        <p>
          <strong>Del lugar a la persona.</strong> Entra a un hábitat para explorar el astronauta
          3D, sus indicadores, historial, entorno y seguimiento. Los pendientes describen registros
          y calidad de datos; no son un diagnóstico. Tierra y Aurora comparten tripulación y solo se
          cuentan una vez.
        </p>
      </div>
      <p className="launch-caption">
        Superficies:{' '}
        <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">
          Solar System Scope / INOVE · CC BY 4.0
        </a>
        . Aurora es una estación conceptual de demo, no la ISS real.
      </p>
    </div>
  );
}
