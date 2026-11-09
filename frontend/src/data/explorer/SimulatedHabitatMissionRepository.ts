import type { HabitatId } from '@/domain/explorer/models';
import type { MissionRepository } from '@/domain/mission/ports';
import type { MissionSnapshot, ScenarioId } from '@/domain/mission/models';
import { SimulatedMissionRepository } from '@/data/mission/SimulatedMissionRepository';
import { getSimulatedHabitat } from './simulatedHabitats';
const rosters = {
  aurora: [
    ['ines', 'Inés Rojas', 'IR'],
    ['diego', 'Diego Luna', 'DL'],
    ['sara', 'Sara Kim', 'SK'],
    ['omar', 'Omar Ruiz', 'OR'],
  ],
  selene: [
    ['ana', 'Ana Costa', 'AC'],
    ['leo', 'Leo Park', 'LP'],
  ],
  ares: [
    ['nora', 'Nora Díaz', 'ND'],
    ['hugo', 'Hugo Reyes', 'HR'],
    ['maya', 'Maya Chen', 'MC'],
  ],
} as const;
/** All habitats use the same documented synthetic scenario generator, never NASA measurements. */
export class SimulatedHabitatMissionRepository implements MissionRepository {
  constructor(private readonly habitatId: HabitatId) {}
  async load(scenario: ScenarioId, signal?: AbortSignal): Promise<MissionSnapshot> {
    const template = await new SimulatedMissionRepository().load(scenario, signal);
    if (this.habitatId === 'odyssey') return template;
    const habitat = getSimulatedHabitat(this.habitatId);
    const crew = rosters[this.habitatId].map(([id, name, initials], index) => ({
      ...template.crew[index % template.crew.length],
      id,
      name,
      initials,
      role:
        index === 0
          ? 'Responsable del hábitat'
          : index === 3
            ? 'Especialista de sistemas'
            : template.crew[index % template.crew.length].role,
    }));
    return {
      ...template,
      id: habitat.id,
      name: habitat.name,
      crew,
      observations: template.observations.map((entry) => ({
        ...entry,
        id: `${habitat.id}:${entry.id}`,
        crewId: crew[0].id,
      })),
    };
  }
}
