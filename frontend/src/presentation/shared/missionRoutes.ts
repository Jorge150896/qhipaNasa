export const earthCentersRoute = '/explore?destination=earth&tab=earth';

export function missionRoute(habitatId: string, section: string) {
  return habitatId === 'odyssey' ? `/mission/${section}` : `/missions/${habitatId}/${section}`;
}
export type CrewEntryAnchor =
  'crew-module' | 'crew-history' | 'crew-health-history' | `check-${string}`;
