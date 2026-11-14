import { act, renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import { useCrewHologramViewModel } from '@/presentation/features/crew/useCrewHologramViewModel';
it('conserva el astronauta de main como entrada y permite activar el holograma', () => {
  const { result } = renderHook(() => useCrewHologramViewModel('odyssey', 'elena'));
  expect(result.current.display).toBe('astronaut');
  act(() => result.current.selectDisplay('hologram'));
  expect(result.current.display).toBe('hologram');
});
it('conserva apariencias independientes por persona y hábitat durante la visita', () => {
  const { result, rerender } = renderHook(
    ({ habitatId, crewId }) => useCrewHologramViewModel(habitatId, crewId),
    { initialProps: { habitatId: 'odyssey', crewId: 'elena' } },
  );
  act(() => result.current.selectAppearance('feminine'));
  rerender({ habitatId: 'odyssey', crewId: 'mateo' });
  expect(result.current.appearance).toBe('neutral');
  act(() => result.current.selectAppearance('masculine'));
  rerender({ habitatId: 'odyssey', crewId: 'elena' });
  expect(result.current.appearance).toBe('feminine');
  rerender({ habitatId: 'aurora', crewId: 'elena' });
  expect(result.current.appearance).toBe('neutral');
});
