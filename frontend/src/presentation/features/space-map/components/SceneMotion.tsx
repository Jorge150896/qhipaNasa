import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
const MotionContext = createContext<{ current: number } | null>(null);
/** One visual clock for rotation, orbit and transit; never updates mission data. */
export function SceneMotion({ paused, children }: { paused: boolean; children: ReactNode }) {
  const elapsed = useRef(0);
  const { invalidate } = useThree();
  useEffect(() => {
    const resume = () => {
      if (!document.hidden) invalidate();
    };
    document.addEventListener('visibilitychange', resume);
    invalidate();
    return () => document.removeEventListener('visibilitychange', resume);
  }, [paused, invalidate]);
  useFrame((_, delta) => {
    if (!paused && !document.hidden) {
      elapsed.current += Math.min(delta, 0.1);
      invalidate();
    }
  }, -1);
  return <MotionContext value={elapsed}>{children}</MotionContext>;
}
export function useSceneMotionClock() {
  const clock = useContext(MotionContext);
  if (!clock) throw new Error('SceneMotion is required');
  return clock;
}
