import { useRef, useState } from 'react';
import {
  activityFields,
  activityFieldLimits,
  dailyActivities,
  dailyMoments,
  discomfortRegions,
  type ActivityField,
  type DailyActivity,
  type DailyMoment,
  type DiscomfortRegion,
} from '@/domain/mission/dailyCheckContext';
import { reportedStates, type HealthSystemId, type VisionActivityId } from '@/domain/health/models';
import { healthSystems, reportedStateLabels } from '../crew-health/constants';
import { visionActivities } from '../crew-health/visionActivities';
import { mapDailyCheckAttachment } from './mapDailyCheckAttachment';
import type { IconName } from '@/ui/Icon';
import type { CheckFormValues, MissionData } from '../mission/types';
import type { DailyCheckScreenProps } from './types';

const activities = {
  cabin: { label: 'Rutina en cabina', icon: 'orbit' },
  exercise: { label: 'Ejercicio', icon: 'activity' },
  surface: { label: 'Recorrido de superficie', icon: 'clock' },
  eva: { label: 'Caminata espacial EVA', icon: 'rocket' },
} satisfies Record<DailyActivity, { label: string; icon: IconName }>;

const moments = { before: 'Antes', after: 'Después', incident: 'Incidencia durante la actividad' };
const durationLabels = {
  before: 'Duración prevista',
  after: 'Duración realizada',
  incident: 'Duración transcurrida',
};
const regions = {
  none: 'Sin molestias',
  head: 'Cabeza',
  torso: 'Torso',
  arms: 'Brazos',
  hands: 'Manos',
  legs: 'Piernas',
  feet: 'Pies',
  other: 'Otra región',
};
const fields = {
  waterMl: { label: 'Agua registrada', unit: 'mL' },
  restInterruptions: { label: 'Número de interrupciones del descanso', unit: '' },
  durationMinutes: { label: 'Duración', unit: 'min' },
  effort: { label: 'Esfuerzo percibido', unit: '/ 10' },
  distanceKm: { label: 'Distancia', unit: 'km' },
  handDiscomfort: { label: 'Molestias en manos', unit: '/ 5' },
};
const moods = { good: 'Bien', neutral: 'Regular', low: 'Bajo' };
const tumiReplies = {
  good: '¡Qué gusto! ¿Hubo algo que te hizo sonreír hoy?',
  neutral: 'Gracias por contármelo. Puedes dejar una nota si quieres recordar algo de hoy.',
  low: 'Gracias por decírmelo. Podemos ir con calma. Si quieres, cuéntame qué fue difícil.',
};
const empty: CheckFormValues = { sleep: '', fatigue: '', note: '' };
const exerciseLabel = (value?: boolean) =>
  value === undefined ? 'Sin responder' : value ? 'Sí' : 'No';

function describeHealthReport(report: CheckFormValues['healthReport']) {
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

function fieldLabel(field: ActivityField, moment: DailyMoment) {
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

export function useDailyCheckViewModel(data: MissionData, onSave: DailyCheckScreenProps['onSave']) {
  const [step, setStep] = useState(0);
  const [activity, setActivity] = useState<DailyActivity | undefined>(
    data.dailyCheckDraft?.context?.activity,
  );
  const [moment, setMoment] = useState<DailyMoment | undefined>(
    data.dailyCheckDraft?.context?.moment,
  );
  const [values, setValues] = useState(data.dailyCheckDraft ?? empty);
  const [measurements, setMeasurements] = useState<Partial<Record<ActivityField, string>>>(() =>
    Object.fromEntries(
      Object.entries(data.dailyCheckDraft?.context?.measurements ?? {}).map(([key, value]) => [
        key,
        String(value),
      ]),
    ),
  );
  const [region, setRegion] = useState<DiscomfortRegion | ''>(
    data.dailyCheckDraft?.discomfortRegion ?? '',
  );
  const [healthArea, setHealthArea] = useState<HealthSystemId | ''>(
    data.dailyCheckDraft?.healthReport?.systemId ?? '',
  );
  const [attachment] = useState(data.dailyCheckDraft?.attachment ?? data.checkAttachment);
  const [failed, setFailed] = useState(false);
  const pending = useRef(false);

  const measurementsForm =
    activity && moment
      ? activityFields[activity].map((key) => ({
          key,
          label: fieldLabel(key, moment),
          unit: fields[key].unit,
          max: Number.isFinite(activityFieldLimits[key].max)
            ? activityFieldLimits[key].max
            : undefined,
          integer: activityFieldLimits[key].integer,
          value: measurements[key] ?? '',
        }))
      : [];

  const context =
    activity && moment
      ? {
          activity,
          moment,
          measurements: Object.fromEntries(
            measurementsForm
              .filter(({ value }) => value.trim() !== '')
              .map(({ key, value }) => [key, Number(value)]),
          ),
        }
      : undefined;

  const healthReport =
    values.healthReport?.systemId === healthArea ? values.healthReport : undefined;

  return {
    step,
    activity,
    moment,
    values,
    region,
    failed,
    activities: dailyActivities.map((id) => ({ id, ...activities[id] })),
    moments: dailyMoments.map((id) => ({ id, label: moments[id] })),
    regions: discomfortRegions.map((id) => ({ id, label: regions[id] })),
    moods,
    tumiReply: values.mood
      ? tumiReplies[values.mood]
      : 'Estoy aquí para escucharte. ¿Cómo te sientes hoy?',
    measurementsForm,
    attachment: mapDailyCheckAttachment(attachment),
    healthArea,
    healthAreas: healthSystems.map(({ id, shortLabel }) => ({ id, label: shortLabel })),
    healthReport,
    visionActivities,
    reportedStateLabels,
    reportedStates,
    selectHealthArea(id: HealthSystemId | '') {
      if (id !== healthArea) {
        setHealthArea(id);
        setValues((current) => ({ ...current, healthReport: undefined }));
      }
    },
    selectHealthState(state: NonNullable<CheckFormValues['healthReport']>['reportedState'] | '') {
      setValues((current) => ({
        ...current,
        healthReport:
          state && healthArea
            ? {
                systemId: healthArea,
                reportedState: state,
                visionActivityId:
                  state === 'change' ? current.healthReport?.visionActivityId : undefined,
              }
            : undefined,
      }));
    },
    selectVisionActivity(id?: VisionActivityId) {
      setValues((current) =>
        current.healthReport?.systemId === 'vision'
          ? {
              ...current,
              healthReport: { ...current.healthReport, visionActivityId: id },
            }
          : current,
      );
    },
    review: context
      ? [
          { label: 'Actividad', value: activities[context.activity].label },
          { label: 'Momento', value: moments[context.moment] },
          { label: 'Sueño', value: `${values.sleep} h` },
          { label: 'Fatiga', value: values.fatigue ? `${values.fatigue} / 5` : 'Sin responder' },
          { label: 'Ánimo', value: values.mood ? moods[values.mood] : 'Sin responder' },
          { label: '¿Hiciste ejercicio hoy?', value: exerciseLabel(values.exerciseDone) },
          ...describeHealthReport(healthReport),
          { label: 'Región con molestias', value: region ? regions[region] : 'Sin informar' },
          ...measurementsForm.map(({ label, value, unit }) => ({
            label,
            value: value.trim() === '' ? 'Sin registrar' : `${value} ${unit}`.trim(),
          })),
          { label: 'Nota', value: values.note.trim() || 'Sin informar' },
        ]
      : [],
    checks: data.checks.map((check) => ({
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
    })),
    selectActivity(id: DailyActivity) {
      if (activity !== id) setMeasurements({});
      setActivity(id);
    },
    selectMoment(id: DailyMoment) {
      if (moment !== id) setMeasurements((current) => ({ ...current, durationMinutes: undefined }));
      setMoment(id);
    },
    setValues,
    setRegion,
    setMeasurement(key: ActivityField, value: string) {
      setMeasurements((current) => ({ ...current, [key]: value }));
    },
    back() {
      if (!pending.current) {
        setFailed(false);
        setStep(Math.max(0, step - 1));
      }
    },
    async advance() {
      if (!context || pending.current) return;
      if (step < 2) {
        setStep(step + 1);
        return;
      }
      if (step !== 2) return;
      pending.current = true;
      setFailed(false);
      try {
        if (
          await onSave({
            ...values,
            context,
            healthReport,
            attachment,
            discomfortRegion: region || undefined,
          })
        )
          setStep(3);
        else setFailed(true);
      } catch {
        setFailed(true);
      } finally {
        pending.current = false;
      }
    },
    edit() {
      setStep(0);
    },
  };
}
