import * as React from "react";
import ProductSuite, { type SuiteModel } from "@/components/product-suite/ProductSuite";
import { getAllProducts } from "@/data/poolProductLookup";
import { gilmerSpas } from "@/data/gilmerSpas";

/**
 * Pool & Spa Suite — /suites/pools-and-spas
 * One suite for the whole water program: switch between pools (concrete
 * Wonderlands + Latham/GlimmerGlass fiberglass, from poolProductLookup) and
 * spas (gilmerSpas). Each side runs the shared ProductSuite shell — model
 * picker, options, drawing board, 3D and quote — so pricing stays identical
 * to the rest of the site. Catalog order is kept as authored.
 */
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const PoolAndSpaSuite = () => {
  const [side, setSide] = React.useState<"pools" | "spas">("pools");

  const pools: SuiteModel[] = React.useMemo(() => {
    const seen = new Set<string>();
    return getAllProducts()
      .filter((p) => p.category === "Pool" && !seen.has(p.name) && seen.add(p.name))
      .map((p) => ({ id: slug(p.name), name: p.name, price: p.price, image: p.image, brand: p.brand, dimensions: p.dimensions, depth: p.depth, meta: p.brand === "Wonderlands" ? "Wonderlands Concrete" : `${p.brand ?? ""} Fiberglass`.trim() }));
  }, []);

  const spas: SuiteModel[] = React.useMemo(() => {
    const out: SuiteModel[] = gilmerSpas.map((s) => ({ id: slug(s.model), name: s.model, price: s.price, image: s.image, brand: s.brand, dimensions: s.dimensions, depth: s.depth, description: `${s.type} — ${s.warranty}.`, features: s.features, meta: s.type }));
    const seen = new Set(out.map((m) => m.name.toLowerCase()));
    getAllProducts().forEach((p) => {
      if (p.category !== "Spa" || seen.has(p.name.toLowerCase())) return;
      seen.add(p.name.toLowerCase());
      out.push({ id: slug(p.name), name: p.name, price: p.price, image: p.image, brand: p.brand, dimensions: p.dimensions, depth: p.depth, meta: `${p.brand ?? ""} Spa`.trim() });
    });
    return out;
  }, []);

  React.useEffect(() => { document.title = "Pool & Spa Suite · Wonderlands World"; }, []);

  return (
    <div>
      <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 border border-border/70 bg-background/90 backdrop-blur">
        <div className="flex items-center gap-6 px-5 py-2.5">
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Pool & Spa Suite</span>
          {(["pools", "spas"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setSide(k)}
              className={`text-[10px] uppercase tracking-[0.35em] pb-1 border-b ${side === k ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {k === "pools" ? `Pools · ${pools.length}` : `Spas · ${spas.length}`}
            </button>
          ))}
        </div>
      </div>
      {side === "pools" ? (
        <ProductSuite key="pools" categoryId="pools" categoryLabel="Pools" productType="pool"
          eyebrow="Wonderlands · Water Program" title="The Pool & Spa Suite"
          blurb="Every Wonderlands concrete and fiberglass pool in one place — pick a model, set options, draw it on your yard, walk it in 3D and get the quote."
          models={pools} groupBy={(m) => m.meta ?? "Pools"} />
      ) : (
        <ProductSuite key="spas" categoryId="spas" categoryLabel="Spas" productType="spa"
          eyebrow="Wonderlands · Water Program" title="The Pool & Spa Suite"
          blurb="Spillover and standalone spas, configured against the pool and deck they sit beside — heating, jets, finish and coping."
          models={spas} groupBy={(m) => m.meta ?? "Spa"} />
      )}
    </div>
  );
};

export default PoolAndSpaSuite;
