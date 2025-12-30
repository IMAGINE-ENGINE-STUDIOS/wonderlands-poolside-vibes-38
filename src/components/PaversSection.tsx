import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { DollarSign, Calculator, Star, ShoppingCart } from "lucide-react";
import { paverTypes } from "@/data/paverData";
import { useShoppingCart } from "./ShoppingCartProvider";
import { toast } from "sonner";
import SurveyQuoteTool from "./SurveyQuoteTool";

const PRICE_PER_SQFT = 20; // Base price for Appian, Catalina collections

const PaversSection = () => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedPaverType, setSelectedPaverType] = useState<any>(null);
  const [surfaceArea, setSurfaceArea] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<'appian' | 'catalina-grana' | 'catalina'>('appian');
  const { addToCart } = useShoppingCart();

  // Get collections from the data
  const appianPavers = paverTypes.filter(paver => paver.id.toLowerCase().includes('appian') && !paver.id.toLowerCase().includes('catalina'));
  const catalinaGranaPavers = paverTypes.filter(paver => paver.id.toLowerCase().includes('catalina') && paver.name.includes('Grana'));
  const catalinaPavers = paverTypes.filter(paver => paver.id.toLowerCase().includes('catalina') && !paver.name.includes('Grana'));

  const calculateTotalPrice = () => {
    if (!surfaceArea) return 0;
    const area = parseFloat(surfaceArea);
    if (isNaN(area)) return 0;
    // Use selected paver's basePrice if available, otherwise default PRICE_PER_SQFT
    const pricePerSqFt = selectedPaverType?.basePrice || PRICE_PER_SQFT;
    return pricePerSqFt * area;
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
      extras: [{
        name: `Surface Area: ${surfaceArea} sq ft`,
        price: 0
      }]
    });
    toast.success(`Added ${collectionName} pavers to cart!`);
    setShowOptionsModal(false);
  };

  const handleRequestQuote = (collection?: 'appian' | 'catalina-grana' | 'catalina') => {
    if (collection) setSelectedCollection(collection);
    setShowQuoteModal(true);
    setShowOptionsModal(false);
  };

  const getCollectionName = () => {
    if (selectedCollection === 'appian') return 'Appian Collection';
    if (selectedCollection === 'catalina-grana') return 'Catalina Grana Collection';
    return 'Catalina Collection';
  };

  const getQuoteExtras = () => {
    if (!selectedPaverType || !surfaceArea) return undefined;
    const area = parseFloat(surfaceArea);
    if (isNaN(area)) return undefined;
    
    const pricePerSqFt = selectedPaverType?.basePrice || PRICE_PER_SQFT;
    const totalPrice = pricePerSqFt * area;
    return {
      extrasBreakdown: [{
        name: `${selectedPaverType.name} (${area} sq ft @ $${pricePerSqFt}/sqft)`,
        price: totalPrice
      }],
      extrasTotal: totalPrice
    };
  };

  const renderPaverCarousel = (pavers: typeof paverTypes, collectionKey: 'appian' | 'catalina-grana' | 'catalina') => (
    <Carousel className="w-full" opts={{ align: "start", loop: true }}>
      <CarouselContent className="-ml-2 md:-ml-4">
        {pavers.map(paver => (
          <CarouselItem key={paver.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4">
            <div className="text-center cursor-pointer" onClick={() => {
              setSelectedCollection(collectionKey);
              setSelectedPaverType(paver);
              setShowOptionsModal(true);
            }}>
              <div className="w-full h-20 rounded-md mb-2 overflow-hidden border-2 border-transparent hover:border-primary transition-colors">
                <img src={paver.image} alt={paver.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-medium truncate">{paver.name.replace('Appian ', '').replace('Catalina Grana ', '').replace('Catalina ', '')}</p>
              <p className="text-xs text-muted-foreground">${paver.basePrice}/sq ft</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0" />
      <CarouselNext className="right-0" />
    </Carousel>
  );

  return (
    <>
      <section className="py-12 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Premium Pool Pavers
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto mb-6">
              Transform your pool area with our premium paver collections, featuring multiple styles and finishes.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Design & configure your complete hardscape project
            </p>
          </div>

          {/* Three Collections Grid */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-full mx-auto">
            {/* First Card - Appian Collection */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
              <div className="relative w-full h-64 bg-gradient-to-br from-primary/10 to-teal/10 overflow-hidden">
                <img src={appianPavers[0]?.image || '/lovable-uploads/08c51883-4e87-4344-b773-ec0a6d575b54.png'} alt="Appian Collection Pavers" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-coral to-orange text-white font-medium px-3 py-1">
                    Premium Collection
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="gold" className="text-yellow-500" />)}
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
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-teal" />
                  <span className="text-lg font-semibold text-foreground">${PRICE_PER_SQFT}/sq ft</span>
                  <span className="text-sm text-muted-foreground">(All styles same price)</span>
                </div>

                <Separator />

                {/* Carousel for all styles */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Available Styles ({appianPavers.length} options)</h4>
                  {renderPaverCarousel(appianPavers, 'appian')}
                </div>

                <Separator />

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
                      onChange={e => setSurfaceArea(e.target.value)} 
                    />
                    {surfaceArea && !isNaN(parseFloat(surfaceArea)) && (
                      <div className="text-sm">
                        <div className="text-green-600 font-medium">
                          Total Cost: ${(parseFloat(surfaceArea) * PRICE_PER_SQFT).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on {surfaceArea} sq ft × ${PRICE_PER_SQFT}/sq ft
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={() => handleRequestQuote('appian')} className="flex-1 instant-quote-btn transition-all duration-300" size="sm">Instant Quote</Button>
                  <Button onClick={() => {
                    setSelectedCollection('appian');
                    setSelectedPaverType(appianPavers[0]);
                    setShowOptionsModal(true);
                  }} variant="outline" size="sm">
                    View All Options
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Second Card - Catalina Grana Collection */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
              <div className="relative w-full h-64 bg-gradient-to-br from-teal/10 to-coral/10 overflow-hidden">
                <img src={catalinaGranaPavers[0]?.image || '/lovable-uploads/58a4af60-11d8-4589-b955-f689476fc1b3.png'} alt="Catalina Grana Collection Pavers" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-teal to-coral text-white font-medium px-3 py-1">
                    Grana Collection
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="gold" className="text-yellow-500" />)}
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
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-coral" />
                  <span className="text-lg font-semibold text-foreground">${PRICE_PER_SQFT}/sq ft</span>
                  <span className="text-sm text-muted-foreground">(All styles same price)</span>
                </div>

                <Separator />

                {/* Carousel for all styles */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Available Styles ({catalinaGranaPavers.length} options)</h4>
                  {renderPaverCarousel(catalinaGranaPavers, 'catalina-grana')}
                </div>

                <Separator />

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
                      onChange={e => setSurfaceArea(e.target.value)} 
                    />
                    {surfaceArea && !isNaN(parseFloat(surfaceArea)) && (
                      <div className="text-sm">
                        <div className="text-green-600 font-medium">
                          Total Cost: ${(parseFloat(surfaceArea) * PRICE_PER_SQFT).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on {surfaceArea} sq ft × ${PRICE_PER_SQFT}/sq ft
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={() => handleRequestQuote('catalina-grana')} className="flex-1 instant-quote-btn transition-all duration-300" size="sm">Instant Quote</Button>
                  <Button onClick={() => {
                    setSelectedCollection('catalina-grana');
                    setSelectedPaverType(catalinaGranaPavers[0]);
                    setShowOptionsModal(true);
                  }} variant="outline" size="sm">
                    View All Options
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Third Card - Catalina Collection */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
              <div className="relative w-full h-64 bg-gradient-to-br from-secondary/10 to-accent/10 overflow-hidden">
                <img src={catalinaPavers[0]?.image || '/lovable-uploads/d07719a5-6046-4bbc-94f7-d0390932f6c7.png'} alt="Catalina Collection Pavers" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-to-r from-secondary to-accent text-white font-medium px-3 py-1">
                    Catalina Collection
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="gold" className="text-yellow-500" />)}
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
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  <span className="text-lg font-semibold text-foreground">${PRICE_PER_SQFT}/sq ft</span>
                  <span className="text-sm text-muted-foreground">(All styles same price)</span>
                </div>

                <Separator />

                {/* Carousel for all styles */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Available Styles ({catalinaPavers.length} options)</h4>
                  {renderPaverCarousel(catalinaPavers, 'catalina')}
                </div>

                <Separator />

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
                      onChange={e => setSurfaceArea(e.target.value)} 
                    />
                    {surfaceArea && !isNaN(parseFloat(surfaceArea)) && (
                      <div className="text-sm">
                        <div className="text-green-600 font-medium">
                          Total Cost: ${(parseFloat(surfaceArea) * PRICE_PER_SQFT).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on {surfaceArea} sq ft × ${PRICE_PER_SQFT}/sq ft
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={() => handleRequestQuote('catalina')} className="flex-1 instant-quote-btn transition-all duration-300" size="sm">Instant Quote</Button>
                  <Button onClick={() => {
                    setSelectedCollection('catalina');
                    setSelectedPaverType(catalinaPavers[0]);
                    setShowOptionsModal(true);
                  }} variant="outline" size="sm">
                    View All Options
                  </Button>
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
              Configure Your {getCollectionName()} Pavers
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Style Selection with Carousel */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">1. Select Paver Style</h3>
              <Carousel className="w-full" opts={{ align: "start", loop: true }}>
                <CarouselContent className="-ml-2 md:-ml-4">
                  {(selectedCollection === 'appian' ? appianPavers : selectedCollection === 'catalina-grana' ? catalinaGranaPavers : catalinaPavers).map(paver => (
                    <CarouselItem key={paver.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3">
                      <div 
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedPaverType?.id === paver.id ? 'border-primary bg-primary/10' : 'border-border'}`} 
                        onClick={() => setSelectedPaverType(paver)}
                      >
                        <div className="w-full h-24 rounded-md mb-2 overflow-hidden">
                          <img src={paver.image} alt={paver.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm font-medium text-center">
                          {paver.name.replace(selectedCollection === 'appian' ? 'Appian ' : selectedCollection === 'catalina-grana' ? 'Catalina Grana ' : 'Catalina ', '')}
                        </p>
                        <p className="text-xs text-muted-foreground text-center">${paver.basePrice}/sq ft</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            {/* Surface Area Input */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">2. Enter Surface Area</h3>
              <div className="space-y-2">
                <Input 
                  type="number" 
                  placeholder="Enter total surface area in square feet" 
                  value={surfaceArea} 
                  onChange={e => setSurfaceArea(e.target.value)} 
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
                    <span>${selectedPaverType?.basePrice || PRICE_PER_SQFT}.00</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowOptionsModal(false)}>
                Close
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => handleRequestQuote()}
                disabled={!selectedPaverType || !surfaceArea}
              >
                Get Quote
              </Button>
              <Button className="flex-1" onClick={handleAddToCart} disabled={!selectedPaverType || !surfaceArea}>
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
          name: selectedPaverType ? `${getCollectionName()} - ${selectedPaverType.name}` : `${getCollectionName()} Pavers`,
          price: 0, // Price is in extras to avoid double-counting
          type: 'paver',
          image: selectedPaverType?.image || appianPavers[0]?.image
        }}
        extras={getQuoteExtras()}
      />
    </>
  );
};

export default PaversSection;
