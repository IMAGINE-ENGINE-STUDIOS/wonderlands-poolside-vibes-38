import React, { useEffect } from "react";
import LandscapingSection from "@/components/LandscapingSection";

const LandscapingPage: React.FC = () => {
  useEffect(() => {
    document.title = "Landscaping & Quote Tool | Wonderlands";
    const desc =
      "Browse our landscaping plant catalog and build an instant quote for yard refresh, full makeover, or luxury outdoor spaces.";
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
    <>
      <main className="min-h-screen bg-background">
        <header className="container mx-auto px-4 pt-10 pb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Landscaping
          </h1>
          <p className="text-muted-foreground mt-2">
            Pick your plants and build a quote in seconds.
          </p>
        </header>
        <LandscapingSection />
      </main>
    </>
  );
};

export default LandscapingPage;
