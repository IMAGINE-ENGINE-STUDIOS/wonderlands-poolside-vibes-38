import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, DollarSign, ShoppingCart, Sparkles } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { useShoppingCart } from "./ShoppingCart";
import { poolTiles } from "@/data/poolData";

interface PoolTile {
  name: string;
  price: number;
  image: string;
  description: string;
}

interface PoolTilesSectionProps {
  onTileSelect?: (tile: PoolTile) => void;
  selectedTile?: string;
  allowSelection?: boolean;
}

const PoolTilesSection = ({ onTileSelect, selectedTile: selectedTileProp, allowSelection }: PoolTilesSectionProps = {}) => {
  const [selectedTile, setSelectedTile] = useState<PoolTile | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addToCart } = useShoppingCart();

  const handleTileClick = (tile: PoolTile) => {
    setSelectedTile(tile);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (tile: PoolTile) => {
    setSelectedTile(tile);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  const handleAddToCart = (tile: PoolTile) => {
    addToCart({
      id: `tile_${tile.name.replace(/\s+/g, '_')}_${Date.now()}`,
      name: tile.name,
      price: tile.price,
      category: 'tile',
      image: tile.image,
      extras: []
    });
  };

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-br from-muted/30 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-coral to-teal">
              Premium Pool Tiles
            </h2>
            <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
              Elevate your pool's aesthetic with our exquisite tile collection. Premium materials and stunning designs for the ultimate luxury experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {poolTiles.map((tile, index) => (
              <Card 
                key={tile.name} 
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-coral/30 overflow-hidden cursor-pointer"
                onClick={() => handleTileClick(tile)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-gradient-to-r from-coral to-orange text-white font-medium px-3 py-1">
                      <span className="flex items-center gap-1">
                        <Sparkles size={16} />
                        Premium
                      </span>
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-coral transition-colors">
                    {tile.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Tile Preview */}
                  <div className="w-full h-32 rounded-lg overflow-hidden border-2 border-muted">
                    <img 
                      src={tile.image} 
                      alt={tile.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-coral" />
                    <span className="text-2xl font-bold text-foreground">
                      ${tile.price.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tile.description}
                  </p>
                  
                  <Separator />
                  
                  {/* Action Button */}
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(tile);
                    }}
                    variant="default"
                    className="w-full hover:scale-105 transition-all duration-300"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Tile Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          {selectedTile && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedTile.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedTile.image} 
                    alt={selectedTile.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <Badge className="bg-gradient-to-r from-coral to-orange text-white">
                    Premium Tile
                  </Badge>
                  <p className="text-foreground/80">{selectedTile.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-coral" />
                    <span className="text-2xl font-bold text-foreground">
                      ${selectedTile.price.toLocaleString()}
                    </span>
                  </div>
                  
                   <div className="flex gap-3">
                     {allowSelection && !selectedTileProp && selectedTile && (
                       <Button 
                         onClick={() => {
                           onTileSelect?.(selectedTile!);
                           setShowDetailModal(false);
                         }}
                         variant="default"
                         className="flex-1"
                       >
                         Select Tile
                       </Button>
                     )}
                <Button 
                  onClick={() => handleAddToCart(selectedTile)}
                  variant="default"
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  onClick={() => {
                    const lyonFinancialUrl = `https://www.lyonfinancial.net/apply/?` + 
                      `amount=${selectedTile.price}&` +
                      `product=${encodeURIComponent(selectedTile.name)}&` +
                      `description=${encodeURIComponent(`Premium pool tile: ${selectedTile.description}`)}&` +
                      `monthly_payment=${Math.round(selectedTile.price * 0.008)}&` +
                      `loan_term=60&` +
                      `project_type=Pool%20Installation`;
                    window.open(lyonFinancialUrl, '_blank');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Apply with Lyon Financial
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
        customProduct={selectedTile ? {
          name: selectedTile.name,
          price: selectedTile.price,
          type: 'tile'
        } : undefined}
      />
    </>
  );
};

export default PoolTilesSection;