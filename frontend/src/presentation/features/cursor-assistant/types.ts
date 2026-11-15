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

export type TumiEmotion =
  | 'angry'
  | 'neutral'
  | 'happy'
  | 'joy'
  | 'wink'
  | 'laughing'
  | 'surprised'
  | 'curious'
  | 'thinking'
  | 'understanding'
  | 'approved'
  | 'amazed'
  | 'focused'
  | 'motivated'
  | 'achieved'
  | 'doubtful'
  | 'confused'
  | 'worried'
  | 'sad'
  | 'tired'
  | 'sleeping'
  | 'error'
  | 'greeting'
  | 'searching'
  | 'writing'
  | 'processing'
  | 'loading'
  | 'online'
  | 'farewell'
  | 'shy';

export type Speak = (
  text: string,
  callbacks: {
    onStart(): void;
    onEnd(): void;
    onError(message: string): void;
  },
) => () => void;
