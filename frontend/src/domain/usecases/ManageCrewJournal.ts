import { CheckValidationError, type Clock, type DailyCheckInput } from '../mission/models';
import type { CrewJournalRepository } from '../mission/ports';
import { discomfortRegions, validDailyCheckContext } from '../mission/dailyCheckContext';
import { healthSystemIds, reportedStates, visionActivityIds } from '../health/models';
import { validDailyCheckAttachment } from '../mission/dailyCheckAttachment';
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
    if (
      input.fatigue !== undefined &&
      (!Number.isInteger(input.fatigue) || input.fatigue < 1 || input.fatigue > 5)
    )
      throw new CheckValidationError('Selecciona un nivel de fatiga entre 1 y 5.');
    if (input.mood !== undefined && !['good', 'neutral', 'low'].includes(input.mood))
      throw new CheckValidationError('Selecciona un estado de ánimo válido.');
    if (input.note.length > 400)
      throw new CheckValidationError('La nota admite hasta 400 caracteres.');
    if (input.context && !validDailyCheckContext(input.context))
      throw new CheckValidationError(
        'Revisa el momento y los valores de la actividad seleccionada.',
      );
    if (input.discomfortRegion !== undefined && !discomfortRegions.includes(input.discomfortRegion))
      throw new CheckValidationError('Selecciona una región válida o déjala sin informar.');
    if (input.exerciseDone !== undefined && typeof input.exerciseDone !== 'boolean')
      throw new CheckValidationError('Revisa la respuesta sobre ejercicio.');
    const report = input.healthReport;
    if (
      report &&
      (!healthSystemIds.includes(report.systemId) ||
        !reportedStates.includes(report.reportedState) ||
        (report.visionActivityId !== undefined &&
          (report.systemId !== 'vision' || !visionActivityIds.includes(report.visionActivityId))))
    )
      throw new CheckValidationError('Revisa la respuesta del área de salud.');
    if (input.attachment && !validDailyCheckAttachment(input.attachment))
      throw new CheckValidationError('Revisa los datos adjuntos.');
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
