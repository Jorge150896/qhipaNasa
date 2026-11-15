'use client';
import { useCallback, useEffect, useEffectEvent, useReducer, useRef, useState } from 'react';
import {
  TumiDailyLimitError,
  type TumiConversation,
  type TumiMessage,
  type TumiScreenContext,
} from '@/domain/assistant/TumiConversation';
import { detectTextEmotion } from '@/domain/assistant/detectTextEmotion';
import { autonomousEmotion, reactionToText } from './emotions';
import { transitionTumi } from './behavior';
import type { Speak, TumiEmotion } from './types';

const greetings = [
  '¡Hola! ¿Necesitas algo?',
  '¿En qué puedo ayudarte?',
  '¡Hola! Soy Tumi, tu asistente virtual. ¿Qué te gustaría saber?',
];
export function useCursorAssistantViewModel(
  conversation: TumiConversation,
  speak?: Speak,
  suspended = false,
  getContext?: () => TumiScreenContext,
) {
  const actor = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(transitionTumi, 'resting');
  const [emotion, setEmotion] = useState<TumiEmotion>('neutral');
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<TumiMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const cancelVoice = useRef<(() => void) | undefined>(undefined);
  const reaction = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const opening = useRef(0);
  useEffect(() => {
    if (open || hidden || paused || speaking || suspended) return;
    if (typeof window.matchMedia !== 'function') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastActivity = performance.now();
    let timer: ReturnType<typeof setTimeout>;
    const activity = () => {
      lastActivity = performance.now();
    };
    const vary = () => {
      if (
        !document.hidden &&
        !reduced.matches &&
        !actor.current?.matches(':hover, :focus-within')
      ) {
        setEmotion((previous) =>
          autonomousEmotion(previous, performance.now() - lastActivity > 45000, Math.random()),
        );
      }
      timer = setTimeout(vary, 8000 + Math.random() * 7000);
    };
    timer = setTimeout(vary, 8000 + Math.random() * 4000);
    window.addEventListener('pointerdown', activity, { passive: true });
    window.addEventListener('pointermove', activity, { passive: true });
    window.addEventListener('keydown', activity);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', activity);
      window.removeEventListener('pointermove', activity);
      window.removeEventListener('keydown', activity);
    };
  }, [open, hidden, paused, speaking, suspended]);
  useEffect(
    () => () => {
      request.current?.abort();
      cancelVoice.current?.();
      clearTimeout(reaction.current);
    },
    [],
  );
  const react = useCallback((mood: TumiEmotion) => {
    setEmotion(mood);
    dispatch('REACT');
  }, []);
  function close() {
    request.current?.abort();
    request.current = null;
    setBusy(false);
    setError('');
    cancelVoice.current?.();
    setSpeaking(false);
    setOpen(false);
    setEmotion('farewell');
    dispatch('REST');
    clearTimeout(reaction.current);
    reaction.current = setTimeout(() => setEmotion('neutral'), 1200);
  }
  const closeWhenSuspended = useEffectEvent(() => {
    if (open) close();
  });
  useEffect(() => {
    if (!suspended) return;
    const frame = requestAnimationFrame(() => closeWhenSuspended());
    return () => cancelAnimationFrame(frame);
  }, [suspended]);

  return {
    actor,
    dispatch,
    react,
    data: {
      paused,
      open,
      hidden,
      speaking,
      voiceStatus,
      state,
      emotion,
      draft,
      messages,
      busy,
      error,
    },
    setDraft,
    send: async () => {
      const text = draft.trim();
      if (!text || text.length > 600 || request.current) return;
      const controller = new AbortController();
      const textEmotion = detectTextEmotion(text);
      request.current = controller;
      setDraft('');
      setError('');
      setBusy(true);
      dispatch('WAIT');
      setEmotion('thinking');
      setMessages((previous) =>
        [...previous, { id: ++sequence.current, role: 'user' as const, text }].slice(-40),
      );
      try {
        const answer = await conversation.reply(text, controller.signal, getContext?.());
        if (controller.signal.aborted) return;
        setMessages((previous) =>
          [
            ...previous,
            { id: ++sequence.current, role: 'assistant' as const, text: answer.text },
          ].slice(-40),
        );
        setEmotion(
          textEmotion === 'neutral' ? (answer.reaction ?? 'neutral') : reactionToText(textEmotion),
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof TumiDailyLimitError
              ? error.message
              : 'No pude responder. Puedes volver a enviar tu pregunta.',
          );
          setDraft(text);
          setEmotion('worried');
        }
      } finally {
        if (request.current === controller) {
          request.current = null;
          setBusy(false);
          dispatch('OPEN');
        }
      }
    },
    greet: () => {
      cancelVoice.current?.();
      setSpeaking(false);
      setVoiceStatus('');
      if (!speak) {
        setVoiceStatus('La voz no está disponible.');
        return;
      }
      cancelVoice.current = speak(
        '¡Hola! Soy Tumi. Qué alegría acompañarte. Vamos a explorar juntos.',
        {
          onStart: () => {
            setSpeaking(true);
            setEmotion('joy');
          },
          onEnd: () => {
            setSpeaking(false);
            setEmotion('happy');
          },
          onError: (message) => {
            setSpeaking(false);
            setVoiceStatus(message);
          },
        },
      );
    },
    stopVoice: () => {
      cancelVoice.current?.();
      setSpeaking(false);
    },
    close,
    toggle: () => {
      if (open) {
        close();
        return;
      }
      clearTimeout(reaction.current);
      setOpen(true);
      dispatch('OPEN');
      setEmotion('greeting');
      if (!messages.length)
        setMessages([
          {
            id: ++sequence.current,
            role: 'assistant',
            text: greetings[opening.current++ % greetings.length],
          },
        ]);
    },
    pause: () => {
      setPaused((value) => !value);
      dispatch(paused ? 'REST' : 'PAUSE');
    },
    hide: () => {
      close();
      setHidden(true);
    },
    show: () => {
      setHidden(false);
      dispatch('REST');
      setEmotion('happy');
    },
  };
}
