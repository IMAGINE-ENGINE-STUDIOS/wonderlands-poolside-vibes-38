
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, ShoppingCart, Edit, ChevronLeft, ChevronRight, Clock, Shield } from "lucide-react";
import { useShoppingCart } from "./ShoppingCart";
import { openQuotePreview } from "@/utils/quoteNavigation";

// Pool image mapping with fallback
const poolImages: Record<string, string> = {
  "Apollo 14": "/lovable-uploads/apollo-14-new.jpg",
  "Apollo": "/lovable-uploads/apollo-14-new.jpg",
  "Ariel 16": "/lovable-uploads/ariel-16-new.jpg",
  "Ariel": "/lovable-uploads/ariel-16-new.jpg",
  "Astoria 12": "/lovable-uploads/astoria-12.jpg",
  "Astoria": "/lovable-uploads/astoria-new.jpg",
  "Coral 16": "/lovable-uploads/coral-16-new.jpg",
  "Coral": "/lovable-uploads/coral-16-new.jpg",
  "Milan": "/lovable-uploads/jamaica.jpg",
  "Jamaica": "/lovable-uploads/jamaica.jpg",
  "Aruba": "/lovable-uploads/st-lucia.jpg",
  "Bermuda": "/lovable-uploads/bermuda.jpg",
  "Cape Cod": "/lovable-uploads/cape-cod.jpg",
  "Fiji": "/lovable-uploads/fiji.jpg",
  "Genesis": "/lovable-uploads/genesis.jpg",
  "St. Lucia": "/lovable-uploads/st-lucia.jpg",
  "Synergy": "/lovable-uploads/synergy.jpg",
  "Valencia": "/lovable-uploads/valencia.jpg",
};

// Customization options data
const poolTiles = [
  { name: "Standard Waterline", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 0 },
  { name: "Mountain", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 15000 },
  { name: "Carnegie", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 15000 },
  { name: "Panama", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 15000 },
];

const poolFinishes = [
  { name: "Sapphire Blue", type: "Crystite Crystal", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 3500 },
  { name: "Ocean Blue", type: "Crystite Crystal", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 3500 },
  { name: "Night Sky", type: "Crystite Crystal", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 3500 },
  { name: "Shale Gray", type: "Crystite Crystal", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 3500 },
];

const premiumLiners = [
  { name: "Standard Blue", type: "", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 0 },
  { name: "Paradise", type: "Glass", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 12000 },
  { name: "Water Lilies", type: "Glass", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 12000 },
  { name: "Sail Boat", type: "Glass", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 12000 },
];

const coverOptions = [
  { name: "NO COVER", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 0 },
  { name: "Eclipse Automatic", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 16000 },
  { name: "CS3000 Safety", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 24000 },
  { name: "Infinity 4000", image: "/lovable-uploads/0491db41-90e0-48c5-ba33-3772268815aa.png", price: 32000 },
];

const additionalFeatures = [
  { name: "Add Pool Heater", price: 0, checked: false },
  { name: "Spa Jets", price: 1800, checked: false },
  { name: "Add Spa", price: 0, checked: false },
  { name: "Add Tanning Ledge", price: 0, checked: false },
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
  onViewDetails?: (pool: any) => void;
  onRequestQuote?: (pool: any) => void;
}

const PoolProductCard = ({ pool, onAddToCart, isAdmin, onViewDetails, onRequestQuote }: PoolProductCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTile, setSelectedTile] = useState(poolTiles[0]);
  const [selectedFinish, setSelectedFinish] = useState(poolFinishes[0]);
  const [selectedLiner, setSelectedLiner] = useState(premiumLiners[0]);
  const [selectedCover, setSelectedCover] = useState(coverOptions[0]);
  const [features, setFeatures] = useState(additionalFeatures);
  const [paverArea, setPaverArea] = useState("");
  
  const { addToCart } = useShoppingCart();

  // Get correct pool image with better fallback handling
  const getPoolImage = (poolModel: string) => {
    const image = poolImages[poolModel] || poolImages[poolModel.split(' ')[0]];
    return image || "/lovable-uploads/jamaica.jpg"; // Default fallback
  };

  const calculateTotal = () => {
    const tilePrice = selectedTile.price || 0;
    const finishPrice = selectedFinish.price || 0;
    const linerPrice = selectedLiner.price || 0;
    const coverPrice = selectedCover.price || 0;
    const featuresPrice = features.reduce((sum, feature) => sum + (feature.checked ? feature.price : 0), 0);
    
    return pool.price + tilePrice + finishPrice + linerPrice + coverPrice + featuresPrice;
  };

  const handleFeatureToggle = (index: number) => {
    setFeatures(prev => prev.map((feature, i) => 
      i === index ? { ...feature, checked: !feature.checked } : feature
    ));
  };

  const handleAddToCart = () => {
    const total = calculateTotal();
    addToCart({
      id: `pool_${pool.model.replace(/\s+/g, '_')}_${Date.now()}`,
      name: pool.model,
      price: total,
      category: 'pool',
      image: getPoolImage(pool.model)
    });
  };

  const handleGetQuote = () => {
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
          paverArea: paverArea
        },
        totalPrice: calculateTotal()
      }
    };

    console.log('Quote data being sent:', quoteData);
    openQuotePreview(quoteData);
  };

  const handleLyonFinance = () => {
    const total = calculateTotal();
    const financeUrl = `https://apply.lyonfinancial.net/apply?partner_id=wonderlands&amount=${total}&product=pool`;
    window.open(financeUrl, '_blank');
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
              e.currentTarget.src = "/lovable-uploads/jamaica.jpg";
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
            {calculateTotal() > pool.price && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${pool.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-teal-600">
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
            <span>Salt system included in final price</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full border-2 border-white shadow"></div>
            <span>Carbon Fiber Technology</span>
          </div>
        </div>

        {pool.dimensions && (
          <div className="text-sm text-gray-600 space-y-1">
            <div>Dimensions: {pool.dimensions}</div>
            <div>Depth: {pool.depth}</div>
            <div>Includes: 3 ft perimeter pavers around pool area</div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Installation: 4 weeks</span>
            </div>
            <div className="flex items-center gap-1 text-blue-500">
              <Shield className="h-3 w-3" />
              <span className="font-medium">Warranty: LIFETIME WARRANTY</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isAdmin && (
            <Button variant="outline" size="sm" className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Editor Studio
            </Button>
          )}
          <Button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
          >
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
                    {feature.price > 0 && (
                      <span className="text-sm text-gray-600">(+${feature.price.toLocaleString()})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Carbon Fiber Technology Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h4 className="font-semibold">Carbon Fiber Technology</h4>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                Our advanced carbon fiber construction provides superior strength, durability, and longevity. This cutting-edge technology ensures your pool maintains its structural integrity for decades while offering unmatched resistance to cracking and fading.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 300% stronger than traditional fiberglass</li>
                <li>• Superior thermal retention</li>
                <li>• UV-resistant surface coating</li>
                <li>• Lifetime structural warranty</li>
              </ul>
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
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  Editor Studio
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleGetQuote}
                >
                  Download Quote
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleAddToCart}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </Button>
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
                >
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
