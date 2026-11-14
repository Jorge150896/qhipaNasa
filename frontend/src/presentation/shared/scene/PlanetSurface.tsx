import { publicAsset } from '@/presentation/shared/publicAsset';
import { useSceneTexture } from './useSceneTexture';
import { PlanetAtmosphere } from './PlanetAtmosphere';

type PlanetKind = 'earth' | 'moon' | 'mars';
const surfaces = {
  earth: { path: publicAsset('/textures/2k_earth_daymap.jpg'), color: '#316d97' },
  moon: { path: publicAsset('/textures/2k_moon.jpg'), color: '#aaa9a5' },
  mars: { path: publicAsset('/textures/2k_mars.jpg'), color: '#b96443' },
};

export function PlanetSurface({
  kind,
  radius,
  onTextureError,
  onTextureReady,
}: {
  kind: PlanetKind;
  radius: number;
  onTextureError?: () => void;
  onTextureReady?: () => void;
}) {
  const texture = useSceneTexture(surfaces[kind].path, {
    color: true,
    onError: onTextureError,
    onReady: onTextureReady,
  });
  const normal = useSceneTexture(
    kind === 'earth' ? publicAsset('/textures/earth-normal.webp') : undefined,
  );
  const roughness = useSceneTexture(
    kind === 'earth' ? publicAsset('/textures/earth-roughness.webp') : undefined,
  );
  const clouds = useSceneTexture(
    kind === 'earth' ? publicAsset('/textures/earth-clouds.webp') : undefined,
  );
  const materialKey = `${kind}:${Boolean(texture)}:${Boolean(normal)}:${Boolean(roughness)}`;
  return (
    <>
      <mesh>
        <sphereGeometry args={[radius, 80, 48]} />
        <meshStandardMaterial
          key={materialKey}
          map={texture}
          color={texture ? (kind === 'mars' ? '#dfd5cc' : '#f4f6f8') : surfaces[kind].color}
          normalMap={normal}
          normalScale={[0.2, 0.2]}
          roughnessMap={roughness}
          roughness={1}
          bumpMap={kind === 'earth' ? null : texture}
          bumpScale={radius * (kind === 'moon' ? 0.007 : 0.002)}
          metalness={0}
        />
      </mesh>
      {kind === 'earth' && (
        <>
          {clouds && (
            <mesh raycast={() => null}>
              <sphereGeometry args={[radius * 1.009, 64, 40]} />
              <meshStandardMaterial
                color="#f1f7ff"
                alphaMap={clouds}
                transparent
                opacity={0.5}
                roughness={1}
                depthWrite={false}
              />
            </mesh>
          )}
          <PlanetAtmosphere radius={radius} />
        </>
      )}
    </>
  );
}
