/**
 * Unit texture runtime — the ONE place a per-unit cut face
 * becomes a configured THREE texture: cached base loads,
 * the clone that carries the rotation/mirror AND the
 * depth layer + material logic on userData (the channel
 * lib/visual/paverCut3d.ts reads), tint application and
 * group disposal. Extracted from PaverCutVisualizer so the
 * Belgard tab and the studio deck builder share it —
 * no second copy of this logic exists.
 */
import * as THREE from "three";
import { appAssetUrl } from "@/lib/design/kitchenAssetUrl";
import { normalTextureFor } from "./normalMaps";
import { belgardMaterialLogicForUrl } from "./belgardMaterialLogic";
import { paverCutMesh } from "./paverCut3d";
import type { UnitTextureAssignment } from "./unitTextureLogic";

// Loaded base textures are shared across visualizers; every
// application clones before setting its own repeat.
const textureCache = new Map<string, Promise<THREE.Texture>>();

export function loadUnitTexture(url: string): Promise<THREE.Texture> {
  let p = textureCache.get(url);
  if (!p) {
    // Data ships root-absolute texture URLs; the files live under /app/.
    // Resolve through the one sanctioned helper (assetUrlGuard) at load.
    p = new THREE.TextureLoader().loadAsync(appAssetUrl(url) ?? url);
    // A failed load must not poison the cache forever (repair
    // build 2026-11-04, audit §B): the old code cached the
    // promise unconditionally, so one dead URL rejected every
    // later build that touched it, for the whole session.
    // Evict the rejection so the next build retries.
    p.catch(() => {
      if (textureCache.get(url) === p) textureCache.delete(url);
    });
    textureCache.set(url, p);
  }
  return p;
}

// Settle repaint (founder report, 2026-11-03): visualizers render on
// demand, and the depth-layer textures are attached while their images
// are still arriving — the first static frame therefore renders with a
// black placeholder normal map (slabs read dark) and nothing repaints
// until the camera moves. When the loader queue fully drains, every
// registered surface repaints once, so the first visible frame is
// already the corrected room-lit one.
const settleRenders = new Set<() => void>();
THREE.DefaultLoadingManager.onLoad = () => {
  settleRenders.forEach((render) => render());
};

/** Register a repaint for the moment the loader queue drains;
 *  returns the unregister function. */
export function onTexturesSettled(cb: () => void): () => void {
  settleRenders.add(cb);
  return () => {
    settleRenders.delete(cb);
  };
}

/** Anisotropy for unit textures (Texture Repair Phase 0, 2026-11-02):
 * refreshed from the live renderer's capabilities at scene setup,
 * capped at 16 so deck textures hold up at grazing angles instead of
 * smearing (THREE's default is 1). The initial 16 is safe before any
 * renderer exists — three.js clamps to the device max at upload. */
let unitTextureAnisotropy = 16;
export const setUnitTextureAnisotropy = (n: number) => {
  unitTextureAnisotropy = n;
};
export const getUnitTextureAnisotropy = () => unitTextureAnisotropy;

/** Configure a cloned variant texture for one unit: rotation
 *  is the pattern rotation plus the logic's quarter turn;
 *  mirror flips U. Depth + material logic ride userData. */
export function configureUnitTexture(
  base: THREE.Texture,
  assignment: UnitTextureAssignment,
  patternRotDeg: number,
  url?: string,
): THREE.Texture {
  const tex = base.clone();
  tex.anisotropy = unitTextureAnisotropy;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(assignment.mirror ? -1 : 1, 1);
  tex.center.set(0.5, 0.5);
  tex.rotation = THREE.MathUtils.degToRad(
    patternRotDeg + assignment.rotationDeg,
  );
  tex.colorSpace = THREE.SRGBColorSpace;
  // Full mip chain, stated explicitly: deck faces are seen at extreme
  // minification from the far framing, and a clone must never inherit
  // a filter state that skips mip levels.
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  // Depth layer: this variant's own pre-built normal map, registered to
  // the configured transform and carried on userData — the cut builders
  // (lib/visual/paverCut3d.ts) pick it up for the face material.
  if (url) {
    const n = normalTextureFor(tex, url);
    if (n) {
      n.anisotropy = unitTextureAnisotropy;
      n.generateMipmaps = true;
      n.minFilter = THREE.LinearMipmapLinearFilter;
      n.magFilter = THREE.LinearFilter;
      tex.userData.normalMap = n;
    }
    // Material logic: this material's own physical response, resolved
    // from its product + option in the texture URL.
    const logic = belgardMaterialLogicForUrl(url);
    if (logic) tex.userData.materialLogic = logic;
  }
  return tex;
}

export function applyUnitTint(
  group: THREE.Group,
  tint: [number, number, number],
): void {
  const mesh = paverCutMesh(group);
  if (!mesh) return;
  const m = mesh.material as THREE.Material | THREE.Material[];
  // Hexagonal prisms (Job G11) carry a material array [side, top,
  // bottom] — the tint belongs on the textured top face. Rectangular
  // cuts keep their single material, exactly as before.
  const target = Array.isArray(m)
    ? (m.find((x) => (x as THREE.MeshStandardMaterial).map) ?? m[1] ?? m[0])
    : m;
  if (target) {
    (target as THREE.MeshStandardMaterial).color.setRGB(
      tint[0],
      tint[1],
      tint[2],
    );
  }
}

/** Dispose a content group (single cut or deck); shared texture clones are
 * disposed once even when many deck units reference them. */
export function disposeUnitGroup(g: THREE.Group): void {
  const maps = new Set<THREE.Texture>();
  g.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh || (o as THREE.LineSegments).isLineSegments) {
      mesh.geometry?.dispose();
      const m = mesh.material as THREE.Material | THREE.Material[];
      (Array.isArray(m) ? m : [m]).forEach((x) => {
        const map = (x as THREE.MeshStandardMaterial).map;
        if (map) maps.add(map);
        x.dispose();
      });
    }
  });
  maps.forEach((t) => t.dispose());
}
