import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StudioSearchItem {
  name: string;
  category: string;
  price: number;
  image?: string;
}

interface StudioProductSearchProps {
  /** The Studio's OWN product index (built from its category data). */
  products: StudioSearchItem[];
  /** Fires when a suggestion is picked — the Studio opens that product. */
  onSelect: (item: StudioSearchItem) => void;
}

/**
 * Wonderlands Studio header search — PLAIN PRODUCT SEARCH ONLY
 * (founder, 2026-11-01 21:34 ET: "I don't need the Genius to be there.
 * I don't need it in the search engine.").
 *
 * This component is deliberately Studio-local: it imports NOTHING from
 * the Genius stack (no AdvancedSearch, no answerIntent, no platform
 * tools, no inline-AI hook, no studio guidance) and fires no network
 * call. It filters the Studio's own product list, shows product
 * suggestions, and selecting one opens that product in the Studio.
 * Genius search on other surfaces is untouched — they keep using
 * AdvancedSearch exactly as before.
 */
const StudioProductSearch = ({ products, onSelect }: StudioProductSearchProps) => {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [products, query]);

  const showPanel = open && query.trim().length > 0;

  // Close on any click outside the search box
  React.useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const pick = (item: StudioSearchItem) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    onSelect(item);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center gap-1 rounded-lg border-2 border-primary/20 bg-background/90 p-1 backdrop-blur-sm transition-all duration-300 focus-within:border-primary">
        <div className="pl-2">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
            if (e.key === "Enter" && results.length > 0) {
              pick(results[0]);
            }
          }}
          className="h-8 flex-1 border-0 bg-transparent px-2 py-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showPanel && (
        <Card className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[28rem] overflow-y-auto border-2 border-primary/20 bg-background shadow-xl">
          <div className="p-2">
            {results.length > 0 ? (
              <>
                <div className="mb-2 px-2 text-sm text-muted-foreground">
                  Found {results.length} product{results.length === 1 ? "" : "s"}
                </div>
                {results.map((item) => (
                  <div
                    key={`${item.category}-${item.name}`}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-primary/10",
                    )}
                    onClick={() => pick(item)}
                  >
                    {item.image && (
                      <img
                        loading="lazy"
                        decoding="async"
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ${item.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No products match "{query}"
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudioProductSearch;
