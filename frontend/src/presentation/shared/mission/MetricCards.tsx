import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
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
  disclosureId,
}: {
  labelsOnly?: boolean;
  metrics: MetricData[];
  selectedId?: SensorKey;
  onSelect(id: SensorKey): void;
  disclosureId?: string;
}) {
  const t = useTranslation();
  return (
    <div
      className={labelsOnly ? 'crew-metric-picker' : 'metric-grid'}
      role={labelsOnly ? 'group' : undefined}
      aria-label={t(labelsOnly ? 'Lecturas de la instantánea' : undefined)}
    >
      {metrics.map((metric) => (
        <button
          key={metric.id}
          id={`assistant-target-metric-${metric.id}`}
          className={labelsOnly ? 'metric-card' : `metric-card ${metric.qualityTone}`}
          aria-pressed={selectedId === metric.id}
          aria-controls={disclosureId}
          aria-expanded={disclosureId ? selectedId === metric.id : undefined}
          onClick={() => onSelect(metric.id)}
        >
          <span className="metric-label">
            <Icon name={icons[metric.id]} />
            {t(metric.shortLabel)}
          </span>
          {!labelsOnly && (
            <>
              <span className="metric-number">
                {t(metric.value)}
                <small>{t(metric.unit)}</small>
              </span>
              <span className="metric-quality">
                <span className="status-dot" />
                {t(metric.quality)}
              </span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
