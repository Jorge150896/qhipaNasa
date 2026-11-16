import type { AppLanguage } from './AppLanguage';

export interface TumiMessage {
  id: number;
  role: 'user' | 'assistant';
  language?: AppLanguage;
  text: string;
}

export const tumiReactions = ['happy', 'curious', 'understanding', 'focused'] as const;

export interface TumiReply {
  text: string;
  reaction?: (typeof tumiReactions)[number];
}

export interface TumiScreenContext {
  view: string;
  details: string;
  language?: AppLanguage;
}

export class TumiDailyLimitError extends Error {
  constructor() {
    super('Nami alcanzó el límite diario de GPT.');
  }
}

/** Client port. Providers preserve cancellation and explicit errors. */
export interface TumiConversation {
  reply(message: string, signal: AbortSignal, context?: TumiScreenContext): Promise<TumiReply>;
}
