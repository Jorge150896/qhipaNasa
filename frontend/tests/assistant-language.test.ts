import { afterEach, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { HttpTumiConversation } from '@/data/assistant/HttpTumiConversation';
import { answerAssistantIdentity } from '@/domain/assistant/assistantIdentity';
import { answerProjectQuestion, getProjectOverview } from '@/domain/assistant/projectKnowledge';
import { answerWellbeingQuestionLocally } from '@/domain/assistant/tumiWellbeing';
import { useCursorAssistantViewModel } from '@/presentation/features/cursor-assistant/useCursorAssistantViewModel';
import { useMissionAssistantViewModel } from '@/presentation/features/mission-assistant/useMissionAssistantViewModel';
import { AppLanguageProvider } from '@/presentation/shared/language/AppLanguageProvider';

afterEach(() => vi.unstubAllGlobals());

it.each([
  ['i have a problem', 'I’m here to listen'],
  ['qwhat it is a psicologist', 'A psychologist is a trained professional'],
])(
  'responde con acompañamiento local en inglés si GPT falla para %s',
  async (message, expected) => {
    const reply = vi.fn().mockRejectedValue(new Error('GPT unavailable'));
    const fallback = { reply: vi.fn() };
    const getContext = () => ({ view: 'Monitoreo diario', details: '', language: 'en' as const });
    const { result } = renderHook(
      () =>
        useCursorAssistantViewModel({ reply }, undefined, false, getContext, undefined, fallback),
      { wrapper: AppLanguageProvider },
    );
    act(() => result.current.setDraft(message));
    await act(async () => result.current.send());
    expect(reply).toHaveBeenCalledOnce();
    expect(fallback.reply).not.toHaveBeenCalled();
    expect(result.current.data.messages.at(-1)?.text).toContain(expected);
    expect(result.current.data.error).toBe('');
  },
);

it('distingue una solicitud de apoyo de un problema con la app', () => {
  expect(answerWellbeingQuestionLocally('Tengo un problema')).toContain('escucharte');
  expect(answerWellbeingQuestionLocally('¿Qué es una psicóloga?')).toContain('las emociones');
  expect(answerWellbeingQuestionLocally('I have a problem with the app', 'en')).toBeUndefined();
});

it('envía el ánimo expresado por la persona al backend antes de usar respuestas locales', async () => {
  const answer = 'Gracias por contármelo. Podemos pensar en algo que te alivie hoy.';
  const reply = vi.fn(async () => ({ text: answer }));
  const fallback = { reply: vi.fn() };
  const getContext = () => ({ view: 'Simulación · Ruta emocional', details: 'Elena Torres' });
  const floating = renderHook(() =>
    useCursorAssistantViewModel({ reply }, undefined, false, getContext, undefined, fallback),
  );
  const contextual = renderHook(() =>
    useMissionAssistantViewModel(null, () => undefined, false, {
      conversation: { reply },
      getContext,
      pathname: '/mission/simulation',
    }),
  );

  act(() => floating.result.current.setDraft('Estoy triste'));
  await act(async () => floating.result.current.send());
  await act(async () => contextual.result.current.ask('Estoy triste'));

  expect(reply).toHaveBeenCalledTimes(2);
  expect(reply).toHaveBeenNthCalledWith(1, 'Estoy triste', expect.any(AbortSignal), getContext());
  expect(reply).toHaveBeenNthCalledWith(2, 'Estoy triste', expect.any(AbortSignal), getContext());
  expect(fallback.reply).not.toHaveBeenCalled();
  expect(floating.result.current.data.messages.at(-1)?.text).toBe(answer);
  expect(contextual.result.current.messages.at(-1)?.reply.text).toBe(answer);
});

it('usa la guía de la app cuando GPT falla', async () => {
  const reply = vi.fn().mockRejectedValue(new Error('GPT unavailable'));
  const getContext = () => ({ view: 'Monitoreo diario', details: '' });
  const { result } = renderHook(() =>
    useMissionAssistantViewModel(
      null,
      () => undefined,
      false,
      { conversation: { reply }, getContext, pathname: '/mission/journal' },
      undefined,
      undefined,
      undefined,
      'en',
    ),
  );
  await act(async () => result.current.ask('Tell me about the section Simulation'));
  expect(reply).toHaveBeenCalledOnce();
  expect(result.current.messages.at(-1)?.reply.text).toContain('30 simulated days in 6 seconds');
  expect(result.current.remoteStatus).toBe('');
});

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

it('abandona una respuesta remota que no avanza sin cancelar la conversación', async () => {
  vi.useFakeTimers();
  try {
    const fetch = vi.fn(
      (_url: URL, options: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          options.signal?.addEventListener('abort', () => reject(options.signal?.reason), {
            once: true,
          });
        }),
    );
    vi.stubGlobal('fetch', fetch);
    const signal = new AbortController().signal;
    const adapter = new HttpTumiConversation('https://example.test');
    const result = expect(adapter.reply('¿Qué cambió en la nave?', signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    await vi.advanceTimersByTimeAsync(24_000);
    await result;
    expect(signal.aborted).toBe(false);
  } finally {
    vi.useRealTimers();
  }
});

it('entiende formas naturales e imprecisas de pedir la presentación de Nami', () => {
  for (const question of [
    'can i say me about you',
    'Can you tell me about you?',
    'Could you tell me a little bit about yourself, Nami?',
    'Háblame de ti, Nami',
  ]) {
    expect(answerAssistantIdentity(question, 'en')).toContain('I’m Nami, the virtual companion');
  }
  expect(answerAssistantIdentity('Could you tell me about Elena?', 'en')).toBeUndefined();
});

it('explica el proyecto cuando la pregunta usa distintas formas de pedir una introducción', () => {
  for (const question of [
    'can you explain me about the app?',
    'Could you explain the app?',
    'Tell me more about this project.',
    'What can I do with the app?',
  ]) {
    expect(answerProjectQuestion(question, 'Monitoreo diario', 'en')).toBe(
      getProjectOverview('en'),
    );
  }
  expect(
    answerProjectQuestion('Can you explain this app error?', 'Monitoreo diario', 'en'),
  ).toBeUndefined();
});

it.each([
  ['tell me about the section simulation', 'en', '30 simulated days in 6 seconds'],
  ['Can you explain the simulation section?', 'en', '30 simulated days in 6 seconds'],
  ['Tell me about the Emotional Timeline', 'en', 'change nutrition, exercise and social contact'],
  ['How long does the simulation take?', 'en', '30 simulated days in 6 seconds'],
  ['How do I play the month?', 'en', 'Select Play month'],
  ['What is there in Crew History?', 'en', 'Compare two samples'],
  ['Could you describe the Space map?', 'en', 'Select a destination'],
  ['How do I save my check-in?', 'en', 'select Save check-in'],
  ['Tell me about Inspiration4', 'en', 'historical Inspiration4 data'],
  ['Where do I find the language settings?', 'en', 'using the header selector'],
  ['¿Me cuentas sobre la sección de pérdida de señal?', 'es', 'última lectura disponible'],
  ['¿Cómo uso el mapa de Marte?', 'es', 'Base Ares'],
  ['Explícame la Autoevaluación', 'es', 'cómo te sientes y cómo dormiste'],
  ['¿Qué hay en esta sección?', 'es', 'Hacerlo con Nami'],
] as const)('reconoce la pregunta %s en %s', (question, language, expected) => {
  expect(answerProjectQuestion(question, 'Monitoreo diario', language)).toContain(expected);
});

it('deja las preguntas sobre registros concretos al chat contextual', () => {
  expect(
    answerProjectQuestion('Tell me about Elena in Simulation', 'Monitoreo diario', 'en'),
  ).toBeUndefined();
});
