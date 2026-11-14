import { CubicBezierCurve3, CurvePath, Vector3 } from 'three';
import type { DestinationKey } from '../types';
/** Illustrative coordinates only: proximity expresses context, never orbital scale. */
export const mapPositions: Record<DestinationKey, [number, number, number]> = {
  earth: [-6.8, 0.4, 0],
  moon: [-5.6, 2, -0.5],
  mars: [6.8, 0.4, 0],
  station: [-4.8, -2.65, 0.2],
  ship: [-1, 0.4, 2],
};
/** Four minutes per continuous round trip, including both planetary turns. */
export const transitDurationSeconds = 240;
export function transitProgress(elapsedSeconds: number) {
  return (0.13 + elapsedSeconds / transitDurationSeconds) % 1;
}
// Equatorial XZ plane: approach and departure stay at the planets' centre height.
// Depth supplies the front/back pass instead of an overhead/underneath track.
export const transitHeight = 0.4;
const point = (x: number, depth: number) => new Vector3(x, transitHeight, depth);
const k = 0.5522847498; // Cubic approximation of a quarter circle.
const [ex, , ey] = mapPositions.earth;
const [mx, , my] = mapPositions.mars;
const er = 2,
  mr = 1.75;
export const transitCurve = new CurvePath<Vector3>();
// Outbound lane, a rounded pass around Mars, return lane, then a turn around Earth.
// Shared endpoints and matching tangents prevent a teleport or a heading flip.
transitCurve.add(
  new CubicBezierCurve3(
    point(ex, ey + er),
    point(ex + 3, ey + er),
    point(mx - 3, my + mr),
    point(mx, my + mr),
  ),
);
transitCurve.add(
  new CubicBezierCurve3(
    point(mx, my + mr),
    point(mx + mr * k, my + mr),
    point(mx + mr, my + mr * k),
    point(mx + mr, my),
  ),
);
transitCurve.add(
  new CubicBezierCurve3(
    point(mx + mr, my),
    point(mx + mr, my - mr * k),
    point(mx + mr * k, my - mr),
    point(mx, my - mr),
  ),
);
transitCurve.add(
  new CubicBezierCurve3(
    point(mx, my - mr),
    point(mx - 3, my - mr),
    point(ex + 3, ey - er),
    point(ex, ey - er),
  ),
);
transitCurve.add(
  new CubicBezierCurve3(
    point(ex, ey - er),
    point(ex - er * k, ey - er),
    point(ex - er, ey - er * k),
    point(ex - er, ey),
  ),
);
transitCurve.add(
  new CubicBezierCurve3(
    point(ex - er, ey),
    point(ex - er, ey + er * k),
    point(ex - er * k, ey + er),
    point(ex, ey + er),
  ),
);
