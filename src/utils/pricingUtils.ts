/**
 * Apply project type multiplier to a price
 */
export function applyProjectMultiplier(price: number, multiplier: number): number {
  return price * multiplier;
}

/**
 * Format price with project type label
 */
export function formatPriceWithType(
  price: number, 
  multiplier: number, 
  showLabel: boolean = false
): string {
  const adjustedPrice = applyProjectMultiplier(price, multiplier);
  const formattedPrice = `$${adjustedPrice.toLocaleString()}`;
  
  if (showLabel && multiplier > 1) {
    return `${formattedPrice} (Commercial)`;
  }
  
  return formattedPrice;
}

/**
 * Calculate total with multiplier applied
 */
export function calculateTotalWithMultiplier(
  baseTotal: number,
  multiplier: number
): number {
  return baseTotal * multiplier;
}
