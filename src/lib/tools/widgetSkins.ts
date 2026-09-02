// Widget skins — the palette and typography controller behind /tools2.
//
// Every widget on the licensing gallery can be re-themed live: a palette writes
// the semantic design tokens (background, foreground, primary, border …) onto a
// scoped wrapper, and a typeface pair writes the display and body families. No
// component hardcodes a colour, so overriding the tokens on a container is
// enough to re-skin the whole widget — including anything it renders through
// shadcn variants.
//
// Palettes are stored as raw HSL triples so they drop straight into the
// `--token: H S% L%` contract used by src/index.css.

import type * as React from "react";

export interface WidgetPalette {
  id: string;
  name: string;
  /** One-line editorial note shown under the swatches. */
  note: string;
  /** Swatch preview — three representative hsl() strings. */
  swatch: [string, string, string];
  tokens: Record<string, string>;
}

export interface WidgetTypeface {
  id: string;
  name: string;
  note: string;
  /** Display / headline family. */
  display: string;
  /** Body and UI family. */
  body: string;
  /** Monospace family used for the instrument labels. */
  mono: string;
}

const palette = (
  id: string,
  name: string,
  note: string,
  swatch: [string, string, string],
  tokens: Record<string, string>,
): WidgetPalette => ({ id, name, note, swatch, tokens });

/** Fills the derived tokens so a palette only has to state its character. */
const build = (t: {
  background: string;
  foreground: string;
  card: string;
  muted: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  border: string;
  accent?: string;
}): Record<string, string> => ({
  "--background": t.background,
  "--foreground": t.foreground,
  "--card": t.card,
  "--card-foreground": t.foreground,
  "--popover": t.card,
  "--popover-foreground": t.foreground,
  "--muted": t.muted,
  "--muted-foreground": t.mutedForeground,
  "--secondary": t.muted,
  "--secondary-foreground": t.foreground,
  "--accent": t.accent ?? t.muted,
  "--accent-foreground": t.foreground,
  "--primary": t.primary,
  "--primary-foreground": t.primaryForeground,
  "--border": t.border,
  "--input": t.border,
  "--ring": t.primary,
});

export const WIDGET_PALETTES: WidgetPalette[] = [
  palette(
    "house",
    "House teal & coral",
    "The Wonderlands identity — teal instrument accents on paper white.",
    ["hsl(0 0% 100%)", "hsl(192 91% 36%)", "hsl(8 89% 70%)"],
    build({
      background: "0 0% 100%",
      foreground: "222 26% 12%",
      card: "0 0% 100%",
      muted: "195 24% 95%",
      mutedForeground: "215 14% 42%",
      primary: "192 91% 36%",
      primaryForeground: "0 0% 100%",
      border: "196 22% 87%",
      accent: "8 89% 93%",
    }),
  ),
  palette(
    "atelier",
    "Atelier paper",
    "Warm plaster and ink — the drafting-room edition.",
    ["hsl(38 34% 96%)", "hsl(28 12% 16%)", "hsl(22 74% 46%)"],
    build({
      background: "38 34% 96%",
      foreground: "28 14% 14%",
      card: "40 40% 98%",
      muted: "36 26% 91%",
      mutedForeground: "30 10% 40%",
      primary: "22 74% 46%",
      primaryForeground: "40 40% 98%",
      border: "34 22% 84%",
      accent: "36 40% 90%",
    }),
  ),
  palette(
    "graphite",
    "Graphite console",
    "Night shift — an OLED instrument panel with amber keys.",
    ["hsl(228 22% 8%)", "hsl(210 20% 92%)", "hsl(40 96% 58%)"],
    build({
      background: "228 22% 8%",
      foreground: "210 20% 94%",
      card: "228 20% 11%",
      muted: "228 16% 16%",
      mutedForeground: "215 14% 66%",
      primary: "40 96% 58%",
      primaryForeground: "228 30% 9%",
      border: "225 14% 24%",
      accent: "228 18% 18%",
    }),
  ),
  palette(
    "poolside",
    "Poolside aqua",
    "Water and lime plaster — the pool-deck palette.",
    ["hsl(196 60% 97%)", "hsl(199 89% 32%)", "hsl(174 62% 44%)"],
    build({
      background: "196 60% 97%",
      foreground: "205 42% 14%",
      card: "0 0% 100%",
      muted: "196 44% 92%",
      mutedForeground: "203 20% 40%",
      primary: "199 89% 32%",
      primaryForeground: "0 0% 100%",
      border: "197 36% 84%",
      accent: "174 52% 90%",
    }),
  ),
  palette(
    "terracotta",
    "Terracotta & olive",
    "Mediterranean hardscape — clay, olive and travertine.",
    ["hsl(30 40% 95%)", "hsl(14 52% 38%)", "hsl(96 22% 38%)"],
    build({
      background: "30 40% 95%",
      foreground: "18 30% 16%",
      card: "32 46% 98%",
      muted: "28 30% 90%",
      mutedForeground: "20 14% 40%",
      primary: "14 52% 42%",
      primaryForeground: "32 46% 98%",
      border: "26 26% 83%",
      accent: "96 22% 88%",
    }),
  ),
  palette(
    "midnight",
    "Midnight cyan",
    "The admin surface — deep navy with cyan telemetry.",
    ["hsl(220 26% 7%)", "hsl(186 96% 62%)", "hsl(258 82% 68%)"],
    build({
      background: "220 26% 7%",
      foreground: "186 60% 92%",
      card: "220 24% 10%",
      muted: "220 20% 15%",
      mutedForeground: "196 24% 68%",
      primary: "186 96% 56%",
      primaryForeground: "220 40% 8%",
      border: "196 30% 24%",
      accent: "258 60% 22%",
    }),
  ),
  palette(
    "bone",
    "Bone & ink",
    "Monochrome editorial — no colour, only contrast.",
    ["hsl(40 12% 96%)", "hsl(0 0% 8%)", "hsl(0 0% 45%)"],
    build({
      background: "40 12% 96%",
      foreground: "0 0% 8%",
      card: "0 0% 100%",
      muted: "40 8% 91%",
      mutedForeground: "0 0% 42%",
      primary: "0 0% 10%",
      primaryForeground: "0 0% 100%",
      border: "36 8% 84%",
      accent: "40 8% 90%",
    }),
  ),
  palette(
    "solstice",
    "Solstice amber",
    "The solar edition — irradiance orange over slate.",
    ["hsl(35 44% 97%)", "hsl(24 92% 46%)", "hsl(214 32% 26%)"],
    build({
      background: "35 44% 97%",
      foreground: "214 34% 14%",
      card: "0 0% 100%",
      muted: "35 34% 92%",
      mutedForeground: "214 16% 42%",
      primary: "24 92% 46%",
      primaryForeground: "0 0% 100%",
      border: "33 28% 85%",
      accent: "40 84% 90%",
    }),
  ),
];

export const WIDGET_TYPEFACES: WidgetTypeface[] = [
  {
    id: "sora",
    name: "Sora / Manrope",
    note: "The house pairing — geometric display over a humanist body.",
    display: "'Sora', system-ui, sans-serif",
    body: "'Manrope', system-ui, sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Menlo, monospace",
  },
  {
    id: "editorial",
    name: "Didone editorial",
    note: "High-contrast magazine serif with a quiet grotesque body.",
    display: "'Didot', 'Playfair Display', Georgia, serif",
    body: "'Manrope', 'Helvetica Neue', system-ui, sans-serif",
    mono: "ui-monospace, Menlo, monospace",
  },
  {
    id: "oldstyle",
    name: "Old style press",
    note: "Book serif throughout — the drafting-office document voice.",
    display: "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif",
    body: "'Iowan Old Style', Palatino, Georgia, serif",
    mono: "ui-monospace, Menlo, monospace",
  },
  {
    id: "swiss",
    name: "Swiss instrument",
    note: "Neutral grotesque set tight — technical, unsentimental.",
    display: "'Helvetica Neue', Inter, system-ui, sans-serif",
    body: "'Helvetica Neue', Inter, system-ui, sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Menlo, monospace",
  },
  {
    id: "monoconsole",
    name: "Mono console",
    note: "Everything monospaced — the mission-control read.",
    display: "ui-monospace, 'SFMono-Regular', Menlo, monospace",
    body: "ui-monospace, 'SFMono-Regular', Menlo, monospace",
    mono: "ui-monospace, Menlo, monospace",
  },
  {
    id: "grotesk",
    name: "Display grotesk",
    note: "Wide display caps over Manrope — signage scale.",
    display: "'Sora', 'Archivo', system-ui, sans-serif",
    body: "'Manrope', system-ui, sans-serif",
    mono: "ui-monospace, Menlo, monospace",
  },
];

export interface WidgetSkin {
  paletteId: string;
  typefaceId: string;
}

export const DEFAULT_SKIN: WidgetSkin = { paletteId: "house", typefaceId: "sora" };

export const paletteById = (id: string): WidgetPalette =>
  WIDGET_PALETTES.find((p) => p.id === id) ?? WIDGET_PALETTES[0];

export const typefaceById = (id: string): WidgetTypeface =>
  WIDGET_TYPEFACES.find((t) => t.id === id) ?? WIDGET_TYPEFACES[0];

/** CSS custom properties for a skin — spread onto any wrapper's style. */
export const skinVars = (skin: WidgetSkin): React.CSSProperties => {
  const p = paletteById(skin.paletteId);
  const t = typefaceById(skin.typefaceId);
  return {
    ...(p.tokens as unknown as React.CSSProperties),
    ["--wl-font-display" as string]: t.display,
    ["--wl-font-body" as string]: t.body,
    ["--wl-font-mono" as string]: t.mono,
    fontFamily: t.body,
  } as React.CSSProperties;
};

/** A deterministic-free shuffle — every press is a new combination. */
export const shuffleSkin = (current?: WidgetSkin): WidgetSkin => {
  let paletteId = current?.paletteId ?? "";
  let typefaceId = current?.typefaceId ?? "";
  while (paletteId === (current?.paletteId ?? ""))
    paletteId = WIDGET_PALETTES[Math.floor(Math.random() * WIDGET_PALETTES.length)].id;
  while (typefaceId === (current?.typefaceId ?? ""))
    typefaceId = WIDGET_TYPEFACES[Math.floor(Math.random() * WIDGET_TYPEFACES.length)].id;
  return { paletteId, typefaceId };
};

export const skinLabel = (skin: WidgetSkin): string =>
  `${paletteById(skin.paletteId).name} · ${typefaceById(skin.typefaceId).name}`;
