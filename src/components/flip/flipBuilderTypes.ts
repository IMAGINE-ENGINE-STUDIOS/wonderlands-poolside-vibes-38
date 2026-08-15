/**
 * FLIP Builder — document model.
 * A flip document is a list of pages; a page is a list of absolutely placed
 * blocks measured in percent so every page scales with the book.
 */

export type BlockKind = "text" | "image" | "video" | "rule" | "widget";

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
  /** id from FLIP_WIDGETS — only for widget blocks */
  widget?: string;
  /** how much a widget is scaled down to sit on the leaf */
  scale?: number;
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
  /** family shown in the gallery filter */
  family: "Covers" | "Editorial" | "Imagery" | "Data" | "Spreads" | "Widgets";
  build: () => BuilderPage;
  /** two-page formats: the facing leaf, inserted with the first */
  buildFacing?: () => BuilderPage;
};

const widget = (
  partial: Partial<Block> & { widget: string; x: number; y: number; w: number; h: number },
): Block => ({ id: uid(), kind: "widget", scale: 0.6, animation: "none", ...partial });

const rule = (x: number, y: number, w: number, tone?: "dark" | "light"): Block => ({
  id: uid(),
  kind: "rule",
  x,
  y,
  w,
  h: 1,
  tone,
});

const page = (
  name: string,
  tone: "paper" | "cover",
  transition: PageTransition,
  blocks: Block[],
): BuilderPage => ({ id: uid(), name, tone, transition, blocks });

/** The layouts printed across every FLIP edition, offered as starting points. */
export const LAYOUTS: LayoutPreset[] = [
  /* ------------------------------------------------------------- covers */
  {
    id: "cover",
    name: "Cover",
    family: "Covers",
    note: "Full-bleed plate, title low-left, the masthead on the top rule.",
    build: () =>
      page("Cover", "cover", "fade", [
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
      ]),
  },
  {
    id: "cover-quiet",
    name: "Quiet cover",
    family: "Covers",
    note: "Paper cover, centred masthead, one hairline and a date line.",
    build: () =>
      page("Quiet cover", "paper", "fade", [
        text({ text: "Wonderlands World", x: 10, y: 30, w: 80, h: 6, style: "eyebrow", align: "center" }),
        text({ text: "The Outdoor Annual", x: 10, y: 38, w: 80, h: 14, style: "title", align: "center" }),
        rule(30, 56, 40),
        text({ text: "Florida — Season One", x: 10, y: 60, w: 80, h: 6, style: "caption", align: "center" }),
      ]),
  },
  {
    id: "cover-figure",
    name: "Figure cover",
    family: "Covers",
    note: "Dark cover carrying one enormous figure and a short claim.",
    build: () =>
      page("Figure cover", "cover", "rise", [
        text({ text: "The year in water", x: 8, y: 12, w: 60, h: 6, style: "eyebrow", tone: "light" }),
        text({ text: "412", x: 8, y: 30, w: 60, h: 20, style: "stat", tone: "light" }),
        text({ text: "Properties completed", x: 8, y: 52, w: 60, h: 6, style: "caption", tone: "light" }),
        text({ text: "Built, delivered and installed by our own crews.", x: 8, y: 80, w: 62, h: 10, style: "body", tone: "light" }),
      ]),
  },
  {
    id: "issue-plate",
    name: "Issue plate",
    family: "Covers",
    note: "Photograph with the issue number set over the frame.",
    build: () =>
      page("Issue plate", "cover", "fade", [
        image({ x: 0, y: 0, w: 100, h: 100 }),
        text({ text: "Issue", x: 8, y: 66, w: 30, h: 6, style: "eyebrow", tone: "light" }),
        text({ text: "No. 01", x: 8, y: 72, w: 50, h: 14, style: "title", tone: "light" }),
      ]),
  },
  {
    id: "chapter-opener",
    name: "Chapter opener",
    family: "Covers",
    note: "A number, a discipline and a single line of intent.",
    build: () =>
      page("Chapter", "paper", "rise", [
        text({ text: "Chapter", x: 8, y: 30, w: 40, h: 6, style: "eyebrow" }),
        text({ text: "01", x: 8, y: 36, w: 40, h: 16, style: "stat" }),
        rule(8, 56, 84),
        text({ text: "Pools", x: 8, y: 60, w: 70, h: 12, style: "title" }),
        text({ text: "Fibreglass and concrete, drawn to the property.", x: 8, y: 76, w: 70, h: 8, style: "body" }),
      ]),
  },
  {
    id: "back-cover",
    name: "Back cover",
    family: "Covers",
    note: "Closing leaf: mark, contact line and the price note.",
    build: () =>
      page("Back cover", "cover", "fade", [
        text({ text: "Wonderlands World", x: 10, y: 40, w: 80, h: 8, style: "subtitle", align: "center", tone: "light" }),
        rule(35, 52, 30, "light"),
        text({ text: "wonderlandsworld.com", x: 10, y: 58, w: 80, h: 6, style: "caption", align: "center", tone: "light" }),
        text({
          text: "All prices include delivery, installation and the product as described.",
          x: 12,
          y: 84,
          w: 76,
          h: 8,
          style: "caption",
          align: "center",
          tone: "light",
        }),
      ]),
  },

  /* ---------------------------------------------------------- editorial */
  {
    id: "statement",
    name: "Statement",
    family: "Editorial",
    note: "One photograph with a headline and figures on the baseline.",
    build: () =>
      page("Statement", "cover", "fade", [
        text({ text: "The Collection", x: 8, y: 12, w: 40, h: 6, style: "eyebrow", tone: "light" }),
        text({ text: "Drawn for the property", x: 8, y: 20, w: 55, h: 14, style: "title", tone: "light" }),
        text({ text: "24", x: 8, y: 70, w: 20, h: 12, style: "stat", tone: "light" }),
        text({ text: "Models", x: 8, y: 84, w: 20, h: 6, style: "caption", tone: "light" }),
        text({ text: "Turnkey", x: 34, y: 70, w: 24, h: 12, style: "stat", tone: "light" }),
        text({ text: "Installation", x: 34, y: 84, w: 24, h: 6, style: "caption", tone: "light" }),
      ]),
  },
  {
    id: "editors-letter",
    name: "Editor's letter",
    family: "Editorial",
    note: "A signed letter with a wide measure and a closing rule.",
    build: () =>
      page("Editor's letter", "paper", "flip", [
        text({ text: "Editor's letter", x: 8, y: 10, w: 50, h: 6, style: "eyebrow" }),
        text({ text: "On building outdoors", x: 8, y: 16, w: 70, h: 10, style: "subtitle" }),
        text({
          text: "A house is finished outside. Water first, then the stone that carries it, then the shelter and the planting that settle it into the ground. This edition sets that order down.",
          x: 8,
          y: 32,
          w: 80,
          h: 30,
          style: "body",
        }),
        rule(8, 76, 30),
        text({ text: "Wonderlands World", x: 8, y: 80, w: 50, h: 6, style: "caption" }),
      ]),
  },
  {
    id: "column-two",
    name: "Two columns",
    family: "Editorial",
    note: "A headline over two even columns of running copy.",
    build: () =>
      page("Two columns", "paper", "flip", [
        text({ text: "The craft", x: 8, y: 10, w: 50, h: 6, style: "eyebrow" }),
        text({ text: "How it is made", x: 8, y: 16, w: 80, h: 10, style: "subtitle" }),
        text({ text: "Column one of the story.", x: 8, y: 32, w: 39, h: 50, style: "body" }),
        text({ text: "Column two of the story.", x: 53, y: 32, w: 39, h: 50, style: "body" }),
      ]),
  },
  {
    id: "plate-duo",
    name: "Plate & column",
    family: "Editorial",
    note: "Image on the top half, headline and copy below.",
    build: () =>
      page("Plate & column", "paper", "flip", [
        image({ x: 6, y: 6, w: 88, h: 46 }),
        text({ text: "Signature waters", x: 6, y: 56, w: 60, h: 6, style: "eyebrow" }),
        text({ text: "The model name", x: 6, y: 62, w: 80, h: 10, style: "subtitle" }),
        text({
          text: "Two or three sentences on the craft: how it is built, how it is delivered, how it is installed at the address.",
          x: 6,
          y: 74,
          w: 80,
          h: 18,
          style: "body",
        }),
      ]),
  },
  {
    id: "sidebar-note",
    name: "Sidebar note",
    family: "Editorial",
    note: "Main column with a ruled sidebar for specification notes.",
    build: () =>
      page("Sidebar", "paper", "flip", [
        text({ text: "Detail", x: 6, y: 10, w: 40, h: 6, style: "eyebrow" }),
        text({ text: "What sits under the water", x: 6, y: 16, w: 60, h: 10, style: "subtitle" }),
        text({ text: "The main body of the note.", x: 6, y: 32, w: 55, h: 52, style: "body" }),
        rule(66, 30, 28),
        text({ text: "Specification", x: 66, y: 34, w: 28, h: 6, style: "eyebrow" }),
        text({ text: "Shell · Coping · Waterline · Deck", x: 66, y: 42, w: 28, h: 30, style: "body" }),
      ]),
  },
  {
    id: "interview",
    name: "Interview",
    family: "Editorial",
    note: "Question and answer set with a portrait plate.",
    build: () =>
      page("Interview", "paper", "flip", [
        image({ x: 6, y: 8, w: 34, h: 34 }),
        text({ text: "In conversation", x: 46, y: 10, w: 48, h: 6, style: "eyebrow" }),
        text({ text: "With the build crew", x: 46, y: 16, w: 48, h: 12, style: "subtitle" }),
        text({ text: "Q. How long does an installation take?", x: 6, y: 48, w: 88, h: 8, style: "body" }),
        text({ text: "A. Two to three weeks on a prepared site.", x: 6, y: 58, w: 88, h: 10, style: "body" }),
        rule(6, 70, 88),
        text({ text: "Q. And the warranty?", x: 6, y: 74, w: 88, h: 8, style: "body" }),
        text({ text: "A. Lifetime structural on the shell.", x: 6, y: 82, w: 88, h: 8, style: "body" }),
      ]),
  },
  {
    id: "pull-quote",
    name: "Pull quote",
    family: "Editorial",
    note: "One line set large, credited beneath a hairline.",
    build: () =>
      page("Pull quote", "paper", "rise", [
        text({
          text: "“The garden is the last room of the house.”",
          x: 10,
          y: 34,
          w: 80,
          h: 24,
          style: "title",
          align: "center",
        }),
        rule(40, 64, 20),
        text({ text: "Wonderlands World", x: 10, y: 68, w: 80, h: 6, style: "caption", align: "center" }),
      ]),
  },
  {
    id: "feature-open",
    name: "Feature opener",
    family: "Editorial",
    note: "A tall plate on one side, headline stack on the other.",
    build: () =>
      page("Feature opener", "paper", "flip", [
        image({ x: 0, y: 0, w: 46, h: 100 }),
        text({ text: "Feature", x: 54, y: 18, w: 40, h: 6, style: "eyebrow" }),
        text({ text: "A pool for a narrow lot", x: 54, y: 26, w: 40, h: 22, style: "title" }),
        text({ text: "How the plan was solved in fourteen feet.", x: 54, y: 54, w: 40, h: 18, style: "body" }),
      ]),
  },
  {
    id: "credits",
    name: "Credits",
    family: "Editorial",
    note: "Ruled credit rows for trades, brands and photography.",
    build: () =>
      page("Credits", "paper", "flip", [
        text({ text: "Credits", x: 8, y: 12, w: 50, h: 6, style: "eyebrow" }),
        text({ text: "Design — Wonderlands World", x: 8, y: 26, w: 84, h: 6, style: "body" }),
        rule(8, 32, 84),
        text({ text: "Shell — Latham / GlimmerGlass", x: 8, y: 36, w: 84, h: 6, style: "body" }),
        rule(8, 42, 84),
        text({ text: "Equipment — Pentair", x: 8, y: 46, w: 84, h: 6, style: "body" }),
        rule(8, 52, 84),
        text({ text: "Hardscape — Belgard", x: 8, y: 56, w: 84, h: 6, style: "body" }),
      ]),
  },
  {
    id: "colophon",
    name: "Colophon",
    family: "Editorial",
    note: "Closing note on the edition, set small and centred.",
    build: () =>
      page("Colophon", "paper", "fade", [
        text({ text: "Colophon", x: 10, y: 36, w: 80, h: 6, style: "eyebrow", align: "center" }),
        text({
          text: "Set in a serif display with a grotesque for the rules. Printed digitally, revised continuously.",
          x: 18,
          y: 46,
          w: 64,
          h: 16,
          style: "body",
          align: "center",
        }),
      ]),
  },

  /* ------------------------------------------------------------ imagery */
  {
    id: "full-bleed",
    name: "Full bleed",
    family: "Imagery",
    note: "Photograph edge to edge with a single caption.",
    build: () =>
      page("Full bleed", "cover", "fade", [
        image({ x: 0, y: 0, w: 100, h: 100 }),
        text({ text: "Seen in place — Naples, Florida", x: 8, y: 88, w: 70, h: 6, style: "caption", tone: "light" }),
      ]),
  },
  {
    id: "mosaic",
    name: "Gallery mosaic",
    family: "Imagery",
    note: "Four plates in a grid with a running caption.",
    build: () =>
      page("Gallery", "paper", "flip", [
        text({ text: "Portfolio", x: 6, y: 7, w: 50, h: 6, style: "eyebrow" }),
        image({ x: 6, y: 15, w: 42, h: 33 }),
        image({ x: 52, y: 15, w: 42, h: 33 }),
        image({ x: 6, y: 51, w: 42, h: 33 }),
        image({ x: 52, y: 51, w: 42, h: 33 }),
        text({ text: "Four properties, one discipline.", x: 6, y: 88, w: 80, h: 6, style: "caption" }),
      ]),
  },
  {
    id: "duo-stack",
    name: "Stacked pair",
    family: "Imagery",
    note: "Two wide plates stacked with captions between.",
    build: () =>
      page("Stacked pair", "paper", "flip", [
        image({ x: 6, y: 8, w: 88, h: 36 }),
        text({ text: "Before — the bare lot", x: 6, y: 46, w: 88, h: 5, style: "caption" }),
        image({ x: 6, y: 54, w: 88, h: 36 }),
      ]),
  },
  {
    id: "triptych",
    name: "Triptych",
    family: "Imagery",
    note: "Three tall plates side by side.",
    build: () =>
      page("Triptych", "paper", "flip", [
        image({ x: 4, y: 16, w: 29, h: 60 }),
        image({ x: 35.5, y: 16, w: 29, h: 60 }),
        image({ x: 67, y: 16, w: 29, h: 60 }),
        text({ text: "Three finishes, one water", x: 4, y: 80, w: 92, h: 6, style: "caption", align: "center" }),
      ]),
  },
  {
    id: "portrait-plate",
    name: "Portrait plate",
    family: "Imagery",
    note: "A centred portrait image with generous margins.",
    build: () =>
      page("Portrait plate", "paper", "rise", [
        image({ x: 20, y: 10, w: 60, h: 70 }),
        text({ text: "The model, at rest", x: 20, y: 84, w: 60, h: 6, style: "caption", align: "center" }),
      ]),
  },
  {
    id: "half-top",
    name: "Half plate — top",
    family: "Imagery",
    note: "Image on the upper half, open paper beneath.",
    build: () =>
      page("Half plate top", "paper", "flip", [
        image({ x: 0, y: 0, w: 100, h: 50 }),
        text({ text: "Caption", x: 8, y: 56, w: 84, h: 6, style: "caption" }),
        text({ text: "Body copy set under the plate.", x: 8, y: 64, w: 84, h: 26, style: "body" }),
      ]),
  },
  {
    id: "half-bottom",
    name: "Half plate — bottom",
    family: "Imagery",
    note: "Copy above, image running off the foot of the leaf.",
    build: () =>
      page("Half plate bottom", "paper", "flip", [
        text({ text: "The detail", x: 8, y: 12, w: 84, h: 6, style: "eyebrow" }),
        text({ text: "Coping, waterline and the first step.", x: 8, y: 20, w: 84, h: 20, style: "body" }),
        image({ x: 0, y: 48, w: 100, h: 52 }),
      ]),
  },
  {
    id: "framed-plate",
    name: "Framed plate",
    family: "Imagery",
    note: "Image inset inside a ruled frame with a running head.",
    build: () =>
      page("Framed plate", "paper", "flip", [
        text({ text: "Wonderlands World", x: 8, y: 7, w: 84, h: 5, style: "caption" }),
        rule(8, 13, 84),
        image({ x: 10, y: 20, w: 80, h: 60 }),
        rule(8, 86, 84),
      ]),
  },
  {
    id: "motion",
    name: "Motion page",
    family: "Imagery",
    note: "Looping film with a title over the frame.",
    build: () =>
      page("Motion", "cover", "fade", [
        { id: uid(), kind: "video", x: 0, y: 0, w: 100, h: 100, animation: "none" },
        text({ text: "In motion", x: 8, y: 76, w: 60, h: 8, style: "eyebrow", tone: "light" }),
        text({ text: "The property at dusk", x: 8, y: 82, w: 70, h: 10, style: "subtitle", tone: "light" }),
      ]),
  },
  {
    id: "motion-duo",
    name: "Film & still",
    family: "Imagery",
    note: "A film beside a still, captioned underneath.",
    build: () =>
      page("Film & still", "paper", "flip", [
        { id: uid(), kind: "video", x: 4, y: 14, w: 45, h: 56, animation: "none" },
        image({ x: 51, y: 14, w: 45, h: 56 }),
        text({ text: "Moving and still, the same water", x: 4, y: 74, w: 92, h: 6, style: "caption" }),
      ]),
  },

  /* --------------------------------------------------------------- data */
  {
    id: "index",
    name: "Index",
    family: "Data",
    note: "Contents list with hairline rules and section numbers.",
    build: () =>
      page("Index", "paper", "flip", [
        text({ text: "Contents", x: 8, y: 10, w: 40, h: 6, style: "eyebrow" }),
        text({ text: "All categories", x: 8, y: 16, w: 70, h: 12, style: "title" }),
        text({ text: "01 — Pools", x: 8, y: 36, w: 84, h: 6, style: "body" }),
        rule(8, 42, 84),
        text({ text: "02 — Saunas", x: 8, y: 46, w: 84, h: 6, style: "body" }),
        rule(8, 52, 84),
        text({ text: "03 — Spas", x: 8, y: 56, w: 84, h: 6, style: "body" }),
        rule(8, 62, 84),
      ]),
  },
  {
    id: "price-sheet",
    name: "Price sheet",
    family: "Data",
    note: "Text-only specification page with ruled rows.",
    build: () =>
      page("Price sheet", "paper", "flip", [
        text({ text: "Specification", x: 8, y: 10, w: 50, h: 6, style: "eyebrow" }),
        text({ text: "What it includes", x: 8, y: 16, w: 70, h: 10, style: "subtitle" }),
        text({ text: "Shell, delivery, set and start-up", x: 8, y: 34, w: 84, h: 6, style: "body" }),
        rule(8, 40, 84),
        text({ text: "Deck, coping and waterline", x: 8, y: 44, w: 84, h: 6, style: "body" }),
        rule(8, 50, 84),
        text({
          text: "All prices include delivery, installation and the product as described.",
          x: 8,
          y: 86,
          w: 84,
          h: 8,
          style: "caption",
        }),
      ]),
  },
  {
    id: "spec-table",
    name: "Dimension table",
    family: "Data",
    note: "Model dimensions in ruled rows with figures on the right.",
    build: () =>
      page("Dimensions", "paper", "flip", [
        text({ text: "Dimensions", x: 8, y: 10, w: 50, h: 6, style: "eyebrow" }),
        text({ text: "Length", x: 8, y: 26, w: 50, h: 6, style: "body" }),
        text({ text: "28 ft", x: 60, y: 26, w: 32, h: 6, style: "body", align: "right" }),
        rule(8, 32, 84),
        text({ text: "Width", x: 8, y: 36, w: 50, h: 6, style: "body" }),
        text({ text: "14 ft", x: 60, y: 36, w: 32, h: 6, style: "body", align: "right" }),
        rule(8, 42, 84),
        text({ text: "Depth", x: 8, y: 46, w: 50, h: 6, style: "body" }),
        text({ text: "3 ft 6 in — 6 ft", x: 60, y: 46, w: 32, h: 6, style: "body", align: "right" }),
        rule(8, 52, 84),
      ]),
  },
  {
    id: "comparison",
    name: "Comparison",
    family: "Data",
    note: "Two models set side by side with matched rows.",
    build: () =>
      page("Comparison", "paper", "flip", [
        text({ text: "Compared", x: 8, y: 10, w: 50, h: 6, style: "eyebrow" }),
        text({ text: "Model A", x: 8, y: 22, w: 40, h: 8, style: "subtitle" }),
        text({ text: "Model B", x: 54, y: 22, w: 40, h: 8, style: "subtitle" }),
        rule(8, 34, 84),
        text({ text: "Fibreglass shell\n14 x 28\nSalt system", x: 8, y: 38, w: 40, h: 30, style: "body" }),
        text({ text: "Concrete shell\n16 x 32\nHeat pump", x: 54, y: 38, w: 40, h: 30, style: "body" }),
      ]),
  },
  {
    id: "timeline",
    name: "Timeline",
    family: "Data",
    note: "Build phases as numbered rows down the leaf.",
    build: () =>
      page("Timeline", "paper", "flip", [
        text({ text: "The build", x: 8, y: 10, w: 50, h: 6, style: "eyebrow" }),
        text({ text: "01 — Permit and survey", x: 8, y: 26, w: 84, h: 6, style: "body" }),
        rule(8, 32, 84),
        text({ text: "02 — Excavation and set", x: 8, y: 36, w: 84, h: 6, style: "body" }),
        rule(8, 42, 84),
        text({ text: "03 — Plumbing and deck", x: 8, y: 46, w: 84, h: 6, style: "body" }),
        rule(8, 52, 84),
        text({ text: "04 — Start-up and handover", x: 8, y: 56, w: 84, h: 6, style: "body" }),
      ]),
  },
  {
    id: "figures",
    name: "Three figures",
    family: "Data",
    note: "Three statistics across the leaf with captions.",
    build: () =>
      page("Figures", "paper", "rise", [
        text({ text: "By the numbers", x: 8, y: 14, w: 84, h: 6, style: "eyebrow" }),
        text({ text: "24", x: 8, y: 34, w: 26, h: 12, style: "stat" }),
        text({ text: "Models", x: 8, y: 48, w: 26, h: 5, style: "caption" }),
        text({ text: "3", x: 38, y: 34, w: 26, h: 12, style: "stat" }),
        text({ text: "Weeks to install", x: 38, y: 48, w: 26, h: 5, style: "caption" }),
        text({ text: "100%", x: 68, y: 34, w: 26, h: 12, style: "stat" }),
        text({ text: "Own crews", x: 68, y: 48, w: 26, h: 5, style: "caption" }),
      ]),
  },
  {
    id: "checklist",
    name: "Checklist",
    family: "Data",
    note: "What is included and what is optional, in two lists.",
    build: () =>
      page("Checklist", "paper", "flip", [
        text({ text: "Included", x: 8, y: 12, w: 40, h: 6, style: "eyebrow" }),
        text({ text: "Shell\nDelivery\nSet and crane\nStart-up", x: 8, y: 22, w: 40, h: 40, style: "body" }),
        text({ text: "Optional", x: 54, y: 12, w: 40, h: 6, style: "eyebrow" }),
        text({ text: "Heater\nJets\nScreen enclosure\nPaver deck", x: 54, y: 22, w: 40, h: 40, style: "body" }),
      ]),
  },
  {
    id: "order-form",
    name: "Order page",
    family: "Data",
    note: "Total, deposit schedule and a signature line.",
    build: () =>
      page("Order", "paper", "flip", [
        text({ text: "Order", x: 8, y: 10, w: 50, h: 6, style: "eyebrow" }),
        text({ text: "Your estimate", x: 8, y: 16, w: 70, h: 10, style: "subtitle" }),
        text({ text: "Deposit 20% · Set 35% · Deck 40% · Final 10%", x: 8, y: 36, w: 84, h: 8, style: "body" }),
        rule(8, 70, 50),
        text({ text: "Signature", x: 8, y: 74, w: 50, h: 5, style: "caption" }),
        rule(62, 70, 30),
        text({ text: "Date", x: 62, y: 74, w: 30, h: 5, style: "caption" }),
      ]),
  },

  /* ------------------------------------------------------------ spreads */
  {
    id: "spread-statement",
    name: "Spread — statement",
    family: "Spreads",
    note: "Two leaves: image across both, data panel on the left.",
    build: () =>
      page("Spread left", "cover", "fade", [
        image({ x: 0, y: 0, w: 100, h: 100 }),
        text({ text: "The land services group", x: 8, y: 30, w: 70, h: 8, style: "eyebrow", tone: "light" }),
        text({ text: "Residential transactions", x: 8, y: 38, w: 70, h: 16, style: "title", tone: "light" }),
        text({ text: "89", x: 8, y: 66, w: 24, h: 10, style: "stat", tone: "light" }),
        text({ text: "Total projects", x: 8, y: 78, w: 24, h: 5, style: "caption", tone: "light" }),
        text({ text: "$2.2B", x: 38, y: 66, w: 28, h: 10, style: "stat", tone: "light" }),
        text({ text: "Total value", x: 38, y: 78, w: 28, h: 5, style: "caption", tone: "light" }),
      ]),
    buildFacing: () =>
      page("Spread right", "cover", "fade", [
        image({ x: 0, y: 0, w: 100, h: 100 }),
        text({ text: "Continued across the fold", x: 30, y: 90, w: 66, h: 5, style: "caption", tone: "light", align: "right" }),
      ]),
  },
  {
    id: "spread-index",
    name: "Spread — index",
    family: "Spreads",
    note: "A contents list running over two leaves.",
    build: () =>
      page("Index left", "paper", "flip", [
        text({ text: "Contents", x: 8, y: 10, w: 50, h: 6, style: "eyebrow" }),
        text({ text: "The edition", x: 8, y: 16, w: 70, h: 12, style: "title" }),
        text({ text: "01 — Pools", x: 8, y: 38, w: 84, h: 6, style: "body" }),
        rule(8, 44, 84),
        text({ text: "02 — Spas", x: 8, y: 48, w: 84, h: 6, style: "body" }),
        rule(8, 54, 84),
        text({ text: "03 — Saunas", x: 8, y: 58, w: 84, h: 6, style: "body" }),
      ]),
    buildFacing: () =>
      page("Index right", "paper", "flip", [
        text({ text: "04 — Pavers", x: 8, y: 38, w: 84, h: 6, style: "body" }),
        rule(8, 44, 84),
        text({ text: "05 — Screen enclosures", x: 8, y: 48, w: 84, h: 6, style: "body" }),
        rule(8, 54, 84),
        text({ text: "06 — Fencing", x: 8, y: 58, w: 84, h: 6, style: "body" }),
        rule(8, 64, 84),
        text({ text: "07 — Landscaping", x: 8, y: 68, w: 84, h: 6, style: "body" }),
      ]),
  },
  {
    id: "spread-portfolio",
    name: "Spread — portfolio",
    family: "Spreads",
    note: "Six plates across the fold with one running caption.",
    build: () =>
      page("Portfolio left", "paper", "flip", [
        image({ x: 6, y: 12, w: 88, h: 38 }),
        image({ x: 6, y: 54, w: 42, h: 34 }),
        image({ x: 52, y: 54, w: 42, h: 34 }),
      ]),
    buildFacing: () =>
      page("Portfolio right", "paper", "flip", [
        image({ x: 6, y: 12, w: 42, h: 34 }),
        image({ x: 52, y: 12, w: 42, h: 34 }),
        image({ x: 6, y: 50, w: 88, h: 38 }),
        text({ text: "Six properties, one season", x: 6, y: 90, w: 88, h: 5, style: "caption", align: "right" }),
      ]),
  },
  {
    id: "spread-plate-copy",
    name: "Spread — plate & essay",
    family: "Spreads",
    note: "Full plate on the left leaf, the essay on the right.",
    build: () => page("Plate left", "cover", "fade", [image({ x: 0, y: 0, w: 100, h: 100 })]),
    buildFacing: () =>
      page("Essay right", "paper", "flip", [
        text({ text: "The property", x: 8, y: 14, w: 60, h: 6, style: "eyebrow" }),
        text({ text: "A courtyard in Naples", x: 8, y: 20, w: 80, h: 12, style: "subtitle" }),
        text({ text: "The essay runs down this leaf, facing the plate.", x: 8, y: 38, w: 80, h: 44, style: "body" }),
      ]),
  },
  {
    id: "spread-full-image",
    name: "Spread — full bleed",
    family: "Spreads",
    note: "One photograph carried across both leaves, caption at the foot.",
    build: () => page("Bleed left", "cover", "fade", [image({ x: 0, y: 0, w: 100, h: 100 })]),
    buildFacing: () =>
      page("Bleed right", "cover", "fade", [
        image({ x: 0, y: 0, w: 100, h: 100 }),
        text({ text: "Seen in place", x: 30, y: 90, w: 64, h: 5, style: "caption", tone: "light", align: "right" }),
      ]),
  },
  {
    id: "spread-price",
    name: "Spread — price sheet",
    family: "Spreads",
    note: "Specification on the left leaf, the order page on the right.",
    build: () =>
      page("Spec left", "paper", "flip", [
        text({ text: "Specification", x: 8, y: 12, w: 60, h: 6, style: "eyebrow" }),
        text({ text: "Shell, delivery, set and start-up", x: 8, y: 26, w: 84, h: 6, style: "body" }),
        rule(8, 32, 84),
        text({ text: "Deck, coping and waterline", x: 8, y: 36, w: 84, h: 6, style: "body" }),
        rule(8, 42, 84),
        text({ text: "Screen enclosure and fencing", x: 8, y: 46, w: 84, h: 6, style: "body" }),
      ]),
    buildFacing: () =>
      page("Order right", "paper", "flip", [
        text({ text: "Order", x: 8, y: 12, w: 60, h: 6, style: "eyebrow" }),
        text({ text: "Your estimate", x: 8, y: 20, w: 80, h: 10, style: "subtitle" }),
        text({
          text: "All prices include delivery, installation and the product as described.",
          x: 8,
          y: 84,
          w: 84,
          h: 8,
          style: "caption",
        }),
      ]),
  },

  /* ------------------------------------------------------------ widgets */
  {
    id: "widget-full",
    name: "Widget — full leaf",
    family: "Widgets",
    note: "One live Wonderlands widget filling the whole leaf.",
    build: () =>
      page("Widget", "paper", "fade", [
        widget({ widget: "site-board", x: 0, y: 0, w: 100, h: 100, scale: 0.52 }),
      ]),
  },
  {
    id: "widget-plate",
    name: "Widget & note",
    family: "Widgets",
    note: "Widget on the upper leaf with instructions beneath.",
    build: () =>
      page("Widget & note", "paper", "flip", [
        widget({ widget: "enclosure-board", x: 4, y: 8, w: 92, h: 58, scale: 0.5 }),
        text({ text: "Draw it", x: 4, y: 70, w: 60, h: 6, style: "eyebrow" }),
        text({
          text: "Trace the footprint on the board above; bays, doors and the takeoff follow as you draw.",
          x: 4,
          y: 78,
          w: 92,
          h: 16,
          style: "body",
        }),
      ]),
  },
  {
    id: "widget-duo",
    name: "Two widgets",
    family: "Widgets",
    note: "Two calculators stacked on one leaf.",
    build: () =>
      page("Two widgets", "paper", "flip", [
        widget({ widget: "inline-screen", x: 4, y: 8, w: 92, h: 40, scale: 0.7 }),
        widget({ widget: "inline-fence", x: 4, y: 54, w: 92, h: 40, scale: 0.7 }),
      ]),
  },
  {
    id: "widget-configurator",
    name: "Configurator leaf",
    family: "Widgets",
    note: "A full code-aware configurator, scrollable on the leaf.",
    build: () =>
      page("Configurator", "paper", "fade", [
        widget({ widget: "enclosure-config", x: 0, y: 0, w: 100, h: 100, scale: 0.55 }),
      ]),
  },
  {
    id: "widget-signature",
    name: "Signature leaf",
    family: "Widgets",
    note: "Order line with the Wonderlands electronic signature widget.",
    build: () =>
      page("Signature", "paper", "flip", [
        text({ text: "Authorisation", x: 8, y: 12, w: 60, h: 6, style: "eyebrow" }),
        text({ text: "Sign to proceed", x: 8, y: 20, w: 80, h: 10, style: "subtitle" }),
        widget({ widget: "signature", x: 8, y: 36, w: 84, h: 40, scale: 0.8 }),
      ]),
  },
  {
    id: "widget-spread",
    name: "Spread — board & options",
    family: "Spreads",
    note: "A live board across the left leaf, options and copy on the right.",
    build: () =>
      page("Board left", "paper", "fade", [
        widget({ widget: "site-board-pool", x: 0, y: 0, w: 100, h: 100, scale: 0.52 }),
      ]),
    buildFacing: () =>
      page("Options right", "paper", "flip", [
        text({ text: "Draw and price", x: 8, y: 12, w: 60, h: 6, style: "eyebrow" }),
        text({ text: "The plan, priced as drawn", x: 8, y: 20, w: 80, h: 12, style: "subtitle" }),
        text({
          text: "Every shape drawn on the facing board is measured and priced live. Add the options below to carry them into the estimate.",
          x: 8,
          y: 36,
          w: 84,
          h: 18,
          style: "body",
        }),
        widget({ widget: "features-pool", x: 8, y: 56, w: 84, h: 38, scale: 0.62 }),
      ]),
  },
  {
    id: "widget-search",
    name: "Search leaf",
    family: "Widgets",
    note: "The catalogue search surface printed on a leaf.",
    build: () =>
      page("Search", "paper", "flip", [
        text({ text: "Find anything", x: 8, y: 12, w: 60, h: 6, style: "eyebrow" }),
        widget({ widget: "search", x: 4, y: 24, w: 92, h: 60, scale: 0.62 }),
      ]),
  },
  {
    id: "widget-application",
    name: "Application leaf",
    family: "Widgets",
    note: "A whole Wonderlands application running on the leaf.",
    build: () =>
      page("Application", "paper", "fade", [
        widget({ widget: "app-studio", x: 0, y: 0, w: 100, h: 100, scale: 1 }),
      ]),
  },
  {
    id: "blank",
    name: "Blank",
    family: "Editorial",
    note: "An empty leaf — build it from nothing.",
    build: () => page("Blank", "paper", "flip", []),
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
