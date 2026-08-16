import * as THREE from 'three';
import { useMemo, useEffect, useState } from 'react';
import { resolveDeckBoundaries, buildDeckRingGeometry } from '@/utils/deckSurface';
import { textureCache } from '@/utils/textureCache';

interface DeckBorderGeometryProps {
  poolPoints: Array<{ x: number; z: number }>;
  /** Exact outer deck outline coming from the 2D designer (world coords). */
  outerPoints?: Array<{ x: number; z: number }>;
  deckWidth: number;
  copingWidth: number;
  borderHeight?: number; // Default 3 inches (0.25ft)
  borderWidth?: number; // Default 3ft minimum
  deckElevation?: number; // Height above/below ground (positive = above, negative = below, 0 = flush)
  textureUrl?: string;
  textureScale?: number;
  textureOffset?: [number, number];
}

export const DeckBorderGeometry = ({ 
  poolPoints, 
  outerPoints,
  deckWidth = 5,
  copingWidth = 1,
  borderHeight = 0.25, // 3 inches
  borderWidth = 3, // 3ft minimum
  deckElevation = 0, // Default flush with ground
  textureUrl,
  textureScale = 1,
  textureOffset = [0, 0]
}: DeckBorderGeometryProps) => {
  
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const offsetX = textureOffset[0];
  const offsetY = textureOffset[1];

  useEffect(() => {
    if (!textureUrl || textureUrl === '' || textureUrl === 'undefined') {
      setTexture(null);
      return;
    }

    let cancelled = false;

    // Match pool wall texture loading exactly
    const repeatX = 1.0 / textureScale;
    const repeatY = 1.0 / textureScale;

    textureCache.loadTexture(textureUrl, { x: repeatX, y: repeatY })
      .then((loadedTexture) => {
        // Guard against out-of-order responses re-applying a stale paver.
        if (cancelled) {
          loadedTexture.dispose();
          return;
        }
        loadedTexture.userData.url = textureUrl;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.offset.set(offsetX, offsetY);
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.needsUpdate = true;
        setTexture((prev) => {
          if (prev && prev !== loadedTexture) prev.dispose();
          return loadedTexture;
        });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('DeckBorderGeometry: Failed to load texture:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [textureUrl, offsetX, offsetY, textureScale]);

  
  const geometry = useMemo(() => {
    const boundaries = resolveDeckBoundaries({
      poolCurve: poolPoints,
      hardscapePoints: outerPoints,
      copingWidth,
      copingEnabled: true,
      deckWidth: Math.max(borderWidth, deckWidth),
      minDeckWidth: 3,
    });

    if (!boundaries) return new THREE.BufferGeometry();

    // Deck surface sits at deckElevation; the slab always extends down to (or below)
    // ground level so no sliver of untextured terrain can show through.
    const deckTopY = deckElevation;
    const deckBottomY = Math.min(deckElevation - borderHeight, -0.05);

    return buildDeckRingGeometry(boundaries.inner, boundaries.outer, deckTopY, deckBottomY, poolPoints);
  }, [poolPoints, outerPoints, deckWidth, copingWidth, borderHeight, borderWidth, deckElevation]);
  
  return (
    <mesh key={texture?.uuid || 'no-deck-texture'} geometry={geometry} castShadow receiveShadow>
      <meshPhongMaterial
        map={texture || null}
        color={texture ? '#ffffff' : '#d9d4cc'}
        shininess={40}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
