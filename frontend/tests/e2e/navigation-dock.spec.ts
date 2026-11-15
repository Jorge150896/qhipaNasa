import { expect, test } from '@playwright/test';

test('barra azul inferior navega entre misión, Tierra y mapa', async ({ page }) => {
  await page.goto('/mission/overview');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav).toHaveCSS('position', 'fixed');
  await expect(nav.getByRole('button', { name: 'Centro de misión', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  const bounds = (await nav.boundingBox())!;
  expect(bounds.y).toBeGreaterThan(800);
  await page.getByRole('button', { name: 'Consultar frecuencia cardíaca', exact: true }).waitFor();
  await page.screenshot({ path: '../docs/qa/lab-console-desktop.png', fullPage: false });
  await nav.getByRole('button', { name: 'Chequeo diario', exact: true }).click();
  await expect(page).toHaveURL(/\/mission\/journal$/);
  await nav.getByRole('button', { name: 'Tierra', exact: true }).click();
  await expect(page).toHaveURL(/tab=earth/);
  await expect(nav.getByRole('button', { name: 'Tierra', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await nav.getByRole('button', { name: 'Mapa espacial', exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
  await expect(nav.getByRole('button', { name: 'Mapa espacial', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('móvil: todas las opciones accesibles, recarga y controles sin cubrir', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto('/mission/monitoring');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await nav.getByRole('button', { name: 'Fuentes y alcance', exact: true }).click();
  await expect(page).toHaveURL(/\/mission\/sources$/);
  await page.reload();
  await expect(
    nav.getByRole('button', { name: 'Fuentes y alcance', exact: true }),
  ).toBeInViewport();
  const tumi = nav.getByRole('button', { name: 'Abrir chat de Tumi', exact: true });
  await tumi.click();
  await expect(tumi).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('heading', { name: 'Tumi', exact: false }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: '../docs/qa/lab-console-mobile-tumi.png', fullPage: false });
  await nav.getByRole('button', { name: 'Centro de misión', exact: true }).click();
  await expect(page).toHaveURL(/\/mission\/overview$/);
  await expect(nav.getByRole('button', { name: 'Centro de misión', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
});
