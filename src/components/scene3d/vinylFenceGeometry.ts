/**
 * Vinyl privacy fence construction (AFC-373 style 6' x 8' panel system).
 * © Imagine Engine Studios Corp.
 *
 * Real install: 5"x5" posts every 8 ft (shared between neighbouring panels),
 * 1-3/4" x 5-1/2" notched pocket rails top and bottom, 7/8" x 6" tongue &
 * groove pickets packed rail to rail, and 5" external pyramid caps.
 * Rails and pickets run INTO the post pockets (no daylight at the posts), the
 * bottom rail sits ~2" above grade and posts are seated at grade — so the
 * fence never floats and there are no stray lines above/below the panels.
 * Units: feet. Pure math, no three.js, so it is easy to test.
 */
export interface VXZ { x: number; z: number }
export interface VBox { x: number; y: number; z: number; sx: number; sy: number; sz: number; ry?: number }

export const VINYL = {
  panelWidth: 8,          // ft, post centre to post centre
  post: 5 / 12,           // 5" square post
  railH: 5.5 / 12,        // rail face (5-1/2")
  railD: 1.75 / 12,       // rail depth (1-3/4")
  picketW: 0.5,           // 6" picket
  picketD: 0.875 / 12,    // 7/8" picket
  groundGap: 2 / 12,      // bottom rail clearance above grade
  postAbove: 2 / 12,      // post rises 2" above the top rail
  capH: 3 / 12,           // pyramid cap height
  capW: 5.5 / 12,         // external cap overhangs the post slightly
  pocket: 0.75 / 12,      // depth rails/pickets sink into the post
} as const;

/** Posts along an open polyline: every vertex plus every ≤8 ft in between (last span trimmed). */
export function vinylPosts(pts: VXZ[]): VXZ[] {
  const out: VXZ[] = [];
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k], b = pts[k + 1];
    const L = Math.hypot(b.x - a.x, b.z - a.z);
    if (L < 1e-6) continue;
    const n = Math.max(1, Math.ceil(L / VINYL.panelWidth - 1e-6));
    if (k === 0) out.push(a);
    for (let s = 1; s <= n; s++) {
      const t = Math.min(1, (s * VINYL.panelWidth) / L);
      out.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
    }
  }
  return out;
}

export interface VinylParts { posts: VBox[]; caps: VBox[]; rails: VBox[]; pickets: VBox[] }

/** Full assembly for a fence of overall height H (top of top rail = H). */
export function buildVinylFence(pts: VXZ[], H: number): VinylParts {
  const V = VINYL;
  const posts = vinylPosts(pts);
  const postH = H + V.postAbove;
  const out: VinylParts = { posts: [], caps: [], rails: [], pickets: [] };
  for (const p of posts) {
    out.posts.push({ x: p.x, y: postH / 2, z: p.z, sx: V.post, sy: postH, sz: V.post });
    out.caps.push({ x: p.x, y: postH + V.capH / 2, z: p.z, sx: V.capW, sy: V.capH, sz: V.capW });
  }
  const botY = V.groundGap + V.railH / 2;
  const topY = H - V.railH / 2;
  const fieldLo = V.groundGap + V.railH, fieldHi = H - V.railH;
  const fieldH = Math.max(0.1, fieldHi - fieldLo);
  for (let k = 0; k < posts.length - 1; k++) {
    const a = posts[k], b = posts[k + 1];
    const L = Math.hypot(b.x - a.x, b.z - a.z);
    if (L < V.post) continue;
    const ux = (b.x - a.x) / L, uz = (b.z - a.z) / L, ry = -Math.atan2(uz, ux);
    const cx = (a.x + b.x) / 2, cz = (a.z + b.z) / 2;
    // Clear span between post faces + pocket depth on each side.
    const span = L - V.post + 2 * V.pocket;
    out.rails.push({ x: cx, y: botY, z: cz, sx: span, sy: V.railH, sz: V.railD, ry });
    out.rails.push({ x: cx, y: topY, z: cz, sx: span, sy: V.railH, sz: V.railD, ry });
    // Pickets packed edge to edge; last one trimmed so the field fills exactly.
    const n = Math.ceil(span / V.picketW - 1e-6);
    const start = -span / 2;
    for (let s = 0; s < n; s++) {
      const w = Math.min(V.picketW, span - s * V.picketW);
      if (w <= 0.005) break;
      const off = start + s * V.picketW + w / 2;
      // Alternate a hair of depth so each T&G seam reads as a groove line.
      const d = s % 2 ? V.picketD : V.picketD * 0.92;
      out.pickets.push({ x: cx + ux * off, y: (fieldLo + fieldHi) / 2, z: cz + uz * off, sx: w, sy: fieldH + 0.04, sz: d, ry });
    }
  }
  return out;
}
