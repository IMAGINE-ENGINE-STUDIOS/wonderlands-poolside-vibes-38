import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShoppingCart } from "@/components/ShoppingCart";
import { toast } from "sonner";
import SurveyQuoteTool from "./SurveyQuoteTool";
import lanaiStandardImg from "@/assets/lanai-standard.jpg";
import lanaiDeluxeImg from "@/assets/lanai-deluxe.jpg";
import lanaiPremiumImg from "@/assets/lanai-premium.jpg";

interface LanaiOption {
  id: string;
  name: string;
  basePrice: number;
  image: string;
  badge: string;
  description: string;
  features: string[];
  gradient: string;
  warranty: string;
}

const lanaiOptions: LanaiOption[] = [
  {
    id: "standard",
    name: "Standard Lanai",
    basePrice: 16,
    image: lanaiStandardImg,
    badge: "Value",
    description: "Basic aluminum frame patio cover with solid roof panels",
    features: [
      "Durable aluminum frame construction",
      "Solid roof panels for complete weather protection",
      "Basic hardware and installation",
      "5-year warranty coverage",
      "White or black color options"
    ],
    gradient: "bg-gradient-to-r from-secondary to-accent",
    warranty: "5 Years"
  },
  {
    id: "deluxe",
    name: "Deluxe Lanai",
    basePrice: 22,
    image: lanaiDeluxeImg,
    badge: "Popular",
    description: "Glass roof veranda with enhanced features and lighting",
    features: [
      "Premium aluminum frame construction",
      "Tempered glass roof panels for natural light",
      "Enhanced hardware and installation",
      "Integrated LED lighting system",
      "10-year warranty coverage",
      "White or black color options"
    ],
    gradient: "bg-gradient-to-r from-primary to-teal",
    warranty: "10 Years"
  },
  {
    id: "premium",
    name: "Premium Lanai",
    basePrice: 28,
    image: lanaiPremiumImg,
    badge: "Ultimate",
    description: "Louvered canopy system with motorized adjustable louvers",
    features: [
      "Heavy-duty aluminum frame construction",
      "Adjustable motorized louver system",
      "Premium hardware and professional installation",
      "Integrated weather sensors",
      "Lifetime warranty coverage",
      "White or black color options"
    ],
    gradient: "bg-gradient-to-r from-coral to-orange",
    warranty: "Lifetime"
  }
];

const LanaiSection = () => {
  const [selectedLanai, setSelectedLanai] = useState<LanaiOption | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [squareFootage, setSquareFootage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("white");
  const { addToCart } = useShoppingCart();

  const handleLanaiClick = (lanai: LanaiOption) => {
    setSelectedLanai(lanai);
    setShowDetailModal(true);
    setSquareFootage("");
    setSelectedColor("white");
  };

  const calculatePrice = () => {
    if (!selectedLanai || !squareFootage) return 0;
    const sqft = parseFloat(squareFootage);
    return isNaN(sqft) ? 0 : sqft * selectedLanai.basePrice;
  };

  const handleAddToCart = () => {
    if (!selectedLanai || !squareFootage) {
      toast.error("Please enter square footage");
      return;
    }

    const sqft = parseFloat(squareFootage);
    if (isNaN(sqft) || sqft <= 0) {
      toast.error("Please enter a valid square footage");
      return;
    }

    const totalPrice = calculatePrice();
    const colorText = selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1);
    
    addToCart({
      id: `lanai-${selectedLanai.id}-${selectedColor}-${Date.now()}`,
      name: `${selectedLanai.name} - ${colorText} (${sqft} sq ft)`,
      price: totalPrice,
      category: "Lanai",
      image: selectedLanai.image
    });

    toast.success(`${selectedLanai.name} added to cart!`);
    setShowDetailModal(false);
  };

  const handleRequestQuote = () => {
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  const totalPrice = calculatePrice();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-coral bg-clip-text text-transparent">
            Lanai Covers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create the perfect outdoor living space with our premium aluminum frame lanai systems
          </p>
        </div>

        {/* Lanai Options Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {lanaiOptions.map((lanai) => (
            <Card 
              key={lanai.id}
              className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 hover:border-primary/50"
              onClick={() => handleLanaiClick(lanai)}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={lanai.image} 
                  alt={lanai.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute top-4 right-4 ${lanai.gradient} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                  {lanai.badge}
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-2">{lanai.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-primary">${lanai.basePrice}</span>
                  <span className="text-muted-foreground">/sq ft</span>
                </div>
                <p className="text-muted-foreground mb-4">{lanai.description}</p>
                <ul className="space-y-2 mb-6">
                  {lanai.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="default">
                  Calculate Price
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Information Section */}
        <div className="bg-card border rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-6 text-center">Why Choose Our Lanai Covers?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏡</span>
              </div>
              <h4 className="font-bold mb-2">Outdoor Living</h4>
              <p className="text-sm text-muted-foreground">
                Expand your living space and enjoy the outdoors year-round in comfort
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">☀️</span>
              </div>
              <h4 className="font-bold mb-2">Weather Protection</h4>
              <p className="text-sm text-muted-foreground">
                Shield your patio from sun, rain, and elements with durable aluminum construction
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💎</span>
              </div>
              <h4 className="font-bold mb-2">Value Addition</h4>
              <p className="text-sm text-muted-foreground">
                Increase your property value with a premium outdoor living enhancement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedLanai && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold">{selectedLanai.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <img 
                  src={selectedLanai.image} 
                  alt={selectedLanai.name}
                  className="w-full h-80 object-cover rounded-lg"
                />

                <div>
                  <h4 className="font-bold text-lg mb-3">Features</h4>
                  <ul className="grid gap-2">
                    {selectedLanai.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <div>
                    <Label htmlFor="squareFootage" className="text-base font-semibold">
                      Square Footage
                    </Label>
                    <Input
                      id="squareFootage"
                      type="number"
                      placeholder="Enter square footage"
                      value={squareFootage}
                      onChange={(e) => setSquareFootage(e.target.value)}
                      className="mt-2"
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color" className="text-base font-semibold">
                      Frame Color
                    </Label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger id="color" className="mt-2">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="black">Black</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {squareFootage && (
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Base Price:</span>
                        <span className="font-semibold">${selectedLanai.basePrice}/sq ft</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Square Footage:</span>
                        <span className="font-semibold">{squareFootage} sq ft</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="text-lg font-bold">Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleAddToCart}
                    className="flex-1"
                    disabled={!squareFootage}
                  >
                    Add to Cart
                  </Button>
                  <Button 
                    onClick={handleRequestQuote}
                    variant="outline"
                    className="flex-1"
                  >
                    Get Quote
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quote Modal */}
      <SurveyQuoteTool
        pool={selectedLanai ? {
          model: selectedLanai.name,
          category: "standard",
          price: selectedLanai.basePrice,
          image: selectedLanai.image,
          dimensions: `${squareFootage} sq ft`,
          warrantyYears: selectedLanai.warranty
        } : null}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
    </section>
  );
};

export default LanaiSection;
