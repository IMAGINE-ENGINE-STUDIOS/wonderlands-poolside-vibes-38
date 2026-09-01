import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Waves, DollarSign, Thermometer, Shield, Zap, Droplets, Star, Clock, Award, Cpu, Edit, ShoppingCart, Sun, Ruler, FileText } from "lucide-react";
import StripeCheckoutButton from "./StripeCheckoutButton";
import ImageEditor from "./ImageEditor";
import { useShoppingCart } from "./ShoppingCartProvider";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { paverTypes } from "@/data/paverData";
import aquamarineFinish from '@/assets/finishes/aquamarine-g3.webp';
import oceanBlueFinish from '@/assets/finishes/ocean-blue-g3.webp';
import sapphireBlueFinish from '@/assets/finishes/sapphire-blue-g3.webp';
import nightSkyFinish from '@/assets/finishes/night-sky-g3.webp';
import athensPearlFinish from '@/assets/finishes/athens-pearl-white-g3.webp';
import lagoonBlueFinish from '@/assets/finishes/lagoon-blue-g2.webp';
import azureBlueFinish from '@/assets/finishes/azure-blue-g2.webp';
import coastalBronzeFinish from '@/assets/finishes/coastal-bronze-g3.webp';
import shaleGrayFinish from '@/assets/finishes/shale-gray-g3.webp';
import concreteDeckTexture from "@/assets/textures/concrete-deck.avif";
interface TanningLedge {
  name: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  description?: string;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
  /** Brand decides which interior finish family is offered (hard rule). */
  brand?: string;
}
interface TanningLedgeProductCardProps {
  ledge: TanningLedge;
  onViewDetails: (ledge: TanningLedge) => void;
  onRequestQuote: (ledge: TanningLedge, extras?: TanningLedgeExtras) => void;
  isAdmin?: boolean;
}
interface TanningLedgeExtras {
  heater: boolean;
  jets: boolean;
  jetQuantity: number;
  finish: string;
  heaterModel: string;
  paverOption: string;
  extrasBreakdown?: Array<{
    name: string;
    price: number;
  }>;
  extrasTotal?: number;
}
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium':
      return 'bg-gradient-to-r from-coral to-orange';
    case 'deluxe':
      return 'bg-gradient-to-r from-primary to-teal';
    case 'standard':
      return 'bg-gradient-to-r from-secondary to-accent';
    case 'compact':
      return 'bg-gradient-to-r from-teal to-primary';
    default:
      return 'bg-gradient-to-r from-coral to-orange';
  }
};
const getExtraPrice = (extra: string) => {
  switch (extra) {
    case 'heater':
      return 3000;
    // Tanning ledge heater pricing
    case 'jets':
      return 1200;
    // Tanning ledge jets pricing
    default:
      return 0;
  }
};

// Tanning ledge heater options
const ledgeHeaters = [{
  name: 'Pentair MasterTemp 125 (125K BTU)',
  price: 3450,
  image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp',
  description: 'Compact high-efficiency gas heater'
}, {
  name: 'Pentair UltraTemp 90 Heat Pump',
  price: 7762,
  image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.webp',
  description: 'Energy-efficient heat pump for tanning ledges'
}];

// Import pool finishes from consolidated products
import { getProductsByCategory } from '@/data/consolidatedProducts';
import InstallationNote from "@/components/InstallationNote";

/**
 * Finishes are brand-scoped (hard rule): Latham ledges get the Latham
 * Crystite/G3 finish range, GlimmerGlass ledges get GlimmerGlass gelcoat —
 * never the other brand's swatches.
 */
const lathamFinishOptions = getProductsByCategory('finish').map(finish => ({
  name: finish.name,
  color: '#4169E1',
  image: finish.image as string | undefined,
  price: finish.price / 2,
  // Tanning ledge pricing is half of pool pricing
  collection: finish.collection,
  category: finish.category,
  description: finish.description
}));

const glimmerglassFinishOptions = [
  { name: 'Ocean Blue', color: '#1E40AF' },
  { name: 'Sapphire Blue', color: '#2563EB' },
  { name: 'Glacier Blue', color: '#0EA5E9' },
  { name: 'Coastal Bronze', color: '#A16207' },
  { name: 'Steel Grey', color: '#6B7280' },
  { name: 'Snow White', color: '#FFFFFF' },
  { name: 'Arctic White', color: '#F8FAFC' },
].map(gelcoat => ({
  name: gelcoat.name,
  color: gelcoat.color,
  image: undefined as string | undefined,
  price: 0,
  collection: 'GlimmerGlass Gelcoat',
  category: 'finish',
  description: `GlimmerGlass ${gelcoat.name} gelcoat — included`,
}));

const getFinishOptionsForBrand = (brand?: string) =>
  brand && brand.toLowerCase().includes('glimmer')
    ? glimmerglassFinishOptions
    : lathamFinishOptions;

// Convert paver data to options format
const paverOptions = [{
  name: 'Concrete Deck',
  color: '#808080',
  price: 0,
  image: concreteDeckTexture,
  description: 'Standard concrete deck',
  collection: 'none'
}, ...paverTypes.map(paver => ({
  name: paver.name,
  color: '#D3D3D3',
  price: 0,
  image: paver.image || azureBlueFinish,
  description: paver.description,
  collection: paver.id.includes('appian') ? 'appian' : paver.id.includes('catalina') ? 'catalina' : 'standard'
}))];
const TanningLedgeProductCard = ({
  ledge,
  onViewDetails,
  onRequestQuote,
  isAdmin = false
}: TanningLedgeProductCardProps) => {
  // Brand decides the finish family — GlimmerGlass gelcoat vs Latham Crystite/G3
  const finishOptions = getFinishOptionsForBrand(ledge.brand);
  const [showDetails, setShowDetails] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showQuoteTool, setShowQuoteTool] = useState(false);
  const [currentLedgeImage, setCurrentLedgeImage] = useState(ledge.image);
  const [isEditable, setIsEditable] = useState(isAdmin);
  const [extras, setExtras] = useState<TanningLedgeExtras>({
    heater: false,
    jets: false,
    jetQuantity: 0,
    finish: '',
    heaterModel: '',
    paverOption: ''
  });
  const [paverSurfaceArea, setPaverSurfaceArea] = useState('');
  const {
    addToCart
  } = useShoppingCart();
  const handleImageClick = () => {
    setShowDetails(!showDetails);
  };
  const toggleExtra = (extra: string) => {
    setExtras(prev => {
      if (extra === 'heater') {
        return {
          ...prev,
          heater: !prev.heater
        };
      } else if (extra === 'jets') {
        return {
          ...prev,
          jets: !prev.jets
        };
      }
      return prev;
    });
  };
  const calculateTotalPrice = () => {
    let total = ledge.price;

    // Add finish price if not default
    const selectedFinish = finishOptions.find(finish => finish.name === extras.finish);
    if (selectedFinish && selectedFinish.price) {
      total += selectedFinish.price;
    }

    // Add heater price if selected
    if (extras.heater) {
      const selectedHeater = ledgeHeaters.find(heater => heater.name === extras.heaterModel);
      if (selectedHeater) total += selectedHeater.price;
    }
    if (extras.jets) total += getExtraPrice('jets') * extras.jetQuantity;

    // Add calculated paver surface area cost
    if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
      total += parseFloat(paverSurfaceArea) * 15;
    }
    return total;
  };
  const hasExtras = Object.values(extras).some(value => value);
  const handleImageSave = (imageBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentLedgeImage(reader.result as string);
    };
    reader.readAsDataURL(imageBlob);
  };
  const handleAddToCart = () => {
    const cartExtras = [];
    if (extras.heater) {
      const selectedHeater = ledgeHeaters.find(heater => heater.name === extras.heaterModel);
      if (selectedHeater) {
        cartExtras.push({
          name: `${selectedHeater.name}`,
          price: selectedHeater.price
        });
      }
    }
    if (extras.jets) cartExtras.push({
      name: `Tanning Ledge Jets (${extras.jetQuantity})`,
      price: getExtraPrice('jets') * extras.jetQuantity
    });

    // Add paver surface area cost
    if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
      cartExtras.push({
        name: `${extras.paverOption} (${paverSurfaceArea} sq ft)`,
        price: parseFloat(paverSurfaceArea) * 15
      });
    }
    addToCart({
      id: `tanning_ledge_${ledge.name.replace(/\s+/g, '_')}_${Date.now()}`,
      name: `${ledge.name} Tanning Ledge`,
      price: ledge.price,
      category: ledge.category,
      image: currentLedgeImage,
      extras: cartExtras
    });
  };
  return <Card className="group rounded-none border border-border/70 overflow-hidden transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)]">
      {/* Edge-to-edge Tanning Ledge Image at top */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 bg-muted cursor-pointer overflow-hidden group/image" onClick={handleImageClick}>
        {currentLedgeImage ? <img loading="lazy" decoding="async" src={currentLedgeImage} alt={ledge.name} className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover/image:scale-[1.06]" /> : <div className="w-full h-full flex items-center justify-center bg-muted">
            <Sun size={48} className="text-muted-foreground/50" />
          </div>}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

        {/* Category kicker overlay */}
        <div className="absolute top-4 left-4">
          <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm capitalize">
            {ledge.category}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/80">
            Tanning Ledge Collection
          </p>
          <span className="translate-y-1 text-[9px] uppercase tracking-[0.35em] text-white/0 transition-all duration-500 group-hover/image:translate-y-0 group-hover/image:text-white/90">
            View Details →
          </span>
        </div>

        {/* Image Edit Button - Only visible for admins */}
        {isAdmin && isEditable && <Button size="sm" variant="secondary" className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 rounded-none" onClick={e => {
        e.stopPropagation();
        setShowImageEditor(true);
      }}>
            <Edit className="h-3 w-3" />
          </Button>}
      </div>
      
      <CardContent className="p-4 sm:p-5 lg:p-7 space-y-5">
        
        {/* Tanning Ledge Name & Collection */}
        <div>
          <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
            {ledge.name}
          </h3>

          <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">From</p>
              <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">
                ${calculateTotalPrice().toLocaleString()}
              </p>
            </div>
            {ledge.dimensions && (
              <p className="text-right text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {ledge.dimensions}
              </p>
            )}
          </div>
        </div>
        
        {/* Basic Info */}
        <dl className="divide-y divide-border/60 border-y border-border/60 text-sm">
          {ledge.depth && <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Depth</dt>
              <dd className="text-right text-foreground">{ledge.depth}</dd>
            </div>}
          {ledge.installationTimeWeeks && <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Installation</dt>
              <dd className="text-right text-foreground">{ledge.installationTimeWeeks} weeks</dd>
            </div>}
          <div className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Warranty</dt>
            <dd className="text-right text-foreground">Lifetime</dd>
          </div>
        </dl>

        {/* Key Features */}
        {ledge.features && ledge.features.length > 0 && <div className="space-y-2">
            <h4 className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Features</h4>
            <ul className="space-y-1">
              {ledge.features.slice(0, 2).map((feature, idx) => <li key={idx} className="text-sm text-muted-foreground">
                  {feature}
                </li>)}
            </ul>
          </div>}
        
        {/* Feature Checkboxes */}
        
        
        {/* Expanded Details */}
        {showDetails && <div className="space-y-4 animate-fade-in-up">
            <Separator />
            
            {/* Finishes */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Finish Options</h4>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {finishOptions.map(finish => <CarouselItem key={finish.name} className="pl-1 basis-1/2">
                      <div className={`p-3 border rounded-none cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.finish === finish.name ? 'border-foreground/60 bg-foreground/5' : 'border-border'}`} onClick={() => setExtras(prev => ({
                  ...prev,
                  finish: finish.name
                }))}>
                        <div className="w-full h-16 rounded-none mb-2 overflow-hidden flex-shrink-0">
                          <img loading="lazy" decoding="async" src={finish.image} alt={finish.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{finish.name}</p>
                          {finish.price > 0 && <p className="text-xs text-foreground font-medium text-center mt-1">+${finish.price.toLocaleString()}</p>}
                        </div>
                      </div>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>

            {/* Paver Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Paver Options & Surface Area Calculator</h4>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {paverOptions.map(paver => <CarouselItem key={paver.name} className="pl-1 basis-1/2">
                      <div className={`p-3 border rounded-none cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.paverOption === paver.name ? 'border-foreground/60 bg-foreground/5' : 'border-border'}`} onClick={() => setExtras(prev => ({
                  ...prev,
                  paverOption: paver.name
                }))}>
                        <div className="w-full h-16 rounded-none mb-2 overflow-hidden flex-shrink-0">
                          <img loading="lazy" decoding="async" src={paver.image} alt={paver.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{paver.name}</p>
                          {paver.price > 0 && <p className="text-xs text-foreground font-medium text-center mt-1">+${paver.price.toLocaleString()}</p>}
                        </div>
                      </div>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
              <div className="mt-3">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Paver Surface Area (sq ft)
                </label>
                <Input type="number" placeholder="Enter surface area for pavers" value={paverSurfaceArea} onChange={e => setPaverSurfaceArea(e.target.value)} className="mb-2" />
                {paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea)) && <div className="text-xs text-green-600 font-medium">
                    Calculated Cost: ${(parseFloat(paverSurfaceArea) * 15).toLocaleString()} ({paverSurfaceArea} sq ft × $15/sq ft)
                  </div>}
              </div>
            </div>

            {/* Add-ons */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Additional Features</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-none hover:bg-muted/50 transition-colors">
                  <Checkbox checked={extras.heater} onCheckedChange={() => toggleExtra('heater')} className="data-[state=checked]:bg-foreground data-[state=checked]:border-foreground" />
                  <div className="flex items-center space-x-1">
                    <Thermometer size={16} className="text-muted-foreground" />
                    <span className="text-sm">Add Heater (+${extras.heater ? (() => {
                    const selectedHeater = ledgeHeaters.find(heater => heater.name === extras.heaterModel);
                    return selectedHeater ? selectedHeater.price.toLocaleString() : '0';
                  })() : '0'})</span>
                  </div>
                </label>

                {extras.heater && <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Heater Model:</label>
                    <div className="grid grid-cols-1 gap-2">
                      {ledgeHeaters.map(heater => <button key={heater.name} onClick={() => setExtras(prev => ({
                  ...prev,
                  heaterModel: heater.name
                }))} className={`p-2 text-xs rounded-none border transition-all flex items-center gap-2 ${extras.heaterModel === heater.name ? 'border-foreground/60 bg-foreground/5 text-foreground' : 'border-border hover:border-foreground/40'}`}>
                          <img loading="lazy" decoding="async" src={heater.image} alt={heater.name} className="w-8 h-8 rounded object-cover" />
                          <div className="flex-1 text-left">
                            <div>{heater.name}</div>
                            <div className="text-xs text-muted-foreground">${heater.price.toLocaleString()}</div>
                            {heater.description && <div className="text-xs text-muted-foreground">{heater.description}</div>}
                          </div>
                        </button>)}
                    </div>
                  </div>}
                
                <div className="flex items-center justify-between p-2 border rounded-none">
                  <label className="flex items-center space-x-2 cursor-pointer flex-1">
                    <Checkbox checked={extras.jets} onCheckedChange={() => toggleExtra('jets')} />
                    <div className="flex items-center space-x-1">
                      <Zap size={16} className="text-muted-foreground" />
                      <span className="text-sm">Jets (+${(getExtraPrice('jets') * extras.jetQuantity).toLocaleString()})</span>
                    </div>
                  </label>
                  {extras.jets && <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setExtras(prev => ({
                  ...prev,
                  jetQuantity: Math.max(1, prev.jetQuantity - 1)
                }))} className="h-8 w-8 p-0 rounded-none">
                        -
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{extras.jetQuantity}</span>
                      <Button variant="outline" size="sm" onClick={() => setExtras(prev => ({
                  ...prev,
                  jetQuantity: prev.jetQuantity + 1
                }))} className="h-8 w-8 p-0 rounded-none">
                        +
                      </Button>
                    </div>}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <InstallationNote className="mb-2" />
              <div className="flex gap-2">
                <Button onClick={() => {
              // Create extras breakdown for quote
              const extrasBreakdown = [];

              // Add finish if not default
              const selectedFinish = finishOptions.find(finish => finish.name === extras.finish);
              if (selectedFinish && selectedFinish.price) {
                extrasBreakdown.push({
                  name: selectedFinish.name,
                  price: selectedFinish.price,
                  image: selectedFinish.image
                });
              }

              // Add heater if selected
              if (extras.heater) {
                const selectedHeater = ledgeHeaters.find(heater => heater.name === extras.heaterModel);
                if (selectedHeater) {
                  extrasBreakdown.push({
                    name: selectedHeater.name,
                    price: selectedHeater.price,
                    image: selectedHeater.image
                  });
                }
              }

              // Add jets if selected
              if (extras.jets) {
                extrasBreakdown.push({
                  name: `Tanning Ledge Jets (${extras.jetQuantity})`,
                  price: getExtraPrice('jets') * extras.jetQuantity,
                  image: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.webp'
                });
              }

              // Add paver surface area cost
              if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
                extrasBreakdown.push({
                  name: `${extras.paverOption} (${paverSurfaceArea} sq ft)`,
                  price: parseFloat(paverSurfaceArea) * 15,
                  image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.webp'
                });
              }
              const extrasTotal = extrasBreakdown.reduce((sum, item) => sum + item.price, 0);
              onRequestQuote(ledge, {
                ...extras,
                extrasBreakdown,
                extrasTotal
              });
            }} className="flex-1 instant-quote-btn transition-all duration-300 rounded-none" size="sm">
                  Instant Quote
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddToCart} variant="outline" size="sm" className="flex-1 rounded-none">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                </Button>
                <StripeCheckoutButton productId={`tanning_ledge_${ledge.name.replace(/\s+/g, '_')}`} productName={ledge.name} price={calculateTotalPrice()} variant="gradient" className="flex-1 text-xs px-2" size="sm" />
              </div>
            </div>
            
            {/* Final Price Display */}
            <div className="mt-4 p-3 border-t border-border/60">
              <div className="text-center">
                <h5 className="text-sm font-medium text-muted-foreground">Total Configuration Price</h5>
                <div className="text-2xl font-bold text-foreground">${calculateTotalPrice().toLocaleString()}</div>
              </div>
            </div>

            {/* Bottom Dashboard - Integrated Financing */}
            <div className="mt-4 p-4 border border-border/60">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-sm text-foreground">Finance This Purchase</h5>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center p-2 bg-white/50 rounded">
                      <div className="font-semibold">2 Years</div>
                      <div className="text-muted-foreground">${(calculateTotalPrice() / 24).toLocaleString()}/mo</div>
                    </div>
                    <div className="text-center p-2 bg-white/50 rounded">
                      <div className="font-semibold">4 Years</div>
                      <div className="text-muted-foreground">${(calculateTotalPrice() / 48).toLocaleString()}/mo</div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full rounded-none" size="sm" onClick={() => {
                const lyonFinancialUrl = `https://www.lyonfinancial.net/apply/?` + `amount=${calculateTotalPrice()}&` + `product=${encodeURIComponent(ledge.name)}&` + `description=${encodeURIComponent(`Complete tanning ledge configuration including ${ledge.name}`)}&` + `monthly_payment=${Math.round(calculateTotalPrice() * 0.008)}&` + `loan_term=48&` + `project_type=Pool%20Installation`;
                window.open(lyonFinancialUrl, '_blank');
              }}>
                    Apply with Lyon Financial
                  </Button>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    *Financing subject to credit approval. APR varies.
                  </div>
                </div>
              </div>
            </div>
          </div>}
        
        {/* Finish Carousel - Always Visible when collapsed */}
        {!showDetails && (
          <div className="space-y-3">
            <div 
              className="space-y-2"
              onMouseEnter={() => setShowDetails(true)}
              onTouchStart={() => setShowDetails(true)}
            >
              <h4 className="font-semibold text-foreground text-sm">Finish Options</h4>
              <Carousel 
                className="w-full"
                opts={{
                  align: "start",
                  loop: false,
                  duration: 25,
                }}
              >
                <CarouselContent className="-ml-1">
                  {finishOptions.slice(0, 6).map((finish, idx) => (
                    <CarouselItem
                      key={`ledge-preview-${finish.name}-${idx}`}
                      className="pl-1 basis-1/2"
                    >
                      <div
                        className={`p-2 border rounded-none cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.finish === finish.name ? "border-foreground/60 bg-foreground/5" : "border-border"}`}
                        onClick={() => {
                          setExtras((prev) => ({
                            ...prev,
                            finish: finish.name,
                          }));
                          setShowDetails(true);
                        }}
                      >
                        <div className="w-full h-12 rounded-none mb-1 overflow-hidden flex-shrink-0">
                          <img
                            src={finish.image}
                            alt={finish.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-[10px] font-medium text-center line-clamp-1">{finish.name}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 h-6 w-6" />
                <CarouselNext className="right-0 h-6 w-6" />
              </Carousel>
            </div>
            
            {/* Expand Arrow */}
            <div 
              className="flex flex-col items-center cursor-pointer py-2 hover:bg-muted/50 rounded-none transition-all group"
              onClick={() => setShowDetails(true)}
              onMouseEnter={() => setShowDetails(true)}
            >
              <span className="text-xs text-muted-foreground mb-1">View all options</span>
              <svg 
                className="w-5 h-5 text-muted-foreground animate-bounce group-hover:text-foreground/70 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Image Editor Modal */}
      <ImageEditor isOpen={showImageEditor} onClose={() => setShowImageEditor(false)} onImageSave={handleImageSave} currentImage={currentLedgeImage} />
      
      {/* Quote Tool Modal */}
      <SurveyQuoteTool pool={null} isOpen={showQuoteTool} onClose={() => setShowQuoteTool(false)} customProduct={{
      name: ledge.name,
      price: ledge.price,
      type: 'Tanning Ledge',
      image: currentLedgeImage
    }} extras={extras} />
    </Card>;
};
export default TanningLedgeProductCard;