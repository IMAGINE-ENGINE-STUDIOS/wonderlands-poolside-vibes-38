import * as React from "react";
const { useState } = React;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Waves, 
  Zap, 
  Thermometer, 
  Shield, 
  Palette, 
  Sparkles,
  Settings,
  Plus,
  Grid3X3
} from "lucide-react";

// Import real website options data
import { getProductsByCategory, allProducts, type Product } from '@/data/consolidatedProducts';
import { poolLiners, poolTiles } from '@/data/poolData';
import { paverTypes } from '@/data/paverData';

// Safely get finish products with error handling
const getFinishProducts = () => {
  try {
    return getProductsByCategory('finish');
  } catch (error) {
    console.error('Error getting finish products:', error);
    return [];
  }
};

interface PoolOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'waterline' | 'jets' | 'heating' | 'covers' | 'decorative' | 'screen-enclosure';
  image?: string;
}

// Build pool options from actual website data
const poolOptions: PoolOption[] = [
  // Real Pool Finishes
  ...getFinishProducts().map(finish => ({
    id: `finish-${finish.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: finish.name,
    description: finish.description || `Premium ${finish.collection} finish`,
    price: finish.price,
    category: 'waterline' as const
  })),
  
  // Real Pool Liners
  ...poolLiners.map(liner => ({
    id: `liner-${liner.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: liner.name,
    description: liner.description || `${liner.type} liner for enhanced durability`,
    price: liner.price,
    category: 'waterline' as const
  })),
  
  // Real Pool Tiles
  ...poolTiles.map(tile => ({
    id: `tile-${tile.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: tile.name,
    description: tile.description || 'Premium waterline tile',
    price: tile.price,
    category: 'decorative' as const
  })),
  
  // Real Pavers (surface area based pricing)
  ...paverTypes.map(paver => ({
    id: `paver-${paver.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: paver.name,
    description: paver.description || 'Premium paver option at $20/sq ft',
    price: 0, // Base price, actual calculated by surface area
    category: 'decorative' as const
  })),
  
  // Real Pool Heating Options
  // Pool Heaters - Pentair only with 15% increase
  { 
    id: 'pentair-mt125', 
    name: 'Pentair MasterTemp 125 (125K BTU)', 
    description: 'Compact high-efficiency gas heater for pools up to 15,000 gallons',
    price: 2300, 
    category: 'heating' 
  },
  { 
    id: 'pentair-mt250', 
    name: 'Pentair MasterTemp 250 (250K BTU)', 
    description: 'Mid-size high-performance gas heater for medium pools',
    price: 3680, 
    category: 'heating' 
  },
  { 
    id: 'pentair-mt400', 
    name: 'Pentair MasterTemp 400 (400K BTU)', 
    description: 'High-capacity gas heater for large pools and quick heating',
    price: 4830, 
    category: 'heating' 
  },
  { 
    id: 'pentair-ut90', 
    name: 'Pentair UltraTemp 90 Heat Pump', 
    description: 'Energy-efficient heat pump for pools up to 20,000 gallons',
    price: 5175, 
    category: 'heating' 
  },
  { 
    id: 'pentair-ut110', 
    name: 'Pentair UltraTemp 110 Heat Pump', 
    description: 'High-efficiency heat pump for medium to large pools',
    price: 6325, 
    category: 'heating' 
  },
  { 
    id: 'pentair-ut140', 
    name: 'Pentair UltraTemp 140 Heat Pump', 
    description: 'Premium heat pump for large pools with maximum efficiency',
    price: 7475, 
    category: 'heating' 
  },
  
  // Real Automatic Covers
  { 
    id: 'cover-eclipse', 
    name: 'Eclipse Automatic Cover', 
    description: 'High-grade PVC with dual track system and emergency manual override',
    price: 16000, 
    category: 'covers' 
  },
  { 
    id: 'cover-cs3000', 
    name: 'CS3000 Safety Cover', 
    description: 'Multi-layer vinyl with smart automation and weather sensors',
    price: 24000, 
    category: 'covers' 
  },
  { 
    id: 'cover-infinity', 
    name: 'Infinity 4000 Smart Cover', 
    description: 'Premium composite with AI-powered automation and solar integration',
    price: 32000, 
    category: 'covers' 
  },
  { 
    id: 'cover-atom', 
    name: 'Atom Loop-Loc Cover', 
    description: 'Insulated fabric with compact design and temperature sensors',
    price: 19000, 
    category: 'covers' 
  },
  
  // Jets & Water Features
  { 
    id: 'jets-standard', 
    name: 'Standard Water Jets (4)', 
    description: 'Adjustable directional jets for relaxation',
    price: 1800, 
    category: 'jets' 
  },
  { 
    id: 'jets-premium', 
    name: 'Premium Jet Package (8)', 
    description: 'Enhanced hydrotherapy with LED lighting',
    price: 3600, 
    category: 'jets' 
  },

  // Screen Enclosure Options
  { 
    id: 'screen-standard-1-story', 
    name: 'Standard Screen Enclosure - 1 Story', 
    description: 'Premium aluminum frame with standard screen mesh - $25/sq ft',
    price: 0, // Base price, calculated by area
    category: 'screen-enclosure',
    image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png'
  },
  { 
    id: 'screen-standard-2-story', 
    name: 'Standard Screen Enclosure - 2 Story', 
    description: 'Reinforced aluminum frame for two-story applications - $27/sq ft',
    price: 0, // Base price, calculated by area
    category: 'screen-enclosure',
    image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png'
  },
  { 
    id: 'screen-premium-1-story', 
    name: 'Premium Screen Enclosure - 1 Story', 
    description: 'High-end aluminum frame with superior screen mesh - $27/sq ft',
    price: 0, // Base price, calculated by area
    category: 'screen-enclosure',
    image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png'
  },
  { 
    id: 'screen-premium-2-story', 
    name: 'Premium Screen Enclosure - 2 Story', 
    description: 'Premium two-story screen enclosure with enhanced features - $28/sq ft',
    price: 0, // Base price, calculated by area
    category: 'screen-enclosure',
    image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png'
  },
];

const categoryInfo = {
  waterline: { 
    icon: Palette, 
    name: 'Finishes & Liners', 
    color: 'text-purple-500',
    description: 'Premium finishes and liner options' 
  },
  jets: { 
    icon: Waves, 
    name: 'Water Jets & Hydrotherapy', 
    color: 'text-blue-500',
    description: 'Relaxation and therapeutic water features' 
  },
  heating: { 
    icon: Thermometer, 
    name: 'Pool Heating', 
    color: 'text-orange-500',
    description: 'Extend your swimming season year-round' 
  },
  covers: { 
    icon: Shield, 
    name: 'Automatic Covers', 
    color: 'text-green-500',
    description: 'Safety and energy efficiency solutions' 
  },
  decorative: { 
    icon: Sparkles, 
    name: 'Tiles & Pavers', 
    color: 'text-coral',
    description: 'Premium tiles and paver options' 
  },
  'screen-enclosure': { 
    icon: Grid3X3, 
    name: 'Screen Enclosures', 
    color: 'text-emerald-500',
    description: 'Premium screen enclosure options' 
  }
};

interface PoolCustomizationOptionsProps {
  onSelectionChange?: (selectedOptions: PoolOption[]) => void;
}

const PoolCustomizationOptions = ({ onSelectionChange }: PoolCustomizationOptionsProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleOptionToggle = (optionId: string) => {
    const newSelection = selectedOptions.includes(optionId)
      ? selectedOptions.filter(id => id !== optionId)
      : [...selectedOptions, optionId];
    
    setSelectedOptions(newSelection);
    
    if (onSelectionChange) {
      const selectedOptionObjects = poolOptions.filter(option => 
        newSelection.includes(option.id)
      );
      onSelectionChange(selectedOptionObjects);
    }
  };

  const filteredOptions = selectedCategory === 'all' 
    ? poolOptions 
    : poolOptions.filter(option => option.category === selectedCategory);

  const totalPrice = selectedOptions.reduce((total, optionId) => {
    const option = poolOptions.find(opt => opt.id === optionId);
    return total + (option?.price || 0);
  }, 0);

  const categories = Object.keys(categoryInfo) as (keyof typeof categoryInfo)[];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal">
          Customize Your Pool
        </h3>
        <p className="text-muted-foreground">
          Add premium features available on our website
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          size="sm"
        >
          All Options
        </Button>
        {categories.map((category) => {
          const info = categoryInfo[category];
          const Icon = info.icon;
          return (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Icon size={16} className={info.color} />
              {info.name}
            </Button>
          );
        })}
      </div>

      {/* Selected Items Summary */}
      {selectedOptions.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-teal/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Selected Options ({selectedOptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Additional features total:
              </span>
              <span className="text-2xl font-bold text-primary">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOptions.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          const categoryData = categoryInfo[option.category];
          const CategoryIcon = categoryData.icon;

          return (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected 
                  ? 'border-primary bg-gradient-to-br from-primary/10 to-teal/10' 
                  : 'hover:border-primary/30'
              }`}
              onClick={() => handleOptionToggle(option.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="outline" 
                    className={`${categoryData.color} border-current`}
                  >
                    <CategoryIcon size={12} className="mr-1" />
                    {categoryData.name}
                  </Badge>
                  <Checkbox 
                    checked={isSelected}
                    onChange={() => handleOptionToggle(option.id)}
                  />
                </div>
                <CardTitle className="text-lg">{option.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-sm mb-4">
                  {option.description}
                </CardDescription>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    {option.price === 0 
                      ? (option.category === 'screen-enclosure' 
                          ? option.description.includes('$25') ? '$25/sq ft'
                            : option.description.includes('$27') ? '$27/sq ft'
                            : '$33/sq ft'
                          : '$25/sq ft')
                      : `+$${option.price.toLocaleString()}`
                    }
                  </span>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionToggle(option.id);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Add'}
                    <Plus size={16} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOptions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Settings size={48} className="mx-auto mb-4 text-muted-foreground/50" />
          <p>No options available in this category</p>
        </div>
      )}
    </div>
  );
};

export default PoolCustomizationOptions;
