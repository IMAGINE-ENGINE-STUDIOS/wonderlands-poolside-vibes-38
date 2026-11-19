/**
 * Depth layer for 3D materials (founder, 2026-11-03): every material in
 * the 3D Design Studio gets a tangent-space normal map derived from its
 * own color texture — the Unreal / Blender height-to-normal workflow —
 * so stone joints, grout lines and surface grain catch real light.
 *
 * The maps are generated offline (tools/make_normal_maps.py) as tileable
 * WebP files next to a manifest (src/data/normalMaps.json): color URL ->
 * normal URL. Relief strength is baked per material category at
 * generation time, so the runtime cost is exactly one extra texture
 * fetch per material shown and one texture sample in the shader — no
 * extra geometry, no displacement, light for the browser.
 *
 * A material whose color URL has no manifest entry is left untouched.
 */
import * as THREE from "three";
import { appAssetUrl } from "@/lib/design/kitchenAssetUrl";
import manifest from "@/data/normalMaps.json";

const MANIFEST = manifest as Record<string, string>;

export const normalMapUrlFor = (colorUrl: string): string | undefined =>
  MANIFEST[colorUrl];

const baseCache = new Map<string, THREE.Texture>();
const baseReady = new Map<string, Promise<void>>();
const warnedMissing = new Set<string>();
function baseNormalTexture(colorUrl: string): THREE.Texture | undefined {
  const url = MANIFEST[colorUrl];
  if (!url) {
    // F2b (founder depth plan, 2026-11-15): a missing depth map
    // renders the surface flat — in dev that must be LOUD, not
    // silent. Name the face once per session so the gap is
    // found in development, and the coverage test
    // (normalMaps.coverage.test.ts) fails it in CI before it
    // can ship. Production stays silent by design.
    if (import.meta.env.DEV && !warnedMissing.has(colorUrl)) {
      warnedMissing.add(colorUrl);
      console.warn(
        `[depth] no depth map in the manifest for ${colorUrl} — this face renders flat. Generate its normal (tools/make_normal_maps.py, per-file) and add the manifest entry.`
      );
    }
    return undefined;
  }
  let t = baseCache.get(url);
  if (!t) {
    let markReady!: () => void;
    baseReady.set(
      url,
      new Promise<void>((resolve) => {
        markReady = resolve;
      })
    );
    // The error arm matters as much as the load arm: without it a
    // failed depth-map fetch leaves the ready promise unsettled
    // FOREVER, and every builder awaiting normalReadyFor hangs
    // with it — the wall (or deck) silently never renders. On
    // error the surface proceeds with its photo and no relief
    // rather than not rendering at all.
    t = new THREE.TextureLoader().load(appAssetUrl(url) ?? url, () => markReady(), undefined, () => markReady());
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    // Normal maps are linear data — never sRGB.
    t.colorSpace = THREE.NoColorSpace;
    baseCache.set(url, t);
  }
  return t;
}

/**
 * Resolves once the base normal texture for a color URL has actually
 * arrived (immediately when there is no manifest entry or the image is
 * already in). Builders that render on demand await this alongside the
 * color load, so a piece is only ever shown with its FULL material set —
 * photo + depth together. Without the wait, the first frame renders the
 * tile with a black placeholder normal map and it reads as a dark patch
 * until a later repaint (founder report, Belgard 3D tab, 2026-11-03).
 */
export function normalReadyFor(colorUrl: string): Promise<void> {
  const url = MANIFEST[colorUrl];
  if (!url) return Promise.resolve();
  baseNormalTexture(colorUrl);
  return baseReady.get(url) ?? Promise.resolve();
}

/**
 * A normal-map texture registered to a color texture: same repeat,
 * offset, center and rotation, so relief lands exactly on the photo.
 */
export function normalTextureFor(
  color: THREE.Texture,
  colorUrl: string
): THREE.Texture | undefined {
  const base = baseNormalTexture(colorUrl);
  if (!base) return undefined;
  const c = base.clone();
  c.needsUpdate = true;
  c.repeat.copy(color.repeat);
  c.offset.copy(color.offset);
  c.center.copy(color.center);
  c.rotation = color.rotation;
  c.wrapS = color.wrapS;
  c.wrapT = color.wrapT;
  return c;
}

/** Set a material's normalMap from its already-configured color texture. */
export function attachNormalMap(
  mat: THREE.MeshStandardMaterial | THREE.MeshPhongMaterial,
  color: THREE.Texture,
  colorUrl: string
): boolean {
  const n = normalTextureFor(color, colorUrl);
  if (!n) return false;
  mat.normalMap = n;
  mat.needsUpdate = true;
  return true;
}
