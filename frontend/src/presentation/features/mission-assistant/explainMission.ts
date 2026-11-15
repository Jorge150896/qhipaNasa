import { detectTextEmotion, emotionalAcknowledgement } from '@/domain/assistant/detectTextEmotion';
import { metricMeaning } from '../crew-health/constants';
import type { MissionData, SensorKey } from '../mission/types';
import type {
  AssistantMetricContext,
  AssistantReply,
  AssistantSample,
  AssistantSelection,
} from './types';
import {
  formatTelemetryDifference,
  getTelemetryContext,
} from '../../shared/mission/describeTelemetry';
import { actionTips, guideControls, missionTopics } from './missionKnowledge';
import { getTumiCrewNames } from './tumiCrewNames';

export function getControlTip(id: string, data: MissionData | null) {
  const control = guideControls.find((item) => item.id === id);
  if (control) return control;
  if (Object.hasOwn(actionTips, id)) return actionTips[id as keyof typeof actionTips];

  const metric = data?.selected.metrics.find((item) => id === `metric-${item.id}`);
  if (!metric) return;
  return {
    label: metric.shortLabel,
    text: `${metricMeaning[metric.id]} Pulsa para explorar ${metric.label.toLowerCase()}.`,
    canAsk: true,
  };
}

const signals: [SensorKey, RegExp][] = [
  ['heartRate', /\b(pulso|cardiac\w*|corazon|latidos?|lpm)\b/],
  ['oxygen', /\b(spo2|oxigen\w*|saturacion)\b/],
  ['temperature', /\b(temperatura|celsius)\b/],
  ['respiration', /\b(respir\w*|rpm)\b/],
];

const crewActivities: Record<string, string> = {
  Descanso: 'está descansando',
  Ejercicio: 'está haciendo ejercicio',
  Investigación: 'está investigando',
};

const reportedMoods: Record<string, string> = {
  Bien: 'se sentía bien',
  Regular: 'se sentía más o menos',
  Bajo: 'tenía el ánimo bajo',
};

function introduceCrew(data: MissionData, asksHowTheyFeel: boolean): AssistantReply {
  const { name, role, activity, location, id } = data.selected;
  const introduction =
    role === 'Comandante'
      ? `${name} es nuestra comandante en ${data.name}.`
      : `${name} forma parte de ${data.name} como ${role.toLowerCase()}.`;
  const currentActivity = crewActivities[activity] ?? `está en «${location}»`;
  if (asksHowTheyFeel) {
    const last = data.checks.find(({ crewId }) => crewId === id);
    const feeling = last && reportedMoods[last.mood];
    const mood = feeling
      ? `En su último chequeo, contó que ${feeling}.`
      : 'Para saber cómo se siente, lo más útil sería preguntarle o mirar su chequeo cuando lo registre.';
    return { text: `En la simulación, ${name.split(' ')[0]} ${currentActivity}. ${mood}` };
  }
  return {
    text: `${introduction} En la simulación, ahora ${currentActivity}. Si quieres, podemos mirar juntos cómo le ha ido estos días.`,
  };
}

function normalize(question: string) {
  return question
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replaceAll('₂', '2');
}

const sampleDate = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: 'UTC' });
const spokenDate = new Intl.DateTimeFormat('es-PE', { dateStyle: 'long', timeZone: 'UTC' });

export function captureMetricContext(
  id: string,
  data: MissionData | null,
  selection?: AssistantSelection,
): AssistantMetricContext | undefined {
  if (!data) return;
  const mission = data;
  const metric = data.selected.metrics.find((item) => id === `metric-${item.id}`);
  if (!metric) return;
  const sample = metric.history.find(({ at }) => at === selection?.at);
  if (selection && !sample) return;
  const reference = selection?.compareFrom
    ? metric.history.find(({ at }) => at === selection.compareFrom)
    : metric.history.find((item) => !item.missing && (!sample || item.at < sample.at));
  const snapshotSample = metric.history.at(-1);
  const subject = sample ?? (metric.value !== '—' ? snapshotSample : undefined);
  const subjectContext = subject ? describeSample(subject) : undefined;
  function describeSample(reading: AssistantSample['reading']): AssistantSample {
    const context = getTelemetryContext(mission, reading.at);
    return { reading, activity: context?.activity, zone: context?.zone };
  }

  return {
    metric,
    crewId: data.selected.id,
    crewName: data.selected.name,
    scenario: data.scenario,
    capturedAt: data.capturedAt,
    date: sample ? sampleDate.format(new Date(sample.at)) : data.date,
    time: sample?.time ?? data.time,
    activity: data.selected.activity,
    location: data.selected.location,
    sample: subjectContext,
    explicitSample: Boolean(selection),
    reference: reference && describeSample(reference),
  };
}

const asksDataContext =
  /\b(relacion\w*|vincul\w*|cruz[ao]\w*)\b|\b(que contexto|influ\w*|tuvo que ver|tiene que ver)\b/;

function explainMetricContext(
  query: string,
  context: AssistantMetricContext,
): AssistantReply | undefined {
  const { metric, crewName, date, time, activity, location } = context;
  if (signals.some(([id, pattern]) => id !== metric.id && pattern.test(query))) return;
  const asksChange =
    /\b(cambi\w*|diferencia|compar\w*|tendencia|subi\w*|baj\w*|aument\w*|disminu\w*)\b/.test(query);
  const asksLocation =
    /\b(donde (estaba|estuvo|estaban)|en que (modulo|lugar)|ubicacion|actividad)\b/.test(query);
  const asksMeaning =
    /\b(significa\w*|mide|dato|lectura|valor|explica\w*|resultado|normal|interpre\w*|por que)\b/.test(
      query,
    ) || signals.some(([, pattern]) => pattern.test(query));
  const asksRelationship = asksDataContext.test(query);
  if (!asksChange && !asksMeaning && !asksLocation && !asksRelationship) return;

  const { sample, reference } = context;
  const isSample = context.explicitSample;
  const intro = `Veamos la ${metric.label.toLowerCase()} de ${crewName}. Esta toma es de la simulación, del ${date} a las ${time}.`;
  const lines = [intro];
  if (!sample) {
    lines.push(`Sin lectura vigente. ${metric.lastReading}`);
    lines.push(
      asksChange ? 'Falta una lectura vigente para calcular el cambio.' : metricMeaning[metric.id],
    );
    if (asksLocation || asksRelationship)
      lines.push(`En la instantánea: ${activity} · ${location}.`);
    if (asksRelationship)
      lines.push(
        'Hay contexto para esa hora, pero falta el valor del indicador para compararlo con el entorno.',
      );
    lines.push('Podemos buscar la última toma disponible en Historial.');
    return { text: lines.join('\n') };
  }

  const { reading } = sample;
  lines.push(
    `${reading.value} · ${reading.missing ? 'Lectura ausente' : isSample ? 'Muestra disponible' : metric.quality}.`,
  );
  if (asksChange) {
    if (!reference) {
      lines.push('Elige una segunda muestra en Comparar dos muestras para calcular el cambio.');
    } else {
      const first = reference.reading;
      const second = reading;
      lines.push(`Referencia: ${first.value} a las ${first.time}.`);
      lines.push(
        first.numericValue != null && second.numericValue != null
          ? `Diferencia respecto a la referencia: ${formatTelemetryDifference(first.numericValue, second.numericValue, metric.unit)}.`
          : 'Falta una lectura para calcular la diferencia.',
      );
      lines.push(describeLocation(reference));
    }
  } else if (asksMeaning) {
    lines.push(metricMeaning[metric.id]);
  }
  if (asksLocation || asksChange || isSample || asksRelationship)
    lines.push(describeLocation(sample));
  if (asksRelationship) {
    if (sample.zone) {
      const readings = sample.zone.readings.map(
        ({ label, value, unit }) => `${label}: ${value} ${unit}`,
      );
      if (readings.length) lines.push(`Entorno simulado a esa hora: ${readings.join(' · ')}.`);
      lines.push(
        'La app vincula la muestra con la actividad y el módulo del mismo tripulante cuando coinciden en hora UTC. Esa coincidencia por sí sola no permite atribuir el valor a la actividad o al ambiente.',
      );
    } else {
      lines.push(
        'Para vincular esta muestra al ambiente hace falta una ubicación registrada para esa misma hora UTC.',
      );
    }
  }
  if (!asksRelationship && (asksChange || /\bpor que\b/.test(query)))
    lines.push('La serie por sí sola no establece la causa del cambio.');
  lines.push(
    asksRelationship
      ? 'Si quieres seguir explorando, elige otra hora en Historial y vemos si hay datos del lugar.'
      : 'Podemos seguir por Historial y mirar cómo cambió a lo largo del día.',
  );
  return { text: lines.join('\n') };
}

function describeLocation({ reading, zone, activity }: AssistantSample) {
  return zone
    ? `A las ${reading.time}: ${zone.name}${activity ? ` · ${activity}` : ''}.`
    : `Ubicación no registrada a las ${reading.time}.`;
}

function findMentionedCrew(question: string, data: MissionData) {
  const words = new Set(normalize(question).split(/[^a-z0-9]+/));
  return data.crew.find((member) =>
    getTumiCrewNames(member).some((name) => words.has(normalize(name))),
  );
}

export function tryAnswerMissionQuestion(
  question: string,
  data: MissionData | null,
  context?: AssistantMetricContext,
  previousMetric?: AssistantMetricContext,
  explorer = false,
): (AssistantReply & { discussedMetric?: AssistantMetricContext }) | undefined {
  const query = normalize(question);
  if (/\b(diagnostic\w*|tratamiento|medicamento|medicar|me duele|que enfermedad)\b/.test(query)) {
    return {
      text: 'Puedo explicar qué mide un indicador y mostrar su contexto simulado. Para evaluar síntomas o decidir un tratamiento, consulta a un profesional de salud.',
    };
  }

  const namedCrew = data && findMentionedCrew(question, data);
  if (namedCrew && namedCrew.id !== data?.selected.id) {
    return {
      text: `Vamos a mirar el registro de ${namedCrew.name}. Elige su nombre en Tripulación y vemos juntos lo que anotó.`,
      target: 'crew',
    };
  }
  const topic = missionTopics.find((item) => item.question.test(query));
  const navigationQuestion =
    /\b(como (puedo )?compar(?:ar|o|amos)|donde (puedo )?compar(?:ar|o|amos)|donde se compara|boton|ayuda para comparar)\b/.test(
      query,
    );
  if (navigationQuestion && !topic && data) return explainMission(query, data);

  const namedSignals = signals.filter(([, pattern]) => pattern.test(query));
  const namedMetric = namedSignals.length === 1 ? namedSignals[0][0] : undefined;
  const asksHowTheyFeel = /\b(como (?:se siente|se sintio)|como (?:esta|anda|va|le va))\b/.test(
    query,
  );
  const asksAboutSelected =
    /\b(quien es|que hace|que esta haciendo|(?:cuentame|hablame) (?:sobre|de))\b/.test(query) ||
    asksHowTheyFeel ||
    Boolean(
      namedCrew &&
      getTumiCrewNames(namedCrew).some(
        (name) => query.replace(/[¿?!.]/g, '').trim() === normalize(name),
      ),
    );
  const refersToCrew =
    namedCrew ||
    /\b(tripulante|astronauta|seleccionad[oa])\b/.test(query) ||
    /^(?:como (?:se siente|esta|anda|va|le va)|que esta haciendo)[?!. ]*$/.test(
      query.trim().replace(/^¿/, ''),
    );
  const asksForReadings = /\b(datos|lecturas|mediciones|signos|valores|resultados)\b/.test(query);
  if (
    data &&
    !topic &&
    !namedSignals.length &&
    !asksForReadings &&
    asksAboutSelected &&
    refersToCrew
  ) {
    return introduceCrew(data, asksHowTheyFeel);
  }
  const followsReading =
    asksDataContext.test(query) ||
    /\b(cambi\w*|diferencia|compar\w*|tendencia|subi\w*|baj\w*|donde (estaba|estuvo)|en que modulo|ubicacion)\b/.test(
      query,
    );
  const explicitContext =
    context &&
    namedSignals.length <= 1 &&
    (!namedMetric || namedMetric === context.metric.id) &&
    (!namedCrew || namedCrew.id === context.crewId)
      ? context
      : undefined;
  const reading =
    explicitContext ??
    (data && followsReading && namedSignals.length <= 1
      ? !namedMetric && previousMetric
        ? previousMetric
        : captureMetricContext(`metric-${namedMetric ?? data.metric.id}`, data)
      : undefined);
  if (topic && !explicitContext && !namedMetric && !asksDataContext.test(query)) return topic;
  const explanation = reading && explainMetricContext(query, reading);
  if (explanation) {
    return { ...explanation, discussedMetric: reading };
  }
  if (topic) return topic;
  if (!data) {
    return explorer
      ? {
          text: 'Para consultar una lectura, abre Tripulación y selecciona a la persona y el indicador que quieres entender.',
          target: 'crew',
        }
      : {
          text: 'La misión todavía está cargando. Vuelve a preguntar cuando aparezcan las lecturas.',
        };
  }
  const reply = explainMission(query, data);
  if (!reply) return;
  const discussedMetric = reply.target?.startsWith('metric-')
    ? captureMetricContext(reply.target, data)
    : undefined;
  return { ...reply, discussedMetric };
}

export function answerMissionQuestion(
  ...args: Parameters<typeof tryAnswerMissionQuestion>
): NonNullable<ReturnType<typeof tryAnswerMissionQuestion>> {
  return (
    tryAnswerMissionQuestion(...args) ?? {
      text:
        emotionalAcknowledgement(detectTextEmotion(args[0])) ??
        'Podemos mirar lo que te interese. Por ejemplo, dime qué lectura quieres entender o elige una en Historial y la revisamos juntos.',
    }
  );
}

function explainMission(query: string, data: MissionData): AssistantReply | undefined {
  if (/\b(comparar|comparo|comparamos|comparacion)\b/.test(query))
    return { text: actionTips.compare.text, target: 'compare' };
  if (/\brevisar (el )?chequeo\b/.test(query))
    return { text: actionTips['review-check'].text, target: 'review-check' };
  const control = guideControls.find(
    ({ id, label }) =>
      (id === 'journal' && /\bchequeo\b/.test(query)) || query.includes(normalize(label)),
  );
  if (control && /\b(boton|donde|como|sirve|ir|abro|abre|usar)\b/.test(query)) {
    return { text: control.text, target: control.id };
  }
  const asksEnvironment = /\b(entorno|cabina|modulo|ambiente|co2|humedad|ruido)\b/.test(query);
  const matches = asksEnvironment ? [] : signals.filter(([, pattern]) => pattern.test(query));
  if (matches.length || /\b(indicador|lectura|senal)\s+seleccionad[ao]\b/.test(query)) {
    const ids = matches.length ? matches.map(([id]) => id) : [data.metric.id];
    const readings = data.selected.metrics.filter(({ id }) => ids.includes(id));
    const text = readings
      .map((metric) => {
        const value =
          metric.value === '—'
            ? `Sin lectura vigente. ${metric.lastReading}`
            : `${metric.value} ${metric.unit}`;
        return `${metric.label}: ${value}. ${metricMeaning[metric.id]}`;
      })
      .join('\n');
    return {
      text: `Veamos qué marcó la simulación para ${data.selected.name} el ${spokenDate.format(new Date(data.capturedAt))}, a las ${data.time}.\n${text}\nAbre Historial y podemos comparar esa toma con otra del mismo día.`,
      target: readings.length === 1 ? `metric-${readings[0].id}` : 'history',
    };
  }
  if (/\b(chequeo|diario|fatiga|sueno|animo)\b/.test(query)) {
    const last = data.checks.find(({ id }) => id.startsWith(`${data.selected.id}:`));
    return {
      text: last
        ? `Último chequeo local de ${data.selected.name} · ${last.date}. Sueño registrado: ${last.sleep}. Fatiga percibida: ${last.fatigue}. Ánimo: ${last.mood}. Ejercicio: ${last.exerciseDone === undefined ? 'Sin responder' : last.exerciseDone ? 'Sí' : 'No'}. Son respuestas del chequeo. Abre el diario para ver el contexto de la actividad.`
        : `${data.selected.name} todavía no tiene chequeos locales. Puedes registrar descanso, fatiga y ánimo en Monitoreo diario.`,
      target: 'journal',
    };
  }
  if (asksEnvironment) {
    const zone = data.selectedZone;
    return {
      text: `Así estaba «${zone.name}» en la simulación a las ${data.time}: ${zone.readings.map(({ label, value, unit }) => `${label.toLowerCase()} de ${value} ${unit}`).join(', ')}. Abre el visor del hábitat en Tripulación y elige otro módulo para ver qué cambia.`,
      target: 'crew',
    };
  }
  if (/\b(resultados?|datos|mediciones|lecturas|signos|valores)\b/.test(query)) {
    const readings = new Intl.ListFormat('es', { type: 'conjunction' }).format(
      data.selected.metrics.map(({ id, label, value, unit }) => {
        if (value === '—') return `${label.toLowerCase()} sin lectura`;
        if (id === 'heartRate') return `un pulso de ${value} latidos por minuto`;
        if (id === 'respiration') return `${value} respiraciones por minuto`;
        if (id === 'temperature')
          return `una temperatura de ${value.replace('.', ',')} grados Celsius`;
        if (id === 'oxygen') return `un ${value} por ciento de saturación de oxígeno`;
        return `${label.toLowerCase()} de ${value} ${unit}`;
      }),
    );
    return {
      text: `Te cuento cómo estaba ${data.selected.name}${data.selected.role === 'Comandante' ? ', nuestra comandante,' : ''} el ${spokenDate.format(new Date(data.capturedAt))} en la simulación. A las ${data.time}, registró ${readings}. Es una foto de cómo estaba su cuerpo en ese momento. ¿Vemos en Historial si el pulso cambió entre tomas?`,
      target: 'crew',
    };
  }
  if (/\bresumen\b/.test(query)) return introduceCrew(data, false);
  if (control) return { text: control.text, target: control.id };
}
