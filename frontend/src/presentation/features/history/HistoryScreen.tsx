import { nasaHistoryReference } from '@/di/historyReference';
import type { HistoryScreenProps } from './types';
import { HistoryView } from './components/HistoryView';
import { useNasaHistoryViewModel } from './useNasaHistoryViewModel';

export function HistoryScreen(props: HistoryScreenProps) {
  const nasaHistory = useNasaHistoryViewModel(nasaHistoryReference);
  return <HistoryView {...props} nasaHistory={nasaHistory} />;
}
