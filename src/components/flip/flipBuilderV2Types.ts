/**
 * FLIP Builder V2 — theme, palette, motion and publishing model.
 *
 * V2 keeps the V1 document model (pages of percent-placed blocks) and wraps it
 * with a theme (palette + type + motion + paper), narrator settings and the
 * publishing record that maps a book to a subdomain slug or custom domain.
 */

import type { CSSProperties } from "react";
import { starterDoc, type BuilderDoc, type BuilderPage } from "./flipBuilderTypes";

/* --------------------------------------------------------------- palettes */

export type FlipPalette = {
  id: string;
  name: string;
  /** page paper */
  paper: string;
  /** body ink on paper */
  ink: string;
  /** secondary ink — captions, eyebrows, rules */
  muted: string;
  /** accent used by tabs, figures, hairlines */
  accent: string;
  /** dark leaf paper + its ink */
  coverPaper: string;
  coverInk: string;
};

/** Curated editions. Every one is a print-house pairing, never a random hue. */
export const FLIP_PALETTES: FlipPalette[] = [
  { id: "atelier", name: "Atelier Ivory", paper: "#f6f3ec", ink: "#14110d", muted: "#6d675c", accent: "#0f766e", coverPaper: "#14110d", coverInk: "#f6f3ec" },
  { id: "teal", name: "Wonderlands Teal", paper: "#f4fbfc", ink: "#0b2b30", muted: "#54767c", accent: "#0891b2", coverPaper: "#062227", coverInk: "#e6f7fa" },
  { id: "coral", name: "Coral Ledger", paper: "#fff8f6", ink: "#2b1512", muted: "#8a635c", accent: "#f97066", coverPaper: "#2b1512", coverInk: "#ffeae5" },
  { id: "graphite", name: "Graphite Study", paper: "#f2f2f3", ink: "#101114", muted: "#65686f", accent: "#3f4753", coverPaper: "#101114", coverInk: "#e9eaee" },
  { id: "midnight", name: "Midnight Edition", paper: "#0f1218", ink: "#eef1f6", muted: "#8b93a3", accent: "#7dd3fc", coverPaper: "#05070b", coverInk: "#eef1f6" },
  { id: "sand", name: "Coquina Sand", paper: "#f8f1e4", ink: "#221b10", muted: "#7c6a4f", accent: "#b4762c", coverPaper: "#221b10", coverInk: "#f8f1e4" },
  { id: "verdant", name: "Verdant Lanai", paper: "#f3f7f1", ink: "#101c14", muted: "#5f7264", accent: "#2f6b3f", coverPaper: "#101c14", coverInk: "#eef5ee" },
  { id: "linen", name: "Linen & Slate", paper: "#fbfaf7", ink: "#1b1f24", muted: "#6b7280", accent: "#334155", coverPaper: "#1b1f24", coverInk: "#fbfaf7" },
  { id: "vermilion", name: "Vermilion Press", paper: "#fdf6f0", ink: "#1a0f0b", muted: "#8b6a58", accent: "#c2410c", coverPaper: "#1a0f0b", coverInk: "#fdf6f0" },
  { id: "pearl", name: "Pearl Aqua", paper: "#f7fdfb", ink: "#0d1f1c", muted: "#5b7b76", accent: "#14b8a6", coverPaper: "#0a1917", coverInk: "#eafaf6" },
];

/* ------------------------------------------------------------------- type */

export type FlipTypeSet = { id: string; name: string; display: string; text: string };

export const FLIP_TYPE_SETS: FlipTypeSet[] = [
  { id: "classic", name: "Classic Editorial", display: "'Playfair Display', Georgia, serif", text: "'Inter', system-ui, sans-serif" },
  { id: "didone", name: "Didone Masthead", display: "'Cormorant Garamond', Didot, serif", text: "'Karla', system-ui, sans-serif" },
  { id: "grotesk", name: "Swiss Grotesk", display: "'Space Grotesk', Helvetica, sans-serif", text: "'DM Sans', system-ui, sans-serif" },
  { id: "gazette", name: "Gazette", display: "Georgia, 'Times New Roman', serif", text: "'Work Sans', system-ui, sans-serif" },
  { id: "mono", name: "Technical Sheet", display: "'JetBrains Mono', ui-monospace, monospace", text: "'Work Sans', system-ui, sans-serif" },
];

/* ----------------------------------------------------------------- motion */

export type FlipMotion = "turn" | "riffle" | "fade" | "drift" | "cinema";

export const FLIP_MOTIONS: { id: FlipMotion; label: string; note: string; flippingTime: number }[] = [
  { id: "turn", label: "Page turn", note: "The printed turn — weighted paper with a soft shadow.", flippingTime: 880 },
  { id: "riffle", label: "Riffle", note: "Fast thumb-riffle: pages snap through with momentum.", flippingTime: 420 },
  { id: "fade", label: "Dissolve", note: "Leaves cross-fade instead of turning.", flippingTime: 700 },
  { id: "drift", label: "Drift", note: "A long, slow turn for a quiet reading pace.", flippingTime: 1400 },
  { id: "cinema", label: "Cinema", note: "Deep perspective, heavy shadow, lifted corners.", flippingTime: 1000 },
];

/* ------------------------------------------------------------------ theme */

export type FlipTheme = {
  paletteId: string;
  typeId: string;
  motion: FlipMotion;
  /** paper texture strength 0–100 */
  grain: number;
  /** book shadow depth 0–100 */
  depth: number;
  /** corner hints, tabs and progress rail */
  showTabs: boolean;
  showCorners: boolean;
  /** auto-advance seconds; 0 = off */
  autoplay: number;
};

export type FlipNarratorSettings = {
  enabled: boolean;
  voice: string;
  /** speak automatically when a spread opens */
  autoRead: boolean;
  /** credits charged per reading */
  creditsPerRead: number;
};

export type FlipPublishSettings = {
  slug: string;
  customDomain: string;
  published: boolean;
  /** id of the row in flip_books once saved */
  bookId?: string;
  shareToken?: string;
};

export type BuilderDocV2 = BuilderDoc & {
  theme: FlipTheme;
  narrator: FlipNarratorSettings;
  publish: FlipPublishSettings;
};

export const NARRATOR_MONTHLY_FEE = 20;
export const NARRATOR_CREDIT_PACKS = [
  { credits: 250, price: 20 },
  { credits: 750, price: 50 },
  { credits: 2000, price: 120 },
];

export const defaultTheme = (): FlipTheme => ({
  paletteId: "atelier",
  typeId: "classic",
  motion: "turn",
  grain: 18,
  depth: 55,
  showTabs: true,
  showCorners: true,
  autoplay: 0,
});

export const defaultNarrator = (): FlipNarratorSettings => ({
  enabled: false,
  voice: "alloy",
  autoRead: false,
  creditsPerRead: 1,
});

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "edition";

export const starterDocV2 = (): BuilderDocV2 => {
  const base = starterDoc();
  return {
    ...base,
    theme: defaultTheme(),
    narrator: defaultNarrator(),
    publish: { slug: slugify(base.title), customDomain: "", published: false },
  };
};

/** Bring a V1 document (or a stored row) up to the V2 shape without losing pages. */
export const ensureV2 = (doc: Partial<BuilderDocV2> | null | undefined): BuilderDocV2 => {
  const starter = starterDocV2();
  if (!doc || !Array.isArray(doc.pages) || doc.pages.length === 0) return starter;
  return {
    title: doc.title ?? starter.title,
    pages: doc.pages as BuilderPage[],
    theme: { ...starter.theme, ...(doc.theme ?? {}) },
    narrator: { ...starter.narrator, ...(doc.narrator ?? {}) },
    publish: { ...starter.publish, ...(doc.publish ?? {}) },
  };
};

export const paletteOf = (theme: FlipTheme): FlipPalette =>
  FLIP_PALETTES.find((p) => p.id === theme.paletteId) ?? FLIP_PALETTES[0];

export const typeSetOf = (theme: FlipTheme): FlipTypeSet =>
  FLIP_TYPE_SETS.find((t) => t.id === theme.typeId) ?? FLIP_TYPE_SETS[0];

export const motionOf = (theme: FlipTheme) =>
  FLIP_MOTIONS.find((m) => m.id === theme.motion) ?? FLIP_MOTIONS[0];

/**
 * Shuffler — deals a new edition look. It only ever draws from the curated
 * palette/type/motion decks, so a shuffle stays inside the house style.
 */
export const shuffleTheme = (current: FlipTheme): FlipTheme => {
  const pick = <T,>(list: T[], avoid?: T) => {
    const pool = avoid === undefined ? list : list.filter((x) => x !== avoid);
    return pool[Math.floor(Math.random() * pool.length)] ?? list[0];
  };
  return {
    ...current,
    paletteId: pick(FLIP_PALETTES.map((p) => p.id), current.paletteId),
    typeId: pick(FLIP_TYPE_SETS.map((t) => t.id), current.typeId),
    motion: pick(FLIP_MOTIONS.map((m) => m.id), current.motion),
    grain: Math.round(Math.random() * 40),
    depth: 35 + Math.round(Math.random() * 55),
  };
};

/** CSS custom properties the reader and canvas paint themselves with. */
export const themeVars = (theme: FlipTheme): CSSProperties => {
  const p = paletteOf(theme);
  const t = typeSetOf(theme);
  return {
    ["--fb-paper" as string]: p.paper,
    ["--fb-ink" as string]: p.ink,
    ["--fb-muted" as string]: p.muted,
    ["--fb-accent" as string]: p.accent,
    ["--fb-cover-paper" as string]: p.coverPaper,
    ["--fb-cover-ink" as string]: p.coverInk,
    ["--fb-display" as string]: t.display,
    ["--fb-text" as string]: t.text,
  } as CSSProperties;
};
