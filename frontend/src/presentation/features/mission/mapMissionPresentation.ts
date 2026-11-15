import { mapMeasurementTrace } from './mapMeasurementTrace';
import type { CrewJournal, MissionSnapshot, Reading } from '@/domain/mission/models';
import { metricLabels } from './constants';
import type { MetricData, MissionData, SensorKey } from './types';
const number = (value: number) =>
  new Intl.NumberFormat('es-PE', { maximumFractionDigits: 1 }).format(value);
const time = (iso: string) =>
  new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(new Date(iso));
const date = (iso: string) =>
  new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso));
function mapMetric(reading: Reading, person: { id: string; name: string }): MetricData {
  const last = reading.samples.at(-1);
  const valid = reading.samples.filter(
    (sample): sample is { at: string; value: number } => sample.value !== null,
  );
  const values = valid.map((sample) => sample.value);
  const min = values.length ? Math.min(...values) : 0,
    max = values.length ? Math.max(...values) : 0;
  const range = max - min || 1;
  const paths: string[] = [];
  let path = '';
  reading.samples.forEach((sample, i) => {
    if (sample.value === null) {
      if (path) paths.push(path);
      path = '';
      return;
    }
    const x = 6 + (i * 588) / Math.max(reading.samples.length - 1, 1);
    const y = max === min ? 82 : 136 - ((sample.value - min) / range) * 108;
    path += `${path ? ' L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  });
  if (path) paths.push(path);
  const lastValid = valid.at(-1);
  const quality =
    reading.quality === 'available'
      ? 'Lectura disponible'
      : reading.quality === 'stale'
        ? 'Lectura antigua'
        : 'Sin señal reciente';
  return {
    id: reading.id,
    ...metricLabels[reading.id],
    unit: reading.unit,
    value: last?.value == null || reading.quality !== 'available' ? '—' : number(last.value),
    quality,
    comparison: {
      reference: valid[0]
        ? `${number(valid[0].value)} ${reading.unit} · ${time(valid[0].at)} UTC`
        : 'Sin muestra de referencia',
      difference:
        last?.value == null || reading.quality !== 'available' || !valid[0]
          ? 'Sin comparación actual: falta una lectura vigente.'
          : `${last.value - valid[0].value > 0 ? '+' : last.value - valid[0].value < 0 ? '−' : ''}${number(Math.abs(last.value - valid[0].value))} ${reading.unit} respecto a la primera muestra disponible.`,
    },
    qualityTone: reading.quality === 'available' ? 'normal' : 'attention',
    lastReading: lastValid
      ? `Última disponible: ${number(lastValid.value)} ${reading.unit} · ${time(lastValid.at)} UTC`
      : 'No hay muestras disponibles.',
    history: reading.samples.map((sample) => ({
      at: sample.at,
      time: `${time(sample.at)} UTC`,
      numericValue: sample.value,
      value: sample.value === null ? 'Sin muestra' : `${number(sample.value)} ${reading.unit}`,
      missing: sample.value === null,
      trace: sample.measurement ? mapMeasurementTrace(sample.measurement, person) : undefined,
    })),
    chart: {
      paths,
      points: reading.samples.map((sample, i) => ({
        x: 6 + (i * 588) / Math.max(reading.samples.length - 1, 1),
        y:
          sample.value === null
            ? null
            : max === min
              ? 82
              : 136 - ((sample.value - min) / range) * 108,
      })),
      min: number(min),
      max: number(max),
      start: `${time(reading.samples[0].at)} UTC`,
      end: `${time(last!.at)} UTC`,
    },
  };
}
export function mapMissionPresentation(
  snapshot: MissionSnapshot,
  journal: CrewJournal,
  crewId: string,
  metricId: SensorKey,
  zoneId: string,
  today: string,
): MissionData {
  const crew = snapshot.crew.map((person) => ({
    id: person.id,
    name: person.name,
    initials: person.initials,
    role: person.role,
    activity: person.activity,
    zoneId: person.zoneId,
    location: snapshot.zones.find((zone) => zone.id === person.zoneId)?.name ?? 'Sin ubicación',
    sleep: `${number(person.sleepHours)} h`,
    metrics: person.readings.map((reading) => mapMetric(reading, person)),
  }));
  const selected = crew.find((person) => person.id === crewId) ?? crew[0];
  const metric = selected.metrics.find((item) => item.id === metricId) ?? selected.metrics[0];
  const zones = snapshot.zones.map((zone) => ({
    id: zone.id,
    name: zone.name,
    description: zone.description,
    occupants:
      crew
        .filter((person) => person.zoneId === zone.id)
        .map((person) => person.name)
        .join(', ') || 'Sin ocupantes',
    readings: [
      { label: 'Temperatura', value: number(zone.temperature), unit: '°C' },
      { label: 'CO₂', value: number(zone.co2), unit: 'ppm' },
      { label: 'Humedad', value: number(zone.humidity), unit: '%' },
      { label: 'Ruido', value: number(zone.noise), unit: 'dB' },
    ],
  }));
  const observations = snapshot.observations.map((item) => ({
    ...item,
    crew: crew.find((person) => person.id === item.crewId)?.name ?? item.crewId,
    category: item.category === 'data-quality' ? 'Calidad de datos' : 'Contexto de misión',
    reviewed: journal.reviewedObservationIds.includes(item.id),
  }));
  const checks = journal.checks.map((item) => ({
    id: item.id,
    crewId: item.crewId,
    recordedAt: item.recordedAt,
    crew: crew.find((person) => person.id === item.crewId)?.name ?? item.crewId,
    date: `${date(item.recordedAt)} · ${time(item.recordedAt)} UTC`,
    sleep: `${number(item.sleepHours)} h`,
    fatigue: `${item.fatigue} / 5`,
    mood: { good: 'Bien', neutral: 'Regular', low: 'Bajo' }[item.mood],
    note: item.note,
    context: item.context,
    discomfortRegion: item.discomfortRegion,
  }));
  const todayCheck = journal.checks.find(
    (item) => item.crewId === selected.id && item.recordedAt.slice(0, 10) === today,
  );
  return {
    name: snapshot.name,
    capturedAt: snapshot.capturedAt,
    day: String(snapshot.missionDay).padStart(3, '0'),
    time: `${time(snapshot.capturedAt)} UTC`,
    date: date(snapshot.capturedAt),
    scenario: snapshot.scenario,
    crew,
    selected,
    metric,
    zones,
    selectedZone: zones.find((zone) => zone.id === zoneId) ?? zones[0],
    observations,
    pendingCount: String(observations.filter((item) => !item.reviewed).length),
    checks,
    todayCheck: Boolean(todayCheck),
    dailyCheckDraft: todayCheck
      ? {
          sleep: String(todayCheck.sleepHours),
          fatigue: String(todayCheck.fatigue),
          mood: todayCheck.mood,
          note: todayCheck.note,
          context: todayCheck.context,
          discomfortRegion: todayCheck.discomfortRegion,
        }
      : undefined,
    analysis: {
      summary:
        snapshot.scenario === 'sleep-change'
          ? `${crew[0].name} registra menos sueño que en el escenario base y el hábitat presenta lecturas distintas. La coincidencia no demuestra una causa.`
          : snapshot.scenario === 'sensor-gap'
            ? `No hay muestras recientes de SpO₂ de ${crew[0].name}. La lectura histórica se conserva, pero no se presenta como un valor actual.`
            : `La instantánea reúne ${crew.length} tripulantes con sus actividades y zonas. No hay observaciones programadas en este escenario.`,
      recommendation:
        snapshot.scenario === 'sleep-change'
          ? 'Revisar el registro de sueño y contrastarlo con una serie ambiental completa, verificando calidad y sincronización.'
          : snapshot.scenario === 'sensor-gap'
            ? 'Comprobar la conexión del sensor y obtener una nueva muestra antes de interpretar la oxigenación.'
            : 'Completar el chequeo diario y consultar el historial antes de interpretar una medición aislada.',
      evidence: observations.flatMap((item) => item.evidence).length
        ? observations.flatMap((item) => item.evidence)
        : [
            `Instantánea sintética de ${crew.length} tripulantes.`,
            'Ocho muestras por indicador, entre 14:18 y 14:32 UTC.',
          ],
    },
  };
}
