import { expect, test } from '@playwright/test';

test('Simulación marca la ruta por tripulante y día y abre tres destinos', async ({ page }) => {
  await page.goto('/mission/simulation');
  const routes = page.getByRole('region', { name: 'Ruta emocional' });
  await expect(page.getByText('Resultado del escenario', { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /Rutina de misión|Cambio en el descanso|Pérdida de señal/ }),
  ).toHaveCount(0);
  const active = routes.locator('li[aria-current="step"]');
  await expect(active).toContainText('Aquí está Elena');
  await expect(active).toContainText('Atención');
  await expect(routes.getByText(/Ubicación en la misión/)).toBeVisible();
  const astronaut = routes.locator('.simulation-routes__astronaut');
  const controls = routes.getByRole('group', { name: 'Simular un cambio de hábitos' });
  const tracks = routes.getByRole('list', { name: 'Rutas emocionales disponibles' });
  const astronautBox = (await astronaut.boundingBox())!;
  const controlsBox = (await controls.boundingBox())!;
  const tracksBox = (await tracks.boundingBox())!;
  const recordBox = (await routes.locator('.simulation-routes__evidence').boundingBox())!;
  expect(astronautBox.y + astronautBox.height).toBeLessThan(recordBox.y);
  expect(recordBox.y + recordBox.height).toBeLessThan(controlsBox.y);
  expect(astronautBox.x).toBeCloseTo(controlsBox.x, 0);
  expect(controlsBox.x + controlsBox.width).toBeLessThan(tracksBox.x);

  await routes.getByLabel('Día simulado').selectOption('0');
  await expect(active).toContainText('Bienestar');

  await page.getByRole('button', { name: /Mateo Silva/ }).click();
  await expect(active).toContainText('Aquí está Mateo');
  await expect(active).toContainText('Bienestar');
  await routes.getByRole('button', { name: 'Ver su módulo' }).click();
  await expect(page).toHaveURL(/mission\/crew#crew-module$/);

  await page.goto('/mission/simulation');
  await page.getByRole('button', { name: /Lucía Vega/ }).click();
  await expect(active).toContainText('Aquí está Lucía');
  await expect(active).toContainText('Equilibrio');
  await routes.getByRole('button', { name: 'Abrir historial' }).click();
  await expect(page).toHaveURL(/mission\/crew#crew-history$/);
  await expect(page.getByRole('heading', { name: 'Seguimiento de 30 días' })).toBeVisible();

  await page.goto('/mission/simulation');
  await routes.getByRole('button', { name: 'Abrir monitoreo diario' }).click();
  await expect(page).toHaveURL(/mission\/journal$/);
});

test('Simulación en móvil conserva las rutas al recargar y avisa si falta la serie', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/missions/aurora/simulation');
  const routes = page.getByRole('region', { name: 'Ruta emocional' });
  await expect(routes.getByText(/aún no tiene una serie/)).toBeVisible();
  await expect(routes.locator('li[aria-current]')).toHaveCount(0);
  await page.reload();
  await expect(routes.getByRole('button', { name: 'Abrir historial' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Los hábitos de la prueba mueven un solo punto sin cambiar el autorregistro', async ({
  page,
}) => {
  await page.goto('/mission/simulation');
  const route = page.getByRole('region', { name: 'Ruta emocional' });
  const point = route.locator('[data-here]');
  const fields = ['Alimentación', 'Ejercicio', 'Contacto social'];
  await expect(point).toContainText('Pidió apoyo');
  for (const [value, emotion] of [
    ['supportive', 'Feliz'],
    ['usual', 'Habitual'],
    ['reduced', 'Triste'],
  ]) {
    for (const label of fields)
      await route.getByRole('combobox', { name: label, exact: true }).selectOption(value);
    await expect(point).toHaveCount(1);
    await expect(point).toContainText(emotion);
    await expect(
      route.locator('.simulation-routes__evidence').getByText(/Ánimo:\s*Bajo/),
    ).toBeVisible();
  }
  await route.getByRole('button', { name: 'Restablecer hábitos' }).click();
  await expect(point).toContainText('Pidió apoyo');
});
