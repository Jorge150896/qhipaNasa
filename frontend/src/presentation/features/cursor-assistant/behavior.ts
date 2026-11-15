export type TumiState =
  'resting' | 'moving' | 'reacting' | 'conversing' | 'waiting' | 'dragging' | 'paused';
export type TumiEvent = 'REST' | 'MOVE' | 'REACT' | 'OPEN' | 'WAIT' | 'DRAG' | 'PAUSE';
export function transitionTumi(state: TumiState, event: TumiEvent): TumiState {
  if (event === 'OPEN') return 'conversing';
  if (event === 'WAIT') return 'waiting';
  if (event === 'PAUSE') return 'paused';
  if (event === 'REST') return 'resting';
  if (state === 'conversing' || state === 'waiting' || state === 'paused') return state;
  return event === 'MOVE' ? 'moving' : event === 'DRAG' ? 'dragging' : 'reacting';
}
export interface Point {
  x: number;
  y: number;
}
export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
export function isFree(point: Point, width: number, height: number, obstacles: Rect[]) {
  return !obstacles.some(
    (r) =>
      point.x < r.right + 8 &&
      point.x + width > r.left - 8 &&
      point.y < r.bottom + 8 &&
      point.y + height > r.top - 8,
  );
}
export function clampPoint(
  point: Point,
  viewport: Point,
  width: number,
  height: number,
  inset = 16,
): Point {
  return {
    x: Math.max(inset, Math.min(viewport.x - width - inset, point.x)),
    y: Math.max(inset, Math.min(viewport.y - height - inset, point.y)),
  };
}
