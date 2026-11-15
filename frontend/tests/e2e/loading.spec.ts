import { expect, test } from '@playwright/test';

test('carga usa los giros del video local en bucle y permite pausa y reanudación', async ({
  page,
}) => {
  await page.goto('/loading-preview');
  const loader = page.getByRole('region', { name: 'Cargando Qhipa Pacha', exact: true });
  const video = loader.locator('video');
  await expect(loader).toHaveAttribute('aria-busy', 'false');
  expect(await loader.boundingBox()).toMatchObject({ x: 0, y: 0, width: 1440, height: 1100 });
  await expect(page.locator('.tumi-loading-cutout')).toBeVisible();
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState))
    .toBeGreaterThanOrEqual(2);
  expect(
    await video.evaluate((v: HTMLVideoElement) => ({
      loop: v.loop,
      muted: v.muted,
      inline: v.playsInline,
    })),
  ).toEqual({ loop: true, muted: true, inline: true });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  const cutout = page.locator('.tumi-loading-cutout');
  await expect
    .poll(() =>
      cutout.evaluate(
        (canvas: HTMLCanvasElement) =>
          canvas.getContext('2d')!.getImageData(154, 154, 1, 1).data[3],
      ),
    )
    .toBeGreaterThan(0);
  expect(
    await cutout.evaluate((canvas: HTMLCanvasElement) => {
      const context = canvas.getContext('2d')!;
      return [
        [0, 0],
        [307, 0],
        [0, 307],
        [307, 307],
      ].map(([x, y]) => context.getImageData(x, y, 1, 1).data[3]);
    }),
  ).toEqual([0, 0, 0, 0]);
  await page.getByRole('button', { name: 'Pausar animación', exact: true }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  const time = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  await page.waitForTimeout(150);
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBe(time);
  await page.screenshot({ path: '../docs/qa/tumi-spin-loader-desktop.png' });
  await page.evaluate(() => (document.documentElement.dataset.appearance = 'dark'));
  await page.screenshot({ path: '../docs/qa/tumi-spin-loader-dark.png' });
  await page.getByRole('button', { name: 'Reanudar animación', exact: true }).click();
  await video.evaluate((v: HTMLVideoElement) => {
    v.currentTime = v.duration - 0.15;
  });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(2);
});

test('carga móvil y movimiento reducido conservan imagen estática y recarga', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/loading-preview');
  await page.reload();
  const video = page.locator('.tumi-loading-video');
  await expect(video).toBeHidden();
  await expect(page.locator('.tumi-loading-cutout')).toBeVisible();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(page.getByRole('status')).toContainText('Preparando tu misión');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../docs/qa/tumi-spin-loader-mobile.png', fullPage: true });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.tumi-loading-cutout')).toBeVisible();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.tumi-loading-cutout')).toBeInViewport();
  expect(await page.locator('.tumi-loader').boundingBox()).toMatchObject({
    x: 0,
    y: 0,
    width: 844,
    height: 390,
  });
  await page.getByRole('button', { name: 'Volver a la portada', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('pantalla completa solo desde Iniciar misión; carga interna conserva menú y cabecera', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.tumi-loader--fullscreen')).toHaveCount(0);
  const started = Date.now();
  await page.getByRole('button', { name: 'Iniciar mi misión', exact: true }).click();
  await expect(page.locator('.tumi-loader--fullscreen')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tripulación', exact: true })).toBeVisible({
    timeout: 10_000,
  });
  expect(Date.now() - started).toBeGreaterThanOrEqual(550);
  await expect(page.locator('.tumi-loader--fullscreen')).toHaveCount(0);
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/mission\/journal\?/, async (route) => {
    await gate;
    await route.continue();
  });
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  try {
    await nav.getByRole('button', { name: 'Monitoreo diario', exact: true }).click();
    const loader = page.locator('.tumi-loader--content');
    await expect(loader).toBeVisible();
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Tripulación', exact: true })).toBeEnabled();
    await expect(page.locator('.topbar')).toBeVisible();
    const area = (await loader.boundingBox())!;
    const dock = (await nav.boundingBox())!;
    const topbar = (await page.locator('.topbar').boundingBox())!;
    expect(area.y + area.height).toBeLessThanOrEqual(dock.y);
    expect(area.y).toBeGreaterThanOrEqual(topbar.y + topbar.height);
    await expect(page.locator('.tumi-loader--fullscreen')).toHaveCount(0);
    await page.screenshot({ path: '../docs/qa/tumi-loading-content.png', animations: 'disabled' });
    // A second intent remains usable while the first route is waiting.
    await nav.getByRole('button', { name: 'Tripulación', exact: true }).click();
  } finally {
    release();
  }
  await expect(page).toHaveURL(/\/mission\/crew$/);
  await expect(page.getByRole('heading', { name: 'Tripulación', exact: true })).toBeVisible();
  await expect(page.locator('.tumi-loader')).toHaveCount(0);
  await page.goto('/mission/history');
  await expect(
    page.getByRole('heading', { name: 'Historial y contexto', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.tumi-loader--fullscreen')).toHaveCount(0);
});
