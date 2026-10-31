/**
 * Product Showcase — the synced stage widget. The product, the selected
 * finish and the selected priced add-ons are shared state: the host
 * presents, and any guest the host has unlocked can pick products,
 * finishes and options too, with everyone following along.
 *
 * Pricing comes from the platform's own quote engine — the base price from
 * the catalog lookup and the add-on options from PoolCustomizationOptions
 * (the exact list SurveyQuoteTool uses), so a product presented live shows
 * the same additional features at the same prices as everywhere else.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Check, Lock } from "lucide-react";
import { liveProduct } from "@/lib/live/liveCatalog";
import { buildFinishTextures } from "@/data/textureLibrary";
import { LIVE_POOL_OPTIONS, LIVE_OPTION_CATEGORIES } from "@/components/PoolCustomizationOptions";

const FINISHES = buildFinishTextures().filter((t) => t.url).slice(0, 24);
const POOL_FAMILY = new Set(["Pool", "Spa", "Tanning Ledge"]);

export function ProductShowcase({
  productKey,
  variantIdx,
  optionIds,
  interactive,
  onSelect,
}: {
  productKey?: string | null;
  variantIdx?: number;
  optionIds?: string[];
  interactive: boolean;
  onSelect: (productKey: string, variantIdx: number, optionIds: string[]) => void;
}) {
  const product = liveProduct(productKey) ?? liveProduct("madre perla");
  const finish = FINISHES[(variantIdx ?? 0) % Math.max(1, FINISHES.length)];
  const selected = React.useMemo(() => new Set(optionIds ?? []), [optionIds]);
  const options = React.useMemo(
    () => (product && POOL_FAMILY.has(product.category) ? LIVE_POOL_OPTIONS : []),
    [product],
  );
  const optionsTotal = React.useMemo(
    () => options.filter((o) => selected.has(o.id)).reduce((sum, o) => sum + (o.price || 0), 0),
    [options, selected],
  );
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
  const groups = Object.entries(LIVE_OPTION_CATEGORIES)
    .map(([cat, label]) => ({ cat, label, items: options.filter((o) => o.category === cat) }))
    .filter((g) => g.items.length > 0);
  return (
    <div className="flex h-full flex-col bg-neutral-950 text-white">
      <div className="relative min-h-0 flex-1">
        <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-16">
          <div className="text-[11px] uppercase tracking-[0.22em] text-amber-200/90">
            {product.brand ?? "Wonderlands"} · {product.category}
          </div>
          <div className="mt-1 text-3xl font-semibold">{product.name}</div>
          <div className="mt-1 text-sm text-white/75">
            {product.dimensions} · Depth {product.depth}
          </div>
          <div className="mt-2 text-xl font-medium text-amber-100">
            ${(product.price + optionsTotal).toLocaleString()}
            <span className="ml-2 text-xs font-normal text-white/60">
              {optionsTotal > 0
                ? `= $${product.price.toLocaleString()} base + $${optionsTotal.toLocaleString()} options`
                : "installed, Central Florida"}
            </span>
          </div>
          {finish && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-xs backdrop-blur">
              {finish.url ? (
                <img src={finish.url} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : null}
              <span>Finish: {finish.name ?? "Signature"}</span>
            </div>
          )}
        </div>
      </div>
      <div className="max-h-[46%] overflow-y-auto border-t border-white/10 bg-neutral-900/80 px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/50">
          {interactive ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Lock className="h-3.5 w-3.5" />}
          {interactive ? "You can pick a finish and options — everyone sees it" : "Finishes & options — the host controls these right now"}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FINISHES.map((f, i) => (
            <button
              key={`${f.name}-${i}`}
              disabled={!interactive}
              onClick={() => onSelect(product.key, i, [...selected])}
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                i === (variantIdx ?? 0) ? "ring-amber-300" : "ring-white/15 hover:ring-white/40"
              } ${interactive ? "" : "cursor-not-allowed opacity-70"}`}
              title={f.name ?? `Finish ${i + 1}`}
            >
              {f.url ? <img src={f.url} alt={f.name ?? ""} className="h-full w-full object-cover" /> : null}
            </button>
          ))}
        </div>
        {groups.map((g) => (
          <div key={g.cat} className="mt-3">
            <div className="mb-1.5 text-[11px] uppercase tracking-[0.18em] text-white/50">{g.label}</div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {g.items.map((o) => {
                const on = selected.has(o.id);
                return (
                  <button
                    key={o.id}
                    disabled={!interactive}
                    onClick={() => toggleOption(o.id)}
                    className={`flex items-start gap-2 rounded-lg px-2.5 py-2 text-left ring-1 transition ${
                      on ? "bg-amber-300/15 ring-amber-300/70" : "bg-white/[0.04] ring-white/10 hover:ring-white/30"
                    } ${interactive ? "" : "cursor-not-allowed opacity-70"}`}
                  >
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? "border-amber-300 bg-amber-300 text-neutral-900" : "border-white/30"}`}>
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-white">{o.name}</span>
                      <span className="block truncate text-[11px] text-white/50">{o.description}</span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-amber-100">
                      {o.price > 0 ? `+$${o.price.toLocaleString()}` : "per sq ft"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
