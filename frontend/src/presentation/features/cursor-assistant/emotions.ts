import type { TextEmotion } from '@/domain/assistant/detectTextEmotion';
import type { TumiEmotion } from './types';

export function reactionToText(emotion: TextEmotion): TumiEmotion {
  const reactions: Record<TextEmotion, TumiEmotion> = {
    neutral: 'neutral',
    happy: 'joy',
    sad: 'sad',
    angry: 'angry',
    mixed: 'understanding',
  };
  return reactions[emotion];
}

/** Gentle idle moods only: random anger/sadness must not imply anything about the visitor. */
export function autonomousEmotion(
  previous: TumiEmotion,
  inactive: boolean,
  random: number,
): TumiEmotion {
  const choices: TumiEmotion[] = inactive
    ? ['neutral', 'curious', 'tired', 'sleeping']
    : ['neutral', 'happy', 'curious', 'wink', 'surprised', 'shy', 'motivated'];
  const different = choices.filter((emotion) => emotion !== previous);
  return different[
    Math.min(different.length - 1, Math.max(0, Math.floor(random * different.length)))
  ];
}
