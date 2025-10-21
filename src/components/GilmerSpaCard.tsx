import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { GilmerSpa } from "@/data/gilmerSpas";

interface GilmerSpaCardProps {
  spa: GilmerSpa;
  onRequestQuote?: (spa: GilmerSpa, selectedColor: string) => void;
}

const GilmerSpaCard = ({ spa, onRequestQuote }: GilmerSpaCardProps) => {
  const [selectedColor, setSelectedColor] = useState(spa.colorOptions?.[0] || "");

  const colorSwatches: Record<string, string> = {
    "Azure Blue": "bg-blue-500",
    "Caribbean Teal": "bg-teal-500",
    "Pearl White": "bg-gray-100 border-2 border-gray-300",
    "Graphite Gray": "bg-gray-700"
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
      <div className="relative h-64 bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-teal/20 flex items-center justify-center">
            <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Product Image Coming Soon</p>
        </div>
        
        {spa.spillover && (
          <Badge className="absolute top-4 right-4 bg-coral text-white">
            Spillover
          </Badge>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {spa.model}
          </h3>
          <p className="text-sm text-muted-foreground">
            {spa.brand} • {spa.type}
          </p>
        </div>

        {/* Color Options */}
        {spa.colorOptions && spa.colorOptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Available Colors:</p>
            <div className="flex flex-wrap gap-2">
              {spa.colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`group/color relative transition-all ${
                    selectedColor === color ? 'scale-110' : 'hover:scale-105'
                  }`}
                  title={color}
                >
                  <div 
                    className={`w-10 h-10 rounded-full ${colorSwatches[color]} ${
                      selectedColor === color 
                        ? 'ring-4 ring-primary ring-offset-2' 
                        : 'ring-2 ring-gray-200'
                    }`}
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover/color:opacity-100 transition-opacity">
                    {color}
                  </span>
                </button>
              ))}
            </div>
            {selectedColor && (
              <p className="text-sm text-primary font-medium mt-2">
                Selected: {selectedColor}
              </p>
            )}
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Warranty</span>
            <Badge variant="outline" className="text-teal-600 border-teal-600">
              {spa.warranty}
            </Badge>
          </div>
          
          {spa.price > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Starting at</span>
              <span className="text-2xl font-bold text-primary">
                ${spa.price.toLocaleString()}
              </span>
            </div>
          )}
          
          {spa.price === 0 && (
            <div className="text-center py-2">
              <p className="text-sm font-medium text-muted-foreground">
                Contact for Pricing
              </p>
            </div>
          )}
        </div>

        <Button 
          className="w-full bg-gradient-to-r from-primary to-coral hover:shadow-lg transition-all"
          onClick={() => onRequestQuote?.(spa, selectedColor)}
        >
          Request Quote
        </Button>
      </CardContent>
    </Card>
  );
};

export default GilmerSpaCard;
