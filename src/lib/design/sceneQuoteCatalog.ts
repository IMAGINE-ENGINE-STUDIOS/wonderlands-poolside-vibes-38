/**
 * Scene → quote catalog resolver.
 * Every quote line coming from the 2D Design Studio / 3D Studio take-off is
 * matched to the same product entry the main site shows (store catalog,
 * paver/coping catalog, studio category lists), so the quote gets that
 * product's real photo and description. No match → name only, never an
 * invented picture. Index is built once (lazy) for speed.
 * Imagine Engine Studios Corp.
 */
import { allProducts } from "@/data/consolidatedProducts";
import { paverTypes, copingTypes } from "@/data/paverData";
import * as studioLists from "@/data/studioCategoryProducts";

export interface CatalogHit { name: string; image: string; description: string }

let index: CatalogHit[] | null = null;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function build(): CatalogHit[] {
  const out: CatalogHit[] = [];
  const push = (name?: string, image?: string, description?: string) => {
    if (name && image) out.push({ name, image, description: description ?? "" });
  };
  allProducts.forEach((p) => push(p.name, p.image as string | undefined, p.description));
  [...paverTypes, ...copingTypes].forEach((p) => push(p.name, p.image, p.description));
  Object.values(studioLists).forEach((v) => {
    if (Array.isArray(v)) v.forEach((p: any) => push(p?.name, p?.image, p?.description));
  });
  // Longest names first so "Appian Adobe" wins over "Appian".
  return out.sort((a, b) => b.name.length - a.name.length);
}

/** Finds the catalog product named inside a quote line (or by a hint name). */
export function resolveCatalog(lineName: string, hint?: string): CatalogHit | undefined {
  index ??= build();
  const hay = ` ${norm(`${hint ?? ""} ${lineName}`)} `;
  return index.find((h) => hay.includes(` ${norm(h.name)} `));
}

/** Adds image + description to quote lines, keeping any image already set. */
export function enrichQuoteLines<T extends { name: string; image?: string }>(lines: T[], hints: Record<number, string | undefined> = {}) {
  return lines.map((l, i) => {
    const hit = resolveCatalog(l.name, hints[i]);
    return hit ? { ...l, image: l.image || hit.image, description: hit.description } : l;
  });
}
