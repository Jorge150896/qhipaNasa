'use client';

import { Component, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Icon } from '@/ui/Icon';
import type { ExerciseEquipment } from '../../crew-health/types';

const frame = '#b78af7';
const metal = '#e9ecef';
const accent = '#fb762e';
type Point = [number, number, number];

function Tube({
  from,
  to,
  color = frame,
  radius = 0.045,
}: {
  from: Point;
  to: Point;
  color?: string;
  radius?: number;
}) {
  const [x, y, z] = from;
  const [endX, endY] = to;
  const dx = endX - x;
  const dy = endY - y;
  return (
    <mesh position={[x + dx / 2, y + dy / 2, z]} rotation-z={Math.atan2(-dx, dy)}>
      <cylinderGeometry args={[radius, radius, Math.hypot(dx, dy), 12]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Block({
  position,
  size,
  color = metal,
}: {
  position: Point;
  size: Point;
  color?: string;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Disc({
  position,
  radius,
  depth,
  color,
}: {
  position: Point;
  radius: number;
  depth: number;
  color: string;
}) {
  return (
    <mesh position={position} rotation-x={Math.PI / 2}>
      <cylinderGeometry args={[radius, radius, depth, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Bike() {
  return (
    <group>
      <Block position={[-0.82, 0.06, 0]} size={[0.16, 0.12, 0.92]} />
      <Block position={[0.81, 0.06, 0]} size={[0.16, 0.12, 0.92]} />
      <Tube from={[-0.82, 0.11, 0]} to={[0.81, 0.11, 0]} />
      <Tube from={[-0.05, 0.15, 0]} to={[-0.3, 1.02, 0]} />
      <Tube from={[0.62, 0.12, 0]} to={[0.51, 1.13, 0]} />
      <Tube from={[-0.22, 0.72, 0]} to={[0.55, 0.65, 0]} />
      <Block position={[-0.34, 1.05, 0]} size={[0.34, 0.08, 0.24]} color="#39234f" />
      <Block position={[0.58, 1.16, 0]} size={[0.12, 0.08, 0.57]} color="#39234f" />
      <Block position={[0.53, 1.23, 0]} size={[0.15, 0.055, 0.22]} color={accent} />
      <Disc position={[0.46, 0.42, 0]} radius={0.27} depth={0.19} color="#563781" />
      <Disc position={[0.46, 0.42, 0.11]} radius={0.19} depth={0.045} color={accent} />
      <Disc position={[-0.11, 0.37, 0]} radius={0.11} depth={0.22} color={metal} />
      <Tube from={[-0.11, 0.37, 0.14]} to={[-0.26, 0.25, 0.14]} color={metal} radius={0.027} />
      <Block position={[-0.26, 0.25, 0.23]} size={[0.16, 0.04, 0.23]} color="#39234f" />
    </group>
  );
}

function ResistanceStation() {
  return (
    <group>
      <Block position={[0, 0.055, 0]} size={[1.75, 0.11, 0.78]} color="#39234f" />
      {[-0.65, 0.65].map((x) => (
        <group key={x}>
          <Tube from={[x, 0.1, -0.19]} to={[x, 1.13, -0.19]} />
          <Block position={[x, 0.79, 0.03]} size={[0.09, 0.09, 0.43]} color={accent} />
          <Disc position={[x, 0.81, 0.24]} radius={0.18} depth={0.09} color="#563781" />
          <Disc position={[x, 0.81, 0.3]} radius={0.11} depth={0.035} color={accent} />
        </group>
      ))}
      <Tube from={[-0.65, 1.13, -0.19]} to={[0.65, 1.13, -0.19]} />
      <Tube from={[-0.79, 0.81, 0.19]} to={[0.79, 0.81, 0.19]} color={metal} radius={0.027} />
      <Block position={[0, 0.39, 0.14]} size={[0.91, 0.09, 0.34]} color="#614098" />
      <Block position={[0, 0.22, 0.14]} size={[0.13, 0.25, 0.13]} />
    </group>
  );
}

function PreviewFallback() {
  return (
    <div className="crew-equipment-fallback">
      <Icon name="activity" size={23} />
      Vista 3D no disponible
    </div>
  );
}

class PreviewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <PreviewFallback /> : this.props.children;
  }
}

export default function ExerciseEquipmentScene({ equipment }: { equipment: ExerciseEquipment }) {
  return (
    <figure className="crew-equipment">
      <div className="crew-equipment-scene" aria-hidden="true">
        <PreviewBoundary>
          <Canvas
            frameloop="demand"
            dpr={[1, 1.5]}
            camera={{ position: [2.6, 1.65, 3.4], fov: 33 }}
            fallback={<PreviewFallback />}
          >
            <ambientLight intensity={1.9} />
            <directionalLight position={[1, 3, 4]} intensity={2.5} />
            <directionalLight position={[-3, 2, -2]} color="#ad84ff" intensity={1.6} />
            {equipment.kind === 'bike' ? <Bike /> : <ResistanceStation />}
            <OrbitControls target={[0, 0.55, 0]} enableZoom={false} enablePan={false} />
          </Canvas>
        </PreviewBoundary>
      </div>
      <figcaption>
        <strong>{equipment.label}</strong>
        <small>Modelo ilustrativo</small>
      </figcaption>
    </figure>
  );
}
