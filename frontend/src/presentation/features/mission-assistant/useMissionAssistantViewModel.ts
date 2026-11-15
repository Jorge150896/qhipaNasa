import { useEffect, useRef, useState } from 'react';
import type { MissionData } from '../mission/types';
import { answerMissionQuestion } from './explainMission';
import type { AssistantMessage, AssistantMetricContext, AssistantReply } from './types';

type Dictation = (callbacks: {
  onText(text: string): void;
  onStatus(message: string): void;
  onEnd(): void;
}) => (() => void) | undefined;

export function useMissionAssistantViewModel(
  data: MissionData | null,
  dictate: Dictation,
  explorer = false,
) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<AssistantMetricContext>();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const sequence = useRef(0);
  const previousReading = useRef<AssistantMetricContext>(undefined);
  const stopDictation = useRef<(() => void) | undefined>(undefined);

  useEffect(() => () => stopDictation.current?.(), []);

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
      setVoiceStatus('');
      setOpen(false);
    },
    ask(question = draft) {
      const trimmed = question.trim().slice(0, 500);
      if (!trimmed) return;
      stop();
      const previous = previousReading.current;
      const { discussedMetric, ...reply } = answerMissionQuestion(
        trimmed,
        data,
        context,
        previous &&
          data &&
          previous.crewId === data.selected.id &&
          previous.scenario === data.scenario &&
          previous.capturedAt === data.capturedAt
          ? previous
          : undefined,
        explorer,
      );
      answer(trimmed, reply);
      if (discussedMetric) previousReading.current = discussedMetric;
      setDraft('');
      setVoiceStatus('');
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
