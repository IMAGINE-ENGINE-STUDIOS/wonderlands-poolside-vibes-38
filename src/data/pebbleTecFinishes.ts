/**
 * Pebble Tec® interior finish catalog.
 *
 * These are the pebble aggregate surfaces used on Wonderlands custom concrete
 * pools. Photography exists for the Mini Pebbles palette we stock; every other
 * colour is presented as a true aggregate swatch rather than a stand-in photo.
 *
 * Pricing is surface-area driven, so entries carry a price label instead of a
 * fixed number — the shell area decides the figure on the quote.
 */

export interface PebbleTecFinish {
  id: string;
  name: string;
  collection: "Pebble Tec" | "PebbleSheen" | "PebbleFina" | "PebbleBrilliance" | "Mini Pebbles";
  /** Aggregate swatch colour, used when no photograph exists */
  color: string;
  image?: string;
  note: string;
}

/** Pebble Tec is only offered on concrete shells. */
export const PEBBLE_TEC_POOL_TYPE = "concrete" as const;

export const pebbleTecFinishes: PebbleTecFinish[] = [
  /* Mini Pebbles — the Wonderlands house palette (photographed) */
  {
    id: "pt-mini-tahoe-blue",
    name: "Tahoe Blue",
    collection: "Mini Pebbles",
    color: "#2f5f86",
    image: "/images/finishes/wonderlands-tahoe-blue.webp",
    note: "Blue, beige and black aggregate — deep, quiet water",
  },
  {
    id: "pt-mini-tropics-blue",
    name: "Tropics Blue",
    collection: "Mini Pebbles",
    color: "#1f7fa8",
    image: "/images/finishes/wonderlands-tropics-blue.webp",
    note: "Vivid tropical blue with white and navy aggregate",
  },
  {
    id: "pt-mini-yosemite",
    name: "Yosemite",
    collection: "Mini Pebbles",
    color: "#27496b",
    image: "/images/finishes/wonderlands-yosemite.webp",
    note: "Granite-inspired blue with high-contrast accents",
  },
  {
    id: "pt-mini-aqua-white",
    name: "Aqua White",
    collection: "Mini Pebbles",
    color: "#8fc8cf",
    image: "/images/finishes/wonderlands-aqua-white.webp",
    note: "Aqua and white aggregate — spa-clear shallows",
  },
  {
    id: "pt-mini-marina-blue",
    name: "Marina Blue",
    collection: "Mini Pebbles",
    color: "#2b86b5",
    image: "/images/finishes/wonderlands-marina-blue.webp",
    note: "Azure with crystalline white aggregate",
  },
  {
    id: "pt-mini-midnight-blue",
    name: "Midnight Blue",
    collection: "Mini Pebbles",
    color: "#1b2c46",
    image: "/images/finishes/wonderlands-midnight-blue.webp",
    note: "Blue, beige and black — midnight water",
  },

  /* Pebble Tec® — the original exposed pebble surface */
  { id: "pt-classic-blue-granite", name: "Blue Granite", collection: "Pebble Tec", color: "#3b5f7d", note: "Original exposed pebble — classic blue water" },
  { id: "pt-classic-black-onyx", name: "Black Onyx", collection: "Pebble Tec", color: "#1a1d21", note: "Dark aggregate — mirrored, reflective surface" },
  { id: "pt-classic-blue-surf", name: "Blue Surf", collection: "Pebble Tec", color: "#2e6f93", note: "Mid blue pebble with white flecks" },
  { id: "pt-classic-tropical-breeze", name: "Tropical Breeze", collection: "Pebble Tec", color: "#4fa3a1", note: "Green-blue pebble — lagoon character" },
  { id: "pt-classic-white-pebble", name: "White Pebble", collection: "Pebble Tec", color: "#e6e2d8", note: "White aggregate — the brightest shallows" },
  { id: "pt-classic-tahoe-blue", name: "Tahoe Blue Classic", collection: "Pebble Tec", color: "#33607f", note: "Blended blue and stone aggregate" },

  /* PebbleSheen® — smaller pebble, smoother underfoot */
  { id: "pt-sheen-aqua-blue", name: "Aqua Blue", collection: "PebbleSheen", color: "#3f9bbd", note: "Polished small pebble — bright aqua" },
  { id: "pt-sheen-caribbean-blue", name: "Caribbean Blue", collection: "PebbleSheen", color: "#2a8fb0", note: "Caribbean clarity, smooth finish" },
  { id: "pt-sheen-french-gray", name: "French Gray", collection: "PebbleSheen", color: "#7d8489", note: "Cool gray aggregate — architectural water" },
  { id: "pt-sheen-blue-lagoon", name: "Blue Lagoon", collection: "PebbleSheen", color: "#256d92", note: "Deep lagoon blue with soft texture" },
  { id: "pt-sheen-tropical-teal", name: "Tropical Teal", collection: "PebbleSheen", color: "#2f8f8b", note: "Teal aggregate — warm resort water" },
  { id: "pt-sheen-sandy-beach", name: "Sandy Beach", collection: "PebbleSheen", color: "#d9c6a5", note: "Sand-toned pebble — beach entry shallows" },

  /* PebbleFina® — the finest aggregate, silk underfoot */
  { id: "pt-fina-arctic-white", name: "Arctic White", collection: "PebbleFina", color: "#eceae3", note: "Finest aggregate — silk underfoot, pale water" },
  { id: "pt-fina-atlantis-blue", name: "Atlantis Blue", collection: "PebbleFina", color: "#2b7ea6", note: "Fine blue aggregate — glassy surface" },
  { id: "pt-fina-graphite-gray", name: "Graphite Gray", collection: "PebbleFina", color: "#4b5157", note: "Graphite tone — dark, still water" },
  { id: "pt-fina-cool-caribbean", name: "Cool Caribbean", collection: "PebbleFina", color: "#3fa2b8", note: "Bright Caribbean tone, ultra smooth" },

  /* PebbleBrilliance® — aggregate with glass bead sparkle */
  { id: "pt-brilliance-blue-nile", name: "Blue Nile", collection: "PebbleBrilliance", color: "#2c6f9c", note: "Glass bead sparkle set in blue aggregate" },
  { id: "pt-brilliance-silver-mist", name: "Silver Mist", collection: "PebbleBrilliance", color: "#a7b1b8", note: "Silvered sparkle — light-catching surface" },
  { id: "pt-brilliance-emerald-isle", name: "Emerald Isle", collection: "PebbleBrilliance", color: "#2c7a5f", note: "Emerald aggregate with brilliance beads" },
  { id: "pt-brilliance-onyx-gleam", name: "Onyx Gleam", collection: "PebbleBrilliance", color: "#22262b", note: "Black aggregate with a starlit sparkle" },
];

export const PEBBLE_TEC_PRICE_LABEL = "Priced per shell surface area";

export const pebbleTecCollections = [
  "Mini Pebbles",
  "Pebble Tec",
  "PebbleSheen",
  "PebbleFina",
  "PebbleBrilliance",
] as const;
