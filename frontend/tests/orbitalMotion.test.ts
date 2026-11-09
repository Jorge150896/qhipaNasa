import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import {
  orbitalMotion,
  orbitalPosition,
  axialAngle,
} from '@/presentation/features/space-map/components/orbitalMotion';
import { mapPositions } from '@/presentation/features/space-map/components/spaceMapLayout';
const earth = new Vector3(...mapPositions.earth);
describe('Movimientos orbitales ilustrativos', () => {
  it('mantiene los satélites alrededor de Tierra y cierra cada órbita sin saltos', () => {
    for (const id of ['moon', 'station'] as const) {
      for (const seconds of [0, 12, 30, 60, 90]) {
        const position = orbitalPosition(id, seconds);
        expect(position.distanceTo(earth)).toBeCloseTo(orbitalMotion[id].radius, 8);
        expect(
          position.distanceTo(orbitalPosition(id, seconds + orbitalMotion[id].period)),
        ).toBeLessThan(0.000001);
      }
      expect(orbitalPosition(id, 0).distanceTo(orbitalPosition(id, 10))).toBeGreaterThan(0.5);
    }
    expect(orbitalMotion.station.period).toBeLessThan(orbitalMotion.moon.period);
  });
  it('sincroniza la rotación lunar con la órbita para conservar una cara hacia Tierra', () => {
    for (const seconds of [0, 15, 35, 60, 85, 100]) {
      const towardEarth = earth.clone().sub(orbitalPosition('moon', seconds)).normalize();
      const facing = new Vector3(0, 0, 1)
        .applyAxisAngle(new Vector3(0, 1, 0), axialAngle('moon', seconds))
        .applyAxisAngle(new Vector3(1, 0, 0), orbitalMotion.moon.inclination);
      expect(facing.dot(towardEarth)).toBeGreaterThan(0.99999);
    }
    expect(axialAngle('earth', 10)).toBeGreaterThan(axialAngle('earth', 0));
    expect(axialAngle('mars', 10)).toBeGreaterThan(axialAngle('mars', 0));
  });
});
