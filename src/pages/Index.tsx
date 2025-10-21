import { useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PoolCatalog from "@/components/PoolCatalog";
import GilmerPoolsSection from "@/components/GilmerPoolsSection";
import SpaCatalog from "@/components/SpaCatalog";
import GilmerSpasSection from "@/components/GilmerSpasSection";
import TanningLedgeSection from "@/components/TanningLedgeSection";
import PoolFinishesSection from "@/components/PoolFinishesSection";
import LinersSection from "@/components/LinersSection";
import AutomaticCoversSection from "@/components/AutomaticCoversSection";
import ScreenEnclosureSection from "@/components/ScreenEnclosureSection";
import PaversSection from "@/components/PaversSection";
import DrivewayGateSection from "@/components/DrivewayGateSection";
import SaunaSection from "@/components/SaunaSection";
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
      
      <div id="gilmer-pools" />
      <LazySection>
        <GilmerPoolsSection />
      </LazySection>
      
      <div id="spas" />
      <LazySection eager={true}>
        <SpaCatalog />
      </LazySection>
      
      <div id="gilmer-spas" />
      <LazySection>
        <GilmerSpasSection />
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
      <div id="driveway-gates" />
      <LazySection>
        <DrivewayGateSection />
      </LazySection>
      <div id="saunas" />
      <LazySection>
        <SaunaSection />
      </LazySection>
      <Footer />
    </div>;
};
export default Index;