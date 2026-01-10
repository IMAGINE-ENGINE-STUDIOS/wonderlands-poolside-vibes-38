import { useEffect, useLayoutEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Hook that guarantees scene invalidation AFTER React has committed a texture state change.
 * This solves the issue where invalidate() is called before the texture is in the R3F tree.
 * 
 * Uses useLayoutEffect to ensure invalidation happens in the same frame as commit,
 * and schedules multiple frames to guarantee the GPU has the new texture.
 */
export function useTextureInvalidation(textureUuid: string | undefined | null) {
  const { invalidate } = useThree();
  const frameCountRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // Use useLayoutEffect for synchronous post-commit invalidation
  useLayoutEffect(() => {
    if (!textureUuid) return;

    // Cancel any pending animation frames
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Reset frame counter
    frameCountRef.current = 0;

    // Immediately invalidate after commit
    invalidate();

    // Schedule 2 more frames to ensure GPU texture upload completes
    const scheduleNextFrame = () => {
      frameCountRef.current++;
      if (frameCountRef.current < 3) {
        rafIdRef.current = requestAnimationFrame(() => {
          invalidate();
          scheduleNextFrame();
        });
      }
    };

    rafIdRef.current = requestAnimationFrame(() => {
      invalidate();
      scheduleNextFrame();
    });

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [textureUuid, invalidate]);
}

/**
 * Hook for burst invalidation when texture properties change.
 * Schedules multiple render frames to ensure textures are fully loaded and displayed.
 */
export function useRenderBurst(dependencies: any[]) {
  const { invalidate } = useThree();
  const rafIdRef = useRef<number | null>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip first mount to avoid unnecessary renders on initial load
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Cancel any pending animation frames
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    let frameCount = 0;
    const maxFrames = 3;

    const burstRender = () => {
      invalidate();
      frameCount++;
      if (frameCount < maxFrames) {
        rafIdRef.current = requestAnimationFrame(burstRender);
      }
    };

    // Start burst rendering
    rafIdRef.current = requestAnimationFrame(burstRender);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, dependencies);
}
