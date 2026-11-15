import { useState } from 'react';
import { healthSystems, metricMeaning } from '../crew-health/constants';
import type { BodySystemKey } from '../crew-health/types';
import type { MissionData, SensorKey } from '../mission/types';
import { useMissionDashboardViewModel } from '../../shared/mission/useMissionDashboardViewModel';
import type { SceneBodyRegion } from '../../shared/scene/astronautBodyZones';
import { shuttleModules } from '../../shared/scene/shuttleModules';
import type { CrewHealthTimelineRecord } from '../crew-health/types';
import { describeSample, mapCrewTimeline, mapCrewTimelineComparison } from './mapCrewTimeline';
import type {
  ComparisonSlot,
  CrewHologramData,
  CrewModuleData,
  CrewModuleOrigin,
  CrewTimelineData,
  CrewTimelineSelection,
} from './types';

const systemBySensor: Record<SensorKey, BodySystemKey> = {
  heartRate: 'cardio',
  oxygen: 'cardio',
  respiration: 'cardio',
  temperature: 'immune',
};

const directSensorBySystem: Partial<Record<BodySystemKey, SensorKey>> = {
  cardio: 'heartRate',
  immune: 'temperature',
};

const moduleShortNames: Partial<Record<string, string>> = {
  habitat: 'Descanso',
  exercise: 'Ejercicio',
  laboratory: 'Laboratorio',
};

const readableUnits: Record<SensorKey, string> = {
  heartRate: 'latidos por minuto',
  respiration: 'respiraciones por minuto',
  oxygen: '% de saturación',
  temperature: '°C',
};

type CrewReadingPreview = {
  crewId: string;
  systemId: BodySystemKey;
  sensorId?: SensorKey;
  kind: 'initial' | 'sensor' | 'region';
};

function initialReading(crew: MissionData['selected']): CrewReadingPreview | null {
  const first = crew.metrics[0];
  return first
    ? { crewId: crew.id, systemId: systemBySensor[first.id], sensorId: first.id, kind: 'initial' }
    : null;
}

export function useCrewViewModel(habitatId: string, mission: MissionData) {
  const dashboard = useMissionDashboardViewModel(habitatId, 'crew');
  const [healthSystem, selectHealthSystem] = useState<BodySystemKey>(
    systemBySensor[mission.metric.id],
  );
  const [openTrend, setOpenTrend] = useState(false);
  const timelineScope = `${mission.selected.id}:${mission.scenario}`;
  const [moduleOrigin, setModuleOrigin] = useState<{ scope: string; data: CrewModuleOrigin }>();
  if (moduleOrigin && moduleOrigin.scope !== timelineScope) setModuleOrigin(undefined);
  const [timeline, setTimeline] = useState<{ scope: string; selection: CrewTimelineSelection }>();
  function selectTimeline(selection: CrewTimelineSelection) {
    setTimeline({ scope: timelineScope, selection });
  }
  const [preview, setPreview] = useState(() => initialReading(mission.selected));

  if (preview && preview.crewId !== mission.selected.id) {
    setPreview(initialReading(mission.selected));
    setOpenTrend(false);
  }

  const system =
    preview?.crewId === mission.selected.id
      ? healthSystems.find((item) => item.id === preview.systemId)
      : undefined;
  const metric = mission.selected.metrics.find((item) => item.id === preview?.sensorId);
  const activeBodyRegion: SceneBodyRegion | undefined =
    system?.id === 'vision' || system?.id === 'fitness' ? system.id : metric?.id;
  const telemetryMetric =
    systemBySensor[mission.metric.id] === healthSystem ? mission.metric : undefined;
  const [syncScope, setSyncScope] = useState<string>();
  if (syncScope && syncScope !== timelineScope) setSyncScope(undefined);
  const currentSelection = timeline?.scope === timelineScope ? timeline.selection : undefined;
  const selectedSample =
    currentSelection?.kind === 'sample' && currentSelection.metricId === telemetryMetric?.id
      ? telemetryMetric?.history.find(({ at }) => at === currentSelection.at)
      : undefined;
  const synchronizedMoment =
    syncScope === timelineScope && selectedSample && telemetryMetric
      ? describeSample(mission, telemetryMetric, selectedSample)
      : undefined;
  const comparisonScope = `${timelineScope}:${telemetryMetric?.id ?? ''}`;
  const [comparison, setComparison] = useState<{
    scope: string;
    samples: Partial<Record<ComparisonSlot, string>>;
  }>();
  if (comparison && comparison.scope !== comparisonScope) setComparison(undefined);
  const comparisonActive = comparison?.scope === comparisonScope;
  const canCompare = (telemetryMetric?.history.length ?? 0) > 1;

  function selectComparisonSample(slot: ComparisonSlot, at: string) {
    if (!comparisonActive || !comparison) return;
    if (at && !telemetryMetric?.history.some((sample) => sample.at === at)) return;
    const other = slot === 'first' ? 'second' : 'first';
    if (at && comparison.samples[other] === at) return;
    setComparison({ scope: comparisonScope, samples: { ...comparison.samples, [slot]: at } });
  }

  const hologram: CrewHologramData | null = system
    ? {
        title: preview?.kind !== 'region' ? (metric?.label ?? system.label) : system.label,
        sensorId: metric?.id,
        icon: metric?.id === 'respiration' ? 'wind' : system.icon,
        entryAction:
          system.id === 'vision'
            ? 'Registrar observación'
            : system.id === 'fitness'
              ? 'Registrar ejercicio'
              : 'Registrar cómo me siento',
        recordKind: system.id === 'vision' || system.id === 'fitness' ? system.id : undefined,
        explanation:
          metric && preview?.kind !== 'region'
            ? metricMeaning[metric.id]
            : metric
              ? system.overview
              : system.checkPrompt,
        detail: metric ? metric.lastReading : system.missing,
        reading: metric && {
          value: metric.value,
          unit: readableUnits[metric.id],
          timestamp: metric.history.findLast((sample) => !sample.missing)?.time,
          status:
            metric.value === '—' || metric.qualityTone === 'attention' ? metric.quality : undefined,
        },
        trend:
          metric && metric.history.filter((sample) => !sample.missing).length > 1
            ? metric
            : undefined,
        activity: mission.selected.activity,
        context: mission.selected.location,
        contextTime: `${mission.date} · ${mission.time}`,
        signalAction:
          metric && (metric.qualityTone === 'attention' || metric.value === '—')
            ? 'Comprueba el sensor y repite la medición cuando esté disponible.'
            : undefined,
      }
    : null;

  const displayedZone = synchronizedMoment
    ? mission.zones.find(({ id }) => id === synchronizedMoment.zone?.id)
    : mission.selectedZone;
  const occupiedId = synchronizedMoment
    ? (synchronizedMoment.zone?.id ?? '')
    : mission.selected.zoneId;
  const moduleData: CrewModuleData = {
    synchronizedMoment,
    crewName: mission.selected.name,
    crewLocation: mission.selected.location,
    activity: mission.selected.activity,
    occupiedId,
    crewInSelectedModule: displayedZone?.id === occupiedId,
    timestamp: `${mission.date} · ${mission.time}`,
    zones:
      dashboard.habitatKind === 'ship'
        ? shuttleModules.flatMap((module) => {
            const zone = mission.zones.find(({ id }) => id === module.id);
            return zone
              ? [{ id: zone.id, name: zone.name, shortName: module.shortName, code: module.code }]
              : [];
          })
        : mission.zones.map((zone) => ({
            id: zone.id,
            name: zone.name,
            shortName: moduleShortNames[zone.id] ?? zone.name,
          })),
    selected: displayedZone ?? mission.selectedZone,
    occupants: synchronizedMoment
      ? []
      : mission.crew.filter((person) => person.zoneId === displayedZone?.id),
    origin:
      !synchronizedMoment && moduleOrigin?.scope === timelineScope ? moduleOrigin.data : undefined,
  };

  function selectSensorSystem(id: SensorKey) {
    setSyncScope(undefined);
    setOpenTrend(false);
    const systemId = systemBySensor[id];
    selectHealthSystem(systemId);
    setPreview({ crewId: mission.selected.id, systemId, sensorId: id, kind: 'sensor' });
  }

  function selectBodyRegion(systemId: BodySystemKey) {
    setSyncScope(undefined);
    setOpenTrend(false);
    const sensorId = directSensorBySystem[systemId];
    selectHealthSystem(systemId);
    setPreview({ crewId: mission.selected.id, systemId, sensorId, kind: 'region' });
    return sensorId;
  }

  return {
    ...dashboard,
    onModeChange(mode: 'crew' | 'ship') {
      setSyncScope(undefined);
      setModuleOrigin(undefined);
      setOpenTrend(false);
      dashboard.onModeChange(mode);
    },
    openTimelineModule(origin: CrewModuleOrigin) {
      setSyncScope(undefined);
      setModuleOrigin({ scope: timelineScope, data: origin });
      setPreview(null);
      setOpenTrend(false);
      dashboard.onModeChange('ship');
    },
    healthSystem,
    telemetryMetric,
    sampleAt: selectedSample?.at,
    synchronizedMoment,
    sceneZoneId: displayedZone?.id ?? '',
    stopSynchronization: () => setSyncScope(undefined),
    toggleSynchronization() {
      if (synchronizedMoment) {
        setSyncScope(undefined);
        return;
      }
      const sample = selectedSample ?? telemetryMetric?.history.at(-1);
      if (!sample || !telemetryMetric) return;
      setSyncScope(timelineScope);
      setModuleOrigin(undefined);
      setPreview(null);
      setOpenTrend(false);
      selectTimeline({ kind: 'sample', at: sample.at, metricId: telemetryMetric.id });
      dashboard.onModeChange('ship');
    },
    moduleData,
    canCompare,
    comparison:
      comparisonActive && telemetryMetric
        ? mapCrewTimelineComparison(mission, telemetryMetric, comparison.samples)
        : undefined,
    toggleComparison() {
      if (comparisonActive) {
        setComparison(undefined);
      } else if (canCompare) {
        const current = timeline?.scope === timelineScope ? timeline.selection : undefined;
        const first =
          current?.kind === 'sample' && current.metricId === telemetryMetric?.id
            ? current.at
            : undefined;
        setComparison({ scope: comparisonScope, samples: { first } });
      }
    },
    selectComparisonSample,
    timelineData(records: CrewHealthTimelineRecord[], status: CrewTimelineData['status']) {
      return mapCrewTimeline(
        mission,
        telemetryMetric,
        records,
        status,
        timeline?.scope === timelineScope ? timeline.selection : undefined,
      );
    },
    selectTimelineMoment(id: string) {
      setSyncScope(undefined);
      selectTimeline(
        id === 'snapshot'
          ? { kind: 'snapshot' }
          : { kind: 'record', id: id.slice('record:'.length) },
      );
    },
    openSavedTimelineRecord(id: string) {
      setSyncScope(undefined);
      setComparison(undefined);
      selectTimeline({ kind: 'record', id });
    },
    selectTimelineSample(at: string) {
      if (!telemetryMetric) return;
      selectTimeline({ kind: 'sample', at, metricId: telemetryMetric.id });
      if (!comparisonActive || !comparison || Object.values(comparison.samples).includes(at))
        return;
      selectComparisonSample(comparison.samples.first ? 'second' : 'first', at);
    },
    trendInCard: openTrend && Boolean(hologram?.trend),
    toggleTrend: () => setOpenTrend((open) => !open),
    selectHealthSystem(id: BodySystemKey) {
      setSyncScope(undefined);
      selectHealthSystem(id);
      setPreview(null);
      setOpenTrend(false);
      return systemBySensor[mission.metric.id] === id ? undefined : directSensorBySystem[id];
    },
    selectSensorSystem,
    selectTelemetrySensor(id: SensorKey) {
      setSyncScope(undefined);
      selectHealthSystem(systemBySensor[id]);
      setPreview(null);
      setOpenTrend(false);
    },
    selectBodyRegion,
    hologram,
    focusReadingOnOpen: preview?.kind !== 'initial',
    activeBodyRegion,
    closeHologram() {
      setPreview(null);
      setOpenTrend(false);
    },
  };
}
