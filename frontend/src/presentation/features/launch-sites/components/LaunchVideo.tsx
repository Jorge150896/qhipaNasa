import { useEffect, useState } from 'react';
import type { LaunchSiteData } from '../types';

export function LaunchVideo({ site }: { site: LaunchSiteData }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => setStatus('error'), 15000);
    return () => window.clearTimeout(timer);
  }, [status, attempt]);
  return (
    <section className="launch-video" aria-label={`Video de despegue · ${site.fullName}`}>
      <header className="launch-video-heading">
        <p className="eyebrow">VIDEO DE DESPEGUE · ARCHIVO HISTÓRICO</p>
        <h3>{site.mission}</h3>
        <p>{site.date}</p>
        <p>
          <strong>Despegue desde:</strong> {site.videoLocation}
        </p>
      </header>
      {status !== 'error' && (
        <iframe
          key={attempt}
          src={site.embedUrl}
          title={`Video del lanzamiento de ${site.mission} desde ${site.videoLocation}`}
          allow="encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
      {status === 'loading' && <p role="status">Cargando reproductor externo…</p>}
      {status === 'error' && (
        <div role="alert">
          <p>No se pudo cargar el reproductor. Puedes reintentar o abrir el video en su fuente.</p>
          <button
            className="button secondary"
            onClick={() => {
              setStatus('loading');
              setAttempt((value) => value + 1);
            }}
          >
            Reintentar video
          </button>
        </div>
      )}
      <p>Video: {site.credit}. Reproducción manual en YouTube; requiere conexión.</p>
      <p>
        Si el proveedor bloquea la reproducción,{' '}
        <a href={site.watchUrl} target="_blank" rel="noreferrer">
          abrir video original ↗
        </a>
        .
      </p>
      <a href={site.sourceUrl} target="_blank" rel="noreferrer">
        Consultar la misión en su fuente oficial ↗
      </a>
    </section>
  );
}
