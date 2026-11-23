import { hansoLines } from "@/data/hansoPergolas";
import HansoProductCard from "./HansoProductCard";
import ProductScrollRow from "./ProductScrollRow";

// Hansø pergolas on the Wonderlands home page, in the same section and card
// build as the other collections: the standard product card, adapted so the
// size is the configuration. Prices are the hansohome.com list prices
// printed in the Hansø partner price list (Q4 2026).

const HansoPergolaSection = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <ProductScrollRow className="mb-8">
          {hansoLines.map((line) => (
            <HansoProductCard key={line.id} line={line} />
          ))}
        </ProductScrollRow>
      </div>
    </section>
  );
};

export default HansoPergolaSection;
