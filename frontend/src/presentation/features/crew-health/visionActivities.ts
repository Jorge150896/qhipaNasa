import type { VisionActivityId } from '@/domain/health/models';

export const visionActivities = [
  { id: 'near', label: 'Leer de cerca', prompt: '¿Cambió la nitidez al leer de cerca?' },
  { id: 'focus', label: 'Enfocar', prompt: '¿Qué notaste al cambiar el foco?' },
  { id: 'distance', label: 'Mirar a distancia', prompt: '¿Qué notaste al mirar de lejos?' },
] as const satisfies readonly { id: VisionActivityId; label: string; prompt: string }[];

export function findVisionActivity(id?: VisionActivityId) {
  return visionActivities.find((activity) => activity.id === id);
}
