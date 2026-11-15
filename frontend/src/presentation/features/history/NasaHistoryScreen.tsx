import { nasaHistoryReference } from '@/di/historyReference';
import { NasaHistoryPanel } from './components/NasaHistoryPanel';
import { useNasaHistoryViewModel } from './useNasaHistoryViewModel';

export function NasaHistoryScreen() {
  const nasaHistory = useNasaHistoryViewModel(nasaHistoryReference);
  return <NasaHistoryPanel {...nasaHistory} />;
}
