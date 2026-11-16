import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { publicAsset } from '@/presentation/shared/publicAsset';
import { Html, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, PerspectiveCamera, Sphere, Vector3, type Group, type PointLight } from 'three';
import { useAstronautFinish } from './useAstronautFinish';
import { bodyZones, type SceneBodyRegion, type SceneSensor } from './astronautBodyZones';
const hotspots: {
  id: SceneSensor;
  label: string;
  name: string;
  position: [number, number, number];
}[] = [
  { id: 'temperature', label: 'T°', name: 'temperatura corporal', position: [0, 1.72, 0.18] },
  { id: 'heartRate', label: 'FC', name: 'frecuencia cardíaca', position: [0.18, 1.22, 0.3] },
  {
    id: 'respiration',
    label: 'Resp.',
    name: 'frecuencia respiratoria',
    position: [-0.44, 1.34, 0.34],
  },
  { id: 'oxygen', label: 'SpO₂', name: 'saturación de oxígeno', position: [-0.45, 0.82, 0.1] },
];
const touchableZones = ['heartRate', 'vision', 'fitness'] as const;

export function AstronautModel({
  selected,
  onSelect,
  portal,
  selectedSystem,
  activeBodyRegion,
  onFrameDistance,
  immersiveFit = false,
  onSelectSystem,
}: {
  selectedSystem?: string;
  activeBodyRegion?: SceneBodyRegion;
  onFrameDistance?(distance: number): void;
  immersiveFit?: boolean;
  onSelectSystem?(id: 'cardio' | 'fitness' | 'vision'): void;
  selected: SceneSensor;
  onSelect?(id: SceneSensor): void;
  portal: RefObject<HTMLElement>;
}) {
  const t = useTranslation();
  const gltf = useGLTF(publicAsset('/models/astronaut.glb'));
  const model = useAstronautFinish(gltf.scene);
  const highlight = activeBodyRegion && bodyZones[activeBodyRegion];
  const camera = useThree((state) => state.camera);
  const aspect = useThree(({ size }) => size.width / Math.max(1, size.height));
  const fit = useMemo(() => {
    const bounds = new Box3().setFromObject(model);
    const sphere = bounds.getBoundingSphere(new Sphere());
    sphere.center.y -= 1;
    return {
      centerY: bounds.getCenter(new Vector3()).y,
      size: bounds.getSize(new Vector3()),
      radius: sphere.radius + sphere.center.length() + 0.035,
    };
  }, [model]);
  const baseline = immersiveFit ? -fit.centerY : -1;
  const astronaut = useRef<Group>(null);
  const glint = useRef<PointLight>(null);
  const glintTime = useRef(0);
  const allowsMotion = useRef(false);
  const elapsed = useRef(0);

  useEffect(() => {
    if (!onFrameDistance) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    function updateMotion() {
      allowsMotion.current = !preference.matches;
      if (preference.matches && astronaut.current) {
        elapsed.current = 0;
        astronaut.current.position.y = baseline;
      }
    }
    updateMotion();
    preference.addEventListener('change', updateMotion);
    return () => preference.removeEventListener('change', updateMotion);
  }, [baseline, onFrameDistance]);

  useEffect(() => {
    glintTime.current = 0;
  }, [activeBodyRegion]);

  useEffect(() => {
    if (!onFrameDistance || !(camera instanceof PerspectiveCamera) || aspect <= 0) return;

    // A padded bounding sphere keeps the suit inside both camera axes at every orbit angle.
    const vertical = (camera.fov * Math.PI) / 360;
    const horizontal = Math.atan(Math.tan(vertical) * aspect);
    if (immersiveFit) {
      const halfWidth = Math.hypot(fit.size.x, fit.size.z) / 2;
      const heightDistance = ((fit.size.y / 2 + 0.035) * 1.05) / Math.tan(vertical);
      const widthDistance = (halfWidth * 1.13) / Math.tan(horizontal);
      onFrameDistance(Math.max(heightDistance, widthDistance) + fit.size.z / 2);
    } else {
      onFrameDistance((fit.radius * 1.1) / Math.sin(Math.min(vertical, horizontal)));
    }
  }, [aspect, camera, fit, immersiveFit, onFrameDistance]);

  useFrame((_, delta) => {
    if (!onFrameDistance || !astronaut.current) return;
    const step = allowsMotion.current ? Math.min(delta, 0.05) : 0;
    elapsed.current = (elapsed.current + step) % 12;
    astronaut.current.position.y =
      baseline + Math.sin((elapsed.current * Math.PI * 2) / 12) * 0.035;
    if (glint.current) {
      glintTime.current += step;
      const pulse = Math.sin(Math.PI * Math.min(glintTime.current / 0.75, 1));
      glint.current.intensity = allowsMotion.current ? 0.12 + 0.32 * pulse : 0.12;
    }
  });

  return (
    <group ref={astronaut} position={[0, baseline, 0]}>
      <primitive object={model} />
      {onSelectSystem &&
        touchableZones.map((zone) => (
          <mesh
            key={zone}
            position={bodyZones[zone].position}
            scale={bodyZones[zone].scale}
            onClick={(event) => {
              event.stopPropagation();
              if (zone === 'heartRate') onSelect?.(zone);
              else onSelectSystem(zone);
            }}
          >
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        ))}
      {highlight && onFrameDistance && (
        <pointLight
          ref={glint}
          position={[highlight.position[0], highlight.position[1], highlight.position[2] + 0.21]}
          color="#ffd6bf"
          intensity={0.12}
          distance={0.54}
          decay={2}
        />
      )}
      {highlight && !onFrameDistance && (
        <group position={highlight.position} scale={highlight.scale}>
          <mesh position-z={0.45}>
            <circleGeometry args={[1, 40]} />
            <meshBasicMaterial color="#ff945b" transparent opacity={0.2} depthWrite={false} />
          </mesh>
          <mesh position-z={0.46}>
            <ringGeometry args={[0.94, 1, 40]} />
            <meshBasicMaterial color="#ffc19b" transparent opacity={0.9} depthWrite={false} />
          </mesh>
        </group>
      )}
      {onSelectSystem &&
        (
          [
            { id: 'vision', label: 'Visión', position: [0.37, 1.98, 0.25] },
            { id: 'fitness', label: 'Ejercicio', position: [-0.35, 0.4, 0.2] },
          ] as const
        ).map((item) => (
          <Html
            key={item.id}
            portal={portal}
            position={[...item.position]}
            center
            zIndexRange={[20, 0]}
            style={{ pointerEvents: 'auto' }}
          >
            <button
              className="scene-hotspot health-body-hotspot"
              aria-label={t(
                item.id === 'vision'
                  ? 'Explorar visión y sistema neuroocular'
                  : 'Explorar ejercicio y aparato locomotor',
              )}
              aria-pressed={(activeBodyRegion ?? selectedSystem) === item.id}
              onClick={() => onSelectSystem(item.id)}
            >
              {t(item.label)}
            </button>
          </Html>
        ))}
      {onSelect &&
        hotspots
          .filter(({ id }) => id !== 'respiration' || onSelectSystem)
          .map((item) => (
            <Html
              portal={portal}
              style={{ pointerEvents: 'auto' }}
              key={item.id}
              position={item.position}
              center
              zIndexRange={[20, 0]}
            >
              <button
                type="button"
                className="scene-hotspot"
                aria-label={t(`Consultar ${item.name}`)}
                aria-pressed={(activeBodyRegion ?? selected) === item.id}
                onClick={() => onSelect(item.id)}
              >
                {t(item.label)}
              </button>
            </Html>
          ))}
    </group>
  );
}
