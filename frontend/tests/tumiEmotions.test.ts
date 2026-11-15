import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { detectTextEmotion } from '@/domain/assistant/detectTextEmotion';
import { getDirectWellbeingMood, tumiWellbeingReplies } from '@/domain/assistant/tumiWellbeing';
import { autonomousEmotion } from '@/presentation/features/cursor-assistant/emotions';
import { useCursorAssistantViewModel } from '@/presentation/features/cursor-assistant/useCursorAssistantViewModel';

describe('señales emocionales locales', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it.each([
    ['Hoy estoy muy feliz, ¡lo logré!', 'happy'],
    ['Me siento triste y estoy llorando 😢', 'sad'],
    ['Estoy ENOJADO, tengo mucha cólera 😡', 'angry'],
    ['No estoy triste, estoy contenta', 'happy'],
    ['Ya no estoy enojado', 'neutral'],
    ['No me siento feliz', 'neutral'],
    ['Mi amiga está triste', 'neutral'],
    ['La película es triste', 'neutral'],
    ['Estoy feliz pero también triste', 'mixed'],
    ['😀', 'happy'],
    ['😭', 'sad'],
    ['¿Dónde está el mapa?', 'neutral'],
    ['Solo quiero ver el mapa', 'neutral'],
  ])('interpreta %s como %s', (text, expected) => {
    expect(detectTextEmotion(text)).toBe(expected);
  });
  it('evita repetir expresión y no inventa enojo o tristeza durante la autonomía', () => {
    for (const random of [0, 0.1, 0.5, 0.9, 1]) {
      const mood = autonomousEmotion('happy', false, random);
      expect(mood).not.toBe('happy');
      expect(['sad', 'angry', 'error']).not.toContain(mood);
    }
    expect(autonomousEmotion('neutral', true, 0.99)).toBe('sleeping');
  });
  it('responde en el chat flotante con el mismo mensaje que el selector de ánimo', async () => {
    const reply = vi.fn(async () => ({ text: 'Respuesta de la IA' }));
    const { result } = renderHook(() => useCursorAssistantViewModel({ reply }));
    act(() => result.current.setDraft('Hoy me siento triste 😢'));
    await act(async () => result.current.send());
    expect(result.current.data.messages.at(-1)?.text).toBe(tumiWellbeingReplies.low);
    expect(reply).not.toHaveBeenCalled();
    expect(getDirectWellbeingMood('¿Estoy triste?')).toBeUndefined();
    expect(getDirectWellbeingMood('Elena está triste')).toBeUndefined();
    expect(getDirectWellbeingMood('Estoy triste y quiero ver el mapa')).toBeUndefined();
  });
  it('conserva la reacción al texto después de responder y se reinicia con otro mensaje', async () => {
    const { result } = renderHook(() =>
      useCursorAssistantViewModel({ reply: async () => ({ text: 'Respuesta local' }) }),
    );
    act(() => result.current.toggle());
    for (const [text, emotion] of [
      ['Estoy triste', 'sad'],
      ['Estoy feliz', 'joy'],
      ['Estoy enojado', 'angry'],
      ['Mapa espacial', 'neutral'],
    ]) {
      act(() => result.current.setDraft(text));
      await act(async () => {
        await result.current.send();
      });
      expect(result.current.data.emotion).toBe(emotion);
    }
  });
  it('varía expresiones sin reiniciar desplazamientos y suspende el cambio al abrir el chat', () => {
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.2);
    try {
      const { result, unmount } = renderHook(() =>
        useCursorAssistantViewModel({ reply: async () => ({ text: '' }) }),
      );
      act(() => {
        vi.advanceTimersByTime(12000);
      });
      expect(result.current.data.emotion).not.toBe('neutral');
      act(() => result.current.toggle());
      const mood = result.current.data.emotion;
      act(() => {
        vi.advanceTimersByTime(60000);
      });
      expect(result.current.data.emotion).toBe(mood);
      unmount();
    } finally {
      vi.restoreAllMocks();
      vi.useRealTimers();
    }
  });
});
