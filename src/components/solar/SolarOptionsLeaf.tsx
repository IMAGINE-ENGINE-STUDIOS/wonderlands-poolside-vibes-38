import * as React from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  rackingByCovering,
  roofCoverings,
  solarBatteries,
  solarPanelBrands,
  solarPanels,
  type RoofCovering,
} from "@/data/solarHardware";
import { SOLAR_INCLUDED, solarProducts } from "@/data/solarData";
import { SOLAR_SESSION_KEY, emptySolarSession, type SolarSession } from "./solarSession";

/**
 * The product leaf of the Total Solar spread.
 *
 * The live aerial map holds the facing page; this page carries the collection —
 * every module we install (by manufacturer), storage, the anchoring system for
 * each roof covering, the balance-of-system inclusions and the companion
 * products. Selections are written into the same cached solar session the map
 * leaf reads, so choosing a module here re-lays the array and re-prices the
 * project on the other page. No prices are shown on this leaf; the report on the
 * map page carries the figure.
 */

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground">{children}</p>
);

const rowClass = (active: boolean) =>
  `w-full border px-3 py-2 text-left transition-colors ${
    active
      ? "border-foreground bg-foreground/[0.06]"
      : "border-border/50 hover:border-foreground/60"
  }`;

const SolarOptionsLeaf: React.FC = () => {
  const [session, setSession] = usePersistentState<SolarSession>(SOLAR_SESSION_KEY, emptySolarSession);
  const patch = React.useCallback(
    (next: Partial<SolarSession>) => setSession((s) => ({ ...s, ...next })),
    [setSession],
  );

  const panel = solarPanels.find((p) => p.id === session.panelId) ?? solarPanels[0];
  const [brand, setBrand] = React.useState<string>(panel?.brand ?? solarPanelBrands[0]);
  React.useEffect(() => {
    if (panel?.brand) setBrand(panel.brand);
  }, [panel?.brand]);

  const modules = solarPanels.filter((p) => p.brand === brand);
  const companions = solarProducts.filter(
    (p) => p.group === "Pool Heating" || p.group === "Charging",
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1">
      <header className="border-b border-border/60 pb-3">
        <Eyebrow>Wonderlands Solar — the collection</Eyebrow>
        <h3 className="mt-2 font-serif text-2xl font-light leading-none">Specify the system</h3>
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          Choose the module, storage and anchoring. The array on the facing aerial re-lays itself and the
          report updates as you specify.
        </p>
      </header>

      {/* ── Modules ─────────────────────────────────────────────── */}
      <section>
        <Eyebrow>Panels · manufacturers</Eyebrow>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {solarPanelBrands.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`border px-2.5 py-1 text-[9px] uppercase tracking-[0.24em] transition-colors ${
                b === brand
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/50 hover:border-foreground/60"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          {modules.map((p) => {
            const active = p.id === session.panelId;
            return (
              <button key={p.id} onClick={() => patch({ panelId: p.id })} className={rowClass(active)}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-sm font-light">{p.name}</span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {p.watts} W
                  </span>
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {(p.efficiency * 100).toFixed(1)}% efficient · {p.widthFt.toFixed(2)}′ × {p.heightFt.toFixed(2)}′ ·{" "}
                  {p.warrantyYears}-year warranty
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{p.note}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Storage ─────────────────────────────────────────────── */}
      <section>
        <Eyebrow>Storage</Eyebrow>
        <div className="mt-2 space-y-1.5">
          {solarBatteries.map((b) => (
            <button
              key={b.id}
              onClick={() => patch({ batteryId: b.id })}
              className={rowClass(b.id === session.batteryId)}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-serif text-sm font-light">{b.name}</span>
                {b.usableKwh > 0 && (
                  <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {b.usableKwh} kWh · {b.continuousKw} kW
                  </span>
                )}
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{b.note}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Racking & anchoring ─────────────────────────────────── */}
      <section>
        <Eyebrow>Roof covering · racking &amp; anchoring</Eyebrow>
        <div className="mt-2 space-y-1.5">
          {roofCoverings.map((c: RoofCovering) => {
            const r = rackingByCovering[c];
            return (
              <button
                key={c}
                onClick={() => patch({ covering: c })}
                className={rowClass(c === session.covering)}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-sm font-light">{r.label}</span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {r.anchorsPerPanel} anchors / panel
                  </span>
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{r.anchor}</p>
                {c === session.covering && (
                  <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{r.windNote}</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Companion products ──────────────────────────────────── */}
      <section>
        <Eyebrow>Companion systems</Eyebrow>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {companions.map((p) => (
            <article key={p.id} className="border border-border/50">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                className="h-20 w-full object-cover grayscale-[15%]"
              />
              <div className="p-2">
                <p className="font-serif text-[12px] font-light leading-tight">{p.name}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{p.spec}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── What every system includes ──────────────────────────── */}
      <section className="border-t border-border/60 pt-3">
        <Eyebrow>Every system includes</Eyebrow>
        <dl className="mt-2 space-y-1.5">
          {SOLAR_INCLUDED.map(([title, copy]) => (
            <div key={title} className="grid grid-cols-[7rem_1fr] gap-2">
              <dt className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">{title}</dt>
              <dd className="text-[10px] leading-relaxed text-muted-foreground">{copy}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};

export default SolarOptionsLeaf;
