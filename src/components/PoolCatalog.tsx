import { useState } from "react";
import PoolDetailModal from "./PoolDetailModal";
import SurveyQuoteTool from "./SurveyQuoteTool";
import PoolProductCard from "./PoolProductCard";
import astoria12Image from "@/assets/pools/astoria-12.jpg";
import apollo14Image from "@/assets/pools/apollo-14.jpg";
import coral16Image from "@/assets/pools/coral-16.jpg";
import ariel16Image from "@/assets/pools/ariel-16.jpg";
import enchantment917Image from "@/assets/pools/enchantment-917.jpg";
import enchantment921Image from "@/assets/pools/enchantment-921.jpg";
import enchantment924Image from "@/assets/pools/enchantment-924.jpg";
import tuscan1120Image from "@/assets/pools/tuscan-1120.jpg";
import tuscan1324Image from "@/assets/pools/tuscan-1324.jpg";
import tuscan1427Image from "@/assets/pools/tuscan-1427.jpg";
import capecodImage from "@/assets/pools/cape-cod.jpg";
import valenciaImage from "@/assets/pools/valencia.jpg";
import stluciaImage from "@/assets/pools/st-lucia.jpg";
import jamaicaImage from "@/assets/pools/jamaica.jpg";
import synergyImage from "@/assets/pools/synergy.jpg";
import bermudaImage from "@/assets/pools/bermuda.jpg";
import fijiImage from "@/assets/pools/fiji.jpg";
import genesisImage from "@/assets/pools/genesis.jpg";

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

const pools: Pool[] = [
  { 
    model: "Astoria 12", 
    price: 111000, 
    category: 'premium', 
    image: astoria12Image,
    dimensions: "12′ × 26′",
    depth: "3′ 6″ to 5′ 6″",
    galaPoints: 11100,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["LED Lighting", "Premium Finish", "Advanced Filtration"],
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Apollo 14", 
    price: 98500, 
    category: 'premium', 
    image: apollo14Image,
    dimensions: "14′ × 30′",
    depth: "4′ 6″ to 6′",
    galaPoints: 9850,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Smart Pool Technology", "Energy Efficient", "Premium Materials"],
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Coral 16", 
    price: 96400, 
    category: 'premium', 
    image: coral16Image,
    dimensions: "16′ × 32′",
    depth: "3′ 6″ to 6′",
    galaPoints: 9640,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Spacious Design", "Coral Reef Finish", "Built-in Steps"],
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Ariel 16", 
    price: 102000, 
    category: 'premium', 
    image: ariel16Image,
    dimensions: "16′ × 34′",
    depth: "3′ 6″ to 6′ 6″",
    galaPoints: 10200,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    features: ["Auto Cover Ready", "Multiple Entry Points", "Premium Design"],
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Tuscan 14.40", 
    price: 111000, 
    category: 'premium',
    dimensions: "13′ 9″ × 39′ 11″",
    depth: "3′ 7″ to 6′ 2″",
    galaPoints: 11100,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime",
    heater: true,
    saltSystem: true,
    carbonFiber: true
  },
  { 
    model: "Corinthian 14 BME", 
    price: 98500, 
    category: 'premium',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′",
    galaPoints: 9850,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Olympia 14", 
    price: 96400, 
    category: 'premium',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′",
    galaPoints: 9640,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Providence 14", 
    price: 95600, 
    category: 'premium',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′",
    galaPoints: 9560,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Laguna Deluxe", 
    price: 95300, 
    category: 'deluxe',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′",
    galaPoints: 4765,
    galaCategory: "Executive Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Valencia", 
    price: 65500, 
    category: 'standard',
    image: valenciaImage,
    dimensions: "14′ 6″ × 28′",
    depth: "3′ 7″ to 5′ 10″",
    galaPoints: 1965,
    galaCategory: "Classic Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Cape Cod", 
    price: 58900, 
    category: 'standard',
    image: capecodImage,
    dimensions: "14′ × 28′",
    depth: "3′ 6″ to 5′ 6″",
    galaPoints: 1767,
    galaCategory: "Classic Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "St. Lucia", 
    price: 72500, 
    category: 'standard',
    image: stluciaImage,
    dimensions: "16′ × 32′",
    depth: "3′ 6″ to 6′",
    galaPoints: 2175,
    galaCategory: "Classic Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Synergy", 
    price: 68900, 
    category: 'standard',
    image: synergyImage,
    dimensions: "16′ × 30′",
    depth: "3′ 6″ to 6′",
    galaPoints: 2067,
    galaCategory: "Classic Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Bermuda", 
    price: 78500, 
    category: 'deluxe',
    image: bermudaImage,
    dimensions: "16′ × 34′",
    depth: "3′ 6″ to 6′",
    galaPoints: 3925,
    galaCategory: "Executive Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Fiji", 
    price: 71200, 
    category: 'standard',
    image: fijiImage,
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′",
    galaPoints: 2136,
    galaCategory: "Classic Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Genesis", 
    price: 85400, 
    category: 'deluxe',
    image: genesisImage,
    dimensions: "16′ × 36′",
    depth: "3′ 6″ to 6′",
    galaPoints: 4270,
    galaCategory: "Executive Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Enchantment 9.17", 
    price: 58800, 
    category: 'compact',
    image: enchantment917Image,
    dimensions: "9′ 1″ × 17′ 2″",
    depth: "4′ 9″",
    galaPoints: 1176,
    galaCategory: "Compact Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Enchantment 9.21", 
    price: 60200, 
    category: 'compact',
    image: enchantment921Image,
    dimensions: "9′ 1″ × 20′ 10″",
    depth: "4′ 9″",
    galaPoints: 1206,
    galaCategory: "Compact Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Tuscan 11.20", 
    price: 74800, 
    category: 'standard',
    image: tuscan1120Image,
    dimensions: "11′ × 20′",
    depth: "3′ 7″ to 5′ 4″",
    galaPoints: 2244,
    galaCategory: "Classic Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Tuscan 13.24", 
    price: 82900, 
    category: 'deluxe',
    image: tuscan1324Image,
    dimensions: "13′ × 24′",
    depth: "3′ 7″ to 5′ 4″",
    galaPoints: 4145,
    galaCategory: "Executive Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Tuscan 14.27", 
    price: 89600, 
    category: 'deluxe',
    image: tuscan1427Image,
    dimensions: "14′ × 27′",
    depth: "3′ 7″ to 5′ 4″",
    galaPoints: 4480,
    galaCategory: "Executive Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Key West", 
    price: 64300, 
    category: 'standard',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′",
    galaPoints: 1929,
    galaCategory: "Classic Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Enchantment 9.24", 
    price: 60800, 
    category: 'compact',
    dimensions: "9′ 1″ × 23′ 10″",
    depth: "4′ 9″",
    galaPoints: 1216,
    galaCategory: "Compact Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Jamaica", 
    price: 46100, 
    category: 'compact',
    image: jamaicaImage,
    dimensions: "10′ × 20′",
    depth: "4′ 6″ to 5′ 6″",
    galaPoints: 922,
    galaCategory: "Compact Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Axiom 14", 
    price: 89500, 
    category: 'deluxe',
    dimensions: "14′ × 30′",
    depth: "4′ 6″ to 6′",
    galaPoints: 4475,
    galaCategory: "Executive Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Bay Isle", 
    price: 92000, 
    category: 'deluxe',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′",
    galaPoints: 4600,
    galaCategory: "Executive Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Claremont", 
    price: 94500, 
    category: 'premium',
    dimensions: "14′ × 33′",
    depth: "3′ 6″ to 5′ 4″",
    galaPoints: 9450,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Corinthian 14", 
    price: 97000, 
    category: 'premium',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′",
    galaPoints: 9700,
    galaCategory: "Luxury Collection",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  },
  { 
    model: "Laguna", 
    price: 88500, 
    category: 'deluxe',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′",
    galaPoints: 4425,
    galaCategory: "Executive Series",
    installationTimeWeeks: 6,
    warrantyYears: "Lifetime"
  }
];


const PoolCatalog = () => {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleViewDetails = (pool: Pool) => {
    setSelectedPool(pool);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (pool: Pool, extras?: any) => {
    setSelectedPool(pool);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  return (
    <>
      <section id="pool-catalog" className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Wonderland's Pool Collection
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Discover our premium fiberglass pools with lifetime warranty and carbon fiber technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      <PoolDetailModal 
        pool={selectedPool}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onRequestQuote={handleRequestQuote}
      />
      
      <SurveyQuoteTool 
        pool={selectedPool}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
    </>
  );
};

export default PoolCatalog;