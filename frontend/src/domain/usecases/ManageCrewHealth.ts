import {
  healthSystemIds,
  reportedStates,
  HealthValidationError,
  type CrewHealthRepository,
  type HealthEntryInput,
  type HealthIds,
  type HealthSystemId,
} from '../health/models';
import type { Clock } from '../mission/models';
function validateScope(crewId: string, systemId: HealthSystemId) {
  if (!crewId.trim() || !healthSystemIds.includes(systemId))
    throw new HealthValidationError('Selecciona un tripulante y un sistema válidos.');
}
export class LoadCrewHealth {
  constructor(private readonly repository: CrewHealthRepository) {}
  execute() {
    return this.repository.load();
  }
}
export class RecordCrewHealth {
  constructor(
    private readonly repository: CrewHealthRepository,
    private readonly clock: Clock,
    private readonly ids: HealthIds,
  ) {}
  execute(input: HealthEntryInput) {
    validateScope(input.crewId, input.systemId);
    if (!reportedStates.includes(input.reportedState))
      throw new HealthValidationError('Selecciona el estado de tu autoevaluación.');
    if (input.note.length > 600 || input.activity.length > 80)
      throw new HealthValidationError('La nota admite 600 caracteres y la actividad 80.');
    if (input.reportedState === 'change' && !input.note.trim())
      throw new HealthValidationError('Describe el cambio reportado para dejar contexto.');
    if (
      input.minutes !== null &&
      (!Number.isFinite(input.minutes) || input.minutes < 0 || input.minutes > 1440)
    )
      throw new HealthValidationError(
        'La duración debe estar entre 0 y 1440 minutos. Puedes dejarla sin informar.',
      );
    if (input.systemId !== 'fitness' && (input.minutes !== null || input.activity.trim()))
      throw new HealthValidationError(
        'La actividad y su duración pertenecen al registro de ejercicio.',
      );
    if (input.minutes !== null && !input.activity.trim())
      throw new HealthValidationError('Indica la actividad asociada a la duración.');
    return this.repository.addEntry({
      ...input,
      note: input.note.trim(),
      activity: input.activity.trim(),
      id: this.ids.next(),
      recordedAt: this.clock.now().toISOString(),
    });
  }
}
export class ReviewCrewHealth {
  constructor(
    private readonly repository: CrewHealthRepository,
    private readonly clock: Clock,
  ) {}
  execute(crewId: string, systemId: HealthSystemId, reviewed: boolean) {
    validateScope(crewId, systemId);
    const recordedAt = this.clock.now().toISOString();
    return this.repository.setReview({
      crewId,
      systemId,
      reviewed,
      recordedAt,
      day: recordedAt.slice(0, 10),
    });
  }
}
