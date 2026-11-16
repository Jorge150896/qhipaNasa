import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { LanguageSelect } from '@/presentation/shared/language/LanguageSelect';
import { useId, type PointerEvent } from 'react';
import { ExternalLink } from 'lucide-react';
import { TumiTechPortrait } from '@/presentation/shared/tumi/TumiTechPortrait';
import { Icon } from '@/ui/Icon';
import type { LandingViewProps } from '../types';
import { SpaceAtmosphere } from './SpaceAtmosphere';
import { TumiFlight } from './TumiFlight';

export function LandingView({
  motionActive,
  logoRevision,
  onReplayLogo,
  onOpenMission,
}: LandingViewProps) {
  const t = useTranslation();
  const brandPortraitId = useId();
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
        {t('Ir al contenido')}
      </a>
      <SpaceAtmosphere paused={!motionActive} />
      <header className="qhipa-header">
        <button
          className="qhipa-brand"
          onClick={onReplayLogo}
          aria-label={t('Animar logo de Nami')}
        >
          <span key={logoRevision} className="qhipa-brand-bounce">
            <span className="qhipa-brand-mark" aria-hidden="true">
              <TumiTechPortrait id={brandPortraitId} emotion="wink" />
            </span>
            <span className="qhipa-wordmark">
              NAMI
              <small>{t('BIENESTAR SIN FRONTERAS')}</small>
            </span>
          </span>
        </button>
        <div className="qhipa-header-actions">
          <a className="qhipa-repository" href="https://github.com/Jorge150896/qhipaNasa">
            GitHub <ExternalLink size={14} aria-hidden="true" />
          </a>
          <LanguageSelect />
        </div>
      </header>
      <section className="qhipa-hero" id="qhipa-content" aria-labelledby="qhipa-title">
        <div className="qhipa-hero-copy">
          <p className="qhipa-eyebrow">
            <span />
            {t(' CONECTA CONTIGO. EXPLORA MÁS LEJOS.')}
          </p>
          <h1 id="qhipa-title">
            {t('Tu bienestar,')}
            <br />
            {t('en otra')} <em>{t('órbita.')}</em>
          </h1>
          <p className="qhipa-description">
            {t(
              'Un universo por descubrir empieza contigo. Explora tu salud, comprende tus señales y acompaña cada paso de tu misión.',
            )}
          </p>
          <div className="qhipa-cta-row">
            <button className="qhipa-cta" onClick={onOpenMission}>
              <span>{t('Iniciar mi misión')}</span>
              <Icon name="arrow" size={21} />
            </button>
          </div>
        </div>
        <TumiFlight motionActive={motionActive} />
      </section>
      <footer className="qhipa-footer">
        <span>
          QHIPA PACHA <span className="qhipa-footer-divider">/</span>
          {t(' HUMANOS, INCLUSO ENTRE ESTRELLAS.')}
        </span>
      </footer>
    </main>
  );
}
