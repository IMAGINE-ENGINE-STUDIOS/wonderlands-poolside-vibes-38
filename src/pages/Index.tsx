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
import lathamGilmerBanner from "@/assets/latham-gilmer-banner.jpeg";
import saunaBanner from "@/assets/banners/sauna-banner.jpg";
import spaBanner from "@/assets/banners/spa-banner.jpg";
import screenEnclosureBanner from "@/assets/banners/screen-enclosure-banner.jpg";
import paversBanner from "@/assets/banners/pavers-banner.jpg";
import coversBanner from "@/assets/banners/covers-banner.jpg";
import drivewayGateBanner from "@/assets/banners/driveway-gate-banner.jpg";

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
      
      {/* Anchors for RightNavigation */}
      <div id="pools" />
      {/* Load PoolCatalog eagerly - it's above the fold */}
      <PoolCatalog />
      
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
      
      <div id="gilmer-pools" />
      <LazySection>
        <GilmerPoolsSection />
      </LazySection>
      
      <div id="saunas" />
      <SectionBanner 
        image={saunaBanner} 
        alt="Luxury Saunas" 
        title="Premium Saunas"
        subtitle="Experience the ultimate relaxation with our collection of luxury indoor and outdoor saunas"
      />
      <LazySection>
        <SaunaSection />
      </LazySection>
      
      <div id="spas" />
      <SectionBanner 
        image={spaBanner} 
        alt="Hot Tubs & Spas" 
        title="Hot Tubs & Spas"
        subtitle="Transform your backyard into a personal oasis with our premium spa collection"
      />
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
      
      <div id="screen-enclosures" />
      <SectionBanner 
        image={screenEnclosureBanner} 
        alt="Screen Enclosures" 
        title="Screen Enclosures"
        subtitle="Protect your pool area from bugs and debris while enjoying the Florida sunshine"
      />
      <LazySection>
        <ScreenEnclosureSection />
      </LazySection>
      
      <div id="patio-fencing" />
      <LazySection>
        <PatioFencingSection />
      </LazySection>
      
      <div id="lanai" />
      <LazySection>
        <LanaiSection />
      </LazySection>
      
      <div id="pavers" />
      <SectionBanner 
        image={paversBanner} 
        alt="Pool Pavers" 
        title="Premium Pavers"
        subtitle="Elevate your outdoor space with stunning paver designs around your pool"
      />
      <LazySection>
        <PaversSection />
      </LazySection>
      
      <div id="covers" />
      <SectionBanner 
        image={coversBanner} 
        alt="Automatic Pool Covers" 
        title="Automatic Pool Covers"
        subtitle="Safety, energy efficiency, and convenience with our automatic cover systems"
      />
      <LazySection>
        <AutomaticCoversSection />
      </LazySection>
      
      <div id="driveway-gates" />
      <SectionBanner 
        image={drivewayGateBanner} 
        alt="Driveway Gates" 
        title="Driveway Gates"
        subtitle="Add security and elegance to your property with our custom gate solutions"
      />
      <LazySection>
        <DrivewayGateSection />
      </LazySection>
      
      <div id="finishes" />
      <LazySection>
        <PoolFinishesSection />
      </LazySection>
      
      <div id="liners" />
      <LazySection>
        <LinersSection />
      </LazySection>
      <Footer />
    </div>;
};
export default Index;
