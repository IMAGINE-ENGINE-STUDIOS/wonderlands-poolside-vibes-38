import { useMemo } from 'react';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface ComponentRulerProps {
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  height?: number;
}

export const ComponentRuler = ({ bounds, height = 0.1 }: ComponentRulerProps) => {
  const { minX, maxX, minY, maxY } = bounds;
  
  const width = maxX - minX;
  const depth = maxY - minY;
  
  const widthFt = (width * 3.28084).toFixed(1);
  const depthFt = (depth * 3.28084).toFixed(1);
  
  const rulerLinePoints = useMemo(() => {
    const points: [number, number, number][] = [
      // Top edge
      [minX, height, minY],
      [maxX, height, minY],
      // Right edge
      [maxX, height, minY],
      [maxX, height, maxY],
      // Bottom edge
      [maxX, height, maxY],
      [minX, height, maxY],
      // Left edge
      [minX, height, maxY],
      [minX, height, minY],
    ];
    return points;
  }, [minX, maxX, minY, maxY, height]);
  
  return (
    <group>
      {/* Ruler lines */}
      <Line points={rulerLinePoints} color="#ffff00" lineWidth={2} segments />
      
      {/* Width measurement (top) */}
      <Text
        position={[(minX + maxX) / 2, height + 0.5, minY - 1]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#ffff00"
        anchorX="center"
        anchorY="middle"
      >
        {widthFt} ft
      </Text>
      
      {/* Depth measurement (right) */}
      <Text
        position={[maxX + 1, height + 0.5, (minY + maxY) / 2]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={0.5}
        color="#ffff00"
        anchorX="center"
        anchorY="middle"
      >
        {depthFt} ft
      </Text>
    </group>
  );
};
