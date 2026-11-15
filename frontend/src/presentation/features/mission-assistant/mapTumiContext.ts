import type { TumiScreenContext } from '@/domain/assistant/TumiConversation';
import { scenarioOptions } from '../mission/constants';
import type { MissionData, ZoneData } from '../mission/types';
import type { AssistantMetricContext, AssistantSample } from './types';

const views: Record<string, string> = {
  crew: 'Tripulación',
  journal: 'Monitoreo diario',
  simulation: 'Simulación',
  sources: 'Fuentes y alcance',
  explore: 'Mapa espacial',
};

export function describeTumiZone(zone: ZoneData, readings = zone.readings) {
  return `${zone.name}${readings.length ? ` · ${readings.map(({ label, value, unit }) => `${label} ${value} ${unit}`).join(', ')}` : ''}`;
}

function describeReading({ reading, zone, activity }: AssistantSample) {
  const origin = reading.trace?.source ?? 'Escenario sintético';
  return `${reading.at}: ${reading.value}, origen: ${origin}${activity ? `, actividad: ${activity}` : ''}. ${zone ? `Módulo y ambiente: ${describeTumiZone(zone)}.` : 'Sin ubicación ni ambiente registrados para esta muestra.'}`;
}

export function describeTumiReading(context: AssistantMetricContext) {
  const { metric, crewName, sample, reference, explicitSample } = context;
  return [
    `${explicitSample ? 'Muestra seleccionada' : 'Indicador seleccionado'}: ${metric.label} de ${crewName}.`,
    sample ? describeReading(sample) : `Sin lectura vigente. Calidad: ${metric.quality}.`,
    reference ? `Muestra de referencia: ${describeReading(reference)}` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function mapTumiContext(
  pathname: string,
  mission: MissionData | null,
  activeView?: TumiScreenContext,
  reading?: AssistantMetricContext,
): TumiScreenContext {
  const section = pathname.split('/').filter(Boolean).at(-1) ?? '';
  const facts = [activeView?.details];
  if (mission && ['crew', 'journal', 'simulation'].includes(section)) {
    const { selected } = mission;
    const scenario = scenarioOptions.find(({ id }) => id === mission.scenario)?.label;
    facts.push(
      `Misión ${mission.name}. Escenario sintético: ${scenario ?? mission.scenario}. Fecha y hora de la instantánea: ${mission.capturedAt}.`,
    );
    if (section !== 'simulation') {
      facts.push(
        `Tripulante ficticio seleccionado: ${selected.name}, ${selected.role}. En la instantánea: ${selected.activity}, ${selected.location}.`,
        `Lecturas de la instantánea de ${selected.name}: ${selected.metrics
          .map(({ label, value, unit, quality, history }) => {
            const last = history.findLast((entry) => !entry.missing);
            return `${label}: ${value === '—' ? 'sin muestra vigente' : `${value} ${unit}`} (${quality}${last ? `; última muestra disponible ${last.time}` : ''})`;
          })
          .join('; ')}. Origen: telemetría sintética.`,
      );
    }
  }
  if (reading) facts.unshift(describeTumiReading(reading));
  return {
    view: activeView?.view ?? views[section] ?? 'Portada',
    details: facts.filter(Boolean).join('\n').slice(0, 6000),
  };
}
