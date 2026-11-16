import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useId } from 'react';
import { TumiTechPortrait } from '../tumi/TumiTechPortrait';
import { SpaceBackground } from '../space/SpaceBackground';
import './tumi-loader.css';

export function TumiLoader({
  title = 'Preparando tu misión',
  description = 'Un momento. Estamos conectando tu universo.',
  paused = false,
  busy = true,
  variant = 'content',
}: {
  title?: string;
  description?: string;
  paused?: boolean;
  busy?: boolean;
  variant?: 'fullscreen' | 'content';
}) {
  const t = useTranslation();
  const portraitId = useId();
  return (
    <section
      className={`tumi-loader tumi-loader--${variant}`}
      data-variant={variant}
      data-paused={paused}
      aria-label={t('Cargando Nami')}
      aria-busy={busy}
    >
      {variant === 'fullscreen' && <SpaceBackground paused={paused} />}
      <div className="tumi-loader-content">
        <p className="tumi-loader-brand">NAMI</p>
        <div className="tumi-loader-stage">
          <TumiTechPortrait
            id={portraitId}
            emotion="happy"
            motion="celebrate"
            paused={paused}
            decorative
          />
        </div>
        <div role="status" className="tumi-loader-message">
          <h1>{t(title)}</h1>
          <p>{t(description)}</p>
        </div>
        <span className="tumi-loader-caption">{t('BIENESTAR SIN FRONTERAS')}</span>
      </div>
    </section>
  );
}
