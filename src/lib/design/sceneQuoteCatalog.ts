/**
 * Quote line → catalog photo resolver (used by EVERY quote on the site).
 * Every quote line is matched to the same product entry the main site shows
 * (store catalog, paver/coping catalog, studio category lists, 2D site lists),
 * so the quote gets that product's real photo and description. Catalog match
 * wins over any texture URL a studio attached (e.g. a finish texture sent as
 * "coping"). No match → a type photo of that same product kind, or no photo —
 * never an unrelated picture. Index is built once (lazy) for speed.
 * Imagine Engine Studios Corp.
 */
import { allProducts } from "@/data/consolidatedProducts";
import { paverTypes, copingTypes } from "@/data/paverData";
import * as studioLists from "@/data/studioCategoryProducts";
import { FENCE_MATERIALS, SCREEN_STYLES, TURFS } from "@/components/designStudio/SiteElementsLayer";
import aluminumFenceImg from "@/assets/fencing/aluminum-fencing.webp";
import customPoolImg from "@/assets/pools/wonderlands/maxima-pool.webp";

export interface CatalogHit { name: string; image: string; description: string }

let index: CatalogHit[] | null = null;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function build(): CatalogHit[] {
  const out: CatalogHit[] = [];
  const push = (name?: string, image?: string, description?: string) => {
    if (name && image) out.push({ name, image, description: description ?? "" });
  };
  [...paverTypes, ...copingTypes].forEach((p) => push(p.name, p.image, p.description));
  FENCE_MATERIALS.forEach((m) => push(m.label, m.image));
  SCREEN_STYLES.forEach((m) => push(m.label, m.image));
  TURFS.forEach((m) => push(m.label, m.image));
  allProducts.forEach((p) => push(p.name, p.image as string | undefined, p.description));
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
  // Short/generic names ("Pool", "Fence") never match, so a line can't pick up an unrelated photo.
  return index.find((h) => { const n = norm(h.name); return n.length >= 6 && n.includes(" ") && hay.includes(` ${n} `); });
}

/** Same-kind photo when no exact product matched (fence → fence, screen → cage, turf → turf). */
function kindImage(name: string): string | undefined {
  const n = name.toLowerCase();
  if (/vinyl/.test(n) && /fenc/.test(n)) return FENCE_MATERIALS.find((m) => m.id === "vinyl")?.image;
  if (/glass/.test(n) && /fenc/.test(n)) return FENCE_MATERIALS.find((m) => m.id === "glass")?.image;
  if (/fenc/.test(n)) return aluminumFenceImg;
  if (/screen|enclosure|cage|lanai/.test(n)) return SCREEN_STYLES[0]?.image;
  if (/turf|grass/.test(n)) return TURFS[0]?.image;
  return undefined;
}

/** Coping is cut from the deck pavers: show the chosen paver (named in the line) or the default deck paver. */
function copingPaver(name: string, hint?: string): CatalogHit | undefined {
  if (!/coping/i.test(name)) return undefined;
  const hay = ` ${norm(`${hint ?? ""} ${name}`)} `;
  const p = [...paverTypes].sort((a, b) => b.name.length - a.name.length).find((x) => hay.includes(` ${norm(x.name)} `))
    ?? paverTypes.find((x) => x.id === "appian-adobe") ?? paverTypes[0];
  return p ? { name: p.name, image: p.image, description: p.description ?? "" } : undefined;
}

/** Photo for a single quote line: catalog product → same-kind photo → none. */
export function quoteLineImage(name: string, hint?: string): string | undefined {
  return copingPaver(name, hint)?.image ?? resolveCatalog(name, hint)?.image ?? kindImage(name);
}

/** Main photo for a custom-designed (drawn) pool — a Wonderlands concrete pool. */
export const CUSTOM_POOL_IMAGE = customPoolImg;

/** Adds image + description to quote lines; a catalog match replaces texture URLs. */
export function enrichQuoteLines<T extends { name: string; image?: string }>(lines: T[], hints: Record<number, string | undefined> = {}) {
  return lines.map((l, i) => {
    const hit = copingPaver(l.name, hints[i]) ?? resolveCatalog(l.name, hints[i]);
    if (hit) return { ...l, image: hit.image, description: hit.description };
    const kind = kindImage(l.name);
    return kind ? { ...l, image: kind } : l;
  });
}
