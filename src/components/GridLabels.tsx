import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface GridLabelsProps {
  gridSize?: number;
  cellSize?: number;
  visible?: boolean;
}

export function GridLabels({ 
  gridSize = 200, 
  cellSize = 5,
  visible = true 
}: GridLabelsProps) {
  if (!visible) return null;

  const numCells = Math.floor(gridSize / cellSize);
  const halfCells = Math.floor(numCells / 2);
  const labels: JSX.Element[] = [];

  // Generate labels for grid tiles
  for (let x = -halfCells; x <= halfCells; x++) {
    for (let z = -halfCells; z <= halfCells; z++) {
      // Calculate letter (A-Z, AA-AZ, BA-BZ, etc.)
      const absX = x + halfCells;
      const numLetters = Math.floor(absX / 26);
      const letterIndex = absX % 26;
      const prefix = numLetters > 0 ? String.fromCharCode(65 + numLetters - 1) : '';
      const letter = prefix + String.fromCharCode(65 + letterIndex);
      
      // Calculate number (1 to infinity)
      const number = z + halfCells + 1;
      
      const label = `${letter}${number}`;
      const posX = x * cellSize;
      const posZ = z * cellSize;
      
      labels.push(
        <Text
          key={`label-${x}-${z}`}
          position={[posX, 0.05, posZ]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.8}
          color="#888888"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {label}
        </Text>
      );
    }
  }

  return <>{labels}</>;
}
