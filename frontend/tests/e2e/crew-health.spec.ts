import { expect, test } from '@playwright/test';

test('sistemas corporales, puntos 3D y registros aislados conservando el diario', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/mission/journal');
  await page.getByRole('spinbutton', { name: 'Horas de sueño', exact: true }).fill('7.4');
  await page.getByRole('button', { name: 'Guardar chequeo', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'guardado' })).toBeVisible();
  const oldJournal = await page.evaluate(() => localStorage.getItem('astra.demo.journal.v1'));
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('button', { name: 'Tripulación', exact: true })
    .click();
  const health = page.getByRole('region', { name: 'Salud por sistemas', exact: true });
  await expect(
    health.getByRole('navigation', { name: 'Sistemas corporales' }).getByRole('button'),
  ).toHaveCount(7);
  await page
    .getByRole('button', { name: 'Explorar ejercicio y aparato locomotor', exact: true })
    .click();
  await expect(
    health.getByRole('button', { name: 'Ejercicio y aparato locomotor', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await health.getByLabel('Estado reportado', { exact: true }).selectOption('no-change');
  await health.getByLabel('Actividad registrada', { exact: true }).fill('Bicicleta ficticia');
  await health.getByLabel('Duración registrada (min)', { exact: true }).fill('20');
  await health
    .getByLabel('Observación y contexto', { exact: true })
    .fill('Registro de ejercicio de Elena');
  await health.getByRole('button', { name: 'Guardar autorregistro', exact: true }).click();
  await expect(health.getByRole('status')).toContainText('Autorregistro de demostración guardado');
  await health.getByRole('button', { name: 'Marcar revisión realizada', exact: true }).click();
  await expect(health.locator('.health-followup')).toContainText('Revisado hoy en UTC');
  expect(await page.evaluate(() => localStorage.getItem('astra.demo.journal.v1'))).toBe(oldJournal);
  await page.reload();
  await health.getByRole('button', { name: 'Ejercicio y aparato locomotor', exact: true }).click();
  await expect(health.locator('.health-history')).toContainText('20 min registrados');
  await expect(health.locator('.health-followup')).toContainText('Revisado hoy en UTC');
  await page
    .getByRole('button', { name: 'Mateo Silva Especialista de misión', exact: true })
    .click();
  await expect(health.locator('.health-history li')).toHaveCount(0);
  await expect(health).toContainText('No hay autorregistros para Mateo Silva');
  await page
    .getByRole('button', { name: 'Explorar visión y sistema neuroocular', exact: true })
    .click();
  await expect(health).toContainText('Sin evaluación ocular');
  await health.getByLabel('Estado reportado', { exact: true }).selectOption('change');
  await health
    .getByLabel('Observación visual', { exact: true })
    .fill('Cambio visual ficticio de Mateo para revisión');
  await health.getByRole('button', { name: 'Guardar autorregistro', exact: true }).click();
  await expect(health.locator('.health-history')).toContainText('Cambio visual ficticio de Mateo');
  await expect(health.locator('.health-analysis')).toContainText(
    'Compartir los cambios reportados',
  );
  await page.screenshot({ path: '../docs/qa/crew-health-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Elena Torres Comandante', exact: true }).click();
  await expect(health.locator('.health-history li')).toHaveCount(0);
  await expect(health.locator('.health-analysis')).not.toContainText(
    'Cambio visual ficticio de Mateo',
  );
  await health.getByRole('button', { name: 'Cardiovascular', exact: true }).click();
  await expect(health).toContainText('Referencia de esta serie');
  await health.getByRole('button', { name: 'Ver serie de pulso', exact: true }).click();
  await expect(page).toHaveURL(/mission\/history/);
  await expect(
    page.getByRole('heading', { name: 'Más allá de una lectura.', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('astra.demo.journal.v1'))).toBe(oldJournal);
  expect(errors).toEqual([]);
});

test('móvil y sin modelo 3D: controles de salud y autorregistro disponibles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.route('**/models/astronaut.glb', (route) => route.abort());
  await page.goto('/missions/selene/crew');
  await expect(
    page.getByRole('heading', { name: 'El visor 3D no está disponible', exact: true }),
  ).toBeVisible();
  const health = page.getByRole('region', { name: 'Salud por sistemas', exact: true });
  await health.getByRole('button', { name: 'Visión y sistema neuroocular', exact: true }).click();
  await expect(health).toContainText('Sin autoevaluación registrada');
  await health.getByRole('button', { name: 'Guardar autorregistro', exact: true }).click();
  await expect(health.getByRole('status')).toContainText('guardado');
  await expect(health.locator('.health-history')).toContainText('No evaluado');
  await page.screenshot({ path: '../docs/qa/crew-health-mobile.png', fullPage: true });
  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
  const journal = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('astra.demo.health.v1:selene')!),
  );
  expect(journal.entries[0].crewId).toBe('ana');
  expect(
    await page.evaluate(() => localStorage.getItem('astra.demo.health.v1:odyssey')),
  ).toBeNull();
});

test('error del registro de salud no borra datos ni bloquea los sensores; fallo de escritura visible', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('astra.demo.health.v1:odyssey', 'incompatible'),
  );
  await page.goto('/mission/crew');
  const health = page.getByRole('region', { name: 'Salud por sistemas', exact: true });
  await expect(health.getByRole('alert')).toContainText('No se pudo leer');
  await expect(
    health.getByRole('button', { name: 'Guardar autorregistro', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Consultar temperatura corporal', exact: true }).click();
  await expect(page.locator('.scene-reading strong')).toContainText(/36[.,]6/);
  expect(await page.evaluate(() => localStorage.getItem('astra.demo.health.v1:odyssey'))).toBe(
    'incompatible',
  );
  await page.evaluate(() => localStorage.removeItem('astra.demo.health.v1:odyssey'));
  // A fresh context omits the corrupt-data setup and denies writes only to the new feature.
  const failurePage = await page.context().newPage();
  await failurePage.addInitScript(() => {
    const read = Storage.prototype.getItem,
      write = Storage.prototype.setItem;
    Object.defineProperty(Storage.prototype, 'getItem', {
      value: function (this: Storage, key: string) {
        return key === 'astra.demo.health.v1:odyssey' ? null : read.call(this, key);
      },
    });
    Object.defineProperty(Storage.prototype, 'setItem', {
      value: function (this: Storage, key: string, value: string) {
        if (key === 'astra.demo.health.v1:odyssey')
          throw new DOMException('Denied', 'QuotaExceededError');
        return write.call(this, key, value);
      },
    });
  });
  await failurePage.goto('/mission/crew');
  const failureHealth = failurePage.getByRole('region', {
    name: 'Salud por sistemas',
    exact: true,
  });
  await expect(
    failureHealth.getByRole('button', { name: 'Guardar autorregistro', exact: true }),
  ).toBeEnabled();
  await failureHealth.getByRole('button', { name: 'Guardar autorregistro', exact: true }).click();
  await expect(failureHealth.getByRole('alert')).toContainText('No se pudo guardar');
  await expect(failureHealth.locator('.health-history li')).toHaveCount(0);
  await failurePage.close();
});

test('explicación visual por sistema: pasos, pausa y movimiento reducido', async ({ page }) => {
  await page.goto('/mission/crew');
  const health = page.getByRole('region', { name: 'Salud por sistemas', exact: true });
  const visual = health.locator('.health-visual');
  await expect(
    visual.getByRole('img', { name: 'Esquema conceptual: Cardiovascular' }),
  ).toBeVisible();
  await visual.getByRole('button', { name: 'Qué observar' }).click();
  await expect(visual.locator('.health-visual-caption')).toContainText('calidad del sensor');
  await visual.getByRole('button', { name: 'Pausar ilustración' }).click();
  await expect(visual.locator('.health-flow')).toHaveCSS('animation-play-state', 'paused');
  await visual.getByRole('button', { name: 'Reanudar ilustración' }).click();
  await expect(visual.locator('.health-flow')).toHaveCSS('animation-play-state', 'running');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(visual.locator('.health-flow')).toHaveCSS('animation-name', 'none');
  for (const name of [
    'Ejercicio y aparato locomotor',
    'Visión y sistema neuroocular',
    'Equilibrio y coordinación',
    'Alimentación y nutrición',
    'Respuesta inmunitaria',
    'Actividad extravehicular',
  ]) {
    await health
      .getByRole('navigation', { name: 'Sistemas corporales' })
      .getByRole('button', { name, exact: true })
      .click();
    await expect(visual.getByRole('img', { name: `Esquema conceptual: ${name}` })).toBeVisible();
    await visual.getByRole('button', { name: 'Qué no concluye' }).click();
    await expect(visual.locator('.health-visual-caption')).not.toBeEmpty();
  }
  expect(
    await page.evaluate(() => localStorage.getItem('astra.demo.health.v1:odyssey')),
  ).toBeNull();
});
