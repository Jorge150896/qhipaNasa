import { expect, type Page } from '@playwright/test';

export async function openTumiChat(page: Page) {
  const chat = page.getByRole('region', { name: 'Tumi', exact: true });
  if (await chat.isVisible()) return;
  const restore = page.getByRole('button', { name: 'Mostrar Tumi', exact: true });
  if (await restore.isVisible()) await restore.click();
  const mascot = page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true });
  await expect(mascot).toBeVisible();
  const compact = page.getByRole('button', { name: 'Abrir Tumi', exact: true });
  if (await compact.isVisible()) await compact.click();
  else await mascot.click();
  await page
    .getByRole('region', { name: 'Asistente Tumi', exact: true })
    .getByRole('button', { name: 'Abrir chat contextual', exact: true })
    .click();
  await expect(chat).toBeVisible();
}
