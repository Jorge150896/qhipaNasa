export interface TumiMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

/** Client port. A future provider must preserve cancellation and explicit errors. */
export interface TumiConversation {
  reply(message: string, signal: AbortSignal): Promise<string>;
}
