/** Portable measurement metadata. Values describe observations, not diagnoses. */
export interface MeasurementDefinition {
  readonly indicator: string;
  readonly unit: string;
}
export type MeasurementTime =
  | { readonly kind: 'instant'; readonly at: string }
  | { readonly kind: 'phase'; readonly phase: string };
export type MeasurementSubject =
  | { readonly kind: 'individual'; readonly id: string }
  | {
      readonly kind: 'group';
      readonly id: string;
      readonly sampleCount: number;
      readonly statistic: 'median' | 'mean';
    };
export interface MeasurementSource {
  readonly kind: 'synthetic' | 'device' | 'self-report' | 'research';
  readonly id: string;
  readonly reference?: string;
}
export interface HealthMeasurement {
  readonly id: string;
  readonly indicator: string;
  readonly value: number | null;
  readonly unit: string;
  readonly time: MeasurementTime;
  readonly subject: MeasurementSubject;
  readonly source: MeasurementSource;
  readonly method: 'simulated' | 'instrument' | 'self-report' | 'derived' | 'unspecified';
  readonly quality: 'available' | 'stale' | 'missing';
  readonly context?: {
    readonly capturedAt: string;
    readonly activity: string;
    readonly location: string;
  };
}
export const telemetryDefinitions = {
  heartRate: { indicator: 'heartRate', unit: 'lpm' },
  temperature: { indicator: 'temperature', unit: '°C' },
  oxygen: { indicator: 'oxygen', unit: '%' },
  respiration: { indicator: 'respiration', unit: 'rpm' },
} as const satisfies Record<string, MeasurementDefinition>;

export class MeasurementValidationError extends Error {}

function validInstant(value: string) {
  const parts =
    /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/.exec(
      value,
    );
  if (!parts || !Number.isFinite(Date.parse(value))) return false;
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= new Date(Date.UTC(Number(parts[1]), month, 0)).getUTCDate()
  );
}

export function createHealthMeasurement(
  input: HealthMeasurement,
  definition: MeasurementDefinition,
): HealthMeasurement {
  if (!input.id.trim() || !input.subject.id.trim() || !input.source.id.trim())
    throw new MeasurementValidationError('La medición necesita identidad, sujeto y procedencia.');
  if (input.indicator !== definition.indicator || input.unit !== definition.unit)
    throw new MeasurementValidationError('El indicador y la unidad no corresponden al contrato.');
  if (
    input.quality === 'missing'
      ? input.value !== null
      : input.value === null || !Number.isFinite(input.value)
  )
    throw new MeasurementValidationError('La calidad y el valor de la muestra no son coherentes.');
  if (input.time.kind === 'instant' ? !validInstant(input.time.at) : !input.time.phase.trim())
    throw new MeasurementValidationError(
      'Indica una fecha con zona horaria o una fase documentada.',
    );
  if (input.context && !validInstant(input.context.capturedAt))
    throw new MeasurementValidationError('El contexto necesita su propia fecha de captura.');
  if (
    input.subject.kind === 'group' &&
    (!Number.isInteger(input.subject.sampleCount) || input.subject.sampleCount < 1)
  )
    throw new MeasurementValidationError('Un resultado agregado necesita su cantidad de muestras.');
  if ((input.source.kind === 'synthetic') !== (input.method === 'simulated'))
    throw new MeasurementValidationError(
      'Una simulación debe conservar su origen y método explícitos.',
    );
  if (input.source.kind === 'self-report' && input.method !== 'self-report')
    throw new MeasurementValidationError(
      'Un autorregistro no se presenta como una medición instrumental.',
    );
  return Object.freeze({
    ...input,
    time: Object.freeze({ ...input.time }),
    subject: Object.freeze({ ...input.subject }),
    source: Object.freeze({ ...input.source }),
    context: input.context ? Object.freeze({ ...input.context }) : undefined,
  });
}
