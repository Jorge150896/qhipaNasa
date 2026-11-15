import { expect, test } from '@playwright/test';

test('resumen con astronauta, cobertura, contexto de radiación y accesos', async ({ page }) => {
  await page.goto('/mission/overview');
  const console = page.getByRole('region', { name: 'Resumen operacional del astronauta' });
  await expect(console.getByRole('heading', { name: 'Qhipa Pacha Lab' })).toBeVisible();
  const metrics = console.getByRole('group', { name: 'Indicadores del resumen' });
  await metrics.getByRole('button', { name: /Temperatura/ }).click();
  await expect(console.locator('.scene-reading strong')).toContainText(/36[.,]6/);
  await expect(console).toContainText('no límites médicos');
  await expect(console).toContainText('Sin consulta ambiental en esta vista');
  await console.getByText('Los cinco peligros de la misión', { exact: false }).click();
  await console
    .getByRole('group', { name: 'Explorar los cinco peligros' })
    .getByRole('button', { name: 'Aislamiento', exact: true })
    .click();
  await expect(
    console.getByRole('region', { name: 'Contexto del peligro seleccionado' }),
  ).toContainText(/sueño/i);
  await page.getByRole('button', { name: 'Consultar frecuencia cardíaca', exact: true }).waitFor();
  await console.getByRole('button', { name: 'Radiación', exact: true }).click();
  await console.getByText('Los cinco peligros de la misión', { exact: false }).click();
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: '../docs/qa/astronaut-overview-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 1000 });
  await expect(
    page.getByRole('button', { name: 'Consultar frecuencia cardíaca', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '../docs/qa/astronaut-overview-mobile.png', fullPage: true });
  await console.getByRole('button', { name: 'Iniciar monitoreo', exact: true }).click();
  await expect(page).toHaveURL(/\/mission\/monitoring$/);
});

test('móvil, recarga, movimiento reducido y pérdida del modelo conservan controles', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/models/astronaut.glb', (route) => route.abort());
  await page.goto('/missions/aurora/overview');
  const console = page.getByRole('region', { name: 'Resumen operacional del astronauta' });
  await console
    .getByRole('group', { name: 'Indicadores del resumen' })
    .getByRole('button', { name: /SpO₂/ })
    .click();
  await expect(console.locator('.scene-reading')).toContainText('Saturación');
  await expect(page.getByRole('heading', { name: 'El visor 3D no está disponible' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(console).toContainText('Inés Rojas');
  await console.getByText('Los cinco peligros de la misión', { exact: false }).click();
  await expect(console.getByRole('button', { name: 'Radiación', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('heading', { name: 'El visor 3D no está disponible' })).toBeVisible();
  await page.screenshot({
    path: '../docs/qa/astronaut-overview-mobile-fallback.png',
    fullPage: true,
  });
});
