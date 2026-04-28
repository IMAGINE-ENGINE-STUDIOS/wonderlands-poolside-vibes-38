import * as React from "react";
const { useState, useEffect } = React;
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Waves,
  DollarSign,
  Thermometer,
  Shield,
  Zap,
  Droplets,
  Star,
  Clock,
  Award,
  Cpu,
  Edit,
  ShoppingCart,
  Sun,
  FileText,
  Sprout,
} from "lucide-react";
import StripeCheckoutButton from "./StripeCheckoutButton";
import ImageEditor from "./ImageEditor";
import { OptimizedImage } from "./OptimizedImage";
import { useShoppingCart } from "./ShoppingCartProvider";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProductImageModal } from "./ProductImageModal";
import ExclusiveSaunaOffer from "./ExclusiveSaunaOffer";
import { spas } from "./PoolCatalog";
import { gilmerSpas } from "@/data/gilmerSpas";
import { gilmerPools } from "@/data/gilmerPools";
import { tanningLedges } from "@/data/poolData";
import { paverTypes, copingTypes } from "@/data/paverData";
import { getPaverPricePerSqFt, calculatePaverCost, formatPaverCostDisplay, SCREEN_ENCLOSURE_PRICING } from "@/utils/paverPricing";
import { useProjectType } from "@/contexts/ProjectTypeContext";
import { supabase } from "@/integrations/supabase/client";
import aquamarineFinish from "@/assets/finishes/aquamarine-g3.jpg";
import oceanBlueFinish from "@/assets/finishes/ocean-blue-g3.jpg";
import sapphireBlueFinish from "@/assets/finishes/sapphire-blue-g3.jpg";
import nightSkyFinish from "@/assets/finishes/night-sky-g3.jpg";
import athensPearlFinish from "@/assets/finishes/athens-pearl-white-g3.jpg";
import lagoonBlueFinish from "@/assets/finishes/lagoon-blue-g2.jpg";
import azureBlueFinish from "@/assets/finishes/azure-blue-g2.jpg";
import coastalBronzeFinish from "@/assets/finishes/coastal-bronze-g3.jpg";
import shaleGrayFinish from "@/assets/finishes/shale-gray-g3.jpg";
import noCoverBlack from "@/assets/no-cover-black.png";
import screenEnclosureDeluxe from "@/assets/screen-enclosure-deluxe.jpeg";
import screenEnclosurePremium from "@/assets/screen-enclosure-premium.jpeg";
import concreteDeckTexture from "@/assets/textures/concrete-deck.avif";
import FinancingOptions from "./FinancingOptions";
import sunsetGroveImage from "@/assets/sunset-grove-kit-pool.jpg";
import maldivesImage from "@/assets/maldiveskit-castlerock.jpg";
import serenityImage from "@/assets/serenitykit.jpg";
import grassLightGreenImage from "@/assets/grass-light-green.avif";
import grassDarkGreenImage from "@/assets/grass-dark-green.avif";
import grassNaturalGreenImage from "@/assets/grass-natural-green.avif";
import grassEmeraldImage from "@/assets/grass-emerald.avif";
import grassOliveImage from "@/assets/grass-olive.avif";

// Helper function to get pool price (no discount applied)
const getPoolPrice = (pool: Pool) => {
  return pool.price;
};
interface Pool {
  model: string;
  price: number;
  category: "premium" | "deluxe" | "standard" | "compact";
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
}
interface PoolProductCardProps {
  pool: Pool;
  onViewDetails: (pool: Pool) => void;
  onRequestQuote: (pool: Pool, extras?: PoolExtras) => void;
  isAdmin?: boolean;
  priority?: boolean; // For above-the-fold images
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
  spaFinish?: string;
  spaFinishPrice?: number;
  tanningLedge: boolean;
  tanningLedgeModel: string;
  heaterModel: string;
  paverOption: string;
  copingPaverOption: string;
  screenEnclosure: boolean;
  screenEnclosureArea: number;
  screenEnclosureQuality: "standard" | "deluxe" | "premium";
  concreteConstruction: boolean;
  rockyWaterfalls: boolean;
  rockyWaterfallsType: string;
  rockyWaterfallsColor: string;
  artificialGrass: boolean;
  artificialGrassColor: string;
  artificialGrassArea: string;
  deliveryTime?: string;
  extrasBreakdown?: Array<{
    name: string;
    price: number;
  }>;
  extrasTotal?: number;
  concretePoolDescription?: string;
}
const getCategoryColor = (category: string) => {
  switch (category) {
    case "premium":
      return "bg-gradient-to-r from-coral to-orange";
    case "deluxe":
      return "bg-gradient-to-r from-primary to-teal";
    case "standard":
      return "bg-gradient-to-r from-[hsl(var(--golden))] to-[hsl(var(--golden-light))]";
    case "compact":
      return "bg-gradient-to-r from-teal to-primary";
    default:
      return "bg-gradient-to-r from-primary to-teal";
  }
};
const getExtraPrice = (extra: string) => {
  switch (extra) {
    case "liner":
      return 0;
    // Base cost covered by liner option price
    case "heater":
      return 5000;
    // Pool Heater is exactly $5,000
    case "cover":
      return 22000;
    case "jets":
      return 1800;
    case "tiles":
      return 0;
    // Base cost covered by tile option price
    default:
      return 0;
  }
};

// Import pool finishes and liners from consolidated products
import { getProductsByCompatiblePool } from "@/data/consolidatedProducts";
import { poolLiners, poolTiles } from "@/data/poolData";

const PoolProductCard = ({ pool, onViewDetails, onRequestQuote, isAdmin = false, priority = false }: PoolProductCardProps) => {
  const { priceMultiplier, projectType } = useProjectType();
  
  // Filter finishes based on pool model compatibility
  const compatibleFinishes = getProductsByCompatiblePool("finish", pool.model);
  
  // Convert pool finishes data to finish options format
  const finishOptions = compatibleFinishes.map((finish) => ({
    name: finish.name,
    color: "#4169E1",
    image: finish.image,
    price: finish.price,
    collection: finish.collection,
    category: finish.category,
    description: finish.description,
  }));

  // Pool heater options - prices +20% to match WonderlandsStudio
  const poolHeaters = [
    {
      name: "Pentair MasterTemp 125 (125K BTU)",
      price: 2760, // was 2300, +20%
      image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png",
      description: "Compact high-efficiency gas heater for pools up to 15,000 gallons",
    },
    {
      name: "Pentair MasterTemp 250 (250K BTU)",
      price: 4416, // was 3680, +20%
      image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png",
      description: "Mid-size high-performance gas heater for medium pools",
    },
    {
      name: "Pentair MasterTemp 400 (400K BTU)",
      price: 5796, // was 4830, +20%
      image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png",
      description: "High-capacity gas heater for large pools and quick heating",
    },
    {
      name: "Pentair UltraTemp 90 Heat Pump",
      price: 6210, // was 5175, +20%
      image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png",
      description: "Energy-efficient heat pump for pools up to 20,000 gallons",
    },
    {
      name: "Pentair UltraTemp 110 Heat Pump",
      price: 7590, // was 6325, +20%
      image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png",
      description: "High-efficiency heat pump for medium to large pools",
    },
    {
      name: "Pentair UltraTemp 140 Heat Pump",
      price: 8970, // was 7475, +20%
      image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png",
      description: "Premium heat pump for large pools with maximum efficiency",
    },
  ];

  // Convert pool liners to liner options format
  const linerOptions = [
    {
      name: "Standard Blue",
      color: "#4169E1",
      price: 0,
      image: azureBlueFinish,
      type: "Standard",
      description: undefined,
    },
    ...poolLiners.map((liner) => ({
      name: liner.name,
      color: "#4169E1",
      price: liner.price,
      image: liner.image,
      type: liner.type,
      description: liner.description,
    })),
  ];

  // Cover options - using real automatic covers
  const coverOptions = [
    { name: "NO COVER", surname: "None", color: "#808080", price: 0, image: noCoverBlack, category: "cover", description: "No pool cover needed", colors: [] },
    { 
      name: "Eclipse Automatic Cover", 
      surname: "Eclipse", 
      color: "#2F4F4F", 
      price: 27000, 
      image: "/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png", 
      category: "cover", 
      description: "High-grade PVC with dual track system",
      colors: [
        { name: "Light Blue", value: "#87CEEB", hex: "#87CEEB" },
        { name: "Royal Blue", value: "#4169E1", hex: "#4169E1" },
        { name: "Navy Blue", value: "#000080", hex: "#000080" },
        { name: "Forest Green", value: "#228B22", hex: "#228B22" },
        { name: "Light Gray", value: "#D3D3D3", hex: "#D3D3D3" },
        { name: "Charcoal Gray", value: "#36454F", hex: "#36454F" },
        { name: "Brown", value: "#964B00", hex: "#964B00" },
        { name: "Black", value: "#000000", hex: "#000000" }
      ]
    },
    { 
      name: "CS3000 Automatic Cover", 
      surname: "CS3000", 
      color: "#2F4F4F", 
      price: 30000, 
      image: "/lovable-uploads/af4bf30f-30a2-42bc-aa71-2b3bdc25b0bc.png", 
      category: "cover", 
      description: "Commercial-grade with solar heating benefits",
      colors: [
        { name: "Light Blue", value: "#87CEEB", hex: "#87CEEB" },
        { name: "Royal Blue", value: "#4169E1", hex: "#4169E1" },
        { name: "Navy Blue", value: "#000080", hex: "#000080" }
      ]
    },
    { 
      name: "Infinity 4000 Automatic Cover", 
      surname: "Infinity 4000", 
      color: "#2F4F4F", 
      price: 32000, 
      image: "/lovable-uploads/3adb0804-f3a6-4d17-a38e-feb05f6fbdf9.png", 
      category: "cover", 
      description: "Premium with advanced safety features",
      colors: [
        { name: "Light Blue", value: "#87CEEB", hex: "#87CEEB" },
        { name: "Royal Blue", value: "#4169E1", hex: "#4169E1" }
      ]
    },
    { 
      name: "Atom Automatic Cover", 
      surname: "Atom", 
      color: "#2F4F4F", 
      price: 25000, 
      image: "/lovable-uploads/ba0e311a-ab2a-4b2a-82ce-dfb8f97c33bd.png", 
      category: "cover", 
      description: "Compact and efficient design",
      colors: [
        { name: "Light Blue", value: "#87CEEB", hex: "#87CEEB" },
        { name: "Royal Blue", value: "#4169E1", hex: "#4169E1" }
      ]
    }
  ];

  const tileOptions = [
    { name: "Standard Waterline", color: "#4682B4", price: 0, image: azureBlueFinish, description: undefined },
    ...poolTiles.map((tile) => ({ name: tile.name, color: "#4682B4", price: tile.price, image: tile.image, description: tile.description })),
  ];

  const paverOptions = [
    { name: "Concrete Deck", color: "#808080", price: 10, basePrice: 10, image: concreteDeckTexture, description: "Standard concrete deck", collection: "none" },
    ...paverTypes.map((paver) => ({ name: paver.name, color: "#D3D3D3", price: 0, basePrice: paver.basePrice, image: paver.image || azureBlueFinish, description: paver.description, collection: paver.id.includes("appian") ? "appian" : paver.id.includes("catalina") ? "catalina" : "standard" })),
  ];

  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showQuoteTool, setShowQuoteTool] = useState(false);
  const [currentPoolImage, setCurrentPoolImage] = useState(pool.image);
  const [isEditable, setIsEditable] = useState(isAdmin);
  const [extras, setExtras] = useState<PoolExtras>({
    liner: false,
    heater: false,
    cover: false,
    jets: false,
    jetQuantity: 0,
    finish: "",
    linerOption: "",
    coverOption: "",
    tiles: false,
    tileOption: "",
    spa: false,
    spaModel: "",
    tanningLedge: false,
    tanningLedgeModel: "",
    heaterModel: "",
    paverOption: "",
    copingPaverOption: "",
    screenEnclosure: false,
    screenEnclosureArea: 0,
    screenEnclosureQuality: "standard",
    concreteConstruction: false,
    rockyWaterfalls: false,
    rockyWaterfallsType: "Sunset Grove",
    rockyWaterfallsColor: "Castle Rock",
    artificialGrass: false,
    artificialGrassColor: "Light Green",
    artificialGrassArea: "",
  });

  // Artificial Grass options ($25/sq ft)
  const ARTIFICIAL_GRASS_PRICE_PER_SQFT = 25;
  const artificialGrassOptions = [
    { name: 'Light Green', image: grassLightGreenImage },
    { name: 'Dark Green', image: grassDarkGreenImage },
    { name: 'Natural Green', image: grassNaturalGreenImage },
    { name: 'Emerald', image: grassEmeraldImage },
    { name: 'Olive', image: grassOliveImage },
  ];

  // Rocky Waterfalls types with their prices and color options
  const rockyWaterfallsTypes = [
    { 
      name: 'Sunset Grove', 
      price: 17500, 
      image: sunsetGroveImage,
      colors: ['Castle Rock', 'Gray', 'Brown']
    },
    { 
      name: 'Maldives', 
      price: 5600, 
      image: maldivesImage,
      colors: ['Castle Rock', 'Gray', 'Brown']
    },
    { 
      name: 'Serenity', 
      price: 9500, 
      image: serenityImage,
      colors: ['Castle Rock', 'Gray', 'Brown']
    },
  ];
  const [paverSurfaceArea, setPaverSurfaceArea] = useState("");
  const [copingSurfaceArea, setCopingSurfaceArea] = useState("");
  const [showFinancing, setShowFinancing] = useState(false);
  const [coverColor, setCoverColor] = useState("Light Blue");
  const { addToCart } = useShoppingCart();
  
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
    description: undefined,
  });

  // No need to fetch from database - using static paver data

  const handleImageClick = () => {
    // Navigate to Wonderlands Studio with the selected product including depth
    const params = new URLSearchParams({
      model: pool.model,
      price: pool.price.toString(),
      category: pool.category,
      ...(pool.depth && { depth: pool.depth }),
      ...(pool.dimensions && { dimensions: pool.dimensions }),
      ...(currentPoolImage && {
        image: encodeURIComponent(currentPoolImage),
      }),
    });
    navigate(`/wonderlands-studio?${params.toString()}`);
  };
  const handleImageHover = (isHovering: boolean) => {
    if (isHovering && !showDetails) {
      setShowDetails(true);
    }
  };
  const toggleExtra = (extra: string) => {
    setExtras((prev) => {
      if (extra === "tiles") {
        return {
          ...prev,
          tiles: !prev.tiles,
        };
      } else if (extra === "liner") {
        return {
          ...prev,
          liner: !prev.liner,
        };
      } else if (extra === "cover") {
        const enabling = !prev.cover;
        return enabling
          ? {
              ...prev,
              cover: true,
              coverOption: coverOptions.find((o) => o.name === prev.coverOption)
                ? prev.coverOption
                : "Eclipse Automatic Cover",
            }
          : {
              ...prev,
              cover: false,
            };
      } else if (extra === "heater") {
        return {
          ...prev,
          heater: !prev.heater,
        };
      } else if (extra === "spa") {
        return {
          ...prev,
          spa: !prev.spa,
        };
      } else if (extra === "tanningLedge") {
        return {
          ...prev,
          tanningLedge: !prev.tanningLedge,
        };
      } else if (extra === "jets") {
        return {
          ...prev,
          jets: !prev.jets,
        };
      } else if (extra === "screenEnclosure") {
        return {
          ...prev,
          screenEnclosure: !prev.screenEnclosure,
        };
      } else if (extra === "concreteConstruction") {
        return {
          ...prev,
          concreteConstruction: !prev.concreteConstruction,
        };
      } else if (extra === "rockyWaterfalls") {
        return {
          ...prev,
          rockyWaterfalls: !prev.rockyWaterfalls,
        };
      } else if (extra === "artificialGrass") {
        return {
          ...prev,
          artificialGrass: !prev.artificialGrass,
        };
      }
      return prev;
    });
  };
  const calculateTotalPrice = () => {
    let total = getPoolPrice(pool);

    // Add 20% markup for concrete construction
    if (extras.concreteConstruction) {
      total = total * 1.2;
    }

    // Add finish price if not default
    const selectedFinish = finishOptions.find((finish) => finish.name === extras.finish);
    if (selectedFinish && selectedFinish.price) {
      total += selectedFinish.price;
    }

    // Add heater price if selected (dynamic price based on model)
    if (extras.heater) {
      const selectedHeater = poolHeaters.find((heater) => heater.name === extras.heaterModel);
      if (selectedHeater) total += selectedHeater.price;
    }
    if (extras.jets) total += getExtraPrice("jets") * extras.jetQuantity;

    // Add option prices - liner is always $4500 when selected
    const linerOption = linerOptions.find((option) => option.name === extras.linerOption);
    const tileOption = tileOptions.find((option) => option.name === extras.tileOption);

    // Always add tile price when tiles are selected
    if (tileOption && extras.tiles) total += tileOption.price;

    // Add liner price ($4500) when liner is selected and not "Standard Blue"
    if (linerOption && extras.linerOption !== "Standard Blue") {
      total += 4500; // Fixed price for any premium liner
    }

    // Add cover price only once
    const coverOption = coverOptions.find((option) => option.name === extras.coverOption);
    if (coverOption && extras.cover && coverOption.name !== "NO COVER") total += coverOption.price;

    // Add paver prices (mandatory options)
    const paverOption = paverOptions.find((option) => option.name === extras.paverOption);
    if (paverOption) total += paverOption.price;

    // Add calculated paver surface area cost using centralized pricing utility
    if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
      const paverName = extras.paverOption || "Concrete Deck";
      total += calculatePaverCost(paverSurfaceArea, paverName);
    }

    // Add spa price if selected
    if (extras.spa) {
      const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
      if (selectedSpa) total += selectedSpa.price;
    }

    // Add tanning ledge price if selected
    if (extras.tanningLedge) {
      const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
      if (selectedLedge) total += selectedLedge.price;
    }

    // Add screen enclosure price if selected using centralized pricing
    if (extras.screenEnclosureArea > 0) {
      const quality = extras.screenEnclosureQuality as 'standard' | 'deluxe' | 'premium' || 'standard';
      const pricePerSqFt = SCREEN_ENCLOSURE_PRICING[quality] || SCREEN_ENCLOSURE_PRICING.standard;
      total += extras.screenEnclosureArea * pricePerSqFt;
    }

    // Add Rocky Waterfalls price if selected
    if (extras.rockyWaterfalls) {
      const waterfallType = rockyWaterfallsTypes.find(t => t.name === extras.rockyWaterfallsType);
      total += waterfallType?.price || 17500;
    }

    // Add Artificial Grass price if selected ($15/sq ft)
    if (extras.artificialGrass && extras.artificialGrassArea && !isNaN(parseFloat(extras.artificialGrassArea))) {
      total += parseFloat(extras.artificialGrassArea) * ARTIFICIAL_GRASS_PRICE_PER_SQFT;
    }

    // Apply project type multiplier (3x for commercial)
    return total * priceMultiplier;
  };
  const hasExtras = Object.values(extras).some((value) => value);
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
      const selectedHeater = poolHeaters.find((heater) => heater.name === extras.heaterModel);
      if (selectedHeater) {
        cartExtras.push({
          name: `${selectedHeater.name}`,
          price: selectedHeater.price,
        });
      }
    }
    if (extras.jets)
      cartExtras.push({
        name: `Spa Jets (${extras.jetQuantity})`,
        price: getExtraPrice("jets") * extras.jetQuantity,
      });
    const linerOption = linerOptions.find((option) => option.name === extras.linerOption);
    if (linerOption && extras.liner) {
      cartExtras.push({
        name: `${linerOption.name} Liner`,
        price: linerOption.price,
      });
    }
    const coverOption = coverOptions.find((option) => option.name === extras.coverOption);
    if (coverOption && extras.cover && coverOption.name !== "NO COVER") {
      cartExtras.push({
        name: coverOption.name,
        price: coverOption.price,
      });
    }
    const tileOption = tileOptions.find((option) => option.name === extras.tileOption);
    if (tileOption && extras.tiles) {
      cartExtras.push({
        name: tileOption.name,
        price: tileOption.price,
      });
    }

    // Add concrete construction markup to cart if selected
    if (extras.concreteConstruction) {
      const concreteMarkup = Math.round(getPoolPrice(pool) * 0.2);
      cartExtras.push({
        name: "Concrete Construction",
        price: concreteMarkup,
      });
    }

    // Add paver options (always included)
    const paverOption = paverOptions.find((option) => option.name === extras.paverOption);
    if (paverOption && paverOption.price > 0) {
      cartExtras.push({
        name: paverOption.name,
        price: paverOption.price,
      });
    }

    // Remove coping paver options from cart since they were removed
    // const copingPaverOption = copingPaverOptions.find(option => option.name === extras.copingPaverOption);
    // if (copingPaverOption && copingPaverOption.price > 0) {
    //   cartExtras.push({ name: copingPaverOption.name, price: copingPaverOption.price });
    // }

    if (extras.spa) {
      const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
      if (selectedSpa) {
        cartExtras.push({
          name: `${selectedSpa.model} Spa`,
          price: selectedSpa.price,
        });
      }
    }
    if (extras.tanningLedge) {
      const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
      if (selectedLedge) {
        cartExtras.push({
          name: `${selectedLedge.name} Tanning Ledge`,
          price: selectedLedge.price,
        });
      }
    }

    // Add screen enclosure to cart if area provided
    if (extras.screenEnclosureArea > 0) {
      let pricePerSqFt = 22;
      if (extras.screenEnclosureQuality === "deluxe") pricePerSqFt = 24;
      if (extras.screenEnclosureQuality === "premium") pricePerSqFt = 26;
      const enclosurePrice = extras.screenEnclosureArea * pricePerSqFt;
      cartExtras.push({
        name: `Screen Enclosure - ${extras.screenEnclosureQuality} (${extras.screenEnclosureArea} sq ft)`,
        price: enclosurePrice,
      });
    }

    // Add Rocky Waterfalls to cart if selected
    if (extras.rockyWaterfalls) {
      const waterfallType = rockyWaterfallsTypes.find(t => t.name === extras.rockyWaterfallsType);
      cartExtras.push({
        name: `Rocky Waterfalls - ${extras.rockyWaterfallsType}: ${extras.rockyWaterfallsColor}`,
        price: waterfallType?.price || 17500,
      });
    }

    // Add Artificial Grass to cart if selected
    if (extras.artificialGrass && extras.artificialGrassArea && !isNaN(parseFloat(extras.artificialGrassArea))) {
      const grassArea = parseFloat(extras.artificialGrassArea);
      cartExtras.push({
        name: `Artificial Grass - ${extras.artificialGrassColor} (${grassArea} sq ft)`,
        price: grassArea * ARTIFICIAL_GRASS_PRICE_PER_SQFT,
      });
    }
    addToCart({
      id: `pool_${pool.model.replace(/\s+/g, "_")}_${Date.now()}`,
      name: pool.model,
      price: pool.price,
      category: pool.category,
      image: currentPoolImage,
      extras: cartExtras,
    });
  };
  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Edge-to-edge Pool Image at top */}
      <div
        className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image"
        onClick={handleImageClick}
      >
        {currentPoolImage ? (
          <OptimizedImage
            src={currentPoolImage}
            alt={pool.model}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
            sizeConfig="poolCard"
            priority={priority}
            fetchpriority={priority ? 'high' : 'auto'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-teal/20">
            <Waves size={48} className="text-primary/60" />
          </div>
        )}

        {/* Category Badge overlay */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getCategoryColor(pool.category)} text-white capitalize font-medium px-3 py-1`}>
            {pool.category === "standard" ? "Wonderful" : pool.category}
          </Badge>
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 text-white font-medium">
            Open in Studio
          </div>
        </div>

        {/* Image Edit Button - Only visible for admins */}
        {isAdmin && isEditable && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.stopPropagation();
              setShowImageEditor(true);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {/* Pool Name & Collection */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {pool.model}
          </h3>
          {pool.galaCategory && (
            <Badge variant="secondary" className="text-xs font-semibold">
              {pool.galaCategory} Collection
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                ${(getPoolPrice(pool) * priceMultiplier).toLocaleString()}
              </span>
              {projectType === 'commercial' && (
                <span className="text-xs text-amber-600 font-medium">Commercial Rate</span>
              )}
            </div>
          </div>
          {pool.category === "deluxe" && <div className="flex items-center gap-2"></div>}
          {hasExtras && pool.category !== "deluxe"}
        </div>

        {/* Features & Tech */}
        <div className="space-y-2">
          {pool.saltSystem && (
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="h-4 w-4 text-teal" />
              <span className="font-medium">Salt system included in final price</span>
            </div>
          )}
          {pool.carbonFiber && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium">Carbon Fiber Technology</span>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          {pool.dimensions && <p>Dimensions: {pool.dimensions}</p>}
          {pool.depth && <p>Depth: {pool.depth}</p>}
          <div className="mt-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs font-semibold text-primary mb-1">✓ Included with Pool:</p>
            <ul className="text-xs space-y-0.5">
              <li>• Salt system</li>
              <li>• Pentair pool equipment</li>
              <li>• LED light</li>
            </ul>
          </div>
          {pool.installationTimeWeeks && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{extras.concreteConstruction ? 'Construction' : 'Installation'}: {pool.installationTimeWeeks} weeks</span>
            </div>
          )}
          {pool.warrantyYears && !extras.concreteConstruction && (
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span className="font-bold text-primary">
                Warranty:{" "}
                {pool.warrantyYears === "Lifetime" || pool.warrantyYears === "Life"
                  ? "LIFETIME WARRANTY"
                  : `${pool.warrantyYears} years`}
              </span>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="space-y-4 animate-fade-in-up">
            <Separator />

            {/* Pool Finishing Options */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Pool Finishes</h4>
              <Carousel 
                className="w-full"
                opts={{
                  align: "start",
                  loop: false,
                  duration: 25,
                }}
              >
                <CarouselContent className="-ml-1">
                  {finishOptions.map((finish, idx) => (
                    <CarouselItem
                      key={`pool-${finish.name}-${idx}`}
                      className="pl-1 basis-1/2"
                    >
                      <div
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.finish === finish.name ? "border-primary bg-primary/10" : "border-border"}`}
                        onClick={() =>
                          setExtras((prev) => ({
                            ...prev,
                            finish: finish.name,
                          }))
                        }
                      >
                        <div 
                          className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePopup({
                              isOpen: true,
                              imageSrc: finish.image,
                              name: finish.name,
                              price: finish.price,
                              description: finish.description,
                            });
                          }}
                        >
                          <OptimizedImage
                            src={finish.image}
                            alt={finish.name}
                            className="w-full h-full object-cover"
                            sizeConfig="thumbnail"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{finish.name}</p>
                          <div className="mt-1 space-y-1">
                            <p className="text-xs text-primary text-center font-semibold">{finish.collection}</p>
                            {finish.price && (
                              <p className="text-xs text-foreground font-semibold text-center">
                                +${finish.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 animate-pulse" />
                <CarouselNext className="right-0 animate-pulse" />
              </Carousel>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Pool Liner Options */}
            <AccordionItem value="liner" className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="font-semibold text-foreground text-sm">Pool Liner</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-3">
              <Carousel 
                className="w-full"
                opts={{
                  align: "start",
                  loop: false,
                  duration: 25,
                }}
              >
                <CarouselContent className="-ml-1">
                  {/* First option: Selected Pool Finish (no liner) */}
                  <CarouselItem className="pl-1 basis-1/2">
                    <div
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.linerOption === "" || extras.linerOption === "Standard Blue" ? "border-primary bg-primary/10" : "border-border"}`}
                      onClick={() =>
                        setExtras((prev) => ({
                          ...prev,
                          linerOption: "",
                        }))
                      }
                    >
                      <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary transition-all">
                        <img
                          src={finishOptions.find(f => f.name === extras.finish)?.image || azureBlueFinish}
                          alt={extras.finish || "Pool Finish"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-h-0">
                        <p className="text-xs font-medium text-center line-clamp-2">{extras.finish || "Pool Finish"}</p>
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-primary text-center font-semibold">Selected Finish</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                  {/* Premium liner options */}
                  {linerOptions.filter(l => l.name !== "Standard Blue").map((liner) => (
                    <CarouselItem key={liner.name} className="pl-1 basis-1/2">
                      <div
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.linerOption === liner.name ? "border-primary bg-primary/10" : "border-border"}`}
                        onClick={() =>
                          setExtras((prev) => ({
                            ...prev,
                            linerOption: liner.name,
                          }))
                        }
                      >
                        <div 
                          className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePopup({
                              isOpen: true,
                              imageSrc: liner.image,
                              name: liner.name,
                              price: liner.price,
                              description: liner.description,
                            });
                          }}
                        >
                          <img
                            src={liner.image}
                            alt={liner.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.style.backgroundColor = liner.color;
                                target.style.display = "none";
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{liner.name}</p>
                          <div className="mt-1 space-y-1">
                            {liner.type && liner.type !== "Standard" && (
                              <p className="text-xs text-primary text-center font-semibold">{liner.type}</p>
                            )}
                            <p className="text-xs text-foreground font-semibold text-center">+$4,500</p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 animate-pulse" />
                <CarouselNext className="right-0 animate-pulse" />
              </Carousel>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Pavers Options */}
            <AccordionItem value="pavers" className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="font-semibold text-foreground text-sm">Deck Pavers</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-3">
              <Carousel
                className="w-full"
                opts={{
                  align: "start",
                  loop: false,
                  duration: 25,
                }}
              >
                <CarouselContent className="-ml-1">
                  {paverOptions.map((paver) => (
                    <CarouselItem key={paver.name} className="pl-1 basis-1/2">
                      <div
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.paverOption === paver.name ? "border-primary bg-primary/10" : "border-border"}`}
                        onClick={() =>
                          setExtras((prev) => ({
                            ...prev,
                            paverOption: paver.name,
                          }))
                        }
                      >
                        <div 
                          className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExtras((prev) => ({
                              ...prev,
                              paverOption: paver.name,
                            }));
                            setImagePopup({
                              isOpen: true,
                              imageSrc: paver.image,
                              name: paver.name,
                              price: paver.price,
                              description: paver.description,
                            });
                          }}
                        >
                          <OptimizedImage
                            src={paver.image}
                            alt={paver.name}
                            className="w-full h-full object-cover"
                            sizeConfig="thumbnail"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{paver.name}</p>
                          {paver.price > 0 && (
                            <p className="text-xs text-primary font-semibold text-center mt-1">
                              +${paver.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              <CarouselPrevious className="left-0 animate-pulse" />
                <CarouselNext className="right-0 animate-pulse" />
              </Carousel>
              <div className="mt-3">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Paver Surface Area (sq ft)
                </label>
                <Input
                  type="number"
                  placeholder="Enter surface area for pavers"
                  value={paverSurfaceArea}
                  onChange={(e) => setPaverSurfaceArea(e.target.value)}
                  className="mb-2"
                />
                {paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea)) && (
                  <div className="text-xs text-green-600 font-medium">
                    Calculated Cost: ${calculatePaverCost(paverSurfaceArea, extras.paverOption).toLocaleString()} ({paverSurfaceArea} sq ft × ${getPaverPricePerSqFt(extras.paverOption)}/sq ft)
                  </div>
                )}
              </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Screen Enclosure Options */}
            <AccordionItem value="enclosure" className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="font-semibold text-foreground text-sm">Screen Enclosure</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-3">
              <Carousel
                className="w-full"
                opts={{
                  align: "start",
                  loop: false,
                  duration: 25,
                }}
              >
                <CarouselContent className="-ml-1">
                  {[
                    { key: "standard", name: "Wonder Cage", price: SCREEN_ENCLOSURE_PRICING.standard, image: "/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png" },
                    { key: "deluxe", name: "Deluxe", price: SCREEN_ENCLOSURE_PRICING.deluxe, image: screenEnclosureDeluxe },
                    { key: "premium", name: "2 Stories", price: SCREEN_ENCLOSURE_PRICING.premium, image: screenEnclosurePremium },
                  ].map((quality) => (
                    <CarouselItem key={quality.key} className="pl-1 basis-1/2">
                      <div
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.screenEnclosureQuality === quality.key ? "border-primary bg-primary/10" : "border-border"}`}
                        onClick={() =>
                          setExtras((prev) => ({
                            ...prev,
                            screenEnclosureQuality: quality.key as "standard" | "deluxe" | "premium",
                          }))
                        }
                      >
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary transition-all">
                          <img 
                            src={quality.image} 
                            alt={quality.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                          <p className="text-xs font-medium text-center line-clamp-2">{quality.name}</p>
                          <p className="text-xs text-primary font-semibold text-center mt-1">
                            ${quality.price}/sq ft
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0 animate-pulse" />
                <CarouselNext className="right-0 animate-pulse" />
              </Carousel>
              <div className="mt-3">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Screen Enclosure Area (sq ft)
                </label>
                <Input
                  type="number"
                  placeholder="Enter surface area for screen enclosure"
                  value={extras.screenEnclosureArea || ""}
                  onChange={(e) =>
                    setExtras((prev) => ({
                      ...prev,
                      screenEnclosureArea: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="mb-2"
                />
                {extras.screenEnclosureArea > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    Calculated Cost: ${(() => {
                      const quality = (extras.screenEnclosureQuality as 'standard' | 'deluxe' | 'premium') || 'standard';
                      const pricePerSqFt = SCREEN_ENCLOSURE_PRICING[quality] || SCREEN_ENCLOSURE_PRICING.standard;
                      return (extras.screenEnclosureArea * pricePerSqFt).toLocaleString();
                    })()} ({extras.screenEnclosureArea} sq ft × ${(() => {
                      const quality = (extras.screenEnclosureQuality as 'standard' | 'deluxe' | 'premium') || 'standard';
                      return SCREEN_ENCLOSURE_PRICING[quality] || SCREEN_ENCLOSURE_PRICING.standard;
                    })()}/sq ft)
                  </div>
                )}
              </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Cover Options */}

            {/* Add-ons */}
            <AccordionItem value="addons" className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="font-semibold text-foreground text-sm">Additional Features</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="space-y-3">


              <div className="grid grid-cols-1 gap-3">
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={extras.heater}
                    onCheckedChange={() => toggleExtra("heater")}
                    className="data-[state=checked]:bg-coral data-[state=checked]:border-coral"
                  />
                  <div className="flex items-center space-x-1">
                    <Thermometer size={16} className="text-coral" />
                    <span className="text-sm">
                      Add Pool Heater (+$
                      {extras.heater
                        ? (() => {
                            const selectedHeater = poolHeaters.find((heater) => heater.name === extras.heaterModel);
                            return selectedHeater ? selectedHeater.price.toLocaleString() : "0";
                          })()
                        : "0"}
                      )
                    </span>
                  </div>
                </label>

                {extras.heater && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Heater Model:</label>
                    <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
                      <CarouselContent className="-ml-1">
                        {poolHeaters.map((heater) => (
                          <CarouselItem key={heater.name} className="pl-1 basis-1/2">
                            <div
                              onClick={() => setExtras((prev) => ({ ...prev, heaterModel: heater.name }))}
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.heaterModel === heater.name ? "border-coral bg-coral/10" : "border-border"}`}
                            >
                              <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                <img src={heater.image} alt={heater.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex flex-col justify-between min-h-0">
                                <p className="text-xs font-medium text-center line-clamp-2">{heater.name}</p>
                                <p className="text-xs text-coral font-semibold text-center mt-1">${heater.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-0 animate-pulse" />
                      <CarouselNext className="right-0 animate-pulse" />
                    </Carousel>
                  </div>
                )}

                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <label className="flex items-center space-x-2 cursor-pointer flex-1">
                    <Checkbox checked={extras.jets} onCheckedChange={() => toggleExtra("jets")} />
                    <div className="flex items-center space-x-1">
                      <Zap size={16} className="text-orange" />
                      <span className="text-sm">
                        Spa Jets (+${(getExtraPrice("jets") * extras.jetQuantity).toLocaleString()})
                      </span>
                    </div>
                  </label>
                  {extras.jets && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExtras((prev) => ({
                            ...prev,
                            jetQuantity: Math.max(1, prev.jetQuantity - 1),
                          }))
                        }
                        className="h-8 w-8 p-0"
                      >
                        -
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{extras.jetQuantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExtras((prev) => ({
                            ...prev,
                            jetQuantity: prev.jetQuantity + 1,
                          }))
                        }
                        className="h-8 w-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>

                {/* Remove Cover from Additional Features - it's now in main options */}

                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={extras.cover}
                    onCheckedChange={() => toggleExtra("cover")}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex items-center space-x-1">
                    <Shield size={16} className="text-primary" />
                    <span className="text-sm">
                      Add Pool Cover (+$
                      {extras.cover
                        ? (() => {
                            const selectedCover = coverOptions.find((cover) => cover.name === extras.coverOption);
                            return selectedCover && selectedCover.name !== "NO COVER"
                              ? selectedCover.price.toLocaleString()
                              : "0";
                          })()
                        : "0"}
                      )
                    </span>
                  </div>
                </label>

                {extras.cover && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Cover Type:</label>
                    <div className="grid grid-cols-1 gap-2">
                      {coverOptions.map((cover) => (
                        <button
                          key={cover.name}
                          onClick={() =>
                            setExtras((prev) => ({
                              ...prev,
                              coverOption: cover.name,
                            }))
                          }
                          className={`p-2 text-xs rounded-md border transition-all flex items-center gap-3 ${extras.coverOption === cover.name ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}
                        >
                          <img 
                            src={cover.image} 
                            alt={cover.name} 
                            className="w-12 h-12 rounded object-contain bg-muted/50 p-1" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="flex-1 text-left">
                            <div className="font-medium">{cover.surname}</div>
                            <div className="text-xs text-muted-foreground">
                              {cover.price > 0 ? `$${cover.price.toLocaleString()}` : "No Cost"}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Color Selection for Covers */}
                    {extras.coverOption &&
                      extras.coverOption !== "NO COVER" &&
                      (() => {
                        const selectedCover = coverOptions.find((c) => c.name === extras.coverOption);
                        return (
                          selectedCover?.colors && (
                            <div className="mt-3">
                              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                Select Cover Color:
                              </label>
                              <div className="grid grid-cols-4 gap-2">
                                {selectedCover.colors.map((color) => (
                                  <button
                                    key={color.name}
                                    onClick={() => setCoverColor(color.name)}
                                    className={`p-2 text-xs rounded-md border transition-all flex flex-col items-center gap-1 ${coverColor === color.name ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}
                                  >
                                    <div
                                      className="w-6 h-6 rounded-full border border-border"
                                      style={{
                                        backgroundColor: color.hex,
                                      }}
                                    />
                                    <span className="text-[10px] leading-tight text-center">{color.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        );
                      })()}
                  </div>
                )}

                {pool.model !== "Madre Perla" && pool.model !== "Pacific Ridge" && pool.model !== "Maxima" && pool.model !== "Winderview" && (
                  <>
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox
                        checked={extras.concreteConstruction}
                        onCheckedChange={() => toggleExtra("concreteConstruction")}
                        className="data-[state=checked]:bg-coral data-[state=checked]:border-coral"
                      />
                      <div className="flex items-center space-x-1">
                        <Shield size={16} className="text-coral" />
                        <span className="text-sm">
                          Make it on Concrete (+${Math.round(getPoolPrice(pool) * 0.2).toLocaleString()})
                        </span>
                      </div>
                    </label>
                    {extras.concreteConstruction && (
                      <p className="text-xs text-muted-foreground ml-6 mt-1">
                        Premium concrete construction for enhanced durability and longevity.
                      </p>
                    )}
                  </>
                )}

                {/* Rocky Waterfalls */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={extras.rockyWaterfalls}
                    onCheckedChange={() => toggleExtra("rockyWaterfalls")}
                    className="data-[state=checked]:bg-stone-600 data-[state=checked]:border-stone-600"
                  />
                  <div className="flex items-center space-x-1">
                    <Waves size={16} className="text-stone-600" />
                    <span className="text-sm">
                      Rocky Waterfalls (+${extras.rockyWaterfalls ? (rockyWaterfallsTypes.find(t => t.name === extras.rockyWaterfallsType)?.price || 17500).toLocaleString() : '0'})
                    </span>
                  </div>
                </label>

                {extras.rockyWaterfalls && (
                  <div className="ml-6 space-y-4">
                    <label className="text-xs font-medium text-muted-foreground">Select Waterfall Type:</label>
                    <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
                      <CarouselContent className="-ml-1">
                        {rockyWaterfallsTypes.map((waterfall) => (
                          <CarouselItem key={waterfall.name} className="pl-1 basis-1/3">
                            <div
                              onClick={() => setExtras((prev) => ({ ...prev, rockyWaterfallsType: waterfall.name, rockyWaterfallsColor: waterfall.colors[0] }))}
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                                extras.rockyWaterfallsType === waterfall.name
                                  ? 'border-stone-600 bg-stone-600/10'
                                  : 'border-border'
                              }`}
                            >
                              <div className="w-full h-20 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                <OptimizedImage
                                  src={waterfall.image}
                                  alt={waterfall.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex-1 flex flex-col justify-between min-h-0">
                                <p className="text-xs font-medium text-center line-clamp-2">{waterfall.name}</p>
                                <p className="text-xs text-stone-600 font-semibold text-center mt-1">${waterfall.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-0 animate-pulse" />
                      <CarouselNext className="right-0 animate-pulse" />
                    </Carousel>

                    <label className="text-xs font-medium text-muted-foreground">Select Color:</label>
                    <div className="flex gap-2">
                      {(rockyWaterfallsTypes.find(t => t.name === extras.rockyWaterfallsType)?.colors || ['Castle Rock', 'Gray', 'Brown']).map((color) => (
                        <button
                          key={color}
                          onClick={() => setExtras((prev) => ({ ...prev, rockyWaterfallsColor: color }))}
                          className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                            extras.rockyWaterfallsColor === color
                              ? 'border-stone-600 bg-stone-600/10 text-stone-700'
                              : 'border-border hover:border-stone-600/50'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Artificial Grass */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    checked={extras.artificialGrass}
                    onCheckedChange={() => toggleExtra("artificialGrass")}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <div className="flex items-center space-x-1">
                    <Sprout size={16} className="text-green-600" />
                    <span className="text-sm">
                      Artificial Grass (+${extras.artificialGrass && extras.artificialGrassArea && !isNaN(parseFloat(extras.artificialGrassArea))
                        ? (parseFloat(extras.artificialGrassArea) * ARTIFICIAL_GRASS_PRICE_PER_SQFT).toLocaleString()
                        : '0'})
                    </span>
                  </div>
                </label>

                {extras.artificialGrass && (
                  <div className="ml-6 space-y-3">
                    <label className="text-xs font-medium text-muted-foreground">Select Color:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {artificialGrassOptions.map((opt) => (
                        <button
                          key={opt.name}
                          onClick={() => setExtras((prev) => ({ ...prev, artificialGrassColor: opt.name }))}
                          className={`p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md flex flex-col items-center ${
                            extras.artificialGrassColor === opt.name
                              ? 'border-green-600 bg-green-600/10'
                              : 'border-border'
                          }`}
                        >
                          <div className="w-full h-16 rounded-md mb-2 overflow-hidden">
                            <OptimizedImage
                              src={opt.image}
                              alt={opt.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <span className="text-xs font-medium">{opt.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs">Surface Area (sq ft):</Label>
                      <Input
                        type="number"
                        value={extras.artificialGrassArea}
                        onChange={(e) => setExtras((prev) => ({ ...prev, artificialGrassArea: e.target.value }))}
                        className="w-28 h-8"
                        min="0"
                        placeholder="sq ft"
                      />
                      <span className="text-xs text-muted-foreground">${ARTIFICIAL_GRASS_PRICE_PER_SQFT}/sq ft</span>
                    </div>
                    {extras.artificialGrassArea && !isNaN(parseFloat(extras.artificialGrassArea)) && parseFloat(extras.artificialGrassArea) > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        Total: ${(parseFloat(extras.artificialGrassArea) * ARTIFICIAL_GRASS_PRICE_PER_SQFT).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Exclusive Sauna Offer - Moved here, after Rocky Waterfalls */}
                <ExclusiveSaunaOffer poolModel={pool.model} poolPrice={pool.price} />

                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox checked={extras.spa} onCheckedChange={() => toggleExtra("spa")} />
                  <div className="flex items-center space-x-1">
                    <Waves size={16} className="text-primary" />
                    <span className="text-sm">
                      Add Spa (+$
                      {extras.spa
                        ? (() => {
                            const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
                            return selectedSpa ? selectedSpa.price.toLocaleString() : "0";
                          })()
                        : "0"}
                      )
                    </span>
                  </div>
                </label>

                {extras.spa && (() => {
                  // Check if current pool is a Glimmerglass pool
                  const isGlimmerglassPool = gilmerPools.some(p => p.model === pool.model) || 
                    pool.model.toLowerCase().includes('glimmerglass') ||
                    pool.model.toLowerCase().includes('serafin');
                  
                  // Combine spas - Gilmer spas first for Glimmerglass pools
                  const combinedSpas = isGlimmerglassPool 
                    ? [...gilmerSpas.map(s => ({ ...s, brand: 'Glimmerglass' })), ...spas]
                    : [...spas, ...gilmerSpas.map(s => ({ ...s, brand: 'Glimmerglass' }))];
                  
                  return (
                    <div className="ml-6 space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Select Spa Model:</label>
                      <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
                        <CarouselContent className="-ml-1">
                          {combinedSpas.map((spa: any) => (
                            <CarouselItem key={spa.model} className="pl-1 basis-1/2">
                              <div
                                onClick={() => setExtras((prev) => ({ ...prev, spaModel: spa.model }))}
                                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.spaModel === spa.model ? "border-primary bg-primary/10" : "border-border"}`}
                              >
                                <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                  {spa.image && <img src={spa.image} alt={spa.model} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 flex flex-col justify-between min-h-0">
                                  <p className="text-xs font-medium text-center line-clamp-2">{spa.model}</p>
                                  {spa.brand === 'Glimmerglass' && (
                                    <p className="text-[10px] text-muted-foreground text-center">Glimmerglass</p>
                                  )}
                                  <p className="text-xs text-primary font-semibold text-center mt-1">${spa.price.toLocaleString()}</p>
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-0 animate-pulse" />
                        <CarouselNext className="right-0 animate-pulse" />
                      </Carousel>
                      
                      {/* Spa Finish Selection - Only for Latham spas on Glimmerglass pools */}
                      {extras.spaModel && (() => {
                        const lathamSpaModels = ["Mystic", "Regal", "Royal", "Shafta"];
                        const isLathamSpa = lathamSpaModels.some(model => 
                          extras.spaModel?.toLowerCase().includes(model.toLowerCase())
                        );
                        
                        if (isGlimmerglassPool && isLathamSpa) {
                          const crystiteFinishes = [
                            { id: 'sapphire-blue', name: 'Sapphire Blue', price: 3500, image: '/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png' },
                            { id: 'ocean-blue', name: 'Ocean Blue', price: 3500, image: '/lovable-uploads/2103693f-cf54-423d-99c7-68d6f3951388.png' },
                            { id: 'night-sky', name: 'Night Sky', price: 3500, image: '/lovable-uploads/90fe0136-31f1-4fa3-b816-56a7a74484fa.png' },
                            { id: 'shale-gray', name: 'Shale Gray', price: 3500, image: '/lovable-uploads/15032ed4-f745-4152-ae9b-c26fdb52f68c.png' },
                            { id: 'coastal-bronze', name: 'Coastal Bronze', price: 3500, image: '/lovable-uploads/b1abd5c3-af2e-46fa-82be-5db27d20a388.png' },
                            { id: 'pearl-white', name: 'Pearl White', price: 3500, image: '/lovable-uploads/0a3d28a3-a0dd-41e8-91ba-6c0ec4dbe9af.png' },
                          ];
                          
                          return (
                            <div className="space-y-2 mt-3">
                              <label className="text-xs font-medium text-muted-foreground">Select Spa Finish (Crystite Crystal):</label>
                              <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
                                <CarouselContent className="-ml-1">
                                  {crystiteFinishes.map((finish) => (
                                    <CarouselItem key={finish.id} className="pl-1 basis-1/2">
                                      <div
                                        onClick={() => setExtras((prev) => ({ ...prev, spaFinish: finish.name, spaFinishPrice: finish.price }))}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.spaFinish === finish.name ? "border-primary bg-primary/10" : "border-border"}`}
                                      >
                                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                          <img src={finish.image} alt={finish.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between min-h-0">
                                          <p className="text-xs font-medium text-center line-clamp-2">{finish.name}</p>
                                          <p className="text-xs text-primary font-semibold text-center mt-1">+${finish.price.toLocaleString()}</p>
                                        </div>
                                      </div>
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-0 animate-pulse" />
                                <CarouselNext className="right-0 animate-pulse" />
                              </Carousel>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  );
                })()}

                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox checked={extras.tanningLedge} onCheckedChange={() => toggleExtra("tanningLedge")} />
                  <div className="flex items-center space-x-1">
                    <Sun size={16} className="text-coral" />
                    <span className="text-sm">
                      Add Tanning Ledge (+$
                      {extras.tanningLedge
                        ? (() => {
                            const selectedLedge = tanningLedges.find(
                              (ledge: any) => ledge.name === extras.tanningLedgeModel,
                            );
                            return selectedLedge ? selectedLedge.price.toLocaleString() : "0";
                          })()
                        : "0"}
                      )
                    </span>
                  </div>
                </label>

                {extras.tanningLedge && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Tanning Ledge Model:</label>
                    <Carousel className="w-full" opts={{ align: "start", loop: false, duration: 25 }}>
                      <CarouselContent className="-ml-1">
                        {tanningLedges.map((ledge: any) => (
                          <CarouselItem key={ledge.name} className="pl-1 basis-1/2">
                            <div
                              onClick={() => setExtras((prev) => ({ ...prev, tanningLedgeModel: ledge.name }))}
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.tanningLedgeModel === ledge.name ? "border-coral bg-coral/10" : "border-border"}`}
                            >
                              <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                <img src={ledge.image} alt={ledge.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex flex-col justify-between min-h-0">
                                <p className="text-xs font-medium text-center line-clamp-2">{ledge.name}</p>
                                <p className="text-xs text-coral font-semibold text-center mt-1">${ledge.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-0 animate-pulse" />
                      <CarouselNext className="right-0 animate-pulse" />
                    </Carousel>
                  </div>
                )}

                {/* Pool Tiles */}
                <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox checked={extras.tiles} onCheckedChange={() => toggleExtra("tiles")} />
                  <div className="flex items-center space-x-1">
                    <Cpu size={16} className="text-primary" />
                    <span className="text-sm">
                      Add Pool Tiles (+$
                      {extras.tiles
                        ? (() => {
                            const selectedTile = tileOptions.find((tile) => tile.name === extras.tileOption);
                            return selectedTile && selectedTile.price > 0 ? selectedTile.price.toLocaleString() : "0";
                          })()
                        : "0"}
                      )
                    </span>
                  </div>
                </label>

                {extras.tiles && (
                  <div className="ml-6 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Select Tile Option:</label>
                    <Carousel 
                      className="w-full"
                      opts={{
                        align: "start",
                        loop: false,
                        duration: 25,
                      }}
                    >
                      <CarouselContent className="-ml-1">
                        {tileOptions.map((tile) => (
                          <CarouselItem key={tile.name} className="pl-1 basis-1/2">
                            <div
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.tileOption === tile.name ? "border-primary bg-primary/10" : "border-border"}`}
                              onClick={() =>
                                setExtras((prev) => ({
                                  ...prev,
                                  tileOption: tile.name,
                                }))
                              }
                            >
                              <div 
                                className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-primary transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImagePopup({
                                    isOpen: true,
                                    imageSrc: tile.image,
                                    name: tile.name,
                                    price: tile.price,
                                    description: tile.description,
                                  });
                                }}
                              >
                                <OptimizedImage
                                  src={tile.image}
                                  alt={tile.name}
                                  className="w-full h-full object-cover"
                                  sizeConfig="thumbnail"
                                />
                              </div>
                              <div className="flex-1 flex flex-col justify-between min-h-0">
                                <p className="text-xs font-medium text-center line-clamp-2">{tile.name}</p>
                                {tile.price > 0 && (
                                  <p className="text-xs text-primary font-semibold text-center mt-1">
                                    +${tile.price.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                        <CarouselPrevious className="left-0 animate-pulse" />
                        <CarouselNext className="right-0 animate-pulse" />
                    </Carousel>
                  </div>
                )}
              </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Carbon Fiber Technology Section */}
            {pool.carbonFiber && (
              <AccordionItem value="carbon" className="border rounded-lg px-3 bg-gradient-to-r from-primary/5 to-teal/5 border-primary/20">
                <AccordionTrigger className="hover:no-underline py-3">
                  <span className="font-semibold text-foreground flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    Carbon Fiber Technology
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Our advanced carbon fiber construction provides superior strength, durability, and longevity. This
                      cutting-edge technology ensures your pool maintains its structural integrity for decades while
                      offering unmatched resistance to cracking and fading.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• 300% stronger than traditional fiberglass</li>
                      <li>• Superior thermal retention</li>
                      <li>• UV-resistant surface coating</li>
                      <li>• Lifetime structural warranty</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            </Accordion>


            {/* Sauna section moved above - now rendered after Rocky Waterfalls */}

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    // Create detailed extras breakdown for quote tool
                    const extrasBreakdown = [];

                    // Add finish if not default
                    const selectedFinish = finishOptions.find((finish) => finish.name === extras.finish);
                    if (selectedFinish && selectedFinish.price > 0) {
                      extrasBreakdown.push({
                        name: `${selectedFinish.name} Finish`,
                        price: selectedFinish.price,
                        image: selectedFinish.image,
                      });
                    }

                    // Add heater if selected
                    if (extras.heater) {
                      const selectedHeater = poolHeaters.find((heater) => heater.name === extras.heaterModel);
                      if (selectedHeater) {
                        extrasBreakdown.push({
                          name: selectedHeater.name,
                          price: selectedHeater.price,
                          image: "/lovable-uploads/34a72b4b-56fe-42f6-b7cc-5ace54914636.png",
                        });
                      }
                    }

                    // Add cover if selected
                    const coverOption = coverOptions.find((option) => option.name === extras.coverOption);
                    if (coverOption && extras.cover && coverOption.name !== "NO COVER") {
                      extrasBreakdown.push({
                        name: coverOption.name,
                        price: coverOption.price,
                        image: coverOption.image,
                      });
                    }

                    // Add jets if selected
                    if (extras.jets) {
                      extrasBreakdown.push({
                        name: `Spa Jets (${extras.jetQuantity})`,
                        price: getExtraPrice("jets") * extras.jetQuantity,
                        image: "/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png",
                      });
                    }

                    // Add tiles if selected
                    const tileOption = tileOptions.find((option) => option.name === extras.tileOption);
                    if (tileOption && extras.tiles) {
                      extrasBreakdown.push({
                        name: tileOption.name,
                        price: tileOption.price,
                        image: tileOption.image,
                      });
                    }

                    // Add liner if selected (always $4500 for premium liners)
                    const linerOption = linerOptions.find((option) => option.name === extras.linerOption);
                    if (linerOption && extras.linerOption !== "Standard Blue") {
                      extrasBreakdown.push({
                        name: `${linerOption.name} Liner`,
                        price: 4500,
                        // Fixed price for any premium liner
                        image: linerOption.image,
                      });
                    }

                    // Add paver surface area cost using centralized pricing utility
                    if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
                      const paverName = extras.paverOption || "Concrete Deck";
                      const pricePerSqFt = getPaverPricePerSqFt(paverName);
                      const selectedPaver = paverOptions.find((p) => p.name === paverName);
                      extrasBreakdown.push({
                        name: `${paverName} (${paverSurfaceArea} sq ft @ $${pricePerSqFt}/sq ft)`,
                        price: calculatePaverCost(paverSurfaceArea, paverName),
                        image: selectedPaver?.image,
                      });
                    }

                    // Add spa if selected
                    if (extras.spa) {
                      const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
                      if (selectedSpa) {
                        extrasBreakdown.push({
                          name: `${selectedSpa.model} Spa`,
                          price: selectedSpa.price,
                          image: selectedSpa.image,
                        });
                      }
                    }

                    // Add tanning ledge if selected
                    if (extras.tanningLedge) {
                      const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
                      if (selectedLedge) {
                        extrasBreakdown.push({
                          name: `${selectedLedge.name} Tanning Ledge`,
                          price: selectedLedge.price,
                          image: selectedLedge.image,
                        });
                      }
                    }

                    // Add screen enclosure if area provided
                    if (extras.screenEnclosureArea > 0) {
                      const quality = (extras.screenEnclosureQuality as 'standard' | 'premium') || 'standard';
                      const pricePerSqFt = SCREEN_ENCLOSURE_PRICING[quality] || SCREEN_ENCLOSURE_PRICING.standard;
                      const enclosurePrice = extras.screenEnclosureArea * pricePerSqFt;
                      extrasBreakdown.push({
                        name: `Screen Enclosure - ${quality === "standard" ? "Wonder Cage" : "Premium"} (${extras.screenEnclosureArea} sq ft)`,
                        price: enclosurePrice,
                        image: "/lovable-uploads/8bf11ea9-c402-4834-a163-0876545498bd.png",
                      });
                    }

                    // Add concrete construction if selected
                    if (extras.concreteConstruction) {
                      const concreteMarkup = Math.round(getPoolPrice(pool) * 0.2);
                      extrasBreakdown.push({
                        name: "Concrete Construction",
                        price: concreteMarkup,
                        image: "/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png",
                      });
                    }
                    
                    // Add Rocky Waterfalls if selected
                    if (extras.rockyWaterfalls) {
                      const waterfallType = rockyWaterfallsTypes.find(t => t.name === extras.rockyWaterfallsType);
                      extrasBreakdown.push({
                        name: `Rocky Waterfalls - ${extras.rockyWaterfallsType}: ${extras.rockyWaterfallsColor}`,
                        price: waterfallType?.price || 17500,
                        image: waterfallType?.image,
                      });
                    }

                    // Add Artificial Grass if selected
                    if (extras.artificialGrass && extras.artificialGrassArea && !isNaN(parseFloat(extras.artificialGrassArea))) {
                      const grassArea = parseFloat(extras.artificialGrassArea);
                      const grassImg = artificialGrassOptions.find(o => o.name === extras.artificialGrassColor)?.image;
                      extrasBreakdown.push({
                        name: `Artificial Grass - ${extras.artificialGrassColor} (${grassArea} sq ft)`,
                        price: grassArea * ARTIFICIAL_GRASS_PRICE_PER_SQFT,
                        image: grassImg,
                      });
                    }
                    const extrasTotal = extrasBreakdown.reduce((sum, item) => sum + item.price, 0);
                    onRequestQuote(pool, {
                      ...extras,
                      extrasBreakdown,
                      extrasTotal,
                      deliveryTime: extras.concreteConstruction ? "18+ weeks" : "8+ weeks",
                      // Add delivery time based on concrete construction
                      concretePoolDescription:
                        pool.model === "Pacific Ridge"
                          ? "This is a premium concrete pool featuring reinforced construction, superior durability, and custom design flexibility."
                          : undefined,
                    });
                  }}
                  className="flex-1 instant-quote-btn transition-all duration-300"
                  size="sm"
                >
                  Instant Quote
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddToCart} variant="outline" size="icon" className="w-10 h-10">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
                <StripeCheckoutButton
                  productId={`pool_${pool.model.replace(/\s+/g, "_")}`}
                  productName={pool.model}
                  price={calculateTotalPrice()}
                  variant="gradient"
                  className="flex-1 hover:scale-105 transition-all duration-300"
                  size="sm"
                  showFinancingOptions={false}
                />
              </div>
            </div>

            {/* Final Price Display */}
            <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-teal/10 rounded-lg border border-primary/30">
              <div className="text-center">
                <h5 className="text-sm font-medium text-muted-foreground">Total Configuration Price</h5>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground line-through">
                    $
                    {(() => {
                      // Calculate original price before discount
                      let originalTotal = pool.price; // Original pool price before discount
                      if (extras.concreteConstruction) originalTotal = originalTotal * 1.2;

                      // Add all extras to original price
                      const selectedFinish = finishOptions.find((finish) => finish.name === extras.finish);
                      if (selectedFinish && selectedFinish.price) originalTotal += selectedFinish.price;
                      if (extras.heater) {
                        const selectedHeater = poolHeaters.find((heater) => heater.name === extras.heaterModel);
                        if (selectedHeater) originalTotal += selectedHeater.price;
                      }
                      if (extras.jets) originalTotal += getExtraPrice("jets") * extras.jetQuantity;
                      const linerOption = linerOptions.find((option) => option.name === extras.linerOption);
                      if (linerOption && extras.linerOption !== "Standard Blue") originalTotal += 4500;
                      const tileOption = tileOptions.find((option) => option.name === extras.tileOption);
                      if (tileOption && extras.tiles) originalTotal += tileOption.price;
                      const coverOption = coverOptions.find((option) => option.name === extras.coverOption);
                      if (coverOption && extras.cover && coverOption.name !== "NO COVER")
                        originalTotal += coverOption.price;
                      const paverOption = paverOptions.find((option) => option.name === extras.paverOption);
                      if (paverOption) originalTotal += paverOption.price;
                      if (paverSurfaceArea && !isNaN(parseFloat(paverSurfaceArea))) {
                        originalTotal += calculatePaverCost(paverSurfaceArea, extras.paverOption);
                      }
                      if (extras.spa) {
                        const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
                        if (selectedSpa) originalTotal += selectedSpa.price;
                      }
                      if (extras.tanningLedge) {
                        const selectedLedge = tanningLedges.find(
                          (ledge: any) => ledge.name === extras.tanningLedgeModel,
                        );
                        if (selectedLedge) originalTotal += selectedLedge.price;
                      }
                      if (extras.screenEnclosureArea > 0) {
                        const pricePerSqFt = SCREEN_ENCLOSURE_PRICING[extras.screenEnclosureQuality as keyof typeof SCREEN_ENCLOSURE_PRICING] ?? SCREEN_ENCLOSURE_PRICING.standard;
                        originalTotal += extras.screenEnclosureArea * pricePerSqFt;
                      }
                      // Apply project type multiplier
                      return Math.round(originalTotal * priceMultiplier).toLocaleString();
                    })()}
                  </div>
                  <div className="text-2xl font-bold text-foreground">${calculateTotalPrice().toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Bottom Dashboard - Integrated Financing */}
            <FinancingOptions 
              totalPrice={calculateTotalPrice()}
              productName={pool.model}
            />
          </div>
        )}

        {/* Finish Carousel - Always Visible */}
        {!showDetails && (
          <div className="space-y-3">
            <div 
              className="space-y-2"
              onMouseEnter={() => setShowDetails(true)}
              onTouchStart={() => setShowDetails(true)}
            >
              <h4 className="font-semibold text-foreground text-sm">Pool Finishes</h4>
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
                      key={`pool-preview-${finish.name}-${idx}`}
                      className="pl-1 basis-1/2"
                    >
                      <div
                        className={`p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${extras.finish === finish.name ? "border-primary bg-primary/10" : "border-border"}`}
                        onClick={() => {
                          setExtras((prev) => ({
                            ...prev,
                            finish: finish.name,
                          }));
                          setShowDetails(true);
                        }}
                      >
                        <div className="w-full h-12 rounded-md mb-1 overflow-hidden flex-shrink-0">
                          <OptimizedImage
                            src={finish.image}
                            alt={finish.name}
                            className="w-full h-full object-cover"
                            sizeConfig="thumbnail"
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
              className="flex flex-col items-center cursor-pointer py-2 hover:bg-muted/50 rounded-lg transition-all group"
              onClick={() => setShowDetails(true)}
              onMouseEnter={() => setShowDetails(true)}
            >
              <span className="text-xs text-muted-foreground mb-1">View all options</span>
              <svg 
                className="w-5 h-5 text-primary animate-bounce group-hover:text-primary/80 transition-colors" 
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
      <ImageEditor
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        onImageSave={handleImageSave}
        currentImage={currentPoolImage}
      />

      {/* Quote Tool Modal */}
      <SurveyQuoteTool pool={pool} isOpen={showQuoteTool} onClose={() => setShowQuoteTool(false)} extras={extras} />

      {/* Product Image Popup Modal */}
      <ProductImageModal
        isOpen={imagePopup.isOpen}
        onClose={() => setImagePopup({ ...imagePopup, isOpen: false })}
        imageSrc={imagePopup.imageSrc}
        productName={imagePopup.name}
        productPrice={imagePopup.price}
        productDescription={imagePopup.description}
      />
    </Card>
  );
};
export default PoolProductCard;
