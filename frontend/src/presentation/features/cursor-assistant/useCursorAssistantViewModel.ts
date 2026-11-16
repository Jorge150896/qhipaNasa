'use client';
import { answerProjectQuestion } from '@/domain/assistant/projectKnowledge';
import { requestedAppLanguage } from '@/domain/assistant/AppLanguage';
import { answerAssistantIdentity } from '@/domain/assistant/assistantIdentity';
import { isSpanishAssistantText } from '@/domain/assistant/isSpanishAssistantText';
import { useAppLanguage, useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useCallback, useEffect, useEffectEvent, useReducer, useRef, useState } from 'react';
import {
  TumiDailyLimitError,
  type TumiConversation,
  type TumiMessage,
  type TumiScreenContext,
} from '@/domain/assistant/TumiConversation';
import { detectTextEmotion } from '@/domain/assistant/detectTextEmotion';
import {
  answerWellbeingQuestionLocally,
  getDirectWellbeingMood,
  tumiWellbeingReplies,
} from '@/domain/assistant/tumiWellbeing';
import { autonomousEmotion, reactionToText } from './emotions';
import { transitionTumi } from './behavior';
import type { TumiReplyAudio } from '@/presentation/shared/tumi/useTumiReplyAudio';
import type { TumiEmotion } from './types';

const greetings = [
  '¡Hola! Soy Nami. ¿En qué te ayudo?',
  '¿En qué puedo ayudarte?',
  '¡Hola! Soy Nami, tu asistente virtual. ¿Qué te gustaría saber?',
];
const followUps = [
  '¿Te ayudo con alguna otra cosita?',
  '¿Hay algo más que te gustaría saber? ✨',
  'Aquí estoy si tienes otra preguntita. ♡',
];

export function useCursorAssistantViewModel(
  conversation: TumiConversation,
  audio?: Pick<TumiReplyAudio, 'playing' | 'readReply' | 'stop'>,
  suspended = false,
  getContext?: () => TumiScreenContext,
  getLocalReply?: (question: string) => string | undefined,
  fallback?: TumiConversation,
  changeLanguageFromQuestion?: (question: string) => string | undefined,
) {
  const t = useTranslation();
  const { language } = useAppLanguage();
  const actor = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(transitionTumi, 'resting');
  const [emotion, setEmotion] = useState<TumiEmotion>('neutral');
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const speaking = audio?.playing ?? false;
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<TumiMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const reaction = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const opening = useRef(0);
  useEffect(() => () => request.current?.abort(), [language]);
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
    audio?.stop();
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
      state,
      emotion,
      draft,
      messages: messages.filter((entry) => !entry.language || entry.language === language),
      busy,
      error,
    },
    setDraft,
    send: async () => {
      const text = draft.trim();
      if (!text || text.length > 600 || request.current) return;
      const confirmation = changeLanguageFromQuestion?.(text);
      if (confirmation) {
        setDraft('');
        setError('');
        react('happy');
        const id = ++sequence.current;
        const replyId = ++sequence.current;
        const nextLanguage = requestedAppLanguage(text) ?? language;
        setMessages((previous) =>
          [
            ...previous,
            { id, role: 'user', text, language: nextLanguage } as const,
            { id: replyId, role: 'assistant', text: confirmation, language: nextLanguage } as const,
          ].slice(-40),
        );
        return;
      }
      const controller = new AbortController();
      const textEmotion = detectTextEmotion(text);
      request.current = controller;
      setDraft('');
      setError('');
      setBusy(true);
      dispatch('WAIT');
      setEmotion('thinking');
      setMessages((previous) =>
        [...previous, { id: ++sequence.current, role: 'user' as const, text, language }].slice(-40),
      );
      try {
        const signal = controller.signal;
        const context = getContext?.();
        let answeredByGpt = false;
        const answer = await (async () => {
          if (fallback) {
            try {
              const remoteReply = await conversation.reply(text, signal, context);
              answeredByGpt = true;
              return remoteReply;
            } catch (error) {
              if (signal.aborted || error instanceof TumiDailyLimitError) throw error;
            }
          }
          const identity = answerAssistantIdentity(text, language);
          if (identity) return { text: identity, reaction: 'happy' as const };
          const wellbeing = answerWellbeingQuestionLocally(text, language);
          if (wellbeing) return { text: wellbeing, reaction: 'understanding' as const };
          const mood = getDirectWellbeingMood(text);
          if (mood) {
            return {
              text: tumiWellbeingReplies[mood],
              reaction: mood === 'good' ? ('happy' as const) : ('understanding' as const),
            };
          }
          const projectReply = answerProjectQuestion(text, context?.view ?? '', language);
          if (projectReply) return { text: projectReply };
          const localReply = getLocalReply?.(text);
          return localReply
            ? { text: localReply }
            : (fallback ?? conversation).reply(text, signal, context);
        })();
        if (controller.signal.aborted) return;
        const translated = t(answer.text.trim());
        const reply =
          language === 'en' && isSpanishAssistantText(translated)
            ? 'I can help with the crew, the space map or your daily check-in. Which part would you like to explore?'
            : translated;
        const textWithFollowUp =
          answeredByGpt ||
          !reply ||
          /\?[\s✨♡:3]*$|si (?:quieres|te apetece), (?:cuéntame|podemos)/iu.test(reply)
            ? reply
            : `${reply} ${t(followUps[Math.floor(sequence.current / 2) % followUps.length])}`;
        setMessages((previous) =>
          [
            ...previous,
            {
              id: ++sequence.current,
              role: 'assistant' as const,
              text: textWithFollowUp,
              language,
            },
          ].slice(-40),
        );
        audio?.readReply(textWithFollowUp, { transcript: true });
        setEmotion(
          textEmotion === 'neutral' ? (answer.reaction ?? 'neutral') : reactionToText(textEmotion),
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof TumiDailyLimitError
              ? error.message
              : 'Uy, no pude responder esta vez. ¿Probamos de nuevo?',
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
