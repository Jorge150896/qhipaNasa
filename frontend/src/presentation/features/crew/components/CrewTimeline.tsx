import { Icon } from '@/ui/Icon';
import type {
  ComparisonSlot,
  CrewModuleOrigin,
  CrewTimelineComparison,
  CrewTimelineData,
  CrewTimelineDetail,
} from '../types';

export function CrewTimeline({
  data,
  comparison,
  canCompare,
  onToggleComparison,
  onSelectComparisonSample,
  onSelectMoment,
  onOpenModule,
}: {
  data: CrewTimelineData;
  comparison?: CrewTimelineComparison;
  canCompare: boolean;
  onToggleComparison(): void;
  onSelectComparisonSample(slot: ComparisonSlot, at: string): void;
  onSelectMoment(id: string): void;
  onOpenModule(origin: CrewModuleOrigin): void;
}) {
  return (
    <section
      className="panel crew-timeline"
      id="crew-timeline"
      tabIndex={-1}
      aria-labelledby="crew-timeline-title"
    >
      <div className="crew-timeline-heading">
        <h3 id="crew-timeline-title">Línea de tiempo</h3>
        {canCompare && (
          <button
            type="button"
            className="button secondary"
            aria-expanded={Boolean(comparison)}
            onClick={onToggleComparison}
          >
            {comparison ? 'Cerrar comparación' : 'Comparar dos muestras'}
          </button>
        )}
      </div>
      {comparison ? (
        <TimelineComparison
          data={comparison}
          onSelectSample={onSelectComparisonSample}
          onOpenModule={onOpenModule}
        />
      ) : (
        <>
          <p className="sub">
            Elige un momento o una muestra de la gráfica para consultar su contexto.
          </p>
          <div className="crew-timeline-grid">
            <div>
              <ul className="crew-timeline-moments" aria-label="Momentos de la tripulación">
                {data.moments.map((moment) => (
                  <li key={moment.id}>
                    <button
                      type="button"
                      aria-pressed={data.activeMoment === moment.id}
                      onClick={() => onSelectMoment(moment.id)}
                    >
                      <time dateTime={moment.at}>{moment.date}</time>
                      <strong>{moment.title}</strong>
                      <span>{moment.source}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {data.status !== 'ready' && (
                <p className="sub" role="status">
                  {data.status === 'loading'
                    ? 'Consultando autorregistros…'
                    : 'Los autorregistros locales no están disponibles.'}
                </p>
              )}
            </div>
            <TimelineDetail detail={data.detail} onOpenModule={onOpenModule} />
          </div>
        </>
      )}
    </section>
  );
}

function TimelineDetail({
  detail,
  label = 'Detalle del momento',
  onOpenModule,
}: {
  detail: CrewTimelineDetail;
  label?: string;
  onOpenModule(origin: CrewModuleOrigin): void;
}) {
  const { zone } = detail;
  return (
    <div className="crew-timeline-detail" role="region" aria-label={label} aria-live="polite">
      <p className="crew-timeline-source">
        {detail.source} · <time dateTime={detail.at}>{detail.date}</time>
      </p>
      <h4>{detail.title}</h4>
      {detail.value && <p className="crew-timeline-value">{detail.value}</p>}
      {detail.note && <p className="crew-timeline-note">{detail.note}</p>}
      {(detail.activity || detail.duration || detail.zone) && (
        <dl className="crew-timeline-facts">
          {detail.activity && (
            <div>
              <dt>Actividad</dt>
              <dd>{detail.activity}</dd>
            </div>
          )}
          {detail.duration && (
            <div>
              <dt>Duración informada</dt>
              <dd>{detail.duration}</dd>
            </div>
          )}
          {detail.zone && (
            <div>
              <dt>Módulo</dt>
              <dd>{detail.zone.name}</dd>
            </div>
          )}
        </dl>
      )}
      {detail.readings && (
        <dl className="crew-module-readings" aria-label="Lecturas ambientales del momento">
          {detail.readings.map(({ label, value, unit }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                {value} <small>{unit}</small>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {detail.contextMessage && <p className="sub">{detail.contextMessage}</p>}
      {zone && (
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            onOpenModule({ kind: detail.kind, title: detail.title, date: detail.date, zone })
          }
        >
          <Icon name="rocket" size={15} />
          Ubicar módulo en el visor
        </button>
      )}
    </div>
  );
}

const comparisonLabels = { first: 'Primera muestra', second: 'Segunda muestra' } as const;

function TimelineComparison({
  data,
  onSelectSample,
  onOpenModule,
}: {
  data: CrewTimelineComparison;
  onSelectSample(slot: ComparisonSlot, at: string): void;
  onOpenModule(origin: CrewModuleOrigin): void;
}) {
  const { first, second } = data;
  return (
    <div className="crew-comparison" role="group" aria-label={`Comparación de ${data.label}`}>
      <p className="sub">Elige dos horas aquí o selecciona las muestras en la gráfica.</p>
      <div className="crew-comparison-grid">
        {(['first', 'second'] as const).map((slot) => {
          const other = slot === 'first' ? second : first;
          return (
            <label className="crew-comparison-select" key={slot}>
              {comparisonLabels[slot]}
              <select
                value={data[slot]?.at ?? ''}
                onChange={(event) => onSelectSample(slot, event.target.value)}
              >
                <option value="">Elige una hora</option>
                {data.options.map(({ at, label }) => (
                  <option key={at} value={at} disabled={at === other?.at}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>
      {first && second && (
        <p className="crew-comparison-difference" role="status">
          {data.difference ? (
            <>
              Diferencia de la segunda respecto a la primera <strong>{data.difference}</strong>
            </>
          ) : (
            'No se puede calcular la diferencia porque falta una lectura.'
          )}
        </p>
      )}
      {(first || second) && (
        <div className="crew-comparison-grid">
          {(['first', 'second'] as const).map((slot) => {
            const detail = data[slot];
            return (
              <div className="crew-comparison-column" key={slot}>
                {detail && (
                  <TimelineDetail
                    detail={detail}
                    label={comparisonLabels[slot]}
                    onOpenModule={onOpenModule}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
