import { useState, useCallback } from 'react';
import { validateScene } from '@/utils/sceneValidator';
import type { Scene3D } from '@/components/scene3d/types';

export interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>(initialState: T) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newPresent: T) => {
    setState((currentState) => {
      // Validate Scene3D objects before storing
      const validatedPresent = typeof newPresent === 'object' && newPresent !== null && 'pool' in newPresent
        ? validateScene(newPresent as unknown as Scene3D) as unknown as T
        : newPresent;
      
      return {
        past: [...currentState.past, currentState.present],
        present: validatedPresent,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((currentState) => {
      if (currentState.past.length === 0) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      if (currentState.future.length === 0) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    // Validate Scene3D objects before storing
    const validatedPresent = typeof newPresent === 'object' && newPresent !== null && 'pool' in newPresent
      ? validateScene(newPresent as unknown as Scene3D) as unknown as T
      : newPresent;
      
    setState({
      past: [],
      present: validatedPresent,
      future: [],
    });
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}
