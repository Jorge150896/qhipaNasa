import { expect, test } from '@playwright/test';

test('Tumi reacciona al tono escrito sin mantener una emoción de mensajes anteriores', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true }).click();
  const panel = page.getByRole('region', { name: 'Asistente Tumi', exact: true });
  const actor = page.locator('.cursor-assistant');
  for (const [text, emotion, reply] of [
    ['Hoy me siento muy triste, ¿puedes ayudarme? 😢', 'sad', 'un momento triste'],
    ['Estoy muy feliz, ¡lo logré!', 'joy', 'Qué alegría leerte'],
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
  await panel.getByRole('button', { name: 'Ocultar Tumi' }).click();
  await expect(actor).toHaveCount(0);
  await page.getByRole('button', { name: 'Mostrar Tumi' }).click();
  await page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true }).click();
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
    await expect(panel.getByRole('log')).toContainText('Aún no tengo una IA conectada');
    await page.screenshot({ path: '../docs/qa/tumi-ia-mobile.png' });
    await expect(panel).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
  });
});
