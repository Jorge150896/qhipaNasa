import { describe, expect, it, vi } from 'vitest';
import { HttpMeasurementGateway } from '@/data/monitoring/HttpMeasurementGateway';
import { DemoMeasurementGateway } from '@/data/monitoring/DemoMeasurementGateway';
import { LocalMonitoringJournal } from '@/data/monitoring/LocalMonitoringJournal';
import { CaptureMonitoring } from '@/domain/usecases/CaptureMonitoring';
import type { MonitoringSession } from '@/domain/monitoring/models';

const now = () => '2026-11-12T12:00:00Z';
const request = () => ({
  requestId: 'request-1',
  subjectId: 'test-person',
  signal: new AbortController().signal,
});
const sample = {
  id: 'sample-1',
  subjectId: 'test-person',
  indicator: 'heartRate',
  value: 0,
  unit: 'lpm',
  observedAt: now(),
  quality: 'available',
  source: { kind: 'device', id: 'device-1' },
  method: 'instrument',
};
const dto = { requestId: 'request-1', subjectId: 'test-person', samples: [sample] };
const response = (payload: unknown) =>
  vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(payload)));
describe('Captura por API', () => {
  it('conserva cero, identidad, unidades, procedencia y tiempos', async () => {
    const transport = response(dto);
    const usecase = new CaptureMonitoring(
      new HttpMeasurementGateway('https://example.invalid/data', transport, now),
      'api',
    );
    const capture = await usecase.execute(request());
    expect(capture.measurements[0]).toMatchObject({
      value: 0,
      subject: { kind: 'individual', id: 'test-person' },
      time: { kind: 'instant', at: now() },
      source: { kind: 'device', id: 'device-1' },
    });
    expect(transport.mock.calls[0][0].toString()).toContain('subjectId=test-person');
    expect(transport.mock.calls[0][1]).toMatchObject({ cache: 'no-store', credentials: 'omit' });
  });
  it.each([
    { ...dto, subjectId: 'someone-else' },
    { ...dto, requestId: 'other-request' },
    { ...dto, samples: [{ ...sample, subjectId: 'someone-else' }] },
    { ...dto, samples: [{ ...sample, unit: 'mg/dL' }] },
    { ...dto, samples: [sample, sample] },
    { ...dto, samples: [{ ...sample, value: null }] },
    { ...dto, samples: [{ ...sample, source: { kind: 'research', id: 'study' } }] },
    { ...dto, samples: [{ ...sample, observedAt: '2026-11-12T12:01:00Z' }] },
    { ...dto, samples: [{ ...sample, observedAt: '2026-11-12T12:00:00' }] },
  ])('rechaza una captura incompatible sin sustituirla por demo: %#', async (payload) => {
    const usecase = new CaptureMonitoring(
      new HttpMeasurementGateway('https://example.invalid', response(payload), now),
      'api',
    );
    await expect(usecase.execute(request())).rejects.toThrow();
  });
  it('acepta una respuesta vacía sin inventar lecturas', async () => {
    const usecase = new CaptureMonitoring(
      new HttpMeasurementGateway('https://example.invalid', response({ ...dto, samples: [] }), now),
      'api',
    );
    expect((await usecase.execute(request())).measurements).toEqual([]);
  });
  it('rechaza URL ausente, HTTP fallido y solicitudes canceladas', async () => {
    await expect(new HttpMeasurementGateway('').capture(request())).rejects.toThrow(
      'sin configurar',
    );
    const transport = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 }));
    await expect(
      new HttpMeasurementGateway('https://example.invalid', transport).capture(request()),
    ).rejects.toThrow('503');
    const controller = new AbortController();
    controller.abort();
    await expect(
      new CaptureMonitoring(new DemoMeasurementGateway(now), 'demo').execute({
        ...request(),
        signal: controller.signal,
      }),
    ).rejects.toThrow('cancelada');
  });
});
describe('Registro de sesiones', () => {
  async function session(): Promise<MonitoringSession> {
    return {
      id: 'session-1',
      subjectId: 'test-person',
      subjectLabel: 'Persona de prueba',
      mode: 'demo',
      context: {
        activity: 'cabin',
        phase: 'before',
        location: 'Cabina',
        equipment: 'Equipo de prueba',
      },
      attempts: [
        await new CaptureMonitoring(new DemoMeasurementGateway(now), 'demo').execute(request()),
      ],
      savedAt: now(),
      note: 'Prueba',
    };
  }
  it('conserva múltiples sesiones y no duplica un guardado repetido', async () => {
    const values = new Map<string, string>();
    const repo = new LocalMonitoringJournal(
      {
        read: (key) => values.get(key) ?? null,
        write: (key, value) => {
          values.set(key, value);
        },
      },
      'test',
    );
    const first = await session();
    await repo.save(first);
    await repo.save(first);
    await repo.save({ ...first, id: 'session-2' });
    expect((await repo.load()).map((s) => s.id)).toEqual(['session-2', 'session-1']);
  });
  it('preserva datos incompatibles sin sobrescribirlos', async () => {
    const write = vi.fn();
    const repo = new LocalMonitoringJournal({ read: () => '{"version":99}', write }, 'test');
    await expect(repo.save(await session())).rejects.toThrow('conservado');
    expect(write).not.toHaveBeenCalled();
  });
  it('informa fallo de almacenamiento sin simular guardado', async () => {
    const repo = new LocalMonitoringJournal(
      {
        read: () => null,
        write: () => {
          throw new Error('quota');
        },
      },
      'test',
    );
    await expect(repo.save(await session())).rejects.toThrow('no permitió guardar');
  });
});
