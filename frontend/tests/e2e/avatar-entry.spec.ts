import { expect, test } from '@playwright/test';

test('el editor abre por enlace directo y no ofrece una pestaña de Personalización', async ({
  page,
}) => {
  await page.goto('/mission/crew#crew-avatar');
  const editor = page.getByRole('region', { name: 'Personalizar astronauta' });
  const tabs = page.getByRole('navigation', { name: 'Secciones de Tripulación' });
  await expect(tabs.getByRole('button', { name: 'Personalización' })).toHaveCount(0);
  await expect(editor.getByRole('button', { name: 'Restablecer' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Modelo corporal' })).toHaveCount(0);

  await editor.getByRole('button', { name: 'Baliza flotante' }).click();
  await tabs.getByRole('button', { name: 'Ahora' }).click();
  await expect(editor).toHaveCount(0);
  await page.reload();
  await expect(editor.getByRole('button', { name: 'Restablecer' })).toBeVisible();
});

test('el editor móvil mantiene los controles cuando falla el modelo del astronauta', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/models/astronaut.glb', (route) => route.abort());
  await page.goto('/missions/aurora/crew#crew-avatar');
  const editor = page.getByRole('region', { name: 'Personalizar astronauta' });

  await expect(editor.getByText('Vista 3D no disponible.')).toBeVisible();
  await editor.getByRole('button', { name: 'Linterna' }).click();
  await expect(editor.getByRole('button', { name: 'Linterna' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});
