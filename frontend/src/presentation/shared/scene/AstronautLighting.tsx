import { Environment, Lightformer } from '@react-three/drei';

export function AstronautLighting({ studio = false }: { studio?: boolean }) {
  return (
    <>
      <hemisphereLight args={['#e9f3ff', '#6f5689', 1.05]} />
      <directionalLight position={[-3, 5, 4]} color="#fff1e4" intensity={2.75} />
      <directionalLight position={[3, 0.4, 4]} color="#b2d9ff" intensity={studio ? 1.15 : 0.7} />
      <directionalLight position={[3, 2.5, -3]} color="#bc80ff" intensity={studio ? 3 : 2.5} />
      <directionalLight position={[-4, 1, -2]} color="#ff9a57" intensity={1.15} />
      <Environment frames={1} resolution={128} environmentIntensity={0.55}>
        <Lightformer position={[-2, 3, 4]} target={[0, 0, 0]} scale={[2.5, 1.1]} intensity={3} />
        <Lightformer
          position={[3.5, 0.8, 2]}
          target={[0, 0, 0]}
          scale={[0.55, 3]}
          color="#9ad9ff"
          intensity={1.6}
        />
        <Lightformer
          position={[2, 2, -3]}
          target={[0, 0, 0]}
          scale={[1.8, 2.5]}
          color="#c6a0ff"
          intensity={2}
        />
      </Environment>
    </>
  );
}
