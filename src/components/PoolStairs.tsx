import { useMemo } from 'react';
import * as THREE from 'three';
import { PoolStair } from './scene3d/types';

interface PoolStairsProps {
  stair: PoolStair;
  poolDepth: number;
  texture?: THREE.Texture;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

export const PoolStairs = ({ 
  stair, 
  poolDepth, 
  texture,
  onSelect,
  isSelected 
}: PoolStairsProps) => {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    const normals: number[] = [];

    const { width, numSteps, stepHeight, stepDepth } = stair;
    let vertexOffset = 0;

    for (let i = 0; i < numSteps; i++) {
      const currentDepth = i * stepDepth;
      const nextDepth = (i + 1) * stepDepth;
      const currentHeight = -i * stepHeight;
      const nextHeight = -(i + 1) * stepHeight;
      const hw = width / 2;

      // Tread (top surface)
      const treadVerts = [
        [-hw, currentHeight, currentDepth],
        [hw, currentHeight, currentDepth],
        [hw, currentHeight, nextDepth],
        [-hw, currentHeight, nextDepth]
      ];
      treadVerts.forEach(v => vertices.push(...v));
      [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(uv => uvs.push(...uv));
      [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0].forEach(n => normals.push(n));
      indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
      vertexOffset += 4;

      // Riser (front)
      const riserVerts = [
        [-hw, currentHeight, nextDepth],
        [hw, currentHeight, nextDepth],
        [hw, nextHeight, nextDepth],
        [-hw, nextHeight, nextDepth]
      ];
      riserVerts.forEach(v => vertices.push(...v));
      [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(uv => uvs.push(...uv));
      [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1].forEach(n => normals.push(n));
      indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
      vertexOffset += 4;

      // Left side panel (closes gap)
      const leftVerts = [
        [-hw, currentHeight, currentDepth],
        [-hw, currentHeight, nextDepth],
        [-hw, nextHeight, nextDepth],
        [-hw, nextHeight, currentDepth]
      ];
      leftVerts.forEach(v => vertices.push(...v));
      [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(uv => uvs.push(...uv));
      [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0].forEach(n => normals.push(n));
      indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
      vertexOffset += 4;

      // Right side panel (closes gap)
      const rightVerts = [
        [hw, currentHeight, currentDepth],
        [hw, nextHeight, currentDepth],
        [hw, nextHeight, nextDepth],
        [hw, currentHeight, nextDepth]
      ];
      rightVerts.forEach(v => vertices.push(...v));
      [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(uv => uvs.push(...uv));
      [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0].forEach(n => normals.push(n));
      indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
      vertexOffset += 4;

      // Back panel (closes gap between steps)
      if (i > 0) {
        const backVerts = [
          [-hw, currentHeight, currentDepth],
          [-hw, nextHeight, currentDepth],
          [hw, nextHeight, currentDepth],
          [hw, currentHeight, currentDepth]
        ];
        backVerts.forEach(v => vertices.push(...v));
        [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(uv => uvs.push(...uv));
        [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1].forEach(n => normals.push(n));
        indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
        vertexOffset += 4;
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setIndex(indices);

    return geo;
  }, [stair]);

  return (
    <group 
      position={stair.position}
      rotation={[0, stair.rotation, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(stair.id);
      }}
    >
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          map={texture}
          side={THREE.DoubleSide}
          color={isSelected ? '#4488ff' : '#ffffff'}
        />
      </mesh>
    </group>
  );
};
