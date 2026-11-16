import { expect, it, vi } from 'vitest';
import { interpretGuideDictation } from '@/presentation/features/daily-check/interpretGuideDictation';
import type { GuideQuestion } from '@/presentation/features/daily-check/types';

it('encuentra una opción solamente si entiende una respuesta inequívoca', () => {
  const question: GuideQuestion = {
    id: 'mood',
    kind: 'choices',
    prompt: '¿Cómo te sientes hoy?',
    options: ['Bien', 'Regular', 'Triste'].map((label) => ({ label, choose: vi.fn() })),
  };
  expect(interpretGuideDictation(question, 'Me siento más o menos')).toEqual({
    kind: 'choice',
    label: 'Regular',
  });
  expect(interpretGuideDictation(question, 'Estoy bien y triste')).toBeUndefined();
  expect(interpretGuideDictation(question, 'No estoy triste')).toBeUndefined();
  expect(interpretGuideDictation(question, 'Me siento algo regular')).toMatchObject({
    label: 'Regular',
  });
  expect(
    interpretGuideDictation(question, 'En general me siento regular desde ayer'),
  ).toMatchObject({
    label: 'Regular',
  });
  expect(interpretGuideDictation(question, 'I feel sad')).toMatchObject({ label: 'Triste' });
  expect(interpretGuideDictation(question, 'Hoy me siento un poco triste')).toMatchObject({
    label: 'Triste',
  });
  expect(interpretGuideDictation(question, 'I feel pretty good today')).toMatchObject({
    label: 'Bien',
  });
  expect(interpretGuideDictation(question, 'I am not sad')).toBeUndefined();
  for (const { choose } of question.options) expect(choose).not.toHaveBeenCalled();
});

const choiceCases = [
  {
    id: 'activity',
    labels: ['Rutina en cabina', 'Ejercicio', 'Recorrido de superficie', 'Caminata espacial EVA'],
    phrase: 'Hoy hice ejercicio',
    expected: 'Ejercicio',
    unclear: 'No hice ejercicio',
  },
  {
    id: 'moment',
    labels: ['Antes', 'Después', 'Incidencia durante la actividad'],
    phrase: 'Hago este chequeo después de entrenar',
    expected: 'Después',
    unclear: 'Antes o después',
  },
  {
    id: 'fatigue',
    labels: [
      '1 · Muy poca',
      '2 · Poca',
      '3 · Moderada',
      '4 · Alta',
      '5 · Muy alta',
      'Sin responder',
    ],
    phrase: 'Sentí cansancio moderado',
    expected: '3 · Moderada',
  },
  {
    id: 'exercise',
    labels: ['Sí', 'No', 'Sin responder'],
    phrase: 'Sí, hoy hice ejercicio',
    expected: 'Sí',
    unclear: 'Sí o no',
  },
  {
    id: 'discomfort',
    labels: [
      'Sin molestias',
      'Cabeza',
      'Torso',
      'Brazos',
      'Manos',
      'Piernas',
      'Pies',
      'Otra región',
      'Sin informar',
    ],
    phrase: 'Me duelen las manos',
    expected: 'Manos',
    unclear: 'Me duelen las manos y los pies',
  },
  {
    id: 'health',
    labels: [
      'Corazón',
      'Ejercicio',
      'Visión',
      'Equilibrio',
      'Nutrición',
      'Inmunidad',
      'EVA',
      'Sin indicar',
    ],
    phrase: 'Quiero hablar de la vista',
    expected: 'Visión',
  },
  {
    id: 'health-state',
    labels: ['Sin cambios reportados', 'Cambio reportado', 'No evaluado', 'Sin responder'],
    phrase: 'Noté un cambio',
    expected: 'Cambio reportado',
  },
  {
    id: 'vision',
    labels: ['Leer de cerca', 'Enfocar', 'Mirar a distancia', 'Sin indicar'],
    phrase: 'Lo noté al leer de cerca',
    expected: 'Leer de cerca',
  },
];

it.each(choiceCases)(
  'reconoce las opciones y frases naturales de $id',
  ({ id, labels, phrase, expected, unclear }) => {
    const question: GuideQuestion = {
      id,
      kind: 'choices',
      prompt: id,
      options: labels.map((label) => ({ label, choose: vi.fn() })),
    };
    for (const label of labels) {
      expect(interpretGuideDictation(question, label)).toEqual({ kind: 'choice', label });
    }
    expect(interpretGuideDictation(question, phrase)).toEqual({ kind: 'choice', label: expected });
    if (unclear) expect(interpretGuideDictation(question, unclear)).toBeUndefined();
  },
);

it('interpreta cantidades habladas respetando el intervalo y la precisión de la pregunta', () => {
  const question: GuideQuestion = {
    id: 'sleep',
    kind: 'number',
    prompt: '¿Cuántas horas dormiste?',
    label: 'Horas de sueño',
    value: '',
    required: true,
    max: 24,
    step: 0.1,
    change: vi.fn(),
  };
  expect(interpretGuideDictation(question, 'Dormí siete horas y media')).toMatchObject({
    value: '7.5',
  });
  expect(interpretGuideDictation(question, 'I slept seven and a half hours')).toMatchObject({
    value: '7.5',
  });
  expect(interpretGuideDictation(question, 'Por mis cinco horas')).toMatchObject({ value: '5' });
  expect(
    interpretGuideDictation(question, 'Creo que fueron unas seis horas y media'),
  ).toMatchObject({
    value: '6.5',
  });
  expect(interpretGuideDictation(question, 'Entre cinco y seis horas')).toBeUndefined();
  expect(interpretGuideDictation(question, 'Fueron cinco horas, bueno seis horas')).toBeUndefined();
  expect(interpretGuideDictation(question, '25 horas')).toBeUndefined();
  expect(interpretGuideDictation(question, '7 minutos')).toBeUndefined();
  expect(interpretGuideDictation(question, '7,55 horas')).toBeUndefined();
  expect(interpretGuideDictation(question, 'Prefiero omitir')).toBeUndefined();
  expect(question.change).not.toHaveBeenCalled();
});

it('reconoce notas dictadas con el denominador de su escala', () => {
  const effort: GuideQuestion = {
    id: 'effort',
    kind: 'number',
    prompt: '¿Quieres anotar el esfuerzo percibido?',
    label: 'Esfuerzo percibido',
    value: '',
    max: 10,
    step: 1,
    change: vi.fn(),
  };

  for (const phrase of ['sí 7 de 10', 'Sí, siete sobre diez', '7/10', 'Yes, seven out of ten']) {
    expect(interpretGuideDictation(effort, phrase)).toMatchObject({ kind: 'value', value: '7' });
  }
  for (const phrase of ['7 de 5', '11 de 10', '7,5 de 10', '6 o 7 de 10', 'no 7 de 10']) {
    expect(interpretGuideDictation(effort, phrase)).toBeUndefined();
  }
  expect(
    interpretGuideDictation({ ...effort, id: 'handDiscomfort', max: 5 }, 'tres de cinco'),
  ).toMatchObject({ value: '3' });
});
