import { useEffect, useMemo } from 'react';
import { Mesh, MeshStandardMaterial, type Object3D, type Texture } from 'three';

function finishMaterial(original: MeshStandardMaterial, map?: Texture) {
  const material = original.clone();
  material.map = map ?? original.map;
  material.color.setScalar(0.76);
  material.roughness = 0.59;
  material.metalness = 0.07;

  // The GLB packs the fabric, colored parts and amber visor in one atlas.
  // Use its original tones to vary the finish without changing the mesh or UVs.
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <map_fragment>',
        `float visor = 0.0;
         float accent = 0.0;
         #include <map_fragment>
         #ifdef USE_MAP
           vec3 texel = sampledDiffuseColor.rgb;
           float high = max(texel.r, max(texel.g, texel.b));
           float low = min(texel.r, min(texel.g, texel.b));
           float chroma = high - low;
           accent = smoothstep(0.12, 0.44, chroma) * smoothstep(0.20, 0.49, high);
           visor = (1.0 - smoothstep(0.15, 0.29, high))
             * smoothstep(0.004, 0.024, texel.r - texel.g)
             * smoothstep(0.006, 0.023, texel.g - texel.b);
           float luminance = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
           diffuseColor.rgb = max(
             mix(vec3(luminance), diffuseColor.rgb, 1.0 + accent * 0.27),
             vec3(0.0)
           ) * (1.0 + accent * 0.13);
         #endif`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
         roughnessFactor = mix(mix(roughnessFactor, 0.40, accent), 0.23, visor);`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `#include <metalnessmap_fragment>
         metalnessFactor = mix(metalnessFactor, 0.42, visor);`,
      );
  };
  material.customProgramCacheKey = () => 'qhipa-astronaut-finish';
  return material;
}

export function useAstronautFinish(scene: Object3D, map?: Texture) {
  const { model, materials } = useMemo(() => {
    const model = scene.clone();
    const materials = new Map<MeshStandardMaterial, MeshStandardMaterial>();
    model.traverse((node) => {
      if (!(node instanceof Mesh) || !(node.material instanceof MeshStandardMaterial)) return;
      const original = node.material;
      let material = materials.get(original);
      if (!material) {
        material = finishMaterial(original, map);
        materials.set(original, material);
      }
      node.material = material;
    });
    return { model, materials };
  }, [scene, map]);
  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);
  return model;
}
