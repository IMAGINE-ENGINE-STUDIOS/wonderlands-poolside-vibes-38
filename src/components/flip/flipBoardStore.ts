import * as React from "react";
import { cacheRead, cacheWrite } from "@/lib/uiCache";
import { DEFAULT_PX_PER_FT, type SitePlanData } from "@/components/blueprint/SiteDrawingBoard";
import type { EnclosureLayout } from "@/components/enclosure/EnclosureDrawingBoard";
import type { FenceLayout } from "@/components/fence/FenceDrawingBoard";
import type { GrassLayout } from "@/components/grass/GrassDrawingBoard";

/**
 * One shared drawing per discipline, so the board printed on the left leaf of a
 * FLIP spread and the tools, cost sheet and calculators printed on the facing
 * leaves all read the exact same geometry in real time.
 */

export type FlipBoardState = {
  site: SitePlanData;
  enclosure: EnclosureLayout;
  fence: FenceLayout;
  grass: GrassLayout;
  grassId: string;
};

const emptyState = (): FlipBoardState => ({
  site: { shapes: [], pxPerFt: DEFAULT_PX_PER_FT },
  enclosure: { points: [], closed: false, features: {} },
  fence: { points: [], closed: false, gateSegments: [] },
  grass: { areas: [] },
  grassId: "",
});

const stores = new Map<string, { value: FlipBoardState; subs: Set<() => void> }>();

const keyFor = (categoryId: string) => `flip_board_${categoryId}`;

function storeFor(categoryId: string) {
  let s = stores.get(categoryId);
  if (!s) {
    s = { value: cacheRead<FlipBoardState>(keyFor(categoryId), emptyState()), subs: new Set() };
    stores.set(categoryId, s);
  }
  return s;
}

export function setFlipBoardValue(categoryId: string, patch: Partial<FlipBoardState>) {
  const s = storeFor(categoryId);
  s.value = { ...s.value, ...patch };
  cacheWrite(keyFor(categoryId), s.value);
  s.subs.forEach((fn) => fn());
}

export function resetFlipBoard(categoryId: string) {
  const s = storeFor(categoryId);
  s.value = emptyState();
  cacheWrite(keyFor(categoryId), s.value);
  s.subs.forEach((fn) => fn());
}

/** Subscribe a component to the shared drawing for a discipline. */
export function useFlipBoard(categoryId: string): FlipBoardState {
  const store = storeFor(categoryId);
  const subscribe = React.useCallback(
    (fn: () => void) => {
      store.subs.add(fn);
      return () => store.subs.delete(fn);
    },
    [store],
  );
  return React.useSyncExternalStore(
    subscribe,
    () => store.value,
    () => store.value,
  );
}

/* ------------------------------------------------------------------ *
 * Page-flip lock — while the reader is drawing, the book holds still.
 * ------------------------------------------------------------------ */

let locks = 0;
const lockSubs = new Set<() => void>();

export function lockFlip() {
  locks += 1;
  lockSubs.forEach((fn) => fn());
}

export function unlockFlip() {
  locks = Math.max(0, locks - 1);
  lockSubs.forEach((fn) => fn());
}

export function useFlipLocked(): boolean {
  return React.useSyncExternalStore(
    (fn) => {
      lockSubs.add(fn);
      return () => lockSubs.delete(fn);
    },
    () => locks > 0,
    () => false,
  );
}
