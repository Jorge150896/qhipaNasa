import { useEffect, useState } from 'react';
import type { HealthEntry, HealthJournal } from '@/domain/health/models';
import type { LoadCrewHealth } from '@/domain/usecases/ManageCrewHealth';
import { healthSystems, reportedStateLabels } from '../crew-health/constants';
import type { MissionData } from '../mission/types';
import { useMissionDashboardViewModel } from '../../shared/mission/useMissionDashboardViewModel';
import type { MissionPersonalSummary } from './types';
import { mapAstronautOverview } from './mapAstronautOverview';

const recordTime = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h23',
  timeZone: 'UTC',
});

function summarizeRecord(entry: HealthEntry | undefined): MissionPersonalSummary['record'] {
  if (!entry) return { title: 'Aún no hay autorregistros', available: true };
  return {
    title:
      entry.activity ||
      healthSystems.find((system) => system.id === entry.systemId)?.label ||
      'Último autorregistro',
    detail: `${reportedStateLabels[entry.reportedState]} · ${recordTime.format(new Date(entry.recordedAt))} UTC`,
    available: true,
  };
}

export function useMissionOverviewViewModel(
  habitatId: string,
  mission: MissionData,
  loadHealth: LoadCrewHealth,
) {
  const dashboard = useMissionDashboardViewModel(habitatId, 'crew');
  const [result, setResult] = useState<{ source: LoadCrewHealth; journal: HealthJournal | null }>();
  useEffect(() => {
    let active = true;
    void loadHealth.execute().then(
      (journal) => {
        if (active) setResult({ source: loadHealth, journal });
      },
      () => {
        if (active) setResult({ source: loadHealth, journal: null });
      },
    );
    return () => {
      active = false;
    };
  }, [loadHealth]);

  const journal = result?.source === loadHealth ? result.journal : undefined;
  const lastEntry = journal?.entries.reduce<HealthEntry | undefined>(
    (latest, entry) =>
      entry.crewId === mission.selected.id &&
      (!latest || Date.parse(entry.recordedAt) > Date.parse(latest.recordedAt))
        ? entry
        : latest,
    undefined,
  );
  const summary: MissionPersonalSummary = {
    activity: mission.selected.activity,
    location: mission.selected.location,
    record:
      journal === undefined
        ? { title: 'Consultando autorregistros…', available: false }
        : journal === null
          ? {
              title: 'Autorregistros no disponibles',
              detail: 'Puedes abrir el registro para reintentar la carga.',
              available: false,
            }
          : summarizeRecord(lastEntry),
    signals: mission.selected.metrics
      .filter((metric) => metric.qualityTone === 'attention')
      .map(({ id, shortLabel, quality }) => ({ id, label: shortLabel, quality })),
  };

  return { ...dashboard, summary, astronautOverview: mapAstronautOverview(mission) };
}
