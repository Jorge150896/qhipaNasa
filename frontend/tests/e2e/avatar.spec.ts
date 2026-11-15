import { expect, test } from '@playwright/test';

test('personaliza cada tripulante y carga sus piezas bajo demanda', async ({ page }) => {
  const assets: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/models/avatar/')) assets.push(request.url());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/mission/crew');
  await expect(page.locator('#crew-avatar canvas')).toHaveCount(0);
  expect(assets).toEqual([]);
  await page.getByRole('button', { name: 'Personalización', exact: true }).click();
  await page.getByText('Personalizar astronauta', { exact: true }).click();
  const editor = page.locator('#crew-avatar');
  await expect(editor.locator('canvas')).toBeVisible();
  const beacon = page.waitForResponse(
    (response) => response.url().endsWith('/beacon.glb') && response.ok(),
  );
  await editor.getByRole('button', { name: 'Baliza flotante' }).click();
  await beacon;
  await editor.getByRole('button', { name: 'Órbita' }).click();
  await expect(editor.locator('div[data-background]')).toHaveAttribute('data-background', 'orbit');
  const probe = page.waitForResponse(
    (response) => response.url().endsWith('/probe.glb') && response.ok(),
  );
  await editor.getByRole('button', { name: 'Dron orbital' }).click();
  await probe;
  const tool = page.waitForResponse(
    (response) => response.url().endsWith('/torch.glb') && response.ok(),
  );
  await editor.getByRole('button', { name: 'Linterna' }).click();
  await tool;
  const texture = page.waitForResponse(
    (response) => response.url().endsWith('/suit-purple-purple.webp') && response.ok(),
  );
  await editor
    .getByRole('group', { name: 'Bandas', exact: true })
    .getByRole('button', { name: 'Morado' })
    .click();
  await texture;
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.getByRole('button', { name: /Mateo Silva/ }).click();
  await expect(editor.getByRole('button', { name: 'Estudio orbital' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: /Elena Torres/ }).click();
  await expect(editor.getByRole('button', { name: 'Dron orbital' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await editor.getByRole('button', { name: 'Restablecer' }).click();
  await expect(editor.getByRole('button', { name: 'Manos libres' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.reload();
  await page.getByRole('button', { name: 'Personalización', exact: true }).click();
  await page.getByText('Personalizar astronauta', { exact: true }).click();
  await expect(editor.getByRole('button', { name: 'Estudio orbital' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
