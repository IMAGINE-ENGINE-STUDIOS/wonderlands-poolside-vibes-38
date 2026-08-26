import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditorialSectionHeader from "./EditorialSectionHeader";
import ProductScrollRow from "./ProductScrollRow";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { solarProducts, solarStats, solarGroups, type SolarProduct } from "@/data/solarData";

/**
 * Wonderlands Solar — main-page section.
 *
 * Layout follows the Tesla Energy editorial language the client referenced:
 * one full-bleed dark statement plate with a very short headline and a stat
 * row, then quiet outlined product tiles. Styling stays on semantic tokens so
 * the section themes with the rest of the site.
 */
const money = (n: number) => `$${n.toLocaleString()}`;

const WonderlandsSolarSection = () => {
  const [group, setGroup] = useState<"All" | SolarProduct["group"]>("All");
  const [quoteProduct, setQuoteProduct] = useState<SolarProduct | null>(null);

  const visible = useMemo(
    () => (group === "All" ? solarProducts : solarProducts.filter((p) => p.group === group)),
    [group],
  );

  return (
    <>
      <section className="bg-background py-12">
        <div className="container mx-auto px-4">
          <EditorialSectionHeader
            eyebrow="Volume XVII — Energy"
            title="Wonderlands Solar"
            description="Power the pool, the spa and the house from the roof above them. Solar arrays, home batteries, solar pool heating and EV charging — engineered, permitted and installed by Wonderlands World."
          />

          {/* Statement plate */}
          <div className="relative mb-10 overflow-hidden border border-border/70 bg-foreground text-background">
            <img
              src={solarProducts[0].image}
              alt="All-black solar array on a Florida luxury home roof"
              loading="lazy"
              decoding="async"
              width={1536}
              height={1024}
              className="h-[42vh] min-h-[280px] w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <p className="text-[9px] uppercase tracking-[0.45em] opacity-70">Sunlight, stored</p>
              <h3 className="mt-3 max-w-2xl font-serif text-3xl font-light leading-[1.05] sm:text-5xl">
                Your pool runs on the sun.
              </h3>
              <div className="mt-7 grid grid-cols-2 gap-6 border-t border-background/25 pt-6 sm:grid-cols-4">
                {solarStats.map((s) => (
                  <div key={s.label}>
                    <p className="font-serif text-2xl font-light leading-none sm:text-3xl">{s.value}</p>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.28em] opacity-70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Group filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(["All", ...solarGroups] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(g)}
                className={`border px-4 py-2 text-[9px] uppercase tracking-[0.3em] transition-colors ${
                  group === g
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <ProductScrollRow className="mb-4">
            {visible.map((p) => (
              <Card
                key={p.id}
                className="group overflow-hidden rounded-none border border-border/70 transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)]"
              >
                <div className="relative h-48 overflow-hidden bg-muted sm:h-56 md:h-64">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    width={1536}
                    height={1024}
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                  <div className="absolute left-4 top-4">
                    <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
                      {p.group}
                    </span>
                  </div>
                </div>
                <CardContent className="space-y-4 p-4 sm:p-5">
                  <div>
                    <h3 className="font-serif text-2xl font-light leading-[1.05] tracking-tight text-foreground sm:text-3xl">
                      {p.name}
                    </h3>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{p.spec}</p>
                  </div>
                  <p className="text-[12px] leading-relaxed text-muted-foreground sm:text-[13px]">{p.description}</p>
                  <ul className="space-y-1.5">
                    {p.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 border-t border-border/50 pt-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        <span className="mt-[5px] h-px w-3 shrink-0 bg-foreground/40" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-end justify-between gap-4 border-t border-border/60 pt-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">Installed</p>
                      <p className="font-serif text-2xl font-light text-foreground sm:text-3xl">{money(p.price)}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setQuoteProduct(p)}
                    size="sm"
                    className="w-full rounded-none bg-foreground text-[10px] uppercase tracking-[0.3em] text-background hover:bg-foreground/90"
                  >
                    Instant Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ProductScrollRow>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Prices are installed, turnkey and include the shade study, engineering, county permit, utility
            interconnection and final inspection. Incentive eligibility is confirmed in writing before contract.
          </p>
        </div>
      </section>

      <SurveyQuoteTool
        pool={null}
        isOpen={!!quoteProduct}
        onClose={() => setQuoteProduct(null)}
        customProduct={
          quoteProduct
            ? {
                name: `Wonderlands Solar - ${quoteProduct.name}`,
                price: quoteProduct.price,
                type: "solar",
                image: quoteProduct.image,
              }
            : undefined
        }
      />
    </>
  );
};

export default WonderlandsSolarSection;
