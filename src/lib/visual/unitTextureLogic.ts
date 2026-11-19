import type { BelgardUnitTextureSet } from "@/data/belgardUnitTextures";

/**
 * Per-unit texture logic (Job U1 proof, founder direction 2026-11-02).
 *
 * Given a per-unit texture set (src/data/belgardUnitTextures.ts), a
 * pattern name and a tile index, deterministically assign:
 *  - a variant texture (a real unit interior cut from the original
 *    swatch, color-normalized — the grain),
 *  - a quarter-turn rotation and an optional mirror,
 *  - a tint drawn from the swatch's MEASURED unit means, so the unit's
 *    final mean color is exactly one of the colors real units show in
 *    the swatch (the variation — nothing invented, nothing generative).
 *
 * Deterministic: the same (set, pattern, tileIndex) always yields the
 * same assignment, so a deck renders identically on every load. Joints
 * never come from the texture — they are the geometry gaps between
 * units. The PIL proof renderer in ~/workspace/belgard-unit-proof ports
 * this exact algorithm (FNV-1a + mulberry32) and produces identical
 * assignments.
 */

export interface UnitTextureAssignment {
  variantIndex: number;
  /** 0 | 90 | 180 | 270 — applied on top of the tile's pattern rotation. */
  rotationDeg: number;
  mirror: boolean;
  /** Index into the set's unitMeans — whose measured color this unit gets. */
  tintIndex: number;
  /** Per-channel RGB multipliers (≈1.0) realizing that measured color. */
  tint: [number, number, number];
}

/** FNV-1a 32-bit string hash. */
export function hashUnitSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG — same sequence in the PIL proof port. */
export function unitRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clampTint = (v: number) => Math.min(1.3, Math.max(0.75, v));

export function assignUnitTexture(
  set: BelgardUnitTextureSet,
  patternName: string,
  tileIndex: number,
  tileFaceIn?: [number, number]
): UnitTextureAssignment {
  const seed = hashUnitSeed(
    `${set.productSlug}|${set.option}|${patternName}|${tileIndex}`
  );
  const rng = unitRng(seed);
  // Dimension-true sets (variants carry faceIn — the real paver face each
  // cut came from): a tile only gets a cut from a paver of its OWN size,
  // in either orientation (the rotation draw below orients it). Sets
  // without faceIn keep the original any-variant draw, unchanged.
  let pool: number[] | null = null;
  if (tileFaceIn && set.variants.some((v) => v.faceIn)) {
    const wantLo = Math.min(tileFaceIn[0], tileFaceIn[1]);
    const wantHi = Math.max(tileFaceIn[0], tileFaceIn[1]);
    const match = set.variants
      .map((v, i) => ({ v, i }))
      .filter(
        ({ v }) =>
          v.faceIn &&
          Math.min(v.faceIn[0], v.faceIn[1]) === wantLo &&
          Math.max(v.faceIn[0], v.faceIn[1]) === wantHi
      )
      .map(({ i }) => i);
    if (match.length > 0) pool = match;
    // No exact-size cut exists for this tile (F&D merge, 2026-11-16):
    // the renderer registers the variant's whole image onto the tile's
    // frame, so a far-sized variant would stretch or squeeze the print.
    // Fall back to the NEAREST-sized variants instead of any variant —
    // the draw is restricted to the variants whose face size is closest
    // to the tile's (log-ratio distance, orientation-free; variants
    // within 0.16 of the best score share the draw — about a 17% size
    // ratio, under what the eye catches on a laid floor — so near faces
    // still vary instead of one face repeating everywhere). Single-size
    // sets score every variant equal, so their draws are exactly the
    // uniform draw they have always had. The rng draw count and order
    // are unchanged in every path.
    if (!pool) {
      let best = Infinity;
      const scored = set.variants
        .map((v, i) => ({ v, i }))
        .filter(({ v }) => v.faceIn)
        .map(({ v, i }) => {
          const d =
            Math.abs(
              Math.log(Math.min(v.faceIn![0], v.faceIn![1]) / wantLo),
            ) +
            Math.abs(
              Math.log(Math.max(v.faceIn![0], v.faceIn![1]) / wantHi),
            );
          if (d < best) best = d;
          return { i, d };
        });
      if (scored.length > 0) {
        pool = scored.filter(({ d }) => d <= best + 0.16).map(({ i }) => i);
      }
    }
  }
  const variantIndex = pool
    ? pool[Math.floor(rng() * pool.length)]
    : Math.floor(rng() * set.variants.length);
  // Registered sets (founder fix, 2026-11-06): a texture whose content
  // is registered to the unit's geometry — the Hexagon Series (the
  // photo's hexagon must stay aligned with the hexagonal prism; a
  // quarter turn is a 30° misalignment on a hexagon and crops the
  // neighbours' joints into the corners — the "wrong angle / black
  // corners" defect) and the block-cut silhouette sets (geometry is
  // built from the cut itself) — never takes a random rotation or
  // mirror. The rng draws still happen so other sets' sequences are
  // unchanged.
  const registered =
    set.productSlug === "hexagon-series" ||
    set.productSlug.endsWith("-block-cut");
  const rotationIdx = Math.floor(rng() * 4);
  const rotationDraw = [0, 90, 180, 270][rotationIdx];
  const mirrorDraw = rng() < 0.5;
  // Directional sets (endForEndOnly — merged F&D planks, 2026-11-16):
  // the same single draw, folded to end-for-end turns (0/180), so the
  // grain never runs across the unit. Unflagged sets are untouched.
  const rotationDeg = registered
    ? 0
    : set.endForEndOnly
      ? (rotationIdx % 2) * 180
      : rotationDraw;
  const mirror = registered ? false : mirrorDraw;
  const tintIndex = Math.floor(rng() * set.unitMeans.length);
  const m = set.unitMeans[tintIndex];
  const o = set.overallMean;
  return {
    variantIndex,
    rotationDeg,
    mirror,
    tintIndex,
    // True-color sets (faithful re-renders) carry the variation in the
    // files themselves — no restore tint, or it darkens them twice.
    tint: set.trueColorFaces
      ? [1, 1, 1]
      : [clampTint(m[0] / o[0]), clampTint(m[1] / o[1]), clampTint(m[2] / o[2])],
  };
}

/** Job 5 / Job U3 name normalization: case- and whitespace-insensitive. */
const normName = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

export function findUnitTextureSet(
  sets: BelgardUnitTextureSet[],
  productSlug: string,
  option: string | null
): BelgardUnitTextureSet | null {
  if (!option) return null;
  const same = sets.filter((s) => s.productSlug === productSlug);
  // 1) exact match (the data names themselves are never rewritten).
  const exact = same.find((s) => s.option === option);
  if (exact) return exact;
  // 2) normalized match, then 3) a set whose stored name carries a
  // qualifier suffix the texture chip label omits (option names
  // with/without qualifiers — the Job 5 rule).
  const want = normName(option);
  return (
    same.find((s) => normName(s.option) === want) ??
    same.find((s) => normName(s.option).startsWith(want + " ")) ??
    null
  );
}

/* ------------------------------------------------------------------ */
/* Set provenance (Mend B, 2026-11-06) — moved here from               */
/* PaverCutVisualizer.tsx on 2026-11-07 so every surface that presents */
/* a per-unit set (the Belgard file page, the FLIP book) classifies    */
/* it through the ONE derivation. The visualizer re-exports these      */
/* names; behavior is unchanged.                                       */
/* ------------------------------------------------------------------ */

/**
 * Caption provenance (Mend B, 2026-11-06): the per-unit captions used to
 * claim EVERY set was "real unit interiors from the original swatch" —
 * true only for the sets segmented from the small catalog swatches. Each
 * set records how it was actually made (sourceSwatch + notes in
 * belgardUnitTextures.ts), so the captions derive from that record:
 * whole-unit faces cut from Belgard's published field image, the face
 * from Belgard's own published cut sheet, interiors segmented from the
 * enlarged catalog swatch, or faces segmented from a GENERATED field
 * (the catalog holds no laid original for those products).
 */
export type UnitSetProvenance = "field" | "cutsheet" | "swatch" | "generated";

export function unitSetProvenance(set: BelgardUnitTextureSet): UnitSetProvenance {
  const src = set.sourceSwatch ?? "";
  const notes = set.notes ?? "";
  if (src.includes("gen-fields/") || notes.startsWith("GENERATED")) {
    return "generated";
  }
  if (/cut ?sheet/i.test(src) || /cut ?sheet/i.test(notes.slice(0, 320))) {
    return "cutsheet";
  }
  if (
    src.startsWith("REMADE") ||
    src.includes("harvest/") ||
    src.includes("product page") ||
    src.includes("flat patte") ||
    src.includes("product image") ||
    src.includes("swatch grid") ||
    src.includes("media library") ||
    src.includes("served field image") ||
    src.includes("belgardcommercial") ||
    notes.startsWith("REAL face") ||
    (set.swatchSize[0] >= 1000 && set.swatchSize[1] >= 1000)
  ) {
    return "field";
  }
  return "swatch";
}

/** True when the set's faces were segmented from a GENERATED field —
 *  the Mend B provenance classification, nothing else. */
export function isGeneratedSet(set: BelgardUnitTextureSet): boolean {
  return unitSetProvenance(set) === "generated";
}

/** Per-variant generated truth (2026-11-10, Product Verification
 *  Family 2): a variant is GENERATED when its data record carries
 *  the flag — populated only where the set's own note or the
 *  verification evidence states the split exactly. This is the
 *  per-face layer under the set-level provenance above: mixed
 *  sets (a real variant 0 plus generated completions, e.g.
 *  Foundation Scandina Gray, Na.Me, Quarziti 2.0's siblings) read
 *  truthfully here even though their set provenance is not
 *  "generated". Absent flag = real. */
export function variantIsGenerated(
  set: BelgardUnitTextureSet,
  variantIndex: number,
): boolean {
  return set.variants[variantIndex]?.generated === true;
}

/** Generated vs total face counts for a set, from the flags. */
export function generatedFaceCounts(set: BelgardUnitTextureSet): {
  generated: number;
  total: number;
} {
  return {
    generated: set.variants.filter((v) => v.generated).length,
    total: set.variants.length,
  };
}

/** Header line beside the view buttons for a per-unit set. */
export function unitProvenanceLine(set: BelgardUnitTextureSet): string {
  switch (unitSetProvenance(set)) {
    case "field":
      return `Per-unit textures — whole-unit faces cut from the published ${set.option} field photo.`;
    case "cutsheet":
      return `Per-unit textures — Belgard's own published ${set.option} cut-sheet face, enlarged.`;
    case "generated":
      return `Per-unit textures — faces segmented from a generated field, color-matched to the real ${set.option} catalog swatch (GENERATED).`;
    default:
      return `Per-unit textures — real unit interiors segmented from the original ${set.option} catalog swatch (enlarged).`;
  }
}

/** "Every unit carries …" sentence for the Large deck caption. True-color
 * sets carry each unit's real measured color in the files themselves (the
 * restore tint does not run for them); the other sets are tinted with the
 * measured unit colors of the source the faces came from. */
export function deckUnitOriginClause(set: BelgardUnitTextureSet): string {
  const prov = unitSetProvenance(set);
  const color = set.trueColorFaces
    ? "each face in its own real measured color"
    : prov === "field"
      ? "tinted with the field's own measured unit colors"
      : prov === "generated"
        ? "tinted with the generated field's own measured unit colors"
        : prov === "cutsheet"
          ? "tinted with the cut sheet's own measured unit colors"
          : "tinted with the swatch's own measured unit colors";
  switch (prov) {
    case "field":
      return `Every unit carries a whole-unit face cut from the published field photo, ${color}.`;
    case "cutsheet":
      return `Every unit carries Belgard's own published cut-sheet face, ${color}.`;
    case "generated":
      return `Every unit carries a face segmented from a generated field (GENERATED — no laid original exists for this product), ${color}.`;
    default:
      return `Every unit carries a real interior from the original swatch, ${color}.`;
  }
}

/** Origin clause for the Single pieces caption. */
export function piecesOriginClause(set: BelgardUnitTextureSet): string {
  switch (unitSetProvenance(set)) {
    case "field":
      return "cut from the published field photo";
    case "cutsheet":
      return "— Belgard's own published cut-sheet face";
    case "generated":
      return "segmented from a generated field (GENERATED)";
    default:
      return "from the original swatch's measured colors";
  }
}
