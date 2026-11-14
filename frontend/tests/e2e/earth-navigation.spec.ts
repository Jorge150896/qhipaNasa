import { expect, test } from '@playwright/test';

test('menú Tierra desde misión y mapa, selección activa, móvil y recarga', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 1100 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/missions/selene/overview');
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    const earth = nav.getByRole('button', { name: 'Tierra', exact: true });
    const map = nav.getByRole('button', { name: 'Mapa espacial', exact: true });
    await earth.click();
    await expect(page).toHaveURL('/explore?destination=earth&tab=earth');
    await expect(earth).toHaveAttribute('aria-current', 'page');
    await expect(map).not.toHaveAttribute('aria-current');
    await expect(page.locator('.earth-place-card')).toHaveCount(8);
    await page.reload();
    await expect(earth).toHaveAttribute('aria-current', 'page');
    await page.getByRole('tab', { name: 'Despegues de la Tierra', exact: true }).click();
    await expect(earth).toHaveAttribute('aria-current', 'page');
    await map.click();
    await expect(map).toHaveAttribute('aria-current', 'page');
    await expect(earth).not.toHaveAttribute('aria-current');
    await earth.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('heading', { name: 'Todo de la Tierra', exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
