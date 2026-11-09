import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { useSceneMotionClock } from './SceneMotion';
import { axialAngle, orbitalMotion } from './orbitalMotion';
import { CanvasTexture, SRGBColorSpace } from 'three';
function makeTexture(kind: 'earth' | 'moon' | 'mars') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Textura no disponible');
  context.fillStyle = kind === 'earth' ? '#123c68' : kind === 'moon' ? '#aaa9a5' : '#b96443';
  context.fillRect(0, 0, 1024, 512);
  // Original procedural illustration, not a geographical or scientific surface map.
  let seed = kind === 'earth' ? 17 : kind === 'moon' ? 31 : 53;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  if (kind === 'earth') {
    const land = [
      [
        [100, 80],
        [195, 55],
        [270, 105],
        [240, 170],
        [190, 230],
        [150, 180],
        [125, 140],
      ],
      [
        [240, 210],
        [310, 245],
        [330, 295],
        [300, 385],
        [265, 440],
        [240, 340],
        [220, 265],
      ],
      [
        [465, 110],
        [535, 85],
        [565, 140],
        [550, 180],
        [600, 225],
        [565, 330],
        [520, 350],
        [490, 270],
        [470, 200],
      ],
      [
        [540, 90],
        [660, 55],
        [790, 70],
        [890, 120],
        [850, 185],
        [770, 195],
        [750, 250],
        [700, 180],
        [620, 190],
      ],
      [
        [785, 335],
        [850, 320],
        [900, 370],
        [860, 400],
        [800, 385],
      ],
    ];
    land.forEach((points) => {
      context.beginPath();
      points.forEach(([x, y], index) => (index ? context.lineTo(x, y) : context.moveTo(x, y)));
      context.closePath();
      context.fillStyle = '#557b63';
      context.fill();
    });
    for (let i = 0; i < 180; i++) {
      context.fillStyle = `rgba(226,241,246,${0.06 + next() * 0.17})`;
      context.beginPath();
      context.ellipse(
        next() * 1024,
        next() * 512,
        10 + next() * 80,
        2 + next() * 12,
        -0.15,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
    context.fillStyle = '#d5e5e6';
    context.fillRect(0, 0, 1024, 18);
    context.fillRect(0, 490, 1024, 22);
  } else {
    for (let i = 0; i < 650; i++) {
      const x = next() * 1024,
        y = next() * 512,
        radius = 2 + next() * 22;
      context.fillStyle =
        kind === 'moon' ? `rgba(45,47,52,${next() * 0.22})` : `rgba(89,43,29,${next() * 0.2})`;
      context.beginPath();
      context.ellipse(x, y, radius * 1.5, radius, 0, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = 'rgba(255,224,194,.09)';
      context.stroke();
    }
    if (kind === 'mars') {
      context.fillStyle = '#e5d1b4';
      context.fillRect(0, 0, 1024, 15);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
export function PlanetModel({ kind, radius }: { kind: 'earth' | 'moon' | 'mars'; radius: number }) {
  const texture = useMemo(() => makeTexture(kind), [kind]);
  const spin = useRef<Group>(null);
  const clock = useSceneMotionClock();
  useFrame(() => {
    if (spin.current) spin.current.rotation.y = axialAngle(kind, clock.current);
  });
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group
      rotation={
        kind === 'moon'
          ? [orbitalMotion.moon.inclination, 0, 0]
          : [0.1, kind === 'earth' ? -1.3 : 0.7, -0.12]
      }
    >
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[radius, 64, 40]} />
          <meshStandardMaterial map={texture} roughness={0.85} />
        </mesh>
      </group>
      {kind === 'earth' && (
        <mesh>
          <sphereGeometry args={[radius * 1.035, 48, 32]} />
          <meshStandardMaterial color="#589dbd" transparent opacity={0.09} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
