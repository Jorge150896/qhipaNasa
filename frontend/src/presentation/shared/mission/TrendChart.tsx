import { useId, useState } from 'react';
import type { MetricData } from '../../features/mission/types';

export function TrendChart({
  metric,
  compact = false,
  animated = !compact,
  selectedAt,
  onSelectSample,
}: {
  metric: MetricData;
  compact?: boolean;
  animated?: boolean;
  selectedAt?: string;
  onSelectSample?(at: string): void;
}) {
  return (
    <InteractiveTrend
      key={`${metric.id}:${metric.chart.paths.join('|')}`}
      metric={metric}
      compact={compact}
      animated={animated}
      selectedAt={selectedAt}
      onSelectSample={onSelectSample}
    />
  );
}

function InteractiveTrend({
  metric,
  compact,
  animated,
  selectedAt,
  onSelectSample,
}: {
  metric: MetricData;
  compact: boolean;
  animated: boolean;
  selectedAt?: string;
  onSelectSample?(at: string): void;
}) {
  const id = useId();
  const [paused, setPaused] = useState(false);
  const [localAt, setLocalAt] = useState<string>();
  const activeIndex = metric.history.findIndex(
    (sample) => sample.at === (onSelectSample ? selectedAt : localAt),
  );
  const selected = activeIndex >= 0 ? activeIndex : metric.history.length - 1;
  const row = metric.history[selected];
  return (
    <div
      className={`telemetry-chart ${compact ? 'telemetry-compact' : ''} ${paused ? 'is-paused' : ''}`}
    >
      <div className="telemetry-toolbar">
        <span className="telemetry-mode">
          {!animated ? 'HISTORIAL SINTÉTICO' : 'BARRIDO DEMO · HISTORIAL SINTÉTICO'}
        </span>
        {animated && (
          <button className="text-button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
            {paused ? 'Reanudar gráfica' : 'Pausar gráfica'}
          </button>
        )}
      </div>
      <div className="trend-chart">
        <div className="chart-axis">
          <span>
            {metric.chart.max} {metric.unit}
          </span>
          <span>
            {metric.chart.min} {metric.unit}
          </span>
        </div>
        <div className="chart-drawing">
          <svg
            viewBox="0 0 600 160"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Historial de ${metric.label}. ${metric.history.map((sample) => `${sample.time}: ${sample.value}`).join('; ')}`}
          >
            <defs>
              <clipPath id={`${id}-clip`}>
                <rect width="600" height="160" />
              </clipPath>
            </defs>
            {[28, 55, 82, 109, 136].map((y) => (
              <line key={y} x1="0" x2="600" y1={y} y2={y} className="chart-gridline" />
            ))}
            {metric.chart.points.map((point, i) => (
              <line
                key={i}
                x1={point.x}
                x2={point.x}
                y1="15"
                y2="145"
                className="chart-gridline chart-grid-vertical"
              />
            ))}
            {selectedAt && metric.chart.points[selected] && (
              <line
                x1={metric.chart.points[selected].x}
                x2={metric.chart.points[selected].x}
                y1="15"
                y2="145"
                stroke="var(--accent-hover)"
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
                aria-hidden="true"
              />
            )}
            {metric.chart.paths.map((path, i) => (
              <g key={i}>
                <path
                  d={path}
                  fill="none"
                  className="chart-line chart-line-glow"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d={path}
                  fill="none"
                  className="chart-line"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
            {animated && (
              <g clipPath={`url(#${id}-clip)`} aria-hidden="true">
                <g className="chart-sweep">
                  <rect
                    x="-22"
                    y="15"
                    width="22"
                    height="130"
                    fill="var(--accent)"
                    opacity="0.08"
                  />
                  <line
                    x1="0"
                    x2="0"
                    y1="15"
                    y2="145"
                    stroke="var(--accent-hover)"
                    strokeWidth="1"
                    opacity="0.65"
                  />
                </g>
              </g>
            )}
            {metric.chart.points.map((point, i) =>
              point.y === null ? (
                <path
                  key={i}
                  d={`M${point.x - 4},78 l8,8 m0,-8 l-8,8`}
                  className="chart-missing"
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{metric.history[i].time}: Sin muestra</title>
                </path>
              ) : (
                <circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={selected === i ? 4 : 2.5}
                  className={selected === i ? 'chart-point selected' : 'chart-point'}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>
                    {metric.history[i].time}: {metric.history[i].value}
                  </title>
                </circle>
              ),
            )}
          </svg>
          <div className="chart-times">
            <span>{metric.chart.start}</span>
            <span>{metric.chart.end}</span>
          </div>
        </div>
      </div>
      <div
        className="chart-samples"
        role="group"
        aria-label={`Consultar muestras de ${metric.label}`}
      >
        {metric.history.map((sample, i) => (
          <button
            key={sample.at}
            aria-label={`${sample.time}: ${sample.value}`}
            aria-pressed={selected === i}
            onClick={() => {
              if (!onSelectSample) setLocalAt(sample.at);
              onSelectSample?.(sample.at);
            }}
          >
            <span>{sample.time.replace(' UTC', '')}</span>
            <strong>{sample.missing ? '—' : sample.value}</strong>
          </button>
        ))}
      </div>
      <div className="chart-readout">
        <span>
          {row?.time} · <strong>{row?.value}</strong>
        </span>
        <span>{row?.missing ? 'Muestra ausente · sin interpolación' : 'Muestra sintética'}</span>
      </div>
      {animated && (
        <p className="chart-demo-note">
          El barrido se repite sobre estas muestras; no llegan nuevas lecturas.{' '}
          {metric.id === 'heartRate' ? 'Tendencia de pulso, no señal ECG.' : ''}
        </p>
      )}
    </div>
  );
}
