import { z } from 'zod';
import type { MonthlyWellbeing } from '@/domain/mission/monthlyWellbeing';
import fixture from '../../../../docs/product/simulacion-confinamiento/odyssey-30-dias.json';

const mood = z.enum(['good', 'neutral', 'low']);
const reading = z.object({
  id: z.enum(['heartRate', 'temperature', 'oxygen', 'respiration']),
  at: z.string().nullable(),
  value: z.number().nullable(),
  unit: z.string(),
  quality: z.enum(['available', 'stale', 'missing']),
});
const crewDay = z.object({
  crewId: z.string(),
  source: z.literal('synthetic'),
  day: z.number().int(),
  dateUtc: z.string(),
  missionDay: z.number().int(),
  nightId: z.string(),
  checkIn: z.object({
    atUtc: z.string(),
    sleepHours: z.number(),
    mood,
    fatigue: z.number().int(),
    exerciseDonePreviousDay: z.boolean(),
    restInterruptions: z.number().int(),
    workloadPreviousDay: z.string(),
    note: z.string().nullable(),
    proposedAnswers: z.object({
      perceivedIsolation: z.number().int().min(0).max(4).nullable(),
      perceivedConfinement: z.number().int().min(0).max(4).nullable(),
      routineInterference: z.number().int().min(0).max(4).nullable(),
      requestSupport: z.boolean().nullable(),
    }),
  }),
  readings: z.array(reading),
});
const weeks = fixture.summary;
const crewProfiles = fixture.crew;
const raw = z.array(crewDay).parse(fixture.crewDays);
const cabins = new Map(fixture.nightlyCabin.map((night) => [night.id, night]));

export function readMonthlyWellbeing(
  habitatId: string,
  crewId: string,
): MonthlyWellbeing | undefined {
  if (habitatId !== fixture.habitatId || !isProfile(crewId)) return;
  const profile = crewProfiles[crewId];
  const days = raw
    .filter((day) => day.crewId === crewId)
    .flatMap((day) => {
      const cabin = cabins.get(day.nightId);
      return cabin ? [{ ...day, cabin }] : [];
    });
  if (days.length !== fixture.period.days) return;
  return {
    crewName: profile.name,
    trajectory: profile.trajectory,
    source: 'synthetic',
    days,
    firstWeek: weeks[crewId].days1to7,
    lastWeek: weeks[crewId].days24to30,
  };
}

function isProfile(crewId: string): crewId is keyof typeof crewProfiles {
  return Object.hasOwn(crewProfiles, crewId);
}
