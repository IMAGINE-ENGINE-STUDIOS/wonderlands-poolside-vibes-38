/**
 * Belgard unit library — the ONE reader every surface uses for the Belgard
 * per-unit cuts and their pattern logic (founder order 2026-11-03: merge the
 * cuts + each one's logic into every surface, merged with the database,
 * NO DUPLICATES).
 *
 * The database is belgardUnitTextures.ts (157 per-unit sets) +
 * belgardTextures3d.ts (211 field textures). This module indexes both by
 * productSlug + option, first occurrence wins, so no surface can ever show
 * or apply the same product + color twice. Surfaces store only the KEY
 * (productSlug + option) on their own elements and resolve cuts / logic
 * here — the logic itself is never copied into surface state.
 */
import {
  BELGARD_UNIT_TEXTURES,
  type BelgardUnitTextureSet,
} from "@/data/belgardUnitTextures";
import {
  BELGARD_TEXTURES_3D,
  infiniteFieldSpan,
  type BelgardTexture3d,
  type BelgardTextureGroup,
} from "@/data/belgardTextures3d";
import { STORE_PAVER_PATTERNS } from "@/data/storePaverPatterns";
import {
  BELGARD_PATTERNS,
  type BelgardPattern,
} from "@/data/belgardPatterns";
import { BELGARD_MEDIA_LOGIC } from "@/data/belgardMediaLogic";
import {
  unitProvenanceLine,
  unitSetProvenance,
  type UnitSetProvenance,
} from "@/lib/visual/unitTextureLogic";

export type BelgardPatternLogic = NonNullable<
  BelgardUnitTextureSet["patternLogic"]
>;

const keyOf = (slug: string, option: string) =>
  `${slug}::${option.trim().toLowerCase()}`;

/* ---------- per-unit sets (deduped) ---------- */

const unitIndex = new Map<string, BelgardUnitTextureSet>();
for (const s of BELGARD_UNIT_TEXTURES) {
  const k = keyOf(s.productSlug, s.option);
  if (!unitIndex.has(k)) unitIndex.set(k, s);
}

/** The one per-unit cut set for a product + color, if it exists. */
export const belgardUnitSet = (
  slug: string,
  option: string,
): BelgardUnitTextureSet | undefined => unitIndex.get(keyOf(slug, option));

/** Every color's cut set for one product, deduped, in catalog order. */
export const belgardUnitSetsFor = (slug: string): BelgardUnitTextureSet[] =>
  [...unitIndex.values()].filter((s) => s.productSlug === slug);

/* ---------- the tab's set join (finish-qualified set names) ---------- */

const normSetName = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * The per-unit set a deck MATERIAL lays — the Belgard tab's
 * join (unitTextureLogic.findUnitTextureSet), which the
 * studio path's exact-match belgardUnitSet never performed
 * (repair build 2026-11-04, audit §E Class 2; founder
 * decision 2026-11-04 23:14: the generated sets are KEPT —
 * "built by my order from the real swatches"). Some sets are
 * stored under finish-qualified names the material's bare
 * option omits — Classic Plaza Slab's "CHAMOIS (Diamond)" —
 * so: exact match first, then a normalized match, then a set
 * whose stored name carries the option plus a qualifier
 * suffix; when the material itself names a finish (its
 * qualifier), the set carrying THAT finish wins over its
 * siblings.
 */
export const belgardUnitSetForMaterial = (m: {
  productSlug: string;
  option: string;
  qualifier?: string;
}): BelgardUnitTextureSet | undefined => {
  const exact = belgardUnitSet(m.productSlug, m.option);
  if (exact) return exact;
  const same = belgardUnitSetsFor(m.productSlug);
  const want = normSetName(m.option);
  const byNorm = same.find((s) => normSetName(s.option) === want);
  if (byNorm) return byNorm;
  const qualified = same.filter((s) =>
    normSetName(s.option).startsWith(want + " "),
  );
  if (qualified.length === 0) return undefined;
  if (m.qualifier) {
    const q = normSetName(m.qualifier);
    const own = qualified.find((s) =>
      normSetName(s.option).includes(`(${q})`),
    );
    if (own) return own;
  }
  return qualified[0];
};

/* ---------- field textures (deduped) ---------- */

export interface BelgardTextureRef {
  group: BelgardTextureGroup;
  texture: BelgardTexture3d;
}

const textureIndex = new Map<string, BelgardTextureRef>();
for (const g of BELGARD_TEXTURES_3D) {
  for (const t of g.textures) {
    const k = keyOf(g.productSlug, t.option);
    if (!textureIndex.has(k)) textureIndex.set(k, { group: g, texture: t });
  }
}

/** The one field texture for a product + color, if it exists. */
export const belgardTextureFor = (
  slug: string,
  option: string,
): BelgardTextureRef | undefined => textureIndex.get(keyOf(slug, option));

/**
 * The pattern logic for a product + color, from the single source: the
 * per-unit set's logic first, then the texture's, then the product group's.
 */
export function belgardPatternLogicFor(
  slug: string,
  option: string,
): BelgardPatternLogic | undefined {
  const set = belgardUnitSet(slug, option);
  if (set?.patternLogic) return set.patternLogic;
  const ref = belgardTextureFor(slug, option);
  return ref?.texture.patternLogic ?? ref?.group.patternLogic;
}

/* ---------- the catalog originals (selector images) ---------- */

/**
 * The variant's ORIGINAL flat swatch — the catalog book's own
 * placed asset (data/belgardMediaLogic.ts, distilled from the
 * founder's catalog PDFs) — joined through the field texture's
 * sourceSwatch filename, the join the Belgard tab's own chip
 * resolver uses (PaverCutVisualizer's chipImageFor). This is
 * the image the image SELECTORS show (founder, 2026-11-04:
 * "the originals of each become the flat images in the image
 * selectors"). Falls back to the first cut face, then the
 * field texture, when a variant has no media-logic original —
 * the same fallback order as the tab.
 */
export function belgardOriginalImageFor(
  slug: string,
  option: string,
): string | undefined {
  const ref = belgardTextureFor(slug, option);
  if (!ref) return undefined;
  const ml = BELGARD_MEDIA_LOGIC.find((p) => p.slug === slug);
  const swatch = ml?.options.find((x) =>
    x.image.endsWith(`/${ref.texture.sourceSwatch}`),
  );
  if (swatch) return swatch.image;
  const set = belgardUnitSet(slug, option);
  if (set?.variants[0]) return set.variants[0].url;
  return ref.texture.webp || ref.texture.jpg;
}

/* ---------- flat originals (flat-image features: the FLIP book) ---------- */

export type BelgardFlatOriginalKind = "catalog-swatch" | "real-face" | "none";

export interface BelgardFlatOriginal {
  /** The product's ORIGINAL flat image, or null when the file page
   *  holds no original for this product + color. */
  image: string | null;
  kind: BelgardFlatOriginalKind;
}

/**
 * Whether a per-unit set's variant-0 is a REAL face. The 43 sets whose
 * faces were segmented from a GENERATED field record that field in
 * their sourceSwatch ("gen-fields/…") — their variant-0 is generated.
 * The mixed porcelain sets (a real published face kept first, generated
 * siblings added behind it on the founder's approval) record a real
 * source and say so in their notes ("Six further faces (variants 1-6)
 * added …") — their variant-0 is the real face itself. Every other set
 * is real by provenance (field / cutsheet / swatch).
 */
export function belgardSetVariant0IsReal(
  set: BelgardUnitTextureSet,
): boolean {
  if ((set.sourceSwatch ?? "").includes("gen-fields/")) return false;
  if (unitSetProvenance(set) !== "generated") return true;
  return /further faces \(variants 1-6\) added/.test(set.notes ?? "");
}

/**
 * The STRICT flat original for a product + color — the only image a
 * flat-image feature (the FLIP book above all) may print for a Belgard
 * product (founder order, voice, 2026-11-07: flat images use the
 * ORIGINALS from the Belgard file page, enlarged high quality; NEVER a
 * generated face or field). Resolution:
 *   (a) the catalog's own placed swatch (Media & Logic), else
 *   (b) variant-0 of the per-unit set when that face is REAL, else
 *   (c) NOTHING — the product shows no picture rather than a
 *       generated substitute.
 * Unlike belgardOriginalImageFor (the studio selectors' resolver),
 * this never falls back to the field texture: a field may be a
 * generated field, and a flat page must not print it as the product.
 */
export function belgardFlatOriginalFor(
  slug: string,
  option: string,
  /** The exact texture entry, when the caller iterates textures
   *  itself (finish qualifiers share one bare option — the file
   *  page's chip resolver matches the swatch per texture, and so
   *  does this). Defaults to the option's first texture. */
  texture?: BelgardTexture3d,
): BelgardFlatOriginal {
  const ref = texture
    ? { texture }
    : belgardTextureFor(slug, option);
  if (ref) {
    const ml = BELGARD_MEDIA_LOGIC.find((p) => p.slug === slug);
    const swatch = ml?.options.find((x) =>
      x.image.endsWith(`/${ref.texture.sourceSwatch}`),
    );
    if (swatch) return { image: swatch.image, kind: "catalog-swatch" };
  }
  const set = belgardUnitSet(slug, option);
  if (set?.variants[0] && belgardSetVariant0IsReal(set)) {
    return { image: set.variants[0].url, kind: "real-face" };
  }
  return { image: null, kind: "none" };
}

/* ---------- FLIP book originals (founder rule, 2026-11-07) ---------- */

/**
 * The variant's catalog ORIGINAL alone — the media-logic join of
 * belgardOriginalImageFor with NO face/field fallback. Undefined when
 * the catalog book carries no original for this product + color.
 */
export function belgardMediaOriginalFor(
  slug: string,
  option: string,
): string | undefined {
  const ref = belgardTextureFor(slug, option);
  if (!ref) return undefined;
  const ml = BELGARD_MEDIA_LOGIC.find((p) => p.slug === slug);
  return ml?.options.find((x) =>
    x.image.endsWith(`/${ref.texture.sourceSwatch}`),
  )?.image;
}

export type BelgardBookOriginalKind =
  | "media"
  | "field"
  | "cutsheet"
  | "swatch-face"
  | "real-face";

export interface BelgardBookOriginal {
  url: string;
  kind: BelgardBookOriginalKind;
}

export interface BelgardBookPresentation {
  set?: BelgardUnitTextureSet;
  provenance: UnitSetProvenance;
  generated: boolean;
  /** The file page's own provenance sentence for this set. */
  provenanceLine?: string;
  /** The ONLY flat picture a flat-image surface may print (see below). */
  original?: BelgardBookOriginal;
}

/**
 * The FLIP book presentation of one deck material (founder rule,
 * voice 2026-11-07 00:44 ET): flat-image features print the ORIGINALS
 * of each product as held on the Belgard file page — enlarged, high
 * quality, as they came from the website — and never a generated
 * image. So the picture resolves in this order, and no other:
 *   1. the catalog original (media logic — the file page chip's own
 *      first choice);
 *   2. for a FIELD-provenance set, its published field photo (the
 *      belgardTextures3d texture — Belgard's own website original);
 *   3. for a CUT-SHEET set, Belgard's own published cut-sheet face
 *      (the set's first variant IS that face);
 *   4. for a SWATCH set, the first variant — a real interior of the
 *      original catalog swatch, enlarged (the file page's own
 *      presentation of that product);
 *   5. for a GENERATED-provenance set whose own record discloses
 *      variant 0 as the one REAL published face, unchanged (the wired
 *      porcelain singles: Belgard publishes exactly one flat face for
 *      the color and the generated siblings sit behind it) — that
 *      face. The disclosure is read from the set's notes, never a
 *      hand list.
 * A GENERATED-provenance set gets NO picture beyond those: its other
 * faces and its field are generated, so when no admissible original
 * exists the surface prints no picture for it at all.
 * Names, specs and the provenance label still come from the corrected
 * data layer either way (unitSetProvenance — the file page's own
 * derivation, shared via unitTextureLogic).
 */
export function belgardBookPresentationFor(m: {
  productSlug: string;
  option: string;
  qualifier?: string;
}): BelgardBookPresentation {
  const set = belgardUnitSetForMaterial(m);
  const provenance: UnitSetProvenance = set
    ? unitSetProvenance(set)
    : "field";
  const media = belgardMediaOriginalFor(m.productSlug, m.option);
  let original: BelgardBookOriginal | undefined;
  if (media) {
    original = { url: media, kind: "media" };
  } else if (set && provenance === "field") {
    const ref = belgardTextureFor(m.productSlug, m.option);
    const url = ref?.texture.webp || ref?.texture.jpg;
    if (url) original = { url, kind: "field" };
  } else if (set && provenance === "cutsheet" && set.variants[0]) {
    original = { url: set.variants[0].url, kind: "cutsheet" };
  } else if (set && provenance === "swatch" && set.variants[0]) {
    original = { url: set.variants[0].url, kind: "swatch-face" };
  } else if (
    set &&
    provenance === "generated" &&
    set.variants[0] &&
    /variant 0 is that REAL published face/.test(set.notes ?? "")
  ) {
    original = { url: set.variants[0].url, kind: "real-face" };
  }
  return {
    set,
    provenance,
    generated: provenance === "generated",
    provenanceLine: set ? unitProvenanceLine(set) : undefined,
    original,
  };
}

/* ---------- patterns (the tab's rule, moved into the library) ---------- */

const patternGroupFor = (slug: string) =>
  BELGARD_PATTERNS.find((g) => g.productSlug === slug);

/**
 * Printed patterns belgardPatterns.ts carries no group for,
 * stated here from the founder's catalog books so the ONE
 * pattern lookup stays complete (repair build 2026-11-04).
 * Wood Tiles: BELCOMM26 prints the tile at 24 x 24 in, 1.69 in
 * thick, laid on a plain grid for every species (24 x 48 in is
 * also printed for Ipe and Cumaru — the module uses the size
 * all five species share); no mixed pattern exists for it, and
 * without this entry the kept Wood Tiles sets could never lay
 * as modules anywhere (audit §E Class 2).
 */
const PRINTED_GRID_PATTERNS: Record<string, BelgardPattern[]> = {
  "wood-tiles": [
    {
      name: "24 x 24 Grid",
      mixed: false,
      source: "catalog",
      sizesUsed: ["24 x 24 x 1.69"],
      module: {
        widthIn: 24,
        heightIn: 24,
        tiles: [
          { sizeLabel: "24 x 24 x 1.69", x: 0, y: 0, w: 24, h: 24, rot: 0 },
        ],
      },
      preview: "",
    },
  ],
};

/** Every recorded laying pattern for a product, catalog order. */
export const belgardPatternsFor = (slug: string): BelgardPattern[] =>
  patternGroupFor(slug)?.patterns ?? PRINTED_GRID_PATTERNS[slug] ?? [];

/**
 * The product's primary pattern — the selection rule the
 * Belgard tab's visualizer applies (its selectPrimaryPattern,
 * minus the per-spec size filter a deck does not have):
 * a catalog mixed pattern first, then any mixed, then any
 * catalog, then the first recorded.
 */
export function belgardPrimaryPattern(
  slug: string,
): BelgardPattern | undefined {
  const patterns = belgardPatternsFor(slug);
  if (patterns.length === 0) return undefined;
  return (
    patterns.find((p) => p.source === "catalog" && p.mixed) ??
    patterns.find((p) => p.mixed) ??
    patterns.find((p) => p.source === "catalog") ??
    patterns[0]
  );
}

/* ---------- shared product facts (one home each) ---------- */

/**
 * Porcelain-bodied product slugs — the ONE list. The joint
 * logic (belgardFillingLogic) lays these on 3/16" spacers;
 * the material logic (belgardMaterialLogic) reads the same
 * bodies for its light response (Travertini keeps its own
 * honed-stone branch there, checked before this set).
 */
export const PORCELAIN_BODY_SLUGS = new Set([
  "aqualine",
  "glocal",
  "silverlake",
  "quarziti-2-0",
  "lagoon",
  "noon",
  "norr",
  "travertini",
  "november",
  "foundation",
  "genoa",
  "alto-bianco-matte-porcelain-tile",
  "jurupa",
  "kao",
  "oudh",
  "dijon",
  "na-me",
]);

/** Hexagonal-silhouette products (the tab keys its hex spec
 *  off this same slug — unitVisualizerSpecs.ts). */
export const belgardIsHexagonal = (slug: string) =>
  slug === "hexagon-series";

/* ---------- deck materials for the design studios ---------- */

export interface BelgardDeckMaterial {
  /** Stable picker id: belgard:<productSlug>:<option slug>. */
  id: string;
  label: string;
  product: string;
  productSlug: string;
  option: string;
  /** Finish qualifier where the product's textures carry
   *  one (Classic Plaza Slab's Shot Blast / Matte / Diamond,
   *  Artforms' Smooth / Papyrus). The set, pattern and logic
   *  key off the bare `option`; the stored KEY does not —
   *  see belgardKeyOption. */
  qualifier?: string;
  /** Field texture the deck surface shows (webp preferred). */
  image: string;
  /** The variant's catalog ORIGINAL flat swatch — the image
   *  every selector shows (belgardOriginalImageFor). */
  original: string;
  /**
   * Feet of real surface one texture image spans, at true scale: the
   * recorded field span for infinite fields, the pattern module for
   * module products, else the studio's standard 2 ft tile.
   */
  spanFt: number;
  logic?: BelgardPatternLogic;
  /** The product's primary laying pattern, when one is
   *  recorded (belgardPatterns.ts) — the layout module lays
   *  decks from this; absent for field/image materials. */
  pattern?: BelgardPattern;
  /** True for the hexagonal-silhouette product. */
  hex: boolean;
}

const optionSlug = (t: BelgardTexture3d) =>
  (t.option + (t.qualifier ? ` ${t.qualifier}` : ""))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

export const belgardDeckMaterialId = (
  slug: string,
  t: BelgardTexture3d,
) => `belgard:${slug}:${optionSlug(t)}`;

/** The option string a stored KEY carries for a material:
 *  the bare set option plus its finish qualifier where one
 *  exists. Plaza Slab's three finishes share ONE set option
 *  ("CHAMOIS"), so the bare option cannot name a material —
 *  the qualified string can, and key lookups honour it
 *  exactly (belgardDeckMaterialByKey). */
export const belgardKeyOption = (m: BelgardDeckMaterial): string =>
  m.qualifier ? `${m.option} ${m.qualifier}` : m.option;

/** The deck material for a stored Belgard KEY — the lookup
 *  every surface uses; surfaces store the key, never the id.
 *  A bare (unqualified) option resolves to the FIRST material
 *  carrying it — the set's representative finish — which is
 *  what pre-qualifier keys and store-link options mean. */
export const belgardDeckMaterialByKey = (
  key?: { productSlug: string; option: string } | null,
): BelgardDeckMaterial | undefined => {
  if (!key) return undefined;
  return (
    BELGARD_DECK_MATERIALS.find(
      (m) => m.productSlug === key.productSlug && belgardKeyOption(m) === key.option,
    ) ??
    BELGARD_DECK_MATERIALS.find(
      (m) => m.productSlug === key.productSlug && m.option === key.option,
    )
  );
};

/** Derive the material list for a set of catalog categories
 *  (belgardTextures3d group.category). Before the repair
 *  build (2026-11-04, audit §A/§E) the single deck list
 *  carried ALL 211 groups, so wall blocks, coping and
 *  fireplace products were offered as deck pavers. The deck
 *  list now derives from the deck categories only. The
 *  Walls and Coping & Steps categories stay OUT of the
 *  studios entirely for now (founder ruling 2026-11-04:
 *  walls return as their own later job; coping is deferred
 *  untouched) — they remain in the library data, unoffered. */
const deriveMaterials = (
  categories: ReadonlySet<string>,
): BelgardDeckMaterial[] => {
  const out: BelgardDeckMaterial[] = [];
  const seen = new Set<string>();
  for (const g of BELGARD_TEXTURES_3D) {
    if (!categories.has(g.category)) continue;
    for (const t of g.textures) {
      const id = belgardDeckMaterialId(g.productSlug, t);
      if (seen.has(id)) continue;
      seen.add(id);
      const pattern = belgardPrimaryPattern(g.productSlug);
      let spanIn: number | null = null;
      const field = infiniteFieldSpan(t) ?? infiniteFieldSpan(g);
      if (field) spanIn = Math.max(field.spanWIn, field.spanHIn);
      const logic = belgardPatternLogicFor(g.productSlug, t.option);
      if (spanIn === null && pattern)
        spanIn = Math.max(pattern.module.widthIn, pattern.module.heightIn);
      if (spanIn === null && logic?.moduleIn)
        spanIn = Math.max(logic.moduleIn[0], logic.moduleIn[1]);
      if (spanIn === null && logic?.surfaceIn)
        spanIn = Math.max(logic.surfaceIn[0], logic.surfaceIn[1]);
      out.push({
        id,
        label: `${g.product} — ${t.option}${t.qualifier ? ` ${t.qualifier}` : ""}`,
        product: g.product,
        productSlug: g.productSlug,
        option: t.option,
        ...(t.qualifier ? { qualifier: t.qualifier } : {}),
        image: t.webp || t.jpg,
        original:
          belgardOriginalImageFor(g.productSlug, t.option) ??
          (t.webp || t.jpg),
        spanFt: spanIn !== null ? spanIn / 12 : 2,
        logic,
        pattern,
        hex: belgardIsHexagonal(g.productSlug),
      });
    }
  }
  return out;
};

/** Deck categories only: the one list every deck picker and
 *  deck builder resolves from. "Vinyl Flooring" joined
 *  2026-11-16 with the Floor & Decor merge (founder order):
 *  merged F&D products carry that category in their texture
 *  groups and derive as deck materials like any other. */
export const BELGARD_DECK_MATERIALS: BelgardDeckMaterial[] =
  deriveMaterials(
    new Set([
      "Pavers & Slabs",
      "Porcelain Pavers",
      "Permeable Pavers",
      "Vinyl Flooring",
      "Tile",
    ]),
  );

export const belgardDeckMaterialById = (id: string) =>
  BELGARD_DECK_MATERIALS.find((m) => m.id === id);

/** The deck material whose field image a surface element is
 *  showing — the laid field texture OR the catalog original
 *  (surfaces that stored the selector image resolve too). */
export const belgardDeckMaterialByImage = (image?: string) =>
  image
    ? BELGARD_DECK_MATERIALS.find(
        (m) => m.image === image || m.original === image,
      )
    : undefined;

/* ---------- store paver products -> their Belgard cuts + logic ---------- */

/**
 * The store sells single colors of Belgard families as priced products
 * (data/paverData). This link resolves a store paver to the ONE Belgard
 * per-unit set + pattern logic for its exact product and color — merged,
 * never duplicated: the store product keeps its own id, name, price and
 * photo on every priced surface; the cuts and logic resolve from here.
 * Returns undefined when no Belgard set exists for that product + color
 * (Coralina, Appian Charcoal, three Travertini colors — no set was ever
 * cut for them, and none is invented).
 */
export interface BelgardStoreLink {
  productSlug: string;
  option: string;
  set?: BelgardUnitTextureSet;
  logic?: BelgardPatternLogic;
  texture?: BelgardTextureRef;
}

const storeFamilyById = new Map(
  STORE_PAVER_PATTERNS.filter((s) => s.family).map((s) => [
    s.storeProductId,
    s.family!,
  ]),
);

const linkFor = (slug: string, option: string): BelgardStoreLink => ({
  productSlug: slug,
  option,
  set: belgardUnitSet(slug, option),
  logic: belgardPatternLogicFor(slug, option),
  texture: belgardTextureFor(slug, option),
});

export function belgardForStorePaver(
  storeProductId: string,
  storeName: string,
): BelgardStoreLink | undefined {
  const wanted = storeName.trim().toLowerCase();
  for (const s of unitIndex.values()) {
    if (`${s.product} ${s.option}`.toLowerCase() === wanted)
      return linkFor(s.productSlug, s.option);
  }
  const fam = storeFamilyById.get(storeProductId);
  if (fam) {
    const short = fam.familyProduct.split(/[\s-]+/)[0];
    let cand = storeName.startsWith(short)
      ? storeName.slice(short.length).trim()
      : "";
    cand = cand.replace(/\s*\d+\s*x\s*\d+\s*$/i, "").trim();
    if (cand && belgardUnitSet(fam.familySlug, cand))
      return linkFor(fam.familySlug, cand);
  }
  return undefined;
}

/**
 * The render-truth phrase for a linked store paver, built from the
 * product's own saved pattern logic and its real cut faces — this is what
 * the Tier-2 engine must reproduce when the product is picked on any
 * surface (Big Showcase, Wonderlands Studio, suites, product cards).
 */
export function belgardVisualText(link: BelgardStoreLink): string | undefined {
  const { logic, set } = link;
  if (!logic) return undefined;
  if (logic.kind === "field") {
    const span = logic.surfaceIn
      ? `${logic.surfaceIn[0]}in × ${logic.surfaceIn[1]}in`
      : "one full texture image";
    return `one continuous seamless field at true scale (${span} of surface per texture image) — an amorphous cut with no pieces: never cut into blocks and never laid in a grid`;
  }
  const faces = set
    ? [...new Set(set.variants.map((v) => v.faceIn).filter(Boolean))].map(
        (f) => `${f![0]}in × ${f![1]}in`,
      )
    : [];
  const module = logic.moduleIn
    ? `, module ${logic.moduleIn[0]}in × ${logic.moduleIn[1]}in repeated`
    : "";
  const faceText =
    faces.length > 0
      ? ` — every tile carries a real paver face cut at its true printed size (${faces.join(", ")})`
      : "";
  return `${logic.pattern ?? "catalog"} laying pattern${module}${faceText}`;
}
