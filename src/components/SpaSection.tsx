
import { useState } from "react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import PoolProductCard from "./PoolProductCard";
import SpaDetailModal from "./SpaDetailModal";
import { spas } from "@/data/spaData";

interface Spa {
  model: string;
  price: number;
  image?: string;
  category: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  spilloverFeature?: boolean;
  installationTimeWeeks?: number;
  warrantyYears?: number | string; // align with data and SpaDetailModal
}

// Update to match Pool interface
interface Pool extends Spa {
  finishes?: string[];
  liners?: string[];
  covers?: string[];
}

const SpaSection = () => {
  // selectedSpa can be Spa, since Pool extends Spa and we only consume shared fields
  const [selectedSpa, setSelectedSpa] = useState<Spa | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetails = (spa: Pool) => {
    setSelectedSpa(spa);
    setShowDetailModal(true);
  };

  // Accept Spa here to match SpaDetailModal's onRequestQuote signature
  const handleRequestQuote = (spa: Spa, extras?: any) => {
    setSelectedSpa(spa);
    setShowDetailModal(false); // Close detail modal if open
    setShowQuoteModal(true);
  };

  return (
    <>
      <section id="spa-section" className="py-20 px-4 bg-gradient-to-br from-background to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal to-blue-500">
              Luxury Spa Collection
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Complete your pool experience with our premium spa collection. Designed for ultimate relaxation and therapeutic benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spas.map((spa) => (
              <PoolProductCard
                key={spa.model}
                pool={{
                  id: spa.id ?? spa.model.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  model: spa.model,
                  price: spa.price,
                  category: (spa as any).category || 'premium',
                  image: spa.image,
                  dimensions: (spa as any).dimensions,
                  depth: (spa as any).depth,
                  features: spa.features,
                  warrantyYears: typeof spa.warrantyYears === 'string' ? parseInt(spa.warrantyYears) : (spa.warrantyYears || 5)
                }}
                onViewDetails={handleViewDetails}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>
        </div>
      </section>

      <SpaDetailModal
        spa={selectedSpa}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onRequestQuote={(spa) => handleRequestQuote(spa)}
      />

      <SurveyQuoteTool 
        pool={null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        customProduct={selectedSpa ? {
          name: `${selectedSpa.model} Spa`,
          price: selectedSpa.price,
          type: 'spa'
        } : undefined}
      />
    </>
  );
};

export default SpaSection;
