/**
 * Product Showcase — the synced stage widget. The product and the selected
 * finish are shared state: the host presents, and any guest the host has
 * unlocked can pick products/finishes too, with everyone following along.
 * Credits: Imagine Engine Studios Corp.
 */
import * as React from "react";
import { Check, Lock } from "lucide-react";
import { liveProduct } from "@/lib/live/liveCatalog";
import { buildFinishTextures } from "@/data/textureLibrary";

const FINISHES = buildFinishTextures().filter((t) => t.url).slice(0, 24);

export function ProductShowcase({
  productKey,
  variantIdx,
  interactive,
  onSelect,
}: {
  productKey?: string | null;
  variantIdx?: number;
  interactive: boolean;
  onSelect: (productKey: string, variantIdx: number) => void;
}) {
  const product = liveProduct(productKey) ?? liveProduct("madre perla");
  const finish = FINISHES[(variantIdx ?? 0) % Math.max(1, FINISHES.length)];
  if (!product) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-white/60">
        Pick a product from the catalog to present it here.
      </div>
    );
  }
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
            ${product.price.toLocaleString()}
            <span className="ml-2 text-xs font-normal text-white/60">installed, Central Florida</span>
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
      <div className="border-t border-white/10 bg-neutral-900/80 px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/50">
          {interactive ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Lock className="h-3.5 w-3.5" />}
          {interactive ? "You can pick a finish — everyone sees it" : "Finishes — the host controls these right now"}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FINISHES.map((f, i) => (
            <button
              key={`${f.name}-${i}`}
              disabled={!interactive}
              onClick={() => onSelect(product.key, i)}
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                i === (variantIdx ?? 0) ? "ring-amber-300" : "ring-white/15 hover:ring-white/40"
              } ${interactive ? "" : "cursor-not-allowed opacity-70"}`}
              title={f.name ?? `Finish ${i + 1}`}
            >
              {f.url ? <img src={f.url} alt={f.name ?? ""} className="h-full w-full object-cover" /> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
