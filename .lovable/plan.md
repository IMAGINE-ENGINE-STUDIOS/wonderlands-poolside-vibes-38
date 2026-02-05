
# Pool Pricing Update: Apply 3.5x Multiplier

## Overview
Update all GlimmerGlass and Latham pool prices by applying a 3.5x multiplier to the original base prices.

## Files to Modify

### 1. `src/data/gilmerPools.ts`
Update all 31 GlimmerGlass pool prices with the new 3.5x multiplier formula.

**Current pricing formula comment (line 1):**
- `(Dealer Price × 4) + $10K Out-of-State Delivery`

**New approach:**
- Calculate new prices as: `current_price × (3.5 / 4)` = `current_price × 0.875`
- This converts from the current 4x multiplier to a 3.5x multiplier
- Update the comment to reflect the new formula

**Sample price changes:**
| Model | Current Price | New Price (×3.5) |
|-------|---------------|------------------|
| Serafina | $55,526 | $48,585 |
| Coral Cove | $59,675 | $52,216 |
| Retreat | $58,726 | $51,385 |
| Regal Plunge | $65,779 | $57,557 |
| ... | ... | ... |

### 2. `src/components/PoolCatalog.tsx`
Update all Latham pool prices (approximately 40+ models) with the 3.5x multiplier.

**Price update approach:**
- Calculate: `current_price × (3.5 / previous_multiplier)`
- Apply to all Latham models: Milan, Jamaica, Aruba, Bermuda, Astoria variants, Corinthian variants, Enchantment variants, Tuscan variants, Olympia variants, and all other models

**Sample price changes:**
| Model | Current Price | New Price (×3.5) |
|-------|---------------|------------------|
| Astoria 12 | $79,524 | ~$69,584 |
| Milan | $62,659 | ~$54,827 |
| Jamaica | $63,744 | ~$55,776 |
| Bermuda | $54,863 | ~$48,005 |
| ... | ... | ... |

## Implementation Steps

1. **Update `gilmerPools.ts`**
   - Modify comment on line 1 to reflect 3.5x multiplier
   - Recalculate all 31 pool prices using 3.5x formula

2. **Update `PoolCatalog.tsx`**
   - Recalculate all Latham pool prices (lines 78-652)
   - Apply consistent 3.5x multiplier across all models

## Technical Notes
- Only pool prices will be affected; spa prices in `PoolCatalog.tsx` (lines 656+) will remain unchanged
- Wonderlands-branded pools (Madre Perla, Maxima, Pacific Ridge, Winderview, Cancun Deluxe) may be excluded if they follow different pricing rules - please confirm if these should also use 3.5x
- The `poolProductLookup.ts` file may also need synchronization if it contains duplicate pricing data
