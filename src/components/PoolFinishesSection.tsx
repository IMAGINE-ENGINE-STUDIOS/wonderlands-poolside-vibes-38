import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Sparkles, Award, Eye } from "lucide-react";

// Import finish images
import sapphireBlueG3 from "@/assets/finishes/sapphire-blue-g3.jpg";
import oceanBlueG3 from "@/assets/finishes/ocean-blue-g3.jpg";
import nightSkyG3 from "@/assets/finishes/night-sky-g3.jpg";
import shaleGrayG3 from "@/assets/finishes/shale-gray-g3.jpg";
import coastalBronzeG3 from "@/assets/finishes/coastal-bronze-g3.jpg";
import athensPearlWhiteG3 from "@/assets/finishes/athens-pearl-white-g3.jpg";
import lagoonBlueG2 from "@/assets/finishes/lagoon-blue-g2.jpg";
import azureBlueG2 from "@/assets/finishes/azure-blue-g2.jpg";
import aquamarineG3 from "@/assets/finishes/aquamarine-g3.jpg";

export interface PoolFinish {
  id: string;
  name: string;
  collection: 'Crystite Classic' | 'Crystite Crystal';
  category: 'Deep & Dramatic' | 'Rich & Vibrant' | 'Light & Tranquil';
  description: string;
  image: string;
  price: number;
  popular?: boolean;
  features: string[];
}

const poolFinishes: PoolFinish[] = [
  {
    id: "sapphire-blue-g3",
    name: "Sapphire Blue G3",
    collection: "Crystite Crystal",
    category: "Rich & Vibrant",
    description: "A stunning deep blue with crystalline sparkle that creates a luxurious Caribbean feel",
    image: sapphireBlueG3,
    price: 3500,
    popular: true,
    features: ["UV Resistant", "Non-Slip Surface", "Easy Maintenance", "25-Year Warranty"]
  },
  {
    id: "ocean-blue-g3",
    name: "Ocean Blue G3",
    collection: "Crystite Crystal",
    category: "Rich & Vibrant",
    description: "Deep ocean blue finish that creates the perfect tropical paradise aesthetic",
    image: oceanBlueG3,
    price: 3500,
    features: ["UV Resistant", "Crystalline Finish", "Stain Resistant", "25-Year Warranty"]
  },
  {
    id: "night-sky-g3",
    name: "Night Sky G3",
    collection: "Crystite Crystal",
    category: "Deep & Dramatic",
    description: "Dramatic dark finish with subtle sparkle, perfect for evening ambiance",
    image: nightSkyG3,
    price: 3800,
    features: ["Premium Crystal Technology", "UV Resistant", "Heat Reflective", "25-Year Warranty"]
  },
  {
    id: "shale-gray-g3",
    name: "Shale Gray G3",
    collection: "Crystite Crystal",
    category: "Light & Tranquil",
    description: "Sophisticated gray tone that complements modern architectural styles",
    image: shaleGrayG3,
    price: 3500,
    features: ["Modern Aesthetic", "UV Resistant", "Easy Cleaning", "25-Year Warranty"]
  },
  {
    id: "coastal-bronze-g3",
    name: "Coastal Bronze G3",
    collection: "Crystite Crystal",
    category: "Rich & Vibrant",
    description: "Warm bronze tones that create a natural, earthy pool environment",
    image: coastalBronzeG3,
    price: 3500,
    features: ["Natural Look", "UV Resistant", "Slip Resistant", "25-Year Warranty"]
  },
  {
    id: "athens-pearl-white-g3",
    name: "Athens Pearl White G3",
    collection: "Crystite Crystal",
    category: "Light & Tranquil",
    description: "Elegant pearl white finish for a classic, timeless pool appearance",
    image: athensPearlWhiteG3,
    price: 3200,
    features: ["Classic Elegance", "UV Resistant", "Bright Appearance", "25-Year Warranty"]
  },
  {
    id: "lagoon-blue-g2",
    name: "Lagoon Blue G2",
    collection: "Crystite Classic",
    category: "Rich & Vibrant",
    description: "Traditional blue finish with reliable performance and lasting beauty",
    image: lagoonBlueG2,
    price: 2800,
    features: ["Traditional Blue", "UV Resistant", "Proven Performance", "20-Year Warranty"]
  },
  {
    id: "azure-blue-g2",
    name: "Azure Blue G2",
    collection: "Crystite Classic",
    category: "Light & Tranquil",
    description: "Light azure blue for a refreshing, inviting pool experience",
    image: azureBlueG2,
    price: 2800,
    features: ["Light & Refreshing", "UV Resistant", "Easy Maintenance", "20-Year Warranty"]
  },
  {
    id: "aquamarine-g3",
    name: "Aquamarine G3",
    collection: "Crystite Crystal",
    category: "Light & Tranquil",
    description: "Beautiful aquamarine finish with crystal clarity and tropical appeal",
    image: aquamarineG3,
    price: 3500,
    features: ["Crystal Clarity", "UV Resistant", "Tropical Look", "25-Year Warranty"]
  }
];

const PoolFinishesSection = () => {
  const [selectedFinish, setSelectedFinish] = useState<PoolFinish | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredFinishes = activeCategory === "all" 
    ? poolFinishes 
    : poolFinishes.filter(finish => finish.category === activeCategory);

  const categories = [
    { value: "all", label: "All Finishes", icon: Palette },
    { value: "Deep & Dramatic", label: "Deep & Dramatic", icon: Eye },
    { value: "Rich & Vibrant", label: "Rich & Vibrant", icon: Sparkles },
    { value: "Light & Tranquil", label: "Light & Tranquil", icon: Award }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
            Premium Pool Finishes
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Transform your pool with Latham's premium Crystite finishes. Choose from stunning colors and advanced materials designed for beauty, durability, and easy maintenance.
          </p>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-12">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                  <span className="sm:hidden">{category.label.split(' ')[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeCategory}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredFinishes.map((finish, index) => (
                <Card 
                  key={finish.id} 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card/50 backdrop-blur-sm border border-border/50"
                  onClick={() => setSelectedFinish(finish)}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={finish.image} 
                      alt={finish.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {finish.popular && (
                      <Badge className="absolute top-2 right-2 bg-coral text-white">
                        Popular
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-sm font-medium">{finish.collection}</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{finish.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {finish.category}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                      {finish.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        +${finish.price.toLocaleString()}
                      </span>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Detail Modal */}
        {selectedFinish && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedFinish(null)}>
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="space-y-4">
                  <img 
                    src={selectedFinish.image} 
                    alt={selectedFinish.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="secondary">{selectedFinish.collection}</Badge>
                    <Badge variant="outline">{selectedFinish.category}</Badge>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{selectedFinish.name}</h3>
                    <p className="text-foreground/80">{selectedFinish.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {selectedFinish.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-primary">
                        +${selectedFinish.price.toLocaleString()}
                      </span>
                      <Badge variant="secondary">Premium Finish</Badge>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button className="flex-1" variant="gradient">
                        Select This Finish
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedFinish(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Pool Finish Technology Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6 bg-gradient-to-br from-primary/10 to-coral/10 border-none">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Crystite Technology</h3>
            <p className="text-sm text-foreground/70">
              Advanced crystal-infused finishes that provide superior durability and stunning visual effects
            </p>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-br from-coral/10 to-teal/10 border-none">
            <div className="w-16 h-16 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-coral" />
            </div>
            <h3 className="font-bold mb-2">25-Year Warranty</h3>
            <p className="text-sm text-foreground/70">
              Industry-leading warranty coverage for peace of mind and long-term protection
            </p>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-br from-teal/10 to-primary/10 border-none">
            <div className="w-16 h-16 bg-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-teal" />
            </div>
            <h3 className="font-bold mb-2">Color Preview</h3>
            <p className="text-sm text-foreground/70">
              See exactly how your chosen finish will look with our advanced color visualization
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PoolFinishesSection;