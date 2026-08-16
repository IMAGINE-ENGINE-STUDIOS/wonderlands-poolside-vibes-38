import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { ITEMS } from "@/components/FlipIndex";
import AssetGalleryConsole from "@/components/gallery/AssetGalleryConsole";
import usePersistentState from "@/hooks/usePersistentState";

/**
 * Asset Gallery — every product and every additional feature in the app,
 * browsable through the FLIP console interface.
 */
const AssetGallery: React.FC = () => {
  const [dims, setDims] = useState({ w: 1240, h: 720 });
  const [activeId, setActiveId] = usePersistentState<string>(
    "assetGallery.category",
    ITEMS[0].id,
  );
  const [mode, setMode] = usePersistentState<"products" | "features">(
    "assetGallery.mode",
    "products",
  );

  useEffect(() => {
    document.title = "Asset Gallery | Wonderlands World Products & Features";
    const desc = document.querySelector('meta[name="description"]');
    if (desc)
      desc.setAttribute(
        "content",
        "Browse every Wonderlands World product and additional feature — pools, spas, saunas, pavers, enclosures, finishes and all upgrade options with pricing.",
      );
  }, []);

  useEffect(() => {
    const measure = () => {
      const w = Math.max(300, Math.min(window.innerWidth - 40, 1440));
      setDims({ w, h: Math.round(Math.max(520, window.innerHeight * 0.84)) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const openSection = useCallback((id: string) => {
    window.location.href = `/wonderlands-studio?category=${id}`;
  }, []);

  return (
    <main className="min-h-screen bg-background px-3 py-8 md:px-8 md:py-12">
      <div className="mx-auto" style={{ maxWidth: dims.w }}>
        <header className="mb-6 text-center">
          <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
            Wonderlands World
          </p>
          <h1 className="mt-2 font-serif text-3xl font-light text-foreground md:text-5xl">
            Asset Gallery
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[12px] leading-relaxed text-muted-foreground">
            Every product and every additional feature in one console — switch between the
            collection and its configurable upgrades.
          </p>
        </header>

        <AssetGalleryConsole
          categories={ITEMS.map((i) => ({ id: i.id, label: i.label, tagline: i.tagline }))}
          activeId={activeId}
          mode={mode}
          width={dims.w}
          height={dims.h}
          onSelect={setActiveId}
          onModeChange={setMode}
          onOpenSection={openSection}
        />

        <p className="mt-5 text-center text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
          All prices include delivery, installation and the product as described.
        </p>
      </div>
    </main>
  );
};

export default AssetGallery;
