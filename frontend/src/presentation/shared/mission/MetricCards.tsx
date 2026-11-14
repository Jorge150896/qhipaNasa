import type { MetricData, SensorKey } from '../../features/mission/types';
import { Icon, type IconName } from '@/ui/Icon';
const icons: Record<SensorKey, IconName> = {
  heartRate: 'heart',
  temperature: 'thermometer',
  oxygen: 'wind',
  respiration: 'activity',
};
export function MetricCards({
  labelsOnly = false,
  metrics,
  selectedId,
  onSelect,
}: {
  labelsOnly?: boolean;
  metrics: MetricData[];
  selectedId?: SensorKey;
  onSelect(id: SensorKey): void;
}) {
  return (
    <div
      className={labelsOnly ? 'crew-metric-picker' : 'metric-grid'}
      role={labelsOnly ? 'group' : undefined}
      aria-label={labelsOnly ? 'Lecturas de la instantánea' : undefined}
    >
      {metrics.map((metric) => (
        <button
          key={metric.id}
          id={`assistant-target-metric-${metric.id}`}
          className={labelsOnly ? 'metric-card' : `metric-card ${metric.qualityTone}`}
          aria-pressed={selectedId === metric.id}
          onClick={() => onSelect(metric.id)}
        >
          <span className="metric-label">
            <Icon name={icons[metric.id]} />
            {metric.shortLabel}
          </span>
          {!labelsOnly && (
            <>
              <span className="metric-number">
                {metric.value}
                <small>{metric.unit}</small>
              </span>
              <span className="metric-quality">
                <span className="status-dot" />
                {metric.quality}
              </span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
