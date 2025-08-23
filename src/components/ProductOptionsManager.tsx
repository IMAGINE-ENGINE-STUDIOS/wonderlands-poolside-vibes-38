import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Product type definitions for different categories
export type ProductCategory = 'pool' | 'spa' | 'tanning-ledge' | 'finish' | 'liner' | 'cover' | 'paver' | 'coping' | 'tile';

interface ProductOptionsManagerProps {
  productType: ProductCategory;
  productName: string;
  onOptionsChange?: (options: any) => void;
}

// Options data for different product types
const finishOptions = [
  { name: 'Aquamarine', color: '#7FFFD4', collection: 'Glass Collection' },
  { name: 'Ocean Blue', color: '#006994', collection: 'Glass Collection' },
  { name: 'Sapphire Blue', color: '#0F52BA', collection: 'Glass Collection' },
  { name: 'Night Sky', color: '#2C1810', collection: 'Premium Collection' },
  { name: 'Athens Pearl', color: '#F8F8FF', collection: 'Premium Collection' },
  { name: 'Coastal Bronze', color: '#CD7F32', collection: 'Premium Collection' }
];

const linerOptions = [
  { name: 'Classic Blue', type: 'Standard Vinyl' },
  { name: 'Tropical Paradise', type: 'Premium Vinyl' },
  { name: 'Stone Mosaic', type: 'Porcelain Collection' },
  { name: 'Glass Tile Blue', type: 'Glass Collection' },
  { name: 'Marble Effect', type: 'Premium Collection' }
];

const coverOptions = {
  colors: ['Charcoal', 'Navy Blue', 'Forest Green', 'Sand Beige', 'Arctic White'],
  motorTypes: ['Standard Motor', 'High-Efficiency Motor', 'Smart Motor with WiFi'],
  encasements: ['Standard Aluminum', 'Powder-Coated Steel', 'Stainless Steel Premium']
};

const paverShapes = ['Rectangle', 'Square', 'Hexagon', 'Circle', 'Irregular Stone'];
const paverSizes = ['12" x 12"', '12" x 24"', '18" x 18"', '24" x 24"', '6" x 12"'];
const paverColors = ['Sandstone', 'Charcoal Gray', 'Terra Cotta', 'Ivory', 'Desert Tan', 'Slate Blue'];

const tileTypes = [
  { name: 'Natural Stone', subtypes: ['Travertine', 'Limestone', 'Sandstone', 'Slate'] },
  { name: 'Ceramic', subtypes: ['Glazed', 'Unglazed', 'Porcelain', 'Mosaic'] },
  { name: 'Concrete', subtypes: ['Standard', 'Exposed Aggregate', 'Stamped', 'Polished'] },
  { name: 'Glass', subtypes: ['Recycled', 'Iridescent', 'Frosted', 'Clear'] }
];

const ProductOptionsManager = ({ productType, productName, onOptionsChange }: ProductOptionsManagerProps) => {
  const [selectedOptions, setSelectedOptions] = useState<any>({});

  const updateOptions = (key: string, value: any) => {
    const newOptions = { ...selectedOptions, [key]: value };
    setSelectedOptions(newOptions);
    onOptionsChange?.(newOptions);
  };

  const renderPoolSpaOptions = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Full Customization Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Heating Options */}
          <div>
            <h4 className="font-semibold mb-2">Heating System</h4>
            <Select onValueChange={(value) => updateOptions('heater', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select heating option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Heating</SelectItem>
                <SelectItem value="heat-pump">Heat Pump ($4,500)</SelectItem>
                <SelectItem value="gas">Gas Heater ($3,200)</SelectItem>
                <SelectItem value="solar">Solar Heating ($2,800)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sanitization */}
          <div>
            <h4 className="font-semibold mb-2">Water Sanitization</h4>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="saltwater"
                onCheckedChange={(checked) => updateOptions('saltwater', checked)}
              />
              <label htmlFor="saltwater">Saltwater System (+$2,500)</label>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox 
                id="uv"
                onCheckedChange={(checked) => updateOptions('uv', checked)}
              />
              <label htmlFor="uv">UV Sanitization (+$1,800)</label>
            </div>
          </div>

          {/* Lighting */}
          <div>
            <h4 className="font-semibold mb-2">LED Lighting Package</h4>
            <Select onValueChange={(value) => updateOptions('lighting', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select lighting package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Lighting</SelectItem>
                <SelectItem value="basic">Basic LED Package ($800)</SelectItem>
                <SelectItem value="premium">Premium Color-Changing ($1,500)</SelectItem>
                <SelectItem value="smart">Smart Control System ($2,200)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jets for Spas */}
          {productType === 'spa' && (
            <div>
              <h4 className="font-semibold mb-2">Jet Configuration</h4>
              <Input 
                type="number"
                placeholder="Number of jets"
                onChange={(e) => updateOptions('jetCount', e.target.value)}
              />
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );

  const renderFinishLinerOptions = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alternative {productType === 'finish' ? 'Finishes' : 'Liners'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Carousel className="w-full">
            <CarouselContent>
              {(productType === 'finish' ? finishOptions : linerOptions).map((option, index) => (
                <CarouselItem key={index} className="basis-1/3">
                  <div 
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedOptions.alternative === option.name ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onClick={() => updateOptions('alternative', option.name)}
                  >
                    <div 
                      className="w-full h-16 rounded-md mb-2"
                      style={{ backgroundColor: productType === 'finish' ? (option as any).color : '#4682B4' }}
                    />
                    <p className="text-sm font-medium text-center">{option.name}</p>
                    {productType === 'finish' && (
                      <p className="text-xs text-muted-foreground text-center">{(option as any).collection}</p>
                    )}
                    {productType === 'liner' && (
                      <p className="text-xs text-muted-foreground text-center">{(option as any).type}</p>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
      </Card>
    </div>
  );

  const renderCoverOptions = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cover Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Color Options */}
          <div>
            <h4 className="font-semibold mb-2">Cover Color</h4>
            <div className="grid grid-cols-3 gap-2">
              {coverOptions.colors.map((color) => (
                <Button
                  key={color}
                  variant={selectedOptions.color === color ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateOptions('color', color)}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          {/* Motor Options */}
          <div>
            <h4 className="font-semibold mb-2">Motor Type</h4>
            <Select onValueChange={(value) => updateOptions('motor', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select motor type" />
              </SelectTrigger>
              <SelectContent>
                {coverOptions.motorTypes.map((motor) => (
                  <SelectItem key={motor} value={motor}>{motor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Encasement Options */}
          <div>
            <h4 className="font-semibold mb-2">Encasement Material</h4>
            <Select onValueChange={(value) => updateOptions('encasement', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select encasement material" />
              </SelectTrigger>
              <SelectContent>
                {coverOptions.encasements.map((encasement) => (
                  <SelectItem key={encasement} value={encasement}>{encasement}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>
    </div>
  );

  const renderPaverCopingOptions = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{productType === 'paver' ? 'Paver' : 'Coping'} Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Shape Selection */}
          <div>
            <h4 className="font-semibold mb-2">Shape</h4>
            <div className="grid grid-cols-3 gap-2">
              {paverShapes.map((shape) => (
                <Button
                  key={shape}
                  variant={selectedOptions.shape === shape ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateOptions('shape', shape)}
                >
                  {shape}
                </Button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <h4 className="font-semibold mb-2">Size</h4>
            <Select onValueChange={(value) => updateOptions('size', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {paverSizes.map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection - Only for Coping */}
          {productType === 'coping' && (
            <div>
              <h4 className="font-semibold mb-2">Color</h4>
              <div className="grid grid-cols-3 gap-2">
                {paverColors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedOptions.color === color ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateOptions('color', color)}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Surface Area Calculator */}
          <div>
            <h4 className="font-semibold mb-2">Surface Area Calculator</h4>
            <Input 
              type="number"
              placeholder="Enter surface area (sq ft)"
              onChange={(e) => updateOptions('surfaceArea', e.target.value)}
            />
            {selectedOptions.surfaceArea && (
              <p className="text-sm text-green-600 mt-1">
                Estimated Cost: ${(parseFloat(selectedOptions.surfaceArea) * 15).toLocaleString()} 
                (${selectedOptions.surfaceArea} sq ft × $15/sq ft)
              </p>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );

  const renderTileOptions = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tile Material & Style</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {tileTypes.map((tileType) => (
            <div key={tileType.name}>
              <h4 className="font-semibold mb-2">{tileType.name}</h4>
              <div className="grid grid-cols-2 gap-2">
                {tileType.subtypes.map((subtype) => (
                  <Button
                    key={subtype}
                    variant={selectedOptions.tileType === `${tileType.name}-${subtype}` ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateOptions('tileType', `${tileType.name}-${subtype}`)}
                  >
                    {subtype}
                  </Button>
                ))}
              </div>
              <Separator className="mt-3" />
            </div>
          ))}

          {/* Pattern Selection */}
          <div>
            <h4 className="font-semibold mb-2">Tile Pattern</h4>
            <Select onValueChange={(value) => updateOptions('pattern', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select tile pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight">Straight/Grid Pattern</SelectItem>
                <SelectItem value="herringbone">Herringbone</SelectItem>
                <SelectItem value="basketweave">Basketweave</SelectItem>
                <SelectItem value="diagonal">Diagonal</SelectItem>
                <SelectItem value="random">Random/Natural</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>
    </div>
  );

  const renderOptions = () => {
    switch (productType) {
      case 'pool':
      case 'spa':
      case 'tanning-ledge':
        return renderPoolSpaOptions();
      case 'finish':
      case 'liner':
        return renderFinishLinerOptions();
      case 'cover':
        return renderCoverOptions();
      case 'paver':
      case 'coping':
        return renderPaverCopingOptions();
      case 'tile':
        return renderTileOptions();
      default:
        return <div>No options available for this product type.</div>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">{productName} Options</h3>
        <Badge variant="outline" className="capitalize">{productType}</Badge>
      </div>
      {renderOptions()}
    </div>
  );
};

export default ProductOptionsManager;