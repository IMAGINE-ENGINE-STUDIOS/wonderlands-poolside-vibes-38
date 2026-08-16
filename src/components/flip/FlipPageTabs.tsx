import { useMemo } from "react";
import usePersistentState from "@/hooks/usePersistentState";

/**
 * Hanging page tabs — index tabs that live OUTSIDE the book on its outer border,
 * the way a ring binder or a legal exhibit set is tabbed. Each tab jumps the
 * reader to that page. Colours are programmatic HSL, so the label text is always
 * computed to contrast its own tab, whatever colour is chosen.
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

const hslString = ([h, s, l]: [number, number, number]) => `hsl(${h} ${s}% ${l}%)`;

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

const FlipPageTabs: React.FC<{
  items: PageTabItem[];
  activePage: number;
  onGo: (page: number) => void;
  height: number;
  side?: "left" | "right";
  storageKey?: string;
}> = ({ items, activePage, onGo, height, side = "right", storageKey = "flip.tabs.colors" }) => {
  const [colors, setColors] = usePersistentState<Record<string, number>>(storageKey, {});

  /** Collapse repeated chapter names to one tab, keeping the first page of each. */
  const tabs = useMemo(() => {
    const out: PageTabItem[] = [];
    items.forEach((it) => {
      if (!out.some((o) => o.label === it.label)) out.push(it);
    });
    const maxTabs = Math.max(3, Math.floor((height - 8) / 34));
    return out.slice(0, maxTabs);
  }, [items, height]);

  if (!tabs.length) return null;

  const cycle = (label: string) =>
    setColors((prev) => ({
      ...prev,
      [label]: ((prev[label] ?? hashLabel(label)) + 1) % TAB_PALETTE.length,
    }));

  return (
    <div
      aria-label="Page tabs"
      className={`pointer-events-none absolute top-0 hidden h-full flex-col justify-start gap-1.5 py-1 md:flex ${
        side === "right" ? "left-full items-start pl-0" : "right-full items-end pr-0"
      }`}
      style={{ height }}
    >
      {tabs.map((tab, i) => {
        const idx = colors[tab.label] ?? hashLabel(tab.label) % TAB_PALETTE.length;
        const hsl = TAB_PALETTE[idx % TAB_PALETTE.length];
        const bg = hslString(hsl);
        const fg = contrastTextForHsl(hsl);
        const isActive = activePage === tab.page || activePage === tab.page + 1;
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
            className={`pointer-events-auto animate-flip-tab-in whitespace-nowrap px-2.5 py-1.5 text-[8px] uppercase tracking-[0.28em] shadow-[6px_6px_18px_-10px_rgba(0,0,0,0.6)] transition-transform duration-300 ${
              side === "right"
                ? "rounded-r-[3px] hover:translate-x-1"
                : "rounded-l-[3px] hover:-translate-x-1"
            } ${isActive ? (side === "right" ? "translate-x-1.5" : "-translate-x-1.5") : ""}`}
            style={{
              background: bg,
              color: fg,
              animationDelay: `${i * 45}ms`,
              outline: isActive ? `1px solid ${fg}` : "none",
              outlineOffset: "-3px",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default FlipPageTabs;
