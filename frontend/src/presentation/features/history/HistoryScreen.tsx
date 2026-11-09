import type { HistoryScreenProps } from './types';
import { HistoryView } from './components/HistoryView';
export function HistoryScreen(props: HistoryScreenProps) {
  return <HistoryView {...props} />;
}
