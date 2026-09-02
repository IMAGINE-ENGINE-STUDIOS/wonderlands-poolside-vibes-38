// The per-widget control rail on the licensing gallery.
//
// Every widget gets three controls of its own:
//   · version tabs — each release of the module, with the product description
//     written for that version and what it introduced;
//   · a palette controller — eight semantic palettes written straight onto the
//     widget's token scope, so the live module re-themes without a reload;
//   · a typography controller — six display/body pairings, plus a shuffle that
//     produces a new palette + typeface combination on every press.
//
// Selecting a version also loads the skin that release was designed in, so an
// older tab shows how the module was presented at the time while still running
// the current production build underneath. Selections persist per widget.
import * as React from "react";
import { ChevronDown, Palette, Shuffle, Type, RotateCcw } from "lucide-react";
import usePersistentState from "@/hooks/usePersistentState";
import {
  WIDGET_PALETTES,
  WIDGET_TYPEFACES,
  paletteById,
  typefaceById,
  shuffleSkin,
  type WidgetSkin,
} from "@/lib/tools/widgetSkins";
import { versionsFor } from "@/lib/tools/widgetVersions";
import WidgetSkinScope from "./WidgetSkinScope";

interface Props {
  /** Section id — keys both the version history and the persisted selection. */
  widgetId: string;
  /** Module name, printed in the rail header. */
  name: string;
  children: React.ReactNode;
}

const chip =
  "shrink-0 border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-colors duration-300";

const WidgetVersionRail: React.FC<Props> = ({ widgetId, name, children }) => {
  const versions = versionsFor(widgetId);
  const latest = versions.length - 1;

  const [vIndex, setVIndex] = usePersistentState<number>(`tools2:${widgetId}:version`, latest);
  const [skin, setSkin] = usePersistentState<WidgetSkin | null>(`tools2:${widgetId}:skin`, null);
  const [openControls, setOpenControls] = usePersistentState<boolean>(`tools2:${widgetId}:controls`, false);

  const safeIndex = Math.min(Math.max(vIndex, 0), Math.max(latest, 0));
  const version = versions[safeIndex];
  const active: WidgetSkin = skin ?? version?.skin ?? { paletteId: "house", typefaceId: "sora" };

  /** Choosing a release adopts the skin it was designed in. */
  const pickVersion = (i: number) => {
    setVIndex(i);
    setSkin(versions[i]?.skin ?? null);
  };

  const palette = paletteById(active.paletteId);
  const typeface = typefaceById(active.typefaceId);

  return (
    <div className="space-y-4">
      {/* version tabs */}
      {versions.length > 0 && (
        <div className="border border-foreground/12 bg-muted/40">
          <div className="tl-noscroll flex items-stretch gap-0 overflow-x-auto border-b border-foreground/10">
            {versions.map((v, i) => {
              const on = i === safeIndex;
              return (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => pickVersion(i)}
                  aria-pressed={on}
                  className={`group relative shrink-0 px-4 py-3 text-left transition-colors duration-300 ${
                    on ? "bg-background" : "hover:bg-background/60"
                  }`}
                >
                  <span
                    className={`block font-mono text-[10px] uppercase tracking-[0.24em] ${
                      on ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {v.tag}
                    {i === latest && <span className="ml-2 text-primary">current</span>}
                  </span>
                  <span
                    className={`mt-1 block text-[11px] tracking-wide ${
                      on ? "text-foreground/80" : "text-muted-foreground/70"
                    }`}
                  >
                    {v.name} · {v.released}
                  </span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-px origin-left bg-primary transition-transform duration-500 ${
                      on ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* product description for the selected version */}
          {version && (
            <div className="grid gap-5 px-4 py-4 md:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-muted-foreground">
                  {name} — {version.tag} description
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-foreground/80">{version.description}</p>
              </div>
              <ul className="space-y-1.5 border-foreground/10 md:border-l md:pl-5">
                <li className="font-mono text-[9px] uppercase tracking-[0.26em] text-muted-foreground">
                  In this release
                </li>
                {version.changes.map((c) => (
                  <li key={c} className="flex gap-2.5 text-[12px] leading-relaxed text-foreground/70">
                    <span className="mt-[7px] h-1 w-1 shrink-0 bg-primary" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* palette + typography controller */}
      <div className="border border-foreground/12 bg-muted/30">
        <button
          type="button"
          onClick={() => setOpenControls((o) => !o)}
          aria-expanded={openControls}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <Palette className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-muted-foreground">
            Palette & type
          </span>
          <span className="flex items-center gap-1.5">
            {palette.swatch.map((c, i) => (
              <span
                key={i}
                className="h-3.5 w-3.5 border border-foreground/20"
                style={{ background: c }}
                aria-hidden
              />
            ))}
          </span>
          <span className="min-w-0 flex-1 truncate text-[11px] text-foreground/70">
            {palette.name} · {typeface.name}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-300 ${
              openControls ? "rotate-180" : ""
            }`}
          />
        </button>

        {openControls && (
          <div className="space-y-5 border-t border-foreground/10 px-4 py-4">
            <div>
              <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.26em] text-muted-foreground">
                Palette
              </p>
              <div className="flex flex-wrap gap-2">
                {WIDGET_PALETTES.map((p) => {
                  const on = p.id === active.paletteId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSkin({ ...active, paletteId: p.id })}
                      aria-pressed={on}
                      title={p.note}
                      className={`${chip} flex items-center gap-2 ${
                        on
                          ? "border-foreground bg-foreground text-background"
                          : "border-foreground/20 text-muted-foreground hover:border-foreground/60 hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-0.5">
                        {p.swatch.map((c, i) => (
                          <span
                            key={i}
                            className="h-3 w-3 border border-foreground/25"
                            style={{ background: c }}
                            aria-hidden
                          />
                        ))}
                      </span>
                      {p.name}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{palette.note}</p>
            </div>

            <div>
              <p className="mb-2.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.26em] text-muted-foreground">
                <Type className="h-3 w-3" /> Typeface
              </p>
              <div className="flex flex-wrap gap-2">
                {WIDGET_TYPEFACES.map((t) => {
                  const on = t.id === active.typefaceId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSkin({ ...active, typefaceId: t.id })}
                      aria-pressed={on}
                      title={t.note}
                      style={{ fontFamily: t.display }}
                      className={`${chip} tracking-normal ${
                        on
                          ? "border-foreground bg-foreground text-background"
                          : "border-foreground/20 text-muted-foreground hover:border-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{typeface.note}</p>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-foreground/10 pt-4">
              <button
                type="button"
                onClick={() => setSkin(shuffleSkin(active))}
                className={`${chip} flex items-center gap-2 border-foreground bg-foreground text-background`}
              >
                <Shuffle className="h-3 w-3" /> Shuffle combination
              </button>
              <button
                type="button"
                onClick={() => setSkin(version?.skin ?? null)}
                className={`${chip} flex items-center gap-2 border-foreground/25 text-muted-foreground hover:border-foreground/60 hover:text-foreground`}
              >
                <RotateCcw className="h-3 w-3" /> Reset to {version?.tag ?? "default"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* the live widget, wearing the selected skin */}
      <WidgetSkinScope skin={active}>{children}</WidgetSkinScope>
    </div>
  );
};

export default WidgetVersionRail;
