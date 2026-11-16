import { afterEach, expect, it, vi } from 'vitest';
import { HttpTumiConversation } from '@/data/assistant/HttpTumiConversation';

afterEach(() => vi.unstubAllGlobals());

it('passes the app language to Nami and rejects a mixed-language answer in English mode', async () => {
  const mixed =
    'Veo una simulación de ruta emocional. En la instantánea, Elena está descansando. Anything else?';
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ text: mixed }))
    .mockResolvedValueOnce(Response.json({ text: 'Elena is resting in the simulated habitat.' }))
    .mockResolvedValueOnce(Response.json({ text: 'Hi! I’m Tumi, your virtual assistant.' }));
  vi.stubGlobal('fetch', fetch);
  const reply = new HttpTumiConversation('https://example.test');
  const context = {
    view: 'Simulación',
    details: 'Elena está descansando.',
    language: 'en' as const,
  };
  const signal = new AbortController().signal;

  await expect(reply.reply('¿Qué ves?', signal, context)).rejects.toThrow('wrong language');
  await expect(reply.reply('¿Qué ves?', signal, context)).resolves.toMatchObject({
    text: 'Elena is resting in the simulated habitat.',
  });
  await expect(reply.reply('Who are you?', signal, context)).resolves.toMatchObject({
    text: 'Hi! I’m Nami, your virtual assistant.',
  });
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ message: '¿Qué ves?', context });
});
