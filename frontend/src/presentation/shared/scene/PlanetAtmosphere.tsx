import { useMemo } from 'react';
import { AdditiveBlending, BackSide, Color } from 'three';

const vertexShader = `
  varying vec3 surfaceNormal;
  varying vec3 viewDirection;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    surfaceNormal = normalize(normalMatrix * normal);
    viewDirection = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;
const fragmentShader = `
  uniform vec3 glowColor;
  varying vec3 surfaceNormal;
  varying vec3 viewDirection;
  void main() {
    float facing = clamp(abs(dot(normalize(surfaceNormal), normalize(viewDirection))), 0.0, 1.0);
    float rim = pow(1.0 - facing, 3.2);
    gl_FragColor = vec4(glowColor, rim * 0.3);
    #include <colorspace_fragment>
  }
`;

/** Artistic limb glow; deliberately not an atmospheric scattering simulation. */
export function PlanetAtmosphere({ radius }: { radius: number }) {
  const uniforms = useMemo(() => ({ glowColor: { value: new Color('#64b8ed') } }), []);
  return (
    <mesh raycast={() => null}>
      <sphereGeometry args={[radius * 1.035, 64, 40]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={BackSide}
        blending={AdditiveBlending}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
