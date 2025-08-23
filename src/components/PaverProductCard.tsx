import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Calculator, Star, ShoppingCart, Eye } from "lucide-react";
import { useShoppingCart } from "./ShoppingCart";
import { toast } from "sonner";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PaverType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image: string;
}

interface PaverProductCardProps {
  paver: PaverType;
  onViewDetails?: (paver: PaverType) => void;
  onRequestQuote?: (paver: PaverType) => void;
  isAdmin?: boolean;
}

const getCollectionBadge = (paverId: string) => {
  if (paverId.toLowerCase().includes('appian')) {
    return { name: 'Appian Collection', color: 'bg-gradient-to-r from-coral to-orange' };
  } else if (paverId.toLowerCase().includes('catalina-grana')) {
    return { name: 'Catalina Grana', color: 'bg-gradient-to-r from-teal to-coral' };
  } else if (paverId.toLowerCase().includes('catalina')) {
    return { name: 'Catalina Collection', color: 'bg-gradient-to-r from-primary to-teal' };
  }
  return { name: 'Premium', color: 'bg-gradient-to-r from-secondary to-accent' };
};

const PaverProductCard = ({ paver, onViewDetails, onRequestQuote, isAdmin = false }: PaverProductCardProps) => {
  const [surfaceArea, setSurfaceArea] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const { addToCart } = useShoppingCart();

  const collectionBadge = getCollectionBadge(paver.id);

  const calculateTotalPrice = () => {
    if (!surfaceArea) return 0;
    const area = parseFloat(surfaceArea);
    if (isNaN(area)) return 0;
    return paver.basePrice * area;
  };

  const handleAddToCart = () => {
    if (!surfaceArea) {
      toast.error('Please enter surface area');
      return;
    }

    const totalPrice = calculateTotalPrice();
    
    addToCart({
      id: `paver_${paver.id}_${Date.now()}`,
      name: paver.name,
      price: totalPrice,
      category: 'paver',
      image: paver.image,
      extras: [
        { name: `Surface Area: ${surfaceArea} sq ft`, price: 0 },
        { name: `Rate: $${paver.basePrice}/sq ft`, price: 0 }
      ]
    });

    toast.success(`Added ${paver.name} to cart!`);
    setSurfaceArea('');
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(paver);
    }
  };

  const handleRequestQuote = () => {
    if (onRequestQuote) {
      onRequestQuote(paver);
    } else {
      setShowQuoteModal(true);
    }
  };

  return (
    <>
      <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/40 overflow-hidden">
        {/* Paver Image */}
        <div className="relative w-full h-48 bg-gradient-to-br from-primary/10 to-teal/10 overflow-hidden">
          <img 
            src={paver.image} 
            alt={paver.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Collection Badge */}
          <div className="absolute top-4 left-4">
            <Badge className={`${collectionBadge.color} text-white font-medium px-3 py-1`}>
              {collectionBadge.name}
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
          <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {paver.name}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {paver.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          
          {/* Pricing Information */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">
              ${paver.basePrice}/sq ft
            </span>
          </div>

          <Separator />

          {/* Surface Area Calculator */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Price Calculator
            </h4>
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Enter surface area (sq ft)"
                value={surfaceArea}
                onChange={(e) => setSurfaceArea(e.target.value)}
              />
              {surfaceArea && !isNaN(parseFloat(surfaceArea)) && (
                <div className="text-sm">
                  <div className="text-green-600 font-medium">
                    Total Cost: ${calculateTotalPrice().toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {surfaceArea} sq ft × ${paver.basePrice}/sq ft
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleAddToCart}
              disabled={!surfaceArea || isNaN(parseFloat(surfaceArea))}
              variant="gradient"
              className="w-full hover:scale-105 transition-all duration-300"
              size="lg"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleViewDetails}
                variant="outline"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
              <Button 
                onClick={handleRequestQuote}
                variant="outline"
                size="sm"
              >
                Get Quote
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Quote Modal */}
      <Dialog open={showQuoteModal} onOpenChange={setShowQuoteModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Quote - {paver.name}</DialogTitle>
          </DialogHeader>
          <SurveyQuoteTool 
            pool={null}
            isOpen={showQuoteModal}
            onClose={() => setShowQuoteModal(false)}
            customProduct={{
              name: paver.name,
              price: paver.basePrice,
              type: 'paver'
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaverProductCard;