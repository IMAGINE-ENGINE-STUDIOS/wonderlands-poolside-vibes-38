import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, DollarSign, ShoppingCart, Sparkles } from "lucide-react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import ProductScrollRow from "./ProductScrollRow";
import { useShoppingCart } from "./ShoppingCartProvider";
import { getProductsByCategory, Product } from "@/data/consolidatedProducts";
import { poolTiles as poolTilesData } from "@/data/poolData";

interface PoolTile {
  name: string;
  price: number;
  image: string;
  description: string;
}

interface PoolTilesSectionProps {
  onTileSelect?: (tile: Product) => void;
  selectedTile?: string;
  allowSelection?: boolean;
}

const PoolTilesSection = ({ onTileSelect, selectedTile: selectedTileProp, allowSelection }: PoolTilesSectionProps = {}) => {
  const [selectedTile, setSelectedTile] = useState<Product | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addToCart } = useShoppingCart();
  
  const poolTiles = getProductsByCategory('tile');

  const handleTileClick = (tile: Product) => {
    setSelectedTile(tile);
    setShowDetailModal(true);
  };

  const handleRequestQuote = (tile: Product) => {
    setSelectedTile(tile);
    setShowDetailModal(false);
    setShowQuoteModal(true);
  };

  const handleAddToCart = (tile: Product) => {
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

          <ProductScrollRow className="mb-8">
            {poolTiles.map((tile, index) => (
              <Card 
                key={tile.name} 
                className="rounded-none border border-border/70 overflow-hidden group transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] cursor-pointer"
                onClick={() => handleTileClick(tile)}
              >
                <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden group/image">
                  <img loading="lazy" decoding="async" 
                    src={tile.image} 
                    alt={tile.name}
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover/image:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                      Premium
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-4 sm:p-5 lg:p-7 space-y-5">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
                      {tile.name}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {tile.description}
                    </p>
                    <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Price</p>
                        <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">
                          ${tile.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(tile);
                    }}
                    variant="default"
                    className="w-full rounded-none text-[10px] uppercase tracking-[0.3em] bg-foreground text-background hover:bg-foreground/90"
                    size="sm"
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ProductScrollRow>
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
                  <img loading="lazy" decoding="async" 
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
                         className="flex-1 rounded-none"
                       >
                         Select Tile
                       </Button>
                     )}
                <Button 
                  onClick={() => handleAddToCart(selectedTile)}
                  variant="default"
                  className="flex-1 rounded-none"
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
                  className="flex-1 rounded-none"
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