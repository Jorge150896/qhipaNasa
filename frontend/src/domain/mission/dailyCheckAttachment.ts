import type { HabitatId } from '../explorer/models';
import type { DataQuality, MetricId, MissionSnapshot } from './models';

export const gravityContexts = ['microgravity', 'lunar', 'martian'] as const;
export const checkMetricIds = ['heartRate', 'temperature', 'oxygen', 'respiration'] as const;
export const checkDataQualities = ['available', 'stale', 'missing'] as const;

export interface DailyCheckAttachment {
  snapshotId: string;
  capturedAt: string;
  source: 'synthetic';
  habitat: string;
  gravity: (typeof gravityContexts)[number];
  zone?: {
    id: string;
    name: string;
    temperature: number;
    co2: number;
    humidity: number;
  };
  readings: {
    id: MetricId;
    at?: string;
    value: number | null;
    unit: string;
    quality: DataQuality;
  }[];
}

export function createDailyCheckAttachment(
  snapshot: MissionSnapshot,
  crewId: string,
  habitatId: HabitatId,
): DailyCheckAttachment | undefined {
  const crew = snapshot.crew.find(({ id }) => id === crewId);
  if (!crew) return;
  const zone = snapshot.zones.find(({ id }) => id === crew.zoneId);
  return {
    snapshotId: snapshot.id,
    capturedAt: snapshot.capturedAt,
    source: snapshot.source,
    habitat: snapshot.name,
    gravity: habitatId === 'selene' ? 'lunar' : habitatId === 'ares' ? 'martian' : 'microgravity',
    zone: zone && {
      id: zone.id,
      name: zone.name,
      temperature: zone.temperature,
      co2: zone.co2,
      humidity: zone.humidity,
    },
    readings: crew.readings.map((reading) => {
      const sample =
        reading.quality === 'stale'
          ? reading.samples.findLast(({ value }) => value !== null)
          : reading.samples.at(-1);
      const value = reading.quality === 'missing' ? null : (sample?.value ?? null);
      return {
        id: reading.id,
        at: sample?.at,
        value,
        unit: reading.unit,
        quality: value === null ? 'missing' : reading.quality,
      };
    }),
  };
}

export function validDailyCheckAttachment(attachment: DailyCheckAttachment) {
  return (
    Boolean(attachment.snapshotId.trim() && attachment.habitat.trim()) &&
    attachment.source === 'synthetic' &&
    Number.isFinite(Date.parse(attachment.capturedAt)) &&
    gravityContexts.includes(attachment.gravity) &&
    (!attachment.zone ||
      (Boolean(attachment.zone.id.trim() && attachment.zone.name.trim()) &&
        [attachment.zone.temperature, attachment.zone.co2, attachment.zone.humidity].every(
          Number.isFinite,
        ))) &&
    new Set(attachment.readings.map(({ id }) => id)).size === attachment.readings.length &&
    attachment.readings.every(
      ({ id, at, value, unit, quality }) =>
        checkMetricIds.includes(id) &&
        checkDataQualities.includes(quality) &&
        Boolean(unit.trim()) &&
        (at === undefined || Number.isFinite(Date.parse(at))) &&
        (quality === 'missing' ? value === null : value !== null && Number.isFinite(value) && !!at),
    )
  );
}
