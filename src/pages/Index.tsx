import * as React from "react";
const { useEffect, lazy, Suspense } = React;
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import SectionBanner from "@/components/SectionBanner";
import StudioEditorial from "@/components/StudioEditorial";
import SolarEditorial from "@/components/SolarEditorial";

import grassBanner from "@/assets/turf/grass-natural-green.avif";
import lathamGilmerBanner from "@/assets/banners/latham-gilmer-banner.webp";
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
const PoolCoverEnergyEditorial = lazy(() => import("@/components/PoolCoverEnergyEditorial"));
const ScreenEnclosureSection = lazy(() => import("@/components/ScreenEnclosureSection"));
const PatioFencingSection = lazy(() => import("@/components/PatioFencingSection"));
const LanaiSection = lazy(() => import("@/components/LanaiSection"));
const PaversSection = lazy(() => import("@/components/PaversSection"));
const ArtificialGrassSection = lazy(() => import("@/components/ArtificialGrassSection"));
const DrivewayGateSection = lazy(() => import("@/components/DrivewayGateSection"));
const LandscapingSection = lazy(() => import("@/components/LandscapingSection"));
const WonderlandsSolarSection = lazy(() => import("@/components/WonderlandsSolarSection"));

const SectionFallback = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Loading…</div>
  </div>
);

/**
 * Index (home).
 *
 * NOTE (Aug 2026): the page used to swap a single category section based on the
 * URL hash (driven by the right-rail category buttons). Those buttons were removed,
 * so every category is now rendered inline, in order, below the Glimmerglass
 * (Gilmer fiberglass) collection. Section ids are preserved so deep links such as
 * `/#pavers` still work — they simply scroll instead of swapping the view.
 */
const Index = () => {
  // Deep-link support: scroll to the hashed section once mounted / on hash change.
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;
      // Sections stream in lazily, so retry briefly until the node exists.
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (tries++ < 20) {
          window.setTimeout(tick, 150);
        }
      };
      tick();
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Wonderlands | Everything Your Home Needs. One Platform.</title>
        <meta name="description" content="Wonderlands is a technology-powered home services platform: design, build, power and transform your home — outdoor living, pools, spas, patios, solar and energy — in one connected experience." />
        <meta name="keywords" content="home services platform, outdoor living, pool builder, solar panels, battery storage, patios, pavers, screen enclosures, landscaping, Orlando, Central Florida" />
        <link rel="canonical" href="https://www.wonderlandsworld.com/" />
        <meta property="og:title" content="Wonderlands | Everything Your Home Needs. One Platform." />
        <meta property="og:description" content="Design. Build. Power. Transform. One technology-powered platform for outdoor living, home improvement, solar and energy solutions." />
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
      <SolarEditorial />


      <main>
        {/* Pools + Glimmerglass fiberglass collection */}
        <Suspense fallback={<SectionFallback />}>
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
        </Suspense>

        {/* ---- All remaining categories, stacked below Glimmerglass ---- */}
        <Suspense fallback={<SectionFallback />}>
          <SectionBanner id="saunas" image={saunaBanner} alt="Luxury Saunas" title="Premium Saunas" subtitle="Experience the ultimate relaxation with our collection of luxury indoor and outdoor saunas" />
          <SaunaSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SectionBanner id="spas" image={spaBanner} alt="Hot Tubs & Spas" title="Hot Tubs & Spas" subtitle="Transform your backyard into a personal oasis with our premium spa collection" />
          <SpaCatalog />
          <GilmerSpasSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SectionBanner id="tanning-ledges" image={tanningLedgeBanner} alt="Tanning Ledges" title="Tanning Ledges" subtitle="Relax in style with our premium in-pool tanning ledges and sun shelves" />
          <TanningLedgeSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SectionBanner id="screen-enclosures" image={screenEnclosureBanner} alt="Screen Enclosures" title="Screen Enclosures" subtitle="Protect your pool area from bugs and debris while enjoying the Florida sunshine" />
          <ScreenEnclosureSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SectionBanner id="patio-fencing" image={patioFencingBanner} alt="Patio Fencing" title="Aluminum Patio Fencing" subtitle="Premium pool-code compliant aluminum fencing for safety and style" />
          <PatioFencingSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SectionBanner id="lanai" image={lanaiBanner} alt="Lanai Enclosures" title="Lanai Enclosures" subtitle="Transform your outdoor space into a luxurious covered living area" />
          <LanaiSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SectionBanner id="pavers" image={paversBanner} alt="Pool Pavers" title="Premium Pavers" subtitle="Elevate your outdoor space with stunning paver designs around your pool" />
          <PaversSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SectionBanner id="artificial-grass" image={grassBanner} alt="Artificial Grass" title="Artificial Grass" subtitle="Premium low-maintenance turf — get an instant quote at $25/sq ft" />
          <ArtificialGrassSection />
        </Suspense>

        {/* Wonderlands Solar — energy collection */}
        <Suspense fallback={<SectionFallback />}>
          <section id="solar" aria-label="Wonderlands Solar">
            <WonderlandsSolarSection />
          </section>
        </Suspense>


        <Suspense fallback={<SectionFallback />}>
          <SectionBanner id="landscaping" image={landscapingBanner} alt="Landscaping" title="Landscaping" subtitle="Transform your outdoor space with premium plants, palms, trees, and grasses" />
          <LandscapingSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SectionBanner id="covers" image={coversBanner} alt="Automatic Pool Covers" title="Automatic Pool Covers" subtitle="Safety, energy efficiency, and convenience with our automatic cover systems" />
          <AutomaticCoversSection />
          {/* "How much energy does a cover save" — editorial ledger */}
          <PoolCoverEnergyEditorial />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <SectionBanner id="driveway-gates" image={drivewayGateBanner} alt="Driveway Gates" title="Driveway Gates" subtitle="Add security and elegance to your property with our custom gate solutions" />
          <DrivewayGateSection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <section id="finishes" aria-label="Pool Finishes">
            <PoolFinishesSection />
          </section>
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <section id="liners" aria-label="Pool Liners">
            <LinersSection />
          </section>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
