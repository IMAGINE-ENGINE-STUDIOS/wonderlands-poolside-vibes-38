import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { OptimizedImage } from "./OptimizedImage";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { useProjectType } from "@/contexts/ProjectTypeContext";
import { resolveCategoryLabel } from "@/lib/productCategories";
import InstallationNote from "@/components/InstallationNote";
import type { HansoLine } from "@/data/hansoPergolas";

// The standard Wonderlands product card (same build as SaunaProductCard),
// adapted for the Hansø pergolas: the size is the configuration, so the
// expandable carries every size at its list price and the chosen size
// drives the quote.

interface HansoProductCardProps {
  line: HansoLine;
}

const HansoProductCard = ({ line }: HansoProductCardProps) => {
  const { priceMultiplier, projectType } = useProjectType();
  const [showQuote, setShowQuote] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [sizeIdx, setSizeIdx] = useState(0);
  const size = line.sizes[sizeIdx];
  const fromPrice = line.sizes[0].price;
  const displayName = `Hansø ${line.name}`;
  const quoteName = `${displayName}${line.id === "hanso-awning" ? "" : " Pergola"} ${size.label}`;

  return (
    <>
      <div className="group rounded-none border border-border/70 overflow-hidden transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] h-full flex flex-col">
        <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden">
          <OptimizedImage
            src={line.images[0]}
            alt={displayName}
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            sizeConfig="hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

          <div className="absolute top-4 left-4">
            <span className="bg-background/85 px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
              {resolveCategoryLabel("pergolas", "pergola") || "Pergolas"}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/80">Hansø Collection</p>
          </div>
        </div>

        <CardContent className="p-4 sm:p-5 lg:p-7 space-y-5 flex-1 flex flex-col">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
              {displayName}
            </h3>

            <div className="mt-4 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">From</p>
                <p className="font-serif text-2xl sm:text-3xl font-light text-foreground">
                  ${(fromPrice * priceMultiplier).toLocaleString()}
                </p>
                {projectType === "commercial" && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Commercial Rate</p>
                )}
                <InstallationNote className="mt-2 !text-[9px]" />
              </div>
              <p className="text-right text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {line.sizeRange}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {line.description}
          </p>

          <dl className="divide-y divide-border/60 border-y border-border/60 text-sm">
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Sizes</dt>
              <dd className="text-right text-foreground">{line.sizes.length} sizes</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Roof</dt>
              <dd className="text-right text-foreground">{line.roof}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Finishes</dt>
              <dd className="text-right text-foreground">{line.finishes}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Warranty</dt>
              <dd className="text-right text-foreground">{line.warranty}</dd>
            </div>
          </dl>

          <div className="space-y-2 flex-1">
            <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">Highlights</p>
            <div className="grid grid-cols-1 gap-1.5">
              {line.features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="mt-1.5 h-1 w-1 rounded-none bg-foreground/60 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between rounded-none text-[10px] uppercase tracking-[0.3em]"
            >
              <span>Sizes and Prices</span>
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {showDetails && (
            <div className="space-y-4 pt-4 border-t border-border/60">
              <div className="grid grid-cols-2 gap-2">
                {line.sizes.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setSizeIdx(i)}
                    className={`border px-3 py-2 text-left ${i === sizeIdx ? "border-foreground bg-foreground/5" : "border-border/60"}`}
                  >
                    <span className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{s.label}</span>
                    <span className="block font-serif text-lg font-light text-foreground">
                      ${(s.price * priceMultiplier).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Selected size</span>
                <span className="font-serif text-lg font-light text-foreground">
                  {size.label} · ${(size.price * priceMultiplier).toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border/60 pt-3">
                <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground mb-1">Good to know</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {line.id === "hanso-awning"
                    ? "The awning mounts to a wall, ceiling or soffit, and Wonderlands handles the delivery, the permits and the professional installation."
                    : "Every Hansø pergola stands freestanding or wall mounted, and Wonderlands handles the delivery, the permits and the professional installation."}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 sm:p-5 lg:p-7 pt-0 flex gap-2 mt-auto">
          <Button
            onClick={() => setShowQuote(true)}
            className="flex-1 instant-quote-btn transition-all duration-300 rounded-none bg-foreground text-background text-[10px] uppercase tracking-[0.3em] hover:bg-foreground/90"
            size="sm"
          >
            Get Instant Quote
          </Button>
        </CardFooter>
      </div>

      <SurveyQuoteTool
        pool={null}
        customProduct={{
          name: quoteName,
          price: size.price,
          type: "Pergola",
          image: line.images[0],
        }}
        extras={{
          productType: "pergola",
          extrasTotal: 0,
          totalPrice: size.price * priceMultiplier,
          extrasBreakdown: [],
        }}
        isOpen={showQuote}
        onClose={() => setShowQuote(false)}
      />
    </>
  );
};

export default HansoProductCard;
