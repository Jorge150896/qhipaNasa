import { describe, expect, it } from 'vitest';
import { LocalCrewJournalRepository } from '@/data/mission/LocalCrewJournalRepository';
import { RecordDailyCheck, ReviewObservation } from '@/domain/usecases/ManageCrewJournal';
import { CheckValidationError, type DailyCheckInput } from '@/domain/mission/models';
import { clock, MemoryStorage } from './helpers';
const valid: DailyCheckInput = {
  crewId: 'elena',
  sleepHours: 7.5,
  fatigue: 2,
  mood: 'good',
  note: '  Registro ficticio  ',
};
describe('Chequeo diario y persistencia', () => {
  it('conserva el registro y las revisiones al reconstruir el repositorio', async () => {
    const storage = new MemoryStorage();
    const first = new LocalCrewJournalRepository(storage);
    await new RecordDailyCheck(first, clock).execute(valid);
    await new ReviewObservation(first).execute('sleep-elena-v1', true);
    const journal = await new LocalCrewJournalRepository(storage).load();
    expect(journal.checks).toHaveLength(1);
    expect(journal.checks[0]).toMatchObject({
      ...valid,
      note: 'Registro ficticio',
      recordedAt: '2026-11-08T20:00:00.000Z',
    });
    expect(journal.reviewedObservationIds).toEqual(['sleep-elena-v1']);
  });
  it('actualiza el día del tripulante sin duplicarlo ni borrar otras personas', async () => {
    const repo = new LocalCrewJournalRepository(new MemoryStorage());
    const record = new RecordDailyCheck(repo, clock);
    await record.execute(valid);
    await record.execute({ ...valid, crewId: 'mateo' });
    await record.execute({ ...valid, sleepHours: 6 });
    const result = await repo.load();
    expect(result.checks).toHaveLength(2);
    expect(result.checks.find((item) => item.crewId === 'elena')?.sleepHours).toBe(6);
  });
  it.each([-1, 25, Number.NaN, Infinity])('rechaza horas de sueño inválidas: %s', async (hours) => {
    const repo = new LocalCrewJournalRepository(new MemoryStorage());
    expect(() =>
      new RecordDailyCheck(repo, clock).execute({ ...valid, sleepHours: hours }),
    ).toThrow(CheckValidationError);
    expect((await repo.load()).checks).toEqual([]);
  });
  it('rechaza formatos de almacenamiento incompatibles sin sobrescribirlos', async () => {
    const storage = new MemoryStorage();
    storage.write('astra.demo.journal.v1', '{"version":999,"checks":[]}');
    const repo = new LocalCrewJournalRepository(storage);
    await expect(repo.load()).rejects.toThrow('formato compatible');
    expect(storage.read('astra.demo.journal.v1')).toContain('999');
  });
  it('valida escalas y campos de actividad en el caso de uso', async () => {
    const repo = new LocalCrewJournalRepository(new MemoryStorage());
    const record = new RecordDailyCheck(repo, clock);
    expect(() =>
      record.execute({
        ...valid,
        context: { activity: 'exercise', moment: 'before', measurements: { effort: 11 } },
      }),
    ).toThrow(CheckValidationError);
    expect(() =>
      record.execute({
        ...valid,
        context: { activity: 'eva', moment: 'incident', measurements: { handDiscomfort: 6 } },
      }),
    ).toThrow(CheckValidationError);
    expect(() =>
      record.execute({
        ...valid,
        context: { activity: 'cabin', moment: 'after', measurements: { restInterruptions: 1.5 } },
      }),
    ).toThrow(CheckValidationError);
    expect(() =>
      record.execute({
        ...valid,
        context: { activity: 'surface', moment: 'after', measurements: { effort: 2 } },
      }),
    ).toThrow(CheckValidationError);
    expect((await repo.load()).checks).toEqual([]);
  });
  it('propaga un fallo de escritura para no anunciar un guardado falso', async () => {
    const storage = {
      read: () => null,
      write: () => {
        throw new Error('Quota exceeded');
      },
    };
    await expect(
      new RecordDailyCheck(new LocalCrewJournalRepository(storage), clock).execute(valid),
    ).rejects.toThrow('Quota exceeded');
  });
});
