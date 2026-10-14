import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Makes any floating 3D-viewer panel draggable without touching its layout,
 * and auto-places it in an empty part of the viewport when it opens.
 *
 * Uses the CSS `translate` property (independent of `transform`), so panels
 * that already centre themselves with `-translate-y-1/2` keep working.
 * Drag starts on any non-interactive part of the panel (header, labels,
 * padding); buttons, sliders, inputs, charts and canvases keep their own
 * pointer behaviour. Position is remembered per panel key.
 *
 * Auto-placement: every open panel registers its element. When a panel
 * mounts and overlaps another open panel, it is nudged left (then down)
 * until it sits in free space inside its container. A position the user
 * dragged to is respected and never auto-moved.
 */
const IGNORE = 'button,input,textarea,select,a,label,[role="slider"],[role="tab"],[role="option"],[role="combobox"],svg,canvas,[data-no-drag]';

const OPEN_PANELS = new Map<string, HTMLElement>();
const GAP = 12;

const overlaps = (a: DOMRect, b: DOMRect) =>
  a.left < b.right + GAP && a.right + GAP > b.left && a.top < b.bottom + GAP && a.bottom + GAP > b.top;

/** Finds the smallest offset that frees `el` from every other open panel. */
function findFreeOffset(key: string, el: HTMLElement): { x: number; y: number } | null {
  const others = [...OPEN_PANELS.entries()].filter(([k, e]) => k !== key && e.isConnected).map(([, e]) => e.getBoundingClientRect());
  const base = el.getBoundingClientRect();
  if (!others.some((o) => overlaps(base, o))) return null;
  const bounds = (el.offsetParent as HTMLElement | null)?.getBoundingClientRect() ?? new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  const fits = (r: DOMRect) => r.left >= bounds.left + 4 && r.right <= bounds.right - 4 && r.top >= bounds.top + 4 && r.bottom <= bounds.bottom - 4;
  // Candidate shifts: step left across the viewport, then rows downward.
  const stepX = base.width + GAP;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      if (row === 0 && col === 0) continue;
      for (const dir of [-1, 1]) {
        const dx = dir * col * stepX;
        const dy = row * (base.height / 2 + GAP);
        const r = new DOMRect(base.left + dx, base.top + dy, base.width, base.height);
        if (fits(r) && !others.some((o) => overlaps(r, o))) return { x: dx, y: dy };
      }
    }
  }
  return null;
}

export function useDraggablePanel(key: string) {
  const storageKey = `studio3d.panelPos.${key}`;
  const userMoved = useRef(false);
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) { userMoved.current = true; return JSON.parse(raw); }
    } catch { /* ignore */ }
    return { x: 0, y: 0 };
  });
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    if (!userMoved.current) return;
    try { localStorage.setItem(storageKey, JSON.stringify(pos)); } catch { /* quota */ }
  }, [pos, storageKey]);

  // Register/unregister the panel element and auto-place on open.
  const ref = useCallback((el: HTMLElement | null) => {
    if (!el) { OPEN_PANELS.delete(key); return; }
    OPEN_PANELS.set(key, el);
    if (userMoved.current) return;
    requestAnimationFrame(() => {
      if (!el.isConnected || userMoved.current) return;
      const free = findFreeOffset(key, el);
      if (free) setPos({ x: posRef.current.x + free.x, y: posRef.current.y + free.y });
    });
  }, [key]);

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
      userMoved.current = true;
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

  const reset = useCallback(() => {
    userMoved.current = false;
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    setPos({ x: 0, y: 0 });
  }, [storageKey]);

  return {
    panelProps: {
      ref,
      onPointerDown,
      style: { translate: `${pos.x}px ${pos.y}px`, cursor: 'grab' } as React.CSSProperties,
    },
    reset,
  };
}
