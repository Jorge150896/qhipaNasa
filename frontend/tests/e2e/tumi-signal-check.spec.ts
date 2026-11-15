import { expect, test } from '@playwright/test';

test('Simulación guía a Elena desde una señal ausente hasta una nueva captura simulada', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/mission/simulation#perdida-de-senal');

  const signal = page.getByRole('region', { name: 'Faltan 3 lecturas de SpO₂' });
  await expect(signal).toContainText('14:26 UTC');
  await expect(signal.locator('.chart-missing')).toHaveCount(3);
  const repeat = signal.getByRole('button', { name: 'Repetir medición simulada', exact: true });
  await repeat.click();
  await expect(signal.getByRole('status')).toContainText('Nueva lectura simulada · 98 %');
  await expect(signal.getByRole('status')).toContainText('UTC');
  await expect(signal.locator('.chart-missing')).toHaveCount(3);
  await repeat.click();
  await repeat.click();
  await repeat.click();
  await expect(signal.getByRole('status')).toHaveText(
    'La captura sigue sin una lectura disponible.',
  );
  await expect(signal.getByText('Nueva lectura simulada', { exact: false })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await signal.getByRole('button', { name: 'Ver evidencia', exact: true }).click();
  await expect(page).toHaveURL(/\/mission\/crew#crew-history$/);
  await expect(page.locator('.telemetry-chart .chart-missing')).toHaveCount(3);
});
