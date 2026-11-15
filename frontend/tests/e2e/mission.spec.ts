import { expect, test } from '@playwright/test';
import { confirmDailyCheck, openDailyAssessment } from './daily-check-helpers';

test('las rutas retiradas llevan a Tripulación y conservan los registros', async ({ page }) => {
  await page.goto('/mission/overview');
  await expect(page).toHaveURL(/\/mission\/crew\/?$/);
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(navigation.getByRole('button', { name: /Mi estado|Observaciones/ })).toHaveCount(0);
  await navigation.getByRole('button', { name: 'Monitoreo diario', exact: true }).click();
  await openDailyAssessment(page);
  await page.getByRole('spinbutton', { name: 'Horas de sueño', exact: true }).fill('7.5');
  await page.getByRole('radio', { name: 'Bien', exact: true }).check();
  await confirmDailyCheck(page);
  await expect(page.getByRole('status').filter({ hasText: 'guardado' })).toBeVisible();
  await page.goto('/mission/observations');
  await expect(page).toHaveURL(/\/mission\/crew\/?$/);
  await navigation.getByRole('button', { name: 'Monitoreo diario', exact: true }).click();
  await expect(page.locator('.check-list').getByText(/7[.,]5 h/)).toBeVisible();
  await page.goto('/missions/selene/observations');
  await expect(page).toHaveURL(/\/missions\/selene\/crew\/?$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Tripulación', exact: true })).toBeVisible();
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
  await nav.getByRole('button', { name: 'Tripulación', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
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
  await page.goto('/missions/selene/crew');
  const sections = [
    ['Tripulación', 'crew', 'Tripulación'],
    ['Monitoreo diario', 'journal', 'Monitoreo diario'],
    ['Simulación', 'simulation', 'Explora lo que cambia.'],
  ];
  for (const [label, section, heading] of sections) {
    await page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('button', { name: label, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/missions/selene/${section}$`));
    await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
  }
});
