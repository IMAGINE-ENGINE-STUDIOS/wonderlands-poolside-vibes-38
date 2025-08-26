
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronLeft, ChevronRight, Palette, Waves, Umbrella, Droplets } from 'lucide-react';
import { spas } from '@/data/spaData';

export interface Pool {
  id?: string;
  model: string;
  price: number;
  category?: string;
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  finishes?: string[];
  liners?: string[];
  covers?: string[];
  warrantyYears?: number | string;
}

interface PoolProductCardProps {
  pool: Pool;
  onViewDetails: (pool: Pool) => void;
  onRequestQuote: (pool: Pool) => void;
}

const PoolProductCard = ({ pool, onViewDetails, onRequestQuote }: PoolProductCardProps) => {
  const [selectedFinish, setSelectedFinish] = useState('');
  const [selectedLiner, setSelectedLiner] = useState('');
  const [selectedCover, setSelectedCover] = useState('');
  const [selectedSpa, setSelectedSpa] = useState('');
  const [currentSpaIndex, setCurrentSpaIndex] = useState(0);
  
  const finishScrollRef = useRef<HTMLDivElement>(null);
  const linerScrollRef = useRef<HTMLDivElement>(null);
  const coverScrollRef = useRef<HTMLDivElement>(null);
  const spaScrollRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? ref.current.scrollLeft - scrollAmount 
        : ref.current.scrollLeft + scrollAmount;
      ref.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const nextSpa = () => {
    setCurrentSpaIndex((prev) => (prev + 1) % spas.length);
  };

  const prevSpa = () => {
    setCurrentSpaIndex((prev) => (prev - 1 + spas.length) % spas.length);
  };

  const calculatePrice = () => {
    let totalPrice = pool.price;
    
    // Add spa cost (jet price is $1800 per jet, assuming 6 jets for standard spa)
    if (selectedSpa) {
      const selectedSpaData = spas.find(s => s.model === selectedSpa);
      if (selectedSpaData) {
        totalPrice += selectedSpaData.price;
      }
    }
    
    // Add liner cost
    if (selectedLiner) {
      totalPrice += 3800; // All liners cost $3800
    }
    
    // Add cover cost
    if (selectedCover) {
      totalPrice += 2500; // Standard cover cost
    }
    
    return totalPrice;
  };

  const finishes = [
    { name: 'Ocean Blue', color: '#006B96', image: '/src/assets/finishes/ocean-blue-g3.jpg' },
    { name: 'Sapphire Blue', color: '#1E3A8A', image: '/src/assets/finishes/sapphire-blue-g3.jpg' },
    { name: 'Aquamarine', color: '#22D3EE', image: '/src/assets/finishes/aquamarine-g3.jpg' },
    { name: 'Lagoon Blue', color: '#0891B2', image: '/src/assets/finishes/lagoon-blue-g2.jpg' },
    { name: 'Azure Blue', color: '#3B82F6', image: '/src/assets/finishes/azure-blue-g2.jpg' },
    { name: 'Night Sky', color: '#1E1B4B', image: '/src/assets/finishes/night-sky-g3.jpg' },
    { name: 'Shale Gray', color: '#64748B', image: '/src/assets/finishes/shale-gray-g3.jpg' },
    { name: 'Athens Pearl White', color: '#F8FAFC', image: '/src/assets/finishes/athens-pearl-white-g3.jpg' },
    { name: 'Coastal Bronze', color: '#92400E', image: '/src/assets/finishes/coastal-bronze-g3.jpg' }
  ];

  const liners = [
    { name: 'Premium Vinyl Liner', price: 3800, description: 'Durable 20-mil vinyl' },
    { name: 'Designer Pattern Liner', price: 3800, description: 'Custom decorative patterns' },
    { name: 'Heavy Duty Liner', price: 3800, description: '28-mil commercial grade' }
  ];

  const covers = [
    { name: 'Safety Cover', price: 2500, description: 'Mesh safety cover' },
    { name: 'Solar Cover', price: 2500, description: 'Heat retention cover' },
    { name: 'Winter Cover', price: 2500, description: 'Heavy duty winter protection' }
  ];

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-200">
      <CardHeader className="pb-3">
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg mb-3 overflow-hidden">
          {pool.image ? (
            <img 
              src={pool.image} 
              alt={pool.model}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Waves className="h-12 w-12" />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <CardTitle className="text-lg font-semibold text-center">
            {pool.model}
          </CardTitle>
          
          {pool.category && (
            <Badge variant="secondary" className="mx-auto block w-fit">
              {pool.category.charAt(0).toUpperCase() + pool.category.slice(1)}
            </Badge>
          )}
          
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">
              ${calculatePrice().toLocaleString()}
            </div>
            {calculatePrice() !== pool.price && (
              <div className="text-sm text-gray-500 line-through">
                ${pool.price.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {pool.dimensions && (
          <div className="text-sm text-center text-gray-600">
            {pool.dimensions} • {pool.depth}
          </div>
        )}

        {/* Additional Features Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full">
              <Palette className="h-4 w-4 mr-2" />
              Additional Features
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-white">
            {/* Pool Finishes Section */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  Pool Finishes
                </h4>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => scrollCarousel(finishScrollRef, 'left')}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => scrollCarousel(finishScrollRef, 'right')}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div 
                ref={finishScrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {finishes.map((finish) => (
                  <div
                    key={finish.name}
                    className={`flex-shrink-0 cursor-pointer p-2 rounded-lg border text-center min-w-[80px] ${
                      selectedFinish === finish.name ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFinish(selectedFinish === finish.name ? '' : finish.name)}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-1 border"
                      style={{ backgroundColor: finish.color }}
                    />
                    <div className="text-xs font-medium truncate">{finish.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Liners Section */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm flex items-center">
                  <Droplets className="h-4 w-4 mr-2" />
                  Liners ($3,800)
                </h4>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => scrollCarousel(linerScrollRef, 'left')}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => scrollCarousel(linerScrollRef, 'right')}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div 
                ref={linerScrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
              >
                {liners.map((liner) => (
                  <div
                    key={liner.name}
                    className={`flex-shrink-0 cursor-pointer p-2 rounded-lg border text-center min-w-[120px] ${
                      selectedLiner === liner.name ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedLiner(selectedLiner === liner.name ? '' : liner.name)}
                  >
                    <div className="text-xs font-medium">{liner.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{liner.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Covers Section */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm flex items-center">
                  <Umbrella className="h-4 w-4 mr-2" />
                  Pool Covers
                </h4>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => scrollCarousel(coverScrollRef, 'left')}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => scrollCarousel(coverScrollRef, 'right')}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div 
                ref={coverScrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
              >
                {covers.map((cover) => (
                  <div
                    key={cover.name}
                    className={`flex-shrink-0 cursor-pointer p-2 rounded-lg border text-center min-w-[100px] ${
                      selectedCover === cover.name ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCover(selectedCover === cover.name ? '' : cover.name)}
                  >
                    <div className="text-xs font-medium">{cover.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{cover.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Spas Section */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm flex items-center">
                  <Waves className="h-4 w-4 mr-2" />
                  Add Spa
                </h4>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={prevSpa}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={nextSpa}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {spas.length > 0 && (
                  <div
                    className={`cursor-pointer p-3 rounded-lg border ${
                      selectedSpa === spas[currentSpaIndex].model ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSpa(selectedSpa === spas[currentSpaIndex].model ? '' : spas[currentSpaIndex].model)}
                  >
                    <div className="flex items-center gap-3">
                      {spas[currentSpaIndex].image && (
                        <img 
                          src={spas[currentSpaIndex].image} 
                          alt={spas[currentSpaIndex].model}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{spas[currentSpaIndex].model}</div>
                        <div className="text-xs text-gray-500">${spas[currentSpaIndex].price.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{spas[currentSpaIndex].dimensions}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full" 
            onClick={() => onViewDetails(pool)}
          >
            View Details
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => onRequestQuote({
              ...pool,
              price: calculatePrice(),
              selectedFeatures: {
                finish: selectedFinish,
                liner: selectedLiner,
                cover: selectedCover,
                spa: selectedSpa
              }
            } as Pool)}
          >
            Request Quote
          </Button>
        </div>

        {/* Selected Features Summary */}
        {(selectedFinish || selectedLiner || selectedCover || selectedSpa) && (
          <div className="text-xs text-gray-600 space-y-1 pt-2 border-t">
            <div className="font-medium">Selected Options:</div>
            {selectedFinish && <div>• Finish: {selectedFinish}</div>}
            {selectedLiner && <div>• Liner: {selectedLiner} (+$3,800)</div>}
            {selectedCover && <div>• Cover: {selectedCover} (+$2,500)</div>}
            {selectedSpa && <div>• Spa: {selectedSpa} (+${spas.find(s => s.model === selectedSpa)?.price.toLocaleString()})</div>}
          </div>
        )}

        {pool.features && pool.features.length > 0 && (
          <div className="text-xs text-gray-600">
            <div className="font-medium mb-1">Included Features:</div>
            <ul className="space-y-1">
              {pool.features.slice(0, 3).map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
              {pool.features.length > 3 && (
                <li className="text-gray-500">• +{pool.features.length - 3} more features</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PoolProductCard;
