/**
 * Draws the landscaping plan handed off from the Landscape Studio ("View in 3D")
 * as real-size stylised plants: trees (trunk + canopy), palms (trunk + fronds),
 * mounds, grasses, spikes and ground covers, plus mulch beds. Sizes come from
 * plantSpecs, so a 25 ft tree stands 25 ft next to the pool.
 */
import * as React from "react";
import * as THREE from "three";
import { loadLandscape3D, LANDSCAPE_3D_EVENT, type Landscape3D, type Plant3D } from "@/lib/landscape/landscape3D";

const trunk = new THREE.MeshStandardMaterial({ color: "#6b4f35", roughness: 0.9 });
const mulch = new THREE.MeshStandardMaterial({ color: "#4a3426", roughness: 1 });

function Plant({ p }: { p: Plant3D }) {
  const leaf = React.useMemo(() => new THREE.MeshStandardMaterial({ color: p.foliage, roughness: 0.8 }), [p.foliage]);
  const bloom = React.useMemo(() => (p.bloom ? new THREE.MeshStandardMaterial({ color: p.bloom, roughness: 0.6 }) : null), [p.bloom]);
  const r = p.spread / 2;
  switch (p.form) {
    case "tree":
      return (
        <group position={[p.x, 0, p.z]} rotation={[0, p.rot, 0]}>
          <mesh material={trunk} position={[0, p.h * 0.3, 0]}><cylinderGeometry args={[r * 0.06, r * 0.09, p.h * 0.6, 8]} /></mesh>
          <mesh material={leaf} position={[0, p.h * 0.68, 0]} scale={[1, (p.h * 0.32) / r, 1]}><sphereGeometry args={[r, 14, 10]} /></mesh>
        </group>
      );
    case "palm":
      return (
        <group position={[p.x, 0, p.z]} rotation={[0, p.rot, 0]}>
          <mesh material={trunk} position={[0, p.h * 0.45, 0]}><cylinderGeometry args={[0.35, 0.5, p.h * 0.9, 8]} /></mesh>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} material={leaf} position={[0, p.h * 0.9, 0]} rotation={[0, (i / 8) * Math.PI * 2, -1.1]}>
              <coneGeometry args={[r * 0.18, r, 4]} />
            </mesh>
          ))}
        </group>
      );
    case "grass":
    case "spike":
      return (
        <mesh material={bloom ?? leaf} position={[p.x, p.h / 2, p.z]} rotation={[0, p.rot, 0]}>
          <coneGeometry args={[r, p.h, 7]} />
        </mesh>
      );
    case "mat":
      return <mesh material={bloom ?? leaf} position={[p.x, 0.15, p.z]}><cylinderGeometry args={[r, r, 0.3, 12]} /></mesh>;
    default:
      return (
        <group position={[p.x, 0, p.z]}>
          <mesh material={leaf} position={[0, p.h * 0.45, 0]} scale={[1, (p.h * 0.55) / Math.max(r, 0.1), 1]}><sphereGeometry args={[r, 12, 8]} /></mesh>
          {bloom && <mesh material={bloom} position={[0, p.h * 0.85, 0]}><sphereGeometry args={[r * 0.45, 10, 6]} /></mesh>}
        </group>
      );
  }
}

function Bed({ points }: { points: { x: number; z: number }[] }) {
  const geo = React.useMemo(() => {
    if (points.length < 3) return null;
    const s = new THREE.Shape(points.map((p) => new THREE.Vector2(p.x, -p.z)));
    const g = new THREE.ShapeGeometry(s);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [points]);
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
