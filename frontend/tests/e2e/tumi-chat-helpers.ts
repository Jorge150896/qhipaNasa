import { expect, type Page } from '@playwright/test';

export async function openTumiChat(page: Page) {
  const chat = page.getByRole('region', { name: 'Nami', exact: true });
  if (await chat.isVisible()) return;
  const panel = page.getByRole('region', { name: 'Asistente Nami', exact: true });
  if (!(await panel.isVisible())) {
    const restore = page.getByRole('button', { name: 'Mostrar Nami', exact: true });
    if (await restore.isVisible()) await restore.click();
    const mascot = page.getByRole('button', { name: 'Abrir asistente Nami', exact: true });
    await expect(mascot).toBeVisible();
    const compact = page.getByRole('button', { name: 'Abrir Nami', exact: true });
    if (await compact.isVisible()) await compact.click();
    else await mascot.click();
  }
  const openContextual = panel.getByRole('button', { name: 'Abrir chat contextual', exact: true });
  if (!(await openContextual.isVisible())) await panel.locator('summary').click();
  await openContextual.click();
  await expect(chat).toBeVisible();
}
