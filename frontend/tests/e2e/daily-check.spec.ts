import { expect, test } from '@playwright/test';
import { openTumiChat } from './tumi-chat-helpers';

test('chequeo por actividad en móvil con reintento, actualización y registros anteriores', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speaking: false,
        pending: false,
        getVoices: () => [],
        speak(utterance: SpeechSynthesisUtterance) {
          document.documentElement.dataset.savedCheckSpeech = utterance.text;
          utterance.dispatchEvent(new Event('start'));
          utterance.dispatchEvent(new Event('end'));
        },
        cancel() {},
      },
    });
    const write = Storage.prototype.setItem;
    const key = 'astra.demo.journal.v1';
    if (!localStorage.getItem(key)) {
      write.call(
        localStorage,
        key,
        JSON.stringify({
          version: 1,
          checks: [
            {
              id: 'elena:2020-01-01',
              crewId: 'elena',
              recordedAt: '2020-01-01T12:00:00Z',
              sleepHours: 6.7,
              fatigue: 2,
              mood: 'good',
              note: 'Registro anterior',
            },
          ],
          reviewedObservationIds: ['sleep-elena-v1'],
        }),
      );
    }
    Storage.prototype.setItem = function (name, value) {
      if (name === key && document.documentElement.dataset.failCheck === 'yes')
        throw new Error('demo');
      write.call(this, name, value);
    };
  });
  await page.goto('/mission/journal');
  const form = page.locator('.daily-check-form');
  await form.getByRole('radio', { name: 'Caminata espacial EVA' }).check();
  await form.getByRole('radio', { name: 'Antes', exact: true }).check();
  await form.getByRole('button', { name: 'Continuar a autoevaluación' }).click();
  await form.getByRole('spinbutton', { name: /Duración prevista/ }).fill('25');
  await expect(form.getByRole('spinbutton', { name: /Molestias en manos/ })).toBeVisible();
  await form.getByRole('button', { name: 'Volver al contexto' }).click();
  await form.getByRole('radio', { name: 'Recorrido de superficie' }).check();
  await form.getByRole('radio', { name: 'Incidencia durante la actividad' }).check();
  await form.getByRole('button', { name: 'Continuar a autoevaluación' }).click();
  await expect(form.getByRole('spinbutton', { name: /Duración transcurrida/ })).toHaveValue('');
  await expect(form.getByRole('spinbutton', { name: /Molestias en manos/ })).toHaveCount(0);
  await form.getByRole('spinbutton', { name: 'Horas de sueño' }).fill('7.5');
  await form.getByLabel('Nota (opcional)').fill('Detalle privado de la nota');
  await form.getByRole('spinbutton', { name: /Distancia/ }).fill('0');
  await form.getByLabel('Región con molestias (opcional)').selectOption('hands');
  await form
    .getByRole('group', { name: '¿Hiciste ejercicio hoy?' })
    .getByRole('radio', { name: 'No', exact: true })
    .check();
  await form.getByRole('button', { name: 'Revisar chequeo' }).click();
  await expect(form).toContainText('0 km');
  const attachments = form.getByRole('region', { name: 'Datos adjuntos' });
  await expect(attachments).toContainText('Temperatura de cabina');
  await expect(attachments).toContainText('Temperatura corporal');
  await expect(attachments).toContainText('Frecuencia cardíaca');
  await expect(attachments).toContainText('Microgravedad de referencia');
  await expect(attachments).toContainText('Datos sintéticos');
  await expect(form).toContainText('Sin registrar');
  await page.evaluate(() => {
    document.documentElement.dataset.failCheck = 'yes';
  });
  await form.getByRole('button', { name: 'Guardar chequeo' }).click();
  await expect(form.getByRole('alert')).toContainText('El borrador sigue disponible');
  await expect(form.getByText('Chequeo guardado', { exact: true })).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-saved-check-speech', /.+/);
  await page.evaluate(() => {
    delete document.documentElement.dataset.failCheck;
  });
  await form.getByRole('button', { name: 'Reintentar guardado' }).click();
  await expect(form.getByText('Chequeo guardado', { exact: true })).toBeVisible();
  const tumiResult = form.locator('.daily-welcome[data-result]');
  await expect(tumiResult.getByRole('heading', { name: 'Chequeo completo' })).toBeVisible();
  await expect(tumiResult.locator('.daily-tumi-transcript')).toContainText('horas de sueño');
  const voice = page.locator('html');
  await expect(voice).toHaveAttribute(
    'data-saved-check-speech',
    /recorrido de superficie durante una incidencia/,
  );
  await expect(voice).toHaveAttribute('data-saved-check-speech', /7,5 horas de sueño/);
  await expect(voice).not.toHaveAttribute('data-saved-check-speech', /Detalle privado/);
  await page.evaluate(() => delete document.documentElement.dataset.savedCheckSpeech);
  await tumiResult.getByRole('button', { name: 'Escuchar resumen' }).click();
  await expect(voice).toHaveAttribute('data-saved-check-speech', /7,5 horas de sueño/);
  await page.reload();
  const checks = page.locator('.check-list');
  await expect(checks).toContainText('Registro anterior');
  await expect(checks).toContainText('0 km');
  await checks.getByText('Ver datos adjuntos del chequeo', { exact: true }).click();
  await expect(checks.getByText('Temperatura de cabina', { exact: true })).toBeVisible();
  await expect(form.getByRole('radio', { name: 'Recorrido de superficie' })).toBeChecked();
  await form.getByRole('button', { name: 'Continuar a autoevaluación' }).click();
  await form.getByRole('spinbutton', { name: /Distancia/ }).fill('1.5');
  await form.getByRole('button', { name: 'Revisar chequeo' }).click();
  await expect(form).toContainText('actualizará ese registro');
  await form.getByRole('button', { name: 'Guardar chequeo' }).click();
  await expect(checks).toContainText('1.5 km');
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('astra.demo.journal.v1')!)),
  ).toMatchObject({
    checks: [
      {
        discomfortRegion: 'hands',
        exerciseDone: false,
        attachment: {
          source: 'synthetic',
          capturedAt: '2026-11-08T14:32:00Z',
          zone: { id: 'habitat' },
          readings: expect.arrayContaining([
            expect.objectContaining({ id: 'heartRate', value: 72 }),
          ]),
        },
        context: { activity: 'surface', moment: 'incident', measurements: { distanceKm: 1.5 } },
      },
      { id: 'elena:2020-01-01' },
    ],
    reviewedObservationIds: ['sleep-elena-v1'],
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Tumi responde al ánimo y Monitoreo diario conserva el borrador al abrir su chat', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speaking: false,
        pending: false,
        getVoices: () => [],
        speak(utterance: SpeechSynthesisUtterance) {
          document.documentElement.dataset.tumiSpoken = utterance.text;
        },
        cancel() {
          delete document.documentElement.dataset.tumiSpoken;
        },
      },
    });
  });
  await page.goto('/mission/journal');
  const form = page.locator('#daily-check-form');
  const root = page.locator('html');
  const openTumi = () => openTumiChat(page);
  const closeTumi = () => page.getByRole('button', { name: 'Ocultar chat' }).click();
  const readings = page.getByRole('heading', { name: 'Lecturas del cuerpo y del entorno' });

  await expect(root).not.toHaveAttribute('data-tumi-spoken', /.+/);
  await form.getByRole('radio', { name: 'Triste', exact: true }).check();
  await expect(root).toHaveAttribute('data-tumi-spoken', /Podemos ir con calma/);
  await expect(form.getByText(/Podemos ir con calma/)).toHaveCount(0);
  await form.getByRole('button', { name: 'Detener audio' }).click();
  await expect(root).not.toHaveAttribute('data-tumi-spoken', /.+/);
  await form.getByRole('button', { name: 'Escuchar respuesta' }).click();
  await expect(root).toHaveAttribute('data-tumi-spoken', /qué te pesó más/);
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await openTumi();
  await closeTumi();
  await expect(form.getByRole('radio', { name: 'Triste', exact: true })).toBeChecked();
  expect((await readings.boundingBox())!.x).toBeGreaterThan((await form.boundingBox())!.x);

  await page.setViewportSize({ width: 390, height: 844 });
  await openTumi();
  await closeTumi();
  await form.getByRole('radio', { name: 'Bien', exact: true }).check();
  await expect(root).toHaveAttribute('data-tumi-spoken', /sonreír/);
  await form.getByRole('radio', { name: 'Regular', exact: true }).check();
  await expect(root).toHaveAttribute('data-tumi-spoken', /hoy se sintiera regular/);
  await form.getByRole('button', { name: 'Quitar respuesta de ánimo' }).click();
  await expect(root).not.toHaveAttribute('data-tumi-spoken', /.+/);
  await expect(form.getByRole('button', { name: 'Escuchar saludo' })).toBeVisible();
  expect((await readings.boundingBox())!.y).toBeGreaterThan((await form.boundingBox())!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('El chequeo ofrece la respuesta para leer si falla la voz del navegador', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speaking: false,
        pending: false,
        getVoices: () => [],
        speak() {
          throw new Error('Voz no disponible para la prueba');
        },
      },
    });
  });
  await page.goto('/mission/journal');
  const form = page.locator('#daily-check-form');
  await form.getByRole('radio', { name: 'Triste', exact: true }).check();
  await expect(form.getByRole('status')).toContainText('No se pudo iniciar la voz');
  await form.getByText('Leer respuesta', { exact: true }).click();
  await expect(form.getByText(/Podemos ir con calma/)).toBeVisible();
  await expect(form.getByRole('radio', { name: 'Triste', exact: true })).toBeChecked();
});

test('Monitoreo diario guía la respiración y envía el mensaje al chat sin avanzar el formulario', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/mission/journal');
  const pageContent = page.locator('.journal-page');
  await expect(pageContent).toHaveCSS('color-scheme', 'dark');
  const breathing = page.getByRole('region', { name: 'Respiración guiada' });
  await breathing.getByRole('button', { name: 'Iniciar respiración guiada' }).click();
  await expect(breathing.getByText('Exhala', { exact: true })).toBeVisible();
  await breathing.getByRole('button', { name: 'Detener respiración guiada' }).click();
  await expect(breathing).toContainText('4 s');

  const message = page.getByRole('textbox', { name: 'Mensaje para Tumi' });
  await message.fill('¿De dónde vienen los datos?');
  await message.press('Enter');
  const chat = page.getByRole('region', { name: 'Tumi' });
  await expect(chat.getByRole('button', { name: 'Ver Fuentes y alcance' })).toBeVisible();
  await chat.getByRole('button', { name: 'Ocultar chat' }).click();
  await expect(
    page.getByRole('list', { name: 'Progreso del chequeo' }).getByText('Contexto'),
  ).toHaveAttribute('aria-current', 'step');
  await expect(message).toBeEmpty();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Tumi anima sus expresiones y revela las palabras al ritmo del audio', async ({ page }) => {
  await page.addInitScript(() => {
    let speech: SpeechSynthesisUtterance | undefined;
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speaking: false,
        pending: false,
        getVoices: () => [],
        speak(utterance: SpeechSynthesisUtterance) {
          speech = utterance;
          utterance.dispatchEvent(new Event('start'));
        },
        cancel() {
          speech = undefined;
        },
      },
    });
    document.addEventListener('tumi-test-progress', () => {
      if (!speech) return;
      const words = [...speech.text.matchAll(/\S+/g)];
      const middle = words[Math.floor(words.length / 2)].index;
      speech.dispatchEvent(
        new SpeechSynthesisEvent('boundary', {
          utterance: speech,
          name: 'word',
          charIndex: middle,
        }),
      );
    });
    document.addEventListener('tumi-test-end', () => speech?.dispatchEvent(new Event('end')));
  });
  await page.clock.install();
  await page.goto('/mission/journal');
  const form = page.locator('#daily-check-form');
  const portrait = form.locator('.daily-tumi-art');
  const transcript = form.locator('.daily-tumi-transcript');
  const revealed = transcript.locator('[data-visible="true"]');
  await form.getByRole('radio', { name: 'Bien', exact: true }).check();
  await expect(portrait).toHaveAttribute('data-emotion', 'joy');
  await expect(portrait.locator('svg')).toHaveCSS('animation-name', 'daily-tumi-converse');
  await expect(revealed).toHaveCount(1);

  await page.clock.runFor(380);
  await expect(revealed).toHaveCount(2);
  await page.evaluate(() => document.dispatchEvent(new Event('tumi-test-progress')));
  await expect(portrait).toHaveAttribute('data-emotion', 'happy');
  await expect(transcript.locator('[data-current="true"]')).toHaveCount(1);
  await expect(transcript.locator('[data-visible="false"]').first()).toBeHidden();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(portrait.locator('svg')).toHaveCSS('animation-name', 'none');
  await page.evaluate(() => document.dispatchEvent(new Event('tumi-test-end')));
  await expect(transcript.locator('[data-visible="false"]')).toHaveCount(0);
  await expect(portrait).toHaveAttribute('data-speaking', 'false');

  await form.getByRole('radio', { name: 'Triste', exact: true }).check();
  await expect(portrait).toHaveAttribute('data-emotion', 'worried');
  await expect(revealed).toHaveCount(1);
  await form.getByRole('button', { name: 'Detener audio' }).click();
  await expect(transcript).toHaveCount(0);
});
