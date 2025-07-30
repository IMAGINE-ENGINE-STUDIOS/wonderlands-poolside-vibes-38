import { useState } from "react";
import PoolDetailModal from "./PoolDetailModal";
import SurveyQuoteTool from "./SurveyQuoteTool";
import PoolProductCard from "./PoolProductCard";
import StripeCheckoutButton from "./StripeCheckoutButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Waves, Sparkles, Flame, Plus } from "lucide-react";

// Updated pool model images in order
const astoriaImage = "/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png";
const apolloImage = "/lovable-uploads/9e491420-80df-4bb3-9db1-3933d96846ac.png";  
const coralImage = "/lovable-uploads/1412e1fb-72ec-4219-a98f-4fcffbd15095.png";
const ariel14Image = "/lovable-uploads/a1b42616-0c25-4010-96e3-3fbeba18aae8.png";
const capecodImage = "/lovable-uploads/8a2b7716-7656-48a0-b1b1-6d276b4b9e73.png";

// Additional pool images
const freeformImage = "/lovable-uploads/9382c72a-0c7d-4981-8f03-878d568dd1b2.png";
const luxuryImage = "/lovable-uploads/8033278d-a737-4b1d-84bf-fd0ac9126406.png";
const modernImage = "/lovable-uploads/c5385549-a189-4127-a204-c196c165ac55.png";

interface Pool {
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
}

interface Spa {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  spilloverFeature?: boolean;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
}

// Pool finish options
export const poolFinishes = [
  "Nantuke", "Esagoni", "Whitehaven", "Island Wave", "Durango Gray",
  "Vintage Blue", "Royal Blue", "Gulf Coast", "Hamper", "Indigo",
  "Cayman", "Mountain", "Carnegie", "Panama", "Corolla",
  "Summerwave", "Legends", "Z terrazzo", "Tullism", 
  "Courtstone Gray", "Courtstone Blue"
];

// Pool tile options (premium upgrade)
export const poolTiles = [
  {
    name: "Mountain",
    price: 15000,
    image: "/lovable-uploads/c5cd2f96-d31a-446b-943b-6dd1620f6521.png",
    description: "Natural stone-look mosaic border with decorative diamond pattern"
  },
  {
    name: "Carnegie", 
    price: 15000,
    image: "/lovable-uploads/5a4a4746-8777-4adb-84c6-c153dbdae3ad.png",
    description: "Elegant diamond mosaic border with rich blue tones"
  },
  {
    name: "Panama",
    price: 15000,
    image: "/lovable-uploads/b6d63246-ec6b-4137-9b83-6fe99f232ba3.png",
    description: "Geometric stone mosaic border with golden accents"
  },
  {
    name: "Corolla",
    price: 15000,
    image: "/lovable-uploads/4f27a800-295b-476c-924c-1790ab191a5c.png",
    description: "Contemporary wave pattern border in deep blue"
  },
  {
    name: "Summerwave",
    price: 15000,
    image: "/lovable-uploads/cd46eae1-1354-4459-84fe-890ad56d16d7.png",
    description: "Flowing wave mosaic pattern with ocean-inspired design"
  },
  {
    name: "Legends",
    price: 15000,
    image: "/lovable-uploads/23b627a0-fda7-408d-bb6e-d41308f8ea6a.png",
    description: "Ornate decorative border with flowing artistic elements"
  },
  {
    name: "Z terrazzo",
    price: 15000,
    image: "/lovable-uploads/107aebee-8f2d-4c04-a51f-f2acf731860e.png",
    description: "Classic terrazzo-style mosaic with fan pattern detail"
  },
  {
    name: "Tullism",
    price: 15000,
    image: "/lovable-uploads/eb055418-8b18-40d1-af88-613c4c275b20.png",
    description: "Luxury glass tile interior with sophisticated pattern"
  },
  {
    name: "Courtstone Gray",
    price: 15000,
    image: "/lovable-uploads/86d04882-f51e-4b4b-9c89-34031c370138.png",
    description: "Contemporary gray stone tile border with modern appeal"
  },
  {
    name: "Courtstone Blue",
    price: 15000,
    image: "/lovable-uploads/e3edd8ff-9c8e-4b4a-b540-1f735f98548f.png",
    description: "Sophisticated blue stone tile border for elegant pools"
  }
];

const pools: Pool[] = [
  { 
    model: "Astoria", 
    price: 89500, 
    category: 'premium', 
    image: astoriaImage,
    dimensions: "14′ × 28′",
    depth: "3′ 6″ to 5′ 6″",
    galaPoints: 8950,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Spa Compatible", "LED Lighting", "Premium Finish", "Advanced Filtration"],
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Apollo", 
    price: 95000, 
    category: 'premium', 
    image: apolloImage,
    dimensions: "16′ × 32′",
    depth: "4′ to 6′",
    galaPoints: 9500,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Spa Compatible", "Smart Pool Technology", "Energy Efficient", "Premium Materials"],
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Coral", 
    price: 78500, 
    category: 'deluxe', 
    image: coralImage,
    dimensions: "12′ × 24′",
    depth: "3′ 6″ to 5′",
    galaPoints: 7850,
    galaCategory: "Executive Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Spa Compatible", "Spacious Design", "Built-in Steps", "Contemporary Style"],
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Ariel 14", 
    price: 82000, 
    category: 'deluxe', 
    image: ariel14Image,
    dimensions: "14′ × 28′",
    depth: "3′ 6″ to 6′",
    galaPoints: 8200,
    galaCategory: "Executive Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Spa Compatible", "Modern Design", "Multiple Entry Points", "Premium Finish"],
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Cape Cod", 
    price: 68900, 
    category: 'standard',
    image: capecodImage,
    dimensions: "12′ × 26′",
    depth: "3′ 6″ to 5′ 6″",
    galaPoints: 6890,
    galaCategory: "Classic Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Spa Compatible", "Traditional Design", "Easy Maintenance", "Durable Construction"],
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Freeform Elegance", 
    price: 102000, 
    category: 'premium',
    image: freeformImage,
    dimensions: "16′ × 28′",
    depth: "3′ 6″ to 6′",
    galaPoints: 10200,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Spa Compatible", "Freeform Design", "Natural Stone Coping", "Curved Entry"],
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Luxury Resort", 
    price: 125000, 
    category: 'premium',
    image: luxuryImage,
    dimensions: "18′ × 36′",
    depth: "4′ to 8′",
    galaPoints: 12500,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 8,
    warrantyYears: "Lifetime",
    features: ["Spa Compatible", "Multi-level Design", "Waterfall Feature", "Rock Formation"]
  },
  { 
    model: "Modern Classic", 
    price: 86400, 
    category: 'deluxe',
    image: modernImage,
    dimensions: "15′ × 30′",
    depth: "3′ 6″ to 6′",
    galaPoints: 8640,
    galaCategory: "Executive Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Spa Compatible", "Contemporary Lines", "Beach Entry", "Tanning Ledge"]
  },
];

// Spa models
const spas: Spa[] = [
  {
    model: "Mystic",
    price: 28500,
    category: 'premium',
    image: "/lovable-uploads/3bdd9802-26f9-47ab-8498-e0e66344685c.png",
    dimensions: "8′ × 8′",
    depth: "3′ 6″",
    features: ["Spillover Option", "LED Lighting", "Premium Jets", "Heater Ready"],
    spilloverFeature: true,
    installationTimeWeeks: 3,
    warrantyYears: "Lifetime"
  },
  {
    model: "Regal",
    price: 22800,
    category: 'deluxe',
    image: "/lovable-uploads/31da0c59-77d4-4fa1-838b-cb525acd404b.png",
    dimensions: "7′ × 7′",
    depth: "3′ 2″",
    features: ["Spillover Option", "Therapeutic Jets", "Easy Controls", "Energy Efficient"],
    spilloverFeature: true,
    installationTimeWeeks: 3,
    warrantyYears: "Lifetime"
  },
  {
    model: "Royal",
    price: 19500,
    category: 'standard',
    image: "/lovable-uploads/62676335-6a09-4389-9a8a-cba74d583c53.png",
    dimensions: "6′ × 8′",
    depth: "3′",
    features: ["Spillover Option", "Modern Design", "Durable Construction", "Low Maintenance"],
    spilloverFeature: true,
    installationTimeWeeks: 2,
    warrantyYears: "10 Years"
  },
  {
    model: "Shafta",
    price: 18200,
    category: 'standard',
    image: "/lovable-uploads/1a143a47-5e78-46a8-8172-426b7644bea8.png",
    dimensions: "7′ diameter",
    depth: "3′",
    features: ["Spillover Option", "Circular Design", "Compact Footprint", "Easy Entry"],
    spilloverFeature: true,
    installationTimeWeeks: 2,
    warrantyYears: "10 Years"
  }
];

const getSpaTypeColor = (category: string) => {
  switch (category) {
    case 'premium': return 'bg-gradient-to-r from-purple-500 to-pink-500';
    case 'deluxe': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    case 'standard': return 'bg-gradient-to-r from-green-500 to-teal-500';
    default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }
};

const PoolCatalog = () => {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [selectedSpa, setSelectedSpa] = useState<Spa | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showSpaModal, setShowSpaModal] = useState(false);

  const handleViewDetails = (pool: Pool) => {
    setSelectedPool(pool);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (pool: Pool, extras?: any) => {
    setSelectedPool(pool);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  const handleSpaRequest = (spa: Spa) => {
    setSelectedSpa(spa);
    setShowSpaModal(true);
  };

  return (
    <>
      {/* Pool Collection Section */}
      <section id="pool-catalog" className="py-10 sm:py-16 lg:py-20 px-2 sm:px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Wonderland's Pool Collection
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-foreground/80 max-w-2xl mx-auto px-2 sm:px-0">
              Discover our premium fiberglass pools with lifetime warranty and carbon fiber technology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {pools.map((pool, index) => (
              <PoolProductCard
                key={pool.model}
                pool={pool}
                onViewDetails={handleViewDetails}
                onRequestQuote={handleRequestQuote}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pool Tiles Section */}
      <section id="pool-tiles" className="py-10 sm:py-16 lg:py-20 px-2 sm:px-4 relative overflow-hidden bg-gradient-to-b from-background to-background/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal via-coral to-primary">
              Premium Pool Tiles
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-foreground/80 max-w-2xl mx-auto px-2 sm:px-0">
              Enhance your pool with our premium tile collection. Add luxury and style with decorative borders and patterns.
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-coral/10 rounded-full">
              <Sparkles className="h-4 w-4 mr-2 text-coral" />
              <span className="text-sm font-medium text-coral">Premium Upgrade: $15,000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {poolTiles.map((tile, index) => (
              <Card key={tile.name} className="group hover:scale-105 transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={tile.image} 
                    alt={tile.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-gradient-to-r from-coral to-primary text-white border-0">
                      Premium
                    </Badge>
                    <div className="text-sm font-bold text-coral">
                      +${tile.price.toLocaleString()}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {tile.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-foreground/70 line-clamp-2">
                    {tile.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 pb-4">
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => {
                      // This could open a customization modal or add to quote
                      console.log(`Selected tile: ${tile.name}`);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Select Tile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Spa Collection Section */}
      <section id="spa-catalog" className="py-10 sm:py-16 lg:py-20 px-2 sm:px-4 relative overflow-hidden bg-gradient-to-b from-background/50 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-coral via-primary to-purple-500">
              <Flame className="inline-block mr-4 h-8 w-8 md:h-12 md:w-12" />
              Wonderland's Spa Collection
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-foreground/80 max-w-2xl mx-auto px-2 sm:px-0">
              Add the perfect spa to complement your pool. All models include spillover feature options.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {spas.map((spa, index) => (
              <Card key={spa.model} className="group hover:scale-105 transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 overflow-hidden">
                {spa.image && (
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={spa.image} 
                      alt={spa.model} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getSpaTypeColor(spa.category)} text-white border-0`}>
                      {spa.category.charAt(0).toUpperCase() + spa.category.slice(1)}
                    </Badge>
                    {spa.spilloverFeature && (
                      <Badge variant="outline" className="text-coral border-coral">
                        <Waves className="h-3 w-3 mr-1" />
                        Spillover
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {spa.model}
                  </CardTitle>
                  <CardDescription className="text-sm text-foreground/70">
                    {spa.dimensions} • {spa.depth} deep
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-coral mb-2">
                      ${spa.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-foreground/60">
                      {spa.installationTimeWeeks} weeks installation
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {spa.features?.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-foreground/80">
                        <Sparkles className="h-3 w-3 mr-2 text-coral flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => handleSpaRequest(spa)}
                      className="w-full bg-gradient-to-r from-coral to-primary hover:from-coral/90 hover:to-primary/90 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Pool
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSpaRequest(spa)}
                    >
                      Get Spa Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PoolDetailModal 
        pool={selectedPool}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onRequestQuote={handleRequestQuote}
      />
      
      <SurveyQuoteTool 
        pool={selectedPool}
        isOpen={showQuoteModal || showSpaModal}
        onClose={() => {
          setShowQuoteModal(false);
          setShowSpaModal(false);
        }}
      />
    </>
  );
};

export default PoolCatalog;