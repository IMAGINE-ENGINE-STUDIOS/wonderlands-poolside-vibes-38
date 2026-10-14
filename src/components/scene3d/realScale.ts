/**
 * Real-world sizing for dropped 3D models. Scene units are feet.
 *
 * Deterministic: a model's raw file units are ignored. Every object is scaled
 * to a fixed real-world target size picked by name keyword (then by asset
 * type), and that target is anchored to the live pool (`SiteRef`):
 *  - furniture/people/props → fixed human-scale sizes (a chair ≈ 1.7 ft wide, 3.5 ft tall)
 *  - trees/palms → proportional to the pool (16 ft wide pool → ~18 ft tree)
 *  - terrains → 6× the pool + deck envelope; skydomes → 14× (horizon illusion)
 *  - anything else → capped to the pool footprint
 * The same rules run in the Asset Manager and the Terrain Editor.
 */
import * as THREE from 'three';

/** Live pool/deck reference used to scale every model. */
export interface SiteRef { poolLength: number; poolWidth: number; deckWidth: number }

/** Target size in feet. `h` = height, `w` = largest footprint side (optional). */
type Target = { h: number; w?: number };

const KEYWORDS: Array<[RegExp, Target | ((s: SiteRef) => Target)]> = [
  [/bar ?stool|stool/i, { h: 3, w: 1.3 }],
  [/lounge|chaise|sunbed|daybed|lounger/i, { h: 2.6, w: 6.5 }],
  [/armchair|chair|seat/i, { h: 3.5, w: 1.8 }],
  [/sofa|couch|sectional/i, { h: 2.8, w: 7 }],
  [/table/i, { h: 2.5, w: 4 }],
  [/umbrella|parasol/i, { h: 8, w: 9 }],
  [/pergola|gazebo|cabana/i, { h: 10, w: 14 }],
  [/palm/i, (s) => ({ h: Math.max(14, s.poolWidth * 1.3) })],
  [/tree|oak|pine|birch|maple|cypress/i, (s) => ({ h: Math.max(12, s.poolWidth * 1.1) })],
  [/bush|shrub|hedge/i, { h: 3, w: 3.5 }],
  [/flower|plant|fern|grass/i, { h: 1.8 }],
  [/planter|pot|vase/i, { h: 2 }],
  [/grill|bbq|barbecue/i, { h: 3.8, w: 4.5 }],
  [/fire ?pit/i, { h: 1.5, w: 4 }],
  [/boulder/i, { h: 3 }],
  [/rock|stone/i, { h: 1.5 }],
  [/lamp|lantern/i, { h: 5 }],
  [/light/i, { h: 3 }],
  [/person|human|man|woman|girl|boy|character/i, { h: 5.8 }],
  [/dog/i, { h: 2 }],
  [/car|truck|suv/i, { h: 5, w: 15 }],
  [/house|building|villa|home/i, (s) => ({ h: 24, w: Math.max(40, s.poolLength * 1.6) })],
];

const BY_TYPE: Record<string, Target | ((s: SiteRef) => Target)> = {
  furniture: { h: 3, w: 3 },
  tree: (s) => ({ h: Math.max(12, s.poolWidth * 1.1) }),
  landscape: { h: 2.5 },
  object: { h: 3 },
  custom: { h: 3 },
};

const DEFAULT_SITE: SiteRef = { poolLength: 32, poolWidth: 16, deckWidth: 6 };

/** Returns the uniform scale factor to apply to the raw model. */
export function realWorldFit(name: string, type: string, size: THREE.Vector3, site?: SiteRef): number {
  const s = site ?? DEFAULT_SITE;
  const h = Math.max(size.y, 1e-4);
  const footprint = Math.max(size.x, size.z, 1e-4);
  const env = Math.max(s.poolLength, s.poolWidth) + 2 * s.deckWidth;

  // Ground and sky frame the whole site; skydome big enough to read as horizon.
  if (type === 'terrain') return (env * 6) / footprint;
  if (type === 'skydome') return (env * 14) / Math.max(footprint, h);

  const rule = KEYWORDS.find(([re]) => re.test(name))?.[1] ?? BY_TYPE[type] ?? BY_TYPE.custom;
  const t = typeof rule === 'function' ? rule(s) : rule;
  let k = t.h / h;
  // Footprint target wins when the model is wide/flat (e.g. a lounger).
  if (t.w) k = Math.min(k, t.w / footprint) * 0.5 + (t.h / h) * 0.5 > 0 ? Math.min(t.h / h, (t.w * 1.25) / footprint) : k;
  // Nothing (except houses) may outgrow the pool footprint.
  const poolMax = Math.max(s.poolLength, s.poolWidth);
  if (!/house|building|villa|home/i.test(name)) k = Math.min(k, (poolMax * 1.5) / footprint);
  return k;
}
