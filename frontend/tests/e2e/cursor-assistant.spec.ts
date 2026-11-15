import { expect, test } from '@playwright/test';

test('el lápiz del globo abre el campo y permite preguntar de nuevo en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Abrir asistente Tumi' })).toBeVisible();
  const bubble = page.locator('.cursor-assistant-bubble');
  await expect(bubble).toHaveCount(0);
  await page.clock.fastForward(12_000);
  await expect(bubble).toBeInViewport();
  await bubble.getByRole('button', { name: 'Escribir a Tumi' }).click();
  const panel = page.getByRole('region', { name: 'Asistente Tumi', exact: true });
  const field = panel.getByRole('textbox', { name: 'Mensaje para Tumi' });
  const log = panel.getByRole('log');
  await expect(field).toBeFocused();
  await expect(panel).toBeInViewport();
  await expect(bubble).toHaveCount(0);
  await expect(panel).toHaveAttribute('data-side', 'left');
  await expect(log).toContainText('¡Hola! Soy Tumi.');
  await expect(log.locator('.tumi-chat-word').first()).toHaveCSS('animation-name', 'tumi-word-in');
  await expect(log.locator('.tumi-chat-word').last()).toHaveCSS('opacity', '1');

  await field.fill('Hola Tumi, ¿dónde está el mapa?');
  await panel.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(field).toHaveValue('');
  await expect(log).toContainText('¡Un momentito, estoy pensando! ✨');
  await page.clock.runFor(600);
  await expect(log).toContainText('Abre Mapa espacial');
  await expect(log).toContainText(/cosita|algo más|otra preguntita/);

  await field.fill('¿Dónde están los despegues de la Tierra?');
  await panel.getByRole('button', { name: 'Enviar', exact: true }).click();
  await page.clock.runFor(600);
  await expect(log).toContainText('Centros en Tierra');
  await expect(log).not.toContainText('Abre Mapa espacial');
  await expect(field).toBeVisible();
});

test('Tumi reacciona al tono escrito sin mantener una emoción de mensajes anteriores', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Asistente Tumi', exact: true });
  const actor = page.locator('.cursor-assistant');
  for (const [text, emotion, reply] of [
    ['Hoy me siento muy triste, ¿puedes ayudarme? 😢', 'sad', 'Gracias por confiarme'],
    ['Estoy muy feliz, ¡lo logré!', 'joy', 'Qué gusto saber'],
    ['Hoy me siento más o menos', 'understanding', 'Gracias por contármelo'],
    ['Estoy enojado y tengo mucha rabia', 'angry', 'algo te ha molestado'],
    ['Ya no estoy triste. ¿Dónde está el mapa?', 'neutral', 'Abre Mapa espacial'],
  ]) {
    await panel.getByRole('textbox', { name: 'Mensaje para Tumi' }).fill(text);
    await panel.getByRole('button', { name: 'Enviar', exact: true }).click();
    await expect(panel.getByRole('log')).toContainText(reply);
    await expect(actor).toHaveAttribute('data-emotion', emotion);
    if (emotion === 'sad') await page.screenshot({ path: '../docs/qa/tumi-emotion-sad.png' });
    if (emotion === 'angry') await page.screenshot({ path: '../docs/qa/tumi-emotion-angry.png' });
  }
});

test('Tumi tecnológico conversa, oculta y conserva acceso al chat de misión', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/mission/sources');
  const actor = page.locator('.cursor-assistant');
  await expect(actor).toBeVisible();
  await expect(actor.locator('svg')).toHaveAttribute('aria-label', /tecnológica/);
  await page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Asistente Tumi', exact: true });
  await panel.locator('summary').click();
  await expect(panel.getByText(/Sin IA conectada/)).toBeVisible();
  await panel
    .getByRole('textbox', { name: 'Mensaje para Tumi' })
    .fill('¿Dónde están los despegues de la Tierra?');
  await panel.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(actor).toHaveAttribute('data-state', 'waiting');
  await expect(panel.getByRole('log')).toContainText('Centros en Tierra');
  await expect(actor).toHaveAttribute('data-state', 'conversing');
  await page.screenshot({ path: '../docs/qa/tumi-ia-desktop.png' });
  await expect(
    panel.getByRole('button', { name: /Pausar movimiento|Reanudar movimiento/ }),
  ).toHaveCount(0);
  await expect(actor).toHaveAttribute('data-paused', 'true');
  await panel.getByRole('button', { name: 'Cerrar conversación', exact: true }).click();
  await expect(actor).toHaveAttribute('data-paused', 'false');
  await page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true }).click();
  await panel.locator('summary').click();
  await panel.getByRole('button', { name: 'Ocultar Tumi' }).click();
  await expect(actor).toHaveCount(0);
  await page.getByRole('button', { name: 'Mostrar Tumi' }).click();
  await page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true }).click();
  await panel.locator('summary').click();
  await panel.getByRole('button', { name: 'Abrir chat contextual', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Pregunta para Tumi' })).toBeVisible();
  await expect(actor).toHaveCount(0);
  await page.getByRole('button', { name: 'Ocultar chat' }).click();
  await expect(actor).toHaveCount(1);
  await page.reload();
  await expect(actor).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('portada permite movimiento autónomo moderado y arrastre con permanencia temporal', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0.75;
  });
  await page.clock.install();
  await page.goto('/');
  const actor = page.locator('.cursor-assistant');
  await expect(actor).toBeVisible();
  const before = (await actor.boundingBox())!;
  await page.clock.runFor(14500);
  const after = (await actor.boundingBox())!;
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(20);
  await page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true }).click();
  const frozen = await actor.evaluate((element) => (element as HTMLElement).style.transform);
  await page.clock.runFor(25000);
  expect(await actor.evaluate((element) => (element as HTMLElement).style.transform)).toBe(frozen);
  await page.getByRole('button', { name: 'Cerrar conversación', exact: true }).click();
  await page.mouse.move(after.x + 36, after.y + 30);
  await page.mouse.down();
  await page.mouse.move(after.x + 36, after.y - 70, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByRole('region', { name: 'Asistente Tumi', exact: true })).toHaveCount(0);
  const placed = await actor.evaluate((element) => (element as HTMLElement).style.transform);
  await page.clock.runFor(20000);
  expect(await actor.evaluate((element) => (element as HTMLElement).style.transform)).toBe(placed);

  await page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Asistente Tumi', exact: true });
  await panel.locator('summary').click();
  await panel.getByRole('button', { name: 'Guía local', exact: true }).click();
  await expect(actor).toHaveCount(0);
  const follower = page.locator('.assistant-follow-robot');
  await page.mouse.move(180, 140);
  await expect(follower.locator('svg')).toBeVisible();
  await expect(follower).toHaveAttribute('style', /translate3d\(196px, 156px, 0(?:px)?\)/);
  await page.mouse.move(330, 210);
  await expect(follower).toHaveAttribute('style', /translate3d\(346px, 226px, 0(?:px)?\)/);
  await page.getByRole('button', { name: 'Iniciar mi misión' }).hover();
  await expect(page.locator('.assistant-coach-tip')).toContainText(
    'Abre el panel de la tripulación',
  );
  await page.getByRole('button', { name: 'Salir de guía' }).click();
  await expect(follower).toHaveCount(0);
  await expect(actor).toHaveCount(1);
});

test.describe('interacción táctil', () => {
  test.use({ hasTouch: true, isMobile: true });
  test('móvil táctil y movimiento reducido conservan chat, controles y ancho', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const actor = page.locator('.cursor-assistant');
    await expect(actor).toHaveCSS('width', '64px');
    await page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true }).tap();
    const panel = page.getByRole('region', { name: 'Asistente Tumi', exact: true });
    await panel
      .getByRole('textbox', { name: 'Mensaje para Tumi' })
      .fill('una pregunta abierta sobre cualquier tema');
    await panel.getByRole('button', { name: 'Enviar', exact: true }).click();
    await expect(panel.getByRole('log')).toContainText('¿Me la cuentas de otra forma');
    await page.screenshot({ path: '../docs/qa/tumi-ia-mobile.png' });
    await expect(panel).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
  });
});

test('Tumi comparte la elección de Texto o Audio entre sus chats', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speaking: false,
        pending: false,
        getVoices: () => [],
        speak(utterance: SpeechSynthesisUtterance) {
          document.documentElement.dataset.spokenReply = utterance.text;
          utterance.dispatchEvent(new Event('start'));
          utterance.dispatchEvent(
            new SpeechSynthesisEvent('boundary', { name: 'word', charIndex: 5, utterance }),
          );
        },
        cancel() {
          delete document.documentElement.dataset.spokenReply;
        },
      },
    });
  });
  await page.goto('/mission/crew');
  await page.getByRole('button', { name: 'Abrir asistente Tumi' }).click();
  const floating = page.getByRole('region', { name: 'Asistente Tumi' });
  const root = page.locator('html');
  await floating.locator('summary').click();
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await expect(floating.getByRole('button', { name: 'Texto', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await floating.getByRole('button', { name: 'Audio', exact: true }).click();
  await floating.getByRole('textbox').fill('¿Dónde está el mapa?');
  await floating.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(floating.getByRole('log')).toContainText('Abre Mapa espacial');
  await expect(root).toHaveAttribute('data-spoken-reply', /Abre Mapa espacial/);
  await expect(
    floating.locator('[data-reveal="audio"] .tumi-chat-word[data-visible="true"]'),
  ).toHaveCount(2);
  await expect(floating.locator('.tumi-chat-word').last()).toHaveCSS('opacity', '0');

  await floating.getByRole('textbox').fill('¿Quién es Lena?');
  await floating.getByRole('button', { name: 'Enviar', exact: true }).click();
  await expect(floating.getByRole('log')).toContainText('Elena Torres es nuestra comandante');
  await expect(root).toHaveAttribute('data-spoken-reply', /Elena Torres es nuestra comandante/);
  await floating.getByRole('button', { name: 'Texto', exact: true }).click();
  await floating.getByRole('button', { name: 'Escuchar respuesta' }).click();
  await expect(root).toHaveAttribute('data-spoken-reply', /Elena Torres es nuestra comandante/);
  await floating.getByRole('button', { name: 'Audio', exact: true }).click();

  await floating.getByRole('button', { name: 'Abrir chat contextual' }).click();
  const contextual = page.getByRole('region', { name: 'Tumi', exact: true });
  await expect(root).not.toHaveAttribute('data-spoken-reply', /.+/);
  await expect(contextual.getByRole('button', { name: 'Audio', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await contextual.getByRole('button', { name: '¿Qué significa mi SpO₂?' }).click();
  await expect(contextual.getByRole('log')).toContainText('saturación');
  await expect(root).toHaveAttribute('data-spoken-reply', /saturación/i);
  await expect(root).toHaveAttribute('data-spoken-reply', /98 por ciento/i);
  await contextual.getByRole('button', { name: 'Texto', exact: true }).click();
  await expect(root).not.toHaveAttribute('data-spoken-reply', /.+/);
  await contextual.getByRole('button', { name: '¿Qué significa mi SpO₂?' }).click();
  await expect(contextual.getByRole('log').locator('[data-role="assistant"]')).toHaveCount(2);
  await expect(root).not.toHaveAttribute('data-spoken-reply', /.+/);
});
