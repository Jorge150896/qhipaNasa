import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group } from 'three';
import { BackSide, CanvasTexture, SRGBColorSpace } from 'three';
/** Original local sky illustration. Star positions and clouds are artistic, not catalog data. */
function makeSky() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Fondo no disponible');
  context.fillStyle = '#030610';
  context.fillRect(0, 0, 2048, 1024);
  let seed = 9261;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 38; i++) {
    const x = next() * 2048,
      y = 350 + next() * 320 + Math.sin(x / 310) * 110,
      radius = 90 + next() * 220;
    const cloud = context.createRadialGradient(x, y, 0, x, y, radius);
    cloud.addColorStop(0, i % 3 === 0 ? 'rgba(71,41,112,.14)' : 'rgba(28,70,104,.15)');
    cloud.addColorStop(1, 'rgba(3,6,16,0)');
    context.fillStyle = cloud;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  for (let i = 0; i < 4200; i++) {
    const x = next() * 2048,
      y = next() * 1024,
      bright = next(),
      radius = bright > 0.98 ? 1.4 : 0.25 + next() * 0.55;
    const warm = next() > 0.75;
    context.fillStyle = `rgba(${warm ? '255,220,178' : '196,222,255'},${0.22 + bright * 0.65})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    if (bright > 0.99) {
      const glow = context.createRadialGradient(x, y, 0, x, y, 7);
      glow.addColorStop(0, 'rgba(210,230,255,.28)');
      glow.addColorStop(1, 'rgba(155,195,255,0)');
      context.fillStyle = glow;
      context.fillRect(x - 7, y - 7, 14, 14);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
export function SpaceBackdrop({ radius = 12000 }: { radius?: number }) {
  const texture = useMemo(() => makeSky(), []);
  const sky = useRef<Group>(null);
  const { camera } = useThree();
  useFrame(() => {
    if (sky.current) sky.current.position.copy(camera.position);
  });
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group ref={sky}>
      <mesh rotation={[0, 0.8, 0.15]} renderOrder={-10} raycast={() => null}>
        <sphereGeometry args={[radius, 48, 32]} />
        <meshBasicMaterial map={texture} side={BackSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
