import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
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
  const t = useTranslation();
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
          {t(!animated ? 'HISTORIAL SINTÉTICO' : 'BARRIDO DEMO · HISTORIAL SINTÉTICO')}
        </span>
        {animated && (
          <button className="text-button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
            {t(paused ? 'Reanudar gráfica' : 'Pausar gráfica')}
          </button>
        )}
      </div>
      <div className="trend-chart">
        <div className="chart-axis">
          <span>
            {t(metric.chart.max)} {t(metric.unit)}
          </span>
          <span>
            {t(metric.chart.min)} {t(metric.unit)}
          </span>
        </div>
        <div className="chart-drawing">
          <svg
            viewBox="0 0 600 160"
            preserveAspectRatio="none"
            role="img"
            aria-label={t(
              `Historial de ${metric.label}. ${metric.history.map((sample) => `${sample.time}: ${sample.value}`).join('; ')}`,
            )}
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
                  <title>
                    {t(metric.history[i].time)}
                    {t(': Sin muestra')}
                  </title>
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
                    {t(metric.history[i].time)}: {t(metric.history[i].value)}
                  </title>
                </circle>
              ),
            )}
          </svg>
          <div className="chart-times">
            <span>{t(metric.chart.start)}</span>
            <span>{t(metric.chart.end)}</span>
          </div>
        </div>
      </div>
      <div
        className="chart-samples"
        role="group"
        aria-label={t(`Consultar muestras de ${metric.label}`)}
      >
        {metric.history.map((sample, i) => (
          <button
            key={sample.at}
            aria-label={t(`${sample.time}: ${sample.value}`)}
            aria-pressed={selected === i}
            onClick={() => {
              if (!onSelectSample) setLocalAt(sample.at);
              onSelectSample?.(sample.at);
            }}
          >
            <span>{t(sample.time.replace(' UTC', ''))}</span>
            <strong>{t(sample.missing ? '—' : sample.value)}</strong>
          </button>
        ))}
      </div>
      <div className="chart-readout">
        <span>
          {t(row?.time)} · <strong>{t(row?.value)}</strong>
        </span>
        <span>{t(row?.missing ? 'Muestra ausente · sin interpolación' : 'Muestra sintética')}</span>
      </div>
      {animated && (
        <p className="chart-demo-note">
          {t('El barrido se repite sobre estas muestras; no llegan nuevas lecturas.')}
          {t(' ')}
          {t(metric.id === 'heartRate' ? 'Tendencia de pulso, no señal ECG.' : '')}
        </p>
      )}
    </div>
  );
}
