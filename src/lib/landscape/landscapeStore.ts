/**
 * The landscape's public snapshot — how the rest of the Studio sees the
 * planting plan without importing the layer: the Objects panel lists its
 * species and beds, and the take-off menu (the summary dropdown that feeds
 * quotes and invoices) prices its lines beside the pool, deck and site
 * elements. LandscapeLayer publishes on every change; consumers subscribe.
 */
import * as React from 'react';

export interface LandscapePanelSpecies { plantId: string; name: string; count: number }
export interface LandscapePanelBed { id: string; label: string; sqFt: number }

export interface LandscapeSnapshot {
  total: number;
  plantCount: number;
  bedSqFt: number;
  /** Quote-ready lines ({name, price}) — the shape PoolDesignerHeader eats. */
  lines: Array<{ name: string; price: number }>;
  species: LandscapePanelSpecies[];
  beds: LandscapePanelBed[];
}

export const EMPTY_LANDSCAPE_SNAPSHOT: LandscapeSnapshot = {
  total: 0, plantCount: 0, bedSqFt: 0, lines: [], species: [], beds: [],
};

let snapshot = EMPTY_LANDSCAPE_SNAPSHOT;
const listeners = new Set<() => void>();

export function publishLandscape(next: LandscapeSnapshot): void {
  snapshot = next;
  listeners.forEach((l) => l());
}

export function useLandscapeSnapshot(): LandscapeSnapshot {
  return React.useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => snapshot,
  );
}
