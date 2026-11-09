import type { MetricData, SensorKey } from '../../features/mission/types';
import { Icon, type IconName } from '@/ui/Icon';
const icons: Record<SensorKey, IconName> = {
  heartRate: 'heart',
  temperature: 'thermometer',
  oxygen: 'wind',
  respiration: 'activity',
};
export function MetricCards({
  metrics,
  selectedId,
  onSelect,
}: {
  metrics: MetricData[];
  selectedId: SensorKey;
  onSelect(id: SensorKey): void;
}) {
  return (
    <div className="metric-grid">
      {metrics.map((metric) => (
        <button
          key={metric.id}
          className={`metric-card ${metric.qualityTone}`}
          aria-pressed={selectedId === metric.id}
          onClick={() => onSelect(metric.id)}
        >
          <span className="metric-label">
            <Icon name={icons[metric.id]} />
            {metric.shortLabel}
          </span>
          <span className="metric-number">
            {metric.value}
            <small>{metric.unit}</small>
          </span>
          <span className="metric-quality">
            <span className="status-dot" />
            {metric.quality}
          </span>
        </button>
      ))}
    </div>
  );
}
