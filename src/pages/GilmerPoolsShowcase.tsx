import * as React from "react";
const { useState } = React;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Waves, ArrowLeft } from "lucide-react";
import { gilmerPools } from "@/data/gilmerPools";
import GilmerPoolProductCard from "@/components/GilmerPoolProductCard";

const GilmerPoolsShowcase = () => {
  const [selectedPool, setSelectedPool] = useState(null);

  if (selectedPool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedPool(null)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gilmer Glass Pools
          </Button>
          <GilmerPoolProductCard pool={selectedPool} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Gilmer Glass Pools
          </h1>
          <p className="text-lg text-muted-foreground">
            Premium fiber pools with lifetime warranty and exceptional quality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gilmerPools.map((pool, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
              onClick={() => setSelectedPool(pool)}
            >
              <CardHeader className="pb-4">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                  <img loading="lazy" decoding="async" 
                    src={pool.image} 
                    alt={`${pool.brand} ${pool.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl font-bold flex items-center gap-2 mb-2">
                  <Waves className="h-5 w-5 text-blue-600" />
                  {pool.model}
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{pool.dimensions}</Badge>
                    <Badge variant="outline">Depth: {pool.depth}</Badge>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      {pool.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ${pool.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{pool.warranty}</p>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      Customize
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GilmerPoolsShowcase;