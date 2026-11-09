import { Vector3 } from 'three';
import { mapPositions } from './spaceMapLayout';
export type OrbiterId = 'moon' | 'station';
/** Artist-directed display periods, not ephemerides or physical distances. */
export const orbitalMotion = {
  moon: { radius: 2.05, period: 100, phase: 1, inclination: 1.1 },
  station: { radius: 3, period: 65, phase: -0.98, inclination: 1.15 },
} as const;
export function orbitalAngle(id: OrbiterId, seconds: number) {
  const orbit = orbitalMotion[id];
  return orbit.phase + ((seconds % orbit.period) / orbit.period) * Math.PI * 2;
}
export function orbitalPosition(id: OrbiterId, seconds: number, target = new Vector3()) {
  const orbit = orbitalMotion[id];
  const angle = orbitalAngle(id, seconds);
  const [x, y, z] = mapPositions.earth;
  return target.set(
    x + orbit.radius * Math.cos(angle),
    y + orbit.radius * Math.sin(angle) * Math.sin(orbit.inclination),
    z - orbit.radius * Math.sin(angle) * Math.cos(orbit.inclination),
  );
}
export function axialAngle(kind: 'earth' | 'moon' | 'mars', seconds: number) {
  if (kind === 'moon') return orbitalAngle('moon', seconds) - Math.PI / 2;
  return ((seconds % (kind === 'earth' ? 80 : 100)) / (kind === 'earth' ? 80 : 100)) * Math.PI * 2;
}
