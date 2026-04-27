import * as React from "react";
const { useState, useMemo } = React;
import { gilmerPools } from "@/data/gilmerPools";
import CompactPoolCard from "./CompactPoolCard";
import GilmerPoolDetailDialog from "./GilmerPoolDetailDialog";
import PoolComparisonBar from "./PoolComparisonBar";
import PoolComparisonDialog from "./PoolComparisonDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Waves, Shield, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const MAX_COMPARE = 4;

const GilmerPoolsSection = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const poolsPerPage = 15; // 5 per row x 3 rows

  const [selectedPool, setSelectedPool] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [comparePools, setComparePools] = useState<any[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const totalPages = Math.ceil(gilmerPools.length / poolsPerPage);
  const startIndex = (currentPage - 1) * poolsPerPage;
  const endIndex = startIndex + poolsPerPage;
  const currentPools = gilmerPools.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById("gilmer-pools")?.scrollIntoView({ behavior: "smooth" });
  };

  const openDetails = (pool: any) => {
    setSelectedPool(pool);
    setDetailOpen(true);
  };

  const toggleCompare = (pool: any, selected: boolean) => {
    setComparePools((prev) => {
      if (selected) {
        if (prev.find((p) => p.model === pool.model)) return prev;
        if (prev.length >= MAX_COMPARE) return prev;
        return [...prev, pool];
      }
      return prev.filter((p) => p.model !== pool.model);
    });
  };

  const removeCompare = (model: string) =>
    setComparePools((prev) => prev.filter((p) => p.model !== model));

  const compareModels = useMemo(() => new Set(comparePools.map((p) => p.model)), [comparePools]);

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

          <p className="text-sm text-muted-foreground mt-4">
            Showing {startIndex + 1}-{Math.min(endIndex, gilmerPools.length)} of {gilmerPools.length} models
          </p>
        </div>

        {/* Compact Pool Grid - 5 per row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
          {currentPools.map((pool) => (
            <CompactPoolCard
              key={pool.model}
              pool={pool as any}
              onOpenDetails={openDetails}
              onToggleCompare={toggleCompare}
              isCompareSelected={compareModels.has(pool.model)}
              isCompareDisabled={comparePools.length >= MAX_COMPARE}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(page)}
                className={`h-10 w-10 ${currentPage === page ? "bg-gradient-to-r from-primary to-teal text-white border-0" : ""}`}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-10 w-10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

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

      {/* Detail modal */}
      <GilmerPoolDetailDialog
        pool={selectedPool}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      {/* Comparison floating bar */}
      <PoolComparisonBar
        pools={comparePools}
        onRemove={removeCompare}
        onCompare={() => setCompareOpen(true)}
        onClear={() => setComparePools([])}
        maxPools={MAX_COMPARE}
      />

      {/* Comparison dialog */}
      <PoolComparisonDialog
        pools={comparePools as any}
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        onRemove={removeCompare}
        onOpenDetails={(p) => {
          setCompareOpen(false);
          openDetails(p);
        }}
      />
    </section>
  );
};

export default GilmerPoolsSection;
