/**
 * Starting looks for the Landscaping Studio. Each look is a recipe of
 * landscape edits (beds + real catalog plants) applied to an empty 60×40 ft
 * yard — or around the customer's pool when one is drawn.
 */
import { emptyLandscapeLayout, type LandscapeLayout } from "./landscapeEstimate";
import { applyLandscapeEdit, type Frame, type LandscapeEdit } from "./landscapeOps";

export interface LandscapeLook {
  id: string;
  title: string;
  mood: string;
  palette: string[];
  recipe: LandscapeEdit[];
  /** Agent-priced bespoke work (green walls, matured trees) */
  agentQuoted?: boolean;
}

export const LANDSCAPE_LOOKS: LandscapeLook[] = [
  {
    id: "tropical-poolside",
    title: "Tropical Poolside",
    mood: "Palms, bird of paradise and bold foliage framing the water.",
    palette: ["#2f6b3a", "#e8873c", "#f2c53d", "#8a6242"],
    recipe: [
      { newBed: { side: "back", depthFt: 7, fill: "mulch-brown" } },
      { add: [{ query: "palm", pattern: "accent", side: "pool", count: 4 }, { query: "bird of paradise", side: "back", count: 6 }, { query: "ixora", pattern: "row", side: "back" }] },
    ],
  },
  {
    id: "modern-minimal",
    title: "Modern Minimal",
    mood: "Clean river-rock beds, grasses in rhythm, one sculptural tree.",
    palette: ["#a9a49b", "#5f8f4a", "#463c37", "#ddd2bd"],
    recipe: [
      { newBed: { side: "back", depthFt: 5, fill: "river-rock" } },
      { add: [{ query: "muhly", pattern: "row", side: "back" }, { query: "crape myrtle", pattern: "accent", side: "back", count: 1 }] },
    ],
  },
  {
    id: "coastal-native",
    title: "Coastal Native",
    mood: "Salt-hardy Florida natives, shell beds and sea-breeze texture.",
    palette: ["#ddd2bd", "#6f8f5a", "#c2b49b", "#5b8fd8"],
    recipe: [
      { newBed: { side: "back", depthFt: 6, fill: "shell" } },
      { add: [{ query: "coco plum", pattern: "hedge", side: "back" }, { query: "buttonwood", pattern: "accent", side: "back", count: 2 }, { query: "blue daze", side: "back", count: 9 }] },
    ],
  },
  {
    id: "formal-topiary",
    title: "Formal Topiary",
    mood: "Clipped hedges, symmetry and black-mulch structure.",
    palette: ["#2f4d34", "#463c37", "#f6f2e8", "#6d2b3f"],
    recipe: [
      { newBed: { side: "back", depthFt: 4, fill: "mulch-black" } },
      { add: [{ query: "podocarpus", pattern: "hedge", side: "back" }, { query: "topiary", pattern: "accent", side: "back", count: 2 }] },
    ],
  },
  {
    id: "palm-beach-estate",
    title: "Palm Beach Estate",
    mood: "Formal symmetry: a palm row over a flowering front row, hedge walls, topiary sentries at the pool.",
    palette: ["#14532d", "#0e7490", "#e8b4b8", "#f5f0e1"],
    recipe: [
      { newBed: { side: "back", depthFt: 7, fill: "mulch-brown" } },
      { newBed: { side: "left", depthFt: 5, fill: "mulch-brown" } },
      { newBed: { side: "right", depthFt: 5, fill: "mulch-brown" } },
      { add: [{ query: "queen palm", pattern: "row", side: "back" }] },
      { add: [{ query: "clusia", pattern: "hedge", side: "left" }, { query: "clusia", pattern: "hedge", side: "right" }] },
      { add: [{ query: "ixora", pattern: "row", side: "back" }] },
      { add: [{ query: "podocarpus", pattern: "accent", side: "pool", count: 4 }] },
    ],
  },
  {
    id: "formal-garden-axis",
    title: "Formal Garden Axis",
    mood: "A mirrored garden: black-mulch beds, hedge walls on three sides, palm pairs flanking the axis, roses on the back line.",
    palette: ["#1a1a1a", "#166534", "#e11d63", "#fafafa"],
    recipe: [
      { newBed: { side: "back", depthFt: 6, fill: "mulch-black" } },
      { newBed: { side: "left", depthFt: 5, fill: "mulch-black" } },
      { newBed: { side: "right", depthFt: 5, fill: "mulch-black" } },
      { add: [{ query: "clusia", pattern: "hedge", side: "back" }, { query: "clusia", pattern: "hedge", side: "left" }, { query: "clusia", pattern: "hedge", side: "right" }] },
      { add: [{ query: "palm", pattern: "accent", side: "left", count: 3 }, { query: "palm", pattern: "accent", side: "right", count: 3 }] },
      { add: [{ query: "rose", pattern: "row", side: "back" }] },
    ],
  },
  {
    id: "courtyard-garden-room",
    title: "Courtyard Garden Room",
    mood: "One great oak as the ceiling, a shell bed, hedge walls and clustered flowering shrubs — a room made of plants.",
    palette: ["#713f12", "#15803d", "#fda4af", "#fef3c7"],
    recipe: [
      { newBed: { side: "back", depthFt: 6, fill: "shell" } },
      { add: [{ query: "oak", pattern: "accent", side: "back", count: 1 }] },
      { add: [{ query: "clusia", pattern: "hedge", side: "back" }] },
      { add: [{ query: "gardenia", pattern: "cluster", side: "back", count: 5 }] },
      { add: [{ query: "ixora", pattern: "cluster", side: "pool", count: 4 }] },
    ],
  },
  {
    id: "themed-patio",
    title: "Themed Patio",
    mood: "Green walls, luxury design, matured trees — composed with an agent.",
    palette: ["#1f3d2b", "#8a6242", "#f0e6c8", "#cf4340"],
    agentQuoted: true,
    recipe: [
      { newBed: { side: "around", depthFt: 4, fill: "mulch-brown" } },
      { add: [{ query: "clusia", pattern: "hedge", side: "back" }, { query: "oak", pattern: "accent", side: "back", count: 2 }, { query: "bougainvillea", side: "left", count: 3 }] },
    ],
  },
];

export function buildLook(look: LandscapeLook, hole?: Frame["hole"]): LandscapeLayout {
  return look.recipe.reduce<LandscapeLayout>(
    (layout, edit) => applyLandscapeEdit(layout, edit, hole),
    { ...emptyLandscapeLayout(), irrigation: true },
  );
}
