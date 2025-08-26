import { Suspense, lazy } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PoolFinishesSection = lazy(() => import("@/components/PoolFinishesSection"));

const PoolFinishes = () => {
  return (
    <div className="relative min-h-screen">
      <Header />
      <div className="pt-20">
        <Suspense fallback={<div className="p-8 text-center text-foreground/70" aria-busy="true">Loading pool finishes...</div>}>
          <PoolFinishesSection />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
};

export default PoolFinishes;