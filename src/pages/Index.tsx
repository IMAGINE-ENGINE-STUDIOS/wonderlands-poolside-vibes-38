import * as React from "react";
const { useEffect } = React;
import { Helmet } from "react-helmet";
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
import PatioFencingSection from "@/components/PatioFencingSection";
import LanaiSection from "@/components/LanaiSection";
import PaversSection from "@/components/PaversSection";
import DrivewayGateSection from "@/components/DrivewayGateSection";
import SaunaSection from "@/components/SaunaSection";
import Footer from "@/components/Footer";
import LazySection from "@/components/LazySection";
import SectionBanner from "@/components/SectionBanner";
import ProjectTypeToggle from "@/components/ProjectTypeToggle";
import lathamGilmerBanner from "@/assets/latham-gilmer-banner.jpeg";
import saunaBanner from "@/assets/banners/sauna-banner.jpg";
import spaBanner from "@/assets/banners/spa-banner.jpg";
import screenEnclosureBanner from "@/assets/banners/screen-enclosure-banner.jpg";
import paversBanner from "@/assets/banners/pavers-banner.jpg";
import coversBanner from "@/assets/banners/covers-banner.jpg";
import drivewayGateBanner from "@/assets/banners/driveway-gate-banner.jpg";
import tanningLedgeBanner from "@/assets/banners/tanning-ledge-banner.jpg";
import patioFencingBanner from "@/assets/banners/patio-fencing-banner.jpg";
import lanaiBanner from "@/assets/banners/lanai-banner.jpg";

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
      <Helmet>
        {/* Preload critical above-the-fold images */}
        <link rel="preload" as="image" href="/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.png" />
        <link rel="preload" as="image" href="/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png" />
        <link rel="preload" as="image" href="/lovable-uploads/63844c0c-04e6-4628-ad09-1b98c9283cf0.png" />
        <link rel="preload" as="image" href="/lovable-uploads/749a82f6-561b-4f6b-982b-d343dfac9565.png" />
      </Helmet>
      
      <Header />
      <Hero />
      
      {/* Project Type Toggle - Residential/Commercial */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border py-3 px-4">
        <div className="container mx-auto max-w-md">
          <ProjectTypeToggle showPriceNote={true} />
        </div>
      </div>
      
      {/* ========== MAIN POOLS SECTION (Wonderlands + Latham) ========== */}
      <div id="pools">
        <PoolCatalog />
      </div>
      
      {/* Banner between Latham and Gilmer Pools */}
      <div className="w-full">
        <img 
          src={lathamGilmerBanner} 
          alt="Luxury Pool Design" 
          className="w-full h-auto object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      
      {/* ========== GILMER POOLS SECTION ========== */}
      <LazySection>
        <GilmerPoolsSection />
      </LazySection>
      
      {/* ========== SAUNAS SECTION ========== */}
      <SectionBanner 
        id="saunas"
        image={saunaBanner} 
        alt="Luxury Saunas" 
        title="Premium Saunas"
        subtitle="Experience the ultimate relaxation with our collection of luxury indoor and outdoor saunas"
      />
      <LazySection>
        <SaunaSection />
      </LazySection>
      
      {/* ========== SPAS SECTION ========== */}
      <SectionBanner 
        id="spas"
        image={spaBanner} 
        alt="Hot Tubs & Spas" 
        title="Hot Tubs & Spas"
        subtitle="Transform your backyard into a personal oasis with our premium spa collection"
      />
      <LazySection eager={true}>
        <SpaCatalog />
      </LazySection>
      
      {/* ========== GILMER SPAS SECTION ========== */}
      <LazySection>
        <GilmerSpasSection />
      </LazySection>
      
      {/* ========== TANNING LEDGES SECTION ========== */}
      <SectionBanner 
        id="tanning-ledges"
        image={tanningLedgeBanner} 
        alt="Tanning Ledges" 
        title="Tanning Ledges"
        subtitle="Relax in style with our premium in-pool tanning ledges and sun shelves"
      />
      <LazySection>
        <TanningLedgeSection />
      </LazySection>
      
      {/* ========== SCREEN ENCLOSURES SECTION ========== */}
      <SectionBanner 
        id="screen-enclosures"
        image={screenEnclosureBanner} 
        alt="Screen Enclosures" 
        title="Screen Enclosures"
        subtitle="Protect your pool area from bugs and debris while enjoying the Florida sunshine"
      />
      <LazySection>
        <ScreenEnclosureSection />
      </LazySection>
      
      {/* ========== PATIO FENCING SECTION ========== */}
      <SectionBanner 
        id="patio-fencing"
        image={patioFencingBanner} 
        alt="Patio Fencing" 
        title="Aluminum Patio Fencing"
        subtitle="Premium pool-code compliant aluminum fencing for safety and style"
      />
      <LazySection>
        <PatioFencingSection />
      </LazySection>
      
      {/* ========== LANAI SECTION ========== */}
      <SectionBanner 
        id="lanai"
        image={lanaiBanner} 
        alt="Lanai Enclosures" 
        title="Lanai Enclosures"
        subtitle="Transform your outdoor space into a luxurious covered living area"
      />
      <LazySection>
        <LanaiSection />
      </LazySection>
      
      {/* ========== PAVERS SECTION ========== */}
      <SectionBanner 
        id="pavers"
        image={paversBanner} 
        alt="Pool Pavers" 
        title="Premium Pavers"
        subtitle="Elevate your outdoor space with stunning paver designs around your pool"
      />
      <LazySection>
        <PaversSection />
      </LazySection>
      
      {/* ========== COVERS SECTION ========== */}
      <SectionBanner 
        id="covers"
        image={coversBanner} 
        alt="Automatic Pool Covers" 
        title="Automatic Pool Covers"
        subtitle="Safety, energy efficiency, and convenience with our automatic cover systems"
      />
      <LazySection>
        <AutomaticCoversSection />
      </LazySection>
      
      {/* ========== DRIVEWAY GATES SECTION ========== */}
      <SectionBanner 
        id="driveway-gates"
        image={drivewayGateBanner} 
        alt="Driveway Gates" 
        title="Driveway Gates"
        subtitle="Add security and elegance to your property with our custom gate solutions"
      />
      <LazySection>
        <DrivewayGateSection />
      </LazySection>
      
      {/* ========== POOL FINISHES SECTION ========== */}
      <div id="finishes">
        <LazySection>
          <PoolFinishesSection />
        </LazySection>
      </div>
      
      {/* ========== LINERS SECTION ========== */}
      <div id="liners">
        <LazySection>
          <LinersSection />
        </LazySection>
      </div>
      <Footer />
    </div>;
};
export default Index;
