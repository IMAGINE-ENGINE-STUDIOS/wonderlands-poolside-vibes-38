import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { Model3DLoader } from './Model3DLoader';
import { TerrainAsset } from './TerrainEditor';

export type GizmoMode = 'translate' | 'rotate' | 'scale';

export interface GizmoSnapSettings {
  enabled: boolean;
  /** Translation snap in feet */
  gridSnap: number;
  /** Rotation snap in degrees */
  rotationSnapDeg: number;
  /** Scale snap increment */
  scaleSnap: number;
  /** Keep the object resting on the ground plane while moving */
  snapToGround: boolean;
}

export const DEFAULT_GIZMO_SNAP: GizmoSnapSettings = {
  enabled: true,
  gridSnap: 1,
  rotationSnapDeg: 15,
  scaleSnap: 0.1,
  snapToGround: true,
};

interface TerrainAssetsRendererProps {
  assets: TerrainAsset[];
  onAssetClick?: (id: string) => void;
  selectedAssetId?: string | null;
  /** Enables the transform gizmo on the selected asset */
  gizmoEnabled?: boolean;
  gizmoMode?: GizmoMode;
  snap?: GizmoSnapSettings;
  onAssetTransform?: (id: string, next: Partial<TerrainAsset>) => void;
}

function SelectedAssetGizmo({
  target,
  mode,
  snap,
  onCommit,
}: {
  target: THREE.Object3D;
  mode: GizmoMode;
  snap: GizmoSnapSettings;
  onCommit: (next: Partial<TerrainAsset>) => void;
}) {
  const commit = () => {
    if (snap.enabled && snap.snapToGround && mode === 'translate') {
      target.position.y = Math.max(0, target.position.y);
    }
    const s = target.scale;
    onCommit({
      position: [target.position.x, target.position.y, target.position.z],
      rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
      scale: [s.x, s.y, s.z],
    });
  };

  return (
    <TransformControls
      object={target}
      mode={mode}
      size={0.9}
      translationSnap={snap.enabled ? snap.gridSnap : null}
      rotationSnap={snap.enabled ? (snap.rotationSnapDeg * Math.PI) / 180 : null}
      scaleSnap={snap.enabled ? snap.scaleSnap : null}
      onMouseUp={commit}
    />
  );
}

function TerrainAssetItem({
  asset,
  isSelected,
  onAssetClick,
  registerRef,
}: {
  asset: TerrainAsset;
  isSelected: boolean;
  onAssetClick?: (id: string) => void;
  registerRef: (id: string, obj: THREE.Group | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    registerRef(asset.id, groupRef.current);
    return () => registerRef(asset.id, null);
  }, [asset.id, registerRef]);

  const scaleTriplet = useMemo<[number, number, number]>(
    () => (Array.isArray(asset.scale)
      ? [asset.scale[0], asset.scale[1], asset.scale[2]]
      : [asset.scale, asset.scale, asset.scale]),
    [asset.scale]
  );

  return (
    <group
      ref={groupRef}
      position={asset.position}
      rotation={asset.rotation}
      scale={scaleTriplet}
      onClick={(e) => {
        e.stopPropagation();
        onAssetClick?.(asset.id);
      }}
    >
      <Suspense fallback={null}>
        <Model3DLoader
          url={asset.url}
          format={asset.format}
          scale={1}
          onError={(error) => console.error(`Failed to load ${asset.name}:`, error)}
        />
      </Suspense>
      {/* Selection footprint ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.1, 1.3, 48]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export function TerrainAssetsRenderer({
  assets,
  onAssetClick,
  selectedAssetId,
  gizmoEnabled = true,
  gizmoMode = 'translate',
  snap = DEFAULT_GIZMO_SNAP,
  onAssetTransform,
}: TerrainAssetsRendererProps) {
  const refs = useRef(new Map<string, THREE.Group>());
  const [, forceRender] = React.useReducer((n: number) => n + 1, 0);

  const registerRef = React.useCallback((id: string, obj: THREE.Group | null) => {
    if (obj) refs.current.set(id, obj);
    else refs.current.delete(id);
    forceRender();
  }, [forceRender]);

  const visibleAssets = useMemo(() => assets.filter(a => a.visible), [assets]);
  const selectedTarget = selectedAssetId ? refs.current.get(selectedAssetId) : undefined;
  const selectedAsset = visibleAssets.find(a => a.id === selectedAssetId);

  return (
    <group name="terrain-assets">
      {visibleAssets.map(asset => (
        <TerrainAssetItem
          key={asset.id}
          asset={asset}
          isSelected={asset.id === selectedAssetId}
          onAssetClick={onAssetClick}
          registerRef={registerRef}
        />
      ))}

      {gizmoEnabled && selectedTarget && selectedAsset && onAssetTransform && (
        <SelectedAssetGizmo
          key={selectedAsset.id + gizmoMode}
          target={selectedTarget}
          mode={gizmoMode}
          snap={snap}
          onCommit={(next) => onAssetTransform(selectedAsset.id, next)}
        />
      )}
    </group>
  );
}

export default TerrainAssetsRenderer;
