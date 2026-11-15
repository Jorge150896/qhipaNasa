import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from '@/ui/Icon';
import { navigation } from '../constants';
import type { MissionSection } from '../types';
import styles from './mission-navigation.module.css';

const primarySections = new Set<MissionSection>(['crew', 'journal']);
const secondaryNavigation = navigation.filter((item) => !primarySections.has(item.id));

export function MissionNavigationDock({
  section,
  onOpenExplorer,
  onNavigate,
  launcherHostRef,
}: {
  section: MissionSection | 'explorer' | 'earth';
  launcherHostRef?(host: HTMLDivElement | null): void;
  onOpenExplorer?(): void;
  onNavigate(section: MissionSection): void;
}) {
  const [expanded, setExpanded] = useState(false);
  const dock = useRef<HTMLElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const mapActive = section === 'explorer' || section === 'earth';
  const currentInOverflow = secondaryNavigation.some((item) => item.id === section);

  useEffect(() => {
    if (!expanded) return;
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !dock.current?.contains(event.target)) {
        setExpanded(false);
      }
    }
    window.addEventListener('pointerdown', dismiss);
    return () => window.removeEventListener('pointerdown', dismiss);
  }, [expanded]);

  function select(action: () => void) {
    if (expanded) {
      setExpanded(false);
      more.current?.focus();
    }
    action();
  }

  function sectionButton(item: (typeof navigation)[number]) {
    return (
      <button
        type="button"
        key={item.id}
        className={styles.item}
        id={`assistant-target-${item.id}`}
        aria-current={section === item.id ? 'page' : undefined}
        onClick={() => select(() => onNavigate(item.id))}
      >
        <Icon name={item.icon as IconName} size={24} />
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <nav
      ref={dock}
      className={styles.dock}
      aria-label="Navegación principal"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && expanded) {
          event.preventDefault();
          setExpanded(false);
          more.current?.focus();
        }
      }}
    >
      <div className={styles.track}>
        {onOpenExplorer && (
          <button
            type="button"
            className={styles.item}
            id="assistant-target-map"
            aria-current={mapActive ? 'page' : undefined}
            onClick={() => select(onOpenExplorer)}
          >
            <Icon name="dashboard" size={24} />
            <span>Mapa espacial</span>
          </button>
        )}
        {navigation.filter((item) => primarySections.has(item.id)).map(sectionButton)}
        <button
          type="button"
          ref={more}
          id="mission-dock-more"
          className={`${styles.item} ${styles.more}`}
          aria-expanded={expanded}
          aria-controls="mission-dock-secondary"
          data-current={currentInOverflow || undefined}
          onClick={() => setExpanded((open) => !open)}
        >
          <Icon name="more" size={24} />
          <span>Más</span>
        </button>
        <div
          id="mission-dock-secondary"
          className={styles.secondary}
          data-open={expanded}
          role="group"
          aria-label="Más secciones"
        >
          {secondaryNavigation.map(sectionButton)}
        </div>
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
