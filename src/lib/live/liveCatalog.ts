/**
 * Wonderlands Live catalog — the ENTIRE main-menu product list, loaded into
 * the live video tool so a host can showcase any product mid-meeting, plus
 * the widget library (the platform's own tools, loaded natively on every
 * participant's device when the host puts them on the shared stage).
 * Credits: Imagine Engine Studios Corp.
 */
import { poolProductLookup, type PoolProductInfo } from "@/data/poolProductLookup";
import { ALL_BOARDS, suiteRoute } from "@/lib/suiteRoutes";
import { studioScreenEnclosures, studioFencing, studioLanai } from "@/data/studioCategoryProducts";
import { poolFinishes } from "@/data/consolidatedProducts";
import { pebbleTecFinishes } from "@/data/pebbleTecFinishes";
import { solarProducts } from "@/data/solarData";
import { landscapingPlants } from "@/data/landscapingData";
import { paverTypes } from "@/data/paverData";
import { artificialGrassOptions, getGrassPricePerSqFt } from "@/data/artificialGrassData";
import { poolLiners } from "@/data/poolData";

export interface LiveProduct extends PoolProductInfo {
  key: string;
  /** Price is carried for quotes but never shown in the tab (e.g. Solar —
   *  the main page prints no prices for it). */
  hidePrice?: boolean;
}

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The main-page categories the lookup does not carry, sourced from the
 *  same in-code catalogs their main-page sections render. */
const extraProducts: LiveProduct[] = [
  ...studioScreenEnclosures.map((e) => ({
    key: `screen-enclosure-${slugify(e.name)}`,
    name: e.name,
    brand: "Wonderlands",
    category: "Screen Enclosures",
    price: e.price,
    image: e.image,
    dimensions: "Custom fit",
    depth: "N/A",
  })),
  ...studioFencing.map((e) => ({
    key: `patio-fencing-${slugify(e.name)}`,
    name: e.name,
    brand: "Wonderlands",
    category: "Patio Fencing",
    price: e.price,
    image: e.image,
    dimensions: "Custom fit",
    depth: "N/A",
  })),
  ...studioLanai.map((e) => ({
    key: `lanai-${slugify(e.name)}`,
    name: e.name,
    brand: "Wonderlands",
    category: "Lanai",
    price: e.price,
    image: e.image,
    dimensions: "Custom fit",
    depth: "N/A",
  })),
  ...paverTypes
    .filter((pv) => pv.category === "paver")
    .map((pv) => ({
      key: `paver-${pv.id}`,
      name: pv.name,
      brand: "Wonderlands",
      category: "Pavers",
      price: pv.basePrice,
      image: pv.image,
      dimensions: "Priced per sq ft",
      depth: "N/A",
    })),
  ...artificialGrassOptions.map((g) => ({
    key: `grass-${g.id}`,
    name: g.name,
    brand: "Wonderlands",
    category: "Artificial Grass",
    price: getGrassPricePerSqFt(g.name),
    image: g.image,
    dimensions: "Priced per sq ft",
    depth: "N/A",
  })),
  ...landscapingPlants.map((pl, i) => ({
    key: `plant-${slugify(pl.name)}-${i}`,
    name: pl.name,
    brand: "Wonderlands",
    category: "Landscaping",
    price: Math.round(pl.minPrice),
    image: pl.image,
    dimensions: pl.category,
    depth: "N/A",
  })),
  ...poolFinishes.map((f) => ({
    key: `finish-${f.id}`,
    name: f.name,
    brand: f.collection ?? "Latham",
    category: "Finishes",
    price: f.price,
    image: f.image,
    dimensions: f.collection ?? "",
    depth: "N/A",
  })),
  ...pebbleTecFinishes.map((f) => ({
    key: `finish-pebble-${slugify(f.name)}-${slugify(f.collection)}`,
    name: f.name,
    brand: "Pebble Tec",
    category: "Finishes",
    price: 0,
    hidePrice: true,
    image: f.image,
    dimensions: f.collection,
    depth: "N/A",
  })),
  ...poolLiners.map((l) => ({
    key: `liner-${slugify(l.name)}`,
    name: l.name,
    brand: "Latham",
    category: "Liners",
    price: l.price,
    image: l.image,
    dimensions: "Custom fit",
    depth: "N/A",
  })),
  ...solarProducts.map((sp) => ({
    key: `solar-${sp.id}`,
    name: sp.name,
    brand: "Wonderlands Solar",
    category: "Solar",
    price: sp.price,
    hidePrice: true,
    image: sp.image,
    dimensions: sp.spec,
    depth: "N/A",
  })),
];

export const LIVE_PRODUCTS: LiveProduct[] = [
  ...Object.entries(poolProductLookup).map(([key, p]) => ({ key, ...p })),
  ...extraProducts,
];

export const LIVE_PRODUCT_GROUPS: Array<{ category: string; products: LiveProduct[] }> = (() => {
  const order = [
    "Pool", "Spa", "Tanning Ledge", "Sauna", "Cover", "Driveway Gate",
    "Screen Enclosures", "Patio Fencing", "Lanai", "Pavers",
    "Artificial Grass", "Landscaping", "Finishes", "Liners", "Solar",
  ];
  const byCat = new Map<string, LiveProduct[]>();
  // The lookup carries alias keys for search matching ("moondance spillover
  // spa" = "Moondance Spillover"); the picker shows each product once —
  // first key per display name wins. LIVE_PRODUCTS itself is untouched.
  const seenNames = new Set<string>();
  for (const p of LIVE_PRODUCTS) {
    const dedupeKey =
      p.category === "Finishes" || p.category === "Landscaping"
        ? `${p.category}|${p.name}|${p.dimensions}`
        : `${p.category}|${p.name}`;
    if (seenNames.has(dedupeKey)) continue;
    seenNames.add(dedupeKey);
    const list = byCat.get(p.category) ?? [];
    list.push(p);
    byCat.set(p.category, list);
  }
  return [...byCat.entries()]
    .sort((a, b) => {
      const ia = order.indexOf(a[0]), ib = order.indexOf(b[0]);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map(([category, products]) => ({ category, products }));
})();

export const liveProduct = (key?: string | null): LiveProduct | null =>
  LIVE_PRODUCTS.find((p) => p.key === key) ?? null;

/* ------------------------------------------------------------------ */
/* Widget library — every entry loads LOCALLY on each participant's    */
/* device (never screen-shared), so it runs at full native speed.      */
/* ------------------------------------------------------------------ */

export type LiveWidgetKind = "showcase" | "route";

export interface LiveWidget {
  id: string;
  title: string;
  blurb: string;
  kind: LiveWidgetKind;
  /** For kind "route": the in-app path every client loads in the stage. */
  route?: string;
}

export const LIVE_WIDGETS: LiveWidget[] = [
  {
    id: "product-showcase",
    title: "Product Showcase",
    blurb: "Any product from the catalog, presented together — selections stay in sync.",
    kind: "showcase",
  },
  {
    id: "design-studio",
    title: "Wonderlands Design Studio",
    blurb: "The full 2D/3D studio. Unlock interaction so guests can pick textures and features themselves.",
    kind: "route",
    route: "/design-studio",
  },
  {
    id: "flip",
    title: "FLIP Collection Book",
    blurb: "The main-page FLIP book — every collection and every product, turned page by page together.",
    kind: "route",
    route: "/live-flip",
  },
  {
    id: "pool-calculator",
    title: "Pool Calculator",
    blurb: "Live project calculator, loaded natively for every guest.",
    kind: "route",
    route: "/pool-calculator",
  },
  {
    id: "quote",
    title: "Quote Tool",
    blurb: "The itemized quotation tool, ready to fill in together.",
    kind: "route",
    route: "/quote",
  },
  {
    id: "landscaping",
    title: "Landscaping Studio",
    blurb: "Landscape looks, real plants and live pricing on every device.",
    kind: "route",
    route: "/landscaping",
  },
  {
    id: "solar-board",
    title: "Solar Board",
    blurb: "The Wonderlands Solar planning board.",
    kind: "route",
    route: "/solar-board",
  },
  // Every main-menu discipline suite is also a shareable widget.
  ...ALL_BOARDS.map((b) => ({
    id: `suite:${b.id}`,
    title: `${b.label} Suite`,
    blurb: `The ${b.label} configuration suite from the main menu.`,
    kind: "route" as LiveWidgetKind,
    route: suiteRoute(b.id),
  })),
];

export const liveWidget = (id?: string | null): LiveWidget | null =>
  LIVE_WIDGETS.find((w) => w.id === id) ?? null;
