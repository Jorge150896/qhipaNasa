import type { CrewHealthTimelineRecord } from '../crew-health/types';
import type { MetricData, MissionData } from '../mission/types';
import type {
  ComparisonSlot,
  CrewTimelineComparison,
  CrewTimelineData,
  CrewTimelineDetail,
  CrewTimelineSelection,
} from './types';

const date = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h23',
  timeZone: 'UTC',
});

export function mapCrewTimeline(
  mission: MissionData,
  metric: MetricData | undefined,
  records: CrewHealthTimelineRecord[],
  status: CrewTimelineData['status'],
  selection?: CrewTimelineSelection,
): CrewTimelineData {
  const snapshot = {
    id: 'snapshot',
    at: mission.capturedAt,
    date: `${mission.date} · ${mission.time}`,
    title: mission.selected.activity,
    source: 'Actividad simulada',
  };
  const zone = mission.zones.find(({ id }) => id === mission.selected.zoneId);
  const record =
    selection?.kind === 'record' ? records.find(({ id }) => id === selection.id) : undefined;
  const recent = records.slice(0, 5);
  if (record && !recent.includes(record)) recent[4] = record;
  const moments = [
    snapshot,
    ...recent.map((record) => ({
      id: `record:${record.id}`,
      at: record.at,
      date: record.date,
      title: record.visionActivity ? `${record.title} · ${record.visionActivity}` : record.title,
      source: 'Autorregistro local',
    })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  if (record) {
    const reportedZone = mission.zones.find(({ id }) => id === record.zoneId);
    return {
      status,
      moments,
      activeMoment: `record:${record.id}`,
      detail: {
        kind: 'record',
        at: record.at,
        date: record.date,
        title: record.title,
        source: 'Hora del autorregistro local',
        value: record.state,
        duration: record.duration,
        note: record.note,
        activity:
          record.visionActivity ?? (record.activity === record.title ? undefined : record.activity),
        zone: reportedZone,
        contextMessage: reportedZone
          ? 'El módulo fue indicado en el autorregistro. No hay lecturas ambientales vinculadas a este registro.'
          : 'Este autorregistro no tiene un módulo disponible ni lecturas ambientales vinculadas.',
      },
    };
  }

  const sample =
    selection?.kind === 'sample' && selection.metricId === metric?.id
      ? metric?.history.find(({ at }) => at === selection.at)
      : undefined;
  return {
    status,
    moments,
    activeMoment: sample ? undefined : snapshot.id,
    detail:
      sample && metric
        ? describeSample(mission, metric, sample)
        : {
            kind: 'snapshot',
            at: snapshot.at,
            date: snapshot.date,
            title: snapshot.title,
            source: 'Instantánea de misión simulada',
            zone,
            readings: zone?.readings,
            contextMessage: zone
              ? undefined
              : 'No hay ubicación ni lecturas ambientales registradas para este momento.',
          },
  };
}

function describeSample(
  mission: MissionData,
  metric: MetricData,
  sample: MetricData['history'][number],
): CrewTimelineDetail {
  const sameInstant = Date.parse(sample.at) === Date.parse(mission.capturedAt);
  const zone = sameInstant
    ? mission.zones.find(({ id }) => id === mission.selected.zoneId)
    : undefined;
  return {
    kind: 'sample',
    at: sample.at,
    date: `${date.format(new Date(sample.at))} UTC`,
    title: metric.label,
    source: 'Muestra simulada',
    value: sample.value,
    activity: sameInstant ? mission.selected.activity : undefined,
    zone,
    readings: zone?.readings,
    contextMessage: zone
      ? undefined
      : 'No hay ubicación, actividad ni lecturas ambientales registradas para este momento.',
  };
}

const signedNumber = new Intl.NumberFormat('es-PE', {
  signDisplay: 'exceptZero',
  maximumFractionDigits: 1,
});

export function mapCrewTimelineComparison(
  mission: MissionData,
  metric: MetricData,
  samples: Partial<Record<ComparisonSlot, string>>,
): CrewTimelineComparison {
  const first = metric.history.find(({ at }) => at === samples.first);
  const second = metric.history.find(({ at }) => at === samples.second);
  const difference =
    first?.numericValue != null && second?.numericValue != null
      ? `${signedNumber.format(second.numericValue - first.numericValue)} ${metric.unit === '%' ? 'puntos porcentuales' : metric.unit}`
      : undefined;

  return {
    label: metric.label,
    options: metric.history.map((sample) => ({
      at: sample.at,
      label: `${date.format(new Date(sample.at))} UTC · ${sample.value}`,
    })),
    first: first && describeSample(mission, metric, first),
    second: second && describeSample(mission, metric, second),
    difference,
  };
}
