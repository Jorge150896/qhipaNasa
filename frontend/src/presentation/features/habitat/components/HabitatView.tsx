import type { ReactNode } from 'react';
import { Icon } from '@/ui/Icon';
import type { HabitatData } from '../types';
import { RadLabReference } from './RadLabReference';

export function HabitatView({
  data,
  scene,
  archive,
  onSelectZone,
  onOpenCrew,
  onSelectCrew,
  onOpenCheck,
}: {
  data: HabitatData;
  scene: ReactNode;
  archive: ReactNode;
  onSelectZone(id: string): void;
  onOpenCrew(id: string): void;
  onSelectCrew(id: string): void;
  onOpenCheck(): void;
}) {
  return (
    <>
      <section
        className="habitat-layout"
        aria-label="Explorador de módulos"
        id="occupied-module"
        tabIndex={-1}
      >
        <div className="scene-panel habitat-scene">
          <div className="scene-panel-header">
            <h2>{data.name}</h2>
            <span id="crew-location-legend">Ubicación del tripulante seleccionado</span>
          </div>
          {scene}
          <p className="scene-caption">Arrastra para girar · Acerca para inspeccionar</p>
        </div>
        <div className="habitat-inspector panel">
          <div className="habitat-picker" role="group" aria-label="Módulos del hábitat">
            {data.zones.map((zone) => (
              <button
                key={zone.id}
                className="button secondary"
                type="button"
                aria-pressed={zone.id === data.zone.id}
                aria-label={zone.name}
                onClick={() => onSelectZone(zone.id)}
              >
                {zone.shortName}
              </button>
            ))}
          </div>
          <div aria-live="polite">
            <h2>{data.zone.name}</h2>
            <p className="sub">{data.zone.description}</p>
            <p className="sub">Instantánea simulada · {data.timestamp}</p>
            <dl className="crew-module-readings">
              {data.zone.readings.map((reading) => (
                <div key={reading.label}>
                  <dt>{reading.label}</dt>
                  <dd>
                    {reading.value} <small>{reading.unit}</small>
                  </dd>
                </div>
              ))}
            </dl>
            <h3>Tripulación en este módulo</h3>
            {data.occupants.length ? (
              <ul className="habitat-occupants">
                {data.occupants.map((person) => (
                  <li key={person.id}>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => onOpenCrew(person.id)}
                    >
                      {person.name}
                      <Icon name="arrow" size={14} />
                    </button>
                    <span>{person.activity}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sub">Sin tripulantes en esta instantánea</p>
            )}
          </div>
        </div>
      </section>
      <section className="panel cabin-history" aria-labelledby="habitat-crew-context">
        <div className="cabin-simulation-header">
          <div>
            <h2 id="habitat-crew-context">Salud en el entorno de misión</h2>
            <p className="sub">Simulación · {data.timestamp}</p>
          </div>
          <label className="cabin-person">
            Tripulante
            <select
              value={data.simulated.person.id}
              onChange={(event) => onSelectCrew(event.currentTarget.value)}
            >
              {data.crew.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p>
          {data.simulated.person.activity} ·{' '}
          {data.simulated.zone?.name ?? data.simulated.person.location}
        </p>
        <dl className="crew-module-readings">
          {data.simulated.metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>
                {metric.value} {metric.value !== '—' && <small>{metric.unit}</small>}
              </dd>
              <dd className="sub">{metric.quality}</dd>
              {metric.change && <dd className="sub">{metric.change}</dd>}
            </div>
          ))}
        </dl>
        {data.simulated.zone && data.simulated.zone.id !== data.zone.id && (
          <p className="sub">
            Ambiente simulado en {data.simulated.zone.name} ·{' '}
            {data.simulated.zone.readings
              .map((reading) => `${reading.label} ${reading.value} ${reading.unit}`)
              .join(' · ')}
          </p>
        )}
        <button className="button primary" type="button" onClick={onOpenCheck}>
          Registrar cómo me siento
        </button>
      </section>
      {archive}
      <RadLabReference />
    </>
  );
}
