import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { PlanetSurface } from '@/presentation/shared/scene/PlanetSurface';
import { useSceneMotionClock } from './SceneMotion';
import { axialAngle, orbitalMotion } from './orbitalMotion';

export function PlanetModel({ kind, radius }: { kind: 'earth' | 'moon' | 'mars'; radius: number }) {
  const spin = useRef<Group>(null);
  const clock = useSceneMotionClock();
  useFrame(() => {
    if (spin.current) spin.current.rotation.y = axialAngle(kind, clock.current);
  });
  return (
    <group
      rotation={
        kind === 'moon'
          ? [orbitalMotion.moon.inclination, 0, 0]
          : [0.1, kind === 'earth' ? -1.3 : 0.7, -0.12]
      }
    >
      <group ref={spin}>
        <PlanetSurface kind={kind} radius={radius} />
      </group>
    </group>
  );
}
