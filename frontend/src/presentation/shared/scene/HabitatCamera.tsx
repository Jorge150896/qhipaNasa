import { useEffect, useRef, type ComponentRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls } from '@react-three/drei';
import { Euler, Vector3 } from 'three';
import {
  habitatRotation,
  habitatScale,
  habitatZoneIds,
  habitatZoneX,
  shuttleCutawayScale,
  shuttleRotation,
} from './habitatLayout';
import { shuttleModules } from './shuttleModules';

export type HabitatCameraView = 'module' | 'overview';
export const shuttleOverview: [number, number, number] = [7.55, 5.25, -2.45];
export const habitatOverview: [number, number, number] = [3, 1.8, -4.4];

function moduleTarget(zone: string, cutaway: boolean) {
  if (cutaway) {
    const selected = shuttleModules.find(({ id }) => id === zone);
    return selected
      ? new Vector3(0, -0.12, selected.z)
          .multiplyScalar(shuttleCutawayScale)
          .applyEuler(new Euler(...shuttleRotation))
      : undefined;
  }

  const index = habitatZoneIds.findIndex((id) => id === zone);
  return index < 0
    ? undefined
    : new Vector3(habitatZoneX(index), 0, 0)
        .multiplyScalar(habitatScale)
        .applyEuler(new Euler(...habitatRotation));
}

export function HabitatCamera({
  controls,
  request,
  zone,
  cutaway,
}: {
  controls: RefObject<ComponentRef<typeof OrbitControls> | null>;
  request?: { view: HabitatCameraView; revision: number };
  zone?: string;
  cutaway: boolean;
}) {
  const camera = useThree((state) => state.camera);
  const transition = useRef<{ target: Vector3; position: Vector3 } | null>(null);

  useEffect(() => {
    const orbit = controls.current;
    if (!orbit || !request) return;

    const overview = cutaway ? shuttleOverview : habitatOverview;
    const target = zone && request.view === 'module' ? moduleTarget(zone, cutaway) : undefined;
    const offset = new Vector3(...overview);
    const next = {
      target: target ?? new Vector3(),
      position: target ? target.clone().add(offset.setLength(cutaway ? 3.85 : 2.9)) : offset,
    };

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function finish() {
      orbit?.target.copy(next.target);
      camera.position.copy(next.position);
      orbit?.update();
      transition.current = null;
    }
    function stop() {
      transition.current = null;
    }
    function onMotionChange() {
      if (motion.matches && transition.current) finish();
    }

    if (motion.matches) finish();
    else transition.current = next;

    orbit.addEventListener('start', stop);
    motion.addEventListener('change', onMotionChange);
    return () => {
      stop();
      orbit.removeEventListener('start', stop);
      motion.removeEventListener('change', onMotionChange);
    };
  }, [camera, controls, request, zone, cutaway]);

  useFrame((_, delta) => {
    const orbit = controls.current;
    const next = transition.current;
    if (!orbit || !next) return;
    const blend = 1 - Math.exp(-7 * Math.min(delta, 0.1));
    orbit.target.lerp(next.target, blend);
    camera.position.lerp(next.position, blend);
    if (camera.position.distanceToSquared(next.position) < 0.0001) {
      orbit.target.copy(next.target);
      camera.position.copy(next.position);
      transition.current = null;
    }
    orbit.update();
  });

  return null;
}
