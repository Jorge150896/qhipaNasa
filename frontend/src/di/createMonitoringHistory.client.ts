import { LocalMonitoringJournal } from '@/data/monitoring/LocalMonitoringJournal';
import { BrowserStorage } from '@/infrastructure/storage/BrowserStorage';
import { LoadMonitoringJournal } from '@/domain/usecases/ManageMonitoringJournal';

export function createMonitoringHistory(habitatId: string) {
  return new LoadMonitoringJournal(
    new LocalMonitoringJournal(new BrowserStorage(), `astra.monitoring.v1:${habitatId}`),
  );
}
