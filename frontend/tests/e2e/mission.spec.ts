import { expect, test } from '@playwright/test';
import { confirmDailyCheck, openDailyAssessment } from './daily-check-helpers';

test('Mi estado prioriza la observación de la persona y abre su detalle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/mission/overview');
  const pending = page.getByRole('region', { name: 'Pendientes' });
  await expect(
    pending.getByRole('heading', { name: 'Revisar el registro de descanso' }),
  ).toBeVisible();
  await expect(pending.locator('li').first().getByRole('button')).toHaveText('Abrir observación');
  await page.getByRole('button', { name: 'Mateo Silva Especialista de misión' }).click();
  await expect(pending.getByRole('button', { name: 'Completar chequeo diario' })).toBeVisible();
  await expect(pending.getByRole('button', { name: 'Abrir observación' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Elena Torres Comandante' }).click();
  await pending.getByRole('button', { name: 'Abrir observación' }).click();
  await expect(page).toHaveURL(/observations#observation-sleep-elena-v1$/);
  const observation = page.locator('#observation-sleep-elena-v1');
  await expect(
    observation.getByRole('heading', { name: 'Revisar el registro de descanso' }),
  ).toBeVisible();
  await observation.getByRole('button', { name: 'Marcar como revisada' }).click();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('button', { name: 'Mi estado' })
    .click();
  await expect(pending.getByRole('button', { name: 'Completar chequeo diario' })).toBeVisible();
  await expect(pending.getByRole('button', { name: 'Abrir observación' })).toHaveCount(0);
  await page.reload();
  await expect(pending.getByRole('button', { name: 'Completar chequeo diario' })).toBeVisible();
  await expect(pending.getByRole('button', { name: 'Abrir observación' })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('modelo local, sensores, nave, escenarios y diario persistido', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/mission/overview');
  await expect(page.getByRole('heading', { name: 'Mi estado' })).toBeVisible();
  await expect(page.locator('main canvas')).toHaveCount(0);
  await page.screenshot({ path: '../docs/qa/dashboard-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Ubicar mi módulo' }).click();
  const habitat = page.getByRole('region', { name: 'Explorador de módulos' });
  await expect(habitat.getByRole('heading', { name: 'Hábitat de descanso' })).toBeVisible();
  await habitat.getByRole('button', { name: 'Explorar Laboratorio' }).click();
  await expect(habitat.getByRole('heading', { name: 'Laboratorio' })).toBeVisible();
  await page.screenshot({ path: '../docs/qa/nave-desktop.png', fullPage: true });
  await page.getByText('Radiación histórica en la ISS · NASA RadLab', { exact: true }).click();
  await expect(page.getByText(/65 registros archivados/)).toBeVisible();
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
  await navigation.getByRole('button', { name: 'Simulación', exact: true }).click();
  await page.getByRole('button', { name: /Pérdida de señal/ }).click();
  await navigation.getByRole('button', { name: 'Mi estado', exact: true }).click();
  await page.getByRole('button', { name: 'Elena Torres Comandante' }).click();
  const summary = page.getByRole('region', { name: 'Mi estado' });
  await summary.getByRole('button', { name: 'Ver evidencia', exact: true }).click();
  await expect(page).toHaveURL(/\/mission\/history$/);
  await expect(page.locator('.telemetry-chart .chart-missing')).toHaveCount(3);
  await navigation.getByRole('button', { name: /Observaciones/ }).click();
  await page.getByRole('button', { name: 'Marcar como revisada' }).click();
  await expect(page.locator('.observation-detail .badge')).toHaveText('Revisada');
  await navigation.getByRole('button', { name: 'Chequeo diario', exact: true }).click();
  await openDailyAssessment(page);
  await page.getByRole('spinbutton', { name: 'Horas de sueño', exact: true }).fill('7.5');
  await page.getByRole('radio', { name: 'Bien', exact: true }).check();
  await confirmDailyCheck(page);
  await expect(page.getByRole('status').filter({ hasText: 'guardado' })).toBeVisible();
  await page.reload();
  await expect(page.locator('.check-list').getByText(/7[.,]5 h/)).toBeVisible();
  await navigation.getByRole('button', { name: 'Mi estado', exact: true }).click();
  const context = page.getByRole('region', { name: 'Contexto y actividad reciente' });
  await expect(context).toContainText('Registrado hoy');
  await context.getByRole('button', { name: 'Consultar chequeo' }).click();
  await expect(page).toHaveURL(/journal$/);
  await expect(page.locator('.check-list')).toContainText(/7[.,]5 h/);
  await page.goto('/mission/history');
  await expect(page.getByRole('heading', { name: 'Más allá de una lectura.' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('móvil: sensores seleccionables y sin desbordamiento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1100 });
  await page.goto('/mission/overview');
  const sizes = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.width);
  await page.screenshot({ path: '../docs/qa/dashboard-mobile.png', fullPage: true });
  const summary = page.getByRole('region', { name: 'Mi estado' });
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await page.getByRole('button', { name: 'Mateo Silva Especialista de misión' }).click();
  await expect(summary).toContainText('Módulo de ejercicio');
  await summary.getByRole('button', { name: 'Ubicar mi módulo' }).click();
  await expect(page).toHaveURL(/\/mission\/habitat#occupied-module$/);
  const explorer = page.getByRole('region', { name: 'Explorador de módulos' });
  await expect(explorer).toBeFocused();
  await expect(explorer.getByRole('heading', { name: 'Módulo de ejercicio' })).toBeVisible();
  await nav.getByRole('button', { name: 'Mi estado' }).click();
  await summary.getByRole('button', { name: 'Nuevo autorregistro' }).click();
  await expect(page).toHaveURL(/\/mission\/crew#crew-health-entry$/);
  const entry = page.getByRole('region', { name: 'Autorregistro de salud' });
  await expect(entry).toBeFocused();
  await entry.getByLabel('Estado reportado').selectOption('no-change');
  await entry.getByRole('button', { name: 'Revisar respuestas' }).click();
  await entry.getByRole('button', { name: 'Guardar autorregistro' }).click();
  await expect(entry.getByRole('status')).toContainText('Autorregistro de demostración guardado');
  await nav.getByRole('button', { name: 'Mi estado' }).click();
  await expect(summary).toContainText('Cardiovascular');
  await expect(summary).toContainText('Sin cambios reportados');
  await page.getByRole('button', { name: 'Elena Torres Comandante' }).click();
  await expect(summary).toContainText('Aún no hay autorregistros');
});

test('un asset 3D fallido no impide consultar los indicadores', async ({ page }) => {
  const requestedModel = page.waitForRequest('**/models/astronaut.glb');
  await page.route('**/models/astronaut.glb', (route) => route.abort());
  await page.goto('/mission/crew');
  await page
    .getByRole('group', { name: 'Lecturas de la instantánea' })
    .getByRole('button', { name: 'Temperatura', exact: true })
    .click();
  await expect(page.getByRole('complementary', { name: 'Temperatura corporal' })).toContainText(
    /36[.,]6/,
  );
  // Check the fallback after injecting the asset failure, not before its bundle loads.
  await requestedModel;
  await expect(page.getByRole('heading', { name: 'El visor 3D no está disponible' })).toBeVisible();
});

test('gráfica continua de demo, muestras consultables y cortes de señal', async ({ page }) => {
  await page.goto('/mission/history');
  const chart = page.locator('.telemetry-chart');
  const sweep = chart.locator('.chart-sweep');
  await expect(sweep).toHaveCSS('animation-iteration-count', 'infinite');
  await chart.getByRole('button', { name: /^14:18 UTC:/ }).click();
  await expect(chart.locator('.chart-readout')).toContainText('14:18 UTC');
  await expect(chart.locator('.chart-readout')).toContainText('70 lpm');
  await chart.getByRole('button', { name: 'Pausar gráfica', exact: true }).click();
  await expect(sweep).toHaveCSS('animation-play-state', 'paused');
  await chart.getByRole('button', { name: 'Reanudar gráfica', exact: true }).click();
  await expect(sweep).toHaveCSS('animation-play-state', 'running');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await nav.getByRole('button', { name: 'Simulación', exact: true }).click();
  await page.getByRole('button', { name: /Pérdida de señal/ }).click();
  await nav.getByRole('button', { name: 'Historial', exact: true }).click();
  await page.locator('.sensor-tabs').getByRole('button', { name: 'SpO₂', exact: true }).click();
  await expect(chart.locator('.chart-missing')).toHaveCount(3);
  await chart.getByRole('button', { name: '14:32 UTC: Sin muestra', exact: true }).click();
  await expect(chart.locator('.chart-readout')).toContainText('Muestra ausente');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(sweep).toHaveCSS('animation-name', 'none');
  await page.setViewportSize({ width: 390, height: 1000 });
  await expect(chart.getByRole('button', { name: /^14:18 UTC:/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await chart.screenshot({ path: '../docs/qa/telemetry-chart-mobile.png', animations: 'disabled' });
});

test('cada sección conserva navegación y entrada directa después de separar features', async ({
  page,
}) => {
  await page.goto('/missions/selene/overview');
  const sections = [
    ['Tripulación', 'crew', 'Tripulación'],
    ['Entorno del hábitat', 'habitat', 'Entorno del hábitat'],
    ['Historial', 'history', 'Más allá de una lectura.'],
    ['Chequeo diario', 'journal', '¿Cómo va tu día a bordo?'],
    ['Observaciones', 'observations', 'De la señal al seguimiento.'],
    ['Simulación', 'simulation', 'Explora lo que cambia.'],
    ['Fuentes y alcance', 'sources', 'Datos con contexto.'],
    ['Mi estado', 'overview', 'Mi estado'],
  ];
  for (const [label, section, heading] of sections) {
    await page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('button', { name: label, exact: label !== 'Observaciones' })
      .click();
    await expect(page).toHaveURL(new RegExp(`/missions/selene/${section}$`));
    await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
  }
});
