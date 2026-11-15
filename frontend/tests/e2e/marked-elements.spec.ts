import { expect, test } from '@playwright/test';

test('elementos señalados se retiran en escritorio, móvil y recarga', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/mission/crew');
    for (const reload of [false, true]) {
      if (reload) await page.reload();
      await expect(page.getByRole('heading', { name: 'Tripulación', exact: true })).toBeVisible();
      await expect(
        page.locator('.snapshot-time,.crew-context,.crew-body-display,.app-footer'),
      ).toHaveCount(0);
      const dock = page.getByRole('navigation', { name: 'Navegación principal' });
      await expect(dock.getByRole('button', { name: 'Abrir chat de Tumi' })).toHaveCount(0);
      await expect(
        page.getByRole('banner').getByRole('button', { name: 'Abrir chat de Tumi' }),
      ).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.goto('/explore?destination=earth&tab=earth');
    await expect(
      page.getByRole('heading', { name: 'Centros en Tierra', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.demo-badge,.app-footer')).toHaveCount(0);
  }
});
