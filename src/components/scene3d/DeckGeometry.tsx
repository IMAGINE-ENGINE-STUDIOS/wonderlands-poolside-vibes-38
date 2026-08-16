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
  textureOffset = [0, 0]
}: DeckGeometryProps) => {
  
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const { invalidate } = useThree();
  
  useEffect(() => {
    if (!textureUrl) {
      setTexture(null);
      return;
    }
    
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (loadedTexture) => {
        loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.set(textureScale, textureScale);
        loadedTexture.offset.set(textureOffset[0], textureOffset[1]);
        setTexture(loadedTexture);
        invalidate(); // Force immediate re-render
      },
      undefined,
      (error) => {
        console.error('Failed to load deck texture:', error);
        setTexture(null);
      }
    );
  }, [textureUrl, textureScale, textureOffset, invalidate]);
  
  const geometry = useMemo(() => {
    const boundaries = resolveDeckBoundaries({
      poolCurve: poolPoints,
      hardscapePoints,
      copingWidth,
      copingEnabled,
      deckWidth,
    });

    if (!boundaries) return new THREE.BufferGeometry();

    return buildDeckRingGeometry(boundaries.inner, boundaries.outer, 0, -deckHeight);
  }, [poolPoints, hardscapePoints, deckWidth, deckHeight, copingWidth, copingEnabled]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
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
