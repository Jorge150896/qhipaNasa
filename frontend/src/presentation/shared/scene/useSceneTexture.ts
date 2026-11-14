import { useEffect, useState } from 'react';
import { NoColorSpace, SRGBColorSpace, Texture, TextureLoader } from 'three';

/** A visual resource, not mission data. Each owner releases its own GPU texture. */
export function useSceneTexture(
  path: string | undefined,
  {
    color = false,
    onError,
    onReady,
  }: { color?: boolean; onError?: () => void; onReady?: () => void } = {},
) {
  const [loaded, setLoaded] = useState<{ path: string; texture: Texture } | null>(null);
  useEffect(() => {
    if (!path) return;
    let active = true;
    const texture = new TextureLoader().load(
      path,
      (result) => {
        if (!active) {
          result.dispose();
          return;
        }
        result.colorSpace = color ? SRGBColorSpace : NoColorSpace;
        result.anisotropy = 4;
        setLoaded({ path, texture: result });
        onReady?.();
      },
      undefined,
      () => {
        if (active) onError?.();
      },
    );
    return () => {
      active = false;
      texture.dispose();
    };
  }, [path, color, onError, onReady]);
  return loaded && loaded.path === path ? loaded.texture : null;
}
