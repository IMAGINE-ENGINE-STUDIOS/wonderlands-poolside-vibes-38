/**
 * Wonderlands Live catalog — the ENTIRE main-menu product list, loaded into
 * the live video tool so a host can showcase any product mid-meeting, plus
 * the widget library (the platform's own tools, loaded natively on every
 * participant's device when the host puts them on the shared stage).
 * Credits: Imagine Engine Studios Corp.
 */
import { poolProductLookup, type PoolProductInfo } from "@/data/poolProductLookup";
import { ALL_BOARDS, suiteRoute } from "@/lib/suiteRoutes";

export interface LiveProduct extends PoolProductInfo {
  key: string;
}

export const LIVE_PRODUCTS: LiveProduct[] = Object.entries(poolProductLookup).map(
  ([key, p]) => ({ key, ...p }),
);

export const LIVE_PRODUCT_GROUPS: Array<{ category: string; products: LiveProduct[] }> = (() => {
  const order = ["Pool", "Spa", "Tanning Ledge", "Sauna", "Cover", "Driveway Gate"];
  const byCat = new Map<string, LiveProduct[]>();
  for (const p of LIVE_PRODUCTS) {
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
    blurb: "The Wonderlands collections book, page by page on every screen.",
    kind: "route",
    route: "/flip",
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
