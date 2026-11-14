import { Icon } from '@/ui/Icon';
import type { CrewModuleData, CrewModuleOrigin } from '../types';

const originLabels = {
  record: 'Autorregistro local',
  snapshot: 'Instantánea de misión simulada',
  sample: 'Muestra simulada',
} as const;

export function CrewModuleOriginBanner({ origin }: { origin: CrewModuleOrigin }) {
  return (
    <div className="crew-module-origin" role="region" aria-label="Origen en la línea de tiempo">
      <Icon name="clock" size={18} />
      <div>
        <p>
          {originLabels[origin.kind]} · {origin.date}
        </p>
        <strong>{origin.title}</strong>
        <p>
          {origin.kind === 'record' ? 'Módulo reportado' : 'Módulo de ese momento'} ·{' '}
          {origin.zone.name}
        </p>
      </div>
    </div>
  );
}

export function CrewModulePanel({
  data,
  onSelectModule,
  onOpenTimeline,
}: {
  data: CrewModuleData;
  onSelectModule(id: string): void;
  onOpenTimeline(): void;
}) {
  return (
    <aside className="crew-module-panel" aria-label="Contexto del módulo">
      <div className="crew-module-location">
        <Icon name="users" size={19} />
        <div>
          {data.origin && <p>Ubicación en la instantánea</p>}
          <strong>{data.crewName}</strong>
          <p>
            {data.crewLocation} · {data.activity}
          </p>
        </div>
        {!data.crewInSelectedModule && (
          <button
            className="text-button"
            type="button"
            onClick={() => onSelectModule(data.occupiedId)}
          >
            Ir a su módulo <Icon name="arrow" size={14} />
          </button>
        )}
      </div>

      <div className="crew-module-picker" role="group" aria-label="Módulos disponibles">
        {data.zones.map((zone) => (
          <button
            className="button secondary"
            key={zone.id}
            type="button"
            aria-label={`Ver ${zone.name}`}
            aria-pressed={zone.id === data.selected.id}
            onClick={() => onSelectModule(zone.id)}
          >
            {zone.code && <span aria-hidden="true">{zone.code}</span>}
            {zone.shortName}
          </button>
        ))}
      </div>

      <div className="crew-module-details" aria-live="polite">
        <p className="eyebrow">MÓDULO EXPLORADO</p>
        <h3>{data.selected.name}</h3>
        <p className="crew-module-description">{data.selected.description}</p>
        <p className="crew-module-time">Instantánea de misión simulada · {data.timestamp}</p>
        <dl className="crew-module-readings">
          {data.selected.readings.map((reading) => (
            <div key={reading.label}>
              <dt>{reading.label}</dt>
              <dd>
                {reading.value} <small>{reading.unit}</small>
              </dd>
            </div>
          ))}
        </dl>
        <p className="crew-module-occupants">
          <Icon name="users" size={14} /> <strong>Ocupantes</strong> {data.selected.occupants}
        </p>
        <button className="text-button" type="button" onClick={onOpenTimeline}>
          Volver a la línea de tiempo
        </button>
      </div>
    </aside>
  );
}
