import type { MissionRepository } from '../mission/ports';
import type { ScenarioId } from '../mission/models';
export class LoadMission {
  constructor(private readonly repository: MissionRepository) {}
  execute(scenario: ScenarioId, signal?: AbortSignal) {
    return this.repository.load(scenario, signal);
  }
}
