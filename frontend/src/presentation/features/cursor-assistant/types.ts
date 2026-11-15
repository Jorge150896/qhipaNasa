import type { TumiEmotion } from '@/presentation/shared/tumi/TumiTechPortrait';
export type { TumiEmotion } from '@/presentation/shared/tumi/TumiTechPortrait';

export interface CursorAssistantData {
  paused: boolean;
  open: boolean;
  hidden: boolean;
  speaking: boolean;
  voiceStatus: string;
  state: import('./behavior').TumiState;
  emotion: TumiEmotion;
  draft: string;
  messages: { id: number; role: 'user' | 'assistant'; text: string }[];
  busy: boolean;
  error: string;
}

export type Speak = (
  text: string,
  callbacks: {
    onStart(): void;
    onEnd(): void;
    onError(message: string): void;
  },
) => () => void;
