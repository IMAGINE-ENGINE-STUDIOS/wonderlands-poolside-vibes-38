import { BELGARD_MEDIA_LOGIC } from "@/data/belgardMediaLogic";
import { BELGARD_PATTERNS, type BelgardPattern } from "@/data/belgardPatterns";
import { BELGARD_UNIT_TEXTURES } from "@/data/belgardUnitTextures";
import { PAVER_CUT_SPECS, type PaverCutSpec } from "@/lib/visual/paverCut3d";
import {
  parseSizeLabel,
  selectPrimaryPattern,
} from "@/components/pavers/PaverCutVisualizer";

/**
 * Per-unit visualizer specs (Job U3b, founder direction 2026-11-02:
 * every covered paver gets a visualizer, not just the five cut files).
 *
 * One synthetic PaverCutSpec per product that has >= 1 extracted
 * per-unit texture set in BELGARD_UNIT_TEXTURES and is NOT already one
 * of the "3D paver files" cut products. Every number on the spec comes
 * from catalog data — nothing is invented:
 *  - textureProductSlug = the product's own slug, so the visualizer
 *    loads its BELGARD_TEXTURES_3D group and its unit sets.
 *  - size = the first parseable size label of the product's primary
 *    pattern, chosen so the component's primary-pattern rule
 *    (selectPrimaryPattern, Job U3) resolves back to that pattern.
 *  - w / d / thickness parsed from that label with the component's own
 *    parseSizeLabel; thickness falls back to the first printed
 *    thickness in the resolved pattern, then in the product's group,
 *    then to the Media & Logic dimension string for the same size
 *    label (e.g. November's pattern label "24 x 24" carries no
 *    thickness; Media & Logic prints "23.54 x 23.54 x 3/4").
 *  - color = the product's first unit set's measured overall mean
 *    color (the plain, untextured fallback tone).
 *  - description / fileName stay unset: these products have no
 *    workspace 3D file and no folder description is invented.
 */
export interface UnitVisualizerEntry {
  spec: PaverCutSpec;
  productName: string;
  /** Number of per-unit texture sets (colors) this product carries. */
  setCount: number;
  /** Pattern the Job U3 rule resolves for this spec. */
  primaryPatternName: string;
  /** The spec's catalog size label (== primary pattern size used). */
  sizeLabel: string;
  /** Card footnote (Job G11) for products whose wiring rests on a
   *  disclosed basis — diagram proportions, printed-photo layout. */
  note?: string;
}

/** Card footnotes for the Job G11 wirings (and the Plaza pattern group
 *  added the same job). Wording states the evidence basis exactly. */
const ENTRY_NOTES: Record<string, string> = {
  "belgian-cobble":
    "Face sizes proportional from the catalog diagram — the catalog prints \"Variable\" (diagram proportions normalized to a 9 in largest piece, as in the pattern data).",
  "hexagon-series":
    "Hexagonal units at the printed sizes: Hexagon 6 measures 12 x 12 in (Coastal 2026 Catalog p.44) — a regular hexagon with 6 in sides (Commercial Offering p.4); the 8 in unit is 3 1/8 in thick, the 12 in and 16 in units 2 3/8 in.",
  "classic-plaza-slab":
    "Layout per catalog diagram — stacked grid per the printed installation photo (Commercial Offering p.28); sizes and 50 mm thickness per its rooftop table (p.26).",
};

const CUT_TEXTURE_SLUGS = new Set(
  PAVER_CUT_SPECS.map((s) => s.textureProductSlug)
);

/** First size label of a pattern that parseSizeLabel can read. */
function firstParseableSize(pattern: BelgardPattern): string | null {
  for (const label of pattern.sizesUsed) {
    if (parseSizeLabel(label)) return label;
  }
  return null;
}

/** First printed thickness (inches) among the given labels. */
function firstThickness(labels: string[]): number | null {
  for (const label of labels) {
    const t = parseSizeLabel(label)?.t;
    if (t) return t;
  }
  return null;
}

/** Thickness from the product's Media & Logic dimension strings,
 *  preferring the size whose label matches the chosen pattern label. */
function mediaLogicThickness(
  productSlug: string,
  sizeLabel: string
): number | null {
  // A "-block-cut" v2 set shares its base product's Media & Logic entry
  // (Mega-Arbel — Block Cut reads Mega-Arbel's printed sizes, incl. its
  // 3 1/8 in thickness — founder placement fix, 2026-11-06).
  const product =
    BELGARD_MEDIA_LOGIC.find((p) => p.slug === productSlug) ??
    BELGARD_MEDIA_LOGIC.find(
      (p) => p.slug === productSlug.replace(/-block-cut$/, "")
    );
  if (!product) return null;
  const ordered = [...product.sizes].sort(
    (a, b) =>
      (a.label === sizeLabel ? 0 : 1) - (b.label === sizeLabel ? 0 : 1)
  );
  for (const s of ordered) {
    const t = parseSizeLabel(s.dimensions)?.t;
    if (t) return t;
  }
  return null;
}

/** Thickness for the Mirage porcelain lines (founder placement fix,
 *  2026-11-06): the Florida porcelain groups (Foundation, Genoa, Jurupa,
 *  Kao, Dijon, Na.Me, Oudh) print no thickness in their size labels and
 *  have no Media & Logic entry, so no card was ever built for them and
 *  they were missing from the 3D paver files tab. Their own pattern
 *  sources state the evidence: "20mm porcelain (Mirage)" — the Mirage
 *  20 mm standard, 0.787 in. Applies only when the group's category is
 *  "Porcelain Pavers" or its source text states the 20 mm porcelain
 *  construction. */
function porcelainThickness(
  group: (typeof BELGARD_PATTERNS)[number]
): number | null {
  const texts = [
    (group as { source?: string }).source ?? "",
    ...group.patterns.map((p) => `${p.source} ${p.notes ?? ""}`),
  ].join(" ");
  if (group.category === "Porcelain Pavers" || /20\s*mm/i.test(texts)) {
    return 20 / 25.4;
  }
  return null;
}

/** Parse one catalog dimension token ("19 11/16", "3/4", "15.75") to
 *  inches — the same rules as the component's parseDimIn (kept local so
 *  the component's exports stay exactly as they are). */
function parseDimToken(token: string): number | null {
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

/** Thickness from a "Variable x T" style label (Job G11): the face is
 *  printed as a word ("Variable"), only the trailing token is a number.
 *  Returns null for ordinary labels — numeric-first labels keep using
 *  parseSizeLabel, untouched. Bracketed qualifiers are stripped first. */
function trailingThicknessIn(label: string): number | null {
  const clean = label.replace(/\s*\[[^\]]*\]\s*/g, " ").trim();
  const parts = clean.split(" x ").map((s) => s.trim());
  if (parts.length < 2) return null;
  if (parseDimToken(parts[0]) !== null) return null;
  return parseDimToken(parts[parts.length - 1]);
}

/**
 * Fallback spec derivation (Job G11) for products whose pattern labels
 * carry no parseable W x D — used only when the standard derivation
 * above found nothing, so every previously wired product is untouched:
 *  (a) Hexagon Series: Media & Logic prints one size in full
 *      ("Hexagon 6" → 12 x 12 x 2 3/8, BEL25 p.44); the spec takes those
 *      verified numbers and the hexagonal-prism shape.
 *  (b) Belgian Cobble: faces print "Variable"; the face is the primary
 *      pattern's largest diagram-proportioned module tile (Job 3
 *      precedent — the pattern tiles already use those proportions,
 *      normalized to a 9 in largest piece) and the thickness is the
 *      label's printed trailing class (2 3/4 for the 70MM pattern).
 * Either way the candidate must satisfy the component's own
 * primary-pattern rule (the probe must resolve back to its pattern).
 */
function buildFallbackEntry(
  productSlug: string,
  sets: typeof BELGARD_UNIT_TEXTURES,
  group: (typeof BELGARD_PATTERNS)[number]
): UnitVisualizerEntry | null {
  const ml =
    BELGARD_MEDIA_LOGIC.find((p) => p.slug === productSlug) ??
    BELGARD_MEDIA_LOGIC.find(
      (p) => p.slug === productSlug.replace(/-block-cut$/, "")
    );
  // Any printed thickness in the product's Media & Logic sizes (the
  // block-cut groups' own labels carry none — Mega-Arbel's base entry
  // prints 3 1/8 in).
  const mlThickness = ml
    ? firstThickness(ml.sizes.map((s) => s.dimensions))
    : null;
  for (const pattern of group.patterns) {
    for (const label of pattern.sizesUsed) {
      let cand: { w: number; d: number; t: number } | null = null;
      const mlSize = ml?.sizes.find((s) => s.label === label);
      const parsed = mlSize ? parseSizeLabel(mlSize.dimensions) : null;
      if (parsed) {
        const t = parsed.t ?? trailingThicknessIn(mlSize!.dimensions);
        if (t) cand = { w: parsed.w, d: parsed.d, t };
      } else {
        const t = trailingThicknessIn(label) ?? mlThickness;
        if (t && pattern.module.tiles.length > 0) {
          const largest = [...pattern.module.tiles].sort(
            (a, b) => b.w * b.h - a.w * a.h
          )[0];
          cand = { w: largest.w, d: largest.h, t };
        }
      }
      if (!cand) continue;
      const probeSpec = {
        textureProductSlug: productSlug,
        size: label,
      } as PaverCutSpec;
      if (selectPrimaryPattern(probeSpec) !== pattern) continue;
      const [r, g, b] = sets[0].overallMean;
      const color =
        (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
      const spec: PaverCutSpec = {
        slug: `unit-${productSlug}`,
        name: group.product,
        size: label,
        w: cand.w,
        d: cand.d,
        t: cand.t,
        color,
        textureProductSlug: productSlug,
        ...(productSlug === "hexagon-series"
          ? { shape: "hexagon" as const }
          : {}),
      };
      return {
        spec,
        productName: group.product,
        setCount: sets.length,
        primaryPatternName: pattern.name,
        sizeLabel: label,
        note: ENTRY_NOTES[productSlug],
      };
    }
  }
  return null;
}

function buildEntry(productSlug: string): UnitVisualizerEntry | null {
  const sets = BELGARD_UNIT_TEXTURES.filter(
    (s) => s.productSlug === productSlug
  );
  if (sets.length === 0) return null;
  const group = BELGARD_PATTERNS.find((g) => g.productSlug === productSlug);
  if (!group || group.patterns.length === 0) return null;

  // Pick (pattern, size) so the component's own primary-pattern rule
  // resolves back to that same pattern: walk the group's patterns in
  // catalog order, probe with each pattern's first parseable size.
  let sizeLabel: string | null = null;
  let resolved: BelgardPattern | null = null;
  for (const pattern of group.patterns) {
    const probe = firstParseableSize(pattern);
    if (!probe) continue;
    const probeSpec = { textureProductSlug: productSlug, size: probe } as PaverCutSpec;
    const landed = selectPrimaryPattern(probeSpec);
    if (landed === pattern) {
      sizeLabel = probe;
      resolved = pattern;
      break;
    }
    // Remember the first workable fallback in case no pattern
    // self-resolves (report then names the pattern actually landed on).
    if (!sizeLabel) {
      sizeLabel = probe;
      resolved = landed;
    }
  }
  if (!sizeLabel || !resolved) {
    // Job G11: shaped / "Variable"-faced products derive a spec from
    // their verified evidence instead (see buildFallbackEntry).
    return buildFallbackEntry(productSlug, sets, group);
  }

  const parsed = parseSizeLabel(sizeLabel);
  if (!parsed) return null;
  const t =
    parsed.t ??
    firstThickness(resolved.sizesUsed) ??
    firstThickness(group.patterns.flatMap((p) => p.sizesUsed)) ??
    mediaLogicThickness(productSlug, sizeLabel) ??
    porcelainThickness(group);
  if (!t) return null;

  const [r, g, b] = sets[0].overallMean;
  const color =
    (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);

  const spec: PaverCutSpec = {
    slug: `unit-${productSlug}`,
    name: group.product,
    size: sizeLabel,
    w: parsed.w,
    d: parsed.d,
    t,
    color,
    textureProductSlug: productSlug,
  };
  return {
    spec,
    productName: group.product,
    setCount: sets.length,
    primaryPatternName: resolved.name,
    sizeLabel,
    note: ENTRY_NOTES[productSlug],
  };
}

function buildAll(): UnitVisualizerEntry[] {
  const slugs = [...new Set(BELGARD_UNIT_TEXTURES.map((s) => s.productSlug))]
    .filter((slug) => !CUT_TEXTURE_SLUGS.has(slug));
  const entries: UnitVisualizerEntry[] = [];
  for (const slug of slugs) {
    const entry = buildEntry(slug);
    if (entry) entries.push(entry);
  }
  entries.sort((a, b) => a.productName.localeCompare(b.productName));
  return entries;
}

export const UNIT_VISUALIZER_PRODUCTS: UnitVisualizerEntry[] = buildAll();
