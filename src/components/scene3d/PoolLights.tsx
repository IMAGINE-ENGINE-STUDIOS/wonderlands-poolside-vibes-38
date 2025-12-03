import * as THREE from 'three';
import { useMemo } from 'react';
import { generateCurvedPoolPoints, normalize2DTo3D } from '@/utils/curveUtils';

interface PoolLightsProps {
  poolPoints: Array<{ x: number; y: number; id: string }>;
  lightCount?: number;
  isOn?: boolean;
  lightColor?: string;
  lightIntensity?: number;
  depthFromSurface?: number; // How deep below water surface
}

export function PoolLights({
  poolPoints,
  lightCount = 4,
  isOn = true,
  lightColor = '#00ffff',
  lightIntensity = 2,
  depthFromSurface = 1.5 // 1.5 feet below water surface
}: PoolLightsProps) {
  const lightPositions = useMemo(() => {
    if (poolPoints.length < 3) return [];

    // Generate curved pool boundary
    const curvedPoints = generateCurvedPoolPoints(
      poolPoints.map(p => ({ x: p.x, y: p.y })),
      30,
      0.3
    );
    
    // Normalize to 3D coordinates
    const normalized = normalize2DTo3D(curvedPoints);
    
    // Calculate perimeter length and distribute lights evenly
    const positions: Array<{ x: number; y: number; z: number; angle: number }> = [];
    
    // Calculate total perimeter
    let totalPerimeter = 0;
    for (let i = 0; i < normalized.length; i++) {
      const p1 = normalized[i];
      const p2 = normalized[(i + 1) % normalized.length];
      totalPerimeter += Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
    }
    
    // Place lights evenly around perimeter
    const spacing = totalPerimeter / lightCount;
    let accumulated = 0;
    let lightIndex = 0;
    
    for (let i = 0; i < normalized.length && lightIndex < lightCount; i++) {
      const p1 = normalized[i];
      const p2 = normalized[(i + 1) % normalized.length];
      const segmentLength = Math.sqrt((p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2);
      
      while (accumulated + segmentLength >= spacing * (lightIndex + 1) && lightIndex < lightCount) {
        const t = (spacing * (lightIndex + 1) - accumulated) / segmentLength;
        const x = p1.x + t * (p2.x - p1.x);
        const z = p1.z + t * (p2.z - p1.z);
        
        // Calculate angle for light to point inward
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        const angle = Math.atan2(dz, dx) + Math.PI / 2; // Perpendicular to wall, pointing inward
        
        // Move light slightly inward from wall (0.5 ft)
        const inwardOffset = 0.3;
        const offsetX = x + Math.cos(angle) * inwardOffset;
        const offsetZ = z + Math.sin(angle) * inwardOffset;
        
        positions.push({
          x: offsetX,
          y: -depthFromSurface,
          z: offsetZ,
          angle
        });
        lightIndex++;
      }
      
      accumulated += segmentLength;
    }
    
    return positions;
  }, [poolPoints, lightCount, depthFromSurface]);

  if (lightPositions.length === 0) return null;

  return (
    <group>
      {lightPositions.map((pos, index) => (
        <group key={`pool-light-${index}`} position={[pos.x, pos.y, pos.z]}>
          {/* Outer ring - 2 inch diameter, 0.5 inch thick */}
          <mesh rotation={[Math.PI / 2, 0, pos.angle]}>
            <torusGeometry args={[0.083, 0.02, 8, 24]} />
            <meshStandardMaterial
              color="#888888"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          
          {/* Inner light lens - 1 inch diameter */}
          <mesh rotation={[Math.PI / 2, 0, pos.angle]}>
            <circleGeometry args={[0.042, 24]} />
            <meshStandardMaterial
              color={isOn ? lightColor : '#333333'}
              emissive={isOn ? lightColor : '#000000'}
              emissiveIntensity={isOn ? 2 : 0}
              transparent
              opacity={0.9}
            />
          </mesh>
          
          {/* Actual point light source */}
          {isOn && (
            <pointLight
              color={lightColor}
              intensity={lightIntensity}
              distance={15}
              decay={2}
              castShadow={false}
            />
          )}
        </group>
      ))}
    </group>
  );
}
