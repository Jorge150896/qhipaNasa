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
import type { IconName } from '@/ui/Icon';
import type { CheckFormValues, MissionData, SensorKey } from '../mission/types';
import type { DailyCheckScreenProps } from './types';

const activities = {
  cabin: { label: 'Rutina en cabina', icon: 'orbit', sensors: ['temperature', 'respiration'] },
  exercise: {
    label: 'Ejercicio',
    icon: 'activity',
    sensors: ['heartRate', 'respiration', 'temperature'],
  },
  surface: {
    label: 'Recorrido de superficie',
    icon: 'clock',
    sensors: ['heartRate', 'temperature', 'oxygen'],
  },
  eva: {
    label: 'Caminata espacial EVA',
    icon: 'rocket',
    sensors: ['heartRate', 'oxygen', 'respiration'],
  },
} satisfies Record<DailyActivity, { label: string; icon: IconName; sensors: SensorKey[] }>;

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
const empty: CheckFormValues = { sleep: '', fatigue: '2', mood: 'neutral', note: '' };

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

  const sensorIds: readonly SensorKey[] = activity ? activities[activity].sensors : [];

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
    measurementsForm,
    telemetry: data.selected.metrics.filter(({ id }) => sensorIds.includes(id)),
    review: context
      ? [
          { label: 'Actividad', value: activities[context.activity].label },
          { label: 'Momento', value: moments[context.moment] },
          { label: 'Sueño', value: `${values.sleep} h` },
          { label: 'Fatiga', value: `${values.fatigue} / 5` },
          { label: 'Ánimo', value: moods[values.mood] },
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
      details: [
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
        if (await onSave({ ...values, context, discomfortRegion: region || undefined })) setStep(3);
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
