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
          <ul className="mt-5 space-y-0">
            {(category.notes ?? []).concat(["Permit drawings", "Warranty registration"]).map((n) => (
              <li key={n} className="flex items-start gap-3 border-t border-border/50 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="mt-[7px] h-px w-4 shrink-0 bg-foreground/40" />
                {n}
              </li>
            ))}
          </ul>
          {plates[0] && (
            <div className="relative mt-5 min-h-0 flex-1 overflow-hidden">
              <img src={plates[0]} alt={`${category.label} detail`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover animate-ken-burns" />
            </div>
          )}
        </div>
      ),
    });

    /* option chapters — one page each */
    groups.forEach((g, i) => {
      list.push({
        key: `group-${g.title}`,
        render: () => (
          <div className="flex h-full w-full flex-col p-7 sm:p-9">
            <Eyebrow>{String(i + 3).padStart(2, "0")} — {g.title}</Eyebrow>
            <h3 className="mt-2 font-serif text-2xl font-light leading-tight">{g.note}</h3>
            <ul className="mt-5 space-y-0">
              {g.options.map((o, oi) => (
                <li key={o} className="flex items-baseline gap-3 border-t border-border/50 py-2">
                  <span className="font-serif text-xs text-muted-foreground">{String(oi + 1).padStart(2, "0")}</span>
                  <span className="text-[11px] uppercase tracking-[0.18em]">{o}</span>
                </li>
              ))}
            </ul>
            <p className="mt-auto text-[10px] leading-relaxed text-muted-foreground">
              Selections are confirmed on the survey visit and priced into your estimate.
            </p>
          </div>
        ),
      });
    });

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
  }, [entry, category, groups, plates, metaBits, price, tool, brandNote, added, add, navigate, portrait]);

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
