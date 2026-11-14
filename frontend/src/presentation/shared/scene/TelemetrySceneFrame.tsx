'use client';
import { Component, Suspense, useState, type ReactNode, type RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}
function Fallback() {
  return (
    <div className="scene-fallback">
      <h3>La escena 3D no está disponible</h3>
      <p>Las lecturas, módulos y perfiles siguen disponibles en los paneles HTML.</p>
    </div>
  );
}
export function TelemetrySceneFrame({
  label,
  children,
}: {
  label: string;
  children(portal: RefObject<HTMLElement>): ReactNode;
}) {
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  return (
    <div className="telemetry-viewport" role="region" aria-label={label}>
      <div className="scene-overlay" ref={setOverlay} />
      <Boundary>
        {overlay && (
          <Canvas
            dpr={[1, 1.5]}
            frameloop="demand"
            camera={{ position: [0, 0.1, 4.8], fov: 38 }}
            fallback={<Fallback />}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[3, 5, 4]} intensity={2} />
            <pointLight position={[-2, 1, 2]} color="#65efff" intensity={12} />
            <Suspense fallback={null}>{children({ current: overlay })}</Suspense>
            <OrbitControls
              makeDefault
              enablePan={false}
              minDistance={3}
              maxDistance={7}
              minPolarAngle={0.3}
              maxPolarAngle={Math.PI * 0.75}
            />
          </Canvas>
        )}
      </Boundary>
      <span className="telemetry-instructions">
        Arrastra para girar · rueda o pellizca para acercar
      </span>
    </div>
  );
}
