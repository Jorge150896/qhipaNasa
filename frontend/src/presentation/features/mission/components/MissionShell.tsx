import { useCallback, useContext, useEffect, type ReactNode } from 'react';
import { AssistantActionsContext } from '../../mission-assistant/AssistantActionsContext';
import type { MissionSection } from '../types';
import { Icon } from '@/ui/Icon';
import { SpaceBackground } from '@/presentation/shared/space/SpaceBackground';
import { MissionNavigationDock } from './MissionNavigationDock';
import styles from './mission-navigation.module.css';
export function MissionShell({
  section,
  onNavigate,
  pendingCount = '0',
  missionName = 'Odyssey 01',
  onOpenExplorer,
  onOpenEarth,
  children,
}: {
  section: MissionSection | 'explorer' | 'earth';
  missionName?: string;
  onOpenExplorer?(): void;
  onOpenEarth(): void;
  onNavigate(section: MissionSection): void;
  pendingCount?: string;
  children: ReactNode;
}) {
  const assistant = useContext(AssistantActionsContext);
  const setLauncherHost = assistant?.setLauncherHost;
  const setSection = assistant?.setSection;
  useEffect(() => {
    setSection?.(section === 'explorer' ? 'map' : section);
  }, [setSection, section]);
  const attachLauncher = useCallback(
    (host: HTMLDivElement | null) => setLauncherHost?.(host),
    [setLauncherHost],
  );
  return (
    <div
      data-navigation-layout="dock"
      className={`app-shell ${styles.shell} mission-console-shell ${section === 'overview' ? 'overview-shell' : ''}`}
      data-assistant-section={section === 'explorer' ? 'map' : section}
    >
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
                ? 'Tierra'
                : section === 'explorer'
                  ? 'Explorador espacial'
                  : 'Centro de control'}
            </span>
          </div>
          <div className="topbar-status">
            <span className="demo-badge">
              <span className="status-dot" />
              {section === 'monitoring' ? 'Origen indicado en la sesión' : 'Datos simulados'}
            </span>
            <span className="avatar small">MC</span>
          </div>
        </header>
        <main
          id="mission-content"
          data-assistant-control={section === 'explorer' ? 'map' : section}
        >
          {children}
        </main>
        <footer className="app-footer">
          <span>Qhipa Pacha · Prototipo de monitorización de salud</span>
          <span>API configurable · proveedor e IA pendientes</span>
        </footer>
      </div>
      <MissionNavigationDock
        section={section}
        missionName={missionName}
        pendingCount={pendingCount}
        onOpenExplorer={onOpenExplorer}
        onOpenEarth={onOpenEarth}
        onNavigate={onNavigate}
        launcherHostRef={setLauncherHost ? attachLauncher : undefined}
      />
    </div>
  );
}
