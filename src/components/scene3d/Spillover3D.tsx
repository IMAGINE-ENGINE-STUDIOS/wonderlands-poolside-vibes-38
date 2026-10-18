/**
 * Spillover3D — falling water sheets for spill-over edges (lib/design/spillovers).
 * Credits: Imagine Engine Studios Corp.
 *
 * Each spill is a curved translucent sheet from the source body's water line
 * down to whatever is below the edge: another pool/spa's water, or the deck.
 * pitch 0 = the sheet clings to the wall; up to 45° it is thrown outward on a
 * parabola. A scrolling streak texture animates the flow; a foam strip marks
 * where it lands.
 */
import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
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

/** Spillway bed depth (ft): the notch through the coping, water crosses it before falling. */
const LIP = 1;
/** A flat quad strip a→b pushed out along n from o0 to o1 at height y (bed) or a vertical face at offset o from y0 to y1 (wall). */
function quad(p: [number, number, number][], uv: [number, number][]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p.flat(), 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv.flat(), 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); return g;
}
function spillwayParts(a: XZ, b: XZ, n: XZ, top: number, bottom: number) {
  const L = Math.hypot(b.x - a.x, b.z - a.z), H = Math.max(0.05, top - bottom);
  const at = (p: XZ, o: number, y: number): [number, number, number] => [p.x + n.x * o, y, p.z + n.z * o];
  const bed = quad([at(a, -0.05, top), at(b, -0.05, top), at(b, LIP, top), at(a, LIP, top)], [[0, 0], [L, 0], [L, LIP], [0, LIP]]);
  const lip = quad([at(a, LIP, top), at(b, LIP, top), at(b, LIP, top - 0.25), at(a, LIP, top - 0.25)], [[0, 0], [L, 0], [L, 0.25], [0, 0.25]]);
  const wall = quad([at(a, LIP, top - 0.25), at(b, LIP, top - 0.25), at(b, LIP, bottom), at(a, LIP, bottom)], [[0, 0], [L, 0], [L, H], [0, H]]);
  return { bed, lip, wall };
}

function sheetGeometry(a: XZ, b: XZ, n: XZ, top: number, bottom: number, pitch: number) {
  const H = Math.max(0.3, top - bottom), L = Math.hypot(b.x - a.x, b.z - a.z);
  const throwFt = Math.tan((Math.min(45, Math.max(0, pitch)) * Math.PI) / 180) * H * 1.2;
  const rows = 16, cols = Math.max(2, Math.ceil(L * 2));
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let r = 0; r <= rows; r++) {
    const u = r / rows, off = LIP + 0.06 + throwFt * Math.sqrt(u), y = top - H * u * u * 0.35 - H * u * 0.65;
    for (let c = 0; c <= cols; c++) {
      const t = c / cols, x = a.x + (b.x - a.x) * t + n.x * off, z = a.z + (b.z - a.z) * t + n.z * off;
      pos.push(x, y, z); uv.push(t * L * 0.5, u * H * 0.5);
    }
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const k = r * (cols + 1) + c; idx.push(k, k + 1, k + cols + 1, k + 1, k + cols + 2, k + cols + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return { g, landOff: LIP + 0.06 + throwFt, L };
}

export function Spillovers3D({ data, mainElevation = 0, deckLevel = 0, mainPts, tileUrl }: { data: Board3D; mainElevation?: number; deckLevel?: number; mainPts?: XZ[]; tileUrl?: string }) {
  // Tiled spillway bed + wet wall: the source body's waterline tile, else the main one.
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
    let nx = mx - sp.center.x, nz = mz - sp.center.z; const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
    // Landing: inside another water body → its water line, else the ground/deck.
    const probe = { x: mx + nx * (0.6 + Math.tan((sp.pitch * Math.PI) / 180) * 1.5), z: mz + nz * (0.6 + Math.tan((sp.pitch * Math.PI) / 180) * 1.5) };
    const bodies: Array<{ pts: XZ[]; elev: number; id?: string }> = [...(mainPts && mainPts.length >= 3 ? [{ pts: mainPts, elev: mainElevation }] : []), ...(data.waters ?? []).map((w) => ({ pts: w?.pts ?? [], elev: w?.elevation ?? 0, id: w?.itemId }))];
    const target = bodies.find((b) => b.id !== sp.waterId && !(b.id == null && sp.waterId == null) && b.pts.length >= 3 && inside(probe, b.pts));
    // No water body below → the deck (raised or sunken) catches the sheet.
    const bottom = target ? target.elev - 0.25 : deckLevel + 0.02;
    const n = { x: nx, z: nz };
    const { g, landOff } = sheetGeometry(sp.a, sp.b, n, top, Math.min(bottom, top - 0.3), sp.pitch);
    const foamGeo = new THREE.PlaneGeometry(Math.hypot(sp.b.x - sp.a.x, sp.b.z - sp.a.z), 0.5); foamGeo.rotateX(-Math.PI / 2);
    const parts = spillwayParts(sp.a, sp.b, n, top + 0.04, Math.min(bottom, top - 0.3));
    return { id: sp.id, g, parts, tile: tiles(src?.waterline || tileUrl), foamGeo, foamPos: [mx + nx * landOff, Math.min(bottom, top - 0.3) + 0.03, mz + nz * landOff] as [number, number, number], foamRot: -Math.atan2(sp.b.z - sp.a.z, sp.b.x - sp.a.x) };
  }), [data.spills, data.waters, mainElevation, deckLevel, mainPts, tileUrl, tiles]);
  return <group name="spillovers">{sheets.map((s) => (
    <group key={s.id}>
      <mesh geometry={s.parts.bed} material={s.tile} receiveShadow />
      <mesh geometry={s.parts.lip} material={s.tile} />
      <mesh geometry={s.parts.wall} material={s.tile} receiveShadow />
      <mesh geometry={s.g} material={mat} renderOrder={11} raycast={() => null} />
      <mesh geometry={s.foamGeo} material={foam} position={s.foamPos} rotation={[0, s.foamRot, 0]} renderOrder={12} raycast={() => null} />
    </group>))}</group>;
}
