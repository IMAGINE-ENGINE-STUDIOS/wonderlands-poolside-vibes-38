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
            /**
             * Editorial tab: a thin glass wafer with a coloured spine on the book
             * edge, a hairline-ruled folio numeral and a wide-tracked label.
             * No pill, no bullet dot — the spine is the only chrome.
             */
            className={`pointer-events-auto animate-flip-tab-in group relative flex max-w-[132px] items-center gap-2.5 overflow-hidden px-3 py-[7px] backdrop-blur-2xl transition-all duration-[600ms] ease-out hover:!opacity-100 sm:max-w-[164px] lg:max-w-[208px] ${
              side === "right"
                ? "rounded-r-[3px] pl-[13px] hover:translate-x-1.5"
                : "rounded-l-[3px] pr-[13px] hover:-translate-x-1.5"
            }`}
            style={{
              opacity,
              transform: `scale(${scale}) translateX(${
                isActive ? (side === "right" ? "7px" : "-7px") : "0px"
              })`,
              background: isActive
                ? `linear-gradient(${side === "right" ? "100deg" : "260deg"}, hsl(0 0% 4% / 0.82), ${hslString(hsl, 0.26)})`
                : `linear-gradient(${side === "right" ? "100deg" : "260deg"}, hsl(0 0% 6% / 0.55), hsl(0 0% 6% / 0.24))`,
              border: "1px solid",
              borderColor: isActive ? hslString(hsl, 0.55) : "hsl(0 0% 100% / 0.1)",
              borderLeftWidth: side === "right" ? 0 : 1,
              borderRightWidth: side === "right" ? 1 : 0,
              color: isActive ? "#f6f4ef" : "hsl(0 0% 100% / 0.62)",
              boxShadow: isActive
                ? `0 18px 40px -20px ${hslString(hsl, 0.7)}, inset 0 1px 0 hsl(0 0% 100% / 0.14)`
                : "inset 0 1px 0 hsl(0 0% 100% / 0.07)",
            }}
          >
            {/* Coloured spine, flush with the book's outer edge */}
            <span
              aria-hidden
              className={`absolute inset-y-0 w-[2px] transition-all duration-500 ${
                side === "right" ? "left-0" : "right-0"
              }`}
              style={{
                background: hslString(hsl, isActive ? 1 : 0.55),
                boxShadow: isActive ? `0 0 14px ${hslString(hsl, 0.85)}` : "none",
              }}
            />
            {/* Folio numeral — quiet, tabular, rule-separated */}
            <span
              className={`shrink-0 font-mono text-[8px] leading-none tabular-nums transition-colors ${
                side === "right" ? "order-first" : "order-last"
              }`}
              style={{ color: isActive ? hslString(hsl, 1) : "hsl(0 0% 100% / 0.4)" }}
            >
              {String(tab.page + 1).padStart(2, "0")}
            </span>
            <span
              aria-hidden
              className="h-2.5 w-px shrink-0"
              style={{ background: isActive ? hslString(hsl, 0.6) : "hsl(0 0% 100% / 0.16)" }}
            />
            <span
              className={`truncate text-[8px] uppercase leading-none sm:text-[9px] ${
                isActive ? "tracking-[0.34em]" : "tracking-[0.28em]"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );

      })}
    </div>
  );
};

export default FlipPageTabs;
