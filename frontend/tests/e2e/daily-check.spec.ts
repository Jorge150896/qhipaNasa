import { expect, test } from '@playwright/test';

test('chequeo por actividad en móvil con reintento, actualización y registros anteriores', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.addInitScript(() => {
    const write = Storage.prototype.setItem;
    const key = 'astra.demo.journal.v1';
    if (!localStorage.getItem(key)) {
      write.call(
        localStorage,
        key,
        JSON.stringify({
          version: 1,
          checks: [
            {
              id: 'elena:2020-01-01',
              crewId: 'elena',
              recordedAt: '2020-01-01T12:00:00Z',
              sleepHours: 6.7,
              fatigue: 2,
              mood: 'good',
              note: 'Registro anterior',
            },
          ],
          reviewedObservationIds: ['sleep-elena-v1'],
        }),
      );
    }
    Storage.prototype.setItem = function (name, value) {
      if (name === key && document.documentElement.dataset.failCheck === 'yes')
        throw new Error('demo');
      write.call(this, name, value);
    };
  });
  await page.goto('/mission/journal');
  const form = page.locator('.daily-check-form');
  const consolePanel = page.getByRole('region', { name: 'Consola de mediciones' });
  await form.getByRole('radio', { name: 'Caminata espacial EVA' }).check();
  await expect(consolePanel).toContainText('SpO₂');
  await form.getByRole('radio', { name: 'Antes', exact: true }).check();
  await form.getByRole('button', { name: 'Continuar a autoevaluación' }).click();
  await form.getByRole('spinbutton', { name: /Duración prevista/ }).fill('25');
  await expect(form.getByRole('spinbutton', { name: /Molestias en manos/ })).toBeVisible();
  await form.getByRole('button', { name: 'Volver al contexto' }).click();
  await form.getByRole('radio', { name: 'Recorrido de superficie' }).check();
  await form.getByRole('radio', { name: 'Incidencia durante la actividad' }).check();
  await form.getByRole('button', { name: 'Continuar a autoevaluación' }).click();
  await expect(form.getByRole('spinbutton', { name: /Duración transcurrida/ })).toHaveValue('');
  await expect(form.getByRole('spinbutton', { name: /Molestias en manos/ })).toHaveCount(0);
  await form.getByRole('spinbutton', { name: 'Horas de sueño' }).fill('7.5');
  await form.getByRole('spinbutton', { name: /Distancia/ }).fill('0');
  await form.getByLabel('Región con molestias (opcional)').selectOption('hands');
  await form.getByRole('button', { name: 'Revisar chequeo' }).click();
  await expect(form).toContainText('0 km');
  await expect(form).toContainText('Sin registrar');
  await page.evaluate(() => {
    document.documentElement.dataset.failCheck = 'yes';
  });
  await form.getByRole('button', { name: 'Guardar chequeo' }).click();
  await expect(form.getByRole('alert')).toContainText('El borrador sigue disponible');
  await expect(form.getByText('Chequeo guardado', { exact: true })).toHaveCount(0);
  await page.evaluate(() => {
    delete document.documentElement.dataset.failCheck;
  });
  await form.getByRole('button', { name: 'Reintentar guardado' }).click();
  await expect(form.getByText('Chequeo guardado', { exact: true })).toBeVisible();
  await page.reload();
  const checks = page.locator('.check-list');
  await expect(checks).toContainText('Registro anterior');
  await expect(checks).toContainText('0 km');
  await expect(form.getByRole('radio', { name: 'Recorrido de superficie' })).toBeChecked();
  await form.getByRole('button', { name: 'Continuar a autoevaluación' }).click();
  await form.getByRole('spinbutton', { name: /Distancia/ }).fill('1.5');
  await form.getByRole('button', { name: 'Revisar chequeo' }).click();
  await expect(form).toContainText('actualizará ese registro');
  await form.getByRole('button', { name: 'Guardar chequeo' }).click();
  await expect(checks).toContainText('1.5 km');
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('astra.demo.journal.v1')!)),
  ).toMatchObject({
    checks: [
      {
        discomfortRegion: 'hands',
        context: { activity: 'surface', moment: 'incident', measurements: { distanceKm: 1.5 } },
      },
      { id: 'elena:2020-01-01' },
    ],
    reviewedObservationIds: ['sleep-elena-v1'],
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
