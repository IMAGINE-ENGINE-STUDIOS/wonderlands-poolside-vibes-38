import { Suspense, lazy } from "react";
import Footer from "@/components/Footer";

const PaversSection = lazy(() => import("@/components/PaversSection"));

const Pavers = () => {
  return (
    <div className="relative min-h-screen pt-20">
      <div className="pt-4">
        <Suspense fallback={<div className="p-8 text-center text-foreground/70" aria-busy="true">Loading pavers...</div>}>
          <PaversSection />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
};

export default Pavers;