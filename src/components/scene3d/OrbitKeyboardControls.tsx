import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbitKeyboardControlsProps {
  enabled?: boolean;
  controlsRef: React.RefObject<any>;
  /** Feet per second at normal speed */
  moveSpeed?: number;
}

const isTypingTarget = (el: EventTarget | null) => {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    node.isContentEditable === true
  );
};

/**
 * Keyboard navigation for the orbit camera:
 * - W/S or Up/Down  : move forward / backward along the view direction
 * - A/D or Left/Right: strafe left / right
 * - Q/E or PageUp/Dn : move down / up
 * - Shift            : 3x speed, Alt: 0.35x precision speed
 * - Z / X            : zoom in / out toward the orbit target
 */
export function OrbitKeyboardControls({
  enabled = true,
  controlsRef,
  moveSpeed = 18
}: OrbitKeyboardControlsProps) {
  const { camera, invalidate } = useThree();
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!enabled) {
      keys.current = {};
      return;
    }

    const tracked = new Set([
      'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyZ', 'KeyX',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown',
      'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight'
    ]);

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || !tracked.has(e.code)) return;
      keys.current[e.code] = true;
      if (e.code.startsWith('Arrow') || e.code.startsWith('Page')) e.preventDefault();
      invalidate();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (!tracked.has(e.code)) return;
      keys.current[e.code] = false;
    };
    const onBlur = () => { keys.current = {}; };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [enabled, invalidate]);

  useFrame((_state, delta) => {
    if (!enabled) return;
    const k = keys.current;

    const forwardInput = (k.KeyW || k.ArrowUp ? 1 : 0) + (k.KeyS || k.ArrowDown ? -1 : 0);
    const strafeInput = (k.KeyD || k.ArrowRight ? 1 : 0) + (k.KeyA || k.ArrowLeft ? -1 : 0);
    const verticalInput = (k.KeyE || k.PageUp ? 1 : 0) + (k.KeyQ || k.PageDown ? -1 : 0);
    const zoomInput = (k.KeyZ ? 1 : 0) + (k.KeyX ? -1 : 0);

    if (!forwardInput && !strafeInput && !verticalInput && !zoomInput) return;

    const speedMultiplier = (k.ShiftLeft || k.ShiftRight) ? 3 : (k.AltLeft || k.AltRight) ? 0.35 : 1;
    const step = moveSpeed * speedMultiplier * Math.min(delta, 0.05);

    const controls = controlsRef.current;
    const target: THREE.Vector3 | null = controls?.target ?? null;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 0.0001) forward.set(0, 0, -1);
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const move = new THREE.Vector3();
    move.addScaledVector(forward, forwardInput * step);
    move.addScaledVector(right, strafeInput * step);
    move.y += verticalInput * step;

    camera.position.add(move);
    if (target) target.add(move);

    // Dolly toward / away from the orbit target
    if (zoomInput && target) {
      const toTarget = target.clone().sub(camera.position);
      const dist = toTarget.length();
      const nextDist = THREE.MathUtils.clamp(dist - zoomInput * step, 3, 400);
      camera.position.copy(target.clone().sub(toTarget.normalize().multiplyScalar(nextDist)));
    }

    controls?.update?.();
    invalidate();
  });

  return null;
}

export default OrbitKeyboardControls;
