import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LocalCrewHealthRepository } from '@/data/health/LocalCrewHealthRepository';
import { LocalCrewJournalRepository } from '@/data/mission/LocalCrewJournalRepository';
import { SimulatedMissionRepository } from '@/data/mission/SimulatedMissionRepository';
import {
  LoadCrewHealth,
  RecordCrewHealth,
  ReviewCrewHealth,
} from '@/domain/usecases/ManageCrewHealth';
import { RecordDailyCheck } from '@/domain/usecases/ManageCrewJournal';
import { mapMissionPresentation } from '@/presentation/features/mission/mapMissionPresentation';
import { mapCrewHealthPresentation } from '@/presentation/features/crew-health/mapCrewHealthPresentation';
import { useCrewHealthViewModel } from '@/presentation/features/crew-health/useCrewHealthViewModel';
import { MemoryStorage, clock } from './helpers';
import type { KeyValueStorage } from '@/infrastructure/storage/KeyValueStorage';
function dependencies(storage: KeyValueStorage = new MemoryStorage(), habitat = 'odyssey') {
  const repository = new LocalCrewHealthRepository(storage, habitat);
  let sequence = 0;
  return {
    load: new LoadCrewHealth(repository),
    record: new RecordCrewHealth(repository, clock, { next: () => `entry-${++sequence}` }),
    review: new ReviewCrewHealth(repository, clock),
    clock,
  };
}
async function mission(crewId = 'elena', scenario: 'baseline' | 'sensor-gap' = 'baseline') {
  return mapMissionPresentation(
    await new SimulatedMissionRepository().load(scenario),
    { checks: [], reviewedObservationIds: [] },
    crewId,
    'heartRate',
    'habitat',
    '2026-11-08',
  );
}
const input = {
  crewId: 'elena',
  systemId: 'fitness' as const,
  reportedState: 'no-change' as const,
  note: 'Sesión ficticia',
  activity: 'Bicicleta',
  minutes: 20,
};
describe('Salud por sistemas', () => {
  it('conserva el diario anterior y separa personas, áreas y hábitats', async () => {
    const storage = new MemoryStorage();
    await new RecordDailyCheck(new LocalCrewJournalRepository(storage), clock).execute({
      crewId: 'elena',
      sleepHours: 7,
      fatigue: 2,
      mood: 'good',
      note: 'Diario previo',
    });
    const original = storage.read('astra.demo.journal.v1');
    const deps = dependencies(storage);
    await deps.record.execute(input);
    await deps.record.execute({ ...input, crewId: 'mateo', note: 'Otra persona' });
    const other = dependencies(storage, 'selene');
    await other.record.execute({ ...input, crewId: 'ana' });
    const journal = await deps.load.execute();
    const data = mapCrewHealthPresentation(
      { mission: await mission(), habitatId: 'odyssey' },
      journal,
      'fitness',
      '2026-11-08',
    );
    expect(data.entryCount).toBe('1');
    expect(data.history[0].duration).toBe('20 min registrados');
    expect(data.history[0].note).not.toContain('Otra persona');
    expect((await other.load.execute()).entries[0].crewId).toBe('ana');
    expect(storage.read('astra.demo.journal.v1')).toBe(original);
    expect(
      mapCrewHealthPresentation(
        { mission: await mission(), habitatId: 'odyssey' },
        journal,
        'vision',
        '2026-11-08',
      ).history,
    ).toHaveLength(0);
  });
  it('distingue duración ausente de cero y valida sin introducir umbrales clínicos', async () => {
    const deps = dependencies();
    await deps.record.execute({ ...input, minutes: null, activity: '' });
    await deps.record.execute({ ...input, minutes: 0, activity: 'Sin sesión' });
    expect((await deps.load.execute()).entries.map((entry) => entry.minutes)).toEqual([0, null]);
    expect(() => deps.record.execute({ ...input, minutes: NaN })).toThrow('duración');
    expect(() => deps.record.execute({ ...input, reportedState: 'change', note: '' })).toThrow(
      'Describe el cambio',
    );
    expect(() => deps.record.execute({ ...input, systemId: 'vision' })).toThrow(
      'pertenecen al registro de ejercicio',
    );
    expect((await deps.load.execute()).entries).toHaveLength(2);
  });
  it('preserva datos ilegibles al fallar la lectura o escritura de nuevos registros', async () => {
    const storage = new MemoryStorage();
    storage.write('astra.demo.health.v1:odyssey', 'incompatible');
    const deps = dependencies(storage);
    await expect(deps.load.execute()).rejects.toThrow();
    await expect(deps.record.execute(input)).rejects.toThrow();
    expect(storage.read('astra.demo.health.v1:odyssey')).toBe('incompatible');
    const denied = dependencies({
      read: () => null,
      write: () => {
        throw new Error('quota');
      },
    });
    await expect(denied.record.execute(input)).rejects.toThrow('quota');
  });
  it('la revisión documental es diaria, por área y persona, y puede volver a pendiente', async () => {
    const deps = dependencies();
    await deps.review.execute('elena', 'vision', true);
    const journal = await deps.load.execute();
    const context = { mission: await mission(), habitatId: 'odyssey' };
    expect(mapCrewHealthPresentation(context, journal, 'vision', '2026-11-08').reviewed).toBe(true);
    expect(mapCrewHealthPresentation(context, journal, 'cardio', '2026-11-08').reviewed).toBe(
      false,
    );
    expect(mapCrewHealthPresentation(context, journal, 'vision', '2026-11-09').reviewed).toBe(
      false,
    );
    expect(
      mapCrewHealthPresentation(
        { ...context, mission: await mission('mateo') },
        journal,
        'vision',
        '2026-11-08',
      ).reviewed,
    ).toBe(false);
    await deps.review.execute('elena', 'vision', false);
    expect((await deps.load.execute()).reviews).toHaveLength(1);
    expect((await deps.load.execute()).reviews[0].reviewed).toBe(false);
  });
  it('no confunde ausencia de evaluación con salud normal ni crea mediciones oculares', async () => {
    const context = { mission: await mission('elena', 'sensor-gap'), habitatId: 'odyssey' };
    const data = mapCrewHealthPresentation(
      context,
      { entries: [], reviews: [] },
      'vision',
      '2026-11-08',
    );
    expect(data.metrics).toHaveLength(0);
    expect(data.stateLabel).toBe('Sin autoevaluación registrada');
    expect(data.system.limitation).toContain('SANS');
    expect(data.analysis.next).toContain('calidad y vigencia');
    const cardio = mapCrewHealthPresentation(
      context,
      { entries: [], reviews: [] },
      'cardio',
      '2026-11-08',
    );
    expect(
      cardio.metrics.find((metric) => metric.id === 'oxygen')?.comparison?.difference,
    ).toContain('Sin comparación actual');
    expect(cardio.pendingObservations).toContain('Sin lecturas recientes de SpO₂');
    const mateo = mapCrewHealthPresentation(
      { ...context, mission: await mission('mateo', 'sensor-gap') },
      { entries: [], reviews: [] },
      'cardio',
      '2026-11-08',
    );
    expect(mateo.pendingObservations).toHaveLength(0);
  });
  it('el hook guarda bajo la persona y área seleccionadas y no mezcla sus mensajes', async () => {
    const deps = dependencies();
    const elena = { mission: await mission(), habitatId: 'odyssey' };
    const mateo = { mission: await mission('mateo'), habitatId: 'odyssey' };
    const { result, rerender } = renderHook(
      ({ context }) => useCrewHealthViewModel(deps, context, 'fitness'),
      { initialProps: { context: elena } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.save({
        state: 'no-change',
        note: 'Registro de Elena',
        activity: 'Bicicleta',
        minutes: '15',
      });
    });
    expect(result.current.data.history).toHaveLength(1);
    expect(result.current.message?.error).toBe(false);
    rerender({ context: mateo });
    expect(result.current.data.history).toHaveLength(0);
    expect(result.current.message).toBeNull();
    await act(async () => {
      await result.current.save({
        state: 'no-change',
        note: 'Registro de Mateo',
        activity: 'Bicicleta',
        minutes: '10',
      });
    });
    expect((await deps.load.execute()).entries.map((entry) => entry.crewId)).toEqual([
      'mateo',
      'elena',
    ]);
    rerender({ context: elena });
    expect(result.current.data.history[0].note).toBe('Registro de Elena');
  });
  it('el hook informa un fallo de escritura sin anunciar éxito', async () => {
    const deps = dependencies({
      read: () => null,
      write: () => {
        throw new Error('quota');
      },
    });
    const context = { mission: await mission(), habitatId: 'odyssey' };
    const { result } = renderHook(() => useCrewHealthViewModel(deps, context, 'vision'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    let saved = true;
    await act(async () => {
      saved = await result.current.save({
        state: 'no-change',
        note: 'Registro ficticio',
        activity: '',
        minutes: '',
      });
    });
    expect(saved).toBe(false);
    expect(result.current.message?.error).toBe(true);
    expect(result.current.message?.text).toContain('No se pudo guardar');
    expect(result.current.data.history).toHaveLength(0);
  });
});
