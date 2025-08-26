import { useState } from "react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import PoolProductCard from "./PoolProductCard";
import SpaDetailModal from "./SpaDetailModal";
import { spas } from "@/data/spaData";
import type { Pool as PoolCard } from "./PoolProductCard";

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
// Note: We no longer use this local Pool type for handlers to avoid type conflicts with PoolProductCard.Pool
// interface Pool extends Spa {
//   finishes?: string[];
//   liners?: string[];
//   covers?: string[];
// }

const SpaSection = () => {
  // selectedSpa can be Spa, since PoolCard extends with additional fields and we only consume shared fields
  const [selectedSpa, setSelectedSpa] = useState<Spa | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Map a PoolProductCard.Pool to our Spa shape
  const mapPoolToSpa = (pool: PoolCard): Spa => ({
    model: pool.model,
    price: pool.price,
    image: pool.image,
    category: pool.category ?? 'premium',
    dimensions: pool.dimensions,
    depth: pool.depth,
    features: pool.features,
    warrantyYears: typeof pool.warrantyYears === 'string'
      ? parseInt(pool.warrantyYears as string)
      : pool.warrantyYears
  });

  // Handlers for PoolProductCard (must accept PoolProductCard.Pool)
  const handleViewDetails = (pool: PoolCard) => {
    setSelectedSpa(mapPoolToSpa(pool));
    setShowDetailModal(true);
  };

  const handleRequestQuoteFromCard = (pool: PoolCard) => {
    setSelectedSpa(mapPoolToSpa(pool));
    setShowDetailModal(false); // Close detail modal if open
    setShowQuoteModal(true);
  };

  // Handler for SpaDetailModal (accepts Spa)
  const handleRequestQuoteFromModal = (spa: Spa, extras?: any) => {
    setSelectedSpa(spa);
    setShowDetailModal(false);
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
                onRequestQuote={handleRequestQuoteFromCard}
              />
            ))}
          </div>
        </div>
      </section>

      <SpaDetailModal
        spa={selectedSpa}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onRequestQuote={(spa) => handleRequestQuoteFromModal(spa)}
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
