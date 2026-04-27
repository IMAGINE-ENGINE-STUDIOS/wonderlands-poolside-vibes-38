import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShoppingCart } from "@/components/ShoppingCartProvider";
import { toast } from "sonner";
import SurveyQuoteTool from "./SurveyQuoteTool";
import RacebandBanner from "./RacebandBanner";
import { paverTypes } from "@/data/paverData";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Home, Shield, TrendingUp } from "lucide-react";
import lanaiStandardImg from "@/assets/lanai-standard.jpg";
import lanaiDeluxeImg from "@/assets/lanai-deluxe.jpg";
import lanaiPremiumImg from "@/assets/lanai-premium.jpg";
import concreteDeckTexture from "@/assets/textures/concrete-deck.avif";

interface LanaiOption {
  id: string;
  name: string;
  basePrice: number;
  image: string;
  badge: string;
  description: string;
  features: string[];
  gradient: string;
  warranty: string;
}

interface LanaiExtras {
  foundationType: 'concrete' | 'pavers';
  paverOption: string;
  color: 'white' | 'black';
}

const lanaiOptions: LanaiOption[] = [
  {
    id: "standard",
    name: "Standard Lanai",
    basePrice: 60,
    image: lanaiStandardImg,
    badge: "Value",
    description: "Complete aluminum frame patio cover with solid roof, foundation, and framing",
    features: [
      "Paver or concrete foundation included",
      "Durable aluminum frame construction",
      "Complete roof framing and installation",
      "Solid roof panels for complete weather protection",
      "Basic hardware and installation",
      "5-year warranty coverage",
      "White or black color options"
    ],
    gradient: "bg-gradient-to-r from-secondary to-accent",
    warranty: "5 Years"
  },
  {
    id: "deluxe",
    name: "Deluxe Lanai",
    basePrice: 80,
    image: lanaiDeluxeImg,
    badge: "Popular",
    description: "Complete glass roof veranda with foundation, enhanced features, and lighting",
    features: [
      "Paver or concrete foundation included",
      "Premium aluminum frame construction",
      "Complete roof framing and installation",
      "Tempered glass roof panels for natural light",
      "Enhanced hardware and installation",
      "Integrated LED lighting system",
      "10-year warranty coverage",
      "White or black color options"
    ],
    gradient: "bg-gradient-to-r from-primary to-teal",
    warranty: "10 Years"
  },
  {
    id: "premium",
    name: "Premium Lanai",
    basePrice: 100,
    image: lanaiPremiumImg,
    badge: "Ultimate",
    description: "Complete louvered canopy system with foundation, motorized louvers, and finished ceiling",
    features: [
      "Paver or concrete foundation included",
      "Heavy-duty aluminum frame construction",
      "Complete roof framing with finished ceiling",
      "Adjustable motorized louver system",
      "Premium hardware and professional installation",
      "Integrated weather sensors",
      "Lifetime warranty coverage",
      "White or black color options"
    ],
    gradient: "bg-gradient-to-r from-coral to-orange",
    warranty: "Lifetime"
  }
];

const LanaiSection = () => {
  const [selectedLanai, setSelectedLanai] = useState<LanaiOption | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [squareFootage, setSquareFootage] = useState<string>("");
  const [lanaiExtras, setLanaiExtras] = useState<LanaiExtras>({
    foundationType: 'concrete',
    paverOption: '',
    color: 'white'
  });
  const { addToCart } = useShoppingCart();

  const paverOptions = [
    {
      name: 'Concrete Deck',
      price: 0,
      image: concreteDeckTexture,
      description: 'Standard concrete deck'
    },
    ...paverTypes.map(paver => ({
      name: paver.name,
      price: 0,
      image: paver.image || lanaiStandardImg,
      description: paver.description,
      collection: paver.id.includes('appian') ? 'appian' : 
                  paver.id.includes('catalina') ? 'catalina' : 'standard'
    }))
  ];

  const toggleDetails = (lanai: LanaiOption) => {
    if (showDetails === lanai.id) {
      setShowDetails(null);
      setSelectedLanai(null);
    } else {
      setShowDetails(lanai.id);
      setSelectedLanai(lanai);
      setSquareFootage("");
      setLanaiExtras({
        foundationType: 'concrete',
        paverOption: '',
        color: 'white'
      });
    }
  };

  const openQuote = (lanai: LanaiOption) => {
    if (!squareFootage) {
      toast.error("Please customize and enter square footage first");
      return;
    }
    setSelectedLanai(lanai);
    setShowQuoteModal(true);
  };

  const calculatePrice = () => {
    if (!selectedLanai || !squareFootage) return 0;
    const sqft = parseFloat(squareFootage);
    return isNaN(sqft) ? 0 : sqft * selectedLanai.basePrice;
    // Foundation (concrete or pavers) is INCLUDED in the base price
  };

  const handleAddToCart = () => {
    if (!selectedLanai || !squareFootage) {
      toast.error("Please enter square footage");
      return;
    }

    const sqft = parseFloat(squareFootage);
    if (isNaN(sqft) || sqft <= 0) {
      toast.error("Please enter a valid square footage");
      return;
    }

    const totalPrice = calculatePrice();
    const colorText = lanaiExtras.color.charAt(0).toUpperCase() + lanaiExtras.color.slice(1);
    const foundationText = lanaiExtras.foundationType === 'pavers' && lanaiExtras.paverOption
      ? ` with ${lanaiExtras.paverOption}`
      : ' with Concrete Foundation';
    
    addToCart({
      id: `lanai-${selectedLanai.id}-${lanaiExtras.color}-${Date.now()}`,
      name: `${selectedLanai.name} - ${colorText}, ${sqft} sq ft${foundationText} (Foundation & Roof Included)`,
      price: totalPrice,
      category: "Lanai",
      image: selectedLanai.image
    });

    toast.success(`${selectedLanai.name} added to cart!`);
    setShowDetails(null);
  };

  const totalPrice = calculatePrice();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        <RacebandBanner title="Roof & Lanai Spaces" subtitle="Aluminum frame lanai systems for outdoor living" variant="primary" />

        {/* Lanai Options Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {lanaiOptions.map((lanai) => (
            <Card 
              key={lanai.id}
              className="group overflow-hidden border-2 transition-all duration-300"
            >
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img 
                  src={lanai.image} 
                  alt={lanai.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className={`absolute top-4 right-4 ${lanai.gradient} border-0`}>
                  {lanai.badge}
                </Badge>
              </div>
              
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{lanai.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-primary">${lanai.basePrice}</span>
                    <span className="text-muted-foreground">/sq ft</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{lanai.description}</p>
                  <div className="text-xs bg-primary/5 rounded-lg p-2 border border-primary/20">
                    <span className="text-primary font-semibold">✓ Includes:</span> Paver or concrete foundation & complete roof installation
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => toggleDetails(lanai)}
                    className="flex-1"
                    variant={showDetails === lanai.id ? "secondary" : "default"}
                  >
                    {showDetails === lanai.id ? 'Hide Details' : 'Customize'}
                  </Button>
                  <Button 
                    onClick={() => openQuote(lanai)}
                    variant="outline"
                    className="flex-1"
                  >
                    Get Quote
                  </Button>
                </div>

                {showDetails === lanai.id && (
                  <div className="space-y-4 animate-fade-in border-t pt-4">
                    <Separator className="mb-4" />
                    
                    {/* Square Footage Input */}
                    <div>
                      <Label htmlFor={`squareFootage-${lanai.id}`} className="text-sm font-semibold">
                        Square Footage
                      </Label>
                      <Input
                        id={`squareFootage-${lanai.id}`}
                        type="number"
                        placeholder="Enter square footage"
                        value={squareFootage}
                        onChange={(e) => setSquareFootage(e.target.value)}
                        className="mt-2"
                        min="0"
                      />
                    </div>

                    {/* Visual Color Selection */}
                    <div>
                      <Label className="text-sm font-semibold">Frame Color</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button
                          onClick={() => setLanaiExtras(prev => ({ ...prev, color: 'white' }))}
                          className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                            lanaiExtras.color === 'white' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full border-2 border-border bg-white" />
                          <span className="text-xs font-medium">White</span>
                        </button>
                        
                        <button
                          onClick={() => setLanaiExtras(prev => ({ ...prev, color: 'black' }))}
                          className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                            lanaiExtras.color === 'black' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full border-2 border-border bg-black" />
                          <span className="text-xs font-medium">Black</span>
                        </button>
                      </div>
                    </div>

                    {/* Foundation Type Selection */}
                    <div>
                      <Label className="text-sm font-semibold">Foundation Type (Included)</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button
                          onClick={() => setLanaiExtras(prev => ({ 
                            ...prev, 
                            foundationType: 'concrete',
                            paverOption: ''
                          }))}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            lanaiExtras.foundationType === 'concrete' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-sm font-semibold">Concrete</div>
                          <div className="text-[10px] text-muted-foreground mt-1">Standard foundation</div>
                        </button>
                        
                        <button
                          onClick={() => setLanaiExtras(prev => ({ ...prev, foundationType: 'pavers' }))}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            lanaiExtras.foundationType === 'pavers' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-sm font-semibold">Pavers</div>
                          <div className="text-[10px] text-muted-foreground mt-1">Premium pavers</div>
                        </button>
                      </div>
                    </div>

                    {/* Paver Selection Carousel */}
                    {lanaiExtras.foundationType === 'pavers' && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold">Select Paver Type</h4>
                        <Carousel className="w-full" opts={{ align: "start", loop: false }}>
                          <CarouselContent className="-ml-1">
                            {paverOptions.map(paver => (
                              <CarouselItem key={paver.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                                <div 
                                  className={`aspect-square p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md flex flex-col ${
                                    lanaiExtras.paverOption === paver.name 
                                      ? 'border-primary bg-primary/10' 
                                      : 'border-border'
                                  }`}
                                  onClick={() => setLanaiExtras(prev => ({ 
                                    ...prev, 
                                    paverOption: paver.name 
                                  }))}
                                >
                                  <div className="w-full flex-1 rounded-md mb-1 overflow-hidden">
                                    <img 
                                      src={paver.image} 
                                      alt={paver.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <p className="text-[10px] sm:text-xs font-medium text-center line-clamp-1">
                                    {paver.name}
                                  </p>
                                  <p className="text-[9px] text-primary text-center font-semibold">Included</p>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious className="left-0 -translate-x-1/2" />
                          <CarouselNext className="right-0 translate-x-1/2" />
                        </Carousel>
                      </div>
                    )}

                    {/* Price Summary */}
                    {squareFootage && (
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">Lanai ({squareFootage} sq ft)</span>
                          <span className="text-xl font-bold text-primary">${calculatePrice().toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          * Includes {lanaiExtras.foundationType === 'pavers' && lanaiExtras.paverOption 
                            ? `${lanaiExtras.paverOption}` 
                            : 'concrete'} foundation and complete roof installation
                        </div>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <Button 
                      onClick={handleAddToCart}
                      className="w-full"
                      disabled={!squareFootage}
                    >
                      Add to Cart - ${calculatePrice().toLocaleString()}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Information Section */}
        <div className="bg-card border rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-6 text-center">Why Choose Our Roof & Lanai Covers?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-all hover:bg-primary/20 hover:scale-105">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-bold mb-2">Outdoor Living</h4>
              <p className="text-sm text-muted-foreground">
                Expand your living space and enjoy the outdoors year-round in comfort
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-all hover:bg-primary/20 hover:scale-105">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-bold mb-2">Weather Protection</h4>
              <p className="text-sm text-muted-foreground">
                Shield your patio from sun, rain, and elements with durable aluminum construction
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-all hover:bg-primary/20 hover:scale-105">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h4 className="font-bold mb-2">Value Addition</h4>
              <p className="text-sm text-muted-foreground">
                Increase your property value with a premium outdoor living enhancement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Modal */}
      <SurveyQuoteTool
        pool={selectedLanai && squareFootage ? {
          model: selectedLanai.name,
          category: "standard",
          price: calculatePrice(),
          image: selectedLanai.image,
          dimensions: `${squareFootage} sq ft`,
          warrantyYears: selectedLanai.warranty
        } : null}
        extras={{
          productType: 'lanai',
          squareFootage: squareFootage,
          pricePerSqFt: `$${selectedLanai?.basePrice}/sq ft`,
          frameColor: lanaiExtras.color,
          foundationType: lanaiExtras.foundationType,
          paverOption: lanaiExtras.paverOption || 'Standard Concrete',
          foundationIncluded: true,
          roofIncluded: true,
          totalPrice: calculatePrice(),
          includedFeatures: [
            `${lanaiExtras.foundationType === 'pavers' && lanaiExtras.paverOption ? lanaiExtras.paverOption : 'Concrete'} foundation`,
            'Complete roof framing and installation',
            selectedLanai?.id === 'premium' ? 'Finished ceiling' : 'Standard roof',
            `${lanaiExtras.color} frame color`
          ]
        }}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
    </section>
  );
};

export default LanaiSection;
