'use client';
import { useContext, useEffect, useEffectEvent, useMemo, useState } from 'react';
import { createMonitoringHistory } from '@/di/createMonitoringHistory.client';
import { CrewActivity } from './components/CrewActivity';
import { useCrewActivityViewModel } from './useCrewActivityViewModel';
import { useCrewHologramViewModel } from './useCrewHologramViewModel';
import { HumanHologramSlot } from './components/HumanHologramSlot';
import { HumanHologramControls } from './components/HumanHologramControls';
import { useCrewViewModel } from './useCrewViewModel';
import { CrewHealthScreen } from '../crew-health/CrewHealthScreen';
import type { CrewScreenProps, CrewSection } from './types';
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
import { CabinHistoryScreen } from '../habitat/CabinHistoryScreen';
import { NasaHistoryScreen } from '../history/NasaHistoryScreen';
import { RadLabReference } from '../habitat/components/RadLabReference';
import '../habitat/habitat.css';
import './crew-explorer.css';

export function CrewScreen({ data, actions, habitatId, onNavigate }: CrewScreenProps) {
  const [section, setSection] = useState<CrewSection>('now');
  const assistant = useContext(AssistantActionsContext);
  const loadMonitoringHistory = useMemo(() => createMonitoringHistory(habitatId), [habitatId]);
  const activity = useCrewActivityViewModel(loadMonitoringHistory, data);
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

  function focusSection(id: 'crew-timeline' | 'crew-history' | 'nasa-history' | 'crew-body') {
    setSection(id === 'crew-body' ? 'now' : 'history');
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const detail = document.getElementById(id);
        detail?.focus({ preventScroll: true });
        detail?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'start',
        });
      }),
    );
  }

  function selectTelemetrySensor(id: SensorKey) {
    model.selectTelemetrySensor(id);
    actions.selectMetric(id);
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
      onNavigate('journal', `check-system-${model.healthSystem}`);
    } else if (window.location.hash === '#crew-avatar') {
      setSection('avatar');
    } else if (window.location.hash === '#nasa-history') {
      focusSection('nasa-history');
    } else if (['#crew-history', '#crew-timeline'].includes(window.location.hash)) {
      focusSection('crew-history');
    } else if (window.location.hash === '#crew-health-history') {
      focusSection('crew-history');
    } else if (['#crew-health', '#crew-health-review'].includes(window.location.hash)) {
      focusSection('crew-body');
    }
  });
  useEffect(() => {
    const frame = requestAnimationFrame(() => openEntryAnchor());
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <CrewHealthScreen mission={data} habitatId={habitatId} systemId={model.healthSystem}>
      {({ recordPreview, timelineRecords, timelineStatus }) => (
        <CrewView
          section={section}
          onChangeSection={setSection}
          onOpenHabitat={openOccupiedModule}
          environmentReferences={
            section === 'now' &&
            model.mode === 'ship' && (
              <section
                className="crew-environment-references"
                aria-labelledby="crew-environment-references"
              >
                <h2 id="crew-environment-references">Archivo histórico de la ISS</h2>
                <CabinHistoryScreen />
                <RadLabReference />
              </section>
            )
          }
          avatarPanel={
            <>
              <HumanHologramControls
                display={body.display}
                appearance={body.appearance}
                onDisplayChange={body.selectDisplay}
                onAppearanceChange={body.selectAppearance}
              />
              <AvatarScreen crewId={data.selected.id} crewName={data.selected.name} />
            </>
          }
          nasaHistory={section === 'history' && <NasaHistoryScreen />}
          telemetryMetric={model.telemetryMetric}
          trendInCard={model.trendInCard}
          sampleAt={model.sampleAt}
          synchronizedMoment={model.synchronizedMoment}
          onToggleSynchronization={model.toggleSynchronization}
          onSelectTelemetrySensor={selectTelemetrySensor}
          onSelectTimelineSample={model.selectTimelineSample}
          timelinePanel={
            <>
              <CrewActivity
                entries={activity.entries(timelineRecords)}
                incomplete={timelineStatus !== 'ready' || activity.status !== 'ready'}
                onOpen={(entry) => {
                  if (entry.kind === 'check')
                    onNavigate('journal', `check-${encodeURIComponent(entry.id)}`);
                  else {
                    model.openSavedTimelineRecord(entry.id);
                    focusSection('crew-timeline');
                  }
                }}
              />
              <CrewTimeline
                data={model.timelineData(timelineRecords, timelineStatus)}
                comparison={model.comparison}
                canCompare={model.canCompare}
                onToggleComparison={model.toggleComparison}
                onSelectComparisonSample={model.selectComparisonSample}
                onSelectMoment={model.selectTimelineMoment}
                onAskTumi={
                  assistant && telemetryId
                    ? (at, compareFrom) =>
                        assistant.askAboutReading(telemetryId, { at, compareFrom })
                    : undefined
                }
                onOpenModule={(origin) => {
                  model.openTimelineModule(origin);
                  actions.selectZone(origin.zone.id);
                  focusSection('crew-body');
                }}
              />
            </>
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
                      martian={habitatId === 'ares'}
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
                      onOpenHistory={() => focusSection('crew-history')}
                      onOpenTelemetryHistory={() => {
                        selectTelemetrySensor(data.metric.id);
                        focusSection('crew-history');
                      }}
                      onOpenModule={openOccupiedModule}
                      onOpenEntry={() =>
                        onNavigate('journal', `check-system-${model.healthSystem}`)
                      }
                      sampleAt={model.sampleAt}
                      onSelectTimelineSample={model.selectTimelineSample}
                      onOpenTimeline={() => focusSection('crew-timeline')}
                    />
                  )}
                  {model.mode === 'ship' && (
                    <CrewModulePanel
                      data={model.moduleData}
                      onSelectModule={selectModule}
                      onOpenOccupant={(id) => {
                        actions.selectCrew(id);
                        model.onModeChange('crew');
                        focusSection('crew-body');
                      }}
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
