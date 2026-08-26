import { useState } from "react";
import { gilmerSpas } from "@/data/gilmerSpas";
import GilmerSpaCard from "./GilmerSpaCard";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
import EditorialSectionHeader from "./EditorialSectionHeader";
import type { GilmerSpa } from "@/data/gilmerSpas";
import { Link } from "react-router-dom";

interface SpaExtras {
  selectedColor?: string;
  extrasBreakdown?: Array<{name: string; price: number}>;
  extrasTotal?: number;
}

const GilmerSpasSection = () => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedSpa, setSelectedSpa] = useState<GilmerSpa | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [spaExtras, setSpaExtras] = useState<SpaExtras>({});
  
  const handleRequestQuote = (spa: GilmerSpa, extras: SpaExtras) => {
    setSelectedSpa(spa);
    setSelectedColor(extras.selectedColor || "");
    setSpaExtras(extras);
    setShowQuoteModal(true);
  };
  return <>
      <section id="gilmer-spas" className="py-12 px-4 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-7xl mx-auto">
          <EditorialSectionHeader
            eyebrow="Premium Spas & Spillovers"
            title="Gilmmerglass Spas"
            description="Fiberglass spas and spillover features — lifetime warranty, superior craftsmanship."
          />

          {/* Entry to the dedicated spa suite (full configuration + plan board) */}
          <div className="mb-8">
            <Link
              to="/suites/spas"
              className="inline-block border border-border/70 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-foreground transition-colors hover:bg-foreground/5"
            >
              Open the spa suite
            </Link>
          </div>


          <ProductScrollRow className="mb-12">
            {gilmerSpas.map(spa => <GilmerSpaCard key={spa.model} spa={spa} onRequestQuote={handleRequestQuote} />)}
          </ProductScrollRow>

          {/* Features Section — editorial guarantee plate */}
          <div className="mt-20 border border-border/60 bg-card/40">
            <div className="border-b border-border/60 px-6 py-4 md:px-10 md:py-5">
              <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
                The Glimmerglass Standard — 03 Guarantees
              </p>
            </div>
            <div className="grid grid-cols-1 divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                {
                  num: "01",
                  title: "Lifetime Warranty",
                  text: "All Gilmer Glass spas come with a comprehensive lifetime warranty"
                },
                {
                  num: "02",
                  title: "Custom Colors",
                  text: "Choose from multiple premium color options to match your style"
                },
                {
                  num: "03",
                  title: "Fast Installation",
                  text: "Quick and professional installation by certified experts"
                }
              ].map((item) => (
                <div
                  key={item.num}
                  className="p-6 md:p-10 text-center transition-colors duration-300 hover:bg-muted/20"
                >
                  <span className="inline-block mb-5 border border-border/60 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                    {item.num}
                  </span>
                  <h3 className="mb-3 font-serif text-2xl font-light tracking-tight text-foreground md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Tool */}
      <SurveyQuoteTool 
        pool={null} 
        isOpen={showQuoteModal} 
        onClose={() => setShowQuoteModal(false)} 
        customProduct={selectedSpa ? {
          name: `${selectedSpa.model}${selectedColor ? ` - ${selectedColor}` : ''}`,
          price: selectedSpa.price,
          type: 'spa',
          image: selectedSpa.image
        } : undefined}
        extras={spaExtras.extrasBreakdown && spaExtras.extrasBreakdown.length > 0 ? {
          extrasBreakdown: spaExtras.extrasBreakdown,
          extrasTotal: spaExtras.extrasTotal || 0
        } : undefined}
      />
    </>;
};
export default GilmerSpasSection;