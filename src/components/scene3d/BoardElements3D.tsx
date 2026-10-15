/**
 * Draws the Global Design Board V2 hand-off in the 3D Studio: fences (posts
 * every 6 ft, rails, pickets / privacy panels / glass at the chosen height and
 * color), screen enclosures (posts, header beam, translucent mesh walls and
 * roof) and turf / deck surfaces with pools, spas and decks cut out exactly.
 * Imagine Engine Studios Corp.
 */
import * as React from "react";
import * as THREE from "three";
import { loadBoard3D, BOARD_3D_EVENT, type Board3D, type Fence3D, type Screen3D, type Surface3D, type Water3D, waterDepthAt, waterCenter, updateBoard3D } from "@/lib/design/board3D";
import { mitredOffsetRing } from "@/utils/polygonGeometry";
import { smoothCurvedRing } from "@/utils/deckSurface";
import { generateCurvedPoolPoints } from "@/utils/curveUtils";
import { PoolMesh } from "@/components/Pool3DScene";
import { CopingGeometry } from "./CopingGeometry";
import { WaterlineMesh } from "@/components/WaterlineMesh";
import { PoolAssetsRenderer } from "./PoolAssetsRenderer";
import { useThree } from "@react-three/fiber";
import { applyHoleCut } from "./holeCutShader";

/** Clicking a board element opens its widget (BoardElementEditor). */
export const BOARD_SELECT_EVENT = "studio3d:boardSelect";
export type WaterPart = "pool" | "coping" | "waterline" | "deck";
export type BoardSelection = { type: "fence" | "screen" | "water"; i: number; part?: WaterPart } | null;
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

/** Vinyl panel photo: one 6 ft panel per texture tile, tinted by the panel color. */
const vinylTex = (() => { let t: THREE.Texture | null = null; return () => { if (!t) { t = new THREE.TextureLoader().load((vinylFenceAsset as { url: string }).url); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; } return t; }; })();
const isVinyl = (s: string) => s === "vinyl";
function Fence({ f, i }: { f: Fence3D; i: number }) {
  const vinyl = isVinyl(f.style);
  const metal = React.useMemo(() => vinyl
    ? new THREE.MeshStandardMaterial({ color: f.postColor ?? "#ffffff", roughness: 0.45 })
    : metalMat(f.color), [f.color, f.postColor, vinyl]);
  const panel = React.useMemo(() => f.style === "glass"
    ? new THREE.MeshPhysicalMaterial({ color: "#cfe9ef", transparent: true, opacity: 0.3, roughness: 0.05 })
    : f.style === "alu" ? metalMat(f.color)
    : vinyl ? new THREE.MeshStandardMaterial({ map: vinylTex(), color: f.color || "#ffffff", roughness: 0.5 })
    : new THREE.MeshStandardMaterial({ color: f.color, roughness: 0.7 }), [f.style, f.color, vinyl]);
  const H = f.height;
  const posts = along(f.pts, 6, false);
  const pickets = f.style === "alu" ? along(f.pts, 0.33, false) : [];
  return (
    <group name="board-fence" onClick={select({ type: "fence", i })}>
      {posts.map((p, i) => <mesh key={i} material={metal} position={[p.x, H / 2, p.z]} castShadow><boxGeometry args={vinyl ? [0.42, H + 0.25, 0.42] : [0.2, H + 0.15, 0.2]} /></mesh>)}
      {vinyl && posts.map((p, i) => <mesh key={`c${i}`} material={metal} position={[p.x, H + 0.18, p.z]}><boxGeometry args={[0.5, 0.12, 0.5]} /></mesh>)}
      {segs(f.pts, false).map(([a, b], i) => f.style === "alu"
        ? <React.Fragment key={i}><Beam a={a} b={b} y={H - 0.1} h={0.1} t={0.08} mat={metal} /><Beam a={a} b={b} y={0.35} h={0.1} t={0.08} mat={metal} /></React.Fragment>
        : <Beam key={i} a={a} b={b} y={H / 2} h={H - 0.1} t={f.style === "glass" ? 0.04 : 0.1} mat={panel} />)}
      {pickets.map((p, i) => <mesh key={`p${i}`} material={metal} position={[p.x, H / 2, p.z]}><boxGeometry args={[0.06, H - 0.1, 0.06]} /></mesh>)}
    </group>
  );
}

/** Florida-style pool cage: kick plate, chair rail, purlins every 3 ft, mansard roof. */
function Screen({ s, i }: { s: Screen3D; i: number }) {
  const frame = React.useMemo(() => metalMat(s.color), [s.color]);
  const kick = React.useMemo(() => new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.35, metalness: 0.8 }), [s.color]);
  const mesh = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#1c1c1c", transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }), []);
  const H = s.height;
  const mansard = (s.roof ?? "mansard") === "mansard" && s.pts.length >= 3;
  const RISE = mansard ? Math.min(4, H * 0.3) : 0;
  const top = React.useMemo(() => (mansard ? mitredOffsetRing(s.pts, -Math.min(4, H * 0.35)).offset : s.pts), [s.pts, mansard, H]);
  const geo = React.useMemo(() => {
    if (s.pts.length < 3) return null;
    const pos: number[] = [];
    if (mansard) {
      const base = mitredOffsetRing(s.pts, -Math.min(4, H * 0.35)).base;
      for (let k = 0; k < base.length; k++) {
        const a = base[k], b = base[(k + 1) % base.length], c = top[(k + 1) % top.length], d = top[k];
        pos.push(a.x, H, a.z, b.x, H, b.z, c.x, H + RISE, c.z, a.x, H, a.z, c.x, H + RISE, c.z, d.x, H + RISE, d.z);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [s.pts, top, mansard, H, RISE]);
  const lid = React.useMemo(() => {
    if (top.length < 3) return null;
    const g = new THREE.ShapeGeometry(new THREE.Shape(top.map((p) => new THREE.Vector2(p.x, -p.z)))); g.rotateX(-Math.PI / 2); return g;
  }, [top]);
  return (
    <group name="board-screen" onClick={select({ type: "screen", i })}>
      {along(s.pts, 6, true).map((p, k) => <mesh key={k} material={frame} position={[p.x, H / 2, p.z]} castShadow><boxGeometry args={[0.25, H, 0.25]} /></mesh>)}
      {along(s.pts, 3, true).map((p, k) => <mesh key={`m${k}`} material={frame} position={[p.x, H / 2, p.z]}><boxGeometry args={[0.08, H, 0.08]} /></mesh>)}
      {segs(s.pts, true).map(([a, b], k) => (
        <React.Fragment key={k}>
          <Beam a={a} b={b} y={H} h={0.4} t={0.25} mat={frame} />
          <Beam a={a} b={b} y={1} h={2} t={0.05} mat={kick} />
          <Beam a={a} b={b} y={3} h={0.15} t={0.15} mat={frame} />
          <Beam a={a} b={b} y={H / 2} h={H} t={0.02} mat={mesh} />
        </React.Fragment>
      ))}
      {mansard && segs(top, true).map(([a, b], k) => <Beam key={`t${k}`} a={a} b={b} y={H + RISE} h={0.25} t={0.2} mat={frame} />)}
      {geo && <mesh geometry={geo} material={mesh} />}
      {lid && <mesh geometry={lid} material={mesh} position={[0, H + RISE, 0]} />}
      {top.length >= 3 && along(top, 4, true).map((p, k) => <mesh key={`r${k}`} material={frame} position={[p.x, H + RISE + 0.1, p.z]}><boxGeometry args={[0.12, 0.2, 0.12]} /></mesh>)}
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
function Water({ w, i }: { w: Water3D; i: number }) {
  const c = React.useMemo(() => waterCenter(w.pts), [w.pts]);
  const local = React.useMemo(() => w.pts.map((p, k) => ({ x: p.x - c.x, y: p.z - c.z, id: `${w.itemId ?? i}-p${k}` })), [w.pts, c, w.itemId, i]);
  const curve = React.useMemo(() => smoothCurvedRing(generateCurvedPoolPoints(local.map((p) => ({ x: p.x, y: p.y })), 30, 0.3).map((p) => ({ x: p.x, z: p.y }))), [local]);
  const depthAt = React.useCallback((x: number, z: number) => Math.max(0.05, waterDepthAt(w, x + c.x, z + c.z)), [w, c]);
  const perimeter = React.useMemo(() => curve.map((p, k) => ({ x: p.x, z: p.z, depth: depthAt(p.x, p.z), id: `pd-${k}`, type: "smooth" as const })), [curve, depthAt]);
  const deep = React.useMemo(() => Math.max(...perimeter.map((p) => p.depth), w.depth), [perimeter, w.depth]);
  const dims = React.useMemo(() => { const xs = local.map((p) => p.x), ys = local.map((p) => p.y); return { length: Math.max(...ys) - Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), depth: deep }; }, [local, deep]);
  const waterGeo = React.useMemo(() => { const g = new THREE.ShapeGeometry(new THREE.Shape(curve.map((p) => new THREE.Vector2(p.x, -p.z)))); g.rotateX(-Math.PI / 2); return g; }, [curve]);
  const water = React.useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#58c4e0", transparent: true, opacity: 0.55, roughness: 0.05, transmission: 0.4 }), []);
  const copingH = w.copingHeight ?? 2 / 12;
  const pick = (part: WaterPart) => (e: any) => { if (e.delta > 4) return; select({ type: "water", i, part })(e); };
  const setAssets = (patch: Partial<Water3D>) => updateBoard3D((d) => ({ ...d, waters: (d.waters ?? []).map((x, k) => (k === i ? { ...x, ...patch } : x)) }));
  return (
    <group name={`board-${w.kind}`} position={[c.x, 0, c.z]}>
      <group onClick={pick("pool")}>
        <PoolMesh points={local as any} depthPoints={[]} perimeterDepthPoints={perimeter} floorDepthAt={depthAt}
          linerTextureUrl={urlOr(w.finish, BASE_FINISH)!} poolDimensions={dims} copingHeight={copingH} />
      </group>
      <group onClick={pick("coping")}>
        <CopingGeometry poolPoints={curve} copingWidth={w.copingWidth} copingHeight={copingH} textureUrl={urlOr(w.coping)} />
      </group>
      <group onClick={pick("waterline")}>
        <WaterlineMesh poolPoints={local as any} wallCurve={curve} waterlineTextureUrl={urlOr(w.waterline)} copingHeight={copingH} />
      </group>
      <mesh geometry={waterGeo} material={water} position={[0, -0.25, 0]} />
      <PoolAssetsRenderer poolPoints={local as any} poolDepth={deep} getFloorDepthAt={depthAt}
        stairs={w.stairs ?? []} onStairsChange={(stairs) => setAssets({ stairs })}
        chairs={[]} onChairsChange={() => {}}
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
function Surface({ s, holes, holesKey }: { s: Surface3D; holes: XZ[][]; holesKey: string }) {
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

export function BoardElements3D({ holes = [] }: { holes?: XZ[][] }) {
  const [data, setData] = React.useState<Board3D | null>(() => loadBoard3D());
  const invalidate = useThree((st) => st.invalidate);
  // The studio renders on demand: redraw as soon as a widget edits a piece.
  React.useEffect(() => { invalidate(); }, [data, invalidate]);
  const allHoles = React.useMemo(() => [...holes, ...(data?.waters ?? []).filter((w) => w.pts.length >= 3).map((w) => mitredOffsetRing(w.pts, (w.copingWidth || 1) + 0.05).offset)], [holes, data?.waters]);
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
      {data.surfaces.map((s, i) => <Surface key={`s${i}`} s={s} holes={allHoles} holesKey={holesKey} />)}
      {data.fences.map((f, i) => <Fence key={`f${i}`} f={f} i={i} />)}
      {data.screens.map((s, i) => <Screen key={`c${i}`} s={s} i={i} />)}
      {(data.waters ?? []).map((w, i) => <Water key={w.itemId ?? `w${i}`} w={w} i={i} />)}
    </group>
  );
}

export default BoardElements3D;
