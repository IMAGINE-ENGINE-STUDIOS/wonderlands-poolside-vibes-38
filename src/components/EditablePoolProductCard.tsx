import * as React from "react";
const { useState } = React;
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Waves, DollarSign, Thermometer, Shield, Zap, Droplets, Star, Clock, Award, Cpu, Edit, ShoppingCart, Sun, Save, X, Upload, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useShoppingCart } from "./ShoppingCartProvider";

// Helper function to get pool price (no discounts)
const getPoolPrice = (pool: Pool) => {
  return pool.price;
};

// Import the same data sources as PoolProductCard
import { spas } from "./PoolCatalog";
import { tanningLedges } from "@/data/poolData";
import { getProductsByCompatiblePool } from '@/data/consolidatedProducts';
import { poolLiners, poolTiles } from '@/data/poolData';

// Import finish images
import aquamarineFinish from '@/assets/finishes/aquamarine-g3.webp';
import oceanBlueFinish from '@/assets/finishes/ocean-blue-g3.webp';
import sapphireBlueFinish from '@/assets/finishes/sapphire-blue-g3.webp';
import nightSkyFinish from '@/assets/finishes/night-sky-g3.webp';
import athensPearlFinish from '@/assets/finishes/athens-pearl-white-g3.webp';
import lagoonBlueFinish from '@/assets/finishes/lagoon-blue-g2.webp';
import azureBlueFinish from '@/assets/finishes/azure-blue-g2.webp';
import coastalBronzeFinish from '@/assets/finishes/coastal-bronze-g3.webp';
import shaleGrayFinish from '@/assets/finishes/shale-gray-g3.webp';

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
}

interface EditablePoolProductCardProps {
  pool: Pool;
  isEditable?: boolean;
  isAdmin?: boolean;
  onUpdate?: (updatedPool: Pool) => void;
  onViewDetails?: (pool: Pool) => void;
  onRequestQuote?: (pool: Pool, extras?: PoolExtras) => void;
}

interface PoolExtras {
  liner: boolean;
  heater: boolean;
  cover: boolean;
  jets: boolean;
  finish: string;
  linerOption: string;
  coverOption: string;
  tiles: boolean;
  tileOption: string;
  spa: boolean;
  spaModel: string;
  tanningLedge: boolean;
  tanningLedgeModel: string;
  // New: screen enclosure as add-on
  screenEnclosure?: boolean;
  screenEnclosureArea?: number;
  screenEnclosureQuality?: 'standard' | 'deluxe' | 'premium';
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'premium': return 'bg-gradient-to-r from-coral to-orange';
    case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
    case 'standard': return 'bg-gradient-to-r from-[hsl(var(--golden))] to-[hsl(var(--golden-light))]';
    case 'compact': return 'bg-gradient-to-r from-teal to-primary';
    default: return 'bg-gradient-to-r from-primary to-teal';
  }
};

const getExtraPrice = (extra: string) => {
  switch (extra) {
    case 'liner': return 0;
    case 'heater': return 5000;
    case 'cover': return 22000; // Updated to match cheapest Eclipse cover price
    case 'jets': return 1800;
    case 'tiles': return 0;
    default: return 0;
  }
};

const EditablePoolProductCard = ({ 
  pool, 
  isEditable = false, 
  isAdmin = false,
  onUpdate, 
  onViewDetails, 
  onRequestQuote 
}: EditablePoolProductCardProps) => {
  // Filter finishes based on pool model compatibility
  const compatibleFinishes = getProductsByCompatiblePool('finish', pool.model);
  
  // Convert pool finishes data to finish options format
  const finishOptions = compatibleFinishes.map(finish => ({
    name: finish.name,
    color: '#4169E1',
    image: finish.image,
    // Force Crystite Crystals finishes to $4,500 in product card
    price: (finish.collection && /crystite/i.test(finish.collection)) || (finish.category && /crystite/i.test(finish.category))
      ? 4500
      : finish.price,
    collection: finish.collection,
    category: finish.category,
    description: finish.description
  }));

  // Convert pool liners to liner options format
  const linerOptions = [
    { name: 'Standard Blue', color: '#4169E1', price: 4500, image: azureBlueFinish, type: 'Standard', description: undefined },
    ...poolLiners.map(liner => ({
      name: liner.name,
      color: '#4169E1',
      price: 4500, // All liners are $4,500
      image: liner.image,
      type: liner.type,
      description: liner.description
    }))
  ];

  const coverOptions = [
    { name: 'Eclipse', color: '#2F4F4F', price: 27000 },
    { name: 'CS3000', color: '#2F4F4F', price: 30000 },
    { name: 'Infinity 4000', color: '#2F4F4F', price: 32000 },
    { name: 'Atom', color: '#2F4F4F', price: 25000 }
  ];

  // Convert pool tiles to tile options format
  const tileOptions = [
    { name: 'Standard Waterline', color: '#4682B4', price: 0, image: azureBlueFinish, description: undefined },
    ...poolTiles.map(tile => ({
      name: tile.name,
      color: '#4682B4',
      price: tile.price,
      image: tile.image,
      description: tile.description
    }))
  ];
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedPool, setEditedPool] = useState({ ...pool });
  const [showDetails, setShowDetails] = useState(false);
  const [currentPoolImage, setCurrentPoolImage] = useState(pool.image);
  const [extras, setExtras] = useState<PoolExtras>({
    liner: false,
    heater: false,
    cover: false,
    jets: false,
    finish: '',
    linerOption: '',
    coverOption: '',
    tiles: false,
    tileOption: '',
    spa: false,
    spaModel: '',
    tanningLedge: false,
    tanningLedgeModel: '',
    screenEnclosure: false,
    screenEnclosureArea: 0,
    screenEnclosureQuality: 'standard'
  });

  const { addToCart } = useShoppingCart();

  const handleImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setEditedPool(prev => ({ ...prev, image: base64String }));
        setCurrentPoolImage(base64String);
        toast.success('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would update the database
      // For now, we'll just call the onUpdate callback
      onUpdate?.(editedPool);
      toast.success('Pool updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating pool:', error);
      toast.error('Failed to update pool');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedPool({ ...pool });
    setCurrentPoolImage(pool.image);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Pool, value: any) => {
    setEditedPool(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageClick = () => {
    if (isEditable && !isEditing) {
      setIsEditing(true);
    } else {
      setShowDetails(!showDetails);
    }
  };

  const toggleExtra = (extra: string) => {
    setExtras(prev => {
      // Handle tile/liner mutual exclusivity
      if (extra === 'tiles' && !prev.tiles) {
        setShowDetails(true);
        return { ...prev, tiles: true, liner: false };
      } else if (extra === 'liner' && !prev.liner) {
        setShowDetails(true);
        return { ...prev, liner: true, tiles: false };
      } else if (extra === 'tiles') {
        return { ...prev, tiles: !prev.tiles };
      } else if (extra === 'liner') {
        return { ...prev, liner: !prev.liner };
      } else if (extra === 'cover') {
        const enabling = !prev.cover;
        return enabling
          ? { ...prev, cover: true, coverOption: coverOptions.find(o => o.name === prev.coverOption) ? prev.coverOption : 'Eclipse' }
          : { ...prev, cover: false };
      } else if (extra === 'jets') {
        return { ...prev, jets: !prev.jets };
      } else if (extra === 'spa') {
        return { ...prev, spa: !prev.spa };
      } else if (extra === 'tanningLedge') {
        return { ...prev, tanningLedge: !prev.tanningLedge };
      } else if (extra === 'screenEnclosure') {
        const enabling = !prev.screenEnclosure;
        if (enabling) setShowDetails(true);
        return { ...prev, screenEnclosure: enabling };
      }
      
      return prev;
    });
  };

  const getScreenEnclosureRate = (quality: 'standard' | 'deluxe' | 'premium') => {
    if (quality === 'premium') return 26;
    if (quality === 'deluxe') return 24;
    return 22;
  };

  const calculateScreenEnclosurePrice = () => {
    if (!extras.screenEnclosure) return 0;
    const area = Number(extras.screenEnclosureArea) || 0;
    const rate = getScreenEnclosureRate(extras.screenEnclosureQuality || 'standard');
    return Math.max(0, area) * rate;
  };

  const calculateTotalPrice = () => {
    let total = editedPool.price;
    
    if (extras.heater) total += getExtraPrice('heater');
    if (extras.cover) total += getExtraPrice('cover');
    if (extras.jets) total += getExtraPrice('jets');
    
    const linerOption = linerOptions.find(option => option.name === extras.linerOption);
    if (linerOption && extras.liner) total += linerOption.price;
    
    const tileOption = tileOptions.find(option => option.name === extras.tileOption);
    if (tileOption && extras.tiles) total += tileOption.price;
    
    const coverOption = coverOptions.find(option => option.name === extras.coverOption);
    if (coverOption && extras.cover) total += coverOption.price;
    
    if (extras.spa) {
      const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
      if (selectedSpa) total += selectedSpa.price;
    }

    if (extras.tanningLedge) {
      const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
      if (selectedLedge) total += selectedLedge.price;
    }

    // Screen enclosure add-on
    total += calculateScreenEnclosurePrice();
    
    return total;
  };

  const hasExtras = Object.values(extras).some(value => value);

  const handleAddToCart = () => {
    const cartExtras: { name: string; price: number }[] = [];
    
    if (extras.heater) cartExtras.push({ name: 'Pool Heater', price: getExtraPrice('heater') });
    if (extras.jets) cartExtras.push({ name: 'Spa Jets', price: getExtraPrice('jets') });
    
    const linerOption = linerOptions.find(option => option.name === extras.linerOption);
    if (linerOption && extras.liner) {
      cartExtras.push({ name: `${linerOption.name} Liner`, price: linerOption.price });
    }
    
    const coverOption = coverOptions.find(option => option.name === extras.coverOption);
    if (coverOption && extras.cover) {
      cartExtras.push({ name: coverOption.name, price: coverOption.price });
    }
    
    const tileOption = tileOptions.find(option => option.name === extras.tileOption);
    if (tileOption && extras.tiles) {
      cartExtras.push({ name: tileOption.name, price: tileOption.price });
    }

    if (extras.spa) {
      const selectedSpa = spas.find((spa: any) => spa.model === extras.spaModel);
      if (selectedSpa) {
        cartExtras.push({ name: `${selectedSpa.model} Spa`, price: selectedSpa.price });
      }
    }

    if (extras.tanningLedge) {
      const selectedLedge = tanningLedges.find((ledge: any) => ledge.name === extras.tanningLedgeModel);
      if (selectedLedge) {
        cartExtras.push({ name: `${selectedLedge.name} Tanning Ledge`, price: selectedLedge.price });
      }
    }

    if (extras.screenEnclosure) {
      const area = Number(extras.screenEnclosureArea) || 0;
      const quality = extras.screenEnclosureQuality || 'standard';
      const rate = getScreenEnclosureRate(quality);
      const price = Math.max(0, area) * rate;
      cartExtras.push({ name: `Screen Enclosure (${area} sq ft, ${quality})`, price });
    }

    addToCart({
      id: `pool_${editedPool.model.replace(/\s+/g, '_')}_${Date.now()}`,
      name: editedPool.model,
      price: editedPool.price,
      category: editedPool.category,
      image: currentPoolImage,
      extras: cartExtras
    });
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
      {/* Pool Image */}
      <div 
        className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-primary/10 to-teal/10 cursor-pointer overflow-hidden group/image"
        onClick={handleImageClick}
      >
        {currentPoolImage ? (
          <img loading="lazy" decoding="async" 
            src={currentPoolImage} 
            alt={editedPool.model}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-teal/20">
            <Waves size={48} className="text-primary/60" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
<Badge className={`${getCategoryColor(editedPool.category)} text-white capitalize font-medium px-3 py-1`}>
            {editedPool.category === 'standard' ? 'Wonderful' : editedPool.category}
          </Badge>
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 text-white font-medium">
            {isEditing ? 'Editing Mode' : (isEditable ? 'Click to Edit' : 'Click for Details')}
          </div>
        </div>
        
        {/* Edit/Upload Button */}
        {isEditable && (
          <div className="absolute top-2 right-2 flex gap-1">
            {isEditing && (
              <label htmlFor="image-upload" className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    <Upload className="h-3 w-3" />
                  </span>
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </label>
            )}
            <Button
              size="sm"
              variant="secondary"
              className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {/* Pool Name */}
        {isEditing ? (
          <Input
            value={editedPool.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            className="text-lg sm:text-xl font-bold"
            placeholder="Pool model name"
          />
        ) : (
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {editedPool.model}
          </h3>
        )}
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-teal" />
          {isEditing ? (
            <Input
              type="number"
              value={editedPool.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              className="text-lg sm:text-xl lg:text-2xl font-bold max-w-32"
            />
          ) : (
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
              ${calculateTotalPrice().toLocaleString()}
            </span>
          )}
          {hasExtras && !isEditing && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              ${editedPool.price.toLocaleString()}
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Dimensions</label>
                <Input
                  value={editedPool.dimensions || ''}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  placeholder="e.g., 16' x 32'"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Depth</label>
                <Input
                  value={editedPool.depth || ''}
                  onChange={(e) => handleInputChange('depth', e.target.value)}
                  placeholder="e.g., 3'6&quot; - 6'6&quot;"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-sm font-medium">Installation (weeks)</label>
                <Input
                  type="number"
                  value={editedPool.installationTimeWeeks || ''}
                  onChange={(e) => handleInputChange('installationTimeWeeks', parseInt(e.target.value) || undefined)}
                  placeholder="4"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Warranty</label>
                <Input
                  value={editedPool.warrantyYears || ''}
                  onChange={(e) => handleInputChange('warrantyYears', e.target.value)}
                  placeholder="Lifetime"
                />
              </div>
              <div>
                <label className="text-sm font-medium">GALA Points</label>
                <Input
                  type="number"
                  value={editedPool.galaPoints || ''}
                  onChange={(e) => handleInputChange('galaPoints', parseInt(e.target.value) || undefined)}
                  placeholder="500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={editedPool.heater || false}
                  onCheckedChange={(checked) => handleInputChange('heater', checked)}
                />
                <Thermometer className="h-4 w-4" />
                <span className="text-sm">Heater</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={editedPool.saltSystem || false}
                  onCheckedChange={(checked) => handleInputChange('saltSystem', checked)}
                />
                <Droplets className="h-4 w-4" />
                <span className="text-sm">Salt System</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={editedPool.carbonFiber || false}
                  onCheckedChange={(checked) => handleInputChange('carbonFiber', checked)}
                />
                <Shield className="h-4 w-4" />
                <span className="text-sm">Carbon Fiber</span>
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Features & Tech */}
            <div className="space-y-2">
              {editedPool.saltSystem && (
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-teal" />
                  <span className="font-medium">Salt system included in final price</span>
                </div>
              )}
              {editedPool.carbonFiber && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium">Carbon Fiber Technology</span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="text-sm text-muted-foreground space-y-1">
              {editedPool.dimensions && <p>Dimensions: {editedPool.dimensions}</p>}
              {editedPool.depth && <p>Depth: {editedPool.depth}</p>}
              {editedPool.installationTimeWeeks && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Installation: {editedPool.installationTimeWeeks} weeks</span>
                </div>
              )}
              {editedPool.warrantyYears && (
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span className="font-bold text-primary">
                    Warranty: {editedPool.warrantyYears === "Lifetime" || editedPool.warrantyYears === "Life" ? "LIFETIME WARRANTY" : `${editedPool.warrantyYears} years`}
                  </span>
                </div>
              )}
            </div>

            {/* Add-ons Section (always show for customer interaction) */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Customize Your Pool
              </h4>
              
              {/* Add-on Checkboxes */}
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30">
                  <Checkbox 
                    checked={extras.heater} 
                    onCheckedChange={() => toggleExtra('heater')}
                  />
                 <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <img loading="lazy" decoding="async" 
                    src="/src/assets/pool-heater.webp"
                    alt="Pool Heater"
                    className="w-4 h-4 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span>Pool Heater (+$5,000)</span>
                </div>
                </label>
                
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30">
                  <Checkbox 
                    checked={extras.jets} 
                    onCheckedChange={() => toggleExtra('jets')}
                  />
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>Spa Jets (+$1,800)</span>
                </label>
                
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30">
                  <Checkbox 
                    checked={extras.tiles} 
                    onCheckedChange={() => toggleExtra('tiles')}
                  />
                  <div className="h-4 w-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded"></div>
                  <span>Premium Tiles</span>
                </label>
                
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30">
                  <Checkbox 
                    checked={extras.liner} 
                    onCheckedChange={() => toggleExtra('liner')}
                  />
                  <Waves className="h-4 w-4 text-cyan-500" />
                  <span>Premium Liner</span>
                </label>
                
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30">
                  <Checkbox 
                    checked={extras.cover} 
                    onCheckedChange={() => toggleExtra('cover')}
                  />
                  <Shield className="h-4 w-4 text-gray-600" />
                  <span>Automatic Cover</span>
                </label>
                
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30">
                  <Checkbox 
                    checked={extras.spa} 
                    onCheckedChange={() => toggleExtra('spa')}
                  />
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Add Spa</span>
                </label>

                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30 col-span-2">
                  <Checkbox 
                    checked={extras.tanningLedge} 
                    onCheckedChange={() => toggleExtra('tanningLedge')}
                  />
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span>Tanning Ledge</span>
                </label>

                {/* Screen Enclosure add-on */}
                <label className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded border hover:bg-muted/30 col-span-2">
                  <Checkbox 
                    checked={!!extras.screenEnclosure} 
                    onCheckedChange={() => toggleExtra('screenEnclosure')}
                  />
                  <Grid pattern="cols" />
                  <span>Screen Enclosure</span>
                </label>
              </div>
            </div>

            {/* Expanded Details with Carousels */}
            {showDetails && (
              <div className="space-y-4 animate-fade-in-up">
                <Separator />
                
                {/* Pool Tile Options */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Pool Tiles</h4>
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-1">
                      {tileOptions.map((tile) => (
                        <CarouselItem key={tile.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                          <div 
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                              extras.tileOption === tile.name ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                            onClick={() => setExtras(prev => ({ ...prev, tileOption: tile.name }))}
                          >
                            <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                              <img loading="lazy" decoding="async" 
                                src={tile.image} 
                                alt={tile.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.style.backgroundColor = tile.color;
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-h-0">
                              <p className="text-xs font-medium text-center line-clamp-2">{tile.name}</p>
                              {tile.price > 0 && (
                                <p className="text-xs text-primary font-semibold text-center mt-1">+${tile.price.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </Carousel>
                </div>

                {/* Pool Finishing Options */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Pool Finishes</h4>
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-1">
                      {finishOptions.map((finish) => (
                        <CarouselItem key={finish.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                          <div 
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                              extras.finish === finish.name ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                            onClick={() => setExtras(prev => ({ ...prev, finish: finish.name }))}
                          >
                            <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                              <img loading="lazy" decoding="async" 
                                src={finish.image} 
                                alt={finish.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.style.backgroundColor = finish.color;
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-h-0">
                              <p className="text-xs font-medium text-center line-clamp-2">{finish.name}</p>
                              {finish.price > 0 && (
                                <p className="text-xs text-primary font-semibold text-center mt-1">+${finish.price.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </Carousel>
                </div>

                {/* Pool Liner Options */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Pool Liners</h4>
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-1">
                      {linerOptions.map((liner) => (
                        <CarouselItem key={liner.name} className="pl-1 basis-1/2 sm:basis-1/3 md:basis-1/4">
                          <div 
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                              extras.linerOption === liner.name ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                            onClick={() => setExtras(prev => ({ ...prev, linerOption: liner.name }))}
                          >
                            <div className="w-full h-16 rounded-md mb-2 overflow-hidden flex-shrink-0">
                              <img loading="lazy" decoding="async" 
                                src={liner.image} 
                                alt={liner.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.style.backgroundColor = liner.color;
                                    target.style.display = 'none';
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between min-h-0">
                              <p className="text-xs font-medium text-center line-clamp-2">{liner.name}</p>
                              {liner.price > 0 && (
                                <p className="text-xs text-primary font-semibold text-center mt-1">+${liner.price.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </Carousel>
                </div>

                {/* Spa Selection */}
                {extras.spa && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Choose Your Spa</h4>
                    <Carousel className="w-full">
                      <CarouselContent className="-ml-1">
                        {spas.map((spa: any) => (
                          <CarouselItem key={spa.model} className="pl-1 basis-1/2 sm:basis-1/3">
                            <div 
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                                extras.spaModel === spa.model ? 'border-primary bg-primary/10' : 'border-border'
                              }`}
                              onClick={() => setExtras(prev => ({ ...prev, spaModel: spa.model }))}
                            >
                              <div className="w-full h-20 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                <img loading="lazy" decoding="async" 
                                  src={spa.image} 
                                  alt={spa.model}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                <p className="text-sm font-medium text-center">{spa.model}</p>
                                <p className="text-sm text-primary font-semibold text-center">+${spa.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-0" />
                      <CarouselNext className="right-0" />
                    </Carousel>
                  </div>
                )}

                {/* Tanning Ledge Selection */}
                {extras.tanningLedge && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Choose Your Tanning Ledge</h4>
                    <Carousel className="w-full">
                      <CarouselContent className="-ml-1">
                        {tanningLedges.map((ledge: any) => (
                          <CarouselItem key={ledge.name} className="pl-1 basis-1/2 sm:basis-1/3">
                            <div 
                              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md h-full flex flex-col ${
                                extras.tanningLedgeModel === ledge.name ? 'border-primary bg-primary/10' : 'border-border'
                              }`}
                              onClick={() => setExtras(prev => ({ ...prev, tanningLedgeModel: ledge.name }))}
                            >
                              <div className="w-full h-20 rounded-md mb-2 overflow-hidden flex-shrink-0">
                                <img loading="lazy" decoding="async" 
                                  src={ledge.image} 
                                  alt={ledge.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 flex flex-col justify-between">
                                <p className="text-sm font-medium text-center">{ledge.name}</p>
                                <p className="text-sm text-primary font-semibold text-center">+${ledge.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-0" />
                      <CarouselNext className="right-0" />
                    </Carousel>
                  </div>
                )}

                {/* Screen Enclosure Configuration */}
                {extras.screenEnclosure && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Screen Enclosure</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Surface Area (sq ft)</label>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={extras.screenEnclosureArea ?? 0}
                          onChange={(e) => setExtras(prev => ({ ...prev, screenEnclosureArea: parseFloat(e.target.value) || 0 }))}
                          placeholder="Enter sq ft"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Quality</label>
                        <select
                          className="w-full border rounded-md bg-background px-3 py-2 text-sm"
                          value={extras.screenEnclosureQuality}
                          onChange={(e) => setExtras(prev => ({ ...prev, screenEnclosureQuality: e.target.value as 'standard' | 'deluxe' | 'premium' }))}
                        >
                          <option value="standard">Standard ($15/sq ft)</option>
                          <option value="deluxe">Deluxe ($22/sq ft)</option>
                          <option value="premium">Premium ($28/sq ft)</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <div className="w-full bg-muted/50 border rounded-md p-3">
                          <div className="text-xs text-muted-foreground">Calculated Price</div>
                          <div className="text-lg font-semibold text-primary">${calculateScreenEnclosurePrice().toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => onViewDetails?.(editedPool)} 
                className="flex-1"
                disabled={!onViewDetails}
              >
                <Star className="h-4 w-4 mr-1" />
                Details
              </Button>
              
              <Button 
                onClick={handleAddToCart}
                className="flex-1"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => onRequestQuote?.(editedPool, extras)}
                className="flex-1"
                disabled={!onRequestQuote}
              >
                Get Quote
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EditablePoolProductCard;

// Helper placeholder to render a small grid icon without importing new libs
function Grid({ pattern }: { pattern?: 'cols' | 'rows' }) {
  return (
    <span 
      aria-hidden 
      className="inline-block h-4 w-4 rounded-sm border border-border relative overflow-hidden"
    >
      <span className="absolute inset-0 grid grid-cols-2">
        <span className="border-r border-border"></span>
        <span></span>
      </span>
      <span className="absolute inset-0 grid grid-rows-2">
        <span className="border-b border-border"></span>
        <span></span>
      </span>
    </span>
  );
}
