# Product Suites

Dedicated, per-category configuration pages that reuse one shell.

| File | What it does |
| --- | --- |
| `ProductSuite.tsx` | The shell: masthead, model dropdown + model carousel, selected-model plate, feature configurator, live price breakdown, cart sync, quote tool and the category's drawing board (`FlipEditorBoard`, full screen). |
| `EditorialFeatureConfigurator.tsx` | The additional-features mechanism lifted out of the fiberglass pool card: an Accordion (dropdown) per feature whose content is a Carousel of option plates. Also exports `sumFeatureExtras` and `featureExtrasBreakdown` so cart/quote payloads use one pricing path. |

## Where the data comes from

Nothing is duplicated here.

- Models: `src/data/saunaData.ts`, `src/data/gilmerSpas.ts`, `src/data/poolData.ts` (`tanningLedges`).
- Options and prices: `src/config/productFeatures.ts` (`PRODUCT_FEATURES` per `ProductType`), summed with `calculateFeaturePrice`.
- Drawing board: `src/components/flip/FlipEditorBoard.tsx` already maps each discipline to its board (Sauna Pad Board, Spa Plan Board, Sun Shelf Board).

## Pages

- `/suites/saunas` → `src/pages/suites/SaunaSuite.tsx`
- `/suites/spas` → `src/pages/suites/SpaSuite.tsx`
- `/suites/tanning-ledges` → `src/pages/suites/TanningLedgeSuite.tsx`

## Adding a category

1. Make sure the category has an entry in `PRODUCT_FEATURES` and in `BOARDS` (FlipEditorBoard).
2. Add a thin page under `src/pages/suites/` that maps the existing catalogue array to `SuiteModel[]`.
3. Register the route in `src/App.tsx`.

## Notes

- Model choice and every option selection are stored through `usePersistentState`, so a reload lands the reader on the same configuration (global UI cache rule).
- Prices always print "delivery, installation and the product as described"; never re-derive pricing locally.
