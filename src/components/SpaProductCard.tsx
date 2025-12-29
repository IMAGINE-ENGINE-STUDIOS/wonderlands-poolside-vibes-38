import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Waves, DollarSign, Thermometer, Shield, Zap, Droplets, Star, Clock, Award, Cpu, Edit, ShoppingCart, Sun, FileText } from "lucide-react";
import StripeCheckoutButton from "./StripeCheckoutButton";
import ImageEditor from "./ImageEditor";
import { useShoppingCart } from "./ShoppingCartProvider";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ProductImageModal } from "./ProductImageModal";
import { tanningLedges } from "@/data/poolData";
import { paverTypes, copingTypes } from "@/data/paverData";
import aquamarineFinish from '@/assets/finishes/aquamarine-g3.jpg';
import oceanBlueFinish from '@/assets/finishes/ocean-blue-g3.jpg';
import sapphireBlueFinish from '@/assets/finishes/sapphire-blue-g3.jpg';
import nightSkyFinish from '@/assets/finishes/night-sky-g3.jpg';
import athensPearlFinish from '@/assets/finishes/athens-pearl-white-g3.jpg';
import lagoonBlueFinish from '@/assets/finishes/lagoon-blue-g2.jpg';
import azureBlueFinish from '@/assets/finishes/azure-blue-g2.jpg';
import coastalBronzeFinish from '@/assets/finishes/coastal-bronze-g3.jpg';
import shaleGrayFinish from '@/assets/finishes/shale-gray-g3.jpg';
import concreteDeckTexture from "@/assets/textures/concrete-deck.avif";
import screenEnclosureDeluxe from "@/assets/screen-enclosure-deluxe.jpeg";
import screenEnclosurePremium from "@/assets/screen-enclosure-premium.jpeg";
interface Pool {
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  galaPoints?: number;
  galaCategory?: string;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
  heater?: boolean;
  saltSystem?: boolean;
  carbonFiber?: boolean;
  finishes?: string[];
  liners?: string[];
  covers?: string[];
  spilloverFeature?: boolean;
}
interface SpaProductCardProps {
  spa: Pool;
  onViewDetails: (spa: Pool) => void;
  onRequestQuote: (spa: Pool, extras?: PoolExtras) => void;
  isAdmin?: boolean;
}
interface PoolExtras {
  liner: boolean;
  heater: boolean;
  cover: boolean;
  jets: boolean;
  jetQuantity: number;
  finish: string;
  linerOption: string;
  coverOption: string;
  tiles: boolean;
  tileOption: string;
  spa: boolean;
  spaModel: string;
  tanningLedge: boolean;
  tanningLedgeModel: string;
  heaterModel: string;
  paverOption: string;
  copingPaverOption: string;
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
      return 'bg-gradient-to-r from-primary to-teal';
  }
};
const getExtraPrice = (extra: string) => {
  switch (extra) {
    case 'liner':
      return 0;
    // Base cost covered by liner option price
    case 'heater':
      return 5000;
    // Pool Heater is exactly $5,000
    case 'cover':
      return 3200;
    case 'jets':
      return 1800;
    case 'tiles':
      return 0;
    // Base cost covered by tile option price
    default:
      return 0;
  }
};

// Import pool finishes from consolidated products
import { getProductsByCategory } from '@/data/consolidatedProducts';

// Convert pool finishes data to finish options format
const finishOptions = getProductsByCategory('finish').map(finish => ({
  name: finish.name,
  color: '#4169E1',
  // fallback color
  image: finish.image,
  price: finish.price,
  collection: finish.collection,
  category: finish.category,
  description: finish.description
}));

// Import pool liners from PoolCatalog
import { poolLiners, poolTiles } from '@/data/poolData';

// Pool heater options for spas (spa-specific pricing)
const spaHeaters = [{
  name: 'Spa Heat Pump - Compact',
  price: 3500,
  image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png",
  description: 'Compact heat pump designed for spas'
}, {
  name: 'Spa Heat Pump - Premium',
  price: 4500,
  image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png",
  description: 'Premium spa heat pump with digital controls'
}, {
  name: 'Spa Gas Heater',
  price: 2800,
  image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png",
  description: 'Efficient gas heater for quick spa heating'
}, {
  name: 'Solar Spa Heater',
  price: 2200,
  image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png",
  description: 'Eco-friendly solar heating for spas'
}];

// Convert pool liners to liner options format
const linerOptions = [{
  name: 'Standard Blue',
  color: '#4169E1',
  price: 0,
  image: azureBlueFinish,
  type: 'Standard',
  description: undefined
}, ...poolLiners.map(liner => ({
  name: liner.name,
  color: '#4169E1',
  // fallback color
  price: liner.price / 2,
  // Spa pricing is half of pool pricing
  image: liner.image,
  type: liner.type,
  description: liner.description
}))];

// Convert pool tiles to tile options format (spa pricing)
const tileOptions = [{
  name: 'Standard Waterline',
  color: '#4682B4',
  price: 0,
  image: azureBlueFinish,
  description: undefined
}, ...poolTiles.map(tile => ({
  name: tile.name,
  color: '#4682B4',
  // fallback color
  price: tile.price / 2,
  // Spa pricing is half of pool pricing
  image: tile.image,
  description: tile.description
}))];

// Convert paver data to options format with exact same pavers from PaversSection
const paverOptions = [{
  name: 'Concrete Deck',
  color: '#808080',
  price: 0,
  pricePerSqFt: 20,
  image: concreteDeckTexture,
  description: 'Standard concrete deck',
  collection: 'none'
}, ...paverTypes.map(paver => ({
  name: paver.name,
  color: '#D3D3D3',
  price: 0,
  pricePerSqFt: paver.basePrice,
  image: paver.image || azureBlueFinish,
  description: paver.description,
  collection: paver.id.includes('appian') ? 'appian' : paver.id.includes('catalina') ? 'catalina' : paver.id.includes('priceline') ? 'priceline' : 'standard'
}))];
const SpaProductCard = ({
  spa,
  onViewDetails,
  onRequestQuote,
  isAdmin = false
}: SpaProductCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showQuoteTool, setShowQuoteTool] = useState(false);
  const [currentPoolImage, setCurrentPoolImage] = useState(spa.image);
  const [isEditable, setIsEditable] = useState(isAdmin);
  const [extras, setExtras] = useState<PoolExtras>({
    liner: false,
    heater: false,
    cover: false,
    jets: false,
    jetQuantity: 0,
    finish: '',
    linerOption: '',
    coverOption: '',
    tiles: false,
    tileOption: '',
    spa: false,
    spaModel: '',
    tanningLedge: false,
    tanningLedgeModel: '',
    heaterModel: '',
    paverOption: '',
    copingPaverOption: ''
  });
  const [paverSurfaceArea, setPaverSurfaceArea] = useState('');
  const {
    addToCart
  } = useShoppingCart();

  // Image popup state
  const [imagePopup, setImagePopup] = useState<{
    isOpen: boolean;
    imageSrc: string;
    name: string;
    price?: number;
    description?: string;
  }>({
    isOpen: false,
    imageSrc: "",
    name: "",
    price: undefined,
    description: undefined
  });
  const handleImageClick = () => {
    setShowDetails(!showDetails);
  };
  const toggleExtra = (extra: string) => {
    setExtras(prev => {
      // Handle tile/liner mutual exclusivity
      if (extra === 'tiles' && !prev.tiles) {
        // Selecting tiles, disable liner and expand details
        setShowDetails(true);
        return {
          ...prev,
          tiles: true,
          liner: false
        };
      } else if (extra === 'liner' && !prev.liner) {
        // Selecting liner, disable tiles and expand details
        setShowDetails(true);
        return {
          ...prev,
          liner: true,
          tiles: false
        };
      } else if (extra === 'tiles') {
        // Deselecting tiles
        return {
          ...prev,
          tiles: !prev.tiles
        };
      } else if (extra === 'liner') {
        // Deselecting liner
        return {
          ...prev,
          liner: !prev.liner
        };
      } else if (extra === 'heater') {
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
    let total = spa.price;

    // Add finish price if selected and has additional cost
    const selectedFinish = finishOptions.find(finish => finish.name === extras.finish);
    if (selectedFinish && typeof selectedFinish.price === 'number' && selectedFinish.price > 0) {
      total += selectedFinish.price;
    }

    // Add heater price if selected (dynamic price based on model)
    if (extras.heater) {
      const selectedHeater = spaHeaters.find(heater => heater.name === extras.heaterModel);
      if (selectedHeater) total += selectedHeater.price;
    }
    if (extras.jets) total += getExtraPrice('jets') * extras.jetQuantity;

    // Add option prices (liner OR tile, never both)
    const linerOption = linerOptions.find(option => option.name === extras.linerOption);
    if (linerOption && extras.liner) total += linerOption.price;
    const tileOption = tileOptions.find(option => option.name === extras.tileOption);
    if (tileOption && extras.tiles) total += tileOption.price;

    // Add calculated paver surface area cost using selected paver's basePrice
    if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
      const selectedPaver = paverOptions.find(p => p.name === extras.paverOption);
      const pricePerSqFt = selectedPaver?.pricePerSqFt || 20;
      total += parseFloat(paverSurfaceArea) * pricePerSqFt;
    }
    return total;
  };
  const hasExtras = Object.values(extras).some(value => value);
  const handleImageSave = (imageBlob: Blob) => {
    // Convert blob to data URL for display
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentPoolImage(reader.result as string);
    };
    reader.readAsDataURL(imageBlob);
  };
  const handleAddToCart = () => {
    const cartExtras = [];
    if (extras.heater) {
      const selectedHeater = spaHeaters.find(heater => heater.name === extras.heaterModel);
      if (selectedHeater) {
        cartExtras.push({
          name: `${selectedHeater.name}`,
          price: selectedHeater.price
        });
      }
    }
    if (extras.jets) cartExtras.push({
      name: `Spa Jets (${extras.jetQuantity})`,
      price: getExtraPrice('jets') * extras.jetQuantity
    });
    const linerOption = linerOptions.find(option => option.name === extras.linerOption);
    if (linerOption && extras.liner) {
      cartExtras.push({
        name: `${linerOption.name} Liner`,
        price: linerOption.price
      });
    }
    const tileOption = tileOptions.find(option => option.name === extras.tileOption);
    if (tileOption && extras.tiles) {
      cartExtras.push({
        name: tileOption.name,
        price: tileOption.price
      });
    }

    // Add paver surface area cost
    if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
      cartExtras.push({
        name: `${extras.paverOption} (${paverSurfaceArea} sq ft)`,
        price: parseFloat(paverSurfaceArea) * 20
      });
    }
    addToCart({
      id: `spa_${spa.model.replace(/\s+/g, '_')}_${Date.now()}`,
      name: `${spa.model} Spa`,
      price: spa.price,
      category: spa.category,
      image: currentPoolImage,
      extras: cartExtras
    });
  };
  return <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Edge-to-edge Spa Image at top */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image" onClick={handleImageClick}>
        {currentPoolImage ? <img src={currentPoolImage} alt={spa.model} className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-teal/20">
            <Waves size={48} className="text-primary/60" />
          </div>}
        
        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(spa.category)} text-white capitalize font-medium px-3 py-1`}>
            <span className="flex items-center gap-1">
              <Waves size={16} />
              {spa.category}
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
        
        {/* Spa Name & Collection */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {spa.model}
          </h3>
          {spa.galaCategory}
        </div>
        
        {/* Rating */}
        
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
            ${calculateTotalPrice().toLocaleString()}
          </span>
          {hasExtras}
        </div>
        
        {/* Basic Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          {spa.dimensions && <p>Size: {spa.dimensions}</p>}
          {spa.depth && <p>Depth: {spa.depth}</p>}
          {spa.installationTimeWeeks && <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Installation: {spa.installationTimeWeeks} weeks</span>
            </div>}
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span className="font-bold text-primary">Warranty: LIFETIME WARRANTY</span>
          </div>
        </div>

        {/* Key Features */}
        {spa.features && spa.features.length > 0 && <div className="space-y-2">
            <h4 className="font-semibold text-sm">Features:</h4>
            <ul className="space-y-1">
              {spa.features.slice(0, 2).map((feature, idx) => <li key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span className="text-xs">{feature}</span>
                </li>)}
            </ul>
          </div>}
        
        {/* Feature Checkboxes */}
        
        
        {/* Expanded Details */}
        {showDetails && <div className="space-y-4 animate-fade-in-up">
            <Separator />
            
            {/* Finishes */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Droplets size={16} />
                Spa Finishes
              </h4>
              <Carousel className="w-full" opts={{
            align: "start",
            loop: false,
            duration: 25
          }}>
                <CarouselContent className="-ml-1">
                  {finishOptions.map((finish, idx) => <CarouselItem key={`spa-${finish.name}-${idx}`} className="pl-1 basis-1/2">
                      <div className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.finish === finish.name ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => setExtras(prev => ({
                  ...prev,
                  finish: finish.name
                }))}>
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden hover:ring-2 hover:ring-primary transition-all" onClick={e => {
                    e.stopPropagation();
                    setImagePopup({
                      isOpen: true,
                      imageSrc: finish.image,
                      name: finish.name,
                      price: finish.price,
                      description: finish.description
                    });
                  }}>
                          <img src={finish.image} alt={finish.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <p className="text-xs font-medium text-center">{finish.name}</p>
                        <div className="mt-1 space-y-0.5">
                          {finish.collection && <p className="text-[10px] text-primary text-center font-semibold">{finish.collection}</p>}
                          {typeof finish.price === 'number' && <p className="text-[10px] text-foreground font-semibold text-center">+${finish.price.toLocaleString()}</p>}
                        </div>
                      </div>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious className="left-0 animate-pulse" />
                <CarouselNext className="right-0 animate-pulse" />
              </Carousel>
            </div>

            {/* Tiles */}
            {extras.tiles && <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Spa Tiles</h4>
                <Carousel className="w-full" opts={{
            align: "start",
            loop: false,
            duration: 25
          }}>
                  <CarouselContent className="-ml-1">
                    {tileOptions.map(tile => <CarouselItem key={tile.name} className="pl-1 basis-1/2">
                        <div className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.tileOption === tile.name ? 'border-teal bg-teal/10' : 'border-border'}`} onClick={() => setExtras(prev => ({
                  ...prev,
                  tileOption: tile.name
                }))}>
                          <div className="w-full h-12 rounded-md mb-2 overflow-hidden hover:ring-2 hover:ring-primary transition-all" onClick={e => {
                    e.stopPropagation();
                    if (tile.image) {
                      setImagePopup({
                        isOpen: true,
                        imageSrc: tile.image,
                        name: tile.name,
                        price: tile.price,
                        description: tile.description
                      });
                    }
                  }}>
                            {tile.image ? <img src={tile.image} alt={tile.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-teal/20 to-primary/20 flex items-center justify-center">
                                <div className="w-3 h-3 bg-teal rounded-full"></div>
                              </div>}
                          </div>
                          <p className="text-xs font-medium text-center">{tile.name}</p>
                          {tile.price > 0 && <p className="text-xs text-teal font-semibold text-center">+${tile.price.toLocaleString()}</p>}
                        </div>
                      </CarouselItem>)}
                  </CarouselContent>
                <CarouselPrevious className="left-0 animate-pulse" />
                <CarouselNext className="right-0 animate-pulse" />
                </Carousel>
              </div>}

            {/* Liners */}
            {extras.liner && <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Spa Liners</h4>
                <Carousel className="w-full" opts={{
            align: "start",
            loop: false,
            duration: 25
          }}>
                  <CarouselContent className="-ml-1">
                    {linerOptions.map(liner => <CarouselItem key={liner.name} className="pl-1 basis-1/2">
                        <div className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.linerOption === liner.name ? 'border-secondary bg-secondary/10' : 'border-border'}`} onClick={() => setExtras(prev => ({
                  ...prev,
                  linerOption: liner.name
                }))}>
                          <div className="w-full h-12 rounded-md mb-2 overflow-hidden hover:ring-2 hover:ring-primary transition-all" onClick={e => {
                    e.stopPropagation();
                    if (liner.image) {
                      setImagePopup({
                        isOpen: true,
                        imageSrc: liner.image,
                        name: liner.name,
                        price: liner.price,
                        description: liner.description
                      });
                    }
                  }}>
                            {liner.image ? <img src={liner.image} alt={liner.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                              </div>}
                          </div>
                          <p className="text-xs font-medium text-center">{liner.name}</p>
                          {liner.price > 0 && <p className="text-xs text-secondary font-semibold text-center">+${liner.price.toLocaleString()}</p>}
                        </div>
                      </CarouselItem>)}
                  </CarouselContent>
                <CarouselPrevious className="left-0 animate-pulse" />
                <CarouselNext className="right-0 animate-pulse" />
                </Carousel>
              </div>}

            {/* Spa Heaters */}
            {extras.heater && <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Thermometer size={16} />
                  Spa Heaters
                </h4>
                <Carousel className="w-full" opts={{
            align: "start",
            loop: false,
            duration: 25
          }}>
                  <CarouselContent className="-ml-1">
                    {spaHeaters.map(heater => <CarouselItem key={heater.name} className="pl-1 basis-1/2">
                        <div className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.heaterModel === heater.name ? 'border-teal bg-teal/10' : 'border-border'}`} onClick={() => setExtras(prev => ({
                  ...prev,
                  heaterModel: heater.name
                }))}>
                          <div className="w-full h-12 rounded-md mb-2 overflow-hidden hover:ring-2 hover:ring-primary transition-all" onClick={e => {
                    e.stopPropagation();
                    setImagePopup({
                      isOpen: true,
                      imageSrc: heater.image,
                      name: heater.name,
                      price: heater.price,
                      description: heater.description
                    });
                  }}>
                            <img src={heater.image} alt={heater.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs font-medium text-center">{heater.name}</p>
                          <p className="text-xs text-teal font-semibold text-center">+${heater.price.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground text-center mt-1">{heater.description}</p>
                        </div>
                      </CarouselItem>)}
                  </CarouselContent>
                <CarouselPrevious className="left-0 animate-pulse" />
                <CarouselNext className="right-0 animate-pulse" />
                </Carousel>
              </div>}

            {/* Pavers Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Deck Pavers</h4>
              <Carousel className="w-full" opts={{
            align: "start",
            loop: false,
            duration: 25
          }}>
                <CarouselContent className="-ml-1">
                  {paverOptions.map(paver => <CarouselItem key={paver.name} className="pl-1 basis-1/2">
                      <div className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.paverOption === paver.name ? 'border-secondary bg-secondary/10' : 'border-border'}`} onClick={() => setExtras(prev => ({
                  ...prev,
                  paverOption: paver.name
                }))}>
                        <div className="w-full h-12 rounded-md mb-2 overflow-hidden hover:ring-2 hover:ring-primary transition-all" onClick={e => {
                    e.stopPropagation();
                    setImagePopup({
                      isOpen: true,
                      imageSrc: paver.image,
                      name: paver.name,
                      price: paver.price,
                      description: paver.description
                    });
                  }}>
                          <img src={paver.image} alt={paver.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-medium text-center">{paver.name}</p>
                        {paver.collection !== 'none' && <p className="text-[10px] text-secondary font-semibold text-center capitalize">{paver.collection}</p>}
                        <p className="text-[10px] text-muted-foreground text-center mt-1">$20/sq ft</p>
                      </div>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious className="left-0 animate-pulse" />
                <CarouselNext className="right-0 animate-pulse" />
              </Carousel>
              <div className="mt-3">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Paver Surface Area (sq ft)
                </label>
                <Input type="number" placeholder="Enter surface area for pavers" value={paverSurfaceArea} onChange={e => setPaverSurfaceArea(e.target.value)} className="mb-2" />
                {paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea)) && <div className="text-xs text-green-600 font-medium">
                    Calculated Cost: ${(parseFloat(paverSurfaceArea) * 20).toLocaleString()} ({paverSurfaceArea} sq ft × $20/sq ft)
                  </div>}
              </div>
            </div>

            {/* Jets Quantity */}
            {extras.jets && <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Zap size={16} />
                  Spa Jets Quantity
                </h4>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setExtras(prev => ({
              ...prev,
              jetQuantity: Math.max(1, prev.jetQuantity - 1)
            }))}>
                    -
                  </Button>
                  <span className="font-semibold">{extras.jetQuantity}</span>
                  <Button size="sm" variant="outline" onClick={() => setExtras(prev => ({
              ...prev,
              jetQuantity: prev.jetQuantity + 1
            }))}>
                    +
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    +${(getExtraPrice('jets') * extras.jetQuantity).toLocaleString()}
                  </span>
                </div>
              </div>}
          </div>}
        
        {/* Finish Carousel - Always Visible when collapsed */}
        {!showDetails && <div className="space-y-3">
            <div className="space-y-2" onMouseEnter={() => setShowDetails(true)} onTouchStart={() => setShowDetails(true)}>
              <h4 className="font-semibold text-foreground text-sm">Spa Finishes</h4>
              <Carousel className="w-full" opts={{
            align: "start",
            loop: false,
            duration: 25
          }}>
                <CarouselContent className="-ml-1">
                  {finishOptions.slice(0, 6).map((finish, idx) => <CarouselItem key={`spa-preview-${finish.name}-${idx}`} className="pl-1 basis-1/2">
                      <div className={`p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.finish === finish.name ? "border-primary bg-primary/10" : "border-border"}`} onClick={() => {
                  setExtras(prev => ({
                    ...prev,
                    finish: finish.name
                  }));
                  setShowDetails(true);
                }}>
                        <div className="w-full h-12 rounded-md mb-1 overflow-hidden flex-shrink-0">
                          <img src={finish.image} alt={finish.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <p className="text-[10px] font-medium text-center line-clamp-1">{finish.name}</p>
                      </div>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious className="left-0 h-6 w-6" />
                <CarouselNext className="right-0 h-6 w-6" />
              </Carousel>
            </div>
            
            {/* Expand Arrow */}
            <div className="flex flex-col items-center cursor-pointer py-2 hover:bg-muted/50 rounded-lg transition-all group" onClick={() => setShowDetails(true)} onMouseEnter={() => setShowDetails(true)}>
              <span className="text-xs text-muted-foreground mb-1">View all options</span>
              <svg className="w-5 h-5 text-primary animate-bounce group-hover:text-primary/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>}
        
        {/* Action Buttons - Only when expanded */}
        {showDetails && <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            
            <Button variant="outline" size="sm" onClick={() => {
            // Create detailed extras breakdown for quote tool
            const extrasBreakdown = [] as Array<{
              name: string;
              price: number;
              image?: string;
            }>;

            // Add finish if it has an additional cost
            const selectedFinish = finishOptions.find(finish => finish.name === extras.finish);
            if (selectedFinish && typeof selectedFinish.price === 'number' && selectedFinish.price > 0) {
              extrasBreakdown.push({
                name: `${selectedFinish.name} Finish`,
                price: selectedFinish.price,
                image: selectedFinish.image
              });
            }

            // Add heater if selected
            if (extras.heater) {
              const selectedHeater = spaHeaters.find(heater => heater.name === extras.heaterModel);
              if (selectedHeater) {
                extrasBreakdown.push({
                  name: selectedHeater.name,
                  price: selectedHeater.price
                });
              }
            }

            // Add jets if selected
            if (extras.jets) {
              extrasBreakdown.push({
                name: `Spa Jets (${extras.jetQuantity})`,
                price: getExtraPrice('jets') * extras.jetQuantity
              });
            }

            // Add tiles if selected
            const tileOption = tileOptions.find(option => option.name === extras.tileOption);
            if (tileOption && extras.tiles) {
              extrasBreakdown.push({
                name: tileOption.name,
                price: tileOption.price
              });
            }

            // Add liner if selected (mutually exclusive with tiles)
            const linerOption = linerOptions.find(option => option.name === extras.linerOption);
            if (linerOption && extras.liner) {
              extrasBreakdown.push({
                name: `${linerOption.name} Liner`,
                price: linerOption.price
              });
            }

            // Add paver surface area cost
            if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
              extrasBreakdown.push({
                name: `${extras.paverOption} (${paverSurfaceArea} sq ft)`,
                price: parseFloat(paverSurfaceArea) * 15
              });
            }
            const extrasTotal = extrasBreakdown.reduce((sum, item) => sum + item.price, 0);
            onRequestQuote(spa, {
              ...extras,
              extrasBreakdown,
              extrasTotal
            });
          }} className="flex-1 instant-quote-btn transition-all duration-300 text-xs">Instant Quote</Button>
          
          <Button onClick={handleAddToCart} variant="outline" size="icon" className="w-10 h-10">
            <ShoppingCart className="h-4 w-4" />
          </Button>
          </div>
          
          <StripeCheckoutButton productId={`spa_${spa.model.replace(/\s+/g, '_')}`} productName={`${spa.model} Spa`} price={calculateTotalPrice()} size="sm" className="w-full text-xs" />
          
          
        </div>}
      </CardContent>
      
      {/* Image Editor Modal */}
      {showImageEditor && <ImageEditor isOpen={showImageEditor} onClose={() => setShowImageEditor(false)} onImageSave={handleImageSave} currentImage={currentPoolImage} />}
      
      {/* Quote Tool Modal */}
      <SurveyQuoteTool pool={spa} isOpen={showQuoteTool} onClose={() => setShowQuoteTool(false)} extras={extras} />
      
      {/* Product Image Popup Modal */}
      <ProductImageModal isOpen={imagePopup.isOpen} onClose={() => setImagePopup({
      ...imagePopup,
      isOpen: false
    })} imageSrc={imagePopup.imageSrc} productName={imagePopup.name} productPrice={imagePopup.price} productDescription={imagePopup.description} />
    </Card>;
};
export default SpaProductCard;