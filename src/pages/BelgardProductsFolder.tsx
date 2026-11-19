import React, { useEffect, useMemo, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductMediaGallery, { type MediaItem } from "@/components/ProductMediaGallery";
import { BELGARD_FOLDER, BELGARD_FOLDER_TOTAL_FILES, type BelgardFolderProduct } from "@/data/belgardProductsFolder";
import { BELGARD_MEDIA_LOGIC, BELGARD_MEDIA_LOGIC_TOTALS, type BelgardMediaProduct } from "@/data/belgardMediaLogic";
import { BELGARD_PATTERNS } from "@/data/belgardPatterns";
import { appAssetUrl } from "@/lib/design/kitchenAssetUrl";

/**
 * /belgard-products: Belgard reference library (paver port wiring Job 2,
 * modeled on the Foss file page of the same name). Every Belgard product is
 * filed under the region whose 2026 catalog, product catalog guide or
 * Coastal cutsheet evidence places it there. Florida comes first. The page
 * reads the ported reference data (belgardProductsFolder and
 * belgardMediaLogic) and touches no catalog, Studio or quote data. The
 * folder data carries no prices and this page shows none. Galleries use the
 * Wonderlands Studio image widget (ProductMediaGallery with studioChrome).
 * The 3D visualizer tab is a separate job (WIRING-PLAN Job 3).
 */

const CATEGORY_ORDER = ["Pavers & Slabs", "Permeable Pavers", "Porcelain Pavers", "Coping & Steps", "Walls", "Fire & Outdoor Kitchens"];
const SHORT_CAT: Record<string, string> = {
  "Pavers & Slabs": "Pavers",
  "Permeable Pavers": "Permeable",
  "Porcelain Pavers": "Porcelain",
  "Coping & Steps": "Coping",
  "Walls": "Walls",
  "Fire & Outdoor Kitchens": "Fire/Kitchen",
};

/** Folder and Media & Logic product matching: folder names carry trademark
 *  marks and occasional parentheticals; Media & Logic names are plain.
 *  Normalising both sides makes the match exact for every product the two
 *  sets share. */
const normName = (s: string) =>
  s
    .replace(/\([^)]*\)/g, " ")
    .replace(/[™®©]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
const MEDIA_BY_NORM = new Map(BELGARD_MEDIA_LOGIC.map((p) => [normName(p.name), p]));
const mediaForFolderName = (name: string): BelgardMediaProduct | undefined =>
  MEDIA_BY_NORM.get(normName(name));
const PATTERNS_BY_SLUG = new Map(BELGARD_PATTERNS.map((g) => [g.productSlug, g.patterns]));

const linkify = (text: string) => {  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noreferrer" className="text-blue-700 underline break-all">
        {part}
      </a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const TextBlock = ({ text }: { text: string }) => (
  <div className="space-y-2">
    {text.split("\n").map((line, i) =>
      line.trim() ? (
        <p key={i} className="text-sm leading-relaxed text-zinc-700">
          {linkify(line)}
        </p>
      ) : null
    )}
  </div>
);

const MediaProduct = ({
  product,
  highlighted,
  onOpenInFolder,
}: {
  product: BelgardMediaProduct;
  highlighted?: boolean;
  onOpenInFolder?: (p: BelgardMediaProduct) => void;
}) => {
  // Sizes print under group headers; keep consecutive sizes that share a
  // group under one heading, exactly as printed.
  const runs: { group: string | null; items: BelgardMediaProduct["sizes"] }[] = [];
  for (const s of product.sizes) {
    const last = runs[runs.length - 1];
    if (last && last.group === s.group) last.items.push(s);
    else runs.push({ group: s.group, items: [s] });
  }
  return (
    <article
      id={`media-${product.slug}`}
      className={`scroll-mt-6 rounded-2xl border p-5 ${
        highlighted ? "border-zinc-900 ring-2 ring-zinc-900" : "border-zinc-200"
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-2xl font-semibold tracking-tight">{product.name}</h3>
        {product.collection && (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            {product.collection}
          </span>
        )}
        <span className="text-xs text-zinc-400">2021 Coastal catalog p.{product.catalogPages.join(", ")}</span>
        {onOpenInFolder && (
          <button
            onClick={() => onOpenInFolder(product)}
            className="ml-auto rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
          >
            View in Folder →
          </button>
        )}
      </div>

      {product.options.length > 0 && (
        <>
          <h4 className="mt-5 text-sm font-semibold uppercase tracking-wider text-zinc-500">Colors &amp; textures</h4>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {product.options.map((o) => (
              <figure key={o.name} className="overflow-hidden border border-zinc-200">
                <img
                  src={appAssetUrl(`${o.image}?v=enh1`)}
                  alt={`${product.name}: ${o.name}`}
                  loading="lazy"
                  className={`h-24 w-full bg-zinc-50 ${product.category === "Coping & Steps" ? "object-contain" : "object-cover"}`}
                />
                <figcaption className="px-2.5 py-2">
                  <span className="block text-sm font-medium leading-tight">{o.name}</span>
                  {o.qualifier && <span className="block text-xs text-zinc-500">{o.qualifier}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}

      {product.sizes.length > 0 && (
        <>
          <h4 className="mt-6 text-sm font-semibold uppercase tracking-wider text-zinc-500">Sizes</h4>
          {runs.map((run, ri) => (
            <div key={ri} className="mt-3">
              {run.group && (
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{run.group}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-3">
                {run.items.map((s, i) => (
                  <figure key={i} className="w-32 rounded-xl border border-zinc-200 px-2 pb-2 pt-3 text-center">
                    <img
                      src={appAssetUrl(`${s.image}?v=enh1`)}
                      alt={`${product.name}: ${s.label ?? s.dimensions}`}
                      loading="lazy"
                      className="mx-auto h-16 w-auto object-contain"
                    />
                    <figcaption className="mt-2">
                      {s.label && (
                        <span className="block text-xs font-medium leading-tight text-zinc-700">{s.label}</span>
                      )}
                      <span className="block text-sm leading-snug text-zinc-900">{s.dimensions}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {product.notes.map((n) => (
        <p key={n} className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          {n}
        </p>
      ))}
    </article>
  );
};

const MediaLogicView = ({
  focusSlug,
  onOpenInFolder,
}: {
  focusSlug?: string | null;
  onOpenInFolder?: (p: BelgardMediaProduct) => void;
}) => {
  useEffect(() => {
    if (!focusSlug) return;
    const el = document.getElementById(`media-${focusSlug}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusSlug]);
  return (
  <div>
    <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">
      Every texture swatch and size diagram below is a placed asset lifted directly out of Belgard&apos;s 2021
      Coastal catalog. The page shows the small color and pattern swatches and the unit diagrams with their
      printed dimensions, and nothing else. It shows no scene or lifestyle photos. Only products confirmed in
      the 2026 Belgard sources appear here. Lines that appear only in 2021 are excluded because they may be
      discontinued.{" "}
      {BELGARD_MEDIA_LOGIC_TOTALS.products} products · {BELGARD_MEDIA_LOGIC_TOTALS.options} texture swatches ·{" "}
      {BELGARD_MEDIA_LOGIC_TOTALS.sizes} size diagrams.
    </p>
    {CATEGORY_ORDER.map((cat) => {
      const prods = BELGARD_MEDIA_LOGIC.filter((p) => p.category === cat);
      if (prods.length === 0) return null;
      return (
        <section key={cat} className="mt-10">
          <h2 className="text-xl font-semibold">{cat}</h2>
          <div className="mt-4 space-y-6">
            {prods.map((p) => (
              <MediaProduct
                key={p.slug}
                product={p}
                highlighted={focusSlug === p.slug}
                onOpenInFolder={onOpenInFolder}
              />
            ))}
          </div>
        </section>
      );
    })}
    <p className="mt-10 border-t border-zinc-100 pt-4 text-xs leading-relaxed text-zinc-400">
      Source: Belgard 2021 Coastal catalog. Dimensions are copied exactly as printed, including mixed
      fractions and the slash form Belgard uses for tapered wall units. Porcelain size diagrams are line art in
      the catalog PDF and no placed image exists, so those few images are tight crops from a render of the
      printed page.
    </p>
  </div>
  );
};

export default function BelgardProductsFolder() {
  const [view, setView] = useState<"folder" | "media">("folder");
  const [mediaFocus, setMediaFocus] = useState<string | null>(null);
  const [locIdx, setLocIdx] = useState(0); // Florida first
  const [catIdx, setCatIdx] = useState(0);
  const [selected, setSelected] = useState<BelgardFolderProduct | null>(null);
  // The gallery active image is held here so the per image tabs beside the
  // Product Image tag drive it, the same controlled index pattern the
  // Wonderlands Studio uses with ProductMediaGallery (studioChrome).
  const [galleryIndex, setGalleryIndex] = useState(0);

  const region = BELGARD_FOLDER[locIdx];
  const category = region.categories[catIdx] ?? region.categories[0];

  const totals = useMemo(
    () =>
      BELGARD_FOLDER.map((r) => ({
        location: r.location,
        counts: CATEGORY_ORDER.map((c) => r.categories.find((x) => x.name === c)?.products.length ?? 0),
        total: r.categories.reduce((n, c) => n + c.products.length, 0),
      })),
    []
  );

  const pickRegion = (i: number) => {
    setLocIdx(i);
    setCatIdx(0);
    setSelected(null);
    setGalleryIndex(0);
  };
  const pickCategory = (i: number) => {
    setCatIdx(i);
    setSelected(null);
    setGalleryIndex(0);
  };
  const pickProduct = (p: BelgardFolderProduct) => {
    setSelected(p);
    setGalleryIndex(0);
  };

  // Cross links between the Folder and Media & Logic views.
  const openMedia = (slug: string) => {
    setMediaFocus(slug);
    setView("media");
  };
  const openInFolder = (mp: BelgardMediaProduct) => {
    // Find this product folder file with Florida first, then every region.
    const flIdx = BELGARD_FOLDER.findIndex((r) => r.location.startsWith("Florida"));
    const order = [flIdx, ...BELGARD_FOLDER.map((_, i) => i).filter((i) => i !== flIdx)];
    for (const ri of order) {
      const cats = BELGARD_FOLDER[ri].categories;
      for (let ci = 0; ci < cats.length; ci++) {
        const prod = cats[ci].products.find((p) => mediaForFolderName(p.name)?.slug === mp.slug);
        if (prod) {
          setLocIdx(ri);
          setCatIdx(ci);
          setSelected(prod);
          setGalleryIndex(0);
          setView("folder");
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }
    }
  };

  // Gallery media for the selected product. The main image comes first, in
  // the order the folder file lists them.
  const galleryItems: MediaItem[] = (selected?.gallery ?? []).map((g) => ({
    type: "image",
    url: g.url,
    alt: `${selected?.name ?? "Product"}: ${g.label}`,
  }));
  const safeGalleryIndex = galleryItems.length > 0 ? Math.min(galleryIndex, galleryItems.length - 1) : 0;
  // Per image tabs beside the Product Image tag, rendered only when the
  // product has more than one image.
  const imageTabs =
    galleryItems.length > 1 ? (
      <div className="flex items-center gap-1" role="tablist" aria-label="Product images">
        {galleryItems.map((item, i) => (
          <button
            key={item.url + i}
            type="button"
            role="tab"
            aria-selected={safeGalleryIndex === i}
            aria-label={`Image ${i + 1}${i === 0 ? " (main)" : ""}`}
            onClick={() => setGalleryIndex(i)}
            className={`h-8 min-w-8 rounded-full px-2 text-xs font-medium tabular-nums transition-colors ${
              safeGalleryIndex === i
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "border border-black/10 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    ) : null;

  // The selected folder product Media & Logic entry and its laying
  // patterns, when it has one. Folder products without an entry render
  // exactly as before. This only adds a section and never touches a
  // gallery image.
  const selectedMedia = selected ? mediaForFolderName(selected.name) : undefined;
  const selectedPatterns = selectedMedia ? PATTERNS_BY_SLUG.get(selectedMedia.slug) ?? [] : [];

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Belgard reference library</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Belgard Products by Region</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600">
          Products are classified by Belgard&apos;s own 2026 regional catalogs, product catalog guides and
          Coastal cutsheets. A product appears under a region only when that region&apos;s Belgard operator
          catalog lists it. Nothing is placed by guesswork. Florida&apos;s operator is Coastal, part of
          Oldcastle APG. Metro has no 2026 homeowner catalog, so its folder holds no products yet. This
          library is reference only and it does not change what the website sells.
        </p>

        {/* View switch. The bar wraps so every tab stays visible and
            tappable at phone width. */}
        <div className="mt-6 flex max-w-full flex-wrap rounded-2xl border border-zinc-300 p-1 gap-1">
          {([["folder", "Folder"], ["media", "Media & Logic"]] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition ${
                view === v ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>


        {view === "folder" && (<>
        {/* Counts per region and category */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
                <th className="px-4 py-2 font-medium">Region</th>
                {CATEGORY_ORDER.map((c) => (
                  <th key={c} className="px-4 py-2 font-medium">{SHORT_CAT[c]}</th>
                ))}
                <th className="px-4 py-2 font-medium">Files</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((t) => (
                <tr key={t.location} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-2 font-medium">{t.location}</td>
                  {t.counts.map((n, i) => (
                    <td key={i} className="px-4 py-2 tabular-nums">{n}</td>
                  ))}
                  <td className="px-4 py-2 tabular-nums">{t.total}</td>
                </tr>
              ))}
              <tr className="bg-zinc-50 font-medium">
                <td className="px-4 py-2">Total product files</td>
                {CATEGORY_ORDER.map((c) => (
                  <td key={c} className="px-4 py-2" />
                ))}
                <td className="px-4 py-2 tabular-nums">{BELGARD_FOLDER_TOTAL_FILES}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Region picker */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
          {BELGARD_FOLDER.map((r, i) => (
            <button
              key={r.location}
              onClick={() => pickRegion(i)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                i === locIdx
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
              }`}
            >
              {r.location}
              <span className={`ml-2 tabular-nums ${i === locIdx ? "text-zinc-300" : "text-zinc-400"}`}>
                {r.categories.reduce((n, c) => n + c.products.length, 0)}
              </span>
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-xl font-semibold">{region.location}</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {region.operator} · Territory: {region.territory}
        </p>
        <p className="mt-1 text-sm text-zinc-500">Catalog evidence: {region.catalog}</p>

        {/* Category tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {region.categories.map((c, i) => (
            <button
              key={c.name}
              onClick={() => pickCategory(i)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                i === catIdx ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {c.name} <span className="tabular-nums opacity-70">{c.products.length}</span>
            </button>
          ))}
          {region.categories.length === 0 && (
            <p className="text-sm text-zinc-500">
              No products are filed for this region yet. Belgard publishes no 2026 homeowner catalog for
              Metro and nothing is invented to fill the folder.
            </p>
          )}
        </div>

        {/* Product list and detail */}
        {category && (
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            <ul className="min-w-0 divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 self-start">
              {category.products.map((p) => (
                <li key={p.name}>
                  <button
                    onClick={() => pickProduct(p)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                      selected?.name === p.name ? "bg-zinc-900 text-white" : "bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 flex shrink-0 items-center gap-2">
                      {mediaForFolderName(p.name) && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                          Media &amp; Logic
                        </span>
                      )}
                      {p.gallery.length > 0 && (
                        <span className={`text-xs ${selected?.name === p.name ? "text-zinc-300" : "text-zinc-400"}`}>
                          {p.gallery.length} img
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
              {category.products.length === 0 && (
                <li className="px-4 py-6 text-sm text-zinc-500">No products filed here.</li>
              )}
            </ul>

            <div className="min-w-0">
              {selected ? (
                <article className="rounded-2xl border border-zinc-200 p-5">
                  <h3 className="text-2xl font-semibold tracking-tight">{selected.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {region.location} · {category.name}
                  </p>

                  {/* Product gallery. The Wonderlands Studio image widget
                      with studioChrome: swipe on the image, always visible
                      arrows, per image tabs at the Product Image tag, and
                      chrome only when there is more than one image. */}
                  {galleryItems.length > 0 ? (
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex rounded-full border border-black/5 bg-zinc-50 p-1 gap-1 dark:border-white/10 dark:bg-zinc-900">
                          <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5">
                            <Camera className="h-3.5 w-3.5" />
                            Product Image
                          </Button>
                        </div>
                        {imageTabs}
                      </div>
                      <div className="relative rounded-[1.75rem] bg-zinc-50 dark:bg-zinc-900 overflow-hidden w-full h-[38vh] sm:h-[46vh] max-h-[460px] flex items-center justify-center">
                        <div className="w-full h-full flex items-center justify-center">
                          <ProductMediaGallery
                            media={galleryItems}
                            productName={selected.name}
                            className="w-full h-full"
                            studioChrome
                            activeIndex={galleryIndex}
                            onActiveIndexChange={setGalleryIndex}
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">
                        {selected.gallery[safeGalleryIndex]?.label}
                        {galleryItems.length > 1 ? ` · image ${safeGalleryIndex + 1} of ${galleryItems.length}` : ""}
                        . The source for every image is listed under Image references below.
                      </p>
                    </div>
                  ) : (
                    <p className="mt-5 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                      No official image for this product has been harvested yet. The file records that
                      instead of substituting another product photo.
                    </p>
                  )}

                  {selected.description && (
                    <p className="mt-4 text-sm leading-relaxed text-zinc-700">{selected.description}</p>
                  )}

                  {selected.specs.length > 0 && (
                    <dl className="mt-4 space-y-2">
                      {selected.specs.map((s) => (
                        <div key={s.label} className="rounded-xl bg-zinc-50 px-3 py-2">
                          <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{s.label}</dt>
                          <dd className="mt-0.5 text-sm leading-relaxed text-zinc-800">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {selected.source && (
                    <p className="mt-4 text-sm text-zinc-600">
                      Belgard product page:{" "}
                      <a href={selected.source} target="_blank" rel="noreferrer" className="text-blue-700 underline break-all">
                        {selected.source}
                      </a>
                    </p>
                  )}

                  {selectedMedia && (
                    <section className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                          Media &amp; Logic: textures, sizes and laying patterns
                        </h4>
                        <button
                          onClick={() => openMedia(selectedMedia.slug)}
                          className="ml-auto rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white transition hover:bg-zinc-700"
                        >
                          Open in Media &amp; Logic →
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        From Belgard&apos;s 2021 Coastal catalog. This section shows the texture options,
                        printed sizes and laying patterns for this product. These thumbnails live only in
                        this section and the gallery above is unchanged.
                      </p>

                      {selectedMedia.options.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                          {selectedMedia.options.map((o) => (
                            <figure key={o.name} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                              <img
                                src={appAssetUrl(`${o.image}?v=enh1`)}
                                alt={`${selectedMedia.name}: ${o.name}`}
                                loading="lazy"
                                className="h-14 w-full bg-zinc-50 object-cover"
                              />
                              <figcaption className="px-2 py-1.5">
                                <span className="block text-xs font-medium leading-tight">{o.name}</span>
                                {o.qualifier && <span className="block text-[11px] text-zinc-500">{o.qualifier}</span>}
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      )}

                      {selectedMedia.sizes.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {selectedMedia.sizes.map((s, i) => (
                            <span key={i} className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700">
                              {s.label ? `${s.label} · ` : ""}{s.dimensions}
                            </span>
                          ))}
                        </div>
                      )}

                      {selectedPatterns.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                            Laying patterns
                          </p>
                          <div className="mt-2 flex flex-wrap gap-3">
                            {selectedPatterns.map((pat) => (
                              <figure key={pat.name} className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                                <img
                                  src={appAssetUrl(pat.preview)}
                                  alt={`${selectedMedia.name}: ${pat.name} pattern`}
                                  loading="lazy"
                                  className="h-28 w-auto max-w-[220px] bg-zinc-50 object-contain"
                                />
                                <figcaption className="px-2 py-1.5">
                                  <span className="block text-xs font-medium leading-tight">{pat.name}</span>
                                  <span className="block text-[11px] text-zinc-500">
                                    {pat.module.widthIn} × {pat.module.heightIn} in module ·{" "}
                                    {pat.source === "catalog" ? "catalog set" : "standard layout"}
                                  </span>
                                </figcaption>
                              </figure>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  )}

                  <h4 className="mt-6 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                    Region evidence
                  </h4>
                  <div className="mt-2">
                    <TextBlock text={selected.evidence} />
                  </div>

                  {selected.images && (
                    <>
                      <h4 className="mt-6 text-sm font-semibold uppercase tracking-wider text-zinc-500">Image references</h4>
                      <div className="mt-2">
                        <TextBlock text={selected.images} />
                      </div>
                    </>
                  )}
                </article>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
                  Pick a product on the left to see its file. The file shows its photo gallery, description,
                  dimensions, the region evidence and its image references.
                </div>
              )}
            </div>
          </div>
        )}

        <p className="mt-10 border-t border-zinc-100 pt-4 text-xs leading-relaxed text-zinc-400">
          Notes: for Belgard lines already carried in the store, the gallery uses the store&apos;s own product
          images, one per store color. All other products show their harvested official Belgard image.
          Products with no harvested image say so in their file rather than borrowing a photo. GMS South and
          GMS Mid South per product colors are named in their 2026 catalogs but not yet extracted. Pacific
          Stockton publishes its catalog in a viewer only, so its colors come from verified cutsheets where
          available.
        </p>
        </>)}

        {view === "media" && <MediaLogicView focusSlug={mediaFocus} onOpenInFolder={openInFolder} />}
      </div>
    </div>
  );
}
