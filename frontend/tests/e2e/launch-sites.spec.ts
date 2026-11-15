import { expect, test } from '@playwright/test';
import { confirmDailyCheck, openDailyAssessment } from './daily-check-helpers';

test.beforeEach(async ({ page }) => {
  // Provider availability is not a deterministic app test. The real source remains linked.
  await page.route('https://www.youtube-nocookie.com/**', (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: '<html><body style="margin:0;background:#090e19;color:#e9ecef;display:grid;place-content:center;height:100vh;font:14px sans-serif;text-align:center">▶<p>Reproductor de prueba<br>Proveedor externo sustituido</p></body></html>',
    }),
  );
});

test('cada lugar abre su tarjeta y video con foco visible en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/explore?destination=earth&tab=launches');
  const places = page.getByRole('group', { name: 'Directorio de centros en Tierra' });
  const buttons = places.getByRole('button');
  await expect(buttons).toHaveCount(8);
  for (let index = 0; index < 8; index++) {
    const button = buttons.nth(index);
    const name = await button.locator('strong').innerText();
    await button.click();
    const card = page.getByRole('complementary', { name: 'Detalle del lugar' });
    await expect(
      page.getByLabel('Visor de la Tierra', { exact: true }).locator('#launch-place-card'),
    ).toBeVisible();
    await expect(card).toBeFocused();
    await expect(card.getByRole('heading', { name, exact: true })).toBeInViewport();
    await expect(card.getByRole('article', { name, exact: true })).toBeVisible();
    await expect(card.locator('iframe')).toHaveCount(1);
    await expect(card).toContainText('Despegue desde:');
    await expect(card).toContainText('Función principal');
  }
  await page.reload();
  await expect(page.getByRole('complementary', { name: 'Detalle del lugar' })).toBeFocused();
  await expect(page.locator('.launch-video iframe')).toHaveCount(1);
});

test('Tierra, pestaña, marcador, video, URL y regreso sin modificar registros', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/mission/journal');
  await openDailyAssessment(page);
  await page.getByRole('spinbutton', { name: 'Horas de sueño', exact: true }).fill('7.6');
  await confirmDailyCheck(page);
  await expect(page.getByRole('status').filter({ hasText: 'guardado' })).toBeVisible();
  const journal = await page.evaluate(() => localStorage.getItem('astra.demo.journal.v1'));
  await page.goto('/explore?destination=earth');
  await page.getByRole('button', { name: 'Ver centros en Tierra' }).click();
  await expect(page.getByRole('tab', { name: 'Centros en Tierra' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('heading', { name: 'Centros en Tierra' })).toBeVisible();
  await expect(page.locator('.launch-video iframe')).toHaveCount(0);
  await expect(page.locator('.launch-globe canvas')).toBeVisible();
  await page
    .getByRole('button', { name: 'Seleccionar punto de despegue Kennedy', exact: true })
    .click();
  await expect(page).toHaveURL(/site=kennedy/);
  await expect(page.getByRole('heading', { name: 'Artemis I', exact: true })).toBeVisible();
  await expect(page.locator('.launch-video iframe')).toHaveAttribute('src', /VUiEdqcLg-k/);
  await page
    .getByRole('group', { name: 'Directorio de centros en Tierra' })
    .getByRole('button', { name: /Kourou/ })
    .click();
  await expect(page.locator('.launch-video iframe')).toHaveCount(1);
  await expect(page.locator('.launch-video iframe')).toHaveAttribute('src', /o1fIKK-jNEc/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'James Webb', exact: true })).toBeVisible();
  await expect(page.locator('.launch-globe canvas')).toBeVisible();
  await expect(page.locator('.launch-globe-overlay')).toHaveAttribute('data-surface', 'ready');
  await expect(
    page.getByRole('button', { name: 'Seleccionar punto de despegue Kourou', exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => {
      const globe = await page.locator('.launch-globe canvas').boundingBox();
      const marker = await page
        .getByRole('button', { name: 'Seleccionar punto de despegue Kourou', exact: true })
        .locator('..')
        .locator('.launch-point-dot')
        .boundingBox();
      if (!globe || !marker) return Infinity;
      return (
        Math.abs(marker.x + marker.width / 2 - globe.x - globe.width / 2) +
        Math.abs(marker.y + marker.height / 2 - globe.y - globe.height / 2)
      );
    })
    .toBeLessThan(10);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: '../docs/qa/launch-sites-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Cerrar video y selección' }).click();
  await expect(page.locator('.launch-video iframe')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Mapa espacial', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Distintos mundos/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('astra.demo.journal.v1'))).toBe(journal);
  expect(errors).toEqual([]);
});

test('móvil: selección por lista sin WebGL, recarga, URL inválida y teclado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/explore?destination=earth&tab=launches&site=kennedy');
  await expect(page.locator('.launch-globe canvas')).toBeVisible();
  await expect(page.locator('.launch-globe-overlay')).toHaveAttribute('data-surface', 'ready');
  await expect(
    page.frameLocator('.launch-video iframe').getByText(/Reproductor de prueba/),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '../docs/qa/launch-sites-mobile-3d.png', fullPage: true });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, contextId: string, options: unknown) {
        if (contextId.includes('webgl')) return null;
        return Reflect.apply(getContext, this, [contextId, options]);
      },
    });
  });
  await page.goto('/explore?destination=earth&tab=launches&site=incorrecto');
  await expect(page.getByRole('alert').filter({ hasText: 'El sitio de la URL' })).toContainText(
    'no existe en este catálogo',
  );
  await expect(page.getByText(/El globo 3D no está disponible/)).toBeVisible();
  await page
    .getByRole('group', { name: 'Directorio de centros en Tierra' })
    .getByRole('button', { name: /Vandenberg/ })
    .click();
  await expect(page.getByRole('heading', { name: 'InSight', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('.launch-video iframe')).toHaveAttribute('src', /O4_JNAFClFk/);
  await expect(page.getByText(/El globo 3D no está disponible/)).toBeVisible();
  await expect(
    page.frameLocator('.launch-video iframe').getByText(/Reproductor de prueba/),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: '../docs/qa/launch-sites-mobile.png', fullPage: true });
  await page
    .getByRole('group', { name: 'Directorio de centros en Tierra' })
    .getByRole('button', { name: /Centro Espacial Johnson/ })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Centro Espacial Johnson (NASA)', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Esta ubicación no es una plataforma de lanzamiento.')).toBeVisible();
  await expect(page.locator('.launch-video iframe')).toHaveAttribute(
    'title',
    /desde Centro Espacial Kennedy/,
  );
  await page.getByRole('tab', { name: 'Centros en Tierra' }).focus();
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: 'Mapa espacial', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

test('sedes NASA: nombres completos, agrupación accesible, tarjeta y lugar real del video', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/explore?destination=earth&tab=launches&site=johnson');
  await expect(page).toHaveURL(/tab=earth&site=johnson$/);
  const list = page.getByRole('group', { name: 'Directorio de centros en Tierra' });
  await expect(list.getByRole('button')).toHaveCount(8);
  await expect(
    page.getByRole('article', { name: 'Centro Espacial Johnson (NASA)', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Esta ubicación no es una plataforma de lanzamiento.')).toBeVisible();
  await expect(page.locator('.launch-video iframe')).toHaveAttribute(
    'title',
    /desde Centro Espacial Kennedy/,
  );
  await expect(page.locator('.launch-point-card')).toHaveCount(8);
  await page.getByRole('button', { name: 'Seleccionar sede NASA Goddard', exact: true }).click();
  await expect(page).toHaveURL(/site=goddard/);
  await expect(
    page.getByRole('heading', { name: 'Centro de Vuelo Espacial Goddard (NASA)', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.launch-video iframe')).toHaveAttribute(
    'title',
    /desde Centro Espacial de Guayana/,
  );
  await expect(page.locator('.launch-detail article')).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Centro de Vuelo Espacial Goddard (NASA)', exact: true }),
  ).toBeVisible();
  for (const location of [
    { name: 'Centro de Vuelo Espacial Marshall (NASA)', video: /desde Centro Espacial Kennedy/ },
    { name: 'Jet Propulsion Laboratory (NASA / Caltech)', video: /desde Vandenberg/ },
    { name: 'NASA Headquarters · Sede central', video: /desde Vandenberg/ },
  ]) {
    await list
      .getByRole('button', {
        name: new RegExp(location.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      })
      .click();
    await expect(page.getByRole('heading', { name: location.name, exact: true })).toBeVisible();
    await expect(page.locator('.launch-video iframe')).toHaveCount(1);
    await expect(page.locator('.launch-video iframe')).toHaveAttribute('title', location.video);
    await expect(
      page.getByRole('link', { name: 'Conocer este lugar en su sitio oficial ↗' }),
    ).toHaveAttribute('href', /^https:\/\/(www\.)?(nasa.gov|jpl.nasa.gov)\//);
  }
  await expect(page.locator('.launch-globe-overlay')).toHaveAttribute('data-surface', 'ready');
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: '../docs/qa/nasa-centers-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('textura fallida conserva ubicación y selección; acercamiento respeta pausa', async ({
  page,
}) => {
  await page.route('**/textures/2k_earth_daymap.jpg', (route) => route.abort());
  await page.goto('/explore?destination=earth&tab=launches');
  await expect(page.getByText(/La textura terrestre no se pudo cargar/)).toBeVisible({
    timeout: 15_000,
  });
  await page
    .getByRole('group', { name: 'Directorio de centros en Tierra' })
    .getByRole('button', { name: /Kennedy/ })
    .click();
  await expect(page.getByRole('heading', { name: 'Artemis I', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Mapa espacial', exact: true }).click();
  await page.getByRole('button', { name: 'Acercar a Tierra', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Reanudar simulación', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Volver a la misión', exact: true }).click();
  await expect(page.locator('.fleet-scene canvas')).toBeVisible();
});

test('opción Centros en Tierra: directorio completo, videos, acceso desde el mapa y móvil', async ({
  page,
}) => {
  await page.goto('/explore?destination=earth');
  await expect(
    page.getByRole('button', { name: 'Ver centros en Tierra', exact: true }),
  ).toBeVisible();
  await page
    .getByLabel('Seleccionar destino', { exact: true })
    .getByRole('button', { name: /Tierra/ })
    .click();
  await page.getByRole('button', { name: 'Ver centros en Tierra ↗', exact: true }).click();
  await expect(page).toHaveURL(/tab=earth/);
  await expect(page.getByRole('tab', { name: 'Centros en Tierra', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('heading', { name: 'Centros en Tierra', exact: true })).toBeVisible();
  await expect(
    page.getByRole('tab', { name: /Despegues de la Tierra|Todo de la Tierra/ }),
  ).toHaveCount(0);
  await expect(page.locator('.earth-place-card')).toHaveCount(8);
  await expect(page.locator('.earth-video-card')).toHaveCount(3);
  await expect(page.locator('.launch-video iframe')).toHaveCount(0);
  await expect(page.locator('.launch-globe-overlay')).toHaveAttribute('data-surface', 'ready', {
    timeout: 15_000,
  });
  await page.screenshot({ path: '../docs/qa/earth-overview-desktop.png', fullPage: true });
  await page
    .getByRole('region', { name: 'Centros de operaciones y apoyo', exact: true })
    .getByRole('button', { name: /Centro Espacial Johnson/ })
    .click();
  await expect(page).toHaveURL(/tab=earth&site=johnson/);
  await expect(
    page.getByRole('article', { name: 'Centro Espacial Johnson (NASA)', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.launch-video iframe')).toHaveAttribute(
    'title',
    /desde Centro Espacial Kennedy/,
  );
  await page.reload();
  await expect(
    page.getByRole('article', { name: 'Centro Espacial Johnson (NASA)', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar video y selección' }).click();
  await page.getByRole('button', { name: /InSight.*2018.*Vandenberg/ }).click();
  await expect(page.locator('.launch-video iframe')).toHaveAttribute('title', /desde Vandenberg/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/explore?destination=earth&tab=earth');
  await expect(page.locator('.earth-place-card')).toHaveCount(8);
  await page.screenshot({ path: '../docs/qa/earth-overview-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page
    .getByRole('region', { name: 'Centros de operaciones y apoyo', exact: true })
    .getByRole('button', { name: /NASA Headquarters/ })
    .click();
  await expect(
    page.getByRole('article', { name: 'NASA Headquarters · Sede central', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.launch-video iframe')).toHaveAttribute('title', /desde Vandenberg/);
  await page.getByRole('tab', { name: 'Centros en Tierra', exact: true }).focus();
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: 'Mapa espacial', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Centros en Tierra', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});
