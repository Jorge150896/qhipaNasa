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
          <LaunchVideo key={selected.id} site={selected} />
          <p className="eyebrow">RELACIÓN CON LA MISIÓN</p>
          <p>{selected.description}</p>
          <div className="launch-video-context">
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
          <h2>Elige un centro o sitio de lanzamiento</h2>
          <p>Consulta qué función cumple el lugar y la misión asociada.</p>
        </div>
      )}
    </aside>
  );
  return (
    <section className="launch-page" aria-labelledby="launch-title">
      <header className="launch-heading">
        <h1 id="launch-title">Centros en Tierra</h1>
        <p>Explora dónde se controlan, apoyan y lanzan las misiones espaciales.</p>
      </header>
      <div className="launch-layout">
        <div className="launch-map">
          <div
            className={`launch-viewer ${selected || invalidSelection ? 'has-selection' : ''}`}
            aria-label="Visor de la Tierra"
          >
            <div className="launch-globe" aria-label="Globo de centros en Tierra">
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
              Centro de operaciones o apoyo
            </span>
          </div>
          <EarthOverview sites={sites} selectedId={selected?.id} onSelect={onSelect} />
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
