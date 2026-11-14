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
import { detailCameraDistance, initialMapCameraPosition, mapCameraTarget } from './mapCamera';
import { useSceneMotionClock } from './SceneMotion';
import type { DestinationKey } from '../types';
import { mapObjectRadii, mapPositions, transitCurve, transitProgress } from './spaceMapLayout';
import { orbitalPosition } from './orbitalMotion';
import {
  overviewCameraDistance,
  solarMissionFrame,
  solarReveal,
  solarViewLevel,
  type MissionSolarFrame,
  type SolarViewLevel,
} from './solarSystemModel';
export interface ZoomRequest {
  action: 'mission' | 'system' | 'in' | 'out' | 'slider' | 'focus';
  version: number;
  value?: number;
  destination?: DestinationKey;
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
  const transitionDeadline = useRef(0);
  const transitionTarget = useRef(new Vector3(...mapCameraTarget));
  const focused = useRef(false);
  const focusMinimum = useRef(2.5);
  const initializing = useRef(true);
  useEffect(() => {
    const target =
        focused.current && controls.current
          ? controls.current.target.clone()
          : new Vector3(...mapCameraTarget),
      aspect = size.width / size.height;
    if (
      request.action === 'mission' ||
      request.action === 'system' ||
      request.action === 'slider'
    ) {
      target.set(...mapCameraTarget);
      focused.current = false;
    }
    const near = initialMapCameraPosition(aspect).distanceTo(target);
    const far = overviewCameraDistance(solarMissionFrame(clock.current), aspect);
    const offset = camera.position.clone().sub(target);
    let distance = offset.length();
    if (request.action === 'focus' && request.destination) {
      const id = request.destination;
      if (id === 'moon' || id === 'station') target.copy(orbitalPosition(id, clock.current));
      else if (id === 'ship') transitCurve.getPointAt(transitProgress(clock.current), target);
      else target.set(...mapPositions[id]);
      offset.set(0.2, 0.8, 2).normalize();
      distance = detailCameraDistance(id, aspect);
      focusMinimum.current = Math.max(1.2, mapObjectRadii[id] * 1.25);
      focused.current = true;
    } else if (request.action === 'mission') {
      offset.copy(initialMapCameraPosition(aspect)).sub(target);
      distance = near;
    } else if (request.action === 'system') distance = far;
    else if (request.action === 'in') distance /= 1.6;
    else if (request.action === 'out') distance *= 1.6;
    else distance = near * Math.pow(far / near, (request.value ?? 0) / 100);
    distance = Math.max(
      focused.current ? focusMinimum.current : near * 0.75,
      Math.min(far * 1.2, distance),
    );
    const destination = target.clone().add(offset.normalize().multiplyScalar(distance));
    transitionTarget.current.copy(target);
    if (controls.current)
      controls.current.minDistance = focused.current ? focusMinimum.current : near * 0.75;
    if (initializing.current || request.action === 'slider' || reducedMotion) {
      camera.position.copy(destination);
      transition.current = null;
      controls.current?.target.copy(target);
    } else {
      transition.current = destination;
      transitionDeadline.current = performance.now() + 900;
    }
    initializing.current = false;
    camera.lookAt(target);
    if (controls.current) {
      controls.current.update();
    }
    invalidate();
  }, [request, camera, size.width, size.height, clock, invalidate, reducedMotion]);
  useFrame((_, delta) => {
    if (transition.current) {
      // Camera transitions follow wall time even on devices rendering few frames per second.
      const alpha = performance.now() >= transitionDeadline.current ? 1 : 1 - Math.exp(-6 * delta);
      camera.position.lerp(transition.current, alpha);
      controls.current?.target.lerp(transitionTarget.current, alpha);
      controls.current?.update();
      if (camera.position.distanceTo(transition.current) < 0.01) {
        camera.position.copy(transition.current);
        controls.current?.target.copy(transitionTarget.current);
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
      controls.current.minDistance = focused.current ? focusMinimum.current : near * 0.75;
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
