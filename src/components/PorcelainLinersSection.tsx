import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { Sparkles, Gem } from "lucide-react";

interface PorcelainLiner {
  id: string;
  name: string;
  price: number;
  type: "Porcelain" | "Italian Stone";
  pattern: string;
  durability: string;
  warranty: string;
  image: string;
  features: string[];
}

const porcelainLiners: PorcelainLiner[] = [
  {
    id: "tikal",
    name: "Tikal",
    price: 2400,
    type: "Porcelain",
    pattern: "Marbled Blue",
    durability: "Premium",
    warranty: "25 years",
    image: "/lovable-uploads/d5e74c29-95f6-4a9a-9395-a98fe4efdadd.png",
    features: ["Slip-resistant surface", "UV protection", "Stain resistant", "Easy maintenance"]
  },
  {
    id: "port-royal",
    name: "Port Royal",
    price: 2600,
    type: "Porcelain",
    pattern: "Deep Ocean Blue",
    durability: "Premium",
    warranty: "25 years",
    image: "/lovable-uploads/56fd62de-130b-4b90-98a0-596007f5dadb.png",
    features: ["Slip-resistant surface", "UV protection", "Stain resistant", "Easy maintenance"]
  },
  {
    id: "alexandria",
    name: "Alexandria",
    price: 2500,
    type: "Porcelain",
    pattern: "Golden Marble",
    durability: "Premium",
    warranty: "25 years",
    image: "/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png",
    features: ["Slip-resistant surface", "UV protection", "Stain resistant", "Easy maintenance"]
  },
  {
    id: "san-marino",
    name: "San Marino",
    price: 2800,
    type: "Italian Stone",
    pattern: "Dark Granite",
    durability: "Luxury",
    warranty: "30 years",
    image: "/lovable-uploads/7f823d88-d9f2-4ecf-bcd1-a9d25d8519a8.png",
    features: ["Natural stone texture", "Thermal shock resistant", "Frost resistant", "Premium finish"]
  },
  {
    id: "firenze",
    name: "Firenze",
    price: 2900,
    type: "Italian Stone",
    pattern: "Blue Grey Marble",
    durability: "Luxury",
    warranty: "30 years",
    image: "/lovable-uploads/797bcadb-19bc-4859-8319-ceb12ea23d10.png",
    features: ["Natural stone texture", "Thermal shock resistant", "Frost resistant", "Premium finish"]
  },
  {
    id: "naples",
    name: "Naples",
    price: 2700,
    type: "Italian Stone",
    pattern: "Warm Beige Stone",
    durability: "Luxury",
    warranty: "30 years",
    image: "/lovable-uploads/a378df22-0a67-4626-ac93-c6cf8fe37602.png",
    features: ["Natural stone texture", "Thermal shock resistant", "Frost resistant", "Premium finish"]
  },
  {
    id: "milan",
    name: "Milan",
    price: 3000,
    type: "Italian Stone",
    pattern: "Charcoal Stone",
    durability: "Luxury",
    warranty: "30 years",
    image: "/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.png",
    features: ["Natural stone texture", "Thermal shock resistant", "Frost resistant", "Premium finish"]
  }
];

const getTypeColor = (type: string): string => {
  switch (type) {
    case "Porcelain":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "Italian Stone":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Porcelain":
      return <Sparkles className="w-4 h-4" />;
    case "Italian Stone":
      return <Gem className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

const PorcelainLinersSection = () => {
  const [selectedLiner, setSelectedLiner] = useState<PorcelainLiner | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleRequestQuote = (liner: PorcelainLiner) => {
    setSelectedLiner(liner);
    setShowQuoteModal(true);
  };

  return (
    <>
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Premium Porcelain & Stone Liners
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Discover our exclusive collection of porcelain and Italian stone pool liners, 
              crafted for luxury and built to last.
            </p>
          </div>

          <Carousel className="w-full max-w-6xl mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              {porcelainLiners.map((liner) => (
                <CarouselItem key={liner.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img 
                          src={liner.image} 
                          alt={liner.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className={`flex items-center gap-1 ${getTypeColor(liner.type)}`}>
                            {getTypeIcon(liner.type)}
                            {liner.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-foreground">{liner.name}</h3>
                          <span className="text-2xl font-bold text-primary">${liner.price.toLocaleString()}</span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pattern:</span>
                            <span className="font-medium">{liner.pattern}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Durability:</span>
                            <span className="font-medium">{liner.durability}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Warranty:</span>
                            <span className="font-medium">{liner.warranty}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Key Features:</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {liner.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button 
                          onClick={() => handleRequestQuote(liner)}
                          className="w-full bg-gradient-to-r from-primary to-coral hover:from-primary/90 hover:to-coral/90 text-white font-semibold"
                        >
                          Get Quote
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </section>

      <SurveyQuoteTool 
        pool={selectedLiner ? {
          model: selectedLiner.name,
          price: selectedLiner.price,
          category: "premium",
          dimensions: "Custom sized to pool",
          depth: "N/A"
        } : null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
    </>
  );
};

export default PorcelainLinersSection;