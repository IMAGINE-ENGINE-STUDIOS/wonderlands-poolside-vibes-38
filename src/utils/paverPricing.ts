import { paverTypes, PaverType } from '@/data/paverData';

// Default price per sq ft for pavers (Concrete deck pricing)
export const DEFAULT_PAVER_PRICE_PER_SQFT = 20;

// Screen enclosure pricing tiers
export const SCREEN_ENCLOSURE_PRICING = {
  standard: 27,
  premium: 33,
} as const;

/**
 * Get the price per square foot for a specific paver by name
 */
export function getPaverPricePerSqFt(paverName: string | undefined | null): number {
  if (!paverName) return DEFAULT_PAVER_PRICE_PER_SQFT;
  
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
  quality: 'standard' | 'premium' = 'standard'
): number {
  const pricePerSqFt = SCREEN_ENCLOSURE_PRICING[quality] ?? SCREEN_ENCLOSURE_PRICING.standard;
  return area * pricePerSqFt;
}
