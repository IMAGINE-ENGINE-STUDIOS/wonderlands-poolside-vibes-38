import React, { useMemo, useState } from "react";
import {
  FLOOR_AND_DECOR_CATEGORIES,
  type FloorDecorProduct,
} from "@/data/floorDecorProducts";
import {
  FLOORING_PRODUCTS,
  flooringFaces,
  flooringFaceImage,
  flooringMeta,
  flooringSpecRows,
  flooringGapLines,
} from "@/lib/floorDecorDisplay";

/**
 * /suites/flooring — the Floor & Decor flooring catalogue (paver port
 * wiring Job 9). A display-only category fed from the ported registry
 * (data/floorDecorProducts): the 26 flooring products at their printed
 * sizes, with their own dimension-true faces and published spec
 * attributes. Named gaps are shown as gaps, in the record's own words —
 * the nine products whose single-piece model is not built carry that
 * gap on their card, never a substitute image or an invented model.
 *
 * NO PRICES: the registry's figures are Floor & Decor retail with
 * unstated bases (DIFF §5.7), so they are not Wonderlands prices and
 * this page shows none (WIRING-PLAN Job B5 stays blocked on a founder
 * ruling). Alto Bianco appears only at the size its registry record
 * carries (24 x 48 matte); its extra sizes are cuts outside the
 * registry, not records, and are not listed.
 */

const categoryLabel = (id: string): string =>
  FLOOR_AND_DECOR_CATEGORIES.find((c) => c.id === id)?.label ?? id;

const ProductCard = ({ product }: { product: FloorDecorProduct }) => {
  const faces = flooringFaces(product);
  const specs = flooringSpecRows(product);
  const gaps = flooringGapLines(product);
  return (
    <article className="flex flex-col rounded-2xl border border-zinc-200 p-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100">
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
      <h3 className="mt-1 text-base font-medium leading-snug">{product.name}</h3>
      <p className="mt-1 text-sm text-zinc-600">{flooringMeta(product)}</p>

      {specs.length > 0 && (
        <dl className="mt-3 space-y-1 border-t border-zinc-100 pt-3 text-sm">
          {specs.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-zinc-500">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {faces.length > 0 && (
        <div className="mt-3 border-t border-zinc-100 pt-3">
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
                className="h-10 w-10 rounded border border-zinc-200 object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {gaps.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800">
            Named gap
          </p>
          {gaps.map((g, i) => (
            <p key={i} className="mt-1 text-xs leading-relaxed text-amber-900">
              {g}
            </p>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-zinc-400">
        Source:{" "}
        <a
          href={product.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="underline break-all"
        >
          flooranddecor.com product page
        </a>{" "}
        (read {product.sourcedOn})
      </p>
    </article>
  );
};

export default function FloorDecorCatalogue() {
  const categoryIds = useMemo(
    () => [...new Set(FLOORING_PRODUCTS.map((p) => p.category))],
    [],
  );
  const [active, setActive] = useState<string>("all");
  const shown = useMemo(
    () =>
      active === "all"
        ? FLOORING_PRODUCTS
        : FLOORING_PRODUCTS.filter((p) => p.category === active),
    [active],
  );
  const gapCount = useMemo(
    () => FLOORING_PRODUCTS.filter((p) => p.model === null).length,
    [],
  );

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Floor &amp; Decor registry
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Floor &amp; Decor Flooring</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600">
          The flooring category of the Wonderlands catalogue, read from the Floor &amp; Decor
          registry: {FLOORING_PRODUCTS.length} flooring products at their printed sizes, each
          with its own dimension-true faces and the spec attributes its own product page
          publishes. Where a fact is not on record it is named as a gap on the product&apos;s
          card — {gapCount} of these products have no single-piece model yet, and that gap is
          shown rather than filled with a substitute. This listing is display only: the
          registry&apos;s figures are Floor &amp; Decor retail with unstated bases, so no
          prices are shown here.
        </p>

        {/* Category filter. The bar wraps so every chip stays visible
            and tappable at phone width. */}
        <div className="mt-6 flex max-w-full flex-wrap rounded-2xl border border-zinc-300 p-1 gap-1">
          {[["all", "All flooring"], ...categoryIds.map((id) => [id, categoryLabel(id)] as [string, string])].map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition ${
                  active === id ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {label} — {id === "all" ? FLOORING_PRODUCTS.length : FLOORING_PRODUCTS.filter((p) => p.category === id).length}
              </button>
            ),
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
