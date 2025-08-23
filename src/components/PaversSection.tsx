import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { DollarSign, Calculator, Star, Edit, ShoppingCart } from "lucide-react";
import { paverTypes } from "@/data/paverData";
import { useShoppingCart } from "./ShoppingCart";
import { toast } from "sonner";
import SurveyQuoteTool from "./SurveyQuoteTool";

const PaversSection = () => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedPaverType, setSelectedPaverType] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [surfaceArea, setSurfaceArea] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const { addToCart } = useShoppingCart();

  // Get all Appian Collection pavers from the data
  const appianPavers = paverTypes.filter(paver => 
    paver.id.toLowerCase().includes('appian') || 
    paver.name.toLowerCase().includes('appian')
  );

  const handleOpenOptions = () => {
    setSelectedPaverType(appianPavers[0]); // Default to first Appian paver
    setSelectedColor(appianPavers[0]?.colors[0]); // Default to first color
    setShowOptionsModal(true);
  };

  const calculateTotalPrice = () => {
    if (!selectedPaverType || !selectedColor || !surfaceArea) return 0;
    const area = parseFloat(surfaceArea);
    if (isNaN(area)) return 0;
    return selectedPaverType.basePrice * selectedColor.priceModifier * area;
  };

  const handleAddToCart = () => {
    if (!selectedPaverType || !selectedColor || !surfaceArea) {
      toast.error('Please select all options before adding to cart');
      return;
    }

    const totalPrice = calculateTotalPrice();
    addToCart({
      id: `appian_pavers_${Date.now()}`,
      name: `Appian Collection - ${selectedPaverType.name} (${selectedColor.name})`,
      price: totalPrice,
      category: 'paver',
      image: selectedPaverType.image,
      extras: [
        { name: `Surface Area: ${surfaceArea} sq ft`, price: 0 },
        { name: `Color: ${selectedColor.name}`, price: 0 }
      ]
    });

    toast.success('Added Appian pavers to cart!');
    setShowOptionsModal(false);
  };

  const handleRequestQuote = () => {
    setShowQuoteModal(true);
    setShowOptionsModal(false);
  };

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Premium Pool Pavers
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Transform your pool area with our premium Appian Collection pavers, featuring multiple styles, colors, and finishes.
            </p>
          </div>

          {/* Single Appian Product Card */}
          <div className="max-w-2xl mx-auto">
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
              
              {/* Product Image */}
              <div className="relative w-full h-64 bg-gradient-to-br from-primary/10 to-teal/10 overflow-hidden">
                <img 
                  src={appianPavers[0]?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png'} 
                  alt="Appian Collection Pavers"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-coral to-orange text-white font-medium px-3 py-1">
                    Premium Collection
                  </Badge>
                </div>

                {/* Rating Stars */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="gold" className="text-yellow-500" />
                  ))}
                </div>
              </div>

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Appian Collection Pavers
                </CardTitle>
                <p className="text-muted-foreground">
                  Premium concrete pavers with multiple style and color options. Perfect for pool decks, patios, and walkways.
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                
                {/* Pricing Information */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-teal" />
                  <span className="text-lg font-semibold text-foreground">
                    Starting at $28/sq ft
                  </span>
                  <span className="text-sm text-muted-foreground">
                    (Price varies by style and color)
                  </span>
                </div>

                <Separator />

                {/* Available Styles Preview */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Available Styles ({appianPavers.length} options)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {appianPavers.slice(0, 4).map((paver) => (
                      <div key={paver.id} className="text-center">
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden">
                          <img 
                            src={paver.image} 
                            alt={paver.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-medium">{paver.name.replace('Appian ', '')}</p>
                        <p className="text-xs text-muted-foreground">${paver.basePrice}/sq ft</p>
                      </div>
                    ))}
                  </div>
                  {appianPavers.length > 4 && (
                    <p className="text-sm text-primary text-center font-medium">
                      +{appianPavers.length - 4} more styles available
                    </p>
                  )}
                </div>

                <Separator />

                {/* Key Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Key Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Multiple color options for each style</li>
                    <li>• Slip-resistant surface texture</li>
                    <li>• Freeze-thaw resistant</li>
                    <li>• Easy maintenance and cleaning</li>
                    <li>• Professional installation included</li>
                  </ul>
                </div>

                <Separator />

                {/* Surface Area Calculator */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Quick Price Calculator
                  </h4>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Enter surface area (sq ft)"
                      value={surfaceArea}
                      onChange={(e) => setSurfaceArea(e.target.value)}
                    />
                    {surfaceArea && !isNaN(parseFloat(surfaceArea)) && (
                      <div className="text-sm">
                        <div className="text-green-600 font-medium">
                          Estimated Range: ${(parseFloat(surfaceArea) * 28).toLocaleString()} - ${(parseFloat(surfaceArea) * 36).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on {surfaceArea} sq ft (price varies by style and color selection)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleOpenOptions}
                    variant="gradient"
                    className="w-full hover:scale-105 transition-all duration-300"
                    size="lg"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Customize & Configure
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleRequestQuote}
                      variant="outline"
                      size="sm"
                    >
                      Get Quote
                    </Button>
                    <Button 
                      onClick={handleOpenOptions}
                      variant="outline"
                      size="sm"
                    >
                      View All Options
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Configuration Modal */}
      <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Configure Your Appian Collection Pavers</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            
            {/* Style Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">1. Select Paver Style</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {appianPavers.map((paver) => (
                  <div
                    key={paver.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedPaverType?.id === paver.id ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onClick={() => {
                      setSelectedPaverType(paver);
                      setSelectedColor(paver.colors[0]);
                    }}
                  >
                    <div className="w-full h-20 rounded-md mb-2 overflow-hidden">
                      <img 
                        src={paver.image} 
                        alt={paver.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm font-medium text-center">{paver.name.replace('Appian ', '')}</p>
                    <p className="text-xs text-muted-foreground text-center">${paver.basePrice}/sq ft base</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            {selectedPaverType && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">2. Select Color Option</h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedPaverType.colors.map((color: any) => (
                    <div
                      key={color.name}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedColor?.name === color.name ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      <div 
                        className="w-full h-12 rounded-md mb-2"
                        style={{ backgroundColor: color.hex }}
                      />
                      <p className="text-sm font-medium text-center">{color.name}</p>
                      <p className="text-xs text-muted-foreground text-center">
                        {color.priceModifier !== 1.0 && (
                          <>+{((color.priceModifier - 1) * 100).toFixed(0)}%</>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Surface Area Input */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">3. Enter Surface Area</h3>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Enter total surface area in square feet"
                  value={surfaceArea}
                  onChange={(e) => setSurfaceArea(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Measure the total area where pavers will be installed. Include pool deck, walkways, and patio areas.
                </p>
              </div>
            </div>

            <Separator />

            {/* Price Summary */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Price Summary</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    ${calculateTotalPrice().toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total installed price
                  </div>
                </div>
              </div>
              
              {selectedPaverType && selectedColor && surfaceArea && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Style:</span>
                    <span>{selectedPaverType.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Color:</span>
                    <span>{selectedColor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surface Area:</span>
                    <span>{surfaceArea} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per sq ft:</span>
                    <span>${(selectedPaverType.basePrice * selectedColor.priceModifier).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowOptionsModal(false)}
              >
                Close
              </Button>
              <Button 
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!selectedPaverType || !selectedColor || !surfaceArea}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart - ${calculateTotalPrice().toLocaleString()}
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* Quote Modal */}
      <SurveyQuoteTool 
        pool={null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        customProduct={{
          name: 'Appian Collection Pavers',
          price: calculateTotalPrice() || 0,
          type: 'paver'
        }}
      />
    </>
  );
};

export default PaversSection;