import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadMission } from '@/domain/usecases/LoadMission';
import { useMission } from '@/presentation/features/mission/useMission';
import { createTestDependencies } from './helpers';
describe('Estado de la misión', () => {
  it('carga, cambia de tripulante y escenario y registra el seguimiento', async () => {
    const dependencies = createTestDependencies();
    const { result } = renderHook(() => useMission(dependencies));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.data?.selected.id).toBe('elena'));
    act(() => result.current.actions.selectCrew('mateo'));
    expect(result.current.data?.selectedZone.id).toBe('exercise');
    act(() => {
      result.current.actions.selectScenario('sensor-gap');
      result.current.actions.selectCrew('elena');
      result.current.actions.selectMetric('oxygen');
    });
    await waitFor(() => expect(result.current.data?.scenario).toBe('sensor-gap'));
    expect(result.current.data?.metric.value).toBe('—');
    await act(() => result.current.actions.reviewObservation('oxygen-elena-gap-v1', true));
    expect(result.current.data?.pendingCount).toBe('0');
    let saved = false;
    await act(async () => {
      saved = await result.current.actions.saveCheck({
        sleep: '7.2',
        fatigue: '2',
        mood: 'good',
        note: '',
      });
    });
    expect(saved).toBe(true);
    expect(result.current.data?.checks).toHaveLength(1);
  });
  it('presenta errores de carga y permite reintentar', async () => {
    const dependencies = createTestDependencies();
    dependencies.loadMission = new LoadMission({
      load: async () => {
        throw new Error('unavailable');
      },
    });
    const { result } = renderHook(() => useMission(dependencies));
    await waitFor(() => expect(result.current.error).toContain('No pudimos cargar'));
    expect(result.current.loading).toBe(false);
    act(() => result.current.actions.retry());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
  it('no acepta un campo de sueño vacío como cero horas', async () => {
    const dependencies = createTestDependencies();
    const { result } = renderHook(() => useMission(dependencies));
    await waitFor(() => expect(result.current.loading).toBe(false));
    let saved = true;
    await act(async () => {
      saved = await result.current.actions.saveCheck({
        sleep: '',
        fatigue: '2',
        mood: 'neutral',
        note: '',
      });
    });
    expect(saved).toBe(false);
    expect(result.current.message?.error).toBe(true);
    expect(result.current.data?.checks).toHaveLength(0);
  });
});
