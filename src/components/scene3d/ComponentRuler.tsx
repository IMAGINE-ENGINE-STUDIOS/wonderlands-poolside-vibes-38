import { useMemo } from 'react';
import { Text } from '@react-three/drei';
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
  
  const rulerLines = useMemo(() => {
    const points: THREE.Vector3[] = [
      // Top edge
      new THREE.Vector3(minX, height, minY),
      new THREE.Vector3(maxX, height, minY),
      // Right edge
      new THREE.Vector3(maxX, height, minY),
      new THREE.Vector3(maxX, height, maxY),
      // Bottom edge
      new THREE.Vector3(maxX, height, maxY),
      new THREE.Vector3(minX, height, maxY),
      // Left edge
      new THREE.Vector3(minX, height, maxY),
      new THREE.Vector3(minX, height, minY),
    ];
    
    return points;
  }, [minX, maxX, minY, maxY, height]);
  
  // Create line geometry
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(rulerLines.flatMap(v => [v.x, v.y, v.z]));
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [rulerLines]);
  
  // Create line object
  const lineObject = useMemo(() => {
    const material = new THREE.LineBasicMaterial({ color: '#ffff00' });
    return new THREE.Line(lineGeometry, material);
  }, [lineGeometry]);
  
  return (
    <group>
      {/* Ruler lines */}
      <primitive object={lineObject} />
      
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
