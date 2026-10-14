import React, { useEffect } from "react";
import LandscapingSection from "@/components/LandscapingSection";

const LandscapingPage: React.FC = () => {
  useEffect(() => {
    document.title = "Landscaping Studio — Plan, Plant & Price | Wonderlands";
    const desc =
      "Design your Florida garden: start from a look, draw beds, place real plants at true size, ask Genius, and get an instant landscaping estimate.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", window.location.origin + "/landscaping");
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="container mx-auto px-4 pt-14 pb-6 border-b border-border/60">
        <p className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground">Wonderlands — The Landscaping Studio</p>
        <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight text-foreground mt-3">
          Plan it. Plant it. Price it.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
          Four chapters — inspire, design, choose plants, estimate & book. Your plan saves automatically on this device.
        </p>
      </header>
      <LandscapingSection />
    </main>
  );
};

export default LandscapingPage;
