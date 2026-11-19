import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  buildHexPaverCut,
  buildPaverCut,
  buildSilhouettePaverCut,
  type PaverCutSpec,
} from "@/lib/visual/paverCut3d";
import { BELGARD_STONE_OUTLINES, type BelgardStoneOutline } from "@/data/belgardStoneOutlines";
import {
  BELGARD_TEXTURES_3D,
  infiniteFieldSpan,
  type BelgardTexture3d,
} from "@/data/belgardTextures3d";
import { BELGARD_MEDIA_LOGIC } from "@/data/belgardMediaLogic";
import { BELGARD_PATTERNS, type BelgardPattern } from "@/data/belgardPatterns";
import {
  BELGARD_UNIT_TEXTURES,
  type BelgardUnitTextureSet,
} from "@/data/belgardUnitTextures";
import {
  assignUnitTexture,
  deckUnitOriginClause,
  findUnitTextureSet,
  isGeneratedSet,
  piecesOriginClause,
  unitProvenanceLine,
  unitSetProvenance,
  type UnitTextureAssignment,
} from "@/lib/visual/unitTextureLogic";

/* Provenance classification lives in lib/visual/unitTextureLogic.ts
   (moved 2026-11-07 so the FLIP book classifies a set through the same
   derivation); re-exported here so existing imports keep resolving. */
export { isGeneratedSet, unitSetProvenance } from "@/lib/visual/unitTextureLogic";
import { normalReadyFor, normalTextureFor } from "@/lib/visual/normalMaps";
import {
  applyBelgardMaterialLogic,
  belgardMaterialLogic,
} from "@/lib/visual/belgardMaterialLogic";
import {
  loadUnitTexture as loadTexture,
  configureUnitTexture,
  applyUnitTint as applyTint,
  disposeUnitGroup as disposeGroup,
  setUnitTextureAnisotropy,
  getUnitTextureAnisotropy,
  onTexturesSettled,
} from "@/lib/visual/unitTextureRuntime";
import {
  parseDimIn,
  parseSizeLabel,
  hexDeckLayoutSized,
  hexFillerRings,
  silhouetteFieldLayout,
  silhouetteFillerRings,
  layoutBelgardDeck,
  type PatternSize,
} from "@/lib/visual/belgardDeckLayout";
import {
  belgardDeckMaterialByKey,
  belgardPatternsFor,
  belgardUnitSetForMaterial,
} from "@/lib/visual/belgardUnitLibrary";

export { parseSizeLabel } from "@/lib/visual/belgardDeckLayout";
import {
  JOINT_FILLERS,
  fillerById,
  fillerSuitability,
  formatJointIn,
  jointFillMesh,
  jointFillSurface,
  jointWidthInFor,
  recommendedFiller,
} from "@/lib/visual/belgardFillingLogic";

/**
 * Chip thumbnail source (founder order 2026-11-02): chips show GOOD
 * images only — never the Job-1 AI-upscaled webp thumbnails. Per option:
 * (a) the product's Media & Logic catalog swatch (matched by the
 * option's recorded sourceSwatch filename), else (b) variant-0 of the
 * option's per-unit texture set, else (c) the legacy webp. Picking a
 * chip still applies the field texture exactly as before — only the
 * thumbnail image changes.
 */
/** A texture entry's qualified name: bare option plus its finish
 *  qualifier where one exists ("CHAMOIS Matte") — the same string
 *  belgardUnitLibrary.belgardKeyOption stores for a material, so a
 *  key lookup honours it exactly. Finish-qualified products (Classic
 *  Plaza Slab's Shot Blast / Matte / Diamond) share ONE bare option
 *  per color, so the bare option alone cannot name an entry. */
function qualifiedOptionName(o: BelgardTexture3d): string {
  return o.qualifier ? `${o.option} ${o.qualifier}` : o.option;
}

/** The per-unit set a texture entry lays — qualifier-aware, the
 *  studio path's join (Studios-Completion Audit gap 2, 2026-11-07).
 *  The file page used to resolve with the bare option only, and
 *  findUnitTextureSet's prefix tier then landed every finish chip
 *  on the FIRST sibling set (every Classic Plaza Slab finish showed
 *  the same faces). When the entry names a finish, the studio's
 *  belgardUnitSetForMaterial picks the set carrying THAT finish;
 *  unqualified entries keep the original bare-option resolution. */
function findSetForTexture(
  productSlug: string,
  o: BelgardTexture3d
): BelgardUnitTextureSet | null {
  if (o.qualifier) {
    const own = belgardUnitSetForMaterial({
      productSlug,
      option: o.option,
      qualifier: o.qualifier,
    });
    if (own) return own;
  }
  return findUnitTextureSet(BELGARD_UNIT_TEXTURES, productSlug, o.option);
}

function chipImageFor(o: BelgardTexture3d): string {
  const ml = BELGARD_MEDIA_LOGIC.find((p) => p.slug === o.productSlug);
  const swatch = ml?.options.find((x) => x.image.endsWith(`/${o.sourceSwatch}`));
  if (swatch) return swatch.image;
  const set = findSetForTexture(o.productSlug, o);
  if (set?.variants[0]) return set.variants[0].url;
  return o.webp;
}

/**
 * Red GENERATED tag (founder order 2026-11-07): every per-unit set whose
 * provenance is GENERATED is tagged in red wherever the set is presented
 * on the Belgard file page — its option chip and the visualizer header.
 * Driven by unitSetProvenance() itself, never a hand-maintained list, so
 * a set is tagged automatically the moment it wires in as generated, and
 * field / swatch / cutsheet sets never carry it. A set that mixes one
 * real face with generated siblings (Catalina Grana Rio) is classified
 * generated as a set, so it is tagged.
 */
const GeneratedTag = ({ className = "" }: { className?: string }) => (
  <span
    data-generated-tag="true"
    className={`inline-block rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-white ${className}`}
  >
    Generated
  </span>
);

/**
 * Interactive 3D visualizer for one paver size cut (founder task 2026-11-02,
 * "3D paver files" tab on /belgard-products). One model per cut, built by
 * buildPaverCut() from src/lib/visual/paverCut3d.ts on the app's three
 * 0.168 stack, with the Design Studio 3D scene idiom (key directional
 * [20,30,10] @ 1.2 with shadows + fill [-20,20,-10] @ 0.6, 3/4 perspective
 * camera, drag-to-orbit). The cut's texture options from
 * BELGARD_TEXTURES_3D sit below the model; clicking one applies it live as
 * the model's material map, "Plain" resets to the cut's plain color.
 * Rendering happens on mount, on interaction and on texture change only —
 * no permanent animation loop (a short loop runs only while orbiting, for
 * OrbitControls damping).
 *
 * The first texture option is applied by default so the model never sits
 * untextured when its group has options.
 */

interface SceneHandle {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  group: THREE.Group | null;
  applyToken: number;
  stopLoop: () => void;
  floor: THREE.Mesh;
  keyLight: THREE.DirectionalLight;
  floorBaseRadius: number;
  homePos: THREE.Vector3;
  homeMinDistance: number;
  homeMaxDistance: number;
}

// ---- Generalized per-unit views (Job U3; proof was Job U1/U1d) -------
// PRIMARY PATTERN RULE: the applied product's primary pattern is the
// pattern whose sizesUsed contains the cut's own catalog size
// (spec.size); if several qualify, the first catalog-sourced one in
// list order; if none contains it, the group's first pattern. The
// Large deck defaults to that pattern; when the product's group has
// more than one pattern a picker offers each of them (Job G1.5).
//
// SINGLE PIECES (Job G1.5, founder refinement 2026-11-02 — "every
// paver size done individually, then the full deck, exactly the same
// as Napoli"): pieces are EVERY distinct face size across ALL of the
// product's patterns, one piece each, NO cap. A face's thickness is
// the class it carries in the primary pattern when it appears there
// (so Catalina Grana keeps exactly its 3 proof pieces at 1 3/16);
// otherwise the first thickness printed for that face in the group.
// The other thickness classes of a face stay reachable — each is the
// native class of one of the deck picker's patterns.
// Deck joint width is per product now — jointWidthInFor in
// lib/visual/belgardFillingLogic.ts (was a uniform 0.125 in for all).
const DECK_TARGET_W_IN = 156; // tile the module to roughly 13 x 18 ft
const DECK_TARGET_H_IN = 216;
const PIECES_VIEW_KEY = "Single pieces"; // assignment seed key (U1d)
const PIECES_GAP_IN = 3; // visual separation between the standalone pieces
const PIECES_ROW_TARGET_W_IN = 64; // pack pieces into rows up to ~this wide

// parseDimIn / parseSizeLabel live in lib/visual/belgardDeckLayout.ts
// (pure, shared with the studio deck layout); parseSizeLabel is
// re-exported above for unitVisualizerSpecs.ts.

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** Decimal inches → catalog label style ("19 11/16", "15 3/4", "8"). */
function formatDimIn(v: number): string {
  const whole = Math.floor(v + 1e-9);
  const rem = v - whole;
  if (rem < 0.01) return `${whole}`;
  const sixteenths = Math.round(rem * 16);
  if (sixteenths <= 0) return `${whole}`;
  if (sixteenths >= 16) return `${whole + 1}`;
  const g = gcd(sixteenths, 16);
  const frac = `${sixteenths / g}/${16 / g}`;
  return whole > 0 ? `${whole} ${frac}` : frac;
}

/** The applied product's primary pattern — see the rule above.
 *  Exported (Job U3b) so the per-unit visualizer spec builder resolves
 *  primary patterns with this exact rule. The per-spec size filter is
 *  kept; the primary rule itself is the library's (belgardPatternsFor
 *  + the same catalog/mixed order belgardPrimaryPattern applies). For
 *  a size in NO pattern the pool is the whole group and the primary
 *  rule picks from it (the one intentional refinement of Edit 6). */
export function selectPrimaryPattern(spec: PaverCutSpec): BelgardPattern | null {
  const patterns = belgardPatternsFor(spec.textureProductSlug);
  if (patterns.length === 0) return null;
  const containing = patterns.filter((p) => p.sizesUsed.includes(spec.size));
  const pool = containing.length > 0 ? containing : patterns;
  return (
    pool.find((p) => p.source === "catalog" && p.mixed) ??
    pool.find((p) => p.mixed) ??
    pool.find((p) => p.source === "catalog") ??
    pool[0]
  );
}

/** Every distinct face size across ALL of the product's patterns
 * (Job G1.5 — no cap, no size standing in for another). Faces are
 * deduplicated by (w × d); a face's thickness is resolved by
 * tileThickness within the first pattern — primary first — that
 * carries it, so a face keeps the primary pattern's thickness class
 * when it appears there and otherwise its own first printed class.
 * Display order is ascending face area (the scene order the caption
 * and the per-piece assignments follow). Unparseable labels (e.g.
 * "Variable" faces with no printed dimensions) are skipped — no
 * piece can be built from a dimension that does not exist. */
function productPieceSizes(
  group: { patterns: BelgardPattern[] } | undefined,
  primary: BelgardPattern | null,
  fallbackT: number,
  productSlug?: string
): (PatternSize & { t: number })[] {
  if (!group) return [];
  const ordered = primary
    ? [primary, ...group.patterns.filter((p) => p !== primary)]
    : group.patterns;
  const seen = new Map<string, PatternSize & { t: number }>();
  for (const pattern of ordered) {
    for (const label of pattern.sizesUsed) {
      const s = parseSizeLabel(label);
      if (!s) continue;
      const key = `${s.w}|${s.d}`;
      if (!seen.has(key)) {
        seen.set(key, { ...s, t: tileThickness(pattern, label, fallbackT) });
      }
    }
  }
  // Job G11 fallback — only when NO label in the group parses (Belgian
  // Cobble's "Variable" faces, the Hexagon Series' nominal labels):
  // pieces are the patterns' own module tiles, deduplicated by face,
  // thickness from the tile label or the product's Media & Logic entry.
  // Every previously wired product has parseable labels, so this branch
  // never runs for them.
  if (seen.size === 0) {
    for (const pattern of ordered) {
      for (const tile of pattern.module.tiles) {
        const key = `${tile.w}|${tile.h}`;
        if (seen.has(key)) continue;
        const t =
          parseSizeLabel(tile.sizeLabel)?.t ??
          trailingThicknessIn(tile.sizeLabel) ??
          (productSlug
            ? mediaLogicThicknessIn(productSlug, tile.sizeLabel)
            : null) ??
          fallbackT;
        seen.set(key, { label: tile.sizeLabel, w: tile.w, d: tile.h, t });
      }
    }
  }
  return [...seen.values()].sort((a, b) => a.w * a.d - b.w * b.d);
}

export interface PiecePlacement {
  size: PatternSize & { t: number };
  /** Scene-order index (left-to-right, row by row) — the assignment index. */
  index: number;
  x: number;
  z: number;
  labelZ: number;
  labelW: number;
}

/** Pack the pieces into rows on the ground plane (Job G1.5): rows are
 * filled left-to-right up to PIECES_ROW_TARGET_W_IN, each row reserves
 * a front strip for its floor size labels, rows stack front-to-back.
 * Pure geometry — shared by the renderer and the caption. */
export function layoutPieces(
  sizes: (PatternSize & { t: number })[]
): { placements: PiecePlacement[]; spanW: number; spanD: number; rowCount: number } {
  const rows: (PatternSize & { t: number })[][] = [];
  let row: (PatternSize & { t: number })[] = [];
  let rowW = 0;
  for (const s of sizes) {
    const add = (row.length > 0 ? PIECES_GAP_IN : 0) + s.w;
    if (row.length > 0 && rowW + add > PIECES_ROW_TARGET_W_IN) {
      rows.push(row);
      row = [];
      rowW = 0;
    }
    row.push(s);
    rowW += (row.length > 1 ? PIECES_GAP_IN : 0) + s.w;
  }
  if (row.length > 0) rows.push(row);

  const metas = rows.map((r) => {
    const width =
      r.reduce((sum, s) => sum + s.w, 0) + PIECES_GAP_IN * (r.length - 1);
    const depth = Math.max(...r.map((s) => s.d));
    const strip =
      Math.max(...r.map((s) => Math.max(s.w, 5.5) / 4)) + 1.0;
    return { pieces: r, width, depth, strip };
  });
  const spanW = metas.length ? Math.max(...metas.map((m) => m.width)) : 0;
  const spanD =
    metas.reduce((sum, m) => sum + m.strip + m.depth, 0) +
    PIECES_GAP_IN * Math.max(0, metas.length - 1);

  const placements: PiecePlacement[] = [];
  let zFront = spanD / 2;
  metas.forEach((m, ri) => {
    let cursor = -m.width / 2;
    for (const s of m.pieces) {
      const labelW = Math.max(s.w, 5.5);
      placements.push({
        size: s,
        index: placements.length,
        x: cursor + s.w / 2,
        z: zFront - m.strip - s.d / 2,
        labelZ: zFront - 0.75 - labelW / 8,
        labelW,
      });
      cursor += s.w + PIECES_GAP_IN;
    }
    zFront -= m.strip + m.depth + (ri < metas.length - 1 ? PIECES_GAP_IN : 0);
  });
  return { placements, spanW, spanD, rowCount: metas.length };
}

/** Thickness for one deck tile, from its own size label — mixed sets
 * carry some pieces at a thinner class, so per-label is the truthful
 * source; falls back to the pattern's first printed thickness. */
function tileThickness(
  pattern: BelgardPattern,
  sizeLabel: string,
  fallbackT: number
): number {
  const own = parseSizeLabel(sizeLabel)?.t;
  if (own) return own;
  for (const label of pattern.sizesUsed) {
    const t = parseSizeLabel(label)?.t;
    if (t) return t;
  }
  return fallbackT;
}

/** Thickness from a "Variable x T" style label (Job G11): the face is
 *  printed as a word, only the trailing token is numeric. Guarded to
 *  word-first labels so ordinary labels are never re-read this way;
 *  bracketed qualifiers ("[diagram 3]") are stripped first. */
function trailingThicknessIn(label: string): number | null {
  const clean = label.replace(/\s*\[[^\]]*\]\s*/g, " ").trim();
  const parts = clean.split(" x ").map((s) => s.trim());
  if (parts.length < 2) return null;
  if (parseDimIn(parts[0]) !== null) return null;
  return parseDimIn(parts[parts.length - 1]);
}

/** Thickness for a size label from the product's Media & Logic entry
 *  (Job G11) — the Hexagon Series' classes print there ("8\" Hexagon"
 *  → "Variable x 3 1/8") while its pattern labels carry no numbers. */
function mediaLogicThicknessIn(
  productSlug: string,
  sizeLabel: string
): number | null {
  const product = BELGARD_MEDIA_LOGIC.find((p) => p.slug === productSlug);
  const size = product?.sizes.find((s) => s.label === sizeLabel);
  if (!size) return null;
  return parseSizeLabel(size.dimensions)?.t ?? trailingThicknessIn(size.dimensions);
}

/** Deck tile thickness: tileThickness, plus the "Variable x T" reading
 *  for word-first labels (Belgian Cobble's 60MM pattern, Job G11).
 *  Identical to tileThickness for every label that parses today. */
function deckTileThickness(
  pattern: BelgardPattern,
  tile: BelgardPattern["module"]["tiles"][number],
  fallbackT: number
): number {
  const own = parseSizeLabel(tile.sizeLabel)?.t;
  if (own) return own;
  const trail = trailingThicknessIn(tile.sizeLabel);
  if (trail) return trail;
  return tileThickness(pattern, tile.sizeLabel, fallbackT);
}

/** Honeycomb layout for the Hexagon deck (Job G11): flat faces face
 *  ±z and vertices point ±x (buildHexPaverCut's orientation), centers
 *  on the true honeycomb grid — columns 1.5R apart in x, rows √3·R
 *  apart in z, odd columns offset half a row — covering the same
 *  ~13 x 18 ft target as the rectangular decks. Pure geometry, shared
 *  by the deck builder and the footer statistics. The layout itself
 *  lives in lib/visual/belgardDeckLayout.ts (hexDeckLayoutSized);
 *  this one-argument wrapper keeps the tab's fixed target. */
export function hexDeckLayout(nominalIn: number): {
  centers: { x: number; z: number }[];
  widthIn: number;
  heightIn: number;
} {
  return hexDeckLayoutSized(nominalIn, DECK_TARGET_W_IN, DECK_TARGET_H_IN);
}

/** Build one unit in the spec's silhouette (Job G11): a hexagonal
 *  prism for hexagon specs, the stone's own traced outline for
 *  silhouette specs (Job 3), the original rectangular cut otherwise. */
function buildCut(spec: PaverCutSpec, tex?: THREE.Texture | null): THREE.Group {
  if (spec.shape === "hexagon") return buildHexPaverCut(spec, tex);
  if (spec.shape === "silhouette" && spec.outline && spec.outline.length >= 3)
    return buildSilhouettePaverCut(spec, tex);
  return buildPaverCut(spec, tex);
}

/** The traced stones for a per-unit set, when the set is a block-cut (v2)
 *  silhouette set: the outlines record is keyed by the set's texture
 *  directory, which is the third path segment of every variant URL.
 *  Returns null for ordinary rectangular sets. */
function stoneOutlinesForSet(
  set: { variants: { url: string }[] } | null
): BelgardStoneOutline[] | null {
  const url = set?.variants[0]?.url;
  if (!url) return null;
  const dir = url.split("/")[3];
  return (dir && BELGARD_STONE_OUTLINES[dir]) || null;
}

/** Floor plaque label for one piece (Job U1d): a canvas-textured plane
 * lying flat just in front of the piece, text upright for the default
 * camera. Disposed with the content group like any other mesh map. */
function makeFloorLabel(text: string, widthIn: number): THREE.Mesh {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#d4d4d8";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(6, 6, canvas.width - 12, canvas.height - 12, 28);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#27272a";
    ctx.font = "600 62px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(widthIn, widthIn / 4),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 1 })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

export default function PaverCutVisualizer({ spec }: { spec: PaverCutSpec }) {
  const group = useMemo(
    () => BELGARD_TEXTURES_3D.find((g) => g.productSlug === spec.textureProductSlug),
    [spec.textureProductSlug]
  );
  const options: BelgardTexture3d[] = group?.textures ?? [];
  // Infinite-field products (amorphous cuts — Belgian Cobble): no pieces
  // exist; the view is ONE large surface carrying the field texture.
  // `applied` carries the QUALIFIED option name (qualifiedOptionName):
  // finish siblings share a bare option, so the bare string would
  // select — and highlight — every finish chip of a color at once.
  const [applied, setApplied] = useState<string | null>(
    options[0] ? qualifiedOptionName(options[0]) : null
  );
  const appliedTexture = useMemo(
    () => options.find((o) => qualifiedOptionName(o) === applied) ?? null,
    [options, applied]
  );
  // A single option can itself be an infinite field (Mega-Arbel Amaretto)
  // while its sibling options still use the per-piece views.
  const fieldSpan = useMemo(() => {
    return infiniteFieldSpan(appliedTexture) ?? infiniteFieldSpan(group);
  }, [group, appliedTexture]);
  const [mode, setMode] = useState<"single" | "deck" | "pieces">("single");
  // Deck pattern picker (Job G1.5): index into the product's pattern
  // group; null = the primary pattern (the U3 default).
  const [deckPatternIdx, setDeckPatternIdx] = useState<number | null>(null);
  // Joint filling picker (filling logic, founder 2026-11-03): "auto" =
  // the filling logic's own recommendation for this product's joints.
  const [fillingId, setFillingId] = useState<string>("auto");
  // Load-failure honesty (defect return 2026-11-11, Product
  // Verification): a texture load that fails must never leave a
  // silent blank canvas — every branch's catch sets this, and the
  // line below the canvas says so. Cleared on each new apply.
  const [loadFailed, setLoadFailed] = useState(false);
  const jointIn = jointWidthInFor(spec.textureProductSlug ?? "");
  const recommended = recommendedFiller(spec.textureProductSlug ?? "", jointIn);
  const activeFiller =
    fillingId === "auto" ? recommended : fillerById(fillingId);
  // Per-unit texture set for the applied option, when one exists.
  // Drives the per-unit single model, the Large deck and the Single
  // pieces views; every other option keeps the field-texture path.
  const unitSet = useMemo(
    () =>
      appliedTexture
        ? findSetForTexture(spec.textureProductSlug, appliedTexture)
        : null,
    [spec.textureProductSlug, appliedTexture]
  );
  // The applied product's pattern group + primary pattern (Job U3
  // generalization — see the selection rule near the top).
  const patternGroup = useMemo(
    () => BELGARD_PATTERNS.find((g) => g.productSlug === spec.textureProductSlug),
    [spec.textureProductSlug]
  );
  const primaryPattern = useMemo(() => selectPrimaryPattern(spec), [spec]);
  // The deck's pattern: the picker's choice, else the primary pattern.
  const deckPattern = useMemo(() => {
    if (!patternGroup) return primaryPattern;
    if (deckPatternIdx !== null && patternGroup.patterns[deckPatternIdx]) {
      return patternGroup.patterns[deckPatternIdx];
    }
    return primaryPattern;
  }, [patternGroup, primaryPattern, deckPatternIdx]);
  // Single pieces: EVERY distinct size across all of the product's
  // patterns (Job G1.5), laid out in rows by layoutPieces. Silhouette
  // (block-cut v2) sets override: the pieces are the set's own traced
  // stones, each at its true inches (Job 3).
  const pieceSizes = useMemo(() => {
    const stones = stoneOutlinesForSet(unitSet);
    if (stones) {
      return stones.map((s) => ({
        label: `${formatDimIn(s.wIn)} x ${formatDimIn(s.dIn)}`,
        w: s.wIn,
        d: s.dIn,
        t: spec.t,
      }));
    }
    return productPieceSizes(
      patternGroup,
      primaryPattern,
      spec.t,
      spec.textureProductSlug
    );
  }, [patternGroup, primaryPattern, spec.t, spec.textureProductSlug, unitSet]);
  const piecesLayout = useMemo(() => layoutPieces(pieceSizes), [pieceSizes]);
  // Per-piece assignments for the "Single pieces" view (piece index
  // 0..n in scene order) — shown in the caption so each variation is
  // identifiable.
  const pieceAssignments = useMemo(
    () =>
      unitSet
        ? pieceSizes.map((p, i) => assignUnitTexture(unitSet, PIECES_VIEW_KEY, i, [p.w, p.d]))
        : [],
    [unitSet, pieceSizes]
  );
  const piecesAllSameT =
    pieceSizes.length > 0 &&
    pieceSizes.every((p) => p.t === pieceSizes[0].t);
  // Deck statistics for the footer — from the SELECTED deck pattern
  // (same tiling math as the builder).
  const deckCols = deckPattern
    ? Math.max(1, Math.round(DECK_TARGET_W_IN / deckPattern.module.widthIn))
    : 0;
  const deckRows = deckPattern
    ? Math.max(1, Math.round(DECK_TARGET_H_IN / deckPattern.module.heightIn))
    : 0;
  const deckUnits =
    deckCols * deckRows * (deckPattern?.module.tiles.length ?? 0);
  const deckFtW = deckPattern
    ? ((deckPattern.module.widthIn * deckCols) / 12).toFixed(1)
    : "";
  const deckFtH = deckPattern
    ? ((deckPattern.module.heightIn * deckRows) / 12).toFixed(1)
    : "";
  // Hexagon deck statistics (Job G11): the honeycomb grid, not the
  // pattern module's bounding-box schematic, decides the counts.
  const hexDeck = useMemo(
    () =>
      spec.shape === "hexagon" && deckPattern
        ? hexDeckLayout(deckPattern.module.tiles[0]?.w ?? spec.w)
        : null,
    [spec.shape, spec.w, deckPattern]
  );
  // Silhouette (block-cut v2) decks: the field layout is laid ONCE
  // per set + joint width and shared between this caption and the
  // deck builder below, so the two can never disagree — the
  // caption's unit count is the number of stones the layout actually
  // placed, not a pattern-module estimate.
  const silhouetteLayout = useMemo(() => {
    const stones = stoneOutlinesForSet(unitSet);
    return stones
      ? silhouetteFieldLayout(
          stones,
          DECK_TARGET_W_IN,
          DECK_TARGET_H_IN,
          Math.max(0.375, jointIn)
        )
      : null;
  }, [unitSet, jointIn]);
  // The silhouette deck's filler footprint: the laid stones' own
  // outlines dilated by half the joint and unioned — the filler
  // lives only under the field and inside its joints, never as a
  // rectangular sheet past the stones (the flat grey perimeter
  // triangles on the live v2 decks). Computed with the layout so a
  // filler-picker change never recomputes it.
  const silhouetteFiller = useMemo(() => {
    const stones = stoneOutlinesForSet(unitSet);
    return stones && silhouetteLayout
      ? silhouetteFillerRings(
          stones,
          silhouetteLayout.placements,
          Math.max(0.375, jointIn)
        )
      : null;
  }, [unitSet, silhouetteLayout, jointIn]);
  const deckUnitsShown = hexDeck
    ? hexDeck.centers.length
    : silhouetteLayout
      ? silhouetteLayout.placements.length
      : deckUnits;
  const deckFtWShown = hexDeck
    ? (hexDeck.widthIn / 12).toFixed(1)
    : silhouetteLayout
      ? (silhouetteLayout.widthIn / 12).toFixed(1)
      : deckFtW;
  const deckFtHShown = hexDeck
    ? (hexDeck.heightIn / 12).toFixed(1)
    : silhouetteLayout
      ? (silhouetteLayout.heightIn / 12).toFixed(1)
      : deckFtH;
  const onPick = (option: string | null) => {
    // Founder (2026-11-06): colors must be selectable FROM the large
    // deck (and pieces) view — picking a color keeps the current view
    // and re-renders it in the new color, never bouncing the user back
    // to Single unit and forcing the back-and-forth.
    setApplied(option);
  };
  const mountRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<SceneHandle | null>(null);
  const appliedRef = useRef<string | null>(applied);
  appliedRef.current = applied;

  // ---- scene setup (once per cut) ----
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    setUnitTextureAnisotropy(Math.min(
      16,
      renderer.capabilities.getMaxAnisotropy()
    ));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f4f5);

    const camera = new THREE.PerspectiveCamera(40, 16 / 10, 0.1, 500);
    const radius = 0.5 * Math.sqrt(spec.w * spec.w + spec.d * spec.d + spec.t * spec.t);
    // One true scale for the single-piece stage (founder's rule: samples
    // are shown at one true scale so sizes compare honestly). The camera
    // distance and the floor disc are FIXED for every cut — a 4x8 brick
    // and a 24x24 slab now appear at their honest relative sizes instead
    // of each being framed to fill the card. FRAME_RADIUS 13 in ≈ an
    // 18x18 piece filling the frame; larger pieces extend past it and
    // can be zoomed out (maxDistance below).
    const FRAME_RADIUS = 13;
    const dist = (FRAME_RADIUS / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.02;
    camera.position.set(dist * 0.62, dist * 0.52, dist * 0.78);
    camera.lookAt(0, 0, 0);

    // Environment light (founder check, 2026-11-03: "I don't see any
    // changes... I need a light source or why?"): the scene had only two
    // directional lights and NO environment, so the materials had no
    // light field to reflect — the depth layer read weakly and the
    // material logic's sheen response (envMapIntensity) was inert. A
    // RoomEnvironment PMREM bake (built into three, no HDR download,
    // one-time cost) gives every material a real light field to reflect,
    // the way Unreal/Blender present PBR materials.
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.5;
    pmrem.dispose();

    // Key + fill directionals; the key rakes lower than before so the
    // depth relief on the top faces casts readable micro-shading.
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(26, 17, 12);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.6);
    fill.position.set(-20, 20, -10);
    scene.add(fill);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 400),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(FRAME_RADIUS * 2.6, 48),
      new THREE.MeshStandardMaterial({ color: 0xe9e9ec, roughness: 1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.03;
    scene.add(floor);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = radius * 0.8;
    controls.maxDistance = dist * 2.2;

    // Render on demand; a short rAF loop runs only while orbiting so
    // damping can settle, then stops.
    let rafId = 0;
    let loopOn = false;
    const render = () => renderer.render(scene, camera);
    const offSettled = onTexturesSettled(render);
    const tick = () => {
      if (!loopOn) return;
      controls.update();
      render();
      rafId = requestAnimationFrame(tick);
    };
    const startLoop = () => {
      if (loopOn) return;
      loopOn = true;
      rafId = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      loopOn = false;
      cancelAnimationFrame(rafId);
    };
    controls.addEventListener("start", startLoop);
    controls.addEventListener("end", () => window.setTimeout(stopLoop, 350));
    controls.addEventListener("change", () => {
      if (!loopOn) render();
    });

    const handle: SceneHandle = {
      renderer,
      scene,
      camera,
      controls,
      group: null,
      applyToken: 0,
      stopLoop,
      floor,
      keyLight: key,
      floorBaseRadius: FRAME_RADIUS * 2.6,
      homePos: camera.position.clone(),
      homeMinDistance: radius * 0.8,
      homeMaxDistance: dist * 2.2,
    };
    handleRef.current = handle;

    const fit = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(mount);

    return () => {
      ro.disconnect();
      offSettled();
      stopLoop();
      controls.dispose();
      if (handle.group) disposeGroup(handle.group);
      scene.environment?.dispose();
      renderer.dispose();
      // Release the context slot immediately: dispose() alone leaves
      // the canvas's WebGL context alive until GC, and iOS Safari's
      // ~8-context cap is what blanks older cards on the Belgard page.
      renderer.forceContextLoss();
      mount.removeChild(renderer.domElement);
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.slug]);

  // ---- content: single cut, per-unit cut, or the large deck ----
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;
    const token = ++handle.applyToken;
    setLoadFailed(false);
    const opt = options.find((o) => qualifiedOptionName(o) === applied) ?? null;
    const set = opt ? findSetForTexture(spec.textureProductSlug, opt) : null;

    const clearContent = () => {
      if (!handle.group) return;
      handle.scene.remove(handle.group);
      disposeGroup(handle.group);
      handle.group = null;
    };
    const show = (g: THREE.Group | null) => {
      if (handle.applyToken !== token) {
        if (g) disposeGroup(g);
        return;
      }
      clearContent();
      handle.group = g;
      if (g) handle.scene.add(g);
      handle.renderer.render(handle.scene, handle.camera);
    };
    const frameSingle = () => {
      handle.camera.position.copy(handle.homePos);
      handle.camera.near = 0.1;
      handle.camera.far = 500;
      handle.camera.updateProjectionMatrix();
      handle.controls.target.set(0, 0, 0);
      handle.controls.minDistance = handle.homeMinDistance;
      handle.controls.maxDistance = handle.homeMaxDistance;
      handle.controls.update();
      handle.floor.scale.set(1, 1, 1);
      const sc = handle.keyLight.shadow.camera;
      // Shadow bounds follow the piece itself (the stage is fixed-scale
      // now, so a large slab's shadow must not clip at the old ±5 box).
      const sb = Math.max(5, 0.65 * Math.sqrt(spec.w * spec.w + spec.d * spec.d));
      sc.left = -sb;
      sc.right = sb;
      sc.top = sb;
      sc.bottom = -sb;
      sc.updateProjectionMatrix();
    };
    const frameDeck = (wIn: number, dIn: number) => {
      const halfDiag = 0.5 * Math.sqrt(wIn * wIn + dIn * dIn);
      const dist =
        (halfDiag / Math.sin(THREE.MathUtils.degToRad(handle.camera.fov / 2))) *
        1.02;
      handle.camera.position.set(dist * 0.62, dist * 0.52, dist * 0.78);
      // Near must scale with the deck framing distance: at near 0.1 /
      // far 2500 the depth buffer cannot separate the deck top (y=0)
      // from the floor disc 0.03 below it once the camera is a few
      // hundred inches out, and the disc's 48 triangle-fan wedges
      // z-fight through the texture as radial streaks. near = dist/100
      // restores ~0.01 in depth precision at max zoom-out.
      handle.camera.near = Math.max(1, dist / 100);
      handle.camera.far = 2500;
      handle.camera.updateProjectionMatrix();
      handle.controls.target.set(0, 0, 0);
      handle.controls.minDistance = 30;
      handle.controls.maxDistance = dist * 2.2;
      handle.controls.update();
      handle.floor.scale.setScalar(
        Math.max(1, (halfDiag * 1.3) / handle.floorBaseRadius)
      );
      const sc = handle.keyLight.shadow.camera;
      const b = halfDiag * 1.2;
      sc.left = -b;
      sc.right = b;
      sc.top = b;
      sc.bottom = -b;
      sc.updateProjectionMatrix();
      if (handle.keyLight.shadow.map) {
        handle.keyLight.shadow.map.dispose();
        handle.keyLight.shadow.map = null;
      }
      handle.keyLight.shadow.mapSize.set(2048, 2048);
    };
    const framePieces = (spanWIn: number, spanDIn: number) => {
      // Wider than a single cut but much smaller than the deck — frame
      // the whole row, still allowing a close zoom onto one piece.
      const halfDiag = 0.5 * Math.sqrt(spanWIn * spanWIn + spanDIn * spanDIn);
      const dist =
        (halfDiag / Math.sin(THREE.MathUtils.degToRad(handle.camera.fov / 2))) *
        1.02;
      handle.camera.position.set(dist * 0.62, dist * 0.52, dist * 0.78);
      handle.camera.near = Math.max(0.5, dist / 100);
      handle.camera.far = 500;
      handle.camera.updateProjectionMatrix();
      handle.controls.target.set(0, 0, 0);
      handle.controls.minDistance = 8;
      handle.controls.maxDistance = dist * 2.2;
      handle.controls.update();
      handle.floor.scale.setScalar(
        Math.max(1, (halfDiag * 1.3) / handle.floorBaseRadius)
      );
      const sc = handle.keyLight.shadow.camera;
      const b = halfDiag * 1.2;
      sc.left = -b;
      sc.right = b;
      sc.top = b;
      sc.bottom = -b;
      sc.updateProjectionMatrix();
      if (handle.keyLight.shadow.map) {
        handle.keyLight.shadow.map.dispose();
        handle.keyLight.shadow.map = null;
      }
      handle.keyLight.shadow.mapSize.set(2048, 2048);
    };

    let cancelled = false;

    // ----- infinite field: ONE large surface, no pieces (amorphous) -----
    if (fieldSpan && opt) {
      frameDeck(DECK_TARGET_W_IN, DECK_TARGET_H_IN);
      Promise.all([loadTexture(opt.webp), normalReadyFor(opt.webp)])
        .then(([base]) => {
          if (cancelled) return;
          const tex = base.clone();
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          // True stone size: one served image spans spanWIn x spanHIn
          // inches of real surface on this 0..1-UV slab.
          tex.repeat.set(
            DECK_TARGET_W_IN / fieldSpan.spanWIn,
            DECK_TARGET_H_IN / fieldSpan.spanHIn
          );
          tex.anisotropy = getUnitTextureAnisotropy();
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          const g = new THREE.Group();
          // Depth layer for the field, registered to the same repeat.
          const fieldNormal = normalTextureFor(tex, opt.webp);
          // Material logic: the field material's own physical response.
          const fieldMat = new THREE.MeshStandardMaterial({ map: tex, ...(fieldNormal ? { normalMap: fieldNormal } : {}), roughness: 0.95 });
          applyBelgardMaterialLogic(fieldMat, belgardMaterialLogic(opt.productSlug, opt.option));
          const slab = new THREE.Mesh(
            new THREE.BoxGeometry(DECK_TARGET_W_IN, spec.t, DECK_TARGET_H_IN),
            fieldMat
          );
          slab.position.y = -spec.t / 2;
          slab.castShadow = true;
          slab.receiveShadow = true;
          g.add(slab);
          show(g);
        })
        .catch(() => {
          if (!cancelled) { show(null); setLoadFailed(true); }
        });
      return () => {
        cancelled = true;
      };
    }

    // ----- single pieces: EVERY size of the product, one piece each -----
    if (mode === "pieces" && set && piecesLayout.placements.length > 0) {
      framePieces(piecesLayout.spanW, piecesLayout.spanD);
      Promise.all([
          ...set.variants.map((v) => loadTexture(v.url)),
          ...set.variants.map((v) => normalReadyFor(v.url)),
        ])
        .then((bases) => {
          if (cancelled || handle.applyToken !== token) return;
          const row = new THREE.Group();
          for (const pl of piecesLayout.placements) {
            const p = pl.size;
            // Piece index in scene order — different deterministic
            // variations from the same measured range as the deck.
            const a = assignUnitTexture(set, PIECES_VIEW_KEY, pl.index, [p.w, p.d]);
            const tex = configureUnitTexture(bases[a.variantIndex], a, 0, set.variants[a.variantIndex].url);
            // Silhouette sets: the piece IS the assigned stone — its own
            // traced outline at its own true inches (Job 3).
            const stones = stoneOutlinesForSet(set);
            const stone = stones?.[a.variantIndex];
            const pieceSpec: PaverCutSpec = stone
              ? {
                  ...spec,
                  slug: `${spec.slug}-piece-${pl.index}`,
                  w: stone.wIn,
                  d: stone.dIn,
                  t: p.t,
                  shape: "silhouette" as const,
                  outline: stone.pts,
                }
              : {
                  ...spec,
                  slug: `${spec.slug}-piece-${pl.index}`,
                  w: p.w,
                  d: p.d,
                  t: p.t,
                };
            const piece = buildCut(pieceSpec, tex);
            applyTint(piece, a.tint);
            piece.position.set(pl.x, 0, pl.z);
            row.add(piece);
            // Size label on the floor directly in front of the piece.
            const label = makeFloorLabel(
              `${formatDimIn(p.w)} × ${formatDimIn(p.d)}`,
              pl.labelW
            );
            label.position.set(pl.x, 0.01, pl.labelZ);
            row.add(label);
          }
          show(row);
        })
        .catch(() => {
          if (!cancelled) { show(null); setLoadFailed(true); }
        });
      return () => {
        cancelled = true;
      };
    }

    // ----- silhouette deck: a loose field of the set's real stones -----
    // Block-cut (v2) sets only (Job 3): no grid, no boxes — every stone
    // of the set laid at its own shape and inches over the joint filler.
    // The layout is the memoized one the caption counts from (above),
    // never a second, divergent laying.
    if (mode === "deck" && set && silhouetteLayout) {
      const stones = stoneOutlinesForSet(set) as BelgardStoneOutline[];
      const layout = silhouetteLayout;
      frameDeck(layout.widthIn, layout.heightIn);
      Promise.all([
        ...set.variants.map((v) => loadTexture(v.url)),
        ...set.variants.map((v) => normalReadyFor(v.url)),
      ])
        .then((bases) => {
          if (cancelled || handle.applyToken !== token) return;
          const deck = new THREE.Group();
          // Filling logic: the joint filler surface under the field,
          // clipped to the laid stones' footprint (dilated by half
          // the joint) — visible only in the gaps between the stones
          // and a half-joint rim at the field's edge, never as a
          // sheet extending beyond them.
          if (silhouetteFiller) {
            deck.add(
              jointFillSurface(activeFiller, silhouetteFiller, spec.t, 1)
            );
          }
          layout.placements.forEach((p, i) => {
            // The layout planned THIS stone for this spot — build it,
            // not whichever stone the texture draw would swap in: the
            // assignment keeps its drawn tint, but its variant is
            // pinned to the planned stone so the outline, the size
            // and the texture on the spot are the same stone.
            const stone = stones[p.stoneIndex];
            const a = {
              ...assignUnitTexture(set, "Silhouette field", i, [
                stone.wIn,
                stone.dIn,
              ]),
              variantIndex: p.stoneIndex,
            };
            const tex = configureUnitTexture(
              bases[p.stoneIndex],
              a,
              0,
              set.variants[p.stoneIndex].url
            );
            const unit = buildSilhouettePaverCut(
              {
                ...spec,
                slug: `${spec.slug}-field-${i}`,
                w: stone.wIn,
                d: stone.dIn,
                shape: "silhouette" as const,
                outline: stone.pts,
              },
              tex
            );
            applyTint(unit, a.tint);
            unit.rotation.y = p.rotY;
            unit.position.set(p.x, 0, p.z);
            deck.add(unit);
          });
          show(deck);
        })
        .catch(() => {
          if (!cancelled) { show(null); setLoadFailed(true); }
        });
      return () => {
        cancelled = true;
      };
    }

    // ----- hexagon deck: true honeycomb grid of hexagonal prisms -----
    if (mode === "deck" && set && spec.shape === "hexagon") {
      const pattern = deckPattern;
      if (pattern) {
        const nominal = pattern.module.tiles[0]?.w ?? spec.w;
        const layout = hexDeckLayout(nominal);
        const t =
          mediaLogicThicknessIn(spec.textureProductSlug, pattern.sizesUsed[0]) ??
          spec.t;
        frameDeck(layout.widthIn, layout.heightIn);
        Promise.all([
          ...set.variants.map((v) => loadTexture(v.url)),
          ...set.variants.map((v) => normalReadyFor(v.url)),
        ])
          .then((bases) => {
            if (cancelled || handle.applyToken !== token) return;
            const deck = new THREE.Group();
            // Filling logic: the joint filler surface under the deck,
            // clipped to the honeycomb footprint — the placed
            // hexagons dilated by half the joint and unioned
            // (hexFillerRings), never a rectangular sheet past the
            // stones: a honeycomb never reaches its bounding-box
            // corners, so the old full-rectangle plane stuck out
            // around the perimeter. Visible only inside the joints
            // and that half-joint rim (see belgardFillingLogic).
            deck.add(
              jointFillSurface(
                activeFiller,
                hexFillerRings(layout.centers, nominal, jointIn),
                t,
                1
              )
            );
            const configured = new Map<string, THREE.Texture>();
            const texFor = (a: UnitTextureAssignment) => {
              const key = `${a.variantIndex}|${a.rotationDeg}|${a.mirror}`;
              let tx = configured.get(key);
              if (!tx) {
                tx = configureUnitTexture(bases[a.variantIndex], a, 0, set.variants[a.variantIndex].url);
                configured.set(key, tx);
              }
              return tx;
            };
            layout.centers.forEach((c, idx) => {
              const a = assignUnitTexture(set, pattern.name, idx, [nominal, nominal]);
              const hexSpec: PaverCutSpec = {
                ...spec,
                slug: `${spec.slug}-deck-hex`,
                w: nominal,
                d: nominal,
                t,
              };
              const unit = buildHexPaverCut(hexSpec, texFor(a), jointIn);
              applyTint(unit, a.tint);
              unit.position.set(c.x, 0, c.z);
              deck.add(unit);
            });
            show(deck);
          })
          .catch(() => {
            if (!cancelled) { show(null); setLoadFailed(true); }
          });
        return () => {
          cancelled = true;
        };
      }
    }

    // ----- large deck: the selected pattern tiled to ~13 x 18 ft -----
    if (mode === "deck" && set) {
      const pattern = deckPattern;
      if (pattern) {
        const cols = Math.max(
          1,
          Math.round(DECK_TARGET_W_IN / pattern.module.widthIn)
        );
        const rows = Math.max(
          1,
          Math.round(DECK_TARGET_H_IN / pattern.module.heightIn)
        );
        const DW = pattern.module.widthIn * cols;
        const DH = pattern.module.heightIn * rows;
        // Shared layout (Edit 6): when the library's primary pattern
        // IS this deck's pattern, the placements come from
        // belgardDeckLayout — the same layout the studios lay from.
        // Any other case (a pattern picked in this tab's picker, a
        // material without a recorded module) keeps the loop below,
        // exactly as before.
        // `applied` is the qualified option name, and the key lookup
        // honours it exactly — a bare option here resolved every
        // finish of a color to the first sibling material (audit
        // gap 2), so the shared layout laid the wrong finish's set.
        const deckMaterial = applied
          ? belgardDeckMaterialByKey({ productSlug: spec.textureProductSlug, option: applied })
          : undefined;
        const sharedLayout = deckMaterial
          ? layoutBelgardDeck(deckMaterial, DECK_TARGET_W_IN, DECK_TARGET_H_IN)
          : undefined;
        const useShared =
          sharedLayout?.kind === "module" && sharedLayout.pattern === pattern
            ? sharedLayout
            : undefined;
        const LW = useShared
          ? Math.ceil(DECK_TARGET_W_IN / useShared.moduleWIn) * useShared.moduleWIn
          : DW;
        const LH = useShared
          ? Math.ceil(DECK_TARGET_H_IN / useShared.moduleHIn) * useShared.moduleHIn
          : DH;
        frameDeck(LW, LH);
        Promise.all([
          ...set.variants.map((v) => loadTexture(v.url)),
          ...set.variants.map((v) => normalReadyFor(v.url)),
        ])
          .then((bases) => {
            if (cancelled || handle.applyToken !== token) return;
            const deck = new THREE.Group();
            // Filling logic: the joint filler surface under the deck —
            // visible only inside the joints (see belgardFillingLogic).
            const tFill = Math.min(
              ...pattern.module.tiles.map((tile) =>
                deckTileThickness(pattern, tile, spec.t)
              )
            );
            deck.add(jointFillMesh(activeFiller, LW, LH, tFill));
            // One configured clone per (variant, rotation, mirror) combo —
            // units share GPU textures; only the tint material differs.
            const configured = new Map<string, THREE.Texture>();
            const texFor = (a: UnitTextureAssignment, rot: number) => {
              const key = `${a.variantIndex}|${(rot + a.rotationDeg) % 360}|${a.mirror}`;
              let t = configured.get(key);
              if (!t) {
                t = configureUnitTexture(bases[a.variantIndex], a, rot, set.variants[a.variantIndex].url);
                configured.set(key, t);
              }
              return t;
            };
            if (useShared) {
              for (const p of useShared.placements) {
                const tileSpec: PaverCutSpec = {
                  ...spec,
                  slug: `${spec.slug}-deck-tile`,
                  w: p.laidWIn,
                  d: p.laidHIn,
                  t: p.thicknessIn,
                };
                const unit = buildPaverCut(tileSpec, texFor(p.assignment, p.rotDeg));
                applyTint(unit, p.assignment.tint);
                unit.position.set(-LW / 2 + p.cxIn, 0, -LH / 2 + p.cyIn);
                deck.add(unit);
              }
            } else {
              let idx = 0;
              for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                  for (const tile of pattern.module.tiles) {
                    const a = assignUnitTexture(set, pattern.name, idx, [tile.w, tile.h]);
                    const tileSpec: PaverCutSpec = {
                      ...spec,
                      slug: `${spec.slug}-deck-tile`,
                      w: tile.w - jointIn,
                      d: tile.h - jointIn,
                      t: deckTileThickness(pattern, tile, spec.t),
                    };
                    const unit = buildPaverCut(tileSpec, texFor(a, tile.rot));
                    applyTint(unit, a.tint);
                    unit.position.set(
                      -DW / 2 + c * pattern.module.widthIn + tile.x + tile.w / 2,
                      0,
                      -DH / 2 + r * pattern.module.heightIn + tile.y + tile.h / 2
                    );
                    deck.add(unit);
                    idx++;
                  }
                }
              }
            }
            show(deck);
          })
          .catch(() => {
            if (!cancelled) { show(null); setLoadFailed(true); }
          });
        return () => {
          cancelled = true;
        };
      }
    }

    // ----- single cut -----
    frameSingle();
    if (set) {
      // Per-unit path: one real unit interior + its measured tint.
      const a = assignUnitTexture(set, spec.slug, 0, [spec.w, spec.d]);
      Promise.all([
        loadTexture(set.variants[a.variantIndex].url),
        normalReadyFor(set.variants[a.variantIndex].url),
      ]).then(([base]) => {
          if (cancelled) return;
          const tex = configureUnitTexture(base, a, 0, set.variants[a.variantIndex].url);
          // Silhouette sets: the single unit is one real stone, in its
          // own shape at its own inches (Job 3).
          const stone = stoneOutlinesForSet(set)?.[a.variantIndex];
          const g = stone
            ? buildCut(
                {
                  ...spec,
                  w: stone.wIn,
                  d: stone.dIn,
                  shape: "silhouette" as const,
                  outline: stone.pts,
                },
                tex
              )
            : buildCut(spec, tex);
          applyTint(g, a.tint);
          show(g);
        })
        .catch(() => {
          if (!cancelled) { show(null); setLoadFailed(true); }
        });
      return () => {
        cancelled = true;
      };
    }
    if (!opt) {
      show(null);
      return;
    }
    Promise.all([loadTexture(opt.webp), normalReadyFor(opt.webp)])
      .then(([base]) => {
        if (cancelled) return;
        const tex = base.clone();
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        // One texture module ≈ 12 inches of paver face.
        tex.repeat.set(
          Math.max(1, Math.round(spec.w / 12)),
          Math.max(1, Math.round(spec.d / 12))
        );
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        // Depth layer, carried to the cut builder on userData.
        const optNormal = normalTextureFor(tex, opt.webp);
        if (optNormal) tex.userData.normalMap = optNormal;
        // Material logic, carried on the same channel.
        tex.userData.materialLogic = belgardMaterialLogic(opt.productSlug, opt.option);
        show(buildCut(spec, tex));
      })
      .catch(() => {
        if (!cancelled) { show(null); setLoadFailed(true); }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied, mode, spec.slug, deckPatternIdx, fillingId]);

  const chip = (active: boolean) =>
    `relative flex flex-col items-center gap-1 rounded-xl border p-1.5 text-center transition ${
      active
        ? "border-zinc-900 ring-2 ring-zinc-900"
        : "border-zinc-200 hover:border-zinc-400"
    }`;

  return (
    <div>
      <div
        ref={mountRef}
        className="relative w-full overflow-hidden rounded-xl border border-zinc-200"
        style={{ aspectRatio: "16 / 10" }}
        aria-label={`3D model — ${spec.name}, ${spec.size} inches`}
      />
      {loadFailed && (
        <p className="mt-2 text-xs leading-relaxed text-red-700">
          This view&apos;s textures could not be loaded, so nothing is shown rather than a blank or a
          substitute. Reselect the colour or view to try again.
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-start gap-2">
        <button type="button" onClick={() => onPick(null)} className={chip(applied === null)}>
          <span
            className="block h-10 w-14 border border-zinc-200"
            style={{ backgroundColor: `#${spec.color.toString(16).padStart(6, "0")}` }}
          />
          <span className="w-14 text-[11px] font-medium leading-tight">Plain</span>
        </button>
        {options.map((o) => {
          const oSet = findSetForTexture(o.productSlug, o);
          const qName = qualifiedOptionName(o);
          return (
            <button
              key={qName}
              type="button"
              onClick={() => onPick(qName)}
              className={chip(applied === qName)}
            >
              <img
                src={chipImageFor(o)}
                alt={`${group?.product ?? spec.name} — ${o.option}`}
                loading="lazy"
                className="block h-10 w-14 border border-zinc-200 object-cover"
              />
              {/* Red GENERATED tag, overlaid on the chip so it never
                  shifts the chip's (or the card's) geometry. */}
              {oSet && isGeneratedSet(oSet) && (
                <GeneratedTag className="absolute left-1/2 top-1 -translate-x-1/2 shadow" />
              )}
              <span className="w-14 text-[11px] font-medium leading-tight">
                {o.option}
                {o.qualifier ? <span className="block font-normal text-zinc-500">{o.qualifier}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
      {unitSet && !fieldSpan && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("deck")}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              mode === "deck"
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 hover:border-zinc-500"
            }`}
          >
            Large deck
          </button>
          <button
            type="button"
            onClick={() => setMode("pieces")}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              mode === "pieces"
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 hover:border-zinc-500"
            }`}
          >
            Single pieces
          </button>
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              mode === "single"
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 hover:border-zinc-500"
            }`}
          >
            Single unit
          </button>
          {isGeneratedSet(unitSet) && <GeneratedTag className="self-center" />}
          <span className="self-center text-[11px] text-zinc-500">
            {unitProvenanceLine(unitSet)}
          </span>
        </div>
      )}
      {unitSet && !fieldSpan && mode === "deck" && patternGroup && patternGroup.patterns.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label
            htmlFor={`deck-pattern-${spec.slug}`}
            className="text-[11px] font-medium text-zinc-600"
          >
            Deck pattern:
          </label>
          <select
            id={`deck-pattern-${spec.slug}`}
            value={deckPattern ? patternGroup.patterns.indexOf(deckPattern) : 0}
            onChange={(e) => setDeckPatternIdx(Number(e.target.value))}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-800"
          >
            {patternGroup.patterns.map((p, i) => (
              <option key={`${p.name}-${i}`} value={i}>
                {p.name}
                {primaryPattern && p === primaryPattern ? " (primary)" : ""}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-zinc-500">
            {patternGroup.patterns.length} patterns in the catalog for this product.
          </span>
        </div>
      )}
      {unitSet && !fieldSpan && mode === "deck" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label
            htmlFor={`joint-filling-${spec.slug}`}
            className="text-[11px] font-medium text-zinc-600"
          >
            Joint filling:
          </label>
          <select
            id={`joint-filling-${spec.slug}`}
            value={fillingId}
            onChange={(e) => setFillingId(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-800"
          >
            <option value="auto">
              Auto — {recommended.name} (recommended)
            </option>
            {JOINT_FILLERS.map((f) => {
              const s = fillerSuitability(f, jointIn);
              return (
                <option key={f.id} value={f.id} disabled={!s.ok}>
                  {f.name}
                  {s.ok ? "" : ` — ${s.reason}`}
                </option>
              );
            })}
          </select>
          <span className="text-[11px] text-zinc-500">
            Joints on this product are {formatJointIn(jointIn)} wide — the
            filler lives only in the joints, never on a tile.
          </span>
        </div>
      )}
      {unitSet && !fieldSpan && mode === "pieces" && (
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-600">
          <span className="font-medium text-zinc-700">
            {piecesLayout.rowCount > 1 ? "In scene order (row by row):" : "Left to right:"}
          </span>
          {pieceSizes.map((p, i) => (
            <span key={`${p.w}|${p.d}|${p.t}`}>
              {formatDimIn(p.w)} × {formatDimIn(p.d)} in
              {!piecesAllSameT ? ` × ${formatDimIn(p.t)} thick` : ""} — variation{" "}
              {pieceAssignments[i]
                ? `${pieceAssignments[i].variantIndex + 1} of ${unitSet.variants.length}`
                : "—"}
            </span>
          ))}
          <span className="text-zinc-500">
            {piecesAllSameT && pieceSizes.length > 0
              ? `All ${formatDimIn(pieceSizes[0].t)} in thick — `
              : ""}
            every {unitSet.product} size in its pattern data, one piece each
            ({pieceSizes.length} sizes).
          </span>
        </p>
      )}
      <p className="mt-2 text-xs text-zinc-500">
        {/* Amorphous (field-span) views hide the header row above; a
            generated set shown this way still carries its red tag. */}
        {fieldSpan && unitSet && isGeneratedSet(unitSet) && (
          <GeneratedTag className="mr-2 align-middle" />
        )}
        {fieldSpan
          ? `Large surface — ${group?.product ?? spec.name} ${applied ?? ""} as one continuous field at true stone size (one texture image = ${fieldSpan.spanWIn.toFixed(1)} × ${fieldSpan.spanHIn.toFixed(1)} in of surface). This product is an amorphous cut — there are no pieces. Drag to orbit.`
          : mode === "deck" && unitSet && deckPattern
          ? `Large deck — ${unitSet.product} ${deckPattern.name} pattern, ${deckUnitsShown} units, ${deckFtWShown} × ${deckFtHShown} ft. ${deckUnitOriginClause(unitSet)} Joints ${formatJointIn(jointIn)} wide${activeFiller.kind === "open" ? ", left open" : `, filled with ${activeFiller.name}`}. Drag to orbit.`
          : mode === "pieces" && unitSet
            ? `Single pieces — every ${unitSet.product} size from its pattern data side by side at true relative scale, each one piece carrying a different ${unitSet.option} variation ${piecesOriginClause(unitSet)}. Drag to orbit.`
            : `${applied ? `Texture applied: ${applied}` : "Plain color — pick a texture to apply it to the model."} Drag the model to orbit. Texture module ≈ 12 in.`}
      </p>
    </div>
  );
}
