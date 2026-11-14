import { describe, expect, it } from 'vitest';
import {
  createHealthMeasurement,
  MeasurementValidationError,
  telemetryDefinitions,
  type HealthMeasurement,
} from '@/domain/measurements/HealthMeasurement';
import { SimulatedHabitatMissionRepository } from '@/data/explorer/SimulatedHabitatMissionRepository';
import { mapMissionPresentation } from '@/presentation/features/mission/mapMissionPresentation';
const measurement: HealthMeasurement = {
  id: 'sample-1',
  indicator: 'heartRate',
  value: 72,
  unit: 'lpm',
  subject: { kind: 'individual', id: 'person-1' },
  time: { kind: 'instant', at: '2026-11-08T14:32:00Z' },
  source: { kind: 'synthetic', id: 'demo-1' },
  method: 'simulated',
  quality: 'available',
};
describe('Contrato cuantitativo de medición', () => {
  it('conserva cero y no impone umbrales clínicos', () => {
    expect(
      createHealthMeasurement({ ...measurement, value: 0 }, telemetryDefinitions.heartRate).value,
    ).toBe(0);
    expect(
      createHealthMeasurement(
        { ...measurement, indicator: 'temperature', unit: '°C', value: -1 },
        telemetryDefinitions.temperature,
      ).value,
    ).toBe(-1);
  });
  it.each([NaN, Infinity, -Infinity])('rechaza valores no finitos: %s', (value) => {
    expect(() =>
      createHealthMeasurement({ ...measurement, value }, telemetryDefinitions.heartRate),
    ).toThrow(MeasurementValidationError);
  });
  it('rechaza unidades incorrectas sin convertirlas silenciosamente', () => {
    expect(() =>
      createHealthMeasurement({ ...measurement, unit: 'mg/dL' }, telemetryDefinitions.heartRate),
    ).toThrow(MeasurementValidationError);
  });
  it('distingue ausencia de cero y de un valor histórico', () => {
    expect(
      createHealthMeasurement(
        { ...measurement, value: null, quality: 'missing' },
        telemetryDefinitions.heartRate,
      ).value,
    ).toBeNull();
    expect(() =>
      createHealthMeasurement(
        { ...measurement, quality: 'missing' },
        telemetryDefinitions.heartRate,
      ),
    ).toThrow(MeasurementValidationError);
    expect(() =>
      createHealthMeasurement({ ...measurement, value: null }, telemetryDefinitions.heartRate),
    ).toThrow(MeasurementValidationError);
    expect(
      createHealthMeasurement({ ...measurement, quality: 'stale' }, telemetryDefinitions.heartRate)
        .quality,
    ).toBe('stale');
  });
  it.each(['2026-11-08T14:32:00', '2026-02-30T14:32:00Z', 'not-a-date'])(
    'rechaza instantes inválidos o sin zona: %s',
    (at) => {
      expect(() =>
        createHealthMeasurement(
          { ...measurement, time: { kind: 'instant', at } },
          telemetryDefinitions.heartRate,
        ),
      ).toThrow(MeasurementValidationError);
    },
  );
  it('conserva fases de estudio sin inventar una fecha o un tripulante', () => {
    const aggregate = createHealthMeasurement(
      {
        ...measurement,
        id: 'research-median',
        source: { kind: 'research', id: 'study' },
        method: 'derived',
        time: { kind: 'phase', phase: 'L-3' },
        subject: { kind: 'group', id: 'group', sampleCount: 4, statistic: 'median' },
      },
      telemetryDefinitions.heartRate,
    );
    expect(aggregate.time).toEqual({ kind: 'phase', phase: 'L-3' });
    expect(aggregate.subject.kind).toBe('group');
  });
  it('no permite presentar una simulación como dispositivo o método instrumental', () => {
    expect(() =>
      createHealthMeasurement(
        { ...measurement, source: { kind: 'device', id: 'device' } },
        telemetryDefinitions.heartRate,
      ),
    ).toThrow(MeasurementValidationError);
    expect(() =>
      createHealthMeasurement(
        { ...measurement, method: 'instrument' },
        telemetryDefinitions.heartRate,
      ),
    ).toThrow(MeasurementValidationError);
  });
});
describe('Procedencia de los escenarios existentes', () => {
  it('no hereda la identidad de Odyssey al construir otros hábitats', async () => {
    const mission = await new SimulatedHabitatMissionRepository('aurora').load('baseline');
    const sample = mission.crew[0].readings[0].samples[0].measurement;
    expect(sample?.subject).toEqual({ kind: 'individual', id: 'ines' });
    expect(sample?.id).toContain('aurora:baseline:ines');
    expect(sample?.source.kind).toBe('synthetic');
    const mapped = mapMissionPresentation(
      mission,
      { checks: [], reviewedObservationIds: [] },
      'ines',
      'heartRate',
      'laboratory',
      '2026-11-08',
    );
    expect(mapped.metric.history[0].trace?.fields).toContainEqual({
      label: 'Persona o grupo',
      value: 'Inés Rojas',
    });
    expect(
      mapped.metric.history[0].trace?.fields.find(
        (field) => field.label === 'Contexto de la instantánea',
      )?.value,
    ).toContain('Hábitat de descanso');
  });
  it('mantiene las muestras ausentes, sus horas y su origen', async () => {
    const mission = await new SimulatedHabitatMissionRepository('odyssey').load('sensor-gap');
    const data = mapMissionPresentation(
      mission,
      { checks: [], reviewedObservationIds: [] },
      'elena',
      'oxygen',
      'habitat',
      '2026-11-08',
    );
    expect(data.metric.history.at(-1)?.trace?.quality).toBe('Muestra ausente');
    expect(data.metric.history.at(-1)?.numericValue).toBeNull();
    expect(data.metric.history.at(-1)?.trace?.source).toBe('Sintético');
  });
});
