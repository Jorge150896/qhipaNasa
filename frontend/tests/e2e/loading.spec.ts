import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('carga usa el casco animado de Nami y permite pausa y reanudación', async ({
  page,
}, testInfo) => {
  await page.goto('/loading-preview');
  const loader = page.getByRole('region', { name: 'Loading Nami', exact: true });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(loader.locator('.tumi-loader-brand')).toHaveText('NAMI');
  await expect(loader.getByRole('heading')).toHaveText('Preparing your mission');
  await expect(loader.getByRole('status')).toContainText(
    'One moment. We’re connecting your universe.',
  );
  const portrait = loader.locator('.tumi-portrait');
  const helmet = portrait.locator('.tumi-portrait-helmet');
  await expect(loader).toHaveAttribute('aria-busy', 'false');
  expect(await loader.boundingBox()).toMatchObject({ x: 0, y: 0, width: 1440, height: 1100 });
  await expect(portrait).toBeVisible();
  await expect(helmet).toHaveCSS('animation-play-state', 'running');
  await expect(portrait.locator('image')).toHaveCount(0);
  const alpha = await portrait.evaluate(async (svg) => {
    const image = new Image();
    image.src = `data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 312;
    canvas.height = 295;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0, 312, 295);
    return [
      [0, 0],
      [311, 0],
      [0, 294],
      [311, 294],
      [162, 205],
    ].map(([x, y]) => context.getImageData(x, y, 1, 1).data[3]);
  });
  expect(alpha).toEqual([0, 0, 0, 0, 255]);
  await page.getByRole('button', { name: 'Pause animation', exact: true }).click();
  await expect(helmet).toHaveCSS('animation-play-state', 'paused');
  await helmet.evaluate((layer) => {
    layer.getAnimations()[0].currentTime = 1800;
  });
  await expect(helmet).not.toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await page.screenshot({ path: testInfo.outputPath('tumi-loader-desktop.png') });
  await page.evaluate(() => (document.documentElement.dataset.appearance = 'dark'));
  await page.screenshot({ path: testInfo.outputPath('tumi-loader-dark.png') });
  await page.getByRole('button', { name: 'Resume animation', exact: true }).click();
  await expect(helmet).toHaveCSS('animation-play-state', 'running');
});

test('carga móvil y movimiento reducido conservan la pose estática tras recargar', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => localStorage.setItem('astra.language.v1', 'es'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/loading-preview');
  await page.reload();
  const portrait = page.locator('.tumi-loader .tumi-portrait');
  const helmet = portrait.locator('.tumi-portrait-helmet');
  await expect(portrait).toBeVisible();
  await expect(helmet).toHaveCSS('animation-name', 'none');
  await expect(portrait.locator('.tumi-portrait-idle')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('status')).toContainText('Preparando tu misión');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('tumi-loader-mobile.png'), fullPage: true });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(helmet).toHaveCSS('animation-play-state', 'running');
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(portrait).toBeInViewport();
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
}, testInfo) => {
  await page.goto('/');
  await expect(page.locator('.tumi-loader--fullscreen')).toHaveCount(0);
  const started = Date.now();
  await page.getByRole('button', { name: 'Start my mission', exact: true }).click();
  const fullscreen = page.locator('.tumi-loader--fullscreen');
  await expect(fullscreen).toBeVisible();
  await expect(fullscreen.getByRole('heading')).toHaveText('Preparing your mission');
  await expect(page).toHaveURL(/\/mission\/journal$/);
  await expect(page.getByRole('heading', { name: 'Daily check-in', exact: true })).toBeVisible({
    timeout: 10_000,
  });
  expect(Date.now() - started).toBeGreaterThanOrEqual(550);
  await expect(page.locator('.tumi-loader--fullscreen')).toHaveCount(0);
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/mission\/simulation\?/, async (route) => {
    await gate;
    await route.continue();
  });
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  try {
    await nav.getByRole('button', { name: 'Simulation', exact: true }).click();
    const loader = page.locator('.tumi-loader--content');
    await expect(loader).toBeVisible();
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Crew', exact: true })).toBeEnabled();
    await expect(page.locator('.topbar')).toBeVisible();
    const area = (await loader.boundingBox())!;
    const dock = (await nav.boundingBox())!;
    const topbar = (await page.locator('.topbar').boundingBox())!;
    expect(area.y + area.height).toBeLessThanOrEqual(dock.y);
    expect(area.y).toBeGreaterThanOrEqual(topbar.y + topbar.height);
    await expect(page.locator('.tumi-loader--fullscreen')).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath('tumi-loading-content.png'),
      animations: 'disabled',
    });
    // A second intent remains usable while the first route is waiting.
    await nav.getByRole('button', { name: 'Crew', exact: true }).click();
  } finally {
    release();
  }
  await expect(page).toHaveURL(/\/mission\/crew$/);
  await expect(page.getByRole('heading', { name: 'Crew', exact: true })).toBeVisible();
  await expect(page.locator('.tumi-loader')).toHaveCount(0);
  await page.goto('/mission/history');
  await expect(
    page.getByRole('heading', { name: 'History and context', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.tumi-loader--fullscreen')).toHaveCount(0);
});
