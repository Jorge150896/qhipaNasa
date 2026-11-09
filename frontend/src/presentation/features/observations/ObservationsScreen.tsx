import { ObservationsView } from './components/ObservationsView';
import type { ObservationsScreenProps } from './types';
export function ObservationsScreen(props: ObservationsScreenProps) {
  return <ObservationsView {...props} />;
}
