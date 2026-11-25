import { kitchens } from "@/data/kitchenData";
import KitchenProductCard from "./KitchenProductCard";
import ProductScrollRow from "./ProductScrollRow";
import SuiteEntryHeader from "./product/SuiteEntryHeader";

// Outdoor kitchens on the Wonderlands home page, in the same section and
// card build as the other collections: the standard product card, fed by
// the kitchen section of the quote tool. The row presents the kitchens
// we sell: the 36 Belgard sets first, then the appliances, the stainless
// fronts and the granite line every build is priced from. The sets carry
// no price here or anywhere until their own take off is counted: no
// Belgard dealer price list is held, and no figure is invented for them.

const KitchenSection = () => {
  const presented = [
    ...kitchens.filter((k) => k.group === "Kitchen sets"),
    ...kitchens.filter((k) => k.group === "Appliances"),
    ...kitchens.filter((k) => k.group === "Stainless fronts"),
    ...kitchens.filter((k) => k.id === "granite-countertop-backsplash"),
  ];
  return (
    <section className="bg-background py-12">
      <div className="container mx-auto px-4">
        <SuiteEntryHeader
          eyebrow="Volume IV — Fire"
          title="Outdoor Kitchens"
          description="Stone block bodies with stainless fronts, or marine grade cabinetry, with granite tops, brand grills and every chain priced in the open."
          suiteHref="/suites/kitchens"
          suiteLabel="Enter the kitchen suite"
        />

        <ProductScrollRow className="mb-8">
          {presented.map((product) => (
            <KitchenProductCard key={product.id} product={product} />
          ))}
        </ProductScrollRow>
      </div>
    </section>
  );
};

export default KitchenSection;
