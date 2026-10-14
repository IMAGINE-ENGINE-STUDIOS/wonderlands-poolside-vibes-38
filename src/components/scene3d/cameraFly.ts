/**
 * Smooth camera flights for OrbitControls. Every programmatic camera move
 * in the 3D viewer goes through here so the view glides (ease-in-out) from
 * where it is to where it's going — never a teleport.
 */
import * as THREE from 'three';

const active = new WeakMap<object, number>();

export function flyCamera(
  controls: any,
  position: [number, number, number],
  target: [number, number, number],
  durationMs = 1000,
) {
  if (!controls?.object) return;
  const cam: THREE.Camera = controls.object;
  const prev = active.get(controls);
  if (prev) cancelAnimationFrame(prev);
  const p0 = cam.position.clone();
  const t0 = controls.target.clone();
  const p1 = new THREE.Vector3(...position);
  const t1 = new THREE.Vector3(...target);
  const start = performance.now();
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const step = () => {
    const t = Math.min(1, (performance.now() - start) / durationMs);
    const e = ease(t);
    cam.position.lerpVectors(p0, p1, e);
    controls.target.lerpVectors(t0, t1, e);
    controls.update?.();
    if (t < 1) active.set(controls, requestAnimationFrame(step));
    else active.delete(controls);
  };
  active.set(controls, requestAnimationFrame(step));
}
