'use client';
import { Component, Suspense, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { Icon } from '@/ui/Icon';
import { AstronautModel, type SceneSensor } from './AstronautModel';
import { ShuttleModel } from './ShuttleModel';
import { HabitatModel } from './HabitatModel';
import { SpaceBackdrop } from './SpaceBackdrop';
interface Props {
  selectedSystem?: string;
  onSelectSystem?(id: 'cardio' | 'fitness' | 'vision'): void;
  habitatKind?: 'ship' | 'station' | 'base';
  mode: 'crew' | 'ship';
  selectedSensor: SceneSensor;
  selectedZone: string;
  onSelectSensor(id: SceneSensor): void;
  onSelectZone(id: string): void;
}
function SceneFallback({ onRetry }: { onRetry?(): void }) {
  return (
    <div className="scene-fallback">
      <Icon name="orbit" size={40} />
      <h3>El visor 3D no está disponible</h3>
      <p>Puedes seguir explorando los indicadores y el entorno con los controles de la pantalla.</p>
      {onRetry && (
        <button className="button secondary" onClick={onRetry}>
          <Icon name="refresh" />
          Reintentar visor
        </button>
      )}
    </div>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode; onRetry(): void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <SceneFallback onRetry={this.props.onRetry} /> : this.props.children;
  }
}
export default function MissionScene(props: Props) {
  const [attempt, setAttempt] = useState(0);
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  return (
    <div
      className="scene-viewport"
      aria-label={props.mode === 'crew' ? 'Astronauta 3D interactivo' : 'Hábitat 3D conceptual'}
    >
      <div className="starfield" aria-hidden="true" />
      <div className="scene-overlay" ref={setOverlay} />
      <SceneBoundary
        key={`${props.mode}-${attempt}`}
        onRetry={() => setAttempt((value) => value + 1)}
      >
        {overlay && (
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: props.mode === 'crew' ? [0, 0.08, 4.3] : [3, 1.8, -4.4], fov: 32 }}
            fallback={<SceneFallback />}
            gl={{ antialias: true, alpha: true }}
          >
            <SpaceBackdrop radius={100} />
            <ambientLight intensity={1.8} />
            <hemisphereLight args={['#e7f5ff', '#34445b', 2]} />
            <directionalLight position={[-3, 5, 4]} intensity={3.5} />
            <directionalLight position={[3, 1, -3]} color="#69d9ec" intensity={2} />
            <Suspense
              fallback={
                <Html portal={{ current: overlay }} center>
                  <span className="scene-loading">
                    <Icon name="loader" className="spin" />
                    Cargando modelo local…
                  </span>
                </Html>
              }
            >
              {props.mode === 'crew' ? (
                <AstronautModel
                  portal={{ current: overlay }}
                  selectedSystem={props.selectedSystem}
                  onSelectSystem={props.onSelectSystem}
                  selected={props.selectedSensor}
                  onSelect={props.onSelectSensor}
                />
              ) : props.habitatKind && props.habitatKind !== 'ship' ? (
                <HabitatModel
                  kind={props.habitatKind}
                  portal={{ current: overlay }}
                  selectedZone={props.selectedZone}
                  onSelectZone={props.onSelectZone}
                />
              ) : (
                <ShuttleModel
                  portal={{ current: overlay }}
                  selectedZone={props.selectedZone}
                  onSelectZone={props.onSelectZone}
                />
              )}
            </Suspense>
            <OrbitControls
              enablePan={false}
              minDistance={2.8}
              maxDistance={7}
              maxPolarAngle={Math.PI * 0.8}
              makeDefault
            />
          </Canvas>
        )}
      </SceneBoundary>
    </div>
  );
}
