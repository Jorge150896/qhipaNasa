import type { AppLanguage } from '@/domain/assistant/AppLanguage';
import type { HealthMeasurement } from '@/domain/measurements/HealthMeasurement';
const sources = {
  synthetic: 'Sintético',
  device: 'Equipo de medición',
  'self-report': 'Autorregistro',
  research: 'Estudio de investigación',
};
const methods = {
  simulated: 'Simulación determinista',
  instrument: 'Medición instrumental',
  'self-report': 'Respuesta del usuario',
  derived: 'Valor calculado',
  unspecified: 'Método no documentado',
};
export function mapMeasurementTrace(
  measurement: HealthMeasurement,
  person: { id: string; name: string },
  language: AppLanguage = 'es',
) {
  const dateTime = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-PE', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'UTC',
    hourCycle: 'h23',
  });
  const timestamp = (at: string) => `${dateTime.format(new Date(at))} UTC`;
  return {
    source: sources[measurement.source.kind],
    quality: {
      available: 'Muestra disponible',
      stale: 'Lectura antigua',
      missing: 'Muestra ausente',
    }[measurement.quality],
    fields: [
      { label: 'Identificador de muestra', value: measurement.id },
      {
        label: 'Persona o grupo',
        value:
          measurement.subject.kind === 'individual'
            ? measurement.subject.id === person.id
              ? person.name
              : measurement.subject.id
            : `${measurement.subject.id} · ${measurement.subject.sampleCount} muestras · ${measurement.subject.statistic}`,
      },
      {
        label: 'Fecha de la muestra',
        value:
          measurement.time.kind === 'instant'
            ? timestamp(measurement.time.at)
            : `Fase del estudio: ${measurement.time.phase}`,
      },
      { label: 'Método', value: methods[measurement.method] },
      { label: 'Unidad original', value: measurement.unit },
      { label: 'Fuente', value: measurement.source.id },
      ...(measurement.source.reference
        ? [{ label: 'Referencia de origen', value: measurement.source.reference }]
        : []),
      ...(measurement.context
        ? [
            {
              label: 'Contexto de la instantánea',
              value: `${measurement.context.activity} · ${measurement.context.location} · ${timestamp(measurement.context.capturedAt)}. Este contexto no confirma la actividad durante cada muestra histórica.`,
            },
          ]
        : []),
    ],
  };
}
