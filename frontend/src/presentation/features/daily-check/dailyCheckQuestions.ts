import type { DailyCheckViewModel, GuideQuestion } from './types';
import { tumiWellbeingReplies } from '@/domain/assistant/tumiWellbeing';

const moodExpressions = { good: 'joy', neutral: 'understanding', low: 'worried' } as const;

export const guideModePrompt =
  '¿Quieres llenar tu chequeo a mano o prefieres que te acompañe pregunta por pregunta?';

export function dailyCheckQuestions(model: DailyCheckViewModel): GuideQuestion[] {
  const { values } = model;
  return [
    {
      id: 'mood',
      kind: 'choices',
      prompt: 'Antes de empezar, ¿cómo te sientes hoy?',
      options: [
        ...(['good', 'neutral', 'low'] as const).map((mood) => ({
          label: mood === 'low' ? 'Triste' : model.moods[mood],
          selected: values.mood === mood,
          mood,
          reaction: { text: tumiWellbeingReplies[mood], emotion: moodExpressions[mood] },
          choose: () => model.selectMood(mood, false),
        })),
        {
          label: 'Sin responder',
          reaction: { text: 'Está bien. Podemos seguir a tu ritmo.', emotion: 'understanding' },
          choose: () => model.selectMood(undefined, false),
        },
      ],
    },
    {
      id: 'activity',
      kind: 'choices',
      prompt: '¿Qué actividad quieres registrar?',
      options: model.activities.map(({ id, label }) => ({
        label,
        selected: model.activity === id,
        reaction: {
          text: `Vamos con ${label.toLowerCase()}. Así podré poner tus respuestas en contexto.`,
          emotion: 'curious',
        },
        choose: () => model.selectActivity(id),
      })),
    },
    {
      id: 'moment',
      kind: 'choices',
      prompt: '¿En qué momento de la actividad haces este chequeo?',
      options: model.moments.map(({ id, label }) => ({
        label,
        selected: model.moment === id,
        choose: () => model.selectMoment(id),
      })),
    },
    {
      id: 'sleep',
      kind: 'number',
      prompt: 'Ahora cuéntame, ¿cuántas horas dormiste?',
      label: 'Horas de sueño',
      value: values.sleep,
      required: true,
      max: 24,
      step: 0.1,
      change: (sleep) => model.setValues({ ...values, sleep }),
    },
    {
      id: 'fatigue',
      kind: 'choices',
      prompt: '¿Cuánta fatiga sentiste?',
      options: [
        ...['Muy poca', 'Poca', 'Moderada', 'Alta', 'Muy alta'].map((label, index) => {
          const fatigue = String(index + 1);
          return {
            label: `${fatigue} · ${label}`,
            selected: values.fatigue === fatigue,
            reaction: {
              text:
                index >= 3
                  ? 'Suena a que hoy costó un poco más. Si quieres, al final puedes anotar cuándo sentiste más cansancio.'
                  : index <= 1
                    ? 'Qué bueno que el cansancio fue leve. Gracias por anotarlo.'
                    : 'Gracias por hacer una pausa para notar cómo va tu energía.',
              emotion: index >= 3 ? 'worried' : index <= 1 ? 'happy' : 'understanding',
            },
            choose: () => model.setValues({ ...values, fatigue }),
          };
        }),
        { label: 'Sin responder', choose: () => model.setValues({ ...values, fatigue: '' }) },
      ],
    },
    {
      id: 'exercise',
      kind: 'choices',
      prompt: '¿Hiciste ejercicio hoy?',
      options: [true, false, undefined].map((exerciseDone) => ({
        label: exerciseDone === undefined ? 'Sin responder' : exerciseDone ? 'Sí' : 'No',
        selected: values.exerciseDone === exerciseDone,
        reaction: {
          text:
            exerciseDone === true
              ? 'Qué bien que encontraste un momento para moverte.'
              : exerciseDone === false
                ? 'Gracias por contármelo. Cada día tiene su propio ritmo.'
                : 'Podemos dejar esta pregunta para otro momento.',
          emotion: exerciseDone === true ? 'happy' : 'understanding',
        },
        choose: () => model.setValues({ ...values, exerciseDone }),
      })),
    },
    {
      id: 'discomfort',
      kind: 'choices',
      prompt: '¿Sentiste molestias en alguna parte del cuerpo?',
      options: [
        ...model.regions.map(({ id, label }) => ({
          label,
          selected: model.region === id,
          reaction: {
            text:
              id === 'none'
                ? 'Qué bueno que no notaste molestias.'
                : 'Gracias por contarme dónde lo sentiste. Si quieres, puedes dejar más detalles en la nota final.',
            emotion: id === 'none' ? 'happy' : 'understanding',
          },
          choose: () => model.setRegion(id),
        })),
        { label: 'Sin informar', choose: () => model.setRegion('') },
      ],
    },
    {
      id: 'health',
      kind: 'choices',
      prompt: '¿Hay alguna área de salud que quieras comentar?',
      options: [
        ...model.healthAreas.map(({ id, label }) => ({
          label,
          selected: model.healthArea === id,
          choose: () => model.selectHealthArea(id),
        })),
        { label: 'Sin indicar', choose: () => model.selectHealthArea('') },
      ],
    },
    ...(model.healthArea
      ? [
          {
            id: 'health-state',
            kind: 'choices' as const,
            prompt: '¿Cómo describirías lo que notaste en esa área?',
            options: [
              ...model.reportedStates.map((id) => ({
                label: model.reportedStateLabels[id],
                selected: model.healthReport?.reportedState === id,
                choose: () => model.selectHealthState(id),
              })),
              { label: 'Sin responder', choose: () => model.selectHealthState('') },
            ],
          },
        ]
      : []),
    ...(model.healthReport?.systemId === 'vision' && model.healthReport.reportedState === 'change'
      ? [
          {
            id: 'vision',
            kind: 'choices' as const,
            prompt: '¿En qué actividad visual notaste el cambio?',
            options: [
              ...model.visionActivities.map(({ id, label }) => ({
                label,
                selected: model.healthReport?.visionActivityId === id,
                choose: () => model.selectVisionActivity(id),
              })),
              { label: 'Sin indicar', choose: () => model.selectVisionActivity() },
            ],
          },
        ]
      : []),
    ...model.measurementsForm.map((field) => ({
      id: field.key,
      kind: 'number' as const,
      prompt: `Si tienes el dato, ¿quieres anotar ${field.label.toLowerCase()}?`,
      label: field.unit ? `${field.label} (${field.unit})` : field.label,
      value: field.value,
      max: field.max,
      step: field.integer ? (1 as const) : ('any' as const),
      change: (value: string) => model.setMeasurement(field.key, value),
    })),
    {
      id: 'note',
      kind: 'note',
      prompt: 'Ya casi terminamos. ¿Quieres dejar alguna nota?',
      label: 'Nota (opcional)',
      value: values.note,
      change: (note) => model.setValues({ ...values, note }),
    },
  ];
}
