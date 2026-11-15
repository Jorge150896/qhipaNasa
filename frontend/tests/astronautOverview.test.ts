import { describe, expect, it } from 'vitest';
import { SimulatedHabitatMissionRepository } from '@/data/explorer/SimulatedHabitatMissionRepository';
import { mapMissionPresentation } from '@/presentation/features/mission/mapMissionPresentation';
import { mapAstronautOverview } from '@/presentation/features/mission-overview/mapAstronautOverview';

async function mission(scenario: 'baseline' | 'sensor-gap') {
  const snapshot = await new SimulatedHabitatMissionRepository('odyssey').load(scenario);
  return mapMissionPresentation(
    snapshot,
    { checks: [], reviewedObservationIds: [] },
    'elena',
    'oxygen',
    'laboratory',
    '2026-11-14',
  );
}
describe('Resumen operacional', () => {
  it('mide cobertura de muestras sin normalizar valores fisiológicos', async () => {
    const data = await mission('baseline');
    data.selected.metrics[0].history[0].numericValue = 0;
    const result = mapAstronautOverview(data);
    expect(result.currentSignals).toBe(4);
    expect(result.metrics[0].coverage).toBe(1);
    expect(result.metrics[0].value).toBe(data.selected.metrics[0].value);
  });
  it('conserva ausencia de señal y distingue módulo explorado de ubicación personal', async () => {
    const data = await mission('sensor-gap');
    const result = mapAstronautOverview(data);
    expect(result.currentSignals).toBe(3);
    const oxygen = result.metrics.find((item) => item.id === 'oxygen');
    expect(oxygen?.available).toBe(5);
    expect(oxygen?.total).toBe(8);
    expect(oxygen?.coverage).toBe(5 / 8);
    expect(result.environment.name).toBe(data.selectedZone.name);
    expect(result.location).toBe(data.selected.location);
  });
});
