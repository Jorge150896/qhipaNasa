import { useEffect, useState } from 'react';
import type { MonitoringSession } from '@/domain/monitoring/models';
import type { LoadMonitoringJournal } from '@/domain/usecases/ManageMonitoringJournal';
import type { CrewHealthTimelineRecord } from '../crew-health/types';
import type { MissionData } from '../mission/types';
import { metricLabels } from '../mission/constants';
import { describeDailyCheck } from '../daily-check/dailyCheckDetails';

const date = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});
const formatAt = (value: string) => `${date.format(new Date(value))} UTC`;
const activityLabels = {
  cabin: 'Rutina en cabina',
  exercise: 'Ejercicio',
  surface: 'Recorrido de superficie',
  eva: 'Caminata espacial',
};
const phaseLabels = { before: 'Antes', during: 'Durante', after: 'Después' };
const qualityLabels = { available: 'Disponible', missing: 'Ausente', stale: 'Antigua' };

function mapSession(session: MonitoringSession) {
  const { context } = session;
  return {
    id: session.id,
    at: session.savedAt,
    title:
      session.mode === 'api'
        ? `Sesión de monitoreo · ${session.subjectLabel}`
        : 'Sesión de monitoreo',
    kind: 'monitoring' as const,
    detail: `${session.mode === 'demo' ? 'Sintético' : 'API'} · ${session.attempts.length} capturas`,
    context: [
      session.subjectLabel,
      activityLabels[context.activity],
      phaseLabels[context.phase],
      context.location,
      context.equipment,
    ].join(' · '),
    note: session.note,
    readings: session.attempts.map((attempt, index) => {
      const samples = attempt.measurements.map((sample) => {
        const value = sample.value?.toLocaleString('es-PE', { maximumFractionDigits: 2 }) ?? '—';
        const observed = sample.time.kind === 'instant' ? formatAt(sample.time.at) : 'sin fecha';
        const provenance = [
          qualityLabels[sample.quality],
          sample.source.id,
          `muestra ${sample.id}`,
          `observada ${observed}`,
        ];
        const label =
          Object.entries(metricLabels).find(([id]) => id === sample.indicator)?.[1].label ??
          sample.indicator;
        return `${label}: ${value} ${sample.unit} (${provenance.join(' · ')})`;
      });
      return `Captura ${index + 1} · recibida ${formatAt(attempt.receivedAt)} · ${samples.join(' · ') || 'Sin muestras'}`;
    }),
  };
}

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
            title: 'Monitoreo diario',
            kind: 'check' as const,
            check: describeDailyCheck(check),
            detail: [
              `Ánimo: ${check.mood.toLowerCase()}`,
              check.exerciseDone === undefined
                ? 'Ejercicio sin responder'
                : check.exerciseDone
                  ? 'Hizo ejercicio'
                  : 'Indicó que no hizo ejercicio',
            ].join(' · '),
          })),
        ...(current?.sessions ?? [])
          .filter((session) => session.mode === 'api' || session.subjectId === mission.selected.id)
          .map(mapSession),
      ]
        .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
        .map((entry) => ({
          ...entry,
          date: formatAt(entry.at),
        }));
    },
  };
}
