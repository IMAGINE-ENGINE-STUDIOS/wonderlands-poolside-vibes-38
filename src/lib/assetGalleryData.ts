// Asset gallery adapter: turns every Wonderlands Studio additional feature of a
// FLIP category into console-shaped entries, grouped by feature chapter.
// Lazily imported and memoised so the gallery page stays light and fast.

import type { ConsoleEntry } from "@/components/flip/flipConsoleData";

export type FeatureSection = { title: string; note: string; entries: ConsoleEntry[] };

const cache = new Map<string, FeatureSection[]>();
const inFlight = new Map<string, Promise<FeatureSection[]>>();

export function getCachedFeatureSections(categoryId: string): FeatureSection[] | undefined {
  return cache.get(categoryId);
}

export function loadFeatureSections(categoryId: string): Promise<FeatureSection[]> {
  const cached = cache.get(categoryId);
  if (cached) return Promise.resolve(cached);
  const pending = inFlight.get(categoryId);
  if (pending) return pending;
  const task = resolve(categoryId)
    .then((list) => {
      cache.set(categoryId, list);
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

async function resolve(categoryId: string): Promise<FeatureSection[]> {
  const { getStudioFeatureGroups } = await import("@/lib/flipStudioFeatures");
  const groups = getStudioFeatureGroups(categoryId);
  return groups
    .map((g) => ({
      title: g.title,
      note: g.note,
      entries: g.items.map((item, i) => ({
        id: `${categoryId}-${g.title}-${item.label}-${i}`,
        name: item.label,
        image: item.image ?? "",
        color: item.color,
        priceLabel: item.priceLabel,
        price: item.price,
        unit: item.unit === "sqft" ? ("sqft" as const) : ("each" as const),
        meta: item.note,
        brand: g.title,
      })),
    }))
    .filter((s) => s.entries.length > 0);
}
