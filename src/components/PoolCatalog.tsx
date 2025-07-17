import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Waves, Sparkles, DollarSign } from "lucide-react";
import PoolDetailModal from "./PoolDetailModal";
import SurveyQuoteTool from "./SurveyQuoteTool";
import astoria12Image from "@/assets/pools/astoria-12.jpg";
import apollo14Image from "@/assets/pools/apollo-14.jpg";
import coral16Image from "@/assets/pools/coral-16.jpg";

interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
}

const pools: Pool[] = [
  { model: "Astoria 12", price: 111000, category: 'premium', image: astoria12Image },
  { model: "Apollo 14", price: 98500, category: 'premium', image: apollo14Image },
  { model: "Coral 16", price: 96400, category: 'premium', image: coral16Image },
  { model: "Tuscan 14.40", price: 111000, category: 'premium' },
  { model: "Corinthian 14 BME", price: 98500, category: 'premium' },
  { model: "Olympia 14", price: 96400, category: 'premium' },
  { model: "Providence 14", price: 95600, category: 'premium' },
  { model: "Laguna Deluxe", price: 95300, category: 'deluxe' },
  { model: "Valencia", price: 65500, category: 'standard' },
  { model: "Key West", price: 64300, category: 'standard' },
  { model: "Enchantment 9.24", price: 60800, category: 'compact' },
  { model: "Jamaica", price: 46100, category: 'compact' },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium': return 'bg-gradient-to-r from-coral to-orange';
    case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
    case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
    case 'compact': return 'bg-gradient-to-r from-teal to-primary';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const PoolCatalog = () => {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleViewDetails = (pool: Pool) => {
    setSelectedPool(pool);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (pool: Pool) => {
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pools.map((pool, index) => (
              <Card 
                key={pool.model} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getCategoryColor(pool.category)} text-white capitalize font-medium`}>
                      {pool.category}
                    </Badge>
                    <Waves size={20} className="text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {pool.model}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center gap-1 mb-4">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      {pool.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <CardDescription className="text-sm text-muted-foreground mb-4">
                    Premium fiberglass construction with lifetime warranty
                  </CardDescription>
                  
                  <Button 
                    onClick={() => handleViewDetails(pool)}
                    variant="gradient"
                    className="w-full hover:scale-105 transition-all duration-300"
                    size="sm"
                  >
                    View Details
                  </Button>
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
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
    </>
  );
};

export default PoolCatalog;