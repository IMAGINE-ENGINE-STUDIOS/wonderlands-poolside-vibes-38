import * as THREE from 'three';
import { useMemo, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { resolveDeckBoundaries, buildDeckRingGeometry } from '@/utils/deckSurface';

interface DeckGeometryProps {
  poolPoints: Array<{ x: number; z: number }>;
  hardscapePoints?: Array<{ x: number; z: number }>; // From 2D designer for exact sync
  deckWidth: number;
  deckHeight: number;
  copingWidth: number;
  copingEnabled: boolean;
  textureUrl?: string;
  textureScale?: number;
  textureOffset?: [number, number];
  /** Texture rotation in degrees */
  textureRotation?: number;
}

export const DeckGeometry = ({ 
  poolPoints,
  hardscapePoints,
  deckWidth = 5, 
  deckHeight = 0.25, 
  copingWidth = 1,
  copingEnabled = true,
  textureUrl,
  textureScale = 1,
  textureOffset = [0, 0],
  textureRotation = 0
}: DeckGeometryProps) => {
  
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const { invalidate } = useThree();
  const offsetX = textureOffset[0];
  const offsetY = textureOffset[1];

  useEffect(() => {
    if (!textureUrl) {
      setTexture(null);
      return;
    }

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (loadedTexture) => {
        // A newer texture request already superseded this one — drop it so the
        // older texture can never overwrite the user's latest selection.
        if (cancelled) {
          loadedTexture.dispose();
          return;
        }
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.set(textureScale, textureScale);
        loadedTexture.offset.set(offsetX, offsetY);
        loadedTexture.center.set(0.5, 0.5);
        loadedTexture.rotation = (textureRotation * Math.PI) / 180;
        loadedTexture.needsUpdate = true;
        setTexture((prev) => {
          if (prev && prev !== loadedTexture) prev.dispose();
          return loadedTexture;
        });
        invalidate(); // Force immediate re-render
      },
      undefined,
      (error) => {
        if (cancelled) return;
        console.error('Failed to load deck texture:', error);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [textureUrl, textureScale, offsetX, offsetY, textureRotation, invalidate]);

  
  const geometry = useMemo(() => {
    const boundaries = resolveDeckBoundaries({
      poolCurve: poolPoints,
      hardscapePoints,
      copingWidth,
      copingEnabled,
      deckWidth,
    });

    if (!boundaries) return new THREE.BufferGeometry();

    return buildDeckRingGeometry(boundaries.inner, boundaries.outer, 0, -deckHeight, poolPoints);
  }, [poolPoints, hardscapePoints, deckWidth, deckHeight, copingWidth, copingEnabled]);

  return (
    {/* Flat ground-level slab: receives shadows only. Casting would make the
        double-sided surface shadow itself, producing diagonal acne bands. */}
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={texture || undefined}
        color={texture ? '#ffffff' : '#d4d4d8'}
        roughness={0.8}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
