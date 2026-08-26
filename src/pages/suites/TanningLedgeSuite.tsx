import * as React from "react";
import ProductSuite, { type SuiteModel } from "@/components/product-suite/ProductSuite";
import { tanningLedges } from "@/data/poolData";

/**
 * Tanning Ledge Suite — /suites/tanning-ledges
 * Latham and GlimmerGlass sun shelves in the shared suite shell, grouped by
 * brand in the carousel. Board: Sun Shelf Board. Options come from the
 * 'tanning-ledge' catalogue in `src/config/productFeatures.ts`.
 */
const TanningLedgeSuite = () => {
  const models: SuiteModel[] = React.useMemo(
    () =>
      tanningLedges.map((l) => ({
        id: `${l.brand}-${l.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: l.name,
        price: l.price,
        image: l.image,
        brand: l.brand,
        dimensions: l.dimensions,
        depth: l.depth,
        description: l.description,
        features: l.features,
      })),
    [],
  );

  return (
    <ProductSuite
      categoryId="tanning-ledges"
      categoryLabel="Tanning Ledges"
      productType="tanning-ledge"
      eyebrow="Wonderlands · Sun Shelves"
      title="The Tanning Ledge Suite"
      blurb="Shallow sun shelves from Latham and GlimmerGlass, drawn onto the plan and configured with the finish, bubblers, umbrella sleeves and deck that frame them."
      models={models}
      groupBy={(m) => m.brand ?? "Wonderlands"}
    />
  );
};

export default TanningLedgeSuite;
