import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { ReactNode } from 'react';
import { Icon } from '@/ui/Icon';
import { SensorTabs } from '../../../shared/mission/SensorTabs';
import { TrendChart } from '../../../shared/mission/TrendChart';
import { MeasurementTracePanel } from '../../history/components/MeasurementTracePanel';
import { MissionExplorerPanel } from '../../../shared/mission/MissionExplorerPanel';
import type { CrewSection, CrewViewProps } from '../types';

export function CrewView({
  dashboard,
  section,
  onChangeSection,
  onOpenHabitat,
  avatarPanel,
  environmentReferences,
  timelinePanel,
  monthlyWellbeing,
  onSelectTimelineSample,
  telemetryMetric,
  trendInCard,
  sampleAt,
  synchronizedMoment,
  onToggleSynchronization,
  onSelectTelemetrySensor,
  nasaHistory,
}: CrewViewProps & {
  timelinePanel: ReactNode;
  monthlyWellbeing: ReactNode;
  avatarPanel: ReactNode;
  nasaHistory: ReactNode;
  environmentReferences: ReactNode;
  section: CrewSection;
  onChangeSection(section: CrewSection): void;
  onOpenHabitat(): void;
}) {
  const t = useTranslation();
  const { data, habitatLabel, scene, mode, onModeChange } = dashboard;
  return (
    <>
      <div className="crew-view-controls">
        <nav className="crew-section-links" aria-label={t('Secciones de Tripulación')}>
          {(
            [
              ['now', 'Ahora'],
              ['history', 'Historial'],
            ] as const
          ).map(([id, label]) => (
            <button
              className="button secondary"
              type="button"
              key={id}
              id={id === 'history' ? 'assistant-target-history' : undefined}
              data-assistant-control={id === 'history' ? undefined : `crew-${id}`}
              aria-controls={`crew-${id}`}
              aria-pressed={section === id}
              onClick={() => onChangeSection(id)}
            >
              {t(label)}
            </button>
          ))}
        </nav>
        {section === 'now' && (
          <div
            className="segmented crew-explorer-switch"
            role="group"
            aria-label={t('Vista del explorador')}
          >
            <button
              type="button"
              data-assistant-control="crew-body"
              aria-controls="crew-body"
              aria-pressed={mode === 'crew'}
              onClick={() => onModeChange('crew')}
            >
              <Icon name="users" size={14} />
              {t('Astronauta')}
            </button>
            <button
              type="button"
              data-assistant-control="crew-ship"
              aria-controls="crew-body"
              aria-pressed={mode === 'ship'}
              onClick={() => onModeChange('ship')}
            >
              <Icon name="rocket" size={14} />
              {t(habitatLabel)}
            </button>
          </div>
        )}
      </div>
      <section
        hidden={section !== 'now'}
        id="crew-now"
        className="crew-now"
        aria-label={t('Estado de la tripulación')}
        tabIndex={-1}
      >
        {mode === 'crew' && (
          <button
            className="text-button crew-location-link"
            data-assistant-control="crew-module"
            onClick={onOpenHabitat}
          >
            {t('Ver módulo · ')}
            {t(data.selected.location)} <Icon name="arrow" size={14} />
          </button>
        )}
        <MissionExplorerPanel
          showCaption={false}
          anchorId="crew-body"
          crewName={data.selected.name}
          zoneName={data.name}
          scene={scene}
          mode={mode}
        />
        {environmentReferences}
      </section>
      <section
        hidden={section !== 'history'}
        className="panel crew-history"
        id="crew-history"
        tabIndex={-1}
        aria-labelledby="crew-history-title"
      >
        <div className="panel-heading">
          <h2 id="crew-history-title">{t('Historial y contexto')}</h2>
          <a className="text-button" href="#nasa-history">
            {t('Ver referencias científicas de NASA')}
            <Icon name="arrow" size={14} />
          </a>
        </div>
        {monthlyWellbeing}
        <section className="crew-chart-panel" aria-label={t('Tendencia de telemetría')}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{t('HISTORIAL SINTÉTICO')}</p>
              <h3>{t(telemetryMetric?.label ?? 'Lecturas de sensores')}</h3>
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
                  {t('Sincronizar con el visor')}
                </button>
                <span
                  className={`badge ${telemetryMetric.qualityTone === 'attention' ? 'amber' : ''}`}
                >
                  {t(telemetryMetric.quality)}
                </span>
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
              animated={section === 'history'}
              selectedAt={sampleAt}
              onSelectSample={onSelectTimelineSample}
            />
          )}
          {telemetryMetric && (
            <p className="sub">{t('Los espacios en la gráfica indican muestras ausentes.')}</p>
          )}
          {synchronizedMoment && (
            <p className="crew-sync-status" role="status">
              {t(synchronizedMoment.date)} ·{' '}
              {t(synchronizedMoment.activity ?? 'Actividad sin registrar')}
              {t(' ')}· {t(synchronizedMoment.zone?.name ?? 'Ubicación sin registrar')}
              {' · '}
              <button type="button" className="text-button" onClick={() => onChangeSection('now')}>
                {t('Ver en el visor')}
              </button>
            </p>
          )}
          {!telemetryMetric && (
            <p className="sub">
              {t(
                'Consulta los autorregistros en la línea de tiempo. Elige un sensor para volver a sus lecturas.',
              )}
            </p>
          )}
        </section>
        {timelinePanel}
        {telemetryMetric && <MeasurementTracePanel metric={telemetryMetric} />}
        {nasaHistory}
      </section>
      <div id="crew-avatar-panel" hidden={section !== 'avatar'}>
        {avatarPanel}
      </div>
    </>
  );
}
