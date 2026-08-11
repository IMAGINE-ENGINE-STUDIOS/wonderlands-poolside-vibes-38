import * as React from "react";
const { useEffect, useState, lazy, Suspense } = React;
import { Helmet } from "react-helmet";
import {
  Waves,
  Flame,
  Droplet,
  Sun,
  Shield,
  Fence,
  Home as HomeIcon,
  Grid3x3,
  Sprout,
  Umbrella,
  DoorOpen,
  Palette,
  Layers,
  Trees,
} from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import SectionBanner from "@/components/SectionBanner";
import StudioEditorial from "@/components/StudioEditorial";
import BrowseCategoriesEditorial from "@/components/BrowseCategoriesEditorial";

import grassBanner from "@/assets/grass-natural-green.avif";
import lathamGilmerBanner from "@/assets/latham-gilmer-banner.webp";
import saunaBanner from "@/assets/banners/sauna-banner.webp";
import spaBanner from "@/assets/banners/spa-banner.webp";
import screenEnclosureBanner from "@/assets/banners/screen-enclosure-banner.webp";
import paversBanner from "@/assets/banners/pavers-banner.webp";
import coversBanner from "@/assets/banners/covers-banner.webp";
import drivewayGateBanner from "@/assets/banners/driveway-gate-banner.webp";
import tanningLedgeBanner from "@/assets/banners/tanning-ledge-banner.webp";
import patioFencingBanner from "@/assets/banners/patio-fencing-banner.webp";
import lanaiBanner from "@/assets/banners/lanai-banner.webp";
import landscapingBanner from "@/assets/banners/landscaping-banner.webp";

// Lazy-loaded section components
const PoolCatalog = lazy(() => import("@/components/PoolCatalog"));
const GilmerPoolsSection = lazy(() => import("@/components/GilmerPoolsSection"));
const SaunaSection = lazy(() => import("@/components/SaunaSection"));
const SpaCatalog = lazy(() => import("@/components/SpaCatalog"));
const GilmerSpasSection = lazy(() => import("@/components/GilmerSpasSection"));
const TanningLedgeSection = lazy(() => import("@/components/TanningLedgeSection"));
const PoolFinishesSection = lazy(() => import("@/components/PoolFinishesSection"));
const LinersSection = lazy(() => import("@/components/LinersSection"));
const AutomaticCoversSection = lazy(() => import("@/components/AutomaticCoversSection"));
const ScreenEnclosureSection = lazy(() => import("@/components/ScreenEnclosureSection"));
const PatioFencingSection = lazy(() => import("@/components/PatioFencingSection"));
const LanaiSection = lazy(() => import("@/components/LanaiSection"));
const PaversSection = lazy(() => import("@/components/PaversSection"));
const ArtificialGrassSection = lazy(() => import("@/components/ArtificialGrassSection"));
const DrivewayGateSection = lazy(() => import("@/components/DrivewayGateSection"));
const LandscapingSection = lazy(() => import("@/components/LandscapingSection"));

type SectionId =
  | "pools"
  | "saunas"
  | "spas"
  | "tanning-ledges"
  | "screen-enclosures"
  | "patio-fencing"
  | "lanai"
  | "pavers"
  | "artificial-grass"
  | "landscaping"
  | "covers"
  | "driveway-gates"
  | "finishes"
  | "liners";

const CATEGORIES = [
  { id: "pools", label: "Pools", icon: Waves },
  { id: "saunas", label: "Saunas", icon: Flame },
  { id: "spas", label: "Spas", icon: Droplet },
  { id: "tanning-ledges", label: "Tanning Ledges", icon: Sun },
  { id: "screen-enclosures", label: "Screen Enclosures", icon: Shield },
  { id: "patio-fencing", label: "Patio Fencing", icon: Fence },
  { id: "lanai", label: "Lanai", icon: HomeIcon },
  { id: "pavers", label: "Pavers", icon: Grid3x3 },
  { id: "artificial-grass", label: "Artificial Grass", icon: Sprout },
  { id: "landscaping", label: "Landscaping", icon: Trees },
  { id: "covers", label: "Covers", icon: Umbrella },
  { id: "driveway-gates", label: "Driveway Gates", icon: DoorOpen },
  { id: "finishes", label: "Finishes", icon: Palette },
  { id: "liners", label: "Liners", icon: Layers },
];

const VALID_IDS = new Set(CATEGORIES.map((c) => c.id));

const getInitialFromHash = (): SectionId => {
  if (typeof window === "undefined") return "pools";
  const hash = window.location.hash.replace("#", "");
  return (VALID_IDS.has(hash) ? hash : "pools") as SectionId;
};

const SectionFallback = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Loading…</div>
  </div>
);

const Index = () => {
  const [active, setActive] = useState<SectionId>(getInitialFromHash());

  // Sync URL hash → active state
  useEffect(() => {
    const onHashChange = () => {
      const id = window.location.hash.replace("#", "");
      if (VALID_IDS.has(id)) {
        setActive(id as SectionId);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleChange = (id: string) => {
    if (!VALID_IDS.has(id)) return;
    setActive(id as SectionId);
    if (window.location.hash !== `#${id}`) {
      history.replaceState(null, "", `#${id}`);
    }
  };

  const renderActive = () => {
    switch (active) {
      case "pools":
        return (
          <div key="pools" className="animate-fade-in">
            <section id="pools" aria-label="Pool Catalog">
              <PoolCatalog />
            </section>
            <div className="w-full">
              <img
                src={lathamGilmerBanner}
                alt="Luxury Pool Design"
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <GilmerPoolsSection />
          </div>
        );
      case "saunas":
        return (
          <div key="saunas" className="animate-fade-in">
            <SectionBanner id="saunas" image={saunaBanner} alt="Luxury Saunas" title="Premium Saunas" subtitle="Experience the ultimate relaxation with our collection of luxury indoor and outdoor saunas" />
            <SaunaSection />
          </div>
        );
      case "spas":
        return (
          <div key="spas" className="animate-fade-in">
            <SpaCatalog />
            <GilmerSpasSection />
            <SectionBanner id="spas" image={spaBanner} alt="Hot Tubs & Spas" title="Hot Tubs & Spas" subtitle="Transform your backyard into a personal oasis with our premium spa collection" />
          </div>
        );
      case "tanning-ledges":
        return (
          <div key="tanning-ledges" className="animate-fade-in">
            <TanningLedgeSection />
            <SectionBanner id="tanning-ledges" image={tanningLedgeBanner} alt="Tanning Ledges" title="Tanning Ledges" subtitle="Relax in style with our premium in-pool tanning ledges and sun shelves" />
          </div>
        );
      case "screen-enclosures":
        return (
          <div key="screen-enclosures" className="animate-fade-in">
            <ScreenEnclosureSection />
            <SectionBanner id="screen-enclosures" image={screenEnclosureBanner} alt="Screen Enclosures" title="Screen Enclosures" subtitle="Protect your pool area from bugs and debris while enjoying the Florida sunshine" />
          </div>
        );
      case "patio-fencing":
        return (
          <div key="patio-fencing" className="animate-fade-in">
            <PatioFencingSection />
            <SectionBanner id="patio-fencing" image={patioFencingBanner} alt="Patio Fencing" title="Aluminum Patio Fencing" subtitle="Premium pool-code compliant aluminum fencing for safety and style" />
          </div>
        );
      case "lanai":
        return (
          <div key="lanai" className="animate-fade-in">
            <LanaiSection />
            <SectionBanner id="lanai" image={lanaiBanner} alt="Lanai Enclosures" title="Lanai Enclosures" subtitle="Transform your outdoor space into a luxurious covered living area" />
          </div>
        );
      case "pavers":
        return (
          <div key="pavers" className="animate-fade-in">
            <PaversSection />
            <SectionBanner id="pavers" image={paversBanner} alt="Pool Pavers" title="Premium Pavers" subtitle="Elevate your outdoor space with stunning paver designs around your pool" />
          </div>
        );
      case "artificial-grass":
        return (
          <div key="artificial-grass" className="animate-fade-in">
            <ArtificialGrassSection />
            <SectionBanner id="artificial-grass" image={grassBanner} alt="Artificial Grass" title="Artificial Grass" subtitle="Premium low-maintenance turf — get an instant quote at $25/sq ft" />
          </div>
        );
      case "landscaping":
        return (
          <div key="landscaping" className="animate-fade-in">
            <LandscapingSection />
            <SectionBanner id="landscaping" image={landscapingBanner} alt="Landscaping" title="Landscaping" subtitle="Transform your outdoor space with premium plants, palms, trees, and grasses" />
          </div>
        );
      case "covers":
        return (
          <div key="covers" className="animate-fade-in">
            <AutomaticCoversSection />
            <SectionBanner id="covers" image={coversBanner} alt="Automatic Pool Covers" title="Automatic Pool Covers" subtitle="Safety, energy efficiency, and convenience with our automatic cover systems" />
          </div>
        );
      case "driveway-gates":
        return (
          <div key="driveway-gates" className="animate-fade-in">
            <DrivewayGateSection />
            <SectionBanner id="driveway-gates" image={drivewayGateBanner} alt="Driveway Gates" title="Driveway Gates" subtitle="Add security and elegance to your property with our custom gate solutions" />
          </div>
        );
      case "finishes":
        return (
          <section key="finishes" id="finishes" aria-label="Pool Finishes" className="animate-fade-in">
            <PoolFinishesSection />
          </section>
        );
      case "liners":
        return (
          <section key="liners" id="liners" aria-label="Pool Liners" className="animate-fade-in">
            <LinersSection />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Wonderlands Pools & Spas | #1 Pool Builder in Florida | Pool Contractor Orlando, FL</title>
        <meta name="description" content="Florida's premier pool builder and contractor. Custom fiberglass pools, hot tubs, spas, saunas, patios, pavers, screen enclosures & more. Serving Orlando, Lake Nona, and Central Florida. Get a free quote today!" />
        <meta name="keywords" content="pool builder, pool contractor, Florida pool builder, Orlando pool builder, fiberglass pools, spa installation, hot tubs, patios, pavers, screen enclosures, pool renovation, Central Florida pools" />
        <link rel="canonical" href="https://www.wonderlandsworld.com/" />
        <meta property="og:title" content="Wonderlands Pools & Spas | #1 Pool Builder in Florida" />
        <meta property="og:description" content="Florida's premier pool builder. Custom fiberglass pools, spas, saunas, patios & more. Serving Orlando & Central Florida." />
        <meta property="og:url" content="https://www.wonderlandsworld.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.wonderlandsworld.com/lovable-uploads/7a94e712-7683-4a26-8a1c-c6974e320b5a.png" />
        <link rel="preload" as="image" href="/lovable-uploads/c7c3ab88-34ab-47d4-bf6c-38893a5b13f2.webp" />
        <link rel="preload" as="image" href="/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.webp" />
        <link rel="preload" as="image" href="/lovable-uploads/63844c0c-04e6-4628-ad09-1b98c9283cf0.webp" />
        <link rel="preload" as="image" href="/lovable-uploads/749a82f6-561b-4f6b-982b-d343dfac9565.webp" />
      </Helmet>

      <Header />
      <Hero />
      <StudioEditorial />
      <BrowseCategoriesEditorial activeId={active} onSelect={handleChange} />

      <main>
        <Suspense fallback={<SectionFallback />}>{renderActive()}</Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
