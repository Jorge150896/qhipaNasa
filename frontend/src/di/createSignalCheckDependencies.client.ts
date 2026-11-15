import { DemoMeasurementGateway } from '@/data/monitoring/DemoMeasurementGateway';
import { CaptureMonitoring } from '@/domain/usecases/CaptureMonitoring';

export function createSignalCheckDependencies() {
  const now = () => new Date().toISOString();
  return {
    capture: new CaptureMonitoring(new DemoMeasurementGateway(now), 'demo'),
    nextId: () => crypto.randomUUID(),
  };
}
