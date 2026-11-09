import { CheckValidationError, type Clock, type DailyCheckInput } from '../mission/models';
import type { CrewJournalRepository } from '../mission/ports';
export class LoadCrewJournal {
  constructor(private readonly repository: CrewJournalRepository) {}
  execute() {
    return this.repository.load();
  }
}
export class RecordDailyCheck {
  constructor(
    private readonly repository: CrewJournalRepository,
    private readonly clock: Clock,
  ) {}
  execute(input: DailyCheckInput) {
    if (!input.crewId.trim()) throw new CheckValidationError('Selecciona un tripulante.');
    if (!Number.isFinite(input.sleepHours) || input.sleepHours < 0 || input.sleepHours > 24)
      throw new CheckValidationError('Las horas de sueño deben estar entre 0 y 24.');
    if (!Number.isInteger(input.fatigue) || input.fatigue < 1 || input.fatigue > 5)
      throw new CheckValidationError('Selecciona un nivel de fatiga entre 1 y 5.');
    if (!['good', 'neutral', 'low'].includes(input.mood))
      throw new CheckValidationError('Selecciona un estado de ánimo válido.');
    if (input.note.length > 400)
      throw new CheckValidationError('La nota admite hasta 400 caracteres.');
    const recordedAt = this.clock.now().toISOString();
    return this.repository.saveCheck({
      ...input,
      note: input.note.trim(),
      id: `${input.crewId}:${recordedAt.slice(0, 10)}`,
      recordedAt,
    });
  }
}
export class ReviewObservation {
  constructor(private readonly repository: CrewJournalRepository) {}
  execute(id: string, reviewed: boolean) {
    if (!id.trim()) throw new CheckValidationError('La observación necesita un identificador.');
    return this.repository.setReviewed(id, reviewed);
  }
}
