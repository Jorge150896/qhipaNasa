import {
  createHealthMeasurement,
  telemetryDefinitions,
} from '@/domain/measurements/HealthMeasurement';
import type { MissionSnapshot } from '@/domain/mission/models';

/** Normalize only this documented synthetic source; never relabel research or device data. */
export function withSyntheticMeasurements(snapshot: MissionSnapshot): MissionSnapshot {
  return {
    ...snapshot,
    crew: snapshot.crew.map((person) => ({
      ...person,
      readings: person.readings.map((reading) => ({
        ...reading,
        samples: reading.samples.map((sample) => ({
          ...sample,
          measurement: createHealthMeasurement(
            {
              id: `${snapshot.id}:${snapshot.scenario}:${person.id}:${reading.id}:${sample.at}`,
              indicator: reading.id,
              value: sample.value,
              unit: reading.unit,
              time: { kind: 'instant', at: sample.at },
              subject: { kind: 'individual', id: person.id },
              source: { kind: 'synthetic', id: `astra:${snapshot.id}:${snapshot.scenario}` },
              method: 'simulated',
              quality:
                sample.value === null
                  ? 'missing'
                  : reading.quality === 'stale'
                    ? 'stale'
                    : 'available',
              context: {
                capturedAt: snapshot.capturedAt,
                activity: person.activity,
                location:
                  snapshot.zones.find((zone) => zone.id === person.zoneId)?.name ?? 'Sin ubicación',
              },
            },
            telemetryDefinitions[reading.id],
          ),
        })),
      })),
    })),
  };
}
