/**
 * Screen enclosure structure — procedural framing for the modern black
 * Florida pool cage (reference: Lennar architectural cages, FL product
 * approval schematic: 8 ft post spacing, 3:12 hip/mansard roof, chair rail,
 * eave header, corner knee braces, purlin grid).
 * Pure math: returns box instances (feet) consumed by ScreenEnclosure3D.
 *
 * © Imagine Engine Studios Corp — Wonderlands 3D Studio.
 */
import { mitredOffsetRing } from "@/utils/polygonGeometry";
import { beamBox, type BoxInstance } from "@/components/scene3d/InstancedBoxes";

export type XZ = { x: number; z: number };
export type XYZ = { x: number; y: number; z: number };

/** Structural constants (feet). */
export const SCREEN_SPEC = {
  postSpacing: 8,
  cornerPost: 0.25, // 3"x3"
  postW: 0.17, postD: 0.33, // 2"x4"
  chairRailY: 3.2,
  eaveH: 0.6, eaveT: 0.17, // 2"x7" header
  rafter: 0.17,
  purlinSpacing: 4,
  roofPitch: 3 / 12,
} as const;

const segs = (pts: XZ[]) => pts.map((a, i) => [a, pts[(i + 1) % pts.length]] as [XZ, XZ]);

/** Box from any 3D point a to b (sloped members: rafters, braces). */
export function strut(a: XYZ, b: XYZ, w: number, h = w): BoxInstance {
  const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, horiz = Math.hypot(dx, dz);
  return {
    x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2,
    sx: Math.max(1e-3, Math.hypot(horiz, dy)), sy: h, sz: w,
    ry: -Math.atan2(dz, dx), rz: Math.atan2(dy, horiz),
  };
}

export interface ScreenFrame {
  posts: BoxInstance[]; beams: BoxInstance[]; rafters: BoxInstance[]; purlins: BoxInstance[];
  walls: BoxInstance[]; top: XZ[]; base: XZ[]; rise: number; slopes: number[];
  stats: { posts: number; eaveFt: number; rafters: number; screenSqft: number };
}

/** Builds every structural member of a closed cage outline at wall height H. */
export function buildScreenFrame(pts: XZ[], H: number, mansard: boolean, kickplate = false): ScreenFrame {
  const S = SCREEN_SPEC;
  const posts: BoxInstance[] = [], beams: BoxInstance[] = [], rafters: BoxInstance[] = [], purlins: BoxInstance[] = [], walls: BoxInstance[] = [];
  let postCount = 0, eaveFt = 0, screenSqft = 0;

  // Walls: corner posts, 2x4 intermediates every 8 ft, base, chair rail, eave header, mesh.
  const wallPosts: { p: XZ; seg: number; t: number }[] = [];
  segs(pts).forEach(([a, b], k) => {
    const L = Math.hypot(b.x - a.x, b.z - a.z); eaveFt += L; screenSqft += L * H;
    const n = Math.max(1, Math.round(L / S.postSpacing));
    const ry = -Math.atan2(b.z - a.z, b.x - a.x);
    posts.push({ x: a.x, y: H / 2, z: a.z, sx: S.cornerPost, sy: H, sz: S.cornerPost, ry }); postCount++;
    for (let i = 1; i < n; i++) {
      const t = i / n, p = { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
      posts.push({ x: p.x, y: H / 2, z: p.z, sx: S.postW, sy: H, sz: S.postD, ry }); postCount++;
      wallPosts.push({ p, seg: k, t });
    }
    beams.push(beamBox(a, b, 0.08, 0.16, 0.17));               // base channel
    beams.push(beamBox(a, b, S.chairRailY, 0.25, 0.14));        // chair rail
    beams.push(beamBox(a, b, H - S.eaveH / 2, S.eaveH, S.eaveT)); // eave header
    if (kickplate) beams.push(beamBox(a, b, 1, 2, 0.04));
    walls.push(beamBox(a, b, H / 2, H, 0.02));
  });

  // Corner knee braces (45°) from each corner post into both adjoining eaves.
  const n = pts.length;
  pts.forEach((c, k) => {
    for (const o of [pts[(k + 1) % n], pts[(k - 1 + n) % n]]) {
      const L = Math.hypot(o.x - c.x, o.z - c.z) || 1, d = Math.min(2, L / 3);
      const e = { x: c.x + ((o.x - c.x) / L) * d, z: c.z + ((o.z - c.z) / L) * d };
      rafters.push(strut({ x: c.x, y: H - S.eaveH - d, z: c.z }, { x: e.x, y: H - S.eaveH, z: e.z }, 0.12));
    }
  });

  let top: XZ[] = pts, base: XZ[] = pts, rise = 0; const slopes: number[] = [];
  if (mansard && n >= 3) {
    const inset = Math.min(5, H * 0.35);
    const ring = mitredOffsetRing(pts, -inset); base = ring.base; top = ring.offset;
    rise = Math.max(1.25, Math.min(4.5, inset * S.roofPitch * 3));
    const Y = H + rise;
    // Hip rafters corner→ridge corner, ridge perimeter beam.
    base.forEach((b, k) => rafters.push(strut({ x: b.x, y: H, z: b.z }, { x: top[k].x, y: Y, z: top[k].z }, S.rafter, 0.33)));
    segs(top).forEach(([a, b]) => beams.push(beamBox(a, b, Y, 0.33, S.rafter)));
    // Common rafters from every wall post up to the ridge line.
    for (const w of wallPosts) {
      const a = top[w.seg], b = top[(w.seg + 1) % top.length];
      rafters.push(strut({ x: w.p.x, y: H, z: w.p.z }, { x: a.x + (b.x - a.x) * w.t, y: Y, z: a.z + (b.z - a.z) * w.t }, S.rafter, 0.25));
    }
    // Slope purlins: rings between eave and ridge.
    const rows = Math.max(1, Math.floor(inset / S.purlinSpacing));
    for (let r = 1; r <= rows; r++) {
      const t = r / (rows + 1);
      const ring2 = base.map((b, k) => ({ x: b.x + (top[k].x - b.x) * t, z: b.z + (top[k].z - b.z) * t }));
      segs(ring2).forEach(([a, b]) => purlins.push(beamBox(a, b, H + rise * t, 0.12, 0.12)));
    }
    slopes.push(rise / inset);
  }
  // Flat-top purlin grid (scanline clip along X every 4 ft) at ridge / eave level.
  const yTop = H + rise, zs = top.map((p) => p.z);
  for (let z = Math.min(...zs) + S.purlinSpacing; z < Math.max(...zs); z += S.purlinSpacing) {
    const xs: number[] = [];
    segs(top).forEach(([a, b]) => { if ((a.z <= z) !== (b.z <= z)) xs.push(a.x + ((z - a.z) / (b.z - a.z)) * (b.x - a.x)); });
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) purlins.push(beamBox({ x: xs[i], z }, { x: xs[i + 1], z }, yTop, 0.14, 0.12));
  }
  return { posts, beams, rafters, purlins, walls, top, base, rise, slopes, stats: { posts: postCount, eaveFt, rafters: rafters.length, screenSqft } };
}
