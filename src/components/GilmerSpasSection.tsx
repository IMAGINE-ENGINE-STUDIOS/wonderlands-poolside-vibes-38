import { useState } from "react";
import { gilmerSpas } from "@/data/gilmerSpas";
import GilmerSpaCard from "./GilmerSpaCard";
import SurveyQuoteTool from "./SurveyQuoteTool";
import type { GilmerSpa } from "@/data/gilmerSpas";
import RacebandBanner from "./RacebandBanner";

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
          <RacebandBanner title="Glimmerglass Spas" subtitle="Fiberglass spas & spillovers — lifetime warranty" variant="teal" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {gilmerSpas.map(spa => <GilmerSpaCard key={spa.model} spa={spa} onRequestQuote={handleRequestQuote} />)}
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/5 to-teal/5">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Lifetime Warranty</h3>
              <p className="text-sm text-muted-foreground">
                All Gilmer Glass spas come with a comprehensive lifetime warranty
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-coral/5 to-primary/5">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-coral/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Custom Colors</h3>
              <p className="text-sm text-muted-foreground">
                Choose from multiple premium color options to match your style
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-teal/5 to-coral/5">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Fast Installation</h3>
              <p className="text-sm text-muted-foreground">
                Quick and professional installation by certified experts
              </p>
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