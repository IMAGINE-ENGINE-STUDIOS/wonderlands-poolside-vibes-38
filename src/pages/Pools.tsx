import { Suspense, lazy } from "react";
import Footer from "@/components/Footer";

const PoolCatalog = lazy(() => import("@/components/PoolCatalog"));

const Pools = () => {
  return (
    <div className="relative min-h-screen pt-20">
      <div className="pt-4">
        <Suspense fallback={<div className="p-8 text-center text-foreground/70" aria-busy="true">Loading pools...</div>}>
          <PoolCatalog />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
};

export default Pools;
