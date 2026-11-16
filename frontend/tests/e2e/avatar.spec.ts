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
  await page.goto('/mission/crew#crew-avatar');
  const editor = page.locator('#crew-avatar');
  await expect(editor.locator('canvas')).toBeVisible();
  const beacon = page.waitForResponse(
    (response) => response.url().endsWith('/beacon.glb') && response.ok(),
  );
  await editor.getByRole('button', { name: 'Baliza flotante' }).click();
  await beacon;
  await expect(editor.getByRole('button', { name: 'Órbita' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.space-background')).toHaveCSS(
    'background-image',
    /space-purple-orange-v1/,
  );
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
  await editor.getByRole('button', { name: 'Fondo original' }).click();
  await page.getByRole('button', { name: /Mateo Silva/ }).click();
  await expect(editor.getByRole('button', { name: 'Fondo original' })).toHaveAttribute(
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
  await expect(page.locator('html')).toHaveAttribute('data-app-background', 'orbit');
  await expect(editor.getByRole('button', { name: 'Órbita' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.reload();
  await expect(editor.getByRole('button', { name: 'Órbita' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('aplica Órbita al retirar Hangar y conserva el fondo original al cambiarlo', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const key = 'astra.appearance.background.v1';
    if (localStorage.getItem(key) === null) localStorage.setItem(key, 'hangar');
  });
  await page.goto('/mission/crew');
  const background = page.locator('.space-background');
  await expect(background).toHaveCSS('background-image', /space-purple-orange/);
  await page.goto('/mission/crew#crew-avatar');
  const editor = page.locator('#crew-avatar');
  await expect(editor.getByRole('button', { name: 'Hangar' })).toHaveCount(0);
  await expect(editor.getByRole('button', { name: 'Órbita' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('navigation').getByRole('button', { name: 'Monitoreo diario' }).click();
  await expect(page).toHaveURL(/\/mission\/journal$/);
  await expect(page.locator('.journal-page')).toHaveCSS('background-image', /rgba/);
  await expect(page.locator('.daily-wellbeing .panel').first()).toHaveCSS(
    'background-image',
    /rgba/,
  );

  await page.getByRole('navigation').getByRole('button', { name: 'Tripulación' }).click();
  await page.goto('/mission/crew#crew-avatar');
  await editor.getByRole('button', { name: 'Fondo original' }).click();
  await expect(background).toHaveCSS('background-image', 'none');
  await page.reload();
  await expect(background).toHaveCSS('background-image', 'none');
  await page.goto('/');
  await expect(background).toHaveCSS('background-image', 'none');
});
