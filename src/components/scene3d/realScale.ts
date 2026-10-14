/**
 * Real-world sizing for dropped 3D models. Scene units are feet.
 *
 * Most Sketchfab / glTF files are authored in metres, so we first try a
 * metres→feet conversion. If that gives an implausible height for what the
 * object is (by name keyword, then by asset type), we scale it to a typical
 * real height instead. The live pool + deck size (`SiteRef`) is then used as
 * the reference: trees are capped relative to the pool, furniture to the deck
 * width, and terrains/skydomes are sized to frame the whole pool + deck.
 */
import * as THREE from 'three';

const M_TO_FT = 3.28084;

/** Live pool/deck reference used to scale every model. */
export interface SiteRef { poolLength: number; poolWidth: number; deckWidth: number }

/** [min, typical, max] height in feet */
const KEYWORDS: Array<[RegExp, [number, number, number]]> = [
  [/bar ?stool|stool/i, [2, 2.6, 3.6]],
  [/chair|seat|armchair/i, [2.3, 3, 4]],
  [/lounge|chaise|sunbed|daybed/i, [1, 2.2, 3.5]],
  [/sofa|couch|sectional/i, [2, 2.8, 3.5]],
  [/table/i, [1.2, 2.5, 3.6]],
  [/umbrella|parasol/i, [6.5, 8, 10]],
  [/pergola|gazebo|cabana/i, [8, 10, 14]],
  [/palm/i, [10, 18, 40]],
  [/tree/i, [8, 16, 50]],
  [/bush|shrub|plant|flower/i, [0.8, 2.5, 6]],
  [/planter|pot|vase/i, [1, 2, 4]],
  [/grill|bbq|barbecue/i, [3, 3.8, 4.5]],
  [/fire ?pit/i, [1, 1.5, 2.5]],
  [/rock|stone|boulder/i, [0.5, 2, 6]],
  [/lamp|lantern|light/i, [1, 5, 12]],
  [/person|human|man|woman/i, [5, 5.8, 6.5]],
  [/car|truck|suv/i, [4.5, 5, 7]],
  [/house|building|villa/i, [10, 20, 40]],
];

const BY_TYPE: Record<string, [number, number, number]> = {
  furniture: [1.5, 3, 5],
  object: [0.5, 3, 12],
  tree: [6, 16, 50],
  landscape: [0.5, 2, 8],
  custom: [0.5, 3, 20],
};

const FURNITURE_RE = /stool|chair|seat|lounge|chaise|sunbed|daybed|sofa|couch|sectional|table|grill|bbq|planter|pot/i;

/** Returns the uniform scale factor to apply to the raw model. */
export function realWorldFit(name: string, type: string, size: THREE.Vector3, site?: SiteRef): number {
  const h = Math.max(size.y, 1e-4);
  const footprint = Math.max(size.x, size.z, 1e-4);

  // Ground / sky: frame the full pool + deck envelope.
  if (type === 'terrain' || type === 'skydome') {
    const env = site ? Math.max(site.poolLength, site.poolWidth) + 2 * site.deckWidth : 50;
    const target = env * (type === 'skydome' ? 6 : 4);
    return target / footprint;
  }

  const range = KEYWORDS.find(([re]) => re.test(name))?.[1] ?? BY_TYPE[type] ?? BY_TYPE.custom;
  const [min, typical, max] = range;
  // Files come in metres, feet, inches, centimetres or millimetres. Try each
  // unit (metres first, the glTF standard) and keep the first that gives a
  // plausible height; otherwise force the typical real height.
  const UNITS = [M_TO_FT, 1, 1 / 12, M_TO_FT / 100, M_TO_FT / 1000];
  const unit = UNITS.find((u) => h * u >= min && h * u <= max);
  let k = unit ?? typical / h;
  if (!site) return k;

  const poolMax = Math.max(site.poolLength, site.poolWidth);
  // Vegetation: height ≤ 1.1× pool length, canopy ≤ 0.6× pool width.
  if (type === 'tree' || /palm|tree/i.test(name)) {
    k = Math.min(k, (poolMax * 1.1) / h, (site.poolWidth * 0.6 + 4) / footprint);
  } else if (type === 'furniture' || FURNITURE_RE.test(name)) {
    // Furniture must fit on the deck band.
    k = Math.min(k, Math.max(3, site.deckWidth * 1.2) / footprint);
  } else {
    // Any other object: never larger than the pool itself.
    k = Math.min(k, poolMax / footprint);
  }
  return k;
}
