import { useCallback, useContext, type ReactNode } from 'react';
import { AssistantActionsContext } from '../../mission-assistant/AssistantActionsContext';
import { navigation } from '../constants';
import type { MissionSection } from '../types';
import { Icon, type IconName } from '@/ui/Icon';
import { SpaceBackground } from '@/presentation/shared/space/SpaceBackground';
const primary = new Set<MissionSection>(['overview', 'monitoring', 'journal']);
export function MissionShell({
  section,
  onNavigate,
  pendingCount = '0',
  missionName = 'Odyssey 01',
  onOpenExplorer,
  children,
}: {
  section: MissionSection | 'explorer' | 'earth';
  missionName?: string;
  onOpenExplorer?(): void;
  onNavigate(section: MissionSection): void;
  pendingCount?: string;
  children: ReactNode;
}) {
  const setLauncherHost = useContext(AssistantActionsContext)?.setLauncherHost;
  const attachLauncher = useCallback(
    (host: HTMLDivElement | null) => setLauncherHost?.(host),
    [setLauncherHost],
  );
  function sectionButton(item: (typeof navigation)[number]) {
    return (
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
    );
  }
  return (
    <div className={section === 'overview' ? 'app-shell overview-shell' : 'app-shell'}>
      <SpaceBackground />
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
        <nav aria-label="Navegación principal">
          <div className="mission-nav-core" role="group" aria-label="Salud de la tripulación">
            {navigation.filter((item) => primary.has(item.id)).map(sectionButton)}
          </div>
          <div className="mission-nav-extra" role="group" aria-label="Explorar misión">
            <p className="nav-label">EXPLORAR MISIÓN</p>
            {onOpenExplorer && (
              <button
                id="assistant-target-map"
                aria-current={section === 'explorer' || section === 'earth' ? 'page' : undefined}
                onClick={onOpenExplorer}
              >
                <Icon name="dashboard" />
                <span>Mapa espacial</span>
              </button>
            )}
            {navigation.filter((item) => !primary.has(item.id)).map(sectionButton)}
          </div>
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
                  : navigation.find((item) => item.id === section)?.label}
            </span>
          </div>
          <div className="topbar-status">
            <span className="demo-badge">
              <span className="status-dot" />
              {section === 'earth'
                ? 'Archivo histórico'
                : section === 'explorer'
                  ? 'Simulación y archivo histórico'
                  : section === 'monitoring'
                    ? 'Origen indicado en la sesión'
                    : 'Datos simulados'}
            </span>
            <span className="avatar small">MC</span>
            {setLauncherHost && <div ref={attachLauncher} className="assistant-launcher-host" />}
          </div>
        </header>
        <main id="mission-content">{children}</main>
        <footer className="app-footer">
          <span>Qhipa Pacha · Prototipo de monitorización de salud</span>
          <span>API configurable · proveedor e IA pendientes</span>
        </footer>
      </div>
    </div>
  );
}
