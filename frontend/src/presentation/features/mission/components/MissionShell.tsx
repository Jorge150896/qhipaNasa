import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { LanguageSelect } from '@/presentation/shared/language/LanguageSelect';
import { useId, type ReactNode } from 'react';
import { navigation } from '../constants';
import type { MissionSection } from '../types';
import { Icon } from '@/ui/Icon';
import { TumiTechPortrait } from '@/presentation/shared/tumi/TumiTechPortrait';
import { SpaceBackground } from '@/presentation/shared/space/SpaceBackground';
import { MissionNavigationDock } from './MissionNavigationDock';
import styles from './mission-navigation.module.css';

export function MissionShell({
  section,
  onNavigate,
  missionName = 'Odyssey 01',
  onOpenExplorer,
  children,
}: {
  section: MissionSection | 'explorer' | 'earth';
  missionName?: string;
  onOpenExplorer?(): void;
  onNavigate(section: MissionSection): void;
  children: ReactNode;
}) {
  const t = useTranslation();
  const brandPortraitId = useId();
  return (
    <div
      className={`app-shell ${styles.shell}`}
      data-navigation-layout="dock"
      data-mission-section={section}
    >
      <SpaceBackground />
      <a className="skip-link" href="#mission-content">
        {t('Ir al contenido')}
      </a>
      <div className="workspace">
        <header className="topbar">
          <div className={`brand ${styles.brand}`}>
            <span className={styles.brandMark} aria-hidden="true">
              <TumiTechPortrait id={brandPortraitId} emotion="wink" />
            </span>
            <div>
              <div className="brand-name">
                QHIPA <strong>PACHA</strong>
              </div>
              <small>{t('BIENESTAR SIN FRONTERAS')}</small>
            </div>
          </div>

          <div className="breadcrumb">
            {t(missionName)} <Icon name="chevron" size={13} />
            <span>
              {t(
                section === 'earth'
                  ? 'Centros en Tierra'
                  : section === 'explorer'
                    ? 'Explorador espacial'
                    : section === 'sources'
                      ? 'Fuentes y alcance'
                      : navigation.find((item) => item.id === section)?.label,
              )}
            </span>
          </div>
          <div className="topbar-status">
            {section !== 'earth' && (
              <span className="demo-badge">
                <span className="status-dot" />
                {t(section === 'explorer' ? 'Simulación y archivo histórico' : 'Datos simulados')}
              </span>
            )}
            <LanguageSelect />
            <span className="avatar small">MC</span>
          </div>
        </header>
        <main id="mission-content">{children}</main>
      </div>
      <MissionNavigationDock
        section={section}
        onOpenExplorer={onOpenExplorer}
        onNavigate={onNavigate}
      />
    </div>
  );
}
