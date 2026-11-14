import { withSyntheticMeasurements } from './withSyntheticMeasurements';
import type { MissionRepository } from '@/domain/mission/ports';
import type {
  CrewMember,
  MissionSnapshot,
  Observation,
  Reading,
  ScenarioId,
} from '@/domain/mission/models';
const times = ['14:18', '14:20', '14:22', '14:24', '14:26', '14:28', '14:30', '14:32'];
function reading(id: Reading['id'], unit: string, values: number[], missing: boolean): Reading {
  return {
    id,
    unit,
    quality: missing ? 'missing' : 'available',
    samples: times.map((time, i) => ({
      at: `2026-11-08T${time}:00Z`,
      value: missing && i > 4 ? null : values[i],
    })),
  };
}
export class SimulatedMissionRepository implements MissionRepository {
  async load(scenario: ScenarioId, signal?: AbortSignal): Promise<MissionSnapshot> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const disturbed = scenario === 'sleep-change';
    const crew: CrewMember[] = [
      {
        id: 'elena',
        name: 'Elena Torres',
        initials: 'ET',
        role: 'Comandante',
        zoneId: 'habitat',
        activity: 'Descanso',
        sleepHours: disturbed ? 5.2 : 7.3,
        readings: [
          reading('heartRate', 'lpm', [70, 71, 72, 70, 73, 71, 73, 72], false),
          reading('temperature', '°C', [36.5, 36.5, 36.6, 36.5, 36.6, 36.5, 36.6, 36.6], false),
          reading('oxygen', '%', [98, 98, 99, 98, 98, 98, 98, 98], scenario === 'sensor-gap'),
          reading('respiration', 'rpm', [14, 15, 14, 14, 15, 14, 15, 14], false),
        ],
      },
      {
        id: 'mateo',
        name: 'Mateo Silva',
        initials: 'MS',
        role: 'Especialista de misión',
        zoneId: 'exercise',
        activity: 'Ejercicio',
        sleepHours: 7.1,
        readings: [
          reading('heartRate', 'lpm', [88, 92, 96, 99, 102, 104, 106, 108], false),
          reading('temperature', '°C', [36.7, 36.8, 36.8, 36.9, 36.9, 37, 37, 37.1], false),
          reading('oxygen', '%', [98, 98, 98, 98, 97, 98, 97, 97], false),
          reading('respiration', 'rpm', [16, 17, 17, 18, 19, 20, 20, 21], false),
        ],
      },
      {
        id: 'lucia',
        name: 'Lucía Vega',
        initials: 'LV',
        role: 'Ingeniera de vuelo',
        zoneId: 'laboratory',
        activity: 'Investigación',
        sleepHours: 7.4,
        readings: [
          reading('heartRate', 'lpm', [75, 76, 74, 77, 76, 76, 77, 78], false),
          reading('temperature', '°C', [36.6, 36.6, 36.6, 36.7, 36.6, 36.6, 36.6, 36.7], false),
          reading('oxygen', '%', [98, 99, 98, 99, 98, 98, 99, 98], false),
          reading('respiration', 'rpm', [14, 14, 15, 14, 15, 14, 14, 15], false),
        ],
      },
    ];
    const observations: Observation[] = disturbed
      ? [
          {
            id: 'sleep-elena-v1',
            crewId: 'elena',
            title: 'Revisar el registro de descanso',
            category: 'context',
            detail:
              'El escenario introduce menos horas de sueño y cambios en el ambiente del hábitat. Su coincidencia no demuestra causalidad.',
            evidence: [
              'Sueño simulado: 5,2 h frente a 7,3 h del escenario base.',
              'Hábitat: 24,8 °C y 1.100 ppm de CO₂ en esta instantánea.',
            ],
            nextSteps: [
              'Contrastar la evolución del sueño con registros anteriores.',
              'Verificar sincronización y calidad de las mediciones ambientales.',
            ],
          },
        ]
      : scenario === 'sensor-gap'
        ? [
            {
              id: 'oxygen-elena-gap-v1',
              crewId: 'elena',
              title: 'Sin lecturas recientes de SpO₂',
              category: 'data-quality',
              detail:
                'El escenario interrumpe tres muestras del sensor. La última lectura disponible no debe presentarse como actual.',
              evidence: [
                'Última muestra disponible: 14:26 UTC.',
                'Tres muestras posteriores ausentes.',
              ],
              nextSteps: [
                'Comprobar conexión y estado del sensor.',
                'Registrar una nueva medición antes de interpretar la tendencia.',
              ],
            },
          ]
        : [];
    return withSyntheticMeasurements({
      id: 'odyssey-01',
      name: 'Odyssey 01',
      missionDay: 42,
      capturedAt: '2026-11-08T14:32:00Z',
      scenario,
      source: 'synthetic',
      crew,
      observations,
      zones: [
        {
          id: 'habitat',
          name: 'Hábitat de descanso',
          description: 'Cápsulas de descanso con iluminación individual para la tripulación.',
          temperature: disturbed ? 24.8 : 22.1,
          co2: disturbed ? 1100 : 650,
          humidity: 48,
          noise: disturbed ? 54 : 42,
        },
        {
          id: 'exercise',
          name: 'Módulo de ejercicio',
          description: 'Bicicleta estática y equipo de resistencia para las sesiones de ejercicio.',
          temperature: 25.6,
          co2: 950,
          humidity: 55,
          noise: 62,
        },
        {
          id: 'laboratory',
          name: 'Laboratorio',
          description: 'Mesa de trabajo con pantallas y almacenamiento de muestras.',
          temperature: 23.4,
          co2: 780,
          humidity: 45,
          noise: 55,
        },
        {
          id: 'cockpit',
          name: 'Cabina de mando',
          description: 'Puestos de pilotaje y consolas para navegación y comunicaciones.',
          temperature: 22.8,
          co2: 710,
          humidity: 46,
          noise: 48,
        },
        {
          id: 'life-support',
          name: 'Soporte vital',
          description: 'Depósitos y equipos de ventilación y filtrado del aire.',
          temperature: 24.2,
          co2: 820,
          humidity: 44,
          noise: 58,
        },
      ],
    });
  }
}
