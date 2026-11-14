import type { HabitatDescriptor, HabitatId } from '@/domain/explorer/models';
export const simulatedHabitats: readonly HabitatDescriptor[] = [
  {
    id: 'odyssey',
    name: 'Odyssey 01',
    destination: 'ship',
    location: 'En tránsito hacia Marte',
    description:
      'Nave de exploración. La tripulación permanece en tránsito: no se contabiliza en la base de Marte.',
    initialScenario: 'sleep-change',
  },
  {
    id: 'aurora',
    name: 'Estación Aurora',
    destination: 'station',
    location: 'Órbita terrestre',
    description:
      'Estación ficticia en órbita terrestre. Sus cuatro tripulantes también aparecen al consultar el contexto Tierra, sin duplicarse en el total.',
    initialScenario: 'baseline',
  },
  {
    id: 'selene',
    name: 'Base Selene',
    destination: 'moon',
    location: 'Superficie lunar',
    description: 'Hábitat lunar ficticio con dos tripulantes y un escenario de pérdida de señal.',
    initialScenario: 'sensor-gap',
  },
  {
    id: 'ares',
    name: 'Base Ares',
    destination: 'mars',
    location: 'Superficie de Marte',
    description: 'Hábitat marciano ficticio dedicado a investigación y descanso de la tripulación.',
    initialScenario: 'sleep-change',
  },
];
export function getSimulatedHabitat(id: HabitatId) {
  const habitat = simulatedHabitats.find((entry) => entry.id === id);
  if (!habitat) throw new Error('Hábitat no disponible.');
  return habitat;
}
export function journalKey(id: HabitatId) {
  return id === 'odyssey' ? 'astra.demo.journal.v1' : `astra.demo.journal.v1:${id}`;
}
