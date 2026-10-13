/**
 * Real-world sizing for dropped 3D models. Scene units are feet.
 *
 * Most Sketchfab / glTF files are authored in metres, so we first try a
 * metres→feet conversion. If that gives an implausible height for what the
 * object is (by name keyword, then by asset type), we scale it to a typical
 * real height instead.
 */
import * as THREE from 'three';

const M_TO_FT = 3.28084;

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

/** Returns the uniform scale factor to apply to the raw model. */
export function realWorldFit(name: string, type: string, size: THREE.Vector3): number {
  const h = Math.max(size.y, 1e-4);
  const range = KEYWORDS.find(([re]) => re.test(name))?.[1] ?? BY_TYPE[type] ?? BY_TYPE.custom;
  const [min, typical, max] = range;
  const asMetres = h * M_TO_FT;
  if (asMetres >= min && asMetres <= max) return M_TO_FT;
  if (h >= min && h <= max) return 1; // already in feet
  return typical / h;
}
