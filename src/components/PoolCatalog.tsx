import { useState } from "react";
import PoolDetailModal from "./PoolDetailModal";
import SurveyQuoteTool from "./SurveyQuoteTool";
import PoolProductCard from "./PoolProductCard";
import astoria12Image from "@/assets/pools/astoria-12.jpg";
import apollo14Image from "@/assets/pools/apollo-14.jpg";
import coral16Image from "@/assets/pools/coral-16.jpg";

interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
}

const pools: Pool[] = [
  { 
    model: "Astoria 12", 
    price: 111000, 
    category: 'premium', 
    image: astoria12Image,
    dimensions: "12′ × 26′",
    depth: "3′ 6″ to 5′ 6″"
  },
  { 
    model: "Apollo 14", 
    price: 98500, 
    category: 'premium', 
    image: apollo14Image,
    dimensions: "14′ × 30′",
    depth: "4′ 6″ to 6′"
  },
  { 
    model: "Coral 16", 
    price: 96400, 
    category: 'premium', 
    image: coral16Image,
    dimensions: "16′ × 32′",
    depth: "3′ 6″ to 6′"
  },
  { 
    model: "Tuscan 14.40", 
    price: 111000, 
    category: 'premium',
    dimensions: "13′ 9″ × 39′ 11″",
    depth: "3′ 7″ to 6′ 2″"
  },
  { 
    model: "Corinthian 14 BME", 
    price: 98500, 
    category: 'premium',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′"
  },
  { 
    model: "Olympia 14", 
    price: 96400, 
    category: 'premium',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′"
  },
  { 
    model: "Providence 14", 
    price: 95600, 
    category: 'premium',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′"
  },
  { 
    model: "Laguna Deluxe", 
    price: 95300, 
    category: 'deluxe',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′"
  },
  { 
    model: "Valencia", 
    price: 65500, 
    category: 'standard',
    dimensions: "14′ 6″ × 28′",
    depth: "3′ 7″ to 5′ 10″"
  },
  { 
    model: "Key West", 
    price: 64300, 
    category: 'standard',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′"
  },
  { 
    model: "Enchantment 9.24", 
    price: 60800, 
    category: 'compact',
    dimensions: "9′ 1″ × 23′ 10″",
    depth: "4′ 9″"
  },
  { 
    model: "Jamaica", 
    price: 46100, 
    category: 'compact',
    dimensions: "10′ × 20′",
    depth: "4′ 6″ to 5′ 6″"
  },
  { 
    model: "Axiom 14", 
    price: 89500, 
    category: 'deluxe',
    dimensions: "14′ × 30′",
    depth: "4′ 6″ to 6′"
  },
  { 
    model: "Bay Isle", 
    price: 92000, 
    category: 'deluxe',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′"
  },
  { 
    model: "Claremont", 
    price: 94500, 
    category: 'premium',
    dimensions: "14′ × 33′",
    depth: "3′ 6″ to 5′ 4″"
  },
  { 
    model: "Corinthian 14", 
    price: 97000, 
    category: 'premium',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′"
  },
  { 
    model: "Laguna", 
    price: 88500, 
    category: 'deluxe',
    dimensions: "14′ × 30′",
    depth: "3′ 6″ to 6′"
  },
  { 
    model: "Tuscan 14.27", 
    price: 89000, 
    category: 'deluxe',
    dimensions: "13′ 9″ × 26′ 10″",
    depth: "3′ 11″ to 5′ 9″"
  },
  { 
    model: "Tuscan 14.30", 
    price: 95000, 
    category: 'premium',
    dimensions: "13′ 9″ × 30′ 1″",
    depth: "3′ 11″ to 5′ 11″"
  },
  { 
    model: "Aruba", 
    price: 52500, 
    category: 'compact',
    dimensions: "11′ × 22′",
    depth: "4′ 6″ to 5′ 6″"
  },
  { 
    model: "Bermuda", 
    price: 59800, 
    category: 'compact',
    dimensions: "12′ × 26′",
    depth: "4′ 6″ to 5′ 6″"
  },
  { 
    model: "Corinthian 12", 
    price: 75500, 
    category: 'standard',
    dimensions: "12′ × 25′",
    depth: "3′ 6″ to 5′ 5″"
  },
  { 
    model: "Delray", 
    price: 67000, 
    category: 'standard',
    dimensions: "12′ × 25′",
    depth: "4′ 6″"
  },
  { 
    model: "Enchantment 9.17", 
    price: 48500, 
    category: 'compact',
    dimensions: "9′ 1″ × 17′ 5″",
    depth: "4′ 9″"
  },
  { 
    model: "Enchantment 9.21", 
    price: 52000, 
    category: 'compact',
    dimensions: "9′ 1″ × 20′ 7″",
    depth: "4′ 9″"
  },
  { 
    model: "Java", 
    price: 54500, 
    category: 'compact',
    dimensions: "11′ × 22′",
    depth: "4′ 6″ to 5′ 6″"
  },
  { 
    model: "Milan", 
    price: 49800, 
    category: 'compact',
    dimensions: "10′ × 20′",
    depth: "4′ 6″ to 5′ 6″"
  },
  { 
    model: "Olympia 12", 
    price: 71500, 
    category: 'standard',
    dimensions: "12′ × 26′",
    depth: "3′ 6″ to 5′ 6″"
  },
  { 
    model: "Pleasant Cove", 
    price: 63000, 
    category: 'standard',
    dimensions: "12′ × 24′",
    depth: "4′ 6″ to 5′ 6″"
  },
  { 
    model: "St Lucia", 
    price: 68500, 
    category: 'standard',
    dimensions: "12′ × 24′",
    depth: "4′ 6″ to 5′ 6″"
  },
  { 
    model: "Tuscan 11.20", 
    price: 62000, 
    category: 'standard',
    dimensions: "11′ 1″ × 20′ 3″",
    depth: "3′ 11″ to 5′ 2″"
  },
  { 
    model: "Tuscan 13.24", 
    price: 73500, 
    category: 'standard',
    dimensions: "12′ 10″ × 23′ 7″",
    depth: "3′ 11″ to 5′ 5″"
  },
  { 
    model: "Vista Isle", 
    price: 74000, 
    category: 'standard',
    dimensions: "13′ × 25′",
    depth: "4′ 6″ to 5′ 6″"
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
              Our Pool Collection
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Discover our premium fiberglass pools designed for every lifestyle and budget in Florida.
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