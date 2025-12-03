import { useMemo, useCallback } from 'react';
import { Point } from './types';
import { PoolStairConfig, PoolChairConfig, ContourSeatingConfig } from './poolAssetTypes';
import { DraggablePoolStair } from './DraggablePoolStair';
import { DraggablePoolChair } from './DraggablePoolChair';
import { ContourSeating } from './ContourSeating';
import { generateCurvedPoolPoints, normalize2DTo3D } from '@/utils/curveUtils';

interface PoolAssetsRendererProps {
  poolPoints: Point[];
  stairs: PoolStairConfig[];
  onStairsChange: (stairs: PoolStairConfig[]) => void;
  chairs: PoolChairConfig[];
  onChairsChange: (chairs: PoolChairConfig[]) => void;
  contourSeating: ContourSeatingConfig[];
  onContourSeatingChange: (seating: ContourSeatingConfig[]) => void;
  selectedAssetId: string | null;
  onSelectAsset: (id: string | null) => void;
  poolDepth: number;
  getFloorDepthAt?: (x: number, z: number) => number;
}

export function PoolAssetsRenderer({
  poolPoints,
  stairs,
  onStairsChange,
  chairs,
  onChairsChange,
  contourSeating,
  onContourSeatingChange,
  selectedAssetId,
  onSelectAsset,
  poolDepth,
  getFloorDepthAt = () => poolDepth
}: PoolAssetsRendererProps) {
  // Generate pool perimeter for asset positioning
  const poolPerimeter = useMemo(() => {
    if (poolPoints.length < 3) return [];

    const curvedPoints = generateCurvedPoolPoints(
      poolPoints.map(p => ({ x: p.x, y: p.y })),
      30,
      0.3
    );
    
    return normalize2DTo3D(curvedPoints);
  }, [poolPoints]);

  // Handle stair position change
  const handleStairPositionChange = useCallback((stairId: string, wallPosition: number) => {
    onStairsChange(stairs.map(s =>
      s.id === stairId ? { ...s, wallPosition } : s
    ));
  }, [stairs, onStairsChange]);

  // Handle chair position change
  const handleChairPositionChange = useCallback((
    chairId: string, 
    wallPosition: number, 
    floorPosition?: { x: number; z: number }
  ) => {
    onChairsChange(chairs.map(c =>
      c.id === chairId ? { ...c, wallPosition, floorPosition: floorPosition || c.floorPosition } : c
    ));
  }, [chairs, onChairsChange]);

  // Handle contour seating position change
  const handleContourPositionChange = useCallback((
    id: string,
    startPosition: number,
    endPosition: number
  ) => {
    onContourSeatingChange(contourSeating.map(s =>
      s.id === id ? { ...s, startPosition, endPosition } : s
    ));
  }, [contourSeating, onContourSeatingChange]);

  if (poolPerimeter.length === 0) return null;

  return (
    <group>
      {/* Render Stairs */}
      {stairs.map(stair => (
        <DraggablePoolStair
          key={stair.id}
          stair={stair}
          poolPerimeter={poolPerimeter}
          onPositionChange={handleStairPositionChange}
          isSelected={stair.id === selectedAssetId}
          onSelect={onSelectAsset}
          poolDepth={poolDepth}
        />
      ))}

      {/* Render Chairs/Seating */}
      {chairs.map(chair => (
        <DraggablePoolChair
          key={chair.id}
          chair={chair}
          poolPerimeter={poolPerimeter}
          onPositionChange={handleChairPositionChange}
          isSelected={chair.id === selectedAssetId}
          onSelect={onSelectAsset}
          getFloorDepthAt={getFloorDepthAt}
        />
      ))}

      {/* Render Contour Seating */}
      {contourSeating.map(seating => (
        <ContourSeating
          key={seating.id}
          seating={seating}
          poolPerimeter={poolPerimeter}
          onPositionChange={handleContourPositionChange}
          isSelected={seating.id === selectedAssetId}
          onSelect={onSelectAsset}
          getFloorDepthAt={getFloorDepthAt}
        />
      ))}
    </group>
  );
}
