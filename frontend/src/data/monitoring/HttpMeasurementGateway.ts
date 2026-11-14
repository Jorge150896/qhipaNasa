import { z } from 'zod';
import type { CaptureRequest, MeasurementGateway } from '@/domain/monitoring/models';

const sampleSchema = z.object({
  id: z.string().trim().min(1).max(200),
  subjectId: z.string().trim().min(1).max(200),
  indicator: z.enum(['heartRate', 'temperature', 'oxygen', 'respiration']),
  value: z.number().finite().nullable(),
  unit: z.string().max(20),
  observedAt: z.iso.datetime({ offset: true }),
  quality: z.enum(['available', 'stale', 'missing']),
  source: z.object({ kind: z.literal('device'), id: z.string().trim().min(1).max(200) }),
  method: z.enum(['instrument', 'derived']),
});
export const captureResponseSchema = z.object({
  requestId: z.string().min(1),
  subjectId: z.string().min(1),
  samples: z.array(sampleSchema).max(4),
});
export class HttpMeasurementGateway implements MeasurementGateway {
  constructor(
    private readonly endpoint: string,
    private readonly transport: typeof fetch = fetch,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}
  async capture(request: CaptureRequest) {
    if (!this.endpoint) throw new Error('API sin configurar. Se necesita la URL del servicio.');
    let url: URL;
    try {
      url = new URL(this.endpoint);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
        throw new Error();
    } catch {
      throw new Error('La URL configurada para la API no es válida.');
    }
    url.searchParams.set('subjectId', request.subjectId);
    url.searchParams.set('requestId', request.requestId);
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 10000);
    try {
      const response = await this.transport(url, {
        signal: AbortSignal.any([request.signal, timeout.signal]),
        cache: 'no-store',
        credentials: 'omit',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok)
        throw new Error(
          `El servicio respondió HTTP ${response.status}. No se recibieron lecturas.`,
        );
      const parsed = captureResponseSchema.safeParse(await response.json());
      if (!parsed.success) throw new Error('La respuesta no cumple el contrato de medición.');
      const dto = parsed.data;
      if (dto.requestId !== request.requestId || dto.subjectId !== request.subjectId)
        throw new Error('El servicio respondió para otra solicitud o sujeto.');
      return {
        id: dto.requestId,
        receivedAt: this.now(),
        measurements: dto.samples.map((sample) => ({
          id: sample.id,
          indicator: sample.indicator,
          value: sample.value,
          unit: sample.unit,
          time: { kind: 'instant' as const, at: sample.observedAt },
          subject: { kind: 'individual' as const, id: sample.subjectId },
          source: sample.source,
          method: sample.method,
          quality: sample.quality,
        })),
      };
    } catch (error) {
      if (request.signal.aborted) throw new Error('Captura cancelada.');
      if (timeout.signal.aborted)
        throw new Error('La API no respondió en 10 segundos. Puedes reintentar.');
      if (error instanceof TypeError)
        throw new Error('No se pudo acceder a la API. Revisa conexión y CORS.');
      if (error instanceof SyntaxError) throw new Error('La API no devolvió JSON válido.');
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}
