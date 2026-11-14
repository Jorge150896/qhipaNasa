import { publicAsset } from '@/presentation/shared/publicAsset';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import { Component, Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { Mesh, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, Texture } from 'three';
import type { AvatarPart, AvatarSelection } from './types';

const sockets = {
  back: { position: [0, 1.22, -0.31], rotation: [0, Math.PI, 0] },
  floating: { position: [0.66, 1.52, 0.25], rotation: [0, 0, 0] },
  chest: { position: [0.02, 1.22, 0.28], rotation: [0, 0, 0] },
  hand: { position: [0.5, 0.91, 0.125], rotation: [0.12, 0, -0.19] },
} as const;

class PreviewBoundary extends Component<{ children: ReactNode; fallback: ReactNode }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function BaseModel() {
  const { scene } = useGLTF(publicAsset('/models/astronaut.glb'));
  return <primitive object={useMemo(() => scene.clone(), [scene])} />;
}

function SuitFinish({ selection }: { selection: AvatarSelection }) {
  const { scene } = useGLTF(publicAsset('/models/astronaut.glb'));
  const map = useTexture(
    publicAsset(`/models/avatar/suit-${selection.bands}-${selection.controls}.webp`),
  );
  const { model, materials, finish } = useMemo(() => {
    const finish = new Texture(map.image);
    finish.colorSpace = SRGBColorSpace;
    finish.flipY = false;
    finish.wrapS = RepeatWrapping;
    finish.wrapT = RepeatWrapping;
    finish.needsUpdate = true;
    const model = scene.clone();
    const materials = new Map<MeshStandardMaterial, MeshStandardMaterial>();
    model.traverse((node) => {
      if (!(node instanceof Mesh) || !(node.material instanceof MeshStandardMaterial)) return;
      const original = node.material;
      let material = materials.get(original);
      if (!material) {
        material = original.clone();
        material.map = finish;
        materials.set(original, material);
      }
      node.material = material;
    });
    return { model, materials, finish };
  }, [scene, map]);
  useEffect(() => {
    return () => {
      materials.forEach((material) => material.dispose());
      finish.dispose();
    };
  }, [finish, materials]);
  return <primitive object={model} />;
}

function EquipmentView({ parts }: { parts: (AvatarPart | undefined)[] }) {
  const back = parts.some((part) => part?.socket === 'back');
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(back ? 2.15 : 0, 0.1, back ? -3.61 : 4.2);
    camera.lookAt(0, 0, 0);
  }, [back, camera]);
  return (
    <OrbitControls
      key={back ? 'back' : 'front'}
      enablePan={false}
      minDistance={2.8}
      maxDistance={7}
    />
  );
}

function MountedPart({ part }: { part: AvatarPart }) {
  const { scene } = useGLTF(publicAsset(`/models/avatar/${part.file}`));
  const model = useMemo(() => scene.clone(), [scene]);
  const socket = sockets[part.socket];
  return (
    <group name={part.socket} position={[...socket.position]} rotation={[...socket.rotation]}>
      <primitive object={model} />
    </group>
  );
}

export function AvatarPreview({
  selection,
  parts,
}: {
  selection: AvatarSelection;
  parts: (AvatarPart | undefined)[];
}) {
  const fallback = <p className="avatar-preview-message">Vista 3D no disponible.</p>;
  return (
    <PreviewBoundary fallback={fallback}>
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.1, 4.2], fov: 36 }} fallback={fallback}>
        <ambientLight intensity={1.15} />
        <hemisphereLight args={['#E9ECEF', '#212529', 1.45]} />
        <directionalLight position={[-3, 4, 5]} intensity={2.6} />
        <directionalLight position={[2, 2, -3]} color="#a66af7" intensity={1.55} />
        <Suspense fallback={null}>
          <group position={[0, -1.03, 0]}>
            <PreviewBoundary
              key={`${selection.bands}:${selection.controls}`}
              fallback={<BaseModel />}
            >
              <Suspense fallback={<BaseModel />}>
                <SuitFinish selection={selection} />
              </Suspense>
            </PreviewBoundary>
            {parts.map(
              (part) =>
                part && (
                  <PreviewBoundary key={part.id} fallback={null}>
                    <Suspense fallback={null}>
                      <MountedPart part={part} />
                    </Suspense>
                  </PreviewBoundary>
                ),
            )}
          </group>
        </Suspense>
        <EquipmentView parts={parts} />
      </Canvas>
    </PreviewBoundary>
  );
}
