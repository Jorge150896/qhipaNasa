import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
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
  const t = useTranslation();
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
      aria-label={t('Detalle del lugar')}
      ref={detail}
      tabIndex={-1}
    >
      {invalidSelection && (
        <p role="alert">
          {t('El sitio de la URL no existe en este catálogo. Selecciona una ubicación.')}
        </p>
      )}
      {selected ? (
        <article aria-labelledby="launch-place-name">
          <button
            className="launch-card-close"
            aria-label={t('Cerrar tarjeta del lugar')}
            onClick={onCloseVideo}
          >
            ×
          </button>
          <p className="eyebrow">{t(selected.category)}</p>
          <h2 id="launch-place-name">{t(selected.fullName)}</h2>
          <p>{t(selected.region)}</p>
          <h3>{t('Sobre este lugar')}</h3>
          <p>{t(selected.summary)}</p>
          <p className="launch-role">
            <strong>{t('Función principal')}</strong>
            <br />
            {t(selected.role)}
          </p>
          <p className="launch-pad">
            {t(selected.pad ?? 'Esta ubicación no es una plataforma de lanzamiento.')}
          </p>
          <a
            className="launch-coordinates"
            href={selected.facilityUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t('Conocer este lugar en su sitio oficial ↗')}
          </a>
          <br />
          <a
            className="launch-coordinates"
            href={selected.coordinateSource}
            target="_blank"
            rel="noreferrer"
          >
            {t(selected.coordinates)}
            {t(' · Fuente de ubicación ↗')}
          </a>
          <hr />
          <LaunchVideo key={selected.id} site={selected} />
          <p className="eyebrow">{t('RELACIÓN CON LA MISIÓN')}</p>
          <p>{t(selected.description)}</p>
          <div className="launch-video-context">
            <p>{t(selected.videoRelation)}</p>
            <a href={selected.relationSourceUrl} target="_blank" rel="noreferrer">
              {t('Fuente de la relación con esta misión ↗')}
            </a>
          </div>
          <button className="button secondary" onClick={onCloseVideo}>
            {t('Cerrar video y selección')}
          </button>
        </article>
      ) : (
        <div className="launch-empty">
          <span aria-hidden="true">↗</span>
          <h2>{t('Elige un centro o sitio de lanzamiento')}</h2>
          <p>{t('Consulta qué función cumple el lugar y la misión asociada.')}</p>
        </div>
      )}
    </aside>
  );
  return (
    <section className="launch-page" aria-labelledby="launch-title">
      <header className="launch-heading">
        <h1 id="launch-title">{t('Centros en Tierra')}</h1>
        <p>{t('Explora dónde se controlan, apoyan y lanzan las misiones espaciales.')}</p>
      </header>
      <div className="launch-layout">
        <div className="launch-map">
          <div
            className={`launch-viewer ${selected || invalidSelection ? 'has-selection' : ''}`}
            aria-label={t('Visor de la Tierra')}
          >
            <div className="launch-globe" aria-label={t('Globo de centros en Tierra')}>
              {globe}
            </div>
            {placeCard}
          </div>
          <p className="launch-caption">
            {t(
              'Arrastra para rotar · Acerca con zoom · Selecciona un punto o una ubicación de la lista',
            )}
          </p>
          <div className="launch-legend" aria-label={t('Tipos de lugares')}>
            <span>
              <i className="launch-legend-pad" aria-hidden="true">
                ↗
              </i>
              {t(' ')}
              {t('Sitio de lanzamiento')}
            </span>
            <span>
              <i className="launch-legend-center" aria-hidden="true">
                ◆
              </i>
              {t(' ')}
              {t('Centro de operaciones o apoyo')}
            </span>
          </div>
          <EarthOverview sites={sites} selectedId={selected?.id} onSelect={onSelect} />
          <p className="launch-caption">
            {t(
              'Coordenadas aproximadas en grados. Globo geográfico ilustrativo; no representa condiciones actuales. Selección de sedes, no es un directorio completo de NASA.',
            )}
          </p>
          <p className="launch-caption">
            {t('Texturas:')}
            {t(' ')}
            <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">
              Solar System Scope / INOVE
            </a>
            {t(' ')}· CC BY 4.0
          </p>
        </div>
      </div>
    </section>
  );
}
