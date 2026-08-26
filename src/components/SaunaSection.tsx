import { saunas } from "@/data/saunaData";
import SaunaProductCard from "./SaunaProductCard";
import ProductScrollRow from "./ProductScrollRow";
import EditorialSectionHeader from "./EditorialSectionHeader";
import { Link } from "react-router-dom";
const SaunaSection = () => {
  return <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <EditorialSectionHeader
          eyebrow="Volume III — Heat"
          title="Premium Saunas"
          description="Barrel and traditional cabins — a wellness sanctuary composed for the garden."
        />

        {/* Entry to the dedicated sauna suite (full configuration + pad board) */}
        <div className="mb-6">
          <Link
            to="/suites/saunas"
            className="inline-block border border-border/70 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground/5"
          >
            Open the sauna suite
          </Link>
        </div>


        <ProductScrollRow className="mb-8">
          {saunas.map(sauna => <SaunaProductCard key={sauna.id} sauna={sauna} />)}
        </ProductScrollRow>


        <div className="mt-12 text-center">
          <div className="inline-block border border-border/70 p-6 max-w-3xl">
            <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground mb-2">Special Offer</p>
            <h3 className="font-serif text-xl font-light mb-2 text-foreground">Sauna Bundle Offers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a sauna to your premium pool purchase (Astoria, Genesis, Claremont, or Extreme 38 models over $70,000) 
              and get exclusive pricing or complimentary installation!
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              * Offer valid for eligible pool purchases. See product cards for details.
            </p>
          </div>
        </div>
      </div>
    </section>;
};
export default SaunaSection;
