import { expect, test } from '@playwright/test';

test('Tumi: expresión, salto, sombrero separado, spinner y continuidad del bucle', async ({
  page,
}) => {
  const asset = page.waitForResponse(
    (response) => response.url().endsWith('/brand/tumi-head-reference.png') && response.ok(),
  );
  await page.goto('/loading-preview');
  await asset;
  const loader = page.getByRole('region', { name: 'Cargando Qhipa Pacha', exact: true });
  await expect(loader).toBeVisible();
  const bounds = await loader.boundingBox();
  expect(bounds).toMatchObject({ x: 0, y: 0, width: 1440, height: 1100 });
  await expect(loader).toHaveAttribute('aria-busy', 'false');
  await expect(loader.locator('.tumi-jump')).toHaveCSS('animation-iteration-count', 'infinite');
  async function seek(time: number) {
    await loader.evaluate((element, currentTime) => {
      for (const animation of element.getAnimations({ subtree: true })) {
        animation.pause();
        animation.currentTime = currentTime;
      }
    }, time);
  }
  await seek(0);
  await expect(loader.locator('.tumi-mouth-calm')).toHaveCSS('opacity', '1');
  await expect(loader.locator('.tumi-mouth-smile')).toHaveCSS('opacity', '0');
  const initial = await loader
    .locator('.tumi-jump')
    .evaluate((element) => getComputedStyle(element).transform);
  await page.screenshot({ path: '../docs/qa/tumi-loading-rest.png', animations: 'allow' });
  await seek(1600);
  await expect(loader.locator('.tumi-mouth-smile')).toHaveCSS('opacity', '1');
  expect(
    await loader
      .locator('.tumi-jump')
      .evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).f),
  ).toBeLessThan(-15);
  expect(
    await loader
      .locator('.tumi-hat')
      .evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).f),
  ).toBeLessThan(-2);
  const shape = await loader.locator('.tumi-jump').evaluate((element) => {
    const matrix = new DOMMatrix(getComputedStyle(element).transform);
    return { x: matrix.a, y: matrix.d };
  });
  expect(shape).toEqual({ x: 1, y: 1 });
  expect(
    await loader
      .locator('.tumi-hat')
      .evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).f),
  ).toBeGreaterThan(-10);
  const spinnerMiddle = await loader
    .locator('.tumi-loader-spinner')
    .evaluate((element) => getComputedStyle(element).transform);
  await page.screenshot({ path: '../docs/qa/tumi-loading-jump.png', animations: 'allow' });
  await seek(3200);
  await expect(loader.locator('.tumi-mouth-calm')).toHaveCSS('opacity', '1');
  expect(
    await loader.locator('.tumi-jump').evaluate((element) => getComputedStyle(element).transform),
  ).toBe(initial);
  expect(
    await loader
      .locator('.tumi-loader-spinner')
      .evaluate((element) => getComputedStyle(element).transform),
  ).not.toBe(spinnerMiddle);
  await page.getByRole('button', { name: 'Pausar animación', exact: true }).click();
  await expect(loader.locator('.tumi-loader-spinner')).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Reanudar animación', exact: true }).click();
  await expect(loader.locator('.tumi-loader-spinner')).toHaveCSS('animation-play-state', 'running');
});

test('Tumi móvil: movimiento reducido, recarga y retorno a portada', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/loading-preview');
  await page.reload();
  await expect(page.locator('.tumi-jump')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.tumi-loader-spinner')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.tumi-mouth-smile')).toHaveCSS('opacity', '0');
  await expect(page.getByRole('status')).toContainText('Preparando tu misión');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: '../docs/qa/tumi-loading-mobile.png',
    animations: 'disabled',
    fullPage: true,
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.tumi-loader-spinner')).toBeInViewport();
  await expect(page.locator('.tumi-loader')).toHaveCSS('border-radius', '0px');
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
  await expect(page.getByRole('heading', { name: 'Cada señal cuenta.', exact: true })).toBeVisible({
    timeout: 10_000,
  });
  expect(Date.now() - started).toBeGreaterThanOrEqual(2900);
  await expect(page.locator('.tumi-loader--fullscreen')).toHaveCount(0);
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(/\/mission\/history\?/, async (route) => {
    await gate;
    await route.continue();
  });
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  try {
    await nav.getByRole('button', { name: 'Historial', exact: true }).click();
    const loader = page.locator('.tumi-loader--content');
    await expect(loader).toBeVisible();
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Tripulación', exact: true })).toBeEnabled();
    await expect(page.locator('.topbar')).toBeVisible();
    const area = (await loader.boundingBox())!;
    const sidebar = (await page.locator('.sidebar').boundingBox())!;
    const topbar = (await page.locator('.topbar').boundingBox())!;
    expect(area.x).toBeGreaterThanOrEqual(sidebar.x + sidebar.width);
    expect(area.y).toBeGreaterThanOrEqual(topbar.y + topbar.height);
    await expect(page.locator('.tumi-loader--fullscreen')).toHaveCount(0);
    await page.screenshot({ path: '../docs/qa/tumi-loading-content.png', animations: 'disabled' });
    // A second intent remains usable while the first route is waiting.
    await nav.getByRole('button', { name: 'Tripulación', exact: true }).click();
  } finally {
    release();
  }
  await expect(page).toHaveURL(/\/mission\/crew$/);
  await expect(
    page.getByRole('heading', { name: 'El lado humano de la misión.', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.tumi-loader')).toHaveCount(0);
  await page.goto('/mission/history');
  await expect(
    page.getByRole('heading', { name: 'Más allá de una lectura.', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.tumi-loader--fullscreen')).toHaveCount(0);
});
