
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { DollarSign, ShoppingCart, Edit, ChevronLeft, ChevronRight, Clock, Shield, Loader2, ChevronDown, Plus, Minus } from "lucide-react";
import { useShoppingCart } from "./ShoppingCart";
import { openQuotePreview } from "@/utils/quoteNavigation";
import { spas } from "@/data/spaData";
import { tanningLedges } from "@/data/poolData";

// Pool image mapping with exact pool model names
const poolImages: Record<string, string> = {
  // Premium Pools
  "Tuscan 11'2\" x 20'": "/lovable-uploads/d5e74c29-95f6-4a9a-9395-a98fe4efdadd.png",
  "Tuscan 13'2\" x 24'": "/lovable-uploads/d1c952c1-8786-444d-b405-903533bc20d1.png",
  "Tuscan 14'2\" x 27'": "/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png",
  "Corinthian": "/lovable-uploads/8228c334-6fd7-4b29-afae-98628493480d.png",
  "Ariel 16": "/lovable-uploads/2af253b1-b9be-487f-a998-476d396772c4.png",
  "Coral 16": "/lovable-uploads/96f46291-85e7-4b48-9465-623400a8e835.png",
  
  // Deluxe Pools
  "Laguna Bay": "/lovable-uploads/6b7b34a3-03f7-4179-b34a-3458dc881efd.png",
  "Bay Isle": "/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.png",
  "St. Lucia": "/lovable-uploads/c4b386e8-679d-4ea3-be08-9b8fb9e8d50e.png",
  "Jamaica": "/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png",
  "Apollo 14": "/lovable-uploads/390cf824-aed3-4f60-9fc3-f3910c0ffe44.png",
  
  // Standard Pools
  "Valencia": "/lovable-uploads/d707c6e1-8471-404f-9312-bd6773152617.png",
  "Genesis": "/lovable-uploads/3ae37221-0f97-48df-addd-632c423868e2.png",
  "Cape Cod": "/lovable-uploads/311a7002-2a40-4c59-a143-9f0236ece5d4.png",
  "Astoria": "/lovable-uploads/31da0c59-77d4-4fa1-838b-cb525acd404b.png",
  
  // Compact Pools
  "Enchantment 9'1\" x 17'": "/lovable-uploads/57670513-84aa-4ae5-86ee-6a95737004b5.png",
  "Enchantment 9'2\" x 21'": "/lovable-uploads/15032ed4-f745-4152-ae9b-c26fdb52f68c.png",
  "Enchantment 9'2\" x 24'": "/lovable-uploads/58cf10b7-a125-4e4f-be0b-6a0deb095bac.png"
};

// Pool Tiles with proper images
const poolTiles = [
  { name: "Standard Waterline", image: "/lovable-uploads/7cfaa1c7-7fe8-472a-bf41-4d1973510a5a.png", price: 0 },
  { name: "Mountain", image: "/lovable-uploads/65b3331a-e988-4fbb-a9b2-d73d1b94ae79.png", price: 800 },
  { name: "Carnegie", image: "/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png", price: 1200 },
  { name: "Panama", image: "/lovable-uploads/797bcadb-19bc-4859-8319-ceb12ea23d10.png", price: 1500 }
];

// Pool Finishes with proper images  
const poolFinishes = [
  { name: "Sapphire Blue", type: "Crystite Crystal", image: "/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png", price: 3500 },
  { name: "Ocean Blue", type: "Crystite Crystal", image: "/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png", price: 3500 },
  { name: "Night Sky", type: "Crystite Crystal", image: "/lovable-uploads/7cfaa1c7-7fe8-472a-bf41-4d1973510a5a.png", price: 3500 },
  { name: "Shale Gray", type: "Crystite Crystal", image: "/lovable-uploads/65b3331a-e988-4fbb-a9b2-d73d1b94ae79.png", price: 3500 }
];

// Premium Liners with updated pricing
const premiumLiners = [
  { name: "Standard Blue", type: "", image: "/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png", price: 0 },
  { name: "Paradise", type: "Glass", image: "/lovable-uploads/797bcadb-19bc-4859-8319-ceb12ea23d10.png", price: 3800 },
  { name: "Water Lilies", type: "Glass", image: "/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png", price: 3800 },
  { name: "Sail Boat", type: "Glass", image: "/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png", price: 3800 }
];

// Cover Options with proper images
const coverOptions = [
  { name: "NO COVER", image: "/lovable-uploads/7cfaa1c7-7fe8-472a-bf41-4d1973510a5a.png", price: 0 },
  { name: "Eclipse Automatic", image: "/lovable-uploads/65b3331a-e988-4fbb-a9b2-d73d1b94ae79.png", price: 16000 },
  { name: "CS3000 Safety", image: "/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png", price: 24000 },
  { name: "Infinity 4000", image: "/lovable-uploads/797bcadb-19bc-4859-8319-ceb12ea23d10.png", price: 32000 }
];

// Heater options
const heaterOptions = [
  { name: "No Heater", image: "/lovable-uploads/7cfaa1c7-7fe8-472a-bf41-4d1973510a5a.png", price: 0 },
  { name: "Gas Heater 250K BTU", image: "/lovable-uploads/65b3331a-e988-4fbb-a9b2-d73d1b94ae79.png", price: 3800 },
  { name: "Electric Heat Pump", image: "/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png", price: 4500 },
  { name: "Solar Heater System", image: "/lovable-uploads/797bcadb-19bc-4859-8319-ceb12ea23d10.png", price: 6200 }
];

export interface Pool {
  id?: string;
  model: string;
  price: number;
  dimensions?: string;
  depth?: string;
  category?: 'budget' | 'premium' | 'luxury' | 'deluxe' | 'standard' | 'compact';
  image?: string;
  features?: string[];
  description?: string;
  gallons?: number;
  shape?: string;
  material?: string;
  warranty?: string;
  installation?: string;
  maintenance?: string;
  warrantyYears?: number | string;
  finishes?: string[];
  liners?: string[];
  covers?: string[];
  heater?: boolean;
  salt_system?: boolean;
  carbon_fiber?: boolean;
}

interface PoolProductCardProps {
  pool: Pool;
  onAddToCart?: (pool: Pool) => void;
  isAdmin?: boolean;
  onViewDetails?: (pool: Pool) => void;
  onRequestQuote?: (pool: Pool) => void;
}

const PoolProductCard = ({ pool, onAddToCart, isAdmin, onViewDetails, onRequestQuote }: PoolProductCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTile, setSelectedTile] = useState(poolTiles[0]);
  const [selectedFinish, setSelectedFinish] = useState(poolFinishes[0]);
  const [selectedLiner, setSelectedLiner] = useState(premiumLiners[0]);
  const [selectedCover, setSelectedCover] = useState(coverOptions[0]);
  const [selectedHeater, setSelectedHeater] = useState(heaterOptions[0]);
  const [selectedSpa, setSelectedSpa] = useState<any>(null);
  const [selectedTanningLedge, setSelectedTanningLedge] = useState<any>(null);
  const [spaJetsCount, setSpaJetsCount] = useState(0);
  const [paverArea, setPaverArea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFinanceDropdown, setShowFinanceDropdown] = useState(false);
  
  const { addToCart } = useShoppingCart();

  // Get correct pool image with exact matching
  const getPoolImage = (poolModel: string) => {
    const image = poolImages[poolModel];
    if (image) return image;
    
    // Fallback to category-based image
    const fallbackImages = {
      premium: "/lovable-uploads/d5e74c29-95f6-4a9a-9395-a98fe4efdadd.png",
      deluxe: "/lovable-uploads/6b7b34a3-03f7-4179-b34a-3458dc881efd.png", 
      standard: "/lovable-uploads/d707c6e1-8471-404f-9312-bd6773152617.png",
      compact: "/lovable-uploads/57670513-84aa-4ae5-86ee-6a95737004b5.png"
    };
    
    return fallbackImages[pool.category as keyof typeof fallbackImages] || "/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png";
  };

  const calculateTotal = () => {
    const tilePrice = selectedTile.price || 0;
    const finishPrice = selectedFinish.price || 0;
    const linerPrice = selectedLiner.price || 0;
    const coverPrice = selectedCover.price || 0;
    const heaterPrice = selectedHeater.price || 0;
    const spaPrice = selectedSpa ? selectedSpa.price : 0;
    const tanningLedgePrice = selectedTanningLedge ? selectedTanningLedge.price : 0;
    const spaJetsPrice = spaJetsCount * 1800; // Updated to $1800 per spa jet
    
    // Add paver cost: surface area × $15/sq ft
    let paverCost = 0;
    if (paverArea && !isNaN(parseFloat(paverArea))) {
      paverCost = parseFloat(paverArea) * 15;
    }
    
    return pool.price + tilePrice + finishPrice + linerPrice + coverPrice + heaterPrice + spaPrice + tanningLedgePrice + spaJetsPrice + paverCost;
  };

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      const total = calculateTotal();
      addToCart({
        id: `pool_${pool.model.replace(/\s+/g, '_')}_${Date.now()}`,
        name: pool.model,
        price: total,
        category: 'pool',
        image: getPoolImage(pool.model)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetQuote = async () => {
    try {
      setIsLoading(true);
      console.log('Generating quote for pool:', pool);
      
      const quoteData = {
        type: 'pool' as const,
        pool: {
          ...pool,
          selectedOptions: {
            tile: selectedTile,
            finish: selectedFinish,
            liner: selectedLiner,
            cover: selectedCover,
            heater: selectedHeater,
            spa: selectedSpa,
            tanningLedge: selectedTanningLedge,
            spaJets: spaJetsCount,
            paverArea: paverArea,
            paverCost: paverArea && !isNaN(parseFloat(paverArea)) ? parseFloat(paverArea) * 15 : 0
          },
          totalPrice: calculateTotal()
        }
      };

      console.log('Quote data being sent:', quoteData);
      openQuotePreview(quoteData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpandEditor = () => {
    // This would open the editor studio - placeholder for now
    console.log('Opening Editor Studio for:', pool.model);
    // Future implementation: open editor studio modal or navigate to editor
  };

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
    if (onViewDetails) {
      onViewDetails(pool);
    }
  };

  const calculateMonthlyPayment = (totalAmount: number, months: number = 60) => {
    // Simple calculation assuming 8% APR
    const apr = 0.08;
    const monthlyRate = apr / 12;
    const payment = (totalAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
      <div className="relative">
        <div className="aspect-video bg-gray-100">
          <img
            src={getPoolImage(pool.model)}
            alt={pool.model}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log(`Failed to load image for ${pool.model}:`, e);
              e.currentTarget.src = "/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png";
            }}
          />
        </div>
        
        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-pink-400 to-orange-400 text-white font-medium capitalize">
          {pool.category || 'Standard'}
        </Badge>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{pool.model}</h3>
          <div className="flex items-center gap-2 mt-1">
            <DollarSign className="h-4 w-4 text-teal-500" />
            <span className="text-xl font-bold text-gray-900">
              ${calculateTotal().toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-teal-600">
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
            <span><strong>Includes:</strong> LED lights, Water pump, Waterfall, Salt system</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span><strong>FREE Finish:</strong> Premium finish included (promotional offer)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span><strong>Perimeter:</strong> 3 ft pavers around pool area included</span>
          </div>
        </div>

        {pool.dimensions && (
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>Dimensions:</strong> {pool.dimensions}</div>
            <div><strong>Depth:</strong> {pool.depth}</div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span><strong>Installation:</strong> Complete installation with permits and excavation</span>
            </div>
            <div className="flex items-center gap-1 text-blue-500">
              <Shield className="h-3 w-3" />
              <span className="font-medium"><strong>Warranty:</strong> LIFETIME WARRANTY</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleExpandEditor}
              disabled={isLoading}
            >
              <Edit className="h-4 w-4 mr-1" />
              Expand
            </Button>
          )}
          <Button 
            onClick={handleViewDetails}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            View Details
          </Button>
        </div>

        {/* Expanded Details Section */}
        {showDetails && (
          <div className="space-y-6 pt-4 border-t animate-in slide-in-from-top-2 duration-300">
            {/* Pool Tiles Section - Fixed Carousel */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Pool Tiles</h3>
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {poolTiles.map((tile, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 p-2 border-2 rounded-lg cursor-pointer text-center ${
                        selectedTile.name === tile.name ? 'border-teal-500' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedTile(tile)}
                    >
                      <img src={tile.image} alt={tile.name} className="w-16 h-16 object-cover rounded mx-auto" />
                      <div className="text-xs mt-1 w-16">
                        <div className="font-medium text-gray-800">{tile.name}</div>
                        {tile.price > 0 && <div className="text-teal-500">+${tile.price.toLocaleString()}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pool Finishes Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Pool Finishes</h3>
              <div className="grid grid-cols-4 gap-2">
                {poolFinishes.map((finish, index) => (
                  <div
                    key={index}
                    className={`p-2 border-2 rounded-lg cursor-pointer text-center ${
                      selectedFinish.name === finish.name ? 'border-teal-500' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedFinish(finish)}
                  >
                    <img src={finish.image} alt={finish.name} className="w-full h-12 object-cover rounded mb-1" />
                    <div className="text-xs">
                      <div className="font-medium text-gray-800">{finish.name}</div>
                      <div className="text-blue-500">{finish.type}</div>
                      <div className="text-teal-500">+${finish.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Pool Liners Section - Fixed Carousel */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Premium Pool Liners</h3>
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {premiumLiners.map((liner, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 p-2 border-2 rounded-lg cursor-pointer text-center ${
                        selectedLiner.name === liner.name ? 'border-teal-500' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedLiner(liner)}
                    >
                      <img src={liner.image} alt={liner.name} className="w-20 h-16 object-cover rounded mx-auto" />
                      <div className="text-xs mt-1 w-20">
                        <div className="font-medium text-gray-800">{liner.name}</div>
                        {liner.type && <div className="text-blue-500">{liner.type}</div>}
                        {liner.price > 0 && <div className="text-teal-500">+${liner.price.toLocaleString()}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cover Options Section - Fixed Carousel */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Cover Options</h3>
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {coverOptions.map((cover, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 p-2 border-2 rounded-lg cursor-pointer text-center ${
                        selectedCover.name === cover.name ? 'border-teal-500' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedCover(cover)}
                    >
                      <img src={cover.image} alt={cover.name} className="w-20 h-16 object-cover rounded mx-auto" />
                      <div className="text-xs mt-1 w-20">
                        <div className="font-medium text-gray-800">{cover.name}</div>
                        {cover.price > 0 && <div className="text-teal-500">+${cover.price.toLocaleString()}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Features Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Additional Features</h3>
              <div className="space-y-3">
                {/* Pool Heater Dropdown */}
                <div className="p-3 border rounded-lg">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span>Pool Heater: {selectedHeater.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-white border shadow-lg z-50">
                      {heaterOptions.map((heater, index) => (
                        <DropdownMenuItem 
                          key={index}
                          onClick={() => setSelectedHeater(heater)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50"
                        >
                          <img src={heater.image} alt={heater.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <div className="font-medium">{heater.name}</div>
                            {heater.price > 0 && <div className="text-sm text-teal-500">+${heater.price.toLocaleString()}</div>}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Spa Dropdown */}
                <div className="p-3 border rounded-lg">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span>Add Spa: {selectedSpa ? selectedSpa.model : "No Spa"}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-white border shadow-lg z-50">
                      <DropdownMenuItem 
                        onClick={() => setSelectedSpa(null)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs">No Spa</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">No Spa</div>
                          <div className="text-sm text-gray-500">$0</div>
                        </div>
                      </DropdownMenuItem>
                      {spas.map((spa, index) => (
                        <DropdownMenuItem 
                          key={index}
                          onClick={() => setSelectedSpa(spa)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50"
                        >
                          <img src={spa.image} alt={spa.model} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <div className="font-medium">{spa.model}</div>
                            <div className="text-sm text-teal-500">+${spa.price.toLocaleString()}</div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Tanning Ledge Dropdown */}
                <div className="p-3 border rounded-lg">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span>Add Tanning Ledge: {selectedTanningLedge ? selectedTanningLedge.name : "No Tanning Ledge"}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-white border shadow-lg z-50">
                      <DropdownMenuItem 
                        onClick={() => setSelectedTanningLedge(null)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs">None</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">No Tanning Ledge</div>
                          <div className="text-sm text-gray-500">$0</div>
                        </div>
                      </DropdownMenuItem>
                      {tanningLedges.map((ledge, index) => (
                        <DropdownMenuItem 
                          key={index}
                          onClick={() => setSelectedTanningLedge(ledge)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50"
                        >
                          <img src={ledge.image} alt={ledge.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <div className="font-medium">{ledge.name} Tanning Ledge</div>
                            <div className="text-sm text-teal-500">+${ledge.price.toLocaleString()}</div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Spa Jets Counter */}
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Spa Jets</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSpaJetsCount(Math.max(0, spaJetsCount - 1))}
                        disabled={spaJetsCount === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{spaJetsCount}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSpaJetsCount(spaJetsCount + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-600">×${1800} = ${(spaJetsCount * 1800).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pavers Calculator */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Pavers & Surface Area Calculator</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Paver Surface Area (sq ft)</label>
                  <Input
                    type="number"
                    placeholder="Enter surface area for pavers"
                    value={paverArea}
                    onChange={(e) => setPaverArea(e.target.value)}
                    className="mt-1"
                  />
                  {paverArea && !isNaN(parseFloat(paverArea)) && (
                    <div className="text-sm text-green-600 mt-1">
                      Paver Cost: ${(parseFloat(paverArea) * 15).toLocaleString()} ({paverArea} sq ft × $15/sq ft)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleAddToCart}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
                <Button 
                  onClick={handleGetQuote}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Instant Quote - ${calculateTotal().toLocaleString()}
                </Button>
              </div>

              {/* Finance Section */}
              <div>
                <DropdownMenu open={showFinanceDropdown} onOpenChange={setShowFinanceDropdown}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span>Finance This Purchase</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full bg-white border shadow-lg z-50 p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">60-Month Financing Options</h4>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className="text-center p-3 border rounded">
                          <div className="font-semibold">60 Months @ 8% APR</div>
                          <div className="text-lg text-teal-600">
                            ${calculateMonthlyPayment(calculateTotal(), 60).toLocaleString()}/month
                          </div>
                          <div className="text-xs text-gray-500">*Subject to credit approval</div>
                        </div>
                      </div>

                      <Button 
                        onClick={() => {
                          const total = calculateTotal();
                          const financeUrl = `https://apply.lyonfinancial.net/apply?partner_id=wonderlands&amount=${total}&product=pool`;
                          window.open(financeUrl, '_blank');
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isLoading}
                      >
                        Apply with Lyon Financial
                      </Button>
                      
                      <p className="text-xs text-gray-500 text-center">
                        *Financing subject to credit approval. APR varies based on creditworthiness.
                      </p>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PoolProductCard;
