import { saunas } from "@/data/saunaData";
import SaunaProductCard from "./SaunaProductCard";
const SaunaSection = () => {
  return <section id="saunas" className="py-20 bg-gradient-to-br from-amber-50/30 via-orange-50/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            Premium Saunas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your backyard into a wellness sanctuary with our premium barrel and traditional saunas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {saunas.map(sauna => <SaunaProductCard key={sauna.id} sauna={sauna} />)}
        </div>

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