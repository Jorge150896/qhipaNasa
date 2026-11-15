import { z } from 'zod';
import type { CrewJournal, DailyCheck } from '@/domain/mission/models';
import type { CrewJournalRepository } from '@/domain/mission/ports';
import type { KeyValueStorage } from '@/infrastructure/storage/KeyValueStorage';
import {
  dailyActivities,
  dailyMoments,
  discomfortRegions,
  validDailyCheckContext,
} from '@/domain/mission/dailyCheckContext';

import { healthSystemIds, reportedStates, visionActivityIds } from '@/domain/health/models';
import {
  checkDataQualities,
  checkMetricIds,
  gravityContexts,
  validDailyCheckAttachment,
} from '@/domain/mission/dailyCheckAttachment';

const attachmentSchema = z
  .object({
    snapshotId: z.string().min(1),
    capturedAt: z.iso.datetime(),
    source: z.literal('synthetic'),
    habitat: z.string().min(1),
    gravity: z.enum(gravityContexts),
    zone: z
      .object({
        id: z.string().min(1),
        name: z.string().min(1),
        temperature: z.number(),
        co2: z.number(),
        humidity: z.number(),
      })
      .optional(),
    readings: z.array(
      z.object({
        id: z.enum(checkMetricIds),
        at: z.iso.datetime().optional(),
        value: z.number().nullable(),
        unit: z.string().min(1),
        quality: z.enum(checkDataQualities),
      }),
    ),
  })
  .refine(validDailyCheckAttachment);

const checkContextSchema = z
  .object({
    activity: z.enum(dailyActivities),
    moment: z.enum(dailyMoments),
    measurements: z.strictObject({
      waterMl: z.number().optional(),
      restInterruptions: z.number().optional(),
      durationMinutes: z.number().optional(),
      effort: z.number().optional(),
      distanceKm: z.number().optional(),
      handDiscomfort: z.number().optional(),
    }),
  })
  .refine(validDailyCheckContext);

const journalSchema = z.object({
  version: z.literal(1),
  checks: z
    .array(
      z.object({
        id: z.string().min(1),
        crewId: z.string().min(1),
        recordedAt: z.iso.datetime(),
        sleepHours: z.number().min(0).max(24),
        fatigue: z.number().int().min(1).max(5).optional(),
        mood: z.enum(['good', 'neutral', 'low']).optional(),
        note: z.string().max(400),
        exerciseDone: z.boolean().optional(),
        attachment: attachmentSchema.optional(),
        healthReport: z
          .object({
            systemId: z.enum(healthSystemIds),
            reportedState: z.enum(reportedStates),
            visionActivityId: z.enum(visionActivityIds).optional(),
          })
          .refine((report) => !report.visionActivityId || report.systemId === 'vision')
          .optional(),
        context: checkContextSchema.optional(),
        discomfortRegion: z.enum(discomfortRegions).optional(),
      }),
    )
    .max(300),
  reviewedObservationIds: z.array(z.string().min(1)).max(500),
});
export class LocalCrewJournalRepository implements CrewJournalRepository {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly key = 'astra.demo.journal.v1',
  ) {}
  private read(): CrewJournal {
    const value = this.storage.read(this.key);
    if (!value) return { checks: [], reviewedObservationIds: [] };
    const result = journalSchema.safeParse(JSON.parse(value));
    if (!result.success) throw new Error('El registro local no tiene un formato compatible.');
    return {
      checks: result.data.checks,
      reviewedObservationIds: result.data.reviewedObservationIds,
    };
  }
  private persist(journal: CrewJournal) {
    this.storage.write(this.key, JSON.stringify({ version: 1, ...journal }));
    return journal;
  }
  async load() {
    return this.read();
  }
  async saveCheck(check: DailyCheck) {
    const journal = this.read();
    return this.persist({
      ...journal,
      checks: [check, ...journal.checks.filter((item) => item.id !== check.id)].slice(0, 300),
    });
  }
  async setReviewed(id: string, reviewed: boolean) {
    const journal = this.read();
    const ids = new Set(journal.reviewedObservationIds);
    if (reviewed) ids.add(id);
    else ids.delete(id);
    return this.persist({ ...journal, reviewedObservationIds: [...ids].slice(-500) });
  }
}
