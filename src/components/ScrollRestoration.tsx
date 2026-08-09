import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { cacheRead, cacheWrite, elementPath } from "@/lib/uiCache";

type Positions = Record<string, number>;
type ElementPositions = Record<string, { top: number; left: number }>;

const WINDOW_KEY = "scroll_window";
const ELEMENTS_KEY = "scroll_elements";
const LAST_KEY = "scroll_lastLocation";

/**
 * Persists the exact viewport position for every route AND the scroll offset of
 * every inner scroll container (product carousels, option panels, cart lists,
 * search results) so a reload reopens the site exactly where it was left.
 */
const ScrollRestoration = () => {
  const location = useLocation();
  const key = location.pathname + location.search;
  const keyRef = useRef(key);
  keyRef.current = key;

  // Disable the browser's own (unreliable) restoration so ours wins.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // ---- save: window scroll + any element scroll (rAF-throttled) ----
  useEffect(() => {
    let frame = 0;
    const pendingElements: ElementPositions = {};

    const flush = () => {
      frame = 0;
      const all = cacheRead<Positions>(WINDOW_KEY, {});
      all[keyRef.current] = window.scrollY;
      cacheWrite(WINDOW_KEY, all);
      cacheWrite(LAST_KEY, keyRef.current);

      if (Object.keys(pendingElements).length) {
        const els = cacheRead<Record<string, ElementPositions>>(ELEMENTS_KEY, {});
        els[keyRef.current] = { ...(els[keyRef.current] || {}), ...pendingElements };
        cacheWrite(ELEMENTS_KEY, els);
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(flush);
    };

    const onScroll = (event: Event) => {
      const target = event.target;
      if (target && target instanceof Element) {
        if (target.scrollTop === 0 && target.scrollLeft === 0) {
          pendingElements[elementPath(target)] = { top: 0, left: 0 };
        } else {
          pendingElements[elementPath(target)] = {
            top: target.scrollTop,
            left: target.scrollLeft,
          };
        }
      }
      schedule();
    };

    const onHide = () => flush();

    // Capture phase catches scroll events from inner containers (they don't bubble).
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      flush();
      document.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  // ---- restore for the current route, retrying while lazy content mounts ----
  useEffect(() => {
    if (location.hash) return; // anchor links win

    const target = cacheRead<Positions>(WINDOW_KEY, {})[key];
    const elements = cacheRead<Record<string, ElementPositions>>(ELEMENTS_KEY, {})[key] || {};
    const entries = Object.entries(elements);
    if (!target && !entries.length) return;

    let cancelled = false;
    let attempts = 0;

    const restoreElements = () => {
      entries.forEach(([path, pos]) => {
        if (!pos || (!pos.top && !pos.left)) return;
        const nodes = Array.from(document.querySelectorAll<HTMLElement>("*"));
        const match = nodes.find(node => elementPath(node) === path);
        if (match) {
          if (pos.top) match.scrollTop = pos.top;
          if (pos.left) match.scrollLeft = pos.left;
        }
      });
    };

    const tick = () => {
      if (cancelled) return;
      if (target) window.scrollTo({ top: target, behavior: "auto" });
      restoreElements();
      attempts += 1;
      const settled = !target || Math.abs(window.scrollY - target) <= 4;
      if ((!settled || attempts < 6) && attempts < 30) {
        window.setTimeout(tick, 120);
      }
    };
    tick();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
};

export default ScrollRestoration;
