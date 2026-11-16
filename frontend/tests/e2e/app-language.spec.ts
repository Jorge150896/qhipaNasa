import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('English check-in translates Nami’s full speech and preserves the draft when the language changes', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const voices = [
      {
        lang: 'es-ES',
        localService: true,
        default: true,
        name: 'Spanish woman',
        voiceURI: 'es-original',
      },
      { lang: 'en-GB', localService: true, name: 'British voice', voiceURI: 'en-gb' },
      { lang: 'en-US', localService: false, name: 'American natural', voiceURI: 'en-us' },
    ];
    Object.defineProperty(window, 'SpeechRecognition', {
      value: class {
        processLocally = false;
        lang = '';
        start() {
          document.documentElement.dataset.testDictation = this.lang;
        }
        abort() {}
      },
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: class extends EventTarget {
        constructor(public readonly text: string) {
          super();
        }
      },
    });
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speaking: false,
        pending: false,
        getVoices: () => voices,
        speak(utterance: SpeechSynthesisUtterance) {
          const { text, lang, rate, voice } = utterance;
          document.documentElement.dataset.testSpeech = [lang, voice?.lang ?? '', rate, text].join(
            '|',
          );
          utterance.onstart?.(new Event('start') as SpeechSynthesisEvent);
          queueMicrotask(() => utterance.onend?.(new Event('end') as SpeechSynthesisEvent));
        },
        cancel() {},
      },
    });
  });

  await page.goto('/mission/journal');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('lang', 'en');
  await expect(
    page.getByText('Record how you feel and review your body and environment readings.'),
  ).toBeVisible();
  await expect(page.getByText('Commander', { exact: true })).toBeVisible();
  await expect(page.getByText('Rest · Rest habitat')).toBeVisible();
  await expect(html).toHaveAttribute(
    'data-test-speech',
    /^en-US\|en-US\|0\.9\|Would you like to fill out your check-in/,
  );

  await page.getByRole('button', { name: 'Open Nami assistant', exact: true }).click();
  const assistant = page.getByRole('region', { name: 'Nami assistant' });
  await assistant.locator('summary').click();
  await assistant.getByLabel('Nami’s voice').selectOption('en-gb');
  await assistant.getByRole('button', { name: 'Close conversation', exact: true }).click();
  await page.getByRole('button', { name: 'Listen to the question' }).click();
  await expect(html).toHaveAttribute(
    'data-test-speech',
    /^en-GB\|en-GB\|0\.9\|Would you like to fill out your check-in/,
  );

  await page.getByRole('button', { name: 'Check in with Nami' }).click();
  const guide = page.locator('.daily-guide');
  await guide.getByRole('button', { name: 'Okay', exact: true }).click();
  await expect(guide.getByRole('heading')).toHaveText('What activity would you like to log?');
  await expect(guide.getByText(/Some days feel a little mixed/)).toBeVisible();
  await expect(html).toHaveAttribute(
    'data-test-speech',
    /^en-GB\|en-GB\|0\.9\|Thanks for telling me\..*What activity would you like to log\?$/,
  );

  await guide.getByRole('button', { name: 'Cabin routine', exact: true }).click();
  await guide.getByRole('button', { name: 'Before', exact: true }).click();
  await guide.getByLabel('Hours of sleep').fill('7');
  await expect(html).toHaveAttribute('data-test-dictation', 'en-US');
  const language = page.getByRole('combobox', { name: 'App language', exact: true });
  await language.selectOption('es');
  await expect(html).toHaveAttribute('lang', 'es');
  await expect(guide.getByLabel('Horas de sueño')).toHaveValue('7');
  await expect(html).toHaveAttribute('data-test-dictation', 'es-ES');
  await expect(html).toHaveAttribute(
    'data-test-speech',
    /^es-ES\|es-ES\|1\.02\|.*cuántas horas dormiste/,
  );
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Monitoreo diario', exact: true })).toBeVisible();
});

test('Nami changes the interface language from an explicit request', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/mission/crew');
  const compactButton = page.getByRole('button', { name: 'Open Nami', exact: true });
  if (await compactButton.isVisible()) await compactButton.click();
  else await page.getByRole('button', { name: 'Open Nami assistant', exact: true }).click();
  const ask = page.getByPlaceholder('Ask me something…');
  const log = page.getByRole('log', { name: 'Conversation with Nami' });
  await ask.fill("Nami, what's your name?");
  await ask.press('Enter');
  await expect(log).toContainText('I’m Nami, your virtual assistant for Qhipa Pacha.');
  await ask.fill('Switch the app to Spanish');
  await ask.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByText('La aplicación ya está en español.').first()).toBeAttached();
  const spanishLog = page.getByRole('log', { name: 'Conversación con Nami' });
  await page.getByRole('textbox', { name: 'Mensaje para Nami' }).fill('¿Cómo te llamas, Nami?');
  await page.getByRole('textbox', { name: 'Mensaje para Nami' }).press('Enter');
  await expect(spanishLog).toContainText('Soy Nami, tu asistente virtual de Qhipa Pacha.');
});

test('Nami describes the visible simulation in English even when the question is in Spanish', async ({
  page,
}) => {
  await page.goto('/mission/simulation');
  await page.getByRole('button', { name: 'Open Nami assistant', exact: true }).click();
  const ask = page.getByPlaceholder('Ask me something…');
  await ask.fill('¿Qué ves?');
  await ask.press('Enter');
  const assistant = page.getByRole('region', { name: 'Nami assistant' });
  await expect(
    assistant
      .getByRole('log')
      .getByText(/Day 30 · Nov 8: Elena Torres is on the Needs attention route/)
      .first(),
  ).toBeAttached();
  await expect(assistant.getByRole('log')).not.toContainText('Veo una');
});
