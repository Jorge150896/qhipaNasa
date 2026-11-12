import { useEffect, useRef, type ComponentRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { bodyZones, type SceneBodyRegion } from './astronautBodyZones';

type Controls = ComponentRef<typeof OrbitControls>;

export function AstronautCameraFocus({
  region,
  controls,
}: {
  region?: SceneBodyRegion;
  controls: RefObject<Controls | null>;
}) {
  const camera = useThree((state) => state.camera);
  const transition = useRef<{ target: Vector3; position: Vector3 } | null>(null);
  const focused = useRef(false);

  useEffect(() => {
    const orbit = controls.current;
    if (!orbit || (!region && !focused.current)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;

    const target = new Vector3();
    if (region) {
      const [x, y] = bodyZones[region].position;
      target.set(x * 0.55, (y - 1) * 0.55, 0);
    }
    const offset = camera.position.clone().sub(orbit.target);
    const distance = region ? Math.min(offset.length(), 3.8) : 4.3;
    transition.current = { target, position: target.clone().add(offset.setLength(distance)) };
    focused.current = Boolean(region);

    function stop() {
      transition.current = null;
    }
    orbit.addEventListener('start', stop);
    motion.addEventListener('change', stop);
    return () => {
      stop();
      orbit.removeEventListener('start', stop);
      motion.removeEventListener('change', stop);
    };
  }, [camera, controls, region]);

  useFrame((_, delta) => {
    const orbit = controls.current;
    const next = transition.current;
    if (!orbit || !next) return;
    const blend = 1 - Math.exp(-8 * Math.min(delta, 0.1));
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
