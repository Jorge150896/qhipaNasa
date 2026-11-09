import type { DailyCheckScreenProps } from './types';
import { DailyCheckView } from './components/DailyCheckView';
export function DailyCheckScreen(props: DailyCheckScreenProps) {
  return <DailyCheckView {...props} />;
}
