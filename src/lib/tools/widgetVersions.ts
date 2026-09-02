// Version history for every widget on the licensing gallery (/tools2).
//
// Each entry is a curated release of the module: the tag, the date it shipped,
// the product description for THAT version, what changed in it, and the skin
// (palette + typeface) the release was designed in. The gallery renders the
// selected version's skin around the live widget, so choosing an older tab
// shows how the module was presented at the time while still running the
// production build underneath.
//
// The last entry of every list is the current release.
import type { WidgetSkin } from "./widgetSkins";

export interface WidgetVersion {
  /** Release tag, e.g. "v2.4" */
  tag: string;
  /** Short release name */
  name: string;
  /** When the release shipped */
  released: string;
  /** The product description as written for this version */
  description: string;
  /** What this release introduced */
  changes: string[];
  /** Palette and typography this release was designed in */
  skin: WidgetSkin;
}

const v = (
  tag: string,
  name: string,
  released: string,
  description: string,
  changes: string[],
  skin: WidgetSkin,
): WidgetVersion => ({ tag, name, released, description, changes, skin });

export const WIDGET_VERSIONS: Record<string, WidgetVersion[]> = {
  designer: [
    v(
      "v1.0",
      "Single-view shell",
      "2024 · Q2",
      "The first pool designer: one plan-view canvas where the shell outline was drawn as a closed polygon and priced by surface area. Depth was a single number for the whole pool and there was no three-dimensional read.",
      ["Polygon shell drawing at fixed scale", "Flat area-based pricing", "No coping, waterline or deck"],
      { paletteId: "bone", typefaceId: "swiss" },
    ),
    v(
      "v2.0",
      "Dual view",
      "2025 · Q1",
      "The plan board and a real-time WebGL scene became two views of the same geometry, bound at ten pixels per foot. Depth moved to linear anchors — shallow end, transition, deep end — and coping, waterline tile and deck generated themselves from the outline.",
      ["Bidirectional 2D ↔ 3D geometry sync", "Linear depth anchors with auto walls", "Generated coping, waterline and deck"],
      { paletteId: "poolside", typefaceId: "sora" },
    ),
    v(
      "v3.0",
      "Instrument edition",
      "2026 · current",
      "A dual-view design engine: a real-time 3D scene and a plan board on the same geometry. Stairs, benches, seating contours and interactive lights snap to the shell and re-price as they move, textures hold a true one-foot UV across every surface, and the console reports the cost of each trade as it is drawn.",
      ["Snap-to-wall lighting with gradient presets", "Spline seating and auto-calculating stairs", "1 ft UV texture parity across all surfaces", "Live per-trade cost console"],
      { paletteId: "house", typefaceId: "sora" },
    ),
  ],
  "site-board": [
    v(
      "v1.0",
      "Boundary sketch",
      "2024 · Q3",
      "A single-layer boundary tracer. The property line was drawn as one polygon on a fixed grid and reported its own area; anything else on the lot was noted by hand.",
      ["One polygon, one area", "Fixed grid, no zoom", "No dimension callouts"],
      { paletteId: "bone", typefaceId: "oldstyle" },
    ),
    v(
      "v2.0",
      "Layered site",
      "2025 · Q2",
      "Boundaries, residence, hardscape, pool and easements became separate styled layers on a 14.4 px/ft sheet, each with vertex dragging, perpendicular dimension labels and its own area line in the impervious-coverage table.",
      ["Layered polygons with per-layer styling", "Vertex editing and dimension callouts", "Impervious-surface totals"],
      { paletteId: "atelier", typefaceId: "oldstyle" },
    ),
    v(
      "v3.0",
      "Architect curvature",
      "2026 · current",
      "The architectural site board used for permit drawings, now with true curvature: circular arcs by radius or bulge, tangent fillets, tensioned splines and draggable handles, plus automatic cropping so pools, spas, ledges and turf cut their footprint out of the deck. Every polygon reports net area and feeds the plan set.",
      ["Circular arcs, fillets and tensioned splines", "Automatic overlap cropping with net areas", "Cursor-anchored point insertion on any edge", "Calibratable survey underlay"],
      { paletteId: "house", typefaceId: "editorial" },
    ),
  ],
  blueprint: [
    v(
      "v1.0",
      "Static sheet",
      "2024 · Q4",
      "A printable title sheet with fixed blocks. Project data was typed into a form and rendered onto one page at print scale; changes meant re-entering the form.",
      ["Single title sheet", "Form-driven data entry", "Print at true scale"],
      { paletteId: "bone", typefaceId: "oldstyle" },
    ),
    v(
      "v2.0",
      "Editable plan set",
      "2025 · Q3",
      "Every information block became editable in place on the sheet itself — title block, engineer data, scope of work, equipment schedule, code references and note libraries — across a multi-sheet template set.",
      ["Inline editing of every block", "Jurisdiction presets and code libraries", "Multi-sheet templates"],
      { paletteId: "atelier", typefaceId: "oldstyle" },
    ),
    v(
      "v3.0",
      "Permit engine",
      "2026 · current",
      "A complete permit plan set generator. Structural and electrical details, equipment schedules, scope tables and signature blocks all edit inline, site geometry arrives straight from the drawing board, and sheets render to print at true scale — what is on screen is what the building department receives.",
      ["One-click import of board geometry", "Structural and electrical detail sheets", "Statutory signature and seal blocks", "True-scale multi-sheet print output"],
      { paletteId: "bone", typefaceId: "editorial" },
    ),
  ],
  import: [
    v(
      "v1.0",
      "Image underlay",
      "2025 · Q1",
      "Raster import only: a JPG or PNG of a survey was placed behind the board as a backdrop and scaled by eye.",
      ["Raster underlay", "Manual scaling", "No vector support"],
      { paletteId: "bone", typefaceId: "swiss" },
    ),
    v(
      "v2.0",
      "Calibrated tracing",
      "2025 · Q4",
      "PDF pages joined the raster path, and a two-point calibration set a known scale so anything traced over the underlay measured correctly from the first line.",
      ["PDF page rendering at high DPI", "Two-point scale calibration", "Underlay opacity and lock controls"],
      { paletteId: "atelier", typefaceId: "swiss" },
    ),
    v(
      "v3.0",
      "Vector pipeline",
      "2026 · current",
      "The ingestion engine behind the builder. PDF, JPG and PNG land as a calibratable underlay; DXF (AutoCAD) and SVG geometry land as real, vertex-editable site polygons with CAD layers mapped onto our layers. Nothing arrives as a flat picture — everything imported stays drawable, and it all runs client-side.",
      ["DXF and SVG vector import with layer mapping", "Imported geometry stays vertex-editable", "Survey metadata autofill into the plan set", "Entirely client-side — nothing leaves the session"],
      { paletteId: "house", typefaceId: "swiss" },
    ),
  ],
  signature: [
    v(
      "v1.0",
      "Drawn mark",
      "2025 · Q1",
      "A canvas the signer drew on with a mouse or finger, exported as a flat image and pasted into the document.",
      ["Draw-only capture", "Flat raster export", "No document binding"],
      { paletteId: "bone", typefaceId: "swiss" },
    ),
    v(
      "v2.0",
      "Multi-modal capture",
      "2025 · Q4",
      "Signers could draw, type in one of several script faces or upload an image, and every route normalised to a single transparent PNG suitable for sheet embedding.",
      ["Draw, type or upload", "Script face selection", "Transparent PNG normalisation"],
      { paletteId: "atelier", typefaceId: "oldstyle" },
    ),
    v(
      "v3.0",
      "Statutory edition",
      "2026 · current",
      "A signature module built for Florida statutory electronic signatures on construction documents. The signature is bound to a canonical payload of the drawings, title block and notes through a SHA-256 authentication code, so any later edit invalidates it, and separate engineer, contractor and owner blocks carry the statutory seal statement.",
      ["SHA-256 authentication code over the document payload", "Separate engineer, contractor and owner blocks", "Statutory seal statement rendered with the mark"],
      { paletteId: "house", typefaceId: "editorial" },
    ),
  ],
  enclosure: [
    v(
      "v1.0",
      "Linear estimate",
      "2024 · Q4",
      "A form-based estimator: enter perimeter and height, receive a screen enclosure price. No drawing, no door logic.",
      ["Perimeter and height inputs", "Single turnkey figure", "No geometry"],
      { paletteId: "bone", typefaceId: "swiss" },
    ),
    v(
      "v2.0",
      "Drawn footprint",
      "2025 · Q3",
      "The footprint moved onto a scaled grid with house-attached wall segments, and doors became fixed-width bays placed on a run rather than a painted length of spline.",
      ["Vertex drawing with attached walls", "Fixed-size self-closing door bays", "Centred presets for common shapes"],
      { paletteId: "poolside", typefaceId: "swiss" },
    ),
    v(
      "v3.0",
      "Code-aware studio",
      "2026 · current",
      "A code-aware screen enclosure tool. Draw the footprint, place door bays, then configure screen fabric, frame gauge, roof style and wind-load requirement; the configurator returns a turnkey number and a passcode-gated contractor cost view of the same structure, itemised into the cart and the proposal.",
      ["Fabric, gauge, roof style and wind-load options", "Turnkey and contractor cost views", "Full itemisation into cart and quote"],
      { paletteId: "house", typefaceId: "sora" },
    ),
  ],
  fence: [
    v(
      "v1.0",
      "Footage form",
      "2024 · Q4",
      "Linear feet in, price out. Gates were an add-on count with no position on the run.",
      ["Linear-foot pricing", "Gate count only", "No layout"],
      { paletteId: "bone", typefaceId: "swiss" },
    ),
    v(
      "v2.0",
      "Segment gates",
      "2025 · Q3",
      "The fence line moved onto a one-foot grid where individual segments were flagged as gates, and the tool derived footage, posts, panel breaks and gate hardware from the drawn run.",
      ["Segment-level gate flagging", "Automatic post and panel takeoff", "Persistent layout between sessions"],
      { paletteId: "terracotta", typefaceId: "swiss" },
    ),
    v(
      "v3.0",
      "Barrier compliance",
      "2026 · current",
      "Draw the fence line, flag gates, and the tool prices to Florida pool-barrier rules by height and style — including self-latching gate requirements — returning material and installation as separate lines that carry into the estimate and the permit set.",
      ["Height and style pricing by barrier compliance", "Self-latching gate hardware rules", "Separate material and installation lines"],
      { paletteId: "house", typefaceId: "sora" },
    ),
  ],
  grass: [
    v(
      "v1.0",
      "Rectangle takeoff",
      "2025 · Q1",
      "Turf priced from a rectangle: width by length, one product, one square-foot rate.",
      ["Rectangular areas only", "Single product rate", "No spline geometry"],
      { paletteId: "bone", typefaceId: "swiss" },
    ),
    v(
      "v2.0",
      "Free-hand regions",
      "2025 · Q4",
      "Polygon and spline turf areas of any silhouette, each with its own square-foot takeoff and its own product, re-pricing as the specification changed.",
      ["Polygon and spline areas", "Independent product per region", "Live per-square-foot pricing"],
      { paletteId: "poolside", typefaceId: "sora" },
    ),
    v(
      "v3.0",
      "Contractor model",
      "2026 · current",
      "Polygon and spline turf drawing for patios and full yards, with per-area takeoff, an armed product cursor for click-to-apply specification, and a passcode-gated contractor view exposing the Florida general-contractor cost model — infill, base and labour broken out — behind the retail figure.",
      ["Armed product cursor for click-to-apply", "Passcode-gated contractor cost model", "Infill, base and labour broken out"],
      { paletteId: "house", typefaceId: "sora" },
    ),
  ],
  studio: [
    v(
      "v1.0",
      "Catalogue picker",
      "2024 · Q3",
      "A product list with a running total. Categories were flat, options were checkboxes, and nothing survived a reload.",
      ["Flat category list", "Checkbox options", "No persistence"],
      { paletteId: "bone", typefaceId: "swiss" },
    ),
    v(
      "v2.0",
      "Option engine",
      "2025 · Q2",
      "Category navigation, an option engine per product type and unit-priced trades joined the catalogue, with real-time autosave to local storage so a reload returned the configuration.",
      ["Per-category option engine", "Unit-priced trades", "Real-time autosave"],
      { paletteId: "poolside", typefaceId: "sora" },
    ),
    v(
      "v3.0",
      "Platform",
      "2026 · current",
      "The full configuration platform that hosts the other modules: fourteen categories, the option engine, unit-priced trades and one running total across the whole build. Work autosaves continuously and the viewport is restored, so a reload returns the configuration exactly as it was left, ready for handoff into the quote and document engines.",
      ["Fourteen categories in one surface", "Viewport and cart restoration", "Handoff into quote and document engines"],
      { paletteId: "house", typefaceId: "sora" },
    ),
  ],
  search: [
    v(
      "v1.0",
      "Name match",
      "2024 · Q4",
      "A field that matched product names only, returning a plain list of links.",
      ["Name-only matching", "Plain result list", "No filters"],
      { paletteId: "bone", typefaceId: "monoconsole" },
    ),
    v(
      "v2.0",
      "Indexed catalogue",
      "2025 · Q3",
      "One index across products, categories, multipliers and specifications, with filter chips and category-scoped routing straight into the studio.",
      ["Single index over the whole catalogue", "Filter chips with category routing", "Inline results with deep links"],
      { paletteId: "graphite", typefaceId: "monoconsole" },
    ),
    v(
      "v3.0",
      "Two presentations",
      "2026 · current",
      "A catalogue-wide search engine shipping in two presentations from the same index: the full field used on the main surface and a slim field docked inside the studio chrome. Query state is cached between sessions and results link strictly to the section banners they belong to.",
      ["Full and slim presentation variants", "Cached query state between sessions", "Strict section-banner routing"],
      { paletteId: "house", typefaceId: "sora" },
    ),
  ],
  features: [
    v(
      "v1.0",
      "Checkbox list",
      "2024 · Q3",
      "Options as a flat list of checkboxes with a price beside each label — no imagery, no grouping.",
      ["Flat checkbox list", "Text-only options", "Single group"],
      { paletteId: "bone", typefaceId: "swiss" },
    ),
    v(
      "v2.0",
      "Typed groups",
      "2025 · Q2",
      "Options grouped by product type with counters, toggles and selects, each writing into a single extras record consumed by the cart.",
      ["Per-product-type option sets", "Counters, toggles and selects", "One extras record into the cart"],
      { paletteId: "poolside", typefaceId: "sora" },
    ),
    v(
      "v3.0",
      "Tile carousels",
      "2026 · current",
      "The option engine as outlined image tiles: every feature carries its Studio image, title and price, carousels retract as another opens, and selecting a feature adds its parent product automatically so nothing is priced in isolation.",
      ["Outlined image tiles with Studio pricing", "Auto-retracting accordions", "Parent product added automatically"],
      { paletteId: "house", typefaceId: "editorial" },
    ),
  ],
  calculators: [
    v(
      "v1.0",
      "Volume only",
      "2024 · Q2",
      "A pool volume calculator: dimensions in, gallons out.",
      ["Gallons from dimensions", "No equipment sizing", "No inline variants"],
      { paletteId: "bone", typefaceId: "monoconsole" },
    ),
    v(
      "v2.0",
      "Equipment sizing",
      "2025 · Q1",
      "Heater sizing by volume, climate and desired rise joined the set, returning a specific unit rather than a range.",
      ["Heater sizing by volume and rise", "Unit recommendation, not a range", "Shared unit conversions"],
      { paletteId: "graphite", typefaceId: "monoconsole" },
    ),
    v(
      "v3.0",
      "Inline instruments",
      "2026 · current",
      "The calculator set as inline instruments: pool volume and turnover, heater sizing that names the unit, and screen and fence estimators that answer inside the search field itself and hand their result to the configurator.",
      ["Inline screen and fence estimators", "Results handed to the configurator", "Turnover and chemistry read-outs"],
      { paletteId: "house", typefaceId: "sora" },
    ),
  ],
  quote: [
    v(
      "v1.0",
      "PDF export",
      "2024 · Q4",
      "A proposal generator that produced a PDF download from a fixed template. Editing meant regenerating the file.",
      ["Fixed template", "PDF download", "No overrides"],
      { paletteId: "bone", typefaceId: "oldstyle" },
    ),
    v(
      "v2.0",
      "Survey compilation",
      "2025 · Q3",
      "A guided site survey that compiled every configured component and feature into an itemised proposal, suppressing empty sections and summing features against their parent product.",
      ["Guided survey flow", "Itemised component and feature summation", "Empty sections suppressed"],
      { paletteId: "atelier", typefaceId: "oldstyle" },
    ),
    v(
      "v3.0",
      "Proposal atelier",
      "2026 · current",
      "The proposal engine: authorised users override wording or pricing behind a passcode, saving opens the print dialog directly with the live document, invoices and Stripe checkout follow from the same record, and every customer keeps a gallery of previous proposals to reload.",
      ["Passcode-gated wording and price overrides", "Print dialog instead of a flat export", "Invoice and Stripe handoff", "Per-customer proposal gallery"],
      { paletteId: "bone", typefaceId: "editorial" },
    ),
  ],
  solar: [
    v(
      "v1.0",
      "Array estimator",
      "2025 · Q2",
      "System size chosen from three packages, priced per package, with production estimated from a state average.",
      ["Three fixed packages", "State-average production", "No roof geometry"],
      { paletteId: "bone", typefaceId: "swiss" },
    ),
    v(
      "v2.0",
      "Roof capture",
      "2025 · Q4",
      "Address search over high-resolution aerial imagery, click-to-capture roof planes with editable outlines, and per-face sun exposure scored from azimuth, pitch, latitude and shade.",
      ["Aerial imagery with game-like camera", "Click-to-capture editable roof faces", "Per-face sun exposure scoring"],
      { paletteId: "solstice", typefaceId: "swiss" },
    ),
    v(
      "v3.0",
      "Total Solar Calculator",
      "2026 · current",
      "The complete solar instrument: roof planes captured from the aerial and scored for exposure, modules fitted to what the roof really holds, racking chosen by roof covering, and one console carrying the house inputs, the system headline and the production telemetry together — above an astronomical sky console with a true sun path, moon phase, visible planets and a yearly simulation valued against the local electricity tariff.",
      ["House inputs, headline and telemetry as one console", "Astronomical sky console with moon and planets", "Yearly kWh simulation priced by country tariff", "Contractor sheet with string, conduit and anchor takeoff"],
      { paletteId: "solstice", typefaceId: "sora" },
    ),
  ],
  planting: [
    v(
      "v1.0",
      "Plant list",
      "2025 · Q2",
      "Landscaping priced from a quantity list: so many palms, so many shrubs, so many yards of mulch.",
      ["Quantity-based pricing", "No plan geometry", "No plant rendering"],
      { paletteId: "bone", typefaceId: "swiss" },
    ),
    v(
      "v2.0",
      "Bed drawing",
      "2025 · Q4",
      "Planting beds drawn as polygons with mulch and edging derived from area and perimeter, and plants dropped as labelled markers.",
      ["Polygon beds with area takeoff", "Mulch and edging from geometry", "Labelled plant markers"],
      { paletteId: "terracotta", typefaceId: "sora" },
    ),
    v(
      "v3.0",
      "Planting studio",
      "2026 · current",
      "A botanical planting studio: beds, hedges and specimens drawn to scale with each plant rendered at its true canopy spread and in flower, sized by container, and priced from the landscaping catalogue — compatible with the global design board so a planting plan merges into the whole-property take-off.",
      ["True canopy spread and flowering render", "Hedges by linear foot, specimens by container", "Merges into the global design take-off"],
      { paletteId: "terracotta", typefaceId: "editorial" },
    ),
  ],
  "global-board": [
    v(
      "v1.0",
      "Trade boards",
      "2025 · Q3",
      "Each trade drew on its own board and produced its own estimate; combining a project meant adding the numbers by hand.",
      ["Separate board per trade", "Manual project totals", "No shared geometry"],
      { paletteId: "bone", typefaceId: "swiss" },
    ),
    v(
      "v2.0",
      "Unified canvas",
      "2025 · Q4",
      "One canvas carrying every trade layer — site, pool, deck, enclosure, fence, turf, planting and solar — with a shared camera altitude and a single running estimate.",
      ["All trade layers on one canvas", "Shared camera altitude across boards", "Single running estimate"],
      { paletteId: "graphite", typefaceId: "sora" },
    ),
    v(
      "v3.0",
      "Global design board",
      "2026 · current",
      "The one-stop board for pricing an entire property. Every trade brings its own splines, options and features priced exactly as in the Studio and the FLIP book, overlapping bodies crop automatically so decks open around water and turf, the project dossier aggregates take-off, specifications, process and payment schedule for all trades at once, and the whole plan loads into the permit set in one click.",
      ["Consolidated trades and elements rail", "Automatic overlap cropping across trades", "Project-wide dossier and payment schedule", "One-click load into the blueprint plan set"],
      { paletteId: "house", typefaceId: "editorial" },
    ),
  ],
};

export const versionsFor = (id: string): WidgetVersion[] => WIDGET_VERSIONS[id] ?? [];

/** The current (last) release of a widget. */
export const currentVersion = (id: string): WidgetVersion | undefined => {
  const list = versionsFor(id);
  return list[list.length - 1];
};
