import type { Clock } from '../mission/models';
import type { ExplorerRepository } from '../explorer/models';
export class LoadSpaceExplorer {
  constructor(
    private readonly repository: ExplorerRepository,
    private readonly clock: Clock,
  ) {}
  async execute(signal?: AbortSignal) {
    const entries = await this.repository.load(signal);
    const today = this.clock.now().toISOString().slice(0, 10);
    const habitats = entries.map(({ habitat, snapshot, journal }) => ({
      ...habitat,
      capturedAt: snapshot.capturedAt,
      scenario: snapshot.scenario,
      crew: snapshot.crew.map((person) => ({
        id: person.id,
        name: person.name,
        initials: person.initials,
        role: person.role,
        activity: person.activity,
        zone: snapshot.zones.find((zone) => zone.id === person.zoneId)?.name ?? 'Sin ubicación',
        checkDone:
          journal === null
            ? null
            : journal.checks.some(
                (check) => check.crewId === person.id && check.recordedAt.slice(0, 10) === today,
              ),
      })),
      journalAvailable: journal !== null,
      pendingObservations:
        journal === null
          ? null
          : snapshot.observations.filter(
              (item) => !journal.reviewedObservationIds.includes(item.id),
            ).length,
      unavailableSensors: snapshot.crew.reduce(
        (count, person) =>
          count +
          person.readings.filter(
            (reading) => reading.quality !== 'available' || reading.samples.at(-1)?.value == null,
          ).length,
        0,
      ),
    }));
    return {
      habitats,
      totalCrew: new Set(habitats.flatMap((habitat) => habitat.crew.map((person) => person.id)))
        .size,
      today,
    };
  }
}
