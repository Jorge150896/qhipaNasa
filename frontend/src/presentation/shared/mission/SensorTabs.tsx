import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { MetricData, SensorKey } from '../../features/mission/types';

export function SensorTabs({
  metrics,
  selectedId,
  onSelect,
}: {
  metrics: readonly MetricData[];
  selectedId?: SensorKey;
  onSelect(id: SensorKey): void;
}) {
  const t = useTranslation();
  return (
    <div className="sensor-tabs" role="group" aria-label={t('Indicadores de telemetría')}>
      {metrics.map((metric) => (
        <button
          type="button"
          key={metric.id}
          aria-pressed={metric.id === selectedId}
          onClick={() => onSelect(metric.id)}
        >
          {t(metric.shortLabel)}
        </button>
      ))}
    </div>
  );
}
