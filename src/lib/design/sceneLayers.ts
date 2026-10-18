/**
 * Scene layers & per-object visibility — shared by the 2D and 3D Studio.
 * Credits: Imagine Engine Studios Corp.
 *
 * Hiding is display-only: hidden objects stay in the project and in every
 * quote / take-off. State persists in localStorage and is broadcast through a
 * window event so the objects panel, the 3D scene and the 2D board stay in sync.
 */
import * as React from "react";

export interface SceneLayer { id: string; name: string; hidden?: boolean; builtIn?: boolean }
export interface SceneLayerState { layers: SceneLayer[]; assign: Record<string, string>; hidden: string[] }

const KEY = "studio.sceneLayers.v1";
export const SCENE_LAYERS_EVENT = "studio:sceneLayers";

export const DEFAULT_LAYERS: SceneLayer[] = [
  { id: "structure", name: "Pool Structure", builtIn: true },
  { id: "deck", name: "Deck & Coping", builtIn: true },
  { id: "landscape", name: "Landscape & Turf", builtIn: true },
  { id: "lighting", name: "Lighting", builtIn: true },
  { id: "fences", name: "Fences & Screens", builtIn: true },
];

function read(): SceneLayerState {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && Array.isArray(raw.layers)) {
      const ids = new Set(raw.layers.map((l: SceneLayer) => l.id));
      return { layers: [...DEFAULT_LAYERS.filter((l) => !ids.has(l.id)), ...raw.layers], assign: raw.assign ?? {}, hidden: raw.hidden ?? [] };
    }
  } catch { /* corrupt cache → defaults */ }
  return { layers: DEFAULT_LAYERS, assign: {}, hidden: [] };
}

let state: SceneLayerState = typeof window === "undefined" ? { layers: DEFAULT_LAYERS, assign: {}, hidden: [] } : read();

function write(next: SceneLayerState) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota */ }
  window.dispatchEvent(new Event(SCENE_LAYERS_EVENT));
}

export const getSceneLayers = () => state;

/** Layer an object lives on: user assignment, else its default layer. */
export const layerOf = (id: string, fallback: string, s = state) => {
  const l = s.assign[id];
  return l && s.layers.some((x) => x.id === l) ? l : fallback;
};

/** True when the object itself or its layer is hidden. */
export const isObjectHidden = (id: string, fallback: string, s = state) =>
  s.hidden.includes(id) || !!s.layers.find((l) => l.id === layerOf(id, fallback, s))?.hidden;

export const sceneLayerActions = {
  toggleObject(id: string) {
    const h = state.hidden.includes(id) ? state.hidden.filter((x) => x !== id) : [...state.hidden, id];
    write({ ...state, hidden: h });
  },
  toggleLayer(layerId: string) {
    write({ ...state, layers: state.layers.map((l) => (l.id === layerId ? { ...l, hidden: !l.hidden } : l)) });
  },
  addLayer(name: string) {
    const id = `layer-${Date.now().toString(36)}`;
    write({ ...state, layers: [...state.layers, { id, name: name.trim() || "New layer" }] });
    return id;
  },
  renameLayer(layerId: string, name: string) {
    write({ ...state, layers: state.layers.map((l) => (l.id === layerId ? { ...l, name } : l)) });
  },
  removeLayer(layerId: string) {
    const assign = Object.fromEntries(Object.entries(state.assign).filter(([, v]) => v !== layerId));
    write({ ...state, layers: state.layers.filter((l) => l.id !== layerId || l.builtIn), assign });
  },
  moveObject(id: string, layerId: string) {
    write({ ...state, assign: { ...state.assign, [id]: layerId } });
  },
};

/** React hook: re-renders on every layer/visibility change. */
export function useSceneLayers(): SceneLayerState {
  const [s, set] = React.useState(state);
  React.useEffect(() => {
    const on = () => set(getSceneLayers());
    window.addEventListener(SCENE_LAYERS_EVENT, on);
    return () => window.removeEventListener(SCENE_LAYERS_EVENT, on);
  }, []);
  return s;
}

/** Stable object IDs for board elements (fences, screens, turf, waters). */
export const boardObjectId = (kind: "fence" | "screen" | "surface" | "water", itemId: string | undefined, i: number) =>
  `board-${kind}-${itemId ?? i}`;
