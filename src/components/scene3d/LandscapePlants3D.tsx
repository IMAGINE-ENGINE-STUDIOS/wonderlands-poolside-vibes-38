/**
 * Draws the landscaping plan handed off from the Landscape Studio ("View in 3D")
 * as real-size stylised plants: trees (trunk + canopy), palms (trunk + fronds),
 * mounds, grasses, spikes and ground covers, plus mulch beds. Sizes come from
 * plantSpecs, so a 25 ft tree stands 25 ft next to the pool.
 *
 * Performance: every plant shares unit geometries (scaled per mesh) and one
 * material per colour, so large plans don't allocate geometry/shaders per plant.
 * © Imagine Engine Studios Corp — Wonderlands 3D Studio.
 */
import * as React from "react";
import * as THREE from "three";
import { loadLandscape3D, LANDSCAPE_3D_EVENT, type Landscape3D, type Plant3D } from "@/lib/landscape/landscape3D";

const trunk = new THREE.MeshStandardMaterial({ color: "#6b4f35", roughness: 0.9 });
const mulch = new THREE.MeshStandardMaterial({ color: "#4a3426", roughness: 1 });

// Shared unit geometries (radius 1 / height 1) — scaled per plant.
const SPHERE14 = new THREE.SphereGeometry(1, 14, 10);
const SPHERE12 = new THREE.SphereGeometry(1, 12, 8);
const SPHERE10 = new THREE.SphereGeometry(1, 10, 6);
const CONE7 = new THREE.ConeGeometry(1, 1, 7);
const CONE4 = new THREE.ConeGeometry(1, 1, 4);
const MAT12 = new THREE.CylinderGeometry(1, 1, 1, 12);
const TRUNK_TREE = new THREE.CylinderGeometry(0.06 / 0.09, 1, 1, 8); // top/bottom ratio of the old trunk
const TRUNK_PALM = new THREE.CylinderGeometry(0.7, 1, 1, 8);

/** One material per colour for the whole plan. */
const matCache = new Map<string, THREE.MeshStandardMaterial>();
const colorMat = (color: string, roughness: number) => {
  const k = `${color}|${roughness}`;
  let m = matCache.get(k);
  if (!m) { m = new THREE.MeshStandardMaterial({ color, roughness }); matCache.set(k, m); }
  return m;
};

const Plant = React.memo(function Plant({ p }: { p: Plant3D }) {
  const leaf = colorMat(p.foliage, 0.8);
  const bloom = p.bloom ? colorMat(p.bloom, 0.6) : null;
  const r = p.spread / 2;
  switch (p.form) {
    case "tree":
      return (
        <group position={[p.x, 0, p.z]} rotation={[0, p.rot, 0]}>
          <mesh geometry={TRUNK_TREE} material={trunk} position={[0, p.h * 0.3, 0]} scale={[r * 0.09, p.h * 0.6, r * 0.09]} />
          <mesh geometry={SPHERE14} material={leaf} position={[0, p.h * 0.68, 0]} scale={[r, p.h * 0.32, r]} />
        </group>
      );
    case "palm":
      return (
        <group position={[p.x, 0, p.z]} rotation={[0, p.rot, 0]}>
          <mesh geometry={TRUNK_PALM} material={trunk} position={[0, p.h * 0.45, 0]} scale={[0.5, p.h * 0.9, 0.5]} />
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} geometry={CONE4} material={leaf} position={[0, p.h * 0.9, 0]} rotation={[0, (i / 8) * Math.PI * 2, -1.1]} scale={[r * 0.18, r, r * 0.18]} />
          ))}
        </group>
      );
    case "grass":
    case "spike":
      return <mesh geometry={CONE7} material={bloom ?? leaf} position={[p.x, p.h / 2, p.z]} rotation={[0, p.rot, 0]} scale={[r, p.h, r]} />;
    case "mat":
      return <mesh geometry={MAT12} material={bloom ?? leaf} position={[p.x, 0.15, p.z]} scale={[r, 0.3, r]} />;
    default: {
      const rr = Math.max(r, 0.1);
      return (
        <group position={[p.x, 0, p.z]}>
          <mesh geometry={SPHERE12} material={leaf} position={[0, p.h * 0.45, 0]} scale={[r, (p.h * 0.55 / rr) * r, r]} />
          {bloom && <mesh geometry={SPHERE10} material={bloom} position={[0, p.h * 0.85, 0]} scale={r * 0.45} />}
        </group>
      );
    }
  }
});

function Bed({ points }: { points: { x: number; z: number }[] }) {
  const geo = React.useMemo(() => {
    if (points.length < 3) return null;
    const s = new THREE.Shape(points.map((p) => new THREE.Vector2(p.x, -p.z)));
    const g = new THREE.ShapeGeometry(s);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [points]);
  React.useEffect(() => () => geo?.dispose(), [geo]);
  if (!geo) return null;
  return <mesh geometry={geo} material={mulch} position={[0, 0.06, 0]} receiveShadow />;
}

export function LandscapePlants3D() {
  const [data, setData] = React.useState<Landscape3D | null>(() => loadLandscape3D());
  React.useEffect(() => {
    const on = () => setData(loadLandscape3D());
    window.addEventListener(LANDSCAPE_3D_EVENT, on);
    window.addEventListener("storage", on);
    return () => { window.removeEventListener(LANDSCAPE_3D_EVENT, on); window.removeEventListener("storage", on); };
  }, []);
  if (!data) return null;
  return (
    <group name="landscape-plan">
      {data.beds.map((b, i) => <Bed key={i} points={b.points} />)}
      {data.plants.map((p, i) => <Plant key={i} p={p} />)}
    </group>
  );
}

export default LandscapePlants3D;
