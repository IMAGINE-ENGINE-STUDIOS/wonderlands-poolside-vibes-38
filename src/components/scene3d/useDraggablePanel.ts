import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Makes any floating 3D-viewer panel draggable without touching its layout.
 *
 * Uses the CSS `translate` property (independent of `transform`), so panels
 * that already centre themselves with `-translate-y-1/2` keep working.
 * Drag starts on any non-interactive part of the panel (header, labels,
 * padding); buttons, sliders, inputs, charts and canvases keep their own
 * pointer behaviour. Position is remembered per panel key.
 */
const IGNORE = 'button,input,textarea,select,a,label,[role="slider"],[role="tab"],[role="option"],[role="combobox"],svg,canvas,[data-no-drag]';

export function useDraggablePanel(key: string) {
  const storageKey = `studio3d.panelPos.${key}`;
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return { x: 0, y: 0 };
  });
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(pos)); } catch { /* quota */ }
  }, [pos, storageKey]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest(IGNORE)) return;
    const panel = e.currentTarget;
    const start = { x: e.clientX, y: e.clientY, ox: posRef.current.x, oy: posRef.current.y };
    const rect = panel.getBoundingClientRect();
    let moved = false;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 4) return;
      moved = true;
      // Keep at least 48px of the panel on screen.
      const minDx = 48 - rect.right, maxDx = window.innerWidth - 48 - rect.left;
      const minDy = -rect.top, maxDy = window.innerHeight - 48 - rect.top;
      setPos({
        x: start.ox + Math.min(maxDx, Math.max(minDx, dx)),
        y: start.oy + Math.min(maxDy, Math.max(minDy, dy)),
      });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.style.userSelect = '';
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }, []);

  const reset = useCallback(() => setPos({ x: 0, y: 0 }), []);

  return {
    panelProps: {
      onPointerDown,
      style: { translate: `${pos.x}px ${pos.y}px`, cursor: 'grab' } as React.CSSProperties,
    },
    reset,
  };
}
