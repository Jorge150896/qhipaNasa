import { z } from 'zod';
import {
  createHealthMeasurement,
  telemetryDefinitions,
} from '@/domain/measurements/HealthMeasurement';
import type { MonitoringJournal, MonitoringSession } from '@/domain/monitoring/models';
import type { KeyValueStorage } from '@/infrastructure/storage/KeyValueStorage';

const text = z.string().trim().min(1).max(200);
const instant = z.iso.datetime({ offset: true });
const measurementSchema = z.object({
  id: text,
  indicator: z.enum(['heartRate', 'temperature', 'oxygen', 'respiration']),
  value: z.number().finite().nullable(),
  unit: text,
  time: z.object({ kind: z.literal('instant'), at: instant }),
  subject: z.object({ kind: z.literal('individual'), id: text }),
  source: z.object({ kind: z.enum(['synthetic', 'device']), id: text }),
  method: z.enum(['simulated', 'instrument', 'derived']),
  quality: z.enum(['available', 'stale', 'missing']),
});
const sessionSchema = z
  .object({
    id: text,
    subjectId: text,
    subjectLabel: text,
    mode: z.enum(['demo', 'api']),
    savedAt: instant,
    note: z.string().max(1000),
    context: z.object({
      activity: z.enum(['cabin', 'exercise', 'surface', 'eva']),
      phase: z.enum(['before', 'during', 'after']),
      location: text,
      equipment: text,
    }),
    attempts: z
      .array(
        z.object({
          id: text,
          receivedAt: instant,
          measurements: z.array(measurementSchema).max(4),
        }),
      )
      .min(1)
      .max(20),
  })
  .superRefine((session, ctx) => {
    for (const attempt of session.attempts) {
      const indicators = new Set<string>();
      for (const sample of attempt.measurements) {
        try {
          createHealthMeasurement(sample, telemetryDefinitions[sample.indicator]);
          if (
            sample.subject.id !== session.subjectId ||
            indicators.has(sample.indicator) ||
            sample.source.kind !== (session.mode === 'demo' ? 'synthetic' : 'device')
          )
            throw new Error();
          indicators.add(sample.indicator);
        } catch {
          ctx.addIssue({ code: 'custom', message: 'Medición incompatible.' });
        }
      }
    }
  });
const journalSchema = z.object({ version: z.literal(1), sessions: z.array(sessionSchema).max(50) });

export class LocalMonitoringJournal implements MonitoringJournal {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly key: string,
  ) {}
  async load(): Promise<readonly MonitoringSession[]> {
    try {
      const raw = this.storage.read(this.key);
      if (raw === null) return [];
      const parsed = journalSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) throw new Error();
      return parsed.data.sessions;
    } catch {
      throw new Error(
        'No se pudo leer el registro local. Sus datos se han conservado; no se sobrescribirán.',
      );
    }
  }
  async save(session: MonitoringSession) {
    const existing = await this.load();
    if (existing.some((item) => item.id === session.id)) return existing;
    const parsed = journalSchema.safeParse({ version: 1, sessions: [session, ...existing] });
    if (!parsed.success)
      throw new Error(
        'No se puede guardar: sesión incompatible o límite de 50 sesiones alcanzado.',
      );
    try {
      this.storage.write(this.key, JSON.stringify(parsed.data));
    } catch {
      throw new Error('El navegador no permitió guardar. La sesión sigue abierta para reintentar.');
    }
    return parsed.data.sessions;
  }
}
