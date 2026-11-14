import { Html } from '@react-three/drei';
import type { RefObject } from 'react';
import { Icon } from '@/ui/Icon';

export interface HabitatModuleMarkers {
  occupiedId: string;
  zones: readonly { id: string; name: string; shortName: string }[];
}

export function HabitatZoneMarker({
  id,
  code,
  position,
  selectedZone,
  onSelectZone,
  portal,
  modules,
  showCode = false,
}: {
  id: string;
  code: string;
  position: [number, number, number];
  selectedZone: string;
  onSelectZone(id: string): void;
  portal: RefObject<HTMLElement>;
  modules?: HabitatModuleMarkers;
  showCode?: boolean;
}) {
  const selected = selectedZone === id;
  const occupied = modules?.occupiedId === id;
  const zone = modules?.zones.find((zone) => zone.id === id);
  return (
    <Html
      portal={portal}
      position={position}
      center
      zIndexRange={[20, 0]}
      style={{ pointerEvents: 'auto' }}
    >
      <button
        type="button"
        className={`scene-hotspot${modules ? ' crew-module-marker' : ''}${showCode ? ' shuttle-marker' : ''}`}
        aria-label={zone ? `Explorar ${zone.name}` : `Seleccionar zona ${code}`}
        aria-pressed={selected}
        aria-describedby={occupied ? 'crew-location-legend' : undefined}
        data-occupied={occupied || undefined}
        onClick={() => onSelectZone(id)}
      >
        {occupied && (
          <span className="crew-marker-occupancy" aria-hidden="true">
            <Icon name="users" size={13} />
          </span>
        )}
        {modules && selected && (
          <span className="crew-marker-selection" aria-hidden="true">
            <Icon name="check" size={12} />
          </span>
        )}
        {showCode && <span className="shuttle-marker-code">{code}</span>}
        {zone ? <span className="crew-marker-name">{zone.shortName}</span> : code}
      </button>
    </Html>
  );
}
