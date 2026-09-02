// Shared session shape for the Total Solar Calculator.
//
// The map leaf (SolarCalculatorBoard) and the product-options leaf
// (SolarOptionsLeaf) live on facing pages of the FLIP spread, so they must read
// and write the same cached session. The type, defaults and cache key live here
// so neither component imports the other.
import { solarPanels, type RoofCovering } from "@/data/solarHardware";
import type { LatLng } from "@/lib/solar/solarEngine";

export interface SavedFace {
  id: string;
  path: LatLng[];
  azimuthDeg: number;
  pitchDeg: number;
  shadeFactor: number;
  measuredSunshineHours?: number | null;
  source: "auto" | "traced";
  excluded?: boolean;
}

export interface SolarSession {
  address: string;
  lat: number | null;
  lng: number | null;
  faces: SavedFace[];
  covered: boolean;
  imageryDate: string;
  panelId: string;
  batteryId: string;
  covering: RoofCovering;
  monthlyBill: number;
  serviceRunFt: number;
}

/** Cache key — one live solar session shared across every leaf and page. */
export const SOLAR_SESSION_KEY = "solar_calculator_session";

export const emptySolarSession: SolarSession = {
  address: "",
  lat: null,
  lng: null,
  faces: [],
  covered: false,
  imageryDate: "",
  panelId: solarPanels[0]?.id ?? "",
  batteryId: "battery-none",
  covering: "shingle",
  monthlyBill: 320,
  serviceRunFt: 45,
};

/* ------------------------------------------------------------------ *
 * Shared live session
 *
 * The map leaf and the product-options leaf are two separate React mounts on
 * facing pages of the same FLIP spread. Per-instance state would let each leaf
 * drift (a panel picked on the right would never re-lay the array on the left)
 * and each write would clobber the other's snapshot in the cache. So the
 * session lives in ONE module-level store that both leaves subscribe to.
 * ------------------------------------------------------------------ */

import * as React from "react";
import { cacheRead, cacheWrite } from "@/lib/uiCache";

let current: SolarSession | null = null;
const subs = new Set<() => void>();

const read = (): SolarSession => {
  if (!current) current = { ...emptySolarSession, ...cacheRead<SolarSession>(SOLAR_SESSION_KEY, emptySolarSession) };
  return current;
};

/** Read/write the one live solar session, shared across every leaf and page. */
export function useSolarSession(): [SolarSession, React.Dispatch<React.SetStateAction<SolarSession>>] {
  const value = React.useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    read,
    read,
  );

  const setSession = React.useCallback<React.Dispatch<React.SetStateAction<SolarSession>>>((next) => {
    const prev = read();
    const resolved = typeof next === "function" ? (next as (s: SolarSession) => SolarSession)(prev) : next;
    if (resolved === prev) return;
    current = resolved;
    cacheWrite(SOLAR_SESSION_KEY, resolved);
    subs.forEach((fn) => fn());
  }, []);

  return [value, setSession];
}
