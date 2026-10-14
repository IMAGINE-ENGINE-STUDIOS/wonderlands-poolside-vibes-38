/**
 * Draws the Global Design Board V2 hand-off in the 3D Studio: fences (posts
 * every 6 ft, rails, pickets / privacy panels / glass at the chosen height and
 * color), screen enclosures (posts, header beam, translucent mesh walls and
 * roof) and turf / deck surfaces with pools, spas and decks cut out exactly.
 * Imagine Engine Studios Corp.
 */
import * as React from "react";
import * as THREE from "three";
import { loadBoard3D, BOARD_3D_EVENT, type Board3D, type Fence3D, type Screen3D, type Surface3D } from "@/lib/design/board3D";

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

function Fence({ f }: { f: Fence3D }) {
  const metal = React.useMemo(() => new THREE.MeshStandardMaterial({ color: f.color, roughness: 0.45, metalness: 0.5 }), [f.color]);
  const panel = React.useMemo(() => f.style === "glass"
    ? new THREE.MeshPhysicalMaterial({ color: "#cfe9ef", transparent: true, opacity: 0.3, roughness: 0.05 })
    : new THREE.MeshStandardMaterial({ color: f.color, roughness: 0.7 }), [f.style, f.color]);
  const H = f.height;
  const posts = along(f.pts, 6, false);
  const pickets = f.style === "alu" ? along(f.pts, 0.33, false) : [];
  return (
    <group name="board-fence">
      {posts.map((p, i) => <mesh key={i} material={metal} position={[p.x, H / 2, p.z]} castShadow><boxGeometry args={[0.2, H + 0.15, 0.2]} /></mesh>)}
      {segs(f.pts, false).map(([a, b], i) => f.style === "alu"
        ? <React.Fragment key={i}><Beam a={a} b={b} y={H - 0.1} h={0.1} t={0.08} mat={metal} /><Beam a={a} b={b} y={0.35} h={0.1} t={0.08} mat={metal} /></React.Fragment>
        : <Beam key={i} a={a} b={b} y={H / 2} h={H - 0.1} t={f.style === "glass" ? 0.04 : 0.1} mat={panel} />)}
      {pickets.map((p, i) => <mesh key={`p${i}`} material={metal} position={[p.x, H / 2, p.z]}><boxGeometry args={[0.06, H - 0.1, 0.06]} /></mesh>)}
    </group>
  );
}

function Screen({ s }: { s: Screen3D }) {
  const frame = React.useMemo(() => new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.5, metalness: 0.4 }), [s.color]);
  const mesh = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#2a2a2a", transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }), []);
  const roofGeo = React.useMemo(() => {
    if (s.pts.length < 3) return null;
    const g = new THREE.ShapeGeometry(new THREE.Shape(s.pts.map((p) => new THREE.Vector2(p.x, -p.z))));
    g.rotateX(-Math.PI / 2); return g;
  }, [s.pts]);
  const H = s.height;
  return (
    <group name="board-screen">
      {along(s.pts, 6, true).map((p, i) => <mesh key={i} material={frame} position={[p.x, H / 2, p.z]} castShadow><boxGeometry args={[0.25, H, 0.25]} /></mesh>)}
      {segs(s.pts, true).map(([a, b], i) => (
        <React.Fragment key={i}>
          <Beam a={a} b={b} y={H} h={0.4} t={0.25} mat={frame} />
          <Beam a={a} b={b} y={3} h={0.15} t={0.15} mat={frame} />
          <Beam a={a} b={b} y={H / 2} h={H} t={0.02} mat={mesh} />
        </React.Fragment>
      ))}
      {roofGeo && <mesh geometry={roofGeo} material={mesh} position={[0, H, 0]} />}
    </group>
  );
}

function Surface({ s }: { s: Surface3D }) {
  const mat = React.useMemo(() => new THREE.MeshStandardMaterial({ color: s.color, roughness: s.kind === "turf" ? 1 : 0.85 }), [s.color, s.kind]);
  const geo = React.useMemo(() => {
    const shapes = s.regions.filter((r) => r[0]?.length >= 3).map((r) => {
      const sh = new THREE.Shape(r[0].map((p) => new THREE.Vector2(p.x, -p.z)));
      r.slice(1).forEach((h) => sh.holes.push(new THREE.Path(h.map((p) => new THREE.Vector2(p.x, -p.z)))));
      return sh;
    });
    if (!shapes.length) return null;
    const g = new THREE.ShapeGeometry(shapes); g.rotateX(-Math.PI / 2); return g;
  }, [s.regions]);
  if (!geo) return null;
  return <mesh geometry={geo} material={mat} position={[0, s.kind === "turf" ? 0.04 : 0.08, 0]} receiveShadow />;
}

export function BoardElements3D() {
  const [data, setData] = React.useState<Board3D | null>(() => loadBoard3D());
  React.useEffect(() => {
    const on = () => setData(loadBoard3D());
    window.addEventListener(BOARD_3D_EVENT, on);
    window.addEventListener("storage", on);
    return () => { window.removeEventListener(BOARD_3D_EVENT, on); window.removeEventListener("storage", on); };
  }, []);
  if (!data) return null;
  return (
    <group name="global-design-board">
      {data.surfaces.map((s, i) => <Surface key={`s${i}`} s={s} />)}
      {data.fences.map((f, i) => <Fence key={`f${i}`} f={f} />)}
      {data.screens.map((s, i) => <Screen key={`c${i}`} s={s} />)}
    </group>
  );
}

export default BoardElements3D;
