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
  
  useEffect(() => {
    if (!textureUrl || textureUrl === '' || textureUrl === 'undefined') {
      setTexture(null);
      return;
    }
    
    // Match pool wall texture loading exactly
    const repeatX = 1.0 / textureScale;
    const repeatY = 1.0 / textureScale;
    
    textureCache.loadTexture(textureUrl, { x: repeatX, y: repeatY })
      .then((loadedTexture) => {
        loadedTexture.userData.url = textureUrl;
        loadedTexture.offset.set(textureOffset[0], textureOffset[1]);
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      })
      .catch((error) => {
        console.error('DeckBorderGeometry: Failed to load texture:', error);
        setTexture(null);
      });
  }, [textureUrl, textureOffset, textureScale]);
  
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

    return buildDeckRingGeometry(boundaries.inner, boundaries.outer, deckTopY, deckBottomY);
  }, [poolPoints, outerPoints, deckWidth, copingWidth, borderHeight, borderWidth, deckElevation]);
  
  return (
    <mesh key={texture?.uuid || 'no-deck-texture'} geometry={geometry} castShadow receiveShadow>
      <meshPhongMaterial
        map={texture}
        color="#ffffff"
        shininess={40}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
