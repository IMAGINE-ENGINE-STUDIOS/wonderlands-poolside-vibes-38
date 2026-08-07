import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const KEY = "wl_scroll_positions_v1";
const LAST_KEY = "wl_last_location_v1";

type Positions = Record<string, number>;

const readPositions = (): Positions => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
};

const writePosition = (path: string, y: number) => {
  try {
    const all = readPositions();
    all[path] = y;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
};

/**
 * Persists the exact scroll position for every route (and the last visited route)
 * so a page reload reopens the site in the same spot.
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

  // Save on scroll (throttled via rAF), on hide and on unload.
  useEffect(() => {
    let frame = 0;
    const save = () => {
      writePosition(keyRef.current, window.scrollY);
      try {
        localStorage.setItem(LAST_KEY, keyRef.current);
      } catch {
        /* ignore */
      }
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        save();
      });
    };
    const onHide = () => save();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      save();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  // Restore for the current route, retrying while lazy content grows the page.
  useEffect(() => {
    if (location.hash) return; // anchor links win

    const target = readPositions()[key];
    if (!target) return;

    let cancelled = false;
    let attempts = 0;
    const tick = () => {
      if (cancelled) return;
      window.scrollTo({ top: target, behavior: "auto" });
      attempts += 1;
      if (Math.abs(window.scrollY - target) > 4 && attempts < 30) {
        window.setTimeout(tick, 100);
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
