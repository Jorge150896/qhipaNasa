import { useCallback, useContext, type ReactNode } from 'react';
import { AssistantActionsContext } from '../../mission-assistant/AssistantActionsContext';
import { navigation } from '../constants';
import type { MissionSection } from '../types';
import { Icon, type IconName } from '@/ui/Icon';
import './mission-background.css';
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
  onOpenEarth?(): void;
  onNavigate(section: MissionSection): void;
  pendingCount?: string;
  children: ReactNode;
}) {
  const setLauncherHost = useContext(AssistantActionsContext)?.setLauncherHost;
  const attachLauncher = useCallback(
    (host: HTMLDivElement | null) => setLauncherHost?.(host),
    [setLauncherHost],
  );
  return (
    <div
      className={section === 'overview' ? 'app-shell overview-shell' : 'app-shell'}
      data-mission-section={section}
    >
      {section !== 'explorer' && section !== 'earth' && (
        <div className="mission-background" aria-hidden="true">
          <span className="mission-background__nebula" />
          <span className="mission-background__distant" />
          <span className="mission-background__near" />
        </div>
      )}
      <a className="skip-link" href="#mission-content">
        Ir al contenido
      </a>
      <aside className="sidebar">
        <div className="brand">
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
        <div className="mission-marker">
          <span className="status-dot" />
          <span>{missionName}</span>
          <span className="mono">SIM</span>
        </div>
        <p className="nav-label">EXPLORAR</p>
        <nav aria-label="Navegación principal">
          {onOpenExplorer && (
            <button
              id="assistant-target-map"
              aria-current={section === 'explorer' ? 'page' : undefined}
              onClick={onOpenExplorer}
            >
              <Icon name="dashboard" />
              <span>Mapa espacial</span>
            </button>
          )}
          {onOpenEarth && (
            <button aria-current={section === 'earth' ? 'page' : undefined} onClick={onOpenEarth}>
              <Icon name="earth" />
              <span>Tierra</span>
            </button>
          )}
          {navigation.map((item) => (
            <button
              key={item.id}
              id={`assistant-target-${item.id}`}
              aria-current={section === item.id ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <Icon name={item.icon as IconName} />
              <span>
                {item.id === 'habitat' &&
                section !== 'explorer' &&
                section !== 'earth' &&
                missionName !== 'Odyssey 01'
                  ? 'Entorno del hábitat'
                  : item.label}
              </span>
              {item.id === 'observations' && pendingCount !== '0' && (
                <span className="nav-count">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Icon name="shield" />
          <div>
            Entorno de demostración<span>Sin datos clínicos reales</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
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
              Datos simulados
            </span>
            <span className="avatar small">MC</span>
            {setLauncherHost && <div ref={attachLauncher} className="assistant-launcher-host" />}
          </div>
        </header>
        <main id="mission-content">{children}</main>
        <footer className="app-footer">
          <span>Qhipa Pacha · Prototipo de monitorización de salud</span>
          <span>Java API e IA · integración pendiente</span>
        </footer>
      </div>
    </div>
  );
}
