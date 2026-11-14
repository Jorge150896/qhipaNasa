import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import {
  mapPositions,
  transitCurve,
  transitDurationSeconds,
  transitProgress,
  transitHeight,
} from '@/presentation/features/space-map/components/spaceMapLayout';
describe('Recorrido continuo entre planetas', () => {
  it('vuelve a la misma posición y orientación al completar cada ciclo', () => {
    for (const seconds of [0, 10, 75, 120, 200]) {
      const phase = transitProgress(seconds);
      const next = transitProgress(seconds + transitDurationSeconds);
      expect(transitCurve.getPointAt(phase).distanceTo(transitCurve.getPointAt(next))).toBeLessThan(
        0.00001,
      );
      expect(transitCurve.getTangentAt(phase).dot(transitCurve.getTangentAt(next))).toBeGreaterThan(
        0.9999,
      );
    }
    expect(transitCurve.getPointAt(0).distanceTo(transitCurve.getPointAt(1))).toBeLessThan(0.00001);
    expect(
      transitCurve.getTangentAt(0.99999).dot(transitCurve.getTangentAt(0.00001)),
    ).toBeGreaterThan(0.999);
  });
  it('pasa por los lados de ambos planetas y conserva espacio para la nave', () => {
    const points = transitCurve.getSpacedPoints(500);
    expect(Math.max(...points.map((point) => point.x))).toBeGreaterThan(mapPositions.mars[0] + 1);
    expect(Math.min(...points.map((point) => point.x))).toBeLessThan(mapPositions.earth[0] - 1.3);
    expect(Math.max(...points.map((point) => point.z))).toBeGreaterThan(1.8);
    expect(Math.min(...points.map((point) => point.z))).toBeLessThan(-1.8);
    for (const point of points) {
      expect(point.y).toBeCloseTo(transitHeight, 8);
      expect(point.distanceTo(new Vector3(...mapPositions.earth))).toBeGreaterThan(1.5);
      expect(point.distanceTo(new Vector3(...mapPositions.mars))).toBeGreaterThan(1.1);
    }
    expect(transitCurve.getTangentAt(0.1).x).toBeGreaterThan(0);
    expect(transitCurve.getTangentAt(0.6).x).toBeLessThan(0);
  });
});
