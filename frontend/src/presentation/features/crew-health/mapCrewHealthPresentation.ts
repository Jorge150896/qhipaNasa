import type { HealthJournal } from '@/domain/health/models';
import { healthSystems, metricMeaning, reportedStateLabels } from './constants';
import type { BodySystemKey, CrewHealthContext, CrewHealthData } from './types';
import { findVisionActivity } from './visionActivities';
const date = (iso: string) =>
  new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hourCycle: 'h23',
    timeZone: 'UTC',
  }).format(new Date(iso)) + ' UTC';
const shortDay = new Intl.DateTimeFormat('es-PE', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

function mapNextStep(
  data: Pick<CrewHealthData, 'metrics' | 'reviewed'>,
  journal: HealthJournal | null,
  last: HealthJournal['entries'][number] | undefined,
): CrewHealthData['nextStep'] {
  const missingReading = data.metrics.some(
    (metric) => metric.qualityTone === 'attention' || metric.value === '—',
  );
  if (last?.reportedState === 'change') {
    return {
      title: 'Compartir el cambio reportado',
      detail:
        'Reúne cuándo empezó y en qué contexto ocurrió. Comparte el registro con la persona responsable de salud de la tripulación según el procedimiento de la misión.' +
        (missingReading ? ' Indica también qué lecturas no están disponibles.' : ''),
      target: 'review',
    };
  }
  if (missingReading) {
    return {
      title: 'Comprobar la señal',
      detail:
        'Revisa la disponibilidad del sensor y, si puedes, repite la medición. La última muestra disponible queda en el historial.',
      target: 'readings',
    };
  }
  if (journal === null) {
    return {
      title: 'Consultar los indicadores',
      detail: 'Puedes revisar los datos de la demo mientras se recupera el registro local.',
      target: 'readings',
    };
  }
  if (!last || last.reportedState === 'not-assessed') {
    return {
      title: 'Completar la autoevaluación',
      detail:
        'Responde la pregunta de esta área y confirma el registro para conservarlo en tu historial.',
      target: 'entry',
    };
  }
  return {
    title: data.reviewed ? 'Registrar cambios cuando ocurran' : 'Revisar el registro',
    detail: data.reviewed
      ? 'Puedes actualizar el seguimiento si notas un cambio o tienes nueva información.'
      : 'Contrasta lo que reportaste con tu actividad y las lecturas disponibles. Registra la revisión cuando termines.',
    target: data.reviewed ? 'entry' : 'review',
  };
}

export function mapCrewHealthPresentation(
  context: CrewHealthContext,
  journal: HealthJournal | null,
  systemId: BodySystemKey,
  today: string,
): CrewHealthData {
  const { mission, habitatId } = context,
    crew = mission.selected;
  const system = healthSystems.find((item) => item.id === systemId) ?? healthSystems[0];
  const all =
    journal?.entries
      .filter((entry) => entry.crewId === crew.id)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)) ?? [];
  const entries = all.filter((entry) => entry.systemId === system.id),
    last = entries[0];
  const latest = healthSystems.map((item) => all.find((entry) => entry.systemId === item.id));
  const changed = latest.filter((entry) => entry?.reportedState === 'change');
  const absent = latest.filter((entry) => !entry || entry.reportedState === 'not-assessed').length;
  const unavailable = crew.metrics.filter(
    (metric) => metric.qualityTone === 'attention' || metric.value === '—',
  );
  const review = journal?.reviews.find(
    (item) => item.crewId === crew.id && item.systemId === system.id && item.day === today,
  );
  const metrics = crew.metrics
    .filter((metric) => system.sensors.includes(metric.id))
    .map((metric) => ({ ...metric, meaning: metricMeaning[metric.id] }));
  const reviewed = !!review?.reviewed && (!last || last.recordedAt <= review.recordedAt);
  const pending = mission.observations.filter((item) => item.crewId === crew.id && !item.reviewed);
  return {
    recordZones: mission.zones.map(({ id, name }) => ({ id, name })),
    timelineRecords: all.map((entry) => ({
      id: entry.id,
      at: entry.recordedAt,
      date: date(entry.recordedAt),
      title:
        entry.systemId === 'fitness' && entry.activity
          ? entry.activity
          : (healthSystems.find((item) => item.id === entry.systemId)?.shortLabel ??
            'Autorregistro'),
      state: reportedStateLabels[entry.reportedState],
      activity: entry.activity,
      duration: entry.minutes === null ? undefined : `${entry.minutes} min`,
      note: entry.note,
      zoneId: entry.zoneId,
      visionActivity: findVisionActivity(entry.visionActivityId)?.label,
    })),
    system,
    systems: healthSystems,
    name: crew.name,
    personContext: `${crew.location} · ${crew.activity}`,
    sensorDate: mission.date,
    scope: `${habitatId}:${crew.id}`,
    today,
    metrics,
    nextStep: mapNextStep({ metrics, reviewed }, journal, last),
    lastEntryDate: last ? date(last.recordedAt) : '',
    stateLabel:
      journal === null
        ? 'Registro no disponible'
        : last
          ? reportedStateLabels[last.reportedState]
          : 'Sin autoevaluación registrada',
    reviewed,
    reviewDate: review ? date(review.recordedAt) : '',
    history: entries.map((entry) => ({
      id: entry.id,
      date: date(entry.recordedAt),
      dayLabel: shortDay.format(new Date(entry.recordedAt)),
      minutes: entry.minutes,
      state: reportedStateLabels[entry.reportedState],
      note: entry.note,
      activity: entry.activity,
      visionActivity: findVisionActivity(entry.visionActivityId)?.label,
      duration:
        entry.minutes === null
          ? 'Duración no informada'
          : `${new Intl.NumberFormat('es-PE').format(entry.minutes)} min registrados`,
    })),
    analysis: {
      summary: `Seguimiento de ${crew.name}: ${crew.metrics.length - unavailable.length} de ${crew.metrics.length} indicadores con dato actual disponible en la instantánea sintética. ${journal === null ? 'El historial de autorregistros no está disponible.' : `${all.length} autorregistros locales; ${changed.length} áreas con cambio en su último registro.`}`,
      evidence: [
        ...crew.metrics.map(
          (metric) =>
            `${metric.label}: ${metric.value} ${metric.unit} · ${metric.quality}. ${metric.lastReading}`,
        ),
        ...latest
          .filter((entry) => entry !== undefined)
          .map(
            (entry) =>
              `${healthSystems.find((item) => item.id === entry.systemId)?.label}: ${reportedStateLabels[entry.reportedState]} · ${date(entry.recordedAt)} · autorregistro de demo.`,
          ),
      ],
      missing: [
        system.missing,
        ...(journal === null
          ? ['No se pudo leer el registro local; los datos guardados se conservan.']
          : [
              `${absent} de ${healthSystems.length} áreas sin evaluación reportada en su último registro.`,
            ]),
      ],
      next: unavailable.length
        ? 'Comprobar calidad y vigencia de las señales antes de interpretarlas.'
        : changed.length
          ? 'Compartir los cambios reportados con el equipo responsable según el procedimiento de misión; la app no determina su gravedad.'
          : 'Completar los registros pendientes y contrastarlos con el historial y el plan que defina el equipo responsable.',
    },
    context: [
      { label: 'Misión / hábitat', value: mission.name },
      { label: 'Fase', value: `Durante la misión · día ${mission.day} de demo` },
      {
        label: 'Entorno de referencia',
        value:
          habitatId === 'selene'
            ? 'Base lunar simulada'
            : habitatId === 'ares'
              ? 'Base marciana simulada'
              : 'Microgravedad de referencia, simulada',
      },
      { label: 'Actividad y zona del tripulante', value: `${crew.activity} · ${crew.location}` },
      {
        label: 'Instantánea de sensores',
        value: `${mission.date} · ${mission.time} · datos sintéticos`,
      },
      {
        label: 'Chequeo diario',
        value: mission.todayCheck
          ? 'Registrado hoy UTC en este navegador'
          : 'Pendiente hoy UTC en este navegador',
      },
    ],
    pendingObservations: pending.map((item) => item.title),
  };
}
