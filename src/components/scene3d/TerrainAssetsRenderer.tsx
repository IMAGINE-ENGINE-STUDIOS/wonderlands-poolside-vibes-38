import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Model3DLoader } from './Model3DLoader';
import { TerrainAsset } from './TerrainEditor';
import { realWorldFit, type SiteRef } from './realScale';

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
  /** Live pool/deck size used as the scale reference for every model. */
  siteRef?: SiteRef;
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
  onAssetClick,
  registerRef,
  siteRef,
}: {
  asset: TerrainAsset;
  onAssetClick?: (id: string) => void;
  registerRef: (id: string, obj: THREE.Group | null) => void;
  siteRef?: SiteRef;
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
        <FitToRealSize asset={asset} siteRef={siteRef}>
          <Model3DLoader
            url={asset.url}
            format={asset.format}
            scale={1}
            onError={(error) => console.error(`Failed to load ${asset.name}:`, error)}
          />
        </FitToRealSize>
      </Suspense>
    </group>
  );
}

/**
 * Mounts only after the model has loaded (inside Suspense), measures its
 * bounding box and rescales it to plausible real-world feet, resting on y=0.
 * Meshes are tagged `walkable` so the walkthrough can collide with the
 * model's real triangles instead of a box.
 */
function FitToRealSize({ asset, siteRef, children }: { asset: TerrainAsset; siteRef?: SiteRef; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const gl = useThree((st) => st.gl);
  React.useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    let tries = 0;
    const apply = () => {
      g.scale.setScalar(1);
      g.position.set(0, 0, 0);
      g.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(g, true);
      if (box.isEmpty()) { if (tries++ < 20) requestAnimationFrame(apply); return; }
      box.applyMatrix4(g.matrixWorld.clone().invert());
      const size = box.getSize(new THREE.Vector3());
      const min = box.min;
      const isEnv = asset.type === 'terrain' || asset.type === 'skydome';
      // Environments are always framed to the pool + deck; objects honour autoFit.
      if (isEnv || asset.autoFit !== false) {
        const k = realWorldFit(asset.name, asset.type, size, siteRef);
        g.scale.setScalar(k);
        // Center the pivot on X/Z: many models are authored far from their origin,
        // which made them land off-target or appear the wrong size/position.
        const cx = (box.min.x + box.max.x) / 2;
        const cz = (box.min.z + box.max.z) / 2;
        g.position.x = -cx * k;
        g.position.z = -cz * k;
        g.position.y = asset.type === 'skydome'
          ? -(min.y + size.y / 2) * k * 0.2
          // Terrains sit just under the deck so hills never rise over the pool.
          : asset.type === 'terrain' ? -(min.y + size.y * 0.35) * k - 0.4 : -min.y * k;
      }
      // Sharp textures at grazing angles (terrains looked low-res).
      const aniso = gl.capabilities.getMaxAnisotropy();
      g.traverse((o) => {
        const mats = ((o as THREE.Mesh).material ? ([] as THREE.Material[]).concat((o as THREE.Mesh).material as any) : []);
        mats.forEach((m: any) => {
          ['map', 'normalMap', 'roughnessMap', 'aoMap'].forEach((key) => {
            const t = m[key] as THREE.Texture | undefined;
            if (t) {
              t.anisotropy = aniso;
              t.minFilter = THREE.LinearMipmapLinearFilter;
              t.generateMipmaps = true;
              t.needsUpdate = true;
            }
          });
          // Terrains never cover the pool: cut out the pool + deck footprint
          // (rounded rectangle, soft margin) in world space.
          if (asset.type === 'terrain' && siteRef && m.userData.poolCut !== (siteRef.outlineKey ?? 'base')) {
            m.userData.poolCut = siteRef.outlineKey ?? 'base';
            // Exact pool+deck footprint (world XZ, centred), max 96 points;
            // falls back to the rounded envelope when no outline is known.
            // Every ring (main pool + each extra pool/spa) becomes edge segments;
            // even-odd over all of them cuts one hole per water body.
            const rings = [siteRef.outline || [], ...(siteRef.holes || [])].filter((r: any[]) => r.length >= 3);
            const per = Math.max(8, Math.floor(192 / Math.max(1, rings.length)));
            const segsArr: THREE.Vector4[] = [];
            rings.forEach((r: { x: number; z: number }[]) => {
              const step = Math.max(1, Math.ceil(r.length / per));
              const pts = r.filter((_, i) => i % step === 0);
              pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; if (segsArr.length < 192) segsArr.push(new THREE.Vector4(p.x, p.z, q.x, q.z)); });
            });
            const segN = segsArr.length;
            const arr = Array.from({ length: 192 }, (_, i) => segsArr[i] ?? new THREE.Vector4());
            const half = new THREE.Vector2(
              siteRef.poolWidth / 2 + siteRef.deckWidth + 1,
              siteRef.poolLength / 2 + siteRef.deckWidth + 1,
            );
            m.onBeforeCompile = (sh: any) => {
              sh.uniforms.uPoolHalf = { value: half };
              sh.uniforms.uSeg = { value: arr };
              sh.uniforms.uSegN = { value: segN };
              sh.vertexShader = 'varying vec3 vPoolW;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvPoolW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
              sh.fragmentShader = 'uniform vec2 uPoolHalf;\nuniform vec4 uSeg[192];\nuniform int uSegN;\nvarying vec3 vPoolW;\n' + sh.fragmentShader.replace('void main() {', `void main() {
  if (vPoolW.y > -6.0) {
    if (uSegN >= 3) {
      bool inside = false; vec2 p = vPoolW.xz;
      for (int i = 0; i < 192; i++) {
        if (i >= uSegN) break;
        vec2 a = uSeg[i].xy; vec2 b = uSeg[i].zw;
        if (((a.y > p.y) != (b.y > p.y)) && (p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y + 1e-6) + a.x)) inside = !inside;
      }
      if (inside) discard;
    } else {
      float hx = max(uPoolHalf.x, uPoolHalf.y); vec2 q = abs(vPoolW.xz) - vec2(hx) + 2.0;
      if (length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 2.0 < 0.0) discard;
    }
  }`);
            };
            m.needsUpdate = true;
          }
        });
      });
      g.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.userData.walkable = true; });
    };
    apply();
  }, [asset.url, asset.name, asset.type, asset.autoFit, siteRef?.poolLength, siteRef?.poolWidth, siteRef?.deckWidth, siteRef?.outlineKey]);
  return <group ref={ref}>{children}</group>;
}

export function TerrainAssetsRenderer({
  assets,
  onAssetClick,
  selectedAssetId,
  gizmoEnabled = true,
  gizmoMode = 'translate',
  snap = DEFAULT_GIZMO_SNAP,
  onAssetTransform,
  siteRef,
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
          onAssetClick={onAssetClick}
          registerRef={registerRef}
          siteRef={siteRef}
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
