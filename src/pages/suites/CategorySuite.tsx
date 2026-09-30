import * as React from "react";
import { Navigate, useParams } from "react-router-dom";
import ProductSuite, { type SuiteModel } from "@/components/product-suite/ProductSuite";
import { ITEMS } from "@/components/FlipIndex";
import { loadCategoryEntries, getCachedCategoryEntries, type ConsoleEntry } from "@/components/flip/flipConsoleData";
import type { ProductType } from "@/config/productFeatures";
import { DEDICATED_SUITES } from "@/lib/suiteRoutes";

/**
 * Category Suite — /suites/:category
 * Generic suite for every discipline without a dedicated page (pools, concrete,
 * solar, pavers, grass, landscaping, covers, gates, finishes, liners). Models come
 * from the same catalogue the FLIP magazine reads (flipConsoleData), so nothing is
 * duplicated; board + quote come from the shared ProductSuite shell.
 */
const TYPE: Record<string, ProductType> = {
  pools: "pool", "concrete-pools": "pool", covers: "cover", pavers: "paver",
  "driveway-gates": "driveway-gate", finishes: "pool", liners: "pool",
};
const UNIT: Record<string, string> = { sqft: "/sq ft", "linear-ft": "/lf" };

const CategorySuite = () => {
  const { category = "" } = useParams();
  const item = ITEMS.find((i) => i.id === category);
  const [entries, setEntries] = React.useState<ConsoleEntry[]>(() => getCachedCategoryEntries(category) ?? []);

  React.useEffect(() => {
    let live = true;
    loadCategoryEntries(category).then((e) => live && setEntries(e));
    return () => { live = false; };
  }, [category]);

  const models: SuiteModel[] = React.useMemo(
    () => entries.map((e) => ({ id: e.id, name: e.name, price: e.price ?? 0, image: e.image, brand: e.brand, meta: e.meta ?? e.brand })),
    [entries],
  );

  if (DEDICATED_SUITES[category]) return <Navigate to={DEDICATED_SUITES[category]} replace />;
  if (!item) return <Navigate to="/" replace />;

  return (
    <ProductSuite
      key={category + (models.length ? "-ready" : "")}
      categoryId={category}
      categoryLabel={item.label}
      productType={TYPE[category] ?? "scene"}
      eyebrow={`Wonderlands · ${item.tagline}`}
      title={`The ${item.label} Suite`}
      blurb={item.description}
      models={models}
      groupBy={(m) => m.meta ?? item.label}
      unitSuffix={UNIT[entries[0]?.unit ?? ""] ?? ""}
    />
  );
};

export default CategorySuite;
