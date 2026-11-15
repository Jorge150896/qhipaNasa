import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  clampPoint,
  isFree,
  transitionTumi,
} from '@/presentation/features/cursor-assistant/behavior';
import { LocalTumiConversation } from '@/data/assistant/LocalTumiConversation';
import { useCursorAssistantViewModel } from '@/presentation/features/cursor-assistant/useCursorAssistantViewModel';

describe('Tumi autónomo', () => {
  it('impide moverse mientras conversa, espera o está pausado', () => {
    for (const state of ['conversing', 'waiting', 'paused'] as const)
      expect(transitionTumi(state, 'MOVE')).toBe(state);
    expect(transitionTumi('waiting', 'OPEN')).toBe('conversing');
    expect(transitionTumi('conversing', 'REST')).toBe('resting');
  });
  it('respeta margen de controles y límites pequeños del viewport', () => {
    expect(
      isFree({ x: 90, y: 90 }, 75, 68, [{ left: 100, top: 100, right: 200, bottom: 200 }]),
    ).toBe(false);
    expect(
      isFree({ x: 12, y: 12 }, 64, 58, [{ left: 100, top: 100, right: 200, bottom: 200 }]),
    ).toBe(true);
    expect(clampPoint({ x: 1000, y: -30 }, { x: 390, y: 844 }, 64, 58)).toEqual({ x: 310, y: 16 });
  });
  it('cancela la respuesta local sin producir un mensaje tardío', async () => {
    vi.useFakeTimers();
    try {
      const controller = new AbortController();
      const result = new LocalTumiConversation().reply('mapa', controller.signal);
      controller.abort();
      await expect(result).rejects.toMatchObject({ name: 'AbortError' });
    } finally {
      vi.useRealTimers();
    }
  });
  it('descarta respuestas de un proveedor después de cerrar', async () => {
    let resolveReply!: (value: { text: string }) => void;
    const { result } = renderHook(() =>
      useCursorAssistantViewModel({
        reply: () =>
          new Promise((resolve) => {
            resolveReply = resolve;
          }),
      }),
    );
    act(() => result.current.toggle());
    act(() => result.current.setDraft('mapa'));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.send();
    });
    expect(result.current.data.busy).toBe(true);
    act(() => result.current.close());
    await act(async () => {
      resolveReply({ text: 'Respuesta obsoleta' });
      await pending;
    });
    expect(
      result.current.data.messages.some((message) => message.text === 'Respuesta obsoleta'),
    ).toBe(false);
    expect(result.current.data.busy).toBe(false);
  });
});
