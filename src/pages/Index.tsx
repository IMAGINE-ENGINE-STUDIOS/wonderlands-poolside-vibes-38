
import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PoolCatalog from "@/components/PoolCatalog";
import SpaSection from "@/components/SpaSection";
import TanningLedgeSection from "@/components/TanningLedgeSection";
import PoolFinishesSection from "@/components/PoolFinishesSection";
import LinersSection from "@/components/LinersSection";
import AutomaticCoversSection from "@/components/AutomaticCoversSection";
import ScreenEnclosureSection from "@/components/ScreenEnclosureSection";
import PaversSection from "@/components/PaversSection";
import PoolTilesSection from "@/components/PoolTilesSection";
import Footer from "@/components/Footer";
import { ShoppingCartProvider } from "@/components/ShoppingCartProvider";

const Index = () => {
  useEffect(() => {
    // Handle navigation to sections from URL hash
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <ShoppingCartProvider>
      <div className="min-h-screen">
        <Header />
        <Hero />
        <PoolCatalog />
        <SpaSection />
        <TanningLedgeSection />
        <PoolFinishesSection />
        <LinersSection />
        <AutomaticCoversSection />
        <ScreenEnclosureSection />
        <PaversSection />
        <PoolTilesSection />
        <Footer />
      </div>
    </ShoppingCartProvider>
  );
};

export default Index;
