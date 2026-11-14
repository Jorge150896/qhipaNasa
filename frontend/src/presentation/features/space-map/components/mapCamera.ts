import { Vector3 } from 'three';
import type { DestinationKey } from '../types';
import { mapObjectRadii } from './spaceMapLayout';
export const mapCameraTarget: [number, number, number] = [0, 0.4, 0];
/** Low oblique view matching the requested composition, with room for both orbits. */
export function initialMapCameraPosition(aspect: number) {
  const distance = Math.max(15, 24 / aspect);
  const elevation = 0.42;
  const azimuth = 0.065;
  return new Vector3(
    distance * Math.cos(elevation) * Math.sin(azimuth),
    mapCameraTarget[1] + distance * Math.sin(elevation),
    distance * Math.cos(elevation) * Math.cos(azimuth),
  );
}

/** Fits the selected body within both axes of the 45° scene camera. */
export function detailCameraDistance(id: DestinationKey, aspect: number) {
  const viewportScale = Math.min(1, Math.max(aspect, 0.25));
  return Math.max(1.5, (mapObjectRadii[id] * 1.5) / (Math.tan(Math.PI / 8) * viewportScale));
}
