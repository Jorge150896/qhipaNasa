import { useEffect, useRef, useState } from 'react';
import type { MissionData } from '../mission/types';
import { answerMissionQuestion } from './explainMission';
import type { AssistantMessage, AssistantMetricContext, AssistantReply } from './types';
import type { TumiConversation, TumiScreenContext } from '@/domain/assistant/TumiConversation';
import { detectTextEmotion } from '@/domain/assistant/detectTextEmotion';
import { reactionToText } from '../cursor-assistant/emotions';
import type { TumiEmotion } from '@/presentation/shared/tumi/TumiTechPortrait';

type Dictation = (callbacks: {
  onText(text: string): void;
  onStatus(message: string): void;
  onEnd(): void;
}) => (() => void) | undefined;

export function useMissionAssistantViewModel(
  data: MissionData | null,
  dictate: Dictation,
  explorer = false,
  remote?: {
    conversation: TumiConversation;
    getContext(reading?: AssistantMetricContext): TumiScreenContext;
    pathname: string;
  },
) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<AssistantMetricContext>();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [reaction, setReaction] = useState<TumiEmotion>('happy');
  const [remoteStatus, setRemoteStatus] = useState('');
  const request = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const previousReading = useRef<AssistantMetricContext>(undefined);
  const stopDictation = useRef<(() => void) | undefined>(undefined);

  useEffect(() => () => stopDictation.current?.(), []);
  const pathname = remote?.pathname;
  useEffect(() => () => request.current?.abort(), [pathname]);

  function answer(question: string, reply: AssistantReply) {
    const id = sequence.current;
    sequence.current += 2;
    setMessages((previous) =>
      [
        ...previous,
        { id, role: 'user' as const, reply: { text: question } },
        { id: id + 1, role: 'assistant' as const, reply },
      ].slice(-60),
    );
  }

  function stop() {
    stopDictation.current?.();
    stopDictation.current = undefined;
    setListening(false);
  }

  return {
    open,
    draft,
    messages,
    listening,
    voiceStatus,
    setDraft,
    context,
    usesOpenAi: Boolean(remote),
    busy,
    reaction,
    remoteStatus,
    openWithContext(reading: AssistantMetricContext) {
      setContext(reading);
      setOpen(true);
    },
    clearContext() {
      setContext(undefined);
      previousReading.current = undefined;
    },
    show: () => setOpen(true),
    hide() {
      stop();
      request.current?.abort();
      setVoiceStatus('');
      setOpen(false);
    },
    async ask(question = draft, { useReading = true } = {}) {
      const trimmed = question.trim().slice(0, 500);
      if (!trimmed || (request.current && !request.current.signal.aborted)) return;
      stop();
      const previous = useReading ? previousReading.current : undefined;
      if (!useReading) {
        setContext(undefined);
        previousReading.current = undefined;
      }
      const { discussedMetric, ...reply } = answerMissionQuestion(
        trimmed,
        data,
        useReading ? context : undefined,
        previous &&
          data &&
          previous.crewId === data.selected.id &&
          previous.scenario === data.scenario &&
          previous.capturedAt === data.capturedAt
          ? previous
          : undefined,
        explorer,
      );
      if (discussedMetric) previousReading.current = discussedMetric;
      setDraft('');
      setVoiceStatus('');
      setRemoteStatus('');
      const textEmotion = detectTextEmotion(trimmed);
      if (!remote || reply.destination) {
        answer(trimmed, reply);
        setReaction(reactionToText(textEmotion));
        return;
      }

      const controller = new AbortController();
      request.current = controller;
      setBusy(true);
      setReaction('thinking');
      try {
        const remoteReply = await remote.conversation.reply(
          trimmed,
          controller.signal,
          remote.getContext(useReading ? context : undefined),
        );
        if (controller.signal.aborted) return;
        answer(trimmed, { ...reply, text: remoteReply.text });
        setReaction(
          textEmotion === 'neutral'
            ? (remoteReply.reaction ?? 'happy')
            : reactionToText(textEmotion),
        );
      } catch {
        if (controller.signal.aborted) return;
        setRemoteStatus('GPT no está disponible. Tumi respondió con la guía local.');
        answer(trimmed, reply);
        setReaction('understanding');
      } finally {
        if (request.current === controller) {
          request.current = null;
          setBusy(false);
        }
      }
    },
    toggleDictation() {
      if (listening) {
        stop();
        setVoiceStatus('');
        return;
      }
      setVoiceStatus('');
      const cancel = dictate({
        onText(text) {
          setDraft(text.slice(0, 500));
          setVoiceStatus('Revisa la transcripción y envíala cuando esté lista.');
        },
        onStatus: setVoiceStatus,
        onEnd() {
          stopDictation.current = undefined;
          setListening(false);
        },
      });
      stopDictation.current = cancel;
      setListening(Boolean(cancel));
    },
  };
}
