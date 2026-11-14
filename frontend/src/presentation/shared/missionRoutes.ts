export function missionRoute(habitatId: string, section: string) {
  return habitatId === 'odyssey' ? `/mission/${section}` : `/missions/${habitatId}/${section}`;
}
export type CrewEntryAnchor = 'crew-module' | 'crew-health-entry';
