import { TumiHead } from './TumiHead';
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
  return (
    <section
      className={`tumi-loader tumi-loader--${variant}`}
      data-variant={variant}
      data-paused={paused}
      aria-label="Cargando Qhipa Pacha"
      aria-busy={busy}
    >
      {variant === 'fullscreen' && <SpaceBackground paused={paused} />}
      <div className="tumi-loader-content">
        <p className="tumi-loader-brand">
          QHIPA <strong>PACHA</strong>
        </p>
        <div className="tumi-loader-stage">
          <div className="tumi-loader-halo" aria-hidden="true" />
          <TumiHead />
        </div>
        <div className="tumi-loader-spinner" aria-hidden="true" />
        <div role="status" className="tumi-loader-message">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className="tumi-loader-caption">BIENESTAR SIN FRONTERAS</span>
      </div>
    </section>
  );
}
