import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShoppingCart } from "@/components/ShoppingCartProvider";
import { toast } from "sonner";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
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

import lanaiStandardImg from "@/assets/enclosures/lanai-standard.webp";
import lanaiDeluxeImg from "@/assets/enclosures/lanai-deluxe.webp";
import lanaiPremiumImg from "@/assets/enclosures/lanai-premium.webp";
import concreteDeckTexture from "@/assets/textures/concrete-deck.avif";
import EditorialSectionHeader from "./EditorialSectionHeader";

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
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <EditorialSectionHeader
          eyebrow="Volume IX — Shade"
          title="Roof & Lanai Spaces"
          description="Aluminium frame lanai systems composing the perfect outdoor living room."
          action={
            <Link
              to="/suites/lanai"
              className="inline-flex items-center gap-2 border-b border-foreground/40 pb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground transition hover:border-foreground"
            >
              Open the Lanai Suite
              <span aria-hidden>&rarr;</span>
            </Link>
          }
        />

        {/* Lanai Options Grid */}
        <ProductScrollRow className="mb-16">
          {lanaiOptions.map((lanai) => (
            <Card 
              key={lanai.id}
              className="group rounded-none border border-border/70 overflow-hidden transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)]"
            >
              <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                <img loading="lazy" decoding="async" 
                  src={lanai.image} 
                  alt={lanai.name}
                  className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                    {lanai.badge}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground mb-3">{lanai.name}</h3>
                  <div className="flex items-end justify-between gap-4 border-t border-border/60 pt-4 mb-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Rate</p>
                      <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">${lanai.basePrice}<span className="text-sm text-muted-foreground">/sq ft</span></p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{lanai.description}</p>
                  <div className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground border-t border-border/60 pt-3">
                    Includes foundation &amp; complete roof installation
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => toggleDetails(lanai)}
                    className={`flex-1 rounded-none text-[10px] uppercase tracking-[0.3em] ${showDetails === lanai.id ? '' : 'bg-foreground text-background hover:bg-foreground/90'}`}
                    variant={showDetails === lanai.id ? "secondary" : "default"}
                  >
                    {showDetails === lanai.id ? 'Hide Details' : 'Customize'}
                  </Button>
                  <Button 
                    onClick={() => openQuote(lanai)}
                    variant="outline"
                    className="flex-1 rounded-none text-[10px] uppercase tracking-[0.3em]"
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
                          className={`p-3 rounded-none border-2 transition-all flex flex-col items-center gap-2 ${
                            lanaiExtras.color === 'white' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-none border-2 border-border bg-white" />
                          <span className="text-xs font-medium">White</span>
                        </button>
                        
                        <button
                          onClick={() => setLanaiExtras(prev => ({ ...prev, color: 'black' }))}
                          className={`p-3 rounded-none border-2 transition-all flex flex-col items-center gap-2 ${
                            lanaiExtras.color === 'black' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-none border-2 border-border bg-black" />
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
                          className={`p-3 rounded-none border-2 transition-all ${
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
                          className={`p-3 rounded-none border-2 transition-all ${
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
                                  className={`aspect-square p-2 border rounded-none cursor-pointer transition-all hover:shadow-md flex flex-col ${
                                    lanaiExtras.paverOption === paver.name 
                                      ? 'border-primary bg-primary/10' 
                                      : 'border-border'
                                  }`}
                                  onClick={() => setLanaiExtras(prev => ({ 
                                    ...prev, 
                                    paverOption: paver.name 
                                  }))}
                                >
                                  <div className="w-full flex-1 rounded-none mb-1 overflow-hidden">
                                    <img loading="lazy" decoding="async" 
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
                      <div className="bg-muted p-4 rounded-none">
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
                      className="w-full rounded-none bg-foreground text-background text-[10px] uppercase tracking-[0.3em] hover:bg-foreground/90"
                      disabled={!squareFootage}
                    >
                      Add to Cart - ${calculatePrice().toLocaleString()}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </ProductScrollRow>

        {/* Information Section — editorial afterword plate */}
        <div className="mt-20 border border-border/60 bg-card/40">
          <div className="border-b border-border/60 px-6 py-4 md:px-10 md:py-5">
            <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">
              Volume IX — Afterword
            </p>
          </div>
          <div className="grid grid-cols-1 divide-y divide-border/60 md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              {
                num: "01",
                title: "Outdoor Living",
                text: "Expand your living space and enjoy the outdoors year-round in comfort."
              },
              {
                num: "02",
                title: "Weather Protection",
                text: "Shield your patio from sun, rain, and elements with durable aluminum construction."
              },
              {
                num: "03",
                title: "Value Addition",
                text: "Increase your property value with a premium outdoor living enhancement."
              }
            ].map((item) => (
              <div
                key={item.num}
                className="p-6 md:p-10 text-center transition-colors duration-300 hover:bg-muted/20"
              >
                <span className="inline-block mb-5 border border-border/60 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                  {item.num}
                </span>
                <h3 className="mb-3 font-serif text-2xl font-light tracking-tight text-foreground md:text-3xl">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
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
