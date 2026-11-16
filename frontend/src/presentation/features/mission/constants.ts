import type { MissionSection, ScenarioKey, SensorKey } from './types';
export const navigation: { id: MissionSection; label: string; icon: string }[] = [
  { id: 'journal', label: 'Monitoreo diario', icon: 'clipboard' },
  { id: 'simulation', label: 'Simulación', icon: 'sliders' },
  { id: 'crew', label: 'Tripulación', icon: 'users' },
];
export const sectionTitles: Record<MissionSection, { title: string; description: string }> = {
  crew: {
    title: 'Tripulación',
    description: 'Explora los indicadores de cada tripulante en su contexto.',
  },
  journal: {
    title: 'Monitoreo diario',
    description: 'Registra cómo te sientes y revisa las lecturas de tu cuerpo y del entorno.',
  },
  simulation: {
    title: 'Simulación',
    description:
      'Explora los hábitos y el bienestar de la tripulación durante una misión simulada.',
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
