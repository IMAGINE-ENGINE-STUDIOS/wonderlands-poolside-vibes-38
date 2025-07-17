import { useState } from "react";
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
  Plus
} from "lucide-react";

interface PoolOption {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'waterline' | 'jets' | 'heating' | 'covers' | 'decorative';
  image?: string;
}

const poolOptions: PoolOption[] = [
  // Waterline Options (from Latham)
  { 
    id: 'wl-flagstone-tan', 
    name: 'Flagstone Tan', 
    description: 'TrueStone Collection - 27 mil premium liner',
    price: 2500, 
    category: 'waterline' 
  },
  { 
    id: 'wl-flagstone-grey', 
    name: 'Flagstone Grey', 
    description: 'TrueStone Collection - 27 mil premium liner',
    price: 2500, 
    category: 'waterline' 
  },
  { 
    id: 'wl-terrazzo-caribbean', 
    name: 'Terrazzo Caribbean', 
    description: 'Classic Collection - Vibrant tropical design',
    price: 2200, 
    category: 'waterline' 
  },
  { 
    id: 'wl-crystal-quartz', 
    name: 'Crystal Quartz', 
    description: 'Natural Stone Finish - Luxurious texture',
    price: 2800, 
    category: 'waterline' 
  },
  
  // Jets & Water Features
  { 
    id: 'jets-standard', 
    name: 'Standard Water Jets (4)', 
    description: 'Adjustable directional jets for relaxation',
    price: 1500, 
    category: 'jets' 
  },
  { 
    id: 'jets-premium', 
    name: 'Premium Jet Package (8)', 
    description: 'Enhanced hydrotherapy with LED lighting',
    price: 3200, 
    category: 'jets' 
  },
  { 
    id: 'jets-deluxe', 
    name: 'Deluxe Spa Jets (12)', 
    description: 'Full-body hydrotherapy system with controls',
    price: 5500, 
    category: 'jets' 
  },
  
  // Heating Systems
  { 
    id: 'heat-gas', 
    name: 'Natural Gas Heater', 
    description: 'Fast heating, 400K BTU capacity',
    price: 4500, 
    category: 'heating' 
  },
  { 
    id: 'heat-electric', 
    name: 'Electric Heat Pump', 
    description: 'Energy-efficient heating solution',
    price: 5200, 
    category: 'heating' 
  },
  { 
    id: 'heat-solar', 
    name: 'Solar Heating System', 
    description: 'Eco-friendly solar collectors',
    price: 6800, 
    category: 'heating' 
  },
  
  // Automatic Covers
  { 
    id: 'cover-safety', 
    name: 'Safety Auto Cover', 
    description: 'Motorized safety cover with key switch',
    price: 12500, 
    category: 'covers' 
  },
  { 
    id: 'cover-thermal', 
    name: 'Thermal Auto Cover', 
    description: 'Insulated cover for energy efficiency',
    price: 15800, 
    category: 'covers' 
  },
  
  // Custom Decorations
  { 
    id: 'deco-lighting', 
    name: 'LED Color Changing Lights', 
    description: 'RGB lighting system with remote control',
    price: 3500, 
    category: 'decorative' 
  },
  { 
    id: 'deco-fountain', 
    name: 'Water Fountain Features', 
    description: 'Decorative fountains with lighting',
    price: 4200, 
    category: 'decorative' 
  },
  { 
    id: 'deco-tile', 
    name: 'Custom Mosaic Tiles', 
    description: 'Handcrafted mosaic designs',
    price: 3800, 
    category: 'decorative' 
  }
];

const categoryInfo = {
  waterline: { 
    icon: Palette, 
    name: 'Waterline Patterns', 
    color: 'text-purple-500',
    description: 'Premium vinyl liner patterns from Latham' 
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
    name: 'Custom Decorations', 
    color: 'text-coral',
    description: 'Personalize your pool with unique features' 
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
          Add premium features and personalize your swimming experience
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
                    +${option.price.toLocaleString()}
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