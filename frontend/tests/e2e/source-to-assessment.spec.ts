import { expect, test } from '@playwright/test';

test('Fuentes distingue los orígenes y enlaza el estudio desde el mismo hábitat', async ({
  page,
}) => {
  await page.goto('/missions/selene/sources');
  const sources = page.getByRole('region', { name: 'Origen de los datos' });
  await expect(sources).toContainText('Datos históricos reales');
  await expect(sources).toContainText('Datos simulados');
  await expect(sources).toContainText('Entrada manual');
  await expect(page.getByRole('region', { name: 'Investigación de referencia' })).toContainText(
    'CANS',
  );
  await sources.getByRole('link', { name: 'Ver datos de Inspiration4 en Historial' }).click();
  await expect(page).toHaveURL(/\/missions\/selene\/history#nasa-history$/);
  await expect(page.getByRole('region', { name: 'Historial real de Inspiration4' })).toBeVisible();
});

test('de una lectura de respiración al módulo, Tumi y el autorregistro', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/mission/crew');
  await page
    .getByRole('group', { name: 'Lecturas de la instantánea' })
    .getByRole('button', { name: 'Respiración', exact: true })
    .click();
  const reading = page.getByRole('complementary', { name: 'Frecuencia respiratoria' });
  await expect(reading).toContainText('14 respiraciones por minuto');
  await reading.getByRole('button', { name: 'Ver módulo de la tripulación' }).click();
  const habitat = page.getByRole('region', { name: 'Explorador de módulos' });
  await expect(habitat).toContainText('Hábitat de descanso');
  await expect(habitat).toContainText('14:32 UTC');
  await habitat.getByRole('button', { name: 'Elena Torres' }).click();
  await page
    .getByRole('group', { name: 'Lecturas de la instantánea' })
    .getByRole('button', { name: 'Respiración', exact: true })
    .click();
  await reading.getByRole('button', { name: 'Preguntar a Tumi por esta lectura' }).click();
  const chat = page.getByRole('region', { name: 'Tumi' });
  await chat.getByRole('button', { name: '¿Qué significa este dato?' }).click();
  await expect(chat.getByRole('log')).toContainText('Frecuencia respiratoria de Elena Torres');
  await chat.getByRole('button', { name: 'Ocultar chat' }).click();
  await reading.getByRole('button', { name: 'Registrar cómo me siento' }).click();
  const entry = page.getByRole('region', { name: 'Autorregistro de salud' });
  await expect(entry).toBeFocused();
  await entry.getByLabel('Estado reportado').selectOption({ label: 'Sin cambios reportados' });
  await entry
    .getByLabel('Observación y contexto')
    .fill('Observación ficticia durante el descanso.');
  await entry.getByRole('button', { name: 'Revisar respuestas' }).click();
  await entry.getByRole('button', { name: 'Guardar autorregistro' }).click();
  await expect(entry.getByRole('status')).toContainText('guardado');
  await page.reload();
  await page
    .getByRole('navigation', { name: 'Secciones de Tripulación' })
    .getByRole('button', { name: 'Autoevaluación', exact: true })
    .click();
  await expect(page.getByRole('region', { name: 'Historial de autorregistros' })).toContainText(
    'Observación ficticia durante el descanso.',
  );
});
