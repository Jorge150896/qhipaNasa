import { useState } from 'react';
import type { MonthlyWellbeing, WellbeingDay } from '@/domain/mission/monthlyWellbeing';
import { metricLabels } from '../../mission/constants';

const date = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const number = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
const moods = { good: 'Bien', neutral: 'Regular', low: 'Bajo' };
const moodLevels = { good: 3, neutral: 2, low: 1 };
const events: Record<string, string> = {
  normal: 'Sin incidencia ambiental programada',
  'ventilation-maintenance': 'Mantenimiento de ventilación y más ruido',
  'warm-cabin': 'Cabina más cálida',
};
const metricOptions = [
  { id: 'mood', label: 'Ánimo reportado', unit: '', max: 3 },
  { id: 'sleep', label: 'Sueño', unit: 'h', max: 9 },
  { id: 'isolation', label: 'Aislamiento', unit: '/ 4', max: 4 },
  { id: 'confinement', label: 'Confinamiento', unit: '/ 4', max: 4 },
  { id: 'pulse', label: 'Pulso en reposo', unit: 'lpm', max: 100 },
  { id: 'co2', label: 'CO₂ de cabina', unit: 'ppm', max: 1250 },
] as const;

const formatDay = (value: string) => date.format(new Date(value));
const formatAnswer = (value: number | null) => (value === null ? 'Sin responder' : `${value}/4`);
const yesNo = (value: boolean | null) => (value === null ? 'Sin responder' : value ? 'Sí' : 'No');
const pulse = (day: WellbeingDay) =>
  day.readings.find(({ id }) => id === 'heartRate')?.value ?? null;

function dayReply(name: string, { dateUtc, day, checkIn, cabin }: WellbeingDay) {
  const answers = checkIn.proposedAnswers;
  return `En la simulación, ${name} reportó ánimo ${moods[checkIn.mood].toLowerCase()} el ${formatDay(dateUtc)} (día ${day}), con ${number.format(checkIn.sleepHours)} h de sueño y fatiga de ${checkIn.fatigue}/5. Aislamiento: ${formatAnswer(answers.perceivedIsolation)}. Confinamiento: ${formatAnswer(answers.perceivedConfinement)}. ${answers.requestSupport === true ? 'Ese día pidió hablar en privado con el equipo de apoyo. ' : ''}La cabina compartida registró ${number.format(cabin.airTemperatureC)} °C y ${number.format(cabin.co2Ppm)} ppm de CO₂ en la simulación. Estos datos describen el contexto de esa noche.`;
}

function wellbeingOutlook(report: MonthlyWellbeing, dayNumber: number, personal = false) {
  const week = report.days.slice(Math.max(0, dayNumber - 7), dayNumber);
  const lowDays = week.filter(({ checkIn }) => checkIn.mood === 'low').length;
  const goodDays = week.filter(({ checkIn }) => checkIn.mood === 'good').length;
  const regularDays = week.length - lowDays - goodDays;
  const askedForSupport = week.some(({ checkIn }) => checkIn.proposedAnswers.requestSupport);
  const earlierDays = week.length < 7;
  let outlook = earlierDays
    ? 'En esta parte de la simulación todavía estamos conociendo la rutina.'
    : 'En la simulación hubo una mezcla de días distintos. Si sigue ese patrón, el ánimo podría volver a fluctuar.';
  let suggestion = 'Podemos empezar por algo pequeño: anotar cuándo cuesta más mantener la rutina.';
  if (!earlierDays && lowDays > week.length / 2) {
    outlook = `Si sigue esta tendencia en la simulación, el ánimo podría seguir bajo: apareció en ${lowDays} de los últimos 7 días.`;
    suggestion =
      'Suena a una semana pesada. ¿Y si buscamos un momento tranquilo para conversar con alguien de confianza?';
  } else if (!earlierDays && goodDays > week.length / 2) {
    outlook = `Si se mantiene la rutina en la simulación, es posible que siga teniendo buenos días: reportó buen ánimo en ${goodDays} de los últimos 7.`;
    suggestion =
      'Vale la pena cuidar lo que ya funciona. ¿Qué parte de la rutina sería fácil repetir mañana?';
  } else if (!earlierDays && regularDays > week.length / 2) {
    outlook = `Si sigue el patrón de la simulación, puede que el ánimo se mantenga regular: se registró en ${regularDays} de los últimos 7 días.`;
    suggestion = '¿Y si elegimos una pausa breve que ya haya sentado bien y vemos cómo va mañana?';
  }
  if (askedForSupport) {
    suggestion = `Ya ${personal ? 'pediste' : 'pidió'} hablar en privado esta semana. ¿Qué tal reservar un momento con el equipo de apoyo hoy? Podemos pensar cómo iniciar esa conversación.`;
  }
  return { outlook, suggestion };
}

export function useMonthlyWellbeingViewModel(report: MonthlyWellbeing) {
  const [dayNumber, setDay] = useState(report.days.length);
  const [metricId, setMetric] = useState<(typeof metricOptions)[number]['id']>('mood');
  const day = report.days[dayNumber - 1];
  const check = day.checkIn;
  const reply = dayReply(report.crewName, day);
  const start = report.firstWeek;
  const end = report.lastWeek;
  const selectedMetric = metricOptions.find(({ id }) => id === metricId) ?? metricOptions[0];
  const trajectoryLabels: Record<string, string> = {
    stable: 'Rutina estable',
    'variable-recovery': 'Altibajos y recuperación',
    'progressive-strain': 'Cambios sostenidos',
  };
  const summary = [
    { label: 'Sueño medio', from: start.averageSleepHours, to: end.averageSleepHours, unit: 'h' },
    {
      label: 'Aislamiento percibido',
      from: start.averagePerceivedIsolation,
      to: end.averagePerceivedIsolation,
      unit: '/ 4',
    },
    {
      label: 'Ejercicio registrado',
      from: start.exerciseDaysReported,
      to: end.exerciseDaysReported,
      unit: 'de 7 días',
    },
    {
      label: 'Días con ánimo bajo',
      from: start.moodDays.low ?? 0,
      to: end.moodDays.low ?? 0,
      unit: 'de 7 días',
    },
  ];
  const monthReply = `En los 30 días simulados de ${report.crewName}, el sueño medio fue de ${number.format(start.averageSleepHours)} a ${number.format(end.averageSleepHours)} h y el aislamiento percibido de ${number.format(start.averagePerceivedIsolation)} a ${number.format(end.averagePerceivedIsolation)}/4 entre la primera y la última semana. Registró ejercicio ${start.exerciseDaysReported} y ${end.exerciseDaysReported} días en esas semanas, respectivamente. ${end.moodDays.low ?? 0} de los últimos 7 días reportó ánimo bajo.`;
  const { outlook, suggestion } = wellbeingOutlook(report, dayNumber);

  const points = report.days.map((item) => ({
    day: item.day,
    value: {
      mood: moodLevels[item.checkIn.mood],
      sleep: item.checkIn.sleepHours,
      isolation: item.checkIn.proposedAnswers.perceivedIsolation,
      confinement: item.checkIn.proposedAnswers.perceivedConfinement,
      pulse: pulse(item),
      co2: item.cabin.co2Ppm,
    }[metricId],
  }));
  const dailyColumns = report.days.map((item) => {
    const c = item.checkIn;
    const a = c.proposedAnswers;
    const n = item.cabin;
    return [
      item.day,
      item.dateUtc,
      moods[c.mood],
      c.sleepHours,
      c.fatigue,
      a.perceivedIsolation,
      a.perceivedConfinement,
      a.routineInterference,
      c.exerciseDonePreviousDay ? 'sí' : 'no',
      a.requestSupport === null ? '—' : yesNo(a.requestSupport),
      pulse(item),
      item.readings.find(({ id }) => id === 'temperature')?.value,
      item.readings.find(({ id }) => id === 'oxygen')?.value,
      item.readings.find(({ id }) => id === 'respiration')?.value,
      n.co2Ppm,
      n.airTemperatureC,
      n.relativeHumidityPct,
      n.noiseDb,
      c.workloadPreviousDay,
    ]
      .map((value) => value ?? '—')
      .join('|');
  });
  const questions = [
    { label: 'Ánimo reportado', value: moods[check.mood] },
    { label: 'Sueño', value: `${number.format(check.sleepHours)} h` },
    { label: 'Fatiga percibida', value: `${check.fatigue}/5` },
    {
      label: 'Aislamiento percibido',
      value: formatAnswer(check.proposedAnswers.perceivedIsolation),
    },
    {
      label: 'Confinamiento percibido',
      value: formatAnswer(check.proposedAnswers.perceivedConfinement),
    },
    {
      label: 'Dificultad para mantener la rutina',
      value: formatAnswer(check.proposedAnswers.routineInterference),
    },
    { label: 'Ejercicio del día previo', value: yesNo(check.exerciseDonePreviousDay) },
    { label: 'Pidió apoyo privado', value: yesNo(check.proposedAnswers.requestSupport) },
    { label: 'Interrupciones del descanso', value: String(check.restInterruptions) },
    { label: 'Carga de trabajo previa', value: check.workloadPreviousDay },
  ];
  return {
    reportName: report.crewName,
    trajectory: trajectoryLabels[report.trajectory],
    period: `${formatDay(report.days[0].dateUtc)} – ${formatDay(report.days.at(-1)!.dateUtc)} de 2026`,
    dayLabel: `Día ${dayNumber} · ${formatDay(day.dateUtc)}`,
    dayNumber,
    length: report.days.length,
    setDay,
    metricOptions,
    setMetric,
    selectedMetric,
    selectedValue:
      metricId === 'mood'
        ? moods[check.mood]
        : points[dayNumber - 1].value === null
          ? 'Sin dato'
          : `${number.format(points[dayNumber - 1].value!)} ${selectedMetric.unit}`,
    points,
    summary: summary.map(({ label, from, to, unit }) => ({
      label,
      value: `${number.format(from)} → ${number.format(to)} ${unit}`,
    })),
    questions,
    note: check.note,
    readings: day.readings.map((reading) => ({
      label: metricLabels[reading.id].label,
      value:
        reading.value === null ? 'Sin muestra' : `${number.format(reading.value)} ${reading.unit}`,
    })),
    cabin: [
      { label: 'Temperatura', value: `${number.format(day.cabin.airTemperatureC)} °C` },
      { label: 'CO₂', value: `${number.format(day.cabin.co2Ppm)} ppm` },
      { label: 'Humedad relativa', value: `${number.format(day.cabin.relativeHumidityPct)} %` },
      { label: 'Ruido', value: `${number.format(day.cabin.noiseDb)} dB` },
    ],
    event: events[day.cabin.event],
    context: [
      `Seguimiento mensual ficticio de ${report.crewName}. Los estados emocionales son autorreportes sintéticos. Las coincidencias con ambiente, carga o signos no establecen causa.`,
      reply,
      monthReply,
      `Proyección simulada desde el día ${dayNumber}: ${outlook} Próximo paso de bienestar: ${suggestion}`,
      'Serie de los 30 días (— = dato ausente o respuesta omitida): día | fecha UTC | ánimo reportado | sueño h | fatiga/5 | aislamiento/4 | confinamiento/4 | dificultad rutina/4 | ejercicio previo | apoyo solicitado | pulso lpm | temperatura corporal °C | SpO₂ % | respiración rpm | CO₂ ppm | cabina °C | humedad % | ruido dB | carga previa.',
      ...dailyColumns,
    ],
    answerQuestion(question: string) {
      const normalized = question
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
      const requestedDay = /\bdia\s+(\d+)\b/.exec(normalized);
      const wantsOutlook =
        /\b(predic\w*|predec\w*|proyeccion|pronostic\w*|manana|proxim[oa]s?|recom\w*|consejos?|sentir(?:a|e)|como (?:puedo|podemos) (?:ayudar|mejorar)|que (?:puedo|podemos) hacer|que (?:pasara|podria pasar))\b/.test(
          normalized,
        );
      if (/\b(donde|como (registro|anoto|guardo))\b/.test(normalized)) return;
      if (wantsOutlook) {
        const referenceDay = requestedDay ? Number(requestedDay[1]) : dayNumber;
        const reference = report.days[referenceDay - 1];
        if (!reference) return `La simulación tiene días 1 a ${report.days.length}.`;
        const mood = moods[reference.checkIn.mood].toLowerCase();
        const personal = /\b(como me senti\w*|me siento|sentirme|mi animo|mi registro)\b/.test(
          normalized,
        );
        const next = wellbeingOutlook(report, referenceDay, personal);
        const subject = personal
          ? 'En tu registro simulado anotaste'
          : `${report.crewName.split(' ')[0]} reportó`;
        return `${subject} ánimo ${mood} el día ${referenceDay}. ${next.outlook} ${next.suggestion}`;
      }
      if (
        !requestedDay &&
        !/\b(mes|30 dias|confinamiento|aislamiento|animo|sintio|seguimiento)\b/.test(normalized)
      )
        return;
      if (requestedDay) {
        const selected = report.days[Number(requestedDay[1]) - 1];
        return selected
          ? dayReply(report.crewName, selected)
          : `La simulación tiene días 1 a ${report.days.length}.`;
      }
      return /\b(mes|30 dias|seguimiento|evolucion|tendencia)\b/.test(normalized)
        ? monthReply
        : reply;
    },
  };
}
