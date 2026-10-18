/**
 * 2D Studio "Objects" widget — same panel, spot and layers as the 3D Studio.
 * Lists every piece on the 2D board: main pool, extra pools/spas, attached decks,
 * coping, waterline, pool features (stairs, lights, jets, trees…) and drawn site
 * pieces (fences, screens, turf, decks). Board-item IDs match the 3D board, so
 * hiding a fence/turf/deck here hides it in 3D too.
 * The 2D design is published by DesignStudio via publishBoard2D (tiny external
 * store) so the panel updates without re-rendering the whole PoolBuilder.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { SceneObjectsPanel, sceneObjectIcons, type SceneObjectGroup } from "@/components/scene3d/SceneObjectsPanel";
import { useSiteElements } from "./SiteElementsLayer";
import { boardObjectId } from "@/lib/design/sceneLayers";

/* ---------- 2D design snapshot store ---------- */
type Board2D = { points?: unknown[]; hardscapePoints?: unknown[]; additionalPools?: Array<{ id: string; type?: string; name?: string; points: unknown[] }>; additionalDeckPoints?: Record<string, unknown[]>; features?: Array<{ id?: string; type?: string; name?: string }> };
let board2D: Board2D = {};
const listeners = new Set<() => void>();
let pending = false;
/** Called with every 2D project state; notifications are batched to one per frame. */
export function publishBoard2D(data: Board2D) {
  board2D = data;
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => { pending = false; listeners.forEach((l) => l()); });
}
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const getBoard = () => board2D;

const KIND = { fence: "fence", enclosure: "screen", turf: "surface", deck: "surface" } as const;
const LAYER = { fence: "fences", enclosure: "fences", turf: "landscape", deck: "deck" } as const;
const LABEL = { fence: "Fence", enclosure: "Screen", turf: "Turf", deck: "Deck" } as const;
const FEATURE: Record<string, { label: string; icon: React.ReactNode; layer: string }> = {
  stairs: { label: "Stairs", icon: sceneObjectIcons.stairs, layer: "structure" },
  light: { label: "Light", icon: sceneObjectIcons.light, layer: "lighting" },
  jet: { label: "Jet", icon: sceneObjectIcons.water, layer: "structure" },
  tree: { label: "Tree", icon: sceneObjectIcons.terrain, layer: "landscape" },
  grass: { label: "Grass", icon: sceneObjectIcons.terrain, layer: "landscape" },
};

export function BoardObjectsPanel() {
  const [items, setItems] = useSiteElements();
  const board = React.useSyncExternalStore(subscribe, getBoard);
  const groups: SceneObjectGroup[] = React.useMemo(() => {
    const out: SceneObjectGroup[] = [];
    const hasMain = (board.points?.length ?? 0) >= 3;
    const extras = (board.additionalPools ?? []).filter((p) => (p.points?.length ?? 0) >= 3);
    const water = [
      ...(hasMain ? [{ id: "obj-pool", label: "Pool Shell", icon: sceneObjectIcons.pool, layer: "structure" }] : []),
      ...extras.map((p, i) => ({ id: boardObjectId("water", p.id, i), label: p.name || `${p.type === "spa" ? "Spa" : "Pool"} ${i + 2}`, detail: p.type === "spa" ? "Spa" : "Pool", icon: sceneObjectIcons.pool, layer: "structure" })),
    ];
    if (water.length) out.push({ key: "water", label: "Pools & Spas", items: water });
    const edge = [
      ...(hasMain ? [{ id: "obj-coping", label: "Coping", icon: sceneObjectIcons.coping, layer: "deck" }, { id: "obj-waterline", label: "Waterline Tile", icon: sceneObjectIcons.coping, layer: "deck" }] : []),
      ...((board.hardscapePoints?.length ?? 0) >= 3 ? [{ id: "obj-deck", label: "Pool Deck", icon: sceneObjectIcons.deck, layer: "deck" }] : []),
      ...extras.filter((p) => (board.additionalDeckPoints?.[p.id]?.length ?? 0) >= 3).map((p, i) => ({ id: `obj-deck-${p.id}`, label: `Deck · ${p.name || `Pool ${i + 2}`}`, icon: sceneObjectIcons.deck, layer: "deck" })),
    ];
    if (edge.length) out.push({ key: "edge", label: "Deck & Coping", items: edge });
    const feats = (board.features ?? []).filter((f) => f.type && f.type !== "pool");
    if (feats.length) {
      const n: Record<string, number> = {};
      out.push({ key: "features", label: "Features", items: feats.map((f, i) => {
        const m = FEATURE[f.type!] ?? { label: f.type!, icon: sceneObjectIcons.asset, layer: "structure" };
        n[f.type!] = (n[f.type!] ?? 0) + 1;
        return { id: `feature-${f.id ?? i}`, label: f.name || `${m.label} ${n[f.type!]}`, icon: m.icon, layer: m.layer };
      }) });
    }
    const make = (kinds: Array<keyof typeof KIND>, key: string, label: string) => {
      const list = items.filter((e) => kinds.includes(e.kind as keyof typeof KIND));
      return {
        key, label,
        items: list.map((e, i) => ({
          id: boardObjectId(KIND[e.kind as keyof typeof KIND], e.id, i),
          label: `${LABEL[e.kind as keyof typeof LABEL]} ${i + 1}`,
          detail: e.label,
          icon: e.kind === "fence" || e.kind === "enclosure" ? sceneObjectIcons.fence : e.kind === "deck" ? sceneObjectIcons.deck : sceneObjectIcons.terrain,
          layer: LAYER[e.kind as keyof typeof LAYER],
          onDelete: () => setItems((p) => p.filter((x) => x.id !== e.id)),
        })),
      };
    };
    out.push(make(["fence", "enclosure"], "fences", "Fences & Screens"), make(["deck", "turf"], "surfaces", "Decks & Turf"));
    return out.filter((g) => g.items.length);
  }, [items, setItems, board]);
  return <SceneObjectsPanel groups={groups} />;
}
