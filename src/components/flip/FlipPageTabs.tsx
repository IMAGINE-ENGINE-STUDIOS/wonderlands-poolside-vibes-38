import { useMemo } from "react";
import usePersistentState from "@/hooks/usePersistentState";

/**
 * Hanging page tabs — index tabs that live OUTSIDE the book on its outer border,
 * the way a ring binder or a legal exhibit set is tabbed. Each tab jumps the
 * reader to that page.
 *
 * Two rails:
 *  - `index` (right border): a focus window of five tabs that travels with the
 *    reader, the neighbours fading out so the eye is never crowded.
 *  - `trail` (left border): the chapters already passed, kept as a quiet
 *    breadcrumb of the journey so far.
 *
 * Colours are programmatic HSL, so the label text is always computed to
 * contrast its own tab, whatever colour is chosen.
 */

export type PageTabItem = { label: string; page: number };

/** Tab palette — stored as HSL triplets so contrast can be computed, never guessed. */
export const TAB_PALETTE: Array<[number, number, number]> = [
  [12, 78, 58], // coral
  [190, 72, 42], // teal
  [43, 84, 56], // brass
  [268, 42, 52], // plum
  [150, 46, 40], // moss
  [212, 58, 46], // ink blue
  [0, 0, 92], // paper
  [0, 0, 16], // graphite
];

const hslString = ([h, s, l]: [number, number, number], alpha = 1) =>
  `hsl(${h} ${s}% ${l}% / ${alpha})`;

/**
 * Relative luminance of an HSL colour, used to pick black or white text.
 * Guarantees a readable tag on any background colour the user picks.
 */
export function contrastTextForHsl([h, s, l]: [number, number, number]): string {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = lN - c / 2;
  let rgb: [number, number, number];
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const lin = rgb.map((v) => {
    const ch = v + m;
    return ch <= 0.03928 ? ch / 12.92 : Math.pow((ch + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  // Contrast ratio against white vs black — pick the stronger one.
  const withWhite = 1.05 / (L + 0.05);
  const withBlack = (L + 0.05) / 0.05;
  return withWhite >= withBlack ? "#ffffff" : "#0b0b0c";
}

const hashLabel = (label: string) =>
  Math.abs([...label].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));

/** How many tabs stay lit around the reader's position. */
const FOCUS_RADIUS = 2; // 2 above + active + 2 below = a focus of five

const FlipPageTabs: React.FC<{
  items: PageTabItem[];
  activePage: number;
  onGo: (page: number) => void;
  height: number;
  side?: "left" | "right";
  storageKey?: string;
  /** `index` = travelling focus rail, `trail` = chapters already passed. */
  variant?: "index" | "trail";
}> = ({
  items,
  activePage,
  onGo,
  height,
  side = "right",
  storageKey = "flip.tabs.colors",
  variant = "index",
}) => {
  const [colors, setColors] = usePersistentState<Record<string, number>>(storageKey, {});

  /** Collapse repeated chapter names to one tab, keeping the first page of each. */
  const tabs = useMemo(() => {
    const out: PageTabItem[] = [];
    items.forEach((it) => {
      if (!out.some((o) => o.label === it.label)) out.push(it);
    });
    return out;
  }, [items]);

  /** Index of the chapter the reader is currently inside. */
  const activeIdx = useMemo(() => {
    let found = 0;
    tabs.forEach((t, i) => {
      if (t.page <= activePage) found = i;
    });
    return found;
  }, [tabs, activePage]);

  /** The travelling focus window — five tabs, clamped to the ends of the book. */
  const window = useMemo(() => {
    if (variant === "trail") {
      // The road behind: the last few chapters already passed, newest nearest.
      const passed = tabs.slice(0, activeIdx).slice(-4).reverse();
      return passed.map((t) => ({ ...t, idx: tabs.indexOf(t) }));
    }
    const span = FOCUS_RADIUS * 2 + 1;
    const fitByHeight = Math.max(3, Math.floor((height - 12) / 38));
    const size = Math.min(span, fitByHeight, tabs.length);
    let start = activeIdx - Math.floor(size / 2);
    start = Math.max(0, Math.min(start, tabs.length - size));
    return tabs.slice(start, start + size).map((t, i) => ({ ...t, idx: start + i }));
  }, [tabs, activeIdx, height, variant]);

  if (!window.length) return null;

  const cycle = (label: string) =>
    setColors((prev) => ({
      ...prev,
      [label]: ((prev[label] ?? hashLabel(label)) + 1) % TAB_PALETTE.length,
    }));

  return (
    <div
      aria-label={variant === "trail" ? "Chapters already read" : "Page tabs"}
      className={`pointer-events-none absolute top-0 hidden h-full flex-col justify-center gap-2 py-2 md:flex ${
        side === "right" ? "left-full items-start pl-1.5" : "right-full items-end pr-1.5"
      } ${variant === "trail" ? "justify-start pt-3 lg:flex" : ""}`}
      style={{ height }}
    >
      {window.map((tab) => {
        const idx = colors[tab.label] ?? hashLabel(tab.label) % TAB_PALETTE.length;
        const hsl = TAB_PALETTE[idx % TAB_PALETTE.length];
        const fg = contrastTextForHsl(hsl);
        const isActive = variant === "index" && tab.idx === activeIdx;
        const distance = variant === "trail" ? 1 : Math.abs(tab.idx - activeIdx);
        // Focus falloff — the further from the reader, the quieter the tab.
        const opacity = variant === "trail" ? 0.42 : [1, 0.62, 0.32][Math.min(distance, 2)];
        const scale = variant === "trail" ? 0.9 : [1, 0.95, 0.9][Math.min(distance, 2)];

        return (
          <button
            key={`${tab.label}-${tab.page}`}
            onClick={(e) => {
              if (e.shiftKey || e.altKey) {
                cycle(tab.label);
                return;
              }
              onGo(tab.page);
            }}
            title={`${tab.label} — page ${tab.page + 1} (shift-click to recolour)`}
            className={`pointer-events-auto animate-flip-tab-in group flex max-w-[120px] items-center gap-2 border px-2.5 py-2 backdrop-blur-xl transition-all duration-500 ease-out hover:!opacity-100 sm:max-w-[150px] lg:max-w-[190px] ${
              side === "right"
                ? "rounded-r-full border-l-0 hover:translate-x-1.5"
                : "rounded-l-full border-r-0 hover:-translate-x-1.5"
            }`}
            style={{
              opacity,
              transform: `scale(${scale}) translateX(${
                isActive ? (side === "right" ? "6px" : "-6px") : "0px"
              })`,
              background: `linear-gradient(${side === "right" ? "90deg" : "270deg"}, ${hslString(
                hsl,
                isActive ? 0.72 : 0.4
              )}, ${hslString(hsl, isActive ? 0.4 : 0.16)})`,
              borderColor: hslString(hsl, isActive ? 0.85 : 0.35),
              color: isActive ? fg : hslString(hsl, 1),
              boxShadow: isActive
                ? `0 14px 34px -14px ${hslString(hsl, 0.75)}, inset 0 1px 0 hsl(0 0% 100% / 0.35)`
                : "inset 0 1px 0 hsl(0 0% 100% / 0.2)",
            }}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: hslString(hsl, 1), boxShadow: `0 0 10px ${hslString(hsl, 0.9)}` }}
            />
            <span className="truncate text-[8px] uppercase tracking-[0.3em] sm:text-[9px]">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default FlipPageTabs;
