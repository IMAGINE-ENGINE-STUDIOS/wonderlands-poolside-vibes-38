# Sauna-Specific Added Features

Saunas currently inherit the pool feature set in Wonderlands Studio (Pool Finish, Pool Liner, Pool Tiles, Spa Jets, Add a Spa, Automatic Cover, Tanning Ledge, Deck Pavers, Screen Enclosure, Concrete Construction, plus the pool "Included at no extra cost" block and the Pool Heater section). None of that applies to a sauna. Replace it with a comprehensive sauna option set.

## New sauna option set

Wood & interior
- Interior wood upgrade: Nordic Spruce (included), Western Red Cedar +$1,800, Thermo-Aspen +$2,400, Thermo-Alder +$2,900
- Exterior finish/treatment: Natural clear coat (included), Charred Shou Sugi Ban +$2,200, Black stain +$1,200
- Backrests & headrests: +$450
- Upgraded bench layout (L-bench / two-tier): +$1,600

Heater & heat source
- Heater type/size: 6 kW electric (included on 4P), 8 kW electric +$900, 9 kW electric +$1,400, Harvia wood-burning +$2,600, Huum electric with app control +$3,200 (all heater prices carry the site-wide 50% install/permit uplift already applied to heaters)
- Heater guard rail: +$350
- Extra sauna stones (premium vulcanic set): +$260
- Digital/Wi-Fi control panel with scheduling: +$1,150

Steam & aroma
- Löyly bucket & ladle set (cedar): +$180
- Aroma/essential-oil dispenser: +$220
- Hygrometer & thermometer set: +$140
- 24 h sand timer: +$90

Lighting & audio
- Lighting: standard interior LED (included), Chromotherapy LED with remote +$1,250, fiber-optic star ceiling +$1,900
- Bluetooth audio with moisture-rated speakers: +$980
- Backlit salt-brick wall panel: +$1,650

Glass & doors
- Door glass: bronze tempered (included), full-glass clear door +$1,400, panoramic rear window +$2,300

Cold therapy & wellness add-ons
- Cold plunge tub with chiller: +$9,800
- Outdoor shower column: +$1,450
- Changing bench & towel/robe hooks: +$380

Site, base & delivery
- Base preparation: existing slab (included), paver pad by area (uses paver rates per sq ft), new concrete slab $12/sq ft
- Sauna deck/surround pavers: area input at selected paver rate
- Electrical run & dedicated 240 V breaker (up to 50 ft): +$1,750
- Crane/tight-access placement: +$1,900
- Roof cover / shade structure over sauna: +$3,400
- Extended warranty to 7 years: +$1,100
- Annual maintenance package (first year): +$650

Included at no extra cost (replaces the pool list for saunas)
- Kiln-dried wood construction and stainless hardware
- Heater, sauna stones and control unit
- Interior LED lighting
- Ergonomic benches
- Ventilation system
- Delivery, permits and professional installation
- Structural warranty per model

## Behaviour

- Selecting a sauna in the Studio shows only the sauna options above; all pool blocks (finish, liner, tiles, jets, add-a-spa, tanning ledge, automatic cover, concrete construction, pool heater section) are hidden.
- Every selected sauna option flows into the total price, the shopping list (editable, swappable, removable like other categories) and the quote, with the sauna-specific "Included" list instead of pool inclusions.
- The main-page Sauna product card offers the same option set so the card and the Studio stay in sync.

## Technical notes

- `src/config/productFeatures.ts`: rewrite the `'sauna'` entry in `PRODUCT_FEATURES` with the options above using existing feature types (`selection`, `boolean`, `quantity`, `area`); reuse `paverOptions` for the surround/base area feature. Heater options priced with the same 50% uplift convention used elsewhere.
- `src/pages/WonderlandsStudio.tsx`: stop treating `sauna` as a full pool product. Keep it out of `WATER_PRODUCT_TYPES` (or add an explicit `isPoolLikeProduct` check) so the pool configuration branch, the pool "Included" block and the trailing Pool Heater section skip saunas, and route saunas through `DynamicFeatureRenderer` with `productType="sauna"` plus a sauna inclusions block.
- Quote/cart: sauna extras already flow through `buildCurrentExtras` and the quote extras breakdown; add `sauna` to the category-aware inclusions map in `src/components/SurveyQuoteTool.tsx` so the quote shows sauna inclusions and installation timing rather than pool policies.
- `src/components/SaunaProductCard.tsx`: replace the pool-derived options (heater/jets/waterline/deck pavers/screen enclosure) with the sauna feature config so pricing matches the Studio.
