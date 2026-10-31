/**
 * Product Showcase — the synced stage widget. The product, the selected
 * finish and the selected priced add-ons are shared state: the host
 * presents, and any guest the host has unlocked can pick products,
 * finishes and options too, with everyone following along.
 *
 * Finishes and options are PER PRODUCT, resolved by
 * lib/live/showcaseOptions from the exact data each product's main-page
 * card uses (founder rule 2026-10-30: real options, correct prices,
 * actual imagery — no shared list mixed across products; see
 * SHOWCASE-AUDIT.md in the appbuild root). Flat-priced options add to
 * the total; per-square-foot options show their rate and are priced by
 * area in the quote, exactly as the cards present them.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Check, Lock } from "lucide-react";
import { liveProduct } from "@/lib/live/liveCatalog";
import { showcaseFinishesFor, showcaseOptionGroupsFor } from "@/lib/live/showcaseOptions";

export function ProductShowcase({
  productKey,
  variantIdx,
  optionIds,
  interactive,
  onSelect,
  onQuote,
}: {
  productKey?: string | null;
  variantIdx?: number;
  optionIds?: string[];
  interactive: boolean;
  onSelect: (productKey: string, variantIdx: number, optionIds: string[]) => void;
  /** Host-only: present the quote tool with this product (hero + end buttons). */
  onQuote?: () => void;
}) {
  const product = liveProduct(productKey) ?? liveProduct("madre perla");
  const finishes = React.useMemo(() => (product ? showcaseFinishesFor(product) : []), [product]);
  const finish = finishes.length > 0 ? finishes[(variantIdx ?? 0) % finishes.length] : undefined;
  const groups = React.useMemo(() => (product ? showcaseOptionGroupsFor(product) : []), [product]);
  const selected = React.useMemo(() => new Set(optionIds ?? []), [optionIds]);
  const flatOptionsTotal = React.useMemo(
    () =>
      groups
        .flatMap((g) => g.options)
        .filter((o) => o.unit === "flat" && selected.has(o.id))
        .reduce((sum, o) => sum + o.price, 0),
    [groups, selected],
  );
  const finishPrice = finish?.price ?? 0;
  if (!product) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-white/60">
        Pick a product from the catalog to present it here.
      </div>
    );
  }
  const toggleOption = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelect(product.key, variantIdx ?? 0, [...next]);
  };
  const extrasTotal = finishPrice + flatOptionsTotal;
  return (
    <div className="flex h-full flex-col bg-neutral-950 text-white">
      <div className="relative min-h-0 flex-1">
        <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
        {onQuote && (
          <button
            onClick={onQuote}
            className="absolute right-3 top-14 z-10 rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-neutral-900 shadow-lg transition hover:bg-amber-200"
          >
            Get a quote
          </button>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-16">
          <div className="text-[11px] uppercase tracking-[0.22em] text-amber-200/90">
            {product.brand ?? "Wonderlands"} · {product.category}
          </div>
          <div className="mt-1 text-3xl font-semibold">{product.name}</div>
          <div className="mt-1 text-sm text-white/75">
            {product.dimensions} · Depth {product.depth}
          </div>
          <div className="mt-2 text-xl font-medium text-amber-100">
            ${(product.price + extrasTotal).toLocaleString()}
            <span className="ml-2 text-xs font-normal text-white/60">
              {extrasTotal > 0
                ? `= $${product.price.toLocaleString()} base + $${extrasTotal.toLocaleString()} finish & options`
                : "installed, Central Florida"}
            </span>
          </div>
          {finish && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-xs backdrop-blur">
              {finish.image ? (
                <img src={finish.image} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : finish.color ? (
                <span className="h-6 w-6 rounded-full ring-1 ring-white/30" style={{ background: finish.color }} />
              ) : null}
              <span>
                Finish: {finish.name}
                {finish.price > 0 ? ` · +$${finish.price.toLocaleString()}` : " · included"}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="max-h-[46%] overflow-y-auto border-t border-white/10 bg-neutral-900/80 px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/50">
          {interactive ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Lock className="h-3.5 w-3.5" />}
          {interactive ? "You can pick a finish and options — everyone sees it" : "Finishes & options — the host controls these right now"}
        </div>
        {finishes.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {finishes.map((f, i) => (
              <button
                key={`${f.name}-${i}`}
                disabled={!interactive}
                onClick={() => onSelect(product.key, i, [...selected])}
                className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                  i === (variantIdx ?? 0) % finishes.length ? "ring-amber-300" : "ring-white/15 hover:ring-white/40"
                } ${interactive ? "" : "cursor-not-allowed opacity-70"}`}
                title={f.name}
              >
                {f.image ? (
                  <img src={f.image} alt={f.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="block h-full w-full" style={{ background: f.color ?? "#888" }} />
                )}
              </button>
            ))}
          </div>
        )}
        {groups.map((g) => (
          <div key={g.key} className="mt-3">
            <div className="mb-1.5 text-[11px] uppercase tracking-[0.18em] text-white/50">{g.label}</div>
            {/* Studio-style carousel: one swipeable row of option cards per
                group instead of a long open list nobody can scroll through
                (founder directive 2026-10-31). */}
            <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
              {g.options.map((o) => {
                const on = selected.has(o.id);
                return (
                  <button
                    key={o.id}
                    disabled={!interactive}
                    onClick={() => toggleOption(o.id)}
                    className={`flex w-[68%] shrink-0 snap-start items-start gap-2 rounded-lg px-2.5 py-2 text-left ring-1 transition sm:w-[38%] ${
                      on ? "bg-amber-300/15 ring-amber-300/70" : "bg-white/[0.04] ring-white/10 hover:ring-white/30"
                    } ${interactive ? "" : "cursor-not-allowed opacity-70"}`}
                  >
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? "border-amber-300 bg-amber-300 text-neutral-900" : "border-white/30"}`}>
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    {o.image ? (
                      <img src={o.image} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-white">{o.name}</span>
                      {o.description ? <span className="block truncate text-[11px] text-white/50">{o.description}</span> : null}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-amber-100">
                      {o.unit === "sqft" ? `$${o.price.toLocaleString()}/sq ft` : `+$${o.price.toLocaleString()}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {groups.some((g) => g.options.some((o) => o.unit === "sqft")) && (
          <div className="mt-3 text-[11px] text-white/40">
            Per-square-foot options are priced by area in the quote — the rate shown is the product card's rate.
          </div>
        )}
        {onQuote && (
          <button
            onClick={onQuote}
            className="mt-4 w-full rounded-full bg-amber-300 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-amber-200"
          >
            Get a quote — ${(product.price + extrasTotal).toLocaleString()} with these selections
          </button>
        )}
      </div>
    </div>
  );
}
