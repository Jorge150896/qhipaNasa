import type { WellbeingDay } from './monthlyWellbeing';

export type WellbeingRoute = 'routine' | 'adjustment' | 'support';

export function getWellbeingRoute(days: readonly WellbeingDay[], selectedIndex: number) {
  const day = days[selectedIndex];
  if (!day) return;

  const recent = days.slice(Math.max(0, selectedIndex - 6), selectedIndex + 1);
  const low = recent.filter(({ checkIn }) => checkIn.mood === 'low').length;
  const good = recent.filter(({ checkIn }) => checkIn.mood === 'good').length;
  const requestedSupport = recent.some(({ checkIn }) => checkIn.proposedAnswers.requestSupport);
  const route: WellbeingRoute =
    requestedSupport || low > recent.length / 2
      ? 'support'
      : good === recent.length
        ? 'routine'
        : 'adjustment';

  return { route, day, count: recent.length, low, good, requestedSupport };
}

export type HabitResult = 'supportive' | 'usual' | 'reduced';

const habitPoints: Record<HabitResult, number> = {
  supportive: 1,
  usual: 0,
  reduced: -1,
};

export function simulateHabitRoute(results: readonly HabitResult[]): WellbeingRoute {
  const total = results.reduce((sum, result) => sum + habitPoints[result], 0);
  return total >= 2 ? 'routine' : total <= -2 ? 'support' : 'adjustment';
}
