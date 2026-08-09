import * as React from 'react';
import { cacheRead, cacheWrite } from '@/lib/uiCache';

/**
 * State that survives a page reload.
 * Keeps open menus, expanded widgets, panels, filters and selections exactly as
 * the user left them by mirroring the value into the UI cache in real time.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(() => cacheRead(key, initialValue));

  // Write is debounced with rAF so rapid typing/dragging never blocks paint.
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => cacheWrite(key, value));
    return () => cancelAnimationFrame(frame);
  }, [key, value]);

  return [value, setValue];
}

export default usePersistentState;
