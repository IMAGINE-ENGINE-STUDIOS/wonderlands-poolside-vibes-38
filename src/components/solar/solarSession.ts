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
