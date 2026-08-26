import * as React from "react";
import ProductSuite, { type SuiteModel } from "@/components/product-suite/ProductSuite";
import { saunas } from "@/data/saunaData";

/**
 * Sauna Suite — /suites/saunas
 * Uses the shared ProductSuite shell so saunas get the same dropdown +
 * carousel option mechanism as the fiberglass pools, plus the Sauna Pad Board.
 * Models come straight from `src/data/saunaData.ts` (turnkey retail prices).
 */
const SaunaSuite = () => {
  const models: SuiteModel[] = React.useMemo(
    () =>
      saunas.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        image: s.image,
        brand: "Almost Heaven Saunas",
        dimensions: s.dimensions,
        description: s.description,
        features: s.features,
        meta: `${s.capacity} · ${s.heaterPower}`,
      })),
    [],
  );

  return (
    <ProductSuite
      categoryId="saunas"
      categoryLabel="Saunas"
      productType="sauna"
      eyebrow="Wonderlands · Heat"
      title="The Sauna Suite"
      blurb="Barrel, cabin and panorama cabins from Almost Heaven Saunas, configured line by line — heater, control, stones, door, glass and the cold plunge that follows the heat."
      models={models}
    />
  );
};

export default SaunaSuite;
