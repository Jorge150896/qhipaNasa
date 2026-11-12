export type SceneSensor = 'heartRate' | 'temperature' | 'oxygen' | 'respiration';
export type SceneBodyRegion = SceneSensor | 'vision' | 'fitness';
export const bodyZones: Record<
  SceneBodyRegion,
  { position: [number, number, number]; scale: [number, number, number] }
> = {
  heartRate: { position: [0, 1.23, 0.32], scale: [0.22, 0.16, 0.11] },
  respiration: { position: [-0.13, 1.33, 0.34], scale: [0.15, 0.16, 0.11] },
  temperature: { position: [0, 1.77, 0.25], scale: [0.22, 0.24, 0.1] },
  oxygen: { position: [-0.39, 0.81, 0.15], scale: [0.12, 0.15, 0.09] },
  vision: { position: [0, 1.81, 0.27], scale: [0.17, 0.1, 0.1] },
  fitness: { position: [-0.17, 0.41, 0.18], scale: [0.14, 0.26, 0.11] },
};
