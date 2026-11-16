import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('astra.language.v1', 'es'));
});

test('Simulación marca la ruta por tripulante y día y abre tres destinos', async ({ page }) => {
  await page.goto('/mission/simulation');
  const routes = page.getByRole('region', { name: 'Ruta emocional' });
  await expect(page.getByText('Resultado del escenario', { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /Rutina de misión|Cambio en el descanso|Pérdida de señal/ }),
  ).toHaveCount(0);
  const active = routes.locator('li[aria-current="step"]');
  await expect(active).toContainText('Aquí está Elena');
  await expect(active).toContainText('Atención');
  await expect(routes.getByText(/Ubicación en la misión/)).toBeVisible();
  const astronaut = routes.locator('.simulation-routes__astronaut');
  const controls = routes.getByRole('group', { name: 'Simular un cambio de hábitos' });
  const tracks = routes.getByRole('list', { name: 'Rutas emocionales disponibles' });
  const flightEvidence = routes.getByRole('region', { name: 'Evidencia de vuelos reales' });
  const astronautBox = (await astronaut.boundingBox())!;
  const controlsBox = (await controls.boundingBox())!;
  const tracksBox = (await tracks.boundingBox())!;
  const recordBox = (await routes.locator('.simulation-routes__evidence').boundingBox())!;
  expect(astronautBox.y + astronautBox.height).toBeLessThan(recordBox.y);
  expect(recordBox.y + recordBox.height).toBeLessThan(controlsBox.y);
  expect(astronautBox.x).toBeCloseTo(controlsBox.x, 0);
  expect(controlsBox.x + controlsBox.width).toBeLessThan(tracksBox.x);
  const flightEvidenceBox = (await flightEvidence.boundingBox())!;
  expect(flightEvidenceBox.y).toBeGreaterThan(tracksBox.y + tracksBox.height);
  expect(flightEvidenceBox.x).toBeCloseTo(tracksBox.x, 0);
  await expect(flightEvidence.getByText('545 entradas', { exact: true })).toBeHidden();
  await flightEvidence.getByText('Ver evidencia de los diarios de la ISS').click();
  await expect(flightEvidence.getByText('545 entradas', { exact: true })).toBeVisible();

  await routes.getByLabel('Día simulado').selectOption('0');
  await expect(active).toContainText('Bienestar');

  await page.getByRole('button', { name: /Mateo Silva/ }).click();
  await expect(active).toContainText('Aquí está Mateo');
  await expect(active).toContainText('Bienestar');
  await routes.getByRole('button', { name: 'Ver su módulo' }).click();
  await expect(page).toHaveURL(/mission\/crew#crew-module$/);

  await page.goto('/mission/simulation');
  await page.getByRole('button', { name: /Lucía Vega/ }).click();
  await expect(active).toContainText('Aquí está Lucía');
  await expect(active).toContainText('Equilibrio');
  await routes.getByRole('button', { name: 'Abrir historial' }).click();
  await expect(page).toHaveURL(/mission\/crew#crew-history$/);
  await expect(page.getByRole('heading', { name: 'Seguimiento de 30 días' })).toBeVisible();

  await page.goto('/mission/simulation');
  await routes.getByRole('button', { name: 'Abrir monitoreo diario' }).click();
  await expect(page).toHaveURL(/mission\/journal$/);
});

test('Simulación en móvil conserva las rutas al recargar y avisa si falta la serie', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/missions/aurora/simulation');
  const routes = page.getByRole('region', { name: 'Ruta emocional' });
  await expect(routes.getByText(/aún no tiene una serie/)).toBeVisible();
  await expect(routes.locator('li[aria-current]')).toHaveCount(0);
  await page.reload();
  await expect(routes.getByRole('button', { name: 'Abrir historial' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Los hábitos de la prueba mueven un solo punto sin cambiar el autorregistro', async ({
  page,
}) => {
  await page.goto('/mission/simulation');
  const route = page.getByRole('region', { name: 'Ruta emocional' });
  const point = route.locator('[data-here]');
  const fields = ['Alimentación', 'Ejercicio', 'Contacto social'];
  await expect(point).toContainText('Necesita apoyo');
  for (const [value, emotion] of [
    ['supportive', 'Feliz'],
    ['usual', 'Habitual'],
    ['reduced', 'Triste'],
  ]) {
    for (const label of fields)
      await route.getByRole('combobox', { name: label, exact: true }).selectOption(value);
    await expect(point).toHaveCount(1);
    await expect(point).toContainText(emotion);
    await expect(
      route.locator('.simulation-routes__evidence').getByText(/Ánimo:\s*Bajo/),
    ).toBeVisible();
  }
  await route.getByRole('button', { name: 'Restablecer hábitos' }).click();
  await expect(point).toContainText('Necesita apoyo');
});

test('reproduce los 30 días en 6 segundos y sincroniza la línea con el autorregistro', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speaking: false,
        pending: false,
        getVoices: () => [],
        speak(utterance: SpeechSynthesisUtterance) {
          if (utterance.text.startsWith('En el mes simulado')) {
            const dataset = document.documentElement.dataset;
            dataset.monthNarrations = String(Number(dataset.monthNarrations ?? '0') + 1);
            dataset.monthNarration = utterance.text;
            utterance.dispatchEvent(new Event('start'));
            if (dataset.monthNarrations === '1') {
              document.addEventListener(
                'advance-month-summary',
                () => {
                  utterance.dispatchEvent(
                    Object.assign(new Event('boundary'), {
                      name: 'word',
                      charIndex: utterance.text.indexOf('También pidió'),
                    }),
                  );
                },
                { once: true },
              );
              document.addEventListener(
                'finish-month-summary',
                () => {
                  utterance.dispatchEvent(new Event('end'));
                },
                { once: true },
              );
              return;
            }
          } else {
            utterance.dispatchEvent(new Event('start'));
          }
          queueMicrotask(() => utterance.dispatchEvent(new Event('end')));
        },
        cancel() {},
      },
    });
  });
  const start = new Date('2026-11-15T12:00:00Z');
  await page.clock.install({ time: start });
  await page.goto('/mission/simulation');
  const timeline = page.getByRole('region', { name: 'Línea de tiempo emocional' });
  const day = page.getByRole('combobox', { name: 'Día simulado' });
  const scrubber = timeline.getByRole('slider', { name: 'Día de la línea de tiempo' });
  const marker = timeline.locator('.wellbeing-timeline__marker');
  const routes = page.getByRole('list', { name: 'Rutas emocionales disponibles' });
  const record = page.getByRole('heading', { name: 'Autorregistro del día' }).locator('..');
  const summary = page.getByRole('region', { name: 'Resumen de Nami' });
  await expect(day).toHaveValue('29');
  await expect(summary).toHaveCount(0);
  await expect(timeline).toContainText('30 días en 6 segundos');
  await expect(marker).toHaveCSS('background-image', /timeline-rocket\.webp/);
  expect((await page.request.get('/brand/timeline-rocket.webp')).ok()).toBe(true);
  await page.clock.pauseAt(new Date(start.getTime() + 30_000));

  await timeline.getByRole('button', { name: 'Reproducir mes' }).click();
  await expect(day).toHaveValue('0');
  await expect(scrubber).toHaveValue('0');
  await expect(marker).toHaveAttribute('data-route', 'routine');
  await expect(routes.locator('[aria-current="step"]')).toHaveAttribute('data-route', 'routine');
  await expect(record).toContainText('7.2 h');

  await page.clock.fastForward(621);
  await expect(day).toHaveValue('3');
  await expect(scrubber).toHaveValue('3');
  await expect(marker).toHaveAttribute('data-route', 'adjustment');
  await expect(marker).toHaveCSS('rotate', '62deg');
  await expect(routes.locator('[aria-current="step"]')).toHaveAttribute('data-route', 'adjustment');
  await timeline.getByRole('button', { name: 'Pausar mes' }).click();
  await page.clock.fastForward(10_000);
  await expect(day).toHaveValue('3');

  await timeline.getByRole('button', { name: 'Continuar mes' }).click();
  await page.clock.fastForward(5_378);
  await expect(day).toHaveValue('28');
  await expect(summary).toHaveCount(0);
  await page.clock.runFor(1);
  await expect(day).toHaveValue('29');
  await expect(routes.locator('[aria-current="step"]')).toHaveAttribute('data-route', 'support');
  await expect(record).toContainText('5.2 h');
  const balloon = summary.locator('.simulation-narration__bubble');
  const portrait = summary.locator('.simulation-narration__avatar > svg');
  await expect(summary).toHaveAttribute('data-speaking', 'true');
  await expect(portrait).toHaveAttribute('data-tumi-emotion', 'curious');
  expect((await portrait.boundingBox())?.width).toBeGreaterThan(255);
  await expect(balloon.locator('[data-visible="true"]')).toHaveCount(1);
  await expect(balloon.locator('strong').first().locator('span').first()).toBeHidden();
  await page.evaluate(() => document.dispatchEvent(new Event('advance-month-summary')));
  await expect(balloon.locator('p').first().getByText('También', { exact: true })).toBeVisible();
  await expect(portrait).toHaveAttribute('data-tumi-emotion', 'worried');
  await expect(balloon.locator('strong').first().locator('span').first()).toBeHidden();
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.dispatchEvent(new Event('finish-month-summary')));
  await expect(summary).toHaveAttribute('data-speaking', 'false');
  await expect(portrait).toHaveAttribute('data-tumi-emotion', 'happy');
  await expect(summary).toContainText('Elena Torres empezó en Bienestar y terminó en Atención');
  await expect(summary).toContainText('ánimo bajo en 6 de los últimos 7 días');
  await expect(summary.getByText('Para Elena', { exact: true })).toBeVisible();
  await expect(
    summary.getByText('Para quienes interactúan con Elena', { exact: true }),
  ).toBeVisible();
  await expect(summary).toContainText('pide un momento privado para hablar');
  await expect(summary).toContainText('evita minimizar lo que cuenta');
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-month-narration', /El día 18 pasó a Atención/);
  await expect(root).toHaveAttribute(
    'data-month-narration',
    /Para Elena.*pide un momento privado para hablar.*Para quienes interactúan con Elena.*evita minimizar lo que cuenta/,
  );
  await expect(root).toHaveAttribute('data-month-narrations', '1');
  await expect(summary.getByRole('button', { name: 'Ver resumen' })).toBeVisible();
  await expect(balloon).toHaveCount(0);
  await summary.getByRole('button', { name: 'Ver resumen' }).click();
  await expect(balloon.getByText('Para Elena', { exact: true })).toBeVisible();
  await summary.getByRole('button', { name: 'Escuchar resumen' }).click();
  await expect(root).toHaveAttribute('data-month-narrations', '2');

  await timeline.getByRole('button', { name: 'Reiniciar mes' }).click();
  await expect(scrubber).toHaveValue('0');
  await day.selectOption('9');
  await page.clock.fastForward(5_000);
  await expect(scrubber).toHaveValue('9');
  await day.selectOption('29');
  await expect(summary).toHaveCount(0);
  await expect(root).toHaveAttribute('data-month-narrations', '2');
  await day.selectOption('9');
  await expect(timeline.getByRole('button', { name: 'Continuar mes' })).toBeVisible();
});
