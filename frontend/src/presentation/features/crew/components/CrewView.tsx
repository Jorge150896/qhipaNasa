import type { ReactNode } from 'react';
import { Icon } from '@/ui/Icon';
import { SensorTabs } from '../../../shared/mission/SensorTabs';
import { TrendChart } from '../../../shared/mission/TrendChart';
import { MissionExplorerPanel } from '../../../shared/mission/MissionExplorerPanel';
import type { CrewSection, CrewViewProps } from '../types';

export function CrewView({
  dashboard,
  section,
  onChangeSection,
  onOpenHabitat,
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
}: CrewViewProps & {
  healthPanel: ReactNode;
  timelinePanel: ReactNode;
  avatarPanel: ReactNode;
  section: CrewSection;
  onChangeSection(section: CrewSection): void;
  onOpenHabitat(): void;
}) {
  const { data, habitatLabel, scene, mode, onModeChange } = dashboard;
  return (
    <>
      <nav className="crew-section-links" aria-label="Secciones de Tripulación">
        {(
          [
            ['now', 'Ahora'],
            ['health', 'Autoevaluación'],
            ['history', 'Historial'],
            ['avatar', 'Personalización'],
          ] as const
        ).map(([id, label]) => (
          <button
            className="button secondary"
            type="button"
            key={id}
            aria-controls={`crew-${id === 'health' ? 'health-panel' : id === 'avatar' ? 'avatar-panel' : id}`}
            aria-pressed={section === id}
            onClick={() => onChangeSection(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <section
        hidden={section !== 'now'}
        id="crew-now"
        className="crew-now"
        aria-label="Estado de la tripulación"
        tabIndex={-1}
      >
        <button className="text-button crew-location-link" onClick={onOpenHabitat}>
          Ver módulo · {data.selected.location} <Icon name="arrow" size={14} />
        </button>
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
      </section>
      <section
        hidden={section !== 'history'}
        className="panel crew-history"
        id="crew-history"
        tabIndex={-1}
        aria-labelledby="crew-history-title"
      >
        <h2 id="crew-history-title">Historial y contexto</h2>
        <section className="crew-chart-panel" aria-label="Tendencia de telemetría">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">HISTORIAL SINTÉTICO</p>
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
              <button type="button" className="text-button" onClick={() => onChangeSection('now')}>
                Ver en el visor
              </button>
            </p>
          )}
          {!telemetryMetric && (
            <p className="sub">
              Consulta los autorregistros del área en{' '}
              <button
                type="button"
                className="text-button"
                onClick={() => onChangeSection('health')}
              >
                Autoevaluación
              </button>
              . Elige un sensor para volver a sus lecturas.
            </p>
          )}
        </section>
        {timelinePanel}
      </section>
      <div id="crew-health-panel" hidden={section !== 'health'}>
        {healthPanel}
      </div>
      <div id="crew-avatar-panel" hidden={section !== 'avatar'}>
        {avatarPanel}
      </div>
    </>
  );
}
