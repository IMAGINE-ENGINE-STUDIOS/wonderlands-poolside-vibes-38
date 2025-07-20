import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Droplets, Palette, Shield, Star, DollarSign } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";

interface Liner {
  name: string;
  price: number;
  type: 'vinyl' | 'fiberglass' | 'tile';
  pattern: string;
  durability: number;
  warranty: string;
  image?: string;
  features: string[];
}

const liners: Liner[] = [
  {
    name: "Ocean Blue Mosaic",
    price: 5000,
    type: 'tile',
    pattern: "Blue Mosaic",
    durability: 25,
    warranty: "25 years",
    features: ["Fade resistant", "Easy maintenance", "Premium finish"]
  },
  {
    name: "Crystal Clear Vinyl",
    price: 5000,
    type: 'vinyl',
    pattern: "Clear Blue",
    durability: 15,
    warranty: "15 years",
    features: ["Budget friendly", "Quick installation", "Smooth finish"]
  },
  {
    name: "Natural Stone",
    price: 5000,
    type: 'fiberglass',
    pattern: "Stone Texture",
    durability: 30,
    warranty: "30 years",
    features: ["Ultra durable", "Natural look", "Low maintenance"]
  },
  {
    name: "Tropical Paradise",
    price: 5000,
    type: 'vinyl',
    pattern: "Tropical Pattern",
    durability: 18,
    warranty: "18 years",
    features: ["Vibrant colors", "Slip resistant", "UV protected"]
  },
  {
    name: "Midnight Diamond",
    price: 5000,
    type: 'tile',
    pattern: "Diamond Pattern",
    durability: 25,
    warranty: "25 years",
    features: ["Elegant design", "Stain resistant", "Premium quality"]
  },
  {
    name: "Arctic White",
    price: 5000,
    type: 'vinyl',
    pattern: "Pure White",
    durability: 16,
    warranty: "16 years",
    features: ["Clean appearance", "Heat resistant", "Easy clean"]
  }
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'tile': return 'bg-gradient-to-r from-coral to-orange';
    case 'fiberglass': return 'bg-gradient-to-r from-primary to-teal';
    case 'vinyl': return 'bg-gradient-to-r from-secondary to-accent';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'tile': return <Star size={16} />;
    case 'fiberglass': return <Shield size={16} />;
    case 'vinyl': return <Droplets size={16} />;
    default: return <Palette size={16} />;
  }
};

const LinersSection = () => {
  const [selectedLiner, setSelectedLiner] = useState<Liner | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleRequestQuote = (liner: Liner) => {
    setSelectedLiner(liner);
    setShowQuoteModal(true);
  };

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Premium Pool Liners
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Transform your pool with our premium liner collection. Each liner is designed for durability, beauty, and long-lasting performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liners.map((liner, index) => (
              <Card 
                key={liner.name} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getTypeColor(liner.type)} text-white capitalize font-medium px-3 py-1`}>
                      <span className="flex items-center gap-1">
                        {getTypeIcon(liner.type)}
                        {liner.type}
                      </span>
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {liner.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Liner Preview */}
                  <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-teal/20 rounded-lg flex items-center justify-center border-2 border-muted">
                    <div className="text-center">
                      <Palette size={32} className="text-primary/60 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">{liner.pattern}</p>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal" />
                    <span className="text-2xl font-bold text-foreground">
                      {liner.price.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Specifications */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durability:</span>
                      <span className="font-medium">{liner.durability} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Warranty:</span>
                      <span className="font-medium">{liner.warranty}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    <ul className="space-y-1">
                      {liner.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Action Button */}
                  <Button 
                    onClick={() => handleRequestQuote(liner)}
                    variant="gradient"
                    className="w-full hover:scale-105 transition-all duration-300"
                    size="sm"
                  >
                    Get Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <SurveyQuoteTool 
        pool={null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        customProduct={selectedLiner ? {
          name: selectedLiner.name,
          price: selectedLiner.price,
          type: 'liner'
        } : undefined}
      />
    </>
  );
};

export default LinersSection;