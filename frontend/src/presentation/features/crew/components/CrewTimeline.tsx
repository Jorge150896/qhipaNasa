import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { ReactNode } from 'react';
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
  onAskTumi,
}: {
  data: CrewTimelineData;
  comparison?: CrewTimelineComparison;
  canCompare: boolean;
  onToggleComparison(): void;
  onSelectComparisonSample(slot: ComparisonSlot, at: string): void;
  onSelectMoment(id: string): void;
  onOpenModule(origin: CrewModuleOrigin): void;
  onAskTumi?(at: string, compareFrom?: string): void;
}) {
  const t = useTranslation();
  return (
    <section
      className="crew-timeline"
      id="crew-timeline"
      tabIndex={-1}
      aria-labelledby="crew-timeline-title"
    >
      <div className="crew-timeline-heading">
        <h3 id="crew-timeline-title">{t('Línea de tiempo')}</h3>
        {canCompare && (
          <button
            type="button"
            className="button secondary"
            id="assistant-target-compare"
            aria-expanded={Boolean(comparison)}
            onClick={onToggleComparison}
          >
            {t(comparison ? 'Cerrar comparación' : 'Comparar dos muestras')}
          </button>
        )}
      </div>
      {comparison ? (
        <TimelineComparison
          data={comparison}
          onSelectSample={onSelectComparisonSample}
          onOpenModule={onOpenModule}
          onAskTumi={onAskTumi}
        />
      ) : (
        <>
          <p className="sub">
            {t('Elige un momento o una muestra de la gráfica para consultar su contexto.')}
          </p>
          <div className="crew-timeline-grid">
            <div>
              <ul className="crew-timeline-moments" aria-label={t('Momentos de la tripulación')}>
                {data.moments.map((moment) => (
                  <li key={moment.id}>
                    <button
                      type="button"
                      aria-pressed={data.activeMoment === moment.id}
                      onClick={() => onSelectMoment(moment.id)}
                    >
                      <time dateTime={moment.at}>{t(moment.date)}</time>
                      <strong>{t(moment.title)}</strong>
                      <span>{t(moment.source)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {data.status !== 'ready' && (
                <p className="sub" role="status">
                  {t(
                    data.status === 'loading'
                      ? 'Consultando autorregistros…'
                      : 'Los autorregistros locales no están disponibles.',
                  )}
                </p>
              )}
            </div>
            <TimelineDetail detail={data.detail} onOpenModule={onOpenModule}>
              {data.detail.kind === 'sample' && onAskTumi && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => onAskTumi(data.detail.at)}
                >
                  {t('Preguntar a Nami por esta muestra')}
                </button>
              )}
            </TimelineDetail>
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
  children,
}: {
  detail: CrewTimelineDetail;
  label?: string;
  children?: ReactNode;
  onOpenModule(origin: CrewModuleOrigin): void;
}) {
  const t = useTranslation();
  const { zone } = detail;
  return (
    <div className="crew-timeline-detail" role="region" aria-label={t(label)} aria-live="polite">
      <p className="crew-timeline-source">
        {t(detail.source)} · <time dateTime={detail.at}>{t(detail.date)}</time>
      </p>
      <h4>{t(detail.title)}</h4>
      {detail.value && <p className="crew-timeline-value">{t(detail.value)}</p>}
      {detail.note && <p className="crew-timeline-note">{detail.note}</p>}
      {(detail.activity || detail.duration || detail.zone) && (
        <dl className="crew-timeline-facts">
          {detail.activity && (
            <div>
              <dt>{t('Actividad')}</dt>
              <dd>{t(detail.activity)}</dd>
            </div>
          )}
          {detail.duration && (
            <div>
              <dt>{t('Duración informada')}</dt>
              <dd>{t(detail.duration)}</dd>
            </div>
          )}
          {detail.zone && (
            <div>
              <dt>{t('Módulo')}</dt>
              <dd>{t(detail.zone.name)}</dd>
            </div>
          )}
        </dl>
      )}
      {detail.readings && (
        <dl className="crew-module-readings" aria-label={t('Lecturas ambientales del momento')}>
          {detail.readings.map(({ label, value, unit }) => (
            <div key={label}>
              <dt>{t(label)}</dt>
              <dd>
                {t(value)} <small>{t(unit)}</small>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {detail.contextMessage && <p className="sub">{t(detail.contextMessage)}</p>}
      {zone && (
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            onOpenModule({ kind: detail.kind, title: detail.title, date: detail.date, zone })
          }
        >
          <Icon name="rocket" size={15} />
          {t('Ubicar módulo en el visor')}
        </button>
      )}
      {children}
    </div>
  );
}

const comparisonLabels = { first: 'Primera muestra', second: 'Segunda muestra' } as const;

function TimelineComparison({
  data,
  onSelectSample,
  onOpenModule,
  onAskTumi,
}: {
  data: CrewTimelineComparison;
  onSelectSample(slot: ComparisonSlot, at: string): void;
  onOpenModule(origin: CrewModuleOrigin): void;
  onAskTumi?(at: string, compareFrom: string): void;
}) {
  const t = useTranslation();
  const { first, second } = data;
  return (
    <div className="crew-comparison" role="group" aria-label={t(`Comparación de ${data.label}`)}>
      <p className="sub">{t('Elige dos horas aquí o selecciona las muestras en la gráfica.')}</p>
      <div className="crew-comparison-grid">
        {(['first', 'second'] as const).map((slot) => {
          const other = slot === 'first' ? second : first;
          return (
            <label className="crew-comparison-select" key={slot}>
              {t(comparisonLabels[slot])}
              <select
                value={data[slot]?.at ?? ''}
                onChange={(event) => onSelectSample(slot, event.target.value)}
              >
                <option value="">{t('Elige una hora')}</option>
                {data.options.map(({ at, label }) => (
                  <option key={at} value={at} disabled={at === other?.at}>
                    {t(label)}
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
              {t('Diferencia de la segunda respecto a la primera')}
              <strong>{t(data.difference)}</strong>
            </>
          ) : (
            'No se puede calcular la diferencia porque falta una lectura.'
          )}
        </p>
      )}
      {first && second && onAskTumi && (
        <button
          type="button"
          className="button secondary"
          onClick={() => onAskTumi(second.at, first.at)}
        >
          {t('Preguntar a Nami por la comparación')}
        </button>
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
                    label={t(comparisonLabels[slot])}
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
