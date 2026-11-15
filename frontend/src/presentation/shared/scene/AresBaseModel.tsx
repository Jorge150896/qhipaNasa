import { RoundedBox } from '@react-three/drei';
import { habitatZoneIds } from './habitatLayout';

type AresModuleId = (typeof habitatZoneIds)[number];

const hull = '#adb3b5';
const frame = '#303644';
const insulation = '#8b4b32';
const amber = '#ff9d58';

export function AresModule({ zone, selected }: { zone: AresModuleId; selected: boolean }) {
  const trim = selected ? '#bc8aff' : amber;
  const isLab = zone === 'laboratory';
  const isExercise = zone === 'exercise';
  const bulkheadZ = isExercise ? -0.87 : -0.8;
  const exteriorZ = bulkheadZ - 0.095;

  return (
    <>
      {isLab ? (
        <RoundedBox args={[1.05, 0.74, 1.65]} radius={0.12} smoothness={3} position={[0, 0.04, 0]}>
          <meshStandardMaterial color={hull} metalness={0.32} roughness={0.66} />
        </RoundedBox>
      ) : (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[isExercise ? 0.48 : 0.39, 0.83, 5, 24]} />
          <meshStandardMaterial color={hull} metalness={0.32} roughness={0.66} />
        </mesh>
      )}
      {[-0.46, 0.46].map((z) => (
        <group key={z} position={[0, 0, z]}>
          {isLab ? (
            <RoundedBox args={[1.09, 0.78, 0.09]} radius={0.09} smoothness={3}>
              <meshStandardMaterial color={frame} metalness={0.5} roughness={0.6} />
            </RoundedBox>
          ) : (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry
                args={[isExercise ? 0.5 : 0.41, isExercise ? 0.5 : 0.41, 0.08, 24]}
              />
              <meshStandardMaterial color={frame} metalness={0.5} roughness={0.6} />
            </mesh>
          )}
          {[-0.36, 0.36].map((x) => (
            <mesh key={x} position={[x, -0.41, 0]}>
              <boxGeometry args={[0.15, 0.22, 0.3]} />
              <meshStandardMaterial color={frame} roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}
      <RoundedBox
        args={[0.66, 0.41, 0.17]}
        radius={0.1}
        smoothness={3}
        position={[0, -0.01, bulkheadZ]}
      >
        <meshStandardMaterial color={frame} metalness={0.45} roughness={0.62} />
      </RoundedBox>
      {zone === 'habitat' ? (
        [-0.17, 0.17].map((x) => (
          <mesh key={x} position={[x, 0.025, exteriorZ]}>
            <circleGeometry args={[0.101, 20]} />
            <meshStandardMaterial
              color="#284e6a"
              emissive="#1e3f53"
              emissiveIntensity={0.65}
              side={2}
            />
          </mesh>
        ))
      ) : (
        <RoundedBox
          args={[isExercise ? 0.44 : 0.52, 0.15, 0.027]}
          radius={0.03}
          smoothness={3}
          position={[0, 0.04, exteriorZ]}
        >
          <meshStandardMaterial
            color={isExercise ? '#553b35' : '#23546b'}
            emissive={isExercise ? '#8b4030' : '#194152'}
            emissiveIntensity={0.65}
          />
        </RoundedBox>
      )}
      {isLab && (
        <group position={[0.21, 0.57, 0.23]} rotation={[0.13, 0, -0.3]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.035, 0.36, 10]} />
            <meshStandardMaterial color={frame} />
          </mesh>
          <mesh position={[0, 0.17, 0]} rotation={[0.65, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.08, 0.13, 24]} />
            <meshStandardMaterial color={hull} metalness={0.3} roughness={0.5} />
          </mesh>
        </group>
      )}
      <mesh position={[0, -0.14, exteriorZ]}>
        <boxGeometry args={[0.37, 0.033, 0.026]} />
        <meshStandardMaterial
          color={trim}
          emissive={trim}
          emissiveIntensity={selected ? 0.65 : 0.24}
        />
      </mesh>
    </>
  );
}

const rocks = [
  [-2.15, -1.08, 0.15],
  [-1.35, -1.45, 0.11],
  [-0.86, -1.31, 0.07],
  [1.09, -1.38, 0.16],
  [1.83, -1.05, 0.1],
  [2.22, -0.43, 0.15],
  [-2.04, 0.51, 0.12],
  [2.27, 0.62, 0.19],
  [-0.13, -1.48, 0.08],
] as const;

export function AresGroundSystems() {
  return (
    <>
      <mesh position={[0, -0.65, 0.08]} scale={[1.3, 1, 0.91]}>
        <cylinderGeometry args={[2.12, 2.24, 0.24, 17]} />
        <meshStandardMaterial color="#713d2b" roughness={1} />
      </mesh>
      {rocks.map(([x, z, radius]) => (
        <mesh key={x} position={[x, -0.52, z]} rotation={[0.2, x, z]} scale={[1.2, 0.59, 0.84]}>
          <dodecahedronGeometry args={[radius, 0]} />
          <meshStandardMaterial color={insulation} roughness={1} flatShading />
        </mesh>
      ))}
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, -0.14, 0.16]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.63, 16]} />
          <meshStandardMaterial color={frame} metalness={0.5} roughness={0.65} />
        </mesh>
      ))}
      {[-1.02, 1.02].map((x) => (
        <group key={x} position={[x, 0.19, 1.43]}>
          <mesh position={[0, -0.36, 0]}>
            <boxGeometry args={[0.08, 0.72, 0.12]} />
            <meshStandardMaterial color={frame} />
          </mesh>
          <group rotation={[-0.26, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.96, 0.04, 0.47]} />
              <meshStandardMaterial color={frame} metalness={0.5} />
            </mesh>
            {[-1, 0, 1].map((column) =>
              [-1, 1].map((row) => (
                <mesh key={`${column}-${row}`} position={[column * 0.3, 0.027, row * 0.11]}>
                  <boxGeometry args={[0.28, 0.017, 0.198]} />
                  <meshStandardMaterial color="#18345e" metalness={0.28} roughness={0.58} />
                </mesh>
              )),
            )}
          </group>
        </group>
      ))}
    </>
  );
}
