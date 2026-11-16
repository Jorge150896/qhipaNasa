import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { Icon } from '@/ui/Icon';
import type { CrewModuleData, CrewModuleOrigin } from '../types';

const originLabels = {
  record: 'Autorregistro local',
  snapshot: 'Instantánea de misión simulada',
  sample: 'Muestra simulada',
} as const;

export function CrewModuleOriginBanner({ origin }: { origin: CrewModuleOrigin }) {
  const t = useTranslation();
  return (
    <div
      className="crew-module-origin"
      role="region"
      aria-label={t('Origen en la línea de tiempo')}
    >
      <Icon name="clock" size={18} />
      <div>
        <p>
          {t(originLabels[origin.kind])} · {t(origin.date)}
        </p>
        <strong>{t(origin.title)}</strong>
        <p>
          {t(origin.kind === 'record' ? 'Módulo reportado' : 'Módulo de ese momento')} ·{t(' ')}
          {t(origin.zone.name)}
        </p>
      </div>
    </div>
  );
}

export function CrewModuleLegend() {
  const t = useTranslation();
  return (
    <ul className="crew-module-legend" aria-label={t('Leyenda del visor')}>
      <li>
        <Icon name="users" size={16} />
        <span id="crew-location-legend">{t('Ubicación del tripulante')}</span>
      </li>
      <li>
        <Icon name="check" size={16} />
        <span>{t('Módulo explorado')}</span>
      </li>
    </ul>
  );
}

export function CrewModulePanel({
  data,
  onSelectModule,
  onOpenOccupant,
  onOpenTimeline,
}: {
  data: CrewModuleData;
  onSelectModule(id: string): void;
  onOpenOccupant(id: string): void;
  onOpenTimeline(): void;
}) {
  const t = useTranslation();
  return (
    <aside className="crew-module-panel" aria-label={t('Contexto del módulo')}>
      {data.synchronizedMoment ? (
        <div className="crew-sync-status" role="status">
          <strong>{t(data.synchronizedMoment.date)}</strong>
          <p>
            {t(data.synchronizedMoment.title)} · {t(data.synchronizedMoment.value)}
          </p>
          <p>
            {t(
              data.synchronizedMoment.zone
                ? `${data.synchronizedMoment.activity ?? 'Actividad sin registrar'} · ${data.synchronizedMoment.zone.name}`
                : 'No hay ubicación ni lecturas ambientales registradas para esta hora.',
            )}
          </p>
        </div>
      ) : (
        <div className="crew-module-location">
          <Icon name="users" size={19} />
          <div>
            <p>{t('Ubicación del tripulante')}</p>
            <strong>{t(data.crewName)}</strong>
            <p>
              {t(data.crewLocation)} · {t(data.activity)}
            </p>
          </div>
          {!data.crewInSelectedModule && (
            <button
              className="text-button"
              type="button"
              onClick={() => onSelectModule(data.occupiedId)}
            >
              {t('Ir a su módulo')}
              <Icon name="arrow" size={14} />
            </button>
          )}
        </div>
      )}

      <div className="crew-module-picker" role="group" aria-label={t('Módulos disponibles')}>
        {data.zones.map((zone) => {
          const occupied = zone.id === data.occupiedId;
          const selected =
            zone.id ===
            (data.synchronizedMoment ? data.synchronizedMoment.zone?.id : data.selected.id);
          return (
            <button
              className="button secondary"
              key={zone.id}
              type="button"
              aria-label={t(`Ver ${zone.name}`)}
              aria-describedby={occupied ? 'crew-location-legend' : undefined}
              aria-pressed={selected}
              data-crew-location={occupied || undefined}
              onClick={() => onSelectModule(zone.id)}
            >
              {zone.code && <span aria-hidden="true">{t(zone.code)}</span>}
              {t(zone.shortName)}
              {occupied && <Icon name="users" size={14} className="crew-location-icon" />}
              {selected && <Icon name="check" size={14} className="crew-selection-icon" />}
            </button>
          );
        })}
      </div>

      <div className="crew-module-details" aria-live="polite">
        {(!data.synchronizedMoment || data.synchronizedMoment.zone) && (
          <>
            <p className="crew-module-selection-label">
              <Icon name="check" size={14} />
              {t('Módulo explorado')}
            </p>
            <h3>{t(data.selected.name)}</h3>
            <p className="crew-module-description">{t(data.selected.description)}</p>
            <p className="crew-module-time">
              {t('Instantánea de misión simulada · ')}
              {t(data.timestamp)}
            </p>
            <dl className="crew-module-readings">
              {data.selected.readings.map((reading) => (
                <div key={reading.label}>
                  <dt>{t(reading.label)}</dt>
                  <dd>
                    {t(reading.value)} <small>{t(reading.unit)}</small>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="crew-module-occupants">
              <Icon name="users" size={14} /> <strong>{t('Ocupantes')}</strong>
              {t(' ')}
              {t(!data.occupants.length && data.selected.occupants)}
            </p>
            {data.occupants.length > 0 && (
              <ul className="crew-module-occupant-list">
                {data.occupants.map((person) => (
                  <li key={person.id}>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => onOpenOccupant(person.id)}
                    >
                      {t(person.name)} <Icon name="arrow" size={14} />
                    </button>
                    <span>{t(person.activity)}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <button className="text-button" type="button" onClick={onOpenTimeline}>
          {t('Volver a la línea de tiempo')}
        </button>
      </div>
    </aside>
  );
}
