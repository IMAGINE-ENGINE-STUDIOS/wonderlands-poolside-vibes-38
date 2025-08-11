import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Waves, DollarSign, ShoppingCart, Star, Ruler, Thermometer, Zap, Flame, Palette } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { useShoppingCart } from "./ShoppingCart";
import { spas } from "./PoolCatalog";
import { poolLiners, poolTiles } from "../data/poolData";

interface Spa {
  model: string;
  price: number;
  image?: string;
  category: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  spilloverFeature?: boolean;
  installationTimeWeeks?: number;
  warrantyYears?: number | string;
}

interface SpaExtras {
  finish: string;
  liner: string;
  tiles: string;
  heater: boolean;
  jets: boolean;
}

const SpaSection = () => {
  const [selectedSpa, setSelectedSpa] = useState<Spa | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({});
  const [spaExtras, setSpaExtras] = useState<{[key: string]: SpaExtras}>({});
  const { addToCart } = useShoppingCart();

  const getExtraPrice = (extra: string) => {
    switch (extra) {
      case 'heater': return 3500;
      case 'jets': return 2500;
      default: return 0;
    }
  };

  // Pool finishes data
  const poolFinishes = [
    { name: 'Ocean Blue' }, { name: 'Sapphire Blue' }, { name: 'Aquamarine' }, { name: 'Night Sky' }
  ];

  const initializeSpaExtras = (spaModel: string) => {
    if (!spaExtras[spaModel]) {
      setSpaExtras(prev => ({
        ...prev,
        [spaModel]: {
          finish: poolFinishes[0]?.name || '',
          liner: poolLiners[0]?.name || '',
          tiles: poolTiles[0]?.name || '',
          heater: false,
          jets: false,
        }
      }));
    }
  };

  const toggleSpaExtra = (spaModel: string, extra: keyof SpaExtras) => {
    setSpaExtras(prev => ({
      ...prev,
      [spaModel]: {
        ...prev[spaModel],
        [extra]: typeof prev[spaModel]?.[extra] === 'boolean' 
          ? !prev[spaModel][extra] 
          : prev[spaModel]?.[extra] || ''
      }
    }));
  };

  const setSpaExtra = (spaModel: string, extra: keyof SpaExtras, value: any) => {
    setSpaExtras(prev => ({
      ...prev,
      [spaModel]: {
        ...prev[spaModel],
        finish: extra === 'finish' ? value : prev[spaModel]?.finish || '',
        liner: extra === 'liner' ? value : prev[spaModel]?.liner || '',
        tiles: extra === 'tiles' ? value : prev[spaModel]?.tiles || '',
        heater: extra === 'heater' ? value : prev[spaModel]?.heater || false,
        jets: extra === 'jets' ? value : prev[spaModel]?.jets || false,
      }
    }));
  };

  const calculateSpaTotal = (spa: Spa) => {
    const extras = spaExtras[spa.model];
    let total = spa.price;
    
    if (extras?.heater) total += getExtraPrice('heater');
    if (extras?.jets) total += getExtraPrice('jets');
    
    return total;
  };

  const handleSpaClick = (spa: Spa) => {
    setSelectedSpa(spa);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (spa: Spa) => {
    setSelectedSpa(spa);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  const handleAddToCart = (spa: Spa) => {
    const extras = spaExtras[spa.model];
    const extrasArray = [];
    
    if (extras?.finish) extrasArray.push(`Finish: ${extras.finish}`);
    if (extras?.liner) extrasArray.push(`Liner: ${extras.liner}`);
    if (extras?.tiles) extrasArray.push(`Tiles: ${extras.tiles}`);
    if (extras?.heater) extrasArray.push('Heater');
    if (extras?.jets) extrasArray.push('Spa Jets');
    
    addToCart({
      id: `spa_${spa.model.replace(/\s+/g, '_')}_${Date.now()}`,
      name: `${spa.model} Spa`,
      price: calculateSpaTotal(spa),
      category: 'spa',
      image: spa.image,
      extras: extrasArray
    });
  };

  const toggleDetails = (spaModel: string) => {
    setShowDetails(prev => ({
      ...prev,
      [spaModel]: !prev[spaModel]
    }));
    initializeSpaExtras(spaModel);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium': return 'bg-gradient-to-r from-amber-500 to-orange-500';
      case 'deluxe': return 'bg-gradient-to-r from-primary to-teal';
      case 'standard': return 'bg-gradient-to-r from-secondary to-accent';
      default: return 'bg-gradient-to-r from-primary to-teal';
    }
  };

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-background to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal to-blue-500">
              Luxury Spa Collection
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Complete your pool experience with our premium spa collection. Designed for ultimate relaxation and therapeutic benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spas.map((spa, index) => {
              const currentExtras = spaExtras[spa.model];
              const isDetailsShown = showDetails[spa.model];
              
              return (
              <Card 
                key={spa.model} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getCategoryColor(spa.category)} text-white font-medium px-3 py-1 capitalize`}>
                      <span className="flex items-center gap-1">
                        <Waves size={16} />
                        {spa.category}
                      </span>
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {spa.model}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Spa Preview */}
                  <div 
                    className="w-full h-32 rounded-lg overflow-hidden border-2 border-muted bg-gradient-to-br from-primary/20 to-teal/20 cursor-pointer"
                    onClick={() => toggleDetails(spa.model)}
                  >
                    {spa.image ? (
                      <img 
                        src={spa.image} 
                        alt={spa.model}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Waves size={32} className="text-primary/60 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">{spa.model}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">
                      ${calculateSpaTotal(spa).toLocaleString()}
                    </span>
                    {isDetailsShown && calculateSpaTotal(spa) !== spa.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${spa.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Specifications */}
                  {spa.dimensions && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">{spa.dimensions}</span>
                      </div>
                      {spa.depth && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Depth:</span>
                          <span className="font-medium">{spa.depth}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Key Features */}
                  {spa.features && spa.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Features:</h4>
                      <ul className="space-y-1">
                        {spa.features.slice(0, 2).map((feature, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Customization Options */}
                  {isDetailsShown && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-semibold text-sm">Customize Your Spa</h4>
                      
                      {/* Finishes */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Palette size={12} />
                          Finish:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {poolFinishes.slice(0, 4).map((finish: any) => (
                            <button
                              key={finish.name}
                              onClick={() => setSpaExtra(spa.model, 'finish', finish.name)}
                              className={`p-2 text-xs rounded-md border transition-all ${
                                currentExtras?.finish === finish.name 
                                  ? 'border-primary bg-primary/10 text-primary' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {finish.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tiles */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Tiles:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {poolTiles.slice(0, 4).map((tile: any) => (
                            <button
                              key={tile.name}
                              onClick={() => setSpaExtra(spa.model, 'tiles', tile.name)}
                              className={`p-2 text-xs rounded-md border transition-all ${
                                currentExtras?.tiles === tile.name 
                                  ? 'border-teal bg-teal/10 text-teal' 
                                  : 'border-border hover:border-teal/50'
                              }`}
                            >
                              {tile.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Liners */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Liners:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {poolLiners.slice(0, 4).map((liner: any) => (
                            <button
                              key={liner.name}
                              onClick={() => setSpaExtra(spa.model, 'liner', liner.name)}
                              className={`p-2 text-xs rounded-md border transition-all ${
                                currentExtras?.liner === liner.name 
                                  ? 'border-secondary bg-secondary/10 text-secondary' 
                                  : 'border-border hover:border-secondary/50'
                              }`}
                            >
                              {liner.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Add-ons */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Add-ons:</label>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <Checkbox 
                              checked={currentExtras?.heater || false}
                              onCheckedChange={() => toggleSpaExtra(spa.model, 'heater')}
                            />
                            <div className="flex items-center space-x-1">
                              <Flame size={16} className="text-red-500" />
                              <span className="text-sm">Heater (+${getExtraPrice('heater').toLocaleString()})</span>
                            </div>
                          </label>
                          
                          <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <Checkbox 
                              checked={currentExtras?.jets || false}
                              onCheckedChange={() => toggleSpaExtra(spa.model, 'jets')}
                            />
                            <div className="flex items-center space-x-1">
                              <Zap size={16} className="text-orange" />
                              <span className="text-sm">Spa Jets (+${getExtraPrice('jets').toLocaleString()})</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleSpaClick(spa)}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            Details
                          </Button>
                          <Button 
                            onClick={() => handleRequestQuote(spa)}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            Quote
                          </Button>
                        </div>
                        
                        <Button
                          onClick={() => handleAddToCart(spa)}
                          variant="gradient"
                          className="w-full hover:scale-105 transition-all duration-300"
                          size="sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart - ${calculateSpaTotal(spa).toLocaleString()}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Default Action Button */}
                  {!isDetailsShown && (
                    <Button 
                      onClick={() => handleSpaClick(spa)}
                      variant="gradient"
                      className="w-full hover:scale-105 transition-all duration-300"
                      size="sm"
                    >
                      View Details
                    </Button>
                  )}
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Spa Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSpa && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedSpa.model} Spa</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {selectedSpa.image ? (
                    <img 
                      src={selectedSpa.image} 
                      alt={selectedSpa.model}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-teal/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Waves size={48} className="text-primary/60 mx-auto mb-2" />
                        <p className="text-lg text-muted-foreground">{selectedSpa.model}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-4">
                    <Badge className={`${getCategoryColor(selectedSpa.category)} text-white capitalize`}>
                      {selectedSpa.category} Spa
                    </Badge>
                    
                    {selectedSpa.dimensions && (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-primary" />
                          <span className="font-medium">Dimensions: {selectedSpa.dimensions}</span>
                        </div>
                        {selectedSpa.depth && (
                          <div className="flex items-center gap-2">
                            <Waves className="h-4 w-4 text-primary" />
                            <span className="font-medium">Depth: {selectedSpa.depth}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedSpa.features && selectedSpa.features.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Features:</h4>
                        <ul className="space-y-1">
                          {selectedSpa.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedSpa.spilloverFeature && (
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm text-primary font-medium">
                          ✨ Includes spillover feature for seamless pool integration
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold text-foreground">
                      ${calculateSpaTotal(selectedSpa).toLocaleString()}
                    </span>
                    {calculateSpaTotal(selectedSpa) !== selectedSpa.price && (
                      <span className="text-lg text-muted-foreground line-through">
                        ${selectedSpa.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Customization Options */}
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-lg">Customize Your Spa</h4>
                    
                    {/* Finishes */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Palette size={16} />
                        Finish:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {poolFinishes.map((finish: any) => (
                          <button
                            key={finish.name}
                            onClick={() => {
                              initializeSpaExtras(selectedSpa.model);
                              setSpaExtra(selectedSpa.model, 'finish', finish.name);
                            }}
                            className={`p-3 text-sm rounded-md border transition-all ${
                              spaExtras[selectedSpa.model]?.finish === finish.name 
                                ? 'border-primary bg-primary/10 text-primary' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            {finish.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tiles */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-muted-foreground">Tiles:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {poolTiles.slice(0, 6).map((tile: any) => (
                          <button
                            key={tile.name}
                            onClick={() => {
                              initializeSpaExtras(selectedSpa.model);
                              setSpaExtra(selectedSpa.model, 'tiles', tile.name);
                            }}
                            className={`p-3 text-sm rounded-md border transition-all ${
                              spaExtras[selectedSpa.model]?.tiles === tile.name 
                                ? 'border-teal bg-teal/10 text-teal' 
                                : 'border-border hover:border-teal/50'
                            }`}
                          >
                            {tile.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Liners */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-muted-foreground">Liners:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {poolLiners.slice(0, 6).map((liner: any) => (
                          <button
                            key={liner.name}
                            onClick={() => {
                              initializeSpaExtras(selectedSpa.model);
                              setSpaExtra(selectedSpa.model, 'liner', liner.name);
                            }}
                            className={`p-3 text-sm rounded-md border transition-all ${
                              spaExtras[selectedSpa.model]?.liner === liner.name 
                                ? 'border-secondary bg-secondary/10 text-secondary' 
                                : 'border-border hover:border-secondary/50'
                            }`}
                          >
                            {liner.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Add-ons */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-muted-foreground">Add-ons:</label>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                          <Checkbox 
                            checked={spaExtras[selectedSpa.model]?.heater || false}
                            onCheckedChange={() => {
                              initializeSpaExtras(selectedSpa.model);
                              toggleSpaExtra(selectedSpa.model, 'heater');
                            }}
                          />
                          <div className="flex items-center space-x-2">
                            <Flame size={20} className="text-red-500" />
                            <span className="text-sm font-medium">Spa Heater</span>
                            <span className="text-sm text-muted-foreground">(+${getExtraPrice('heater').toLocaleString()})</span>
                          </div>
                        </label>
                        
                        <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                          <Checkbox 
                            checked={spaExtras[selectedSpa.model]?.jets || false}
                            onCheckedChange={() => {
                              initializeSpaExtras(selectedSpa.model);
                              toggleSpaExtra(selectedSpa.model, 'jets');
                            }}
                          />
                          <div className="flex items-center space-x-2">
                            <Zap size={20} className="text-orange" />
                            <span className="text-sm font-medium">Premium Spa Jets</span>
                            <span className="text-sm text-muted-foreground">(+${getExtraPrice('jets').toLocaleString()})</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        initializeSpaExtras(selectedSpa.model);
                        handleAddToCart(selectedSpa);
                        setShowDetailModal(false);
                      }}
                      variant="gradient"
                      className="w-full hover:scale-105 transition-all duration-300"
                      size="lg"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart - ${calculateSpaTotal(selectedSpa).toLocaleString()}
                    </Button>
                    
                    <Button 
                      onClick={() => handleRequestQuote(selectedSpa)}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      Get Custom Quote
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <SurveyQuoteTool 
        pool={null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        customProduct={selectedSpa ? {
          name: `${selectedSpa.model} Spa`,
          price: selectedSpa.price,
          type: 'spa'
        } : undefined}
      />
    </>
  );
};

export default SpaSection;