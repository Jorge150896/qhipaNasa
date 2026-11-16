import { expect, test } from '@playwright/test';
import { openTumiChat } from './tumi-chat-helpers';
import {
  confirmDailyCheck,
  openDailyAssessment,
  openSavedDailyChecks,
} from './daily-check-helpers';

test('Nami abre Fuentes fuera del menú y enlaza el estudio desde el mismo hábitat', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/missions/selene/crew');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav.getByRole('button', { name: 'Fuentes y alcance' })).toHaveCount(0);
  await openTumiChat(page);
  const chat = page.getByRole('region', { name: 'Nami' });
  await chat.getByRole('textbox').fill('¿De dónde vienen los datos?');
  await chat.getByRole('button', { name: 'Enviar' }).click();
  await chat.getByRole('button', { name: 'Ver Fuentes y alcance' }).click();
  await expect(page).toHaveURL('/missions/selene/sources');
  await expect(chat).toBeHidden();
  await expect(nav.getByRole('button', { name: 'Más', exact: true })).toHaveCount(0);
  const sources = page.getByRole('region', { name: 'Origen de los datos' });
  await expect(sources).toContainText('Datos históricos reales');
  await expect(sources).toContainText('Datos simulados');
  await expect(sources).toContainText('Entrada manual');
  await expect(page.getByRole('region', { name: 'Investigación de referencia' })).toContainText(
    'CANS',
  );
  await page.reload();
  await expect(sources).toBeVisible();
  await sources.getByRole('link', { name: 'Ver datos de Inspiration4 en Historial' }).click();
  await expect(page).toHaveURL(/\/missions\/selene\/crew#nasa-history$/);
  await expect(page.getByRole('region', { name: 'Historial real de Inspiration4' })).toBeVisible();
});

test('de una lectura de respiración al módulo, Nami y el autorregistro', async ({ page }) => {
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
  const habitat = page.getByRole('complementary', { name: 'Contexto del módulo' });
  await expect(habitat).toContainText('Hábitat de descanso');
  await expect(habitat).toContainText('14:32 UTC');
  await expect(page).toHaveURL(/\/mission\/crew$/);
  await habitat.getByRole('button', { name: 'Elena Torres' }).click();
  await page
    .getByRole('group', { name: 'Lecturas de la instantánea' })
    .getByRole('button', { name: 'Respiración', exact: true })
    .click();
  await reading.getByRole('button', { name: 'Preguntar a Nami por esta lectura' }).click();
  const chat = page.getByRole('region', { name: 'Nami' });
  await chat.getByRole('button', { name: '¿Qué significa este dato?' }).click();
  await expect(chat.getByRole('log')).toContainText(/frecuencia respiratoria de Elena Torres/i);
  await chat.getByRole('button', { name: 'Ocultar chat' }).click();
  await reading.getByRole('button', { name: 'Registrar cómo me siento' }).click();
  await expect(page).toHaveURL(/\/mission\/journal#check-system-/);
  await openDailyAssessment(page);
  await page.getByRole('spinbutton', { name: 'Horas de sueño' }).fill('7.4');
  await page.getByLabel('Estado reportado').selectOption('no-change');
  await page.getByLabel('Nota (opcional)').fill('Observación ficticia durante el descanso.');
  await confirmDailyCheck(page);
  await expect(page.getByText('Chequeo guardado', { exact: true })).toBeVisible();
  await page.reload();
  await expect(await openSavedDailyChecks(page)).toContainText(
    'Observación ficticia durante el descanso.',
  );
});
