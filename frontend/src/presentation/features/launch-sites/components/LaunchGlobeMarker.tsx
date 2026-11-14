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
        aria-label={
          grouped
            ? `Explorar lugares cercanos: ${places.map((item) => item.name).join(', ')}`
            : `${place.kind === 'launch-site' ? 'Seleccionar punto de despegue' : 'Seleccionar sede NASA'} ${place.name}`
        }
        aria-pressed={active}
        aria-expanded={grouped ? expanded : undefined}
        aria-controls={grouped ? groupId : 'launch-place-card'}
        title={place.fullName}
        onClick={() => (grouped ? onToggle() : onSelect(place.id))}
      >
        <span aria-hidden="true">{grouped ? places.length : place.symbol}</span>
        <small>
          {active
            ? place.fullName
            : grouped
              ? places.map((item) => item.name).join(' / ')
              : place.fullName}
        </small>
      </button>
      {grouped && expanded && (
        <div
          id={groupId}
          className="launch-cluster-menu"
          role="group"
          aria-label="Elegir lugar cercano"
        >
          <p>Lugares cercanos · Elige una ubicación</p>
          {places.map((item) => (
            <button
              key={item.id}
              aria-pressed={selected?.id === item.id}
              onClick={() => {
                onClose();
                onSelect(item.id);
              }}
            >
              <span aria-hidden="true">{item.symbol}</span> {item.fullName}
              <small>{item.category}</small>
              <small>▶ Video de despegue: {item.mission}</small>
            </button>
          ))}
          <button
            onClick={() => {
              onClose();
              trigger.current?.focus();
            }}
          >
            Cerrar lugares cercanos
          </button>
        </div>
      )}
    </div>
  );
}
