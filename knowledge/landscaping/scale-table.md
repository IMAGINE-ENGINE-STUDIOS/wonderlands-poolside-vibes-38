# Wonderlands knowledge — real-world scale for 3D landscape models

The anchor for every 3D scene is the **pool**: its dimensions are exact feet
(a 16 × 32 pool is 16 ft wide and 32 ft long, drawn at true size). Every
Sketchfab model Genius places is scaled against that anchor so the yard reads
1:1 — a guest standing in the scene is ~5.5 ft tall, a fence panel is its real
height, and a palm is a palm, not a houseplant or a redwood. On the 2D boards
the same truth holds at **10 units = 1 ft** (`LANDSCAPE_PX_PER_FT`), and the
plan-view botany in `src/lib/landscape/plantSpecs.ts` already carries a mature
height, canopy spread and spacing for every catalog plant — Genius uses those
numbers, this file turns them into scene rules.

## The Sketchfab normalization rule (absolute)

A downloaded model's native scale means nothing — one file's unit is a metre,
the next is a centimetre, the next is whatever the artist felt like. So:

1. Load the model and measure its **bounding box** (height H_model, footprint
   W_model × D_model) in scene units.
2. Pick the **target height** for its category from the table below (within
   the range — smaller near the house and pool, larger at the back fence).
3. Compute one uniform scale: **scale = targetHeight ÷ H_model**. Apply it to
   all three axes. Never stretch a model non-uniformly to fit a spot.
4. Check the scaled footprint: canopy diameter must stay inside the planting
   bed or lawn area it sits in, and the canopy may not hang over the pool
   water, the deck or a walkway by more than ~1 ft. If it does, pick a
   smaller target height in range — or a smaller model — never let a canopy
   swallow the yard.
5. Sit the model's base exactly on the ground plane of the surface it is
   planted in (soil, turf, or a planter's soil line — see
   `placement-law.md`). No floating, no sinking.
6. Sanity-check against the pool: after scaling, hold the model next to the
   pool's known size. A shrub that reads taller than the fence, or a palm
   shorter than the pool is long, is wrong — rescale before showing the guest.

## Target sizes by category (as placed in a scene)

Placed size = a healthy installed specimen, not a 60-year-old giant and not a
nursery twig. Ranges give Genius room to vary a planting so it looks grown,
not copy-pasted. Heights are total height above ground.

| Category | Target height | Canopy / footprint | Notes |
|---|---|---|---|
| Groundcover & flowers (Blue Daze, lantana, perennial peanut, flax lily) | 0.3–1.5 ft | mat, spreads 1.5–2 ft per plant | Always under 1.5 ft; reads as a coloured carpet from above |
| Ornamental grasses (muhly, fakahatchee, fountain grass, liriope) | 1.5–3.5 ft | clump 2–3 ft across | Soft mounds; muhly blooms read pink-purple in season |
| Shrub / bush (ixora, hibiscus bush, croton, gardenia) | 2–4 ft | canopy 3–5 ft | The catalog default shrub spec is 4 ft tall, 3.5 ft spread |
| Large shrub / small accent (bougainvillea bush, bird of paradise, clusia) | 4–8 ft | canopy 5–6 ft | Bird of paradise: 8 ft class, spiky form |
| Hedge (podocarpus, clusia, viburnum, ligustrum, coco plum) | 3–6 ft as clipped (to 8 ft grown as a screen) | continuous run, plants 2.5 ft on-centre | A hedge is a *run*, never one lonely ball — see placement law |
| Topiary (eugenia ball, podocarpus topiary) | 3–6 ft | ball 2–3 ft across on a short trunk | Placed in pairs at doors, gates and axis ends |
| Small ornamental tree (crape myrtle, jacaranda young, bottlebrush standard) | 6–10 ft as placed (crape myrtle matures 15–20 ft) | canopy 8–15 ft | One per garden room; keep canopy off the pool |
| Palm — pygmy date / roebellini, adonidia (Christmas) | 6–10 ft | canopy 6–8 ft | The poolside palm: underplanting scale, safe near water |
| Palm — areca, cat, fishtail (clustering) | 8–16 ft | canopy 10–12 ft | Planted as a clump of trunks, reads as a screen |
| Palm — bottle, spindle-type singles | 10–15 ft | canopy 8–10 ft | Sculptural single trunk; specimen placement |
| Palm — queen | 18–24 ft | canopy 10–14 ft | The classic Florida poolside palm at placed size |
| Palm — foxtail | 18–24 ft | canopy 12–16 ft | Self-cleaning trunk; singles, doubles and triples in the catalog |
| Palm — sylvester / canary island date | 14–22 ft | canopy 16–18 ft | Heavy "pineapple" trunk; needs a wide bed, entry and estate scale |
| Palm — bismarck | 15–24 ft | canopy 16–18 ft, silver-blue | One per yard maximum; it is a statement, not a filler |
| Palm — sabal / cabbage (state tree) | 18–24 ft | canopy 10–12 ft | Curved trunk forms are normal; native look |
| Palm — sago, cardboard | 2–4 ft | rosette 3–4 ft across | These are accents, not trees — never scale them up |
| Shade tree (live oak, mahogany, royal poinciana, magnolia) | 15–30 ft as placed | canopy 18–30 ft (a mature live oak spreads 40 ft — plant for it) | Back-of-yard placement; canopy may shade lawn, never the whole pool unless asked |
| Fruit tree (banana, loquat, mulberry) | 8–18 ft | canopy 10–14 ft | Banana reads as a clump of 6–10 ft leaves |
| Vine on trellis / fence (bougainvillea trellis, jasmine, mandevilla) | as tall as its support, 6–10 ft typical | runs along the support line | The model hugs the fence or trellis; it is never a free-standing blob |
| Planter (the pot itself) | 1.5–3 ft | 1.5–3.5 ft across | Soil line ~3 in below the rim; the plant inside follows its own row **plus** the planter height |
| Boulder / rock | 1–3 ft | 1.5–4 ft across | Half-buried: sink 25–40% of its height into the bed |
| Fountain (tiered, on a basin) | 3–5 ft | basin 4–8 ft across | Sits in a basin, bed or lawn panel designed for it — see placement law |
| Fire pit (bowl / ring) | 1–1.5 ft | 3–4.5 ft across | On its own terrace of pavers or gravel, chairs around at 5–7 ft |
| Pergola | 8–10 ft | posts on a 10–14 ft grid | A structure, placed on deck, patio or lawn terrace |
| Gazebo | 9–12 ft | 10–14 ft across | Garden-room centrepiece; needs its own pad or lawn panel |
| Tiki torch / path light | 4–6 ft (torch), 1.5–2.5 ft (path light) | point objects | In beds or lawn edges along a path, never mid-walkway |
| Lounge chair / dining set (for scale checks) | chair back ~2.5–3 ft | dining table seats 6 at ~5 × 3 ft | If furniture dwarfs the pool, the scene scale is wrong |

## How this ties to the catalog

- `plantSpecs.ts` is the per-plant truth: category bases (Shrubs 4 ft, Palms
  18 ft, Trees 25 ft, Groundcover 0.8 ft…) with named overrides (pygmy/date
  palms 10 ft, sago 3.5 ft, hedge species 8 ft grown, crape myrtle 20 ft,
  live oak 45 ft mature). Genius designs with the **placed** ranges above
  and lets `plantSpecs` answer "how big will it get?" when a guest asks.
- Container size changes the *starting* size, not the species: the board
  scales a drawn canopy by container (1 gal ≈ 0.45× mature spread, 45 gal ≈
  1.3×, B&B ≈ 1.45×). In 3D, a guest who picks a 45 gal specimen gets a
  model at the top of its range; a 3 gal gets the bottom.
- When a Sketchfab search returns several models for one plant, prefer the
  one whose *proportions* (canopy-to-trunk ratio) look right after
  normalization — a correctly-shaped model at the right height beats a
  detailed one that must be squashed.
