import { useState, useCallback, useRef, useEffect } from 'react';
import { validateScene } from '@/utils/sceneValidator';
import type { Scene3D } from '@/components/scene3d/types';
import type { PoolStairConfig, PoolChairConfig, ContourSeatingConfig } from '@/components/scene3d/poolAssetTypes';
import type { TerrainAsset, AssetLibraryItem } from '@/components/scene3d/TerrainEditor';
import type { PoolLightConfig } from '@/components/scene3d/types';

export interface SceneSnapshot {
  scene: Scene3D;
  terrainAssets: TerrainAsset[];
  poolStairs: PoolStairConfig[];
  poolChairs: PoolChairConfig[];
  contourSeating: ContourSeatingConfig[];
  poolLights: PoolLightConfig[];
  assets3D: any[];
}

interface HistoryState {
  past: SceneSnapshot[];
  present: SceneSnapshot;
  future: SceneSnapshot[];
}

const MAX_HISTORY_SIZE = 50;

export function useSceneHistory(initialSnapshot: SceneSnapshot) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialSnapshot,
    future: [],
  });

  const isInternalUpdate = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Push a new snapshot to history
  const pushSnapshot = useCallback((newSnapshot: Partial<SceneSnapshot>) => {
    if (isInternalUpdate.current) return;

    // Clear any pending debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce rapid changes
    debounceTimer.current = setTimeout(() => {
      setHistory((current) => {
        const mergedSnapshot: SceneSnapshot = {
          ...current.present,
          ...newSnapshot,
        };

        // Validate scene if it's being updated
        if (newSnapshot.scene) {
          mergedSnapshot.scene = validateScene(newSnapshot.scene);
        }

        // Check if anything actually changed
        const hasChanges = JSON.stringify(mergedSnapshot) !== JSON.stringify(current.present);
        if (!hasChanges) return current;

        // Limit history size
        const newPast = [...current.past, current.present].slice(-MAX_HISTORY_SIZE);

        return {
          past: newPast,
          present: mergedSnapshot,
          future: [], // Clear future on new change
        };
      });
    }, 100);
  }, []);

  // Undo - go back one step
  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current;

      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, -1);

      isInternalUpdate.current = true;
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 50);

      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future].slice(0, MAX_HISTORY_SIZE),
      };
    });
  }, []);

  // Redo - go forward one step
  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current;

      const next = current.future[0];
      const newFuture = current.future.slice(1);

      isInternalUpdate.current = true;
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 50);

      return {
        past: [...current.past, current.present].slice(-MAX_HISTORY_SIZE),
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Reset history with new initial state
  const resetHistory = useCallback((newSnapshot: SceneSnapshot) => {
    if (newSnapshot.scene) {
      newSnapshot.scene = validateScene(newSnapshot.scene);
    }
    setHistory({
      past: [],
      present: newSnapshot,
      future: [],
    });
  }, []);

  // Get current snapshot
  const currentSnapshot = history.present;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    snapshot: currentSnapshot,
    pushSnapshot,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
    historyLength: history.past.length,
    futureLength: history.future.length,
  };
}
