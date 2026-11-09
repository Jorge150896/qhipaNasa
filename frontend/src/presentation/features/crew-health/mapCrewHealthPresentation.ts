import type { HealthJournal } from '@/domain/health/models';
import { healthSystems, reportedStateLabels } from './constants';
import type { BodySystemKey, CrewHealthContext, CrewHealthData } from './types';
const date = (iso: string) =>
  new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(iso)) + ' UTC';
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
  const pending = mission.observations.filter((item) => item.crewId === crew.id && !item.reviewed);
  return {
    system,
    systems: healthSystems,
    name: crew.name,
    scope: `${habitatId}:${crew.id}`,
    today,
    metrics: crew.metrics.filter((metric) => system.sensors.includes(metric.id)),
    stateLabel:
      journal === null
        ? 'Registro no disponible'
        : last
          ? reportedStateLabels[last.reportedState]
          : 'Sin autoevaluación registrada',
    entryCount: journal === null ? '—' : String(entries.length),
    reviewed: review?.reviewed ?? false,
    reviewDate: review ? date(review.recordedAt) : '',
    history: entries.map((entry) => ({
      id: entry.id,
      date: date(entry.recordedAt),
      state: reportedStateLabels[entry.reportedState],
      note: entry.note,
      activity: entry.activity,
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
