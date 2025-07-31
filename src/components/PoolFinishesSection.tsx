import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Sparkles, Award, Eye } from "lucide-react";

// Pool finishes now use uploaded images directly in the data

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
    id: "sapphire-blue-crystal",
    name: "Sapphire Blue",
    collection: "Crystite Crystal",
    category: "Rich & Vibrant",
    description: "A stunning deep blue with crystalline sparkle that creates a luxurious Caribbean feel",
    image: "/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png",
    price: 3500,
    popular: true,
    features: ["Crystal Sparkle", "Deep Blue Color", "UV Resistant", "25-Year Warranty"]
  },
  {
    id: "ocean-blue-crystal",
    name: "Ocean Blue",
    collection: "Crystite Crystal",
    category: "Rich & Vibrant",
    description: "Deep ocean blue with crystal aggregates for a premium tropical look",
    image: "/lovable-uploads/2103693f-cf54-423d-99c7-68d6f3951388.png",
    price: 3500,
    features: ["Ocean Depth", "Crystal Finish", "UV Protection", "25-Year Warranty"]
  },
  {
    id: "night-sky-crystal",
    name: "Night Sky",
    collection: "Crystite Crystal",
    category: "Deep & Dramatic",
    description: "Dark blue with brilliant crystal flecks that shimmer like stars in the night sky",
    image: "/lovable-uploads/90fe0136-31f1-4fa3-b816-56a7a74484fa.png",
    price: 3500,
    features: ["Starlike Sparkle", "Dark Dramatic Look", "Crystal Aggregates", "25-Year Warranty"]
  },
  {
    id: "shale-gray-crystal",
    name: "Shale Gray",
    collection: "Crystite Crystal",
    category: "Light & Tranquil",
    description: "Sophisticated gray with crystal accents for a modern, refined appearance",
    image: "/lovable-uploads/15032ed4-f745-4152-ae9b-c26fdb52f68c.png",
    price: 3500,
    features: ["Modern Gray", "Crystal Accents", "Contemporary Look", "25-Year Warranty"]
  },
  {
    id: "coastal-bronze-crystal",
    name: "Coastal Bronze",
    collection: "Crystite Crystal",
    category: "Rich & Vibrant",
    description: "Warm bronze tones with crystal sparkle reminiscent of coastal sunsets",
    image: "/lovable-uploads/b1abd5c3-af2e-46fa-82be-5db27d20a388.png",
    price: 3500,
    features: ["Bronze Warmth", "Crystal Sparkle", "Coastal Appeal", "25-Year Warranty"]
  },
  {
    id: "pearl-white-crystal",
    name: "Pearl White",
    collection: "Crystite Crystal",
    category: "Light & Tranquil",
    description: "Elegant white with pearl-like crystal finish for timeless sophistication",
    image: "/lovable-uploads/0a3d28a3-a0dd-41e8-91ba-6c0ec4dbe9af.png",
    price: 3500,
    features: ["Pearl Luster", "Crystal Clarity", "Timeless Elegance", "25-Year Warranty"]
  },
  {
    id: "sapphire-blue-classic",
    name: "Sapphire Blue",
    collection: "Crystite Classic",
    category: "Rich & Vibrant",
    description: "Classic sapphire blue with traditional aggregate finish for enduring beauty",
    image: "/lovable-uploads/822d9341-f6f8-46ee-9d13-07d0f2126252.png",
    price: 3200,
    features: ["Classic Blue", "Traditional Finish", "Durable Surface", "20-Year Warranty"]
  },
  {
    id: "ocean-blue-classic",
    name: "Ocean Blue",
    collection: "Crystite Classic",
    category: "Rich & Vibrant",
    description: "Deep ocean blue with classic aggregate texture for reliable performance",
    image: "/lovable-uploads/0eed319b-cfe9-4a44-b1b6-da0171c95beb.png",
    price: 3200,
    features: ["Ocean Depth", "Classic Texture", "Proven Durability", "20-Year Warranty"]
  },
  {
    id: "night-sky-classic",
    name: "Night Sky",
    collection: "Crystite Classic",
    category: "Deep & Dramatic",
    description: "Dramatic dark blue with classic finish that captures the mystery of twilight",
    image: "/lovable-uploads/75602748-6f43-4f81-9cbe-a3e8c81db8d4.png",
    price: 3200,
    features: ["Dramatic Dark Blue", "Classic Aggregate", "Twilight Appeal", "20-Year Warranty"]
  },
  {
    id: "shale-gray-classic",
    name: "Shale Gray",
    collection: "Crystite Classic",
    category: "Deep & Dramatic",
    description: "Sophisticated dark gray with classic aggregate finish for contemporary appeal",
    image: "/lovable-uploads/65596856-c21b-46d4-abeb-e241bc3b39b0.png",
    price: 3200,
    features: ["Contemporary Gray", "Classic Aggregate", "Modern Appeal", "20-Year Warranty"]
  },
  {
    id: "coastal-bronze-classic",
    name: "Coastal Bronze",
    collection: "Crystite Classic",
    category: "Rich & Vibrant",
    description: "Warm bronze tones with classic finish for natural coastal elegance",
    image: "/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png",
    price: 3200,
    features: ["Bronze Warmth", "Classic Finish", "Coastal Style", "20-Year Warranty"]
  },
  {
    id: "whisper-white-classic",
    name: "Whisper White Standard Gelcoat",
    collection: "Crystite Classic",
    category: "Light & Tranquil",
    description: "Pure white standard gelcoat finish for timeless, clean pool aesthetics",
    image: "/lovable-uploads/cbd9aade-2714-4ec4-ab12-8025f75190c6.png",
    price: 2800,
    features: ["Pure White", "Standard Gelcoat", "Clean Aesthetic", "15-Year Warranty"]
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