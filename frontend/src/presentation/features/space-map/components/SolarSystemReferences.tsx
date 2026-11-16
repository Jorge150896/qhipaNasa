import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { RefObject } from 'react';
import { CanvasTexture, DoubleSide, Group, SRGBColorSpace } from 'three';
import { referencePlanets, type ReferencePlanet } from './referencePlanets';
import { useSceneMotionClock } from './SceneMotion';
import { useSolarNavigation } from './SolarNavigation';
import { heliocentricPosition, solarOrbits, toMissionCoordinates } from './solarSystemModel';
function makeSurface(planet: ReferencePlanet) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Textura no disponible');
  context.fillStyle = planet.color;
  context.fillRect(0, 0, 512, 256);
  let seed = planet.period * 31;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  if (planet.id === 'mercury') {
    for (let i = 0; i < 140; i++) {
      context.fillStyle = `rgba(44,39,35,${next() * 0.22})`;
      context.beginPath();
      context.ellipse(
        next() * 512,
        next() * 256,
        2 + next() * 9,
        2 + next() * 6,
        0,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
  } else {
    for (let y = 0; y < 256; y += 2) {
      context.fillStyle =
        planet.id === 'jupiter'
          ? ['#a87858', '#dac4a6', '#bb9478', '#e4d4b6'][Math.floor(next() * 4)]
          : next() > 0.5
            ? 'rgba(255,245,218,.12)'
            : 'rgba(18,34,65,.07)';
      context.fillRect(0, y, 512, 2 + next() * 6);
    }
    if (planet.id === 'jupiter') {
      context.fillStyle = '#9c5848';
      context.beginPath();
      context.ellipse(335, 165, 27, 10, 0.05, 0, Math.PI * 2);
      context.fill();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
function ReferenceBody({
  planet,
  portal,
  showLabels,
}: {
  planet: ReferencePlanet;
  portal: RefObject<HTMLElement>;
  showLabels: boolean;
}) {
  const t = useTranslation();
  const texture = useMemo(() => makeSurface(planet), [planet]);
  const spin = useRef<Group>(null);
  const body = useRef<Group>(null);
  const navigation = useSolarNavigation();
  const clock = useSceneMotionClock();
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(() => {
    const state = navigation.current;
    if (body.current) {
      body.current.visible = state.reveal > 0.001;
      toMissionCoordinates(
        heliocentricPosition(planet.id, clock.current),
        state.frame,
        body.current.position,
      );
      body.current.scale.setScalar(
        Math.max(
          1,
          (state.distance *
            (planet.id === 'jupiter' ? 0.013 : planet.id === 'saturn' ? 0.011 : 0.008)) /
            planet.radius,
        ) * state.reveal,
      );
    }
    if (spin.current) spin.current.rotation.y = (clock.current / planet.period) * Math.PI * 2;
  });
  return (
    <group ref={body} visible={false} rotation={[0.12, 0, -0.2]}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[planet.radius, 40, 24]} />
          <meshStandardMaterial map={texture} roughness={0.95} />
        </mesh>
      </group>
      {showLabels && (
        <Html
          portal={portal}
          position={[0, -planet.radius * 1.5, 0]}
          center
          zIndexRange={[12, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <span className="fleet-planet-reference-label">
            {t(planet.name)}
            <small>
              {t(solarOrbits[planet.id].radiusAU)}
              {t(' UA')}
            </small>
          </span>
        </Html>
      )}
      {planet.id === 'saturn' && (
        <group rotation={[-Math.PI / 2, 0.15, 0.2]}>
          {[1.2, 1.5, 1.8].map((scale, index) => (
            <mesh key={scale}>
              <ringGeometry args={[planet.radius * scale, planet.radius * (scale + 0.22), 64]} />
              <meshStandardMaterial
                color={['#a89779', '#cfbc98', '#aa9a7d'][index]}
                side={DoubleSide}
                transparent
                opacity={0.75}
                roughness={1}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
/** Decorative context only. No crew, habitat or invented mission data. */
export function SolarSystemReferences({
  portal,
  level,
}: {
  portal: RefObject<HTMLElement>;
  level: 'mission' | 'inner' | 'system';
}) {
  return (
    <group>
      {referencePlanets.map((planet) => (
        <ReferenceBody
          key={planet.id}
          planet={planet}
          portal={portal}
          showLabels={
            level === 'inner'
              ? planet.id === 'mercury' || planet.id === 'venus'
              : level === 'system' && planet.id !== 'mercury' && planet.id !== 'venus'
          }
        />
      ))}
    </group>
  );
}
