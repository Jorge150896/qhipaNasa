export function missionRoute(habitatId: string, section: string) {
  return habitatId === 'odyssey' ? `/mission/${section}` : `/missions/${habitatId}/${section}`;
}
