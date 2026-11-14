import type { Page } from '@playwright/test';

export async function openDailyAssessment(page: Page) {
  await page.getByRole('radio', { name: 'Rutina en cabina', exact: true }).check();
  await page.getByRole('radio', { name: 'Después', exact: true }).check();
  await page.getByRole('button', { name: 'Continuar a autoevaluación' }).click();
}

export async function confirmDailyCheck(page: Page) {
  await page.getByRole('button', { name: 'Revisar chequeo', exact: true }).click();
  await page.getByRole('button', { name: 'Guardar chequeo', exact: true }).click();
}
