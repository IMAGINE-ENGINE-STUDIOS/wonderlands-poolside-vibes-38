import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, Home, Shield, Star } from "lucide-react";
import { screenEnclosures, ScreenEnclosure } from "@/data/screenEnclosureData";
import { useShoppingCart } from "./ShoppingCart";
import { useToast } from "@/hooks/use-toast";
import ImageCard from "./ImageCard";

const ScreenEnclosuresSection = () => {
  const [selectedEnclosure, setSelectedEnclosure] = useState<ScreenEnclosure | null>(null);
  const [squareFootage, setSquareFootage] = useState("");
  const [isTwoStory, setIsTwoStory] = useState(false);
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();

  const calculatePrice = (enclosure: ScreenEnclosure, sqft: number, twoStory: boolean) => {
    const pricePerSqft = twoStory ? enclosure.premiumPrice : enclosure.basePrice;
    return sqft * pricePerSqft;
  };

  const handleAddToCart = () => {
    if (!selectedEnclosure || !squareFootage) {
      toast({
        title: "Missing Information",
        description: "Please select an enclosure and enter square footage.",
        variant: "destructive"
      });
      return;
    }

    const sqft = parseFloat(squareFootage);
    if (sqft <= 0) {
      toast({
        title: "Invalid Square Footage", 
        description: "Please enter a valid square footage amount.",
        variant: "destructive"
      });
      return;
    }

    const totalPrice = calculatePrice(selectedEnclosure, sqft, isTwoStory);
    
    addToCart({
      id: `${selectedEnclosure.id}-${sqft}-${isTwoStory}`,
      name: `${selectedEnclosure.name} (${sqft} sq ft${isTwoStory ? ' - Two Story' : ''})`,
      price: totalPrice,
      image: selectedEnclosure.image,
      category: "Screen Enclosures"
    });

    toast({
      title: "Added to Cart",
      description: `${selectedEnclosure.name} for ${sqft} sq ft added to cart - $${totalPrice.toLocaleString()}`
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'standard': return <Home className="h-4 w-4" />;
      case 'premium': return <Shield className="h-4 w-4" />;
      case 'deluxe': return <Star className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
      case 'premium': return 'bg-gradient-to-r from-primary to-teal'; 
      case 'deluxe': return 'bg-gradient-to-r from-coral to-orange';
      default: return 'bg-gradient-to-r from-secondary to-accent';
    }
  };

  return (
    <section id="screen-enclosures" className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
            Screen Enclosures
          </h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Protect your pool area with premium aluminum screen enclosures. Customized pricing based on your exact square footage needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enclosure Options */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-4">Choose Your Enclosure</h3>
            {screenEnclosures.map((enclosure) => (
              <Card 
                key={enclosure.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                  selectedEnclosure?.id === enclosure.id 
                    ? 'border-primary shadow-lg' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedEnclosure(enclosure as ScreenEnclosure)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getCategoryIcon(enclosure.category)}
                      {enclosure.name}
                    </CardTitle>
                    <Badge className={`${getCategoryColor(enclosure.category)} text-white text-xs`}>
                      {enclosure.category}
                    </Badge>
                  </div>
                  <CardDescription>{enclosure.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <div className="font-semibold">Single Story: ${enclosure.basePrice}/sq ft</div>
                      <div className="font-semibold">Two Story: ${enclosure.premiumPrice}/sq ft</div>
                    </div>
                    <ImageCard 
                      src={enclosure.image} 
                      alt={enclosure.name}
                      className="w-20 h-16 rounded-lg"
                      objectFit="cover"
                      enableZoom={false}
                    />
                  </div>
                  <div className="space-y-1">
                    {enclosure.features.map((feature, index) => (
                      <div key={index} className="text-sm text-foreground/70 flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Calculator */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Price Calculator
                </CardTitle>
                <CardDescription>
                  Enter your pool area square footage for instant pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="sqft">Square Footage</Label>
                  <Input
                    id="sqft"
                    type="number" 
                    placeholder="Enter square footage"
                    value={squareFootage}
                    onChange={(e) => setSquareFootage(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="twoStory"
                    checked={isTwoStory}
                    onChange={(e) => setIsTwoStory(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="twoStory" className="cursor-pointer">
                    Two-story enclosure
                  </Label>
                </div>

                {selectedEnclosure && squareFootage && parseFloat(squareFootage) > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold mb-2">Price Estimate</div>
                    <div className="text-sm text-foreground/70 mb-2">
                      {selectedEnclosure.name}
                    </div>
                    <div className="text-sm text-foreground/70 mb-2">
                      {squareFootage} sq ft × ${isTwoStory ? selectedEnclosure.premiumPrice : selectedEnclosure.basePrice}/sq ft
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      ${calculatePrice(selectedEnclosure, parseFloat(squareFootage), isTwoStory).toLocaleString()}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleAddToCart}
                  className="w-full"
                  disabled={!selectedEnclosure || !squareFootage || parseFloat(squareFootage) <= 0}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScreenEnclosuresSection;