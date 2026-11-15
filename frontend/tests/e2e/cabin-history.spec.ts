import { expect, test } from '@playwright/test';

test('el historial de cabina sincroniza sus señales desde Tripulación', async ({ page }) => {
  await page.goto('/mission/crew#crew-module');
  const history = page.locator('.cabin-history').filter({ hasText: 'Ver historial de la ISS' });
  await history.getByText('Ver historial de la ISS', { exact: true }).click();
  const slider = history.getByRole('slider');
  await expect(slider).toHaveAttribute('aria-valuetext', '00:03 GMT');
  await slider.fill('123');
  await expect(slider).toHaveAttribute('aria-valuetext', '10:18 GMT');
  await expect(history.locator('.cabin-value').first()).toHaveText(/4[\s,.]?023 ppm/);
  await history.getByRole('button', { name: 'Reproducir' }).click();
  await expect(slider).not.toHaveAttribute('aria-valuetext', '10:18 GMT');
  await history.getByRole('button', { name: 'Pausar' }).click();
  const paused = await slider.inputValue();
  await expect(slider).toHaveValue(paused);
});

test('móvil permite recorrer el historial y abrir la referencia exterior de Marte', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/mission/habitat#occupied-module');
  await expect(page).toHaveURL(/\/mission\/crew\/?#crew-module$/);
  await page.getByText('Ver historial de la ISS', { exact: true }).click();
  const slider = page.getByRole('slider', { name: /Hora del historial/ });
  await slider.press('End');
  await expect(slider).toHaveAttribute('aria-valuetext', '23:58 GMT');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.reload();
  await page.getByText('Ver historial de la ISS', { exact: true }).click();
  await expect(slider).toHaveAttribute('aria-valuetext', '00:03 GMT');

  await page.goto('/explore?destination=mars');
  const exterior = page.getByRole('region', { name: 'Condiciones exteriores del cráter Gale' });
  await expect(exterior).toContainText('−62,9 °C');
  await expect(exterior).toContainText('755,08 Pa');
});

test('la pestaña Mapa de Marte abre el planeta desde Tierra y conserva el acceso tras recargar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/explore?destination=earth&tab=earth');
  const mars = page.getByRole('tab', { name: 'Mapa de Marte', exact: true });
  await mars.click();
  await expect(page).toHaveURL(/destination=mars&tab=mars$/);
  await expect(mars).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.fleet-view-mode strong')).toHaveText('Detalle · Marte');
  const panel = page.getByRole('tabpanel', { name: 'Mapa de Marte' });
  await expect(
    panel.getByRole('region', { name: 'Condiciones exteriores del cráter Gale' }),
  ).toBeVisible();
  await expect(panel.getByRole('heading', { name: /Ares/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.reload();
  await expect(mars).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.fleet-view-mode strong')).toHaveText('Detalle · Marte');
  await page.getByRole('tab', { name: 'Mapa espacial', exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await expect(page.locator('.fleet-view-mode strong')).toHaveText('Vista de misión');
});
