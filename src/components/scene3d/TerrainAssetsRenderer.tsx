import React, { Suspense } from 'react';
import { Model3DLoader } from './Model3DLoader';
import { TerrainAsset } from './TerrainEditor';

interface TerrainAssetsRendererProps {
  assets: TerrainAsset[];
  onAssetClick?: (id: string) => void;
  selectedAssetId?: string | null;
}

export function TerrainAssetsRenderer({ 
  assets, 
  onAssetClick, 
  selectedAssetId 
}: TerrainAssetsRendererProps) {
  const visibleAssets = assets.filter(asset => asset.visible);

  return (
    <group name="terrain-assets">
      {visibleAssets.map(asset => (
        <Suspense key={asset.id} fallback={null}>
          <group
            position={asset.position}
            rotation={asset.rotation}
            onClick={(e) => {
              e.stopPropagation();
              onAssetClick?.(asset.id);
            }}
          >
            <Model3DLoader
              url={asset.url}
              format={asset.format}
              scale={asset.scale}
              onLoad={() => console.log(`Loaded terrain asset: ${asset.name}`)}
              onError={(error) => console.error(`Failed to load ${asset.name}:`, error)}
            />
          </group>
        </Suspense>
      ))}
    </group>
  );
}

export default TerrainAssetsRenderer;
