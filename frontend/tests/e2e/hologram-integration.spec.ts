import { expect, test } from '@playwright/test';

test('modelos conservados se integran con las fichas y la línea de tiempo de main', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/mission/crew');
  await expect(
    page.getByRole('button', { name: 'Consultar frecuencia cardíaca', exact: true }),
  ).toBeVisible();
  const ready = page.waitForResponse(
    (response) => response.url().endsWith('/models/human-hologram.glb') && response.ok(),
  );
  await page.getByRole('button', { name: 'Personalización', exact: true }).click();
  await page.getByRole('button', { name: 'Holograma humano', exact: true }).click();
  await page.getByRole('button', { name: 'Ahora', exact: true }).click();
  await ready;
  await expect(page.locator('.body-readout')).toHaveCount(4);
  const canvas = page.getByRole('region', { name: /Holograma humano 3D de/ }).locator('canvas');
  const box = await canvas.boundingBox();
  await canvas.hover({ position: { x: box!.width / 2, y: box!.height * 0.23 } });
  await expect(
    page.getByRole('complementary', { name: 'Temperatura corporal', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Personalización', exact: true }).click();
  const appearance = page.getByRole('group', { name: 'Apariencia del holograma' });
  const female = page.waitForResponse(
    (response) => response.url().endsWith('/models/human-hologram-feminine.glb') && response.ok(),
  );
  await appearance.getByRole('button', { name: 'Femenina', exact: true }).click();
  await page.getByRole('button', { name: 'Ahora', exact: true }).click();
  await female;
  await expect(page.locator('.body-readout')).toHaveCount(4);
  await page.getByRole('button', { name: 'Personalización', exact: true }).click();
  await page
    .getByRole('button', { name: 'Mateo Silva Especialista de misión', exact: true })
    .click();
  await expect(appearance.getByRole('button', { name: 'Neutra', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const male = page.waitForResponse(
    (response) => response.url().endsWith('/models/human-hologram-masculine.glb') && response.ok(),
  );
  await appearance.getByRole('button', { name: 'Masculina', exact: true }).click();
  await page.getByRole('button', { name: 'Ahora', exact: true }).click();
  await male;
  await page.getByRole('button', { name: 'Personalización', exact: true }).click();
  await page.getByRole('button', { name: 'Elena Torres Comandante', exact: true }).click();
  await expect(appearance.getByRole('button', { name: 'Femenina', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Personalización', exact: true }).click();
  await page.getByRole('button', { name: 'Astronauta con traje', exact: true }).click();
  await page.getByRole('button', { name: 'Ahora', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Consultar frecuencia cardíaca', exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Personalización', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Astronauta con traje', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('móvil y fallo del modelo conservan los controles de main', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.route('**/models/human-hologram.glb', (route) => route.abort());
  await page.goto('/missions/aurora/crew');
  await page.getByRole('button', { name: 'Personalización', exact: true }).click();
  await page.getByRole('button', { name: 'Holograma humano', exact: true }).click();
  await page.getByRole('button', { name: 'Ahora', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'La escena 3D no está disponible', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('group', { name: 'Lecturas de la instantánea' })
    .getByRole('button', { name: 'Pulso', exact: true })
    .click();
  await expect(
    page.getByRole('complementary', { name: 'Frecuencia cardíaca', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Personalización', exact: true }).click();
  await page.getByRole('button', { name: 'Astronauta con traje', exact: true }).click();
  await page.getByRole('button', { name: 'Ahora', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Consultar frecuencia cardíaca', exact: true }),
  ).toBeVisible();
});
