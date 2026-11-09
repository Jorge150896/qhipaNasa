import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import {
  heliocentricPosition,
  solarOrbits,
  solarMissionFrame,
  toMissionCoordinates,
  fromMissionCoordinates,
  overviewCameraDistance,
  solarReveal,
  solarViewLevel,
  type SolarPlanetId,
} from '@/presentation/features/space-map/components/solarSystemModel';
import {
  initialMapCameraPosition,
  mapCameraTarget,
} from '@/presentation/features/space-map/components/mapCamera';
describe('Sistema solar con seguimiento Tierra–Marte', () => {
  it('mantiene los planetas de misión enfocados y transforma su recorrido mientras orbitan', () => {
    for (const seconds of [0, 70, 200, 600, 1400]) {
      const frame = solarMissionFrame(seconds);
      expect(
        toMissionCoordinates(heliocentricPosition('earth', seconds), frame).distanceTo(
          new Vector3(-6.8, 0.4, 0),
        ),
      ).toBeLessThan(0.000001);
      expect(
        toMissionCoordinates(heliocentricPosition('mars', seconds), frame).distanceTo(
          new Vector3(6.8, 0.4, 0),
        ),
      ).toBeLessThan(0.000001);
      for (const id of ['earth', 'mars'] as const) {
        const local = new Vector3(id === 'earth' ? -6.8 : 6.8, 0.4, 0);
        expect(
          fromMissionCoordinates(local, frame).distanceTo(heliocentricPosition(id, seconds)),
        ).toBeLessThan(0.000001);
      }
    }
    expect(
      heliocentricPosition('earth', 0).distanceTo(heliocentricPosition('earth', 90)),
    ).toBeGreaterThan(0.5);
  });
  it('conserva distancias proporcionales al Sol para los ocho planetas', () => {
    for (const seconds of [0, 100, 550]) {
      const frame = solarMissionFrame(seconds);
      for (const id of Object.keys(solarOrbits) as SolarPlanetId[]) {
        const world = heliocentricPosition(id, seconds),
          local = toMissionCoordinates(world, frame);
        expect(local.distanceTo(frame.sun) / frame.unitsPerAU).toBeCloseTo(
          solarOrbits[id].radiusAU,
          8,
        );
        expect(fromMissionCoordinates(local, frame).distanceTo(world)).toBeLessThan(0.000001);
      }
    }
  });
  it('encuadra las órbitas completas en la vista general, también en móvil', () => {
    for (const aspect of [0.85, 1.6])
      for (const seconds of [0, 200, 600]) {
        const frame = solarMissionFrame(seconds),
          target = new Vector3(...mapCameraTarget);
        const direction = initialMapCameraPosition(aspect).sub(target).normalize();
        const camera = new PerspectiveCamera(45, aspect, 0.05, 25000);
        camera.position
          .copy(target)
          .add(direction.multiplyScalar(overviewCameraDistance(frame, aspect)));
        camera.lookAt(target);
        camera.updateMatrixWorld();
        for (const orbit of Object.values(solarOrbits))
          for (let i = 0; i < 24; i++) {
            const point = new Vector3(
              orbit.radiusAU * Math.cos((i / 24) * Math.PI * 2),
              0,
              orbit.radiusAU * Math.sin((i / 24) * Math.PI * 2),
            );
            const screen = toMissionCoordinates(point, frame).project(camera);
            expect(Math.abs(screen.x)).toBeLessThan(0.95);
            expect(Math.abs(screen.y)).toBeLessThan(0.95);
          }
      }
  });
  it('revela el contexto gradualmente y conserva oculta la escena solar de cerca', () => {
    expect(solarReveal(1)).toBe(0);
    expect(solarReveal(4)).toBe(1);
    expect(solarReveal(2)).toBeGreaterThan(0);
    expect(solarReveal(3)).toBeGreaterThan(solarReveal(2));
    expect(solarViewLevel(1)).toBe('mission');
    expect(solarViewLevel(5)).toBe('inner');
    expect(solarViewLevel(20)).toBe('system');
  });
});
