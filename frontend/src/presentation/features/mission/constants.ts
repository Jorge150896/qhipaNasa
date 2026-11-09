import type { MissionSection, ScenarioKey, SensorKey } from './types';
export const navigation: { id: MissionSection; label: string; icon: string }[] = [
  { id: 'overview', label: 'Centro de misión', icon: 'orbit' },
  { id: 'crew', label: 'Tripulación', icon: 'users' },
  { id: 'habitat', label: 'Entorno de la nave', icon: 'rocket' },
  { id: 'history', label: 'Historial', icon: 'chart' },
  { id: 'journal', label: 'Chequeo diario', icon: 'clipboard' },
  { id: 'observations', label: 'Observaciones', icon: 'bell' },
  { id: 'simulation', label: 'Simulación', icon: 'sliders' },
  { id: 'sources', label: 'Fuentes y alcance', icon: 'book' },
];
export const sectionTitles: Record<MissionSection, { title: string; description: string }> = {
  overview: {
    title: 'Cada señal cuenta.',
    description: 'Una mirada conjunta al cuerpo, al entorno y a la misión.',
  },
  crew: {
    title: 'El lado humano de la misión.',
    description: 'Explora los indicadores de cada tripulante en su contexto.',
  },
  habitat: {
    title: 'El espacio que habitan.',
    description: 'Relaciona la ubicación de la tripulación con su ambiente.',
  },
  history: {
    title: 'Más allá de una lectura.',
    description: 'Consulta tendencias y distingue mediciones ausentes.',
  },
  journal: {
    title: '¿Cómo va tu día a bordo?',
    description: 'Un registro breve complementa lo que los sensores no capturan.',
  },
  observations: {
    title: 'De la señal al seguimiento.',
    description: 'Evidencia, contexto y revisión de cada observación.',
  },
  simulation: {
    title: 'Explora lo que cambia.',
    description: 'Escenarios reproducibles para demostrar el comportamiento de ASTRA.',
  },
  sources: {
    title: 'Datos con contexto.',
    description: 'Qué está implementado, de dónde viene y qué falta validar.',
  },
};
export const scenarioOptions: { id: ScenarioKey; label: string; description: string }[] = [
  {
    id: 'baseline',
    label: 'Rutina de misión',
    description:
      'Tripulantes en descanso, ejercicio e investigación. Sin observaciones programadas.',
  },
  {
    id: 'sleep-change',
    label: 'Cambio en el descanso',
    description:
      'Menos sueño registrado y ambiente distinto en el hábitat. No presupone una relación causal.',
  },
  {
    id: 'sensor-gap',
    label: 'Pérdida de señal',
    description:
      'Tres muestras ausentes de SpO₂ para comprobar la calidad y vigencia de los datos.',
  },
];
export const metricLabels: Record<SensorKey, { label: string; shortLabel: string }> = {
  heartRate: { label: 'Frecuencia cardíaca', shortLabel: 'Pulso' },
  temperature: { label: 'Temperatura corporal', shortLabel: 'Temperatura' },
  oxygen: { label: 'Saturación periférica', shortLabel: 'SpO₂' },
  respiration: { label: 'Frecuencia respiratoria', shortLabel: 'Respiración' },
};
