/**
 * Spillover3D — spillway structure + falling water for spill-over edges
 * (lib/design/spillovers). Credits: Imagine Engine Studios Corp.
 *
 * The spillway is built ON the source body's own rings: the bed runs from the
 * pool outline (the water's edge) to the coping outer ring — the exact ring
 * the riser wall stands on — and the wet wall is a skin laid 2 mm proud of
 * that ring, following its curve, from the bed down to the landing. No fixed
 * lip offset and no flat chord, so the structure snaps tight against the
 * elevated pool wall on straight and curved edges alike, at any coping width.
 * The water sheet starts at the pool's water surface, rolls across the bed
 * and falls along the wet wall (pitch throws it outward on a parabola).
 * Clicking a spillway selects that spill (shared selection; the Pool
 * Elevation panel then edits only its wall finish).
 */
import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mitredOffsetRing } from "@/utils/polygonGeometry";
import { selectSpill } from "@/lib/design/spillovers";
import type { Board3D } from "@/lib/design/board3D";

type XZ = { x: number; z: number };
const okXZ = (p: unknown): p is XZ => !!p && Number.isFinite((p as XZ).x) && Number.isFinite((p as XZ).z);
const inside = (p: XZ, ring: XZ[]) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[i], b = ring[j]; if (!a || !b) continue; if ((a.z > p.z) !== (b.z > p.z) && p.x < ((b.x - a.x) * (p.z - a.z)) / (b.z - a.z) + a.x) c = !c; } return c; };

/** One shared streak texture; its offset scrolls every frame. */
let streak: THREE.CanvasTexture | null = null;
function streakTexture() {
  if (streak) return streak;
  const c = document.createElement("canvas"); c.width = 64; c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(170,225,245,0.55)"; g.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.5})`; g.fillRect(Math.random() * 64, Math.random() * 128, 1 + Math.random() * 2, 10 + Math.random() * 30); }
  streak = new THREE.CanvasTexture(c); streak.wrapS = streak.wrapT = THREE.RepeatWrapping; streak.colorSpace = THREE.SRGBColorSpace;
  return streak;
}

function quad(p: [number, number, number][], uv: [number, number][]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p.flat(), 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv.flat(), 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); return g;
}
/** Vertical band along a polyline: each column drops from yTop to yBot; u = arc length (1 ft tiles). */
function bandStrip(cols: Array<{ x: number; z: number }>, yTop: number, yBot: number) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  let run = 0;
  cols.forEach((p, i) => {
    if (i) run += Math.hypot(p.x - cols[i - 1].x, p.z - cols[i - 1].z);
    pos.push(p.x, yTop, p.z, p.x, yBot, p.z);
    uv.push(run, 0, run, Math.max(0.01, yTop - yBot));
    if (i) { const b = (i - 1) * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}
/** Horizontal strip between two paired polylines (the bed, outline → coping ring). */
function flatStrip(inner: XZ[], outer: XZ[]) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  let run = 0;
  inner.forEach((p, i) => {
    if (i) run += Math.hypot(p.x - inner[i - 1].x, p.z - inner[i - 1].z);
    const o = outer[i];
    pos.push(p.x, 0, p.z, o.x, 0, o.z);
    uv.push(run, 0, run, Math.hypot(o.x - p.x, o.z - p.z));
    if (i) { const b = (i - 1) * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}

/** Closest point of p on the closed ring, as (segment, t along it, point). */
function projectOnRing(ring: XZ[], p: XZ) {
  let best = { seg: 0, t: 0, point: ring[0], d: Infinity };
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const dx = b.x - a.x, dz = b.z - a.z, L2 = dx * dx + dz * dz;
    const t = L2 > 1e-9 ? Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.z - a.z) * dz) / L2)) : 0;
    const q = { x: a.x + dx * t, z: a.z + dz * t };
    const d = Math.hypot(p.x - q.x, p.z - q.z);
    if (d < best.d) best = { seg: i, t, point: q, d };
  }
  return best;
}
const lerpPt = (a: XZ, b: XZ, t: number): XZ => ({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
/** Arc of ringA (with its paired ringB) between the projections of a and b — the shorter way round. */
function pairedArc(ringA: XZ[], ringB: XZ[], a: XZ, b: XZ) {
  const N = ringA.length;
  if (N < 3 || ringB.length !== N) return null;
  const pa = projectOnRing(ringA, a), pb = projectOnRing(ringA, b);
  const walk = (from: typeof pa, to: typeof pb) => {
    const A: XZ[] = [from.point], B: XZ[] = [lerpPt(ringB[from.seg], ringB[(from.seg + 1) % N], from.t)];
    let i = from.seg;
    while (i !== to.seg) { i = (i + 1) % N; A.push(ringA[i]); B.push(ringB[i]); }
    A.push(to.point); B.push(lerpPt(ringB[to.seg], ringB[(to.seg + 1) % N], to.t));
    let len = 0; for (let k = 1; k < A.length; k++) len += Math.hypot(A[k].x - A[k - 1].x, A[k].z - A[k - 1].z);
    return { A, B, len };
  };
  const fwd = walk(pa, pb), back = walk(pb, pa);
  const pick = fwd.len <= back.len ? fwd : { A: [...back.A].reverse(), B: [...back.B].reverse(), len: back.len };
  const chord = Math.hypot(b.x - a.x, b.z - a.z);
  if (pick.len > chord * 1.8 + 1.5 || pick.A.length < 2) return null;
  return pick;
}
/** Even-out an arc to ~step ft columns (keeps the sheet grid light on dense rings). */
function resample(pts: XZ[], step: number): number[] {
  const keep = [0];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
    if (acc >= step && i < pts.length - 1) { keep.push(i); acc = 0; }
  }
  if (keep[keep.length - 1] !== pts.length - 1) keep.push(pts.length - 1);
  return keep;
}

/** Fallback flat spillway on the a→b chord (used only when the source outline is unavailable). */
const LIP = 1;
function chordParts(a: XZ, b: XZ, n: XZ, top: number, bottom: number) {
  const L = Math.hypot(b.x - a.x, b.z - a.z), H = Math.max(0.05, top - bottom);
  const at = (p: XZ, o: number, y: number): [number, number, number] => [p.x + n.x * o, y, p.z + n.z * o];
  const W = LIP + 0.007;
  const bed = quad([at(a, -0.05, top), at(b, -0.05, top), at(b, W, top), at(a, W, top)], [[0, 0], [L, 0], [L, LIP], [0, LIP]]);
  const lip = quad([at(a, W, top), at(b, W, top), at(b, W, bottom), at(a, W, bottom)], [[0, 0], [L, 0], [L, H], [0, H]]);
  const sideA = quad([at(a, -0.05, top), at(a, W, top), at(a, W, bottom), at(a, -0.05, bottom)], [[0, 0], [LIP, 0], [LIP, H], [0, H]]);
  const sideB = quad([at(b, W, top), at(b, -0.05, top), at(b, -0.05, bottom), at(b, W, bottom)], [[0, 0], [LIP, 0], [LIP, H], [0, H]]);
  return { bed, lip, wall: sideA, sideB };
}
function chordSheet(a: XZ, b: XZ, n: XZ, top: number, bottom: number, pitch: number) {
  const H = Math.max(0.3, top - bottom), L = Math.hypot(b.x - a.x, b.z - a.z);
  const throwFt = Math.tan((Math.min(45, Math.max(0, pitch)) * Math.PI) / 180) * H * 1.2;
  const rows = 16, cols = Math.max(2, Math.ceil(L * 2));
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let r = 0; r <= rows; r++) {
    const u = r / rows, off = 0.04 + (LIP + 0.02 - 0.04) * Math.min(1, u / 0.22) + throwFt * Math.sqrt(Math.max(0, (u - 0.22) / 0.78));
    const y = u < 0.22 ? top - 0.03 * (u / 0.22) : top - H * (0.65 * ((u - 0.22) / 0.78) + 0.35 * Math.pow((u - 0.22) / 0.78, 2));
    for (let c = 0; c <= cols; c++) {
      const t = c / cols, x = a.x + (b.x - a.x) * t + n.x * off, z = a.z + (b.z - a.z) * t + n.z * off;
      pos.push(x, y, z); uv.push(t * L * 0.5, u * H * 0.5);
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const k = r * (cols + 1) + c; idx.push(k, k + 1, k + cols + 1, k + 1, k + cols + 2, k + cols + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return { g, landOff: LIP + 0.06 + throwFt };
}

/** Water sheet over an arc: starts on the pool outline at the water surface, crosses the bed, then falls along the wet wall. */
function arcSheet(inner: XZ[], outer: XZ[], dir: XZ[], top: number, bottom: number, pitch: number) {
  const H = Math.max(0.3, top - bottom);
  const throwFt = Math.tan((Math.min(45, Math.max(0, pitch)) * Math.PI) / 180) * H * 1.2;
  const rows = 20;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const arcLen: number[] = [0];
  for (let i = 1; i < inner.length; i++) arcLen.push(arcLen[i - 1] + Math.hypot(inner[i].x - inner[i - 1].x, inner[i].z - inner[i - 1].z));
  for (let r = 0; r <= rows; r++) {
    const u = r / rows;
    for (let c = 0; c < inner.length; c++) {
      let x: number, y: number, z: number;
      if (u < 0.22) {
        const t = u / 0.22;
        x = inner[c].x + (outer[c].x - inner[c].x) * t + dir[c].x * 0.02 * t;
        z = inner[c].z + (outer[c].z - inner[c].z) * t + dir[c].z * 0.02 * t;
        y = top - 0.03 * t;
      } else {
        const v = (u - 0.22) / 0.78, off = 0.02 + throwFt * Math.sqrt(v);
        x = outer[c].x + dir[c].x * off; z = outer[c].z + dir[c].z * off;
        y = top - H * (0.65 * v + 0.35 * v * v);
      }
      pos.push(x, y, z); uv.push(arcLen[c] * 0.5, u * H * 0.5);
    }
  }
  const cols = inner.length;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols - 1; c++) { const k = r * cols + c; idx.push(k, k + 1, k + cols, k + 1, k + cols + 1, k + cols); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return { g, landOff: 0.08 + throwFt };
}

export function Spillovers3D({ data, mainElevation = 0, deckLevel = 0, mainPts, tileUrl, mainCopingWidth = 1 }: { data: Board3D; mainElevation?: number; deckLevel?: number; mainPts?: XZ[]; tileUrl?: string; mainCopingWidth?: number }) {
  // Tiled spillway bed + wet wall: the spill's own chosen finish, else the
  // source body's waterline tile, else the main one.
  const tiles = React.useMemo(() => {
    const cache = new Map<string, THREE.MeshStandardMaterial>();
    return (url?: string) => {
      const k = url || "";
      if (!cache.has(k)) {
        const hex = !url || url.startsWith("#");
        const m = new THREE.MeshStandardMaterial({ color: hex ? url || "#2f7fb8" : "#ffffff", roughness: 0.15, metalness: 0.15, side: THREE.DoubleSide });
        if (!hex) new THREE.TextureLoader().load(url, (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; m.map = t; m.needsUpdate = true; });
        cache.set(k, m);
      }
      return cache.get(k)!;
    };
  }, []);
  const tex = React.useMemo(streakTexture, []);
  const mat = React.useMemo(() => new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity: 0.8, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false }), [tex]);
  const foam = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true, opacity: 0.55, depthWrite: false }), []);
  useFrame((_, dt) => { tex.offset.y -= dt * 1.4; });
  const sheets = React.useMemo(() => (data.spills ?? []).filter((sp) => sp && okXZ(sp.a) && okXZ(sp.b) && okXZ(sp.center)).map((sp) => {
    const src = sp.waterId ? data.waters?.find((w) => w.itemId === sp.waterId) : undefined;
    const top = (sp.waterId ? src?.elevation ?? 0 : mainElevation) - 0.12;
    const mx = (sp.a.x + sp.b.x) / 2, mz = (sp.a.z + sp.b.z) / 2;
    // True wall normal: perpendicular to the spill chord, flipped away from the body
    // centre. (A radial normal tilted the wet wall off the riser on straight sides.)
    const cl = Math.hypot(sp.b.x - sp.a.x, sp.b.z - sp.a.z) || 1;
    let nx = (sp.b.z - sp.a.z) / cl, nz = -(sp.b.x - sp.a.x) / cl;
    if (nx * (mx - sp.center.x) + nz * (mz - sp.center.z) < 0) { nx = -nx; nz = -nz; }
    // Landing: inside another water body → its water line, else the ground/deck.
    const probe = { x: mx + nx * (0.6 + Math.tan((sp.pitch * Math.PI) / 180) * 1.5), z: mz + nz * (0.6 + Math.tan((sp.pitch * Math.PI) / 180) * 1.5) };
    const bodies: Array<{ pts: XZ[]; elev: number; id?: string }> = [...(mainPts && mainPts.length >= 3 ? [{ pts: mainPts, elev: mainElevation }] : []), ...(data.waters ?? []).map((w) => ({ pts: w?.pts ?? [], elev: w?.elevation ?? 0, id: w?.itemId }))];
    const target = bodies.find((b) => b.id !== sp.waterId && !(b.id == null && sp.waterId == null) && b.pts.length >= 3 && inside(probe, b.pts));
    // No water body below → the deck (raised or sunken) catches the sheet.
    const bottom = Math.min(target ? target.elev - 0.25 : deckLevel + 0.02, top - 0.3);
    const n = { x: nx, z: nz };
    const wallUrl = sp.wall?.url || src?.waterline || tileUrl;
    // Preferred path: build the spillway on the source body's own rings so it
    // lands exactly on the riser face at the body's real coping width.
    const outline = (sp.waterId ? src?.pts : mainPts ?? data.primaryPts) ?? [];
    const copingW = Math.max(0.1, sp.waterId ? src?.copingWidth || 1 : mainCopingWidth || 1);
    let parts: { bed: THREE.BufferGeometry; lip: THREE.BufferGeometry; wall: THREE.BufferGeometry; sideB: THREE.BufferGeometry } | null = null;
    let sheet: { g: THREE.BufferGeometry; landOff: number } | null = null;
    let foamPos: [number, number, number] = [mx + nx * (LIP + 0.06), bottom + 0.03, mz + nz * (LIP + 0.06)];
    if (outline.length >= 3) {
      const offset = mitredOffsetRing(outline, copingW, { miterLimit: 2.5 }).offset;
      const arc = offset.length === outline.length ? pairedArc(outline, offset, sp.a, sp.b) : null;
      if (arc) {
        const keep = resample(arc.A, 0.45);
        const inner = keep.map((i) => arc.A[i]);
        const outerRaw = keep.map((i) => arc.B[i]);
        // Outward per-vertex direction (outline → coping ring) + the wall skin, 2 mm proud of the riser face.
        const dir = inner.map((p, i) => { const dx = outerRaw[i].x - p.x, dz = outerRaw[i].z - p.z; const l = Math.hypot(dx, dz) || 1; return { x: dx / l, z: dz / l }; });
        const outer = outerRaw.map((p, i) => ({ x: p.x + dir[i].x * 0.007, z: p.z + dir[i].z * 0.007 }));
        const bed = flatStrip(inner, outer); bed.translate(0, top, 0);
        const lip = bandStrip(outer, top, bottom);
        const endCap = (i: number) => quad(
          [[inner[i].x, top, inner[i].z], [outer[i].x, top, outer[i].z], [outer[i].x, bottom, outer[i].z], [inner[i].x, bottom, inner[i].z]],
          [[0, 0], [copingW, 0], [copingW, Math.max(0.05, top - bottom)], [0, Math.max(0.05, top - bottom)]]);
        parts = { bed, lip, wall: endCap(0), sideB: endCap(inner.length - 1) };
        sheet = arcSheet(inner, outer, dir, top, bottom, sp.pitch);
        const mid = Math.floor(inner.length / 2);
        foamPos = [outer[mid].x + dir[mid].x * sheet.landOff, bottom + 0.03, outer[mid].z + dir[mid].z * sheet.landOff];
      }
    }
    if (!parts || !sheet) {
      parts = chordParts(sp.a, sp.b, n, top + 0.04, bottom);
      sheet = chordSheet(sp.a, sp.b, n, top, bottom, sp.pitch);
      foamPos = [mx + nx * sheet.landOff, bottom + 0.03, mz + nz * sheet.landOff];
    }
    const foamGeo = new THREE.PlaneGeometry(Math.hypot(sp.b.x - sp.a.x, sp.b.z - sp.a.z), 0.5); foamGeo.rotateX(-Math.PI / 2);
    return { id: sp.id, g: sheet.g, parts, tile: tiles(wallUrl), foamGeo, foamPos, foamRot: -Math.atan2(sp.b.z - sp.a.z, sp.b.x - sp.a.x) };
  }), [data.spills, data.waters, mainElevation, deckLevel, mainPts, tileUrl, mainCopingWidth, tiles]);
  return <group name="spillovers">{sheets.map((s) => (
    <group key={s.id} onClick={(e) => { e.stopPropagation(); selectSpill(s.id); }}>
      <mesh geometry={s.parts.bed} material={s.tile} receiveShadow />
      <mesh geometry={s.parts.lip} material={s.tile} />
      <mesh geometry={s.parts.wall} material={s.tile} receiveShadow />
      <mesh geometry={s.parts.sideB} material={s.tile} receiveShadow />
      <mesh geometry={s.g} material={mat} renderOrder={11} raycast={() => null} />
      <mesh geometry={s.foamGeo} material={foam} position={s.foamPos} rotation={[0, s.foamRot, 0]} renderOrder={12} raycast={() => null} />
    </group>))}</group>;
}
