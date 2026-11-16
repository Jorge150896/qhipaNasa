import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { Icon } from '@/ui/Icon';
import { useState } from 'react';
import type { ExplorerViewProps } from '../types';
import { MarsWeatherReference } from './MarsWeatherReference';
export function SpaceExplorerView({
  data,
  selected,
  scene,
  onSelect,
  onOpenCrew,
  onRefresh,
  onOpenEarthCenters,
}: ExplorerViewProps) {
  const t = useTranslation();
  const [expandedMap, setExpandedMap] = useState(false);
  return (
    <div className="fleet-page">
      <div className="fleet-heading">
        <div>
          <h1>
            {t('Distintos mundos.')}
            <br />
            <span>{t('Una misma misión humana.')}</span>
          </h1>
          <p>{t('Explora dónde viven, cómo están y qué necesita seguimiento.')}</p>
        </div>
        <button className="button secondary" onClick={onRefresh}>
          <Icon name="refresh" />
          {t('Actualizar registros')}
        </button>
      </div>
      <div className="fleet-stats" aria-label={t('Resumen de la red')}>
        <div>
          <Icon name="users" />
          <strong>{t(data.totalCrew)}</strong>
          <span>{t('Tripulantes únicos')}</span>
        </div>
        <div>
          <Icon name="rocket" />
          <strong>{t(data.totalHabitats)}</strong>
          <span>{t('Hábitats de demostración')}</span>
        </div>
        <div>
          <Icon name="clipboard" />
          <strong>{t(data.pendingChecks)}</strong>
          <span>{t('Chequeos pendientes · hoy UTC')}</span>
        </div>
        <p>
          <span className="status-dot" />
          {t(' DATOS SINTÉTICOS')}
          <br />
          <small>
            {t('Registros locales · ')}
            {t(data.today)}
          </small>
        </p>
      </div>
      <div className={`fleet-layout${expandedMap ? ' fleet-layout-expanded' : ''}`}>
        <section className="fleet-map" aria-label={t('Exploración espacial')}>
          <div className="fleet-map-heading">
            <div>
              <h2>{t('Explora el espacio')}</h2>
            </div>
            <button
              className="button secondary fleet-expand-map"
              aria-pressed={expandedMap}
              onClick={() => setExpandedMap((value) => !value)}
            >
              <Icon name="orbit" />
              {t(expandedMap ? 'Restaurar distribución' : 'Ampliar mapa')}
            </button>
          </div>
          <p className="fleet-destination-hint">{t('Destinos · desliza para ver todos →')}</p>
          <div className="fleet-destinations" aria-label={t('Seleccionar destino')}>
            {data.destinations.map((destination) => (
              <button
                key={destination.id}
                aria-pressed={selected.id === destination.id}
                onClick={() => onSelect(destination.id)}
              >
                <span className={`fleet-dot fleet-dot-${destination.id}`} />
                <span>
                  {t(destination.name)}
                  <small>
                    {t(destination.crewCount)}
                    {t(' tripulantes')}
                  </small>
                </span>
                <Icon name="chevron" size={14} />
              </button>
            ))}
          </div>
          {scene}
          <div className="fleet-map-caption">
            <span>
              <Icon name="orbit" />
              {t('Arrastra para rotar · acerca con zoom · selecciona un objeto')}
            </span>
            <span>{t('Órbitas y tamaños ilustrativos · datos de demostración')}</span>
          </div>
        </section>
        <aside className="fleet-detail" aria-label={t('Detalle del destino')} aria-live="polite">
          <div className="fleet-detail-title">
            <div>
              <span className="fleet-category">{t(selected.category)}</span>
              <h2>{t(selected.name)}</h2>
            </div>
            <Icon name={selected.id === 'ship' ? 'rocket' : 'orbit'} size={34} />
          </div>
          <p className="fleet-subtitle">{t(selected.subtitle)}</p>
          {selected.id === 'mars' && <MarsWeatherReference />}
          {selected.id === 'earth' && (
            <div className="earth-destination-options">
              <button className="button primary" onClick={onOpenEarthCenters}>
                {t('Ver centros en Tierra')}
              </button>
            </div>
          )}
          {selected.habitats.length === 0 ? (
            <p>{t('Sin hábitats registrados para este destino.')}</p>
          ) : (
            selected.habitats.map((habitat) => (
              <div key={habitat.id} className="fleet-habitat">
                <div className="fleet-habitat-name">
                  <h3>{t(habitat.name)}</h3>
                  <span>
                    {t(habitat.crewCount)}
                    {t(' personas')}
                  </span>
                </div>
                <p>{t(habitat.description)}</p>
                <div className="fleet-status-grid">
                  <div>
                    <strong>{t(habitat.pendingChecks)}</strong>
                    <span>{t('Chequeos pendientes')}</span>
                  </div>
                  <div>
                    <strong>{t(habitat.pendingObservations)}</strong>
                    <span>{t('Observaciones sin revisar')}</span>
                  </div>
                  <div>
                    <strong>{t(habitat.unavailableSensors)}</strong>
                    <span>{t('Sensores sin dato actual')}</span>
                  </div>
                </div>
                {!habitat.journalAvailable && (
                  <p role="alert" className="fleet-warning">
                    {t(
                      'No pudimos leer el diario local. Los pendientes se muestran como desconocidos. Los registros guardados se conservan.',
                    )}
                  </p>
                )}
                <div className="fleet-scenario">
                  <Icon name="sliders" size={14} />
                  <span>
                    {t('Escenario inicial: ')}
                    {t(habitat.scenario)}
                  </span>
                </div>
                <h4>{t('Tripulación a bordo')}</h4>
                <ul className="fleet-roster">
                  {habitat.crew.map((person) => (
                    <li key={person.id}>
                      <span className="avatar">{t(person.initials)}</span>
                      <div>
                        <strong>{t(person.name)}</strong>
                        <span>{t(person.role)}</span>
                        <small>
                          {t(person.zone)} · {t(person.activity)}
                        </small>
                      </div>
                      <span className="fleet-check" title={t(person.check)}>
                        <Icon
                          name={person.check === 'Chequeo registrado' ? 'checked' : 'clock'}
                          size={16}
                        />
                        <span className="sr-only">{t(person.check)}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className="button primary fleet-enter"
                  onClick={() => onOpenCrew(habitat.id)}
                >
                  {t('Ver tripulación e indicadores')}
                  <Icon name="arrow" size={17} />
                </button>
                <p className="fleet-timestamp">
                  <Icon name="clock" size={12} />
                  {t('Instantánea simulada:')}
                  {t(habitat.timestamp)}
                </p>
              </div>
            ))
          )}
        </aside>
      </div>
      <p className="launch-caption">
        {t('Superficies:')}
        {t(' ')}
        <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">
          Solar System Scope / INOVE · CC BY 4.0
        </a>
        {t('. Aurora es una estación conceptual de demo, no la ISS real.')}
      </p>
    </div>
  );
}
