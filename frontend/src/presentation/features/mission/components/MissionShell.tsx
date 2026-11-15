import { useCallback, useContext, type ReactNode } from 'react';
import { AssistantActionsContext } from '../../mission-assistant/AssistantActionsContext';
import { navigation } from '../constants';
import type { MissionSection } from '../types';
import { Icon } from '@/ui/Icon';
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
  const setLauncherHost = useContext(AssistantActionsContext)?.setLauncherHost;
  const attachLauncher = useCallback(
    (host: HTMLDivElement | null) => setLauncherHost?.(host),
    [setLauncherHost],
  );
  return (
    <div className={`app-shell ${styles.shell}`} data-navigation-layout="dock">
      <SpaceBackground />
      <a className="skip-link" href="#mission-content">
        Ir al contenido
      </a>
      <div className="workspace">
        <header className="topbar">
          <div className={`brand ${styles.brand}`}>
            <span className="brand-symbol">
              <Icon name="orbit" size={27} />
            </span>
            <div>
              <div className="brand-name">
                QHIPA <strong>PACHA</strong>
              </div>
              <small>BIENESTAR SIN FRONTERAS</small>
            </div>
          </div>

          <div className="breadcrumb">
            {missionName} <Icon name="chevron" size={13} />
            <span>
              {section === 'earth'
                ? 'Centros en Tierra'
                : section === 'explorer'
                  ? 'Explorador espacial'
                  : section === 'sources'
                    ? 'Fuentes y alcance'
                    : navigation.find((item) => item.id === section)?.label}
            </span>
          </div>
          <div className="topbar-status">
            {section !== 'earth' && (
              <span className="demo-badge">
                <span className="status-dot" />
                {section === 'explorer' ? 'Simulación y archivo histórico' : 'Datos simulados'}
              </span>
            )}
            <span className="avatar small">MC</span>
            {setLauncherHost && <div ref={attachLauncher} className="assistant-launcher-host" />}
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
