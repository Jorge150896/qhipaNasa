import { expect, test } from '@playwright/test';

test('Tripulación muestra el mes de cada persona y Tumi explica el día seleccionado', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto('/mission/crew/#crew-history');
  const report = page.getByRole('region', { name: 'Seguimiento de 30 días' });
  const day = report.getByRole('slider', { name: 'Día de la simulación' });
  await expect(report).toContainText('Elena Torres');
  await expect(report).toContainText('Cambios sostenidos');
  await expect(day).toHaveValue('30');
  await expect(report).toContainText('Días con ánimo bajo');
  await expect(report.getByRole('heading', { name: 'Cabina compartida' })).toBeVisible();

  await day.fill('23');
  await expect(report.getByRole('heading', { name: /Día 23/ })).toBeVisible();
  await expect(report.getByText('Sin muestra', { exact: true })).toBeVisible();
  await report.getByRole('button', { name: 'Preguntar a Tumi por este día' }).click();
  const chat = page.getByRole('region', { name: 'Tumi', exact: true });
  await expect(chat.getByRole('log')).toContainText('pidió hablar en privado esta semana');
  await expect(chat.getByRole('log')).toContainText('ánimo regular');
  await chat.getByRole('button', { name: 'Ocultar chat' }).click();

  await day.fill('30');
  await report.getByRole('button', { name: 'Preguntar a Tumi por este día' }).click();
  await expect(chat.getByRole('log')).toContainText('el ánimo podría seguir bajo');
  await expect(chat.getByRole('log')).toContainText('6 de los últimos 7 días');
  await expect(chat.getByRole('log')).toContainText('reservar un momento con el equipo de apoyo');
  await chat.getByRole('button', { name: 'Ocultar chat' }).click();

  await day.fill('3');
  await report.getByRole('button', { name: 'Preguntar a Tumi por este día' }).click();
  await expect(chat.getByRole('log')).toContainText('todavía estamos conociendo la rutina');
  await chat.getByRole('button', { name: 'Ocultar chat' }).click();

  await page.getByRole('button', { name: /Lucía Vega/ }).click();
  await expect(report).toContainText('Altibajos y recuperación');
  await expect(day).toHaveValue('30');
  await day.fill('13');
  await report.getByRole('combobox', { name: 'Indicador' }).selectOption('sleep');
  await expect(report.getByRole('status')).toContainText('6 h');
  await page.getByRole('button', { name: /Mateo Silva/ }).click();
  await expect(report).toContainText('Rutina estable');
  await expect(day).toHaveValue('30');
  await report.getByRole('button', { name: 'Preguntar a Tumi por este día' }).click();
  await expect(chat.getByRole('log')).toContainText('es posible que siga teniendo buenos días');
  await chat.getByRole('button', { name: 'Ocultar chat' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.goto('/missions/aurora/crew/#crew-history');
  await expect(page.getByRole('heading', { name: 'Historial y contexto' })).toBeVisible();
  await expect(report).toHaveCount(0);
});
