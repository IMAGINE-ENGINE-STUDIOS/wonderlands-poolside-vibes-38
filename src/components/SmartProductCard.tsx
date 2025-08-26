import React from "react";
import ImageCard from "@/components/ImageCard";

interface SmartProductCardProps {
  product: {
    name: string;
    image: string;
    description: string;
    price: number;
  };
}

const SmartProductCard: React.FC<SmartProductCardProps> = ({ product }) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-md overflow-hidden">
      <div className="aspect-w-4 aspect-h-3">
        
          <ImageCard
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            enableZoom={true}
          />
        
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
          
        </div>
      </div>
    </div>
  );
};

export default SmartProductCard;
