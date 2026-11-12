import type { ReactNode } from 'react';
import { Icon } from '@/ui/Icon';
import { SensorTabs } from '../../../shared/mission/SensorTabs';
import { TrendChart } from '../../../shared/mission/TrendChart';
import { MetricCards } from '../../../shared/mission/MetricCards';
import { MissionExplorerPanel } from '../../../shared/mission/MissionExplorerPanel';
import type { CrewViewProps } from '../types';

export function CrewView({
  dashboard,
  healthPanel,
  timelinePanel,
  onSelectTimelineSample,
  telemetryMetric,
  trendInCard,
  onSelectTelemetrySensor,
  onSelectBodyRegion,
  onOpenHistory,
}: CrewViewProps & { healthPanel: ReactNode; timelinePanel: ReactNode }) {
  const { data, onSelectMetric, habitatLabel, scene, mode, onModeChange } = dashboard;
  return (
    <>
      <div className="health-entry-link">
        <Icon name="heart" />
        <span>Selecciona un indicador o una zona del astronauta para revisar tu salud.</span>
        <div className="crew-quick-links">
          <a href="#crew-timeline">Línea de tiempo</a>
          <a href="#crew-health">
            Abrir autoevaluación
            <Icon name="arrow" size={14} />
          </a>
        </div>
      </div>
      <MetricCards
        metrics={data.selected.metrics}
        selectedId={telemetryMetric?.id}
        onSelect={onSelectMetric}
      />
      <MissionExplorerPanel
        anchorId="crew-body"
        crewName={data.selected.name}
        zoneName={data.name}
        habitatLabel={habitatLabel}
        scene={scene}
        mode={mode}
        onModeChange={onModeChange}
      />
      {mode === 'crew' && (
        <div
          className="crew-region-controls"
          role="group"
          aria-label="Accesos del explorador corporal"
        >
          <button className="button secondary" onClick={() => onSelectBodyRegion('cardio')}>
            Ver corazón
          </button>
          <button className="button secondary" onClick={() => onSelectBodyRegion('vision')}>
            Ver visión
          </button>
          <button className="button secondary" onClick={() => onSelectBodyRegion('fitness')}>
            Ver ejercicio
          </button>
        </div>
      )}
      <section className="panel crew-chart-panel" aria-label="Tendencia de telemetría">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{data.selected.name} · HISTORIAL SINTÉTICO</p>
            <h3>{telemetryMetric?.label ?? 'Telemetría personal'}</h3>
          </div>
          {telemetryMetric && (
            <button className="text-button" onClick={onOpenHistory}>
              Ver historial
              <Icon name="arrow" size={14} />
            </button>
          )}
        </div>
        <SensorTabs
          metrics={data.selected.metrics}
          selectedId={telemetryMetric?.id}
          onSelect={onSelectTelemetrySensor}
        />
        {telemetryMetric && !trendInCard && (
          <TrendChart
            metric={telemetryMetric}
            animated={false}
            onSelectSample={onSelectTimelineSample}
          />
        )}
        {!telemetryMetric && <p className="sub">Elige un indicador para ver su tendencia.</p>}
      </section>
      {timelinePanel}
      {healthPanel}
    </>
  );
}
