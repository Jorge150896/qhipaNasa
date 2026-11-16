import { useAppLanguage, useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useEffect, useMemo, useState } from 'react';
import type { MonthlyWellbeing } from '@/domain/mission/monthlyWellbeing';
import {
  getWellbeingRoute,
  simulateHabitRoute,
  type HabitResult,
} from '@/domain/mission/wellbeingRoute';
import { wellbeingPlaybackSeconds, wellbeingRouteLabels, type WellbeingRoute } from './types';

const mood = { good: 'Bien', neutral: 'Regular', low: 'Bajo' } as const;
const playbackDuration = wellbeingPlaybackSeconds * 1000;

const habitFields = [
  {
    id: 'food',
    label: 'Alimentación',
    options: ['Comió bien', 'Conservó su rutina', 'Comió menos o saltó comidas'],
  },
  {
    id: 'exercise',
    label: 'Ejercicio',
    options: ['Se mantuvo activo', 'Actividad habitual', 'Dejó de hacer ejercicio'],
  },
  {
    id: 'social',
    label: 'Contacto social',
    options: ['Conversó con amigos', 'Contacto habitual', 'Se apartó del grupo'],
  },
] as const;
const habitValues = ['supportive', 'usual', 'reduced'] as const;
type Habit = (typeof habitFields)[number]['id'];
type DailyRoute = NonNullable<ReturnType<typeof getWellbeingRoute>>;

const guidanceByRoute = {
  routine: {
    personal:
      'Conserva los hábitos que te han funcionado y reserva tiempo para descansar y comer con regularidad.',
    team: 'Pregúntale qué parte de su rutina le está ayudando y procura respetar sus pausas.',
  },
  adjustment: {
    personal:
      'Elige un ajuste pequeño, como reservar una pausa o hablar con alguien de confianza. Evita intentar cambiar todo de golpe.',
    team: 'Pregúntale qué le facilitaría el día y ofrece ayuda con una tarea concreta. Dale espacio para decidir.',
  },
  support: {
    personal:
      'Si los últimos días te han pesado, pide un momento privado para hablar con alguien de confianza o con el equipo de apoyo. Puedes empezar contando cómo te has sentido.',
    team: 'Escucha con calma y pregunta qué ayuda le serviría. Ofrece ir a su lado a hablar con el equipo de apoyo y evita minimizar lo que cuenta.',
  },
} satisfies Record<WellbeingRoute, { personal: string; team: string }>;

function summarizeMonth(
  crewName: string,
  days: readonly DailyRoute[],
  t: ReturnType<typeof useTranslation>,
) {
  const first = days[0];
  const last = days.at(-1);
  if (!first || !last) return;

  const firstLabel = wellbeingRouteLabels[first.route];
  const lastLabel = wellbeingRouteLabels[last.route];
  const opening = t(
    first.route === last.route
      ? `En el mes simulado, ${crewName} empezó y terminó en ${firstLabel}.`
      : `En el mes simulado, ${crewName} empezó en ${firstLabel} y terminó en ${lastLabel}.`,
  );
  const change =
    days.find(({ route }) => route === 'support' && route !== first.route) ??
    days.find(({ route }) => route !== first.route);
  const transition = change
    ? t(`El día ${change.day.day} pasó a ${wellbeingRouteLabels[change.route]}.`)
    : t('La ruta se mantuvo durante todo el recorrido.');
  const finalWeek = days.slice(-7);
  const low = finalWeek.filter(({ day }) => day.checkIn.mood === 'low').length;
  const supportRequested = finalWeek.some(({ day }) => day.checkIn.proposedAnswers.requestSupport);
  const closing = t(
    `Al cierre, reportó ánimo bajo en ${low} de los últimos ${finalWeek.length} días.`,
  );
  return [opening, transition, closing, supportRequested && t('También pidió apoyo en esos días.')]
    .filter(Boolean)
    .join(' ');
}

export function useSimulationViewModel(report?: MonthlyWellbeing) {
  const { language } = useAppLanguage();
  const t = useTranslation();
  const locale = language === 'en' ? 'en-US' : 'es-PE';
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const positions = useMemo(
    () =>
      report?.days
        .map((_, index) => getWellbeingRoute(report.days, index))
        .filter((position) => position !== undefined),
    [report],
  );
  const lastDay = Math.max(0, (positions?.length ?? 1) - 1);
  const [dayIndex, setDayIndex] = useState(lastDay);
  const [playback, setPlayback] = useState<{
    elapsed: number;
    startedAt?: number;
    completed?: boolean;
  }>();
  const [habits, setHabits] = useState<Partial<Record<Habit, HabitResult>>>({});
  const position = positions?.[dayIndex];
  const { food, exercise, social } = habits;
  const trial =
    !playback && food && exercise && social
      ? simulateHabitRoute([food, exercise, social])
      : undefined;
  const route = trial ?? position?.route;
  const playing = playback?.startedAt !== undefined;
  const guidance = route && {
    personal: t(guidanceByRoute[route].personal),
    team: t(guidanceByRoute[route].team),
  };

  useEffect(() => {
    if (playback?.startedAt === undefined || lastDay === 0) return;
    const { elapsed: offset, startedAt } = playback;
    let timer: ReturnType<typeof setTimeout>;
    function advance() {
      const elapsed = Math.min(playbackDuration, offset + performance.now() - startedAt);
      const index = Math.floor((elapsed * lastDay) / playbackDuration);
      setDayIndex(index);
      if (index === lastDay) {
        setPlayback({ elapsed: playbackDuration, completed: true });
      } else {
        const nextDayAt = ((index + 1) * playbackDuration) / lastDay;
        timer = setTimeout(advance, Math.max(1, Math.ceil(nextDayAt - elapsed)));
      }
    }
    timer = setTimeout(advance, 0);
    return () => clearTimeout(timer);
  }, [lastDay, playback]);

  const point = route && {
    route,
    index: !trial && position?.requestedSupport ? 2 : 1,
    source: trial ? 'Prueba de hábitos' : 'Autorregistros simulados',
  };

  return {
    point,
    trial,
    habitFields: habitFields.map(({ id, label, options }) => ({
      id,
      label,
      value: habits[id] ?? '',
      options: options.map((text, index) => ({ text, value: habitValues[index] })),
    })),
    setHabit(id: Habit, value: string) {
      setPlayback(undefined);
      setHabits((current) => ({
        ...current,
        [id]: habitValues.find((option) => option === value),
      }));
    },
    resetHabits() {
      setHabits({});
    },
    dayIndex,
    setDayIndex(index: number) {
      if (index < 0 || index > lastDay || !Number.isInteger(index)) return;
      setDayIndex(index);
      setPlayback({ elapsed: lastDay ? (index * playbackDuration) / lastDay : 0 });
    },
    playing,
    playbackEndsAt:
      playback?.startedAt === undefined
        ? undefined
        : playback.startedAt + playbackDuration - playback.elapsed,
    playbackCompleted: playback?.completed === true,
    guidance,
    summary:
      playback?.completed && report && positions
        ? summarizeMonth(report.crewName, positions, t)
        : undefined,
    canResume: Boolean(playback && playback.elapsed > 0 && playback.elapsed < playbackDuration),
    togglePlayback() {
      if (playback?.startedAt !== undefined) {
        const elapsed = Math.min(
          playbackDuration,
          playback.elapsed + performance.now() - playback.startedAt,
        );
        setDayIndex(Math.floor((elapsed * lastDay) / playbackDuration));
        setPlayback({ elapsed, completed: elapsed === playbackDuration });
      } else {
        const elapsed = playback && playback.elapsed < playbackDuration ? playback.elapsed : 0;
        if (elapsed === 0) setDayIndex(0);
        setPlayback({ elapsed, startedAt: performance.now() });
      }
    },
    restartPlayback() {
      setDayIndex(0);
      setPlayback({ elapsed: 0, startedAt: performance.now() });
    },
    days: positions?.map(({ day, route }) => ({
      number: day.day,
      label: `Día ${day.day} · ${date.format(new Date(day.dateUtc))}`,
      route,
    })),
    position: position && {
      route: position.route,
      mood: mood[position.day.checkIn.mood],
      exercise: position.day.checkIn.exerciseDonePreviousDay ? 'Sí' : 'No',
      isolation: position.day.checkIn.proposedAnswers.perceivedIsolation,
      sleep: `${position.day.checkIn.sleepHours.toLocaleString(locale)} h`,
      fatigue: `${position.day.checkIn.fatigue}/5`,
      reason: position.requestedSupport
        ? `Pidió apoyo en la ventana de ${position.count} días.`
        : `Ánimo bueno en ${position.good} de ${position.count} días y bajo en ${position.low}.`,
    },
  };
}
