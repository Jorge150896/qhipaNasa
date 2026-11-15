import {
  activityFields,
  type ActivityField,
  type DailyActivity,
  type DailyMoment,
} from '@/domain/mission/dailyCheckContext';
import type { IconName } from '@/ui/Icon';
import { healthSystems, reportedStateLabels } from '../crew-health/constants';
import { visionActivities } from '../crew-health/visionActivities';
import type { CheckFormValues, MissionData } from '../mission/types';
import { mapDailyCheckAttachment } from './mapDailyCheckAttachment';

export const activities = {
  cabin: { label: 'Rutina en cabina', icon: 'orbit' },
  exercise: { label: 'Ejercicio', icon: 'activity' },
  surface: { label: 'Recorrido de superficie', icon: 'clock' },
  eva: { label: 'Caminata espacial EVA', icon: 'rocket' },
} satisfies Record<DailyActivity, { label: string; icon: IconName }>;

export const moments = {
  before: 'Antes',
  after: 'Después',
  incident: 'Incidencia durante la actividad',
};
export const durationLabels = {
  before: 'Duración prevista',
  after: 'Duración realizada',
  incident: 'Duración transcurrida',
};
export const regions = {
  none: 'Sin molestias',
  head: 'Cabeza',
  torso: 'Torso',
  arms: 'Brazos',
  hands: 'Manos',
  legs: 'Piernas',
  feet: 'Pies',
  other: 'Otra región',
};
export const fields = {
  waterMl: { label: 'Agua registrada', unit: 'mL' },
  restInterruptions: { label: 'Número de interrupciones del descanso', unit: '' },
  durationMinutes: { label: 'Duración', unit: 'min' },
  effort: { label: 'Esfuerzo percibido', unit: '/ 10' },
  distanceKm: { label: 'Distancia', unit: 'km' },
  handDiscomfort: { label: 'Molestias en manos', unit: '/ 5' },
};
export const exerciseLabel = (value?: boolean) =>
  value === undefined ? 'Sin responder' : value ? 'Sí' : 'No';

export function describeHealthReport(report: CheckFormValues['healthReport']) {
  if (!report) return [];
  const system = healthSystems.find(({ id }) => report.systemId === id);
  const visual = visionActivities.find(({ id }) => report.visionActivityId === id);
  return [
    {
      label: system?.shortLabel ?? 'Área de salud',
      value: reportedStateLabels[report.reportedState],
    },
    ...(visual ? [{ label: 'Actividad visual', value: visual.label }] : []),
  ];
}

export function fieldLabel(field: ActivityField, moment: DailyMoment) {
  return field === 'durationMinutes' ? durationLabels[moment] : fields[field].label;
}

function describeContext(context: NonNullable<CheckFormValues['context']>) {
  return activityFields[context.activity].flatMap((key) => {
    const value = context.measurements[key];
    return value === undefined
      ? []
      : [
          {
            label: fieldLabel(key, context.moment),
            value: `${value} ${fields[key].unit}`.trim(),
          },
        ];
  });
}

export function describeDailyCheck(check: MissionData['checks'][number]) {
  return {
    ...check,
    contextLabel: check.context
      ? `${activities[check.context.activity].label} · ${moments[check.context.moment]}`
      : undefined,
    savedAttachment: mapDailyCheckAttachment(check.attachment),
    details: [
      { label: 'Ejercicio realizado', value: exerciseLabel(check.exerciseDone) },
      ...describeHealthReport(check.healthReport),
      ...(check.discomfortRegion
        ? [{ label: 'Región con molestias', value: regions[check.discomfortRegion] }]
        : []),
      ...(check.context ? describeContext(check.context) : []),
    ],
  };
}
