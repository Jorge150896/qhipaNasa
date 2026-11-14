import { useEffect, useId, useRef } from 'react';
import { Icon } from '@/ui/Icon';
import { TrendChart } from '../../../shared/mission/TrendChart';
import type { CrewHealthRecordPreview } from '../../crew-health/types';
import type { CrewHologramData } from '../types';
import { CrewHologramDetails } from './CrewHologramDetails';

export function CrewHologram({
  data,
  recordPreview,
  trendOpen,
  onToggleTrend,
  onClose,
  onOpenHistory,
  onOpenTelemetryHistory,
  onOpenEntry,
  onSelectTimelineSample,
  onOpenTimeline,
}: {
  data: CrewHologramData;
  recordPreview?: CrewHealthRecordPreview;
  trendOpen: boolean;
  onToggleTrend(): void;
  onClose(): void;
  onOpenHistory(): void;
  onOpenTelemetryHistory(): void;
  onOpenEntry(): void;
  onSelectTimelineSample(at: string): void;
  onOpenTimeline(): void;
}) {
  const card = useRef<HTMLElement>(null);
  const trendId = useId();
  const { reading, trend } = data;
  const entry = recordPreview?.entry;
  useEffect(() => {
    card.current?.focus({ preventScroll: true });
    if (window.matchMedia('(max-width: 999px)').matches) {
      card.current?.scrollIntoView({ block: 'nearest' });
    }
  }, []);

  return (
    <aside className="crew-hologram" aria-labelledby="crew-hologram-title" ref={card} tabIndex={-1}>
      <div className="crew-hologram-header">
        <span className="crew-hologram-icon">
          <Icon name={data.icon} size={20} />
        </span>
        <h3 id="crew-hologram-title">{data.title}</h3>
        <button
          className="crew-hologram-close"
          type="button"
          aria-label="Cerrar ficha corporal"
          onClick={onClose}
        >
          <Icon name="close" size={19} />
        </button>
      </div>

      <div aria-live="polite" className="crew-hologram-summary">
        {reading && (
          <>
            <div className="crew-hologram-reading">
              {reading.status ? (
                <strong className="crew-reading-status">{reading.status}</strong>
              ) : (
                <>
                  <strong>{reading.value}</strong>
                  <span> {reading.unit}</span>
                </>
              )}
            </div>
            <p className="crew-hologram-detail">
              {reading.timestamp
                ? `${reading.status ? 'Última lectura disponible' : 'Última lectura'} · ${reading.timestamp}`
                : 'Sin lecturas previas'}
            </p>
            <p>
              <strong>Actividad de la misión</strong> · {data.activity}
            </p>
          </>
        )}
        {data.signalAction && (
          <p className="crew-hologram-signal">
            <Icon name="alert" size={15} />
            {data.signalAction}
          </p>
        )}

        {recordPreview && (
          <div className="crew-hologram-record">
            <p className="crew-hologram-detail">
              {data.recordKind === 'vision' ? 'Última observación visual' : 'Última sesión'}
            </p>
            {entry ? (
              <>
                <strong>
                  {entry.activity ? `${entry.activity} · ${entry.duration}` : entry.state}
                </strong>
                <p className="crew-hologram-detail">{entry.date}</p>
                {entry.visionActivity && <p>{entry.visionActivity}</p>}
                {entry.note && <p className="crew-record-note">{entry.note}</p>}
              </>
            ) : (
              <strong>{recordPreview.message}</strong>
            )}
          </div>
        )}
      </div>

      <div className="crew-hologram-actions">
        {trend ? (
          <div className="crew-hologram-trend">
            <button
              className="button primary"
              type="button"
              aria-expanded={trendOpen}
              aria-controls={trendId}
              onClick={onToggleTrend}
            >
              <Icon name="chart" size={15} />
              {trendOpen ? 'Ocultar tendencia' : 'Ver tendencia'}
            </button>
            <div id={trendId}>
              {trendOpen && (
                <>
                  <TrendChart metric={trend} compact onSelectSample={onSelectTimelineSample} />
                  <button type="button" className="text-button" onClick={onOpenTimeline}>
                    Ver contexto en la línea de tiempo
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <button className="button primary" type="button" onClick={onOpenEntry}>
            <Icon name="clipboard" size={15} />
            {data.entryAction}
          </button>
        )}

        <CrewHologramDetails
          key={data.title}
          data={data}
          sessions={recordPreview?.sessions}
          onOpenHistory={onOpenHistory}
          onOpenTelemetryHistory={onOpenTelemetryHistory}
          onOpenEntry={onOpenEntry}
        />
      </div>
    </aside>
  );
}
