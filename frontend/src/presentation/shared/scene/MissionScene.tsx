'use client';
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { MathUtils, PerspectiveCamera } from 'three';
import { Icon } from '@/ui/Icon';
import { AstronautModel } from './AstronautModel';
import type { SceneBodyRegion, SceneSensor } from './astronautBodyZones';
import { AstronautCameraFocus } from './AstronautCameraFocus';
import type { HabitatModuleMarkers } from './HabitatZoneMarker';
import { ShuttleModel } from './ShuttleModel';
import { HabitatModel } from './HabitatModel';
import { SpaceBackdrop } from './SpaceBackdrop';
import {
  HabitatCamera,
  habitatOverview,
  shuttleOverview,
  type HabitatCameraView,
} from './HabitatCamera';
interface Props {
  selectedSystem?: string;
  activeBodyRegion?: SceneBodyRegion;
  onSelectSystem?(id: 'cardio' | 'fitness' | 'vision'): void;
  habitatKind?: 'ship' | 'station' | 'base';
  mode: 'crew' | 'ship';
  selectedSensor: SceneSensor;
  selectedZone: string;
  modules?: HabitatModuleMarkers;
  showModuleCamera?: boolean;
  transparentBackground?: boolean;
  animateAstronaut?: boolean;
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

function FitShuttleCamera() {
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.size.width / Math.max(state.size.height, 1));
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera) || aspect <= 0) return;
    const halfHeight = Math.tan(MathUtils.degToRad(13));
    camera.setFocalLength(camera.getFilmHeight() / (2 * halfHeight * Math.max(1, 1.55 / aspect)));
  }, [aspect, camera]);
  return null;
}

export default function MissionScene(props: Props) {
  const [attempt, setAttempt] = useState(0);
  const [fullBodyDistance, setFullBodyDistance] = useState(4.5);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraRequest, setCameraRequest] = useState<{
    view: HabitatCameraView;
    revision: number;
  }>();
  const attachControls = useCallback((instance: ComponentRef<typeof OrbitControls> | null) => {
    controls.current = instance;
    setCameraReady(Boolean(instance));
  }, []);
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  const shuttleExterior =
    props.mode === 'ship' && (!props.habitatKind || props.habitatKind === 'ship') && !props.modules;
  const cutaway = props.mode === 'ship' && props.habitatKind === 'ship' && Boolean(props.modules);
  const fullViewLabel =
    props.habitatKind === 'station'
      ? 'Ver estación completa'
      : props.habitatKind === 'base'
        ? 'Ver base completa'
        : 'Ver nave completa';

  function requestCamera(view: HabitatCameraView) {
    setCameraRequest((previous) => ({ view, revision: (previous?.revision ?? 0) + 1 }));
  }
  return (
    <div
      className="scene-viewport"
      aria-label={props.mode === 'crew' ? 'Astronauta 3D interactivo' : 'Hábitat 3D conceptual'}
    >
      {!props.transparentBackground && <div className="starfield" aria-hidden="true" />}
      <div className="scene-overlay" ref={setOverlay} />
      {props.showModuleCamera && cameraReady && (
        <div className="crew-camera-controls" role="group" aria-label="Encuadre del visor">
          <button
            className="button secondary"
            type="button"
            onClick={() => requestCamera('module')}
          >
            Acercar al módulo
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={() => requestCamera('overview')}
          >
            {fullViewLabel}
          </button>
        </div>
      )}
      <SceneBoundary
        key={`${props.mode}-${attempt}`}
        onRetry={() => setAttempt((value) => value + 1)}
      >
        {overlay && (
          <Canvas
            dpr={[1, 1.75]}
            camera={{
              position:
                props.mode === 'crew'
                  ? [0, 0.08, 4.3]
                  : cutaway
                    ? shuttleOverview
                    : habitatOverview,
              fov: 32,
            }}
            fallback={<SceneFallback />}
            gl={{ antialias: true, alpha: true }}
          >
            {!props.transparentBackground && (
              <SpaceBackdrop radius={100} brightness={shuttleExterior ? 0.65 : 1} />
            )}
            <ambientLight intensity={props.transparentBackground || shuttleExterior ? 0.85 : 1.8} />
            <hemisphereLight
              args={
                props.transparentBackground
                  ? ['#e9ecef', '#38294c', 1.25]
                  : ['#e7f5ff', '#34445b', shuttleExterior ? 0.8 : 2]
              }
            />
            <directionalLight
              position={[-3, 5, 4]}
              intensity={props.transparentBackground ? 2.65 : shuttleExterior ? 2.4 : 3.5}
            />
            <directionalLight
              position={[3, 1, -3]}
              color={props.transparentBackground ? '#a66af7' : '#69d9ec'}
              intensity={shuttleExterior ? 0.9 : 2}
            />
            {props.transparentBackground && (
              <directionalLight position={[-4, -1, -3]} color="#fb5607" intensity={0.6} />
            )}
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
                  animate={props.animateAstronaut}
                  selectedSystem={props.selectedSystem}
                  activeBodyRegion={props.activeBodyRegion}
                  onFrameDistance={props.transparentBackground ? setFullBodyDistance : undefined}
                  onSelectSystem={props.onSelectSystem}
                  selected={props.selectedSensor}
                  onSelect={props.onSelectSensor}
                />
              ) : props.habitatKind && props.habitatKind !== 'ship' ? (
                <HabitatModel
                  kind={props.habitatKind}
                  portal={{ current: overlay }}
                  modules={props.modules}
                  selectedZone={props.selectedZone}
                  onSelectZone={props.onSelectZone}
                />
              ) : (
                <ShuttleModel
                  portal={{ current: overlay }}
                  modules={props.modules}
                  selectedZone={props.selectedZone}
                  onSelectZone={props.onSelectZone}
                />
              )}
            </Suspense>
            <OrbitControls
              ref={attachControls}
              enablePan={false}
              minDistance={props.transparentBackground ? fullBodyDistance : cutaway ? 3.7 : 2.8}
              maxDistance={
                props.transparentBackground ? Math.max(7, fullBodyDistance) : cutaway ? 16 : 7
              }
              maxPolarAngle={Math.PI * 0.8}
              makeDefault
            />
            {cutaway && <FitShuttleCamera />}
            {props.showModuleCamera && (
              <HabitatCamera
                controls={controls}
                request={cameraRequest}
                zone={cameraRequest?.view === 'module' ? props.selectedZone : undefined}
                cutaway={cutaway}
              />
            )}
            {props.mode === 'crew' && props.onSelectSystem && !props.transparentBackground && (
              <AstronautCameraFocus region={props.activeBodyRegion} controls={controls} />
            )}
          </Canvas>
        )}
      </SceneBoundary>
    </div>
  );
}
