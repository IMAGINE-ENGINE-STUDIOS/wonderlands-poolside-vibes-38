/**
 * Shared paver display enrichment (Paver Port Wiring Job 5).
 *
 * One resolver that joins a store paver record (src/data/paverData.ts) to
 * the ported Belgard reference data:
 *   printed sizes   — src/data/belgardMediaLogic.ts (catalog printed sizes),
 *                     with the store set's own sizes first when it carries any
 *   pattern names   — src/data/storePaverPatterns.ts (family pattern names
 *                     plus the set's own defined patterns)
 *   per-color faces — src/data/belgardUnitTextures.ts via
 *                     lib/visual/belgardUnitLibrary (the real per-unit faces
 *                     cut from the catalog swatch for this product's color)
 *   catalog swatch  — the Media & Logic option image for this color
 *
 * Display only. This module reads no price and changes no price; surfaces
 * keep pricing exactly as paverData and their own expressions compute it.
 * Anything the reference data does not carry comes back null or empty and
 * the surface falls back to the store record's own image, never an
 * invented substitute.
 */
import { BELGARD_MEDIA_LOGIC } from "@/data/belgardMediaLogic";
import { STORE_PAVER_PATTERNS } from "@/data/storePaverPatterns";
import { paverTypes, type PaverType } from "@/data/paverData";
import { belgardUnitSetsFor } from "@/lib/visual/belgardUnitLibrary";
import { appAssetUrl } from "@/lib/design/kitchenAssetUrl";

export interface PaverDisplayInfo {
  storeProductId: string;
  /** Catalog family slug (e.g. "appian-stone"), when the product has one. */
  familySlug: string | null;
  /** Catalog family display name (e.g. "Appian-Stone"), when known. */
  familyName: string | null;
  /** The color this store record sells (e.g. "Amaretto"), when resolved. */
  colorName: string | null;
  /** Printed size dimensions, inches, deduped, store sizes first. */
  sizes: string[];
  /** Laying pattern names offered for this product, deduped. */
  patternNames: string[];
  /** This color's own per-unit face images (app based URLs). */
  faceImages: string[];
  /** First face image, for thumbnails; null when no face was extracted. */
  faceImage: string | null;
  /** The catalog swatch image for this color, when one was printed. */
  swatchImage: string | null;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

const MAX_SIZES = 6;
const MAX_PATTERNS = 6;
const MAX_FACES = 4;

/** Family slug fallbacks for store lines whose pattern set names no family. */
const FAMILY_SLUG_FALLBACKS: Record<string, string> = {
  travertini: "travertini",
};

function familySlugFor(paver: PaverType): string | null {
  const set = STORE_PAVER_PATTERNS.find((s) => s.storeProductId === paver.id);
  if (set?.family?.familySlug) return set.family.familySlug;
  const prefix = paver.id.split("-")[0];
  return FAMILY_SLUG_FALLBACKS[prefix] ?? null;
}

/**
 * The unit texture set for this store record's own color: the set whose
 * option name appears inside the product's display name (longest match
 * wins, so "Scandina Gray" beats "Gray" style partials).
 */
function unitSetFor(paver: PaverType, familySlug: string | null) {
  if (!familySlug) return undefined;
  const name = norm(paver.name);
  let best: ReturnType<typeof belgardUnitSetsFor>[number] | undefined;
  for (const set of belgardUnitSetsFor(familySlug)) {
    if (name.includes(norm(set.option))) {
      if (!best || set.option.length > best.option.length) best = set;
    }
  }
  return best;
}

const cache = new Map<string, PaverDisplayInfo>();

/** Display enrichment for one store paver record. */
export function getPaverDisplayInfo(paver: PaverType): PaverDisplayInfo {
  const cached = cache.get(paver.id);
  if (cached) return cached;

  const set = STORE_PAVER_PATTERNS.find((s) => s.storeProductId === paver.id);
  const familySlug = familySlugFor(paver);
  const media = familySlug
    ? BELGARD_MEDIA_LOGIC.find((p) => p.slug === familySlug)
    : undefined;
  const unitSet = unitSetFor(paver, familySlug);
  const colorName = unitSet?.option ?? null;

  const sizes: string[] = [];
  const pushSize = (value: string | null | undefined) => {
    if (!value) return;
    const v = value.trim();
    if (v && !sizes.includes(v) && sizes.length < MAX_SIZES) sizes.push(v);
  };
  for (const s of set?.sizes ?? []) pushSize(s.dimensions || s.label);
  for (const s of media?.sizes ?? []) pushSize(s.dimensions);

  const patternNames: string[] = [];
  const pushPattern = (value: string | null | undefined) => {
    if (!value) return;
    const v = value.trim();
    if (v && !patternNames.includes(v) && patternNames.length < MAX_PATTERNS)
      patternNames.push(v);
  };
  for (const n of set?.family?.patternNames ?? []) pushPattern(n);
  for (const p of set?.patterns ?? []) pushPattern(p.name);

  const faceImages = (unitSet?.variants ?? [])
    .slice(0, MAX_FACES)
    .map((v) => appAssetUrl(v.url))
    .filter((u): u is string => Boolean(u));

  const swatch = colorName
    ? media?.options.find((o) => norm(o.name) === norm(colorName))
    : undefined;

  const info: PaverDisplayInfo = {
    storeProductId: paver.id,
    familySlug,
    familyName: set?.family?.familyProduct ?? media?.name ?? null,
    colorName,
    sizes,
    patternNames,
    faceImages,
    faceImage: faceImages[0] ?? null,
    swatchImage: appAssetUrl(swatch?.image) ?? null,
  };
  cache.set(paver.id, info);
  return info;
}

/** Same enrichment resolved from the display name the cards key on. */
export function getPaverDisplayInfoByName(name: string): PaverDisplayInfo | null {
  const paver = paverTypes.find((p) => p.name === name);
  return paver ? getPaverDisplayInfo(paver) : null;
}

/**
 * One line summary of the enrichment for search results and console
 * entries (Paver Port Wiring Job 6): printed sizes and laying pattern
 * names, or null when the reference data carries neither.
 */
export function paverDisplaySummary(
  info: PaverDisplayInfo | null | undefined,
): string | null {
  if (!info) return null;
  const parts: string[] = [];
  if (info.sizes.length > 0)
    parts.push(`Printed sizes (in): ${info.sizes.join(", ")}`);
  if (info.patternNames.length > 0)
    parts.push(`Laying patterns: ${info.patternNames.join(", ")}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}
