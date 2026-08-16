// Data adapter for the FLIP console. Each category resolves to a light,
// display-only entry list. Modules are dynamically imported so opening the
// console never bloats the initial page bundle.

export type ConsoleEntry = {
  id: string;
  name: string;
  image: string;
  price?: number;
  unit?: "sqft" | "linear-ft" | "each";
  meta?: string;
  brand?: string;
  /** Flat colour swatch when there is no photograph (e.g. gelcoat) */
  color?: string;
  /** Pre-formatted price line ("Included", "$15 / sq ft") */
  priceLabel?: string;
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatEntryPrice = (e: ConsoleEntry) => {
  if (e.priceLabel) return e.priceLabel;
  if (typeof e.price !== "number") return "";
  const suffix = e.unit === "sqft" ? " / sq ft" : e.unit === "linear-ft" ? " / linear ft" : "";
  return `${money(e.price)}${suffix}`;
};

const fromLookup = async (
  match: (category: string) => boolean,
): Promise<ConsoleEntry[]> => {
  const { getAllProducts } = await import("@/data/poolProductLookup");
  return getAllProducts()
    .filter((p) => match(p.category))
    .map((p, i) => ({
      id: `${p.name}-${i}`,
      name: p.name,
      image: p.image,
      price: p.price,
      unit: "each" as const,
      brand: p.brand,
      meta: [p.dimensions, p.depth].filter(Boolean).join(" · "),
    }))
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
};

/** In-memory cache so an edition is only resolved once per session. */
const entryCache = new Map<string, ConsoleEntry[]>();
const inFlight = new Map<string, Promise<ConsoleEntry[]>>();

export function getCachedCategoryEntries(categoryId: string): ConsoleEntry[] | undefined {
  return entryCache.get(categoryId);
}

export function loadCategoryEntries(categoryId: string): Promise<ConsoleEntry[]> {
  const cached = entryCache.get(categoryId);
  if (cached) return Promise.resolve(cached);
  const pending = inFlight.get(categoryId);
  if (pending) return pending;
  const task = resolveCategoryEntries(categoryId)
    .then((list) => {
      entryCache.set(categoryId, list);
      inFlight.delete(categoryId);
      return list;
    })
    .catch((err) => {
      inFlight.delete(categoryId);
      throw err;
    });
  inFlight.set(categoryId, task);
  return task;
}

async function resolveCategoryEntries(categoryId: string): Promise<ConsoleEntry[]> {
  switch (categoryId) {
    case "pools":
      return fromLookup((c) => c === "Pool");
    case "spas":
      return fromLookup((c) => c === "Spa");
    case "tanning-ledges":
      return fromLookup((c) => c === "Tanning Ledge");
    case "covers":
      return fromLookup((c) => c === "Cover");
    case "saunas": {
      const { saunas } = await import("@/data/saunaData");
      return saunas
        .map((s: any, i: number) => ({
          id: `${s.name}-${i}`,
          name: s.name,
          image: s.image,
          price: s.price,
          unit: "each" as const,
          meta: [s.capacity, s.dimensions].filter(Boolean).join(" · "),
        }))
        .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    }
    case "driveway-gates": {
      const { drivewayGates } = await import("@/data/drivewayGates");
      return drivewayGates.map((g: any, i: number) => ({
        id: `gate-${i}`,
        name: `${g.name ?? "Driveway Gate"} — ${g.baseDimensions}`,
        image: g.image ?? g.images?.[0],
        price: g.basePrice,
        unit: "each" as const,
        meta: g.baseDimensions,
      }));
    }
    case "screen-enclosures":
    case "patio-fencing":
    case "lanai": {
      const mod = await import("@/data/studioCategoryProducts");
      const list =
        categoryId === "screen-enclosures"
          ? mod.studioScreenEnclosures
          : categoryId === "patio-fencing"
            ? mod.studioFencing
            : mod.studioLanai;
      return list.map((p, i) => ({
        id: `${p.name}-${i}`,
        name: p.name,
        image: p.image,
        price: p.price,
        unit: p.unit ?? "each",
        meta: p.description,
      }));
    }
    case "pavers": {
      const { paverTypes } = await import("@/data/paverData");
      return paverTypes.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        price: p.basePrice,
        unit: "sqft" as const,
        meta: p.description,
      }));
    }
    case "artificial-grass": {
      const { artificialGrassOptions, getGrassPricePerSqFt } = await import(
        "@/data/artificialGrassData"
      );
      return artificialGrassOptions.map((g) => ({
        id: g.id,
        name: g.name,
        image: g.image,
        price: getGrassPricePerSqFt(g.name),
        unit: "sqft" as const,
        meta: "High-density turf, drainage base included",
      }));
    }
    case "landscaping": {
      const { landscapingPlants } = await import("@/data/landscapingData");
      return landscapingPlants.slice(0, 60).map((p: any) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        price: p.minPrice,
        unit: "each" as const,
        meta: p.category,
      }));
    }
    case "finishes": {
      const { poolTiles } = await import("@/data/poolData");
      return poolTiles.map((t: any, i: number) => ({
        id: `finish-${i}`,
        name: t.name,
        image: t.image,
        price: t.price,
        unit: "each" as const,
        meta: t.description,
      }));
    }
    case "liners": {
      const { poolLiners } = await import("@/data/poolData");
      return poolLiners.map((l: any, i: number) => ({
        id: `liner-${i}`,
        name: l.name,
        image: l.image,
        price: l.price,
        unit: "sqft" as const,
        meta: [l.type, l.description].filter(Boolean).join(" · "),
      }));
    }
    default:
      return [];
  }
}
