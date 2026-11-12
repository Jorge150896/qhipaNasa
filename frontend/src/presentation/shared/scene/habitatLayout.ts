export const shuttleRotation = [0.08, 0.5, -0.12] as const;
export const shuttleCutawayScale = 0.69;
export const habitatRotation = [0.1, -0.3, 0] as const;
export const habitatScale = 0.85;
export const habitatZoneIds = ['habitat', 'exercise', 'laboratory'] as const;

export function habitatZoneX(index: number) {
  return (index - 1) * 1.4;
}
