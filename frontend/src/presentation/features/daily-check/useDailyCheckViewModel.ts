import type { TumiEmotion } from '@/presentation/shared/tumi/TumiTechPortrait';
import { tumiWellbeingReplies } from '@/domain/assistant/tumiWellbeing';
import type { TumiReplyAudio } from '@/presentation/shared/tumi/useTumiReplyAudio';
import { useEffect, useRef, useState } from 'react';
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
const tumiExpressions = {
  greeting: ['greeting', 'happy', 'curious'],
  result: ['approved', 'happy', 'understanding'],
  good: ['joy', 'happy', 'curious'],
  neutral: ['thinking', 'understanding', 'curious'],
  low: ['worried', 'understanding', 'neutral'],
} satisfies Record<string, TumiEmotion[]>;
const greeting = 'Estoy aquí para escucharte. ¿Cómo te sientes hoy?';
const spokenNumber = new Intl.NumberFormat('es');
const spokenMoments = {
  before: 'antes de la actividad',
  after: 'después de la actividad',
  incident: 'durante una incidencia',
};

function describeSavedCheck(
  name: string,
  values: CheckFormValues,
  activity: DailyActivity,
  moment: DailyMoment,
) {
  const mood = values.mood ? ` y ánimo ${moods[values.mood].toLowerCase()}` : '';
  const exercise = values.exerciseDone === true ? ' También anotaste que hiciste ejercicio.' : '';
  return `Listo, ${name}. Guardé tu chequeo de ${activities[activity].label.toLowerCase()} ${spokenMoments[moment]}. Registraste ${spokenNumber.format(Number(values.sleep))} horas de sueño${mood}.${exercise} Gracias por tomarte este momento para ti.`;
}

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

export function useDailyCheckViewModel(
  data: MissionData,
  onSave: DailyCheckScreenProps['onSave'],
  audio: Pick<TumiReplyAudio, 'play' | 'playing' | 'spokenWords' | 'status' | 'stop'>,
) {
  const [step, setStep] = useState(0);
  const [savedReply, setSavedReply] = useState('');
  const sessionActive = useRef(false);
  useEffect(() => {
    sessionActive.current = true;
    return () => {
      sessionActive.current = false;
    };
  }, []);
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

  const tumiReply =
    step === 3 ? savedReply : values.mood ? tumiWellbeingReplies[values.mood] : greeting;
  const tumiWords = tumiReply.split(/\s+/);
  const speaking = audio.playing && audio.spokenWords !== undefined;
  const expressions = tumiExpressions[step === 3 ? 'result' : (values.mood ?? 'greeting')];
  const phase = Math.min(2, Math.floor(((audio.spokenWords ?? 0) * 3) / tumiWords.length));

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
    tumiReply,
    tumiAudioLabel:
      step === 3 ? 'Escuchar resumen' : values.mood ? 'Escuchar respuesta' : 'Escuchar saludo',
    tumiWords,
    tumiSpokenWords: audio.spokenWords,
    tumiSpeaking: speaking,
    tumiExpression: speaking ? expressions[phase] : expressions[1],
    tumiAudioPlaying: audio.playing,
    tumiAudioStatus: audio.status,
    toggleTumiAudio() {
      if (audio.playing) audio.stop();
      else audio.play(tumiReply, { transcript: true });
    },
    selectMood(mood?: CheckFormValues['mood']) {
      setValues((current) => ({ ...current, mood }));
      if (mood) audio.play(tumiWellbeingReplies[mood], { transcript: true });
      else audio.stop();
    },
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
        if (step === 1) audio.stop();
        setStep(step + 1);
        return;
      }
      if (step !== 2) return;
      pending.current = true;
      setFailed(false);
      let saved = false;
      try {
        saved = await onSave({
          ...values,
          context,
          healthReport,
          attachment,
          discomfortRegion: region || undefined,
        });
      } catch {
        saved = false;
      } finally {
        pending.current = false;
      }
      if (sessionActive.current && !saved) setFailed(true);
      if (!sessionActive.current || !saved) return;

      const summary = describeSavedCheck(
        data.selected.name.split(' ')[0],
        values,
        context.activity,
        context.moment,
      );
      setSavedReply(summary);
      setStep(3);
      audio.play(summary, { transcript: true });
    },
    edit() {
      audio.stop();
      setStep(0);
    },
  };
}
