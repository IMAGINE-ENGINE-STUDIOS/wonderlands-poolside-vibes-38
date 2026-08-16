/**
 * Exact polygon geometry system (XZ plane, world feet).
 *
 * Replaces the old "offset + convex-hull fallback" pipeline with real boolean
 * operations, so a triangular pool produces a deck cut in an exact triangle and
 * paver geometry can never enter the water area. Rings keep every vertex the
 * boolean solver produces (no simplification) and can be densified to add more
 * polygons for sharp/jigsaw shapes.
 */
import * as THREE from 'three';
import polygonClipping from 'polygon-clipping';

export type Pt = { x: number; z: number };
/** [outerRing, ...holeRings] — each ring is an open list of points (no repeat). */
export type Region = Pt[][];

type PCRing = [number, number][];
type PCPoly = PCRing[];

const EPS = 1e-6;

const dedupe = (ring: Pt[]): Pt[] => {
  const out: Pt[] = [];
  for (const p of ring) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(last.x - p.x, last.z - p.z) > 1e-5) out.push({ x: p.x, z: p.z });
  }
  while (out.length > 1) {
    const a = out[0];
    const b = out[out.length - 1];
    if (Math.hypot(a.x - b.x, a.z - b.z) <= 1e-5) out.pop();
    else break;
  }
  return out;
};

export const signedArea = (ring: Pt[]): number => {
  let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    s += (ring[j].x + ring[i].x) * (ring[i].z - ring[j].z);
  }
  return s / 2;
};

export const polygonArea = (ring: Pt[]): number => Math.abs(signedArea(ring));

const ccw = (ring: Pt[]): Pt[] => (signedArea(ring) < 0 ? [...ring].reverse() : ring);
const cw = (ring: Pt[]): Pt[] => (signedArea(ring) > 0 ? [...ring].reverse() : ring);

const toPC = (ring: Pt[]): PCRing => {
  const r = dedupe(ring).map((p) => [p.x, p.z] as [number, number]);
  if (r.length >= 3) r.push([r[0][0], r[0][1]]);
  return r;
};

const fromPC = (ring: PCRing): Pt[] => dedupe(ring.map(([x, z]) => ({ x, z })));

const asMulti = (result: unknown): Region[] => {
  const multi = (result as PCPoly[]) || [];
  return multi
    .map((poly) => poly.map(fromPC).filter((r) => r.length >= 3))
    .filter((region) => region.length > 0 && polygonArea(region[0]) > 1e-4) as Region[];
};

/** Ray-casting point-in-ring test. */
export function pointInRing(point: Pt, ring: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const { x: xi, z: zi } = ring[i];
    const { x: xj, z: zj } = ring[j];
    const hits =
      zi > point.z !== zj > point.z &&
      point.x < ((xj - xi) * (point.z - zi)) / (zj - zi || 1e-9) + xi;
    if (hits) inside = !inside;
  }
  return inside;
}

/** Point inside a region (outer ring, minus holes). */
export function pointInRegion(point: Pt, region: Region): boolean {
  if (!region.length || !pointInRing(point, region[0])) return false;
  for (let i = 1; i < region.length; i++) if (pointInRing(point, region[i])) return false;
  return true;
}

export const pointInRegions = (point: Pt, regions: Region[]): boolean =>
  regions.some((r) => pointInRegion(point, r));

/**
 * Robust polygon offset (dilate for `dist > 0`, erode for `dist < 0`).
 *
 * Built as a Minkowski-style boolean sweep: every edge contributes a quad and
 * every vertex a rounded cap, all unioned together. Unlike a miter offset this
 * never self-intersects on sharp corners (the exact case that used to fall back
 * to a convex hull and pave over the water).
 */
export function offsetPolygon(points: Pt[], dist: number, arcSegments = 6): Pt[][] {
  const base = dedupe(points);
  if (base.length < 3) return [];
  const d = Math.abs(dist);
  if (d < EPS) return [ccw(base)];

  const src = ccw(base);
  const pieces: PCPoly[] = [[toPC(src)]];

  for (let i = 0; i < src.length; i++) {
    const a = src[i];
    const b = src[(i + 1) % src.length];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    if (len < EPS) continue;
    // Outward normal for a CCW ring in XZ.
    const nx = (b.z - a.z) / len;
    const nz = -(b.x - a.x) / len;
    const s = dist > 0 ? 1 : -1;
    const quad: Pt[] = [
      a,
      b,
      { x: b.x + nx * d * s, z: b.z + nz * d * s },
      { x: a.x + nx * d * s, z: a.z + nz * d * s },
    ];
    pieces.push([toPC(ccw(quad))]);

    // Rounded cap at vertex b keeps convex corners closed.
    const cap: Pt[] = [];
    for (let k = 0; k <= arcSegments; k++) {
      const t = (k / arcSegments) * Math.PI * 2;
      cap.push({ x: b.x + Math.cos(t) * d, z: b.z + Math.sin(t) * d });
    }
    pieces.push([toPC(ccw(cap))]);
  }

  try {
    if (dist > 0) {
      const [first, ...rest] = pieces;
      const grown = asMulti(polygonClipping.union(first as never, ...(rest as never[])));
      return grown.map((region) => region[0]);
    }
    const [, ...rest] = pieces;
    const shrunk = asMulti(polygonClipping.difference(pieces[0] as never, ...(rest as never[])));
    return shrunk.map((region) => region[0]);
  } catch {
    return [src];
  }
}

/** Largest ring of an offset result (the practical single-boundary case). */
export function offsetPolygonSingle(points: Pt[], dist: number): Pt[] {
  const rings = offsetPolygon(points, dist);
  if (!rings.length) return dedupe(points);
  return rings.reduce((best, r) => (polygonArea(r) > polygonArea(best) ? r : best));
}

/** Boolean union of polygons → regions. */
export function unionRegions(polys: Pt[][]): Region[] {
  const valid = polys.map(dedupe).filter((p) => p.length >= 3);
  if (!valid.length) return [];
  if (valid.length === 1) return [[ccw(valid[0])]];
  try {
    const [first, ...rest] = valid.map((p) => [toPC(p)] as PCPoly);
    return asMulti(polygonClipping.union(first as never, ...(rest as never[])));
  } catch {
    return valid.map((p) => [ccw(p)]);
  }
}

/**
 * Exact `subject - holes`. Returns every resulting region with its own holes —
 * this is what produces a perfect triangular (or any n-gon) deck cutout.
 */
export function subtractRegions(subject: Pt[], holes: Pt[][]): Region[] {
  const subj = dedupe(subject);
  if (subj.length < 3) return [];
  const cutters = holes.map(dedupe).filter((h) => h.length >= 3);
  if (!cutters.length) return [[ccw(subj)]];
  try {
    const result = polygonClipping.difference(
      [toPC(subj)] as never,
      ...(cutters.map((h) => [toPC(h)] as PCPoly) as never[])
    );
    const regions = asMulti(result);
    return regions.length ? regions : [];
  } catch {
    return [[ccw(subj)]];
  }
}

/** Insert extra vertices so no edge is longer than `maxLen` (more polygons on demand). */
export function densifyRing(ring: Pt[], maxLen = 2): Pt[] {
  if (ring.length < 3 || maxLen <= 0) return ring;
  const out: Pt[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    out.push(a);
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    const steps = Math.floor(len / maxLen);
    for (let k = 1; k < steps; k++) {
      const t = k / steps;
      out.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
    }
  }
  return out;
}

export const densifyRegion = (region: Region, maxLen = 2): Region =>
  region.map((ring) => densifyRing(ring, maxLen));

/** Horizontal face for a region (outer ring + holes), exact triangulation, world UVs. */
export function regionFaceGeometry(region: Region, y: number, flipUp: boolean): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  if (!region.length || region[0].length < 3) return geom;

  const contour = ccw(region[0]).map((p) => new THREE.Vector2(p.x, p.z));
  const holes = region
    .slice(1)
    .filter((h) => h.length >= 3)
    .map((h) => cw(h).map((p) => new THREE.Vector2(p.x, p.z)));

  let faces: number[][] = [];
  try {
    faces = THREE.ShapeUtils.triangulateShape(contour, holes);
  } catch {
    faces = [];
  }
  if (!faces.length) return geom;

  const verts = [contour, ...holes].flat();
  const positions: number[] = [];
  const uvs: number[] = [];
  for (const v of verts) {
    positions.push(v.x, y, v.y);
    uvs.push(v.x, v.y); // 1ft x 1ft world UV grid
  }

  const indices: number[] = [];
  for (const f of faces) {
    // Up-facing (CCW in XZ needs reversed winding for +Y normals).
    if (flipUp) indices.push(f[0], f[1], f[2]);
    else indices.push(f[2], f[1], f[0]);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  return geom;
}

/** Vertical wall along a ring, UV mapped by perimeter distance. */
export function ringSkirtGeometry(
  ring: Pt[],
  topY: number,
  bottomY: number,
  outward: boolean
): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const pts = dedupe(ring);
  const n = pts.length;
  if (n < 3) return geom;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  let dist = 0;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    positions.push(p.x, topY, p.z, p.x, bottomY, p.z);
    uvs.push(dist, topY, dist, bottomY);
    const next = pts[(i + 1) % n];
    dist += Math.hypot(next.x - p.x, next.z - p.z);
  }

  for (let i = 0; i < n; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = ((i + 1) % n) * 2;
    const d = c + 1;
    if (outward) indices.push(a, c, b, b, c, d);
    else indices.push(a, b, c, b, d, c);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  return geom;
}

/** Merge flat position/uv/index geometries into one buffer (disposes inputs). */
export function mergeGeometries(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let offset = 0;

  for (const part of parts) {
    const pos = part.getAttribute('position');
    if (!pos) {
      part.dispose();
      continue;
    }
    const uv = part.getAttribute('uv');
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      uvs.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
    }
    const idx = part.getIndex();
    if (idx) for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + offset);
    else for (let i = 0; i < pos.count; i++) indices.push(i + offset);
    offset += pos.count;
    part.dispose();
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  geom.computeBoundingSphere();
  return geom;
}

/**
 * Build a solid slab (top + bottom faces + all vertical walls) for the exact
 * boolean region `subject - holes`. Any polygon complexity is preserved.
 */
export function buildSlabGeometry(params: {
  subject: Pt[];
  holes?: Pt[][];
  topY: number;
  bottomY: number;
  maxEdgeLength?: number;
}): THREE.BufferGeometry {
  const { subject, holes = [], topY, bottomY, maxEdgeLength = 2 } = params;
  const regions = subtractRegions(subject, holes);
  if (!regions.length) return new THREE.BufferGeometry();

  const parts: THREE.BufferGeometry[] = [];
  for (const raw of regions) {
    const region = densifyRegion(raw, maxEdgeLength);
    parts.push(regionFaceGeometry(region, topY, false));
    parts.push(regionFaceGeometry(region, bottomY, true));
    parts.push(ringSkirtGeometry(region[0], topY, bottomY, true));
    for (let i = 1; i < region.length; i++) {
      parts.push(ringSkirtGeometry(region[i], topY, bottomY, false));
    }
  }

  return mergeGeometries(parts);
}
