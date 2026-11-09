import { Vector3 } from 'three';
export const mapCameraTarget: [number, number, number] = [0, 0.4, 0];
/** Low oblique view matching the requested composition, with room for both orbits. */
export function initialMapCameraPosition(aspect: number) {
  const distance = Math.max(17, 28 / aspect);
  const elevation = 0.42;
  const azimuth = 0.065;
  return new Vector3(
    distance * Math.cos(elevation) * Math.sin(azimuth),
    mapCameraTarget[1] + distance * Math.sin(elevation),
    distance * Math.cos(elevation) * Math.cos(azimuth),
  );
}
