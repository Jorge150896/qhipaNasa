import { telemetryDefinitions } from '@/domain/measurements/HealthMeasurement';
import type { CaptureRequest, MeasurementGateway } from '@/domain/monitoring/models';

export class DemoMeasurementGateway implements MeasurementGateway {
  private count = 0;
  constructor(private readonly now: () => string) {}
  async capture(request: CaptureRequest) {
    const at = this.now();
    const count = this.count++;
    const values = [72 + (count % 5), 36.6, 98, 16 + (count % 2)];
    return {
      id: request.requestId,
      receivedAt: at,
      measurements: Object.values(telemetryDefinitions).map((definition, index) => ({
        ...definition,
        id: `${request.requestId}:${definition.indicator}`,
        value: index === 2 && count % 4 === 3 ? null : values[index],
        time: { kind: 'instant' as const, at },
        subject: { kind: 'individual' as const, id: request.subjectId },
        source: { kind: 'synthetic' as const, id: 'astra:assisted-demo:v1' },
        method: 'simulated' as const,
        quality: index === 2 && count % 4 === 3 ? ('missing' as const) : ('available' as const),
      })),
    };
  }
}
