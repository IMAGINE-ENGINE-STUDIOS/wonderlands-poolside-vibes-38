/**
 * FLIP Builder — document model.
 * A flip document is a list of pages; a page is a list of absolutely placed
 * blocks measured in percent so every page scales with the book.
 */

export type BlockKind = "text" | "image" | "video" | "rule";

export type TextStyle = "eyebrow" | "title" | "subtitle" | "body" | "stat" | "caption";

export type BlockAnimation = "none" | "fade" | "rise" | "ken";

export type Block = {
  id: string;
  kind: BlockKind;
  /** percent of page width / height */
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  src?: string;
  style?: TextStyle;
  align?: "left" | "center" | "right";
  tone?: "dark" | "light";
  animation?: BlockAnimation;
};

export type PageTransition = "flip" | "fade" | "rise" | "slide";

export type BuilderPage = {
  id: string;
  name: string;
  tone: "paper" | "cover";
  transition: PageTransition;
  background?: string;
  blocks: Block[];
};

export type BuilderDoc = {
  title: string;
  pages: BuilderPage[];
};

export const uid = () => Math.random().toString(36).slice(2, 9);

export const TEXT_CLASS: Record<TextStyle, string> = {
  eyebrow: "text-[9px] uppercase tracking-[0.35em]",
  title: "font-serif text-4xl font-light leading-[1.05] tracking-tight",
  subtitle: "font-serif text-2xl font-light leading-snug",
  body: "text-[12px] leading-relaxed",
  stat: "font-serif text-5xl font-light leading-none",
  caption: "text-[9px] uppercase tracking-[0.3em] opacity-70",
};

export const TEXT_LABEL: Record<TextStyle, string> = {
  eyebrow: "Eyebrow",
  title: "Headline",
  subtitle: "Subhead",
  body: "Body copy",
  stat: "Figure",
  caption: "Caption",
};

const text = (
  partial: Partial<Block> & { text: string; x: number; y: number; w: number; h: number },
): Block => ({
  id: uid(),
  kind: "text",
  style: "body",
  align: "left",
  animation: "none",
  ...partial,
});

const image = (partial: Partial<Block> & { x: number; y: number; w: number; h: number }): Block => ({
  id: uid(),
  kind: "image",
  animation: "ken",
  ...partial,
});

export type LayoutPreset = {
  id: string;
  name: string;
  note: string;
  build: () => BuilderPage;
};

/** The layouts printed across every FLIP edition, offered as starting points. */
export const LAYOUTS: LayoutPreset[] = [
  {
    id: "cover",
    name: "Cover",
    note: "Full-bleed plate, title low-left, three figures on the baseline.",
    build: () => ({
      id: uid(),
      name: "Cover",
      tone: "cover",
      transition: "fade",
      blocks: [
        text({ text: "Wonderlands World", x: 8, y: 8, w: 50, h: 6, style: "eyebrow", tone: "light" }),
        text({ text: "Edition No. 01", x: 60, y: 8, w: 32, h: 6, style: "eyebrow", tone: "light", align: "right" }),
        text({ text: "The Outdoor Annual", x: 8, y: 52, w: 60, h: 8, style: "eyebrow", tone: "light" }),
        text({ text: "FLIP", x: 8, y: 58, w: 70, h: 16, style: "title", tone: "light" }),
        text({
          text: "Water, stone, shelter and verdure — one house, one composition.",
          x: 8,
          y: 76,
          w: 60,
          h: 10,
          style: "body",
          tone: "light",
        }),
      ],
    }),
  },
  {
    id: "statement",
    name: "Statement",
    note: "One photograph with a dark data panel and headline stats.",
    build: () => ({
      id: uid(),
      name: "Statement",
      tone: "cover",
      transition: "fade",
      blocks: [
        text({ text: "The Collection", x: 8, y: 12, w: 40, h: 6, style: "eyebrow", tone: "light" }),
        text({ text: "Drawn for the property", x: 8, y: 20, w: 55, h: 14, style: "title", tone: "light" }),
        text({ text: "24", x: 8, y: 70, w: 20, h: 12, style: "stat", tone: "light" }),
        text({ text: "Models", x: 8, y: 84, w: 20, h: 6, style: "caption", tone: "light" }),
        text({ text: "Turnkey", x: 34, y: 70, w: 24, h: 12, style: "stat", tone: "light" }),
        text({ text: "Installation", x: 34, y: 84, w: 24, h: 6, style: "caption", tone: "light" }),
      ],
    }),
  },
  {
    id: "index",
    name: "Index",
    note: "Contents list with hairline rules and section numbers.",
    build: () => ({
      id: uid(),
      name: "Index",
      tone: "paper",
      transition: "flip",
      blocks: [
        text({ text: "Contents", x: 8, y: 10, w: 40, h: 6, style: "eyebrow" }),
        text({ text: "All Categories", x: 8, y: 16, w: 70, h: 12, style: "title" }),
        text({ text: "01 — Pools", x: 8, y: 36, w: 84, h: 6, style: "body" }),
        { id: uid(), kind: "rule", x: 8, y: 42, w: 84, h: 1 },
        text({ text: "02 — Saunas", x: 8, y: 46, w: 84, h: 6, style: "body" }),
        { id: uid(), kind: "rule", x: 8, y: 52, w: 84, h: 1 },
        text({ text: "03 — Spas", x: 8, y: 56, w: 84, h: 6, style: "body" }),
        { id: uid(), kind: "rule", x: 8, y: 62, w: 84, h: 1 },
      ],
    }),
  },
  {
    id: "plate-duo",
    name: "Plate & Column",
    note: "Image on top half, headline and copy below.",
    build: () => ({
      id: uid(),
      name: "Plate & Column",
      tone: "paper",
      transition: "flip",
      blocks: [
        image({ x: 6, y: 6, w: 88, h: 46 }),
        text({ text: "Signature Waters", x: 6, y: 56, w: 60, h: 6, style: "eyebrow" }),
        text({ text: "The model name", x: 6, y: 62, w: 80, h: 10, style: "subtitle" }),
        text({
          text: "Two or three sentences on the craft: how it is built, how it is delivered, how it is installed at the address.",
          x: 6,
          y: 74,
          w: 80,
          h: 18,
          style: "body",
        }),
      ],
    }),
  },
  {
    id: "full-bleed",
    name: "Full bleed",
    note: "Photograph edge to edge with a single caption.",
    build: () => ({
      id: uid(),
      name: "Full bleed",
      tone: "cover",
      transition: "fade",
      blocks: [
        image({ x: 0, y: 0, w: 100, h: 100 }),
        text({ text: "Seen in place — Naples, Florida", x: 8, y: 88, w: 70, h: 6, style: "caption", tone: "light" }),
      ],
    }),
  },
  {
    id: "mosaic",
    name: "Gallery mosaic",
    note: "Four plates in a grid with a running caption.",
    build: () => ({
      id: uid(),
      name: "Gallery",
      tone: "paper",
      transition: "flip",
      blocks: [
        text({ text: "Portfolio", x: 6, y: 7, w: 50, h: 6, style: "eyebrow" }),
        image({ x: 6, y: 15, w: 42, h: 33 }),
        image({ x: 52, y: 15, w: 42, h: 33 }),
        image({ x: 6, y: 51, w: 42, h: 33 }),
        image({ x: 52, y: 51, w: 42, h: 33 }),
        text({ text: "Four properties, one discipline.", x: 6, y: 88, w: 80, h: 6, style: "caption" }),
      ],
    }),
  },
  {
    id: "price-sheet",
    name: "Price sheet",
    note: "Text-only specification page with ruled rows.",
    build: () => ({
      id: uid(),
      name: "Price sheet",
      tone: "paper",
      transition: "flip",
      blocks: [
        text({ text: "Specification", x: 8, y: 10, w: 50, h: 6, style: "eyebrow" }),
        text({ text: "What it includes", x: 8, y: 16, w: 70, h: 10, style: "subtitle" }),
        text({ text: "Shell, delivery, set and start-up", x: 8, y: 34, w: 84, h: 6, style: "body" }),
        { id: uid(), kind: "rule", x: 8, y: 40, w: 84, h: 1 },
        text({ text: "Deck, coping and waterline", x: 8, y: 44, w: 84, h: 6, style: "body" }),
        { id: uid(), kind: "rule", x: 8, y: 50, w: 84, h: 1 },
        text({
          text: "All prices include delivery, installation and the product as described.",
          x: 8,
          y: 86,
          w: 84,
          h: 8,
          style: "caption",
        }),
      ],
    }),
  },
  {
    id: "video",
    name: "Motion page",
    note: "Looping film with a title over the frame.",
    build: () => ({
      id: uid(),
      name: "Motion",
      tone: "cover",
      transition: "fade",
      blocks: [
        { id: uid(), kind: "video", x: 0, y: 0, w: 100, h: 100, animation: "none" },
        text({ text: "In motion", x: 8, y: 76, w: 60, h: 8, style: "eyebrow", tone: "light" }),
        text({ text: "The property at dusk", x: 8, y: 82, w: 70, h: 10, style: "subtitle", tone: "light" }),
      ],
    }),
  },
  {
    id: "blank",
    name: "Blank",
    note: "An empty leaf — build it from nothing.",
    build: () => ({ id: uid(), name: "Blank", tone: "paper", transition: "flip", blocks: [] }),
  },
];

export const starterDoc = (): BuilderDoc => ({
  title: "Untitled Flip",
  pages: [
    LAYOUTS[0].build(),
    LAYOUTS[2].build(),
    LAYOUTS[3].build(),
    LAYOUTS[6].build(),
  ],
});
