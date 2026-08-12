import * as React from "react";

/**
 * Shared scroll-progress engine.
 *
 * A single passive scroll/resize listener drives every registered element via one
 * rAF tick, writing a `--p` custom property (-1 → 1 as the element travels the
 * viewport) and a `--v` visibility property (0 → 1). CSS does the animation, so
 * React never re-renders on scroll — this stays smooth with dozens of sections.
 */
type Registered = { el: HTMLElement; speed: number };

const registry = new Set<Registered>();
let listening = false;
let frame = 0;

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

function measure() {
  frame = 0;
  const vh = window.innerHeight || 1;
  registry.forEach(({ el, speed }) => {
    const r = el.getBoundingClientRect();
    const center = r.top + r.height / 2;
    const raw = (center - vh / 2) / (vh / 2 + r.height / 2);
    const p = Math.max(-1, Math.min(1, raw)) * speed;
    const v = Math.max(0, Math.min(1, 1 - Math.abs(raw)));
    el.style.setProperty("--p", p.toFixed(4));
    el.style.setProperty("--v", v.toFixed(4));
  });
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(measure);
}

function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function unlisten() {
  if (registry.size) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

export function useParallax<T extends HTMLElement = HTMLDivElement>(speed = 1) {
  const ref = React.useRef<T | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion()) {
      el.style.setProperty("--p", "0");
      el.style.setProperty("--v", "1");
      return;
    }
    const entry: Registered = { el, speed };
    registry.add(entry);
    listen();
    schedule();
    return () => {
      registry.delete(entry);
      unlisten();
    };
  }, [speed]);

  return ref;
}

export default useParallax;
