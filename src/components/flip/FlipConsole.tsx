import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Search, ArrowRight } from "lucide-react";
import { loadCategoryEntries, formatEntryPrice, type ConsoleEntry } from "./flipConsoleData";

export type ConsoleCategory = { id: string; label: string; tagline: string };

interface FlipConsoleProps {
  categories: ConsoleCategory[];
  activeId: string;
  width: number;
  height: number;
  onSelect: (id: string) => void;
  onClose: () => void;
  onOpenSection: (id: string) => void;
  /** When provided, every product tile becomes clickable (configurator hand-off) */
  onSelectEntry?: (entry: ConsoleEntry, categoryId: string) => void;
  /** Entry currently open in the configurator */
  activeEntryId?: string;
  /** Hide the close control (embedded use) */
  hideClose?: boolean;
  /** Replaces the footer call to action label */
  footerLabel?: string;
}


const FlipConsole: React.FC<FlipConsoleProps> = ({
  categories,
  activeId,
  width,
  height,
  onSelect,
  onClose,
  onOpenSection,
  onSelectEntry,
  activeEntryId,
  hideClose,
  footerLabel,
}) => {

  const [entries, setEntries] = useState<ConsoleEntry[] | null>(null);
  const [query, setQuery] = useState("");

  const index = categories.findIndex((c) => c.id === activeId);
  const active = categories[index];

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setQuery("");
    loadCategoryEntries(activeId).then((list) => {
      if (!cancelled) setEntries(list);
    });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const visible = useMemo(() => {
    if (!entries) return [];
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.meta ?? "").toLowerCase().includes(q) ||
        (e.brand ?? "").toLowerCase().includes(q),
    );
  }, [entries, query]);

  const step = (dir: -1 | 1) => {
    const next = (index + dir + categories.length) % categories.length;
    onSelect(categories[next].id);
  };

  return (
    <div
      role="dialog"
      aria-label={`${active?.label ?? "Category"} console`}
      className="flex flex-col border border-foreground/15 bg-background shadow-[0_50px_110px_-30px_rgba(0,0,0,0.55)]"
      style={{ width, height, maxWidth: "100%" }}
    >
      {/* Console header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
            FLIP Console — {String(index + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
          </p>
          <h3 className="truncate font-serif text-2xl font-light leading-tight text-foreground md:text-3xl">
            {active?.label}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
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
          <button
            onClick={onClose}
            aria-label="Close console"
            className="ml-1 flex h-8 w-8 items-center justify-center border border-border/60 transition-colors hover:bg-foreground hover:text-background"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Category rail */}
        <nav
          aria-label="Console categories"
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
              placeholder={`Search ${active?.label ?? ""}`}
              className="w-full bg-transparent py-1 text-[11px] uppercase tracking-[0.18em] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <span className="shrink-0 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
              {entries ? `${visible.length} items` : "Loading"}
            </span>
          </div>

          {/* Mobile category strip */}
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

          {/* Entries */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
            {!entries ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse border border-border/50">
                    <div className="aspect-[4/3] w-full bg-muted" />
                    <div className="h-10" />
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <p className="font-serif text-2xl font-light text-foreground">
                  {active?.tagline}
                </p>
                <p className="max-w-sm text-[11px] leading-relaxed text-muted-foreground">
                  This discipline is composed to order. Open the collection below to see the full
                  presentation.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {visible.map((e) => {
                  const clickable = Boolean(onSelectEntry);
                  const isActive = activeEntryId === e.id;
                  return (
                  <article
                    key={e.id}
                    onClick={clickable ? () => onSelectEntry!(e, activeId) : undefined}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onKeyDown={
                      clickable
                        ? (ev) => {
                            if (ev.key === "Enter" || ev.key === " ") {
                              ev.preventDefault();
                              onSelectEntry!(e, activeId);
                            }
                          }
                        : undefined
                    }
                    className={`group flex flex-col border transition-colors ${
                      isActive ? "border-foreground bg-foreground/[0.04]" : "border-border/60"
                    } ${clickable ? "cursor-pointer hover:border-foreground" : ""}`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                      <img
                        src={e.image}
                        alt={e.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {clickable && (
                        <span className="absolute bottom-0 left-0 right-0 bg-background/70 py-1 text-center text-[8px] uppercase tracking-[0.3em] text-foreground opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                          {isActive ? "Configuring" : "Configure"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      {e.brand && (
                        <p className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground">
                          {e.brand}
                        </p>
                      )}
                      <h4 className="font-serif text-[15px] font-light leading-tight text-foreground">
                        {e.name}
                      </h4>
                      {e.meta && (
                        <p className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                          {e.meta}
                        </p>
                      )}
                      {formatEntryPrice(e) && (
                        <p className="mt-auto border-t border-border/50 pt-1.5 text-[10px] uppercase tracking-[0.22em] text-foreground">
                          {formatEntryPrice(e)}
                        </p>
                      )}
                    </div>
                  </article>
                  );
                })}

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
              Open full collection
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipConsole;
