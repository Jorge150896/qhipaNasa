import { ShuttleExteriorModel } from './ShuttleExteriorModel';
import { useMemo, type RefObject } from 'react';
import { Shape } from 'three';
import { HabitatZoneMarker, type HabitatModuleMarkers } from './HabitatZoneMarker';
import { ShuttleModuleDeck } from './ShuttleModuleDeck';
import { shuttleModules } from './shuttleModules';
import { shuttleCutawayScale, shuttleRotation } from './habitatLayout';
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
  modules,
}: {
  selectedZone: string;
  onSelectZone(id: string): void;
  portal: RefObject<HTMLElement>;
  showZones?: boolean;
  modules?: HabitatModuleMarkers;
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
  if (!modules)
    return (
      <ShuttleExteriorModel
        selectedZone={selectedZone}
        onSelectZone={onSelectZone}
        portal={portal}
        showZones={showZones}
      />
    );
  const material = { color: '#e0e6ee', roughness: 0.6, metalness: 0.2 };
  const noseOffset = modules ? -1.28 : 0;
  const tailOffset = modules ? 1.28 : 0;
  return (
    <group scale={modules ? shuttleCutawayScale : 0.55} rotation={[...shuttleRotation]}>
      {modules ? (
        <ShuttleModuleDeck
          selectedZone={selectedZone}
          onSelectZone={onSelectZone}
          portal={portal}
          markers={modules}
        />
      ) : (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.66, 0.66, 4.7, 40]} />
          <meshStandardMaterial {...material} />
        </mesh>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3.1 + noseOffset]}>
        <coneGeometry args={[0.66, 1.7, 40]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[0, -0.24, -2.45 + noseOffset]} scale={[1, 0.6, 1.6]}>
        <sphereGeometry args={[0.6, 32, 16]} />
        <meshStandardMaterial color="#162334" />
      </mesh>
      <mesh
        position={modules ? [0, 0.16, -3.8] : [0, 0.31, -1.85]}
        scale={modules ? [1, 0.52, 1.18] : [1, 0.65, 1.3]}
      >
        <sphereGeometry args={[0.48, 32, 16]} />
        <meshStandardMaterial
          {...material}
          color={modules ? '#244157' : material.color}
          metalness={modules ? 0.63 : material.metalness}
        />
      </mesh>
      {!modules &&
        [-1, 1].map((sign) => (
          <mesh key={sign} position={[sign * 0.24, 0.62, -2.04]}>
            <boxGeometry args={[0.36, 0.13, 0.42]} />
            <meshStandardMaterial color="#0c273e" metalness={0.85} roughness={0.15} />
          </mesh>
        ))}
      {shapes.map((shape, i) => (
        <group key={i} position-z={modules ? 0.55 : 0} scale-z={modules ? 1.28 : 1}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, modules ? -0.63 : -0.28, 0]}>
            <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: false }]} />
            <meshStandardMaterial {...material} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, modules ? -0.74 : -0.4, 0]}>
            <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: false }]} />
            <meshStandardMaterial color="#162334" />
          </mesh>
          {modules && (
            <group position-x={i === 0 ? -1.6 : 1.6}>
              {[1.32, 1.43, 1.54].map((z) => (
                <mesh key={z} position={[0, -0.618, z]}>
                  <boxGeometry args={[0.72, 0.018, 0.025]} />
                  <meshStandardMaterial color="#526780" />
                </mesh>
              ))}
              <mesh position={[i === 0 ? -0.3 : 0.3, -0.617, 1.66]}>
                <boxGeometry args={[0.26, 0.018, 0.045]} />
                <meshBasicMaterial color={i === 0 ? '#be99ff' : '#ff9561'} />
              </mesh>
            </group>
          )}
        </group>
      ))}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={modules ? [-0.71, -0.34, 3.91] : [-0.05, 0.38, 2.15]}
        scale={modules ? 0.58 : 1}
      >
        <extrudeGeometry args={[fin, { depth: 0.1, bevelEnabled: false }]} />
        <meshStandardMaterial {...material} />
      </mesh>
      {[
        [-0.38, -0.08],
        [0.38, -0.08],
        [0, 0.45],
      ].map(([x, y], i) => (
        <mesh
          key={i}
          rotation={[Math.PI / 2, 0, 0]}
          position={[x, y - (modules ? 0.23 : 0), 2.72 + tailOffset]}
        >
          <cylinderGeometry args={[0.23, 0.38, 0.72, 28, 1, true]} />
          <meshStandardMaterial color="#6c7d8e" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {(modules
        ? [...shuttleModules.map(({ z }) => z - 0.74), 3.7]
        : Array.from({ length: 10 }, (_, i) => -1.8 + i * 0.4)
      ).map((z) => (
        <mesh key={z} position={[0, 0, z]} rotation-z={modules ? Math.PI : 0}>
          <torusGeometry
            args={[
              modules ? 0.8 : 0.665,
              modules ? 0.024 : 0.008,
              4,
              40,
              modules ? Math.PI : Math.PI * 2,
            ]}
          />
          <meshStandardMaterial color="#8c9eaf" />
        </mesh>
      ))}
      {showZones &&
        !modules &&
        [
          { id: 'habitat', text: '01', position: [-0.7, 0.9, -1.4] },
          { id: 'exercise', text: '02', position: [1.6, 0.7, 0.6] },
          { id: 'laboratory', text: '03', position: [-0.5, 0.9, 1.5] },
        ].map((zone) => (
          <HabitatZoneMarker
            key={zone.id}
            id={zone.id}
            code={zone.text}
            position={zone.position as [number, number, number]}
            selectedZone={selectedZone}
            onSelectZone={onSelectZone}
            portal={portal}
          />
        ))}
    </group>
  );
}
