import type { SensorKey } from '../mission/types';
import type { HealthSystemContent } from './types';
const source = {
  title: 'NASA · riesgos de HHC',
  url: 'https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/',
};
export const healthSystems: HealthSystemContent[] = [
  {
    id: 'cardio',
    label: 'Cardiovascular',
    shortLabel: 'Corazón',
    icon: 'heart',
    overview: 'La microgravedad puede modificar la circulación y la función cardiovascular.',
    explanation:
      'Consulta el pulso junto a la actividad, la serie temporal y la calidad del sensor.',
    limitation:
      'Una lectura aislada no determina adaptación cardiovascular ni riesgo de trombosis.',
    missing: 'Sin presión arterial, ECG ni evaluación cardiovascular específica.',
    task: 'Revisar la serie y el contexto de actividad',
    checkPrompt:
      '¿Has notado algún cambio durante el reposo o la actividad? Describe cuándo lo observaste y qué estabas haciendo.',
    sensors: ['heartRate', 'oxygen', 'respiration'],
    source,
  },
  {
    id: 'fitness',
    label: 'Ejercicio y aparato locomotor',
    shortLabel: 'Ejercicio',
    icon: 'activity',
    overview: 'NASA estudia ejercicio y conservación de la capacidad física durante las misiones.',
    explanation:
      'Registra la actividad realizada y contrástala con su contexto. La duración es un autorregistro.',
    limitation: 'El cumplimiento de ejercicio no mide masa muscular, fuerza ni densidad ósea.',
    missing: 'Sin pruebas funcionales ni mediciones de fuerza o densidad ósea.',
    task: 'Revisar el registro de actividad física',
    checkPrompt:
      '¿Qué actividad realizaste y cómo te sentiste durante o después? Registra la duración si la conoces.',
    sensors: [],
    source: {
      title: 'NASA · Fisiología del ejercicio',
      url: 'https://www.nasa.gov/directorates/esdmd/hhp/exercise-physiology-and-countermeasures/',
    },
  },
  {
    id: 'vision',
    label: 'Visión y sistema neuroocular',
    shortLabel: 'Visión',
    icon: 'orbit',
    overview: 'El vuelo espacial puede producir cambios oculares y neurooculares.',
    explanation:
      'Documenta cambios visuales percibidos y las evaluaciones realizadas por el equipo.',
    limitation: 'Un autorregistro no permite identificar ni descartar SANS.',
    missing: 'Sin evaluación ocular, imágenes ni agudeza visual medida.',
    task: 'Revisar el autorregistro visual',
    checkPrompt:
      '¿Has notado cambios al leer, enfocar o mirar a distancia? Describe cuándo ocurrieron.',
    sensors: [],
    source: {
      title: 'NASA · Evaluación visual en vuelo espacial',
      url: 'https://www.nasa.gov/wp-content/uploads/2024/02/ochmo-mtb-001-sans.pdf',
    },
  },
  {
    id: 'balance',
    label: 'Equilibrio y coordinación',
    shortLabel: 'Equilibrio',
    icon: 'wind',
    overview: 'Los cambios de gravedad pueden afectar orientación, equilibrio y coordinación.',
    explanation:
      'Registra lo observado con actividad y contexto, diferenciando sensación de evaluación.',
    limitation: 'La aplicación no mide capacidad vestibular ni aptitud operativa.',
    missing: 'Sin prueba instrumental de equilibrio o coordinación.',
    task: 'Revisar el contexto del autorregistro',
    checkPrompt:
      '¿Has notado algún cambio al orientarte o coordinar movimientos? Indica la actividad y el entorno.',
    sensors: [],
    source,
  },
  {
    id: 'nutrition',
    label: 'Alimentación y nutrición',
    shortLabel: 'Nutrición',
    icon: 'clipboard',
    overview: 'La nutrición forma parte de la investigación de salud y rendimiento espacial.',
    explanation:
      'Anota información del registro alimentario que pueda revisar el equipo responsable.',
    limitation: 'Una nota no cuantifica nutrientes ni acredita adecuación de la dieta.',
    missing: 'Sin ingesta cuantificada, analítica ni plan nutricional cargado.',
    task: 'Revisar el registro alimentario disponible',
    checkPrompt:
      '¿Cambió tu apetito, la ingesta de alimentos o la de líquidos? Anota qué observaste.',
    sensors: [],
    source,
  },
  {
    id: 'immune',
    label: 'Respuesta inmunitaria',
    shortLabel: 'Inmunidad',
    icon: 'shield',
    overview: 'NASA investiga cambios inmunitarios e interacciones con microorganismos.',
    explanation: 'Conserva observaciones y resultados disponibles, identificando su procedencia.',
    limitation: 'La temperatura corporal no mide función inmunitaria ni confirma infección.',
    missing: 'Sin biomarcadores, microbiología ni evaluación inmunitaria.',
    task: 'Revisar las observaciones registradas',
    checkPrompt:
      '¿Has notado algún cambio en cómo te sientes? Describe lo observado y desde cuándo.',
    sensors: ['temperature'],
    source,
  },
  {
    id: 'eva',
    label: 'Actividad extravehicular',
    shortLabel: 'EVA',
    icon: 'rocket',
    overview: 'Las caminatas espaciales requieren atender riesgos ambientales y de desempeño.',
    explanation: 'El contexto del hábitat ayuda a organizar la información de misión.',
    limitation: 'Las lecturas interiores no representan sensores de un traje ni habilitan una EVA.',
    missing: 'Sin presión, oxígeno ni CO₂ del traje; sin evaluación de preparación EVA.',
    task: 'Verificar qué datos del contexto están disponibles',
    checkPrompt:
      '¿Hay alguna observación de bienestar durante la preparación o después de la actividad? Indica la fase y el contexto.',
    sensors: [],
    source,
  },
];
export const reportedStateLabels = {
  'no-change': 'Sin cambios reportados',
  change: 'Cambio reportado',
  'not-assessed': 'No evaluado',
} as const;

export const metricMeaning: Record<SensorKey, string> = {
  heartRate:
    'Latidos por minuto. Compáralos en la serie teniendo en cuenta si la persona estaba en reposo o en actividad.',
  oxygen:
    'Porcentaje estimado de saturación de oxígeno en sangre. La calidad de la señal importa al comparar lecturas.',
  respiration:
    'Respiraciones por minuto. Revisa la actividad y la disponibilidad de la señal al comparar la serie.',
  temperature:
    'Temperatura corporal en grados Celsius. Consulta la hora y el historial de la medición.',
};
