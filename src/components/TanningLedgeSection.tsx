import React, { useState } from "react";
import TanningLedgeProductCard from "./TanningLedgeProductCard";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
import EditorialSectionHeader from "./EditorialSectionHeader";
import { lathamTanningLedges, glimmerglassTanningLedges, tanningLedges } from "@/data/poolData";

// Import GlimmerGlass images
import paradiseImg from "@/assets/tanning-ledges/glimmerglass-paradise.webp";
import leewardImg from "@/assets/tanning-ledges/glimmerglass-leeward.webp";
import leisureImg from "@/assets/tanning-ledges/glimmerglass-leisure.webp";

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
          <EditorialSectionHeader
            eyebrow="Volume II — Sun Shelf"
            title="Tanning Ledges"
            description="The ideal shallow plane — drawn for lounging, reading and long afternoons of sun."
          />

          {/* Latham Tanning Ledges Section */}
          <div className="mb-16">
            <div className="mb-8 border-b border-border/60 pb-4">
              <p className="mb-2 text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Chapter I</p>
              <h3 className="font-serif text-2xl font-light tracking-tight text-foreground sm:text-3xl">Latham Tanning Ledges</h3>
            </div>
            <ProductScrollRow className="mb-8">
              {lathamLedgesWithCategory.map((ledge) => (
                <TanningLedgeProductCard
                  key={ledge.name}
                  ledge={ledge}
                  onViewDetails={handleViewDetails}
                  onRequestQuote={handleRequestQuote}
                />
              ))}
            </ProductScrollRow>
          </div>

          {/* GlimmerGlass Tanning Ledges Section */}
          <div>
            <div className="mb-8 border-b border-border/60 pb-4">
              <p className="mb-2 text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Chapter II</p>
              <h3 className="font-serif text-2xl font-light tracking-tight text-foreground sm:text-3xl">GlimmerGlass Tanning Ledges</h3>
            </div>
            <ProductScrollRow className="mb-8">
              {glimmerglassLedgesWithCategory.map((ledge) => (
                <TanningLedgeProductCard
                  key={ledge.name}
                  ledge={ledge}
                  onViewDetails={handleViewDetails}
                  onRequestQuote={handleRequestQuote}
                />
              ))}
            </ProductScrollRow>
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