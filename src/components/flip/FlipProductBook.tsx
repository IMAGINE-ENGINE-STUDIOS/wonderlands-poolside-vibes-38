import * as React from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, Check, Plus, ArrowUpRight } from "lucide-react";
import { formatEntryPrice, type ConsoleEntry } from "./flipConsoleData";
import { useOptionalShoppingCart } from "@/components/ShoppingCartProvider";

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
};

export type ProductBookOptionGroup = { title: string; note: string; options: string[] };

type Props = {
  entry: ConsoleEntry;
  category: ProductBookCategory;
  groups?: ProductBookOptionGroup[];
  onClose: () => void;
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
  Wonderlands: "Wonderlands World builds, sets and warranties the installation in-house — one contract from survey through the final water test.",
};

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

const FALLBACK_STORY = {
  lede: "Drawn to the property, priced as one contract, and installed turnkey by our own crews.",
  body: "Every element in this catalogue is specified on a site visit, engineered where code requires it, and set by the same team that quoted it. Nothing is subcontracted away from the drawing you approve.",
  craft: "Surveyed, permitted, installed and tested in-house.",
  care: "Warranty registered on completion; one number to call.",
};

const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`text-[9px] uppercase tracking-[0.35em] text-muted-foreground ${className}`}>{children}</p>
);


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

const FlipProductBook: React.FC<Props> = ({ entry, category, groups = [], onClose }) => {
  const bookRef = useRef<any>(null);
  const navigate = useNavigate();
  const cart = useOptionalShoppingCart();
  const [page, setPage] = useState(0);
  const [portrait, setPortrait] = useState(false);
  const [dims, setDims] = useState({ w: 360, h: 480 });

  const cartId = `flip-${category.id}-${entry.id}`;
  const added = (cart?.cartItems ?? []).some((c) => c.id === cartId);
  const add = useCallback(() => {
    cart?.addToCart({ id: cartId, name: entry.name, price: entry.price ?? 0, image: entry.image, category: category.label });
    cart?.setIsCartOpen?.(false);
  }, [cart, cartId, entry, category.label]);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") bookRef.current?.pageFlip?.().flipNext();
      if (e.key === "ArrowLeft") bookRef.current?.pageFlip?.().flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tool = TOOLS[category.id];
  const brandKey = Object.keys(BRAND_NOTES).find((b) => (entry.brand ?? "").toLowerCase().includes(b.toLowerCase()));
  const brandNote = (brandKey && BRAND_NOTES[brandKey]) || BRAND_NOTES.Wonderlands;
  const plates = (category.images ?? []).filter(Boolean);
  const metaBits = (entry.meta ?? "").split("·").map((s) => s.trim()).filter(Boolean);
  const price = formatEntryPrice(entry) || "On request";
  const story = STORIES[category.id] ?? FALLBACK_STORY;
  /** Every image available to this dossier, model plate first. */
  const gallery = useMemo(
    () => Array.from(new Set([entry.image, ...plates].filter(Boolean))) as string[],
    [entry.image, plates],
  );
  const plateAt = useCallback((i: number) => gallery[i % Math.max(gallery.length, 1)] ?? entry.image, [gallery, entry.image]);


  const pages = useMemo(() => {
    const list: { key: string; render: () => React.ReactNode }[] = [];

    /* plate */
    list.push({
      key: "plate",
      render: () => (
        <div className="relative h-full w-full overflow-hidden">
          <img src={entry.image} alt={entry.name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover animate-ken-burns" />
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

    /* the written piece — image led, full editorial copy */
    list.push({
      key: "story-image",
      render: () => (
        <div className="relative h-full w-full overflow-hidden">
          <img
            src={plateAt(1)}
            alt={`${entry.name} in place`}
            loading="lazy"
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

    list.push({
      key: "story-text",
      render: () => (
        <div className="flex h-full w-full flex-col p-7 sm:p-9">
          <Eyebrow>On {category.label.toLowerCase()}</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{entry.name}</h3>
          <p className="mt-4 font-serif text-[13px] leading-relaxed text-foreground/85 first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.8]">
            {story.body}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[plateAt(2), plateAt(3)].map((src, i) => (
              <div key={`${src}-${i}`} className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={src}
                  alt={`${entry.name} detail ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] hover:scale-105"
                />
              </div>
            ))}
          </div>
          <div className="mt-auto space-y-2 border-t border-border/50 pt-3">
            <div>
              <Eyebrow>Installation</Eyebrow>
              <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">{story.craft}</p>
            </div>
            <div>
              <Eyebrow>Living with it</Eyebrow>
              <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">{story.care}</p>
            </div>
          </div>
        </div>
      ),
    });

    /* dimensions & details */
    list.push({
      key: "dimensions",
      render: () => (
        <div className="flex h-full w-full flex-col p-7 sm:p-9">
          <Eyebrow>01 — Dimensions & details</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{entry.name}</h3>
          <dl className="mt-5 space-y-0">
            {[
              ["Discipline", category.label],
              ["Brand", entry.brand ?? "Wonderlands World"],
              ...metaBits.map((m, i) => [i === 0 ? "Dimensions" : "Depth", m] as [string, string]),
              ["Investment", price],
              ["Delivery", "Turnkey — set at your address"],
            ].map(([k, v]) => (
              <div key={`${k}-${v}`} className="flex items-baseline justify-between gap-4 border-t border-border/50 py-2">
                <dt className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{k}</dt>
                <dd className="text-right font-serif text-base font-light">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-auto text-[10px] leading-relaxed text-muted-foreground">
            Price includes installation at your home address.
          </p>
        </div>
      ),
    });

    /* features */
    list.push({
      key: "features",
      render: () => (
        <div className="flex h-full w-full flex-col p-7 sm:p-9">
          <Eyebrow>02 — Features</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-light leading-tight">What is included</h3>
          <ul className="mt-4 space-y-0">
            {(category.notes ?? []).concat(["Permit drawings", "Warranty registration"]).map((n) => (
              <li key={n} className="flex items-start gap-3 border-t border-border/50 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="mt-[7px] h-px w-4 shrink-0 bg-foreground/40" />
                {n}
              </li>
            ))}
          </ul>
          <div className="relative mt-4 min-h-0 flex-1 overflow-hidden">
            <img src={plateAt(1)} alt={`${category.label} detail`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover animate-ken-burns" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <p className="absolute inset-x-3 bottom-2 text-[9px] uppercase tracking-[0.3em] text-white/90">
              {entry.name} — as installed
            </p>
          </div>

        </div>
      ),
    });

    /* option chapters — one illustrated page each */
    groups.forEach((g, i) => {
      list.push({
        key: `group-${g.title}`,
        render: () => (
          <div className="flex h-full w-full flex-col p-7 sm:p-9">
            <Eyebrow>{String(i + 3).padStart(2, "0")} — {g.title}</Eyebrow>
            <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{g.note}</h3>
            <div className="relative mt-4 h-[26%] overflow-hidden">
              <img
                src={plateAt(i + 1)}
                alt={`${g.title} — ${category.label}`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <p className="absolute inset-x-3 bottom-2 text-[9px] uppercase tracking-[0.3em] text-white/90">
                {g.title} — {entry.name}
              </p>
            </div>
            <ul className="mt-4 min-h-0 flex-1 space-y-0 overflow-hidden">
              {g.options.map((o, oi) => (
                <li key={o} className="flex items-baseline gap-3 border-t border-border/50 py-2">
                  <span className="font-serif text-xs text-muted-foreground">{String(oi + 1).padStart(2, "0")}</span>
                  <span className="text-[11px] uppercase tracking-[0.18em]">{o}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-border/50 pt-3 text-[10px] leading-relaxed text-muted-foreground">
              Selections are confirmed on the survey visit and priced into your estimate — every option above is
              installed by our own crews.
            </p>
          </div>
        ),
      });
    });

    /* plates — a gallery of the discipline */
    if (gallery.length > 1) {
      list.push({
        key: "plates",
        render: () => (
          <div className="flex h-full w-full flex-col p-7 sm:p-9">
            <div className="flex items-baseline justify-between gap-3">
              <Eyebrow>Plates</Eyebrow>
              <Eyebrow className="hidden sm:block">{category.label}</Eyebrow>
            </div>
            <h3 className="mt-2 font-serif text-2xl font-light leading-tight">Seen in place</h3>
            <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2">
              {[0, 1, 2, 3].map((n) => (
                <div key={n} className="relative overflow-hidden">
                  <img
                    src={plateAt(n)}
                    alt={`${category.label} plate ${n + 1}`}
                    loading="lazy"
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
        <div className="flex h-full w-full flex-col p-7 sm:p-9">
          <Eyebrow>The maker</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{entry.brand ?? "Wonderlands World"}</h3>
          <p className="mt-4 font-serif text-[13px] leading-relaxed text-foreground/85 first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:leading-[0.8]">
            {brandNote}
          </p>
          {plates[1] && (
            <div className="relative mt-5 min-h-0 flex-1 overflow-hidden">
              <img src={plates[1]} alt={`${entry.brand ?? category.label} plate`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover animate-ken-burns" />
            </div>
          )}
        </div>
      ),
    });

    /* design tool */
    list.push({
      key: "tool",
      render: () => (
        <div className="flex h-full w-full flex-col p-7 sm:p-9">
          <Eyebrow>Design tool</Eyebrow>
          <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{tool?.name ?? "Wonderlands Studio"}</h3>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            {tool?.note ?? "Configure the model, then carry it into your estimate."}
          </p>
          <div className="relative mt-5 h-[40%] overflow-hidden">
            <img src={plates[0] ?? entry.image} alt="Design tool" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => navigate(tool?.to ?? "/wonderlands-studio")}
                className="inline-flex items-center gap-2 border border-white/70 px-4 py-2.5 text-[9px] uppercase tracking-[0.3em] text-white transition-colors hover:bg-white hover:text-black"
              >
                Open the tool <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate("/blueprint-builder")}
            className="mt-4 inline-flex items-center justify-between border border-border/60 px-4 py-2.5 text-[9px] uppercase tracking-[0.3em] transition-colors hover:bg-foreground hover:text-background"
          >
            Blueprint builder <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <p className="mt-auto text-[10px] leading-relaxed text-muted-foreground">
            Every drawing is saved to your session and can be attached to a quote.
          </p>
        </div>
      ),
    });

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
            <img src={entry.image} alt={entry.name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
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
            <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
              Price includes installation at your home address.
            </p>
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
  }, [entry, category, groups, plates, metaBits, price, tool, brandNote, added, add, navigate, portrait, story, gallery, plateAt]);

  const total = pages.length;

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
        useMouseEvents
        clickEventForward={false}
        swipeDistance={24}
        showPageCorners
        disableFlipByClick={false}
        autoSize={false}
        startZIndex={0}
        onFlip={(e: any) => setPage(e.data)}
      >
        {pages.map((p) => (
          <Leaf key={p.key}>{p.render()}</Leaf>
        ))}
      </HTMLFlipBook>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={() => bookRef.current?.pageFlip?.().flipPrev()}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center border border-white/40 text-white transition-colors hover:bg-white hover:text-black"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-serif text-xs tracking-[0.3em] text-white/80">
          {String(page + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <button
          onClick={() => bookRef.current?.pageFlip?.().flipNext()}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center border border-white/40 text-white transition-colors hover:bg-white hover:text-black"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default FlipProductBook;
