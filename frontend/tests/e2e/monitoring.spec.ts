import { expect, test } from '@playwright/test';

for (const route of ['/mission', '/missions/aurora']) {
  test(`el acceso anterior ${route} abre el único formulario de monitoreo diario`, async ({
    page,
  }) => {
    await page.goto(`${route}/monitoring/`);
    await expect(page).toHaveURL(new RegExp(`${route}/journal/?$`));
    await expect(
      page.getByRole('heading', { name: 'Monitoreo diario', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Llenar a mano' }).click();
    await expect(page.locator('main form')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { name: 'Lecturas del cuerpo y del entorno' }),
    ).toBeVisible();
    await expect(page.getByText('Frecuencia cardíaca', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preparar captura' })).toHaveCount(0);
  });
}

test('las sesiones anteriores conservan sus lecturas y contexto en Tripulación', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const at = '2026-11-08T14:32:00Z';
    localStorage.setItem(
      'astra.monitoring.v1:odyssey',
      JSON.stringify({
        version: 1,
        sessions: [
          {
            id: 'demo-session',
            subjectId: 'elena',
            subjectLabel: 'Elena Torres',
            mode: 'demo',
            context: {
              activity: 'eva',
              phase: 'after',
              location: 'Cabina',
              equipment: 'Traje de prueba 01',
            },
            attempts: [
              {
                id: 'capture-1',
                receivedAt: at,
                measurements: [
                  {
                    id: 'reading-1',
                    indicator: 'heartRate',
                    value: 72,
                    unit: 'lpm',
                    time: { kind: 'instant', at },
                    subject: { kind: 'individual', id: 'elena' },
                    source: { kind: 'synthetic', id: 'Demo asistida' },
                    method: 'simulated',
                    quality: 'available',
                  },
                ],
              },
            ],
            note: 'Verificar colocación del sensor.',
            savedAt: at,
          },
        ],
      }),
    );
  });
  await page.goto('/mission/crew/#crew-history');
  const activity = page.getByRole('region', { name: 'Actividad guardada' });
  await activity.getByText(/Sesión de monitoreo · Sintético/).click();
  await expect(activity).toContainText('Traje de prueba 01');
  await expect(activity).toContainText('Verificar colocación del sensor');
  await expect(activity).toContainText('Frecuencia cardíaca: 72 lpm');
  await expect(activity).toContainText('muestra reading-1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
