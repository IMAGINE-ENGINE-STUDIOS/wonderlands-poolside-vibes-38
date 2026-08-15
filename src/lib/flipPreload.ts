/**
 * FLIP preloading — warms editions and their imagery before the reader flips,
 * so page turns never wait on a network round trip.
 *
 * Two caches, both session-scoped and memory-cheap:
 *  - edition data (handled inside flipConsoleData)
 *  - decoded images (a Set of URLs already fetched by the browser)
 */

const warmed = new Set<string>();
let queue: string[] = [];
let active = 0;
const CONCURRENCY = 4;

const idle = (fn: () => void, timeout = 600) => {
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => number)
    | undefined;
  if (ric) ric(fn, { timeout });
  else window.setTimeout(fn, 120);
};

const pump = () => {
  while (active < CONCURRENCY && queue.length) {
    const url = queue.shift()!;
    active += 1;
    const img = new Image();
    img.decoding = "async";
    (img as any).fetchPriority = "low";
    const done = () => {
      active -= 1;
      pump();
    };
    img.onload = done;
    img.onerror = done;
    img.src = url;
  }
};

/** Queue images for background fetch. Already-warmed URLs are skipped. */
export function preloadImages(urls: (string | undefined | null)[], priority = false) {
  if (typeof window === "undefined") return;
  const next = urls.filter((u): u is string => !!u && !warmed.has(u));
  if (!next.length) return;
  next.forEach((u) => warmed.add(u));
  queue = priority ? [...next, ...queue] : [...queue, ...next];
  if (priority) pump();
  else idle(pump);
}

export const isWarmed = (url?: string | null) => !!url && warmed.has(url);

/** Resolve every edition's data in the background, newest interest first. */
export function prefetchEditions(ids: string[], firstId?: string) {
  if (typeof window === "undefined") return;
  const order = firstId ? [firstId, ...ids.filter((i) => i !== firstId)] : ids;
  let i = 0;
  const step = () => {
    if (i >= order.length) return;
    const id = order[i++];
    import("@/components/flip/flipConsoleData")
      .then(({ loadCategoryEntries }) => loadCategoryEntries(id))
      .then((entries) => {
        // Warm the first handful of plates for that edition.
        preloadImages(entries.slice(0, 8).map((e) => e.image));
      })
      .catch(() => undefined)
      .finally(() => idle(step));
  };
  idle(step);
}
