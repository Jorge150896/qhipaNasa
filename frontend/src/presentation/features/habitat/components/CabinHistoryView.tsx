import type { CabinHistoryData } from '../types';

export function CabinHistoryView({
  data,
  onSeek,
  onTogglePlayback,
}: {
  data: CabinHistoryData;
  onSeek(index: number): void;
  onTogglePlayback(): void;
}) {
  return (
    <div className="cabin-history-content">
      <p className="sub">
        Archivo histórico · NASA OSDR, ISS RR-9 · {data.seriesDate} (fecha de la serie publicada)
      </p>
      <div className="cabin-history-controls">
        <button className="button secondary" type="button" onClick={onTogglePlayback}>
          {data.playing ? 'Pausar' : data.index === data.end ? 'Volver a reproducir' : 'Reproducir'}
        </button>
        <div>
          <label htmlFor="cabin-time">
            Hora del historial · <strong>{data.currentTime} GMT</strong>
          </label>
          <input
            id="cabin-time"
            type="range"
            min={0}
            max={data.end}
            value={data.index}
            aria-valuetext={`${data.currentTime} GMT`}
            onChange={(event) => onSeek(event.currentTarget.valueAsNumber)}
          />
          <div className="cabin-history-times">
            <span>{data.firstTime} GMT</span>
            <span>{data.lastTime} GMT</span>
          </div>
        </div>
      </div>
      <div className="cabin-signals">
        {data.signals.map((signal) => (
          <article className="cabin-signal" key={signal.key}>
            <h3>{signal.label}</h3>
            <p className="cabin-value">
              {signal.value} <small>{signal.unit}</small>
            </p>
            <svg viewBox={`0 0 ${data.plotWidth} ${data.plotHeight}`} aria-hidden="true">
              <polyline
                points={signal.path}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={signal.point.x}
                x2={signal.point.x}
                y1={0}
                y2={data.plotHeight}
                stroke="currentColor"
                opacity=".35"
              />
              <circle cx={signal.point.x} cy={signal.point.y} r="4" fill="currentColor" />
            </svg>
            <p className="sub">
              Rango del día · {signal.min}–{signal.max} {signal.unit}
            </p>
          </article>
        ))}
      </div>
      <p className="cabin-tumi">
        <strong>Tumi</strong> · En este día, el CO₂ varió entre 3 183 y 4 023 ppm. La temperatura
        del aire se mantuvo entre 23,3 y 23,7 °C y la humedad entre 40 y 41 %.
      </p>
      <a href={data.sourceUrl}>Consultar la fuente de NASA OSDR</a>
    </div>
  );
}
