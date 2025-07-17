import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Waves, Sparkles, DollarSign } from "lucide-react";

interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
}

const pools: Pool[] = [
  { model: "Tuscan 14.40", price: 111000, category: 'premium' },
  { model: "Corinthian 14 BME", price: 98500, category: 'premium' },
  { model: "Olympia 14", price: 96400, category: 'premium' },
  { model: "Providence 14", price: 95600, category: 'premium' },
  { model: "Laguna Deluxe", price: 95300, category: 'deluxe' },
  { model: "Corinthian 14", price: 94500, category: 'premium' },
  { model: "Claremont", price: 83400, category: 'deluxe' },
  { model: "Tuscan 14.30", price: 88200, category: 'deluxe' },
  { model: "Bay Isle", price: 80400, category: 'deluxe' },
  { model: "Laguna", price: 82600, category: 'deluxe' },
  { model: "Tuscan 14.27", price: 80000, category: 'deluxe' },
  { model: "Axiom 14", price: 87500, category: 'deluxe' },
  { model: "Valencia", price: 65500, category: 'standard' },
  { model: "Corinthian 12 BME", price: 79400, category: 'standard' },
  { model: "Olympia 12", price: 76300, category: 'standard' },
  { model: "Corinthian 12", price: 75400, category: 'standard' },
  { model: "Vista Isle", price: 70000, category: 'standard' },
  { model: "Tuscan 13.24", price: 69400, category: 'standard' },
  { model: "Key West", price: 64300, category: 'standard' },
  { model: "Bermuda", price: 61500, category: 'standard' },
  { model: "Enchantment 9.24", price: 60800, category: 'compact' },
  { model: "Delray", price: 59300, category: 'compact' },
  { model: "Java", price: 60000, category: 'compact' },
  { model: "St Lucia", price: 56800, category: 'compact' },
  { model: "Tuscan 11.20", price: 56600, category: 'compact' },
  { model: "Enchantment 9.21", price: 54400, category: 'compact' },
  { model: "Aruba", price: 51300, category: 'compact' },
  { model: "Pleasant Cove", price: 51300, category: 'compact' },
  { model: "Enchantment 9.17", price: 47900, category: 'compact' },
  { model: "Milan", price: 45300, category: 'compact' },
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
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-20 w-24 h-24 bg-primary/10 rounded-full animate-float-slow"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-coral/10 rounded-full animate-bounce-gentle"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-teal/10 rounded-full animate-wiggle"></div>
        <div className="absolute bottom-1/3 right-1/3 text-orange/20 animate-float">
          <Sparkles size={32} />
        </div>
        <div className="absolute top-1/4 right-1/4 text-secondary/20 animate-bounce-gentle">
          <Waves size={28} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
            Our Pool Collection
          </h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Discover our premium fiberglass pools designed for every lifestyle and budget. 
            Each pool is crafted with precision and built to last.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pools.map((pool, index) => (
            <Card 
              key={pool.model} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    className={`${getCategoryColor(pool.category)} text-white capitalize font-medium`}
                  >
                    {pool.category}
                  </Badge>
                  <div className="text-primary/60 group-hover:text-primary transition-colors">
                    <Waves size={20} />
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {pool.model}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      {pool.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <CardDescription className="text-sm text-muted-foreground mb-4">
                  Premium fiberglass construction with lifetime warranty
                </CardDescription>
                
                <Button 
                  variant="gradient"
                  className="w-full hover:scale-105 transition-all duration-300 group-hover:shadow-lg"
                  size="sm"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button 
            variant="gradient-coral"
            size="lg" 
            className="hover:scale-105 transition-all duration-300"
          >
            View All Pool Shapes
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PoolCatalog;