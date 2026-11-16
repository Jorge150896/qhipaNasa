import { expect, test } from '@playwright/test';
import { openTumiChat } from './tumi-chat-helpers';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('astra.language.v1', 'es'));
});

test('el acceso GitHub de la portada abre el repositorio', async ({ page }) => {
  const repository = 'https://github.com/Jorge150896/qhipaNasa';
  await page.route(repository, (route) => route.fulfill({ body: 'Qhipa Pacha' }));
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto('/');
  const link = page.getByRole('link', { name: 'GitHub', exact: true });
  await expect(link).toBeInViewport();
  await expect(link).toHaveAttribute('href', repository);
  await link.click();
  await expect(page).toHaveURL(repository);
});

test('portada: Nami, parallax y CTA hacia la misión', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/^Qhipa Pacha · /);
  await expect(page.getByRole('heading', { name: 'Tu bienestar, en otra órbita.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tu bienestar', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'El universo', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Pausar animación', exact: true })).toHaveCount(0);
  await expect(page.getByText('Demo · datos sintéticos', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Inspirado en la exploración.', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Diseñado para las personas.', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Un pequeño paso hacia tu bienestar.', { exact: true })).toHaveCount(
    0,
  );
  const tumi = page.getByRole('img', { name: 'Nami sonríe mientras flota y levanta su casco' });
  await expect(tumi).toBeVisible();
  const helmet = tumi.locator('.tumi-portrait-helmet');
  await expect(tumi).toHaveAttribute('data-tumi-motion', 'celebrate');
  await expect(helmet).toHaveCSS('animation-play-state', 'running');
  await expect
    .poll(() => helmet.evaluate((layer) => Number(layer.getAnimations()[0]?.currentTime ?? 0)))
    .toBeGreaterThan(0);
  const sky = page.locator('.space-background__nebula');
  await page.mouse.move(1300, 400);
  await expect.poll(() => sky.evaluate((layer) => getComputedStyle(layer).translate)).toMatch(/^-/);
  const mark = page.getByRole('button', { name: 'Animar logo de Nami' });
  await expect(mark).toContainText('NAMI');
  await mark.click();
  await expect(page.locator('.qhipa-tumi-float')).toHaveCSS('animation-play-state', 'running');
  await page.screenshot({
    path: testInfo.outputPath('qhipa-landing-desktop.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Iniciar mi misión', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/mission\/journal$/);
  await expect(page.getByRole('heading', { name: 'Monitoreo diario', exact: true })).toBeVisible();
  await expect(page.locator('.topbar .brand .tumi-portrait')).toHaveAttribute(
    'data-tumi-emotion',
    'wink',
  );
  expect(errors).toEqual([]);
});

test('portada móvil y movimiento reducido: estática, accesible y navegable tras recarga', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.reload();
  await expect(page.locator('.qhipa-tumi-float')).toHaveCSS('animation-name', 'none');
  await expect(
    page.getByRole('img', { name: 'Nami sonríe mientras flota y levanta su casco' }),
  ).toHaveCSS('transform', 'none');
  await expect(page.locator('.qhipa-tumi-float .tumi-portrait-helmet')).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(page.locator('.space-background__nebula')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.qhipa-cta')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Explorar el universo', exact: true })).toHaveCount(
    0,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('qhipa-landing-mobile.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Iniciar mi misión', exact: true }).click();
  await expect(page).toHaveURL(/\/mission\/journal$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Monitoreo diario', exact: true })).toBeVisible();
});

test('El tema oscuro se conserva en portada, mapa y Tripulación', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('astra.appearance', 'light'));
  await page.goto('/');
  const root = page.locator('html');
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await expect(page.getByRole('button', { name: 'Abrir chat de Nami' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Abrir asistente Nami' })).toHaveCount(0);
  await page.goto('/explore');
  await openTumiChat(page);
  await expect(page.getByRole('group', { name: 'Apariencia de la app' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Texto', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Ocultar chat' }).click();
  await page.reload();
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await page.goto('/mission/crew');
  await expect(root).toHaveCSS('color-scheme', 'dark');
  await expect(page.getByRole('heading', { name: 'Tripulación', exact: true })).toBeVisible();
});
