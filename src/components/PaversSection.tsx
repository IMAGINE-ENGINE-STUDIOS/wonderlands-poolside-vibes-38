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
  const [surfaceArea, setSurfaceArea] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<'appian' | 'catalina-grana' | 'catalina'>('appian');
  const { addToCart } = useShoppingCart();

  // Get collections from the data
  const appianPavers = paverTypes.filter(paver => 
    paver.id.toLowerCase().includes('appian') && !paver.id.toLowerCase().includes('catalina')
  );
  
  const catalinaGranaPavers = paverTypes.filter(paver => 
    paver.id.toLowerCase().includes('catalina') && paver.name.includes('Grana')
  );

  const catalinaPavers = paverTypes.filter(paver => 
    paver.id.toLowerCase().includes('catalina') && !paver.name.includes('Grana')
  );

  const handleOpenOptions = () => {
    setSelectedPaverType(appianPavers[0]); // Default to first Appian paver
    setShowOptionsModal(true);
  };

  const calculateTotalPrice = () => {
    if (!selectedPaverType || !surfaceArea) return 0;
    const area = parseFloat(surfaceArea);
    if (isNaN(area)) return 0;
    return 15 * area; // All pavers are $15/sq ft
  };

  const handleAddToCart = () => {
    if (!selectedPaverType || !surfaceArea) {
      toast.error('Please select paver style and surface area');
      return;
    }

    const totalPrice = calculateTotalPrice();
    let collectionName = '';
    if (selectedCollection === 'appian') collectionName = 'Appian Collection';
    else if (selectedCollection === 'catalina-grana') collectionName = 'Catalina Grana Collection';
    else collectionName = 'Catalina Collection';
    
    addToCart({
      id: `${selectedCollection}_pavers_${Date.now()}`,
      name: `${collectionName} - ${selectedPaverType.name}`,
      price: totalPrice,
      category: 'paver',
      image: selectedPaverType.image,
      extras: [
        { name: `Surface Area: ${surfaceArea} sq ft`, price: 0 }
      ]
    });

    toast.success(`Added ${collectionName} pavers to cart!`);
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
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-6">
              Transform your pool area with our premium paver collections, featuring multiple styles and finishes.
            </p>
            <div className="mt-6">
              <Button 
                onClick={() => window.open('/belgard-studio', '_blank')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                🏗️ Open Belgard Studio
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Design & configure your complete hardscape project
              </p>
            </div>
          </div>

          {/* Three Collections Grid */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-full mx-auto">
            {/* First Card - Appian Collection */}
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
                  Premium concrete pavers with multiple style options. Perfect for pool decks, patios, and walkways.
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                
                {/* Pricing Information */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-teal" />
                  <span className="text-lg font-semibold text-foreground">
                    $15/sq ft
                  </span>
                  <span className="text-sm text-muted-foreground">
                    (All styles same price)
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
                        <p className="text-xs text-muted-foreground">$15/sq ft</p>
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
                    <li>• Multiple style options</li>
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
                          Total Cost: ${(parseFloat(surfaceArea) * 15).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on {surfaceArea} sq ft × $15/sq ft
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      setSelectedCollection('appian');
                      setSelectedPaverType(appianPavers[0]);
                      setShowOptionsModal(true);
                    }}
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
                      onClick={() => {
                        setSelectedCollection('appian');
                        setSelectedPaverType(appianPavers[0]);
                        setShowOptionsModal(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      View All Options
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Second Card - Catalina Grana Collection */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
              
              {/* Product Image */}
              <div className="relative w-full h-64 bg-gradient-to-br from-teal/10 to-coral/10 overflow-hidden">
                <img 
                  src={catalinaGranaPavers[0]?.image || '/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png'} 
                  alt="Catalina Grana Collection Pavers"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-teal to-coral text-white font-medium px-3 py-1">
                    Grana Collection
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
                <CardTitle className="text-2xl font-bold text-foreground group-hover:text-teal transition-colors">
                  Catalina Grana Collection
                </CardTitle>
                <p className="text-muted-foreground">
                  Contemporary Grana collection with refined textures and sophisticated styling. Ideal for modern pool environments.
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                
                {/* Pricing Information */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-coral" />
                  <span className="text-lg font-semibold text-foreground">
                    $15/sq ft
                  </span>
                  <span className="text-sm text-muted-foreground">
                    (All styles same price)
                  </span>
                </div>

                <Separator />

                {/* Available Styles Preview */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Available Styles ({catalinaGranaPavers.length} options)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {catalinaGranaPavers.slice(0, 4).map((paver) => (
                      <div key={paver.id} className="text-center">
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden">
                          <img 
                            src={paver.image} 
                            alt={paver.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-medium">{paver.name.replace('Catalina Grana ', '')}</p>
                        <p className="text-xs text-muted-foreground">$15/sq ft</p>
                      </div>
                    ))}
                  </div>
                  {catalinaGranaPavers.length > 4 && (
                    <p className="text-sm text-teal text-center font-medium">
                      +{catalinaGranaPavers.length - 4} more styles available
                    </p>
                  )}
                </div>

                <Separator />

                {/* Key Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Key Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Contemporary Grana texture patterns</li>
                    <li>• Superior slip resistance</li>
                    <li>• Weather-resistant finish</li>
                    <li>• Low maintenance surface</li>
                    <li>• Expert installation service</li>
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
                          Total Cost: ${(parseFloat(surfaceArea) * 15).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on {surfaceArea} sq ft × $15/sq ft
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      setSelectedCollection('catalina-grana');
                      setSelectedPaverType(catalinaGranaPavers[0]);
                      setShowOptionsModal(true);
                    }}
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
                      onClick={() => {
                        setSelectedCollection('catalina-grana');
                        setSelectedPaverType(catalinaGranaPavers[0]);
                        setShowOptionsModal(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      View All Options
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Third Card - Catalina Collection */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
              
              {/* Product Image */}
              <div className="relative w-full h-64 bg-gradient-to-br from-secondary/10 to-accent/10 overflow-hidden">
                <img 
                  src={catalinaPavers[0]?.image || '/lovable-uploads/d07719a5-6046-4bbc-94f7-d0390932f6c7.png'} 
                  alt="Catalina Collection Pavers"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-secondary to-accent text-white font-medium px-3 py-1">
                    Catalina Collection
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
                <CardTitle className="text-2xl font-bold text-foreground group-hover:text-secondary transition-colors">
                  Catalina Collection
                </CardTitle>
                <p className="text-muted-foreground">
                  Classic Catalina collection with timeless appeal and versatile styling. Perfect for traditional and modern pool designs.
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                
                {/* Pricing Information */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  <span className="text-lg font-semibold text-foreground">
                    $15/sq ft
                  </span>
                  <span className="text-sm text-muted-foreground">
                    (All styles same price)
                  </span>
                </div>

                <Separator />

                {/* Available Styles Preview */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Available Styles ({catalinaPavers.length} options)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {catalinaPavers.slice(0, 3).map((paver) => (
                      <div key={paver.id} className="text-center">
                        <div className="w-full h-16 rounded-md mb-2 overflow-hidden">
                          <img 
                            src={paver.image} 
                            alt={paver.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-medium">{paver.name.replace('Catalina ', '')}</p>
                        <p className="text-xs text-muted-foreground">$15/sq ft</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Key Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Key Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Classic design patterns</li>
                    <li>• Versatile styling options</li>
                    <li>• Durable construction</li>
                    <li>• Weather-resistant finish</li>
                    <li>• Professional installation</li>
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
                          Total Cost: ${(parseFloat(surfaceArea) * 15).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on {surfaceArea} sq ft × $15/sq ft
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      setSelectedCollection('catalina');
                      setSelectedPaverType(catalinaPavers[0]);
                      setShowOptionsModal(true);
                    }}
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
                      onClick={() => {
                        setSelectedCollection('catalina');
                        setSelectedPaverType(catalinaPavers[0]);
                        setShowOptionsModal(true);
                      }}
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
            <DialogTitle className="text-2xl">
              Configure Your {
                selectedCollection === 'appian' ? 'Appian Collection' : 
                selectedCollection === 'catalina-grana' ? 'Catalina Grana Collection' : 
                'Catalina Collection'
              } Pavers
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            
            {/* Style Selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">1. Select Paver Style</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(selectedCollection === 'appian' ? appianPavers : 
                  selectedCollection === 'catalina-grana' ? catalinaGranaPavers : 
                  catalinaPavers).map((paver) => (
                  <div
                    key={paver.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedPaverType?.id === paver.id ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onClick={() => {
                      setSelectedPaverType(paver);
                    }}
                  >
                    <div className="w-full h-20 rounded-md mb-2 overflow-hidden">
                      <img 
                        src={paver.image} 
                        alt={paver.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm font-medium text-center">
                      {paver.name.replace(
                        selectedCollection === 'appian' ? 'Appian ' : 
                        selectedCollection === 'catalina-grana' ? 'Catalina Grana ' : 
                        'Catalina ', ''
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">$15/sq ft</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Surface Area Input */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">2. Enter Surface Area</h3>
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
              
              {selectedPaverType && surfaceArea && (
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Style:</span>
                    <span>{selectedPaverType.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surface Area:</span>
                    <span>{surfaceArea} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per sq ft:</span>
                    <span>$15.00</span>
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
                disabled={!selectedPaverType || !surfaceArea}
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
          name: `${selectedCollection === 'appian' ? 'Appian Collection' : 
                  selectedCollection === 'catalina-grana' ? 'Catalina Grana Collection' : 
                  'Catalina Collection'} Pavers`,
          price: calculateTotalPrice() || 0,
          type: 'paver'
        }}
      />
    </>
  );
};

export default PaversSection;