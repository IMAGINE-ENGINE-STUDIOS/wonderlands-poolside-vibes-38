import { paverTypes, copingTypes } from '@/data/paverData';
import { getPaverPricePerSqFt, SCREEN_ENCLOSURE_PRICING } from '@/utils/paverPricing';

/**
 * Get deck paver price per sq ft by paver ID
 */
export function getDeckPricePerSqFt(paverId: string): number {
  const paver = paverTypes.find(p => p.id === paverId);
  return paver?.basePrice ?? 10; // Default to concrete $10/sqft
}

/**
 * Get coping price per sq ft by coping ID
 */
export function getCopingPricePerSqFt(copingId: string): number {
  // Check paverTypes first (deck pavers used as coping)
  const paver = paverTypes.find(p => p.id === copingId);
  if (paver) return paver.basePrice;
  // Check copingTypes
  const coping = copingTypes.find(p => p.id === copingId);
  return coping?.basePrice ?? 10;
}

/**
 * Feature costs - centralized
 */
export const FEATURE_COSTS: Record<string, number> = {
  stairs: 2500,
  light: 450,
  jet: 850,
  tree: 350,
  fountain: 3500,
  grass: 0,
  home: 0,
  shrub: 75,
  umbrella: 400,
  fence: 150,
  pathway: 0,
  'pool-seat': 3500,
  'pool-wall': 5000,
  'diving-board': 2500,
  'slide': 8000,
  'pool-cover': 4500,
  'pool-accessory': 500,
  'rock': 250,
  'boulder': 800,
  'hedge-row': 450,
  'plant-row': 300,
  'landscape-light': 350,
  'edging': 200,
  'grass-region': 0,
  'pond': 6000,
  'stream': 8000,
  'waterfall': 12000,
  'jumping-jet': 1200,
  'sprinkler': 150,
  'water-curtain': 5500,
};

export interface PoolBuilderCostBreakdown {
  poolCost: number;
  deckCost: number;
  copingCost: number;
  featuresCost: number;
  total: number;
  deckRate: number;
  copingRate: number;
}

/**
 * Calculate total project cost using real product prices
 */
export function calculateProjectCost(params: {
  poolBasePrice: number; // The actual catalog price of the selected pool model
  deckAreaSqFt: number;
  selectedPaverId: string;
  copingAreaSqFt: number;
  selectedCopingId: string;
  features: Array<{ type: string }>;
}): PoolBuilderCostBreakdown {
  const { poolBasePrice, deckAreaSqFt, selectedPaverId, copingAreaSqFt, selectedCopingId, features } = params;

  const deckRate = getDeckPricePerSqFt(selectedPaverId);
  const copingRate = getCopingPricePerSqFt(selectedCopingId);

  const poolCost = poolBasePrice;
  const deckCost = deckAreaSqFt * deckRate;
  const copingCost = copingAreaSqFt * copingRate;
  const featuresCost = features.reduce((total, f) => total + (FEATURE_COSTS[f.type] || 0), 0);

  return {
    poolCost,
    deckCost,
    copingCost,
    featuresCost,
    total: poolCost + deckCost + copingCost + featuresCost,
    deckRate,
    copingRate,
  };
}

/**
 * Snap a coordinate relative to a center point, ensuring exact foot values
 */
export function snapToGridRelative(value: number, center: number, scale: number, snapInches: number): number {
  // Convert to feet relative to center
  const relFeet = (value - center) / scale;
  // Snap to nearest increment (snapInches converted to feet)
  const snapFeet = snapInches / 12;
  const snappedFeet = Math.round(relFeet / snapFeet) * snapFeet;
  // Convert back to pixels
  return center + snappedFeet * scale;
}
