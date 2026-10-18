/**
 * Draws the Global Design Board V2 hand-off in the 3D Studio: fences (posts
 * every 6 ft, rails, pickets / privacy panels / glass at the chosen height and
 * color), screen enclosures (posts, header beam, translucent mesh walls and
 * roof) and turf / deck surfaces with pools, spas and decks cut out exactly.
 * Imagine Engine Studios Corp.
 */
import * as React from "react";
import * as THREE from "three";
import { loadBoard3D, BOARD_3D_EVENT, type Board3D, type Fence3D, type Screen3D, type Surface3D, type Water3D, type Gate3D, waterDepthAt, waterCenter, updateBoard3D } from "@/lib/design/board3D";
import { mitredOffsetRing, buildSlabGeometry } from "@/utils/polygonGeometry";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { textureCache } from "@/utils/textureCache";
import { smoothCurvedRing } from "@/utils/deckSurface";
import { generateCurvedPoolPoints } from "@/utils/curveUtils";
import { PoolMesh } from "@/components/Pool3DScene";
import { CopingGeometry } from "./CopingGeometry";
import { InstancedBoxes, beamBox, type BoxInstance } from "./InstancedBoxes";
import { buildScreenFrame, strut } from "@/utils/screenStructureGeometry";
import { WaterlineMesh } from "@/components/WaterlineMesh";
import { PoolAssetsRenderer } from "./PoolAssetsRenderer";
import { useThree } from "@react-three/fiber";
import { applyHoleCut } from "./holeCutShader";
import { buildVinylFence } from "./vinylFenceGeometry";
import { vinylMaterial } from "@/lib/design/vinylFenceMaterials";

/** Clicking a board element opens its widget (BoardElementEditor). */
export const BOARD_SELECT_EVENT = "studio3d:boardSelect";
export type WaterPart = "pool" | "coping" | "waterline" | "deck";
export type BoardSelection = { type: "fence" | "screen" | "water" | "deck"; i: number; part?: WaterPart } | null;
const select = (sel: BoardSelection) => (e: { stopPropagation: () => void }) => {
  e.stopPropagation();
  window.dispatchEvent(new CustomEvent(BOARD_SELECT_EVENT, { detail: sel }));
};
/**
 * Catalog photo material (same photos and 1 ft UV × repeat as the main pool),
 * or a plain color when the value is a hex. Textures are cached per URL.
 */
const texCache = new Map<string, THREE.Texture>();
const isUrl = (v: string) => /^(\/|https?:)/.test(v);
const photoMat = (v: string, repeatFt: number, opts: THREE.MeshStandardMaterialParameters) => {
  if (!isUrl(v)) return new THREE.MeshStandardMaterial({ color: v, ...opts });
  let t = texCache.get(v);
  if (!t) { t = new THREE.TextureLoader().load(v); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; texCache.set(v, t); }
  const tc = t.clone(); tc.needsUpdate = true; tc.repeat.set(1 / repeatFt, 1 / repeatFt);
  return new THREE.MeshStandardMaterial({ map: tc, ...opts });
};
/** World-space planar UVs in feet so photos keep real scale on any outline. */
const planarUV = (g: THREE.BufferGeometry, wall = false) => {
  const a = g.attributes.position as THREE.BufferAttribute; const uv: number[] = [];
  for (let k = 0; k < a.count; k++) { const x = a.getX(k), y = a.getY(k), z = a.getZ(k); uv.push(wall ? x + z : x, wall ? y : z); }
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); return g;
};
/** Polished architectural metal: any color reads as powder-coated aluminum. */
const metalMat = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.22, metalness: 0.92, envMapIntensity: 1.4 });

type XZ = { x: number; z: number };
const segs = (pts: XZ[], closed: boolean) => {
  const out: [XZ, XZ][] = [];
  for (let i = 1; i < pts.length; i++) out.push([pts[i - 1], pts[i]]);
  if (closed && pts.length > 2) out.push([pts[pts.length - 1], pts[0]]);
  return out;
};
const along = (pts: XZ[], step: number, closed: boolean) => {
  const res: XZ[] = [];
  for (const [a, b] of segs(pts, closed)) {
    const L = Math.hypot(b.x - a.x, b.z - a.z), n = Math.max(1, Math.round(L / step));
    for (let i = 0; i < n; i++) res.push({ x: a.x + ((b.x - a.x) * i) / n, z: a.z + ((b.z - a.z) * i) / n });
  }
  if (!closed && pts.length) res.push(pts[pts.length - 1]);
  return res;
};

/** A thin box stretched between two points at height y. */
function Beam({ a, b, y, h, t, mat }: { a: XZ; b: XZ; y: number; h: number; t: number; mat: THREE.Material }) {
  const L = Math.hypot(b.x - a.x, b.z - a.z);
  return (
    <mesh material={mat} position={[(a.x + b.x) / 2, y, (a.z + b.z) / 2]} rotation={[0, -Math.atan2(b.z - a.z, b.x - a.x), 0]} castShadow>
      <boxGeometry args={[L, h, t]} />
    </mesh>
  );
}


/** Fence doors / screen doors in 3D: hinge + latch posts, leaf frame, mid rail, latch at 54". */
function Doors({ gates, pts, closed, H, mat }: { gates?: Gate3D[]; pts: XZ[]; closed: boolean; H: number; mat: THREE.Material }) {
  const boxes = React.useMemo(() => {
    const out: BoxInstance[] = [];
    for (const g of gates ?? []) {
      const a = pts[g.seg], b = pts[closed ? (g.seg + 1) % pts.length : g.seg + 1]; if (!a || !b) continue;
      const L = Math.hypot(b.x - a.x, b.z - a.z) || 1, ux = (b.x - a.x) / L, uz = (b.z - a.z) / L, half = Math.min(L / 2, g.widthFt / 2);
      const c = { x: a.x + (b.x - a.x) * g.t, z: a.z + (b.z - a.z) * g.t };
      const p1 = { x: c.x - ux * half, z: c.z - uz * half }, p2 = { x: c.x + ux * half, z: c.z + uz * half };
      const dh = Math.min(H, 6.9); const nx = -uz * 0.08, nz = ux * 0.08;
      // Jambs (2"x4") full height to the eave, transom header over the leaf, transom mid-strut.
      [p1, p2].forEach((p) => out.push({ x: p.x, y: H / 2, z: p.z, sx: 0.22, sy: H, sz: 0.34 }));
      out.push(beamBox(p1, p2, dh + 0.1, 0.33, 0.2));
      const c0 = { x: (p1.x + p2.x) / 2, z: (p1.z + p2.z) / 2 };
      if (H - dh > 1) out.push({ x: c0.x, y: (dh + H) / 2, z: c0.z, sx: 0.14, sy: H - dh, sz: 0.2 });
      // Leaf: stiles, top/bottom rails, kick rail, mid crossbar at chair-rail height, diagonal tie.
      const double = g.widthFt >= 6, leaves: [XZ, XZ][] = double ? [[p1, c0], [c0, p2]] : [[p1, p2]];
      for (const [s0, s1] of leaves) {
        const q1 = { x: s0.x + ux * 0.12 + nx, z: s0.z + uz * 0.12 + nz }, q2 = { x: s1.x - ux * 0.12 + nx, z: s1.z - uz * 0.12 + nz };
        [q1, q2].forEach((q) => out.push({ x: q.x, y: dh / 2, z: q.z, sx: 0.14, sy: dh - 0.1, sz: 0.1 }));
        out.push(beamBox(q1, q2, dh - 0.1, 0.16, 0.1), beamBox(q1, q2, 0.12, 0.2, 0.1), beamBox(q1, q2, 0.75, 0.1, 0.08), beamBox(q1, q2, 3.2, 0.2, 0.1));
        out.push(strut({ x: q1.x, y: 0.2, z: q1.z }, { x: q2.x, y: 3.1, z: q2.z }, 0.08, 0.08));
        // Closer arm at the top hinge corner.
        out.push({ x: q1.x + ux * 0.6 + nx, y: dh - 0.35, z: q1.z + uz * 0.6 + nz, sx: 0.9, sy: 0.12, sz: 0.1, ry: -Math.atan2(uz, ux) });
      }
      // Lever latch at 54": backplate + lever + pull handle on the latch stile.
      const lt = double ? c0 : p2, sgn = double ? 1 : 1;
      const lx = lt.x - ux * 0.35 * sgn, lz = lt.z - uz * 0.35 * sgn, ry = -Math.atan2(uz, ux);
      out.push({ x: lx + nx * 1.6, y: 4.5, z: lz + nz * 1.6, sx: 0.12, sy: 0.6, sz: 0.06, ry });
      out.push({ x: lx - ux * 0.15 + nx * 2.4, y: 4.6, z: lz - uz * 0.15 + nz * 2.4, sx: 0.4, sy: 0.06, sz: 0.06, ry });
      out.push({ x: lx + nx * 2.6, y: 4.1, z: lz + nz * 2.6, sx: 0.05, sy: 0.7, sz: 0.05, ry });
    }
    return out;
  }, [gates, pts, closed, H]);
  return <InstancedBoxes boxes={boxes} material={mat} castShadow />;
}

const isVinyl = (s: string) => s === "vinyl";
/** Pyramid cap: 4-sided cone rotated 45° so its faces line up with the square post. */
const PYRAMID = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4);
function VinylFence({ f, i }: { f: Fence3D; i: number }) {
  const H = f.height;
  /* Textured finishes from the AFC-373 manifest; posts follow the panel finish unless set. */
  const panelMat = React.useMemo(() => vinylMaterial(f.color), [f.color]);
  const postMat = React.useMemo(() => vinylMaterial(f.postColor ?? f.color), [f.postColor, f.color]);
  const parts = React.useMemo(() => buildVinylFence(f.pts, H), [f.pts, H]);
  return (
    <group name="board-fence" onClick={select({ type: "fence", i })}>
      <InstancedBoxes boxes={parts.posts} material={postMat} castShadow />
      <InstancedBoxes boxes={parts.rails} material={panelMat} castShadow />
      <InstancedBoxes boxes={parts.pickets} material={panelMat} castShadow />
      {parts.caps.map((c, k) => (
        <group key={k} position={[c.x, c.y - c.sy / 2, c.z]}>
          <mesh material={postMat} position={[0, 0.03, 0]}><boxGeometry args={[c.sx, 0.06, c.sz]} /></mesh>
          <mesh geometry={PYRAMID} material={postMat} position={[0, 0.06 + (c.sy - 0.06) / 2, 0]} scale={[c.sx, c.sy - 0.06, c.sz]} />
        </group>
      ))}
      <Doors gates={f.gates} pts={f.pts} closed={false} H={H} mat={postMat} />
    </group>
  );
}
function Fence({ f, i }: { f: Fence3D; i: number }) {
  if (isVinyl(f.style)) return <VinylFence f={f} i={i} />;
  return <StdFence f={f} i={i} />;
}
function StdFence({ f, i }: { f: Fence3D; i: number }) {
  const metal = React.useMemo(() => metalMat(f.color), [f.color]);
  const panel = React.useMemo(() => f.style === "glass"
    ? new THREE.MeshPhysicalMaterial({ color: "#cfe9ef", transparent: true, opacity: 0.3, roughness: 0.05 })
    : f.style === "alu" ? metalMat(f.color)
    : new THREE.MeshStandardMaterial({ color: f.color, roughness: 0.7 }), [f.style, f.color]);
  const H = f.height;
  // Instanced: every box of one material is a single draw call (same sizes/positions as before).
  const parts = React.useMemo(() => {
    const posts = along(f.pts, 6, false);
    const postBoxes: BoxInstance[] = posts.map((p) => ({ x: p.x, y: H / 2, z: p.z, sx: 0.2, sy: H + 0.15, sz: 0.2 }));
    const detail: BoxInstance[] = [];
    if (f.style === "alu") along(f.pts, 0.33, false).forEach((p) => detail.push({ x: p.x, y: H / 2, z: p.z, sx: 0.06, sy: H - 0.1, sz: 0.06 }));
    const rails: BoxInstance[] = [], panels: BoxInstance[] = [];
    for (const [a, b] of segs(f.pts, false)) {
      if (f.style === "alu") { rails.push(beamBox(a, b, H - 0.1, 0.1, 0.08), beamBox(a, b, 0.35, 0.1, 0.08)); }
      else panels.push(beamBox(a, b, H / 2, H - 0.1, f.style === "glass" ? 0.04 : 0.1));
    }
    return { postBoxes, detail, rails, panels };
  }, [f.pts, f.style, H]);
  return (
    <group name="board-fence" onClick={select({ type: "fence", i })}>
      <InstancedBoxes boxes={parts.postBoxes} material={metal} castShadow />
      <InstancedBoxes boxes={parts.detail} material={metal} />
      <InstancedBoxes boxes={parts.rails} material={metal} castShadow />
      <InstancedBoxes boxes={parts.panels} material={panel} castShadow />
      <Doors gates={f.gates} pts={f.pts} closed={false} H={H} mat={metal} />
    </group>
  );
}

/**
 * Modern architectural pool cage (black powder-coat): 3"x3" corner posts,
 * 2"x4" posts every 8 ft, base channel, chair rail, 2"x7" eave header, corner
 * knee braces, hip rafters to a ridge frame, common rafters, purlin grid and
 * charcoal 18x14 screen mesh. Framing math: utils/screenStructureGeometry.
 */
let screenMeshMat: THREE.MeshPhysicalMaterial | null = null;
const sharedScreenMesh = () => (screenMeshMat ??= new THREE.MeshPhysicalMaterial({ color: "#121212", transparent: true, opacity: 0.28, roughness: 0.15, side: THREE.DoubleSide, depthWrite: false }));
function Screen({ s, i }: { s: Screen3D; i: number }) {
  const frame = React.useMemo(() => new THREE.MeshStandardMaterial({ color: s.color || "#141414", roughness: 0.32, metalness: 0.85, envMapIntensity: 1.2 }), [s.color]);
  const mesh = sharedScreenMesh();
  const H = s.height;
  const mansard = (s.roof ?? "mansard") === "mansard" && s.pts.length >= 3;
  const f = React.useMemo(() => buildScreenFrame(s.pts, H, mansard, s.kickplate), [s.pts, H, mansard, s.kickplate]);
  const geo = React.useMemo(() => {
    if (!mansard) return null;
    const pos: number[] = []; const { base, top, rise } = f;
    for (let k = 0; k < base.length; k++) {
      const a = base[k], b = base[(k + 1) % base.length], c = top[(k + 1) % top.length], d = top[k];
      pos.push(a.x, H, a.z, b.x, H, b.z, c.x, H + rise, c.z, a.x, H, a.z, c.x, H + rise, c.z, d.x, H + rise, d.z);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [f, mansard, H]);
  const lid = React.useMemo(() => {
    if (f.top.length < 3) return null;
    const g = new THREE.ShapeGeometry(new THREE.Shape(f.top.map((p) => new THREE.Vector2(p.x, -p.z)))); g.rotateX(-Math.PI / 2); return g;
  }, [f]);
  return (
    <group name="board-screen" onClick={select({ type: "screen", i })}>
      <InstancedBoxes boxes={f.posts} material={frame} castShadow />
      <InstancedBoxes boxes={f.beams} material={frame} castShadow />
      <InstancedBoxes boxes={f.rafters} material={frame} castShadow />
      <InstancedBoxes boxes={f.purlins} material={frame} />
      <InstancedBoxes boxes={f.walls} material={mesh} />
      <Doors gates={s.gates} pts={s.pts} closed H={H} mat={frame} />
      {geo && <mesh geometry={geo} material={mesh} />}
      {lid && <mesh geometry={lid} material={mesh} position={[0, H + f.rise, 0]} />}
    </group>
  );
}

/**
 * Extra pool / spa — built with the main pool's own parts (PoolMesh shell +
 * floor, CopingGeometry, WaterlineMesh, PoolAssetsRenderer stairs/seats), each
 * with its own outline, depth profile, finish, coping, waterline and assets.
 * Only the data differs from the main pool; the technology is the same.
 */
const BASE_FINISH = "/textures/finishes/sapphire-blue-g3.webp";
const urlOr = (v: string | undefined, fb?: string) => (v && isUrl(v) ? v : fb);
/** Main pool texture scales, used by every extra body unless it has its own. */
export interface SceneScales { finish: number; coping: number; waterline: number; paver: number }
const DEFAULT_SCALES: SceneScales = { finish: 1.8, coping: 1.8, waterline: 1.8, paver: 1.8 };
/**
 * Extra outlines arrive already sampled exactly like the 2D canvas (straight
 * sides straight, curves curved). Straight runs are split into collinear
 * points so the ring reaches DENSE_OUTLINE_MIN_POINTS and every shared part
 * (shell, coping, waterline) uses it untouched — no re-curving of corners.
 */
function denseRing(pts: { x: number; y: number }[]): { x: number; y: number }[] {
  if (pts.length >= 64) return pts;
  const per = Math.ceil(70 / pts.length); const out: { x: number; y: number }[] = [];
  pts.forEach((a, k) => { const b = pts[(k + 1) % pts.length]; for (let s = 0; s < per; s++) out.push({ x: a.x + ((b.x - a.x) * s) / per, y: a.y + ((b.y - a.y) * s) / per }); });
  return out;
}
/** One water material for every extra body (fewer shader programs / draw state changes). */
/* No transmission (it forced a second full-scene render pass) and no depth write, so the pool floor always shows through. Imagine Engine Studios Corp */
let waterMat: THREE.MeshStandardMaterial | null = null;
const sharedWater = () => (waterMat ??= new THREE.MeshStandardMaterial({ color: "#58c4e0", transparent: true, opacity: 0.55, roughness: 0.08, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide }));
/**
 * Board reloads re-parse every body from storage, so compare by content:
 * only the pool that actually changed rebuilds its shell/coping/waterline.
 */
const waterKeyCache = new WeakMap<Water3D, string>();
const waterKey = (w: Water3D) => { let k = waterKeyCache.get(w); if (k == null) { k = JSON.stringify(w); waterKeyCache.set(w, k); } return k; };
const Water = React.memo(WaterBody, (a, b) => a.i === b.i && a.scales === b.scales && a.mainCoping === b.mainCoping && a.mainWaterline === b.mainWaterline && (a.w === b.w || waterKey(a.w) === waterKey(b.w)));
function WaterBody({ w, i, scales, mainCoping, mainWaterline }: { w: Water3D; i: number; scales: SceneScales; mainCoping?: string; mainWaterline?: string }) {
  const c = React.useMemo(() => waterCenter(w.pts), [w.pts]);
  const local = React.useMemo(() => denseRing(w.pts.map((p) => ({ x: p.x - c.x, y: p.z - c.z }))).map((p, k) => ({ ...p, id: `${w.itemId ?? i}-p${k}` })), [w.pts, c, w.itemId, i]);
  const curve = React.useMemo(() => local.map((p) => ({ x: p.x, z: p.y })), [local]);
  const depthAt = React.useCallback((x: number, z: number) => Math.max(0.05, waterDepthAt(w, x + c.x, z + c.z)), [w, c]);
  const perimeter = React.useMemo(() => curve.map((p, k) => ({ x: p.x, z: p.z, depth: depthAt(p.x, p.z), id: `pd-${k}`, type: "smooth" as const })), [curve, depthAt]);
  const deep = React.useMemo(() => Math.max(...perimeter.map((p) => p.depth), w.depth), [perimeter, w.depth]);
  const dims = React.useMemo(() => { const xs = local.map((p) => p.x), ys = local.map((p) => p.y); return { length: Math.max(...ys) - Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), depth: deep }; }, [local, deep]);
  const waterGeo = React.useMemo(() => { const g = new THREE.ShapeGeometry(new THREE.Shape(curve.map((p) => new THREE.Vector2(p.x, -p.z)))); g.rotateX(-Math.PI / 2); return g; }, [curve]);
  const copingH = w.copingHeight ?? 2 / 12;
  const pick = (part: WaterPart) => (e: any) => { if (e.delta > 4) return; select({ type: "water", i, part })(e); };
  const setAssets = (patch: Partial<Water3D>) => updateBoard3D((d) => ({ ...d, waters: (d.waters ?? []).map((x, k) => (k === i ? { ...x, ...patch } : x)) }));
  return (
    <group name={`board-${w.kind}`} position={[c.x, 0, c.z]}>
      <group onClick={pick("pool")}>
        <PoolMesh points={local as any} depthPoints={[]} perimeterDepthPoints={perimeter} floorDepthAt={depthAt}
          linerTextureUrl={urlOr(w.finish, BASE_FINISH)!} linerTextureScale={w.finishScale ?? scales.finish} poolDimensions={dims} copingHeight={copingH} />
      </group>
      <group onClick={pick("coping")}>
        <CopingGeometry poolPoints={curve} copingWidth={w.copingWidth} copingHeight={copingH} textureUrl={urlOr(w.coping, mainCoping)} textureScale={w.copingScale ?? scales.coping} />
      </group>
      <group onClick={pick("waterline")}>
        <WaterlineMesh poolPoints={local as any} wallCurve={curve} waterlineTextureUrl={urlOr(w.waterline, mainWaterline)} waterlineTextureScale={w.waterlineScale ?? scales.waterline} copingHeight={copingH} />
      </group>
      {!w.waterOff && <mesh geometry={waterGeo} material={sharedWater()} position={[0, -0.25, 0]} renderOrder={10} raycast={() => null} />}
      <PoolAssetsRenderer poolPoints={local as any} poolDepth={deep} getFloorDepthAt={depthAt}
        stairs={w.stairs ?? []} onStairsChange={(stairs) => setAssets({ stairs })}
        chairs={w.chairs ?? []} onChairsChange={(chairs) => setAssets({ chairs })}
        contourSeating={w.seating ?? []} onContourSeatingChange={(seating) => setAssets({ seating })}
        selectedAssetId={null} onSelectAsset={() => {}} />
    </group>
  );
}

/**
 * Turf / deck pieces from the board. Every pool and spa (main + extras, each
 * with its coping/deck ring) is cut out per fragment with the same even-odd
 * segment test the ground uses, so turf never covers water.
 */
function holeMaterial(color: string, rough: number, holes: XZ[][]) {
  return applyHoleCut(new THREE.MeshStandardMaterial({ color, roughness: rough, polygonOffset: true, polygonOffsetFactor: -2 }), holes);
}
/**
 * Drawn deck = the pool deck's own technology (DeckBorderGeometry): solid slab
 * from buildSlabGeometry (top/bottom faces + vertical skirts, 1×1 ft world UVs),
 * Phong paver material (shininess 40, DoubleSide) loaded through textureCache,
 * with the same hole-cut shader. Credits: Imagine Engine Studios Corp.
 */
function DrawnDeck({ s, holes, holesKey, scale }: { s: Surface3D; holes: XZ[][]; holesKey: string; scale: number }) {
  const [tex, setTex] = React.useState<THREE.Texture | null>(null);
  React.useEffect(() => {
    if (!s.image || !isUrl(s.image)) { setTex(null); return; }
    let off = false;
    textureCache.loadTexture(s.image, { x: 1 / scale, y: 1 / scale }).then((t) => {
      if (off) return;
      t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; setTex(t);
    }).catch(() => {});
    return () => { off = true; };
  }, [s.image, scale]);
  const geo = React.useMemo(() => {
    const parts = s.regions.filter((r) => r[0]?.length >= 3).map((r) =>
      buildSlabGeometry({ subject: r[0], holes: r.slice(1), topY: 0, bottomY: -DECK_SLAB_FT }));
    if (!parts.length) return null;
    return parts.length === 1 ? parts[0] : mergeGeometries(parts) ?? parts[0];
  }, [s.regions]);
  if (!geo) return null;
  return (
    <mesh key={tex?.uuid || "no-deck-texture"} geometry={geo} castShadow receiveShadow>
      <meshPhongMaterial
        // Regions are already clipped against the exact main/extra deck and
        // coping outlines. A second approximate shader cut created grass gaps.
        map={tex} color={tex ? "#ffffff" : s.color || "#d9d4cc"} shininess={40} side={THREE.DoubleSide}
      />
    </mesh>
  );
}
function Surface({ s, holes, holesKey, scale }: { s: Surface3D; holes: XZ[][]; holesKey: string; scale: number }) {
  if (s.kind === "deck") return <DrawnDeck s={s} holes={holes} holesKey={holesKey} scale={scale} />;
  return <TurfSurface s={s} holes={holes} holesKey={holesKey} />;
}
function TurfSurface({ s, holes, holesKey }: { s: Surface3D; holes: XZ[][]; holesKey: string }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mat = React.useMemo(() => {
    /* Turf regions arrive pre-clipped (netRegions) — a second shader cut caused triangular voids. */
    const m = (s.kind === "turf" ? new THREE.MeshStandardMaterial({ color: s.color, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }) : holeMaterial(s.color, 0.85, holes)) as THREE.MeshStandardMaterial;
    /* Selected turf photo at 4 ft per tile, same scale as the 2D board. */
    /* Turf photo every 4 ft; drawn decks use the pool deck's 1×1 ft paver scale. */
    if (s.image && "map" in m) { const tx = (photoMat(s.image, s.kind === "deck" ? 1 : 4, {}) as THREE.MeshStandardMaterial).map; if (tx) { m.map = tx; m.color = s.kind === "turf" ? new THREE.Color(s.color).lerp(new THREE.Color("#ffffff"), 0.45) : new THREE.Color("#ffffff"); m.needsUpdate = true; } }
    return m;
  }, [s.color, s.kind, s.image, holesKey]);
  const geo = React.useMemo(() => {
    const shapes = s.regions.filter((r) => r[0]?.length >= 3).map((r) => {
      const sh = new THREE.Shape(r[0].map((p) => new THREE.Vector2(p.x, -p.z)));
      r.slice(1).forEach((h) => sh.holes.push(new THREE.Path(h.map((p) => new THREE.Vector2(p.x, -p.z)))));
      return sh;
    });
    if (!shapes.length) return null;
    /* Drawn decks = same slab as the pool deck: 3" thick with side skirt. */
    const g = s.kind === "deck" ? new THREE.ExtrudeGeometry(shapes, { depth: DECK_SLAB_FT, bevelEnabled: false }) : new THREE.ShapeGeometry(shapes);
    g.rotateX(-Math.PI / 2); return planarUV(g);
  }, [s.regions, s.kind]);
  if (!geo) return null;
  return <mesh geometry={geo} material={mat} position={[0, s.kind === "turf" ? 0.04 : 0, 0]} castShadow={s.kind === "deck"} receiveShadow />;
}
/** Deck slab thickness (3 in), same as the pool's own deck border. */
const DECK_SLAB_FT = 0.25;

/** mainCoping/mainWaterline: extra pools without their own chosen texture inherit the main pool's (never a plain white ring). */
export function BoardElements3D({ holes = [], scales = DEFAULT_SCALES, mainCoping, mainWaterline }: { holes?: XZ[][]; scales?: SceneScales; mainCoping?: string; mainWaterline?: string }) {
  const [data, setData] = React.useState<Board3D | null>(() => loadBoard3D());
  const invalidate = useThree((st) => st.invalidate);
  // The studio renders on demand: redraw as soon as a widget edits a piece.
  React.useEffect(() => { invalidate(); }, [data, invalidate]);
  // Key by content so a new-but-equal holes array never recomputes rings or recompiles shaders.
  const holesIn = React.useMemo(() => holes, [JSON.stringify(holes)]); // eslint-disable-line react-hooks/exhaustive-deps
  const allHoles = React.useMemo(() => [...holesIn, ...(data?.waters ?? []).filter((w) => w.pts.length >= 3).map((w) => mitredOffsetRing(denseRing(w.pts.map((p) => ({ x: p.x, y: p.z }))).map((p) => ({ x: p.x, z: p.y })), Math.max(0.1, (w.copingWidth || 1) - 0.02)).offset)], [holesIn, data?.waters]);
  const holesKey = React.useMemo(() => allHoles.map((h) => h.map((p) => `${p.x.toFixed(1)},${p.z.toFixed(1)}`).join("|")).join("#"), [allHoles]);
  React.useEffect(() => {
    const on = () => setData(loadBoard3D());
    window.addEventListener(BOARD_3D_EVENT, on);
    window.addEventListener("storage", on);
    return () => { window.removeEventListener(BOARD_3D_EVENT, on); window.removeEventListener("storage", on); };
  }, []);
  if (!data) return null;
  return (
    <group name="global-design-board">
      {data.surfaces.map((s, i) => s.kind === "deck"
        ? <group key={`s${i}`} onClick={select({ type: "deck", i })}><Surface s={s} holes={allHoles} holesKey={holesKey} scale={s.scale ?? scales.paver} /></group>
        : <Surface key={`s${i}`} s={s} holes={allHoles} holesKey={holesKey} scale={s.scale ?? scales.paver} />)}
      {data.fences.map((f, i) => <Fence key={`f${i}`} f={f} i={i} />)}
      {data.screens.map((s, i) => <Screen key={`c${i}`} s={s} i={i} />)}
      {(data.waters ?? []).map((w, i) => <Water key={w.itemId ?? `w${i}`} w={w} i={i} scales={scales} mainCoping={mainCoping} mainWaterline={mainWaterline} />)}
    </group>
  );
}

export default BoardElements3D;
