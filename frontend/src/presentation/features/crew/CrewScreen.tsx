'use client';
import { useEffect, useEffectEvent } from 'react';
import { useCrewViewModel } from './useCrewViewModel';
import { CrewHealthScreen } from '../crew-health/CrewHealthScreen';
import type { CrewScreenProps } from './types';
import type { SensorKey } from '../mission/types';
import type { BodySystemKey } from '../crew-health/types';
import { CrewView } from './components/CrewView';
import { CrewTimeline } from './components/CrewTimeline';
import { CrewModuleOriginBanner, CrewModulePanel } from './components/CrewModulePanel';
import { CrewHologram } from './components/CrewHologram';
import { MissionSceneSlot } from '../../shared/mission/MissionSceneSlot';
import './crew-explorer.css';

export function CrewScreen({ data, actions, habitatId, onNavigate }: CrewScreenProps) {
  const model = useCrewViewModel(habitatId, data);

  function selectSensor(id: SensorKey) {
    actions.selectMetric(id);
    model.selectSensorSystem(id);
  }

  function selectBodyRegion(id: BodySystemKey) {
    const sensorId = model.selectBodyRegion(id);
    if (sensorId) actions.selectMetric(sensorId);
  }

  function focusSection(
    id: 'crew-health-history' | 'crew-health-entry' | 'crew-timeline' | 'crew-body',
  ) {
    const detail = document.getElementById(id);
    detail?.focus({ preventScroll: true });
    detail?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  const openEntryAnchor = useEffectEvent(() => {
    if (window.location.hash === '#crew-module') {
      actions.selectZone(model.moduleData.occupiedId);
      model.onModeChange('ship');
      focusSection('crew-body');
    } else if (window.location.hash === '#crew-health-entry') {
      focusSection('crew-health-entry');
    }
  });
  useEffect(() => {
    openEntryAnchor();
  }, []);

  return (
    <CrewHealthScreen
      mission={data}
      habitatId={habitatId}
      systemId={model.healthSystem}
      onSelectSystem={(id) => {
        const sensorId = model.selectHealthSystem(id);
        if (sensorId) actions.selectMetric(sensorId);
      }}
      onNavigate={onNavigate}
      onSelectMetric={actions.selectMetric}
      onOpenTimelineRecord={(id) => {
        model.openSavedTimelineRecord(id);
        focusSection('crew-timeline');
      }}
    >
      {({ healthPanel, recordPreview, timelineRecords, timelineStatus }) => (
        <CrewView
          onOpenHistory={() => onNavigate('history')}
          telemetryMetric={model.telemetryMetric}
          trendInCard={model.trendInCard}
          onSelectTelemetrySensor={(id) => {
            model.selectTelemetrySensor(id);
            actions.selectMetric(id);
          }}
          onSelectBodyRegion={selectBodyRegion}
          healthPanel={healthPanel}
          onSelectTimelineSample={model.selectTimelineSample}
          timelinePanel={
            <CrewTimeline
              data={model.timelineData(timelineRecords, timelineStatus)}
              comparison={model.comparison}
              canCompare={model.canCompare}
              onToggleComparison={model.toggleComparison}
              onSelectComparisonSample={model.selectComparisonSample}
              onSelectMoment={model.selectTimelineMoment}
              onOpenModule={(origin) => {
                model.openTimelineModule(origin);
                actions.selectZone(origin.zone.id);
                focusSection('crew-body');
              }}
            />
          }
          dashboard={{
            data,
            onSelectMetric: selectSensor,
            habitatLabel: model.habitatLabel,
            mode: model.mode,
            onModeChange: (mode) => {
              if (mode === 'ship') actions.selectZone(model.moduleData.occupiedId);
              model.onModeChange(mode);
            },
            scene: (
              <>
                {model.mode === 'ship' && model.moduleData.origin && (
                  <CrewModuleOriginBanner origin={model.moduleData.origin} />
                )}
                <div
                  className={
                    model.mode === 'ship' && model.habitatKind === 'ship'
                      ? 'crew-scene-stage crew-shuttle-stage'
                      : 'crew-scene-stage'
                  }
                >
                  <MissionSceneSlot
                    key={model.mode}
                    habitatKind={model.habitatKind}
                    mode={model.mode}
                    selectedSensor={data.metric.id}
                    selectedZone={data.selectedZone.id}
                    modules={model.mode === 'ship' ? model.moduleData : undefined}
                    showModuleCamera={model.mode === 'ship'}
                    onSelectSensor={selectSensor}
                    onSelectZone={actions.selectZone}
                    selectedSystem={model.healthSystem}
                    activeBodyRegion={model.activeBodyRegion}
                    onSelectSystem={selectBodyRegion}
                  />
                  {model.mode === 'crew' && model.hologram && (
                    <CrewHologram
                      data={model.hologram}
                      trendOpen={model.trendInCard}
                      onToggleTrend={model.toggleTrend}
                      recordPreview={model.hologram.recordKind ? recordPreview : undefined}
                      onClose={model.closeHologram}
                      onOpenHistory={() => focusSection('crew-health-history')}
                      onOpenTelemetryHistory={() => onNavigate('history')}
                      onOpenEntry={() => focusSection('crew-health-entry')}
                      onSelectTimelineSample={model.selectTimelineSample}
                      onOpenTimeline={() => focusSection('crew-timeline')}
                    />
                  )}
                  {model.mode === 'ship' && (
                    <CrewModulePanel
                      data={model.moduleData}
                      onSelectModule={actions.selectZone}
                      onOpenTimeline={() => focusSection('crew-timeline')}
                    />
                  )}
                </div>
              </>
            ),
          }}
        />
      )}
    </CrewHealthScreen>
  );
}
