import type { ScenarioKey } from '../mission/types';
export interface SimulationScreenProps {
  selected: ScenarioKey;
  onSelect(id: ScenarioKey): void;
}
