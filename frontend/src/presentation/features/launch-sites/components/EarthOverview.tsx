import type { LaunchSiteData } from '../types';

/** One catalogue feeds the overview, markers, detail card and video selection. */
export function EarthOverview({
  sites,
  selectedId,
  onSelect,
}: {
  sites: LaunchSiteData[];
  selectedId?: string;
  onSelect(id: string): void;
}) {
  const launches = sites.filter((site) => site.kind === 'launch-site');
  const centers = sites.filter((site) => site.kind !== 'launch-site');
  const videos = [...new Map(launches.map((site) => [site.embedUrl, site])).values()];
  return (
    <div className="earth-overview">
      <div className="earth-directory" role="group" aria-label="Directorio de centros en Tierra">
        {[
          { title: 'Centros de operaciones y apoyo', places: centers },
          { title: 'Sitios de lanzamiento', places: launches },
        ].map((group) => (
          <section key={group.title} aria-label={group.title}>
            <h2>{group.title}</h2>
            <div className="earth-overview-grid">
              {group.places.map((site) => (
                <button
                  className="earth-place-card"
                  key={site.id}
                  type="button"
                  aria-pressed={site.id === selectedId}
                  onClick={() => onSelect(site.id)}
                  aria-controls="launch-place-card"
                >
                  <strong>{site.fullName}</strong>
                  <span>{site.region}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section aria-label="Videos de despegue disponibles">
        <h2>Videos de despegue</h2>
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
    </div>
  );
}
