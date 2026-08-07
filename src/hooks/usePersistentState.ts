import * as React from 'react';

const PREFIX = 'wl_ui_';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

/**
 * State that survives a page reload.
 * Keeps open menus, expanded widgets, panels and selections exactly as the
 * user left them by mirroring the value into localStorage in real time.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(() => read(key, initialValue));

  React.useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage unavailable or full */
    }
  }, [key, value]);

  return [value, setValue];
}

export default usePersistentState;
