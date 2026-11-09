import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LocalSpaceExplorerRepository } from '@/data/explorer/LocalSpaceExplorerRepository';
import { SimulatedHabitatMissionRepository } from '@/data/explorer/SimulatedHabitatMissionRepository';
import { journalKey } from '@/data/explorer/simulatedHabitats';
import { LocalCrewJournalRepository } from '@/data/mission/LocalCrewJournalRepository';
import { LoadSpaceExplorer } from '@/domain/usecases/LoadSpaceExplorer';
import { LoadMission } from '@/domain/usecases/LoadMission';
import {
  LoadCrewJournal,
  RecordDailyCheck,
  ReviewObservation,
} from '@/domain/usecases/ManageCrewJournal';
import { mapExplorerPresentation } from '@/presentation/features/space-map/mapExplorerPresentation';
import { useMission } from '@/presentation/features/mission/useMission';
import { clock, MemoryStorage } from './helpers';

describe('Explorador de tripulación', () => {
  it('cuenta personas únicas, vincula la estación con Tierra y mantiene Odyssey en tránsito', async () => {
    const result = await new LoadSpaceExplorer(
      new LocalSpaceExplorerRepository(new MemoryStorage()),
      clock,
    ).execute();
    expect(result.totalCrew).toBe(12);
    expect(result.habitats.map((habitat) => habitat.crew.length)).toEqual([3, 4, 2, 3]);
    const data = mapExplorerPresentation(result);
    expect(
      data.destinations.find((item) => item.id === 'earth')?.habitats.map((item) => item.id),
    ).toEqual(['aurora']);
    expect(
      data.destinations.find((item) => item.id === 'mars')?.habitats.map((item) => item.id),
    ).toEqual(['ares']);
    expect(data.destinations.find((item) => item.id === 'ship')?.habitats[0].id).toBe('odyssey');
    expect(data.pendingChecks).toBe('12');
    expect(
      data.destinations.find((item) => item.id === 'moon')?.habitats[0].unavailableSensors,
    ).toBe('1');
  });
  it('conserva el diario original y aísla los chequeos y revisiones de otros hábitats', async () => {
    const storage = new MemoryStorage();
    const legacy = new LocalCrewJournalRepository(storage);
    const original = await new RecordDailyCheck(legacy, clock).execute({
      crewId: 'elena',
      sleepHours: 7,
      fatigue: 2,
      mood: 'good',
      note: 'Original',
    });
    await new RecordDailyCheck(
      new LocalCrewJournalRepository(storage, journalKey('selene')),
      clock,
    ).execute({ crewId: 'ana', sleepHours: 6, fatigue: 3, mood: 'neutral', note: 'Lunar' });
    expect(await legacy.load()).toEqual(original);
    const explorer = await new LoadSpaceExplorer(
      new LocalSpaceExplorerRepository(storage),
      clock,
    ).execute();
    expect(explorer.habitats.find((habitat) => habitat.id === 'odyssey')?.crew[0].checkDone).toBe(
      true,
    );
    expect(explorer.habitats.find((habitat) => habitat.id === 'selene')?.crew[0].checkDone).toBe(
      true,
    );
    expect(explorer.habitats.find((habitat) => habitat.id === 'ares')?.crew[0].checkDone).toBe(
      false,
    );
    expect(storage.entries.get('astra.demo.journal.v1')).toContain('Original');
  });
  it('representa un diario ilegible como desconocido sin borrarlo ni ocultar los otros hábitats', async () => {
    const storage = new MemoryStorage();
    storage.write(journalKey('aurora'), 'incompatible');
    const result = mapExplorerPresentation(
      await new LoadSpaceExplorer(new LocalSpaceExplorerRepository(storage), clock).execute(),
    );
    expect(result.pendingChecks).toBe('—');
    const aurora = result.destinations.find((item) => item.id === 'station')!.habitats[0];
    expect(aurora.pendingObservations).toBe('—');
    expect(aurora.journalAvailable).toBe(false);
    expect(result.destinations.find((item) => item.id === 'moon')!.habitats[0].pendingChecks).toBe(
      '2',
    );
    expect(storage.read(journalKey('aurora'))).toBe('incompatible');
  });
  it('guarda el chequeo de la persona mostrada al entrar directamente a una base', async () => {
    const journal = new LocalCrewJournalRepository(new MemoryStorage(), journalKey('selene'));
    const dependencies = {
      initialScenario: 'sensor-gap' as const,
      loadMission: new LoadMission(new SimulatedHabitatMissionRepository('selene')),
      loadJournal: new LoadCrewJournal(journal),
      recordCheck: new RecordDailyCheck(journal, clock),
      reviewObservation: new ReviewObservation(journal),
    };
    const { result } = renderHook(() => useMission(dependencies));
    await waitFor(() => expect(result.current.data?.selected.name).toBe('Ana Costa'));
    expect(result.current.data?.scenario).toBe('sensor-gap');
    expect(result.current.data?.analysis.summary).toContain('Ana Costa');
    await act(async () => {
      await result.current.actions.saveCheck({ sleep: '7', fatigue: '2', mood: 'good', note: '' });
    });
    expect((await journal.load()).checks[0].crewId).toBe('ana');
    expect(result.current.data?.crew.map((person) => person.id)).toEqual(['ana', 'leo']);
  });
  it('respeta cancelación sin devolver un catálogo parcial', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      new LocalSpaceExplorerRepository(new MemoryStorage()).load(controller.signal),
    ).rejects.toThrow('Aborted');
  });
});
