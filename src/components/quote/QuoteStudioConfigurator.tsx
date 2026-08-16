import * as React from "react";
import { Plus, Minus, Check, ImageOff } from "lucide-react";
import { getStudioFeatureGroups, type StudioOption } from "@/lib/flipStudioFeatures";
import { formatEntryPrice, type ConsoleEntry } from "@/components/flip/flipConsoleData";

/**
 * Wonderlands Studio product configurator, composed in the FLIP V7 editorial
 * language (thin rules, serif display, glassmorphic controls).
 *
 * It reads the exact same feature catalogue the Wonderlands Studio uses
 * (`getStudioFeatureGroups`) so pricing never diverges between the two tools.
 */

export type ConfiguredExtra = {
  name: string;
  price: number;
  key?: string;
  quantity?: number;
  selectedOption?: string;
  options?: { name: string; price: number }[];
  image?: string;
};

export type ConfiguredProduct = {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  image?: string;
  brand?: string;
  /** Base price of the vessel/product itself (already multiplied by quantity) */
  basePrice: number;
  extras: ConfiguredExtra[];
  total: number;
};

interface Props {
  entry: ConsoleEntry;
  categoryId: string;
  categoryLabel: string;
  onChange: (product: ConfiguredProduct) => void;
  onAdd: (product: ConfiguredProduct) => void;
  onQuote: (product: ConfiguredProduct) => void;
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** One selected option inside a feature group */
type Sel = { label: string; price: number; unit?: StudioOption["unit"]; qty: number; image?: string };

const QuoteStudioConfigurator: React.FC<Props> = ({
  entry,
  categoryId,
  categoryLabel,
  onChange,
  onAdd,
  onQuote,
}) => {
  const groups = React.useMemo(
    () => getStudioFeatureGroups(categoryId, { modelName: entry.name, brand: entry.brand }),
    [categoryId, entry.name, entry.brand],
  );

  const isUnitPriced = entry.unit === "sqft" || entry.unit === "linear-ft";
  const [quantity, setQuantity] = React.useState(isUnitPriced ? 400 : 1);
  const [selected, setSelected] = React.useState<Record<string, Sel>>({});
  const [preview, setPreview] = React.useState<{ image?: string; color?: string; label: string } | null>(
    null,
  );

  // A new product resets the configuration
  React.useEffect(() => {
    setSelected({});
    setPreview(null);
    setQuantity(entry.unit === "sqft" || entry.unit === "linear-ft" ? 400 : 1);
  }, [entry.id, entry.unit]);

  const basePrice = (entry.price ?? 0) * (isUnitPriced ? quantity : 1);

  const extras = React.useMemo<ConfiguredExtra[]>(
    () =>
      Object.entries(selected).map(([groupTitle, sel]) => {
        const group = groups.find((g) => g.title === groupTitle);
        const lineTotal = sel.price * (sel.unit ? sel.qty : 1);
        return {
          name: `${groupTitle}: ${sel.label}`,
          price: lineTotal,
          key: groupTitle,
          quantity: sel.unit ? sel.qty : undefined,
          selectedOption: sel.label,
          image: sel.image,
          options: group?.items
            .filter((i) => i.price > 0)
            .map((i) => ({ name: `${groupTitle}: ${i.label}`, price: i.price })),
        };
      }),
    [selected, groups],
  );

  const total = basePrice + extras.reduce((sum, e) => sum + e.price, 0);

  const product = React.useMemo<ConfiguredProduct>(
    () => ({
      id: `quote-${entry.id}`,
      name: entry.name,
      category: categoryLabel,
      categoryId,
      image: entry.image,
      brand: entry.brand,
      basePrice,
      extras,
      total,
    }),
    [entry, categoryLabel, categoryId, basePrice, extras, total],
  );

  React.useEffect(() => {
    onChange(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const toggle = (groupTitle: string, item: StudioOption) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[groupTitle]?.label === item.label) {
        delete next[groupTitle];
      } else {
        next[groupTitle] = {
          label: item.label,
          price: item.price,
          unit: item.unit,
          qty: item.unit === "sqft" ? 400 : 1,
          image: item.image,
        };
      }
      return next;
    });
  };

  const setQty = (groupTitle: string, qty: number) =>
    setSelected((prev) =>
      prev[groupTitle] ? { ...prev, [groupTitle]: { ...prev[groupTitle], qty: Math.max(1, qty) } } : prev,
    );

  return (
    <section className="flex flex-col border border-foreground/15 bg-background/70 backdrop-blur-xl">
      {/* Masthead */}
      <header className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground">
            {entry.brand ? `${entry.brand} — ` : ""}
            {categoryLabel}
          </p>
          <h3 className="truncate font-serif text-2xl font-light text-foreground md:text-3xl">
            {entry.name}
          </h3>
          {entry.meta && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {entry.meta}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[9px] uppercase tracking-[0.32em] text-muted-foreground">Configured</p>
          <p className="font-serif text-2xl font-light text-foreground">{money(total)}</p>
        </div>
      </header>

      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Plate — product or hovered option */}
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border/60 bg-muted md:aspect-auto md:min-h-[420px] md:border-b-0 md:border-r">
          {preview?.color ? (
            <div className="absolute inset-0" style={{ background: preview.color }} />
          ) : preview?.image || entry.image ? (
            <img
              src={preview?.image || entry.image}
              alt={preview?.label || entry.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <ImageOff className="h-6 w-6" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 border-t border-background/30 bg-background/70 px-4 py-2 backdrop-blur-md">
            <p className="truncate text-[9px] uppercase tracking-[0.32em] text-foreground">
              {preview?.label || entry.name}
            </p>
            <p className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
              {formatEntryPrice(entry) || "Priced to drawing"}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="flex max-h-[520px] flex-col overflow-y-auto">
          {isUnitPriced && (
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
              <p className="text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
                {entry.unit === "sqft" ? "Square feet" : "Linear feet"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 50))}
                  className="flex h-7 w-7 items-center justify-center border border-border/60 backdrop-blur-md transition-colors hover:bg-foreground hover:text-background"
                  aria-label="Decrease"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  inputMode="numeric"
                  className="w-16 border border-border/60 bg-transparent py-1 text-center text-[11px] tracking-[0.18em] outline-none"
                />
                <button
                  onClick={() => setQuantity((q) => q + 50)}
                  className="flex h-7 w-7 items-center justify-center border border-border/60 backdrop-blur-md transition-colors hover:bg-foreground hover:text-background"
                  aria-label="Increase"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {groups.length === 0 ? (
            <p className="px-5 py-6 text-[11px] leading-relaxed text-muted-foreground">
              This product is composed to order. Generate the quote and a designer will price the
              drawing with you.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.title} className="border-b border-border/60 px-5 py-4">
                <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">
                  {group.title}
                </p>
                {group.note && (
                  <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground/80">
                    {group.note}
                  </p>
                )}
                <div className="mt-3 space-y-1.5">
                  {group.items.map((item) => {
                    const isOn = selected[group.title]?.label === item.label;
                    const included = item.price === 0;
                    const selectable = group.choice !== false;
                    return (
                      <div
                        key={`${group.title}-${item.label}`}
                        onMouseEnter={() =>
                          setPreview({ image: item.image, color: item.color, label: item.label })
                        }
                        onMouseLeave={() => setPreview(null)}
                        className={`flex items-center justify-between gap-3 border px-3 py-2 transition-colors ${
                          isOn ? "border-foreground bg-foreground/[0.05]" : "border-border/50"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {(item.image || item.color) && (
                            <span className="h-10 w-10 shrink-0 overflow-hidden border border-border/60 bg-muted">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.label}
                                  loading="lazy"
                                  decoding="async"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span
                                  aria-hidden
                                  className="block h-full w-full"
                                  style={{ background: item.color }}
                                />
                              )}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-serif text-[13px] font-light text-foreground">
                              {item.label}
                            </p>
                            <p className="text-[9px] uppercase tracking-[0.26em] text-muted-foreground">
                              {item.priceLabel}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {isOn && item.unit && (
                            <input
                              value={selected[group.title].qty}
                              onChange={(e) => setQty(group.title, Number(e.target.value) || 1)}
                              inputMode="numeric"
                              aria-label={`${item.label} quantity`}
                              className="w-14 border border-border/60 bg-transparent py-0.5 text-center text-[10px] outline-none"
                            />
                          )}
                          {!selectable ? (
                            <span className="border border-border/60 px-2 py-0.5 text-[8px] uppercase tracking-[0.28em] text-muted-foreground">
                              Included
                            </span>
                          ) : (
                            <button
                              onClick={() => toggle(group.title, item)}
                              aria-label={isOn ? `Remove ${item.label}` : `Choose ${item.label}`}
                              title={
                                included
                                  ? isOn
                                    ? "Chosen — included"
                                    : "Choose this included option"
                                  : isOn
                                    ? "Remove"
                                    : "Add"
                              }
                              className={`flex h-7 w-7 items-center justify-center border backdrop-blur-md transition-colors ${
                                isOn
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-primary/60 text-primary hover:bg-primary hover:text-primary-foreground"
                              }`}
                            >
                              {isOn ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-4">
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
          All prices include delivery, installation and the product as described
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onAdd(product)}
            className="inline-flex items-center gap-2 border border-border/60 bg-background/60 px-4 py-2.5 text-[10px] uppercase tracking-[0.3em] text-foreground backdrop-blur-md transition-colors hover:bg-foreground hover:text-background"
          >
            <Plus className="h-3.5 w-3.5" /> Add to selection
          </button>
          <button
            onClick={() => onQuote(product)}
            className="border border-foreground bg-foreground px-4 py-2.5 text-[10px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-background hover:text-foreground"
          >
            Generate quote
          </button>
        </div>
      </footer>
    </section>
  );
};

export default QuoteStudioConfigurator;
