Add 5 new proposals (06–10) to `/design`, appended to the existing 5 from the last round. Each is fully interactive, uses the Wonderlands logo and real Wonderlands product data, and pushes the sales-oriented buttons further (clear primary CTA, secondary CTA, sticky bottom action bar where it fits).

## What's new

### 06 — Concierge Booking
A "book your design call" hero with a working 3-step booking flow.
- Step 1: pick property type (chip selector — Estate, Modern Home, Villa)
- Step 2: pick budget band (slider: $50k → $250k)
- Step 3: pick a date from a 7-day strip + time slot (Calendly link: calendly.com/wonderlandsworlds/30min)
- Live "your concierge" card on the right showing Jessica Grey + WhatsApp opt-in checkbox
- Primary CTA: "Reserve my call" (coral). Secondary: "Just send the brochure"

### 07 — Liner Catalog Showcase
A real product browser using actual Wonderlands liner data (Paradise, Water Lilies, Sail Boat, Stormy, Ballad, Galant, Melody, Soul, Glacier).
- Filter chips: Glass / Mosaic / Iridescent
- Hover card flips to show price ($20/sqft installed) + "Add to my pool" CTA
- Sticky bottom bar: "0 selected · Build my quote →" updates as user toggles items
- Real pricing math (sqft × $20) showing live total

### 08 — Pool Compare
Side-by-side comparator using real Latham/Wonderlands models: Maxima 16×35, Apollo 14, Astoria, Bermuda.
- Pick 2 to compare; row-by-row diff (size, depth, sqft, base price, install time, warranty)
- Animated bar charts comparing size and price
- Per-pool primary CTA: "Configure in Studio →" links into Wonderlands Studio
- Coral "Get a quote on this build" sticky action

### 09 — Finish Picker (Crystite Crystal)
Interactive finish swatch picker using real poolFinishes data (Sapphire Blue, Ocean Blue, etc.).
- Big pool preview swaps color/texture on click
- Swatch ring: 6–8 real finishes with name + warranty pill
- Slider: "Pool size (sqft)" — total finish cost recomputes from real price field
- Primary CTA: "Lock this finish ✓" + secondary "See it in Studio"

### 10 — Backyard Builder
Drag-free, click-to-add backyard builder.
- Canvas shows pool silhouette; user clicks tiles to add: Spa, Tanning Ledge, Fire Pit, Pergola, Lighting, Outdoor Kitchen
- Each addition animates into a "Your Wonderlands package" list on the right with real-ish prices (Spa +$12k, Tanning Ledge +$8k, Fire Pit +$4.5k, Pergola +$9k, Lighting +$3.2k, Kitchen +$18k)
- Running total card with 20/35/40/10 payment-schedule preview
- Primary CTA: "Build my backyard →" (gradient teal→coral). Secondary: "Schedule a call"

## Sales/UX polish applied across all 10

- Every hero has one clear primary CTA + one secondary
- Hover states on all buttons (scale + color shift)
- Sticky action bars where the proposal involves selection (07, 10)
- Real money formatted with `Intl.NumberFormat('en-US', currency)`
- WhatsApp opt-in checkbox shown wherever we collect contact intent (per project rule)
- Calendly link used as the official scheduling target
- Wonderlands logo consistent (same import used in 01–05)
- No "AI" wording in any user-facing copy (per project rule)

## Files

- `src/pages/DesignProposals.tsx` — append 5 new render components + entries in the PROPOSALS array. No other files touched.

## Technical notes

- Real data is imported from `src/data/poolData.ts` (liners) and `src/data/consolidatedProducts.ts` (finishes), keeping the page lightweight by destructuring only the 8–10 fields we render.
- Components stay inside the same file so the route stays a single lazy chunk.
- All interactions use plain `useState` — no extra dependencies.
