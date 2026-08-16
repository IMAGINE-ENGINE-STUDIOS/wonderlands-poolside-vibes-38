import * as React from "react";
import { PoolCalculator } from "@/components/PoolCalculator";
import HeaterSizeCalculator from "@/components/HeaterSizeCalculator";
import { InlineCalculator } from "@/components/search/InlineCalculator";

/**
 * The showroom calculators, re-set in the FLIP V7 editorial language:
 * thin rules, serif chapter titles, glassmorphic frames.
 */

const Frame: React.FC<{ index: string; title: string; note: string; children: React.ReactNode }> = ({
  index,
  title,
  note,
  children,
}) => (
  <section className="border border-foreground/15 bg-background/70 backdrop-blur-xl">
    <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border/60 px-5 py-4">
      <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">{index}</span>
      <h3 className="font-serif text-xl font-light text-foreground md:text-2xl">{title}</h3>
      <p className="w-full text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{note}</p>
    </header>
    <div className="px-4 py-5 md:px-5">{children}</div>
  </section>
);

const QuoteCalculators: React.FC = () => {
  const [heater, setHeater] = React.useState<string | undefined>();
  const [result, setResult] = React.useState("");

  return (
    <div className="space-y-6">
      <div className="border-y border-foreground/15 py-5 text-center">
        <p className="text-[9px] uppercase tracking-[0.5em] text-muted-foreground">Chapter III</p>
        <h2 className="mt-2 font-serif text-3xl font-light text-foreground">The Calculators</h2>
      </div>

      <Frame
        index="III.i"
        title="Pool cost calculator"
        note="Size, finish and features priced as drawn"
      >
        <PoolCalculator />
      </Frame>

      <Frame index="III.ii" title="Heater sizing" note="Volume, climate and desired temperature">
        <HeaterSizeCalculator currentSelection={heater} onSelectHeater={setHeater} />
        {heater && (
          <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Selected heater — {heater}
          </p>
        )}
      </Frame>

      <Frame
        index="III.iii"
        title="Enclosure and fencing"
        note="Screen enclosure and aluminium fence estimates"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <InlineCalculator type="screen" onResult={setResult} />
          <InlineCalculator type="fence" onResult={setResult} />
        </div>
        {result && (
          <p className="mt-4 border-t border-border/60 pt-3 text-[11px] leading-relaxed text-foreground/80">
            {result}
          </p>
        )}
      </Frame>

      <p className="text-center text-[8px] uppercase tracking-[0.35em] text-muted-foreground">
        All prices include delivery, installation and the product as described
      </p>
    </div>
  );
};

export default QuoteCalculators;
