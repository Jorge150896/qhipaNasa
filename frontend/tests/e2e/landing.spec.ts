import { expect, test } from '@playwright/test';

test('portada: Tumi, parallax, pausa y CTA hacia la misión', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle('Qhipa Pacha · Tu bienestar, en otra órbita');
  await expect(page.getByRole('heading', { name: 'Tu bienestar, en otra órbita.' })).toBeVisible();
  const tumi = page.getByRole('img', { name: /Tumi dorado sonriente que flota/ });
  await expect(tumi).toBeVisible();
  await expect
    .poll(() => tumi.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBe(1728);
  await expect
    .poll(() => tumi.evaluate((image) => image.getAnimations()[0]?.playState))
    .toBe('running');
  const framePosition = await tumi.evaluate((image) => getComputedStyle(image).transform);
  await expect
    .poll(() => tumi.evaluate((image) => getComputedStyle(image).transform))
    .not.toBe(framePosition);
  const sky = page.locator('.space-background__nebula');
  await page.mouse.move(1300, 400);
  await expect.poll(() => sky.evaluate((layer) => getComputedStyle(layer).translate)).toMatch(/^-/);
  await page.getByRole('button', { name: 'Animar logo de Qhipa Pacha' }).click();
  await page.getByRole('button', { name: 'Pausar animación', exact: true }).click();
  await expect(page.locator('.qhipa-tumi-float')).toHaveCSS('animation-play-state', 'paused');
  await expect(sky).toHaveCSS('animation-play-state', 'paused');
  await expect
    .poll(() => tumi.evaluate((image) => image.getAnimations()[0]?.playState))
    .toBe('paused');
  await tumi.evaluate((image) => {
    const layers = image.parentElement!.querySelectorAll('img');
    for (const layer of layers) layer.getAnimations()[0].currentTime = 1450;
  });
  await expect(tumi).toHaveCSS('opacity', '0.5');
  await expect(page.locator('.qhipa-tumi-transition')).toHaveCSS('opacity', '0.5');
  await page.getByRole('button', { name: 'Reanudar animación', exact: true }).click();
  await expect(page.locator('.qhipa-tumi-float')).toHaveCSS('animation-play-state', 'running');
  await page.screenshot({
    path: '../docs/qa/qhipa-landing-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Iniciar mi misión', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/mission\/crew$/);
  await expect(page.getByRole('heading', { name: 'Tripulación', exact: true })).toBeVisible();
  await expect(page.locator('.topbar .brand svg .tumi-tech-eyes')).toBeVisible();
  expect(errors).toEqual([]);
});

test('portada móvil y movimiento reducido: estática, accesible y navegable tras recarga', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.reload();
  await expect(page.locator('.qhipa-tumi-float')).toHaveCSS('animation-name', 'none');
  await expect(page.getByRole('img', { name: /Tumi dorado sonriente que flota/ })).toHaveCSS(
    'transform',
    'none',
  );
  await expect(page.locator('.qhipa-tumi-transition')).toHaveCSS('opacity', '0');
  await expect(page.locator('.space-background__nebula')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.qhipa-cta')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Explorar el universo', exact: true })).toHaveCount(
    0,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: '../docs/qa/qhipa-landing-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'El universo', exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.getByRole('heading', { name: /Distintos mundos/ })).toBeVisible();
});

test('El tema oscuro se conserva en portada, mapa y Tripulación', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('astra.appearance', 'light'));
  await page.goto('/');
  const root = page.locator('html');
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await page.getByRole('button', { name: 'Abrir chat de Tumi' }).click();
  await expect(page.getByRole('group', { name: 'Apariencia de la app' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Texto', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Ocultar chat' }).click();
  await page.getByRole('button', { name: 'El universo', exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await page.reload();
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await page.goto('/mission/crew');
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await expect(page.getByRole('heading', { name: 'Tripulación', exact: true })).toBeVisible();
});
