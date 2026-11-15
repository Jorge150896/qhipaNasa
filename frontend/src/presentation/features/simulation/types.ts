import type { ScenarioKey } from '../mission/types';
export interface SimulationScreenProps {
  selected: ScenarioKey;
  onOpenResult(): void;
  onSelect(id: ScenarioKey): void;
}
