import { useState, useEffect } from "react";
import SpaProductCard from "./SpaProductCard";
import SpaDetailModal from "./SpaDetailModal";
import SurveyQuoteTool from "./SurveyQuoteTool";
import RacebandBanner from "./RacebandBanner";
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
const spas: Spa[] = [{
  model: "Mystic",
  price: 24000,
  category: 'premium',
  image: "/lovable-uploads/f6a9fa78-9ca7-44a8-85ae-9c0b3b3be906.png",
  dimensions: "7' x 7' x 34\"",
  depth: "34\"",
  features: ["LED Lighting System", "Digital Controls", "Insulated Shell"],
  galaPoints: 95,
  galaCategory: "Premium Spa Collection",
  installationTimeWeeks: 2,
  warrantyYears: "LIFETIME",
  heater: true,
  saltSystem: true,
  carbonFiber: true
}, {
  model: "Serenity",
  price: 26000,
  category: 'deluxe',
  image: "/lovable-uploads/e3bbb69b-9699-4d9e-aca9-8c98b50f2c78.png",
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
}, {
  model: "Tranquil",
  price: 26000,
  category: 'standard',
  image: "/lovable-uploads/7edc4a89-7438-4f88-81f4-8beea8152f07.png",
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
}, {
  model: "Oasis",
  price: 28000,
  category: 'premium',
  image: "/lovable-uploads/46c5f140-bd7e-4a4d-9a19-1f15b078b899.png",
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
}];
const SpaCatalog = () => {
  const [selectedSpa, setSelectedSpa] = useState<Spa | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<any>(null);
  const handleViewDetails = (spa: Spa) => {
    setSelectedSpa(spa);
    setShowDetailModal(true);
  };
  const handleRequestQuote = (spa: Spa, extras?: any) => {
    setSelectedSpa(spa);
    setSelectedExtras(extras || null);
    setShowQuoteModal(true);
  };

  // Listen for search results to open spa details
  useEffect(() => {
    const handleOpenProduct = (event: CustomEvent) => {
      const {
        type,
        id,
        name
      } = event.detail;
      if (type === 'spa') {
        const foundSpa = spas.find(spa => spa.model.toLowerCase() === name.toLowerCase().replace(' spa', '') || spa.model.toLowerCase().includes(id.toLowerCase()));
        if (foundSpa) {
          handleViewDetails(foundSpa);
        }
      }
    };
    window.addEventListener('open-product', handleOpenProduct as EventListener);
    return () => window.removeEventListener('open-product', handleOpenProduct as EventListener);
  }, []);
  return <>
      {/* Wonderlands Studio CTA Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-primary/10 to-coral/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4 text-foreground">Create a Wonderful Outdoor Experience</h3>
          <p className="text-foreground/80 mb-6 max-w-2xl mx-auto">Use our interactive studio to customize your Pool, Spa or Tanning Ledge with premium finishes, advanced features, and personalized options in a private suit.</p>
          <a href="/wonderlands-studio" className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary to-coral text-primary-foreground font-semibold rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <span>Open Wonderlands Studio</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      <section className="py-20 px-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/30">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
          </div>
          {/* Bubble Effect */}
          <svg className="absolute top-0 left-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10%" cy="20%" r="2%" className="fill-primary animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}}/>
            <circle cx="85%" cy="15%" r="3%" className="fill-coral animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}/>
            <circle cx="50%" cy="80%" r="2.5%" className="fill-teal animate-pulse" style={{animationDelay: '2s', animationDuration: '3.5s'}}/>
            <circle cx="20%" cy="70%" r="1.5%" className="fill-purple-500 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '4.5s'}}/>
            <circle cx="75%" cy="60%" r="2%" className="fill-pink-500 animate-pulse" style={{animationDelay: '1.5s', animationDuration: '3s'}}/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <RacebandBanner title="Premium Spas" subtitle="Luxury hydrotherapy — relaxation and rejuvenation" variant="primary" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {spas.map(spa => (
              <SpaProductCard key={spa.model} spa={spa} onViewDetails={handleViewDetails} onRequestQuote={handleRequestQuote} />
            ))}
          </div>
        </div>
      </section>

      {/* Spa Detail Modal */}
      {selectedSpa && <SpaDetailModal spa={selectedSpa} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} onRequestQuote={handleRequestQuote} />}

    {/* Quote Tool */}
      <SurveyQuoteTool pool={null} isOpen={showQuoteModal} onClose={() => setShowQuoteModal(false)} customProduct={selectedSpa ? {
      name: selectedSpa.model,
      price: selectedSpa.price,
      type: 'spa'
    } : undefined} extras={selectedExtras} />
    </>;
};
export default SpaCatalog;