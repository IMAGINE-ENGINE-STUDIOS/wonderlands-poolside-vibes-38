import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Sparkles } from "lucide-react";
import { useShoppingCart } from "./ShoppingCartProvider";
import { useToast } from "@/hooks/use-toast";

interface Tile {
  name: string;
  image: string;
  description: string;
  price: number;
  finish?: string;
  size?: string;
  pattern?: string;
}

interface TileDetailModalProps {
  tile: Tile | null;
  isOpen: boolean;
  onClose: () => void;
}

const TileDetailModal = ({ tile, isOpen, onClose }: TileDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedPattern, setSelectedPattern] = useState("standard");
  const [selectedSize, setSelectedSize] = useState("6x6");
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();

  const patterns = [
    { id: "standard", name: "Standard Pattern", price: 0 },
    { id: "herringbone", name: "Herringbone", price: 2000 },
    { id: "basket-weave", name: "Basket Weave", price: 1500 },
    { id: "mosaic", name: "Mosaic Design", price: 3000 }
  ];

  const sizes = [
    { id: "6x6", name: "6\" x 6\"", price: 0 },
    { id: "12x12", name: "12\" x 12\"", price: 1000 },
    { id: "6x12", name: "6\" x 12\"", price: 500 }
  ];

  if (!tile) return null;

  const getPatternPrice = () => patterns.find(p => p.id === selectedPattern)?.price || 0;
  const getSizePrice = () => sizes.find(s => s.id === selectedSize)?.price || 0;
  const totalPrice = (tile.price + getPatternPrice() + getSizePrice()) * quantity;

  const handleAddToCart = () => {
    const selectedPatternName = patterns.find(p => p.id === selectedPattern)?.name;
    const selectedSizeName = sizes.find(s => s.id === selectedSize)?.name;
    
    // Add items to cart one by one for the specified quantity
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${tile.name}-${selectedPattern}-${selectedSize}-${Date.now()}-${i}`,
        name: `${tile.name} - ${selectedPatternName} (${selectedSizeName})`,
        price: tile.price + getPatternPrice() + getSizePrice(),
        category: 'Pool Tiles',
        image: tile.image,
      });
    }

    toast({
      title: "Added to Cart",
      description: `${quantity}x ${tile.name} tiles added to your cart`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal via-coral to-primary bg-clip-text text-transparent">
            {tile.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border">
              <img 
                src={tile.image} 
                alt={tile.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <Card className="p-4 bg-gradient-to-br from-coral/5 to-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-coral" />
                <span className="font-semibold text-coral">Premium Quality</span>
              </div>
              <p className="text-sm text-muted-foreground">{tile.description}</p>
            </Card>
          </div>

          {/* Configuration Section */}
          <div className="space-y-6">
            <div>
              <Badge className="bg-gradient-to-r from-coral to-primary text-white border-0 mb-4">
                Premium Tile Collection
              </Badge>
              <div className="text-3xl font-bold text-foreground mb-2">
                ${totalPrice.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Base price: ${tile.price.toLocaleString()}
              </p>
            </div>

            <Separator />

            {/* Pattern Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Pattern Style</Label>
              <Select value={selectedPattern} onValueChange={setSelectedPattern}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {patterns.map((pattern) => (
                    <SelectItem key={pattern.id} value={pattern.id}>
                      {pattern.name} {pattern.price > 0 && `(+$${pattern.price.toLocaleString()})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tile Size</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name} {size.price > 0 && `(+$${size.price.toLocaleString()})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Quantity (Sets)</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center w-20"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Base Tile Price:</span>
                <span>${tile.price.toLocaleString()}</span>
              </div>
              {getPatternPrice() > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Pattern Upgrade:</span>
                  <span>+${getPatternPrice().toLocaleString()}</span>
                </div>
              )}
              {getSizePrice() > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Size Upgrade:</span>
                  <span>+${getSizePrice().toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Quantity:</span>
                <span>×{quantity}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button 
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-coral to-primary hover:from-coral/90 hover:to-primary/90 text-white"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TileDetailModal;