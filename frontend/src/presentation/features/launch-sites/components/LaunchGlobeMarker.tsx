import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useRef } from 'react';
import type { LaunchSiteData } from '../types';

export function LaunchGlobeMarker({
  places,
  selected,
  expanded,
  onToggle,
  onClose,
  onSelect,
}: {
  places: LaunchSiteData[];
  selected: LaunchSiteData | null;
  expanded: boolean;
  onToggle(): void;
  onClose(): void;
  onSelect(id: string): void;
}) {
  const t = useTranslation();
  const trigger = useRef<HTMLButtonElement>(null);
  const place = places.find((item) => item.id === selected?.id) ?? places[0];
  const grouped = places.length > 1;
  const active = selected?.id === place.id;
  const groupId = `globe-group-${places[0].id}`;
  return (
    <div
      className={`launch-marker-group ${expanded ? 'is-expanded' : ''} ${place.longitude < -100 ? 'is-west' : ''}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && expanded) {
          event.stopPropagation();
          onClose();
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        className={`launch-marker ${active ? 'is-selected' : ''} ${place.kind === 'launch-site' ? '' : 'is-center'}`}
        aria-label={t(
          grouped
            ? `Explorar lugares cercanos: ${places.map((item) => item.name).join(', ')}`
            : `${place.kind === 'launch-site' ? 'Seleccionar punto de despegue' : 'Seleccionar sede NASA'} ${place.name}`,
        )}
        aria-pressed={active}
        aria-expanded={grouped ? expanded : undefined}
        aria-controls={grouped ? groupId : 'launch-place-card'}
        title={t(place.fullName)}
        onClick={() => (grouped ? onToggle() : onSelect(place.id))}
      >
        <span aria-hidden="true">{t(grouped ? places.length : place.symbol)}</span>
        <small>
          {t(
            active
              ? place.fullName
              : grouped
                ? places.map((item) => item.name).join(' / ')
                : place.fullName,
          )}
        </small>
      </button>
      {grouped && expanded && (
        <div
          id={groupId}
          className="launch-cluster-menu"
          role="group"
          aria-label={t('Elegir lugar cercano')}
        >
          <p>{t('Lugares cercanos · Elige una ubicación')}</p>
          {places.map((item) => (
            <button
              key={item.id}
              aria-pressed={selected?.id === item.id}
              onClick={() => {
                onClose();
                onSelect(item.id);
              }}
            >
              <span aria-hidden="true">{t(item.symbol)}</span> {t(item.fullName)}
              <small>{t(item.category)}</small>
              <small>
                {t('▶ Video de despegue: ')}
                {t(item.mission)}
              </small>
            </button>
          ))}
          <button
            onClick={() => {
              onClose();
              trigger.current?.focus();
            }}
          >
            {t('Cerrar lugares cercanos')}
          </button>
        </div>
      )}
    </div>
  );
}
