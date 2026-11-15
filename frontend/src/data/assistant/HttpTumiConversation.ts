import {
  tumiReactions,
  type TumiConversation,
  type TumiReply,
  type TumiScreenContext,
} from '@/domain/assistant/TumiConversation';

export class HttpTumiConversation implements TumiConversation {
  async reply(
    message: string,
    signal: AbortSignal,
    context?: TumiScreenContext,
  ): Promise<TumiReply> {
    const response = await fetch('http://127.0.0.1:8080/api/v1/tumi/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
      signal,
    });
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
