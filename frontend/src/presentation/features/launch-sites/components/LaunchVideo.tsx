import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useEffect, useState } from 'react';
import type { LaunchSiteData } from '../types';

export function LaunchVideo({ site }: { site: LaunchSiteData }) {
  const t = useTranslation();
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
        <p className="eyebrow">{t('VIDEO DE DESPEGUE · ARCHIVO HISTÓRICO')}</p>
        <h3>{t(site.mission)}</h3>
        <p>{t(site.date)}</p>
        <p>
          <strong>{t('Despegue desde:')}</strong> {t(site.videoLocation)}
        </p>
      </header>
      {status !== 'error' && (
        <iframe
          key={attempt}
          src={site.embedUrl}
          title={t(`Video del lanzamiento de ${site.mission} desde ${site.videoLocation}`)}
          allow="encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
      {status === 'loading' && <p role="status">{t('Cargando reproductor externo…')}</p>}
      {status === 'error' && (
        <div role="alert">
          <p>
            {t(
              'No se pudo cargar el reproductor. Puedes reintentar o abrir el video en su fuente.',
            )}
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setStatus('loading');
              setAttempt((value) => value + 1);
            }}
          >
            {t('Reintentar video')}
          </button>
        </div>
      )}
      <p>
        {t('Video: ')}
        {t(site.credit)}
        {t('. Reproducción manual en YouTube; requiere conexión.')}
      </p>
      <p>
        {t('Si el proveedor bloquea la reproducción,')}
        {t(' ')}
        <a href={site.watchUrl} target="_blank" rel="noreferrer">
          {t('abrir video original ↗')}
        </a>
        .
      </p>
      <a href={site.sourceUrl} target="_blank" rel="noreferrer">
        {t('Consultar la misión en su fuente oficial ↗')}
      </a>
    </section>
  );
}
