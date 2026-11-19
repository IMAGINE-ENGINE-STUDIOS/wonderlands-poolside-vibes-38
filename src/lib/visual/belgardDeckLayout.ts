/**
 * Belgard deck layout — the pure pattern layer (founder,
 * 2026-11-04: the Belgard 3D tab's logic, in the studios).
 *
 * Given a deck material (resolved from the ONE library,
 * lib/visual/belgardUnitLibrary) and a deck size in inches,
 * produce the layout every renderer consumes:
 *  - "module": dimension-true placements from the product's
 *    primary pattern — each tile shrunk by the product's
 *    joint width, each tile's cut assigned from its OWN
 *    size's faces (assignUnitTexture's faceIn rule), the
 *    module repeated on a plain grid, exactly as the
 *    patternLogic wrap text prescribes.
 *  - "field": amorphous products (Belgian Cobble, Mega-Arbel)
 *    — ONE continuous field at the recorded span; never
 *    pieces, never a grid (the standing amorphous rule).
 *  - "image": a material with a field texture but no cut set
 *    or pattern — the field image at its recorded span, the
 *    honest remainder; nothing is invented for it.
 * No THREE, no DOM: the 2D painter, the 3D builder and the
 * tests all read this same layout.
 *
 * THE DECK FACE LAW (pinned 2026-11-10): a face assignment
 * is a function of the piece's position in the WHOLE
 * floor — the assignment stream (assignUnitTexture keyed
 * by the piece's global layout index) runs continuously
 * across module boundaries, never restarting per module.
 * Any renderer that repeats a painted unit (the 2D
 * painter's pattern tile) must repeat a supertile whose
 * internal stream runs continuously across ≈72 in of
 * whole modules per axis; a one-module repeat stamps the
 * module's few assignments across the floor identically
 * and reads as wallpaper (founder's kitchen photos,
 * 2026-11-09/10). The 3D builder obeys the law directly:
 * it lays the stream across the floor's full bbox.
 */
import polygonClipping from "polygon-clipping";
import type { BelgardPattern } from "@/data/belgardPatterns";
import { BELGARD_MEDIA_LOGIC } from "@/data/belgardMediaLogic";
import {
  BELGARD_STONE_OUTLINES,
  type BelgardStoneOutline,
} from "@/data/belgardStoneOutlines";
import { infiniteFieldSpan } from "@/data/belgardTextures3d";
import {
  belgardTextureFor,
  belgardUnitSetForMaterial,
  PORCELAIN_BODY_SLUGS,
  type BelgardDeckMaterial,
} from "./belgardUnitLibrary";
import {
  assignUnitTexture,
  type UnitTextureAssignment,
} from "./unitTextureLogic";
import { jointWidthInFor } from "./belgardFillingLogic";

/* ---------- size-label parsing (moved from the tab component) ---------- */

/** Parse one catalog dimension token ("19 11/16", "3/4", "15.75") to inches. */
export function parseDimIn(token: string): number | null {
  let total = 0;
  let ok = false;
  for (const p of token.trim().split(/\s+/)) {
    const frac = p.match(/^(\d+)\/(\d+)$/);
    if (frac) {
      total += Number(frac[1]) / Number(frac[2]);
      ok = true;
    } else if (/^\d+(\.\d+)?$/.test(p)) {
      total += Number(p);
      ok = true;
    } else {
      return null;
    }
  }
  return ok ? total : null;
}

export interface PatternSize {
  label: string;
  w: number;
  d: number;
  t: number | null;
}

/** Parse a sizesUsed label "W x D x T" into numbers (T may be absent).
 *  Lives here (pure) since Edit 6; PaverCutVisualizer re-exports it so
 *  the per-unit visualizer spec builder (unitVisualizerSpecs.ts) keeps
 *  parsing size labels exactly the way the tab does. */
export function parseSizeLabel(label: string): PatternSize | null {
  const parts = label.split(" x ").map((s) => s.trim());
  if (parts.length < 2) return null;
  const w = parseDimIn(parts[0]);
  const d = parseDimIn(parts[1]);
  if (w === null || d === null) return null;
  return { label, w, d, t: parts.length >= 3 ? parseDimIn(parts[2]) : null };
}

/* ---------- the layout ---------- */

export interface DeckTilePlacement {
  /** Tile face size, inches (the pattern tile's own w × h). */
  wIn: number;
  hIn: number;
  /** Laid size: the face shrunk by the joint width. */
  laidWIn: number;
  laidHIn: number;
  /** Centre position in deck space, inches, origin at the
   *  deck bbox's min corner. */
  cxIn: number;
  cyIn: number;
  /** The pattern tile's rotation, degrees. */
  rotDeg: number;
  /** Thickness from the tile's own size label, inches. */
  thicknessIn: number;
  /** The deterministic cut assignment for this tile. */
  assignment: UnitTextureAssignment;
  /** URL of the assigned cut face. */
  faceUrl: string;
}

/** One stone of a silhouette field, in deck space (origin at
 *  the field's min corner, inches) — the file page's laid field,
 *  carried into the studios by the Gap-1 port (2026-11-07). */
export interface SilhouetteDeckPlacement {
  /** Index into the layout's stones (and the set's variants). */
  stoneIndex: number;
  cxIn: number;
  cyIn: number;
  /** Whole-stone rotation around Y, radians (the packer's own). */
  rotY: number;
  /** Deterministic assignment for this spot, its variant pinned
   *  to the planned stone (the file page's rule: the outline,
   *  the size and the texture on a spot are the same stone). */
  assignment: UnitTextureAssignment;
  faceUrl: string;
}

export type BelgardDeckLayout =
  | {
      kind: "module";
      material: BelgardDeckMaterial;
      pattern: BelgardPattern;
      jointIn: number;
      moduleWIn: number;
      moduleHIn: number;
      placements: DeckTilePlacement[];
    }
  | {
      kind: "silhouette";
      material: BelgardDeckMaterial;
      jointIn: number;
      thicknessIn: number;
      /** The canonical field's true extents: renderers repeat
       *  the field at this pitch and clip at the deck region. */
      fieldWIn: number;
      fieldHIn: number;
      stones: BelgardStoneOutline[];
      placements: SilhouetteDeckPlacement[];
    }
  | {
      kind: "field";
      material: BelgardDeckMaterial;
      spanWIn: number;
      spanHIn: number;
    }
  | {
      kind: "image";
      material: BelgardDeckMaterial;
      spanFt: number;
    };

const FALLBACK_THICKNESS_IN = 2.375;
/** Porcelain bodies print 3/4 in thick (Media & Logic:
 *  "23.54 x 23.54 x 3/4"; every porcelain unit spec in the
 *  tab carries t: 0.75) and their pattern labels carry no
 *  thickness — the tab's deck rule fell back to that spec
 *  thickness, so the shared layout's fallback is body-aware
 *  rather than one global number. Concrete keeps 2 3/8. */
const PORCELAIN_THICKNESS_IN = 0.75;

/** Tile thickness from its size label (the tab's
 *  deckTileThickness rule, minus the component): the label's
 *  own parsed thickness, else the pattern fallback. */
function tileThicknessIn(
  pattern: BelgardPattern,
  sizeLabel: string,
  fallbackIn: number,
): number {
  void pattern;
  return parseSizeLabel(sizeLabel)?.t ?? fallbackIn;
}

/** The traced stones for a per-unit set, when the set is a
 *  block-cut (v2) silhouette set: the outlines record is keyed
 *  by the set's texture directory, the third path segment of
 *  every variant URL (the file page's own rule, shared here so
 *  the studios and the tab can never disagree). */
export function belgardStoneOutlinesForSet(
  set: { variants: { url: string }[] } | null,
): BelgardStoneOutline[] | null {
  const url = set?.variants[0]?.url;
  if (!url) return null;
  const dir = url.split("/")[3];
  return (dir && BELGARD_STONE_OUTLINES[dir]) || null;
}

/** Thickness from a "Variable x T" style label: the face is
 *  printed as a word, only the trailing token is a number. */
function trailingThicknessIn(label: string): number | null {
  const clean = label.replace(/\s*\[[^\]]*\]\s*/g, " ").trim();
  const parts = clean.split(" x ").map((s) => s.trim());
  if (parts.length < 2) return null;
  if (parseDimIn(parts[0]) !== null) return null;
  return parseDimIn(parts[parts.length - 1]);
}

/** The silhouette sets' printed thickness, resolved the file
 *  page's way (unitVisualizerSpecs): the pattern's own labels
 *  first (Belgian Cobble prints "Variable x 2 3/4"), then the
 *  Media & Logic entry — a "-block-cut" set reads its BASE
 *  product's entry (Mega-Arbel prints 15 3/8 x 21 x 3 1/8). */
function silhouetteThicknessIn(material: BelgardDeckMaterial): number {
  for (const label of material.pattern?.sizesUsed ?? []) {
    const t = parseSizeLabel(label)?.t ?? trailingThicknessIn(label);
    if (t) return t;
  }
  const ml =
    BELGARD_MEDIA_LOGIC.find((p) => p.slug === material.productSlug) ??
    BELGARD_MEDIA_LOGIC.find(
      (p) => p.slug === material.productSlug.replace(/-block-cut$/, ""),
    );
  if (ml) {
    for (const s of ml.sizes) {
      const t = parseSizeLabel(s.dimensions)?.t ?? trailingThicknessIn(s.dimensions);
      if (t) return t;
    }
  }
  return FALLBACK_THICKNESS_IN;
}

/** The file page's silhouette deck target (PaverCutVisualizer's
 *  DECK_TARGET_W_IN/H_IN): the canonical field every surface
 *  lays, so the 2D tile, the 3D deck and the tab all show the
 *  same stones. The pack is deterministic but not free (a
 *  Cobble field runs ~500+ stones), so a laid field is cached
 *  per material — the layout is a pure function of the
 *  material, the cache can never go stale. */
export const SILHOUETTE_FIELD_TARGET_W_IN = 156;
export const SILHOUETTE_FIELD_TARGET_H_IN = 216;
const silhouetteLayoutCache = new Map<string, BelgardDeckLayout>();

function silhouetteLayout(
  material: BelgardDeckMaterial,
  set: NonNullable<ReturnType<typeof belgardUnitSetForMaterial>>,
  stones: BelgardStoneOutline[],
): BelgardDeckLayout {
  const hit = silhouetteLayoutCache.get(material.id);
  if (hit) return hit;
  const jointIn = Math.max(0.375, jointWidthInFor(material.productSlug));
  const field = silhouetteFieldLayout(
    stones,
    SILHOUETTE_FIELD_TARGET_W_IN,
    SILHOUETTE_FIELD_TARGET_H_IN,
    jointIn,
  );
  const placements: SilhouetteDeckPlacement[] = field.placements.map(
    (p, i) => {
      const stone = stones[p.stoneIndex];
      const assignment: UnitTextureAssignment = {
        ...assignUnitTexture(set, "Silhouette field", i, [
          stone.wIn,
          stone.dIn,
        ]),
        variantIndex: p.stoneIndex,
      };
      return {
        stoneIndex: p.stoneIndex,
        cxIn: p.x + field.widthIn / 2,
        cyIn: p.z + field.heightIn / 2,
        rotY: p.rotY,
        assignment,
        faceUrl: set.variants[p.stoneIndex].url,
      };
    },
  );
  const layout: BelgardDeckLayout = {
    kind: "silhouette",
    material,
    jointIn,
    thicknessIn: silhouetteThicknessIn(material),
    fieldWIn: field.widthIn,
    fieldHIn: field.heightIn,
    stones,
    placements,
  };
  silhouetteLayoutCache.set(material.id, layout);
  return layout;
}

/** The named failure for a material that classifies
 *  "image" (register D8, 2026-11-09): it has no unit set,
 *  or a unit set but no laying pattern, so it cannot be
 *  laid as individual pieces in ANY view. Both renderers
 *  raise this exact error — the 3D builder
 *  (belgardDeck3d) throws it from the build, the 2D
 *  painter (belgardDeck2d) refuses to paint and surfaces
 *  it — rather than landing the material on a silent
 *  one-image slab in either view. */
export const belgardUnlayableMaterialError = (
  material: BelgardDeckMaterial,
): Error => {
  const missing = belgardUnitSetForMaterial(material)
    ? "laying pattern"
    : "unit set";
  return new Error(
    `Belgard deck material "${material.productSlug} · ${material.option}" has no ${missing} — it cannot be laid as individual pieces, and the image-slab fallback is removed (register D8).`,
  );
};

/**
 * Lay out a deck of widthIn × heightIn (inches) in the
 * material's pattern. Module origin at the bbox min corner;
 * partial modules at the far edges are INCLUDED (their tiles
 * are clipped by the renderers against the deck region —
 * the layout itself is region-free, like the tab's).
 */
export function layoutBelgardDeck(
  material: BelgardDeckMaterial,
  widthIn: number,
  heightIn: number,
): BelgardDeckLayout {
  // Amorphous products first: one field, never pieces.
  const ref = belgardTextureFor(material.productSlug, material.option);
  const fieldSpan =
    infiniteFieldSpan(ref?.texture ?? null) ??
    infiniteFieldSpan(ref?.group ?? null);
  if (fieldSpan) {
    return {
      kind: "field",
      material,
      spanWIn: fieldSpan.spanWIn,
      spanHIn: fieldSpan.spanHIn,
    };
  }
  const set = belgardUnitSetForMaterial(material);
  // Block-cut (v2) silhouette sets (Gap-1 port, 2026-11-07):
  // the traced stones laid as the file page lays them — never
  // the rectangular pattern module their data also carries
  // (fitting these faces to bounding boxes is the forbidden
  // deformation the audit flagged).
  const stones = set ? belgardStoneOutlinesForSet(set) : null;
  if (set && stones) return silhouetteLayout(material, set, stones);
  const pattern = material.pattern;
  if (!set || !pattern) {
    return { kind: "image", material, spanFt: material.spanFt };
  }
  const jointIn = jointWidthInFor(material.productSlug);
  const cols = Math.max(1, Math.ceil(widthIn / pattern.module.widthIn));
  const rows = Math.max(1, Math.ceil(heightIn / pattern.module.heightIn));
  const placements: DeckTilePlacement[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const tile of pattern.module.tiles) {
        const assignment = assignUnitTexture(set, pattern.name, idx, [
          tile.w,
          tile.h,
        ]);
        placements.push({
          wIn: tile.w,
          hIn: tile.h,
          laidWIn: Math.max(0.1, tile.w - jointIn),
          laidHIn: Math.max(0.1, tile.h - jointIn),
          cxIn: c * pattern.module.widthIn + tile.x + tile.w / 2,
          cyIn: r * pattern.module.heightIn + tile.y + tile.h / 2,
          rotDeg: tile.rot,
          thicknessIn: tileThicknessIn(
            pattern,
            tile.sizeLabel,
            PORCELAIN_BODY_SLUGS.has(material.productSlug)
              ? PORCELAIN_THICKNESS_IN
              : FALLBACK_THICKNESS_IN,
          ),
          assignment,
          faceUrl: set.variants[assignment.variantIndex].url,
        });
        idx++;
      }
    }
  }
  return {
    kind: "module",
    material,
    pattern,
    jointIn,
    moduleWIn: pattern.module.widthIn,
    moduleHIn: pattern.module.heightIn,
    placements,
  };
}

/** One honeycomb cell of a hexagonal deck (repair build
 *  2026-11-04, Stage 5 — audit §F). The assignment index is a
 *  pure function of the lattice coordinates, so the 2D tile
 *  and the 3D deck assign the SAME face to the same cell —
 *  the parity the rectangular module path gets from its
 *  placement index. */
export interface HexDeckPlacement {
  /** Centre, inches, deck space (bbox min corner origin). */
  cxIn: number;
  czIn: number;
  /** Honeycomb lattice coordinates (column k, row j). */
  k: number;
  j: number;
  assignment: UnitTextureAssignment;
  faceUrl: string;
  thicknessIn: number;
}

export interface HexDeckLayout {
  nominalIn: number;
  jointIn: number;
  thicknessIn: number;
  placements: HexDeckPlacement[];
}

/**
 * The studio honeycomb layout: hexDeckLayoutSized's lattice
 * (flat faces ±z, vertices ±x, dx = 1.5R, dz = √3R, odd
 * columns offset half a row) expressed in deck space with a
 * per-cell face assignment from the product's own set — the
 * placements the 3D prism builder and the 2D honeycomb tile
 * both consume. Undefined for non-hex materials or a product
 * without a set/pattern (nothing is invented).
 */
export function hexDeckPlacements(
  material: BelgardDeckMaterial,
  widthIn: number,
  heightIn: number,
): HexDeckLayout | undefined {
  if (!material.hex) return undefined;
  const set = belgardUnitSetForMaterial(material);
  const pattern = material.pattern;
  if (!set || !pattern) return undefined;
  const nominalIn = pattern.module.tiles[0]?.w ?? 12;
  const jointIn = jointWidthInFor(material.productSlug);
  const probe = layoutBelgardDeck(material, nominalIn, nominalIn);
  const thicknessIn =
    probe.kind === "module"
      ? probe.placements[0]?.thicknessIn ?? FALLBACK_THICKNESS_IN
      : FALLBACK_THICKNESS_IN;
  const R = nominalIn / 2;
  const dx = 1.5 * R;
  const dz = Math.sqrt(3) * R;
  const maxX = widthIn / 2 + R;
  const maxZ = heightIn / 2 + R;
  const K = Math.ceil(maxX / dx);
  const J = Math.ceil(maxZ / dz);
  const placements: HexDeckPlacement[] = [];
  for (let k = -K; k <= K; k++) {
    const x = k * dx;
    const off = Math.abs(k) % 2 === 1 ? dz / 2 : 0;
    for (let j = -J; j <= J; j++) {
      const z = j * dz + off;
      if (Math.abs(x) > maxX || Math.abs(z) > maxZ) continue;
      const assignmentIndex = (k + 512) * 1024 + (j + 512);
      const assignment = assignUnitTexture(set, pattern.name, assignmentIndex, [
        nominalIn,
        nominalIn,
      ]);
      placements.push({
        cxIn: x + widthIn / 2,
        czIn: z + heightIn / 2,
        k,
        j,
        assignment,
        faceUrl: set.variants[assignment.variantIndex].url,
        thicknessIn,
      });
    }
  }
  return { nominalIn, jointIn, thicknessIn, placements };
}

/** Honeycomb layout for a Hexagon deck of a given target size —
 *  the tab's hexDeckLayout (Job G11) with its target
 *  parameterised: flat faces face ±z and vertices point ±x,
 *  centers on the true honeycomb grid. PaverCutVisualizer's
 *  one-arg hexDeckLayout delegates here with its fixed
 *  DECK_TARGET constants. */
export function hexDeckLayoutSized(
  nominalIn: number,
  targetWIn: number,
  targetHIn: number,
): {
  centers: { x: number; z: number }[];
  widthIn: number;
  heightIn: number;
} {
  const R = nominalIn / 2;
  const dx = 1.5 * R;
  const dz = Math.sqrt(3) * R;
  const maxX = targetWIn / 2 + R;
  const maxZ = targetHIn / 2 + R;
  const centers: { x: number; z: number }[] = [];
  const K = Math.ceil(maxX / dx);
  const J = Math.ceil(maxZ / dz);
  for (let k = -K; k <= K; k++) {
    const x = k * dx;
    const off = Math.abs(k) % 2 === 1 ? dz / 2 : 0;
    for (let j = -J; j <= J; j++) {
      const z = j * dz + off;
      if (Math.abs(x) <= maxX && Math.abs(z) <= maxZ) centers.push({ x, z });
    }
  }
  const extX = centers.reduce((m, c) => Math.max(m, Math.abs(c.x)), 0);
  const extZ = centers.reduce((m, c) => Math.max(m, Math.abs(c.z)), 0);
  return {
    centers,
    widthIn: 2 * (extX + R),
    heightIn: 2 * (extZ + (Math.sqrt(3) / 2) * R),
  };
}

/**
 * Loose-field layout for the silhouette (block-cut v2) stones — Job 3,
 * 2026-11-06; packing rewritten the same night. Amorphous stones are
 * never tiled on a grid (founder law): they are laid like a real
 * cobble / flagstone field, each stone at its own true inches and
 * its own traced outline, cycling through EVERY stone of the set so
 * a built field never repeats one sample, with a small deterministic
 * rotation per stone (a laid stone can sit at any angle; its texture
 * stays registered to its own outline).
 *
 * The packer NESTS the stones' real polygons: bottom-left first-fit
 * over the whole field. (An earlier row packer guaranteed only the
 * minimum joint and left empty bands between its rows — density is
 * the requirement, not just clearance.) For each new stone,
 * candidate spots hang off the stones on the field's unfilled
 * frontier: slid hard right of an anchor on its own centre line,
 * slid hard below it in its own column, dropped down the field's
 * left edge to an anchor's bottom — plus the field's empty top-left
 * corner. The slides cross filled ground on bounding boxes alone
 * (a box-clear spot is outline-clear too) and the walk keeps the
 * topmost, then leftmost, landing; the best two landings are then
 * descended — walked toward the origin corner in shrinking steps,
 * diagonals included, every step verified against the real outlines
 * — so each stone wedges into the two-contact pocket at its landing
 * instead of floating on one contact. A spot is only ever accepted
 * when the stone's outline keeps at least `gapIn` — the joint —
 * from every stone already down, so the recessed filler surface
 * under the field reads as joint fill, never as open plane.
 *
 * If no candidate keeps the joint for the stone in hand, the packer
 * tries the next stone in the cycle — a smaller or different shape
 * may still fit the pockets that remain — and stops only when a
 * full cycle of stones fits nowhere (or 5000 stones are down): the
 * field is full, and it never loops, never shrinks the joint to
 * force a fit. Placement is fully deterministic (seeded LCG) so
 * the tab, the studios and the tests all lay the same field.
 */
export interface SilhouetteStoneSize {
  wIn: number;
  dIn: number;
  /** Traced outline, [x, y] pairs 0..1 over the stone's own frame,
   *  y down (belgardStoneOutlines). A stone without one packs as its
   *  bounding rectangle. */
  pts?: [number, number][];
}
export interface SilhouettePlacement {
  /** Index into the stones array (cycles through all of them). */
  stoneIndex: number;
  x: number;
  z: number;
  /** Whole-stone rotation around Y, radians. */
  rotY: number;
}

/** A stone outline in local inches: scaled from its traced points,
 *  centered on the stone's FRAME center — the same center
 *  buildSilhouettePaverCut builds the mesh around ((px - 0.5) * wIn,
 *  (py - 0.5) * dIn, with the renderer's y-flip landing the point at
 *  z = (py - 0.5) * dIn after its rotateX) and the visualizer
 *  positions the group at — turned by rotY in THREE's rotation.y
 *  sense. The outline checked here is therefore the outline the
 *  renderer draws, at the same center, so a placement's (x, z) is
 *  the stone's frame center in both worlds and the packed joint is
 *  the rendered joint, exactly. */
interface LocalSilhouette {
  pts: [number, number][];
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}
function localSilhouette(
  stone: SilhouetteStoneSize,
  rotY: number
): LocalSilhouette {
  const raw: [number, number][] =
    stone.pts && stone.pts.length >= 3
      ? stone.pts.map(
          ([px, py]) =>
            [(px - 0.5) * stone.wIn, (py - 0.5) * stone.dIn] as [
              number,
              number,
            ]
        )
      : [
          [-stone.wIn / 2, -stone.dIn / 2],
          [stone.wIn / 2, -stone.dIn / 2],
          [stone.wIn / 2, stone.dIn / 2],
          [-stone.wIn / 2, stone.dIn / 2],
        ];
  const cos = Math.cos(rotY);
  const sin = Math.sin(rotY);
  const pts: [number, number][] = raw.map(([lx, lz]) => {
    return [lx * cos + lz * sin, -lx * sin + lz * cos] as [number, number];
  });
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const [x, z] of pts) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  return { pts, minX, maxX, minZ, maxZ };
}

/** One placed stone's world-space outline (inches) with its bbox
 *  and the centre it was laid at (the anchor the nesting candidates
 *  hang off). */
interface PlacedSilhouette {
  radius: number;
  flat: Float64Array;
  eb: Float64Array;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  cx: number;
  cz: number;
}

function pointSegDist(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number
): number {
  const abx = bx - ax;
  const abz = bz - az;
  const lenSq = abx * abx + abz * abz;
  const t =
    lenSq === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((px - ax) * abx + (pz - az) * abz) / lenSq)
        );
  return Math.hypot(px - (ax + t * abx), pz - (az + t * abz));
}

function segsCross(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  cx: number,
  cz: number,
  dx: number,
  dz: number
): boolean {
  const d1 = (dx - cx) * (az - cz) - (dz - cz) * (ax - cx);
  const d2 = (dx - cx) * (bz - cz) - (dz - cz) * (bx - cx);
  const d3 = (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
  const d4 = (bx - ax) * (dz - az) - (bz - az) * (dx - ax);
  return (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  );
}

/** Minimum segment-to-segment distance between two outlines. */
function segSegDist(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  cx: number,
  cz: number,
  dx: number,
  dz: number
): number {
  if (segsCross(ax, az, bx, bz, cx, cz, dx, dz)) return 0;
  return Math.min(
    pointSegDist(ax, az, cx, cz, dx, dz),
    pointSegDist(bx, bz, cx, cz, dx, dz),
    pointSegDist(cx, cz, ax, az, bx, bz),
    pointSegDist(dx, dz, ax, az, bx, bz)
  );
}

function pointInPolyFlat(
  px: number,
  pz: number,
  flat: Float64Array,
  n: number
): boolean {
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = flat[i * 2];
    const zi = flat[i * 2 + 1];
    const xj = flat[j * 2];
    const zj = flat[j * 2 + 1];
    if (zi > pz !== zj > pz && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Exact outline clearance on flat arrays: the candidate's outline and its
 *  gap-grown per-edge boxes in scratch buffers, the placed stone's
 *  outline and per-edge boxes precomputed at placement. Same math,
 *  same early exits — no per-query allocation or destructuring. */
function clearPairFlat(
  aFlat: Float64Array,
  aEb: Float64Array,
  an: number,
  b: PlacedSilhouette,
  gapIn: number
): boolean {
  const bf = b.flat;
  const beb = b.eb;
  const bn = bf.length / 2;
  for (let i = 0; i < an; i++) {
    const aMinX = aEb[i * 4];
    const aMinZ = aEb[i * 4 + 1];
    const aMaxX = aEb[i * 4 + 2];
    const aMaxZ = aEb[i * 4 + 3];
    const ax = aFlat[i * 2];
    const az = aFlat[i * 2 + 1];
    const ni = (i + 1) % an;
    const bx = aFlat[ni * 2];
    const bz = aFlat[ni * 2 + 1];
    for (let j = 0; j < bn; j++) {
      if (
        beb[j * 4 + 2] < aMinX ||
        beb[j * 4] > aMaxX ||
        beb[j * 4 + 3] < aMinZ ||
        beb[j * 4 + 1] > aMaxZ
      ) {
        continue;
      }
      const cx = bf[j * 2];
      const cz = bf[j * 2 + 1];
      const nj = (j + 1) % bn;
      if (segSegDist(ax, az, bx, bz, cx, cz, bf[nj * 2], bf[nj * 2 + 1]) < gapIn) {
        return false;
      }
    }
  }
  if (
    pointInPolyFlat(aFlat[0], aFlat[1], bf, bn) ||
    pointInPolyFlat(bf[0], bf[1], aFlat, an)
  ) {
    return false;
  }
  return true;
}

export function silhouetteFieldLayout(
  stones: SilhouetteStoneSize[],
  targetWIn: number,
  targetHIn: number,
  gapIn: number
): { placements: SilhouettePlacement[]; widthIn: number; heightIn: number } {
  const placements: SilhouettePlacement[] = [];
  if (stones.length === 0) return { placements, widthIn: 0, heightIn: 0 };
  let seed = 1234567;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const placed: PlacedSilhouette[] = [];
  const halfW = targetWIn / 2;
  const halfH = targetHIn / 2;

  // Spatial index over the placed stones: the clearance test only
  // runs the polygon test against stones whose cells the candidate's
  // gap-grown box actually touches. A stone that could come within
  // the joint must have its box inside that grown box, so it sits in
  // one of those cells — the index never hides a real neighbour. A
  // per-query stamp keeps the neighbour walk allocation-free.
  const CELL_IN = 24;
  const grid = new Map<string, number[]>();
  const stamps: number[] = [];
  let queryStamp = 0;
  let aScratch = new Float64Array(0);
  let aEb = new Float64Array(0);
  const cellSpan = (min: number, max: number): [number, number] => [
    Math.floor(min / CELL_IN),
    Math.floor(max / CELL_IN),
  ];

  // The first stone already down that the outline, centered at
  // (cx, cz), would come within the joint of — or null when the spot
  // is clear. Neighbours are pre-filtered on bounding boxes grown by
  // the gap: a stone whose grown box misses the candidate's box
  // cannot come within the gap.
  const firstBlocker = (
    local: LocalSilhouette,
    cx: number,
    cz: number,
    lr: number
  ): PlacedSilhouette | null => {
    const minX = cx + local.minX;
    const maxX = cx + local.maxX;
    const minZ = cz + local.minZ;
    const maxZ = cz + local.maxZ;
    const n = local.pts.length;
    if (aScratch.length < n * 2) {
      aScratch = new Float64Array(n * 2);
      aEb = new Float64Array(n * 4);
    }
    for (let i = 0; i < n; i++) {
      aScratch[i * 2] = cx + local.pts[i][0];
      aScratch[i * 2 + 1] = cz + local.pts[i][1];
    }
    for (let i = 0; i < n; i++) {
      const ni = (i + 1) % n;
      const eax = aScratch[i * 2];
      const eaz = aScratch[i * 2 + 1];
      const ebx = aScratch[ni * 2];
      const ebz = aScratch[ni * 2 + 1];
      aEb[i * 4] = Math.min(eax, ebx) - gapIn;
      aEb[i * 4 + 1] = Math.min(eaz, ebz) - gapIn;
      aEb[i * 4 + 2] = Math.max(eax, ebx) + gapIn;
      aEb[i * 4 + 3] = Math.max(eaz, ebz) + gapIn;
    }
    queryStamp++;
    const [gx0, gx1] = cellSpan(minX - gapIn, maxX + gapIn);
    const [gz0, gz1] = cellSpan(minZ - gapIn, maxZ + gapIn);
    for (let gx = gx0; gx <= gx1; gx++) {
      for (let gz = gz0; gz <= gz1; gz++) {
        const cell = grid.get(`${gx},${gz}`);
        if (!cell) continue;
        for (const pi of cell) {
          if (stamps[pi] === queryStamp) continue;
          stamps[pi] = queryStamp;
          const p = placed[pi];
          if (
            maxX + gapIn <= p.minX ||
            p.maxX + gapIn <= minX ||
            maxZ + gapIn <= p.minZ ||
            p.maxZ + gapIn <= minZ
          ) {
            continue;
          }
          // Bounding-circle reject: a stone whose circle cannot
          // reach the candidate's circle cannot come within the
          // joint — skip the segment work. Conservative and exact:
          // it only ever skips pairs that are provably clear.
          const cdx = cx - p.cx;
          const cdz = cz - p.cz;
          const rr = lr + p.radius + gapIn;
          if (cdx * cdx + cdz * cdz > rr * rr) continue;
          if (!clearPairFlat(aScratch, aEb, n, p, gapIn)) return p;
        }
      }
    }
    return null;
  };
  const fitsAt = (
    local: LocalSilhouette,
    cx: number,
    cz: number,
    lr: number
  ): boolean => firstBlocker(local, cx, cz, lr) === null;
  const radiusOf = (local: LocalSilhouette): number =>
    Math.max(...local.pts.map(([x, z]) => Math.hypot(x, z)));


  // Bbox-level overlap scan: among placed stones whose gap-grown
  // boxes overlap the candidate's box at (cx, cz), the jump targets
  // that clear every one of them on each axis — or null when the
  // box is clear, which proves the outline is clear too (boxes
  // contain their outlines). Pure arithmetic on stored boxes: this
  // is what lets the slides below cross filled ground without
  // running the polygon test at every step.
  const bboxOverlapJump = (
    local: LocalSilhouette,
    cx: number,
    cz: number
  ): { jx: number; jz: number } | null => {
    const minX = cx + local.minX;
    const maxX = cx + local.maxX;
    const minZ = cz + local.minZ;
    const maxZ = cz + local.maxZ;
    queryStamp++;
    const [gx0, gx1] = cellSpan(minX - gapIn, maxX + gapIn);
    const [gz0, gz1] = cellSpan(minZ - gapIn, maxZ + gapIn);
    let jx = -Infinity;
    let jz = -Infinity;
    let hit = false;
    for (let gx = gx0; gx <= gx1; gx++) {
      for (let gz = gz0; gz <= gz1; gz++) {
        const cell = grid.get(`${gx},${gz}`);
        if (!cell) continue;
        for (const pi of cell) {
          if (stamps[pi] === queryStamp) continue;
          stamps[pi] = queryStamp;
          const p = placed[pi];
          if (
            maxX + gapIn <= p.minX ||
            p.maxX + gapIn <= minX ||
            maxZ + gapIn <= p.minZ ||
            p.maxZ + gapIn <= minZ
          ) {
            continue;
          }
          hit = true;
          jx = Math.max(jx, p.maxX + gapIn - local.minX);
          jz = Math.max(jz, p.maxZ + gapIn - local.minZ);
        }
      }
    }
    return hit ? { jx, jz } : null;
  };

  // Slide along x at a fixed z, from lo toward hi: the leftmost spot
  // where the outline clears the field, or null. The walk meets one
  // blocker at a time and bisects THAT blocker's forbidden interval
  // (from the blocked spot to where the candidate's box clears the
  // blocker's box) for the first clear spot inside it — the
  // interlock pocket against this blocker, where the candidate's
  // edge nests into the blocker's recess instead of jumping past
  // the whole stone. Only when no clear spot samples inside the
  // interval does the walk step past it and meet the next blocker.
  const slideX = (
    local: LocalSilhouette,
    cz: number,
    lo: number,
    hi: number
  ): number | null => {
    if (lo > hi) return null;
    let x = lo;
    for (let iter = 0; iter < 64; iter++) {
      if (x > hi) return null;
      const hit = bboxOverlapJump(local, x, cz);
      if (!hit) return x;
      if (hit.jx > hi) return null;
      x = hit.jx + 1e-6;
    }
    return null;
  };
  // Same slide down z at a fixed x.
  const slideZ = (
    local: LocalSilhouette,
    cx: number,
    lo: number,
    hi: number
  ): number | null => {
    if (lo > hi) return null;
    let z = lo;
    for (let iter = 0; iter < 64; iter++) {
      if (z > hi) return null;
      const hit = bboxOverlapJump(local, cx, z);
      if (!hit) return z;
      if (hit.jz > hi) return null;
      z = hit.jz + 1e-6;
    }
    return null;
  };

  // Bottom-left descent: from a candidate landing, walk the stone
  // toward the field's origin corner (smallest z, then smallest x)
  // in shrinking steps — straight up, straight left and both
  // up-diagonals — accepting only spots the exact polygon test
  // verifies clear. The diagonals are the pocket moves: the stone
  // slides along one neighbour's edge until it wedges against the
  // next, the two-contact nest a one-axis slide cannot find. Every
  // accepted spot keeps the joint and stays inside the field.
  const descend = (
    local: LocalSilhouette,
    cx: number,
    cz: number
  ): { cx: number; cz: number } => {
    const gw = (local.maxX - local.minX) / 2;
    const gh = (local.maxZ - local.minZ) / 2;
    const fieldLoX = -halfW - gw - local.minX;
    const fieldLoZ = -halfH - gh - local.minZ;
    const fieldHiX = halfW + gw - local.maxX;
    const fieldHiZ = halfH + gh - local.maxZ;
    const lr = radiusOf(local);
    let x = cx;
    let z = cz;
    const dirs: [number, number][] = [
      [0, -1],
      [-1, 0],
      [-0.7071, -0.7071],
      [0.7071, -0.7071],
    ];
    for (const step of [1.0, 0.5, 0.25, 0.125]) {
      let improved = true;
      let guard = 0;
      while (improved && guard++ < 250) {
        improved = false;
        for (const [dx, dz] of dirs) {
          const nx = x + dx * step;
          const nz = z + dz * step;
          if (
            nx < fieldLoX - 1e-9 ||
            nz < fieldLoZ - 1e-9 ||
            nx > fieldHiX + 1e-9 ||
            nz > fieldHiZ + 1e-9
          )
            continue;
          const better =
            nz < z - 1e-9 ||
            (Math.abs(nz - z) <= 1e-9 && nx < x - 1e-9);
          if (!better) continue;
          if (fitsAt(local, nx, nz, lr)) {
            x = nx;
            z = nz;
            improved = true;
          }
        }
      }
    }
    return { cx: x, cz: z };
  };

  const place = (
    stoneIndex: number,
    local: LocalSilhouette,
    cx: number,
    cz: number,
    rotY: number
  ) => {
    const flat = new Float64Array(local.pts.length * 2);
    for (let i = 0; i < local.pts.length; i++) {
      flat[i * 2] = cx + local.pts[i][0];
      flat[i * 2 + 1] = cz + local.pts[i][1];
    }
    const eb = new Float64Array(local.pts.length * 4);
    for (let i = 0; i < local.pts.length; i++) {
      const ni = (i + 1) % local.pts.length;
      eb[i * 4] = Math.min(flat[i * 2], flat[ni * 2]);
      eb[i * 4 + 1] = Math.min(flat[i * 2 + 1], flat[ni * 2 + 1]);
      eb[i * 4 + 2] = Math.max(flat[i * 2], flat[ni * 2]);
      eb[i * 4 + 3] = Math.max(flat[i * 2 + 1], flat[ni * 2 + 1]);
    }
    const rec: PlacedSilhouette = {
      radius: radiusOf(local),
      flat,
      eb,
      minX: cx + local.minX,
      maxX: cx + local.maxX,
      minZ: cz + local.minZ,
      maxZ: cz + local.maxZ,
      cx,
      cz,
    };
    const pi = placed.length;
    placed.push(rec);
    stamps.push(0);
    const [gx0, gx1] = cellSpan(rec.minX, rec.maxX);
    const [gz0, gz1] = cellSpan(rec.minZ, rec.maxZ);
    for (let gx = gx0; gx <= gx1; gx++) {
      for (let gz = gz0; gz <= gz1; gz++) {
        const key = `${gx},${gz}`;
        const cell = grid.get(key);
        if (cell) cell.push(pi);
        else grid.set(key, [pi]);
      }
    }
    // Skyline: the deepest bottom edge over each column of the
    // field — the surface the unfilled frontier hangs from.
    const [sx0, sx1] = skySpan(rec.minX, rec.maxX);
    for (let c = sx0; c <= sx1; c++) {
      if (rec.maxZ > skyline[c]) skyline[c] = rec.maxZ;
    }
    placements.push({ stoneIndex, x: cx, z: cz, rotY });
  };

  // Candidate sources are the stones on the field's unfilled
  // frontier: a placed stone whose bottom edge is within one
  // largest-stone span of the skyline in some column it overlaps —
  // the lowest layer or two of the fill, plus anything bordering a
  // pocket a single stone deep. Stones buried deeper are fully
  // surrounded; their candidate lines cross only filled ground.
  const maxSpan = Math.max(...stones.map((s) => Math.max(s.wIn, s.dIn)));
  const SKY_COL_IN = 2;
  const skyOriginX = -halfW - maxSpan;
  const skyCols = Math.max(
    1,
    Math.ceil((targetWIn + 2 * maxSpan) / SKY_COL_IN)
  );
  const skyline = new Array<number>(skyCols).fill(-halfH - maxSpan);
  const skySpan = (minX: number, maxX: number): [number, number] => [
    Math.max(0, Math.floor((minX - skyOriginX) / SKY_COL_IN)),
    Math.min(skyCols - 1, Math.floor((maxX - skyOriginX) / SKY_COL_IN)),
  ];
  const onFrontier = (p: PlacedSilhouette): boolean => {
    const [c0, c1] = skySpan(p.minX, p.maxX);
    for (let c = c0; c <= c1; c++) {
      if (p.maxZ >= skyline[c] - maxSpan - gapIn) return true;
    }
    return false;
  };

  // One candidate spot for the stone being laid. Exact candidates
  // (the corner, a slide right along an anchor's own centre line)
  // land at their keyZ exactly; slide candidates (down an anchor's
  // column, down the left edge) land at or below their keyZ, which
  // is the lower bound the walk orders them by. keyX is the spot's
  // exact x for the corner and a lower bound on it for the slides.
  // descend marks whether a winning landing is descended into its
  // pocket (the corner candidate is not — it IS the field's
  // corner).
  interface Candidate {
    keyZ: number;
    keyX: number;
    descend: boolean;
    run: () => { cx: number; cz: number } | null;
  }

  let idx = 0;
  let failures = 0;
  while (placements.length < 5000) {
    const stoneIndex = idx % stones.length;
    const rotY = (rand() - 0.5) * 0.22;
    const local = localSilhouette(stones[stoneIndex], rotY);
    // The field a stone may occupy: the target rectangle grown by
    // half the stone on every side (edge stones overhang, as they
    // always have; the returned extents are the actual extents).
    const gw = (local.maxX - local.minX) / 2;
    const gh = (local.maxZ - local.minZ) / 2;
    const inField = (cx: number, cz: number): boolean =>
      cx + local.minX >= -halfW - gw &&
      cx + local.maxX <= halfW + gw &&
      cz + local.minZ >= -halfH - gh &&
      cz + local.maxZ <= halfH + gh;
    const leftCx = -halfW - local.minX;
    const topCz = -halfH - local.minZ;
    const maxCx = halfW + gw - local.maxX;
    const maxCz = halfH + gh - local.maxZ;

    const exact: Candidate[] = [
      // The field's empty corner: the top-left start.
      {
        keyZ: topCz,
        keyX: leftCx,
        descend: false,
        run: () =>
          inField(leftCx, topCz) && fitsAt(local, leftCx, topCz, radiusOf(local))
            ? { cx: leftCx, cz: topCz }
            : null,
      },
    ];
    const slides: Candidate[] = [];
    for (const p of placed) {
      if (!onFrontier(p)) continue;
      // (a) Just right of p, on p's own centre line: the slide starts
      // at p's right edge (plus the joint) and lands at the leftmost
      // clear spot on that line.
      const rightLo = p.maxX + gapIn - local.minX;
      if (rightLo <= maxCx) {
        exact.push({
          keyZ: p.cz,
          keyX: rightLo,
          descend: true,
          run: () => {
            const x = slideX(local, p.cz, rightLo, maxCx);
            return x !== null && inField(x, p.cz)
              ? { cx: x, cz: p.cz }
              : null;
          },
        });
      }
      const belowLo = p.maxZ + gapIn - local.minZ;
      if (belowLo <= maxCz) {
        // (b) Just below p, in p's own column: the slide starts at
        // p's bottom edge (plus the joint).
        slides.push({
          keyZ: belowLo,
          keyX: p.cx,
          descend: true,
          run: () => {
            const z = slideZ(local, p.cx, belowLo, maxCz);
            return z !== null && inField(p.cx, z)
              ? { cx: p.cx, cz: z }
              : null;
          },
        });
        // The left edge at p's bottom: a slide down the field's left
        // wall starting at p's bottom edge.
        slides.push({
          keyZ: belowLo,
          keyX: leftCx,
          descend: true,
          run: () => {
            const z = slideZ(local, leftCx, belowLo, maxCz);
            return z !== null && inField(leftCx, z)
              ? { cx: leftCx, cz: z }
              : null;
          },
        });
      }
    }
    exact.sort((a, b) => a.keyZ - b.keyZ || a.keyX - b.keyX);
    slides.sort((a, b) => a.keyZ - b.keyZ || a.keyX - b.keyX);

    // First fit over the produced (settled) spots: the topmost,
    // then leftmost, valid spot wins. Exact candidates are walked
    // first — a slide starts at its key, a lower bound on where it
    // can land, so once the best produced spot is fixed, slides
    // whose keys have passed it cannot land above it and are not
    // walked. Within a walk, a candidate whose key has passed the
    // best spot cannot produce a spot above it either (settling only
    // moves a stone down and left, by less than its own size), so
    // the walk stops there.
    let bestRaw: { cx: number; cz: number } | null = null;
    const landings: { cx: number; cz: number; descend: boolean }[] = [];
    const produce = (c: Candidate): { cx: number; cz: number } | null =>
      c.run();
    const consider = (c: Candidate) => {
      const found = produce(c);
      if (!found) return;
      landings.push({ cx: found.cx, cz: found.cz, descend: c.descend });
      if (
        !bestRaw ||
        found.cz < bestRaw.cz ||
        (found.cz === bestRaw.cz && found.cx < bestRaw.cx)
      ) {
        bestRaw = found;
      }
    };
    for (const c of exact) {
      if (bestRaw && c.keyZ > bestRaw.cz + 1e-9) break;
      consider(c);
    }
    for (const c of slides) {
      if (bestRaw && c.keyZ > bestRaw.cz + 1e-9) break;
      consider(c);
    }
    // Descend the two best landings into their pockets; the better
    // settled spot wins.
    let best: { cx: number; cz: number } | null = null;
    landings.sort((a, b) => a.cz - b.cz || a.cx - b.cx);
    for (const l of landings.slice(0, 2)) {
      const settled =
        l.descend && placed.length > 0 ? descend(local, l.cx, l.cz) : l;
      if (
        !best ||
        settled.cz < best.cz ||
        (settled.cz === best.cz && settled.cx < best.cx)
      ) {
        best = settled;
      }
    }
    // No candidate kept the joint for this stone: try the next
    // stone in the cycle — a smaller or different shape may still
    // fit the pockets that remain. Stop only when a full cycle of
    // stones fits nowhere (the field is truly full). Never shrink
    // the joint to force a fit.
    if (!best) {
      failures++;
      if (failures >= stones.length) break;
      idx++;
      continue;
    }
    failures = 0;
    place(stoneIndex, local, best.cx, best.cz, rotY);
    idx++;
  }

  // ---- perimeter completion pass --------------------------------
  // The first-fit walk above grows from the field's top-left corner
  // and its candidates hang off the frontier — measured on the real
  // outlines, that leaves the trailing perimeter starved: the last
  // stone-depth band along the bottom (and, less, the right) ends a
  // full cycle with pockets no candidate ever lands in, because the
  // remaining strip is shallower than a stone and the only "below"
  // landings sit on frontier centre lines. The visualizer renders
  // the layout's extents, so that starved band is what read as the
  // empty tip and stepping-stone edges on the live decks. This pass
  // mops it up deterministically: candidate centres straddling all
  // four field edges first, then a coarse grid over the field,
  // trailing corner first — every landing verified by the same
  // exact polygon test, the joint never shrunk, no descending (the
  // descent would drag an edge stone back toward the origin).
  const inFieldFor = (local: LocalSilhouette, cx: number, cz: number) => {
    const gw = (local.maxX - local.minX) / 2;
    const gh = (local.maxZ - local.minZ) / 2;
    return (
      cx + local.minX >= -halfW - gw &&
      cx + local.maxX <= halfW + gw &&
      cz + local.minZ >= -halfH - gh &&
      cz + local.maxZ <= halfH + gh
    );
  };
  let mopAttempts = 0;
  const MOP_BUDGET = 150000;
  const tryMop = (
    stoneIndex: number,
    local: LocalSilhouette,
    rotY: number,
    cx: number,
    cz: number
  ): boolean => {
    if (placements.length >= 5000 || mopAttempts >= MOP_BUDGET) return false;
    mopAttempts++;
    if (!inFieldFor(local, cx, cz)) return false;
    if (!fitsAt(local, cx, cz, radiusOf(local))) return false;
    place(stoneIndex, local, cx, cz, rotY);
    return true;
  };
  let mopStart = 0;
  // Try the set's stones in cycle order (rotating start) at one
  // candidate centre whose coordinates depend on the stone's own
  // local bbox; place the first that fits. The centre is computed
  // from the very local the attempt will lay — a centre derived
  // from the unrotated stone would strand the rotated stone past
  // the field bound it was aimed at.
  const mopAt = (
    centreFor: (local: LocalSilhouette) => { cx: number; cz: number }[]
  ): boolean => {
    for (let k = 0; k < stones.length; k++) {
      const si = (mopStart + k) % stones.length;
      const rotY = (rand() - 0.5) * 0.22;
      const local = localSilhouette(stones[si], rotY);
      for (const c of centreFor(local)) {
        if (tryMop(si, local, rotY, c.cx, c.cz)) {
          mopStart = si + 1;
          return true;
        }
      }
    }
    mopStart++;
    return false;
  };
  // Tier 1 — straddle every field edge: for each step along an
  // edge, a stone whose own edge sits exactly on the target edge,
  // or flush with the grown field limit past it.
  const EDGE_STEP = 2;
  for (let xs = -halfW; xs <= halfW; xs += EDGE_STEP) {
    mopAt((L) => {
      const gh = (L.maxZ - L.minZ) / 2;
      return [
        { cx: xs, cz: halfH - L.maxZ },
        { cx: xs, cz: halfH + gh - L.maxZ },
      ];
    });
    mopAt((L) => {
      const gh = (L.maxZ - L.minZ) / 2;
      return [
        { cx: xs, cz: -halfH - L.minZ },
        { cx: xs, cz: -halfH - gh - L.minZ },
      ];
    });
  }
  for (let zs = -halfH; zs <= halfH; zs += EDGE_STEP) {
    mopAt((L) => {
      const gw = (L.maxX - L.minX) / 2;
      return [
        { cx: halfW - L.maxX, cz: zs },
        { cx: halfW + gw - L.maxX, cz: zs },
      ];
    });
    mopAt((L) => {
      const gw = (L.maxX - L.minX) / 2;
      return [
        { cx: -halfW - L.minX, cz: zs },
        { cx: -halfW - gw - L.minX, cz: zs },
      ];
    });
  }
  // Tier 2 — coarse grid over the whole field, trailing (bottom-
  // right) corner first: the region the walk starves.
  const minDims = stones
    .map((s) => Math.min(s.wIn, s.dIn))
    .sort((a, b) => a - b);
  const medianMin = minDims[Math.floor(minDims.length / 2)] ?? 6;
  const gridStep = Math.min(6, Math.max(2, medianMin / 2));
  for (let cz = halfH; cz >= -halfH; cz -= gridStep) {
    for (let cx = halfW; cx >= -halfW; cx -= gridStep) {
      mopAt(() => [{ cx, cz }]);
    }
  }

  // The returned extents are the laid field's TRUE extents — the
  // placed stones' own bounding box, centred on the origin — not
  // the symmetric 2 * maxAbs box, which padded the side the fill
  // reached least with dead margin the renderer then drew as
  // filler sheet. Stones touch all four edges of the returned
  // extents by construction, and the caption that prints them is
  // the size of the field actually on screen.
  if (placed.length === 0) return { placements, widthIn: 0, heightIn: 0 };
  let bMinX = Infinity;
  let bMaxX = -Infinity;
  let bMinZ = Infinity;
  let bMaxZ = -Infinity;
  for (const p of placed) {
    bMinX = Math.min(bMinX, p.minX);
    bMaxX = Math.max(bMaxX, p.maxX);
    bMinZ = Math.min(bMinZ, p.minZ);
    bMaxZ = Math.max(bMaxZ, p.maxZ);
  }
  const shiftX = -(bMinX + bMaxX) / 2;
  const shiftZ = -(bMinZ + bMaxZ) / 2;
  for (const pl of placements) {
    pl.x += shiftX;
    pl.z += shiftZ;
  }
  return {
    placements,
    widthIn: bMaxX - bMinX,
    heightIn: bMaxZ - bMinZ,
  };
}

/** The laid field's stone outlines in world inches: every
 *  placement's traced polygon rebuilt exactly as the packer built
 *  it (frame-centred local, turned by rotY, at the placement's
 *  centre) — the same polygons the renderer draws. Pure geometry:
 *  the tests rasterize these, the visualizer clips filler to them. */
export function silhouettePlacedPolygons(
  stones: SilhouetteStoneSize[],
  placements: SilhouettePlacement[]
): [number, number][][] {
  return placements.map((p) => {
    const local = localSilhouette(stones[p.stoneIndex], p.rotY);
    return local.pts.map(
      ([lx, lz]) => [p.x + lx, p.z + lz] as [number, number]
    );
  });
}

/** One polygon ring pushed outward by d inches along its edges
 *  (miter joins, clamped). The offset side is chosen per ring so
 *  the ring's area grows — the traced rings share one winding, but
 *  the choice is verified, never assumed. */
function dilateRing(pts: [number, number][], d: number): [number, number][] {
  const signedArea = (ring: [number, number][]) => {
    let a = 0;
    for (let i = 0; i < ring.length; i++) {
      const [x1, z1] = ring[i];
      const [x2, z2] = ring[(i + 1) % ring.length];
      a += x1 * z2 - x2 * z1;
    }
    return a / 2;
  };
  const offset = (sgn: number): [number, number][] => {
    const n = pts.length;
    const out: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % n];
      const r = pts[(i - 1 + n) % n];
      const e1: [number, number] = [p[0] - r[0], p[1] - r[1]];
      const e2: [number, number] = [q[0] - p[0], q[1] - p[1]];
      const l1 = Math.hypot(e1[0], e1[1]) || 1;
      const l2 = Math.hypot(e2[0], e2[1]) || 1;
      const n1: [number, number] = [
        (-sgn * e1[1]) / l1,
        (sgn * e1[0]) / l1,
      ];
      const n2: [number, number] = [
        (-sgn * e2[1]) / l2,
        (sgn * e2[0]) / l2,
      ];
      let mx = n1[0] + n2[0];
      let mz = n1[1] + n2[1];
      const ml = Math.hypot(mx, mz) || 1;
      mx /= ml;
      mz /= ml;
      const cosHalf = Math.max(0.5, mx * n1[0] + mz * n1[1]);
      const scale = Math.min(2, 1 / cosHalf);
      out.push([p[0] + mx * d * scale, p[1] + mz * d * scale]);
    }
    return out;
  };
  const base = Math.abs(signedArea(pts));
  const grown = offset(-1);
  if (Math.abs(signedArea(grown)) >= base) return grown;
  return offset(1);
}

/** One placed stone's outline relative to its own centre, in
 *  inches — the packer's exact local geometry (frame-centred,
 *  turned by rotY), exported for the studio renderers: the 2D
 *  painter clips each face to these points around the
 *  placement's centre, the 3D builder extrudes them. */
export function silhouetteStoneOutlinePts(
  stone: SilhouetteStoneSize,
  rotY: number,
): [number, number][] {
  return localSilhouette(stone, rotY).pts;
}

/** The joint-filler footprint for a laid silhouette field, in the
 *  rings form jointFillSurface consumes. A loose-stone field is
 *  BEDDED, not tiled: the crushed stone underlies the whole field
 *  and shows in every joint AND every void between the stones —
 *  the filling logic's one surface under the whole deck. The
 *  footprint is therefore the laid field itself: every placed
 *  outline grown by a bedding reach R (scaled to the stones' size,
 *  so at the perimeter the bedding hugs the stones instead of
 *  sheeting past them), unioned with the field's core rectangle
 *  inset by R (so the deep interior voids between far-apart stones
 *  are bedded too), and the whole clipped to the field's true
 *  extents — the bedding never extends past the deck's printed
 *  size, the sheet defect of the first v2 ship. R ≥ the joint
 *  width, so wherever two stones meet at the joint the bedding
 *  covers the seam.
 *
 *  The construction this replaces — the union of the outlines
 *  dilated by half the joint only — covered just 4.1% of the
 *  Mega-Arbel field beyond the stones themselves (measured on the
 *  real Amaretto layout): at 0.61 stone coverage the interstitial
 *  voids, 35.1% of the field, many of them inches wide between the
 *  big rounded stones, received no filler at all and showed the
 *  viewer's near-white ground straight through the deck — the
 *  live failure of 2026-11-06 22:37 ET, invisible to the earlier
 *  raster proof because it plotted the footprint dark over a dark
 *  canvas and measured stone coverage only. The bedding footprint
 *  below leaves 1.2–3.3% of the extents open across the five v2
 *  sets (deep perimeter notches only), overshoot exactly 0.
 *  Any failure in the clipping ops falls back to the joint-band
 *  union, so the deck never renders with no filler at all. */
export function silhouetteFillerRings(
  stones: SilhouetteStoneSize[],
  placements: SilhouettePlacement[],
  gapIn: number
): Array<Array<Array<{ x: number; z: number }>>> {
  if (placements.length === 0) return [];
  const polys = silhouettePlacedPolygons(stones, placements);
  const toRings = (
    mp: [number, number][][][]
  ): Array<Array<Array<{ x: number; z: number }>>> =>
    mp.map((poly) => poly.map((ring) => ring.map(([x, z]) => ({ x, z }))));
  // Fallback: the joint band alone (the pre-bedding construction).
  const jointBand = (): Array<Array<Array<{ x: number; z: number }>>> => {
    const dilated = polys.map(
      (poly) => [dilateRing(poly, gapIn / 2)] as [number, number][][] 
    );
    return toRings(
      polygonClipping.union(dilated[0], ...dilated.slice(1)) as [
        number,
        number
      ][][][]
    );
  };
  try {
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const poly of polys) {
      for (const [x, z] of poly) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }
    }
    const charSize =
      stones.reduce((s, st) => s + Math.sqrt(st.wIn * st.dIn), 0) /
      Math.max(1, stones.length);
    const reach = Math.min(7, Math.max(2, gapIn, 0.3 * charSize));
    const useInset = maxX - minX > 2 * reach && maxZ - minZ > 2 * reach;
    // Exact cost cut: with the inset core in place, a stone deeper
    // than 2R from every edge contributes nothing the core does
    // not already bed (any point within R of it that lies outside
    // the core would put the stone within 2R of an edge), so only
    // the perimeter stones are dilated and unioned. On the Cobble
    // fields (800+ stones) this is the difference between a ~1s
    // and a ~4s footprint.
    const parts: [number, number][][][] = [];
    for (const poly of polys) {
      if (useInset) {
        let pMinX = Infinity;
        let pMaxX = -Infinity;
        let pMinZ = Infinity;
        let pMaxZ = -Infinity;
        for (const [x, z] of poly) {
          if (x < pMinX) pMinX = x;
          if (x > pMaxX) pMaxX = x;
          if (z < pMinZ) pMinZ = z;
          if (z > pMaxZ) pMaxZ = z;
        }
        const dEdge = Math.min(
          pMinX - minX,
          maxX - pMaxX,
          pMinZ - minZ,
          maxZ - pMaxZ
        );
        if (dEdge > 2 * reach) continue;
      }
      parts.push([dilateRing(poly, reach)]);
    }
    if (useInset) {
      parts.push([
        [
          [minX + reach, minZ + reach],
          [maxX - reach, minZ + reach],
          [maxX - reach, maxZ - reach],
          [minX + reach, maxZ - reach],
        ],
      ]);
    }
    const bed = polygonClipping.union(parts[0], ...parts.slice(1));
    const extents: [number, number][][] = [
      [
        [minX, minZ],
        [maxX, minZ],
        [maxX, maxZ],
        [minX, maxZ],
      ],
    ];
    const clipped = polygonClipping.intersection(bed, extents);
    if (clipped.length === 0) return jointBand();
    return toRings(clipped as [number, number][][][]);
  } catch {
    return jointBand();
  }
}

/** Filler footprint for a honeycomb (Hexagon Series) deck — the
 *  hexagon counterpart of silhouetteFillerRings (Studios-Completion
 *  Audit routed gap, 2026-11-07). The tab's hexagon deck used to lay
 *  the joint filler as ONE rectangular plane spanning the layout's
 *  bounding box (jointFillMesh over widthIn × heightIn): a honeycomb
 *  never reaches its bounding-box corners, so the sheet stuck out
 *  past the stones around the perimeter — the same overhang class
 *  the silhouette clip fixed for the amorphous fields.
 *
 *  Construction: each placed hexagon's own footprint — the prism
 *  buildHexPaverCut actually lays, circumradius R − gap/√3 (its
 *  face-gap shrink) around the layout center, vertices on ±x —
 *  dilated by half the joint and unioned. The dilation all but
 *  undoes the shrink (radius −gap/√3, apothem −gap/2; dilating by
 *  gap/2 restores both), so the union is the nominal honeycomb
 *  blob: stones + joints + a half-joint rim, nothing past it. The
 *  dilation carries a 0.02 in overlap epsilon on top of the half
 *  joint: at exactly gap/2 the cells would meet on shared edges,
 *  and edge-touching polygons are degenerate for the clipping
 *  union (it throws "unable to complete output ring" on the full
 *  lattice — measured 2026-11-07); a hair of overlap makes them
 *  merge, at the cost of 0.02 in of rim. Any failure in the
 *  clipping op falls back to the un-unioned dilated cells, so the
 *  deck never renders with no filler at all. */
export function hexFillerRings(
  centers: { x: number; z: number }[],
  nominalIn: number,
  gapIn: number
): Array<Array<Array<{ x: number; z: number }>>> {
  if (centers.length === 0) return [];
  const r = Math.max(0.1, nominalIn / 2 - gapIn / Math.sqrt(3));
  const cell = (c: { x: number; z: number }): [number, number][] => {
    const ring: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ring.push([c.x + r * Math.cos(a), c.z + r * Math.sin(a)]);
    }
    return ring;
  };
  const dilated = centers.map(
    (c) => [dilateRing(cell(c), gapIn / 2 + 0.02)] as [number, number][][]
  );
  const toRings = (
    mp: [number, number][][][]
  ): Array<Array<Array<{ x: number; z: number }>>> =>
    mp.map((poly) => poly.map((ring) => ring.map(([x, z]) => ({ x, z }))));
  // One union over the whole lattice throws inside polygon-clipping
  // past ~200 cells (measured 2026-11-07 — the regular lattice's
  // mass of collinear overlapping edges again), so union in chunks
  // and merge the chunk blobs pairwise, keeping whatever merged if
  // a merge throws: the result is one blob in the normal case and
  // never worse than a handful of overlapping chunk blobs, each
  // still clipped to the honeycomb.
  type Multi = [number, number][][][];
  const unionPolys = (polys: [number, number][][][]): Multi =>
    polygonClipping.union(polys[0], ...polys.slice(1)) as Multi;
  let level: Multi = [];
  const CHUNK = 96;
  for (let i = 0; i < dilated.length; i += CHUNK) {
    const part = dilated.slice(i, i + CHUNK);
    try {
      level.push(...unionPolys(part));
    } catch {
      level.push(...(part as Multi));
    }
  }
  while (level.length > 1) {
    const next: Multi = [];
    let mergedAny = false;
    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 >= level.length) {
        next.push(level[i]);
        continue;
      }
      try {
        next.push(...unionPolys([level[i], level[i + 1]]));
        mergedAny = true;
      } catch {
        next.push(level[i], level[i + 1]);
      }
    }
    level = next;
    if (!mergedAny) break;
  }
  return toRings(level);
}
