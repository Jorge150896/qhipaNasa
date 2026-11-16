import { useEffect, useEffectEvent, useState } from 'react';
import type { TumiReplyAudio } from '@/presentation/shared/tumi/useTumiReplyAudio';
import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { dailyCheckQuestions, guideModePrompt } from './dailyCheckQuestions';
import type { DailyCheckViewModel, GuideChoice, GuideReaction } from './types';
import { interpretGuideDictation } from './interpretGuideDictation';
import { useDailyGuideDictation, type StartGuideDictation } from './useDailyGuideDictation';

export function useDailyCheckGuideViewModel(
  model: DailyCheckViewModel,
  audio: TumiReplyAudio,
  startDictation: StartGuideDictation,
) {
  const t = useTranslation();
  const [mode, setMode] = useState<'choose' | 'manual' | 'guided'>('choose');
  const [index, setIndex] = useState(0);
  const [voice, setVoice] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [reaction, setReaction] = useState<GuideReaction>();
  const questions = mode === 'guided' ? dailyCheckQuestions(model) : [];
  const question = questions[index];
  const dictation = useDailyGuideDictation(startDictation);
  const voiceAnswer = question && interpretGuideDictation(question, dictation.transcript);
  const guided = mode === 'guided' && model.step < 2;
  const prompt = guided ? question?.prompt : mode === 'choose' ? guideModePrompt : undefined;
  const voiceText = prompt ? [t(reaction?.text), t(prompt)].filter(Boolean).join(' ') : undefined;
  const beginListening = useEffectEvent(() => {
    if (microphoneEnabled && !dictation.listening) startListening();
  });
  const speakQuestion = useEffectEvent((text: string, onComplete: () => void) =>
    audio.play(text, { transcript: true, onComplete }),
  );
  const { stop } = audio;

  useEffect(() => {
    if (!voiceText) return;
    let delay: number | undefined;
    function listenAfterQuestion() {
      if (!guided) return;
      delay = window.setTimeout(() => beginListening(), voice ? 200 : 0);
    }
    if (voice) speakQuestion(voiceText, listenAfterQuestion);
    else listenAfterQuestion();
    return () => {
      window.clearTimeout(delay);
      stop();
    };
  }, [guided, voiceText, stop, voice, dictation.language]);

  function advance() {
    dictation.reset();
    if (index === questions.length - 1) {
      model.reviewGuided();
    } else setIndex(index + 1);
  }

  function choose(option: GuideChoice) {
    option.choose();
    setReaction(
      option.reaction ?? {
        text: 'Gracias, ya lo anoté para tu chequeo.',
        emotion: 'understanding',
      },
    );
    advance();
  }

  function acceptValue(value: string) {
    setReaction(
      question?.kind === 'number' && value !== ''
        ? { text: 'Gracias, ya tengo ese dato para tu resumen.', emotion: 'approved' }
        : undefined,
    );
    advance();
  }

  function acceptVoiceAnswer(text: string) {
    if (!question) return;
    const answer = interpretGuideDictation(question, text);
    if (question.kind === 'choices' && answer?.kind === 'choice') {
      const option = question.options.find(({ label }) => label === answer.label);
      if (option) choose(option);
    } else if (question.kind !== 'choices' && answer?.kind === 'value') {
      question.change(answer.value);
      acceptValue(answer.value);
    }
  }

  function startListening() {
    dictation.start(
      (text) =>
        Boolean(question && question.kind !== 'note' && interpretGuideDictation(question, text)),
      acceptVoiceAnswer,
    );
  }

  return {
    mode,
    active: model.step < 2 && mode !== 'manual',
    index,
    question,
    prompt,
    reaction,
    voice,
    dictation: {
      listening: dictation.listening,
      capturing: dictation.capturing,
      finishing: dictation.finishing,
      language: dictation.language,
      microphoneEnabled,
      changeLanguage: dictation.changeLanguage,
      status: dictation.status,
      transcript: dictation.transcript,
      preview: dictation.preview,
      needsReview: dictation.needsReview,
      canEnterResponse: dictation.canEnterResponse,
      enterResponse: dictation.enterResponse,
      answer: voiceAnswer?.label,
      finish: dictation.stop,
      pause() {
        dictation.reset();
        setMicrophoneEnabled(false);
      },
      resume() {
        setMicrophoneEnabled(true);
        if (!audio.playing) startListening();
      },
      accept() {
        if (!dictation.listening) acceptVoiceAnswer(dictation.transcript);
      },
    },
    speaking: audio.playing,
    listen() {
      if (audio.playing) stop();
      else if (voiceText) audio.play(voiceText, { transcript: true });
    },
    toggleVoice() {
      dictation.reset();
      setVoice(!voice);
    },
    selectManual() {
      stop();
      dictation.reset();
      setReaction(undefined);
      setMode('manual');
    },
    chooseMode() {
      stop();
      dictation.reset();
      setReaction(undefined);
      setMode('choose');
    },
    start() {
      setIndex(0);
      setReaction(undefined);
      setMode('guided');
      setMicrophoneEnabled(true);
    },
    choose,
    advance() {
      acceptValue(question?.kind === 'number' ? question.value : '');
    },
    back() {
      dictation.reset();
      setReaction(undefined);
      setIndex(Math.max(0, index - 1));
    },
    edit() {
      dictation.reset();
      model.edit();
      setReaction(undefined);
      setIndex(0);
    },
    last: index === questions.length - 1,
  };
}
