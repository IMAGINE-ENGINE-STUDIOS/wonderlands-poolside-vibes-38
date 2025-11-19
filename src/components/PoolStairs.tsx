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

    const { width, numSteps, stepHeight, stepDepth, shape } = stair;
    let currentHeight = 0;
    let currentDepth = 0;

    for (let i = 0; i < numSteps; i++) {
      const nextHeight = currentHeight - stepHeight;
      const nextDepth = currentDepth + stepDepth;

      // Create step geometry based on shape
      if (shape === 'rectangle' || shape === 'square') {
        createRectangularStep(
          vertices, indices, uvs, normals,
          currentDepth, nextDepth, currentHeight, nextHeight, width
        );
      } else if (shape === 'rounded') {
        createRoundedStep(
          vertices, indices, uvs, normals,
          currentDepth, nextDepth, currentHeight, nextHeight, width
        );
      }

      currentHeight = nextHeight;
      currentDepth = nextDepth;
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

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

function createRectangularStep(
  vertices: number[],
  indices: number[],
  uvs: number[],
  normals: number[],
  startDepth: number,
  endDepth: number,
  startHeight: number,
  endHeight: number,
  width: number
) {
  const vertexOffset = vertices.length / 3;
  const halfWidth = width / 2;

  // Tread (horizontal surface)
  vertices.push(-halfWidth, startHeight, startDepth);
  vertices.push(halfWidth, startHeight, startDepth);
  vertices.push(halfWidth, startHeight, endDepth);
  vertices.push(-halfWidth, startHeight, endDepth);

  uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
  for (let i = 0; i < 4; i++) normals.push(0, 1, 0);

  indices.push(
    vertexOffset, vertexOffset + 1, vertexOffset + 2,
    vertexOffset, vertexOffset + 2, vertexOffset + 3
  );

  // Riser (vertical surface)
  const riserOffset = vertexOffset + 4;
  vertices.push(-halfWidth, startHeight, endDepth);
  vertices.push(halfWidth, startHeight, endDepth);
  vertices.push(halfWidth, endHeight, endDepth);
  vertices.push(-halfWidth, endHeight, endDepth);

  uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
  for (let i = 0; i < 4; i++) normals.push(0, 0, -1);

  indices.push(
    riserOffset, riserOffset + 1, riserOffset + 2,
    riserOffset, riserOffset + 2, riserOffset + 3
  );

  // Side walls
  createSideWall(vertices, indices, uvs, normals, 
    -halfWidth, startDepth, endDepth, startHeight, endHeight);
  createSideWall(vertices, indices, uvs, normals,
    halfWidth, startDepth, endDepth, startHeight, endHeight);
}

function createRoundedStep(
  vertices: number[],
  indices: number[],
  uvs: number[],
  normals: number[],
  startDepth: number,
  endDepth: number,
  startHeight: number,
  endHeight: number,
  width: number
) {
  const segments = 16;
  const radius = width / 2;
  const vertexOffset = vertices.length / 3;

  // Create rounded front edge
  for (let i = 0; i <= segments; i++) {
    const angle = (Math.PI * i) / segments;
    const x = Math.cos(angle) * radius;
    const z = endDepth;
    
    vertices.push(x, startHeight, z);
    uvs.push(i / segments, 0);
    normals.push(0, 1, 0);
  }

  // Create back edge (straight)
  for (let i = 0; i <= segments; i++) {
    const angle = (Math.PI * i) / segments;
    const x = Math.cos(angle) * radius;
    
    vertices.push(x, startHeight, startDepth);
    uvs.push(i / segments, 1);
    normals.push(0, 1, 0);
  }

  // Create tread surface
  for (let i = 0; i < segments; i++) {
    indices.push(
      vertexOffset + i, vertexOffset + i + 1, vertexOffset + segments + 1 + i + 1,
      vertexOffset + i, vertexOffset + segments + 1 + i + 1, vertexOffset + segments + 1 + i
    );
  }

  // Create rounded riser
  const riserOffset = vertices.length / 3;
  for (let i = 0; i <= segments; i++) {
    const angle = (Math.PI * i) / segments;
    const x = Math.cos(angle) * radius;
    const nx = Math.cos(angle);
    const nz = -1;
    
    vertices.push(x, startHeight, endDepth);
    uvs.push(i / segments, 0);
    normals.push(nx, 0, nz);
    
    vertices.push(x, endHeight, endDepth);
    uvs.push(i / segments, 1);
    normals.push(nx, 0, nz);
  }

  for (let i = 0; i < segments; i++) {
    const base = riserOffset + i * 2;
    indices.push(base, base + 1, base + 3, base, base + 3, base + 2);
  }
}

function createSideWall(
  vertices: number[],
  indices: number[],
  uvs: number[],
  normals: number[],
  x: number,
  startZ: number,
  endZ: number,
  topY: number,
  bottomY: number
) {
  const offset = vertices.length / 3;
  const nx = x > 0 ? 1 : -1;

  vertices.push(x, topY, startZ);
  vertices.push(x, topY, endZ);
  vertices.push(x, bottomY, endZ);
  vertices.push(x, bottomY, startZ);

  uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
  for (let i = 0; i < 4; i++) normals.push(nx, 0, 0);

  if (x > 0) {
    indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
  } else {
    indices.push(offset, offset + 2, offset + 1, offset, offset + 3, offset + 2);
  }
}
