import { useEffect, useState } from 'react';
import type { MonitoringSession } from '@/domain/monitoring/models';
import type { LoadMonitoringJournal } from '@/domain/usecases/ManageMonitoringJournal';
import type { CrewHealthTimelineRecord } from '../crew-health/types';
import type { MissionData } from '../mission/types';

const date = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

export function useCrewActivityViewModel(load: LoadMonitoringJournal, mission: MissionData) {
  const [result, setResult] = useState<{
    load: LoadMonitoringJournal;
    sessions?: readonly MonitoringSession[];
  }>();
  useEffect(() => {
    let active = true;
    void load.execute().then(
      (sessions) => {
        if (active) setResult({ load, sessions });
      },
      () => {
        if (active) setResult({ load });
      },
    );
    return () => {
      active = false;
    };
  }, [load]);

  const current = result?.load === load ? result : undefined;
  return {
    status: !current ? 'loading' : current.sessions ? 'ready' : 'error',
    entries(records: CrewHealthTimelineRecord[]) {
      return [
        ...records.map((record) => ({
          id: record.id,
          at: record.at,
          title: record.title,
          kind: 'health' as const,
          detail: record.state,
        })),
        ...mission.checks
          .filter((check) => check.crewId === mission.selected.id)
          .map((check) => ({
            id: check.id,
            at: check.recordedAt,
            title: 'Chequeo diario',
            kind: 'check' as const,
            detail: check.mood,
          })),
        ...(current?.sessions ?? [])
          .filter((session) => session.mode === 'demo' && session.subjectId === mission.selected.id)
          .map((session) => ({
            id: session.id,
            at: session.savedAt,
            title: 'Sesión de monitoreo',
            kind: 'monitoring' as const,
            detail: `${session.attempts.length} capturas`,
          })),
      ]
        .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
        .map((entry) => ({
          ...entry,
          date: `${date.format(new Date(entry.at))} UTC`,
        }));
    },
  };
}
