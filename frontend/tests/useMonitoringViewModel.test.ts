import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import {
  useMonitoringViewModel,
  type MonitoringDependencies,
} from '@/presentation/features/monitoring/useMonitoringViewModel';
import { CaptureMonitoring } from '@/domain/usecases/CaptureMonitoring';
import { DemoMeasurementGateway } from '@/data/monitoring/DemoMeasurementGateway';
import type { CaptureAttempt, CaptureRequest } from '@/domain/monitoring/models';

const person = { id: 'demo-person', name: 'Persona de prueba', location: 'Cabina' };

it('rechaza reutilizar un ID histórico con otro valor y conserva las capturas anteriores', async () => {
  const deps = dependencies();
  let captureIndex = 0;
  deps.capture.demo = {
    execute: async (request) => {
      const index = captureIndex++;
      return {
        id: request.requestId,
        receivedAt: deps.now(),
        measurements: [
          {
            id: index === 1 ? 'sample-2' : 'sample-1',
            indicator: 'heartRate',
            value: 70 + index,
            unit: 'lpm',
            time: { kind: 'instant', at: deps.now() },
            subject: { kind: 'individual', id: person.id },
            source: { kind: 'synthetic', id: 'test-source' },
            method: 'simulated',
            quality: 'available',
          },
        ],
      };
    },
  };
  const { result } = renderHook(() => useMonitoringViewModel(deps, person));
  act(() => {
    result.current.actions.setEquipment('Equipo');
    [0, 1, 2].forEach((i) => result.current.actions.setCheck(i, true));
  });
  act(() => result.current.actions.begin());
  await act(async () => result.current.actions.capture());
  await act(async () => result.current.actions.capture());
  await act(async () => result.current.actions.capture());
  expect(result.current.data.captureCount).toBe(2);
  expect(result.current.data.error).toContain('reutilizado');
});
function dependencies(): MonitoringDependencies {
  const now = () => '2026-11-12T12:00:00Z';
  let id = 0;
  return {
    apiConfigured: false,
    now,
    nextId: () => `id-${++id}`,
    capture: {
      demo: new CaptureMonitoring(new DemoMeasurementGateway(now), 'demo'),
      api: { execute: vi.fn().mockRejectedValue(new Error('Sin servicio')) },
    },
    load: { execute: vi.fn().mockResolvedValue([]) },
    save: { execute: vi.fn().mockRejectedValue(new Error('Disco lleno')) },
  };
}
it('exige preparación y mantiene la sesión al fallar el guardado', async () => {
  const deps = dependencies();
  const { result } = renderHook(() => useMonitoringViewModel(deps, person));
  expect(result.current.data.ready).toBe(false);
  act(() => {
    result.current.actions.setEquipment('Equipo de prueba');
    [0, 1, 2].forEach((i) => result.current.actions.setCheck(i, true));
  });
  expect(result.current.data.ready).toBe(true);
  act(() => result.current.actions.begin());
  await act(async () => result.current.actions.capture());
  await act(async () => result.current.actions.capture());
  expect(result.current.data.captureCount).toBe(2);
  act(() => result.current.actions.review());
  await act(async () => result.current.actions.save());
  expect(result.current.data.error).toBe('Disco lleno');
  expect(result.current.data.step).toBe('review');
  expect(result.current.data.captureCount).toBe(2);
});
it('no asigna el personaje ficticio a una API y no usa fallback sintético', async () => {
  const deps = dependencies();
  deps.apiConfigured = true;
  const { result } = renderHook(() => useMonitoringViewModel(deps, person));
  expect(result.current.data.subjectId).toBe('');
  act(() => {
    result.current.actions.setEquipment('Equipo');
    result.current.actions.setSubjectId('api-person');
    result.current.actions.setLocation('Lugar de prueba API');
    [0, 1, 2].forEach((i) => result.current.actions.setCheck(i, true));
  });
  act(() => result.current.actions.begin());
  await act(async () => result.current.actions.capture());
  expect(result.current.data.error).toBe('Sin servicio');
  expect(result.current.data.captureCount).toBe(0);
});
it('pausar cancela la petición y descarta una respuesta tardía', async () => {
  const deps = dependencies();
  let finish: ((attempt: CaptureAttempt) => void) | undefined;
  let signal: AbortSignal | undefined;
  deps.capture.demo = {
    execute: (request: CaptureRequest) => {
      signal = request.signal;
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
  };
  const { result } = renderHook(() => useMonitoringViewModel(deps, person));
  await waitFor(() => expect(result.current.data.journalLoading).toBe(false));
  act(() => {
    result.current.actions.setEquipment('Equipo');
    [0, 1, 2].forEach((i) => result.current.actions.setCheck(i, true));
  });
  act(() => result.current.actions.begin());
  act(() => result.current.actions.toggleRunning());
  expect(result.current.data.busy).toBe(true);
  act(() => result.current.actions.toggleRunning());
  expect(signal?.aborted).toBe(true);
  await act(async () => finish?.({ id: 'late', receivedAt: deps.now(), measurements: [] }));
  expect(result.current.data.captureCount).toBe(0);
  expect(result.current.data.running).toBe(false);
});
