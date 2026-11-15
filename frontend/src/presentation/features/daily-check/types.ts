import type { CheckFormValues, MissionData } from '../mission/types';
import type { Mood } from '@/domain/mission/models';
import type { TumiEmotion } from '@/presentation/shared/tumi/TumiTechPortrait';
export interface DailyCheckScreenProps {
  data: MissionData;
  saving: boolean;
  onSave(values: CheckFormValues): Promise<boolean>;
}

export type DailyCheckViewModel = ReturnType<
  typeof import('./useDailyCheckViewModel').useDailyCheckViewModel
>;

export type DailyCheckGuideViewModel = ReturnType<
  typeof import('./useDailyCheckGuideViewModel').useDailyCheckGuideViewModel
>;

interface GuideQuestionBase {
  id: string;
  prompt: string;
}

export type GuideReaction = { text: string; emotion: TumiEmotion };
export type GuideChoice = {
  label: string;
  selected?: boolean;
  mood?: Mood;
  reaction?: GuideReaction;
  choose(): void;
};

export type GuideQuestion = GuideQuestionBase &
  (
    | { kind: 'choices'; options: GuideChoice[] }
    | {
        kind: 'number' | 'note';
        label: string;
        value: string;
        required?: boolean;
        max?: number;
        step?: number | 'any';
        change(value: string): void;
      }
  );
