/**
 * Single source of truth for every 3D texture gallery (pool finish, coping,
 * deck pavers, waterline). Derived directly from the Wonderlands Studio
 * catalog so the 3D panels always match the Studio's categories, products and
 * option profile — no hardcoded, drifting lists.
 */
import { poolFinishes, poolLiners, poolTiles } from './consolidatedProducts';
import { paverTypes } from './paverData';
import type { TextureConfig, TextureLibrary } from '@/components/scene3d/types';

/** Catalog metadata carried alongside the raw three.js texture config. */
export interface CatalogTextureConfig extends TextureConfig {
  id?: string;
  /** Studio group label, e.g. "Glass Tiles", "Deep & Dramatic". */
  group?: string;
  /** Catalog price (per sqft or per unit, as stored in the catalog). */
  price?: number;
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
    name: finish.name,
    group: finish.subcategory || finish.collection || 'Finishes',
    price: finish.price,
    roughness: 0.2,
    metalness: 0.1,
  }));

/** Paver / coping options straight from the paver catalog. */
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

/** Dedupe by URL — duplicate keys previously dropped swatches silently. */
export const dedupeTextures = <T extends { url?: string }>(list: T[]): T[] => {
  const seen = new Set<string>();
  return list.filter((t) => {
    if (!t?.url || seen.has(t.url)) return false;
    seen.add(t.url);
    return true;
  });
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
  finishes: dedupeTextures([...(custom?.finishes || []), ...buildFinishTextures()]),
  pavers: dedupeTextures([...(custom?.pavers || []), ...buildPaverTextures('paver')]),
  coping: dedupeTextures([...(custom?.coping || []), ...buildPaverTextures('coping')]),
  waterlines: dedupeTextures([...(custom?.waterlines || []), ...buildWaterlineTextures()]),
});
