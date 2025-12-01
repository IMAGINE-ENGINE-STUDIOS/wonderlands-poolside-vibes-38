import * as THREE from 'three';
import { useMemo, useEffect, useState } from 'react';

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
      },
      undefined,
      (error) => {
        console.error('Failed to load deck texture:', error);
        setTexture(null);
      }
    );
  }, [textureUrl, textureScale, textureOffset]);
  
  const geometry = useMemo(() => {
    if (!poolPoints || poolPoints.length < 3) return new THREE.BufferGeometry();
    
    console.log('🔧 DeckGeometry: Creating spline-based deck');
    
    // Use hardscapePoints from 2D designer if available (minimum 4 corners required)
    let deckOuterBoundary: Array<{ x: number; z: number }>;
    
    if (hardscapePoints && hardscapePoints.length >= 4) {
      console.log('✅ Using hardscapePoints from 2D designer:', hardscapePoints.length, 'points');
      deckOuterBoundary = hardscapePoints;
    } else {
      console.log('⚠️ Generating deck boundary from pool offset (no hardscapePoints)');
      // Fallback: Generate deck outer boundary by offsetting pool
      const innerOffset = copingEnabled ? copingWidth : 0;
      const totalOffset = innerOffset + deckWidth;
      
      deckOuterBoundary = [];
      for (let i = 0; i < poolPoints.length; i++) {
        const p1 = poolPoints[i];
        const p2 = poolPoints[(i + 1) % poolPoints.length];
        
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        
        const nx = dz / length;
        const nz = -dx / length;
        
        deckOuterBoundary.push({
          x: p1.x + nx * totalOffset,
          z: p1.z + nz * totalOffset
        });
      }
    }
    
    // Create deck inner boundary (coping outer edge or pool edge)
    const innerOffset = copingEnabled ? copingWidth : 0;
    const deckInnerBoundary: Array<{ x: number; z: number }> = [];
    
    for (let i = 0; i < poolPoints.length; i++) {
      const p1 = poolPoints[i];
      const p2 = poolPoints[(i + 1) % poolPoints.length];
      
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const length = Math.sqrt(dx * dx + dz * dz);
      
      const nx = dz / length;
      const nz = -dx / length;
      
      deckInnerBoundary.push({
        x: p1.x + nx * innerOffset,
        z: p1.z + nz * innerOffset
      });
    }
    
    // Create spline-based deck geometry using Shape with hole
    const deckShape = new THREE.Shape();
    
    // Outer boundary
    deckShape.moveTo(deckOuterBoundary[0].x, deckOuterBoundary[0].z);
    for (let i = 1; i < deckOuterBoundary.length; i++) {
      deckShape.lineTo(deckOuterBoundary[i].x, deckOuterBoundary[i].z);
    }
    deckShape.closePath();
    
    // Inner hole (coping outer edge or pool edge)
    const deckHole = new THREE.Path();
    deckHole.moveTo(deckInnerBoundary[0].x, deckInnerBoundary[0].z);
    for (let i = 1; i < deckInnerBoundary.length; i++) {
      deckHole.lineTo(deckInnerBoundary[i].x, deckInnerBoundary[i].z);
    }
    deckHole.closePath();
    deckShape.holes.push(deckHole);
    
    // Extrude to create 3D deck
    const extrudeSettings = {
      depth: deckHeight,
      bevelEnabled: false
    };
    
    const geom = new THREE.ExtrudeGeometry(deckShape, extrudeSettings);
    
    // Rotate to horizontal orientation
    geom.rotateX(-Math.PI / 2);
    
    // Compute UVs and normals
    geom.computeVertexNormals();
    
    console.log('✅ Spline-based deck geometry created with', geom.getAttribute('position').count, 'vertices');
    
    return geom;
  }, [poolPoints, hardscapePoints, deckWidth, deckHeight, copingWidth, copingEnabled]);
  
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        map={texture || undefined}
        color={texture ? '#ffffff' : '#d4d4d8'}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
};
