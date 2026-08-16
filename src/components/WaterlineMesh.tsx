import { useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { textureCache, disposeTexture } from '@/utils/textureCache';
import { useTextureInvalidation } from '@/hooks/useTextureInvalidation';

interface Point {
  x: number;
  y: number;
  id: string;
}

interface WaterlineMeshProps {
  poolPoints: Point[];
  waterlineTextureUrl?: string;
  waterlineHeight?: number;
  waterlineWidth?: number;
  selectedCategory?: string | null;
  waterlineTextureScale?: number;
  waterlineTextureOffset?: [number, number];
  copingHeight?: number;
}

export const WaterlineMesh: React.FC<WaterlineMeshProps> = ({ 
  poolPoints, 
  waterlineTextureUrl,
  waterlineHeight = 0.5, // 0.5ft tall waterline band
  waterlineWidth = 0.5 / 12,  // 0.5 inch depth into wall (half inch)
  selectedCategory,
  waterlineTextureScale = 1,
  waterlineTextureOffset = [0, 0],
  copingHeight = 2 / 12 // Default 2 inches
}) => {
  const [waterlineTexture, setWaterlineTexture] = useState<THREE.Texture | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    if (!waterlineTextureUrl || waterlineTextureUrl === '' || waterlineTextureUrl === 'undefined' || waterlineTextureUrl === 'null') {
      setWaterlineTexture(null);
      return;
    }
    
    // 0.5ft x 0.5ft tile - squared texture frames
    textureCache.loadTexture(waterlineTextureUrl, { x: 2, y: 2 }) // 2x repeat = 0.5ft squares
      .then(texture => {
        texture.offset.set(waterlineTextureOffset[0], waterlineTextureOffset[1]);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.userData.textureUrl = waterlineTextureUrl;
        texture.needsUpdate = true;
        setWaterlineTexture(texture);
        // Don't call invalidate here - useTextureInvalidation handles post-commit invalidation
      })
      .catch(err => {
        console.error('Failed to load waterline texture');
        setWaterlineTexture(null);
      });
  }, [waterlineTextureUrl, poolPoints, waterlineWidth, waterlineTextureOffset]);

  // Post-commit invalidation: ensures render happens AFTER React commits the texture
  useTextureInvalidation(waterlineTexture?.uuid);

  // Pulsing red effect when selected (8 second cycle)
  useEffect(() => {
    if (selectedCategory !== 'waterline') return;
    
    const interval = setInterval(() => {
      setPulseIntensity(prev => {
        if (prev >= 1) return 0;
        return prev + 0.0125; // 8 second cycle
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [selectedCategory]);

  /**
   * Waterline ring: uses the SAME spline the pool wall is built from (curved,
   * one vertex per curve segment) so the band always matches the wall shape,
   * with a constant width measured perpendicular to the wall.
   */
  const wallRing = useMemo(() => {
    if (wallCurve && wallCurve.length >= 3) return wallCurve.map(p => ({ x: p.x, z: p.z }));
    if (poolPoints.length < 3) return [];

    const curved = generateCurvedPoolPoints(
      poolPoints.map(p => ({ x: p.x, y: p.y })),
      30,
      0.3
    );
    const xs = curved.map(p => p.x);
    const ys = curved.map(p => p.y);
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
    return curved.map(p => ({ x: p.x - centerX, z: p.y - centerY }));
  }, [wallCurve, poolPoints]);

  const waterlineGeometry = useMemo(() => {
    if (wallRing.length < 3) {
      return new THREE.BoxGeometry(1, 0.5, 0.5);
    }

    // Densify so circular/curved walls carry as many polygons as needed
    // (0.25ft max segment) for a perfectly following band.
    const outerRing = densifyRing(wallRing, 0.25);
    const innerRing = matchedOffsetRing(outerRing, -Math.abs(waterlineWidth));
    const distances = ringDistances(outerRing);
    const n = outerRing.length;

    // Attached directly below the coping bottom.
    const waterlineTop = 1 / 36;
    const waterlineBottom = waterlineTop - waterlineHeight;

    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const pushQuad = (
      a: { x: number; z: number },
      b: { x: number; z: number },
      c: { x: number; z: number },
      d: { x: number; z: number },
      yTopAB: number,
      yBottomCD: number,
      uvSet: number[][],
      reverse: boolean
    ) => {
      const base = vertices.length / 3;
      vertices.push(a.x, yTopAB, a.z);
      vertices.push(b.x, yTopAB, b.z);
      vertices.push(c.x, yBottomCD, c.z);
      vertices.push(d.x, yBottomCD, d.z);
      uvSet.forEach(([u, v]) => uvs.push(u, v));
      if (reverse) {
        indices.push(base, base + 1, base + 3, base, base + 3, base + 2);
      } else {
        indices.push(base, base + 3, base + 1, base, base + 2, base + 3);
      }
    };

    const vTop = waterlineHeight * 2; // 0.5ft squares
    for (let i = 0; i < n; i++) {
      const o1 = outerRing[i];
      const o2 = outerRing[(i + 1) % n];
      const i1 = innerRing[i];
      const i2 = innerRing[(i + 1) % n];
      const u1 = distances[i] * 2;
      const u2 = distances[i + 1] * 2;

      // Pool-facing wall face
      pushQuad(o1, o2, o1, o2, waterlineTop, waterlineBottom,
        [[u1, vTop], [u2, vTop], [u1, 0], [u2, 0]], false);
      // Back face (inside the wall)
      pushQuad(i1, i2, i1, i2, waterlineTop, waterlineBottom,
        [[u1, vTop], [u2, vTop], [u1, 0], [u2, 0]], true);
      // Top cap
      pushQuad(o1, o2, i1, i2, waterlineTop, waterlineTop,
        [[o1.x, o1.z], [o2.x, o2.z], [i1.x, i1.z], [i2.x, i2.z]], true);
      // Bottom cap
      pushQuad(o1, o2, i1, i2, waterlineBottom, waterlineBottom,
        [[o1.x, o1.z], [o2.x, o2.z], [i1.x, i1.z], [i2.x, i2.z]], false);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    geom.computeBoundingSphere();

    return geom;
  }, [wallRing, waterlineHeight, waterlineWidth]);

  const isSelected = selectedCategory === 'waterline';

  return (
    <mesh key={waterlineTexture?.uuid || 'no-waterline-texture'} geometry={waterlineGeometry} position={[0, 0, 0]}>
      <meshPhongMaterial
        map={waterlineTexture}
        color="#ffffff"
        shininess={40}
        side={THREE.DoubleSide}
        emissive={isSelected ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={pulseIntensity * 0.5}
      />
    </mesh>
  );
};
