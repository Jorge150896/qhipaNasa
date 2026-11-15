import type { HealthEntryInput } from '../health/models';

export type DailyCheckHealthReport = Pick<
  HealthEntryInput,
  'systemId' | 'reportedState' | 'visionActivityId'
>;

export const dailyActivities = ['cabin', 'exercise', 'surface', 'eva'] as const;
export const dailyMoments = ['before', 'after', 'incident'] as const;
export const discomfortRegions = [
  'none',
  'head',
  'torso',
  'arms',
  'hands',
  'legs',
  'feet',
  'other',
] as const;

export const activityFields = {
  cabin: ['waterMl', 'restInterruptions'],
  exercise: ['durationMinutes', 'effort'],
  surface: ['durationMinutes', 'distanceKm'],
  eva: ['durationMinutes', 'handDiscomfort'],
} as const;

export type DailyActivity = (typeof dailyActivities)[number];
export type DailyMoment = (typeof dailyMoments)[number];
export type DiscomfortRegion = (typeof discomfortRegions)[number];
export type ActivityField = (typeof activityFields)[DailyActivity][number];

export const activityFieldLimits = {
  waterMl: { max: Infinity, integer: false },
  restInterruptions: { max: Infinity, integer: true },
  durationMinutes: { max: Infinity, integer: false },
  effort: { max: 10, integer: true },
  distanceKm: { max: Infinity, integer: false },
  handDiscomfort: { max: 5, integer: true },
} satisfies Record<ActivityField, { max: number; integer: boolean }>;

export interface DailyCheckContext {
  activity: DailyActivity;
  moment: DailyMoment;
  measurements: Partial<Record<ActivityField, number>>;
}

export function validDailyCheckContext(context: DailyCheckContext) {
  if (!dailyActivities.includes(context.activity) || !dailyMoments.includes(context.moment))
    return false;
  if (
    !context.measurements ||
    typeof context.measurements !== 'object' ||
    Array.isArray(context.measurements)
  )
    return false;
  const allowed: readonly string[] = activityFields[context.activity];
  return Object.entries(context.measurements).every(([key, value]) => {
    if (!allowed.includes(key) || typeof value !== 'number' || !Number.isFinite(value) || value < 0)
      return false;
    const limits = activityFieldLimits[key as ActivityField];
    return value <= limits.max && (!limits.integer || Number.isInteger(value));
  });
}
