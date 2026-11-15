import { useState } from 'react';
import type { MonthlyWellbeing } from '@/domain/mission/monthlyWellbeing';
import {
  getWellbeingRoute,
  simulateHabitRoute,
  type HabitResult,
} from '@/domain/mission/wellbeingRoute';

const date = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const mood = { good: 'Bien', neutral: 'Regular', low: 'Bajo' } as const;

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

export function useSimulationViewModel(report?: MonthlyWellbeing) {
  const [dayIndex, setDayIndex] = useState(() => (report?.days.length ?? 1) - 1);
  const [habits, setHabits] = useState<Partial<Record<Habit, HabitResult>>>({});
  const position = report && getWellbeingRoute(report.days, dayIndex);
  const { food, exercise, social } = habits;
  const trial =
    food && exercise && social ? simulateHabitRoute([food, exercise, social]) : undefined;
  const route = trial ?? position?.route;

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
      setHabits((current) => ({
        ...current,
        [id]: habitValues.find((option) => option === value),
      }));
    },
    resetHabits() {
      setHabits({});
    },
    dayIndex,
    setDayIndex,
    days: report?.days.map((day) => ({
      number: day.day,
      label: `Día ${day.day} · ${date.format(new Date(day.dateUtc))}`,
    })),
    position: position && {
      route: position.route,
      mood: mood[position.day.checkIn.mood],
      exercise: position.day.checkIn.exerciseDonePreviousDay ? 'Sí' : 'No',
      isolation: position.day.checkIn.proposedAnswers.perceivedIsolation,
      sleep: `${position.day.checkIn.sleepHours.toLocaleString('es-PE')} h`,
      fatigue: `${position.day.checkIn.fatigue}/5`,
      reason: position.requestedSupport
        ? `Pidió apoyo en la ventana de ${position.count} días.`
        : `Ánimo bueno en ${position.good} de ${position.count} días y bajo en ${position.low}.`,
    },
  };
}
