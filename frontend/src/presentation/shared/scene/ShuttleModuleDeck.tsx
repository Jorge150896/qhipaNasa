import type { RefObject } from 'react';
import { HabitatZoneMarker, type HabitatModuleMarkers } from './HabitatZoneMarker';
import {
  shuttleDeckLength,
  shuttleModuleLength,
  shuttleModules,
  shuttleModuleWidth,
  type ShuttleModuleId,
} from './shuttleModules';

type Coordinates = [number, number, number];
const shell = '#9aaac2';
const padding = '#72709e';
const graphite = '#242941';
const lightPanel = '#d5dded';

function DeckBox({
  at,
  size,
  color,
  rotation = [0, 0, 0],
  lit = false,
}: {
  at: Coordinates;
  size: Coordinates;
  color: string;
  rotation?: Coordinates;
  lit?: boolean;
}) {
  return (
    <mesh position={at} rotation={rotation}>
      <boxGeometry args={size} />
      {lit ? (
        <meshBasicMaterial color={color} />
      ) : (
        <meshStandardMaterial color={color} metalness={0.22} roughness={0.6} />
      )}
    </mesh>
  );
}

function Console({ color }: { color: string }) {
  return (
    <>
      <DeckBox at={[0, 0.16, 0]} size={[0.77, 0.32, 0.31]} color={shell} />
      <DeckBox at={[0, 0.33, 0.015]} size={[0.83, 0.06, 0.37]} color={graphite} />
      {[-0.21, 0.21].map((x) => (
        <group key={x} position={[x, 0.43, -0.12]} rotation-x={-0.35}>
          <DeckBox at={[0, 0, 0]} size={[0.36, 0.22, 0.045]} color={graphite} />
          <DeckBox at={[0, 0, 0.025]} size={[0.29, 0.15, 0.01]} color={color} lit />
          <DeckBox at={[0.025, -0.02, 0.032]} size={[0.2, 0.017, 0.005]} color="#223b53" lit />
        </group>
      ))}
    </>
  );
}

function ModuleEquipment({ id }: { id: ShuttleModuleId }) {
  switch (id) {
    case 'cockpit':
      return (
        <>
          <group position={[-0.08, 0, -0.33]}>
            <Console color="#79dff5" />
          </group>
          {[-0.3, 0.15].map((x) => (
            <group key={x} position={[x, 0, 0.28]}>
              <DeckBox at={[0, 0.1, 0]} size={[0.15, 0.2, 0.14]} color={shell} />
              <DeckBox at={[0, 0.24, 0]} size={[0.27, 0.09, 0.28]} color={padding} />
              <DeckBox at={[0, 0.4, 0.12]} size={[0.28, 0.34, 0.09]} color={graphite} />
              <DeckBox at={[0, 0.58, 0.12]} size={[0.17, 0.09, 0.08]} color={shell} />
            </group>
          ))}
        </>
      );
    case 'habitat':
      return (
        <>
          {[-0.33, 0.19].map((x) => (
            <group key={x} position={[x, 0, -0.06]}>
              <DeckBox at={[0, 0.08, 0]} size={[0.35, 0.16, 1.02]} color={graphite} />
              <DeckBox at={[0, 0.19, 0]} size={[0.33, 0.08, 0.98]} color={lightPanel} />
              <DeckBox at={[0, 0.24, -0.34]} size={[0.25, 0.06, 0.22]} color="#ece5f8" />
              <DeckBox at={[0, 0.23, 0.15]} size={[0.31, 0.06, 0.55]} color={padding} />
              <DeckBox at={[0, 0.3, -0.52]} size={[0.35, 0.33, 0.05]} color={shell} />
              <DeckBox at={[0, 0.45, -0.48]} size={[0.25, 0.02, 0.03]} color="#e8adf8" lit />
            </group>
          ))}
        </>
      );
    case 'exercise':
      return (
        <>
          <DeckBox at={[-0.14, 0.04, 0.08]} size={[0.46, 0.08, 1.1]} color={graphite} />
          <mesh position={[-0.14, 0.27, -0.2]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.19, 0.19, 0.12, 20]} />
            <meshStandardMaterial color="#e19765" metalness={0.55} roughness={0.45} />
          </mesh>
          <DeckBox
            at={[-0.14, 0.4, 0.14]}
            size={[0.09, 0.63, 0.085]}
            color={shell}
            rotation={[0.27, 0, 0]}
          />
          <DeckBox at={[-0.14, 0.67, 0.05]} size={[0.27, 0.07, 0.17]} color={graphite} />
          <DeckBox
            at={[-0.14, 0.44, -0.26]}
            size={[0.09, 0.52, 0.08]}
            color={shell}
            rotation={[-0.3, 0, 0]}
          />
          <DeckBox at={[-0.14, 0.68, -0.34]} size={[0.35, 0.06, 0.08]} color={graphite} />
          <DeckBox at={[-0.14, 0.72, -0.37]} size={[0.15, 0.09, 0.03]} color="#f4c385" lit />
          <DeckBox at={[0.35, 0.08, 0.19]} size={[0.26, 0.16, 0.56]} color={shell} />
          <DeckBox at={[0.35, 0.18, 0.19]} size={[0.25, 0.07, 0.49]} color={padding} />
        </>
      );
    case 'laboratory':
      return (
        <>
          <group position={[-0.08, 0, -0.3]}>
            <Console color="#87dfc5" />
          </group>
          <DeckBox at={[-0.1, 0.11, 0.33]} size={[0.79, 0.22, 0.46]} color={shell} />
          <DeckBox at={[-0.1, 0.24, 0.33]} size={[0.84, 0.055, 0.5]} color={lightPanel} />
          {[-0.31, -0.16, -0.01].map((x) => (
            <mesh key={x} position={[x, 0.34, 0.37]}>
              <cylinderGeometry args={[0.047, 0.047, 0.18, 12]} />
              <meshStandardMaterial color="#60bba9" metalness={0.36} />
            </mesh>
          ))}
          <DeckBox at={[0.21, 0.33, 0.37]} size={[0.19, 0.13, 0.19]} color={graphite} />
        </>
      );
    case 'life-support':
      return (
        <>
          {[-0.33, 0].map((x) => (
            <group key={x} position={[x, 0, 0.11]}>
              <mesh position-y={0.32}>
                <capsuleGeometry args={[0.13, 0.37, 4, 16]} />
                <meshStandardMaterial color="#8fabd8" metalness={0.62} roughness={0.35} />
              </mesh>
              <DeckBox at={[0, 0.31, 0]} size={[0.29, 0.06, 0.28]} color={graphite} />
              <DeckBox at={[0, 0.66, 0]} size={[0.08, 0.09, 0.08]} color={shell} />
            </group>
          ))}
          <DeckBox at={[-0.15, 0.73, 0.11]} size={[0.44, 0.055, 0.055]} color="#eea075" />
          <DeckBox at={[0.38, 0.27, 0.03]} size={[0.32, 0.54, 0.6]} color={shell} />
          {[-0.17, 0.01, 0.19].map((z) => (
            <DeckBox key={z} at={[0.38, 0.55, z]} size={[0.23, 0.02, 0.06]} color={graphite} />
          ))}
          <DeckBox at={[0.38, 0.56, 0.33]} size={[0.17, 0.02, 0.04]} color="#99d7fd" lit />
        </>
      );
  }
}

export function ShuttleModuleDeck({
  selectedZone,
  onSelectZone,
  portal,
  markers,
}: {
  selectedZone: string;
  onSelectZone(id: string): void;
  portal: RefObject<HTMLElement>;
  markers: HabitatModuleMarkers;
}) {
  return (
    <group position-y={-0.36}>
      <DeckBox at={[0, -0.17, 0]} size={[1.61, 0.24, shuttleDeckLength]} color={graphite} />
      {shuttleModules.map((module) => {
        const selected = selectedZone === module.id;
        const occupied = markers.occupiedId === module.id;
        const trim = selected ? '#e5c7ff' : module.color;
        return (
          <group key={module.id} position-z={module.z}>
            <group
              onClick={(event) => {
                event.stopPropagation();
                onSelectZone(module.id);
              }}
            >
              <DeckBox
                at={[0, -0.06, 0]}
                size={[shuttleModuleWidth, 0.12, shuttleModuleLength]}
                color={selected ? '#65528a' : '#3c3c58'}
              />
              <DeckBox
                at={[-0.69, 0.19, 0]}
                size={[0.07, 0.39, shuttleModuleLength]}
                color={shell}
              />
              <DeckBox at={[-0.65, 0.26, 0]} size={[0.018, 0.18, 0.91]} color={graphite} />
              <DeckBox at={[-0.63, 0.29, 0]} size={[0.018, 0.045, 0.68]} color={trim} lit />
              <DeckBox at={[0.66, 0.018, 0]} size={[0.025, 0.028, 1.35]} color={trim} lit />
              {[-0.7, 0.7].map((z) => (
                <DeckBox
                  key={z}
                  at={[0, 0.039, z]}
                  size={[1.36, 0.08, 0.046]}
                  color={selected ? trim : shell}
                />
              ))}
              <ModuleEquipment id={module.id} />
            </group>
            {occupied && (
              <group position={[0.47, 0, 0.48]}>
                <mesh position-y={0.28}>
                  <sphereGeometry args={[0.095, 16, 12]} />
                  <meshBasicMaterial color="#ffbf9c" />
                </mesh>
                <mesh position-y={0.135}>
                  <capsuleGeometry args={[0.085, 0.13, 4, 12]} />
                  <meshBasicMaterial color="#fb763d" />
                </mesh>
                <mesh position-y={0.025} rotation-x={-Math.PI / 2}>
                  <ringGeometry args={[0.11, 0.16, 24]} />
                  <meshBasicMaterial color="#ff9c69" />
                </mesh>
              </group>
            )}
            <DeckBox
              at={[0.92, 0.22, 0]}
              size={[0.017, 0.57, 0.017]}
              rotation={[0, 0, -0.91]}
              color={trim}
              lit
            />
            <HabitatZoneMarker
              id={module.id}
              code={module.code}
              position={[1.15, 0.4, 0]}
              selectedZone={selectedZone}
              onSelectZone={onSelectZone}
              portal={portal}
              modules={markers}
              showCode
            />
          </group>
        );
      })}
    </group>
  );
}
