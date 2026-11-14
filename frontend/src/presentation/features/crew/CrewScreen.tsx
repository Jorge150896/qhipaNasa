'use client';
import { useContext, useEffect, useEffectEvent } from 'react';
import { useCrewHologramViewModel } from './useCrewHologramViewModel';
import { HumanHologramSlot } from './components/HumanHologramSlot';
import { HumanHologramControls } from './components/HumanHologramControls';
import { useCrewViewModel } from './useCrewViewModel';
import { CrewHealthScreen } from '../crew-health/CrewHealthScreen';
import type { CrewScreenProps } from './types';
import type { SensorKey } from '../mission/types';
import type { BodySystemKey } from '../crew-health/types';
import { CrewView } from './components/CrewView';
import { CrewTimeline } from './components/CrewTimeline';
import {
  CrewModuleLegend,
  CrewModuleOriginBanner,
  CrewModulePanel,
} from './components/CrewModulePanel';
import { CrewHologram } from './components/CrewHologram';
import { MetricCards } from '../../shared/mission/MetricCards';
import { MissionSceneSlot } from '../../shared/mission/MissionSceneSlot';
import { AssistantActionsContext } from '../mission-assistant/AssistantActionsContext';
import { AvatarScreen } from './avatar/AvatarScreen';
import './crew-explorer.css';

export function CrewScreen({ data, actions, habitatId, onNavigate }: CrewScreenProps) {
  const assistant = useContext(AssistantActionsContext);
  const model = useCrewViewModel(habitatId, data);
  const body = useCrewHologramViewModel(habitatId, data.selected.id);

  const hologramSensorId = model.hologram?.sensorId;
  const telemetryId = model.telemetryMetric?.id;

  function selectModule(id: string) {
    model.stopSynchronization();
    actions.selectZone(id);
  }

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

  function openOccupiedModule() {
    actions.selectZone(data.selected.zoneId);
    model.onModeChange('ship');
    focusSection('crew-body');
  }

  const openEntryAnchor = useEffectEvent(() => {
    if (window.location.hash === '#crew-module') {
      openOccupiedModule();
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
          avatarPanel={<AvatarScreen crewId={data.selected.id} crewName={data.selected.name} />}
          onOpenHistory={() => onNavigate('history')}
          telemetryMetric={model.telemetryMetric}
          trendInCard={model.trendInCard}
          sampleAt={model.sampleAt}
          synchronizedMoment={model.synchronizedMoment}
          onToggleSynchronization={model.toggleSynchronization}
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
              onAskTumi={
                assistant && telemetryId
                  ? (at, compareFrom) => assistant.askAboutReading(telemetryId, { at, compareFrom })
                  : undefined
              }
              onOpenModule={(origin) => {
                model.openTimelineModule(origin);
                actions.selectZone(origin.zone.id);
                focusSection('crew-body');
              }}
            />
          }
          dashboard={{
            data,
            habitatLabel: model.habitatLabel,
            mode: model.mode,
            onModeChange: (mode) => {
              if (mode === 'ship') actions.selectZone(data.selected.zoneId);
              model.onModeChange(mode);
            },
            scene: (
              <>
                {model.mode === 'ship' && <CrewModuleLegend />}
                {model.mode === 'ship' && model.moduleData.origin && (
                  <CrewModuleOriginBanner origin={model.moduleData.origin} />
                )}
                {model.mode === 'crew' && (
                  <details className="crew-body-display">
                    <summary>Modelo corporal</summary>
                    <HumanHologramControls
                      display={body.display}
                      appearance={body.appearance}
                      onDisplayChange={body.selectDisplay}
                      onAppearanceChange={body.selectAppearance}
                    />
                  </details>
                )}
                <div
                  className={
                    model.mode === 'ship' && model.habitatKind === 'ship'
                      ? 'crew-scene-stage crew-shuttle-stage'
                      : model.mode === 'crew'
                        ? 'crew-scene-stage crew-body-stage'
                        : 'crew-scene-stage'
                  }
                >
                  {model.mode === 'crew' && (
                    <MetricCards
                      labelsOnly
                      metrics={data.selected.metrics}
                      selectedId={hologramSensorId}
                      onSelect={selectSensor}
                    />
                  )}
                  {model.mode === 'crew' && body.display === 'hologram' ? (
                    <HumanHologramSlot
                      name={data.selected.name}
                      appearance={body.appearance}
                      metrics={data.selected.metrics}
                      selected={data.metric.id}
                      onSelect={selectSensor}
                    />
                  ) : (
                    <MissionSceneSlot
                      key={model.mode}
                      habitatKind={model.habitatKind}
                      mode={model.mode}
                      transparentBackground={model.mode === 'crew'}
                      selectedSensor={data.metric.id}
                      selectedZone={model.sceneZoneId}
                      modules={model.mode === 'ship' ? model.moduleData : undefined}
                      showModuleCamera={model.mode === 'ship'}
                      onSelectSensor={selectSensor}
                      onSelectZone={selectModule}
                      selectedSystem={model.healthSystem}
                      activeBodyRegion={model.activeBodyRegion}
                      onSelectSystem={selectBodyRegion}
                    />
                  )}
                  {model.mode === 'crew' && model.hologram && (
                    <CrewHologram
                      data={model.hologram}
                      onAskTumi={
                        assistant && hologramSensorId
                          ? () => assistant.askAboutReading(hologramSensorId)
                          : undefined
                      }
                      trendOpen={model.trendInCard}
                      onToggleTrend={model.toggleTrend}
                      recordPreview={model.hologram.recordKind ? recordPreview : undefined}
                      onClose={model.closeHologram}
                      onOpenHistory={() => focusSection('crew-health-history')}
                      onOpenTelemetryHistory={() => onNavigate('history')}
                      onOpenModule={openOccupiedModule}
                      onOpenEntry={() => focusSection('crew-health-entry')}
                      sampleAt={model.sampleAt}
                      onSelectTimelineSample={model.selectTimelineSample}
                      onOpenTimeline={() => focusSection('crew-timeline')}
                    />
                  )}
                  {model.mode === 'ship' && (
                    <CrewModulePanel
                      data={model.moduleData}
                      onSelectModule={selectModule}
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
