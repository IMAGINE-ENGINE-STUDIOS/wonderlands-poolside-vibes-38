
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { poolModels, poolLiners, poolTiles, tanningLedges } from "@/data/poolData";
import { spas } from "@/data/spaData";
import ImageCard from "./ImageCard";

export interface Product {
  id: string;
  name?: string;
  model?: string;
  price: number;
  category: string;
  image?: string;
  dimensions?: string;
  depth?: string;
  features?: string[];
  type?: string;
  description?: string;
}

// Export Product type for other components
export { type Product };

interface ProductCatalogProps {
  title?: string;
  subtitle?: string;
  products?: Product[];
  catalogId?: string;
  onRequestQuote?: (item: any) => void;
  DetailModalComponent?: React.ComponentType<any>;
  QuoteComponent?: React.ComponentType<any>;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  title = "Product Catalog",
  subtitle = "Explore our complete collection",
  onRequestQuote
}) => {
  const [selectedCategory, setSelectedCategory] = useState("pools");

  const renderProductCard = (product: Product) => (
    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <ImageCard 
            src={product.image || '/placeholder.svg'} 
            alt={product.name || product.model || 'Product'} 
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2">
          {product.name || product.model}
        </CardTitle>
        <div className="space-y-2 mb-4">
          <Badge variant="secondary" className="capitalize">
            {product.category}
          </Badge>
          <p className="text-2xl font-bold text-primary">
            ${product.price.toLocaleString()}
          </p>
          {product.dimensions && (
            <p className="text-sm text-muted-foreground">
              Dimensions: {product.dimensions}
            </p>
          )}
        </div>
        {onRequestQuote && (
          <Button 
            onClick={() => onRequestQuote(product)}
            className="w-full"
          >
            Request Quote
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="py-12">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="pools">Pools</TabsTrigger>
            <TabsTrigger value="spas">Spas</TabsTrigger>
            <TabsTrigger value="liners">Liners</TabsTrigger>
            <TabsTrigger value="tiles">Tiles</TabsTrigger>
            <TabsTrigger value="ledges">Tanning Ledges</TabsTrigger>
          </TabsList>

          <TabsContent value="pools">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {poolModels.map(pool => renderProductCard({
                id: pool.id,
                model: pool.model,
                price: pool.price,
                category: pool.category,
                image: pool.image,
                dimensions: pool.dimensions,
                features: pool.features
              }))}
            </div>
          </TabsContent>

          <TabsContent value="spas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spas.map(spa => renderProductCard({
                id: spa.id,
                model: spa.model,
                price: spa.price,
                category: spa.category,
                image: spa.image,
                dimensions: spa.dimensions,
                features: spa.features
              }))}
            </div>
          </TabsContent>

          <TabsContent value="liners">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {poolLiners.map(liner => renderProductCard({
                id: liner.id,
                name: liner.name,
                price: liner.price,
                category: 'liner',
                image: liner.image,
                type: liner.type,
                description: liner.description
              }))}
            </div>
          </TabsContent>

          <TabsContent value="tiles">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {poolTiles.map(tile => renderProductCard({
                id: tile.id,
                name: tile.name,
                price: tile.price,
                category: 'tile',
                image: tile.image,
                description: tile.description
              }))}
            </div>
          </TabsContent>

          <TabsContent value="ledges">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tanningLedges.map(ledge => renderProductCard({
                id: ledge.id,
                name: ledge.name,
                price: ledge.price,
                category: 'tanning-ledge',
                image: ledge.image,
                dimensions: ledge.dimensions,
                description: ledge.description
              }))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductCatalog;
