import {
  FLOORING_PRODUCTS,
  flooringFaces,
  flooringFaceImage,
  flooringMeta,
  flooringSpecRows,
  flooringGapLines,
  flooringDetailSummary,
} from "@/lib/floorDecorDisplay";
import type { FloorDecorProduct } from "@/data/floorDecorProducts";

/**
 * Floor & Decor in the Wonderlands Studio (paver port wiring Job 10) —
 * DISPLAY ONLY. The Studio's product flows are priced end to end: every
 * selectable Product renders a price in the browser list and on the
 * landing canvas, and a selection drives the running total, the quote
 * tool and checkout. The Floor & Decor registry's figures are F&D
 * retail with unstated bases (DIFF §5.7) — not Wonderlands prices — so
 * these 26 flooring products are NOT Studio Products: they never enter
 * buildProductsForTab, the search index, any total, the cart or a
 * quote. This panel is the whole flooring tab: each product with its
 * own dimension-true face and printed dimensions, and the nine
 * products whose single-piece model is not built show that named gap
 * in the record's own words — never a substitute image or model.
 * (WIRING-PLAN Job 10; any F&D price display stays blocked as Job B5.)
 */

const GapBox = ({ product, compact = false }: { product: FloorDecorProduct; compact?: boolean }) => {
  const gaps = flooringGapLines(product);
  if (!gaps.length) return null;
  if (compact) {
    return (
      <p className="mt-1 text-[11px] font-medium leading-snug text-amber-700 dark:text-amber-400">
        Named gap: no single-piece model yet
      </p>
    );
  }
  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300">
        Named gap
      </p>
      {gaps.map((g, i) => (
        <p key={i} className="mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          {g}
        </p>
      ))}
    </div>
  );
};

const StageCard = ({ product }: { product: FloorDecorProduct }) => {
  const faces = flooringFaces(product);
  const specs = flooringSpecRows(product);
  return (
    <article className="flex flex-col rounded-2xl border border-black/5 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <img
          src={flooringFaceImage(product)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {product.brand}
      </p>
      <h4 className="mt-1 text-sm font-medium leading-snug">{product.name}</h4>
      <p className="mt-1 text-xs text-zinc-500">{flooringMeta(product)}</p>
      <p className="mt-1 text-xs text-zinc-500">{flooringDetailSummary(product)}</p>

      {specs.length > 0 && (
        <dl className="mt-3 space-y-1 border-t border-zinc-100 pt-3 text-xs dark:border-white/10">
          {specs.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-zinc-500">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {faces.length > 0 && (
        <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-white/10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Faces — {faces.length} on record
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {faces.map((f, i) => (
              <img
                key={i}
                src={f.url}
                alt={`${product.name} face ${i + 1}`}
                title={`${f.coveredLengthIn} x ${f.coveredWidthIn} in`}
                loading="lazy"
                decoding="async"
                className="h-10 w-10 rounded border border-zinc-200 object-cover dark:border-white/10"
              />
            ))}
          </div>
        </div>
      )}

      <GapBox product={product} />
    </article>
  );
};

const SidebarRow = ({ product }: { product: FloorDecorProduct }) => (
  <div className="p-3 rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-zinc-900">
    <div className="flex items-center gap-3">
      <img
        loading="lazy"
        decoding="async"
        src={flooringFaceImage(product)}
        alt={product.name}
        className="w-12 h-12 shrink-0 object-cover rounded-xl"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-snug">{product.name}</h4>
        <p className="text-xs text-zinc-500">{flooringMeta(product)}</p>
        <GapBox product={product} compact />
      </div>
    </div>
  </div>
);

export default function FlooringDisplayPanel({
  variant,
  query = "",
}: {
  variant: "stage" | "sidebar";
  query?: string;
}) {
  const q = query.trim().toLowerCase();
  const products = q
    ? FLOORING_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q))
    : FLOORING_PRODUCTS;

  if (variant === "sidebar") {
    return (
      <>
        <p className="px-1 text-xs leading-relaxed text-zinc-500">
          Floor &amp; Decor flooring, shown for reference with printed sizes and faces. Display
          only — no price is set for these products, so they are not part of the configurator.
        </p>
        {products.map((p) => (
          <SidebarRow key={p.slug} product={p} />
        ))}
        {products.length === 0 && (
          <p className="px-1 text-xs text-zinc-500">No flooring products match your search.</p>
        )}
      </>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur-sm p-4 sm:p-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Floor &amp; Decor flooring</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The 26 flooring products from the Floor &amp; Decor registry, each at its printed size
          with its own faces. Display only — no Wonderlands price is set for these products, so
          they are not part of the configurator, the running total or a quote.
        </p>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {products.map((p) => (
          <StageCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
