import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AdvancedSearch from "@/components/AdvancedSearch";
import PoolCatalog from "@/components/PoolCatalog";
import SpaCatalog from "@/components/SpaCatalog";
import TanningLedgeSection from "@/components/TanningLedgeSection";
import PoolFinishesSection from "@/components/PoolFinishesSection";
import LinersSection from "@/components/LinersSection";
import AutomaticCoversSection from "@/components/AutomaticCoversSection";
import ScreenEnclosureSection from "@/components/ScreenEnclosureSection";
import PaversSection from "@/components/PaversSection";
import Footer from "@/components/Footer";
const Index = () => {
  useEffect(() => {
    // Handle navigation to sections from URL hash
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  }, []);
  return <div className="min-h-screen">
      <Header />
      <Hero />
      
      {/* Advanced Search Section */}
      <section className="py-12 bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-teal to-coral bg-clip-text text-transparent mb-2">Wonderlands World</h2>
            <p className="text-muted-foreground text-lg">Premium Concrete and Carbon Fiber Glass Pools, Spas & Outdoor Living for Homeowners and Dealers</p>
          </div>
          <AdvancedSearch />
        </div>
      </section>
      {/* Anchors for RightNavigation */}
      <div id="pools" />
      <PoolCatalog />
      <div id="spas" />
      <SpaCatalog />
      <TanningLedgeSection />
      <div id="finishes" />
      <PoolFinishesSection />
      <div id="liners" />
      <LinersSection />
      <div id="screen-enclosures" />
      <ScreenEnclosureSection />
      <div id="pavers" />
      <PaversSection />
      <div id="covers" />
      <AutomaticCoversSection />
      <Footer />
    </div>;
};
export default Index;