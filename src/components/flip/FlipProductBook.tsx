import * as React from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { resolveProductGallery } from "@/lib/flipProductGallery";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, Check, Plus, ArrowUpRight, Maximize2 } from "lucide-react";
import { formatEntryPrice, type ConsoleEntry } from "./flipConsoleData";
import { useOptionalShoppingCart } from "@/components/ShoppingCartProvider";
import { mergeStudioGroups, type StudioGroup, type StudioOption } from "@/lib/flipStudioFeatures";
import { isTurnkeyScopeLine } from "@/data/turnkeyScope";
import { getProjectPipeline } from "@/data/projectPipeline";
import FlipProjectPipeline from "./FlipProjectPipeline";

import FlipToolWidget from "./FlipToolWidget";
import { useFlipLocked } from "./flipBoardStore";
import { pushSpread } from "./FlipSpread";
import FlipCustomerLetter from "./FlipCustomerLetter";

/**
 * FLIP — Product dossier.
 * A small book opened from the "More" control on any model. Every product gets
 * its own short edition: plate, dimensions, features, brand note, the design
 * tool for its discipline, and an order page.
 */

export type ProductBookCategory = {
  id: string;
  label: string;
  tagline?: string;
  description?: string;
  notes?: string[];
  images?: string[];
  /** Other models of this discipline — only same-brand, same-series plates are used. */
  siblings?: { name: string; brand?: string; image?: string }[];
};

export type ProductBookOptionGroup = { title: string; note: string; options: string[] };

type Props = {
  entry: ConsoleEntry;
  category: ProductBookCategory;
  groups?: ProductBookOptionGroup[];
  onClose: () => void;
  /** Rendered inside the magazine flip rather than as a full-screen overlay. */
  inline?: boolean;
  /**
   * Walking a list inside one pop-up: when the reader is on the final page,
   * Next continues into the following product instead of dead-ending.
   * Symmetrically, Previous on the first page steps back one product.
   */
  onNextEntry?: () => void;
  onPrevEntry?: () => void;
};

/** Design tool per discipline — the widget the reader is sent to. */
const TOOLS: Record<string, { name: string; note: string; to: string }> = {
  pools: { name: "Pool Design Studio", note: "Draw the shell in 2D, then read it in 3D with depth, coping and deck.", to: "/design-studio" },
  spas: { name: "Pool & Spa Studio", note: "Set the spa against the pool — spillover, raised beam, jets.", to: "/design-studio" },
  "tanning-ledges": { name: "Pool Design Studio", note: "Place the sun shelf and grade its depth on the plan.", to: "/design-studio" },
  saunas: { name: "Sauna Configurator", note: "Cabin, heater, glass and site pad — priced as you go.", to: "/wonderlands-studio?category=saunas" },
  pavers: { name: "Hardscape Board", note: "Lay the field pattern and border, measured by square foot.", to: "/wonderlands-studio?category=pavers" },
  "artificial-grass": { name: "Turf Drawing Board", note: "Trace the lawn area and read seams, base and cost.", to: "/wonderlands-studio?category=artificial-grass" },
  landscaping: { name: "Landscape Planner", note: "Canopy, beds and irrigation drawn to the property.", to: "/landscaping" },
  "screen-enclosures": { name: "Enclosure Drawing Board", note: "Mansard or gable, engineered to Florida wind load.", to: "/wonderlands-studio?category=screen-enclosures" },
  "patio-fencing": { name: "Fence Configurator", note: "Runs, gates and self-latching pool doors to code.", to: "/wonderlands-studio?category=patio-fencing" },
  lanai: { name: "Lanai Planner", note: "Projection, roof and comfort package.", to: "/wonderlands-studio?category=lanai" },
  "driveway-gates": { name: "Gate Configurator", note: "Operation, automation and infill pattern.", to: "/wonderlands-studio?category=driveway-gates" },
  covers: { name: "Cover Selector", note: "Track system and fabric, sized to the shell.", to: "/wonderlands-studio?category=covers" },
  solar: { name: "Solar Planner", note: "Array size, battery and pool heating priced against the roof.", to: "/wonderlands-studio?category=solar" },
  finishes: { name: "Finish Visualiser", note: "See the grade and accent against your water.", to: "/design-studio" },
  liners: { name: "Liner Visualiser", note: "Print and waterline border, matched to the shell.", to: "/design-studio" },
};

const BRAND_NOTES: Record<string, string> = {
  Latham: "Latham is North America's largest manufacturer of engineered fiberglass shells — hand-laid composite, vinyl-ester barrier coat, and a colour-stable gelcoat surface backed by a lifetime structural warranty.",
  GlimmerGlass: "GlimmerGlass shells are finished in a mineral gelcoat with a fine crystalline sparkle, the only line in our catalogue offered in gelcoat.",
  Pentair: "Pentair supplies the mechanical heart — variable speed pumps, cartridge filtration, heat pumps and app-based automation, specified for quiet, low-draw operation.",
  Belgard: "Belgard hardscape is manufactured to tight dimensional tolerance, laid on a compacted limerock base with polymeric joints for a surface that stays true for decades.",
  Harvia: "Harvia has built sauna heat in Finland since 1950 — steel-cased heaters, stone baskets and cabins designed around convection rather than blast heat.",
  "Almost Heaven": "Almost Heaven builds barrel and cabin saunas in North American cedar and thermally treated spruce, pre-cut and pre-fitted for delivery-day assembly.",
  Wonderlands: "Wonderlands World builds, sets and warranties the installation in-house — one contract from field measurement through final handover.",
};

const CATEGORY_MAKER_NOTES: Record<string, string> = {
  pavers:
    "Wonderlands World treats hardscape as construction, not decoration: the deck is measured from the drawing board, corrected for every pool, spa, planter, turf island and non-paved zone, then built with the base, slope, joints and edge restraints required for the selected material.",
  "artificial-grass":
    "Wonderlands World builds turf from the base up: drainage, compaction, seam direction, infill and edging are coordinated so the lawn reads natural and survives Florida rain without soft spots.",
  landscaping:
    "Wonderlands World composes planting from canopy, privacy, texture, irrigation and maintenance access, so the garden supports the architecture instead of reading like a loose plant list.",
  "screen-enclosures":
    "Wonderlands World coordinates enclosure layout, engineering, permit details, doors, gutters and anchoring as one Florida-ready system matched to the deck and house.",
  "patio-fencing":
    "Wonderlands World specifies each aluminum fence run by height, gate swing, latch position, grade and pool-barrier compliance, then installs it as part of the complete outdoor plan.",
  lanai:
    "Wonderlands World plans the lanai as an outdoor room: roof, drainage, fans, lighting, screening and finish details are drawn before the structure is ordered.",
  "driveway-gates":
    "Wonderlands World designs driveway gates around arrival, safety, automation, post depth and access control, with the operator and conduit planned before installation begins.",
  covers:
    "Wonderlands World sizes every cover to the vessel and coping detail, coordinating tracks, housing, drainage and controls before the cover system is ordered.",
  finishes:
    "Wonderlands World presents finish choices as water-colour decisions, viewed against the selected coping, waterline and deck so the final surface educates the whole design.",
  liners:
    "Wonderlands World selects liners by print scale, waterline border, shell geometry and lighting so the chosen interior reads correctly once filled.",
};

const PAVERS_WORK_MESSAGE = [
  "Our paver work begins with the drawing, not with a pallet. The deck is measured as a true paved area, and the calculator removes every zone that should not receive pavers: pool water, spas, tanning ledges, artificial grass, planters, gravel, sand, dirt, beach entries, lagoon edges, lake areas, planting beds and any object that belongs to the landscape rather than the walking surface.",
  "Once the net area is confirmed, Wonderlands World designs the field pattern around how the patio will be lived in. Large terraces may need calmer ashlar or French pattern; tighter paths may need running bond; driveways may need herringbone for strength. Borders, soldier courses and contrast bands are used to organize the space into outdoor rooms, hide cuts away from sightlines and frame the pool or garden with intention.",
  "The base is part of the product. Installation is included in the paver price, while the structural base is calculated from the same deck area: concrete is priced by the square foot, and crushed stone is converted from square feet into tons using the compacted-depth formula in the studio. That means the quote explains what is under the surface, not only what the customer sees on top.",
  "Before laying begins, the crew establishes fall away from the house, checks thresholds, plans drains and confirms where water will move during Florida rain. Units are laid to the selected pattern, locked with polymeric sand where specified, restrained at the edges and cleaned so the finished deck reads level, intentional and durable. If a repair is ever needed, individual units can be lifted and reset rather than cutting into a slab.",
];

const deliveryLineFor = (categoryId: string, isSurface: boolean) => {
  if (categoryId === "pavers") return "Pavers supplied and installed; base material calculated from the drawn deck area.";
  if (categoryId === "artificial-grass") return "Turf supplied and installed; base, seams and drainage sized from the drawn lawn area.";
  if (categoryId === "finishes") return "Finish supplied and installed as the selected interior surface scope.";
  if (categoryId === "liners") return "Liner supplied and installed as the selected interior print and border scope.";
  return isSurface ? "Supplied & installed by our crews" : "Turnkey — set at your address";
};

const includedLineFor = (categoryId: string) => {
  if (categoryId === "pavers") return "Product, installation, pattern layout and measured-area takeoff; base material priced as configured.";
  if (categoryId === "artificial-grass") return "Product, installation, seam layout, edging and measured-area takeoff.";
  if (categoryId === "finishes") return "Selected finish material and installation exactly as described for the vessel surface.";
  if (categoryId === "liners") return "Selected liner print, border scope and installation exactly as described.";
  return "Delivery, installation and the product exactly as described — one contract, our own crews.";
};

const standardFeatureLinesFor = (categoryId: string, notes: string[] = []) => {
  const clean = notes.filter(Boolean);
  if (categoryId === "pavers") {
    return [...clean, "Net paved area measured from the drawing board", "Installation included in the paver square-foot price", "Concrete or crushed-stone base priced from deck area"];
  }
  if (categoryId === "artificial-grass") {
    return [...clean, "Net turf area measured from the drawing board", "Drainage base and seam direction", "Installed edging and infill scope"];
  }
  if (categoryId === "finishes") {
    return [...clean, "Surface sample selected against coping and waterline", "Installed interior finish scope"];
  }
  if (categoryId === "liners") {
    return [...clean, "Selected liner field print", "Waterline border detail", "Measured installation scope"];
  }
  if (["pools", "concrete-pools", "spas", "tanning-ledges"].includes(categoryId)) {
    return [...clean, "Permit drawings", "Warranty registration"];
  }
  return clean.length ? clean : ["Field measurement", "Configured installation", "Warranty registration"];
};

const PaversWorkMessage: React.FC<{ entryName: string }> = ({ entryName }) => (
  <div className="flex h-full w-full flex-col overflow-hidden p-7 sm:p-9">
    <Eyebrow>Wonderlands hardscape</Eyebrow>
    <h3 className="mt-2 font-serif text-2xl font-light leading-tight">Our work on {entryName}</h3>
    <div className="mt-4 h-px w-14 origin-left bg-foreground/40 animate-rule-draw" />
    <div className="mt-5 grid min-h-0 flex-1 gap-4 sm:grid-cols-2">
      {PAVERS_WORK_MESSAGE.map((paragraph, index) => (
        <p
          key={paragraph}
          className={`font-serif text-[11.5px] leading-relaxed text-foreground/85 ${index === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:leading-[0.8]" : ""}`}
        >
          {paragraph}
        </p>
      ))}
    </div>
    <p className="mt-4 border-t border-border/50 pt-3 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
      Pavers are quoted from the actual drawn deck area — never from a guessed patio allowance.
    </p>
  </div>
);

/** Editorial copy per discipline — the written body of every dossier. */
const STORIES: Record<string, { lede: string; body: string; craft: string; care: string }> = {
  pools: {
    lede: "A shell is a single piece of engineered composite — no seams, no joints, nothing to fail in twenty years of Florida sun.",
    body: "The vessel arrives finished. Hand-laid layers of chopped and woven glass are bonded over a vinyl-ester barrier coat, then faced with a colour-stable gelcoat that carries the light of the water rather than absorbing it. Because the shape is moulded rather than built on site, the curves of the bench, the radius of the steps and the transition into the deep end are identical to the drawing you approve.",
    craft: "Set on a compacted, laser-levelled base with a plumbed and vacuum-tested pit, backfilled in lifts as the water rises so the shell is supported evenly on every face.",
    care: "Non-porous surface — no acid washing, no resurfacing cycle, and a chemical demand materially lower than plaster.",
  },
  spas: {
    lede: "A warm room at the water's edge, engineered to hold temperature while the pool stays cool.",
    body: "The spa is isolated hydraulically from the pool so it can be heated and jetted on its own circuit, then spilled over a weir wall when you want the sound of moving water. Jet placement is set around the seated body — lumbar, calf, and neck — and every port is fed by a dedicated manifold so pressure stays even across the bench.",
    craft: "Raised bond beam or flush to deck, tiled at the waterline and finished to match the pool shell.",
    care: "Insulated cover retains heat between sessions; automation warms the vessel before you arrive.",
  },
  saunas: {
    lede: "Dry heat in solid timber — a cabin that smells of cedar the moment the door closes.",
    body: "Staves are milled from North American cedar or thermally treated spruce, kiln-stabilised so they hold their profile through humidity swings. Benches are through-bolted to the frame rather than nailed, and every board is left unfinished inside: no sealer, no varnish, nothing to release under heat. Convection carries the heat from the stone basket up over the upper bench and back down along the wall.",
    craft: "Pre-cut and pre-fitted, set on a paver or concrete pad with the electrical run terminated and tested on delivery day.",
    care: "Sweep, air out, and oil the exterior every other season. The interior is meant to silver with age.",
  },
  pavers: {
    lede: "The frame around the picture — the surface you actually stand on, laid to stay true.",
    body: "Pattern is chosen for the size of the space: ashlar and French pattern quiet a large field, herringbone tightens a driveway, running bond draws the eye down a walk. Units are set on a compacted limerock base over a screeded bedding course, then locked with polymeric sand so joints resist wash-out and weed intrusion.",
    craft: "Perimeter restrained with a soldier course or hidden edge; drainage falls set away from the house before a single unit is laid.",
    care: "Rinse seasonally, re-sand joints as needed, and lift and reset individual units instead of cutting a slab.",
  },
  solar: {
    lede: "The roof pays for the water below it — generation, storage and heat on one contract.",
    body: "Arrays are sized from a shade study of the actual roof planes, not from a rule of thumb: azimuth, pitch, tree cover and the household's real consumption set the kilowatts. All-black monocrystalline modules are set flush to the tile on hurricane-rated mounts, and a hybrid inverter leaves the system ready for storage whether or not a battery is ordered on day one.",
    craft: "County permit, utility interconnection and final inspection are handled by us; conduit is run concealed and terminated at a labelled panel.",
    care: "Rinse the modules after a dry dust season and read production in the app. Panels carry a 25-year performance warranty.",
  },
  "artificial-grass": {
    lede: "Permanently green, drainable, and cool enough to walk on barefoot.",
    body: "Blades are extruded in multiple tones with a thatch layer beneath, so the lawn reads as grass rather than carpet from every angle. A perforated backing sits over a compacted, free-draining base — water leaves the surface as fast as it arrives, which matters in a summer storm season.",
    craft: "Seams are glued and sand-infilled, then brushed against the nap so joins disappear. Perimeters are nailed or tucked to a paver edge.",
    care: "Cross-brush twice a year and rinse. No mowing, no irrigation, no fertiliser.",
  },
  landscaping: {
    lede: "Mass, height and shadow — the planting that makes the hardscape look inevitable.",
    body: "Specimen palms and shade trees establish the ceiling; hedging sets the walls; beds of ornamental grasses and flowering shrubs carry seasonal movement at eye level. Species are selected for Florida heat, salt drift and the actual light your property receives, not for a catalogue photograph.",
    craft: "Drip lines and spray zones are run before mulch, on a smart controller that adjusts to rainfall.",
    care: "Seasonal prune and mulch top-up. Established beds need a fraction of the water of turf.",
  },
  "screen-enclosures": {
    lede: "Open air without the insects — engineered to Florida wind load and signed by an engineer.",
    body: "Extruded aluminium uprights are anchored into the deck and tied through a beam, with the roof profile chosen for span and shade: mansard for a soft line, gable for height, hip to follow a roofline. Screen mesh is specified by what you're keeping out — standard, no-see-um, or pet-resistant.",
    craft: "Self-latching, self-closing pool door with a kickplate, super gutter tied into the home's drainage.",
    care: "Rinse the frame, replace panels individually, and expect the powder coat to outlast the screen.",
  },
  "patio-fencing": {
    lede: "Pool-code compliant, corrosion resistant, and quiet against a garden.",
    body: "Powder-coated aluminium picket runs are set in core-drilled or set-in-concrete posts, raked where the grade falls so the top line stays level to the eye. Heights are specified against pool barrier code, with self-closing, self-latching gates positioned outside a child's reach.",
    craft: "Panels cut on site to the run; posts plumbed and capped; hardware rated for salt air.",
    care: "Rinse and inspect latch tension annually. No painting, no rust bleed.",
  },
  lanai: {
    lede: "Covered living — the shaded room that extends the house into the yard.",
    body: "Projection is drawn from how the space will actually be used: dining, lounging, or an outdoor kitchen. Insulated panel roofs cut radiant heat and quiet the rain; screen panels keep the volume light. Shingles and fascia are matched to the home so the addition reads as original.",
    craft: "Ledger flashed into the wall, posts on footings, ceiling fans and lighting run before the ceiling closes.",
    care: "Clean gutters seasonally; the panel system is a maintenance-free surface.",
  },
  "driveway-gates": {
    lede: "The first line of the drawing — arrival, stated once and clearly.",
    body: "Operation follows the site: swing where there's depth, slide or cantilever where there isn't. Infill sets the character — vertical picket for transparency, horizontal slat for a contemporary line, solid panel for privacy. Automation is specified with a keypad, intercom and safety loop as standard.",
    craft: "Posts set deep in concrete with conduit pulled before the pour; operators sized to leaf weight.",
    care: "Grease hinges, test safety reverse, and keep the track clear.",
  },
  covers: {
    lede: "One key turn — safety, heat retention and a cleaner pool.",
    body: "An automatic cover rides on a recessed or top track, sized precisely to the shell. Solid vinyl blocks light and stops debris entirely; mesh drains through; solar fabric holds heat overnight. Every system is rated to hold weight, which is the point.",
    craft: "Track set flush at the coping, housing built into the bench or a deck lid.",
    care: "Rinse the fabric, keep the track free of grit, and expect years of daily cycles.",
  },
  "tanning-ledges": {
    lede: "The threshold between deck and depth — shallow water, full sun.",
    body: "A graded shelf holds a few inches of water at the entry and deepens toward the bench, warm within minutes of the sun reaching it. Bubblers animate the surface, an umbrella sleeve casts shade where you'd actually sit, and the finish is matched to the shell so the shelf reads as part of the vessel.",
    craft: "Moulded into the shell or formed with the deck, with the ledge finish and mosaic band chosen together.",
    care: "Same non-porous surface as the shell — rinse and enjoy.",
  },
  finishes: {
    lede: "Surface and light — the single decision that sets the colour of your water.",
    body: "Grade determines depth of tone and the way the surface holds reflection: G2 reads softer and more uniform, G3 carries more mineral sparkle, and gelcoat gives a fine crystalline glint reserved for the GlimmerGlass line. Accents — waterline mosaic, step markers, a spa band — are where the eye actually lands.",
    craft: "Samples are viewed on site, in your light, against your deck material before anything is ordered.",
    care: "Colour-stable and non-porous; no annual resurfacing schedule.",
  },
  liners: {
    lede: "The inner hue — print, border, and the water it produces.",
    body: "Prints run from glass mosaic through porcelain and Italian stone to a single solid tone, each changing how light travels through the water. A waterline border defines the edge; a borderless liner reads as one continuous field. Material is welded to the shape of your shell rather than cut on site.",
    craft: "Measured, welded to pattern, and set with a vacuum draw so every corner is tight.",
    care: "Maintain water chemistry and the surface stays supple for years.",
  },
};

/** A second written paragraph per discipline, so the description leaf reads as an article. */
const EXTRA_BODY: Record<string, string> = {
  pools: "Depth is drawn around use rather than convention: a wide shallow end for standing and conversation, a graded floor for swimming, benches set where the sun falls in the afternoon. Coping, waterline tile and deck are specified as one detail so the transition from lawn to water reads as a single line, and the equipment pad is planned early — pump, filter and heater sited where you will never hear them from the bench.",
  spas: "Because the spa runs on its own circuit, it can be held at temperature through the winter while the pool sits cool, then blended back through the spillover in a single tap. Seating is moulded to the body, the bench height set so shoulders stay under water, and the LED spectrum tuned low enough to keep the night sky visible.",
  saunas: "Heat is a schedule, not a switch: thirty to forty minutes to bring the stones up, then hours of stable convection. Glass is chosen for how much of the garden you want in the room — a porthole, a full door, or a panoramic gable end. Electrical is sized to the heater and terminated on delivery day, so the first session happens the afternoon the cabin lands.",
  pavers: "Colour is read in daylight and again wet, because a paver darkens as it takes water. Borders and soldier courses are used to break a large field into rooms, and cuts are kept off the sightlines — full units at the pool edge, cuts hidden against the house. Levels are set to fall away from the slab before anything is laid.",
  "artificial-grass": "Pile height and density are matched to the traffic: a shorter, denser blade for a play lawn, a longer profile for a garden lawn read from the terrace. Infill weight keeps the blade standing and the surface cool, and the base is graded so a summer downpour is gone in minutes rather than pooling at the edges.",
  solar: "Storage is what turns a solar array into a quiet house: a wall-mounted battery carries the pool pump, refrigeration and lighting through an outage and shifts the afternoon's surplus into the evening. Solar pool heating runs on the same roof but on water rather than wires — glazed collectors plumbed into the existing pump loop add ten to fifteen degrees of comfort with no operating cost at all.",
  landscaping: "Planting is drawn in three layers — canopy, hedge and understorey — so the garden holds shape in every season and screens what you would rather not see. Species are grouped by water demand, which keeps irrigation zones honest and the long-term maintenance low.",
  "screen-enclosures": "Span dictates the section: the wider the room, the heavier the upright and the beam that carries it. Anchors are set into the deck to an engineered schedule, fasteners are stainless, and every panel is sized so a single screen can be replaced without disturbing the frame. Drawings are sealed for permit before fabrication begins.",
  "patio-fencing": "Powder-coated aluminium is used because it does not rust in salt air and does not need painting. Panel heights of four and five feet cover both garden and pool-code applications, posts are set in concrete footings, and every gate is self-closing and self-latching with the latch above reach of a child.",
  lanai: "Insulated roof panels keep the ceiling cool enough to sit under at midday, and the projection is set from the sun path rather than a standard depth. Fans, downlights and outlets are run inside the structure, so nothing is surface-mounted after the fact.",
  "driveway-gates": "Operation is chosen from the geometry of the drive — swing where there is room to arc, slide where there is not. Automation carries safety edges, photo eyes and a battery backup, with keypad, intercom or app entry specified to how the household actually arrives.",
  covers: "The cover is sized to the shell rather than the deck, so the fabric lands on the coping every time. Track systems are recessed where the design allows, and the drive is rated to hold a load — the same detail that makes the cover a safety layer, not only a heat blanket.",
  "tanning-ledges": "Nine inches is the working depth: enough to cool the body, shallow enough for a chair to sit level. Bubblers are plumbed on their own line so they can run without the main returns, and an umbrella sleeve is cast into the shelf at the drawing stage rather than drilled later.",
  finishes: "Grade changes everything about the water: a fine pebble reads deep and still, a glass bead throws light, a quartz surface holds an even tone from end to end. Accent and waterline are selected against the coping and deck in daylight, not from a chip under fluorescent light.",
  liners: "Pattern scale matters more than colour — a small mosaic quiets a large pool, a bold stone print carries a compact one. Material is welded to the measured shape of the shell, so corners are tight and the print stays aligned along the waterline.",
};

const FALLBACK_EXTRA =
  "Specification happens on site: measurements, levels, access and the way you intend to use the space. From there the drawing, the permit set and the price are produced together, so what you approve is what is built — no allowances, no revisions at invoice time.";

const FALLBACK_STORY = {
  lede: "Drawn to the property, priced as one contract, and installed turnkey by our own crews.",
  body: "Every element in this catalogue is specified on a site visit, engineered where code requires it, and set by the same team that quoted it. Nothing is subcontracted away from the drawing you approve.",
  craft: "Surveyed, permitted, installed and tested in-house.",
  care: "Warranty registered on completion; one number to call.",
};

const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`text-[9px] uppercase tracking-[0.35em] text-muted-foreground ${className}`}>{children}</p>
);


/**
 * Which leaf of the spread a page is printed on.
 * The + controls are kept away from the outer edge of the book: on a right-hand
 * page they sit to the LEFT of the option title, on a left-hand page to the
 * RIGHT — so tapping "add" never lands on the page-turn corner.
 */
export const LeafSideContext = React.createContext<"left" | "right">("left");
export const useLeafSide = () => React.useContext(LeafSideContext);

const Leaf = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
  <div
    ref={ref}
    className="h-full w-full overflow-hidden bg-background text-foreground"
    style={{ boxShadow: "inset 0 0 50px rgba(0,0,0,0.06)" }}
  >
    {children}
  </div>
));
Leaf.displayName = "DossierLeaf";

/**
 * One option chapter. Hovering (or tapping) an option previews its Wonderlands
 * Studio image in the plate above the list, and the + control adds that option
 * to the order.
 */
const OptionChapter: React.FC<{
  group: StudioGroup;
  chunk: StudioOption[];
  index: number;
  chunkIndex: number;
  chunkCount: number;
  perPage: number;
  entry: ConsoleEntry;
  categoryLabel: string;
  categoryId: string;
}> = ({ group, chunk, index, chunkIndex, chunkCount, perPage, entry, categoryLabel, categoryId }) => {
  const cart = useOptionalShoppingCart();
  /* which leaf of the spread this chapter is printed on — decides the + side */
  const leafSide = useLeafSide();
  const [active, setActive] = useState<StudioOption | null>(null);
  const [full, setFull] = useState(false);
  const preview = active ?? chunk.find((o) => o.image) ?? null;
  /* only an option's own photography ever reaches the plate — never the product
     shot, so a chapter with no swatches prints a typographic head instead. */
  const plate = preview?.image;

  /* Every option belongs to THIS product line in the cart — the product id is
     the same one the "Add to cart" plate uses, so a feature never creates an
     orphan line: adding a finish adds the pool with the finish attached. */
  const productCartId = `flip-${categoryId}-${entry.id}`;
  const optionId = (o: StudioOption) =>
    `flip-${categoryId}-${entry.id}-${group.title}-${o.label}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const inOrder = (o: StudioOption) =>
    (cart?.cartItems ?? []).some(
      (c) =>
        c.id === optionId(o) ||
        (c.id === productCartId &&
          (c.extras ?? []).some((e: any) => e.key === optionId(o))),
    );

  /** Measurement being collected for a unit-priced option (sq ft or count). */
  const [measure, setMeasure] = useState<{ label: string; value: string } | null>(null);

  /** Exactly the Wonderlands Studio calculation: rate x measurement, or a flat price. */
  const lineTotal = (o: StudioOption, qty: number) => (o.unit ? o.price * qty : o.price);

  const unitWord = (o: StudioOption) => (o.unit === "sqft" ? "sq ft" : "units");

  /** Fitted as standard: no cost, already part of the product — never an add. */
  const isIncluded = (o: StudioOption) =>
    o.price === 0 && /included/i.test(o.priceLabel ?? "") && isTurnkeyScopeLine(o.label);

  const addOption = (o: StudioOption, qty = 1) => {
    const total = lineTotal(o, qty);
    cart?.addFeatureToProduct(
      {
        id: productCartId,
        name: entry.name,
        price: entry.price ?? 0,
        image: entry.image,
        category: categoryLabel,
      },
      {
        key: optionId(o),
        name: o.unit
          ? `${group.title}: ${o.label} (${qty} ${unitWord(o)} @ ${o.priceLabel})`
          : `${group.title}: ${o.label}`,
        price: total,
        image: o.image ?? entry.image,
      },
    );
    setMeasure(null);
  };

  const requestAdd = (o: StudioOption) => {
    if (o.unit && o.price > 0) {
      setActive(o);
      setMeasure({ label: o.label, value: o.unit === "sqft" ? "400" : "1" });
      return;
    }
    addOption(o);
  };

  /* the add control, printed on the gutter side of the row (see LeafSideContext) */
  const control = (o: StudioOption) =>
    isIncluded(o) ? (
      /* fitted as standard — nothing to add, so the row is marked, not offered */
      <span
        title="Included as standard"
        className="flex h-6 shrink-0 items-center gap-1 border border-foreground/30 bg-foreground/[0.06] px-2 text-[8px] uppercase tracking-[0.25em] text-muted-foreground"
      >
        <Check className="h-3 w-3" />
        Standard
      </span>
    ) : (
      <button
        type="button"
        aria-label={`Add ${o.label} to the order`}
        onClick={(e) => {
          e.stopPropagation();
          requestAdd(o);
        }}
        className={`flex h-6 w-6 shrink-0 items-center justify-center border transition-colors ${
          inOrder(o)
            ? "border-foreground bg-foreground text-background"
            : "border-border/70 hover:bg-foreground hover:text-background"
        }`}
      >
        {inOrder(o) ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
      </button>
    );

  const rows = (dense: boolean) => (
    <ul className={`min-h-0 flex-1 space-y-0 ${dense ? "overflow-hidden" : "overflow-y-auto"}`}>
      {chunk.map((o, oi) => (
        <li
          key={o.label}
          onMouseEnter={() => setActive(o)}
          onFocus={() => setActive(o)}
          onClick={() => setActive(o)}
          className={`flex flex-wrap items-center gap-3 border-t border-border/50 py-2 transition-colors ${
            active?.label === o.label ? "bg-foreground/[0.04]" : ""
          }`}
        >
          {/* right-hand leaf: the + sits before the title, away from the flip corner */}
          {leafSide === "right" && control(o)}
          <span className="font-serif text-xs text-muted-foreground">
            {String(chunkIndex * perPage + oi + 1).padStart(2, "0")}
          </span>
          {o.image ? (
            <img
              src={o.image}
              alt={o.label}
              loading="eager"
              decoding="async"
              className="h-7 w-7 shrink-0 object-cover"
            />
          ) : o.color ? (
            <span className="h-7 w-7 shrink-0 border border-border/60" style={{ backgroundColor: o.color }} />
          ) : null}
          <span className="min-w-0 flex-1 truncate text-[11px] uppercase tracking-[0.18em]">{o.label}</span>
          <span className="shrink-0 font-serif text-[11px] text-muted-foreground">{o.priceLabel}</span>
          {/* left-hand leaf: the + stays on the inner (right) edge of the row */}
          {leafSide !== "right" && control(o)}


          {/* unit-priced options are measured before they enter the estimate, exactly as in the studio */}
          {measure?.label === o.label && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex w-full items-center gap-2 border-t border-dashed border-border/60 pt-2"
            >
              <label className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                {o.unit === "sqft" ? "Area" : "Quantity"}
              </label>
              <input
                type="number"
                min={o.unit === "sqft" ? 1 : 1}
                step={o.unit === "sqft" ? 10 : 1}
                value={measure.value}
                onChange={(e) => setMeasure({ label: o.label, value: e.target.value })}
                className="w-20 border border-border/70 bg-transparent px-2 py-1 font-serif text-[11px] outline-none focus:border-foreground"
              />
              <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{unitWord(o)}</span>
              <span className="ml-auto font-serif text-[11px]">
                ${Math.round(lineTotal(o, Math.max(0, Number(measure.value) || 0))).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => addOption(o, Math.max(1, Number(measure.value) || 1))}
                className="border border-foreground bg-foreground px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-background"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setMeasure(null)}
                className="border border-border/70 px-2 py-1 text-[9px] uppercase tracking-[0.25em] text-muted-foreground"
              >
                Cancel
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );


  const plateArt = (contain: boolean) =>
    preview?.color && !preview.image ? (
      <div className="absolute inset-0" style={{ backgroundColor: preview.color }} />
    ) : (
      plate && (
        <img
          key={plate}
          src={plate}
          alt={`${preview?.label ?? group.title} — ${categoryLabel}`}
          loading="eager"
          decoding="async"
          className={`absolute inset-0 h-full w-full animate-fade-in ${contain ? "object-contain" : "object-cover"}`}
        />
      )
    );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-7 sm:p-9">
      <Eyebrow>
        {String(index + 3).padStart(2, "0")} — {group.title}
        {chunkCount > 1 ? ` (${chunkIndex + 1}/${chunkCount})` : ""}
      </Eyebrow>
      {chunkIndex === 0 ? (
        <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{group.note}</h3>
      ) : (
        <h3 className="mt-2 font-serif text-xl font-light leading-tight text-muted-foreground">
          {group.title} — continued
        </h3>
      )}

      {/* live preview plate — swaps to the option under the cursor. Chapters with no
          photography use a typographic head instead, so no empty frame is printed. */}
      {plate || preview?.color ? (
        <div className="relative mt-4 aspect-[5/4] max-h-[46%] w-full shrink-0 overflow-hidden bg-muted">
          {plateArt(true)}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
          <p className="absolute inset-x-3 bottom-2 flex items-baseline justify-between gap-3 pr-10 text-[9px] uppercase tracking-[0.3em] text-white/90">
            <span className="truncate">{preview?.label ?? group.title}</span>
            {preview?.priceLabel && <span className="shrink-0 opacity-80">{preview.priceLabel}</span>}
          </p>
          <button
            type="button"
            onClick={() => setFull(true)}
            aria-label="Open this option full screen"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-white/50 bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="mt-4 shrink-0 border-y border-border/60 py-4">
          <p className="font-serif text-4xl font-light leading-none text-foreground/15">
            {String(chunk.length).padStart(2, "0")}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {group.title} — {categoryLabel}
          </p>
          {preview?.priceLabel && (
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              {preview.label} · {preview.priceLabel}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex min-h-0 flex-1 flex-col">{rows(true)}</div>
      <p className="mt-3 border-t border-border/50 pt-3 text-[10px] leading-relaxed text-muted-foreground">
        Hover any option to see it on the plate above, expand it with the corner control, then add it with the + to
        carry it into your estimate with the same category, pricing and image data used by Wonderlands Studio.
      </p>

      {/* full-spread study — the whole book: one leaf is the photograph, the facing leaf the options */}
      {full && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/95 p-3 backdrop-blur-xl animate-fade-in sm:p-6">
          <div
            className="relative grid h-full w-full max-h-[94vh] max-w-[1500px] grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] overflow-hidden border border-border/60 bg-background shadow-[0_40px_120px_-40px_hsl(var(--foreground)/0.45)] md:grid-cols-2 md:grid-rows-1"
          >
            {/* left leaf — the plate, full page */}
            <div className="relative min-h-0 bg-muted">
              {plateArt(true)}
              <p className="absolute inset-x-4 bottom-3 flex items-baseline justify-between gap-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                <span className="truncate">{preview?.label ?? group.title}</span>
                <span className="shrink-0 opacity-70">{categoryLabel}</span>
              </p>
            </div>

            {/* the gutter */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-border/70 md:block" />

            {/* right leaf — the options, full page */}
            <div className="flex min-h-0 flex-col border-t border-border/60 p-6 md:border-l-0 md:border-t-0 md:p-9">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Eyebrow>
                    {entry.name} — {group.title}
                  </Eyebrow>
                  <h3 className="mt-2 truncate font-serif text-3xl font-light leading-tight sm:text-4xl">
                    {preview?.label ?? group.title}
                  </h3>
                  {preview?.priceLabel && (
                    <p className="mt-1 font-serif text-lg text-muted-foreground">{preview.priceLabel}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setFull(false)}
                  aria-label="Close the full screen study"
                  className="flex h-9 w-9 shrink-0 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{group.note}</p>
              <div className="mt-5 flex min-h-0 flex-1 flex-col">{rows(false)}</div>
              <p className="mt-3 border-t border-border/50 pt-3 text-[10px] leading-relaxed text-muted-foreground">
                Select any option to study it at full size on the facing page, then add it with the + to carry it into
                your estimate.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


export type ProductBookPage = { key: string; render: () => React.ReactNode };


/**
 * The dossier pages for one model. Exported so the magazine can render them
 * inside its own flipbook — the dossier never opens a second book.
 */
export const useProductBookPages = ({
  entry,
  category,
  groups: editorialGroups = [],
  portrait = false,
  onOpenBoard,
}: {
  entry: ConsoleEntry;
  category: ProductBookCategory;
  groups?: ProductBookOptionGroup[];
  portrait?: boolean;
  /** Expand the on-page board into the full-screen Editor Board */
  onOpenBoard?: () => void;
}): ProductBookPage[] => {
  /** Editorial chapters plus every additional feature offered in Wonderlands Studio. */
  const groups = useMemo(
    () => mergeStudioGroups(category.id, editorialGroups, { modelName: entry.name, brand: entry.brand }),
    [category.id, editorialGroups, entry.name, entry.brand],
  );

  const navigate = useNavigate();
  const cart = useOptionalShoppingCart();

  const cartId = `flip-${category.id}-${entry.id}`;
  const added = (cart?.cartItems ?? []).some((c) => c.id === cartId);
  const add = useCallback(() => {
    cart?.addToCart({ id: cartId, name: entry.name, price: entry.price ?? 0, image: entry.image, category: category.label });
    cart?.setIsCartOpen?.(false);
  }, [cart, cartId, entry, category.label]);

  const tool = TOOLS[category.id];
  const brandKey = Object.keys(BRAND_NOTES).find((b) => (entry.brand ?? "").toLowerCase().includes(b.toLowerCase()));
  const brandNote = CATEGORY_MAKER_NOTES[category.id] || (brandKey && BRAND_NOTES[brandKey]) || BRAND_NOTES.Wonderlands;
  const metaBits = (entry.meta ?? "").split("·").map((s) => s.trim()).filter(Boolean);
  const price = formatEntryPrice(entry) || "On request";
  const story = STORIES[category.id] ?? FALLBACK_STORY;
  /** Product photography for the editorial pages — strictly this model's own
      plate plus verified manufacturer scene photography for its brand and
      discipline. No sibling models, no category imagery, no finish swatches. */
  const gallery = useMemo(
    () =>
      resolveProductGallery({
        categoryId: category.id,
        name: entry.name,
        brand: entry.brand,
        image: entry.image,
        siblings: [],
      }).filter(Boolean),
    [category.id, entry.image, entry.name, entry.brand],
  );

  /** Nth photograph of this product, or undefined — plates are never repeated. */
  const plateAt = useCallback((i: number) => gallery[i], [gallery]);
  /** True when the product has more photography than its single plate. */
  const rich = gallery.length > 1;

  /**
   * Stat labels read differently by discipline: a built vessel is a turn-key
   * investment with dimensions, while a surface (finish, liner, paver, turf) is
   * quoted by area and described by its collection — never by pool dimensions.
   */
  const SURFACE_CATS = new Set(["finishes", "liners", "pavers", "artificial-grass"]);
  const isSurface = SURFACE_CATS.has(category.id);
  const priceLabel = isSurface ? "Quoted by area" : "Turnkey investment";
  const metaLabel = isSurface ? "Collection" : "Dimensions";
  /** Three headline figures, phrased for the discipline of this book. */
  const headlineStats = useMemo(
    () => [
      { value: price, label: priceLabel },
      { value: metaBits[0] ?? category.label, label: metaLabel },
      { value: "Florida", label: "Engineered & installed" },
    ],
    [price, priceLabel, metaBits[0], metaLabel, category.label],
  );








  const pages = useMemo(() => {
    const list: { key: string; render: () => React.ReactNode }[] = [];

    /* plate */
    list.push({
      key: "plate",
      render: () => (
        <div className="relative h-full w-full overflow-hidden">
          <img src={entry.image} alt={entry.name} loading="eager" decoding="async" className="absolute inset-0 h-full w-full object-cover animate-ken-burns" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
          <div className="relative flex h-full flex-col justify-between p-7 text-white sm:p-9">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[9px] uppercase tracking-[0.45em] opacity-80">{entry.brand ?? "Wonderlands World"}</p>
              <p className="text-[9px] uppercase tracking-[0.45em] opacity-60">Dossier</p>
            </div>
            <div>
              <h3 className="font-serif text-3xl font-light leading-tight sm:text-4xl">{entry.name}</h3>
              <div className="mt-4 h-px w-16 origin-left bg-white/60 animate-rule-draw" />
              <p className="mt-4 max-w-xs text-[11px] leading-relaxed opacity-85">
                {category.description ?? category.tagline ?? category.label}
              </p>
              <p className="mt-5 font-serif text-2xl font-light">{price}</p>
            </div>
          </div>
        </div>
      ),
    });

    /* statement — a photographic spread only when a second plate exists;
       single-plate products get a typographic statement page instead, so no
       photograph is ever repeated or stretched to fill two pages. */
    if (rich) {
      pushSpread(
        list,
        {
          key: "statement",
          image: plateAt(1)!,
          eyebrow: `${entry.brand ?? "Wonderlands World"} — ${category.label}`,
          title: entry.name,
          titleItalic: category.tagline ?? category.label,
          body: story.lede,
          stats: headlineStats,

          lockup: "Wonderlands World — Dossier",
          caption: `${entry.name} — photographed on site`,
        },
        portrait,
        plateAt(2),
      );
    } else {
      list.push({
        key: "statement-type",
        render: () => (
          <div className="flex h-full w-full flex-col justify-center overflow-hidden p-8 sm:p-10">
            <Eyebrow>{entry.brand ?? "Wonderlands World"} — {category.label}</Eyebrow>
            <h3 className="mt-3 font-serif text-3xl font-light uppercase leading-none tracking-[0.06em] sm:text-4xl">
              {entry.name}
            </h3>
            <p className="mt-1 font-serif text-3xl font-light italic leading-none sm:text-4xl">
              {category.tagline ?? category.label}
            </p>
            <div className="mt-5 h-px w-14 origin-left bg-foreground/50 animate-rule-draw" />
            <p className="mt-5 max-w-[38ch] font-serif text-[13px] leading-relaxed text-foreground/85">{story.lede}</p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {headlineStats.map((s) => (

                <div key={s.label} className="border-t border-border/50 pt-2">
                  <p className="font-serif text-lg font-light leading-none">{s.value}</p>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.28em] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }

    /* the written piece — image led when a second plate exists */
    if (rich) {
      list.push({
        key: "story-image",
        render: () => (
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={plateAt(1)}
              alt={`${entry.name} in place`}
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <div className="relative flex h-full flex-col justify-end p-7 text-white sm:p-9">
              <p className="text-[9px] uppercase tracking-[0.4em] opacity-75">The piece</p>
              <p className="mt-3 max-w-sm font-serif text-xl font-light leading-snug sm:text-2xl">{story.lede}</p>
              <div className="mt-4 h-px w-14 origin-left bg-white/60 animate-rule-draw" />
            </div>
          </div>
        ),
      });
    }

    list.push({
      key: "story-text",
      render: () => {
        const second = EXTRA_BODY[category.id] ?? FALLBACK_EXTRA;
        const detail = plateAt(2) ?? plateAt(1);
        const notes = (category.notes ?? []).slice(0, 3);
        return (
          <div className="flex h-full w-full flex-col overflow-hidden p-7 sm:p-9">
            <div className="flex items-baseline justify-between gap-3">
              <Eyebrow>On {category.label.toLowerCase()}</Eyebrow>
              <Eyebrow className="hidden sm:block">{entry.brand ?? "Wonderlands World"}</Eyebrow>
            </div>
            <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{entry.name}</h3>
            <p className="mt-1 font-serif text-lg font-light italic leading-snug text-muted-foreground">
              {category.tagline ?? category.label}
            </p>
            <div className="mt-3 h-px w-14 origin-left bg-foreground/40 animate-rule-draw" />

            {/* body — two columns of type with a detail plate, so the leaf reads full */}
            <div className="mt-4 grid min-h-0 flex-1 gap-4 sm:grid-cols-[1.15fr_0.85fr]">
              <div className="min-h-0 space-y-3 overflow-hidden">
                <p className="font-serif text-[12.5px] leading-relaxed text-foreground/85 first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.8]">
                  {story.body}
                </p>
                <p className="font-serif text-[12.5px] leading-relaxed text-foreground/80">{second}</p>
                <blockquote className="border-l border-foreground/40 pl-3 font-serif text-[13px] font-light italic leading-snug text-foreground">
                  {story.lede}
                </blockquote>
              </div>

              <div className="flex min-h-0 flex-col gap-3">
                {detail && (
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                    <img
                      src={detail}
                      alt={`${entry.name} detail`}
                      loading="eager"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] hover:scale-105"
                    />
                    <span className="absolute bottom-1 left-2 font-serif text-[9px] text-white/85">
                      {entry.name}
                    </span>
                  </div>
                )}
                <dl className="space-y-1.5">
                  {[
                    ["Investment", price],
                    [metaLabel, metaBits[0] ?? category.label],
                    ["Delivery", deliveryLineFor(category.id, isSurface)],
                  ].map(([k, v]) => (

                    <div key={k} className="flex items-baseline justify-between gap-3 border-t border-border/50 pt-1.5">
                      <dt className="text-[8px] uppercase tracking-[0.28em] text-muted-foreground">{k}</dt>
                      <dd className="font-serif text-[11px]">{v}</dd>
                    </div>
                  ))}
                </dl>
                {notes.length > 0 && (
                  <ul className="space-y-1">
                    {notes.map((n, i) => (
                      <li key={n} className="flex gap-2 text-[10px] leading-relaxed text-muted-foreground">
                        <span className="font-serif">{String(i + 1).padStart(2, "0")}</span>
                        <span className="min-w-0">{n}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-3 border-t border-border/50 pt-3 sm:grid-cols-3">
              <div>
                <Eyebrow>Installation</Eyebrow>
                <p className="mt-1 text-[10.5px] leading-relaxed text-foreground/80">{story.craft}</p>
              </div>
              <div>
                <Eyebrow>Living with it</Eyebrow>
                <p className="mt-1 text-[10.5px] leading-relaxed text-foreground/80">{story.care}</p>
              </div>
              <div>
                <Eyebrow>Included</Eyebrow>
                <p className="mt-1 text-[10.5px] leading-relaxed text-foreground/80">{includedLineFor(category.id)}</p>
              </div>
            </div>
          </div>
        );
      },
    });


    /* dimensions & details */
    list.push({
      key: "dimensions",
      render: () => (
        <div className="flex h-full w-full flex-col overflow-hidden p-7 sm:p-9">
          <Eyebrow>01 — {isSurface ? "Specification & detail" : "Dimensions & details"}</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{entry.name}</h3>
          <dl className="mt-5 space-y-0">
            {[
              ["Discipline", category.label],
              ["Brand", entry.brand ?? "Wonderlands World"],
              /* Depth only reads on a vessel — a surface lists its collection/detail instead */
              ...metaBits.map(
                (m, i) => [i === 0 ? metaLabel : isSurface ? "Detail" : "Depth", m] as [string, string],
              ),
              ["Investment", price],
              ["Delivery", deliveryLineFor(category.id, isSurface)],

            ].map(([k, v]) => (
              <div key={`${k}-${v}`} className="flex items-baseline justify-between gap-4 border-t border-border/50 py-2">
                <dt className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{k}</dt>
                <dd className="text-right font-serif text-base font-light">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-auto text-[10px] leading-relaxed text-muted-foreground">{includedLineFor(category.id)}</p>
        </div>
      ),
    });

    /* features */
    list.push({
      key: "features",
      render: () => (
        <div className="flex h-full w-full flex-col overflow-hidden p-7 sm:p-9">
          <Eyebrow>02 — Features</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-light leading-tight">What is included</h3>
          <ul className="mt-4 space-y-0">
            {standardFeatureLinesFor(category.id, category.notes ?? []).map((n) => (
              <li key={n} className="flex items-start gap-3 border-t border-border/50 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="mt-[7px] h-px w-4 shrink-0 bg-foreground/40" />
                {n}
              </li>
            ))}
          </ul>
          {plateAt(1) ? (
            <div className="relative mt-4 min-h-0 flex-1 overflow-hidden">
              <img src={plateAt(1)} alt={`${category.label} detail`} loading="eager" decoding="async" className="absolute inset-0 h-full w-full object-cover animate-ken-burns" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute inset-x-3 bottom-2 text-[9px] uppercase tracking-[0.3em] text-white/90">
                {entry.name} — as installed
              </p>
            </div>
          ) : (
            <div className="mt-auto border-t border-border/50 pt-3">
              <Eyebrow>Installation</Eyebrow>
              <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">{story.craft}</p>
            </div>
          )}


        </div>
      ),
    });

    /* option chapters — one illustrated page each, long lists continue on facing
       pages. Six rows is the most that fits under the preview plate without any
       option being clipped out of sight, so long catalogues simply get more pages. */
    const PER_PAGE = 6;
    groups.forEach((g, i) => {
      const chunks: StudioOption[][] = [];
      for (let c = 0; c < g.items.length; c += PER_PAGE) chunks.push(g.items.slice(c, c + PER_PAGE));
      chunks.forEach((chunk, ci) => {
        list.push({
          key: `group-${g.title}-${ci}`,
          render: () => (
            <OptionChapter
              group={g}
              chunk={chunk}
              index={i}
              chunkIndex={ci}
              chunkCount={chunks.length}
              perPage={PER_PAGE}
              entry={entry}
              categoryLabel={category.label}
              categoryId={category.id}
            />
          ),
        });
      });
    });



    /* portfolio spread — only when two unused plates exist, so the spread never
       repeats a photograph already printed nor stretches one to fill two pages */
    if (gallery.length > 3) {
      pushSpread(
        list,
        {
          key: "portfolio",
          image: plateAt(2)!,
          eyebrow: "Portfolio",
          title: "Seen in place",
          titleItalic: category.label,
          body: story.craft,
          lockup: "Wonderlands World",
          caption: `${category.label} — completed compositions`,
        },
        portrait,
        plateAt(3),
      );
    }

    /* plates — a grid, only when there are four distinct photographs to print */
    if (gallery.length >= 4) {
      const gridPlates = gallery.slice(gallery.length - 4);
      list.push({
        key: "plates",
        render: () => (
          <div className="flex h-full w-full flex-col overflow-hidden p-7 sm:p-9">
            <div className="flex items-baseline justify-between gap-3">
              <Eyebrow>Plates</Eyebrow>
              <Eyebrow className="hidden sm:block">{category.label}</Eyebrow>
            </div>
            <h3 className="mt-2 font-serif text-2xl font-light leading-tight">Seen in place</h3>
            <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2">
              {gridPlates.map((src, n) => (
                <div key={src} className="relative overflow-hidden">
                  <img
                    src={src}
                    alt={`${category.label} plate ${n + 1}`}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] hover:scale-105"
                  />
                  <span className="absolute bottom-1 left-2 font-serif text-[10px] text-white/85">
                    {String(n + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-border/50 pt-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              Photographed on completed Wonderlands installations
            </p>
          </div>
        ),
      });
    }



    /* brand note */
    list.push({
      key: "brand",
      render: () => (
        <div className="flex h-full w-full flex-col overflow-hidden p-7 sm:p-9">
          <Eyebrow>The maker</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{entry.brand ?? "Wonderlands World"}</h3>
          <p className="mt-4 font-serif text-[13px] leading-relaxed text-foreground/85 first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.8]">
            {brandNote}
          </p>
          <div className="mt-auto border-t border-border/50 pt-3">
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              {entry.brand ?? "Wonderlands World"} — supplied, set and warrantied through Wonderlands World
            </p>
          </div>

        </div>
      ),
    });

    /* the one pager — our written message to the client */
    list.push({
      key: "letter",
      render: () =>
        category.id === "pavers" ? (
          <PaversWorkMessage entryName={entry.name} />
        ) : (
          <FlipCustomerLetter categoryLabel={category.label} modelName={entry.name} />
        ),
    });

    /* design tool — a full spread: the live board runs across both pages */
    if (!portrait && list.length % 2 !== 0) {
      /* keep the board opening on a left-hand page so the spread reads as one */
      list.push({
        key: "tool-lead",
        render: () => (
          <div className="flex h-full w-full flex-col justify-center gap-4 p-9 text-center">
            <Eyebrow>Next</Eyebrow>
            <p className="font-serif text-2xl font-light leading-snug">The drawing board</p>
            <div className="mx-auto h-px w-14 bg-border" />
            <p className="mx-auto max-w-[18rem] text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {tool?.name ?? "Wonderlands Studio"} — drawn to scale on the following spread
            </p>
          </div>
        ),
      });
    }

    /* the board runs across the whole spread — left half, then right half */
    if (portrait) {
      list.push({
        key: "tool",
        render: () => (
          <div className="flex h-full w-full flex-col overflow-hidden p-4 sm:p-5">
            <Eyebrow>Design tool</Eyebrow>
            <h3 className="mt-1 font-serif text-xl font-light leading-tight">{tool?.name ?? "Wonderlands Studio"}</h3>
            <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden">
              <FlipToolWidget categoryId={category.id} onExpand={onOpenBoard} part="board" modelName={entry.name} modelMeta={entry.meta} />
            </div>
          </div>
        ),
      });
    } else {
      list.push({
        key: "tool",
        render: () => (
          <FlipToolWidget categoryId={category.id} onExpand={onOpenBoard} part="board-left" modelName={entry.name} modelMeta={entry.meta} />
        ),
      });
      list.push({
        key: "tool-right",
        render: () => (
          <FlipToolWidget categoryId={category.id} onExpand={onOpenBoard} part="board-right" modelName={entry.name} modelMeta={entry.meta} />
        ),
      });
    }

    /* facing spread — every tool and button for that board */
    list.push({
      key: "tool-tools",
      render: () => <FlipToolWidget categoryId={category.id} onExpand={onOpenBoard} part="tools" modelName={entry.name} modelMeta={entry.meta} />,
    });

    /* following spread — live cost of the drawing, then calculators and options */
    list.push({
      key: "tool-cost",
      render: () => <FlipToolWidget categoryId={category.id} part="cost" modelName={entry.name} modelMeta={entry.meta} />,
    });

    list.push({
      key: "tool-options",
      render: () => (
        <div className="flex h-full w-full flex-col overflow-hidden">
          <div className="min-h-0 flex-1">
            <FlipToolWidget categoryId={category.id} part="options" modelName={entry.name} modelMeta={entry.meta} />
          </div>
          <div className="flex flex-col gap-2 px-6 pb-6 sm:px-8">
            <button
              onClick={() => navigate(tool?.to ?? "/wonderlands-studio")}
              className="inline-flex items-center justify-between gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
            >
              {tool?.name ?? "Wonderlands Studio"} <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => navigate("/blueprint-builder")}
              className="inline-flex items-center justify-between gap-2 border border-border/60 px-3 py-2 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
            >
              Blueprint builder <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ),
    });



    /* turn-key scope and the managed project pipeline */
    if (getProjectPipeline(category.id)) {
      if (!portrait && list.length % 2 !== 0) {
        list.push({
          key: "pipeline-lead",
          render: () => (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-9 text-center">
              <Eyebrow>Delivery</Eyebrow>
              <p className="font-serif text-xl font-light leading-snug">Built turn-key</p>
              <div className="h-px w-14 bg-border" />
              <p className="max-w-[16rem] text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Scope and pipeline overleaf
              </p>
            </div>
          ),
        });
      }
      list.push({
        key: "pipeline-scope",
        render: () => <FlipProjectPipeline categoryId={category.id} part="scope" />,
      });
      list.push({
        key: "pipeline-steps-a",
        render: () => <FlipProjectPipeline categoryId={category.id} part="steps" half={0} />,
      });
      list.push({
        key: "pipeline-steps-b",
        render: () => <FlipProjectPipeline categoryId={category.id} part="steps" half={1} />,
      });
    }

    /* order */
    list.push({
      key: "order",
      render: () => (
        <div className="flex h-full w-full flex-col justify-between p-7 sm:p-9">
          <div>
            <Eyebrow>Order</Eyebrow>
            <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{entry.name}</h3>
            <p className="mt-4 font-serif text-3xl font-light">{price}</p>
          </div>
          <div className="relative h-[38%] overflow-hidden">
            <img src={entry.image} alt={entry.name} loading="eager" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div>
            <button
              onClick={add}
              className={`flex w-full items-center justify-between gap-3 border px-4 py-3 text-[9px] uppercase tracking-[0.3em] transition-colors ${
                added ? "border-foreground bg-foreground text-background" : "border-foreground hover:bg-foreground hover:text-background"
              }`}
            >
              {added ? "In your order" : "Add to the order"}
              {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{includedLineFor(category.id)}</p>
          </div>
        </div>
      ),
    });

    if (!portrait && list.length % 2 !== 0) {
      list.push({
        key: "colophon",
        render: () => (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-9 text-center">
            <Eyebrow>Wonderlands World</Eyebrow>
            <p className="font-serif text-xl font-light leading-snug">{entry.name}</p>
            <div className="h-px w-14 bg-border" />
            <p className="max-w-[16rem] text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Designed, built and warrantied in-house
            </p>
          </div>
        ),
      });
    }

    return list;
  }, [entry, category, groups, metaBits, price, tool, brandNote, added, add, navigate, portrait, story, gallery, plateAt]);

  return pages;
};

const FlipProductBook: React.FC<Props> = ({
  entry,
  category,
  groups = [],
  onClose,
  inline = false,
  onNextEntry,
  onPrevEntry,
}) => {
  const bookRef = useRef<any>(null);
  const [page, setPage] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [dims, setDims] = useState({ w: 360, h: 480 });
  const pages = useProductBookPages({ entry, category, groups, portrait });

  /* Page turning that can leave the book: at the very end Next continues into
     the next product of the list (and Previous, at the start, steps back). */
  const step = portrait ? 1 : 2;
  const atEnd = page + step >= pages.length;
  const atStart = page <= 0;
  const goNext = () => {
    if (atEnd && onNextEntry) {
      onNextEntry();
      return;
    }
    bookRef.current?.pageFlip?.().flipNext();
  };
  const goPrev = () => {
    if (atStart && onPrevEntry) {
      onPrevEntry();
      return;
    }
    bookRef.current?.pageFlip?.().flipPrev();
  };


  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isPortrait = vw < 820;
      setPortrait(isPortrait);
      const maxH = Math.max(380, Math.floor(vh * (isPortrait ? 0.66 : 0.74)));
      const availableW = Math.min(vw - (isPortrait ? 40 : 160), 1400);
      const wByWidth = isPortrait ? availableW : availableW / 2;
      const w = Math.floor(Math.min(wByWidth, maxH / 1.3));
      setDims({ w: Math.max(260, w), h: Math.floor(Math.max(260, w) * 1.3) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const flipLocked = useFlipLocked();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      /* Interactive leaves (maps, canvases, search fields) keep their own keys —
         arrows, keypad and zoom belong to the board, not to the book. */
      if (flipLocked) return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (el?.isContentEditable) return;
      if (el?.closest("input, textarea, select, [contenteditable=true], canvas, [role='application'], .gm-style, .mapboxgl-map")) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.code?.startsWith("Numpad")) return;
      if (e.key === "ArrowRight") bookRef.current?.pageFlip?.().flipNext();
      if (e.key === "ArrowLeft") bookRef.current?.pageFlip?.().flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, flipLocked]);

  const total = pages.length;

  const nav = (
    <div className={`mt-4 flex items-center gap-4 ${inline ? "" : ""}`}>
      <button
        onClick={() => bookRef.current?.pageFlip?.().flipPrev()}
        aria-label="Previous page"
        className={`flex h-9 w-9 items-center justify-center border transition-colors ${
          inline
            ? "border-border/60 text-foreground hover:bg-foreground hover:text-background"
            : "border-white/40 text-white hover:bg-white hover:text-black"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <p
        className={`font-serif text-xs tracking-[0.3em] ${
          inline ? "text-muted-foreground" : "text-white/80"
        }`}
      >
        {String(page + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
      <button
        onClick={() => bookRef.current?.pageFlip?.().flipNext()}
        aria-label="Next page"
        className={`flex h-9 w-9 items-center justify-center border transition-colors ${
          inline
            ? "border-border/60 text-foreground hover:bg-foreground hover:text-background"
            : "border-white/40 text-white hover:bg-white hover:text-black"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  /* while a board is being drawn on, page turning is suspended */

  const book = (
    <HTMLFlipBook
      ref={bookRef}
      width={dims.w}
      height={dims.h}
      size="fixed"
      minWidth={240}
      maxWidth={900}
      minHeight={320}
      maxHeight={1200}
      drawShadow
      flippingTime={700}
      usePortrait={portrait}
      showCover={false}
      mobileScrollSupport
      maxShadowOpacity={0.35}
      className="flip-dossier"
      style={{}}
      startPage={0}
      useMouseEvents={!flipLocked}
      clickEventForward={false}
      swipeDistance={24}
      showPageCorners={!flipLocked}
      disableFlipByClick={false}
      autoSize={false}
      startZIndex={0}
      onFlip={(e: any) => setPage(e.data)}
    >
      {pages.map((p, i) => (
        <Leaf key={p.key}>
          {/* spreads read (0,1), (2,3)… so an even index is the left leaf.
              In portrait every page is a single sheet — treated as a left leaf. */}
          <LeafSideContext.Provider value={portrait || i % 2 === 0 ? "left" : "right"}>
            {p.render()}
          </LeafSideContext.Provider>
        </Leaf>
      ))}
    </HTMLFlipBook>
  );

  /* Rendered inside the magazine — no overlay, only the book and a corner close. */
  if (inline) {
    return (
      <div className="relative flex w-full flex-col items-center">
        <button
          onClick={onClose}
          aria-label="Close this dossier"
          title="Close this dossier"
          className="absolute right-0 top-0 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground backdrop-blur-xl transition-colors hover:bg-foreground hover:text-background"
        >
          <X className="h-4 w-4" />
        </button>
        <div style={{ perspective: "3000px" }} className="flex justify-center">
          {book}
        </div>
        {nav}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="mb-3 flex w-full max-w-5xl items-baseline justify-between gap-4">
        <p className="text-[9px] uppercase tracking-[0.45em] text-white/70">
          {category.label} — Dossier
        </p>
        <button
          onClick={onClose}
          aria-label="Close dossier"
          className="inline-flex items-center gap-2 border border-white/40 px-3 py-2 text-[9px] uppercase tracking-[0.3em] text-white transition-colors hover:bg-white hover:text-black"
        >
          Close <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {book}
      {nav}

    </div>
  );
};

export default FlipProductBook;
