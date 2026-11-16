import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { ReactNode } from 'react';
import { Icon } from '@/ui/Icon';
import type { MetricData } from '../../features/mission/types';

interface Props {
  showCaption?: boolean;
  anchorId?: string;
  crewName: string;
  zoneName: string;
  metric?: MetricData;
  scene: ReactNode;
  mode: 'crew' | 'ship';
}
export function MissionExplorerPanel({
  showCaption = true,
  anchorId,
  crewName,
  zoneName,
  metric,
  scene,
  mode,
}: Props) {
  const t = useTranslation();
  return (
    <section
      id={anchorId}
      tabIndex={anchorId ? -1 : undefined}
      className="scene-panel"
      aria-label={t('Explorador tridimensional')}
    >
      <div className="scene-panel-header">
        <div>
          <p className="eyebrow">
            {t(mode === 'crew' ? 'EXPLORADOR CORPORAL' : 'EXPLORADOR DE HÁBITAT')}
          </p>
          <h3>{t(mode === 'crew' ? crewName : zoneName)}</h3>
        </div>
      </div>
      {scene}
      {showCaption && (
        <div className="scene-caption">
          <span>
            <Icon name="orbit" size={14} />
            {t('Arrastra para girar · Rueda para acercar')}
          </span>
          <span>{t('Modelo visual de referencia')}</span>
        </div>
      )}
      {metric && (
        <div className="scene-reading">
          <div>
            <span className="eyebrow">{t(metric.label)}</span>
            <strong>
              {t(metric.value)}
              <small>{t(metric.unit)}</small>
            </strong>
          </div>
          <div>
            <span className={`badge ${metric.qualityTone === 'attention' ? 'amber' : ''}`}>
              {t(metric.quality)}
            </span>
            <p>{t(metric.lastReading)}</p>
          </div>
        </div>
      )}
    </section>
  );
}
