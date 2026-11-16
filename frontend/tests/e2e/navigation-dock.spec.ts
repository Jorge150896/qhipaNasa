import { expect, test } from '@playwright/test';

test('escritorio: la barra inferior enlaza misión y agrupa Centros en Tierra bajo Mapa espacial', async ({
  page,
}) => {
  await page.goto('/mission/crew');
  const dock = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(dock).toHaveCSS('position', 'fixed');
  await expect(dock.getByRole('button')).toHaveText([
    'Tripulación',
    'Monitoreo diario',
    'Mapa espacial',
    'Simulación',
  ]);
  await expect(dock.getByRole('button', { name: 'Monitoreo diario', exact: true })).toHaveCount(1);
  await expect(dock.getByRole('button', { name: /Mi estado|Observaciones/ })).toHaveCount(0);
  await expect(dock.getByRole('button', { name: 'Tripulación', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(dock.getByRole('button', { name: 'Abrir chat de Nami' })).toHaveCount(0);
  await expect(
    page.getByRole('banner').getByRole('button', { name: 'Abrir chat de Nami' }),
  ).toHaveCount(0);
  await expect(dock.getByRole('button', { name: 'Más', exact: true })).toHaveCount(0);
  await expect(dock.getByRole('button', { name: 'Centros en Tierra', exact: true })).toHaveCount(0);
  await dock.getByRole('button', { name: 'Mapa espacial', exact: true }).click();
  await expect(page).toHaveURL(/\/explore/);
  await expect(
    page.getByRole('region', { name: 'Exploración espacial', exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Centros en Tierra', exact: true }).click();
  await expect(page).toHaveURL('/explore?destination=earth&tab=earth');
  await expect(dock.getByRole('button', { name: 'Mapa espacial', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(dock.getByRole('button').nth(2)).toHaveAttribute('aria-current', 'page');
  await dock.screenshot({ path: '../docs/qa/navigation-dock-order-desktop.png' });
});

test('móvil: cuatro accesos en el mismo orden, teclado y recarga de sección', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/mission/crew');
  const dock = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(dock.getByRole('button')).toHaveText([
    'Tripulación',
    'Monitoreo diario',
    'Mapa espacial',
    'Simulación',
  ]);
  const crew = dock.getByRole('button', { name: 'Tripulación', exact: true });
  await crew.focus();
  await page.keyboard.press('Tab');
  await expect(dock.getByRole('button', { name: 'Monitoreo diario', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dock.getByRole('button', { name: 'Mapa espacial', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dock.getByRole('button', { name: 'Centros en Tierra', exact: true })).toHaveCount(0);
  await expect(dock.getByRole('button', { name: 'Monitoreo', exact: true })).toHaveCount(0);
  const simulation = dock.getByRole('button', { name: 'Simulación', exact: true });
  await expect(simulation).toBeFocused();
  await simulation.press('Enter');
  await expect(page).toHaveURL('/mission/simulation');
  await page.reload();
  await expect(simulation).toHaveAttribute('aria-current', 'page');
  await expect(dock.getByRole('button', { name: 'Más', exact: true })).toHaveCount(0);
  await dock.screenshot({ path: '../docs/qa/navigation-dock-order-mobile.png' });
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(dock.getByRole('button')).toHaveText([
      'Tripulación',
      'Monitoreo diario',
      'Mapa espacial',
      'Simulación',
    ]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
