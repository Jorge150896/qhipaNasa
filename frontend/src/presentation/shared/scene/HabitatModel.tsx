import { HabitatZoneMarker, type HabitatModuleMarkers } from './HabitatZoneMarker';
import type { RefObject } from 'react';
import { habitatRotation, habitatScale, habitatZoneIds, habitatZoneX } from './habitatLayout';
/** Conceptual modules: zone labels are illustrative, never a technical floor plan. */
export function HabitatModel({
  kind,
  selectedZone,
  onSelectZone,
  portal,
  modules,
}: {
  kind: 'station' | 'base';
  selectedZone: string;
  onSelectZone(id: string): void;
  portal: RefObject<HTMLElement>;
  modules?: HabitatModuleMarkers;
}) {
  return (
    <group rotation={[...habitatRotation]} scale={habitatScale}>
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[4, 0.15, 1.6]} />
        <meshStandardMaterial color="#324655" metalness={0.6} />
      </mesh>
      {habitatZoneIds.map((zone, index) => (
        <group key={zone} position={[habitatZoneX(index), 0, 0]}>
          <mesh
            rotation={[Math.PI / 2, 0, 0]}
            onClick={
              modules
                ? (event) => {
                    event.stopPropagation();
                    onSelectZone(zone);
                  }
                : undefined
            }
          >
            <capsuleGeometry args={[0.5, 0.8, 8, 24]} />
            <meshStandardMaterial
              color={selectedZone === zone ? (modules ? '#ae83eb' : '#9ccecd') : '#d4dce1'}
              metalness={0.4}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.13, -0.82]}>
            <circleGeometry args={[0.23, 24]} />
            <meshStandardMaterial color="#1b3c55" metalness={0.6} />
          </mesh>
          <HabitatZoneMarker
            id={zone}
            code={`0${index + 1}`}
            position={[0, 0.8, 0]}
            selectedZone={selectedZone}
            onSelectZone={onSelectZone}
            portal={portal}
            modules={modules}
          />
        </group>
      ))}
      {kind === 'station' ? (
        [-1, 1].map((side) => (
          <mesh key={side} position={[side * 2.8, 0, 0]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[1.3, 0.06, 3.5]} />
            <meshStandardMaterial color="#32618d" metalness={0.65} />
          </mesh>
        ))
      ) : (
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[3.1, 3.2, 0.15, 48]} />
          <meshStandardMaterial color="#726960" roughness={1} />
        </mesh>
      )}
    </group>
  );
}
