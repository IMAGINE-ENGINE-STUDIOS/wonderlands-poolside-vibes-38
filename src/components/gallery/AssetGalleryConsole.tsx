import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, ArrowRight } from "lucide-react";
import {
  loadCategoryEntries,
  formatEntryPrice,
  type ConsoleEntry,
} from "@/components/flip/flipConsoleData";
import { loadFeatureSections, type FeatureSection } from "@/lib/assetGalleryData";

export type ConsoleCategory = { id: string; label: string; tagline: string };

type Mode = "products" | "features";

interface Props {
  categories: ConsoleCategory[];
  activeId: string;
  mode: Mode;
  width: number;
  height: number;
  onSelect: (id: string) => void;
  onModeChange: (mode: Mode) => void;
  onOpenSection: (id: string) => void;
}

const EntryCard: React.FC<{ entry: ConsoleEntry }> = ({ entry }) => (
  <article className="group flex flex-col border border-border/60">
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
      {entry.image ? (
        <img
          src={entry.image}
          alt={entry.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : entry.color ? (
        <div className="absolute inset-0" style={{ background: entry.color }} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-3 text-center font-serif text-sm font-light text-muted-foreground">
          {entry.name}
        </div>
      )}
    </div>
    <div className="flex flex-1 flex-col gap-1 p-3">
      {entry.brand && (
        <p className="truncate text-[8px] uppercase tracking-[0.3em] text-muted-foreground">
          {entry.brand}
        </p>
      )}
      <h4 className="font-serif text-[15px] font-light leading-tight text-foreground">
        {entry.name}
      </h4>
      {entry.meta && (
        <p className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">{entry.meta}</p>
      )}
      {formatEntryPrice(entry) && (
        <p className="mt-auto border-t border-border/50 pt-1.5 text-[10px] uppercase tracking-[0.22em] text-foreground">
          {formatEntryPrice(entry)}
        </p>
      )}
    </div>
  </article>
);

const Skeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="animate-pulse border border-border/50">
        <div className="aspect-[4/3] w-full bg-muted" />
        <div className="h-10" />
      </div>
    ))}
  </div>
);

const AssetGalleryConsole: React.FC<Props> = ({
  categories,
  activeId,
  mode,
  width,
  height,
  onSelect,
  onModeChange,
  onOpenSection,
}) => {
  const [products, setProducts] = useState<ConsoleEntry[] | null>(null);
  const [sections, setSections] = useState<FeatureSection[] | null>(null);
  const [query, setQuery] = useState("");

  const index = categories.findIndex((c) => c.id === activeId);
  const active = categories[index];

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    setSections(null);
    loadCategoryEntries(activeId).then((l) => !cancelled && setProducts(l));
    loadFeatureSections(activeId).then((l) => !cancelled && setSections(l));
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const matches = (e: ConsoleEntry, q: string) =>
    e.name.toLowerCase().includes(q) ||
    (e.meta ?? "").toLowerCase().includes(q) ||
    (e.brand ?? "").toLowerCase().includes(q);

  const q = query.trim().toLowerCase();

  const visibleProducts = useMemo(
    () => (!products ? [] : q ? products.filter((e) => matches(e, q)) : products),
    [products, q],
  );

  const visibleSections = useMemo(() => {
    if (!sections) return [];
    if (!q) return sections;
    return sections
      .map((s) => ({ ...s, entries: s.entries.filter((e) => matches(e, q)) }))
      .filter((s) => s.entries.length > 0);
  }, [sections, q]);

  const count =
    mode === "products"
      ? products
        ? `${visibleProducts.length} items`
        : "Loading"
      : sections
        ? `${visibleSections.reduce((n, s) => n + s.entries.length, 0)} assets`
        : "Loading";

  const step = (dir: -1 | 1) => {
    const next = (index + dir + categories.length) % categories.length;
    onSelect(categories[next].id);
  };

  return (
    <div
      className="flex flex-col border border-foreground/15 bg-background shadow-[0_50px_110px_-30px_rgba(0,0,0,0.55)]"
      style={{ width, height, maxWidth: "100%" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
            Asset Gallery — {String(index + 1).padStart(2, "0")} /{" "}
            {String(categories.length).padStart(2, "0")}
          </p>
          <h3 className="truncate font-serif text-2xl font-light leading-tight text-foreground md:text-3xl">
            {active?.label}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="mr-2 hidden items-center border border-border/60 sm:flex">
            {(["products", "features"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={`px-3 py-1.5 text-[9px] uppercase tracking-[0.28em] transition-colors ${
                  mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "products" ? "Products" : "Features"}
              </button>
            ))}
          </div>
          <button
            onClick={() => step(-1)}
            aria-label="Previous category"
            className="flex h-8 w-8 items-center justify-center border border-border/60 transition-colors hover:bg-foreground hover:text-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => step(1)}
            aria-label="Next category"
            className="flex h-8 w-8 items-center justify-center border border-border/60 transition-colors hover:bg-foreground hover:text-background"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Category rail */}
        <nav
          aria-label="Gallery categories"
          className="hidden w-48 shrink-0 flex-col overflow-y-auto border-r border-border/60 py-3 md:flex"
        >
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`px-5 py-2 text-left text-[9px] uppercase tracking-[0.28em] transition-colors ${
                c.id === activeId
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </nav>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2 md:px-6">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${active?.label ?? ""} ${mode === "features" ? "features" : "products"}`}
              className="w-full bg-transparent py-1 text-[11px] uppercase tracking-[0.18em] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <span className="shrink-0 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
              {count}
            </span>
          </div>

          {/* Mobile strips */}
          <div className="flex items-center gap-4 border-b border-border/60 px-4 py-2 sm:hidden">
            {(["products", "features"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={`border-b pb-0.5 text-[9px] uppercase tracking-[0.28em] ${
                  mode === m ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
                }`}
              >
                {m === "products" ? "Products" : "Features"}
              </button>
            ))}
          </div>
          <div className="flex gap-4 overflow-x-auto border-b border-border/60 px-4 py-2 md:hidden">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`shrink-0 whitespace-nowrap border-b pb-0.5 text-[9px] uppercase tracking-[0.28em] ${
                  c.id === activeId
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
            {mode === "products" ? (
              !products ? (
                <Skeleton />
              ) : visibleProducts.length === 0 ? (
                <p className="py-16 text-center text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  No products in this discipline
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {visibleProducts.map((e) => (
                    <EntryCard key={e.id} entry={e} />
                  ))}
                </div>
              )
            ) : !sections ? (
              <Skeleton />
            ) : visibleSections.length === 0 ? (
              <p className="py-16 text-center text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                No additional features for this discipline
              </p>
            ) : (
              <div className="space-y-8">
                {visibleSections.map((s) => (
                  <section key={s.title}>
                    <div className="mb-3 border-b border-border/60 pb-2">
                      <h4 className="font-serif text-xl font-light text-foreground">{s.title}</h4>
                      <p className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                        {s.note}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                      {s.entries.map((e) => (
                        <EntryCard key={e.id} entry={{ ...e, brand: undefined }} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3 md:px-6">
            <p className="hidden text-[9px] uppercase tracking-[0.3em] text-muted-foreground sm:block">
              Price includes installation at your home address
            </p>
            <button
              onClick={() => onOpenSection(activeId)}
              className="group/btn inline-flex items-center gap-3 border border-foreground bg-foreground px-4 py-2.5 text-[10px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-background hover:text-foreground"
            >
              Open in Studio
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetGalleryConsole;
