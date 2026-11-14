'use client';
import type { HologramAppearance } from '../hologramTypes';
import { Html, Line, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { AdditiveBlending, Mesh, Vector3, type ShaderMaterial } from 'three';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import type { MetricData, SensorKey } from '../../mission/types';
import { TelemetrySceneFrame } from '../../../shared/scene/TelemetrySceneFrame';
export interface HologramProps {
  name: string;
  appearance: HologramAppearance;
  metrics: MetricData[];
  selected: SensorKey;
  onSelect(id: SensorKey): void;
}
const anchors: Record<SensorKey, [number, number, number]> = {
  temperature: [-0.7, 1.18, 0.15],
  heartRate: [0.72, 0.55, 0.25],
  respiration: [-0.8, 0.12, 0.2],
  oxygen: [0.8, -0.42, 0.15],
};
const sensorPositions: Record<SensorKey, [number, number, number]> = {
  temperature: [0, 1.1, 0.2],
  heartRate: [0.12, 0.52, 0.2],
  respiration: [-0.15, 0.3, 0.18],
  oxygen: [0.65, -0.1, 0.12],
};
const vertexShader = `
 varying vec3 vPosition;
 varying vec3 vNormal;
 varying vec3 vView;
 void main() {
   vPosition = position;
   vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
   vNormal = normalize(normalMatrix * normal);
   vView = -viewPosition.xyz;
   gl_Position = projectionMatrix * viewPosition;
 }
`;
const fragmentShader = `
 uniform float uTime;
 uniform vec3 uFocus;
 varying vec3 vPosition;
 varying vec3 vNormal;
 varying vec3 vView;
 void main() {
   float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.0);
   float horizontal = pow(0.5 + 0.5 * sin(vPosition.y * 310.0), 14.0);
   float vertical = pow(0.5 + 0.5 * sin(vPosition.x * 280.0), 22.0);
   float sweepY = mod(uTime * .40, 3.1) - 1.55;
   float sweep = exp(-pow((vPosition.y - sweepY) * 18.0, 2.0));
   float focus = exp(-distance(vPosition, uFocus) * 16.0);
   float strength = .10 + rim * 1.5 + horizontal * .32 + vertical * .12 + sweep * .40 + focus * .85;
   vec3 cyan = mix(vec3(.015, .25, .55), vec3(.10, .88, 1.0), min(1.0, strength));
   gl_FragColor = vec4(cyan * (.65 + strength), min(.92, .18 + strength * .65));
 }
`;
function HumanBody({
  metrics,
  appearance,
  selected,
  onSelect,
  portal,
}: HologramProps & { portal: RefObject<HTMLElement> }) {
  const gltf = useGLTF(
    appearance === 'neutral'
      ? '/models/human-hologram.glb'
      : `/models/human-hologram-${appearance}.glb`,
  );
  const body = gltf.nodes.HumanBody;
  if (!(body instanceof Mesh)) throw new Error('La malla humana no está disponible.');
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFocus: { value: new Vector3() } }), []);
  const material = useRef<ShaderMaterial>(null);
  const moving = useRef(false);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    material.current?.uniforms.uFocus.value.set(...sensorPositions[selected]);
    invalidate();
  }, [selected, invalidate]);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    function sync() {
      moving.current = !reduced.matches && !document.hidden;
      invalidate();
    }
    sync();
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      moving.current = false;
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [invalidate]);
  useFrame((state, delta) => {
    if (moving.current) {
      if (material.current) material.current.uniforms.uTime.value += Math.min(delta, 0.05);
      state.invalidate();
    }
  });
  function inspect(event: ThreeEvent<PointerEvent> | ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    const point = event.object.worldToLocal(event.point.clone());
    onSelect(
      point.y > 0.85
        ? 'temperature'
        : Math.abs(point.x) > 0.4
          ? 'oxygen'
          : point.y > 0.3
            ? 'heartRate'
            : 'respiration',
    );
  }
  return (
    <group position={[0, -0.06, 0]}>
      <mesh geometry={body.geometry} onPointerMove={inspect} onClick={inspect}>
        <shaderMaterial
          ref={material}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      <mesh geometry={body.geometry} raycast={() => {}}>
        <meshBasicMaterial
          color="#47dfff"
          wireframe
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      {[0.48, 0.59, 0.68].map((radius) => (
        <mesh key={radius} position={[0, -1.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius, radius + 0.006, 96]} />
          <meshBasicMaterial
            color="#50dfff"
            transparent
            opacity={0.35}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
      {metrics.map((metric) => (
        <Line
          key={`connector-${metric.id}`}
          points={[sensorPositions[metric.id], anchors[metric.id]]}
          color={selected === metric.id ? '#b9ffff' : '#318ba7'}
          transparent
          opacity={0.6}
          lineWidth={1}
        />
      ))}
      {metrics.map((metric) => (
        <Html
          key={metric.id}
          portal={portal}
          position={anchors[metric.id]}
          center
          zIndexRange={[15, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`body-readout ${selected === metric.id ? 'is-selected' : ''} ${metric.qualityTone}`}
          >
            <span>{metric.shortLabel}</span>
            <strong>
              {metric.value} <small>{metric.unit}</small>
            </strong>
            <small>{metric.quality}</small>
          </div>
        </Html>
      ))}
    </group>
  );
}
export default function HumanHologramScene(props: HologramProps) {
  return (
    <TelemetrySceneFrame label={`Holograma humano 3D de ${props.name}`}>
      {(portal) => <HumanBody {...props} portal={portal} />}
    </TelemetrySceneFrame>
  );
}
