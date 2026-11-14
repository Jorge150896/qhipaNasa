import { DemoMeasurementGateway } from '@/data/monitoring/DemoMeasurementGateway';
import { HttpMeasurementGateway } from '@/data/monitoring/HttpMeasurementGateway';
import { LocalMonitoringJournal } from '@/data/monitoring/LocalMonitoringJournal';
import { BrowserStorage } from '@/infrastructure/storage/BrowserStorage';
import { CaptureMonitoring } from '@/domain/usecases/CaptureMonitoring';
import {
  LoadMonitoringJournal,
  SaveMonitoringSession,
} from '@/domain/usecases/ManageMonitoringJournal';

export function createMonitoringDependencies(habitatId: string) {
  const now = () => new Date().toISOString();
  const endpoint = process.env.NEXT_PUBLIC_MONITORING_API_URL ?? '';
  const journal = new LocalMonitoringJournal(
    new BrowserStorage(),
    `astra.monitoring.v1:${habitatId}`,
  );
  return {
    apiConfigured: Boolean(endpoint),
    capture: {
      demo: new CaptureMonitoring(new DemoMeasurementGateway(now), 'demo'),
      api: new CaptureMonitoring(new HttpMeasurementGateway(endpoint), 'api'),
    },
    load: new LoadMonitoringJournal(journal),
    save: new SaveMonitoringSession(journal),
    now,
    nextId: () => crypto.randomUUID(),
  };
}
