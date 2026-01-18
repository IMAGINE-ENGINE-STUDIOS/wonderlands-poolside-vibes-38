import React, { useState } from "react";
import TanningLedgeProductCard from "./TanningLedgeProductCard";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { tanningLedges } from "@/data/poolData";

interface TanningLedge {
  name: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image: string;
  description: string;
  dimensions: string;
  depth: string;
  features: string[];
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
}

const TanningLedgeSection = () => {
  const [selectedLedge, setSelectedLedge] = useState<TanningLedge | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<any>(null);

  const handleViewDetails = (ledge: TanningLedge) => {
    setSelectedLedge(ledge);
  };

const handleRequestQuote = (ledge: TanningLedge, extras?: any) => {
  setSelectedLedge(ledge);
  setSelectedExtras(extras || null);
  setShowQuoteModal(true);
};

  // Listen for search events to open specific tanning ledges
  React.useEffect(() => {
    const handleOpenProduct = (event: CustomEvent) => {
      const { type, id, name } = event.detail;
      if (type === 'tanning ledge' || type === 'tanning' || type === 'ledge') {
        const ledge = tanningLedges.find(l => 
          l.name.toLowerCase() === name?.toLowerCase() ||
          l.name.toLowerCase().includes(name?.toLowerCase())
        );
        if (ledge) {
          const mappedLedge = {
            ...ledge,
            category: 'premium' as const,
            installationTimeWeeks: 2,
            warrantyYears: 'LIFETIME'
          };
          setSelectedLedge(mappedLedge);
        }
      }
    };

    window.addEventListener('open-product', handleOpenProduct as EventListener);
    return () => window.removeEventListener('open-product', handleOpenProduct as EventListener);
  }, []);

  // Convert tanningLedges to include category for spa-like format
  const tanningLedgesWithCategory = tanningLedges.map(ledge => ({
    ...ledge,
    category: 'premium' as const,
    installationTimeWeeks: 2,
    warrantyYears: 'LIFETIME'
  }));

  return (
    <>
      <section className="py-12 px-4 bg-gradient-to-br from-background to-coral/5" data-tanning-ledge-section>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-coral via-orange to-amber-500">
              Tanning Ledges
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Add the perfect relaxation spot to your pool. Our tanning ledges provide the ideal shallow area for lounging and soaking up the sun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tanningLedgesWithCategory.map((ledge) => (
              <TanningLedgeProductCard
                key={ledge.name}
                ledge={ledge}
                onViewDetails={handleViewDetails}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>
        </div>
      </section>
      
<SurveyQuoteTool 
        pool={null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        customProduct={selectedLedge ? {
          name: `${selectedLedge.name} Tanning Ledge`,
          price: selectedLedge.price,
          type: 'tanning_ledge'
        } : undefined}
        extras={selectedExtras}
      />
    </>
  );
};

export default TanningLedgeSection;