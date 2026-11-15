import { Icon, type IconName } from '@/ui/Icon';
import { navigation } from '../constants';
import type { MissionSection } from '../types';
import styles from './mission-navigation.module.css';

const primarySections = new Set<MissionSection>(['crew', 'journal']);

export function MissionNavigationDock({
  section,
  onOpenExplorer,
  onNavigate,
}: {
  section: MissionSection | 'explorer' | 'earth';
  onOpenExplorer?(): void;
  onNavigate(section: MissionSection): void;
}) {
  const mapActive = section === 'explorer' || section === 'earth';

  function sectionButton(item: (typeof navigation)[number]) {
    return (
      <button
        type="button"
        key={item.id}
        className={styles.item}
        id={`assistant-target-${item.id}`}
        aria-current={section === item.id ? 'page' : undefined}
        onClick={() => onNavigate(item.id)}
      >
        <Icon name={item.icon as IconName} size={24} />
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <nav className={styles.dock} aria-label="Navegación principal">
      <div className={styles.track}>
        {navigation.filter((item) => primarySections.has(item.id)).map(sectionButton)}
        {onOpenExplorer && (
          <button
            type="button"
            className={styles.item}
            id="assistant-target-map"
            aria-current={mapActive ? 'page' : undefined}
            onClick={onOpenExplorer}
          >
            <Icon name="dashboard" size={24} />
            <span>Mapa espacial</span>
          </button>
        )}
        {navigation.filter((item) => item.id === 'simulation').map(sectionButton)}
      </div>
    </nav>
  );
}
