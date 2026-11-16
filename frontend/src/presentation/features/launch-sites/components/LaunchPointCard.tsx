import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { CSSProperties } from 'react';
import type { LaunchSiteData } from '../types';

const offsets: Record<string, [number, number]> = {
  vandenberg: [-200, -150],
  jpl: [-200, 190],
  johnson: [-220, 30],
  marshall: [-230, -80],
  kennedy: [65, 45],
  'nasa-hq': [65, -220],
  goddard: [65, -100],
  kourou: [100, 30],
};

/** Compact labels remain independent of the selected place's single video player. */
export function LaunchPointCard({
  site,
  active,
  onSelect,
}: {
  site: LaunchSiteData;
  active: boolean;
  onSelect(id: string): void;
}) {
  const t = useTranslation();
  const [x, y] = offsets[site.id] ?? [60, 0];
  return (
    <div
      className="launch-point"
      style={{ '--label-x': `${x}px`, '--label-y': `${y}px` } as CSSProperties}
    >
      <span
        className={`launch-point-dot ${site.kind === 'launch-site' ? '' : 'is-center'}`}
        aria-hidden="true"
      >
        {t(site.symbol)}
      </span>
      <svg className="launch-point-leader" aria-hidden="true">
        <line x1="0" y1="0" x2={x + (x < 0 ? 160 : 0)} y2={y + 24} />
      </svg>
      <button
        className="launch-point-card"
        aria-pressed={active}
        aria-controls="launch-place-card"
        aria-label={t(
          `${site.kind === 'launch-site' ? 'Seleccionar punto de despegue' : 'Seleccionar sede NASA'} ${site.name}`,
        )}
        onClick={() => onSelect(site.id)}
      >
        <strong>{site.fullName}</strong>
      </button>
    </div>
  );
}
