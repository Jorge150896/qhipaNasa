import type { PointerEvent } from 'react';
import { Icon } from '@/ui/Icon';
import type { LandingViewProps } from '../types';
import { SpaceAtmosphere } from './SpaceAtmosphere';
import { TumiFlight } from './TumiFlight';

export function LandingView({
  motionActive,
  paused,
  logoRevision,
  onToggleMotion,
  onReplayLogo,
  onOpenMission,
  onOpenExplorer,
  onOpenCrew,
}: LandingViewProps) {
  function moveAtmosphere(event: PointerEvent<HTMLElement>) {
    if (!motionActive || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      '--qhipa-pointer-x',
      `${((event.clientX - bounds.left) / bounds.width - 0.5) * 24}px`,
    );
    event.currentTarget.style.setProperty(
      '--qhipa-pointer-y',
      `${((event.clientY - bounds.top) / bounds.height - 0.5) * 16}px`,
    );
  }
  function resetAtmosphere(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty('--qhipa-pointer-x', '0px');
    event.currentTarget.style.setProperty('--qhipa-pointer-y', '0px');
  }
  return (
    <main
      className="qhipa-landing"
      id="inicio"
      data-motion={motionActive ? 'active' : 'paused'}
      onPointerMove={moveAtmosphere}
      onPointerLeave={resetAtmosphere}
    >
      <a className="qhipa-skip" href="#qhipa-content">
        Ir al contenido
      </a>
      <SpaceAtmosphere paused={!motionActive} />
      <header className="qhipa-header">
        <button
          className="qhipa-brand"
          onClick={onReplayLogo}
          aria-label="Animar logo de Qhipa Pacha"
        >
          <span key={logoRevision} className="qhipa-brand-bounce">
            <span className="qhipa-brand-mark" aria-hidden="true">
              <Icon name="orbit" size={31} />
            </span>
            <span className="qhipa-wordmark">
              QHIPA <strong>PACHA</strong>
              <small>BIENESTAR SIN FRONTERAS</small>
            </span>
          </span>
        </button>
        <nav className="qhipa-nav" aria-label="Navegación de portada">
          <button data-assistant-control="crew" onClick={onOpenCrew}>
            Tu bienestar
          </button>
          <button data-assistant-control="map" onClick={onOpenExplorer}>
            El universo <Icon name="arrow" size={14} />
          </button>
        </nav>
      </header>
      <section className="qhipa-hero" id="qhipa-content" aria-labelledby="qhipa-title">
        <div className="qhipa-hero-copy">
          <p className="qhipa-eyebrow">
            <span /> CONECTA CONTIGO. EXPLORA MÁS LEJOS.
          </p>
          <h1 id="qhipa-title">
            Tu bienestar,
            <br />
            en otra <em>órbita.</em>
          </h1>
          <p className="qhipa-description">
            Un universo por descubrir empieza contigo. Explora tu salud, comprende tus señales y
            acompaña cada paso de tu misión.
          </p>
          <div className="qhipa-cta-row">
            <button
              className="qhipa-cta"
              data-assistant-control="start-mission"
              onClick={onOpenMission}
            >
              <span>Iniciar mi misión</span>
              <Icon name="arrow" size={21} />
            </button>
            <button
              className="qhipa-secondary-cta"
              data-assistant-control="map"
              onClick={onOpenExplorer}
            >
              Explorar el universo <Icon name="orbit" size={16} />
            </button>
          </div>
          <div className="qhipa-mission-note">
            <span className="qhipa-note-line" />
            <span>
              Inspirado en la exploración.
              <br />
              <strong>Diseñado para las personas.</strong>
            </span>
          </div>
        </div>
        <TumiFlight />
      </section>
      <footer className="qhipa-footer">
        <span>
          QHIPA PACHA <span className="qhipa-footer-divider">/</span> HUMANOS, INCLUSO ENTRE
          ESTRELLAS.
        </span>
        <div>
          <span className="qhipa-demo-label">Demo · datos sintéticos</span>
          <button className="qhipa-motion-toggle" onClick={onToggleMotion} aria-pressed={paused}>
            <Icon name={paused ? 'orbit' : 'sliders'} size={14} />
            {paused ? 'Reanudar animación' : 'Pausar animación'}
          </button>
        </div>
      </footer>
    </main>
  );
}
