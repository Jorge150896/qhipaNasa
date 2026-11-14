import type { SimulationScreenProps } from './types';
import { SimulationView } from './components/SimulationView';
export function SimulationScreen(props: SimulationScreenProps) {
  return <SimulationView {...props} />;
}
