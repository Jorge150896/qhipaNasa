import type { AppLanguage } from '@/domain/assistant/AppLanguage';
import type { LoadSpaceExplorer } from '@/domain/usecases/LoadSpaceExplorer';
import type { DestinationKey, ExplorerData, HabitatData } from './types';
const destinations: { id: DestinationKey; name: string; category: string; subtitle: string }[] = [
  {
    id: 'earth',
    name: 'Tierra',
    category: 'Contexto planetario',
    subtitle: 'Órbita terrestre · Estación Aurora',
  },
  { id: 'moon', name: 'Luna', category: 'Contexto lunar', subtitle: 'Superficie · Base Selene' },
  { id: 'mars', name: 'Marte', category: 'Contexto marciano', subtitle: 'Superficie · Base Ares' },
  {
    id: 'station',
    name: 'Estación Aurora',
    category: 'Estación orbital',
    subtitle: 'Órbita de la Tierra',
  },
  {
    id: 'ship',
    name: 'Odyssey 01',
    category: 'Nave en tránsito',
    subtitle: 'Rumbo a Marte · día 042',
  },
];
export function mapExplorerPresentation(
  result: Awaited<ReturnType<LoadSpaceExplorer['execute']>>,
  language: AppLanguage = 'es',
): ExplorerData {
  const habitats = result.habitats.map((habitat) => {
    const pendingChecks = habitat.crew.filter((person) => person.checkDone === false).length;
    const data: HabitatData = {
      id: habitat.id,
      name: habitat.name,
      location: habitat.location,
      description: habitat.description,
      timestamp:
        new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-PE', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'UTC',
          hourCycle: 'h23',
        }).format(new Date(habitat.capturedAt)) + ' UTC',
      scenario: {
        baseline: 'Rutina de misión',
        'sleep-change': 'Cambio en el descanso',
        'sensor-gap': 'Pérdida de señal',
      }[habitat.scenario],
      crewCount: String(habitat.crew.length),
      pendingChecks: habitat.journalAvailable ? String(pendingChecks) : '—',
      pendingObservations:
        habitat.pendingObservations === null ? '—' : String(habitat.pendingObservations),
      unavailableSensors: String(habitat.unavailableSensors),
      journalAvailable: habitat.journalAvailable,
      crew: habitat.crew.map((person) => ({
        ...person,
        check:
          person.checkDone === null
            ? 'Registro no disponible'
            : person.checkDone
              ? 'Chequeo registrado'
              : 'Chequeo pendiente',
      })),
    };
    return { destination: habitat.destination, data };
  });
  return {
    totalCrew: String(result.totalCrew),
    totalHabitats: String(habitats.length),
    today: result.today,
    pendingChecks: result.habitats.every((habitat) => habitat.journalAvailable)
      ? String(
          result.habitats
            .flatMap((habitat) => habitat.crew)
            .filter((person) => person.checkDone === false).length,
        )
      : '—',
    destinations: destinations.map((destination) => {
      const entries = habitats
        .filter(
          (habitat) =>
            habitat.destination === destination.id ||
            (destination.id === 'earth' && habitat.destination === 'station'),
        )
        .map((habitat) => habitat.data);
      return {
        ...destination,
        habitats: entries,
        crewCount: String(entries.reduce((count, habitat) => count + habitat.crew.length, 0)),
      };
    }),
  };
}
