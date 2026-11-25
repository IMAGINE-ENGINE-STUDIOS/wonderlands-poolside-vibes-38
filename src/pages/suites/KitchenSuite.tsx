import * as React from "react";
import ProductSuite, { type SuiteModel } from "@/components/product-suite/ProductSuite";
import { kitchens } from "@/data/kitchenData";

/**
 * Kitchen Suite — /suites/kitchens
 * Built in the pattern of the Sauna Suite: the shared ProductSuite shell
 * fed straight from the kitchen catalogue (src/data/kitchenData.ts), so
 * the suite, the home section and the quote tool can never diverge.
 * Prices are the pricing model's selling prices, computed from held
 * costs; costs themselves never appear on this surface.
 *
 * The suite carries every priced kitchen product: the appliances, the
 * stainless fronts, the full American Outdoor Cabinets list and the
 * granite line. The Belgard sets and the utility chains held as ranges
 * carry no model price, so they are not suite models; they live in the
 * quote tool's kitchen section with their gaps named.
 */
const KitchenSuite = () => {
  const models: SuiteModel[] = React.useMemo(
    () =>
      kitchens
        .filter((k) => typeof k.price === "number")
        .map((k) => ({
          id: k.id,
          name: k.name,
          price: k.price as number,
          image: k.image,
          brand: k.brand,
          description: k.description,
          features: k.features,
          meta: k.meta,
        })),
    [],
  );

  return (
    <ProductSuite
      categoryId="kitchens"
      categoryLabel="Outdoor Kitchens"
      productType="kitchen"
      eyebrow="Wonderlands · Fire"
      title="The Kitchen Suite"
      blurb="Grills, hoods, sinks and fridges, stainless fronts and marine grade cabinetry, configured line by line with the plumbing, the power, the permits and the installation priced in the open."
      models={models}
      groupBy={(m) => {
        const product = kitchens.find((k) => k.id === m.id);
        return product?.group ?? "Outdoor Kitchens";
      }}
    />
  );
};

export default KitchenSuite;
