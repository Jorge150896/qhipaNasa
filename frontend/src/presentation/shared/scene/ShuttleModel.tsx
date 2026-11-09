import { Html } from '@react-three/drei';
import { useMemo, type RefObject } from 'react';
import { Shape } from 'three';
function makeWing(sign: number) {
  const shape = new Shape();
  shape.moveTo(0, -2.3);
  shape.lineTo(sign * 2.65, 1.8);
  shape.lineTo(sign * 2.5, 2.2);
  shape.lineTo(0, 1.4);
  shape.closePath();
  return shape;
}
export function ShuttleModel({
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
  const shapes = useMemo(() => [makeWing(-1), makeWing(1)], []);
  const fin = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, 1.7);
    shape.lineTo(1.9, 0);
    shape.closePath();
    return shape;
  }, []);
  const material = { color: '#e0e6ee', roughness: 0.6, metalness: 0.2 };
  return (
    <group scale={0.55} rotation={[0.08, 0.5, -0.12]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.66, 0.66, 4.7, 40]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3.1]}>
        <coneGeometry args={[0.66, 1.7, 40]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[0, -0.24, -2.45]} scale={[1, 0.6, 1.6]}>
        <sphereGeometry args={[0.6, 32, 16]} />
        <meshStandardMaterial color="#162334" />
      </mesh>
      <mesh position={[0, 0.31, -1.85]} scale={[1, 0.65, 1.3]}>
        <sphereGeometry args={[0.48, 32, 16]} />
        <meshStandardMaterial {...material} />
      </mesh>
      {[-1, 1].map((sign) => (
        <mesh key={sign} position={[sign * 0.24, 0.62, -2.04]}>
          <boxGeometry args={[0.36, 0.13, 0.42]} />
          <meshStandardMaterial color="#0c273e" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
      {shapes.map((shape, i) => (
        <group key={i}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.28, 0]}>
            <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: false }]} />
            <meshStandardMaterial {...material} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
            <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: false }]} />
            <meshStandardMaterial color="#162334" />
          </mesh>
        </group>
      ))}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-0.05, 0.38, 2.15]}>
        <extrudeGeometry args={[fin, { depth: 0.1, bevelEnabled: false }]} />
        <meshStandardMaterial {...material} />
      </mesh>
      {[
        [-0.38, -0.08],
        [0.38, -0.08],
        [0, 0.45],
      ].map(([x, y], i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[x, y, 2.72]}>
          <cylinderGeometry args={[0.23, 0.38, 0.72, 28, 1, true]} />
          <meshStandardMaterial color="#6c7d8e" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[0, 0, -1.8 + i * 0.4]}>
          <torusGeometry args={[0.665, 0.008, 4, 40]} />
          <meshStandardMaterial color="#8c9eaf" />
        </mesh>
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
