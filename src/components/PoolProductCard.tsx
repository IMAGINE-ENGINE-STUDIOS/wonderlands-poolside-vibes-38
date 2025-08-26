
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, ShoppingCart, Edit, ChevronLeft, ChevronRight, Clock, Shield, Loader2 } from "lucide-react";
import { useShoppingCart } from "./ShoppingCart";
import { openQuotePreview } from "@/utils/quoteNavigation";

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

// Premium Liners with proper images
const premiumLiners = [
  { name: "Standard Blue", type: "", image: "/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png", price: 0 },
  { name: "Paradise", type: "Glass", image: "/lovable-uploads/797bcadb-19bc-4859-8319-ceb12ea23d10.png", price: 4500 },
  { name: "Water Lilies", type: "Glass", image: "/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png", price: 4500 },
  { name: "Sail Boat", type: "Glass", image: "/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png", price: 4500 }
];

// Cover Options with proper images
const coverOptions = [
  { name: "NO COVER", image: "/lovable-uploads/7cfaa1c7-7fe8-472a-bf41-4d1973510a5a.png", price: 0 },
  { name: "Eclipse Automatic", image: "/lovable-uploads/65b3331a-e988-4fbb-a9b2-d73d1b94ae79.png", price: 16000 },
  { name: "CS3000 Safety", image: "/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png", price: 24000 },
  { name: "Infinity 4000", image: "/lovable-uploads/797bcadb-19bc-4859-8319-ceb12ea23d10.png", price: 32000 }
];

// Additional Features
const additionalFeatures = [
  { name: "Add Pool Heater", price: 3800, checked: false },
  { name: "Spa Jets", price: 1800, checked: false },
  { name: "Add Spa", price: 18200, checked: false },
  { name: "Add Tanning Ledge", price: 28600, checked: false }
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
  const [features, setFeatures] = useState(additionalFeatures);
  const [paverArea, setPaverArea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
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
    const featuresPrice = features.reduce((sum, feature) => sum + (feature.checked ? feature.price : 0), 0);
    
    // Add paver cost: surface area × $15/sq ft
    let paverCost = 0;
    if (paverArea && !isNaN(parseFloat(paverArea))) {
      paverCost = parseFloat(paverArea) * 15;
    }
    
    return pool.price + tilePrice + finishPrice + linerPrice + coverPrice + featuresPrice + paverCost;
  };

  const handleFeatureToggle = (index: number) => {
    setFeatures(prev => prev.map((feature, i) => 
      i === index ? { ...feature, checked: !feature.checked } : feature
    ));
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
            features: features.filter(f => f.checked),
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

  const handleLyonFinance = () => {
    const total = calculateTotal();
    const financeUrl = `https://apply.lyonfinancial.net/apply?partner_id=wonderlands&amount=${total}&product=pool`;
    window.open(financeUrl, '_blank');
  };

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
    if (onViewDetails) {
      onViewDetails(pool);
    }
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
            <span>LED lights, Water pump, Waterfall, Salt system included</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>FREE Finish of choice (included in pool price - promotional offer)</span>
          </div>
        </div>

        {pool.dimensions && (
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>Dimensions:</strong> {pool.dimensions}</div>
            <div><strong>Depth:</strong> {pool.depth}</div>
            <div><strong>Includes:</strong> 3 ft perimeter pavers around pool area</div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span><strong>Installation:</strong> Complete installation including permits, excavation, and all selected features</span>
            </div>
            <div className="flex items-center gap-1 text-blue-500">
              <Shield className="h-3 w-3" />
              <span className="font-medium"><strong>Warranty:</strong> LIFETIME WARRANTY</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isAdmin && (
            <Button variant="outline" size="sm" className="flex-1" disabled={isLoading}>
              <Edit className="h-4 w-4 mr-1" />
              Editor Studio
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
            {/* Pool Tiles Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Pool Tiles</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <ChevronLeft className="h-5 w-5 text-gray-400 flex-shrink-0 mt-8" />
                {poolTiles.map((tile, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 p-2 border-2 rounded-lg cursor-pointer ${
                      selectedTile.name === tile.name ? 'border-teal-500' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedTile(tile)}
                  >
                    <img src={tile.image} alt={tile.name} className="w-16 h-16 object-cover rounded" />
                    <div className="text-xs text-center mt-1 w-16">
                      <div className="font-medium">{tile.name}</div>
                      {tile.price > 0 && <div className="text-teal-500">+${tile.price.toLocaleString()}</div>}
                    </div>
                  </div>
                ))}
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-8" />
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
                      <div className="font-medium">{finish.name}</div>
                      <div className="text-blue-500">{finish.type}</div>
                      <div className="text-teal-500">+${finish.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Pool Liners Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Premium Pool Liners</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <ChevronLeft className="h-5 w-5 text-gray-400 flex-shrink-0 mt-8" />
                {premiumLiners.map((liner, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 p-2 border-2 rounded-lg cursor-pointer ${
                      selectedLiner.name === liner.name ? 'border-teal-500' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedLiner(liner)}
                  >
                    <img src={liner.image} alt={liner.name} className="w-20 h-16 object-cover rounded" />
                    <div className="text-xs text-center mt-1 w-20">
                      <div className="font-medium">{liner.name}</div>
                      {liner.type && <div className="text-blue-500">{liner.type}</div>}
                      {liner.price > 0 && <div className="text-teal-500">+${liner.price.toLocaleString()}</div>}
                    </div>
                  </div>
                ))}
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-8" />
              </div>
            </div>

            {/* Cover Options Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Cover Options</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <ChevronLeft className="h-5 w-5 text-gray-400 flex-shrink-0 mt-8" />
                {coverOptions.map((cover, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 p-2 border-2 rounded-lg cursor-pointer ${
                      selectedCover.name === cover.name ? 'border-teal-500' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedCover(cover)}
                  >
                    <img src={cover.image} alt={cover.name} className="w-20 h-16 object-cover rounded" />
                    <div className="text-xs text-center mt-1 w-20">
                      <div className="font-medium">{cover.name}</div>
                      {cover.price > 0 && <div className="text-teal-500">+${cover.price.toLocaleString()}</div>}
                    </div>
                  </div>
                ))}
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-8" />
              </div>
            </div>

            {/* Additional Features Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Additional Features</h3>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={feature.checked}
                        onCheckedChange={() => handleFeatureToggle(index)}
                      />
                      <span className="text-sm">{feature.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">+${feature.price.toLocaleString()}</span>
                  </div>
                ))}
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
                <Button variant="outline" className="flex-1" disabled={isLoading}>
                  Editor Studio
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleGetQuote}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Download Quote
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleAddToCart}
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </Button>
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Buy Now - ${calculateTotal().toLocaleString()}
                </Button>
              </div>

              {/* Finance Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Finance This Purchase</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center p-2 border rounded">
                    <div className="font-semibold">12 Months</div>
                    <div className="text-sm text-gray-600">
                      ${Math.round(calculateTotal() / 12).toLocaleString()}/mo
                    </div>
                  </div>
                  <div className="text-center p-2 border rounded">
                    <div className="font-semibold">24 Months</div>
                    <div className="text-sm text-gray-600">
                      ${Math.round(calculateTotal() / 24).toLocaleString()}/mo
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleLyonFinance}
                  variant="outline" 
                  className="w-full"
                  disabled={isLoading}
                >
                  Apply with Lyon Financial
                </Button>
                
                <p className="text-xs text-gray-500 mt-1 text-center">
                  *Financing subject to credit approval. APR varies.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PoolProductCard;
