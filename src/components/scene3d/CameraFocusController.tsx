import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface FocusRequest {
  /** World position to center on */
  position: [number, number, number];
  /** Desired distance from the target (feet). Defaults to 14. */
  distance?: number;
  /** Monotonic token so repeated focuses on the same spot still fire */
  token: number;
}

interface CameraFocusControllerProps {
  request: FocusRequest | null;
  controlsRef: React.RefObject<any>;
  durationMs?: number;
}

/**
 * Smoothly flies the orbit camera so the requested world position sits in the
 * center of the viewport. Keeps the current viewing angle, only re-centering
 * and normalizing the distance so dropped assets are always framed.
 */
export function CameraFocusController({
  request,
  controlsRef,
  durationMs = 1100
}: CameraFocusControllerProps) {
  const { camera, invalidate } = useThree();
  const rafRef = useRef<number | null>(null);
  const lastToken = useRef<number | null>(null);

  useEffect(() => {
    if (!request || request.token === lastToken.current) return;
    lastToken.current = request.token;

    const controls = controlsRef.current;
    const targetPoint = new THREE.Vector3(...request.position);

    // Preserve current orbit direction, just re-center and normalize distance.
    const currentTarget: THREE.Vector3 = controls?.target
      ? controls.target.clone()
      : new THREE.Vector3(0, 0, 0);
    const dir = camera.position.clone().sub(currentTarget);
    const currentDistance = dir.length();
    if (dir.lengthSq() < 0.0001) dir.set(1, 1, 1);
    dir.normalize();
    // Only nudge the elevation if the view is almost edge-on, so the angle
    // never snaps noticeably.
    if (dir.y < 0.12) {
      dir.y = 0.12;
      dir.normalize();
    }

    // Blend toward the requested distance instead of forcing it — avoids
    // abrupt zoom jumps when the user is already framed well.
    const requested = Math.max(6, request.distance ?? 14);
    const distance = currentDistance > 0.01
      ? THREE.MathUtils.clamp(currentDistance * 0.55 + requested * 0.45, requested * 0.75, Math.max(requested * 1.6, currentDistance))
      : requested;


    const startPos = camera.position.clone();
    const endPos = targetPoint.clone().add(dir.multiplyScalar(distance));
    const startTarget = currentTarget.clone();
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const e = easeInOutCubic(t);

      camera.position.lerpVectors(startPos, endPos, e);
      if (controls?.target) {
        controls.target.lerpVectors(startTarget, targetPoint, e);
        controls.update?.();
      } else {
        camera.lookAt(targetPoint);
      }
      invalidate();

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [request, controlsRef, camera, invalidate, durationMs]);

  return null;
}

export default CameraFocusController;
