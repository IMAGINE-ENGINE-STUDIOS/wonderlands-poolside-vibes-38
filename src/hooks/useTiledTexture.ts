import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

/**
 * Loads a texture and returns a PER-INSTANCE clone configured for 1ft x 1ft
 * tiling (UVs are authored in feet by the pool asset meshes).
 *
 * useTexture caches a single THREE.Texture per URL, so mutating `repeat`/`wrap`
 * on it leaked settings between components (pool finish vs. stairs/seating),
 * which made asset textures render correctly only on the first face and appear
 * stretched/broken across the rest of the geometry.
 */
export function useTiledTexture(url: string, repeat: [number, number] = [1, 1]) {
  const base = useTexture(url);
  const { invalidate } = useThree();

  const texture = useMemo(() => {
    if (!base) return null;
    const clone = base.clone();
    clone.wrapS = THREE.RepeatWrapping;
    clone.wrapT = THREE.RepeatWrapping;
    clone.repeat.set(repeat[0], repeat[1]);
    clone.offset.set(0, 0);
    clone.center.set(0, 0);
    clone.rotation = 0;
    clone.colorSpace = THREE.SRGBColorSpace;
    clone.anisotropy = 4;
    clone.needsUpdate = true;
    return clone;
  }, [base, repeat[0], repeat[1]]);

  useEffect(() => {
    if (texture) invalidate();
    return () => {
      texture?.dispose();
    };
  }, [texture, invalidate]);

  return texture;
}
