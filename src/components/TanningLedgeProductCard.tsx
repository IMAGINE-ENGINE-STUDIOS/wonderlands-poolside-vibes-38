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
import aquamarineFinish from '@/assets/finishes/aquamarine-g3.jpg';
import oceanBlueFinish from '@/assets/finishes/ocean-blue-g3.jpg';
import sapphireBlueFinish from '@/assets/finishes/sapphire-blue-g3.jpg';
import nightSkyFinish from '@/assets/finishes/night-sky-g3.jpg';
import athensPearlFinish from '@/assets/finishes/athens-pearl-white-g3.jpg';
import lagoonBlueFinish from '@/assets/finishes/lagoon-blue-g2.jpg';
import azureBlueFinish from '@/assets/finishes/azure-blue-g2.jpg';
import coastalBronzeFinish from '@/assets/finishes/coastal-bronze-g3.jpg';
import shaleGrayFinish from '@/assets/finishes/shale-gray-g3.jpg';
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
  price: 2300,
  image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png',
  description: 'Compact high-efficiency gas heater'
}, {
  name: 'Pentair UltraTemp 90 Heat Pump',
  price: 5175,
  image: '/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png',
  description: 'Energy-efficient heat pump for tanning ledges'
}];

// Import pool finishes from consolidated products
import { getProductsByCategory } from '@/data/consolidatedProducts';

// Convert pool finishes data to finish options format
const finishOptions = getProductsByCategory('finish').map(finish => ({
  name: finish.name,
  color: '#4169E1',
  image: finish.image,
  price: finish.price / 2,
  // Tanning ledge pricing is half of pool pricing
  collection: finish.collection,
  category: finish.category,
  description: finish.description
}));

// Convert paver data to options format
const paverOptions = [{
  name: 'No Pavers',
  color: '#808080',
  price: 0,
  image: azureBlueFinish,
  description: 'No additional pavers',
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
  return <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-coral/40 overflow-hidden">
      {/* Edge-to-edge Tanning Ledge Image at top */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-coral/10 to-orange/10 cursor-pointer overflow-hidden group/image" onClick={handleImageClick}>
        {currentLedgeImage ? <img src={currentLedgeImage} alt={ledge.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-coral/20 to-orange/20">
            <Sun size={48} className="text-coral/60" />
          </div>}
        
        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(ledge.category)} text-white capitalize font-medium px-3 py-1`}>
            <span className="flex items-center gap-1">
              <Sun size={16} />
              Luxury
            </span>
          </Badge>
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 text-white font-medium">
            Click for Details
          </div>
        </div>
        
        {/* Image Edit Button - Only visible for admins */}
        {isAdmin && isEditable && <Button size="sm" variant="secondary" className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" onClick={e => {
        e.stopPropagation();
        setShowImageEditor(true);
      }}>
            <Edit className="h-3 w-3" />
          </Button>}
      </div>
      
      <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        
        {/* Tanning Ledge Name & Collection */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-coral transition-colors">
            {ledge.name}
          </h3>
          <Badge variant="secondary" className="text-xs font-semibold">
            Premium Tanning Ledge Collection
          </Badge>
        </div>
        
        {/* Rating */}
        
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-coral" />
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            ${calculateTotalPrice().toLocaleString()}
          </span>
          {hasExtras}
        </div>
        
        {/* Basic Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          {ledge.dimensions && <p>Size: {ledge.dimensions}</p>}
          {ledge.depth && <p>Depth: {ledge.depth}</p>}
          {ledge.installationTimeWeeks && <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Installation: {ledge.installationTimeWeeks} weeks</span>
            </div>}
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span className="font-bold text-coral">Warranty: LIFETIME WARRANTY</span>
          </div>
        </div>

        {/* Key Features */}
        {ledge.features && ledge.features.length > 0 && <div className="space-y-2">
            <h4 className="font-semibold text-sm">Features:</h4>
            <ul className="space-y-1">
              {ledge.features.slice(0, 2).map((feature, idx) => <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-coral rounded-full"></div>
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
                  {finishOptions.map(finish => <CarouselItem key={finish.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                      <div className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.finish === finish.name ? 'border-coral bg-coral/10' : 'border-border'}`} onClick={() => setExtras(prev => ({
                  ...prev,
                  finish: finish.name
                }))}>
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                          <img src={finish.image} alt={finish.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{finish.name}</p>
                          {finish.price > 0 && <p className="text-xs text-coral font-semibold text-center mt-1">+${finish.price.toLocaleString()}</p>}
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
              <div className="mb-3">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Paver Surface Area (sq ft)
                </label>
                <Input type="number" placeholder="Enter surface area for pavers" value={paverSurfaceArea} onChange={e => setPaverSurfaceArea(e.target.value)} className="mb-2" />
                {paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea)) && <div className="text-xs text-green-600 font-medium">
                    Calculated Cost: ${(parseFloat(paverSurfaceArea) * 15).toLocaleString()} ({paverSurfaceArea} sq ft × $15/sq ft)
                  </div>}
              </div>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1">
                  {paverOptions.map(paver => <CarouselItem key={paver.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                      <div className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.paverOption === paver.name ? 'border-coral bg-coral/10' : 'border-border'}`} onClick={() => setExtras(prev => ({
                  ...prev,
                  paverOption: paver.name
                }))}>
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                          <img src={paver.image} alt={paver.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{paver.name}</p>
                          {paver.price > 0 && <p className="text-xs text-coral font-semibold text-center mt-1">+${paver.price.toLocaleString()}</p>}
                        </div>
                      </div>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>

            {/* Add-ons */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Additional Features</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox checked={extras.heater} onCheckedChange={() => toggleExtra('heater')} className="data-[state=checked]:bg-coral data-[state=checked]:border-coral" />
                  <div className="flex items-center space-x-1">
                    <Thermometer size={16} className="text-coral" />
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
                }))} className={`p-2 text-xs rounded-md border transition-all flex items-center gap-2 ${extras.heaterModel === heater.name ? 'border-coral bg-coral/10 text-coral' : 'border-border hover:border-coral/50'}`}>
                          <img src={heater.image} alt={heater.name} className="w-8 h-8 rounded object-cover" />
                          <div className="flex-1 text-left">
                            <div>{heater.name}</div>
                            <div className="text-xs text-muted-foreground">${heater.price.toLocaleString()}</div>
                            {heater.description && <div className="text-xs text-muted-foreground">{heater.description}</div>}
                          </div>
                        </button>)}
                    </div>
                  </div>}
                
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <label className="flex items-center space-x-2 cursor-pointer flex-1">
                    <Checkbox checked={extras.jets} onCheckedChange={() => toggleExtra('jets')} />
                    <div className="flex items-center space-x-1">
                      <Zap size={16} className="text-orange" />
                      <span className="text-sm">Jets (+${(getExtraPrice('jets') * extras.jetQuantity).toLocaleString()})</span>
                    </div>
                  </label>
                  {extras.jets && <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setExtras(prev => ({
                  ...prev,
                  jetQuantity: Math.max(1, prev.jetQuantity - 1)
                }))} className="h-8 w-8 p-0">
                        -
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{extras.jetQuantity}</span>
                      <Button variant="outline" size="sm" onClick={() => setExtras(prev => ({
                  ...prev,
                  jetQuantity: prev.jetQuantity + 1
                }))} className="h-8 w-8 p-0">
                        +
                      </Button>
                    </div>}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
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
                  image: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png'
                });
              }

              // Add paver surface area cost
              if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
                extrasBreakdown.push({
                  name: `${extras.paverOption} (${paverSurfaceArea} sq ft)`,
                  price: parseFloat(paverSurfaceArea) * 15,
                  image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png'
                });
              }
              const extrasTotal = extrasBreakdown.reduce((sum, item) => sum + item.price, 0);
              onRequestQuote(ledge, {
                ...extras,
                extrasBreakdown,
                extrasTotal
              });
            }} variant="outline" className="flex-1" size="sm">Instant Quote</Button>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddToCart} variant="outline" size="sm" className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                </Button>
                <StripeCheckoutButton productId={`tanning_ledge_${ledge.name.replace(/\s+/g, '_')}`} productName={ledge.name} price={calculateTotalPrice()} variant="gradient" className="flex-1 hover:scale-105 transition-all duration-300" size="sm" showFinancingOptions={false} />
              </div>
            </div>
            
            {/* Final Price Display */}
            <div className="mt-4 p-3 bg-gradient-to-r from-coral/10 to-orange/10 rounded-lg border border-coral/30">
              <div className="text-center">
                <h5 className="text-sm font-medium text-muted-foreground">Total Configuration Price</h5>
                <div className="text-2xl font-bold text-foreground">${calculateTotalPrice().toLocaleString()}</div>
              </div>
            </div>

            {/* Bottom Dashboard - Integrated Financing */}
            <div className="mt-4 p-4 bg-gradient-to-r from-orange/5 to-coral/5 rounded-lg border border-orange/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-sm text-foreground">Finance This Purchase</h5>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center p-2 bg-white/50 rounded">
                      <div className="font-semibold">2 Years</div>
                      <div className="text-coral">${(calculateTotalPrice() / 24).toLocaleString()}/mo</div>
                    </div>
                    <div className="text-center p-2 bg-white/50 rounded">
                      <div className="font-semibold">4 Years</div>
                      <div className="text-coral">${(calculateTotalPrice() / 48).toLocaleString()}/mo</div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full" size="sm" onClick={() => {
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
        
        {/* Default Action Buttons */}
        {!showDetails && <div className="space-y-2">
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
              image: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png'
            });
          }

          // Add paver surface area cost
          if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
            extrasBreakdown.push({
              name: `${extras.paverOption} (${paverSurfaceArea} sq ft)`,
              price: parseFloat(paverSurfaceArea) * 15,
              image: '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png'
            });
          }
          const extrasTotal = extrasBreakdown.reduce((sum, item) => sum + item.price, 0);
          onRequestQuote(ledge, {
            ...extras,
            extrasBreakdown,
            extrasTotal
          });
        }} variant="outline" className="w-full" size="sm">
              Instant Quote
            </Button>
            <Button onClick={handleImageClick} variant="gradient" className="w-full hover:scale-105 transition-all duration-300" size="sm">Customize Tanning Ledge</Button>
            
          </div>}
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