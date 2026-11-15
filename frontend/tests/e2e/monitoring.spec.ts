import { expect, test } from '@playwright/test';

test('sesión asistida: contexto, repetición, revisión, guardado y recarga móvil', async ({
  page,
}) => {
  await page.goto('/missions/aurora/monitoring');
  await page.getByLabel('Origen de las lecturas').selectOption('demo');
  await page.getByRole('button', { name: 'Caminata espacial', exact: false }).click();
  await page.getByLabel('Equipo o sensores utilizados').fill('Traje de prueba 01');
  await page.getByLabel('Fase de actividad').selectOption('after');
  const checkboxes = page
    .getByRole('region', { name: 'Preparación de captura' })
    .getByRole('checkbox');
  for (let i = 0; i < 3; i++) await checkboxes.nth(i).check();
  await page.getByRole('button', { name: 'Preparar captura', exact: true }).click();
  await page.getByRole('button', { name: 'Capturar lecturas', exact: true }).click();
  const console = page.getByRole('region', { name: 'Consola de captura' });
  await expect(console).toContainText('1/20 capturas');
  await expect(console).toContainText('Sintético');
  await page.getByRole('button', { name: 'Repetir medición', exact: true }).click();
  await expect(console).toContainText('2/20 capturas');
  await page.screenshot({ path: '../docs/qa/monitoring-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Revisar sesión', exact: true }).click();
  await page
    .getByLabel('Nota de la sesión')
    .fill('Verificar colocación del sensor en próxima captura.');
  await page.getByRole('button', { name: 'Guardar sesión local', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sesión guardada' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.reload();
  const history = page.getByRole('region', { name: 'Sesiones registradas' });
  await history.getByText(/Caminata espacial · 2 capturas/).click();
  await expect(history).toContainText('Verificar colocación del sensor');
  await expect(history).toContainText('Frecuencia cardíaca');
  await expect(history).toContainText('Traje de prueba 01');
  await expect(history).toContainText('observada');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../docs/qa/monitoring-mobile.png', fullPage: true });
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('button', { name: 'Tripulación', exact: true })
    .click();
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  const activity = page.getByRole('region', { name: 'Actividad guardada' });
  await expect(activity).toContainText('2 capturas');
  await activity.getByRole('button', { name: 'Sesión de monitoreo' }).click();
  await expect(page).toHaveURL(/monitoring#session-/);
  await expect(page.locator('details[id^="session-"][open]')).toContainText('Traje de prueba 01');
});
test('la demo identifica la API sin configurar antes de iniciar', async ({ page }) => {
  await page.goto('/mission/monitoring');
  await expect(page.getByRole('option', { name: 'API · sin configurar' })).toBeDisabled();
  await expect(page.getByLabel('Origen de las lecturas')).toHaveValue('demo');
  await expect(page.getByRole('button', { name: 'Capturar lectura', exact: true })).toHaveCount(0);
});
