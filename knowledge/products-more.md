# Wonderlands product knowledge — pavers, screens, fences, turf, landscaping, solar

`products-pools.md` covers the priced product catalog Genius quotes most:
pools (Wonderlands concrete, Latham and GlimmerGlass fiberglass), spas,
saunas, tanning ledges, covers and driveway gates. The ranges below are
priced by area, perimeter or project, so their live sources are the
configurator and estimator data files — Genius must quote from those,
never from memory.

| Range | Live source of truth | How it is priced |
|---|---|---|
| Pavers & decking | `src/data/paverData.ts`, `src/data/pebbleTecFinishes.ts`, `src/data/textureLibrary.ts` | Per sq ft (e.g. Coralina porcelain $25/sq ft; concrete deck from $10/sq ft) |
| Screen enclosures | `src/data/screenEnclosureConfigurator.ts` | By size and options, via the enclosure estimator |
| Fencing | `src/data/fenceConfigurator.ts` | By linear foot / perimeter, via the fence estimator |
| Driveway gates | `src/data/drivewayGates.ts` + catalog in `products-pools.md` | Per gate, installed |
| Artificial turf | `src/data/artificialGrassData.ts`, `src/data/artificialGrassConfigurator.ts` | Per sq ft by product |
| Landscaping | `src/data/landscapingData.ts` | Full Yard Makeover $15/sq ft; Luxury $20+/sq ft; Themed Patio by designer |
| Solar | `src/data/solarData.ts`, `src/data/solarHardware.ts`, `src/data/electricityTariffs.ts`, `src/data/floridaSolarJurisdictions.ts`, `src/data/nrelRooftopPotential.ts` | System quote via Solar Genius (see `solar-genius.md`) |
| Pool shapes & finishes | `src/data/poolModelShapes.ts`, `src/data/copingEdgeProfiles.ts`, `src/data/poolData.ts` | Shape templates for the Design Studio; finishes priced per project |

Trade rates Genius may quote (from `src/lib/geniusKnowledge.ts`):

- Pool shell (custom drawn): $250 per sq ft of water
- Concrete deck: from $10 per sq ft
- Coralina porcelain pavers: $25 per sq ft
- Landscaping Full Yard Makeover: $15 per sq ft; Luxury Landscaping: $20+ per sq ft
- Pools and spas include delivery, installation and the product as described
- Financing available; consultations at calendly.com/wonderlandsworlds/30min

Warranties live in `src/lib/quoteDisciplines.ts` (DISCIPLINES) and are included
in the Genius knowledge digest automatically.
