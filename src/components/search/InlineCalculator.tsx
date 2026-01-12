import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign } from 'lucide-react';

interface InlineCalculatorProps {
  type: 'pavers' | 'screen' | 'fence' | 'lanai' | 'pool';
  onResult: (result: string) => void;
}

const PRICING = {
  pavers: { min: 28, max: 36, unit: 'sqft' },
  screen: { standard: 27, premium: 33, unit: 'sqft' },
  fence: { standard: 45, premium: 65, unit: 'linear ft' },
  lanai: { standard: 60, deluxe: 80, premium: 100, unit: 'sqft' },
};

export function InlineCalculator({ type, onResult }: InlineCalculatorProps) {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [tier, setTier] = useState('standard');
  const [result, setResult] = useState<{ sqft: number; min: number; max: number } | null>(null);

  const calculate = () => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;

    let area = 0;
    let minPrice = 0;
    let maxPrice = 0;

    switch (type) {
      case 'pavers':
      case 'lanai':
        area = l * w;
        if (type === 'pavers') {
          minPrice = area * PRICING.pavers.min;
          maxPrice = area * PRICING.pavers.max;
        } else {
          const lanaiPrice = tier === 'premium' ? PRICING.lanai.premium : 
                            tier === 'deluxe' ? PRICING.lanai.deluxe : PRICING.lanai.standard;
          minPrice = maxPrice = area * lanaiPrice;
        }
        break;
      case 'screen':
        // Wall area + roof area
        const wallArea = 2 * (l + w) * h;
        const roofArea = l * w;
        area = wallArea + roofArea;
        const screenPrice = tier === 'premium' ? PRICING.screen.premium : PRICING.screen.standard;
        minPrice = maxPrice = area * screenPrice;
        break;
      case 'fence':
        // Perimeter calculation
        area = l; // linear feet
        const fencePrice = tier === 'premium' ? PRICING.fence.premium : PRICING.fence.standard;
        minPrice = maxPrice = area * fencePrice;
        break;
      case 'pool':
        area = l * w;
        // Pool pricing is complex, show range based on size
        if (area < 200) {
          minPrice = 45000; maxPrice = 60000;
        } else if (area < 350) {
          minPrice = 60000; maxPrice = 85000;
        } else {
          minPrice = 85000; maxPrice = 140000;
        }
        break;
    }

    const newResult = { sqft: Math.round(area), min: Math.round(minPrice), max: Math.round(maxPrice) };
    setResult(newResult);
    
    const resultText = minPrice === maxPrice 
      ? `${area} ${type === 'fence' ? 'linear ft' : 'sqft'} = $${minPrice.toLocaleString()}`
      : `${area} sqft = $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`;
    onResult(resultText);
  };

  const getLabel = () => {
    switch (type) {
      case 'pavers': return 'Paver Area';
      case 'screen': return 'Screen Enclosure';
      case 'fence': return 'Fence Length';
      case 'lanai': return 'Lanai Area';
      case 'pool': return 'Pool Size';
      default: return 'Calculator';
    }
  };

  return (
    <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-4 w-4 text-green-600" />
        <span className="text-sm font-medium text-foreground">{getLabel()} Calculator</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">
            {type === 'fence' ? 'Linear Feet' : 'Length (ft)'}
          </Label>
          <Input
            type="number"
            placeholder="0"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        
        {type !== 'fence' && (
          <div>
            <Label className="text-xs text-muted-foreground">Width (ft)</Label>
            <Input
              type="number"
              placeholder="0"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        )}
        
        {type === 'screen' && (
          <div>
            <Label className="text-xs text-muted-foreground">Height (ft)</Label>
            <Input
              type="number"
              placeholder="10"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        )}
        
        {(type === 'screen' || type === 'fence' || type === 'lanai') && (
          <div>
            <Label className="text-xs text-muted-foreground">Tier</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="standard">Standard</SelectItem>
                {type === 'lanai' && <SelectItem value="deluxe">Deluxe</SelectItem>}
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex items-end">
          <Button 
            size="sm" 
            onClick={calculate}
            className="h-8 w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Calculate
          </Button>
        </div>
      </div>
      
      {result && (
        <div className="mt-3 p-2 rounded bg-background border border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {result.sqft.toLocaleString()} {type === 'fence' ? 'linear ft' : 'sqft'}
          </span>
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <DollarSign className="h-4 w-4" />
            <span>
              {result.min === result.max 
                ? result.min.toLocaleString()
                : `${result.min.toLocaleString()} - ${result.max.toLocaleString()}`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
