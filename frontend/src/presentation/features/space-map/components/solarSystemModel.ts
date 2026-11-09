import { Vector3 } from 'three';
export type SolarPlanetId =
  'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';
/** Mean orbital radii (AU), rounded from NASA. Circular orbits and phases are illustrative. */
export const solarOrbits = {
  mercury: { radiusAU: 0.39, period: 240, phase: 3.1 },
  venus: { radiusAU: 0.72, period: 420, phase: 1.9 },
  earth: { radiusAU: 1, period: 600, phase: 0.35 },
  mars: { radiusAU: 1.52, period: 900, phase: 0.75 },
  jupiter: { radiusAU: 5.2, period: 1400, phase: 2.5 },
  saturn: { radiusAU: 9.5, period: 1800, phase: 5.4 },
  uranus: { radiusAU: 19.2, period: 2200, phase: 0.6 },
  neptune: { radiusAU: 30.1, period: 2600, phase: 3.8 },
} as const;
export interface MissionSolarFrame {
  centerAU: Vector3;
  cos: number;
  sin: number;
  unitsPerAU: number;
  sun: Vector3;
}
export function heliocentricPosition(id: SolarPlanetId, seconds: number, target = new Vector3()) {
  const orbit = solarOrbits[id],
    angle = orbit.phase + ((seconds % orbit.period) / orbit.period) * Math.PI * 2;
  return target.set(orbit.radiusAU * Math.cos(angle), 0, -orbit.radiusAU * Math.sin(angle));
}
export function solarMissionFrame(seconds: number): MissionSolarFrame {
  const earth = heliocentricPosition('earth', seconds),
    mars = heliocentricPosition('mars', seconds);
  const delta = mars.clone().sub(earth),
    distance = delta.length();
  const frame: MissionSolarFrame = {
    centerAU: earth.add(mars).multiplyScalar(0.5),
    cos: delta.x / distance,
    sin: delta.z / distance,
    unitsPerAU: 13.6 / distance,
    sun: new Vector3(),
  };
  return { ...frame, sun: toMissionCoordinates(new Vector3(), frame) };
}
export function toMissionCoordinates(
  position: Vector3,
  frame: MissionSolarFrame,
  target = new Vector3(),
) {
  const x = position.x - frame.centerAU.x,
    z = position.z - frame.centerAU.z;
  return target.set(
    (x * frame.cos + z * frame.sin) * frame.unitsPerAU,
    0.4 + position.y * frame.unitsPerAU,
    (-x * frame.sin + z * frame.cos) * frame.unitsPerAU,
  );
}
export function fromMissionCoordinates(
  position: Vector3,
  frame: MissionSolarFrame,
  target = new Vector3(),
) {
  const x = position.x / frame.unitsPerAU,
    z = position.z / frame.unitsPerAU;
  return target.set(
    frame.centerAU.x + x * frame.cos - z * frame.sin,
    (position.y - 0.4) / frame.unitsPerAU,
    frame.centerAU.z + x * frame.sin + z * frame.cos,
  );
}
export function overviewCameraDistance(frame: MissionSolarFrame, aspect: number) {
  const extent = solarOrbits.neptune.radiusAU * frame.unitsPerAU + frame.sun.length();
  return (extent * 1.2) / (Math.tan(Math.PI / 8) * Math.min(aspect, 1));
}
export function solarReveal(zoomRatio: number) {
  const t = Math.max(
    0,
    Math.min(1, (Math.log(zoomRatio) - Math.log(1.5)) / (Math.log(4) - Math.log(1.5))),
  );
  return t * t * (3 - 2 * t);
}
export type SolarViewLevel = 'mission' | 'inner' | 'system';
export function solarViewLevel(zoomRatio: number): SolarViewLevel {
  return zoomRatio < 1.6 ? 'mission' : zoomRatio < 15 ? 'inner' : 'system';
}
