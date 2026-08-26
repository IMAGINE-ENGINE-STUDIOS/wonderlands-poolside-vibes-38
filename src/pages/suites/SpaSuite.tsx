import * as React from "react";
import ProductSuite, { type SuiteModel } from "@/components/product-suite/ProductSuite";
import { gilmerSpas } from "@/data/gilmerSpas";

/**
 * Spa Suite — /suites/spas
 * Same shell as the sauna and tanning ledge suites. Spa models come from
 * `src/data/gilmerSpas.ts`; the additional features come from the shared
 * 'spa' catalogue in `src/config/productFeatures.ts`. Board: Spa Plan Board.
 */
const SpaSuite = () => {
  const models: SuiteModel[] = React.useMemo(
    () =>
      gilmerSpas.map((s) => ({
        id: s.model.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: s.model,
        price: s.price,
        image: s.image,
        brand: s.brand,
        dimensions: s.dimensions,
        depth: s.depth,
        description: `${s.type} — ${s.warranty}. Installed in roughly ${s.installationTimeWeeks} weeks.`,
        features: s.features,
        meta: s.type,
      })),
    [],
  );

  return (
    <ProductSuite
      categoryId="spas"
      categoryLabel="Spas"
      productType="spa"
      eyebrow="Wonderlands · Hydrotherapy"
      title="The Spa Suite"
      blurb="Spillover and standalone fiberglass spas, configured against the deck they sit on — heating, jets, finish, coping and the surface around them."
      models={models}
      groupBy={(m) => m.meta ?? "Spa"}
    />
  );
};

export default SpaSuite;
