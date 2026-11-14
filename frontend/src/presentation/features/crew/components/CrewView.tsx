import type { ReactNode } from 'react';
import { Icon } from '@/ui/Icon';
import { SensorTabs } from '../../../shared/mission/SensorTabs';
import { TrendChart } from '../../../shared/mission/TrendChart';
import { MissionExplorerPanel } from '../../../shared/mission/MissionExplorerPanel';
import type { CrewViewProps } from '../types';

export function CrewView({
  dashboard,
  avatarPanel,
  healthPanel,
  timelinePanel,
  onSelectTimelineSample,
  telemetryMetric,
  trendInCard,
  sampleAt,
  synchronizedMoment,
  onToggleSynchronization,
  onSelectTelemetrySensor,
  onSelectBodyRegion,
  onOpenHistory,
}: CrewViewProps & { healthPanel: ReactNode; timelinePanel: ReactNode; avatarPanel: ReactNode }) {
  const { data, habitatLabel, scene, mode, onModeChange } = dashboard;
  return (
    <>
      <nav className="crew-section-links" aria-label="Secciones de Tripulación">
        <a href="#crew-now">Ahora</a>
        <a href="#crew-history">Historial</a>
        <a href="#crew-health">Autoevaluación</a>
        <a href="#crew-avatar">Personalización</a>
      </nav>
      <section
        id="crew-now"
        className="crew-now"
        aria-label="Estado de la tripulación"
        tabIndex={-1}
      >
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
        {avatarPanel}
      </section>
      <section
        className="panel crew-history"
        id="crew-history"
        tabIndex={-1}
        aria-labelledby="crew-history-title"
      >
        <h2 id="crew-history-title">Historial y contexto</h2>
        <section className="crew-chart-panel" aria-label="Tendencia de telemetría">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{data.selected.name} · HISTORIAL SINTÉTICO</p>
              <h3>{telemetryMetric?.label ?? 'Lecturas de sensores'}</h3>
            </div>
            {telemetryMetric && (
              <div className="crew-sync-actions">
                <button
                  className="button secondary"
                  type="button"
                  aria-pressed={Boolean(synchronizedMoment)}
                  onClick={onToggleSynchronization}
                >
                  <Icon name="orbit" size={15} />
                  Sincronizar con el visor
                </button>
                <button className="text-button" onClick={onOpenHistory}>
                  Ver historial
                  <Icon name="arrow" size={14} />
                </button>
              </div>
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
              selectedAt={sampleAt}
              onSelectSample={onSelectTimelineSample}
            />
          )}
          {synchronizedMoment && (
            <p className="crew-sync-status" role="status">
              {synchronizedMoment.date} · {synchronizedMoment.activity ?? 'Actividad sin registrar'}{' '}
              · {synchronizedMoment.zone?.name ?? 'Ubicación sin registrar'}
              {' · '}
              <a href="#crew-body">Ver en el visor</a>
            </p>
          )}
          {!telemetryMetric && (
            <p className="sub">
              Consulta los autorregistros del área en{' '}
              <a href="#crew-health-history">Autoevaluación</a>. Elige un sensor para volver a sus
              lecturas.
            </p>
          )}
        </section>
        {timelinePanel}
      </section>
      {healthPanel}
    </>
  );
}
