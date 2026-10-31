/**
 * Live stage bridge — makes a staged widget truly multiplayer.
 *
 * Loaded inside the stage iframe (the app itself, opened with
 * ?liveRoom=<slug>&liveRole=host|guest). It joins the room's realtime
 * channel and keeps every participant's copy of the tool in step:
 *
 *  - Shared state: the drawing-board store (`flip_board_*` — Design Studio
 *    boards, suite boards, FLIP spreads, landscaping), the Design Studio
 *    site elements + 3D scene, and Wonderlands Studio selections are
 *    broadcast whenever they change, by ANY participant, and applied live
 *    on every other device. A guest changing a texture updates the host
 *    and every other guest, exactly like editing on one screen.
 *  - Host view: the host's in-widget navigation and scrolling are
 *    broadcast and mirrored on guest devices, so guests see what the
 *    host sees. The FLIP book's page turns are mirrored the same way.
 *  - Locks stay at the room level: a locked guest's iframe receives no
 *    pointer input at all, so they can watch but not touch.
 *
 * The bridge only activates on URLs carrying the liveRoom parameter, so
 * normal browsing of the same tools is untouched.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cacheWrite } from "@/lib/uiCache";
import { setFlipBoardValue, type FlipBoardState } from "@/components/flip/flipBoardStore";
import { SITE_ELEMENTS_EVENT, SITE_ELEMENTS_KEY } from "@/components/designStudio/SiteElementsLayer";

type Role = "host" | "guest";

const BOARD_PREFIX = "wl_ui_flip_board_";
const SITE_KEY = `wl_ui_${SITE_ELEMENTS_KEY}`;
const STUDIO_PREFIX = "wl_ui_studio_";
const SCENE_PREFIX = "design-studio.scene3d.";

const isSyncedKey = (k: string) =>
  k.startsWith(BOARD_PREFIX) || k === SITE_KEY || k.startsWith(STUDIO_PREFIX) || k.startsWith(SCENE_PREFIX);

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
};

function currentSyncedEntries(): Map<string, string> {
  const out = new Map<string, string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && isSyncedKey(k)) {
        const v = localStorage.getItem(k);
        if (v != null) out.set(k, v);
      }
    }
  } catch { /* private mode */ }
  return out;
}

const stripLiveParams = (href: string) => {
  try {
    const u = new URL(href, window.location.origin);
    u.searchParams.delete("liveRoom");
    u.searchParams.delete("liveRole");
    return u.pathname + u.search + u.hash;
  } catch {
    return href;
  }
};

const withLiveParams = (path: string, slug: string, role: Role) => {
  const u = new URL(path, window.location.origin);
  u.searchParams.set("liveRoom", slug);
  u.searchParams.set("liveRole", role);
  return u.pathname + u.search + u.hash;
};

export function startLiveBridge(slug: string, role: Role): () => void {
  const channel = supabase.channel(`wlive:${slug}`, { config: { broadcast: { self: false } } });
  const lastSent = new Map<string, number>();
  const lastRemote = new Map<string, number>();
  let stopped = false;
  let lastLocalSceneEdit = 0;
  let sceneReloadTimer: ReturnType<typeof setTimeout> | null = null;

  const send = (event: string, payload: Record<string, unknown>) => {
    void channel.send({ type: "broadcast", event, payload });
  };

  /* ------------------------- applying remote state ------------------------- */
  const applyEntry = (key: string, raw: string | null, fromSnapshot: boolean) => {
    lastRemote.set(key, raw == null ? -1 : hash(raw));
    try {
      if (raw == null) localStorage.removeItem(key);
      else localStorage.setItem(key, raw);
    } catch { /* ignore */ }
    if (key.startsWith(BOARD_PREFIX) && raw != null) {
      const id = key.slice(BOARD_PREFIX.length);
      try {
        const value = JSON.parse(raw) as FlipBoardState;
        cacheWrite(`flip_board_${id}`, value);
        setFlipBoardValue(id, value);
      } catch { /* ignore */ }
    } else if (key === SITE_KEY && raw != null) {
      try {
        const elements = JSON.parse(raw) as unknown[];
        cacheWrite(SITE_ELEMENTS_KEY, elements);
        window.dispatchEvent(new CustomEvent(SITE_ELEMENTS_EVENT, { detail: elements }));
      } catch { /* ignore */ }
    } else if (key.startsWith(SCENE_PREFIX)) {
      // The 3D scene is read at studio mount; a follower reloads (debounced)
      // so the host's scene becomes theirs. A device that is itself editing
      // the scene never reloads under its own feet.
      if (!fromSnapshot || role === "guest") {
        if (Date.now() - lastLocalSceneEdit > 4000 && !sceneReloadTimer) {
          sceneReloadTimer = setTimeout(() => {
            sceneReloadTimer = null;
            if (!stopped) window.location.reload();
          }, 900);
        }
      }
    }
  };

  channel.on("broadcast", { event: "bridge:state" }, ({ payload }) => {
    const p = payload as { entries?: Record<string, string | null>; snapshot?: boolean };
    if (!p.entries) return;
    for (const [k, v] of Object.entries(p.entries)) {
      if (isSyncedKey(k)) applyEntry(k, v, !!p.snapshot);
    }
  });

  /* ------------------------------ view follow ------------------------------ */
  let lastViewJson = "";
  channel.on("broadcast", { event: "bridge:view" }, ({ payload }) => {
    if (role !== "guest") return;
    const v = payload as { href?: string; y?: number; x?: number; els?: Array<{ i: number; t: number; l: number }> };
    if (!v.href) return;
    const mine = stripLiveParams(window.location.href);
    if (v.href !== mine) {
      window.location.replace(withLiveParams(v.href, slug, role));
      return;
    }
    if (typeof v.y === "number" && Math.abs(window.scrollY - v.y) > 2) {
      window.scrollTo(v.x ?? 0, v.y);
    }
    if (v.els?.length) {
      const scrollers = scrollables();
      for (const e of v.els) {
        const el = scrollers[e.i];
        if (el && (Math.abs(el.scrollTop - e.t) > 2 || Math.abs(el.scrollLeft - e.l) > 2)) {
          el.scrollTop = e.t;
          el.scrollLeft = e.l;
        }
      }
    }
  });

  channel.on("broadcast", { event: "bridge:flip" }, ({ payload }) => {
    if (role !== "guest") return;
    const p = payload as { page?: number };
    if (typeof p.page === "number") {
      window.dispatchEvent(new CustomEvent("wlive:flip-goto", { detail: p.page }));
    }
  });

  channel.on("broadcast", { event: "bridge:hello" }, () => {
    if (role !== "host") return;
    const entries: Record<string, string> = {};
    currentSyncedEntries().forEach((v, k) => (entries[k] = v));
    send("bridge:state", { entries, snapshot: true });
    // A late joiner also converges to the host's current view + book page.
    lastViewJson = "";
    if (lastFlipPage != null) send("bridge:flip", { page: lastFlipPage });
  });

  /* --------------------------- local change pump --------------------------- */
  const poll = () => {
    const now = currentSyncedEntries();
    const changed: Record<string, string> = {};
    now.forEach((v, k) => {
      const h = hash(v);
      if (lastSent.get(k) !== h && lastRemote.get(k) !== h) {
        changed[k] = v;
        lastSent.set(k, h);
        if (k.startsWith(SCENE_PREFIX)) lastLocalSceneEdit = Date.now();
      }
    });
    if (Object.keys(changed).length) send("bridge:state", { entries: changed });
  };

  /* ------------------------------ host view pump ---------------------------- */
  const scrollables = (): HTMLElement[] => {
    const out: HTMLElement[] = [];
    document.querySelectorAll<HTMLElement>("*").forEach((el) => {
      if (el.scrollHeight - el.clientHeight > 40 && el.clientWidth > 0) out.push(el);
    });
    return out.slice(0, 6);
  };
  const pumpView = () => {
    if (role !== "host") return;
    const v = {
      href: stripLiveParams(window.location.href),
      y: window.scrollY,
      x: window.scrollX,
      els: scrollables().map((el, i) => ({ i, t: el.scrollTop, l: el.scrollLeft })),
    };
    const json = JSON.stringify(v);
    if (json !== lastViewJson) {
      lastViewJson = json;
      send("bridge:view", v);
    }
  };

  let lastFlipPage: number | null = null;
  const onFlipPage = (e: Event) => {
    if (role !== "host") return;
    const page = (e as CustomEvent<number>).detail;
    if (typeof page === "number") {
      lastFlipPage = page;
      send("bridge:flip", { page });
    }
  };
  window.addEventListener("wlive:flip-page", onFlipPage);

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let viewTimer: ReturnType<typeof setInterval> | null = null;
  channel.subscribe((status) => {
    if (status !== "SUBSCRIBED" || stopped) return;
    send("bridge:hello", { role });
    poll();
    pollTimer = setInterval(poll, 350);
    if (role === "host") {
      pumpView();
      viewTimer = setInterval(pumpView, 300);
    }
  });

  return () => {
    stopped = true;
    window.removeEventListener("wlive:flip-page", onFlipPage);
    if (pollTimer) clearInterval(pollTimer);
    if (viewTimer) clearInterval(viewTimer);
    if (sceneReloadTimer) clearTimeout(sceneReloadTimer);
    void supabase.removeChannel(channel);
  };
}

/** Mounts the bridge when the current URL carries the liveRoom parameter. */
export function LiveBridgeMount() {
  const [params] = useSearchParams();
  const slug = params.get("liveRoom");
  const role: Role = params.get("liveRole") === "host" ? "host" : "guest";
  React.useEffect(() => {
    if (!slug) return;
    return startLiveBridge(slug, role);
  }, [slug, role]);
  return null;
}
