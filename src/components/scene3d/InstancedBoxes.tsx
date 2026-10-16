/**
 * InstancedBoxes — draws many boxes sharing one material in a single draw call.
 * Used by fences (posts, caps, pickets, rails) and screen enclosures (posts,
 * purlins, beams) where hundreds of identical boxes used to be separate meshes.
 * Each box keeps its exact size, position and yaw, so visuals are unchanged.
 *
 * © Imagine Engine Studios Corp — Wonderlands 3D Studio.
 */
import * as React from "react";
import * as THREE from "three";

export interface BoxInstance { x: number; y: number; z: number; sx: number; sy: number; sz: number; ry?: number }

/** One shared unit cube for every instanced box in the app. */
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
const tmp = new THREE.Object3D();

/** Box spanning a→b at height y (replaces the old per-segment Beam mesh). */
export const beamBox = (a: { x: number; z: number }, b: { x: number; z: number }, y: number, h: number, t: number): BoxInstance => ({
  x: (a.x + b.x) / 2, y, z: (a.z + b.z) / 2,
  sx: Math.max(1e-3, Math.hypot(b.x - a.x, b.z - a.z)), sy: h, sz: t,
  ry: -Math.atan2(b.z - a.z, b.x - a.x),
});

export function InstancedBoxes({ boxes, material, castShadow = false }: { boxes: BoxInstance[]; material: THREE.Material; castShadow?: boolean }) {
  const ref = React.useRef<THREE.InstancedMesh>(null);
  React.useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    boxes.forEach((b, i) => {
      tmp.position.set(b.x, b.y, b.z);
      tmp.rotation.set(0, b.ry ?? 0, 0);
      tmp.scale.set(b.sx, b.sy, b.sz);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    });
    m.count = boxes.length;
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [boxes]);
  if (!boxes.length) return null;
  // key on length so the instance buffer is sized exactly
  return <instancedMesh key={boxes.length} ref={ref} args={[UNIT_BOX, material, boxes.length]} castShadow={castShadow} />;
}
