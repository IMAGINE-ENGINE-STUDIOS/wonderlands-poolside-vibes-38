import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PoolCatalog from "@/components/PoolCatalog";
import SpaCatalog from "@/components/SpaCatalog";
import TanningLedgeSection from "@/components/TanningLedgeSection";
import PoolFinishesSection from "@/components/PoolFinishesSection";
import LinersSection from "@/components/LinersSection";
import AutomaticCoversSection from "@/components/AutomaticCoversSection";
import ScreenEnclosureSection from "@/components/ScreenEnclosureSection";
import PaversSection from "@/components/PaversSection";
import Footer from "@/components/Footer";
import LazySection from "@/components/LazySection";
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
      
      {/* Anchors for RightNavigation */}
      <div id="pools" />
      <PoolCatalog />
      <div id="spas" />
      <LazySection>
        <SpaCatalog />
      </LazySection>
      <LazySection>
        <TanningLedgeSection />
      </LazySection>
      <div id="finishes" />
      <LazySection>
        <PoolFinishesSection />
      </LazySection>
      <div id="liners" />
      <LazySection>
        <LinersSection />
      </LazySection>
      <div id="screen-enclosures" />
      <LazySection>
        <ScreenEnclosureSection />
      </LazySection>
      <div id="pavers" />
      <LazySection>
        <PaversSection />
      </LazySection>
      <div id="covers" />
      <LazySection>
        <AutomaticCoversSection />
      </LazySection>
      <Footer />
    </div>;
};
export default Index;