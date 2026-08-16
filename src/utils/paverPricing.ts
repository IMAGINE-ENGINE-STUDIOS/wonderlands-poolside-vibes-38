import { paverTypes, copingTypes, PaverType } from '@/data/paverData';

// Default price per sq ft for concrete deck
export const DEFAULT_PAVER_PRICE_PER_SQFT = 10;

// Concrete deck price per sq ft
export const CONCRETE_DECK_PRICE_PER_SQFT = 10;

// Screen enclosure (WonderCage) pricing - Standard $22, Deluxe $24, 2 Story $26
export const SCREEN_ENCLOSURE_PRICING = {
  standard: 22,
  deluxe: 24,
  premium: 26,
} as const;

/**
 * Get the price per square foot for a specific paver by name
 */
export function getPaverPricePerSqFt(paverName: string | undefined | null): number {
  if (!paverName) return DEFAULT_PAVER_PRICE_PER_SQFT;
  
  // Concrete Deck is always $10/sqft
  if (paverName === 'Concrete Deck') return CONCRETE_DECK_PRICE_PER_SQFT;
  
  const paver = paverTypes.find(p => p.name === paverName);
  return paver?.basePrice ?? DEFAULT_PAVER_PRICE_PER_SQFT;
}

/**
 * Calculate total paver cost based on surface area and paver type
 */
export function calculatePaverCost(
  surfaceArea: number | string | undefined | null,
  paverName?: string | null
): number {
  const area = typeof surfaceArea === 'string' ? parseFloat(surfaceArea) : (surfaceArea ?? 0);
  if (isNaN(area) || area <= 0) return 0;
  
  const pricePerSqFt = getPaverPricePerSqFt(paverName);
  return area * pricePerSqFt;
}

/**
 * Format paver cost display string
 */
export function formatPaverCostDisplay(
  surfaceArea: number | string | undefined | null,
  paverName?: string | null
): string {
  const area = typeof surfaceArea === 'string' ? parseFloat(surfaceArea) : (surfaceArea ?? 0);
  if (isNaN(area) || area <= 0) return '$0';
  
  const pricePerSqFt = getPaverPricePerSqFt(paverName);
  const total = area * pricePerSqFt;
  
  return `$${total.toLocaleString()} (${area} sq ft × $${pricePerSqFt}/sq ft)`;
}

/**
 * Get paver by name from paverTypes
 */
export function getPaverByName(paverName: string): PaverType | undefined {
  return paverTypes.find(p => p.name === paverName);
}

/**
 * Calculate screen enclosure cost
 */
export function calculateScreenEnclosureCost(
  area: number,
  quality: 'standard' | 'deluxe' | 'premium' = 'standard'
): number {
  const pricePerSqFt = SCREEN_ENCLOSURE_PRICING[quality] ?? SCREEN_ENCLOSURE_PRICING.standard;
  return area * pricePerSqFt;
}

/**
 * Look up a coping price per sq ft by product NAME (as selected in the store/3D galleries).
 * Falls back to the deck paver catalog, then to the default rate.
 */
export function getCopingPricePerSqFtByName(copingName: string | undefined | null): number {
  if (!copingName) return 25;
  const coping = copingTypes.find(c => c.name === copingName);
  if (coping) return coping.basePrice;
  const paver = paverTypes.find(p => p.name === copingName);
  return paver?.basePrice ?? 25;
}
