import { expect, test } from '@playwright/test';
import { PerspectiveCamera } from 'three';
import { orbitalPosition } from '../../src/presentation/features/space-map/components/orbitalMotion';
import {
  initialMapCameraPosition,
  mapCameraTarget,
} from '../../src/presentation/features/space-map/components/mapCamera';
test('mapa 3D, destinos y navegación preservando diarios y contexto', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/mission/journal');
  await page.getByRole('spinbutton', { name: 'Horas de sueño', exact: true }).fill('7.6');
  await page.getByRole('button', { name: 'Guardar chequeo', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'guardado' })).toBeVisible();
  const original = await page.evaluate(() => localStorage.getItem('astra.demo.journal.v1'));
  await page
    .getByRole('navigation')
    .getByRole('button', { name: 'Mapa espacial', exact: true })
    .click();
  // The requested 3 s intro starts after route hydration; allow cold route assets as well.
  await expect(page.getByRole('heading', { name: /Distintos mundos/ })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator('.fleet-map-label')).toHaveCount(0);
  const canvas = page.locator('.fleet-scene canvas');
  await expect(canvas).toBeVisible();
  await page.getByRole('button', { name: 'Pausar simulación', exact: true }).click();
  await page.getByRole('button', { name: 'Restablecer vista', exact: true }).click();
  await canvas.scrollIntoViewIfNeeded();
  await expect(async () => {
    const box = (await canvas.boundingBox())!;
    const camera = new PerspectiveCamera(45, box.width / box.height, 0.1, 1000);
    camera.position.copy(initialMapCameraPosition(box.width / box.height));
    camera.lookAt(...mapCameraTarget);
    camera.updateMatrixWorld();
    const moon = orbitalPosition('moon', 0).project(camera);
    await page.mouse.click(
      box.x + ((moon.x + 1) * box.width) / 2,
      box.y + ((1 - moon.y) * box.height) / 2,
    );
    await expect(
      page.getByRole('button', { name: 'Explorar Luna en el mapa 3D', exact: true }),
    ).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 8_000 });
  await expect(page.locator('.fleet-map-label')).toHaveCount(1);
  await expect(page).toHaveURL(/destination=moon/);
  await expect(
    page
      .getByRole('complementary', { name: 'Detalle del destino' })
      .getByRole('heading', { name: 'Base Selene' }),
  ).toBeVisible();
  await page.screenshot({ path: '../docs/qa/explorer-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Ver tripulación e indicadores', exact: true }).click();
  await expect(page).toHaveURL(/\/missions\/selene\/crew/);
  await page.getByRole('button', { name: 'Consultar frecuencia cardíaca', exact: true }).waitFor();
  await expect(page.locator('.crew-picker')).toContainText('Ana Costa');
  await expect(page.locator('.crew-picker')).not.toContainText('Elena');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await nav.getByRole('button', { name: 'Entorno del hábitat', exact: true }).click();
  await page.getByRole('button', { name: 'Seleccionar zona 02', exact: true }).click();
  await expect(page.getByLabel('Zona de la base')).toHaveValue('exercise');
  await nav.getByRole('button', { name: 'Chequeo diario', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Horas de sueño', exact: true }).fill('6.8');
  await page.getByRole('button', { name: 'Guardar chequeo', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'guardado' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('astra.demo.journal.v1'))).toBe(original);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('astra.demo.journal.v1:selene')!).checks[0].crewId,
    ),
  ).toBe('ana');
  await page.reload();
  await expect(page.locator('.check-list')).toContainText(/6[.,]8 h/);
  await nav.getByRole('button', { name: 'Mapa espacial', exact: true }).click();
  await expect(page).toHaveURL(/destination=moon/);
  await expect(page.locator('.fleet-detail')).toContainText('Chequeo registrado');
  const destinations = page.getByLabel('Seleccionar destino', { exact: true });
  await destinations.getByRole('button', { name: /Estación Aurora/ }).click();
  await expect(page.locator('.fleet-roster li')).toHaveCount(4);
  await page.getByRole('button', { name: 'Ver tripulación e indicadores', exact: true }).click();
  await expect(page).toHaveURL(/\/missions\/aurora\/crew/);
  await expect(page.locator('.crew-picker')).toContainText('Inés Rojas');
  await page.goto('/mission/journal');
  await expect(page.locator('.check-list')).toContainText(/7[.,]6 h/);
  expect(errors).toEqual([]);
});

test('móvil: todos los destinos por HTML, recarga y sin desbordamiento', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto('/explore?destination=mars');
  await expect(page.locator('.fleet-detail')).toContainText('Base Ares', { timeout: 10_000 });
  await expect(page.locator('.fleet-map-label')).toHaveCount(0);
  await page
    .getByLabel('Seleccionar destino', { exact: true })
    .getByRole('button', { name: /Marte/ })
    .click();
  await page.getByRole('button', { name: 'Explorar Marte en el mapa 3D', exact: true }).waitFor();
  await page.screenshot({ path: '../docs/qa/explorer-mobile.png', fullPage: true });
  const sizes = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.width);
  await page
    .getByLabel('Seleccionar destino', { exact: true })
    .getByRole('button', { name: /Tierra/ })
    .click();
  await expect(page.locator('.fleet-detail')).toContainText('Estación Aurora');
  await page.reload();
  await expect(page.locator('.fleet-detail')).toContainText('Estación Aurora');
  await page.getByRole('button', { name: 'Ver tripulación e indicadores', exact: true }).click();
  await expect(page).toHaveURL(/aurora\/crew/);
});

test('sin WebGL permite explorar y entrar; un hábitat desconocido no abre Odyssey', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, contextId: string, options?: unknown) {
        if (contextId.includes('webgl')) return null;
        return Reflect.apply(getContext, this, [contextId, options]);
      },
    });
  });
  await page.goto('/explore');
  await expect(page.getByText('El mapa 3D no está disponible.', { exact: true })).toBeVisible();
  await page
    .getByLabel('Seleccionar destino', { exact: true })
    .getByRole('button', { name: /Marte/ })
    .click();
  await page.getByRole('button', { name: 'Ver tripulación e indicadores', exact: true }).click();
  await expect(page.locator('.crew-picker')).toContainText('Nora Díaz');
  await page.goto('/missions/inexistente/crew');
  await expect(
    page.getByRole('heading', { name: 'Fuera de la ruta de misión.', exact: true }),
  ).toBeVisible();
});

test('distribución espacial, nave hacia Marte y pausa del recorrido', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/explore');
  await expect(page.locator('.fleet-map-label')).toHaveCount(0);
  await page
    .getByLabel('Seleccionar destino', { exact: true })
    .getByRole('button', { name: /Odyssey/ })
    .click();
  const labels = {
    ship: page.getByRole('button', { name: 'Explorar Odyssey 01 en el mapa 3D', exact: true }),
  };
  await labels.ship.waitFor();
  const start = (await labels.ship.boundingBox())!;
  await expect
    .poll(async () => (await labels.ship.boundingBox())!.x, { timeout: 10_000 })
    .toBeGreaterThan(start.x + 3);
  await page.getByRole('button', { name: 'Pausar simulación', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Reanudar simulación', exact: true }),
  ).toBeVisible();
  const paused = (await labels.ship.boundingBox())!;
  // Observe over time to distinguish a frozen trajectory from one that keeps advancing.
  await page.waitForTimeout(800);
  expect((await labels.ship.boundingBox())!.x).toBeCloseTo(paused.x, 0);
  await page.screenshot({ path: '../docs/qa/explorer-transit-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Reanudar simulación', exact: true }).click();
  await expect
    .poll(async () => (await labels.ship.boundingBox())!.x, { timeout: 10_000 })
    .toBeGreaterThan(paused.x + 3);
  expect(errors).toEqual([]);
});

test('movimiento reducido mantiene la nave quieta y permite seleccionarla', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/explore?destination=moon');
  await page
    .getByLabel('Seleccionar destino', { exact: true })
    .getByRole('button', { name: /Odyssey/ })
    .click();
  const ship = page.getByRole('button', { name: 'Explorar Odyssey 01 en el mapa 3D', exact: true });
  await ship.waitFor();
  await expect(
    page.getByRole('button', { name: 'Movimiento reducido activo', exact: true }),
  ).toBeDisabled();
  const position = (await ship.boundingBox())!;
  await page.waitForTimeout(800);
  expect((await ship.boundingBox())!.x).toBeCloseTo(position.x, 0);
  await ship.click();
  await expect(page.locator('.fleet-detail')).toContainText(/en tránsito/i);
});

test('tarjetas flotantes solo por clic, una a la vez y con cierre', async ({ page }) => {
  await page.goto('/explore');
  await page.getByRole('button', { name: 'Pausar simulación', exact: true }).click();
  await expect(page.locator('.fleet-map-label')).toHaveCount(0);
  const destinations = page.getByLabel('Seleccionar destino', { exact: true });
  await destinations.getByRole('button', { name: /Tierra/ }).click();
  await expect(
    page.getByRole('button', { name: 'Explorar Tierra en el mapa 3D', exact: true }),
  ).toBeVisible();
  await destinations.getByRole('button', { name: /Marte/ }).click();
  await expect(page.locator('.fleet-map-label')).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'Explorar Marte en el mapa 3D', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar tarjeta de Marte', exact: true }).click();
  await expect(page.locator('.fleet-map-label')).toHaveCount(0);
  await destinations.getByRole('button', { name: /Luna/ }).click();
  await expect(page.locator('.fleet-map-label')).toHaveCount(1);
  await page.locator('.fleet-scene canvas').click({ position: { x: 20, y: 20 } });
  await expect(page.locator('.fleet-map-label')).toHaveCount(0);
  await expect(page.locator('.fleet-detail')).toContainText('Base Selene');
});

test('órbitas animadas sin Sol con pausa global y tarjetas bajo demanda', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/explore');
  await expect(page.getByText('☀ Sol · referencia de iluminación', { exact: true })).toHaveCount(0);
  await page
    .getByLabel('Seleccionar destino', { exact: true })
    .getByRole('button', { name: /Luna/ })
    .click();
  const moon = page.getByRole('button', { name: 'Explorar Luna en el mapa 3D', exact: true });
  await moon.waitFor();
  const start = (await moon.boundingBox())!;
  await expect
    .poll(async () => (await moon.boundingBox())!.x, { timeout: 10_000 })
    .toBeLessThan(start.x - 3);
  await page.getByRole('button', { name: 'Pausar simulación', exact: true }).click();
  const paused = (await moon.boundingBox())!;
  await page.waitForTimeout(800);
  expect((await moon.boundingBox())!.x).toBeCloseTo(paused.x, 0);
  expect((await moon.boundingBox())!.y).toBeCloseTo(paused.y, 0);
  await page
    .getByLabel('Seleccionar destino', { exact: true })
    .getByRole('button', { name: /Estación/ })
    .click();
  const station = page.getByRole('button', {
    name: 'Explorar Estación Aurora en el mapa 3D',
    exact: true,
  });
  const stationPaused = (await station.boundingBox())!;
  await page.waitForTimeout(600);
  expect((await station.boundingBox())!.x).toBeCloseTo(stationPaused.x, 0);
  await page.screenshot({ path: '../docs/qa/explorer-orbits-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Reanudar simulación', exact: true }).click();
  await expect
    .poll(async () => (await station.boundingBox())!.x, { timeout: 10_000 })
    .toBeGreaterThan(stationPaused.x + 3);
  await page.getByRole('button', { name: 'Pausar simulación', exact: true }).click();
  await page
    .getByRole('button', { name: 'Cerrar tarjeta de Estación Aurora', exact: true })
    .click();
  await expect(page.locator('.fleet-map-label')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('zoom progresivo, sistema solar y vuelta al encuadre de misión', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/explore');
  await page.getByRole('button', { name: 'Pausar simulación', exact: true }).click();
  await expect(page.locator('.fleet-view-mode strong')).toHaveText('Vista de misión');
  await expect(page.locator('.fleet-solar-label')).toHaveCount(0);
  await expect(page.locator('.fleet-reference-legend')).toHaveCount(0);
  await expect(page.locator('.fleet-map-label')).toHaveCount(0);
  const canvas = page.locator('.fleet-scene canvas');
  await canvas.scrollIntoViewIfNeeded();
  await canvas.hover();
  for (let tick = 0; tick < 16; tick++) await page.mouse.wheel(0, 250);
  await expect(page.locator('.fleet-view-mode strong')).not.toHaveText('Vista de misión');
  await expect(page.locator('.fleet-solar-label')).toHaveText('Sol');
  await page.getByRole('button', { name: 'Ver sistema solar', exact: true }).click();
  await expect(page.locator('.fleet-view-mode strong')).toHaveText('Sistema solar');
  await expect(page.getByRole('button', { name: 'Enfocar Tierra', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enfocar Marte', exact: true })).toBeVisible();
  const legend = page.getByLabel('Planetas de referencia', { exact: true });
  for (const name of ['Mercurio', 'Venus', 'Júpiter', 'Saturno', 'Urano', 'Neptuno'])
    await expect(legend).toContainText(name);
  await expect
    .poll(async () =>
      Number(await page.getByRole('slider', { name: 'Nivel de zoom' }).inputValue()),
    )
    .toBeGreaterThanOrEqual(99);
  await page.screenshot({ path: '../docs/qa/explorer-solar-system-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Enfocar Tierra', exact: true }).click();
  await expect(page.locator('.fleet-detail')).toContainText('Estación Aurora');
  await page.getByRole('button', { name: 'Volver a la misión', exact: true }).click();
  await expect(page.locator('.fleet-view-mode strong')).toHaveText('Vista de misión');
  await expect
    .poll(async () =>
      Number(await page.getByRole('slider', { name: 'Nivel de zoom' }).inputValue()),
    )
    .toBe(0);
  await expect(page.locator('.fleet-solar-label')).toHaveCount(0);
  await page.getByRole('button', { name: 'Cerrar tarjeta', exact: true }).click();
  await expect(page.locator('.fleet-map-label')).toHaveCount(0);
  await page.screenshot({ path: '../docs/qa/explorer-zoom-mission.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('móvil: vista general, zoom por teclado y acceso a la tripulación', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto('/explore');
  await page.getByRole('button', { name: 'Pausar simulación', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Nivel de zoom' });
  await slider.focus();
  await slider.press('End');
  await expect(page.locator('.fleet-view-mode strong')).toHaveText('Sistema solar');
  await expect(page.locator('.fleet-solar-label')).toBeVisible();
  await slider.blur();
  await page.screenshot({ path: '../docs/qa/explorer-solar-system-mobile.png', fullPage: true });
  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
  await page.getByRole('button', { name: 'Volver a la misión', exact: true }).click();
  await expect(page.locator('.fleet-view-mode strong')).toHaveText('Vista de misión');
  await page
    .getByLabel('Seleccionar destino', { exact: true })
    .getByRole('button', { name: /Odyssey/ })
    .click();
  await page.getByRole('button', { name: 'Ver tripulación e indicadores', exact: true }).click();
  await expect(page).toHaveURL(/mission\/crew/);
  await expect(page.locator('.crew-picker')).toContainText('Elena Torres');
});
