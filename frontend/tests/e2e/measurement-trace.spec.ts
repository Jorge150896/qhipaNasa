import { expect, test } from '@playwright/test';
test('procedencia consultable por muestra, persona, ausencia y recarga en móvil', async ({
  page,
}) => {
  await page.goto('/mission/history');
  const panel = page.getByRole('table', {
    name: 'Muestras y procedencia del tripulante',
    exact: true,
  });
  await expect(panel.getByText('Ver origen', { exact: true })).toHaveCount(8);
  await panel.getByText('Ver origen', { exact: true }).first().click();
  const row = panel.locator('tbody tr').first();
  await expect(row).toContainText('Elena Torres');
  await expect(row).toContainText('Simulación determinista');
  await expect(row).toContainText(/8 nov\.? 2026/);
  await page
    .getByRole('button', { name: 'Mateo Silva Especialista de misión', exact: true })
    .click();
  await expect(row).toContainText('Mateo Silva');
  await expect(row).not.toContainText('Elena Torres');
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('button', { name: 'Simulación', exact: true })
    .click();
  await page.goto('/mission/simulation#perdida-de-senal');
  await expect(page.getByRole('region', { name: 'Faltan 3 lecturas de SpO₂' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('button', { name: 'Tripulación', exact: true })
    .click();
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await page.getByRole('button', { name: 'Elena Torres Comandante', exact: true }).click();
  await page.locator('.sensor-tabs').getByRole('button', { name: 'SpO₂', exact: true }).click();
  const missing = panel.locator('tbody tr').last();
  await missing.getByText('Ver origen', { exact: true }).click();
  await expect(missing).toContainText('Muestra ausente');
  await expect(missing).toContainText('Sin muestra');
  await page.setViewportSize({ width: 390, height: 1000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  await panel.getByText('Ver origen', { exact: true }).first().click();
  await expect(row).toContainText('Simulación determinista');
});
