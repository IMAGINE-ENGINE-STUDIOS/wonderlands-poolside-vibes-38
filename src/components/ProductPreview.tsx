import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, ShoppingCart, Star, Heart, Share2 } from "lucide-react";
import { useShoppingCart } from "./ShoppingCart";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  image?: string;
  description?: string;
  features?: string[];
  stock: number;
  isActive: boolean;
  source?: string;
  sku?: string;
  material?: string;
  warranty?: string;
  installation?: string;
  collection?: string;
}

interface ProductPreviewProps {
  product: Product;
  variant?: 'default' | 'compact';
}

const ProductPreview = ({ product, variant = 'default' }: ProductPreviewProps) => {
  const { addToCart } = useShoppingCart();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}_${Date.now()}`,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      extras: []
    });

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard!",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      pool: 'bg-blue-500',
      spa: 'bg-purple-500',
      liner: 'bg-green-500',
      tile: 'bg-orange-500',
      finish: 'bg-pink-500',
      tanning_ledge: 'bg-yellow-500',
      other: 'bg-gray-500'
    };
    return colors[category] || colors.other;
  };

  if (variant === 'compact') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <Badge className={`absolute -top-1 -right-1 text-xs ${getCategoryColor(product.category)}`}>
                {product.category}
              </Badge>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{product.name}</h3>
              <p className="text-2xl font-bold text-primary">${product.price.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mb-2">Stock: {product.stock}</p>
              <div className="flex gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{product.name}</DialogTitle>
                      <DialogDescription>{product.description}</DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4">
                      <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Specifications</h4>
                          <div className="space-y-1 text-sm">
                            {product.material && <p><span className="font-medium">Material:</span> {product.material}</p>}
                            {product.warranty && <p><span className="font-medium">Warranty:</span> {product.warranty}</p>}
                            {product.installation && <p><span className="font-medium">Installation:</span> {product.installation}</p>}
                            {product.collection && <p><span className="font-medium">Collection:</span> {product.collection}</p>}
                          </div>
                        </div>
                        {product.features && product.features.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Features</h4>
                            <ul className="text-sm space-y-1">
                              {product.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button onClick={handleAddToCart} className="flex-1">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button variant="outline" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" onClick={handleAddToCart} className="flex-1">
                  <ShoppingCart className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card/50 backdrop-blur-sm">
      <div className="relative overflow-hidden">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <Badge className={`absolute top-2 left-2 ${getCategoryColor(product.category)}`}>
          {product.category.replace('_', ' ')}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-white/80 hover:bg-white ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className="h-4 w-4" fill={isLiked ? 'currentColor' : 'none'} />
        </Button>
        {product.stock <= 5 && (
          <Badge variant="destructive" className="absolute bottom-2 left-2">
            Low Stock: {product.stock}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
            <CardDescription className="text-sm">
              {product.subcategory && `${product.subcategory} • `}
              {product.sku}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">4.8</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>
        
        {product.features && product.features.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
            <div className="flex flex-wrap gap-1">
              {product.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {product.features.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-2xl font-bold text-primary">${product.price.toLocaleString()}</span>
            {product.material && (
              <p className="text-xs text-muted-foreground">{product.material}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Stock: {product.stock}</p>
            {product.warranty && (
              <p className="text-xs text-muted-foreground">{product.warranty} warranty</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{product.name}</DialogTitle>
                <DialogDescription>{product.description}</DialogDescription>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Badge className={getCategoryColor(product.category)}>
                      {product.category.replace('_', ' ')}
                    </Badge>
                    {product.subcategory && (
                      <Badge variant="outline">{product.subcategory}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">${product.price.toLocaleString()}</h3>
                    <p className="text-muted-foreground">{product.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Specifications:</h4>
                    <div className="space-y-2 text-sm">
                      {product.sku && <div><span className="font-medium">SKU:</span> {product.sku}</div>}
                      {product.material && <div><span className="font-medium">Material:</span> {product.material}</div>}
                      {product.warranty && <div><span className="font-medium">Warranty:</span> {product.warranty}</div>}
                      {product.installation && <div><span className="font-medium">Installation Time:</span> {product.installation}</div>}
                      {product.collection && <div><span className="font-medium">Collection:</span> {product.collection}</div>}
                      <div><span className="font-medium">Stock:</span> {product.stock} units</div>
                    </div>
                  </div>
                  
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Features:</h4>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <Button onClick={handleAddToCart} className="flex-1">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleAddToCart} className="flex-1">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductPreview;