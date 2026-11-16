import { useAppLanguage, useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Speak = (
  text: string,
  callbacks: {
    onStart(): void;
    onEnd(): void;
    onError(message: string): void;
    onWordBoundary?(charIndex: number): void;
  },
) => () => void;

export type TumiReplyFormat = 'text' | 'audio';

function formatForSpeech(text: string, english: boolean) {
  return text
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g, '$1')
    .replace(/[*`]/g, '')
    .replace(/^\s*(?:#{1,6}\s+|[-•]\s+)/gm, '')
    .replace(/\bSpO[₂2]/gi, english ? 'oxygen saturation' : 'saturación de oxígeno')
    .replace(/(\d+)\s*lpm\b/gi, english ? '$1 beats per minute' : '$1 latidos por minuto')
    .replace(/(\d+)\s*rpm\b/gi, english ? '$1 breaths per minute' : '$1 respiraciones por minuto')
    .replace(/(\d+(?:[.,]\d+)?)\s*°C\b/gi, english ? '$1 degrees Celsius' : '$1 grados Celsius')
    .replace(/(\d+(?:[.,]\d+)?)\s*%/g, english ? '$1 percent' : '$1 por ciento')
    .replace(/\s*[·→>]\s*/g, '. ')
    .replace(/\b(?:[01]?\d|2[0-3]):[0-5]\d UTC\b/g, (time) =>
      time.replace(' UTC', english ? ' UTC' : ' hora universal'),
    );
}

export function useTumiReplyAudio(speak: Speak, pathname?: string) {
  const { language } = useAppLanguage();
  const t = useTranslation();
  const format = useRef<TumiReplyFormat>('text');
  const cancel = useRef<(() => void) | undefined>(undefined);
  const [selectedFormat, setSelectedFormat] = useState<TumiReplyFormat>('text');
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState('');
  const [spokenWords, setSpokenWords] = useState<number>();
  const [transcriptText, setTranscriptText] = useState<string>();

  const stop = useCallback(() => {
    cancel.current?.();
    cancel.current = undefined;
    setPlaying(false);
    setStatus('');
    setSpokenWords(undefined);
    setTranscriptText(undefined);
  }, []);

  useEffect(() => () => stop(), [pathname, language, stop]);

  function play(
    text: string,
    {
      transcript = false,
      visibleText = text,
      onComplete,
    }: {
      transcript?: boolean;
      visibleText?: string;
      onComplete?(): void;
    } = {},
  ) {
    stop();
    text = t(text);
    setPlaying(true);
    if (transcript) setTranscriptText(visibleText);
    const wordEnds = transcript
      ? Array.from(text.matchAll(/\S+/g), (word) => word.index + word[0].length)
      : [];
    const visibleWordCount =
      t(visibleText) === text ? wordEnds.length : (t(visibleText).match(/\S+/g)?.length ?? 0);
    let progress = 0;
    let estimate: ReturnType<typeof setInterval> | undefined;
    let active = true;

    function reveal(count: number) {
      progress = Math.max(progress, Math.min(count, wordEnds.length));
      setSpokenWords(Math.ceil((progress * visibleWordCount) / Math.max(wordEnds.length, 1)));
    }

    const cancelSpeech = speak(text, {
      onStart() {
        if (!transcript) return;
        reveal(1);
        estimate = setInterval(() => {
          reveal(progress + 1);
          if (progress >= wordEnds.length) clearInterval(estimate);
        }, 360);
      },
      onWordBoundary: transcript
        ? (charIndex) => {
            clearInterval(estimate);
            const index = wordEnds.findIndex((end) => charIndex < end);
            reveal(index === -1 ? wordEnds.length : index + 1);
          }
        : undefined,
      onEnd() {
        if (!active) return;
        active = false;
        clearInterval(estimate);
        if (transcript) reveal(wordEnds.length);
        setPlaying(false);
        onComplete?.();
      },
      onError(message) {
        if (!active) return;
        active = false;
        clearInterval(estimate);
        setPlaying(false);
        setSpokenWords(undefined);
        setTranscriptText(undefined);
        setStatus(message);
        onComplete?.();
      },
    });
    cancel.current = () => {
      active = false;
      clearInterval(estimate);
      cancelSpeech();
    };
  }

  function replayReply(text: string, options?: { transcript: boolean }) {
    const spokenText = formatForSpeech(t(text), language === 'en');
    play(spokenText, { transcript: options?.transcript === true, visibleText: text });
  }

  return {
    selectedFormat,
    playing,
    spokenWords,
    transcriptText,
    status,
    stop,
    play,
    select(next: TumiReplyFormat) {
      if (format.current === next) return;
      format.current = next;
      setSelectedFormat(next);
      if (next === 'audio') play('Responderé en audio.');
      else stop();
    },
    readReply(text: string, options?: { transcript: boolean }) {
      if (format.current === 'audio') replayReply(text, options);
    },
    replayReply,
  };
}

export type TumiReplyAudio = ReturnType<typeof useTumiReplyAudio>;
