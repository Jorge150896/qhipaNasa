export interface TumiMessage {
  id: number;
  role: 'user' | 'assistant';
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
}

/** Client port. Providers preserve cancellation and explicit errors. */
export interface TumiConversation {
  reply(message: string, signal: AbortSignal, context?: TumiScreenContext): Promise<TumiReply>;
}
