import React from "react";
import { Helmet } from "react-helmet-async";
import LandscapingSection from "@/components/LandscapingSection";

const LandscapingPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Landscaping & Quote Tool | Wonderlands</title>
        <meta
          name="description"
          content="Browse our landscaping plant catalog and build an instant quote for yard refresh, full makeover, or luxury outdoor spaces."
        />
        <link rel="canonical" href="/landscaping" />
      </Helmet>
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
