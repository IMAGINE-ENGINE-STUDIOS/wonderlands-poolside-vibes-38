import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { textureCache, disposeTexture } from '@/utils/textureCache';
import earcut from 'earcut';

interface Point {
  x: number;
  y: number;
}

interface HardscapePoint {
  x: number;
  y: number;
}

interface PoolFeature {
  type: string;
  x: number;
  y: number;
  [key: string]: any;
}

interface DeckMeshProps {
  hardscapePoints: HardscapePoint[];
  poolPoints: Point[];
  features: PoolFeature[];
  paverTextureUrl?: string;
  selectedCategory?: string | null;
}

export const DeckMesh: React.FC<DeckMeshProps> = ({
  hardscapePoints,
  poolPoints,
  features,
  paverTextureUrl,
  selectedCategory
}) => {
  const [paverTexture, setPaverTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  const deckArea = useMemo(() => {
    if (hardscapePoints.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < hardscapePoints.length; i++) {
      const p1 = hardscapePoints[i];
      const p2 = hardscapePoints[(i + 1) % hardscapePoints.length];
      area += p1.x * p2.y - p2.x * p1.y;
    }
    return Math.abs(area) / 2;
  }, [hardscapePoints]);

  useEffect(() => {
    if (paverTextureUrl) {
      const repeatX = Math.sqrt(deckArea) / 3;
      const repeatY = Math.sqrt(deckArea) / 3;
      
      textureCache.loadTexture(paverTextureUrl, { x: repeatX, y: repeatY })
        .then(setPaverTexture)
        .catch(() => setPaverTexture(null));
    }

    return () => {
      if (paverTexture) disposeTexture(paverTexture);
    };
  }, [paverTextureUrl, deckArea]);

  useEffect(() => {
    if (selectedCategory !== 'deck') return;
    
    const interval = setInterval(() => {
      setPulseIntensity(prev => (prev >= 1 ? 0 : prev + 0.0125));
    }, 50);
    
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const geometry = useMemo(() => {
    if (hardscapePoints.length < 3 || poolPoints.length < 3) {
      return new THREE.BufferGeometry();
    }

    const minX = Math.min(...hardscapePoints.map(p => p.x));
    const maxX = Math.max(...hardscapePoints.map(p => p.x));
    const minY = Math.min(...hardscapePoints.map(p => p.y));
    const maxY = Math.max(...hardscapePoints.map(p => p.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Normalize points
    const normalizedDeck = hardscapePoints.map(p => [p.x - centerX, p.y - centerY]);
    const normalizedPool = poolPoints.map(p => [p.x - centerX, p.y - centerY]);

    // Create deck shape with pool hole (coping sits on top so we cut inside pool edge)
    const deckCoords = normalizedDeck.flat();
    const poolHoleCoords = normalizedPool.flat();

    // Combine: outer deck boundary + inner pool hole
    const allCoords = [...deckCoords];
    const holes = [poolHoleCoords.length / 2]; // Hole starts after deck points
    allCoords.push(...poolHoleCoords);

    try {
      const triangles = earcut(allCoords, holes);
      
      const vertices: number[] = [];
      const uvs: number[] = [];
      const normals: number[] = [];
      
      // Add deck vertices at y=0
      for (let i = 0; i < allCoords.length; i += 2) {
        vertices.push(allCoords[i], 0, allCoords[i + 1]);
        normals.push(0, 1, 0);
        uvs.push(allCoords[i] / 10, allCoords[i + 1] / 10);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(triangles);

      return geo;
    } catch (err) {
      console.error('Deck triangulation failed:', err);
      return new THREE.BufferGeometry();
    }
  }, [hardscapePoints, poolPoints]);

  const isSelected = selectedCategory === 'deck';

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={paverTexture}
        roughness={0.8}
        metalness={0.0}
        side={THREE.DoubleSide}
        emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={pulseIntensity * 0.5}
      />
    </mesh>
  );
};
