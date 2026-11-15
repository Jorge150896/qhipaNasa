import { expect, test } from '@playwright/test';

test('muestra las lecturas a la izquierda y abre la primera ficha a la derecha', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/mission/crew');
  const explorer = page.getByRole('region', { name: 'Explorador tridimensional' });
  const viewer = explorer.locator('.scene-viewport');
  const readings = explorer.getByRole('group', { name: 'Lecturas de la instantánea' });
  const detail = explorer.locator('#crew-reading-panel').getByRole('complementary');
  const pulse = readings.getByRole('button', { name: 'Pulso', exact: true });
  await expect(viewer.locator('canvas')).toBeVisible();
  await expect(detail).toHaveAccessibleName('Frecuencia cardíaca');
  await expect(pulse).toHaveAttribute('aria-expanded', 'true');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  const tabs = page.getByRole('navigation', { name: 'Secciones de Tripulación' });
  const switcher = page.getByRole('group', { name: 'Vista del explorador' });
  const tabBox = (await tabs.getByRole('button', { name: 'Ahora' }).boundingBox())!;
  const switchBox = (await switcher.boundingBox())!;
  expect(
    Math.abs(tabBox.y + tabBox.height / 2 - (switchBox.y + switchBox.height / 2)),
  ).toBeLessThan(2);
  const viewport = (await viewer.boundingBox())!;
  const selector = (await readings.boundingBox())!;
  const initialCard = (await detail.boundingBox())!;
  expect(selector.x + selector.width).toBeLessThan(viewport.x);
  expect(initialCard.x).toBeGreaterThan(viewport.x + viewport.width);

  for (const [label, title] of [
    ['Temperatura', 'Temperatura corporal'],
    ['SpO₂', 'Saturación periférica'],
    ['Respiración', 'Frecuencia respiratoria'],
  ]) {
    const button = readings.getByRole('button', { name: label, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(detail).toHaveAccessibleName(title);
    await expect(readings.getByRole('button')).toHaveCount(4);
    expect((await detail.boundingBox())!.x).toBeGreaterThan(viewport.x + viewport.width);
  }
  await detail.getByRole('button', { name: 'Cerrar ficha corporal' }).click();
  await expect(detail).toHaveCount(0);
  await expect(readings.getByRole('button', { name: 'Respiración', exact: true })).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(detail).toHaveAccessibleName('Frecuencia cardíaca');
  const mobileSelector = (await readings.boundingBox())!;
  const mobileCard = (await detail.boundingBox())!;
  expect(mobileCard.y).toBeGreaterThanOrEqual(mobileSelector.y + mobileSelector.height);
  await expect(readings.getByRole('button')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Tripulación simplificada conserva lecturas, puntos y registros en el historial', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() =>
    localStorage.setItem(
      'astra.demo.health.v1:odyssey',
      JSON.stringify({
        version: 1,
        reviews: [],
        entries: [
          {
            id: 'exercise-previous',
            crewId: 'elena',
            systemId: 'fitness',
            reportedState: 'no-change',
            note: 'Registro de ejercicio de Elena',
            activity: 'Bicicleta ficticia',
            minutes: 20,
            zoneId: 'exercise',
            recordedAt: '2026-11-08T14:32:00Z',
          },
        ],
      }),
    ),
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/mission/crew');
  const original = await page.evaluate(() => localStorage.getItem('astra.demo.health.v1:odyssey'));
  const journal = await page.evaluate(() => localStorage.getItem('astra.demo.journal.v1'));
  const tabs = page.getByRole('navigation', { name: 'Secciones de Tripulación' });
  await expect(tabs.getByRole('button')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Salud por sistemas', exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByRole('region', { name: 'Salud por sistemas', exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByRole('button', { name: /^Ver (corazón|visión|ejercicio)$/ })).toHaveCount(
    0,
  );
  await expect(page.locator('.scene-caption')).toHaveCount(0);
  await expect(page.locator('.app-footer')).toHaveCount(0);
  const pulse = page.getByRole('button', { name: 'Consultar frecuencia cardíaca', exact: true });
  await expect(pulse).toBeVisible({ timeout: 20000 });
  await pulse.click();
  await expect(
    page.getByRole('complementary', { name: 'Frecuencia cardíaca', exact: true }),
  ).toContainText('Datos simulados');
  await page
    .getByRole('button', { name: 'Explorar ejercicio y aparato locomotor', exact: true })
    .click();
  const exercise = page.getByRole('complementary', {
    name: 'Ejercicio y aparato locomotor',
    exact: true,
  });
  await expect(exercise).toContainText('Bicicleta ficticia');
  await exercise.getByText('Ver detalles', { exact: true }).click();
  await exercise.getByRole('button', { name: 'Ver mis autorregistros', exact: true }).click();
  const history = page.getByRole('heading', { name: 'Historial y contexto', exact: true });
  await expect(history).toBeVisible();
  const timeline = page.getByRole('region', { name: 'Línea de tiempo', exact: true });
  await timeline.getByRole('button', { name: /Bicicleta ficticia/ }).click();
  await expect(timeline.getByRole('region', { name: 'Detalle del momento' })).toContainText(
    '20 min',
  );
  await page.screenshot({ path: '../docs/qa/crew-simplified-desktop.png', fullPage: true });
  await page.reload();
  await tabs.getByRole('button', { name: 'Historial', exact: true }).click();
  await expect(timeline.getByRole('button', { name: /Bicicleta ficticia/ })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('astra.demo.health.v1:odyssey'))).toBe(
    original,
  );
  expect(await page.evaluate(() => localStorage.getItem('astra.demo.journal.v1'))).toBe(journal);
  expect(errors).toEqual([]);
});

test('móvil sin modelo mantiene lecturas HTML y redirige entradas antiguas de sistemas', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.route('**/models/astronaut.glb', (route) => route.abort());
  await page.goto('/missions/selene/crew#crew-health');
  await expect(
    page.getByRole('heading', { name: 'El visor 3D no está disponible', exact: true }),
  ).toBeVisible({ timeout: 15000 });
  const readings = page.getByRole('group', { name: 'Lecturas de la instantánea' });
  await readings.getByRole('button', { name: 'SpO₂', exact: true }).click();
  await expect(
    page.getByRole('complementary', { name: 'Saturación periférica', exact: true }),
  ).toContainText('Sin señal reciente');
  await expect(page.getByRole('button', { name: /^Ver (corazón|visión|ejercicio)$/ })).toHaveCount(
    0,
  );
  await expect(page.locator('.app-footer,.scene-caption,#crew-health-panel')).toHaveCount(0);
  await page.screenshot({ path: '../docs/qa/crew-simplified-mobile.png', fullPage: true });
  await page.goto('/missions/selene/crew#crew-health-history');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Historial y contexto', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('region', { name: 'Salud por sistemas', exact: true })).toHaveCount(
    0,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('un registro incompatible permanece intacto y no bloquea los sensores', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('astra.demo.health.v1:odyssey', 'incompatible'),
  );
  await page.goto('/mission/crew');
  await page
    .getByRole('group', { name: 'Lecturas de la instantánea' })
    .getByRole('button', { name: 'Temperatura', exact: true })
    .click();
  await expect(page.getByRole('complementary', { name: 'Temperatura corporal' })).toContainText(
    /36[.,]6/,
  );
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await expect(page.getByRole('region', { name: 'Línea de tiempo', exact: true })).toContainText(
    'Los autorregistros locales no están disponibles.',
  );
  expect(await page.evaluate(() => localStorage.getItem('astra.demo.health.v1:odyssey'))).toBe(
    'incompatible',
  );
});

test('nave de Tripulación distingue la ubicación de Elena del módulo explorado', async ({
  page,
}) => {
  await page.goto('/mission/crew');
  const explorer = page.getByRole('region', { name: 'Explorador tridimensional' });
  await page
    .getByRole('group', { name: 'Vista del explorador' })
    .getByRole('button', { name: 'Nave', exact: true })
    .click();
  const panel = explorer.getByRole('complementary', { name: 'Contexto del módulo' });
  const rest = explorer.getByRole('button', { name: 'Explorar Hábitat de descanso', exact: true });
  const exercise = explorer.getByRole('button', {
    name: 'Explorar Módulo de ejercicio',
    exact: true,
  });
  const legend = explorer.getByRole('list', { name: 'Leyenda del visor' });
  await expect(legend).toContainText('Ubicación del tripulante');
  await expect(legend).toContainText('Módulo explorado');
  await expect(rest.locator('.crew-marker-occupancy')).toBeVisible({ timeout: 15_000 });
  await expect(rest.locator('.crew-marker-selection')).toBeVisible();
  await expect(rest).toHaveAttribute('data-occupied', 'true');
  await expect(rest).toHaveAttribute('aria-pressed', 'true');
  await exercise.click();
  await expect(exercise.locator('.crew-marker-selection')).toBeVisible();
  await expect(rest.locator('.crew-marker-selection')).toHaveCount(0);
  await expect(rest).toHaveAccessibleDescription('Ubicación del tripulante');
  await expect(panel.getByRole('button', { name: 'Ver Hábitat de descanso' })).toHaveAttribute(
    'data-crew-location',
    'true',
  );
  await expect(exercise).toHaveAttribute('aria-pressed', 'true');
  await expect(rest).toHaveAttribute('data-occupied', 'true');
  await expect(panel.getByRole('heading', { name: 'Módulo de ejercicio' })).toBeVisible();
  await expect(panel).toContainText('Elena Torres');
  await expect(panel).toContainText('Hábitat de descanso · Descanso');
  await expect(panel).toContainText(/25[.,]6/);
  await expect(panel).toContainText('950');
  await expect(panel).toContainText('14:32 UTC');
  await expect(panel).toContainText('Ocupantes Mateo Silva');
  await explorer.getByRole('button', { name: 'Explorar Cabina de mando', exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'Cabina de mando' })).toBeVisible();
  await expect(panel).toContainText('710');
  await expect(panel).toContainText('Sin ocupantes');
  await expect(rest).toHaveAttribute('data-occupied', 'true');
  await panel.getByRole('button', { name: 'Ir a su módulo' }).click();
  await expect(rest).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('button', { name: 'Mateo Silva Especialista de misión', exact: true })
    .click();
  await expect(exercise).toHaveAttribute('data-occupied', 'true');
  await expect(exercise).toHaveAttribute('aria-pressed', 'true');
  await expect(panel).toContainText('Módulo de ejercicio · Ejercicio');
  await panel.getByRole('button', { name: 'Volver a la línea de tiempo' }).click();
  const timeline = page.getByRole('region', { name: 'Línea de tiempo', exact: true });
  await expect(timeline).toBeFocused();
  const moment = timeline.getByRole('region', { name: 'Detalle del momento' });
  await expect(moment).toContainText('Módulo de ejercicio');
  const telemetry = page.getByRole('region', { name: 'Tendencia de telemetría' });
  await telemetry.getByRole('button', { name: '14:18 UTC: 88 lpm', exact: true }).click();
  await expect(moment).toContainText('88 lpm');
  await expect(moment).toContainText('No hay ubicación, actividad ni lecturas ambientales');
  await expect(moment.getByRole('button', { name: 'Ubicar módulo en el visor' })).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await telemetry.getByRole('button', { name: '14:32 UTC: 108 lpm', exact: true }).click();
  await expect(moment).toContainText('108 lpm');
  await expect(moment).toContainText('14:32 UTC');
  await expect(moment).toContainText('950');
  await moment.getByRole('button', { name: 'Ubicar módulo en el visor' }).click();
  await expect(explorer).toBeFocused();
  await expect(exercise).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await timeline.getByRole('button', { name: 'Comparar dos muestras' }).click();
  const comparison = timeline.getByRole('group', { name: 'Comparación de Frecuencia cardíaca' });
  await comparison
    .getByRole('combobox', { name: 'Primera muestra' })
    .selectOption('2026-11-08T14:18:00Z');
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await telemetry.getByRole('button', { name: '14:32 UTC: 108 lpm', exact: true }).click();
  const first = comparison.getByRole('region', { name: 'Primera muestra' });
  const second = comparison.getByRole('region', { name: 'Segunda muestra' });
  await expect(first).toContainText('88 lpm');
  await expect(first).toContainText('No hay ubicación');
  await expect(second).toContainText('108 lpm');
  await expect(second).toContainText('Módulo de ejercicio');
  await expect(second).toContainText('950');
  await expect(comparison.getByRole('status')).toContainText('+20 lpm');
  await second.getByRole('button', { name: 'Ubicar módulo en el visor' }).click();
  const origin = explorer.getByRole('region', { name: 'Origen en la línea de tiempo' });
  await expect(origin).toContainText('14:32 UTC');
  await expect(origin).toContainText('Frecuencia cardíaca');
  const camera = explorer.getByRole('group', { name: 'Encuadre del visor' });
  const markerSpread = () =>
    explorer.locator('.shuttle-marker').evaluateAll((markers) => {
      const positions = markers.map((marker) => marker.getBoundingClientRect().x);
      return Math.max(...positions) - Math.min(...positions);
    });
  await expect(camera).toBeVisible();
  await expect(explorer.locator('.shuttle-marker')).toHaveCount(5);
  const initialSpread = await markerSpread();
  await camera.getByRole('button', { name: 'Acercar al módulo' }).click();
  await expect.poll(markerSpread).toBeGreaterThan(initialSpread * 1.4);
  await camera.getByRole('button', { name: 'Ver nave completa' }).click();
  await expect.poll(async () => Math.abs((await markerSpread()) - initialSpread)).toBeLessThan(4);
  await panel.getByRole('button', { name: 'Ver Laboratorio' }).click();
  await expect(panel.getByRole('heading', { name: 'Laboratorio' })).toBeVisible();
  await expect(origin).toContainText('Módulo de ese momento · Módulo de ejercicio');
  await panel.getByRole('button', { name: 'Volver a la línea de tiempo' }).click();
  await expect(comparison.getByRole('status')).toContainText('+20 lpm');
  await telemetry.getByRole('button', { name: 'Temperatura', exact: true }).click();
  await expect(comparison).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await timeline.getByRole('button', { name: 'Comparar dos muestras' }).click();
  await expect(timeline.getByRole('combobox', { name: 'Primera muestra' })).toHaveValue('');
});

test('móvil sin WebGL permite consultar módulos y duración de las sesiones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, type: string, options?: unknown) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
        return Reflect.apply(getContext, this, [type, options]);
      },
    });
    localStorage.setItem(
      'astra.demo.health.v1:odyssey',
      JSON.stringify({
        version: 1,
        reviews: [],
        entries: [
          {
            id: 'bike',
            crewId: 'elena',
            systemId: 'fitness',
            reportedState: 'no-change',
            note: 'Sesión en bicicleta.',
            activity: 'Bicicleta',
            minutes: 20,
            recordedAt: '2026-11-07T10:00:00Z',
          },
          {
            id: 'resistance',
            crewId: 'elena',
            systemId: 'fitness',
            reportedState: 'no-change',
            note: 'Sesión con pesas.',
            activity: 'Pesas',
            minutes: 15,
            recordedAt: '2026-11-05T10:00:00Z',
          },
        ],
      }),
    );
  });
  await page.goto('/mission/crew#crew-history');
  const explorer = page.getByRole('region', { name: 'Explorador tridimensional' });
  const timeline = page.getByRole('region', { name: 'Línea de tiempo', exact: true });
  const moment = timeline.getByRole('region', { name: 'Detalle del momento' });
  await timeline.getByRole('button', { name: /Bicicleta/ }).click();
  await expect(moment).toContainText('no tiene un módulo disponible');
  await timeline.getByRole('button', { name: /Descanso/ }).click();
  await moment.getByRole('button', { name: 'Ubicar módulo en el visor' }).click();
  await expect(
    explorer.getByRole('heading', { name: 'El visor 3D no está disponible' }),
  ).toBeVisible();
  await expect(explorer.getByRole('group', { name: 'Encuadre del visor' })).toHaveCount(0);
  await expect(
    explorer.getByRole('region', { name: 'Origen en la línea de tiempo' }),
  ).toContainText('14:32 UTC');
  const modulePanel = explorer.getByRole('complementary', { name: 'Contexto del módulo' });
  await modulePanel.getByRole('button', { name: 'Ver Laboratorio', exact: true }).click();
  await expect(modulePanel.getByRole('heading', { name: 'Laboratorio' })).toBeVisible();
  await expect(modulePanel).toContainText('780');
  await modulePanel.getByRole('button', { name: 'Ver Soporte vital', exact: true }).click();
  await expect(modulePanel.getByRole('heading', { name: 'Soporte vital' })).toBeVisible();
  await expect(modulePanel).toContainText('820');

  await modulePanel.getByRole('button', { name: 'Volver a la línea de tiempo' }).click();
  await timeline.getByRole('button', { name: /Pesas/ }).click();
  await expect(moment).toContainText('15 min');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await nav.getByRole('button', { name: 'Simulación', exact: true }).click();
  await page.goto('/mission/simulation#perdida-de-senal');
  await expect(page.getByRole('region', { name: 'Faltan 3 lecturas de SpO₂' })).toBeVisible();
  await nav.getByRole('button', { name: 'Tripulación', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await page
    .getByRole('region', { name: 'Tendencia de telemetría' })
    .getByRole('button', { name: 'SpO₂', exact: true })
    .click();
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await timeline.getByRole('button', { name: 'Comparar dos muestras' }).click();
  await timeline
    .getByRole('combobox', { name: 'Primera muestra' })
    .selectOption('2026-11-08T14:18:00Z');
  await expect(
    timeline
      .getByRole('combobox', { name: 'Segunda muestra' })
      .locator('option[value="2026-11-08T14:18:00Z"]'),
  ).toBeDisabled();
  await timeline
    .getByRole('combobox', { name: 'Segunda muestra' })
    .selectOption('2026-11-08T14:32:00Z');
  await expect(timeline.getByRole('region', { name: 'Segunda muestra' })).toContainText(
    'Sin muestra',
  );
  await expect(timeline.getByRole('status')).toContainText('falta una lectura');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('la gráfica sincroniza el módulo conocido y oculta la ubicación sin contexto', async ({
  page,
}) => {
  await page.goto('/mission/crew');
  await page.getByRole('button', { name: /Mateo Silva/ }).click();
  const telemetry = page.getByRole('region', { name: 'Tendencia de telemetría' });
  const sync = telemetry.getByRole('button', { name: 'Sincronizar con el visor' });
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await sync.click();
  await expect(sync).toHaveAttribute('aria-pressed', 'true');
  const explorer = page.getByRole('region', { name: 'Explorador tridimensional' });
  const panel = explorer.getByRole('complementary', { name: 'Contexto del módulo' });
  const exerciseModule = panel.getByRole('button', {
    name: 'Ver Módulo de ejercicio',
    exact: true,
  });
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Ahora', exact: true })
    .click();
  await expect(exerciseModule).toHaveAttribute('aria-pressed', 'true');
  await expect(panel).toContainText('14:32 UTC');
  const early = telemetry.getByRole('button', { name: '14:18 UTC: 88 lpm', exact: true });
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await early.click();
  await expect(early).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Ahora', exact: true })
    .click();
  await expect(panel).toContainText('No hay ubicación ni lecturas ambientales registradas');
  await expect(explorer.locator('[data-occupied="true"]')).toHaveCount(0);
  await expect(panel.getByText('CO₂')).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await telemetry.getByRole('button', { name: '14:32 UTC: 108 lpm', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Ahora', exact: true })
    .click();
  await expect(exerciseModule).toHaveAttribute('aria-pressed', 'true');
  await expect(panel).toContainText('950');
  await panel.getByRole('button', { name: 'Ver Laboratorio', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await expect(sync).toHaveAttribute('aria-pressed', 'false');
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Ahora', exact: true })
    .click();

  await expect(panel.getByRole('heading', { name: 'Laboratorio' })).toBeVisible();
});

test('las etiquetas del astronauta son legibles en oscuro, incluso al seleccionar un punto', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/mission/crew');
  const vision = page.getByRole('button', { name: 'Explorar visión y sistema neuroocular' });
  const pulse = page.getByRole('button', { name: 'Consultar frecuencia cardíaca' });
  await expect(vision).toBeVisible();
  await expect(vision).toHaveCSS('color', 'rgb(251, 244, 255)');
  await expect(vision).toHaveCSS('background-color', 'rgb(50, 27, 75)');

  await vision.click();
  await expect(vision).toHaveAttribute('aria-pressed', 'true');
  await expect(vision).toHaveCSS('color', 'rgb(255, 163, 110)');
  await expect(vision).toHaveCSS('background-color', 'rgb(74, 40, 59)');
  await expect(pulse).toHaveCSS('color', 'rgb(251, 244, 255)');

  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(pulse).toBeVisible();
  await expect(pulse).toHaveCSS('color', 'rgb(251, 244, 255)');
});
