import * as React from "react";
import { useLocation } from "react-router-dom";
import ProductSuite, { type SuiteModel } from "@/components/product-suite/ProductSuite";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { ProductType } from "@/config/productFeatures";

import screenPremium from "@/assets/enclosures/screen-enclosure-premium.webp";
import screenDeluxe from "@/assets/enclosures/screen-enclosure-deluxe.webp";
import lanaiStandard from "@/assets/enclosures/lanai-standard.webp";
import lanaiDeluxe from "@/assets/enclosures/lanai-deluxe.webp";
import lanaiPremium from "@/assets/enclosures/lanai-premium.webp";
import aluminumFencing from "@/assets/fencing/aluminum-fencing.webp";
import aluminumPanel from "@/assets/fencing/aluminum-panel-2.webp";

/**
 * Enclosure Suite — /suites/enclosures
 * -----------------------------------------------------------------------------
 * WHAT: one professional home for the three aluminium trades that frame the
 * pool deck — screen enclosures, lanai roofs and patio fencing. Each discipline
 * carries its own model list, its own additional-feature configurator, live
 * pricing, the shared shopping list and every drawing board in the trade
 * (Enclosure Drawing Board, Lanai Board, Fence Board) plus the full Wonderlands
 * Studio entry.
 *
 * WHY: these three previously lived only as homepage scroll rows with bespoke
 * dialogs and no shared drafting surface. The suite gives them the same depth
 * the pool, sauna and spa suites already have.
 *
 * HOW: the shared `ProductSuite` shell is mounted once for the active
 * discipline (so there is a single header, cart and quote path) and the
 * discipline switcher is injected into its masthead. Rates are the same figures
 * the homepage sections publish — no pricing logic is duplicated here.
 */

type Discipline = {
  id: string;
  /** Switcher label */
  tab: string;
  categoryLabel: string;
  productType: ProductType;
  eyebrow: string;
  title: string;
  blurb: string;
  /** Printed after every figure, e.g. "/sq ft" */
  unitSuffix: string;
  models: SuiteModel[];
};

/** Every drafting surface the suite can open, whichever trade is active. */
const BOARDS = [
  { id: "screen-enclosures", label: "Enclosure board" },
  { id: "lanai", label: "Lanai board" },
  { id: "patio-fencing", label: "Fence board" },
];

const DISCIPLINES: Discipline[] = [
  {
    id: "screen-enclosures",
    tab: "Screen Enclosures",
    categoryLabel: "Screen Enclosures",
    productType: "screen-enclosure",
    eyebrow: "Wonderlands · Aluminium",
    title: "The Enclosure Suite",
    blurb:
      "Screen cages, lanai roofs and pool-code fencing drawn on one board. Choose the system, configure the frame, the mesh and the doors, then trace the footprint at true scale and read the engineered figure.",
    unitSuffix: "/sq ft",
    models: [
      {
        id: "standard",
        name: "Standard Screen Enclosure",
        price: 22,
        image: screenDeluxe,
        brand: "Aluminium Frame",
        meta: "Standard mesh · 5-year warranty",
        description:
          "Aluminium frame screen enclosure with standard mesh screening, engineered to Florida wind load.",
        features: ["Aluminium Frame", "Standard Screen Mesh", "Basic Hardware", "5-Year Warranty"],
      },
      {
        id: "deluxe",
        name: "Deluxe Screen Enclosure",
        price: 24,
        image: screenDeluxe,
        brand: "Aluminium Frame",
        meta: "Premium mesh · 10-year warranty",
        description: "Enhanced aluminium frame with upgraded mesh and hardware.",
        features: [
          "Enhanced Aluminium Frame",
          "Premium Screen Mesh",
          "Upgraded Hardware",
          "10-Year Warranty",
        ],
      },
      {
        id: "premium",
        name: "Premium Screen Enclosure",
        price: 26,
        image: screenPremium,
        brand: "Aluminium Frame",
        meta: "Impact screen · Lifetime warranty",
        description:
          "Top-tier aluminium construction with impact-resistant screening and premium finishes.",
        features: [
          "Heavy-Duty Aluminium Frame",
          "Impact-Resistant Screen",
          "Premium Hardware",
          "Custom Colour Options",
          "Lifetime Warranty",
        ],
      },
    ],
  },
  {
    id: "lanai",
    tab: "Lanai & Roofs",
    categoryLabel: "Lanai Enclosures",
    productType: "screen-enclosure",
    eyebrow: "Wonderlands · Shade",
    title: "The Lanai Suite",
    blurb:
      "Aluminium frame lanai systems with the foundation, framing and solid roof included. Set the projection on the board, choose the foundation and read the covered footprint.",
    unitSuffix: "/sq ft",
    models: [
      {
        id: "standard",
        name: "Standard Lanai",
        price: 60,
        image: lanaiStandard,
        brand: "Roof & Frame",
        meta: "Solid roof · 5-year warranty",
        description:
          "Complete aluminium frame patio cover with solid roof, foundation and framing.",
        features: [
          "Paver or concrete foundation included",
          "Aluminium frame construction",
          "Complete roof framing and installation",
          "Solid roof panels",
          "White or black colour options",
        ],
      },
      {
        id: "deluxe",
        name: "Deluxe Lanai",
        price: 80,
        image: lanaiDeluxe,
        brand: "Roof & Frame",
        meta: "Insulated roof · 10-year warranty",
        description:
          "Upgraded lanai system with heavier framing, insulated roof panels and premium hardware.",
        features: [
          "Foundation included",
          "Heavier aluminium framing",
          "Insulated roof panels",
          "Premium hardware",
          "10-year warranty",
        ],
      },
      {
        id: "premium",
        name: "Premium Lanai",
        price: 100,
        image: lanaiPremium,
        brand: "Roof & Frame",
        meta: "Engineered span · Lifetime warranty",
        description:
          "Engineered long-span lanai with the highest specification frame, roof and finish package.",
        features: [
          "Foundation included",
          "Engineered long-span frame",
          "Insulated roof with finished ceiling",
          "Integrated lighting provision",
          "Lifetime warranty",
        ],
      },
    ],
  },
  {
    id: "patio-fencing",
    tab: "Fencing & Gates",
    categoryLabel: "Patio Fencing",
    productType: "driveway-gate",
    eyebrow: "Wonderlands · Boundary",
    title: "The Fencing Suite",
    blurb:
      "Pool-code aluminium fencing with self-latching gates. Draw the runs on the fence board, place the doors where they belong and read the linear footage and the code notes.",
    unitSuffix: "/linear ft",
    models: [
      {
        id: "36",
        name: '36" Aluminium Fence',
        price: 40,
        image: aluminumFencing,
        brand: "Powder-coated aluminium",
        meta: "36 in · pool-code gate",
        description: "Pool code compliant 36-inch aluminium fencing with standard spacing.",
        features: ["Pool Code Door", "Standard Spacing", "Full Assembly", "Powder Coated Finish"],
      },
      {
        id: "46",
        name: '46" Aluminium Fence',
        price: 50,
        image: aluminumPanel,
        brand: "Powder-coated aluminium",
        meta: "46 in · pool-code gate",
        description: "Pool code compliant 46-inch aluminium fencing with standard spacing.",
        features: ["Pool Code Door", "Standard Spacing", "Full Assembly", "Powder Coated Finish"],
      },
      {
        id: "56",
        name: '56" Aluminium Fence',
        price: 60,
        image: aluminumFencing,
        brand: "Powder-coated aluminium",
        meta: "56 in · enhanced security",
        description: "Premium 56-inch aluminium fencing with enhanced security and standard spacing.",
        features: [
          "Pool Code Door",
          "Standard Spacing",
          "Full Assembly",
          "Powder Coated Finish",
          "Enhanced Security",
        ],
      },
    ],
  },
];

const EnclosureSuite = () => {
  /* The active trade survives a reload, like every other cached UI state. */
  const [activeId, setActiveId] = usePersistentState<string>(
    "suite_enclosures_discipline",
    DISCIPLINES[0].id,
  );
  const active = DISCIPLINES.find((d) => d.id === activeId) ?? DISCIPLINES[0];

  /* /suites/lanai and /suites/fencing open straight onto their own trade */
  const { pathname } = useLocation();
  React.useEffect(() => {
    if (pathname.endsWith("/lanai")) setActiveId("lanai");
    else if (pathname.endsWith("/fencing")) setActiveId("patio-fencing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const switcher = (
    <nav aria-label="Choose a trade" className="inline-flex w-fit max-w-full flex-wrap gap-px bg-border/60">
      {DISCIPLINES.map((d) => {
        const on = d.id === active.id;
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => setActiveId(d.id)}
            aria-current={on ? "true" : undefined}
            className={`px-5 py-3 text-[10px] uppercase tracking-[0.3em] transition-colors ${
              on
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.tab}
          </button>
        );
      })}
    </nav>
  );

  return (
    <ProductSuite
      /* remount per trade so the cached model + options are per discipline */
      key={active.id}
      categoryId={active.id}
      categoryLabel={active.categoryLabel}
      productType={active.productType}
      eyebrow={active.eyebrow}
      title={active.title}
      blurb={active.blurb}
      unitSuffix={active.unitSuffix}
      models={active.models}
      mastheadSlot={switcher}
      boards={BOARDS}
    />
  );
};

export default EnclosureSuite;
