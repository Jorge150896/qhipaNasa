import { z } from 'zod';
import {
  healthSystemIds,
  reportedStates,
  visionActivityIds,
  type CrewHealthRepository,
  type HealthEntry,
  type HealthJournal,
  type HealthReview,
} from '@/domain/health/models';
import type { KeyValueStorage } from '@/infrastructure/storage/KeyValueStorage';
const schema = z.object({
  version: z.literal(1),
  entries: z
    .array(
      z.object({
        id: z.string().min(1),
        crewId: z.string().min(1),
        systemId: z.enum(healthSystemIds),
        reportedState: z.enum(reportedStates),
        note: z.string().max(600),
        activity: z.string().max(80),
        minutes: z.number().min(0).max(1440).nullable(),
        zoneId: z.string().min(1).max(80).optional(),
        visionActivityId: z.enum(visionActivityIds).optional(),
        recordedAt: z.iso.datetime(),
      }),
    )
    .max(500),
  reviews: z
    .array(
      z.object({
        crewId: z.string().min(1),
        systemId: z.enum(healthSystemIds),
        day: z.iso.date(),
        reviewed: z.boolean(),
        recordedAt: z.iso.datetime(),
      }),
    )
    .max(1500),
});
export class LocalCrewHealthRepository implements CrewHealthRepository {
  private readonly key: string;
  constructor(
    private readonly storage: KeyValueStorage,
    habitatId: string,
  ) {
    this.key = `astra.demo.health.v1:${habitatId}`;
  }
  async load(): Promise<HealthJournal> {
    const saved = this.storage.read(this.key);
    if (saved === null) return { entries: [], reviews: [] };
    const result = schema.safeParse(JSON.parse(saved));
    if (!result.success) throw new Error('El registro de salud no tiene un formato compatible.');
    return { entries: result.data.entries, reviews: result.data.reviews };
  }
  private persist(journal: HealthJournal) {
    const validated = schema.parse({ version: 1, ...journal });
    this.storage.write(this.key, JSON.stringify(validated));
    return journal;
  }
  async addEntry(entry: HealthEntry) {
    const journal = await this.load();
    if (journal.entries.length >= 500)
      throw new Error('Se alcanzó el límite de registros locales.');
    return this.persist({ ...journal, entries: [entry, ...journal.entries] });
  }
  async setReview(review: HealthReview) {
    const journal = await this.load();
    const reviews = journal.reviews.filter(
      (item) =>
        !(
          item.crewId === review.crewId &&
          item.systemId === review.systemId &&
          item.day === review.day
        ),
    );
    return this.persist({ ...journal, reviews: [review, ...reviews] });
  }
}
