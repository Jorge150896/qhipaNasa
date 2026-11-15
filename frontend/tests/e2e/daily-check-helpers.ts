import { expect, type Page } from '@playwright/test';

export async function openSavedDailyChecks(page: Page) {
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('button', { name: 'Tripulación', exact: true })
    .click();
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Historial', exact: true })
    .click();
  const activity = page.getByRole('region', { name: 'Actividad guardada' });
  const entries = activity.locator('details[id^="check-"]');
  await expect(entries.first()).toBeVisible();
  for (const entry of await entries.all()) {
    if ((await entry.getAttribute('open')) === null) await entry.locator('summary').first().click();
  }
  return activity;
}

export async function openDailyAssessment(page: Page) {
  const manual = page.getByRole('button', { name: 'Llenar a mano' });
  const activity = page.getByRole('radio', { name: 'Rutina en cabina', exact: true });
  await expect(manual.or(activity)).toBeVisible();
  if (await manual.isVisible()) await manual.click();
  await activity.check();
  await page.getByRole('radio', { name: 'Después', exact: true }).check();
  await page.getByRole('button', { name: 'Continuar a autoevaluación' }).click();
}

export async function confirmDailyCheck(page: Page) {
  await page.getByRole('button', { name: 'Revisar chequeo', exact: true }).click();
  await page.getByRole('button', { name: 'Guardar chequeo', exact: true }).click();
}
