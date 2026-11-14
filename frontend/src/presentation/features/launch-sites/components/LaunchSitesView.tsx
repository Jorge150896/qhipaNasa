import type { LaunchSitesViewProps } from '../types';
import { LaunchVideo } from './LaunchVideo';
import { useEffect, useRef } from 'react';
import { EarthOverview } from './EarthOverview';

export function LaunchSitesView({
  sites,
  selected,
  invalidSelection,
  globe,
  onSelect,
  onCloseVideo,
  overview = false,
}: LaunchSitesViewProps) {
  const detail = useRef<HTMLElement>(null);
  const previousSelection = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (selected && previousSelection.current !== selected.id) {
      if (detail.current) detail.current.scrollTop = 0;
      detail.current?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
      detail.current?.focus({ preventScroll: true });
    }
    previousSelection.current = selected?.id;
  }, [selected]);
  const placeCard = (
    <aside
      className="launch-detail"
      id="launch-place-card"
      aria-label="Detalle del lugar"
      ref={detail}
      tabIndex={-1}
    >
      {invalidSelection && (
        <p role="alert">El sitio de la URL no existe en este catálogo. Selecciona una ubicación.</p>
      )}
      {selected ? (
        <article aria-labelledby="launch-place-name">
          <button
            className="launch-card-close"
            aria-label="Cerrar tarjeta del lugar"
            onClick={onCloseVideo}
          >
            ×
          </button>
          <p className="eyebrow">{selected.category}</p>
          <h2 id="launch-place-name">{selected.fullName}</h2>
          <p>{selected.region}</p>
          <LaunchVideo key={selected.id} site={selected} />
          <hr />
          <h3>Sobre este lugar</h3>
          <p>{selected.summary}</p>
          <p className="launch-role">
            <strong>Función principal</strong>
            <br />
            {selected.role}
          </p>
          <p className="launch-pad">
            {selected.pad ?? 'Esta ubicación no es una plataforma de lanzamiento.'}
          </p>
          <a
            className="launch-coordinates"
            href={selected.facilityUrl}
            target="_blank"
            rel="noreferrer"
          >
            Conocer este lugar en su sitio oficial ↗
          </a>
          <br />
          <a
            className="launch-coordinates"
            href={selected.coordinateSource}
            target="_blank"
            rel="noreferrer"
          >
            {selected.coordinates} · Fuente de ubicación ↗
          </a>
          <hr />
          <p className="eyebrow">RELACIÓN CON LA MISIÓN</p>
          <p>{selected.description}</p>
          <div className="launch-video-context">
            <strong>El despegue del video ocurrió en:</strong>
            <p>{selected.videoLocation}</p>
            <p>{selected.videoRelation}</p>
            <a href={selected.relationSourceUrl} target="_blank" rel="noreferrer">
              Fuente de la relación con esta misión ↗
            </a>
          </div>
          <button className="button secondary" onClick={onCloseVideo}>
            Cerrar video y selección
          </button>
        </article>
      ) : (
        <div className="launch-empty">
          <span aria-hidden="true">↗</span>
          <h2>Elige un punto de partida</h2>
          <p>
            Selecciona un marcador en la Tierra o un lugar de la lista para abrir su tarjeta y un
            video de despegue relacionado. Cada punto tiene una tarjeta individual con su nombre.
          </p>
          <p>
            Este archivo educativo es independiente de los hábitats y tripulantes ficticios de la
            demo.
          </p>
        </div>
      )}
    </aside>
  );
  return (
    <section className="launch-page" aria-labelledby="launch-title">
      <header className="launch-heading">
        <p className="eyebrow">TIERRA / ARCHIVO DE EXPLORACIÓN</p>
        <h1 id="launch-title">{overview ? 'Todo de la Tierra' : 'Todo viaje empieza aquí.'}</h1>
        <p>
          Descubre sitios de lanzamiento y sedes principales de NASA. Cada lugar tiene su historia y
          una misión relacionada.
        </p>
        <span className="launch-badge">
          {sites.filter((site) => site.kind === 'launch-site').length} sitios de lanzamiento ·{' '}
          {sites.filter((site) => site.kind !== 'launch-site').length} sedes NASA seleccionadas ·
          Videos históricos
        </span>
      </header>
      {overview && <EarthOverview sites={sites} onSelect={onSelect} />}
      <div className="launch-layout">
        <div className="launch-map">
          <div
            className={`launch-viewer ${selected || invalidSelection ? 'has-selection' : ''}`}
            aria-label="Visor de la Tierra"
          >
            <div className="launch-globe" aria-label="Globo de sitios de lanzamiento">
              {globe}
            </div>
            {placeCard}
          </div>
          <p className="launch-caption">
            Arrastra para rotar · Acerca con zoom · Selecciona un punto o una ubicación de la lista
          </p>
          <div className="launch-legend" aria-label="Tipos de lugares">
            <span>
              <i className="launch-legend-pad" aria-hidden="true">
                ↗
              </i>{' '}
              Sitio de lanzamiento
            </span>
            <span>
              <i className="launch-legend-center" aria-hidden="true">
                ◆
              </i>{' '}
              Sede o laboratorio NASA
            </span>
          </div>
          <div className="launch-sites" aria-label="Sitios de lanzamiento y sedes NASA">
            {sites.map((site) => (
              <button
                key={site.id}
                aria-pressed={site.id === selected?.id}
                onClick={() => onSelect(site.id)}
                aria-controls="launch-place-card"
              >
                <span
                  className={`launch-number ${site.kind === 'launch-site' ? '' : 'launch-center-symbol'}`}
                  aria-hidden="true"
                >
                  {site.symbol}
                </span>
                <span>
                  <strong>{site.fullName}</strong>
                  <small>{site.category}</small>
                  <small>{site.region}</small>
                  <small className="launch-video-available">
                    ▶ Video de despegue: {site.mission}
                  </small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <p className="launch-caption">
            Coordenadas aproximadas en grados. Globo geográfico ilustrativo; no representa
            condiciones actuales. Selección de sedes, no es un directorio completo de NASA.
          </p>
          <p className="launch-caption">
            Texturas:{' '}
            <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">
              Solar System Scope / INOVE
            </a>{' '}
            · CC BY 4.0
          </p>
        </div>
      </div>
    </section>
  );
}
