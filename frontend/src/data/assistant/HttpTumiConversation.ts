import {
  TumiDailyLimitError,
  tumiReactions,
  type TumiConversation,
  type TumiReply,
  type TumiScreenContext,
} from '@/domain/assistant/TumiConversation';

export class HttpTumiConversation implements TumiConversation {
  constructor(private readonly origin: string) {}

  async reply(
    message: string,
    signal: AbortSignal,
    context?: TumiScreenContext,
  ): Promise<TumiReply> {
    const response = await fetch(new URL('/api/v1/tumi/replies', this.origin), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
      signal,
    });
    if (response.status === 429) throw new TumiDailyLimitError();
    if (!response.ok) throw new Error('Tumi no está disponible.');
    const body: unknown = await response.json();
    if (
      typeof body !== 'object' ||
      body === null ||
      !('text' in body) ||
      typeof body.text !== 'string' ||
      !body.text.trim()
    ) {
      throw new Error('Tumi recibió una respuesta vacía.');
    }
    const reaction =
      'reaction' in body ? tumiReactions.find((item) => item === body.reaction) : undefined;
    return { text: body.text, reaction };
  }
}
