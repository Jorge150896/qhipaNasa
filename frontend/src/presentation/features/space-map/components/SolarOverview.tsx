import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { BackSide, Group } from 'three';
import { useSolarNavigation } from './SolarNavigation';
import { solarOrbits } from './solarSystemModel';
export function SolarOverview({
  portal,
  showLabels,
}: {
  portal: RefObject<HTMLElement>;
  showLabels: boolean;
}) {
  const orbits = useRef<Group>(null),
    sun = useRef<Group>(null);
  const navigation = useSolarNavigation();
  useFrame(() => {
    const state = navigation.current;
    if (orbits.current) {
      orbits.current.visible = state.reveal > 0.001;
      orbits.current.position.copy(state.frame.sun);
      orbits.current.scale.setScalar(state.frame.unitsPerAU);
    }
    if (sun.current) {
      sun.current.visible = state.reveal > 0.001;
      sun.current.position.copy(state.frame.sun);
      sun.current.scale.setScalar(
        Math.min(
          Math.max(0.8, state.distance * 0.017),
          solarOrbits.mercury.radiusAU * state.frame.unitsPerAU * 0.4,
        ) * state.reveal,
      );
    }
  });
  return (
    <>
      <group ref={orbits} visible={false}>
        {Object.entries(solarOrbits).map(([id, orbit]) => (
          <Line
            key={id}
            points={Array.from(
              { length: 129 },
              (_, i) =>
                [
                  orbit.radiusAU * Math.cos((i / 128) * Math.PI * 2),
                  0,
                  -orbit.radiusAU * Math.sin((i / 128) * Math.PI * 2),
                ] as [number, number, number],
            )}
            color={id === 'earth' || id === 'mars' ? '#71bfc6' : '#3b506c'}
            transparent
            opacity={id === 'earth' || id === 'mars' ? 0.6 : 0.35}
            lineWidth={id === 'earth' || id === 'mars' ? 1 : 0.65}
          />
        ))}
      </group>
      <group ref={sun} visible={false}>
        <mesh>
          <sphereGeometry args={[1, 40, 24]} />
          <meshBasicMaterial color="#ffdb83" toneMapped={false} />
        </mesh>
        {[1.15, 1.35].map((r) => (
          <mesh key={r}>
            <sphereGeometry args={[r, 32, 20]} />
            <meshBasicMaterial
              color="#ffc26c"
              transparent
              opacity={0.11}
              side={BackSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      {showLabels && (
        <group>
          <SunLabel portal={portal} />
        </group>
      )}
    </>
  );
}
function SunLabel({ portal }: { portal: RefObject<HTMLElement> }) {
  const t = useTranslation();
  const group = useRef<Group>(null);
  const nav = useSolarNavigation();
  useFrame(() => {
    if (group.current) group.current.position.copy(nav.current.frame.sun);
  });
  return (
    <group ref={group}>
      <Html portal={portal} center zIndexRange={[16, 0]} style={{ pointerEvents: 'none' }}>
        <span className="fleet-solar-label">{t('Sol')}</span>
      </Html>
    </group>
  );
}
