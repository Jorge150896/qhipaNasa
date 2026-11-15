import type { DailyCheckAttachment } from '@/domain/mission/dailyCheckAttachment';
import { metricLabels } from '../mission/constants';

const date = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h23',
  timeZone: 'UTC',
});
const number = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
const gravity = {
  microgravity: 'Microgravedad de referencia',
  lunar: 'Gravedad parcial lunar de referencia',
  martian: 'Gravedad parcial marciana de referencia',
};
const quality = {
  available: 'Disponible en el escenario',
  stale: 'Lectura anterior',
  missing: 'Sin lectura en el escenario',
};

export function mapDailyCheckAttachment(attachment?: DailyCheckAttachment) {
  if (!attachment) return;
  const { zone } = attachment;
  return {
    timestamp: `${date.format(new Date(attachment.capturedAt))} UTC`,
    environment: [
      { label: 'Hábitat', value: attachment.habitat },
      { label: 'Módulo', value: zone?.name ?? 'Sin dato' },
      { label: 'Gravedad', value: gravity[attachment.gravity] },
      {
        label: 'Temperatura de cabina',
        value: zone ? `${number.format(zone.temperature)} °C` : 'Sin dato',
      },
      { label: 'CO₂', value: zone ? `${number.format(zone.co2)} ppm` : 'Sin dato' },
      { label: 'Humedad', value: zone ? `${number.format(zone.humidity)} %` : 'Sin dato' },
    ],
    readings: attachment.readings.map((reading) => ({
      label: metricLabels[reading.id].label,
      value:
        reading.value === null ? 'Sin dato' : `${number.format(reading.value)} ${reading.unit}`,
      detail: [
        quality[reading.quality],
        reading.at ? `${date.format(new Date(reading.at))} UTC` : 'Sin hora de muestra',
      ].join(' · '),
    })),
  };
}
