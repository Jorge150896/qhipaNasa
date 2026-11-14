import { Html } from '@react-three/drei';
import { useEffect, useMemo, type RefObject } from 'react';
import { CanvasTexture, Shape, SplineCurve, SRGBColorSpace, Vector2 } from 'three';

function makeWing(sign: number) {
  const shape = new Shape();
  shape.moveTo(0, -1.9);
  shape.lineTo(sign * 0.85, -0.65);
  shape.lineTo(sign * 2.65, 1.8);
  shape.lineTo(sign * 2.5, 2.2);
  shape.lineTo(sign * 0.65, 1.55);
  shape.lineTo(0, 1.2);
  shape.closePath();
  return shape;
}

/** Original, deterministic panel illustration. No external fonts, logos or model assets. */
function makeHullTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.fillStyle = '#e7ebef';
  context.fillRect(0, 0, 512, 1024);
  for (let row = 0; row < 32; row++) {
    for (let column = 0; column < 12; column++) {
      const x = column * 48 - (row % 2) * 24;
      const y = row * 32;
      context.fillStyle = (row + column) % 4 === 0 ? '#dce2e8' : '#e7ebef';
      context.fillRect(x + 1, y + 1, 47, 31);
      context.strokeStyle = '#bfc9d2';
      context.lineWidth = 0.6;
      context.strokeRect(x, y, 48, 32);
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function ShuttleExteriorModel({
  selectedZone,
  onSelectZone,
  portal,
  showZones = true,
}: {
  selectedZone: string;
  onSelectZone(id: string): void;
  portal: RefObject<HTMLElement>;
  showZones?: boolean;
}) {
  const texture = useMemo(() => makeHullTexture(), []);
  useEffect(() => () => texture?.dispose(), [texture]);
  const shapes = useMemo(() => [makeWing(-1), makeWing(1)], []);
  const hull = useMemo(
    () =>
      new SplineCurve([
        new Vector2(0, -3.85),
        new Vector2(0.18, -3.65),
        new Vector2(0.36, -3.25),
        new Vector2(0.54, -2.7),
        new Vector2(0.64, -1.8),
        new Vector2(0.69, -0.6),
        new Vector2(0.7, 0.6),
        new Vector2(0.67, 1.6),
        new Vector2(0.59, 2.25),
        new Vector2(0, 2.3),
      ])
        .getPoints(72)
        .map((point) => new Vector2(Math.max(0, point.x), point.y)),
    [],
  );
  const fin = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, 1.6);
    shape.lineTo(0.35, 1.5);
    shape.lineTo(1.75, 0);
    shape.closePath();
    return shape;
  }, []);
  const paint = { color: '#d5dde5', roughness: 0.72, metalness: 0.08 };
  return (
    <group scale={0.55} rotation={[0.08, 0.5, -0.12]}>
      <group scale={[1, 0.82, 1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <latheGeometry args={[hull, 48]} />
          <meshStandardMaterial {...paint} map={texture} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.009, 1, 1.009]}>
          <latheGeometry args={[hull, 48, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color="#252d36" map={texture} roughness={0.98} metalness={0.02} />
        </mesh>
      </group>
      <mesh position={[0, 0.46, -2.05]} scale={[0.51, 0.2, 0.8]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshPhysicalMaterial
          color="#102c40"
          roughness={0.16}
          metalness={0.25}
          clearcoat={0.8}
          clearcoatRoughness={0.12}
        />
      </mesh>
      <mesh position={[0, 0.64, -2.05]}>
        <boxGeometry args={[0.035, 0.035, 1.3]} />
        <meshStandardMaterial {...paint} />
      </mesh>
      <mesh position={[0, 0.59, -1.85]}>
        <boxGeometry args={[0.87, 0.035, 0.035]} />
        <meshStandardMaterial {...paint} />
      </mesh>
      {shapes.map((shape, index) => (
        <group key={index}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.27, 0]}>
            <extrudeGeometry args={[shape, { depth: 0.09, bevelEnabled: false }]} />
            <meshStandardMaterial {...paint} map={texture} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.39, 0]}>
            <extrudeGeometry args={[shape, { depth: 0.08, bevelEnabled: false }]} />
            <meshStandardMaterial color="#202a35" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-0.05, 0.42, 2.15]}>
        <extrudeGeometry args={[fin, { depth: 0.1, bevelEnabled: false }]} />
        <meshStandardMaterial {...paint} map={texture} />
      </mesh>
      <mesh position={[0, 0.585, 0.15]}>
        <boxGeometry args={[0.022, 0.016, 2.6]} />
        <meshStandardMaterial color="#58697c" roughness={0.8} />
      </mesh>
      {[-0.9, -0.3, 0.3, 0.9].map((z) => (
        <mesh key={z} position={[0, 0.577, z]}>
          <boxGeometry args={[0.65, 0.012, 0.02]} />
          <meshStandardMaterial color="#8796a6" />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[side * 0.68, 0.26, 1.6]}>
            <capsuleGeometry args={[0.2, 0.8, 6, 16]} />
            <meshStandardMaterial {...paint} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 0.7, 0, 0.4]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 24]} />
            <meshStandardMaterial color="#72869b" roughness={0.5} metalness={0.45} />
          </mesh>
        </group>
      ))}
      {[
        [-0.38, -0.08],
        [0.38, -0.08],
        [0, 0.45],
      ].map(([x, y], index) => (
        <group key={index}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[x, y, 2.62]}>
            <cylinderGeometry args={[0.36, 0.18, 0.72, 28, 1, true]} />
            <meshStandardMaterial color="#5e6c7e" metalness={0.75} roughness={0.4} side={2} />
          </mesh>
          <mesh position={[x, y, 2.985]}>
            <torusGeometry args={[0.36, 0.024, 8, 28]} />
            <meshStandardMaterial color="#a7b4c3" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[x, y, 2.93]}>
            <circleGeometry args={[0.3, 28]} />
            <meshBasicMaterial color="#080d14" />
          </mesh>
        </group>
      ))}
      {showZones &&
        [
          { id: 'habitat', text: '01', position: [-0.7, 0.9, -1.4] },
          { id: 'exercise', text: '02', position: [1.6, 0.7, 0.6] },
          { id: 'laboratory', text: '03', position: [-0.5, 0.9, 1.5] },
        ].map((zone) => (
          <Html
            portal={portal}
            style={{ pointerEvents: 'auto' }}
            key={zone.id}
            position={zone.position as [number, number, number]}
            center
            zIndexRange={[20, 0]}
          >
            <button
              type="button"
              className="scene-hotspot"
              aria-label={`Seleccionar zona ${zone.text}`}
              aria-pressed={selectedZone === zone.id}
              onClick={() => onSelectZone(zone.id)}
            >
              {zone.text}
            </button>
          </Html>
        ))}
    </group>
  );
}
