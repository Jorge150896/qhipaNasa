import { expect, test } from '@playwright/test';
import { openTumiChat } from './tumi-chat-helpers';

test('Tumi está disponible desde misión y conserva el chat entre pestañas del mapa', async ({
  page,
}) => {
  await page.goto('/mission/crew');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await nav.getByRole('button', { name: 'Mapa espacial' }).click();
  await expect(page).toHaveURL(/\/explore/);

  await expect(
    page.getByRole('banner').getByRole('button', { name: 'Abrir chat de Tumi' }),
  ).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Abrir chat de Tumi' })).toHaveCount(0);
  await openTumiChat(page);
  const chat = page.getByRole('region', { name: 'Tumi' });
  await chat.getByRole('button', { name: '¿Cómo uso el mapa espacial?' }).click();
  await expect(chat.getByRole('log')).toContainText('selecciona un destino');
  await chat.getByRole('button', { name: 'Ocultar chat' }).click();
  await expect(
    page.getByRole('button', { name: 'Abrir asistente Tumi', exact: true }),
  ).toBeFocused();

  await page.getByRole('tab', { name: 'Mapa de Marte' }).click();
  await expect(page).toHaveURL(/tab=mars/);
  await page.getByRole('tab', { name: 'Centros en Tierra' }).click();
  await expect(page).toHaveURL(/tab=earth/);
  await openTumiChat(page);
  await expect(chat.getByRole('log')).toContainText('selecciona un destino');
  await chat.getByRole('button', { name: '¿Dónde están los centros en Tierra?' }).click();
  await expect(chat.getByRole('log')).toContainText('pestaña Centros en Tierra');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(
    page.getByRole('banner').getByRole('button', { name: 'Abrir chat de Tumi' }),
  ).toHaveCount(0);
  await openTumiChat(page);
  await expect(chat).toBeVisible();
  await chat.getByRole('textbox').fill('¿Cuál es el alcance de los datos?');
  await chat.getByRole('button', { name: 'Enviar' }).click();
  await chat.getByRole('button', { name: 'Ver Fuentes y alcance' }).click();
  await expect(page).toHaveURL('/mission/sources');
  await expect(page.getByRole('region', { name: 'Origen de los datos' })).toBeVisible();
});
