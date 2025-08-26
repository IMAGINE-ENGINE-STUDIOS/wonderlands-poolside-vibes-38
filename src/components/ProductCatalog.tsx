import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DollarSign, ShoppingCart, Ruler, Waves } from "lucide-react";
import { poolModels } from "@/data/poolData";
import { useShoppingCart } from "./ShoppingCart";

interface Pool {
  id: string;
  model: string;
  price: number;
  category: 'premium' | 'deluxe' | 'standard' | 'compact';
  image: string;
  dimensions: string;
  depth: string;
  features: string[];
}

const ProductCatalog = () => {
  const { addToCart } = useShoppingCart();

  const handleAddToCart = (pool: Pool) => {
    addToCart({
      id: `pool_${pool.model.replace(/\s+/g, '_')}_${Date.now()}`,
      name: pool.model,
      price: pool.price,
      category: pool.category,
      image: pool.image,
      extras: []
    });
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-background to-teal/5" data-product-catalog-section>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal via-primary to-secondary">
            Pool Models
          </h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Explore our wide selection of pool models, each designed to bring luxury and relaxation to your backyard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poolModels.map((pool, index) => (
            <Card key={pool.model} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-gradient-to-r from-primary to-teal text-white font-medium px-3 py-1">
                    {pool.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {pool.model}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pool Preview */}
                <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-muted">
                  <img
                    src={pool.image}
                    alt={pool.model}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-teal" />
                  <span className="text-2xl font-bold text-foreground">
                    ${pool.price.toLocaleString()}
                  </span>
                </div>

                {/* Specifications */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium">{pool.dimensions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Depth:</span>
                    <span className="font-medium">{pool.depth}</span>
                  </div>
                </div>

                <Separator />

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Features:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {pool.features.map((feature, index) => (
                      <li key={index} className="text-muted-foreground">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleAddToCart(pool)}
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
  );
};

export default ProductCatalog;
