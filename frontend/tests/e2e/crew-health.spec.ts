import { expect, test } from '@playwright/test';
import { confirmDailyCheck, openDailyAssessment } from './daily-check-helpers';

test('sistemas corporales, puntos 3D y registros aislados conservando el diario', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/mission/journal');
  await openDailyAssessment(page);
  await page.getByRole('spinbutton', { name: 'Horas de sueño', exact: true }).fill('7.4');
  await confirmDailyCheck(page);
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
  const telemetry = page.getByRole('region', { name: 'Tendencia de telemetría' });
  await expect(
    telemetry.getByRole('img', { name: /Historial de Frecuencia cardíaca/ }),
  ).toBeVisible();
  await expect(page.locator('.crew-hologram')).toHaveCount(0);
  const chestMarker = page.getByRole('button', { name: 'Consultar frecuencia cardíaca' });
  await expect(chestMarker).toBeVisible();
  const markerBox = await chestMarker.boundingBox();
  const canvasBox = await page
    .getByRole('region', { name: 'Explorador tridimensional' })
    .locator('canvas')
    .boundingBox();
  if (!markerBox || !canvasBox) throw new Error('No se encontró el visor corporal');
  await page.mouse.click(canvasBox.x + canvasBox.width / 2, markerBox.y + markerBox.height / 2);
  const pulseCard = page.getByRole('complementary', { name: 'Frecuencia cardíaca' });
  await expect(pulseCard).toContainText('Descanso');
  await pulseCard.getByText('Ver tendencia', { exact: true }).click();
  await expect(
    pulseCard.getByRole('img', { name: /Historial de Frecuencia cardíaca/ }),
  ).toBeVisible();
  await expect(telemetry.getByRole('img')).toHaveCount(0);
  await pulseCard.getByRole('button', { name: 'Ocultar tendencia' }).click();
  await expect(
    telemetry.getByRole('img', { name: /Historial de Frecuencia cardíaca/ }),
  ).toBeVisible();
  await expect(telemetry.getByRole('button', { name: 'Pausar gráfica' })).toHaveCount(0);

  const respirationMarker = page.getByRole('button', {
    name: 'Consultar frecuencia respiratoria',
    exact: true,
  });
  await respirationMarker.click();
  await expect(respirationMarker).toHaveAttribute('aria-pressed', 'true');
  const respirationCard = page.getByRole('complementary', { name: 'Frecuencia respiratoria' });
  await expect(respirationCard).toContainText('14 respiraciones por minuto');
  await expect(respirationCard).toContainText('Última lectura · 14:32 UTC');
  await respirationCard.getByText('Ver tendencia', { exact: true }).click();
  await expect(
    respirationCard.getByRole('img', { name: /Historial de Frecuencia respiratoria/ }),
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Explorar ejercicio y aparato locomotor', exact: true })
    .click();
  const hologram = page.getByRole('complementary', { name: 'Ejercicio y aparato locomotor' });
  await expect(hologram).toBeVisible();
  await expect(hologram).toContainText('Sin sesiones registradas');
  await expect(hologram).not.toContainText('Frecuencia cardíaca');
  await expect(telemetry.getByRole('img')).toHaveCount(0);
  await expect(hologram.getByRole('button', { name: 'Ver mis autorregistros' })).toBeHidden();
  await hologram.getByText('Ver detalles', { exact: true }).click();
  await hologram.getByRole('button', { name: 'Ver mis autorregistros' }).click();
  await expect(health.getByRole('region', { name: 'Historial de autorregistros' })).toBeFocused();
  await hologram.getByRole('button', { name: 'Registrar ejercicio' }).click();
  await expect(health.getByRole('region', { name: 'Autorregistro de salud' })).toBeFocused();
  await expect(
    health.getByRole('button', { name: 'Ejercicio y aparato locomotor', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await health.getByLabel('Estado reportado', { exact: true }).selectOption('no-change');
  await health.getByLabel('Actividad registrada', { exact: true }).fill('Bicicleta ficticia');
  await health.getByLabel('Duración registrada (min)', { exact: true }).fill('20');
  await health
    .getByLabel('Módulo al que corresponde el registro (opcional)')
    .selectOption('exercise');
  await health
    .getByLabel('Observación y contexto', { exact: true })
    .fill('Registro de ejercicio de Elena');
  await health.getByRole('button', { name: 'Revisar respuestas', exact: true }).click();
  await expect(health.getByRole('heading', { name: 'Confirma tu autorregistro' })).toBeFocused();
  await expect(health.locator('.health-confirmation')).toContainText('Bicicleta ficticia · 20 min');
  await expect(health.locator('.health-confirmation')).toContainText('Módulo de ejercicio');
  expect(
    await page.evaluate(() => localStorage.getItem('astra.demo.health.v1:odyssey')),
  ).toBeNull();
  await health.getByRole('button', { name: 'Editar respuestas', exact: true }).click();
  await expect(health.getByLabel('Duración registrada (min)')).toHaveValue('20');
  await health.getByRole('button', { name: 'Revisar respuestas', exact: true }).click();
  await health.getByRole('button', { name: 'Guardar autorregistro', exact: true }).click();
  await expect(health.getByRole('status')).toContainText('Autorregistro de demostración guardado');
  await expect(hologram).toContainText('Bicicleta ficticia · 20 min registrados');
  await expect(hologram.getByText('Bicicleta estática', { exact: true })).toBeVisible();
  await expect(hologram.locator('.crew-equipment-scene canvas')).toBeVisible();
  await health.getByRole('button', { name: 'Marcar revisión realizada', exact: true }).click();
  await expect(health.locator('.health-followup')).toContainText('Revisado hoy en UTC');
  expect(await page.evaluate(() => localStorage.getItem('astra.demo.journal.v1'))).toBe(oldJournal);
  await page.reload();
  await health.getByRole('button', { name: 'Ejercicio y aparato locomotor', exact: true }).click();
  await expect(health.locator('.health-history')).toContainText('20 min registrados');
  await expect(health.locator('.health-followup')).toContainText('Revisado hoy en UTC');
  const timeline = page.getByRole('region', { name: 'Línea de tiempo', exact: true });
  await timeline.getByRole('button', { name: /Bicicleta ficticia/ }).click();
  const moment = timeline.getByRole('region', { name: 'Detalle del momento' });
  await expect(moment).toContainText('Módulo de ejercicio');
  await expect(moment).toContainText('No hay lecturas ambientales vinculadas a este registro');
  await moment.getByRole('button', { name: 'Ubicar módulo en el visor' }).click();
  const explorer = page.getByRole('region', { name: 'Explorador tridimensional' });
  const recordOrigin = explorer.getByRole('region', { name: 'Origen en la línea de tiempo' });
  await expect(recordOrigin).toContainText('Bicicleta ficticia');
  await expect(recordOrigin).toContainText('Módulo reportado · Módulo de ejercicio');
  const modulePanel = explorer.getByRole('complementary', { name: 'Contexto del módulo' });
  await expect(modulePanel).toContainText('Ubicación del tripulante');
  await expect(modulePanel).toContainText('Hábitat de descanso · Descanso');
  await explorer.getByRole('button', { name: 'Astronauta', exact: true }).click();
  await expect(recordOrigin).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Mateo Silva Especialista de misión', exact: true })
    .click();
  await expect(page.locator('.crew-hologram')).toHaveCount(0);
  await expect(health.locator('.health-history li')).toHaveCount(0);
  await expect(health).toContainText('No hay autorregistros para Mateo Silva');
  await page
    .getByRole('button', { name: 'Explorar visión y sistema neuroocular', exact: true })
    .click();
  await expect(health).toContainText('Sin evaluación ocular');
  const visualActivity = health.getByRole('radio', { name: 'Leer de cerca', exact: true });
  await visualActivity.focus();
  await visualActivity.press('Space');
  await expect(visualActivity).toBeChecked();
  await expect(
    health.getByLabel('Observación visual', { exact: true }),
  ).toHaveAccessibleDescription('¿Cambió la nitidez al leer de cerca?');
  await health.getByLabel('Estado reportado', { exact: true }).selectOption('change');
  await health
    .getByLabel('Observación visual', { exact: true })
    .fill('Cambio visual ficticio de Mateo para revisión');
  await health.getByRole('button', { name: 'Revisar respuestas', exact: true }).click();
  await expect(health.locator('.health-confirmation')).toContainText('Leer de cerca');
  await health.getByRole('button', { name: 'Editar respuestas', exact: true }).click();
  await expect(visualActivity).toBeChecked();
  await health.getByRole('button', { name: 'Revisar respuestas', exact: true }).click();
  await health.getByRole('button', { name: 'Guardar autorregistro', exact: true }).click();
  await expect(health.locator('.health-history')).toContainText('Cambio visual ficticio de Mateo');
  await health.getByRole('button', { name: 'Ver mi registro', exact: true }).click();
  await expect(timeline).toBeFocused();
  await expect(timeline.getByRole('button', { name: /Visión · Leer de cerca/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(moment).toContainText('Leer de cerca');
  await expect(moment).toContainText('Cambio visual ficticio de Mateo');
  const visionCard = page.getByRole('complementary', { name: 'Visión y sistema neuroocular' });
  await expect(visionCard).toContainText('Cambio visual ficticio de Mateo');
  await expect(visionCard.getByRole('button', { name: 'Registrar observación' })).toBeVisible();
  await expect(health.locator('.health-next-step')).toContainText('Compartir el cambio reportado');
  await expect(health.getByRole('link', { name: 'Ir al seguimiento' })).toHaveAttribute(
    'href',
    '#crew-health-review',
  );
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
  await health.getByText('Consultar indicadores del sistema', { exact: true }).click();
  await expect(health.getByText('Referencia de esta serie').first()).toBeVisible();
  await health.getByRole('button', { name: 'Ver serie de pulso', exact: true }).click();
  await expect(page).toHaveURL(/mission\/history/);
  await expect(
    page.getByRole('heading', { name: 'Más allá de una lectura.', exact: true }),
  ).toBeVisible();
  const nasa = page.getByRole('region', { name: 'Historial real de Inspiration4' });
  await nasa.getByRole('button', { name: /^R\+1,/ }).click();
  const sample = nasa.getByRole('status', { name: 'Detalle de la muestra' });
  await expect(sample).toContainText('1 día después del regreso');
  await expect(sample).toContainText(/93[.,]5 mg\/dL/);
  await nasa.getByRole('button', { name: /^Potasio/ }).click();
  await expect(sample).toContainText(/3[.,]75 mmol\/L/);
  await expect(nasa.getByRole('button', { name: /^R\+1,/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(nasa.getByRole('table')).toBeHidden();
  await nasa.getByText('Ver tabla y fuentes', { exact: true }).click();
  await expect(nasa.getByRole('row')).toHaveCount(8);
  await expect(nasa.getByRole('row', { name: /^R\+1 / })).toContainText(/93[.,]5/);
  await expect(nasa.getByRole('link', { name: 'CSV original' })).toHaveAttribute(
    'href',
    /osdr\.nasa\.gov.*CMP_TRANSFORMED\.csv$/,
  );
  expect(await page.evaluate(() => localStorage.getItem('astra.demo.journal.v1'))).toBe(oldJournal);
  expect(errors).toEqual([]);
});

test('móvil y sin modelo 3D: controles de salud y autorregistro disponibles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.route('**/models/astronaut.glb', (route) => route.abort());
  await page.goto('/missions/selene/crew');
  await expect(
    page.getByRole('heading', { name: 'El visor 3D no está disponible', exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  const health = page.getByRole('region', { name: 'Salud por sistemas', exact: true });
  await page
    .getByRole('group', { name: 'Lecturas de la instantánea' })
    .getByRole('button', { name: 'SpO₂', exact: true })
    .click();
  const oxygenCard = page.getByRole('complementary', { name: 'Saturación periférica' });
  await expect(oxygenCard).toContainText('Sin señal reciente');
  await expect(oxygenCard).toContainText('Última lectura disponible');
  await expect(oxygenCard).toContainText('Comprueba el sensor');
  await oxygenCard.getByText('Ver tendencia', { exact: true }).click();
  await expect(
    oxygenCard.getByRole('img', { name: /Historial de Saturación periférica/ }),
  ).toBeVisible();
  const oxygenTelemetry = page.getByRole('region', { name: 'Tendencia de telemetría' });
  await expect(oxygenTelemetry).toContainText('Saturación periférica');
  await expect(oxygenTelemetry.getByRole('img')).toHaveCount(0);

  await page.getByRole('button', { name: 'Ver visión', exact: true }).click();
  const hologram = page.getByRole('complementary', { name: 'Visión y sistema neuroocular' });
  await expect(hologram).toContainText('Sin observaciones registradas');
  await expect(hologram.getByText('Leer de cerca', { exact: true })).toBeHidden();
  await expect(hologram.getByText(/Ver tendencia/)).toHaveCount(0);
  const telemetry = page.getByRole('region', { name: 'Tendencia de telemetría' });
  await expect(telemetry.getByRole('img')).toHaveCount(0);
  await expect(hologram.getByRole('button', { name: 'Ver mis autorregistros' })).toBeHidden();
  await hologram.getByText('Ver detalles', { exact: true }).click();
  const visionGuide = hologram.getByRole('list', { name: 'Qué puedes observar' });
  await expect(visionGuide.getByRole('listitem')).toHaveCount(3);
  await expect(visionGuide.getByText('Leer de cerca', { exact: true })).toBeVisible();
  await hologram.getByRole('button', { name: 'Ver mis autorregistros' }).click();
  await expect(health.getByRole('region', { name: 'Historial de autorregistros' })).toBeFocused();
  const selectors = telemetry.getByRole('group', { name: 'Indicadores de telemetría' });
  await expect(selectors.getByRole('button')).toHaveCount(4);
  await selectors.getByRole('button', { name: 'Respiración' }).click();
  await expect(
    telemetry.getByRole('img', { name: /Historial de Frecuencia respiratoria/ }),
  ).toBeVisible();
  await expect(page.locator('.crew-hologram')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver visión', exact: true }).click();
  await hologram.getByRole('button', { name: 'Cerrar ficha corporal' }).click();
  await expect(hologram).toHaveCount(0);

  await expect(health).toContainText('Sin autoevaluación registrada');
  await expect(health.getByRole('link', { name: 'Abrir autorregistro' })).toBeVisible();
  const visionField = health.getByRole('group', { name: /Qué estabas haciendo/ });
  await expect(visionField.getByRole('radio', { name: 'Sin indicar' })).toBeChecked();
  await visionField.getByText('Mirar a distancia', { exact: true }).click();
  await expect(visionField.getByRole('radio', { name: 'Mirar a distancia' })).toBeChecked();
  await visionField.getByRole('radio', { name: 'Sin indicar' }).check();

  await health.getByRole('button', { name: 'Revisar respuestas', exact: true }).click();
  await health.getByRole('button', { name: 'Guardar autorregistro', exact: true }).click();
  await expect(health.getByRole('status')).toContainText('guardado');
  await expect(health.locator('.health-history')).toContainText('No evaluado');
  await health.getByRole('button', { name: 'Ver mi registro', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Detalle del momento' })).toContainText(
    'No evaluado',
  );
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
  expect(journal.entries[0].visionActivityId).toBeUndefined();
  expect(
    await page.evaluate(() => localStorage.getItem('astra.demo.health.v1:odyssey')),
  ).toBeNull();
  await page.goto('/missions/selene/history');
  await page.getByRole('link', { name: 'Ver histórico de NASA' }).click();
  await expect(page).toHaveURL(/#nasa-history$/);
  const nasa = page.getByRole('region', { name: 'Historial real de Inspiration4' });
  await nasa.getByRole('button', { name: /^Sodio/ }).click();
  await nasa.getByRole('button', { name: /^L-92,/ }).click();
  await expect(nasa.getByRole('status', { name: 'Detalle de la muestra' })).toContainText(
    '140 mmol/L',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
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
    health.getByRole('button', { name: 'Revisar respuestas', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('group', { name: 'Lecturas de la instantánea' })
    .getByRole('button', { name: 'Temperatura', exact: true })
    .click();
  await expect(page.getByRole('complementary', { name: 'Temperatura corporal' })).toContainText(
    /36[.,]6/,
  );
  await expect(page.locator('.scene-reading')).toHaveCount(0);
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
  await failureHealth.getByRole('button', { name: 'Revisar respuestas', exact: true }).click();
  await failureHealth.getByRole('button', { name: 'Guardar autorregistro', exact: true }).click();
  await expect(failureHealth.getByRole('alert')).toContainText('No se pudo guardar');
  await expect(failureHealth.locator('.health-history li')).toHaveCount(0);
  await failurePage.close();
});

test('explicación visual por sistema: pasos, pausa y movimiento reducido', async ({ page }) => {
  await page.goto('/mission/crew');
  const health = page.getByRole('region', { name: 'Salud por sistemas', exact: true });
  const visual = health.locator('.health-visual');
  const explanation = health.getByText('Cómo interpretarlo y fuente científica', { exact: true });
  await explanation.click();
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

test('nave de Tripulación distingue la ubicación de Elena del módulo explorado', async ({
  page,
}) => {
  await page.goto('/mission/crew');
  const explorer = page.getByRole('region', { name: 'Explorador tridimensional' });
  await explorer.getByRole('button', { name: 'Nave', exact: true }).click();
  const panel = explorer.getByRole('complementary', { name: 'Contexto del módulo' });
  const rest = explorer.getByRole('button', { name: 'Explorar Hábitat de descanso', exact: true });
  const exercise = explorer.getByRole('button', {
    name: 'Explorar Módulo de ejercicio',
    exact: true,
  });
  const legend = explorer.getByRole('list', { name: 'Leyenda del visor' });
  await expect(legend).toContainText('Ubicación del tripulante');
  await expect(legend).toContainText('Módulo explorado');
  await expect(rest.locator('.crew-marker-occupancy')).toBeVisible();
  await expect(rest.locator('.crew-marker-selection')).toBeVisible();
  await expect(rest).toHaveAttribute('data-occupied', 'true');
  await expect(rest).toHaveAttribute('aria-pressed', 'true');
  await exercise.click();
  await expect(exercise.locator('.crew-marker-selection')).toBeVisible();
  await expect(rest.locator('.crew-marker-selection')).toHaveCount(0);
  await expect(rest).toHaveAccessibleDescription('Ubicación del tripulante');
  await expect(panel.getByRole('button', { name: 'Ver Hábitat de descanso' })).toHaveAttribute(
    'data-crew-location',
    'true',
  );
  await expect(exercise).toHaveAttribute('aria-pressed', 'true');
  await expect(rest).toHaveAttribute('data-occupied', 'true');
  await expect(panel.getByRole('heading', { name: 'Módulo de ejercicio' })).toBeVisible();
  await expect(panel).toContainText('Elena Torres');
  await expect(panel).toContainText('Hábitat de descanso · Descanso');
  await expect(panel).toContainText(/25[.,]6/);
  await expect(panel).toContainText('950');
  await expect(panel).toContainText('14:32 UTC');
  await expect(panel).toContainText('Ocupantes Mateo Silva');
  await explorer.getByRole('button', { name: 'Explorar Cabina de mando', exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'Cabina de mando' })).toBeVisible();
  await expect(panel).toContainText('710');
  await expect(panel).toContainText('Sin ocupantes');
  await expect(rest).toHaveAttribute('data-occupied', 'true');
  await panel.getByRole('button', { name: 'Ir a su módulo' }).click();
  await expect(rest).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('button', { name: 'Mateo Silva Especialista de misión', exact: true })
    .click();
  await expect(exercise).toHaveAttribute('data-occupied', 'true');
  await expect(exercise).toHaveAttribute('aria-pressed', 'true');
  await expect(panel).toContainText('Módulo de ejercicio · Ejercicio');
  await panel.getByRole('button', { name: 'Volver a la línea de tiempo' }).click();
  const timeline = page.getByRole('region', { name: 'Línea de tiempo', exact: true });
  await expect(timeline).toBeFocused();
  const moment = timeline.getByRole('region', { name: 'Detalle del momento' });
  await expect(moment).toContainText('Módulo de ejercicio');
  const telemetry = page.getByRole('region', { name: 'Tendencia de telemetría' });
  await telemetry.getByRole('button', { name: '14:18 UTC: 88 lpm', exact: true }).click();
  await expect(moment).toContainText('88 lpm');
  await expect(moment).toContainText('No hay ubicación, actividad ni lecturas ambientales');
  await expect(moment.getByRole('button', { name: 'Ubicar módulo en el visor' })).toHaveCount(0);
  await telemetry.getByRole('button', { name: '14:32 UTC: 108 lpm', exact: true }).click();
  await expect(moment).toContainText('108 lpm');
  await expect(moment).toContainText('14:32 UTC');
  await expect(moment).toContainText('950');
  await moment.getByRole('button', { name: 'Ubicar módulo en el visor' }).click();
  await expect(explorer).toBeFocused();
  await expect(exercise).toHaveAttribute('aria-pressed', 'true');
  await timeline.getByRole('button', { name: 'Comparar dos muestras' }).click();
  const comparison = timeline.getByRole('group', { name: 'Comparación de Frecuencia cardíaca' });
  await comparison
    .getByRole('combobox', { name: 'Primera muestra' })
    .selectOption('2026-11-08T14:18:00Z');
  await telemetry.getByRole('button', { name: '14:32 UTC: 108 lpm', exact: true }).click();
  const first = comparison.getByRole('region', { name: 'Primera muestra' });
  const second = comparison.getByRole('region', { name: 'Segunda muestra' });
  await expect(first).toContainText('88 lpm');
  await expect(first).toContainText('No hay ubicación');
  await expect(second).toContainText('108 lpm');
  await expect(second).toContainText('Módulo de ejercicio');
  await expect(second).toContainText('950');
  await expect(comparison.getByRole('status')).toContainText('+20 lpm');
  await second.getByRole('button', { name: 'Ubicar módulo en el visor' }).click();
  const origin = explorer.getByRole('region', { name: 'Origen en la línea de tiempo' });
  await expect(origin).toContainText('14:32 UTC');
  await expect(origin).toContainText('Frecuencia cardíaca');
  const camera = explorer.getByRole('group', { name: 'Encuadre del visor' });
  const markerSpread = () =>
    explorer.locator('.shuttle-marker').evaluateAll((markers) => {
      const positions = markers.map((marker) => marker.getBoundingClientRect().x);
      return Math.max(...positions) - Math.min(...positions);
    });
  await expect(camera).toBeVisible();
  await expect(explorer.locator('.shuttle-marker')).toHaveCount(5);
  const initialSpread = await markerSpread();
  await camera.getByRole('button', { name: 'Acercar al módulo' }).click();
  await expect.poll(markerSpread).toBeGreaterThan(initialSpread * 1.4);
  await camera.getByRole('button', { name: 'Ver nave completa' }).click();
  await expect.poll(async () => Math.abs((await markerSpread()) - initialSpread)).toBeLessThan(4);
  await panel.getByRole('button', { name: 'Ver Laboratorio' }).click();
  await expect(panel.getByRole('heading', { name: 'Laboratorio' })).toBeVisible();
  await expect(origin).toContainText('Módulo de ese momento · Módulo de ejercicio');
  await panel.getByRole('button', { name: 'Volver a la línea de tiempo' }).click();
  await expect(comparison.getByRole('status')).toContainText('+20 lpm');
  await telemetry.getByRole('button', { name: 'Temperatura', exact: true }).click();
  await expect(comparison).toHaveCount(0);
  await timeline.getByRole('button', { name: 'Comparar dos muestras' }).click();
  await expect(timeline.getByRole('combobox', { name: 'Primera muestra' })).toHaveValue('');
});

test('móvil sin WebGL permite consultar módulos y duración de las sesiones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, type: string, options?: unknown) {
        if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
        return Reflect.apply(getContext, this, [type, options]);
      },
    });
    localStorage.setItem(
      'astra.demo.health.v1:odyssey',
      JSON.stringify({
        version: 1,
        reviews: [],
        entries: [
          {
            id: 'bike',
            crewId: 'elena',
            systemId: 'fitness',
            reportedState: 'no-change',
            note: 'Sesión en bicicleta.',
            activity: 'Bicicleta',
            minutes: 20,
            recordedAt: '2026-11-07T10:00:00Z',
          },
          {
            id: 'resistance',
            crewId: 'elena',
            systemId: 'fitness',
            reportedState: 'no-change',
            note: 'Sesión con pesas.',
            activity: 'Pesas',
            minutes: 15,
            recordedAt: '2026-11-05T10:00:00Z',
          },
        ],
      }),
    );
  });
  await page.goto('/mission/crew');
  const explorer = page.getByRole('region', { name: 'Explorador tridimensional' });
  const timeline = page.getByRole('region', { name: 'Línea de tiempo', exact: true });
  const moment = timeline.getByRole('region', { name: 'Detalle del momento' });
  await timeline.getByRole('button', { name: /Bicicleta/ }).click();
  await expect(moment).toContainText('no tiene un módulo disponible');
  await timeline.getByRole('button', { name: /Descanso/ }).click();
  await moment.getByRole('button', { name: 'Ubicar módulo en el visor' }).click();
  await expect(
    explorer.getByRole('heading', { name: 'El visor 3D no está disponible' }),
  ).toBeVisible();
  await expect(explorer.getByRole('group', { name: 'Encuadre del visor' })).toHaveCount(0);
  await expect(
    explorer.getByRole('region', { name: 'Origen en la línea de tiempo' }),
  ).toContainText('14:32 UTC');
  const modulePanel = explorer.getByRole('complementary', { name: 'Contexto del módulo' });
  await modulePanel.getByRole('button', { name: 'Ver Laboratorio', exact: true }).click();
  await expect(modulePanel.getByRole('heading', { name: 'Laboratorio' })).toBeVisible();
  await expect(modulePanel).toContainText('780');
  await modulePanel.getByRole('button', { name: 'Ver Soporte vital', exact: true }).click();
  await expect(modulePanel.getByRole('heading', { name: 'Soporte vital' })).toBeVisible();
  await expect(modulePanel).toContainText('820');

  await explorer.getByRole('button', { name: 'Astronauta', exact: true }).click();
  await page.getByRole('button', { name: 'Ver ejercicio', exact: true }).click();
  const exercise = explorer.getByRole('complementary', { name: 'Ejercicio y aparato locomotor' });
  await exercise.getByText('Ver detalles', { exact: true }).click();
  const sessions = exercise.getByRole('group', { name: 'Minutos por sesión' });
  await sessions.getByRole('button', { name: /^Pesas/ }).click();
  await expect(sessions).toContainText('Sesión con pesas.');
  await expect(exercise.locator('figcaption')).toContainText('Equipo de resistencia');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await nav.getByRole('button', { name: 'Simulación', exact: true }).click();
  await page.getByRole('button', { name: /Pérdida de señal/ }).click();
  await nav.getByRole('button', { name: 'Tripulación', exact: true }).click();
  await page
    .getByRole('region', { name: 'Tendencia de telemetría' })
    .getByRole('button', { name: 'SpO₂', exact: true })
    .click();
  await timeline.getByRole('button', { name: 'Comparar dos muestras' }).click();
  await timeline
    .getByRole('combobox', { name: 'Primera muestra' })
    .selectOption('2026-11-08T14:18:00Z');
  await expect(
    timeline
      .getByRole('combobox', { name: 'Segunda muestra' })
      .locator('option[value="2026-11-08T14:18:00Z"]'),
  ).toBeDisabled();
  await timeline
    .getByRole('combobox', { name: 'Segunda muestra' })
    .selectOption('2026-11-08T14:32:00Z');
  await expect(timeline.getByRole('region', { name: 'Segunda muestra' })).toContainText(
    'Sin muestra',
  );
  await expect(timeline.getByRole('status')).toContainText('falta una lectura');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('la gráfica sincroniza el módulo conocido y oculta la ubicación sin contexto', async ({
  page,
}) => {
  await page.goto('/mission/crew');
  await page.getByRole('button', { name: /Mateo Silva/ }).click();
  const telemetry = page.getByRole('region', { name: 'Tendencia de telemetría' });
  const sync = telemetry.getByRole('button', { name: 'Sincronizar con el visor' });
  await sync.click();
  await expect(sync).toHaveAttribute('aria-pressed', 'true');
  const explorer = page.getByRole('region', { name: 'Explorador tridimensional' });
  const panel = explorer.getByRole('complementary', { name: 'Contexto del módulo' });
  const exerciseModule = panel.getByRole('button', {
    name: 'Ver Módulo de ejercicio',
    exact: true,
  });
  await expect(exerciseModule).toHaveAttribute('aria-pressed', 'true');
  await expect(panel).toContainText('14:32 UTC');
  const early = telemetry.getByRole('button', { name: '14:18 UTC: 88 lpm', exact: true });
  await early.click();
  await expect(early).toHaveAttribute('aria-pressed', 'true');
  await expect(panel).toContainText('No hay ubicación ni lecturas ambientales registradas');
  await expect(explorer.locator('[data-occupied="true"]')).toHaveCount(0);
  await expect(panel.getByText('CO₂')).toHaveCount(0);
  await telemetry.getByRole('button', { name: '14:32 UTC: 108 lpm', exact: true }).click();
  await expect(exerciseModule).toHaveAttribute('aria-pressed', 'true');
  await expect(panel).toContainText('950');
  await panel.getByRole('button', { name: 'Ver Laboratorio', exact: true }).click();
  await expect(sync).toHaveAttribute('aria-pressed', 'false');
  await expect(panel.getByRole('heading', { name: 'Laboratorio' })).toBeVisible();
});
