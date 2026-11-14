import type { ThreeElements } from '@react-three/fiber';

/** Original conceptual station; not a dimensionally accurate ISS model. */
export function StationModel(props: ThreeElements['group'] = {}) {
  return (
    <group {...props}>
      <group rotation={[0.2, 0.2, -0.3]} scale={0.7}>
        <mesh position={[0, 0, -0.18]}>
          <boxGeometry args={[3.6, 0.14, 0.14]} />
          <meshStandardMaterial color="#bdc7cf" metalness={0.65} roughness={0.5} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={`radiator-${side}`} position={[side * 0.55, 0, -0.28]}>
            <mesh rotation={[0.25, 0, 0]}>
              <boxGeometry args={[0.5, 1.25, 0.035]} />
              <meshStandardMaterial color="#ebe9dd" metalness={0.2} roughness={0.65} />
            </mesh>
          </group>
        ))}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 1.8, 20]} />
          <meshStandardMaterial color="#d1dce2" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 1, 20]} />
          <meshStandardMaterial color="#edf0e7" metalness={0.4} />
        </mesh>
        {[-1.6, -0.9, 0.9, 1.6].map((side) => (
          <group key={side} position={[side, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.07, 2.2, 0.06]} />
              <meshStandardMaterial color="#bba177" />
            </mesh>
            {[-1, 1].map((wing) => (
              <group key={wing} position={[wing * 0.4, 0, 0]}>
                <mesh>
                  <boxGeometry args={[0.55, 2, 0.035]} />
                  <meshStandardMaterial color="#1c578e" metalness={0.6} roughness={0.35} />
                </mesh>
                {[-0.7, -0.35, 0, 0.35, 0.7].map((y) => (
                  <mesh key={y} position={[0, y, 0.025]}>
                    <boxGeometry args={[0.55, 0.018, 0.01]} />
                    <meshStandardMaterial color="#6598b3" />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}
