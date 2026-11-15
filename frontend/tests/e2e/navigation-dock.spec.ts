import { expect, test } from '@playwright/test';

test('escritorio: la barra inferior enlaza misión y agrupa Centros en Tierra bajo Mapa espacial', async ({
  page,
}) => {
  await page.goto('/mission/crew');
  const dock = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(dock).toHaveCSS('position', 'fixed');
  await expect(dock.getByRole('button', { name: 'Monitoreo diario', exact: true })).toHaveCount(1);
  await expect(dock.getByRole('button', { name: /Mi estado|Observaciones/ })).toHaveCount(0);
  await expect(dock.getByRole('button', { name: 'Tripulación', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(dock.getByRole('button', { name: 'Abrir chat de Tumi' })).toHaveCount(0);
  await expect(
    page.getByRole('banner').getByRole('button', { name: 'Abrir chat de Tumi' }),
  ).toBeVisible();
  await expect(dock.getByRole('button', { name: 'Más', exact: true })).toBeHidden();
  await expect(dock.getByRole('button', { name: 'Centros en Tierra', exact: true })).toHaveCount(0);
  await dock.getByRole('button', { name: 'Mapa espacial', exact: true }).click();
  await page.getByRole('tab', { name: 'Centros en Tierra', exact: true }).click();
  await expect(page).toHaveURL('/explore?destination=earth&tab=earth');
  await expect(dock.getByRole('button', { name: 'Mapa espacial', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('móvil: tres accesos principales, menú Más, teclado y recarga de sección', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/mission/crew');
  const dock = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(dock.getByRole('button')).toHaveText([
    'Mapa espacial',
    'Tripulación',
    'Monitoreo diario',
    'Más',
  ]);
  const more = dock.getByRole('button', { name: 'Más', exact: true });
  await more.focus();
  await more.press('Enter');
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await more.press('Tab');
  await expect(dock.getByRole('button', { name: 'Centros en Tierra', exact: true })).toHaveCount(0);
  await expect(dock.getByRole('button', { name: 'Monitoreo', exact: true })).toHaveCount(0);
  const simulation = dock.getByRole('button', { name: 'Simulación', exact: true });
  await expect(simulation).toBeFocused();
  await simulation.press('Escape');
  await expect(more).toBeFocused();
  await expect(simulation).toBeHidden();
  await more.click();
  await simulation.click();
  await expect(page).toHaveURL('/mission/simulation');
  await page.reload();
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  await expect(more).toHaveAttribute('data-current', 'true');
  await more.click();
  await expect(simulation).toHaveAttribute('aria-current', 'page');
  await page.getByRole('heading', { level: 1 }).click();
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
