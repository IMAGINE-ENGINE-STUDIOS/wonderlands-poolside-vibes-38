import React, { useState } from "react";
import TanningLedgeProductCard from "./TanningLedgeProductCard";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { lathamTanningLedges, glimmerglassTanningLedges, tanningLedges } from "@/data/poolData";

// Import GlimmerGlass images
import paradiseImg from "@/assets/tanning-ledges/glimmerglass-paradise.png";
import leewardImg from "@/assets/tanning-ledges/glimmerglass-leeward.png";
import leisureImg from "@/assets/tanning-ledges/glimmerglass-leisure.png";

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
  brand?: string;
}

// Map GlimmerGlass images
const glimmerglassImageMap: Record<string, string> = {
  'Paradise': paradiseImg,
  'Leeward': leewardImg,
  'Leisure': leisureImg,
};

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

  // Convert Latham tanning ledges
  const lathamLedgesWithCategory = lathamTanningLedges.map(ledge => ({
    ...ledge,
    category: 'premium' as const,
    installationTimeWeeks: 2,
    warrantyYears: 'LIFETIME'
  }));

  // Convert GlimmerGlass tanning ledges with correct images
  const glimmerglassLedgesWithCategory = glimmerglassTanningLedges.map(ledge => ({
    ...ledge,
    image: glimmerglassImageMap[ledge.name] || ledge.image,
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

          {/* Latham Tanning Ledges Section */}
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-foreground/90">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">Latham</span> Tanning Ledges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {lathamLedgesWithCategory.map((ledge) => (
                <TanningLedgeProductCard
                  key={ledge.name}
                  ledge={ledge}
                  onViewDetails={handleViewDetails}
                  onRequestQuote={handleRequestQuote}
                />
              ))}
            </div>
          </div>

          {/* GlimmerGlass Tanning Ledges Section */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-foreground/90">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">GlimmerGlass</span> Tanning Ledges
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {glimmerglassLedgesWithCategory.map((ledge) => (
                <TanningLedgeProductCard
                  key={ledge.name}
                  ledge={ledge}
                  onViewDetails={handleViewDetails}
                  onRequestQuote={handleRequestQuote}
                />
              ))}
            </div>
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