import * as React from "react";
import { gilmerPools } from "@/data/gilmerPools";
import SimplifiedGilmerPoolCard from "./SimplifiedGilmerPoolCard";
import ProductScrollRow from "./ProductScrollRow";
import { Badge } from "@/components/ui/badge";
import { Waves, Shield } from "lucide-react";
import EditorialSectionHeader from "./EditorialSectionHeader";
const sortedPools = [...gilmerPools].sort((a, b) => a.price - b.price);

const GilmerPoolsSection = () => {
  return (
    <section id="gilmer-pools" className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <EditorialSectionHeader
            eyebrow="Volume III — Fiberglass"
            title="Glimerglass Pools Collection"
            description="Premium fiberglass pools built to last — Gilmer Glass construction with a lifetime warranty."
          />

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Badge className="bg-gradient-to-r from-primary to-teal text-white border-0 px-4 py-2 text-sm font-semibold shadow-md">
              <Shield className="h-4 w-4 mr-2" />
              Life Warranty
            </Badge>
            <Badge className="bg-gradient-to-r from-teal to-primary text-white border-0 px-4 py-2 text-sm font-semibold shadow-md">
              <Waves className="h-4 w-4 mr-2" />
              Fiber Construction
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
        <div className="mt-12 p-6 rounded-none bg-gradient-to-r from-primary/10 via-teal/10 to-primary/10 border border-primary/20">
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
