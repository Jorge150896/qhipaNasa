import type { GuideQuestion } from './types';

export type GuideVoiceAnswer =
  { kind: 'choice'; label: string } | { kind: 'value'; value: string; label: string };

function normalise(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const aliases: Record<string, Record<string, string>> = {
  mood: {
    'muy bien': 'bien',
    'bastante bien': 'bien',
    feliz: 'bien',
    contenta: 'bien',
    contento: 'bien',
    'mas o menos': 'regular',
    'asi asi': 'regular',
    'algo regular': 'regular',
    'un poco regular': 'regular',
    'ni bien ni mal': 'regular',
    mal: 'triste',
    'muy triste': 'triste',
    'algo triste': 'triste',
    'un poco triste': 'triste',
  },
  activity: {
    cabina: 'rutina en cabina',
    'rutina de cabina': 'rutina en cabina',
    'estuve en cabina': 'rutina en cabina',
    ejercicios: 'ejercicio',
    'hice ejercicio': 'ejercicio',
    'hice ejercicios': 'ejercicio',
    entrene: 'ejercicio',
    entrenamiento: 'ejercicio',
    superficie: 'recorrido de superficie',
    'hice un recorrido de superficie': 'recorrido de superficie',
    'recorrido en superficie': 'recorrido de superficie',
    eva: 'caminata espacial eva',
    'caminata espacial': 'caminata espacial eva',
    'hice una caminata espacial': 'caminata espacial eva',
  },
  moment: {
    'antes de la actividad': 'antes',
    'despues de la actividad': 'despues',
    'antes de empezar': 'antes',
    'antes de hacer ejercicio': 'antes',
    'despues de terminar': 'despues',
    'despues de entrenar': 'despues',
    'despues de hacer ejercicio': 'despues',
    'al terminar': 'despues',
    'hubo una incidencia durante la actividad': 'incidencia durante la actividad',
  },
  fatigue: {
    'un poco': 'poca',
    'poco cansancio': 'poca',
    'cansancio moderado': 'moderada',
    'fatiga moderada': 'moderada',
    'mucho cansancio': 'alta',
    'mucha fatiga': 'alta',
    agotado: 'muy alta',
    agotada: 'muy alta',
  },
  exercise: {
    'si hice ejercicio': 'si',
    'si hoy hice ejercicio': 'si',
    'hice ejercicio': 'si',
    'hice ejercicios': 'si',
    entrene: 'si',
    'no hice ejercicio': 'no',
    'no entrene': 'no',
  },
  discomfort: {
    'no tuve molestias': 'sin molestias',
    'no senti molestias': 'sin molestias',
    'no me duele nada': 'sin molestias',
    'me duele la cabeza': 'cabeza',
    'me duelen los brazos': 'brazos',
    'me duelen las manos': 'manos',
    'me duelen las piernas': 'piernas',
    'me duelen los pies': 'pies',
  },
  health: {
    ninguna: 'sin indicar',
    'ninguna area': 'sin indicar',
    vista: 'vision',
    'la vista': 'vision',
    visual: 'vision',
  },
  'health-state': {
    'sin cambios': 'sin cambios reportados',
    'no note cambios': 'sin cambios reportados',
    'note un cambio': 'cambio reportado',
    'si note cambios': 'cambio reportado',
    'no lo evalue': 'no evaluado',
  },
  vision: {
    'al leer de cerca': 'leer de cerca',
    'cuando leia de cerca': 'leer de cerca',
    'al enfocar': 'enfocar',
    'al mirar lejos': 'mirar a distancia',
  },
};
const smallNumbers = [
  'cero',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciseis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidos',
  'veintitres',
  'veinticuatro',
  'veinticinco',
  'veintiseis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
];
const englishNumbers = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const englishChoices: Record<string, Record<string, string>> = {
  mood: {
    good: 'bien',
    great: 'bien',
    well: 'bien',
    fine: 'bien',
    happy: 'bien',
    okay: 'regular',
    ok: 'regular',
    'so so': 'regular',
    sad: 'triste',
    low: 'triste',
    'a bit sad': 'triste',
    'very sad': 'triste',
    'a little sad': 'triste',
    'pretty good': 'bien',
  },
  activity: {
    cabin: 'rutina en cabina',
    'cabin routine': 'rutina en cabina',
    exercise: 'ejercicio',
    'i exercised': 'ejercicio',
    'i worked out': 'ejercicio',
    'i went for a surface walk': 'recorrido de superficie',
    'surface walk': 'recorrido de superficie',
    spacewalk: 'caminata espacial eva',
  },
  moment: {
    before: 'antes',
    after: 'despues',
    'before the activity': 'antes',
    'after the activity': 'despues',
    'after exercising': 'despues',
    'before starting': 'antes',
    'incident during the activity': 'incidencia durante la actividad',
  },
  fatigue: {
    'very low': 'muy poca',
    low: 'poca',
    moderate: 'moderada',
    high: 'alta',
    'very high': 'muy alta',
    'moderately tired': 'moderada',
  },
  exercise: {
    yes: 'si',
    'yes i did': 'si',
    'i exercised': 'si',
    'i worked out': 'si',
    'no i did not': 'no',
    'i did not exercise': 'no',
    'i didn t exercise': 'no',
    'i didn t work out': 'no',
  },
  discomfort: {
    none: 'sin molestias',
    'no discomfort': 'sin molestias',
    'my head hurts': 'cabeza',
    'my hands hurt': 'manos',
    head: 'cabeza',
    torso: 'torso',
    arms: 'brazos',
    hands: 'manos',
    legs: 'piernas',
    feet: 'pies',
    other: 'otra region',
  },
  health: {
    heart: 'corazon',
    exercise: 'ejercicio',
    vision: 'vision',
    eyesight: 'vision',
    balance: 'equilibrio',
    nutrition: 'nutricion',
    immunity: 'inmunidad',
    spacewalk: 'eva',
    'none of these': 'sin indicar',
  },
  'health-state': {
    'no change': 'sin cambios reportados',
    'no changes': 'sin cambios reportados',
    change: 'cambio reportado',
    'not assessed': 'no evaluado',
    'i noticed a change': 'cambio reportado',
    'i didn t notice any changes': 'sin cambios reportados',
  },
  vision: {
    'reading up close': 'leer de cerca',
    'close reading': 'leer de cerca',
    'when reading up close': 'leer de cerca',
    focusing: 'enfocar',
    'looking far away': 'mirar a distancia',
  },
};
const skip =
  /^(?:sin (?:responder|informar|indicar)|prefiero (?:omitir|no responder)|omitir|skip|skip this question|prefer not to answer|i prefer not to answer)$/;
const numericUnits: Record<string, string> = {
  sleep: 'hora',
  durationMinutes: 'minuto',
  distanceKm: 'kilometro',
  waterMl: 'mililitro',
  effort: 'punto',
  handDiscomfort: 'punto',
  restInterruptions: 'interrupcion',
};
const tens = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const spanishTens = [
  'veinte',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa',
];

function spokenNumber(text: string) {
  if (/^\d/.test(text)) return Number(text.replace(',', '.'));
  const word = ['un', 'una', 'a', 'an'].includes(text) ? 'uno' : text;
  const small = Math.max(smallNumbers.indexOf(word), englishNumbers.indexOf(word));
  if (small >= 0) return small;
  const [ten, unit] = word.split(/ y |[- ]/);
  const tenIndex = Math.max(tens.indexOf(ten), spanishTens.indexOf(ten));
  const units = unit ? Math.max(smallNumbers.indexOf(unit), englishNumbers.indexOf(unit)) : 0;
  if (tenIndex >= 0 && units >= 0 && units < 10) return (tenIndex + 2) * 10 + units;
  return NaN;
}

function contextualChoice(answer: string, phrases: [string, string][]) {
  if (/\b(?:no|nunca|not|never|sin|pero|but|o|or)\b/.test(answer)) return;
  const matches = phrases.filter(([phrase]) => ` ${answer} `.includes(` ${phrase} `));
  const specific = matches.filter(
    ([phrase]) =>
      !matches.some(([other]) => other !== phrase && ` ${other} `.includes(` ${phrase} `)),
  );
  const targets = new Set(specific.map(([, target]) => target));
  if (targets.size === 1)
    return specific.find(([phrase]) => phrase.length >= 5 || answer.endsWith(` ${phrase}`))?.[1];
}

const quantityPattern =
  /^(\d+(?:[.,]\d+)?|[a-z]+(?:[- ](?:y )?[a-z]+)??)(?:\s+(horas?|minutos?|kilometros?|mililitros?|puntos?|interrupcion(?:es)?))?(?:\s+(y media|y medio))?$/;
const unitPattern = /^(?:horas?|minutos?|kilometros?|mililitros?|puntos?|interrupcion(?:es)?)$/;

function contextualQuantity(text: string, expectedUnit?: string) {
  if (!expectedUnit || /\b(?:no|nunca|not|never|o|or|entre|between|menos|mas)\b/.test(text)) return;
  const words = text.split(/\s+/);
  const units = words.flatMap((word, index) => (unitPattern.test(word) ? [index] : []));
  if (units.length !== 1) return;
  const unitIndex = units[0];
  if (words[unitIndex].replace(/(?:es|s)$/, '') !== expectedUnit) return;
  const hasHalf = /^y medi[ao]$/.test(words.slice(unitIndex + 1, unitIndex + 3).join(' '));
  const end = unitIndex + (hasHalf ? 3 : 1);
  for (let start = Math.max(0, unitIndex - 3); start < unitIndex; start += 1) {
    const match = quantityPattern.exec(words.slice(start, end).join(' '));
    if (!match || !Number.isFinite(spokenNumber(match[1]))) continue;
    const context = [...words.slice(0, start), ...words.slice(end)];
    if (context.some((word) => Number.isFinite(spokenNumber(word)) && word !== 'a')) return;
    return match;
  }
}

export function interpretGuideDictation(
  question: GuideQuestion,
  transcript: string,
): GuideVoiceAnswer | undefined {
  const text = normalise(transcript);
  if (!text) return;
  if (question.kind === 'choices') {
    const answer = text
      .replace(/^(?:hoy|today) /, '')
      .replace(
        /^(?:me siento|me encuentro|estoy|me va|elige|selecciona|quiero registrar|senti|tuve|diria que|quiero hablar de|me gustaria comentar|i feel|i felt|i m feeling|i am feeling|i m|i am|i d like to talk about|choose|select) /,
        '',
      )
      .replace(/ (?:hoy|today)$/, '');
    const variants = { ...aliases[question.id], ...englishChoices[question.id] };
    const target = variants[answer] ?? answer;
    const matches = question.options.filter(({ label }) => {
      const key = normalise(label);
      if (skip.test(target)) return skip.test(key);
      if (question.id === 'fatigue') {
        const score = spokenNumber(target.replace(/ (?:de|out of) (?:5|cinco|five)$/, ''));
        return (
          key === target ||
          key.replace(/^\d+ /, '') === target ||
          key.split(' ')[0] === (score >= 0 ? String(score) : target)
        );
      }
      return key === target;
    });
    if (matches.length === 1) return { kind: 'choice', label: matches[0].label };
    const phrases: [string, string][] = [
      ...question.options.map(({ label }): [string, string] => {
        const key = normalise(label).replace(/^\d+ /, '');
        return [key, key];
      }),
      ...Object.entries(variants),
    ];
    const inferred = contextualChoice(answer, phrases);
    const option = question.options.find(
      ({ label }) => normalise(label).replace(/^\d+ /, '') === inferred,
    );
    if (option) return { kind: 'choice', label: option.label };
    return;
  }

  if (skip.test(text)) {
    return question.required ? undefined : { kind: 'value', value: '', label: 'Sin responder' };
  }
  if (question.kind === 'note') {
    const value = transcript.trim().slice(0, 400);
    return { kind: 'value', value, label: value };
  }

  let numeric = transcript
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .replace(/^[¡¿]|[.!?]+$/g, '')
    .replace(/^(?:hoy |today )?/, '')
    .replace(
      /^(?:dormi|son|fueron|dure|tome|bebi|recorri|i slept(?: for)?|i drank|i walked|it took|le pongo)\s+/,
      '',
    )
    .replace(/ (?:hoy|today)$/, '')
    .replace(/(\d+)\s+(?:punto|coma|point)\s+(\d+)/, '$1.$2')
    .replace(/ and (?:a |one )?half (hours?|minutes?|kilometers?|kilometres?)$/, ' $1 y media')
    .replace(
      /\b(hours?|minutes?|kilometers?|kilometres?|milliliters?|millilitres?|points?|interruptions?)\b/,
      (unit) => {
        const englishUnits: Record<string, string> = {
          hour: 'hora',
          minute: 'minuto',
          kilometer: 'kilometro',
          kilometre: 'kilometro',
          milliliter: 'mililitro',
          millilitre: 'mililitro',
          point: 'punto',
          interruption: 'interrupcion',
        };
        return englishUnits[unit.replace(/s$/, '')];
      },
    )
    .replace(/ and (?:a |one )?half$/, ' y media');

  if (question.id === 'effort' || question.id === 'handDiscomfort') {
    numeric = numeric.replace(/^(?:si|yes)[,;:]?\s+/, '');
    const scale = /(?:\s*\/\s*|\s+(?:de|sobre|out of)\s+)(\d+|[a-z]+)$/.exec(numeric);
    if (scale) {
      if (spokenNumber(scale[1]) !== question.max) return;
      numeric = numeric.slice(0, scale.index).trimEnd();
    }
  }

  const exact = quantityPattern.exec(numeric);
  const match =
    exact && Number.isFinite(spokenNumber(exact[1]))
      ? exact
      : contextualQuantity(numeric.replace(/[,;:](?=\s)/g, ''), numericUnits[question.id]);
  if (!match) return;
  const unit = match[2]?.replace(/(?:es|s)$/, '');
  if (unit && unit !== numericUnits[question.id]) return;
  const quantity = spokenNumber(match[1]);
  const value = quantity + (match[3] ? 0.5 : 0);
  if (quantity < 0 || !Number.isFinite(value) || value > (question.max ?? Infinity)) return;
  if (
    typeof question.step === 'number' &&
    Math.abs(value / question.step - Math.round(value / question.step)) > 1e-8
  )
    return;
  return { kind: 'value', value: String(value), label: value.toLocaleString('es-PE') };
}
