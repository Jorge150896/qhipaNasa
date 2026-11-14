import type { MonitoringJournal, MonitoringSession } from '../monitoring/models';
export class LoadMonitoringJournal {
  constructor(private readonly journal: MonitoringJournal) {}
  execute() {
    return this.journal.load();
  }
}
export class SaveMonitoringSession {
  constructor(private readonly journal: MonitoringJournal) {}
  execute(session: MonitoringSession) {
    if (!session.attempts.length) throw new Error('La sesión necesita al menos una captura.');
    return this.journal.save(session);
  }
}
