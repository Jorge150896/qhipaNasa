import { useEffect, useEffectEvent, useState } from 'react';
import type { TumiReplyAudio } from '@/presentation/shared/tumi/useTumiReplyAudio';
import { dailyCheckQuestions, guideModePrompt } from './dailyCheckQuestions';
import type { DailyCheckViewModel, GuideChoice, GuideReaction } from './types';

export function useDailyCheckGuideViewModel(model: DailyCheckViewModel, audio: TumiReplyAudio) {
  const [mode, setMode] = useState<'choose' | 'manual' | 'guided'>('choose');
  const [index, setIndex] = useState(0);
  const [voice, setVoice] = useState(true);
  const [reaction, setReaction] = useState<GuideReaction>();
  const questions = mode === 'guided' ? dailyCheckQuestions(model) : [];
  const question = questions[index];
  const guided = mode === 'guided' && model.step < 2;
  const prompt = guided ? question?.prompt : mode === 'choose' ? guideModePrompt : undefined;
  const voiceText = reaction && prompt ? `${reaction.text} ${prompt}` : prompt;
  const speakQuestion = useEffectEvent((text: string) => audio.play(text, { transcript: true }));
  const { stop } = audio;

  useEffect(() => {
    if (!guided || !voiceText || !voice) return;
    speakQuestion(voiceText);
    return stop;
  }, [guided, voiceText, stop, voice]);

  function advance() {
    if (index === questions.length - 1) {
      model.reviewGuided();
    } else setIndex(index + 1);
  }

  return {
    mode,
    active: model.step < 2 && mode !== 'manual',
    index,
    question,
    prompt,
    reaction,
    voice,
    speaking: audio.playing,
    listen() {
      if (audio.playing) stop();
      else if (voiceText) audio.play(voiceText, { transcript: true });
    },
    toggleVoice() {
      setVoice(!voice);
    },
    selectManual() {
      stop();
      setReaction(undefined);
      setMode('manual');
    },
    chooseMode() {
      stop();
      setReaction(undefined);
      setMode('choose');
    },
    start() {
      setIndex(0);
      setReaction(undefined);
      setMode('guided');
    },
    choose(option: GuideChoice) {
      option.choose();
      setReaction(
        option.reaction ?? {
          text: 'Gracias, ya lo anoté para tu chequeo.',
          emotion: 'understanding',
        },
      );
      advance();
    },
    advance() {
      setReaction(
        question?.kind === 'number' && question.value !== ''
          ? { text: 'Gracias, ya tengo ese dato para tu resumen.', emotion: 'approved' }
          : undefined,
      );
      advance();
    },
    back() {
      setReaction(undefined);
      setIndex(Math.max(0, index - 1));
    },
    edit() {
      model.edit();
      setReaction(undefined);
      setIndex(0);
    },
    last: index === questions.length - 1,
  };
}
