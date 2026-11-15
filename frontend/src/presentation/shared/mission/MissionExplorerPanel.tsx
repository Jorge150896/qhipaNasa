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
  return (
    <section
      id={anchorId}
      tabIndex={anchorId ? -1 : undefined}
      className="scene-panel"
      aria-label="Explorador tridimensional"
    >
      <div className="scene-panel-header">
        <div>
          <p className="eyebrow">
            {mode === 'crew' ? 'EXPLORADOR CORPORAL' : 'EXPLORADOR DE HÁBITAT'}
          </p>
          <h3>{mode === 'crew' ? crewName : zoneName}</h3>
        </div>
      </div>
      {scene}
      {showCaption && (
        <div className="scene-caption">
          <span>
            <Icon name="orbit" size={14} />
            Arrastra para girar · Rueda para acercar
          </span>
          <span>Modelo visual de referencia</span>
        </div>
      )}
      {metric && (
        <div className="scene-reading">
          <div>
            <span className="eyebrow">{metric.label}</span>
            <strong>
              {metric.value}
              <small>{metric.unit}</small>
            </strong>
          </div>
          <div>
            <span className={`badge ${metric.qualityTone === 'attention' ? 'amber' : ''}`}>
              {metric.quality}
            </span>
            <p>{metric.lastReading}</p>
          </div>
        </div>
      )}
    </section>
  );
}
