
import { useState } from "react";
import SpaProductCard from "./SpaProductCard";
import SpaDetailModal from "./SpaDetailModal";
import SurveyQuoteTool from "./SurveyQuoteTool";

interface Spa {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  galaPoints?: number;
  galaCategory?: string;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
  heater?: boolean;
  saltSystem?: boolean;
  carbonFiber?: boolean;
  finishes?: string[];
  liners?: string[];
  covers?: string[];
  spilloverFeature?: boolean;
}

const spas: Spa[] = [
  {
    model: "Mystic",
    price: 22000,
    category: 'premium',
    image: "/lovable-uploads/09999795-2565-4094-8391-0511c1590998.png",
    dimensions: "7' x 7' x 34\"",
    depth: "34\"",
    features: ["40 Therapeutic Jets", "LED Lighting System", "Digital Controls", "Insulated Shell"],
    galaPoints: 95,
    galaCategory: "Premium Spa Collection",
    installationTimeWeeks: 2,
    warrantyYears: "LIFETIME",
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  {
    model: "Serenity",
    price: 24000,
    category: 'deluxe',
    image: "/lovable-uploads/41959951-1a93-4941-a5f9-53095e959961.png",
    dimensions: "8' x 8' x 36\"",
    depth: "36\"",
    features: ["55 Hydrotherapy Jets", "Aromatherapy System", "Bluetooth Audio", "Energy Efficient"],
    galaPoints: 98,
    galaCategory: "Deluxe Spa Collection",
    installationTimeWeeks: 2,
    warrantyYears: "LIFETIME",
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  {
    model: "Tranquil",
    price: 26000,
    category: 'standard',
    image: "/lovable-uploads/69999199-7999-4929-8999-9999c9c9c999.png",
    dimensions: "9' x 9' x 38\"",
    depth: "38\"",
    features: ["70 Precision Jets", "Smart Controls", "UV Sanitization", "Premium Insulation"],
    galaPoints: 92,
    galaCategory: "Standard Spa Collection",
    installationTimeWeeks: 3,
    warrantyYears: "LIFETIME",
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  {
    model: "Oasis",
    price: 28000,
    category: 'premium',
    image: "/lovable-uploads/99999999-9999-4999-8999-99c9c9999999.png",
    dimensions: "10' x 10' x 40\"",
    depth: "40\"",
    features: ["85 Therapeutic Jets", "Cascade Waterfall", "Advanced Filtration", "Mobile App Control"],
    galaPoints: 100,
    galaCategory: "Premium Spa Collection",
    installationTimeWeeks: 3,
    warrantyYears: "LIFETIME",
    heater: true,
    saltSystem: true,
    carbonFiber: true
  }
];

const SpaCatalog = () => {
  const [selectedSpa, setSelectedSpa] = useState<Spa | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleViewDetails = (spa: Spa) => {
    setSelectedSpa(spa);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (spa: Spa, extras?: any) => {
    setSelectedSpa(spa);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Premium Spas
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Indulge in the luxury and therapeutic benefits of our premium spas. Designed for relaxation and rejuvenation, our spas offer the ultimate hydrotherapy experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {spas.map((spa) => (
              <SpaProductCard
                key={spa.model}
                spa={spa}
                onViewDetails={handleViewDetails}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Spa Detail Modal */}
      {selectedSpa && (
        <SpaDetailModal
          spa={selectedSpa}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onRequestQuote={handleRequestQuote}
        />
      )}

      {/* Quote Tool */}
      <SurveyQuoteTool 
        pool={null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        customProduct={selectedSpa ? {
          name: selectedSpa.model,
          price: selectedSpa.price,
          type: 'spa'
        } : undefined}
      />
    </>
  );
};

export default SpaCatalog;
