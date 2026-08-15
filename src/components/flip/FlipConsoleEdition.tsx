import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { ITEMS } from "@/components/FlipIndex";
import FlipConsole from "./FlipConsole";
import usePersistentState from "@/hooks/usePersistentState";
import { preloadImages, prefetchEditions } from "@/lib/flipPreload";

/**
 * FLIP — Console edition (standalone).
 * The overlay browser on its own: a category rail, live search and the
 * magazine product grid, sized to a single spread.
 */
const FlipConsoleEdition: React.FC = () => {
  const [dims, setDims] = useState({ w: 840, h: 560 });
  const [activeId, setActiveId] = usePersistentState<string>("flip.console.category", ITEMS[0].id);

  useEffect(() => {
    const measure = () => {
      const vw = Math.min(window.innerWidth - 40, 1240);
      const w = Math.max(300, vw);
      setDims({ w, h: Math.round(Math.min(w * 0.62, window.innerHeight * 0.78)) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    prefetchEditions(ITEMS.map((i) => i.id), activeId);
    preloadImages(ITEMS.flatMap((i) => i.images ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSection = useCallback((id: string) => {
    window.location.href = `/wonderlands-studio?category=${id}`;
  }, []);

  return (
    <section aria-label="FLIP console edition" className="bg-background px-3 py-8 md:px-8 md:py-12">
      <div className="mx-auto" style={{ maxWidth: dims.w }}>
        <div className="relative border border-border/60 bg-background shadow-[0_50px_110px_-40px_rgba(0,0,0,0.45)]">
          <FlipConsole
            categories={ITEMS.map((i) => ({ id: i.id, label: i.label, tagline: i.tagline }))}
            activeId={activeId}
            width={dims.w}
            height={dims.h}
            onSelect={setActiveId}
            onClose={() => undefined}
            onOpenSection={openSection}
          />
        </div>
        <p className="mt-5 text-center text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
          All prices include delivery, installation and the product as described.
        </p>
      </div>
    </section>
  );
};

export default FlipConsoleEdition;
