import { saunas } from "@/data/saunaData";
import SaunaProductCard from "./SaunaProductCard";
import ProductScrollRow from "./ProductScrollRow";
const SaunaSection = () => {
  return <section className="py-12 bg-gradient-to-br from-amber-50/30 via-orange-50/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your backyard into a wellness sanctuary with our premium barrel and traditional saunas
          </p>
        </div>

        <ProductScrollRow className="mb-8">
          {saunas.map(sauna => <SaunaProductCard key={sauna.id} sauna={sauna} />)}
        </ProductScrollRow>


        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6 max-w-3xl">
            <h3 className="text-xl font-bold mb-2 text-amber-600"> Special Sauna Bundle Offers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a sauna to your premium pool purchase (Astoria, Genesis, Claremont, or Extreme 38 models over $70,000) 
              and get exclusive pricing or complimentary installation!
            </p>
            <p className="text-xs text-muted-foreground">
              * Offer valid for eligible pool purchases. See product cards for details.
            </p>
          </div>
        </div>
      </div>
    </section>;
};
export default SaunaSection;