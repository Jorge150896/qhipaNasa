import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { Icon, type IconName } from '@/ui/Icon';
import { useEffect, useRef } from 'react';
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
  const t = useTranslation();
  const mapActive = section === 'explorer' || section === 'earth';
  const dock = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = dock.current;
    if (!element) return;
    const root = document.documentElement;
    const update = () => {
      root.style.setProperty(
        '--mission-dock-height',
        `${element.getBoundingClientRect().height}px`,
      );
    };
    const observer = new ResizeObserver(update);
    update();
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--mission-dock-height');
    };
  }, []);

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
        <span>{t(item.label)}</span>
      </button>
    );
  }

  return (
    <nav ref={dock} className={styles.dock} aria-label={t('Navegación principal')}>
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
            <span>{t('Mapa espacial')}</span>
          </button>
        )}
        {navigation.filter((item) => item.id === 'simulation').map(sectionButton)}
      </div>
    </nav>
  );
}
