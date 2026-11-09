import { Html, useGLTF } from '@react-three/drei';
import { useMemo, type RefObject } from 'react';
export type SceneSensor = 'heartRate' | 'temperature' | 'oxygen' | 'respiration';
const hotspots: { id: SceneSensor; label: string; position: [number, number, number] }[] = [
  { id: 'temperature', label: 'T°', position: [0, 1.72, 0.18] },
  { id: 'heartRate', label: 'FC', position: [0.18, 1.22, 0.3] },
  { id: 'oxygen', label: 'SpO₂', position: [-0.45, 0.82, 0.1] },
];
export function AstronautModel({
  selected,
  onSelect,
  portal,
  selectedSystem,
  onSelectSystem,
}: {
  selectedSystem?: string;
  onSelectSystem?(id: 'cardio' | 'fitness' | 'vision'): void;
  selected: SceneSensor;
  onSelect(id: SceneSensor): void;
  portal: RefObject<HTMLElement>;
}) {
  const gltf = useGLTF('/models/astronaut.glb');
  const model = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  return (
    <group position={[0, -1, 0]}>
      <primitive object={model} />
      {onSelectSystem &&
        (
          [
            { id: 'vision', label: 'Ojos', position: [0.37, 1.98, 0.25] },
            { id: 'fitness', label: 'Músculos', position: [-0.35, 0.4, 0.2] },
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
              aria-pressed={selectedSystem === item.id}
              onClick={() => onSelectSystem(item.id)}
            >
              {item.label}
            </button>
          </Html>
        ))}
      {hotspots.map((item) => (
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
            aria-label={`Consultar ${item.id === 'heartRate' ? 'frecuencia cardíaca' : item.id === 'temperature' ? 'temperatura corporal' : 'saturación de oxígeno'}`}
            aria-pressed={selected === item.id}
            onClick={() => {
              onSelect(item.id);
              if (item.id === 'heartRate') onSelectSystem?.('cardio');
            }}
          >
            {item.label}
          </button>
        </Html>
      ))}
    </group>
  );
}
