import { expect, test } from '@playwright/test';

test('modelo local, sensores, nave, escenarios y diario persistido', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const modelRequest = page.waitForResponse(
    (response) => response.url().endsWith('/models/astronaut.glb') && response.ok(),
  );
  await page.goto('/mission/overview');
  await expect(page.getByRole('heading', { name: 'Cada señal cuenta.' })).toBeVisible();
  await page.getByRole('button', { name: 'Consultar frecuencia cardíaca', exact: true }).waitFor();
  await modelRequest;
  await page.screenshot({ path: '../docs/qa/dashboard-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Consultar temperatura corporal', exact: true }).click();
  await expect(page.locator('.scene-reading strong')).toContainText(/36[.,]6/);
  await page.getByRole('button', { name: 'Mateo Silva Especialista de misión' }).click();
  await expect(page.locator('.scene-reading strong')).toContainText(/37[.,]1/);
  await page.getByRole('button', { name: 'Nave', exact: true }).click();
  await page.getByRole('button', { name: 'Seleccionar zona 03', exact: true }).click();
  await expect(page.getByLabel('Zona de la nave')).toHaveValue('laboratory');
  await page.screenshot({ path: '../docs/qa/nave-desktop.png', fullPage: true });
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
  await navigation.getByRole('button', { name: 'Entorno de la nave', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Nave', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Astronauta', exact: true }).click();
  await page.getByRole('button', { name: 'Consultar frecuencia cardíaca', exact: true }).waitFor();
  await navigation.getByRole('button', { name: 'Simulación', exact: true }).click();
  await page.getByRole('button', { name: /Pérdida de señal/ }).click();
  await navigation.getByRole('button', { name: 'Centro de misión', exact: true }).click();
  await page.getByRole('button', { name: 'Elena Torres Comandante' }).click();
  await page.getByRole('button', { name: /SpO₂.*Sin señal reciente/ }).click();
  await expect(page.locator('.scene-reading strong')).toContainText('—');
  await navigation.getByRole('button', { name: /Observaciones/ }).click();
  await page.getByRole('button', { name: 'Marcar como revisada' }).click();
  await expect(page.locator('.observation-detail .badge')).toHaveText('Revisada');
  await navigation.getByRole('button', { name: 'Chequeo diario', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Horas de sueño', exact: true }).fill('7.5');
  await page.getByRole('radio', { name: 'Bien', exact: true }).check();
  await page.getByRole('button', { name: 'Guardar chequeo', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'guardado' })).toBeVisible();
  await page.reload();
  await expect(page.locator('.check-list').getByText(/7[.,]5 h/)).toBeVisible();
  await page.goto('/mission/history');
  await expect(page.getByRole('heading', { name: 'Más allá de una lectura.' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('móvil: sensores seleccionables y sin desbordamiento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1100 });
  await page.goto('/mission/overview');
  await page.getByRole('button', { name: 'Consultar frecuencia cardíaca', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Consultar temperatura corporal', exact: true }).click();
  await expect(page.locator('.scene-reading strong')).toContainText(/36[.,]6/);
  const sizes = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.width);
  await page.screenshot({ path: '../docs/qa/dashboard-mobile.png', fullPage: true });
});

test('un asset 3D fallido no impide consultar los indicadores', async ({ page }) => {
  await page.route('**/models/astronaut.glb', (route) => route.abort());
  await page.goto('/mission/overview');
  await expect(page.getByRole('heading', { name: 'El visor 3D no está disponible' })).toBeVisible();
  await page.getByRole('button', { name: /Temperatura.*Lectura disponible/ }).click();
  await expect(page.locator('.scene-reading strong')).toContainText(/36[.,]6/);
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
    ['Tripulación', 'crew', 'El lado humano de la misión.'],
    ['Entorno del hábitat', 'habitat', 'El espacio que habitan.'],
    ['Historial', 'history', 'Más allá de una lectura.'],
    ['Chequeo diario', 'journal', '¿Cómo va tu día a bordo?'],
    ['Observaciones', 'observations', 'De la señal al seguimiento.'],
    ['Simulación', 'simulation', 'Explora lo que cambia.'],
    ['Fuentes y alcance', 'sources', 'Datos con contexto.'],
    ['Centro de misión', 'overview', 'Cada señal cuenta.'],
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
