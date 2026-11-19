/**
 * Single source of truth for every 3D texture gallery (pool finish, coping,
 * deck pavers, waterline). Derived directly from the Wonderlands Studio
 * catalog so the 3D panels always match the Studio's categories, products and
 * option profile, with no hardcoded, drifting lists. Paver and coping
 * entries resolve from the ported Belgard data (belgardTextures3d field
 * textures, belgardUnitTextures per-unit faces, and the depth maps in
 * data/normalMaps.json) rather than the single store image per product.
 */
import { poolFinishes, poolLiners, poolTiles } from './consolidatedProducts';
import { paverTypes } from './paverData';
import { BELGARD_FEATURES } from './belgardFeatures';
import { BELGARD_DECK_MATERIALS, belgardKeyOption } from '@/lib/visual/belgardUnitLibrary';
import { normalMapUrlFor } from '@/lib/visual/normalMaps';
import type { TextureConfig, TextureLibrary } from '@/components/scene3d/types';

/** Catalog metadata carried alongside the raw three.js texture config. */
export interface CatalogTextureConfig extends TextureConfig {
  id?: string;
  /** Studio group label, e.g. "Glass Tiles", "Deep & Dramatic". */
  group?: string;
  /** Catalog price (per sqft or per unit, as stored in the catalog). */
  price?: number;
  /** Belgard material key when this texture is a Belgard deck material.
   *  Pattern, cuts, joint and filler resolve from the one library
   *  (lib/visual/belgardUnitLibrary); `url` is then the material's
   *  field texture from belgardTextures3d. */
  belgard?: { productSlug: string; option: string };
  /** The variant's catalog original flat swatch, the image selectors
   *  show for this texture. */
  original?: string;
  /** Depth map for this texture, resolved from the ported depth
   *  manifest (data/normalMaps.json) through lib/visual/normalMaps.
   *  Absent when the texture has no depth map on record. */
  normalMapUrl?: string;
}

export interface CatalogTextureLibrary extends TextureLibrary {
  finishes: CatalogTextureConfig[];
  pavers: CatalogTextureConfig[];
  coping: CatalogTextureConfig[];
  waterlines: CatalogTextureConfig[];
}

/** Material response per liner/tile family so glass still reads as glass. */
const WATERLINE_MATERIAL: Record<string, { roughness: number; metalness: number }> = {
  Glass: { roughness: 0.1, metalness: 0.3 },
  Porcelain: { roughness: 0.2, metalness: 0.1 },
  'Premium Border': { roughness: 0.15, metalness: 0.2 },
  'Italian Stone': { roughness: 0.35, metalness: 0.05 },
};

const WATERLINE_GROUP_LABEL: Record<string, string> = {
  Glass: 'Glass Tiles',
  Porcelain: 'Porcelain Tiles',
  'Premium Border': 'Premium Border',
  'Italian Stone': 'Italian Stone',
};

/** Group display order for waterline options (mirrors the Studio listing). */
export const WATERLINE_GROUP_ORDER = [
  'Glass Tiles',
  'Porcelain Tiles',
  'Premium Border',
  'Italian Stone',
  'Pool Tiles',
];

const isActive = (p: { isActive?: boolean }) => p.isActive !== false;
const hasImage = (p: { image?: string }) => Boolean(p.image);

/** All waterline tile options: every liner (by family) + the pool tiles. */
export const buildWaterlineTextures = (): CatalogTextureConfig[] => {
  const liners = poolLiners.filter(isActive).filter(hasImage).map((liner) => {
    const family = liner.subcategory || 'Glass';
    const material = WATERLINE_MATERIAL[family] || WATERLINE_MATERIAL.Glass;
    return {
      id: liner.id,
      url: liner.image as string,
      name: liner.name,
      group: WATERLINE_GROUP_LABEL[family] || family,
      price: liner.price,
      ...material,
    };
  });

  const tiles = poolTiles.filter(isActive).filter(hasImage).map((tile) => ({
    id: tile.id,
    url: tile.image as string,
    name: tile.name,
    group: 'Pool Tiles',
    price: tile.price,
    roughness: 0.1,
    metalness: 0.3,
  }));

  return [...liners, ...tiles];
};

/** All pool finish options, grouped by catalog subcategory. */
export const buildFinishTextures = (): CatalogTextureConfig[] =>
  poolFinishes.filter(isActive).filter(hasImage).map((finish) => ({
    id: finish.id,
    url: finish.image as string,
    name: finish.collection === 'Crystite Classic' ? `${finish.name} · Crystite Classic` : finish.name,
    group: finish.subcategory || finish.collection || 'Finishes',
    price: finish.price,
    roughness: 0.2,
    metalness: 0.1,
  }));

/** Paver / coping options straight from the paver catalog.
 *  This legacy store list is no longer what the texture library
 *  offers for pavers and coping (see buildBelgardTextures and
 *  buildBelgardCopingTextures below). It stays exported for the
 *  non-selector consumers that resolve saved records through it:
 *  the board editor's name lists and the takeoff's coping name
 *  lookup by URL. */
export const buildPaverTextures = (
  target: 'paver' | 'coping' = 'paver'
): CatalogTextureConfig[] =>
  paverTypes
    .filter((p) => Boolean(p.image))
    .map((p) => ({
      id: p.id,
      url: p.image,
      name: p.name,
      group: p.name.split(' ')[0],
      price: p.basePrice,
      roughness: target === 'coping' ? 0.6 : 0.8,
      metalness: 0,
    }));

/**
 * The Belgard deck materials as texture library entries, derived
 * from the one library (lib/visual/belgardUnitLibrary), so the
 * gallery and every other surface offer the same materials under
 * the same id, carrying the same Belgard key. Each material is
 * built from the ported belgardTextures3d field textures and the
 * belgardUnitTextures per-unit sets. The entry `url` is the field
 * texture the scene applies; `original` is the variant's catalog
 * original flat swatch the selectors show; `normalMapUrl` is the
 * field texture's own depth map, resolved from the ported depth
 * manifest. The Belgard data carries no prices, so these entries
 * carry none.
 */
export const buildBelgardTextures = (): CatalogTextureConfig[] =>
  BELGARD_DECK_MATERIALS.map((m) => ({
    id: m.id,
    url: m.image,
    name: m.label,
    group: 'Belgard',
    roughness: 0.8,
    metalness: 0,
    belgard: { productSlug: m.productSlug, option: belgardKeyOption(m) },
    original: m.original,
    normalMapUrl: normalMapUrlFor(m.image),
  }));

/**
 * The Belgard coping entries for the texture library, built from
 * the Belgard Features coping records (data/belgardFeatures),
 * never the legacy store list. Each faced variant offers its real
 * Belgard face from belgardUnitTextures' feature faces, with its
 * depth map where the manifest carries one. A coping product
 * with no faced variant falls back to Belgard's own product
 * photo, and one with neither is not offered. No picture is ever
 * invented, and no price is attached.
 */
export const buildBelgardCopingTextures = (): CatalogTextureConfig[] => {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const out: CatalogTextureConfig[] = [];
  for (const f of BELGARD_FEATURES) {
    if (f.category !== 'Coping') continue;
    const faced = f.variants.filter((v) => v.faceUrl || v.faces?.length);
    if (faced.length) {
      for (const v of faced) {
        const url = (v.faceUrl ?? v.faces![0]) as string;
        out.push({
          id: `belgard-coping-${f.slug}-${slug(v.name)}`,
          url,
          name: `${f.product} ${v.name}`,
          group: f.product,
          roughness: 0.6,
          metalness: 0,
          normalMapUrl: normalMapUrlFor(url),
        });
      }
    } else if (f.photoUrl) {
      out.push({
        id: `belgard-coping-${f.slug}`,
        url: f.photoUrl,
        name: f.product,
        group: f.product,
        roughness: 0.6,
        metalness: 0,
        normalMapUrl: normalMapUrlFor(f.photoUrl),
      });
    }
  }
  return out;
};

/** Dedupe by URL — duplicate keys previously dropped swatches silently.
 *  "url-name" mode keeps same-URL entries whose names differ (Crystite
 *  Classic finishes share their Crystal twin's swatch image). In "url"
 *  mode a Belgard-keyed entry wins a URL collision over a keyless one,
 *  taking the first entry's position: caller galleries list their
 *  keyless custom entries before the catalog list, and first-wins URL
 *  dedupe would let a keyless entry shadow the keyed one from
 *  buildBelgardTextures, so the pick would write a deck record
 *  carrying an image and no Belgard key. Two keyed (or two keyless)
 *  entries keep the first-wins rule. */
export const dedupeTextures = <T extends { url?: string; name?: string }>(list: T[], keyBy: "url" | "url-name" = "url"): T[] => {
  if (keyBy === "url-name") {
    const seen = new Set<string>();
    return list.filter((t) => {
      if (!t?.url) return false;
      const key = `${t.url}|${t.name ?? ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const seen = new Map<string, number>();
  const out: T[] = [];
  for (const t of list) {
    if (!t?.url) continue;
    const at = seen.get(t.url);
    if (at === undefined) {
      seen.set(t.url, out.length);
      out.push(t);
    } else if (
      !(out[at] as { belgard?: unknown }).belgard &&
      (t as { belgard?: unknown }).belgard
    ) {
      out[at] = t;
    }
  }
  return out;
};

/** Group textures for display, honouring WATERLINE_GROUP_ORDER when relevant. */
export const groupTextures = (
  list: CatalogTextureConfig[]
): Array<{ group: string; textures: CatalogTextureConfig[] }> => {
  const buckets = new Map<string, CatalogTextureConfig[]>();
  list.forEach((t) => {
    const key = t.group || 'Options';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(t);
  });
  const keys = Array.from(buckets.keys()).sort((a, b) => {
    const ia = WATERLINE_GROUP_ORDER.indexOf(a);
    const ib = WATERLINE_GROUP_ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });
  return keys.map((group) => ({ group, textures: buckets.get(group)! }));
};

/** Full catalog-backed texture library, optionally merged with custom uploads. */
export const buildCatalogTextureLibrary = (
  custom?: Partial<CatalogTextureLibrary>
): CatalogTextureLibrary => ({
  finishes: dedupeTextures([...(custom?.finishes || []), ...buildFinishTextures()], "url-name"),
  // Paver gallery = the Belgard deck materials from the ported
  // belgardTextures3d and belgardUnitTextures data, each with its
  // depth map. The legacy store pavers remain available from
  // buildPaverTextures for non-selector consumers (board editor,
  // takeoff); they are no longer offered as deck materials here.
  pavers: dedupeTextures([...(custom?.pavers || []), ...buildBelgardTextures()]),
  // Coping gallery = the Belgard Features coping entries. The
  // legacy store list stays resolvable through
  // buildPaverTextures('coping') for saved records.
  coping: dedupeTextures([...(custom?.coping || []), ...buildBelgardCopingTextures()]),
  waterlines: dedupeTextures([...(custom?.waterlines || []), ...buildWaterlineTextures()]),
});
