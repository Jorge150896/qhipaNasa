import { expect, test } from '@playwright/test';

test('mapa ampliable conserva selección, navegación HTML y diseño móvil', async ({ page }) => {
  await page.goto('/explore?destination=earth');
  const canvas = page.locator('.fleet-scene canvas');
  await expect(canvas).toBeVisible();
  const width = (await canvas.boundingBox())!.width;
  await page.getByRole('button', { name: 'Ampliar mapa', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Restaurar distribución' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect.poll(async () => (await canvas.boundingBox())!.width).toBeGreaterThan(width);
  await page
    .getByLabel('Seleccionar destino', { exact: true })
    .getByRole('button', { name: /Marte/ })
    .click();
  await expect(page.locator('.fleet-detail')).toContainText('Base Ares');
  await page.screenshot({ path: '../docs/qa/explorer-expanded-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Restaurar distribución' }).click();
  await expect(page.getByRole('button', { name: 'Ampliar mapa' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Ver Tierra de cerca', exact: true }).click();
  await expect(page).toHaveURL(/destination=earth/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../docs/qa/explorer-refined-mobile.png', fullPage: true });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Ampliar mapa' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(page.locator('.fleet-detail')).toContainText('Tierra');
});

test('detalle de Tierra, Luna, Marte y nave con pausa, selección y regreso', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const assets = Promise.all(
    [
      '2k_earth_daymap.jpg',
      '2k_moon.jpg',
      '2k_mars.jpg',
      'earth-normal.webp',
      'earth-roughness.webp',
      'earth-clouds.webp',
    ].map((file) =>
      page.waitForResponse(
        (response) => response.url().endsWith(`/textures/${file}`) && response.status() === 200,
      ),
    ),
  );
  await page.goto('/explore');
  await expect(page.locator('.fleet-scene canvas')).toBeVisible();
  await assets;
  for (const item of [
    { label: 'Tierra', name: 'Tierra', id: 'earth' },
    { label: 'Luna', name: 'Luna', id: 'moon' },
    { label: 'Marte', name: 'Marte', id: 'mars' },
    { label: 'Aurora', name: 'Estación Aurora', id: 'station' },
    { label: 'Nave', name: 'Odyssey 01', id: 'ship' },
  ]) {
    const button = page.getByRole('button', { name: `Ver ${item.label} de cerca`, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(new RegExp(`destination=${item.id}`));
    await expect(page.locator('.fleet-view-mode strong')).toHaveText(`Detalle · ${item.name}`);
    await expect(
      page.getByRole('button', { name: 'Reanudar simulación', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar tarjeta', exact: true }).click();
    // The visual transition is capped at 900 ms; capture its final frame, not the tween.
    await page.waitForTimeout(1200);
    await page.locator('.fleet-scene').screenshot({ path: `../docs/qa/3d-detail-${item.id}.png` });
  }
  await page.getByRole('button', { name: 'Volver a la misión', exact: true }).click();
  await expect(page.locator('.fleet-view-mode strong')).toHaveText('Vista de misión');
  await expect(page.getByRole('slider', { name: 'Nivel de zoom' })).toHaveValue('0');
  expect(errors).toEqual([]);
});

test('móvil, movimiento reducido y capa opcional fallida conservan los controles', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/textures/earth-clouds.webp', (route) => route.abort());
  await page.goto('/explore');
  await page.getByRole('button', { name: 'Ver Luna de cerca', exact: true }).click();
  await expect(page.locator('.fleet-view-mode strong')).toHaveText('Detalle · Luna');
  await expect(
    page.getByRole('button', { name: 'Movimiento reducido activo', exact: true }),
  ).toBeDisabled();
  await expect(page.locator('.fleet-scene canvas')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.fleet-scene').screenshot({ path: '../docs/qa/3d-detail-mobile.png' });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, id: string, options: unknown) {
        return id.includes('webgl') ? null : Reflect.apply(getContext, this, [id, options]);
      },
    });
  });
  await page.reload();
  await expect(page.getByText('El mapa 3D no está disponible.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ver Marte de cerca', exact: true }).click();
  await expect(page.locator('.fleet-detail')).toContainText('Ares');
});

test('nave renovada conserva hotspots, zonas HTML y desmontaje del portal', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/mission/crew');
  await page.getByRole('button', { name: 'Nave', exact: true }).click();
  await page.getByRole('button', { name: 'Explorar Módulo de ejercicio', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Módulo de ejercicio' })).toBeVisible();
  await expect(page.locator('.scene-hotspot')).toHaveCount(5);
  await page.locator('.scene-viewport').screenshot({ path: '../docs/qa/3d-shuttle-habitat.png' });
  await page.getByRole('button', { name: 'Explorar Laboratorio', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Laboratorio' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('button', { name: 'Monitoreo diario', exact: true })
    .click();
  await expect(page.locator('.scene-hotspot')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Base Ares conserva selección y encuadre del hábitat en escritorio y móvil', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/missions/ares/habitat');
  await expect(page).toHaveURL(/\/missions\/ares\/crew\/?#crew-module$/);
  let viewport = page.locator('.scene-viewport');
  await expect(viewport.locator('canvas')).toBeVisible();
  const lab = viewport.getByRole('button', { name: 'Explorar Laboratorio', exact: true });
  await lab.click();
  await expect(lab).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Laboratorio', exact: true })).toBeVisible();
  await viewport.getByRole('button', { name: 'Acercar al módulo', exact: true }).click();
  await viewport.getByRole('button', { name: 'Ver base completa', exact: true }).click();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/missions/ares/crew');
  await page.getByRole('button', { name: 'Base', exact: true }).click();
  viewport = page.locator('.scene-viewport');
  await expect(viewport.locator('canvas')).toBeVisible();
  await expect(viewport.locator('.scene-hotspot')).toHaveCount(3);
  await viewport.getByRole('button', { name: 'Ver base completa', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(errors).toEqual([]);
});
