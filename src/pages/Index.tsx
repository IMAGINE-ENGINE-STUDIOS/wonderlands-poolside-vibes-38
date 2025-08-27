
import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PoolCatalog from "@/components/PoolCatalog";
import SpaSection from "@/components/SpaSection";
import PoolFinishesSection from "@/components/PoolFinishesSection";
import LinersSection from "@/components/LinersSection";
import AutomaticCoversSection from "@/components/AutomaticCoversSection";
import ScreenEnclosureSection from "@/components/ScreenEnclosureSection";
import PaversSection from "@/components/PaversSection";
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
        {/* Anchors for RightNavigation */}
        <div id="pools" />
        <PoolCatalog />
        <div id="spas" />
        <SpaSection />
        <div id="finishes" />
        <PoolFinishesSection />
        <div id="liners" />
        <LinersSection />
        <div id="covers" />
        <AutomaticCoversSection />
        <div id="screen-enclosures" />
        <ScreenEnclosureSection />
        <div id="pavers" />
        <PaversSection />
        <Footer />
      </div>
    </ShoppingCartProvider>
  );
};

export default Index;
