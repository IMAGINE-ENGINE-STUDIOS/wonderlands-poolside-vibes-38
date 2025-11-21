import { useState } from 'react';
import { Package, X } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import * as THREE from 'three';

interface Asset3D {
  id: string;
  name: string;
  type: 'cube' | 'sphere' | 'cylinder';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
}

interface AssetManagerProps {
  onAddAsset: (asset: Asset3D) => void;
  assets: Asset3D[];
  onRemoveAsset: (id: string) => void;
}

export function AssetManager({ onAddAsset, assets, onRemoveAsset }: AssetManagerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const addCube = () => {
    const newAsset: Asset3D = {
      id: `cube-${Date.now()}`,
      name: 'Cube',
      type: 'cube',
      position: [0, 1, 0], // Placed 1ft above floor
      rotation: [0, 0, 0],
      scale: [2, 2, 2], // 2ft cube
      color: '#8b5a3c'
    };
    onAddAsset(newAsset);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 right-4 z-10 bg-background/80 hover:bg-background p-3 rounded-full shadow-lg transition-colors"
        title="Asset Manager"
      >
        <Package className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-10 bg-background/95 backdrop-blur-sm rounded-lg shadow-xl w-72 max-h-96">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Package className="w-4 h-4" />
          Asset Manager
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-64">
        <div className="p-3 space-y-3">
          {/* Add Assets Section */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Add 3D Objects</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addCube}
            >
              + Add Cube
            </Button>
          </div>

          {/* Current Assets */}
          {assets.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Placed Assets ({assets.length})</p>
              <div className="space-y-1">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-2 rounded bg-muted/50 hover:bg-muted"
                  >
                    <span className="text-xs">{asset.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onRemoveAsset(asset.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assets.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No assets placed yet. Click "Add Cube" to start.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Component to render 3D assets in the scene
export function Asset3DRenderer({ asset }: { asset: Asset3D }) {
  const geometry = asset.type === 'cube' 
    ? new THREE.BoxGeometry(asset.scale[0], asset.scale[1], asset.scale[2])
    : asset.type === 'sphere'
    ? new THREE.SphereGeometry(asset.scale[0] / 2, 32, 32)
    : new THREE.CylinderGeometry(asset.scale[0] / 2, asset.scale[0] / 2, asset.scale[1], 32);

  return (
    <mesh
      geometry={geometry}
      position={asset.position}
      rotation={asset.rotation}
    >
      <meshStandardMaterial color={asset.color} />
    </mesh>
  );
}
