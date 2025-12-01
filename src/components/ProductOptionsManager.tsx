import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Zap, 
  Shield, 
  Sun, 
  Settings, 
  Calculator,
  Grid3X3,
  Home
} from 'lucide-react';

export type ProductCategory = 'pool' | 'spa' | 'tanning-ledge' | 'finish' | 'liner' | 'cover' | 'paver' | 'coping' | 'tile' | 'screen-enclosure';

interface ProductOptionsManagerProps {
  productType: ProductCategory;
  productName: string;
  onOptionsChange?: (options: any) => void;
}

const ProductOptionsManager = ({ productType, productName, onOptionsChange }: ProductOptionsManagerProps) => {
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [surfaceArea, setSurfaceArea] = useState<string>('');
  const [enclosureHeight, setEnclosureHeight] = useState<string>('1-story');
  const [enclosureType, setEnclosureType] = useState<string>('standard');

  const handleScreenEnclosureOptions = () => {
    const area = parseFloat(surfaceArea) || 0;
    let pricePerSqFt = 20; // base price

    // Calculate price based on type and height
    if (enclosureType === 'premium') {
      pricePerSqFt = enclosureHeight === '2-story' ? 33 : 27;
    } else {
      pricePerSqFt = enclosureHeight === '2-story' ? 27 : 20;
    }

    const totalPrice = area * pricePerSqFt;

    const options = {
      surfaceArea: area,
      enclosureHeight,
      enclosureType,
      pricePerSqFt,
      totalPrice,
      image: '/lovable-uploads/c86467c2-f57b-407c-a9f8-9ad2143552c2.png',
      features: enclosureType === 'premium' 
        ? ['Premium Aluminum Frame', 'Superior Screen Mesh', `${enclosureHeight === '2-story' ? 'Two' : 'Single'} Story Height`, 'Enhanced Hardware', 'Weather Resistant']
        : ['Aluminum Frame', 'Standard Screen Mesh', `${enclosureHeight === '2-story' ? 'Two' : 'Single'} Story Height`, 'Basic Hardware']
    };

    setSelectedOptions(options);
    onOptionsChange?.(options);
  };

  useEffect(() => {
    if (productType === 'screen-enclosure') {
      handleScreenEnclosureOptions();
    }
    if (productType === 'paver') {
      const area = parseFloat(surfaceArea) || 0;
      const calculatedPrice = area * 20;

      setSelectedOptions({
        surfaceArea: area,
        totalPrice: calculatedPrice,
      });
      onOptionsChange?.({
        surfaceArea: area,
        totalPrice: calculatedPrice,
      });
    }
  }, [surfaceArea, enclosureHeight, enclosureType, productType]);

  const renderScreenEnclosureOptions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="surface-area">Surface Area (sq ft)</Label>
          <Input
            id="surface-area"
            type="number"
            placeholder="Enter square footage"
            value={surfaceArea}
            onChange={(e) => setSurfaceArea(e.target.value)}
            min="0"
            step="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="enclosure-height">Height Configuration</Label>
          <Select value={enclosureHeight} onValueChange={setEnclosureHeight}>
            <SelectTrigger>
              <SelectValue placeholder="Select height" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-story">Single Story</SelectItem>
              <SelectItem value="2-story">Two Story</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="enclosure-type">Screen Type</Label>
        <Select value={enclosureType} onValueChange={setEnclosureType}>
          <SelectTrigger>
            <SelectValue placeholder="Select screen type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard Screen Enclosure</SelectItem>
            <SelectItem value="premium">Premium Screen Enclosure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedOptions.totalPrice && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Price Calculation</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedOptions.surfaceArea} sq ft × ${selectedOptions.pricePerSqFt}/sq ft
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedOptions.features?.map((feature: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">
                  ${selectedOptions.totalPrice?.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const getCategoryIcon = () => {
    switch (productType) {
      case 'screen-enclosure': return Grid3X3;
      case 'paver': return Sun;
      case 'cover': return Shield;
      case 'finish': return Palette;
      case 'liner': return Palette;
      default: return Settings;
    }
  };

  const getCategoryName = () => {
    switch (productType) {
      case 'screen-enclosure': return 'Screen Enclosure';
      case 'tanning-ledge': return 'Tanning Ledge';
      default: return productType.charAt(0).toUpperCase() + productType.slice(1);
    }
  };

  const CategoryIcon = getCategoryIcon();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CategoryIcon className="h-5 w-5 text-primary" />
          {getCategoryName()} Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {productType === 'screen-enclosure' && renderScreenEnclosureOptions()}
        {productType === 'paver' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paver-area">Surface Area (sq ft)</Label>
              <Input
                id="paver-area"
                type="number"
                placeholder="Enter square footage"
                value={surfaceArea}
                onChange={(e) => setSurfaceArea(e.target.value)}
                min="0"
                step="1"
              />
            </div>
            {parseFloat(surfaceArea) > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Price Calculation</h4>
                      <p className="text-sm text-muted-foreground">
                        {surfaceArea} sq ft × $20/sq ft
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">
                        ${(parseFloat(surfaceArea) * 20).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductOptionsManager;
