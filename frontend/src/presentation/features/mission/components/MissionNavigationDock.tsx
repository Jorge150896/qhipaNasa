'use client';
import { useEffect, useRef } from 'react';
import { Icon, type IconName } from '@/ui/Icon';
import { navigation } from '../constants';
import type { MissionSection } from '../types';
import styles from './mission-navigation.module.css';

export function MissionNavigationDock({
  section,
  missionName,
  pendingCount,
  onOpenExplorer,
  onOpenEarth,
  onNavigate,
  launcherHostRef,
}: {
  section: MissionSection | 'explorer' | 'earth';
  missionName: string;
  pendingCount: string;
  launcherHostRef?(host: HTMLDivElement | null): void;
  onOpenExplorer?(): void;
  onOpenEarth(): void;
  onNavigate(section: MissionSection): void;
}) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = track.current;
    const active = container?.querySelector<HTMLButtonElement>('[aria-current="page"]');
    if (container && active && container.scrollWidth > container.clientWidth) {
      container.scrollLeft = active.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2;
    }
  }, [section]);
  return (
    <nav
      className={styles.dock}
      aria-label="Navegación principal"
      aria-describedby="mission-dock-help"
    >
      <p id="mission-dock-help" className="sr-only">
        En pantallas pequeñas puedes desplazar esta barra horizontalmente para ver todas las
        secciones.
      </p>
      <div className={styles.track} ref={track}>
        {onOpenExplorer && (
          <button
            className={styles.item}
            id="assistant-target-map"
            aria-current={section === 'explorer' ? 'page' : undefined}
            onClick={onOpenExplorer}
          >
            <Icon name="dashboard" size={25} />
            <span>Mapa espacial</span>
          </button>
        )}
        <button
          className={styles.item}
          aria-label="Tierra"
          id="assistant-target-earth"
          aria-current={section === 'earth' ? 'page' : undefined}
          onClick={onOpenEarth}
        >
          <Icon name="earth" size={25} />
          <span>Tierra</span>
        </button>
        {navigation.map((item) => {
          const label =
            item.id === 'habitat' &&
            section !== 'explorer' &&
            section !== 'earth' &&
            missionName !== 'Odyssey 01'
              ? 'Entorno del hábitat'
              : item.label;
          return (
            <button
              key={item.id}
              className={styles.item}
              id={`assistant-target-${item.id}`}
              aria-current={section === item.id ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
              title={label}
            >
              <span className={styles.icon}>
                <Icon name={item.icon as IconName} size={25} />
                {item.id === 'observations' && pendingCount !== '0' && (
                  <span className={styles.count}>{pendingCount}</span>
                )}
              </span>
              <span className={styles.label}>{label}</span>
            </button>
          );
        })}
        {launcherHostRef && (
          <div
            ref={launcherHostRef}
            className={`assistant-launcher-host ${styles.assistantItem}`}
          />
        )}
      </div>
    </nav>
  );
}
