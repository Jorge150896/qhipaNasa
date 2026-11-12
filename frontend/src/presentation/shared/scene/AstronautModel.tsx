import { Html, useGLTF } from '@react-three/drei';
import { useMemo, type RefObject } from 'react';
import { bodyZones, type SceneBodyRegion, type SceneSensor } from './astronautBodyZones';
const hotspots: {
  id: SceneSensor;
  label: string;
  name: string;
  position: [number, number, number];
}[] = [
  { id: 'temperature', label: 'T°', name: 'temperatura corporal', position: [0, 1.72, 0.18] },
  { id: 'heartRate', label: 'FC', name: 'frecuencia cardíaca', position: [0.18, 1.22, 0.3] },
  {
    id: 'respiration',
    label: 'Resp.',
    name: 'frecuencia respiratoria',
    position: [-0.44, 1.34, 0.34],
  },
  { id: 'oxygen', label: 'SpO₂', name: 'saturación de oxígeno', position: [-0.45, 0.82, 0.1] },
];
const touchableZones = ['heartRate', 'vision', 'fitness'] as const;

export function AstronautModel({
  selected,
  onSelect,
  portal,
  selectedSystem,
  activeBodyRegion,
  onSelectSystem,
}: {
  selectedSystem?: string;
  activeBodyRegion?: SceneBodyRegion;
  onSelectSystem?(id: 'cardio' | 'fitness' | 'vision'): void;
  selected: SceneSensor;
  onSelect(id: SceneSensor): void;
  portal: RefObject<HTMLElement>;
}) {
  const gltf = useGLTF('/models/astronaut.glb');
  const model = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  const highlight = activeBodyRegion && bodyZones[activeBodyRegion];
  return (
    <group position={[0, -1, 0]}>
      <primitive object={model} />
      {onSelectSystem &&
        touchableZones.map((zone) => (
          <mesh
            key={zone}
            position={bodyZones[zone].position}
            scale={bodyZones[zone].scale}
            onClick={(event) => {
              event.stopPropagation();
              if (zone === 'heartRate') onSelect(zone);
              else onSelectSystem(zone);
            }}
          >
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        ))}
      {highlight && (
        <group position={highlight.position} scale={highlight.scale}>
          <mesh position-z={0.45}>
            <circleGeometry args={[1, 40]} />
            <meshBasicMaterial color="#ff945b" transparent opacity={0.2} depthWrite={false} />
          </mesh>
          <mesh position-z={0.46}>
            <ringGeometry args={[0.94, 1, 40]} />
            <meshBasicMaterial color="#ffc19b" transparent opacity={0.9} depthWrite={false} />
          </mesh>
        </group>
      )}
      {onSelectSystem &&
        (
          [
            { id: 'vision', label: 'Visión', position: [0.37, 1.98, 0.25] },
            { id: 'fitness', label: 'Ejercicio', position: [-0.35, 0.4, 0.2] },
          ] as const
        ).map((item) => (
          <Html
            key={item.id}
            portal={portal}
            position={[...item.position]}
            center
            zIndexRange={[20, 0]}
            style={{ pointerEvents: 'auto' }}
          >
            <button
              className="scene-hotspot health-body-hotspot"
              aria-label={
                item.id === 'vision'
                  ? 'Explorar visión y sistema neuroocular'
                  : 'Explorar ejercicio y aparato locomotor'
              }
              aria-pressed={(activeBodyRegion ?? selectedSystem) === item.id}
              onClick={() => onSelectSystem(item.id)}
            >
              {item.label}
            </button>
          </Html>
        ))}
      {hotspots
        .filter(({ id }) => id !== 'respiration' || onSelectSystem)
        .map((item) => (
          <Html
            portal={portal}
            style={{ pointerEvents: 'auto' }}
            key={item.id}
            position={item.position}
            center
            zIndexRange={[20, 0]}
          >
            <button
              type="button"
              className="scene-hotspot"
              aria-label={`Consultar ${item.name}`}
              aria-pressed={(activeBodyRegion ?? selected) === item.id}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </button>
          </Html>
        ))}
    </group>
  );
}
