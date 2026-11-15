import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useLoadingDelayViewModel } from '@/presentation/shared/loading/useLoadingDelayViewModel';
afterEach(() => vi.useRealTimers());

it('mantiene la introducción durante 650 ms y no la reinicia al renderizar', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(() => useLoadingDelayViewModel());
  expect(result.current).toBe(true);
  act(() => vi.advanceTimersByTime(649));
  rerender();
  expect(result.current).toBe(true);
  act(() => vi.advanceTimersByTime(1));
  expect(result.current).toBe(false);
  rerender();
  expect(result.current).toBe(false);
});
it('limpia el temporizador si se abandona la pantalla', () => {
  vi.useFakeTimers();
  const { unmount } = renderHook(() => useLoadingDelayViewModel());
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('no inicia la espera hasta recibir la intención de iniciar misión', () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ active }) => useLoadingDelayViewModel(active), {
    initialProps: { active: false },
  });
  expect(result.current).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
  rerender({ active: true });
  expect(result.current).toBe(true);
  act(() => vi.advanceTimersByTime(3000));
  expect(result.current).toBe(false);
});
