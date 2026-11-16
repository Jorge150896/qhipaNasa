import { useAppLanguage, useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
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
import type { CheckFormValues, MissionData } from '../mission/types';
import type { DailyCheckScreenProps } from './types';
import {
  activities,
  describeHealthReport,
  exerciseLabel,
  fieldLabel,
  fields,
  moments,
  regions,
} from './dailyCheckDetails';

const moods = { good: 'Bien', neutral: 'Regular', low: 'Bajo' };
const tumiExpressions = {
  greeting: ['greeting', 'happy', 'curious'],
  result: ['approved', 'happy', 'understanding'],
  good: ['joy', 'happy', 'curious'],
  neutral: ['thinking', 'understanding', 'curious'],
  low: ['worried', 'understanding', 'neutral'],
} satisfies Record<string, TumiEmotion[]>;
const greeting = 'Estoy aquí para escucharte. ¿Cómo te sientes hoy?';
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
  english: boolean,
  t: ReturnType<typeof useTranslation>,
) {
  const sleep = new Intl.NumberFormat(english ? 'en-US' : 'es').format(Number(values.sleep));
  const activityLabel = t(activities[activity].label).toLowerCase();
  const momentLabel = t(spokenMoments[moment]);
  const closing = t(
    values.mood === 'low'
      ? 'Gracias por contarme cómo te sentiste. Podemos ir con calma.'
      : values.mood === 'good'
        ? 'Qué gusto acompañarte. Si mañana quieres volver, aquí estaré.'
        : 'Gracias por tomarte este momento para ti.',
  );
  const mood = values.mood
    ? english
      ? ` You described your mood as ${t(moods[values.mood]).toLowerCase()}.`
      : ` Describiste tu ánimo como ${moods[values.mood].toLowerCase()}.`
    : '';
  const exercise =
    values.exerciseDone === true ? ` ${t('También anotaste que hiciste ejercicio.')}` : '';
  const summary = english
    ? `All set, ${name}. I saved your check-in for ${activityLabel} ${momentLabel}. You logged ${sleep} hours of sleep.`
    : `Listo, ${name}. Guardé tu chequeo de ${activityLabel} ${momentLabel}. Registraste ${sleep} horas de sueño.`;
  return `${summary}${mood}${exercise} ${closing}`;
}

const empty: CheckFormValues = { sleep: '', fatigue: '', note: '' };
export function useDailyCheckViewModel(
  data: MissionData,
  onSave: DailyCheckScreenProps['onSave'],
  audio: Pick<TumiReplyAudio, 'play' | 'playing' | 'spokenWords' | 'status' | 'stop'>,
) {
  const [step, setStep] = useState(0);
  const { language } = useAppLanguage();
  const t = useTranslation();
  const [savedCheck, setSavedCheck] = useState<{
    values: CheckFormValues;
    activity: DailyActivity;
    moment: DailyMoment;
  }>();
  const sessionActive = useRef(false);
  useEffect(() => {
    sessionActive.current = true;
    return () => {
      sessionActive.current = false;
    };
  }, []);
  const [activity, setActivity] = useState<DailyActivity>();
  const [moment, setMoment] = useState<DailyMoment>();
  const [values, setValues] = useState(empty);
  const [measurements, setMeasurements] = useState<Partial<Record<ActivityField, string>>>({});
  const [region, setRegion] = useState<DiscomfortRegion | ''>('');
  const [healthArea, setHealthArea] = useState<HealthSystemId | ''>('');
  const [attachment] = useState(data.checkAttachment);
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

  const firstName = data.selected.name.split(' ')[0];
  const tumiReply =
    step === 3 && savedCheck
      ? describeSavedCheck(
          firstName,
          savedCheck.values,
          savedCheck.activity,
          savedCheck.moment,
          language === 'en',
          t,
        )
      : t(values.mood ? tumiWellbeingReplies[values.mood] : greeting);
  const tumiWords = tumiReply.split(/\s+/);
  const speaking = audio.playing && audio.spokenWords !== undefined;
  const expressions =
    tumiExpressions[
      step === 3 ? (values.mood === 'low' ? 'low' : 'result') : (values.mood ?? 'greeting')
    ];
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
    selectMood(mood?: CheckFormValues['mood'], speak = true) {
      setValues((current) => ({ ...current, mood }));
      if (!speak) return;
      if (mood) audio.play(tumiWellbeingReplies[mood], { transcript: true });
      else audio.stop();
    },
    measurementsForm,
    attachment: mapDailyCheckAttachment(attachment, language),
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
    reviewGuided() {
      if (context && values.sleep !== '') setStep(2);
    },
    back() {
      if (!pending.current) {
        setFailed(false);
        setStep(Math.max(0, step - 1));
      }
    },
    async advance(speakSummary = true) {
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
        firstName,
        values,
        context.activity,
        context.moment,
        language === 'en',
        t,
      );
      setSavedCheck({ values, activity: context.activity, moment: context.moment });
      setStep(3);
      if (speakSummary) audio.play(summary, { transcript: true });
    },
    edit() {
      audio.stop();
      setStep(0);
    },
  };
}
