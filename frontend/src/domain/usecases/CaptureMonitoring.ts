import { createHealthMeasurement, telemetryDefinitions } from '../measurements/HealthMeasurement';
import type { CaptureRequest, MeasurementGateway, MonitoringMode } from '../monitoring/models';

/** Client integrity checks; clinical interpretation belongs to validated mission protocols. */
export class CaptureMonitoring {
  constructor(
    private readonly gateway: MeasurementGateway,
    private readonly mode: MonitoringMode,
  ) {}
  async execute(request: CaptureRequest) {
    if (!request.subjectId.trim()) throw new Error('Indica el identificador del sujeto.');
    const attempt = await this.gateway.capture(request);
    if (request.signal.aborted) throw new Error('Captura cancelada.');
    if (attempt.id !== request.requestId || !Number.isFinite(Date.parse(attempt.receivedAt)))
      throw new Error('La captura no corresponde a la solicitud.');
    const indicators = new Set<string>();
    const ids = new Set<string>();
    for (const sample of attempt.measurements) {
      const definition = Object.values(telemetryDefinitions).find(
        (d) => d.indicator === sample.indicator,
      );
      if (!definition || indicators.has(sample.indicator) || ids.has(sample.id))
        throw new Error('La captura contiene indicadores desconocidos o duplicados.');
      createHealthMeasurement(sample, definition);
      if (
        sample.subject.kind !== 'individual' ||
        sample.subject.id !== request.subjectId ||
        sample.time.kind !== 'instant' ||
        (this.mode === 'demo'
          ? sample.source.kind !== 'synthetic'
          : sample.source.kind !== 'device')
      )
        throw new Error('La identidad o procedencia de la captura no coincide.');
      if (Date.parse(sample.time.at) > Date.parse(attempt.receivedAt) + 5000)
        throw new Error('La hora del dispositivo está adelantada; comprueba su reloj.');
      indicators.add(sample.indicator);
      ids.add(sample.id);
    }
    return attempt;
  }
}
