import { expect, test } from '@playwright/test';
import { openTumiChat } from './tumi-chat-helpers';

test('Tumi presenta a Elena en lenguaje cotidiano y ofrece mirar cómo le ha ido', async ({
  page,
}) => {
  await page.goto('/mission/journal');
  await openTumiChat(page);
  const chat = page.getByRole('region', { name: 'Tumi', exact: true });
  const answer = chat.getByRole('log').locator('[data-role="assistant"]').last();

  await chat.getByRole('textbox').fill('Háblame de Elena.');
  await chat.getByRole('button', { name: 'Enviar' }).click();
  await expect(answer).toContainText('Elena Torres es nuestra comandante en Odyssey 01');
  await expect(answer).toContainText('ahora está descansando');
  await expect(answer).not.toContainText(/72|SpO₂|14:32/);

  await chat.getByRole('textbox').fill('¿Cuáles son las lecturas de Lena?');
  await chat.getByRole('button', { name: 'Enviar' }).click();
  await expect(answer).toContainText('8 de noviembre de 2026');
  await expect(answer).toContainText('72 latidos por minuto');
  await expect(answer).toContainText('98 por ciento de saturación de oxígeno');
  await expect(answer).toContainText('¿Vemos en Historial');

  await chat.getByRole('textbox').fill('¿Cómo se siente Elena?');
  await chat.getByRole('button', { name: 'Enviar' }).click();
  await expect(answer).toContainText('mirar su chequeo');
});

test('Tumi explica la lectura seleccionada y conserva el chat entre secciones', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/mission/crew');
  await openTumiChat(page);
  const chat = page.getByRole('region', { name: 'Tumi' });
  const log = chat.getByRole('log');
  await chat.getByRole('button', { name: '¿Qué significa mi SpO₂?' }).click();
  await expect(log).toContainText('Saturación periférica');
  await expect(log).toContainText('Elena Torres');
  await expect(log).toContainText('98 %');
  await chat.getByRole('button', { name: 'Señalar en el panel' }).click();
  await expect(page.locator('#assistant-target-metric-oxygen')).toHaveAttribute(
    'data-assistant-highlight',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Volver al chat de Tumi' })).toBeFocused();
  await page.getByRole('button', { name: 'Volver al chat de Tumi' }).click();
  await expect(log).toContainText('98 %');
  await chat.getByRole('button', { name: '¿Dónde hago mi chequeo?' }).click();
  await chat.getByRole('button', { name: 'Señalar en el panel' }).last().click();
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await nav.getByRole('button', { name: 'Monitoreo diario' }).click();
  await expect(page).toHaveURL(/\/mission\/journal$/);
  await openTumiChat(page);
  await expect(log).toContainText('98 %');
  await expect(log).toContainText('revisar tus respuestas antes de guardar');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Tumi permite revisar la transcripción local antes de enviarla', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'SpeechRecognition', {
      configurable: true,
      value: class {
        processLocally = false;
        onresult?: (event: { results: { transcript: string }[][] }) => void;
        onend?: () => void;
        start() {
          if (!this.processLocally) throw new Error('Se requiere dictado local');
          queueMicrotask(() => {
            this.onresult?.({ results: [[{ transcript: '¿Qué significa el pulso?' }]] });
            this.onend?.();
          });
        }
        abort() {}
      },
    });
  });
  await page.goto('/mission/crew');
  await openTumiChat(page);
  const chat = page.getByRole('region', { name: 'Tumi' });
  await chat.getByRole('button', { name: 'Dictar' }).click();
  await expect(chat.getByRole('textbox')).toHaveValue('¿Qué significa el pulso?');
  await expect(chat.getByRole('log')).not.toContainText('72 lpm');
  await chat.getByRole('button', { name: 'Enviar' }).click();
  await expect(chat.getByRole('log')).toContainText('72 lpm');
  await chat.getByRole('textbox').fill('¿Y dónde estaba?');
  await chat.getByRole('button', { name: 'Enviar' }).click();
  const followUp = chat.getByRole('log').locator('[data-role="assistant"]').last();
  await expect(followUp).toContainText(/frecuencia cardíaca/i);
  await expect(followUp).toContainText('A las 14:32 UTC: Hábitat de descanso');
});

test('Tumi cambia entre autónomo y guía con ayuda por puntero y teclado', async ({ page }) => {
  await page.goto('/mission/crew');
  await openTumiChat(page);
  await expect(page.getByRole('button', { name: 'Autónomo', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Guía local' }).click();
  const exit = page.getByRole('button', { name: 'Salir de guía' });
  await expect(exit).toBeVisible();
  const pulse = page.locator('#assistant-target-metric-heartRate');
  await pulse.hover();
  const tip = page.locator('.assistant-coach-tip');
  await expect(tip).toBeVisible();
  await expect(tip).toContainText('Latidos por minuto');
  const robot = page.locator('.assistant-follow-robot');
  await expect(robot).toBeVisible();
  const firstPosition = await robot.evaluate((element) => element.style.transform);
  const temperature = page.locator('#assistant-target-metric-temperature');
  await temperature.hover();
  await expect(tip).toContainText('grados Celsius');
  expect(await robot.evaluate((element) => element.style.transform)).not.toBe(firstPosition);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await pulse.focus();
  await page.keyboard.press('Tab');
  await expect(temperature).toBeFocused();
  await expect(tip).toContainText('grados Celsius');
  await expect(robot).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(exit).toHaveCount(0);
  await expect(tip).toHaveCount(0);
  await expect(temperature).not.toHaveAttribute('data-assistant-coach');
});

test('en pantalla táctil Tumi explica el primer toque y permite usar el control con el segundo', async ({
  browser,
}) => {
  const page = await browser.newPage({ hasTouch: true, viewport: { width: 390, height: 900 } });
  try {
    await page.goto('/mission/crew');
    await openTumiChat(page);
    await page.getByRole('button', { name: 'Guía local' }).click();
    const floating = page.getByRole('button', { name: 'Abrir asistente Tumi' });
    await expect(floating).toBeVisible();
    const tabBar = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect
      .poll(async () => {
        const position = await floating.boundingBox();
        const dock = await tabBar.boundingBox();
        return position && dock ? Math.round(dock.y - position.y - position.height) : null;
      })
      .toBe(10);
    const journal = tabBar.getByRole('button', { name: 'Monitoreo diario' });
    await journal.tap();
    const tip = page.locator('.assistant-coach-tip');
    await expect(tip).toContainText('Toca de nuevo');
    await expect(page).toHaveURL(/\/mission\/crew$/);
    await journal.tap();
    await expect(page).toHaveURL(/\/mission\/journal$/);
    await expect(page.getByRole('button', { name: 'Salir de guía' })).toBeVisible();
    await expect(tip).toBeHidden();
  } finally {
    await page.close();
  }
});

test('Tumi abre una lectura desde la guía y explica el cambio con sus horas', async ({ page }) => {
  await page.goto('/mission/crew');
  await page.getByRole('button', { name: /Mateo Silva/ }).click();
  await openTumiChat(page);
  await page.getByRole('button', { name: 'Guía local' }).click();
  await page.locator('#assistant-target-metric-heartRate').hover();
  await page.getByRole('button', { name: 'Preguntar por este dato' }).click();
  const chat = page.getByRole('region', { name: 'Tumi' });
  const context = chat.locator('.assistant-context');
  await expect(context).toContainText('Mateo Silva');
  await expect(context).toContainText('14:32 UTC');
  await chat.getByRole('button', { name: '¿Qué cambió?' }).click();
  const log = chat.getByRole('log');
  await expect(log).toContainText('88 lpm a las 14:18 UTC');
  await expect(log).toContainText('108 lpm');
  await expect(log).toContainText('+20 lpm');
  await expect(log).toContainText('Módulo de ejercicio');
  await chat.getByRole('button', { name: 'Quitar contexto' }).click();
  await expect(context).toHaveCount(0);
});

test('Tumi abre la tarjeta en modo táctil y respeta una lectura ausente', async ({ browser }) => {
  const page = await browser.newPage({ hasTouch: true, viewport: { width: 390, height: 900 } });
  try {
    await page.goto('/missions/selene/crew');
    await openTumiChat(page);
    await page.getByRole('button', { name: 'Guía local' }).click();
    await page.locator('#assistant-target-metric-oxygen').tap();
    await page.getByRole('button', { name: 'Preguntar por este dato' }).tap();
    const chat = page.getByRole('region', { name: 'Tumi' });
    await chat.getByRole('button', { name: '¿Qué cambió?' }).tap();
    const log = chat.getByRole('log');
    await expect(log).toContainText('Sin lectura vigente');
    await expect(log).toContainText('Falta una lectura vigente para calcular el cambio');
    await expect(log).toContainText('14:26 UTC');
  } finally {
    await page.close();
  }
});

test('la ficha de respiración abre Tumi con su lectura y no hay botón duplicado en la cabecera', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/mission/crew');
  await expect(
    page.getByRole('banner').getByRole('button', { name: 'Abrir chat de Tumi' }),
  ).toHaveCount(0);
  await page
    .getByRole('group', { name: 'Lecturas de la instantánea' })
    .getByRole('button', { name: 'Respiración', exact: true })
    .click();
  const reading = page.getByRole('complementary', { name: 'Frecuencia respiratoria' });
  await reading.getByRole('button', { name: 'Preguntar a Tumi por esta lectura' }).click();
  const chat = page.getByRole('region', { name: 'Tumi' });
  await expect(chat.getByLabel('Dato en conversación')).toContainText('Frecuencia respiratoria');
  await expect(chat.getByLabel('Dato en conversación')).toContainText('Elena Torres');
  await expect(chat.getByLabel('Dato en conversación')).toContainText('14:32 UTC');
  await chat.getByRole('button', { name: 'Ocultar chat' }).click();
  await expect(
    page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true }),
  ).toBeVisible();
});

test('Tumi explica la muestra y el par elegidos sin inventar ubicación', async ({ page }) => {
  await page.goto('/mission/crew');
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  const telemetry = page.getByRole('region', { name: 'Tendencia de telemetría' });
  await telemetry.getByRole('button', { name: 'Respiración', exact: true }).click();
  await telemetry.getByRole('button', { name: '14:20 UTC: 15 rpm', exact: true }).click();
  const timeline = page.getByRole('region', { name: 'Línea de tiempo', exact: true });
  await timeline.getByRole('button', { name: 'Preguntar a Tumi por esta muestra' }).click();
  const chat = page.getByRole('region', { name: 'Tumi' });
  const log = chat.getByRole('log');
  await expect(chat.getByLabel('Dato en conversación')).toContainText('14:20 UTC');
  await chat.getByRole('button', { name: '¿Qué significa este dato?' }).click();
  await expect(log).toContainText('15 rpm · Muestra disponible');
  await expect(log).toContainText('Ubicación no registrada a las 14:20 UTC');
  await chat.getByRole('button', { name: '¿Cómo se relaciona la lectura con el entorno?' }).click();
  const earlyAnswer = log.locator('[data-role="assistant"]').last();
  await expect(earlyAnswer).toContainText(
    'hace falta una ubicación registrada para esa misma hora UTC',
  );
  await expect(earlyAnswer).not.toContainText('Entorno simulado a esa hora');
  await chat.getByRole('button', { name: 'Ocultar chat' }).click();

  await timeline.getByRole('button', { name: 'Comparar dos muestras' }).click();
  await timeline
    .getByRole('combobox', { name: 'Segunda muestra' })
    .selectOption('2026-11-08T14:32:00Z');
  await timeline.getByRole('button', { name: 'Preguntar a Tumi por la comparación' }).click();
  await chat.getByRole('textbox').fill('¿Qué cambió y dónde estaba?');
  await chat.getByRole('button', { name: 'Enviar' }).click();
  const answer = log.locator('[data-role="assistant"]').last();
  await expect(answer).toContainText('14 rpm');
  await expect(answer).toContainText('15 rpm a las 14:20 UTC');
  await expect(answer).toContainText(/[-−]1 rpm/);
  await expect(answer).toContainText('Ubicación no registrada a las 14:20 UTC');
  await expect(answer).toContainText('A las 14:32 UTC: Hábitat de descanso');
});

test('Tumi vincula la lectura con su entorno y explica dónde guardar un autorregistro', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/mission/crew');
  await openTumiChat(page);
  const chat = page.getByRole('region', { name: 'Tumi' });
  const answer = chat.getByRole('log').locator('[data-role="assistant"]').last();
  const relationship = chat.getByRole('button', {
    name: '¿Cómo se relaciona la lectura con el entorno?',
  });
  await relationship.click();
  await expect(answer).toContainText('14:32 UTC: Hábitat de descanso · Descanso');
  await expect(answer).toContainText('Entorno simulado a esa hora');
  await expect(answer).toContainText('CO₂');
  await expect(answer).toContainText('cuando coinciden en hora UTC');
  await expect(answer).toContainText('no permite atribuir el valor');

  await chat.getByRole('textbox').fill('¿Dónde guardo mi autorregistro?');
  await chat.getByRole('button', { name: 'Enviar' }).click();
  await expect(answer).toContainText('Abre Monitoreo diario');
  await expect(answer).toContainText('El registro queda en este navegador');

  await chat.getByRole('button', { name: 'Ocultar chat' }).click();
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await expect(page.getByRole('region', { name: 'Historial y contexto' })).toBeVisible();
  await openTumiChat(page);
  await relationship.click();
  await expect(answer).toContainText('Entorno simulado a esa hora');
  await page.reload();
  await openTumiChat(page);
  await expect(answer).toHaveCount(0);
  await relationship.click();
  await expect(answer).toContainText('Entorno simulado a esa hora');
});
