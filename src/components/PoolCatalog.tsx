import { useState } from "react";
import PoolDetailModal from "./PoolDetailModal";
import SurveyQuoteTool from "./SurveyQuoteTool";
import PoolProductCard from "./PoolProductCard";
import StripeCheckoutButton from "./StripeCheckoutButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Waves, Sparkles, Flame, Plus, Sun } from "lucide-react";

// Import shared pool data
import { poolLiners, poolTiles, tanningLedges } from "@/data/poolData";

// Debug logging
console.log('PoolCatalog - poolTiles:', poolTiles);
console.log('PoolCatalog - poolLiners:', poolLiners);

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

const pools: Pool[] = [
  // Enchantment Series
  { 
    model: "Enchantment 9.17", 
    price: 47900, 
    category: 'compact', 
    image: "/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png",
    dimensions: "9′ 1″ × 17′ 5″",
    depth: "~4′ 9″",
    installationTimeWeeks: 4,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Compact Design", "Energy Efficient"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Enchantment 9.21", 
    price: 54400, 
    category: 'compact', 
    image: "/lovable-uploads/63844c0c-04e6-4628-ad09-1b98c9283cf0.png",
    dimensions: "9′ 1″ × 20′ 7″",
    depth: "~4′ 9″",
    installationTimeWeeks: 4,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Compact Design", "Energy Efficient"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Enchantment 9.24", 
    price: 60800, 
    category: 'compact', 
    image: "/lovable-uploads/749a82f6-561b-4f6b-982b-d343dfac9565.png",
    dimensions: "9′ 1″ × 23′ 10″",
    depth: "~4′ 9″",
    installationTimeWeeks: 4,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Compact Design", "Energy Efficient"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },

  // Standard Series
  { 
    model: "Milan", 
    price: 45300, 
    category: 'standard', 
    image: "/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.png",
    dimensions: "10′ × 16′",
    depth: "4′",
    installationTimeWeeks: 4,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Classic Design", "Perfect for Small Yards"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Jamaica", 
    price: 46100, 
    category: 'standard', 
    image: "/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.png",
    dimensions: "10′ × 20′",
    depth: "3′ 2″ – 5′",
    installationTimeWeeks: 4,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Family Friendly", "Shallow End"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Aruba", 
    price: 51300, 
    category: 'standard', 
    image: "/lovable-uploads/ac53cd88-15e9-4f8a-a3c4-2cd4415b0ec5.png",
    dimensions: "11′ × 22′",
    depth: "3′ 6″ – 5′",
    installationTimeWeeks: 4,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Mid-Size Pool", "Great for Swimming"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Pleasant Cove", 
    price: 51300, 
    category: 'standard', 
    image: "/src/assets/pools/cape-cod.jpg",
    dimensions: "11′ × 22′",
    depth: "3′ 6″ – 5′ 6″",
    installationTimeWeeks: 4,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Elegant Design", "Versatile Depth"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },

  // Tuscan Series
  { 
    model: "Tuscan 11.20", 
    price: 56600, 
    category: 'deluxe', 
    image: "/src/assets/pools/tuscan-1120.jpg",
    dimensions: "11′ 1″ × 20′ 3″",
    depth: "3′ 11″ – 5′ 2″",
    installationTimeWeeks: 5,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Tuscan Design", "Premium Finish"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Tuscan 13.24", 
    price: 69400, 
    category: 'deluxe', 
    image: "/src/assets/pools/tuscan-1324.jpg",
    dimensions: "12′ 10″ × 23′ 7″",
    depth: "3′ 11″ – 5′ 5″",
    installationTimeWeeks: 5,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Tuscan Design", "Premium Finish"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Tuscan 14.27", 
    price: 80000, 
    category: 'deluxe', 
    image: "/src/assets/pools/tuscan-1427.jpg",
    dimensions: "13′ 9″ × 26′ 10″",
    depth: "3′ 11″ – 5′ 9″",
    installationTimeWeeks: 5,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Tuscan Design", "Premium Finish"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Tuscan 14.30", 
    price: 88200, 
    category: 'deluxe', 
    image: "/src/assets/pools/tuscan-1120.jpg",
    dimensions: "13′ 9″ × 30′ 1″",
    depth: "3′ 11″ – 5′ 11″",
    installationTimeWeeks: 5,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Tuscan Design", "Premium Finish"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Tuscan 14.40", 
    price: 111000, 
    category: 'deluxe', 
    image: "/src/assets/pools/tuscan-1324.jpg",
    dimensions: "13′ 9″ × 39′ 11″",
    depth: "3′ 7″ – 6′ 2″",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Tuscan Design", "Premium Finish"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },

  // Premium Series
  { 
    model: "St. Lucia", 
    price: 56800, 
    category: 'deluxe', 
    image: "/src/assets/pools/st-lucia.jpg",
    dimensions: "12′ × 24′",
    depth: "3′ 6″ – 5′",
    installationTimeWeeks: 5,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Caribbean Inspired", "Perfect for Families"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Delray", 
    price: 59300, 
    category: 'deluxe', 
    image: "/src/assets/pools/cape-cod.jpg",
    dimensions: "12′ × 25′",
    depth: "~4′ 6″",
    installationTimeWeeks: 5,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Modern Design", "Consistent Depth"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Java", 
    price: 60000, 
    category: 'deluxe', 
    image: "/src/assets/pools/genesis.jpg",
    dimensions: "12′ × 27′",
    depth: "3′ 6″ – 5′ 6″",
    installationTimeWeeks: 5,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Sleek Design", "Great for Lap Swimming"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Bermuda", 
    price: 61500, 
    category: 'deluxe', 
    image: "/src/assets/pools/bermuda.jpg",
    dimensions: "12′ × 26′",
    depth: "3′ 6″ – 5′ 6″",
    installationTimeWeeks: 5,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Island Style", "Relaxing Design"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Key West", 
    price: 64300, 
    category: 'deluxe', 
    image: "/src/assets/pools/genesis.jpg",
    dimensions: "12′ × 25′ 7″",
    depth: "3′ 7″ – 6′",
    installationTimeWeeks: 5,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Tropical Design", "Deep End Swimming"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Valencia", 
    price: 65500, 
    category: 'deluxe', 
    image: "/src/assets/pools/valencia.jpg",
    dimensions: "14′ 6″ × 28′",
    depth: "3′ 7″ – 5′ 10″",
    installationTimeWeeks: 5,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Spanish Style", "Large Swimming Area"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Vista Isle", 
    price: 70000, 
    category: 'premium', 
    image: "/src/assets/pools/genesis.jpg",
    dimensions: "12′ × 28′ 6″",
    depth: "3′ 6″ – 5′ 10″",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Panoramic Design", "Extended Length"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },

  // Corinthian Series
  { 
    model: "Corinthian 12", 
    price: 75400, 
    category: 'premium', 
    image: "/src/assets/pools/genesis.jpg",
    dimensions: "12′ × 25′",
    depth: "3′ 6″ – 5′ 5″",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Classical Design", "Premium Materials"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Corinthian 12 BME", 
    price: 79400, 
    category: 'premium', 
    image: "/src/assets/pools/genesis.jpg",
    dimensions: "12′ × 25′",
    depth: "3′ 6″ – 5′ 5″",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Beach Modified Entry", "Classical Design"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Corinthian 14", 
    price: 94500, 
    category: 'premium', 
    image: "/src/assets/pools/genesis.jpg",
    dimensions: "14′ × 30′",
    depth: "3′ 6″ – 6′",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Classical Design", "Premium Materials"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Corinthian 14 BME", 
    price: 98500, 
    category: 'premium', 
    image: "/src/assets/pools/genesis.jpg",
    dimensions: "14′ × 30′",
    depth: "3′ 6″ – 6′",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Beach Modified Entry", "Classical Design"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },

  // Olympia Series
  { 
    model: "Olympia 12", 
    price: 76300, 
    category: 'premium', 
    image: "/src/assets/pools/genesis.jpg",
    dimensions: "12′ × 26′",
    depth: "3′ 6″ – 5′ 6″",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Olympic Inspired", "Performance Design"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Olympia 14", 
    price: 96400, 
    category: 'premium', 
    image: "/src/assets/pools/genesis.jpg",
    dimensions: "14′ × 30′",
    depth: "3′ 6″ – 6′",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Olympic Inspired", "Performance Design"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },

  // Large Premium Series
  { 
    model: "Bay Isle", 
    price: 80400, 
    category: 'premium', 
    image: "/src/assets/pools/freeform-beach-entry.jpg",
    dimensions: "14′ 6″ × 30′",
    depth: "3′ – 6′ 6″",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Beach Entry", "Large Swimming Area"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Laguna", 
    price: 82600, 
    category: 'premium', 
    image: "/src/assets/pools/freeform-beach-entry.jpg",
    dimensions: "14′ × 30′",
    depth: "3′ 6″ – 6′",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Lagoon Style", "Natural Design"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Claremont", 
    price: 83400, 
    category: 'premium', 
    image: "/src/assets/pools/l-shaped-elegant.jpg",
    dimensions: "14′ × 33′",
    depth: "3′ 6″ – 5′ 4″",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "L-Shaped Design", "Extended Length"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Axiom 14", 
    price: 87500, 
    category: 'premium', 
    image: "/src/assets/pools/geometric-luxury.jpg",
    dimensions: "14′ × 30′",
    depth: "4′ 6″ – 6′",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Geometric Design", "Deep Swimming"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Laguna Deluxe", 
    price: 95300, 
    category: 'premium', 
    image: "/src/assets/pools/freeform-beach-entry.jpg",
    dimensions: "14′ × 30′",
    depth: "4′ – 6′",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Deluxe Lagoon Style", "Premium Features"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Providence 14", 
    price: 95600, 
    category: 'premium', 
    image: "/src/assets/pools/geometric-luxury.jpg",
    dimensions: "14′ × 30′",
    depth: "3′ 6″ – 6′ 1″",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Salt system included in final price", "Providence Design", "Premium Construction"],
    heater: false,
    saltSystem: true,
    carbonFiber: true
  }
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

      {/* Pool Liners Section */}
      <section id="pool-liners" className="py-10 sm:py-16 lg:py-20 px-2 sm:px-4 relative overflow-hidden bg-gradient-to-b from-background/60 to-background/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal to-coral">
              Premium Pool Liners
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-foreground/80 max-w-2xl mx-auto px-2 sm:px-0">
              Transform your pool with our stunning liner collection. From glass tiles to porcelain and Italian stone.
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-teal/10 rounded-full">
              <Waves className="h-4 w-4 mr-2 text-teal" />
              <span className="text-sm font-medium text-teal">Starting from $5,400</span>
            </div>
          </div>

          <Carousel className="w-full max-w-sm sm:max-w-none mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              {(poolLiners || []).map((liner, index) => (
                <CarouselItem key={liner.name} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <Card className="group hover:scale-105 transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 overflow-hidden h-full">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={liner.image} 
                        alt={liner.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-gradient-to-r from-teal to-primary text-white border-0">
                          {liner.type}
                        </Badge>
                        <div className="text-sm font-bold text-teal">
                          +${liner.price.toLocaleString()}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold text-foreground">
                        {liner.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-foreground/70 line-clamp-3">
                        {liner.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0 pb-4">
                      <Button
                        variant="outline"
                        className="w-full text-sm"
                        onClick={() => {
                          console.log(`Selected liner: ${liner.name}`);
                        }}
                      >
                        <Waves className="h-3 w-3 mr-2" />
                        Select Liner
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 lg:left-4" />
            <CarouselNext className="right-2 lg:right-4" />
          </Carousel>
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

          <Carousel className="w-full max-w-sm sm:max-w-none mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              {(poolTiles || []).map((tile, index) => (
                <CarouselItem key={tile.name} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                  <Card className="group hover:scale-105 transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 overflow-hidden h-full">
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
                          console.log(`Selected tile: ${tile.name}`);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Select Tile
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 lg:left-4" />
            <CarouselNext className="right-2 lg:right-4" />
          </Carousel>
        </div>
      </section>

      {/* Tanning Ledges Section */}
      <section id="tanning-ledges" className="py-10 sm:py-16 lg:py-20 px-2 sm:px-4 relative overflow-hidden bg-gradient-to-b from-background/80 to-background/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              <Sun className="inline-block mr-4 h-8 w-8 md:h-12 md:w-12" />
              Tanning Ledges
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-foreground/80 max-w-2xl mx-auto px-2 sm:px-0">
              Add the perfect relaxation spot to your pool with our premium tanning ledge options.
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-coral/10 rounded-full">
              <Sun className="h-4 w-4 mr-2 text-coral" />
              <span className="text-sm font-medium text-coral">Premium Upgrade: $15,000</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {(tanningLedges || []).map((ledge, index) => (
              <Card key={ledge.name} className="group hover:scale-105 transition-all duration-300 bg-background/80 backdrop-blur-sm border-border/50 overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={ledge.image} 
                    alt={ledge.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-gradient-to-r from-coral to-primary text-white border-0">
                      Premium
                    </Badge>
                    <div className="text-sm font-bold text-coral">
                      +${ledge.price.toLocaleString()}
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    {ledge.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-foreground/70">
                    {ledge.dimensions} • {ledge.depth} deep
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-xs text-foreground/70 mb-4 line-clamp-2">
                    {ledge.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {ledge.features?.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-center text-xs text-foreground/80">
                        <Sun className="h-3 w-3 mr-2 text-coral flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => {
                      console.log(`Selected tanning ledge: ${ledge.name}`);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add Tanning Ledge
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

export { spas };
export default PoolCatalog;