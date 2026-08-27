# Landscaping Tier Swap — Remove "Basic Refresh", Add "Themed Patio"

## Goal
Eliminate the **Tier 01 — Basic Refresh** ($5/sqft) product from the landscaping quote builder and replace it with a new **Themed Patio** tier: green walls, luxury landscaping design, matured trees & vegetation — priced as **"Call one of our agents"** instead of a per-sqft rate.

## Changes — `src/components/LandscapingSection.tsx`

1. **Replace the `basic` tier in the `TIERS` array** (lines 76–80) with:
   - id: `themed`
   - title: **"Themed Patio"**
   - description: "Green walls, luxury landscaping design, matured trees & vegetation"
   - price: `null` (no numeric rate) with a `callForQuote: true` flag
   - Keep Tier 02 (Full Yard Makeover) and Tier 03 (Luxury Outdoor Space) unchanged.

2. **Tier card rendering** (lines 288–294):
   - For `callForQuote` tiers, show **"Call one of our agents"** in the serif price slot instead of `$X /sq ft`.

3. **Quote math** (lines 226–244):
   - When the themed tier is selected, the sqft base line becomes **"Quoted by an agent"** and base cost is excluded from the computed total (plants added from the catalog still sum normally).
   - Admin override (`WONDERMAGIC` passcode) still works — agents can enter a manual total/rate override.
   - Default selected tier switches from `basic` to `themed`... actually to `full` (Tier 01 now = Themed Patio; default selection becomes the new first tier).

4. **Quote output / print / send flow**: when Themed Patio is active, the generated quote line for the base service reads "Themed Patio — price quoted by agent" instead of a dollar amount.

## Notes
- No other components reference this tier (it lives entirely inside `LandscapingSection.tsx`); plant catalog, cart, and other sections untouched.
- No emojis in the new tier card (existing tiers use emoji strings in data but don't render them visibly — keep as-is for the other two; new tier gets none).
