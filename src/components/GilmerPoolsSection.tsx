import * as React from "react";
import { gilmerPools } from "@/data/gilmerPools";
import SimplifiedGilmerPoolCard from "./SimplifiedGilmerPoolCard";
import ProductScrollRow from "./ProductScrollRow";
import { Badge } from "@/components/ui/badge";
import { Waves, Shield, Clock } from "lucide-react";
const sortedPools = [...gilmerPools].sort((a, b) => a.price - b.price);

const GilmerPoolsSection = () => {
  return (
    <section id="gilmer-pools" className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Waves className="h-8 w-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-teal to-primary bg-clip-text text-transparent">
              Glimerglass Pools Collection
            </h2>
            <Waves className="h-8 w-8 text-primary" />
          </div>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Premium fiberglass pools built to last. Experience the durability and beauty of Gilmer Glass construction
            with our lifetime warranty guarantee.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Badge className="bg-gradient-to-r from-primary to-teal text-white border-0 px-4 py-2 text-sm font-semibold shadow-md">
              <Shield className="h-4 w-4 mr-2" />
              Life Warranty
            </Badge>
            <Badge className="bg-gradient-to-r from-teal to-primary text-white border-0 px-4 py-2 text-sm font-semibold shadow-md">
              <Waves className="h-4 w-4 mr-2" />
              Fiber Construction
            </Badge>
            <Badge className="bg-gradient-to-r from-primary to-teal text-white border-0 px-4 py-2 text-sm font-semibold shadow-md">
              <Clock className="h-4 w-4 mr-2" />
              16+-Week Installation
            </Badge>
          </div>

          {/* Pool Scroll */}
          <ProductScrollRow className="mb-8">
            {sortedPools.map((pool) => (
              <SimplifiedGilmerPoolCard key={pool.model} pool={pool} />
            ))}
          </ProductScrollRow>
        </div>

        {/* Info Banner */}
        <div className="mt-12 p-6 rounded-lg bg-gradient-to-r from-primary/10 via-teal/10 to-primary/10 border border-primary/20">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-foreground">Why Choose Gilmerglass Pools?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Gilmer Glass Pools combine cutting-edge fiberglass technology with timeless design. Each pool comes with a
              lifetime structural warranty, quick 8-week installation, and low-maintenance durability that saves you
              time and money for years to come.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default GilmerPoolsSection;
