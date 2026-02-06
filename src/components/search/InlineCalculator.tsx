import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { paverTypes } from '@/data/paverData';
import { cn } from '@/lib/utils';

interface InlineCalculatorProps {
  type: 'pavers' | 'screen' | 'fence' | 'lanai' | 'pool';
  onResult: (result: string) => void;
}

const PRICING = {
  screen: { standard: 22, deluxe: 24, premium: 26, unit: 'sqft' },
  fence: { standard: 45, premium: 65, unit: 'linear ft' },
  lanai: { standard: 60, deluxe: 80, premium: 100, unit: 'sqft' },
};

export function InlineCalculator({ type, onResult }: InlineCalculatorProps) {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [tier, setTier] = useState('standard');
  const [selectedPaver, setSelectedPaver] = useState<typeof paverTypes[0] | null>(null);
  const [result, setResult] = useState<{ sqft: number; total: number } | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Filter to show only pavers (not coping)
  const pavers = paverTypes.filter(p => p.category === 'paver');

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 200;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const calculate = () => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;

    let area = 0;
    let totalPrice = 0;

    switch (type) {
      case 'pavers':
        area = l * w;
        if (selectedPaver) {
          totalPrice = area * selectedPaver.basePrice;
        } else {
          // Default to average price if no paver selected
          totalPrice = area * 30;
        }
        break;
      case 'lanai':
        area = l * w;
        const lanaiPrice = tier === 'premium' ? PRICING.lanai.premium : 
                          tier === 'deluxe' ? PRICING.lanai.deluxe : PRICING.lanai.standard;
        totalPrice = area * lanaiPrice;
        break;
      case 'screen':
        const wallArea = 2 * (l + w) * h;
        const roofArea = l * w;
        area = wallArea + roofArea;
        const screenPrice = tier === 'premium' ? PRICING.screen.premium : PRICING.screen.standard;
        totalPrice = area * screenPrice;
        break;
      case 'fence':
        area = l;
        const fencePrice = tier === 'premium' ? PRICING.fence.premium : PRICING.fence.standard;
        totalPrice = area * fencePrice;
        break;
      case 'pool':
        area = l * w;
        if (area < 200) {
          totalPrice = 55000;
        } else if (area < 350) {
          totalPrice = 75000;
        } else {
          totalPrice = 100000;
        }
        break;
    }

    const newResult = { sqft: Math.round(area), total: Math.round(totalPrice) };
    setResult(newResult);
    
    const paverName = selectedPaver ? ` (${selectedPaver.name})` : '';
    const resultText = `${area} ${type === 'fence' ? 'linear ft' : 'sqft'}${paverName} = $${totalPrice.toLocaleString()}`;
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

      {/* Paver Carousel - Only show for pavers type */}
      {type === 'pavers' && (
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Select Paver Style</Label>
          <div className="relative">
            {/* Left Arrow */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
              onClick={() => scrollCarousel('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Carousel Container */}
            <div 
              ref={carouselRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide px-8 py-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {pavers.map((paver) => (
                <button
                  key={paver.id}
                  type="button"
                  onClick={() => setSelectedPaver(paver)}
                  className={cn(
                    "flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                    selectedPaver?.id === paver.id 
                      ? "border-green-500 ring-2 ring-green-500/30" 
                      : "border-border hover:border-green-500/50"
                  )}
                >
                  <img 
                    src={paver.image} 
                    alt={paver.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedPaver?.id === paver.id && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-white drop-shadow-lg" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                    <p className="text-[9px] text-white truncate">{paver.name.replace('Appian ', '').replace('Catalina ', '').replace('Grana ', '')}</p>
                    <p className="text-[8px] text-green-400">${paver.basePrice}/sqft</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Arrow */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
              onClick={() => scrollCarousel('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Selected Paver Info */}
          {selectedPaver && (
            <div className="mt-2 text-xs text-center text-green-600">
              Selected: {selectedPaver.name} - ${selectedPaver.basePrice}/sqft
            </div>
          )}
        </div>
      )}
      
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
            disabled={type === 'pavers' && !selectedPaver}
            className="h-8 w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            Calculate
          </Button>
        </div>
      </div>
      
      {result && (
        <div className="mt-3 p-2 rounded bg-background border border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {result.sqft.toLocaleString()} {type === 'fence' ? 'linear ft' : 'sqft'}
            {selectedPaver && <span className="text-green-600 ml-1">({selectedPaver.name})</span>}
          </span>
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <DollarSign className="h-4 w-4" />
            <span>{result.total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
