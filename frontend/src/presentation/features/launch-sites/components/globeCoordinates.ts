/** Matches the equirectangular texture: longitude 0 at u=.5, north at v=1. */
export function globePosition(
  latitude: number,
  longitude: number,
  radius = 1,
): [number, number, number] {
  const lat = (latitude * Math.PI) / 180;
  const lon = (longitude * Math.PI) / 180;
  return [
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    -radius * Math.cos(lat) * Math.sin(lon),
  ];
}

/** Compact visual groups (~5°), not physical facilities or shared launch pads. */
export function groupNearbyPlaces<T extends { latitude: number; longitude: number }>(
  places: readonly T[],
): T[][] {
  const groups: T[][] = [];
  for (const place of places) {
    const position = globePosition(place.latitude, place.longitude);
    const group = groups.find(([anchor]) => {
      const other = globePosition(anchor.latitude, anchor.longitude);
      return (
        Math.hypot(position[0] - other[0], position[1] - other[1], position[2] - other[2]) < 0.0873
      );
    });
    if (group) group.push(place);
    else groups.push([place]);
  }
  return groups;
}
