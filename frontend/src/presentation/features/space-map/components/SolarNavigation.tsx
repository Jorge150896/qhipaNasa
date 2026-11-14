import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ComponentRef,
  type ReactNode,
} from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { initialMapCameraPosition, mapCameraTarget } from './mapCamera';
import { useSceneMotionClock } from './SceneMotion';
import {
  overviewCameraDistance,
  solarMissionFrame,
  solarReveal,
  solarViewLevel,
  type MissionSolarFrame,
  type SolarViewLevel,
} from './solarSystemModel';
export interface ZoomRequest {
  action: 'mission' | 'system' | 'in' | 'out' | 'slider';
  version: number;
  value?: number;
}
interface NavigationState {
  frame: MissionSolarFrame;
  reveal: number;
  distance: number;
  ratio: number;
  level: SolarViewLevel;
}
const NavigationContext = createContext<{ current: NavigationState } | null>(null);
export function useSolarNavigation() {
  const value = useContext(NavigationContext);
  if (!value) throw new Error('SolarNavigation is required');
  return value;
}
export function SolarNavigation({
  request,
  onViewChange,
  reducedMotion,
  children,
}: {
  request: ZoomRequest;
  reducedMotion: boolean;
  onViewChange(level: SolarViewLevel, zoom: number): void;
  children: ReactNode;
}) {
  const clock = useSceneMotionClock();
  const { camera, size, invalidate } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const navigation = useRef<NavigationState>({
    frame: solarMissionFrame(0),
    reveal: 0,
    distance: 17,
    ratio: 1,
    level: 'mission',
  });
  const lastView = useRef('');
  const transition = useRef<Vector3 | null>(null);
  const initializing = useRef(true);
  useEffect(() => {
    const target = new Vector3(...mapCameraTarget),
      aspect = size.width / size.height;
    const near = initialMapCameraPosition(aspect).distanceTo(target);
    const far = overviewCameraDistance(solarMissionFrame(clock.current), aspect);
    const offset = camera.position.clone().sub(target);
    let distance = offset.length();
    if (request.action === 'mission') {
      offset.copy(initialMapCameraPosition(aspect)).sub(target);
      distance = near;
    } else if (request.action === 'system') distance = far;
    else if (request.action === 'in') distance /= 1.6;
    else if (request.action === 'out') distance *= 1.6;
    else distance = near * Math.pow(far / near, (request.value ?? 0) / 100);
    distance = Math.max(near * 0.75, Math.min(far * 1.2, distance));
    const destination = target.clone().add(offset.normalize().multiplyScalar(distance));
    if (initializing.current || request.action === 'slider' || reducedMotion) {
      camera.position.copy(destination);
      transition.current = null;
    } else transition.current = destination;
    initializing.current = false;
    camera.lookAt(target);
    if (controls.current) {
      controls.current.target.copy(target);
      controls.current.update();
    }
    invalidate();
  }, [request, camera, size.width, size.height, clock, invalidate, reducedMotion]);
  useFrame((_, delta) => {
    if (transition.current) {
      camera.position.lerp(transition.current, 1 - Math.exp(-6 * Math.min(delta, 0.1)));
      camera.lookAt(...mapCameraTarget);
      controls.current?.update();
      if (camera.position.distanceTo(transition.current) < 0.01) {
        camera.position.copy(transition.current);
        transition.current = null;
      } else invalidate();
    }
    const aspect = size.width / size.height,
      target = new Vector3(...mapCameraTarget);
    const near = initialMapCameraPosition(aspect).distanceTo(target),
      distance = camera.position.distanceTo(target);
    const frame = solarMissionFrame(clock.current),
      ratio = distance / near,
      far = overviewCameraDistance(frame, aspect);
    const level = solarViewLevel(ratio),
      zoom = Math.round(Math.max(0, Math.min(100, (Math.log(ratio) / Math.log(far / near)) * 100)));
    navigation.current = { frame, reveal: solarReveal(ratio), distance, ratio, level };
    const key = `${level}:${zoom}`;
    if (key !== lastView.current) {
      lastView.current = key;
      onViewChange(level, zoom);
    }
    if (controls.current) {
      controls.current.minDistance = near * 0.75;
      controls.current.maxDistance = far * 1.2;
    }
  }, -0.5);
  return (
    <NavigationContext value={navigation}>
      {children}
      <OrbitControls
        ref={controls}
        onStart={() => {
          transition.current = null;
        }}
        makeDefault
        target={mapCameraTarget}
        enablePan={false}
        minDistance={6}
        maxDistance={6000}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI * 0.8}
      />
    </NavigationContext>
  );
}
