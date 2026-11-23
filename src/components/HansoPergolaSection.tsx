import { useState } from "react";
import SurveyQuoteTool from "./SurveyQuoteTool";
import { hansoLines, type HansoLine } from "@/data/hansoPergolas";

// Hansø pergolas on the Wonderlands home page: the four partner lines with
// every size at its hansohome.com list price, exactly as printed in the
// Hansø partner price list (Q4 2026). Quote opens the standard quote tool.

const formatPrice = (n: number) => "$" + n.toLocaleString("en-US");

function HansoCard({ line, onQuote }: { line: HansoLine; onQuote: (line: HansoLine, sizeLabel: string, price: number) => void }) {
  const [photo, setPhoto] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const size = line.sizes[sizeIdx];
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative">
        <img
          src={line.images[photo]}
          alt={`Hansø ${line.name} pergola`}
          className="aspect-[4/3] w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {line.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {line.images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Photo ${i + 1} of the Hansø ${line.name}`}
                onClick={() => setPhoto(i)}
                className={`h-2.5 w-2.5 rounded-full border border-white/70 ${photo === i ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{line.brand}</p>
        <h3 className="mt-1 font-serif text-2xl font-light text-foreground">
          {line.name} <span className="text-base text-muted-foreground">{line.tagline}</span>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{line.description}</p>
        <ul className="mt-4 space-y-1.5">
          {line.specs.map((s) => (
            <li key={s} className="flex gap-2 text-sm text-foreground">
              <span aria-hidden="true" className="text-primary">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Finishes: {line.finishes}. {line.warranty}.
        </p>
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Choose your size</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {line.sizes.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setSizeIdx(i)}
                className={`rounded-lg border px-3 py-2 text-left text-sm ${i === sizeIdx ? "border-primary bg-primary/5 font-semibold text-foreground" : "border-border text-muted-foreground"}`}
              >
                {s.label}
                <span className="block text-base text-foreground">{formatPrice(s.price)}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onQuote(line, size.label, size.price)}
          className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
        >
          Get a quote for the {line.name} {size.label}
        </button>
      </div>
    </article>
  );
}

export default function HansoPergolaSection() {
  const [quote, setQuote] = useState<{ name: string; price: number } | null>(null);
  return (
    <section aria-label="Hansø pergolas" className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8">
      <div className="grid gap-6 md:grid-cols-2">
        {hansoLines.map((line) => (
          <HansoCard
            key={line.id}
            line={line}
            onQuote={(l, sizeLabel, price) => setQuote({ name: `Hansø ${l.name} Pergola ${sizeLabel}`, price })}
          />
        ))}
      </div>
      <SurveyQuoteTool
        pool={null}
        isOpen={quote !== null}
        onClose={() => setQuote(null)}
        customProduct={quote ? { name: quote.name, price: quote.price, type: "pergola" } : undefined}
      />
    </section>
  );
}
