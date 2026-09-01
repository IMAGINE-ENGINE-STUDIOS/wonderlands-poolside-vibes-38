import * as React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowUpRight } from "lucide-react";
import view1Asset from "@/assets/pools/wonderlands/natural-pool-view-1.jpg.asset.json";
import view2Asset from "@/assets/pools/wonderlands/natural-pool-view-2.jpg.asset.json";

const IMAGES = [
  { src: view1Asset.url, alt: "Natural Pool view — rock waterfall and lush landscaping" },
  { src: view2Asset.url, alt: "Natural Pool view — pergola, fire feature and garden details" },
];

/**
 * First-position hero card inside the Wonderlands World Collection.
 * No published price or timeline — the only action is to schedule a
 * consultation so the project can be scoped individually.
 */
const NaturalPoolCard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <Card className="group h-full rounded-none border border-border/70 bg-background transition-all duration-500 hover:border-foreground/40 hover:shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.35)] overflow-hidden">
      {/* Editorial image stage */}
      <div className="relative h-52 sm:h-60 md:h-72 overflow-hidden bg-muted">
        {IMAGES.map((img, idx) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt}
            loading={idx === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
              idx === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

        <div className="absolute top-4 left-4">
          <span className="bg-background/90 px-3 py-1.5 text-[9px] uppercase tracking-[0.35em] text-foreground backdrop-blur-sm">
            Bespoke
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/90">
            Consultation only
          </p>
          <span className="translate-y-1 text-[9px] uppercase tracking-[0.35em] text-white/0 transition-all duration-500 group-hover:translate-y-0 group-hover:text-white/90">
            Schedule →
          </span>
        </div>

        {/* Thumbnail strip */}
        <div className="absolute right-4 bottom-16 sm:bottom-20 flex gap-2">
          {IMAGES.map((img, idx) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`h-12 w-12 sm:h-14 sm:w-14 overflow-hidden border-2 transition-all duration-300 ${
                idx === activeIndex
                  ? "border-white/90 shadow-lg scale-105"
                  : "border-white/30 opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={img.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      <CardContent className="flex h-[calc(100%-13rem)] flex-col p-4 sm:p-5 lg:p-7 sm:h-[calc(100%-15rem)] md:h-[calc(100%-18rem)]">
        <div className="flex-1">
          <p className="mb-3 text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
            Wonderlands World Collection
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl font-light leading-[1.05] tracking-tight text-foreground">
            Natural Pool
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            A fully custom freeform concrete sanctuary shaped around your
            terrain. Every edge, waterfall and planting bed is designed to order,
            with pricing and timing scoped during a private consultation.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {["Custom dimensions", "Freeform design", "Integrated water features"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/60 px-2.5 py-1 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <a
          href="https://calendly.com/wonderlandsworlds/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block"
        >
          <Button className="w-full gap-2 rounded-none bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 group/btn">
            <Calendar className="h-4 w-4" />
            Schedule a Consultation
            <ArrowUpRight className="ml-auto h-4 w-4 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
};

export default NaturalPoolCard;
