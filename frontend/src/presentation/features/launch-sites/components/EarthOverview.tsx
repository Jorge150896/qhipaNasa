import type { LaunchSiteData } from '../types';

/** One catalogue feeds the overview, markers, detail card and video selection. */
export function EarthOverview({
  sites,
  onSelect,
}: {
  sites: LaunchSiteData[];
  onSelect(id: string): void;
}) {
  const launches = sites.filter((site) => site.kind === 'launch-site');
  const centers = sites.filter((site) => site.kind !== 'launch-site');
  const videos = [...new Map(launches.map((site) => [site.embedUrl, site])).values()];
  return (
    <div className="earth-overview" aria-label="Todo lo disponible de la Tierra">
      <div className="earth-overview-summary">
        <span>
          <strong>{launches.length}</strong> sitios de lanzamiento
        </span>
        <span>
          <strong>{centers.length}</strong> sedes NASA seleccionadas
        </span>
        <span>
          <strong>{videos.length}</strong> videos históricos
        </span>
      </div>
      {[
        { title: 'Sitios de lanzamiento', places: launches },
        { title: 'Sedes principales de NASA', places: centers },
      ].map((group) => (
        <section key={group.title} aria-label={group.title}>
          <h2>{group.title}</h2>
          <div className="earth-overview-grid">
            {group.places.map((site) => (
              <button
                className="earth-place-card"
                key={site.id}
                onClick={() => onSelect(site.id)}
                aria-controls="launch-place-card"
              >
                <span className="eyebrow">
                  {site.symbol} {site.category}
                </span>
                <strong>{site.fullName}</strong>
                <span>{site.region}</span>
                <span>{site.role}</span>
                <span className="launch-video-available">▶ Video de despegue: {site.mission}</span>
                <span className="earth-card-action">Ver información y video ↗</span>
              </button>
            ))}
          </div>
        </section>
      ))}
      <section aria-label="Videos de despegue disponibles">
        <h2>Videos de despegue</h2>
        <p>
          Archivo histórico de NASA y ESA. Abre una misión para ver el video, su lugar de despegue y
          las fuentes.
        </p>
        <div className="earth-video-grid">
          {videos.map((site) => (
            <button
              className="earth-video-card"
              key={site.embedUrl}
              onClick={() => onSelect(site.id)}
              aria-controls="launch-place-card"
            >
              <span aria-hidden="true">▶</span>
              <strong>{site.mission}</strong>
              <span>{site.date}</span>
              <small>{site.videoLocation}</small>
            </button>
          ))}
        </div>
      </section>
      <p className="earth-overview-note">
        Los lugares y videos de este archivo son reales e históricos; la tripulación y los hábitats
        de misión son ficticios. El catálogo de sedes es una selección, no un directorio completo de
        NASA. Los videos requieren conexión.
      </p>
      <h2>Globo interactivo e información del lugar</h2>
    </div>
  );
}
