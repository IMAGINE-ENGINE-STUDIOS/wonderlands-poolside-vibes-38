import * as React from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ITEMS } from "@/components/FlipIndex";
import { loadCategoryEntries, getCachedCategoryEntries, type ConsoleEntry } from "./flipConsoleData";
import { useProductBookPages } from "./FlipProductBook";
import usePersistentState from "@/hooks/usePersistentState";
import { preloadImages } from "@/lib/flipPreload";

const Leaf = forwardRef<HTMLDivElement, { children: React.ReactNode }>(({ children }, ref) => (
  <div
    ref={ref}
    className="h-full w-full overflow-hidden bg-background text-foreground"
    style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.06)" }}
  >
    {children}
  </div>
));
Leaf.displayName = "Leaf";

const EMPTY: ConsoleEntry = { id: "none", name: "", image: "" };

/**
 * FLIP — Dossier edition (standalone).
 * One model read at full depth: statement spread, dimensions, option chapters,
 * brand notes, the design board and the order page.
 */
const FlipDossierEdition: React.FC = () => {
  const bookRef = useRef<any>(null);
  const [portrait, setPortrait] = useState(false);
  const [dims, setDims] = useState({ w: 420, h: 560 });
  const [categoryId, setCategoryId] = usePersistentState<string>("flip.dossier.category", ITEMS[0].id);
  const [entryId, setEntryId] = usePersistentState<string>("flip.dossier.entry", "");
  const [entries, setEntries] = useState<ConsoleEntry[] | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const measure = () => {
      const isPortrait = window.innerWidth < 900;
      setPortrait(isPortrait);
      const avail = Math.min(window.innerWidth - 32, 1400);
      const w = isPortrait ? avail : Math.floor(avail / 2);
      setDims({ w, h: Math.round(w * 1.33) });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    let alive = true;
    const cached = getCachedCategoryEntries(categoryId);
    setEntries(cached ?? null);
    if (cached) {
      preloadImages(cached.slice(0, 8).map((e) => e.image), true);
      return;
    }
    loadCategoryEntries(categoryId).then((list) => {
      if (!alive) return;
      setEntries(list);
      preloadImages(list.slice(0, 8).map((e) => e.image), true);
    });
    return () => {
      alive = false;
    };
  }, [categoryId]);

  const category = ITEMS.find((i) => i.id === categoryId) ?? ITEMS[0];
  const entry = useMemo(
    () => (entries ?? []).find((e) => e.id === entryId) ?? (entries ?? [])[0] ?? EMPTY,
    [entries, entryId],
  );

  const pages = useProductBookPages({
    entry,
    category: {
      id: category.id,
      label: category.label,
      tagline: category.tagline,
      description: category.description,
      notes: category.notes,
      images: category.images,
    },
    portrait,
  });

  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);
  const ready = !!entries && !!entry.name;

  return (
    <section aria-label="FLIP dossier edition" className="bg-background">
      <div className="flex flex-wrap items-end gap-4 border-b border-border/50 px-6 py-4 md:px-10">
        <label className="block">
          <span className="block text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Discipline</span>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setEntryId("");
            }}
            className="mt-1 border border-border/60 bg-background px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground"
          >
            {ITEMS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Model</span>
          <select
            value={entry.id}
            onChange={(e) => setEntryId(e.target.value)}
            className="mt-1 max-w-[70vw] border border-border/60 bg-background px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground"
          >
            {(entries ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="px-2 pb-28 pt-8 md:px-6 md:py-12">
        <div className="mx-auto flex justify-center" style={{ perspective: "3000px", minHeight: dims.h }}>
          {ready ? (
            <HTMLFlipBook
              key={`${categoryId}-${entry.id}-${pages.length}-${dims.w}`}
              ref={bookRef}
              width={dims.w}
              height={dims.h}
              size="fixed"
              minWidth={240}
              maxWidth={1400}
              minHeight={340}
              maxHeight={1400}
              showCover={false}
              usePortrait={portrait}
              mobileScrollSupport
              drawShadow
              flippingTime={880}
              maxShadowOpacity={0.5}
              startPage={0}
              startZIndex={0}
              autoSize={false}
              clickEventForward={false}
              useMouseEvents
              swipeDistance={30}
              showPageCorners
              disableFlipByClick
              style={{}}
              className="shadow-[0_50px_110px_-30px_rgba(0,0,0,0.55)]"
              onFlip={(e: any) => setPage(e.data as number)}
            >
              {pages.map((p) => (
                <Leaf key={p.key}>{p.render()}</Leaf>
              ))}
            </HTMLFlipBook>
          ) : (
            <div
              className="border border-border/60"
              style={{ width: portrait ? dims.w : dims.w * 2, height: dims.h }}
            />
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={flipPrev}
              aria-label="Previous page"
              className="flex h-10 w-10 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={flipNext}
              aria-label="Next page"
              className="flex h-10 w-10 items-center justify-center border border-border/60 text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            {String(Math.min(page + 1, pages.length)).padStart(2, "0")} /{" "}
            {String(pages.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FlipDossierEdition;
