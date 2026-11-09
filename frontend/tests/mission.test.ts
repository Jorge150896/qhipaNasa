import { describe, expect, it } from 'vitest';
import { SimulatedMissionRepository } from '@/data/mission/SimulatedMissionRepository';
import { mapMissionPresentation } from '@/presentation/features/mission/mapMissionPresentation';
const emptyJournal = { checks: [], reviewedObservationIds: [] };
describe('Escenarios y modelos presentables', () => {
  it('es reproducible y el escenario base no programa incidencias', async () => {
    const repo = new SimulatedMissionRepository();
    expect(await repo.load('baseline')).toEqual(await repo.load('baseline'));
    expect((await repo.load('baseline')).observations).toEqual([]);
  });
  it('no transforma una lectura antigua en actual al perderse la señal', async () => {
    const snapshot = await new SimulatedMissionRepository().load('sensor-gap');
    const data = mapMissionPresentation(
      snapshot,
      emptyJournal,
      'elena',
      'oxygen',
      'habitat',
      '2026-11-08',
    );
    expect(data.metric.value).toBe('—');
    expect(data.metric.quality).toBe('Sin señal reciente');
    expect(data.metric.history.filter((item) => item.missing)).toHaveLength(3);
    expect(data.metric.chart.points.filter((point) => point.y === null)).toHaveLength(3);
    expect(data.metric.chart.points.at(-1)?.y).toBeNull();
    expect(data.metric.lastReading).toContain('14:26 UTC');
    expect(data.analysis.recommendation).toContain('sensor');
  });
  it('mantiene la persona seleccionada aunque se explore otro ambiente', async () => {
    const snapshot = await new SimulatedMissionRepository().load('sleep-change');
    const data = mapMissionPresentation(
      snapshot,
      { ...emptyJournal, reviewedObservationIds: ['sleep-elena-v1'] },
      'mateo',
      'heartRate',
      'laboratory',
      '2026-11-08',
    );
    expect(data.selected.name).toBe('Mateo Silva');
    expect(data.metric.value).toBe('108');
    expect(data.selectedZone.name).toBe('Laboratorio');
    expect(data.pendingCount).toBe('0');
    expect(data.observations[0].reviewed).toBe(true);
  });
  it('respeta una cancelación solicitada', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      new SimulatedMissionRepository().load('baseline', controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
