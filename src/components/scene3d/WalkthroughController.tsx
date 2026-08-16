import { useRef, useEffect, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WalkthroughControllerProps {
  enabled: boolean;
  onExit: () => void;
  groundLevel?: number;
  playerHeight?: number;
  moveSpeed?: number;
}

export function WalkthroughController({
  enabled,
  onExit,
  groundLevel = 0,
  playerHeight = 5.5, // 5.5 feet eye height
  moveSpeed = 8
}: WalkthroughControllerProps) {
  const { camera, gl } = useThree();
  
  // Movement state
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  // Vertical / jump state
  const verticalVelocity = useRef(0);
  const isGrounded = useRef(true);
  const GRAVITY = 32; // ft/s^2
  const JUMP_VELOCITY = 13; // ft/s -> ~2.6ft hop
  
  // Input state
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
  });
  
  // Mouse look state
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isPointerLocked = useRef(false);
  
  // Mobile touch state
  const touchStartPos = useRef({ x: 0, y: 0 });
  const [isMobile] = useState(() => 'ontouchstart' in window);
  const joystickRef = useRef({ x: 0, y: 0, active: false });
  const lookTouchId = useRef<number | null>(null);
  const moveTouchId = useRef<number | null>(null);


  // Initialize camera position when enabled
  useEffect(() => {
    if (enabled) {
      // Start at a good viewing position
      camera.position.set(0, groundLevel + playerHeight, 20);
      euler.current.setFromQuaternion(camera.quaternion);
      
      // Request pointer lock on desktop
      if (!isMobile) {
        gl.domElement.requestPointerLock?.();
      }
    }
  }, [enabled, camera, groundLevel, playerHeight, gl.domElement, isMobile]);

  // Keyboard controls
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'Space':
          e.preventDefault();
          if (isGrounded.current) {
            verticalVelocity.current = JUMP_VELOCITY;
            isGrounded.current = false;
          }
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = true;
          break;
        case 'Escape':
          onExit();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.sprint = false;
          break;
      }
    };


    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, onExit]);

  // Mouse look controls
  useEffect(() => {
    if (!enabled || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      
      const sensitivity = 0.002;
      euler.current.y -= e.movementX * sensitivity;
      euler.current.x -= e.movementY * sensitivity;
      
      // Clamp vertical rotation
      euler.current.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.current.x));
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement;
    };

    const handleClick = () => {
      if (!isPointerLocked.current) {
        gl.domElement.requestPointerLock?.();
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      gl.domElement.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.exitPointerLock?.();
    };
  }, [enabled, gl.domElement, isMobile]);

  // Touch controls for mobile
  useEffect(() => {
    if (!enabled || !isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      for (const touch of Array.from(e.changedTouches)) {
        const x = touch.clientX;
        const screenWidth = window.innerWidth;
        
        if (x < screenWidth / 2 && moveTouchId.current === null) {
          // Left side - movement joystick
          moveTouchId.current = touch.identifier;
          joystickRef.current = { x: 0, y: 0, active: true };
          touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        } else if (x >= screenWidth / 2 && lookTouchId.current === null) {
          // Right side - look control
          lookTouchId.current = touch.identifier;
          touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === moveTouchId.current) {
          // Update joystick
          const dx = touch.clientX - touchStartPos.current.x;
          const dy = touch.clientY - touchStartPos.current.y;
          const maxDist = 50;
          joystickRef.current.x = Math.max(-1, Math.min(1, dx / maxDist));
          joystickRef.current.y = Math.max(-1, Math.min(1, dy / maxDist));
        } else if (touch.identifier === lookTouchId.current) {
          // Update look
          const sensitivity = 0.003;
          const dx = touch.clientX - touchStartPos.current.x;
          const dy = touch.clientY - touchStartPos.current.y;
          euler.current.y -= dx * sensitivity;
          euler.current.x -= dy * sensitivity;
          euler.current.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.current.x));
          touchStartPos.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === moveTouchId.current) {
          moveTouchId.current = null;
          joystickRef.current = { x: 0, y: 0, active: false };
        } else if (touch.identifier === lookTouchId.current) {
          lookTouchId.current = null;
        }
      }
    };

    gl.domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    gl.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    gl.domElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      gl.domElement.removeEventListener('touchstart', handleTouchStart);
      gl.domElement.removeEventListener('touchmove', handleTouchMove);
      gl.domElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, gl.domElement, isMobile]);

  // Animation frame - movement and physics
  useFrame((state, delta) => {
    if (!enabled) return;

    // Apply rotation to camera
    camera.quaternion.setFromEuler(euler.current);

    // Get movement direction
    direction.current.set(0, 0, 0);

    // Keyboard input
    if (keys.current.forward) direction.current.z -= 1;
    if (keys.current.backward) direction.current.z += 1;
    if (keys.current.left) direction.current.x -= 1;
    if (keys.current.right) direction.current.x += 1;

    // Mobile joystick input
    if (isMobile && joystickRef.current.active) {
      direction.current.x += joystickRef.current.x;
      direction.current.z += joystickRef.current.y;
    }

    // Normalize and apply movement
    if (direction.current.length() > 0) {
      direction.current.normalize();
      
      // Transform direction by camera rotation (only Y axis)
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();
      
      const right = new THREE.Vector3();
      right.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();
      
      const moveX = right.x * direction.current.x + cameraDirection.x * (-direction.current.z);
      const moveZ = right.z * direction.current.x + cameraDirection.z * (-direction.current.z);
      
      const speed = moveSpeed * (keys.current.sprint ? 2 : 1);
      velocity.current.x = moveX * speed;
      velocity.current.z = moveZ * speed;
    } else {
      // Decelerate
      velocity.current.x *= 0.9;
      velocity.current.z *= 0.9;
    }

    // Horizontal movement
    camera.position.x += velocity.current.x * delta;
    camera.position.z += velocity.current.z * delta;

    // Vertical movement - gravity + jumping
    const floorY = groundLevel + playerHeight;
    if (!isGrounded.current || verticalVelocity.current !== 0) {
      verticalVelocity.current -= GRAVITY * delta;
      camera.position.y += verticalVelocity.current * delta;
      if (camera.position.y <= floorY) {
        camera.position.y = floorY;
        verticalVelocity.current = 0;
        isGrounded.current = true;
      }
    } else {
      camera.position.y = floorY;
    }


    // Boundary limits (keep within reasonable area)
    const boundary = 100;
    camera.position.x = Math.max(-boundary, Math.min(boundary, camera.position.x));
    camera.position.z = Math.max(-boundary, Math.min(boundary, camera.position.z));
  });

  return null;
}

// Mobile UI overlay for walkthrough controls
export function WalkthroughMobileUI({ enabled, onExit }: { 
  enabled: boolean; 
  onExit: () => void;
}) {
  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Exit button */}
      <button
        onClick={onExit}
        className="absolute top-4 right-4 pointer-events-auto bg-black/50 text-white px-4 py-2 rounded-lg"
      >
        Exit Walkthrough
      </button>

      {/* Jump button */}
      <button
        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))}
        className="absolute bottom-24 right-6 pointer-events-auto bg-white/15 backdrop-blur text-white w-20 h-20 rounded-full border border-white/30 text-sm font-medium"
      >
        Jump
      </button>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 pointer-events-none text-white/70 text-sm">
        <p>Left side: Move</p>
        <p>Right side: Look</p>
        <p>Jump button / Space: Jump</p>
      </div>
    </div>

  );
}
