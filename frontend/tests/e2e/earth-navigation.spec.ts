import { expect, test } from '@playwright/test';

test('Tierra se abre desde Explorar y conserva el acceso directo', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 1100 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/missions/selene/crew');
    const map = page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('button', { name: 'Mapa espacial', exact: true });
    await map.click();
    await expect(page.getByRole('heading', { name: /Distintos mundos/ })).toBeVisible({
      timeout: 20_000,
    });
    await page.getByRole('tab', { name: 'Todo de la Tierra', exact: true }).click();
    await expect(page).toHaveURL('/explore?destination=earth&tab=earth');
    await expect(map).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.earth-place-card')).toHaveCount(8);
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Todo de la Tierra', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.app-shell > .space-background')).toHaveCSS('position', 'fixed');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
