import type { ZoneData } from '../../features/mission/types';
import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';
export function EnvironmentPanel({
  habitatLabel = 'Nave',
  zone,
  zones,
  onSelect,
}: {
  habitatLabel?: string;
  zone: ZoneData;
  zones: ZoneData[];
  onSelect(id: string): void;
}) {
  return (
    <Panel className="environment-panel">
      <div className="panel-heading">
        <Icon name="rocket" />
        <div>
          <h3>Entorno de la {habitatLabel.toLowerCase()}</h3>
          <p className="eyebrow">INSTANTÁNEA AMBIENTAL</p>
        </div>
      </div>
      <label className="sr-only" htmlFor="zone-picker">
        Zona de la {habitatLabel.toLowerCase()}
      </label>
      <select
        id="zone-picker"
        className="zone-select"
        value={zone.id}
        onChange={(event) => onSelect(event.target.value)}
      >
        {zones.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <div className="environment-readings">
        {zone.readings.map((reading) => (
          <div key={reading.label}>
            <span>{reading.label}</span>
            <strong>
              {reading.value}
              <small>{reading.unit}</small>
            </strong>
          </div>
        ))}
      </div>
      <p className="zone-occupant">
        <span className="status-dot" />
        {zone.occupants}
      </p>
    </Panel>
  );
}
