import { expect, test } from '@playwright/test';

test('portada: Tumi, parallax, pausa y CTA hacia la misión', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle('Qhipa Pacha · Tu bienestar, en otra órbita');
  await expect(page.getByRole('heading', { name: 'Tu bienestar, en otra órbita.' })).toBeVisible();
  const tumi = page.getByRole('img', { name: /Tumi dorado sonriente/ });
  await expect(tumi).toBeVisible();
  await expect
    .poll(() => tumi.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);
  const sky = page.locator('.space-background__nebula');
  await page.mouse.move(1300, 400);
  await expect.poll(() => sky.evaluate((layer) => getComputedStyle(layer).translate)).toMatch(/^-/);
  await page.getByRole('button', { name: 'Animar logo de Qhipa Pacha' }).click();
  await page.getByRole('button', { name: 'Pausar animación', exact: true }).click();
  await expect(page.locator('.qhipa-tumi-float')).toHaveCSS('animation-play-state', 'paused');
  await expect(sky).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Reanudar animación', exact: true }).click();
  await expect(page.locator('.qhipa-tumi-float')).toHaveCSS('animation-play-state', 'running');
  await page.screenshot({
    path: '../docs/qa/qhipa-landing-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Iniciar mi misión', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/mission\/overview$/);
  await expect(page.getByRole('heading', { name: 'Qhipa Pacha Lab', exact: true })).toBeVisible();
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
  await expect(page.locator('.space-background__nebula')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.qhipa-cta')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: '../docs/qa/qhipa-landing-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Explorar el universo', exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.getByRole('heading', { name: /Distintos mundos/ })).toBeVisible();
});
