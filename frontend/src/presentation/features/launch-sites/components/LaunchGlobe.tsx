import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { PlanetSurface } from '@/presentation/shared/scene/PlanetSurface';
import type { LaunchSiteData } from '../types';
import { globePosition } from './globeCoordinates';
import { LaunchPointCard } from './LaunchPointCard';

function Fallback() {
  return (
    <p className="launch-fallback" role="status">
      El globo 3D no está disponible. Usa la lista de sitios para explorar los videos.
    </p>
  );
}
class GlobeBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}

function GlobeCamera({ selected }: { selected: LaunchSiteData | null }) {
  const { camera, invalidate } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const target = useRef<Vector3 | null>(null);
  const transitionDeadline = useRef(0);
  useEffect(() => {
    const destination = selected
      ? new Vector3(...globePosition(selected.latitude, selected.longitude, 5.3))
      : new Vector3(0.5, 1.8, 5.5);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      camera.position.copy(destination);
      camera.lookAt(0, 0, 0);
      controls.current?.update();
      target.current = null;
    } else {
      target.current = destination;
      transitionDeadline.current = performance.now() + 900;
    }
    invalidate();
  }, [selected, camera, invalidate]);
  useFrame((_, delta) => {
    if (!target.current) return;
    const distance = camera.position.length();
    const alpha = performance.now() >= transitionDeadline.current ? 1 : 1 - Math.exp(-6 * delta);
    camera.position.lerp(target.current, alpha);
    camera.position.setLength(
      Math.max(3.2, distance + (target.current.length() - distance) * alpha),
    );
    camera.lookAt(0, 0, 0);
    controls.current?.update();
    if (camera.position.distanceTo(target.current) < 0.01) {
      camera.position.copy(target.current);
      target.current = null;
    } else invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={3.2}
      maxDistance={8}
      onStart={() => {
        target.current = null;
      }}
    />
  );
}

export default function LaunchGlobe({
  sites,
  selected,
  onSelect,
}: {
  sites: LaunchSiteData[];
  selected: LaunchSiteData | null;
  onSelect(id: string): void;
}) {
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const [surface, setSurface] = useState<'loading' | 'ready' | 'error'>('loading');

  const onTextureError = useCallback(() => setSurface('error'), []);
  const onTextureReady = useCallback(() => setSurface('ready'), []);
  return (
    <>
      <div className="launch-globe-overlay" data-surface={surface} ref={setPortal} />
      <GlobeBoundary>
        {portal && (
          <Canvas
            camera={{ position: [0.5, 1.8, 5.5], fov: 42, near: 0.1, far: 30 }}
            dpr={[1, 1.5]}
            frameloop="demand"
            fallback={<Fallback />}
          >
            <ambientLight intensity={1.5} />
            <directionalLight position={[3, 4, 6]} intensity={2} color="#fff3e5" />
            <PlanetSurface
              kind="earth"
              radius={1.5}
              onTextureError={onTextureError}
              onTextureReady={onTextureReady}
            />
            {sites.map((site) => (
              <Html
                key={site.id}
                portal={{ current: portal }}
                position={globePosition(site.latitude, site.longitude, 1.55)}
                occlude
                zIndexRange={selected?.id === site.id ? [40, 30] : [20, 0]}
              >
                <LaunchPointCard
                  site={site}
                  active={selected?.id === site.id}
                  onSelect={onSelect}
                />
              </Html>
            ))}
            <GlobeCamera selected={selected} />
          </Canvas>
        )}
      </GlobeBoundary>
      {surface === 'error' && (
        <p className="launch-texture-warning" role="status">
          La textura terrestre no se pudo cargar. Las coordenadas y la lista siguen disponibles.
        </p>
      )}
    </>
  );
}
