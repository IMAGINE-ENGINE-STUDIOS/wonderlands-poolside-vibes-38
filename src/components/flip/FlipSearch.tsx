import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, CornerDownLeft } from "lucide-react";
import { ITEMS } from "@/components/FlipIndex";
import {
  formatEntryPrice,
  getCachedCategoryEntries,
  loadCategoryEntries,
  type ConsoleEntry,
} from "./flipConsoleData";

/**
 * FLIP Search Engine.
 * Searches the collection inside the book itself — no dropdown menus, no
 * navigation away to Wonderlands Studio. Every result opens as pages of this
 * same edition: a category opens its edition, a model opens its dossier.
 */

export type FlipSearchResult =
  | { kind: "category"; categoryId: string; label: string; note?: string; image?: string }
  | { kind: "product"; categoryId: string; label: string; note?: string; image?: string; entry: ConsoleEntry };

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]/g, " ");

const score = (haystack: string, needle: string) => {
  const h = norm(haystack);
  const terms = norm(needle).split(/\s+/).filter(Boolean);
  if (!terms.length) return 0;
  let total = 0;
  for (const t of terms) {
    const at = h.indexOf(t);
    if (at < 0) return 0;
    total += at === 0 ? 3 : h[at - 1] === " " ? 2 : 1;
  }
  return total;
};

const FlipSearch: React.FC<{
  onOpenCategory: (categoryId: string) => void;
  onOpenProduct: (categoryId: string, entry: ConsoleEntry) => void;
  /** Compact rail presentation instead of the wide desk. */
  compact?: boolean;
  autoFocus?: boolean;
}> = ({ onOpenCategory, onOpenProduct, compact, autoFocus }) => {
  const [q, setQ] = useState("");
  const [catalogue, setCatalogue] = useState<Record<string, ConsoleEntry[]>>(() => {
    const seed: Record<string, ConsoleEntry[]> = {};
    ITEMS.forEach((i) => {
      const cached = getCachedCategoryEntries(i.id);
      if (cached) seed[i.id] = cached;
    });
    return seed;
  });
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  /* Resolve every edition once, in the background, so the index is complete
     without ever blocking the reader. */
  useEffect(() => {
    let alive = true;
    (async () => {
      for (const item of ITEMS) {
        if (!alive) return;
        if (getCachedCategoryEntries(item.id)) {
          setCatalogue((c) => (c[item.id] ? c : { ...c, [item.id]: getCachedCategoryEntries(item.id)! }));
          continue;
        }
        try {
          const list = await loadCategoryEntries(item.id);
          if (!alive) return;
          setCatalogue((c) => ({ ...c, [item.id]: list }));
        } catch {
          /* an unavailable edition simply stays out of the index */
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo<FlipSearchResult[]>(() => {
    if (q.trim().length < 2) return [];
    const out: { r: FlipSearchResult; s: number }[] = [];

    ITEMS.forEach((it) => {
      const s = score(`${it.label} ${it.tagline ?? ""} ${(it.notes ?? []).join(" ")}`, q);
      if (s) out.push({ r: { kind: "category", categoryId: it.id, label: it.label, note: it.tagline, image: it.images?.[0] }, s: s + 4 });
      (catalogue[it.id] ?? []).forEach((e) => {
        const es = score(`${e.name} ${e.brand ?? ""} ${e.meta ?? ""} ${it.label}`, q);
        if (es)
          out.push({
            r: {
              kind: "product",
              categoryId: it.id,
              label: e.name,
              note: [e.brand, it.label, formatEntryPrice(e)].filter(Boolean).join(" · "),
              image: e.image,
              entry: e,
            },
            s: es,
          });
      });
    });

    return out.sort((a, b) => b.s - a.s).slice(0, 40).map((x) => x.r);
  }, [q, catalogue]);

  useEffect(() => setCursor(0), [q]);

  const open = (r: FlipSearchResult) => {
    setQ("");
    if (r.kind === "category") onOpenCategory(r.categoryId);
    else onOpenProduct(r.categoryId, r.entry);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      open(results[cursor]);
    } else if (e.key === "Escape") {
      setQ("");
    }
  };

  const indexed = Object.values(catalogue).reduce((n, l) => n + l.length, 0);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 border-b border-border/60 pb-2">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search the collection — a model, a brand, a discipline"
          aria-label="FLIP search engine"
          className="min-w-0 flex-1 bg-transparent py-1 text-[11px] uppercase tracking-[0.24em] text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        {q ? (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Clear the search"
            className="flex h-6 w-6 shrink-0 items-center justify-center border border-border/60 text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <span className="hidden shrink-0 text-[9px] uppercase tracking-[0.3em] text-muted-foreground sm:block">
            {indexed} models indexed
          </span>
        )}
      </div>

      {q.trim().length >= 2 && (
        <div className={`mt-3 ${compact ? "max-h-[42vh]" : "max-h-[46vh]"} overflow-y-auto`}>
          {results.length === 0 ? (
            <p className="py-6 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Nothing in the collection under that name
            </p>
          ) : (
            <ul className={compact ? "space-y-0" : "grid gap-0 sm:grid-cols-2"}>
              {results.map((r, i) => (
                <li key={`${r.kind}-${r.categoryId}-${r.label}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => open(r)}
                    className={`flex w-full items-center gap-3 border-t border-border/50 px-1 py-2 text-left transition-colors ${
                      cursor === i ? "bg-foreground/[0.05]" : "hover:bg-foreground/[0.03]"
                    }`}
                  >
                    {r.image ? (
                      <img
                        src={r.image}
                        alt={r.label}
                        loading="lazy"
                        decoding="async"
                        className="h-9 w-12 shrink-0 object-cover"
                      />
                    ) : (
                      <span className="h-9 w-12 shrink-0 bg-muted" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] uppercase tracking-[0.22em] text-foreground">
                        {r.label}
                      </span>
                      <span className="block truncate text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                        {r.kind === "category" ? "Edition" : r.note}
                      </span>
                    </span>
                    <span className="shrink-0 text-[8px] uppercase tracking-[0.3em] text-muted-foreground">
                      {r.kind === "category" ? "Open" : "Dossier"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 flex items-center gap-2 border-t border-border/50 pt-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            <CornerDownLeft className="h-3 w-3" /> Results open inside the book
          </p>
        </div>
      )}
    </div>
  );
};

export default FlipSearch;
