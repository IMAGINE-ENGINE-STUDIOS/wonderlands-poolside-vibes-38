/**
 * Pebble Tec® interior finish catalog — the complete published range.
 *
 * Names, collections and photography mirror the official Pebble Tec finish
 * catalog (pebbletec.com/products/all-finishes). Swatch colours are sampled
 * from each official finish photograph so text-only layouts stay accurate.
 *
 * Pricing is surface-area driven, so entries carry a price label instead of a
 * fixed number — the shell area decides the figure on the quote.
 */

export interface PebbleTecFinish {
  id: string;
  name: string;
  collection:
    | "Pebble Tec"
    | "PebbleSheen"
    | "PebbleFina"
    | "PebbleBrilliance"
    | "PebbleQuartz"
    | "PebbleBreeze";
  /** Aggregate swatch colour, sampled from the official finish photograph */
  color: string;
  image?: string;
  note: string;
}

/** Pebble Tec is only offered on concrete shells. */
export const PEBBLE_TEC_POOL_TYPE = "concrete" as const;

export const pebbleTecFinishes: PebbleTecFinish[] = [

  /* Pebble Tec® — The original exposed pebble surface — durable, richly textured */
  { id: "pt-pebbletec-black-marble", name: "Black Marble", collection: "Pebble Tec", color: "#768386", image: "/images/finishes/pebbletec/pebbletec-black-marble.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-black-pearl", name: "Black Pearl", collection: "Pebble Tec", color: "#788688", image: "/images/finishes/pebbletec/pebbletec-black-pearl.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-midnight-blue", name: "Midnight Blue", collection: "Pebble Tec", color: "#7f949e", image: "/images/finishes/pebbletec/pebbletec-midnight-blue.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-emerald-bay", name: "Emerald Bay", collection: "Pebble Tec", color: "#7a9ba2", image: "/images/finishes/pebbletec/pebbletec-emerald-bay.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-tropical-breeze", name: "Tropical Breeze", collection: "Pebble Tec", color: "#7fb3c0", image: "/images/finishes/pebbletec/pebbletec-tropical-breeze.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-tahoe-blue", name: "Tahoe Blue", collection: "Pebble Tec", color: "#84b6c1", image: "/images/finishes/pebbletec/pebbletec-tahoe-blue.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-caribbean-blue", name: "Caribbean Blue", collection: "Pebble Tec", color: "#9ebfc2", image: "/images/finishes/pebbletec/pebbletec-caribbean-blue.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-blue-wave", name: "Blue Wave", collection: "Pebble Tec", color: "#90bdcc", image: "/images/finishes/pebbletec/pebbletec-blue-wave.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-blue-lagoon", name: "Blue Lagoon", collection: "Pebble Tec", color: "#8ac2cc", image: "/images/finishes/pebbletec/pebbletec-blue-lagoon.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-sandy-beach", name: "Sandy Beach", collection: "Pebble Tec", color: "#adbdb2", image: "/images/finishes/pebbletec/pebbletec-sandy-beach.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-creme-de-menthe", name: "Creme De Menthe", collection: "Pebble Tec", color: "#a3c6cc", image: "/images/finishes/pebbletec/pebbletec-creme-de-menthe.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-moonlight-grey", name: "Moonlight Grey", collection: "Pebble Tec", color: "#97bfc7", image: "/images/finishes/pebbletec/pebbletec-moonlight-grey.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-white-pearl", name: "White Pearl", collection: "Pebble Tec", color: "#9ed2d5", image: "/images/finishes/pebbletec/pebbletec-white-pearl.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-soft-white", name: "Soft White", collection: "Pebble Tec", color: "#9cd2d6", image: "/images/finishes/pebbletec/pebbletec-soft-white.webp", note: "The original exposed pebble surface — durable, richly textured" },
  { id: "pt-pebbletec-sky-blue", name: "Sky Blue", collection: "Pebble Tec", color: "#aad6e2", image: "/images/finishes/pebbletec/pebbletec-sky-blue.webp", note: "The original exposed pebble surface — durable, richly textured" },

  /* PebbleSheen® — Smaller pebble, polished smooth underfoot */
  { id: "pt-pebblesheen-black-eclipse", name: "Black Eclipse", collection: "PebbleSheen", color: "#929a9d", image: "/images/finishes/pebbletec/pebblesheen-black-eclipse.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-black-onyx", name: "Black Onyx", collection: "PebbleSheen", color: "#949ea1", image: "/images/finishes/pebbletec/pebblesheen-black-onyx.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-ocean-blue", name: "Ocean Blue", collection: "PebbleSheen", color: "#95a7ad", image: "/images/finishes/pebbletec/pebblesheen-ocean-blue.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-turtle-bay", name: "Turtle Bay", collection: "PebbleSheen", color: "#98aeb3", image: "/images/finishes/pebbletec/pebblesheen-turtle-bay.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-prism-blue", name: "Prism Blue", collection: "PebbleSheen", color: "#9dbbc2", image: "/images/finishes/pebbletec/pebblesheen-prism-blue.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-blue-granite", name: "Blue Granite", collection: "PebbleSheen", color: "#9ec4cb", image: "/images/finishes/pebbletec/pebblesheen-blue-granite.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-blue-surf", name: "Blue Surf", collection: "PebbleSheen", color: "#a2c0cb", image: "/images/finishes/pebbletec/pebblesheen-blue-surf.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-slate-blue", name: "Slate Blue", collection: "PebbleSheen", color: "#a6c3ca", image: "/images/finishes/pebbletec/pebblesheen-slate-blue.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-aqua-blue", name: "Aqua Blue", collection: "PebbleSheen", color: "#aacad7", image: "/images/finishes/pebbletec/pebblesheen-aqua-blue.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-bordeaux", name: "Bordeaux", collection: "PebbleSheen", color: "#afbfc3", image: "/images/finishes/pebbletec/pebblesheen-bordeaux.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-desert-gold", name: "Desert Gold", collection: "PebbleSheen", color: "#bec8be", image: "/images/finishes/pebbletec/pebblesheen-desert-gold.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-irish-mist", name: "Irish Mist", collection: "PebbleSheen", color: "#adccd0", image: "/images/finishes/pebbletec/pebblesheen-irish-mist.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-french-grey", name: "French Grey", collection: "PebbleSheen", color: "#aecad0", image: "/images/finishes/pebbletec/pebblesheen-french-grey.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-white-diamonds", name: "White Diamonds", collection: "PebbleSheen", color: "#bedfe2", image: "/images/finishes/pebbletec/pebblesheen-white-diamonds.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-cool-blue", name: "Cool Blue", collection: "PebbleSheen", color: "#c0e0ea", image: "/images/finishes/pebbletec/pebblesheen-cool-blue.webp", note: "Smaller pebble, polished smooth underfoot" },
  { id: "pt-pebblesheen-arctic-white", name: "Arctic White", collection: "PebbleSheen", color: "#cfe6f0", image: "/images/finishes/pebbletec/pebblesheen-arctic-white.webp", note: "Smaller pebble, polished smooth underfoot" },

  /* PebbleFina® — The finest aggregate — silk underfoot */
  { id: "pt-pebblefina-steel-grey", name: "Steel Grey", collection: "PebbleFina", color: "#87a8af", image: "/images/finishes/pebbletec/pebblefina-steel-grey.webp", note: "The finest aggregate — silk underfoot" },
  { id: "pt-pebblefina-grigio", name: "Grigio", collection: "PebbleFina", color: "#a2c3ca", image: "/images/finishes/pebbletec/pebblefina-grigio.webp", note: "The finest aggregate — silk underfoot" },
  { id: "pt-pebblefina-acquos", name: "Acquos", collection: "PebbleFina", color: "#aacfd8", image: "/images/finishes/pebbletec/pebblefina-acquos.webp", note: "The finest aggregate — silk underfoot" },
  { id: "pt-pebblefina-egyptian-sands", name: "Egyptian Sands", collection: "PebbleFina", color: "#b4c0b4", image: "/images/finishes/pebbletec/pebblefina-egyptian-sands.webp", note: "The finest aggregate — silk underfoot" },
  { id: "pt-pebblefina-fresca-verde", name: "Fresca Verde", collection: "PebbleFina", color: "#abcbc9", image: "/images/finishes/pebbletec/pebblefina-fresca-verde.webp", note: "The finest aggregate — silk underfoot" },
  { id: "pt-pebblefina-bella-blue", name: "Bella Blue", collection: "PebbleFina", color: "#a5d8e7", image: "/images/finishes/pebbletec/pebblefina-bella-blue.webp", note: "The finest aggregate — silk underfoot" },
  { id: "pt-pebblefina-cielo-blue", name: "Cielo Blue", collection: "PebbleFina", color: "#bfdee7", image: "/images/finishes/pebbletec/pebblefina-cielo-blue.webp", note: "The finest aggregate — silk underfoot" },
  { id: "pt-pebblefina-classico", name: "Classico", collection: "PebbleFina", color: "#cde3ea", image: "/images/finishes/pebbletec/pebblefina-classico.webp", note: "The finest aggregate — silk underfoot" },

  /* PebbleBrilliance® — Aggregate set with glass beads for light-catching sparkle */
  { id: "pt-pebblebrilliance-tropicana", name: "Tropicana", collection: "PebbleBrilliance", color: "#889ea8", image: "/images/finishes/pebbletec/pebblebrilliance-tropicana.webp", note: "Aggregate set with glass beads for light-catching sparkle" },
  { id: "pt-pebblebrilliance-majestic-sound", name: "Majestic Sound", collection: "PebbleBrilliance", color: "#84a7af", image: "/images/finishes/pebbletec/pebblebrilliance-majestic-sound.webp", note: "Aggregate set with glass beads for light-catching sparkle" },
  { id: "pt-pebblebrilliance-deep-cove", name: "Deep Cove", collection: "PebbleBrilliance", color: "#89b6cc", image: "/images/finishes/pebbletec/pebblebrilliance-deep-cove.webp", note: "Aggregate set with glass beads for light-catching sparkle" },
  { id: "pt-pebblebrilliance-clearwater", name: "Clearwater", collection: "PebbleBrilliance", color: "#84b6cd", image: "/images/finishes/pebbletec/pebblebrilliance-clearwater.webp", note: "Aggregate set with glass beads for light-catching sparkle" },
  { id: "pt-pebblebrilliance-shoreline", name: "Shoreline", collection: "PebbleBrilliance", color: "#a8bbb3", image: "/images/finishes/pebbletec/pebblebrilliance-shoreline.webp", note: "Aggregate set with glass beads for light-catching sparkle" },
  { id: "pt-pebblebrilliance-oasis", name: "Oasis", collection: "PebbleBrilliance", color: "#89c6cc", image: "/images/finishes/pebbletec/pebblebrilliance-oasis.webp", note: "Aggregate set with glass beads for light-catching sparkle" },
  { id: "pt-pebblebrilliance-sparkling-water", name: "Sparkling Water", collection: "PebbleBrilliance", color: "#8cc1d2", image: "/images/finishes/pebbletec/pebblebrilliance-sparkling-water.webp", note: "Aggregate set with glass beads for light-catching sparkle" },
  { id: "pt-pebblebrilliance-crystal-harbor", name: "Crystal Harbor", collection: "PebbleBrilliance", color: "#a7ced8", image: "/images/finishes/pebbletec/pebblebrilliance-crystal-harbor.webp", note: "Aggregate set with glass beads for light-catching sparkle" },
  { id: "pt-pebblebrilliance-aqua-falls", name: "Aqua Falls", collection: "PebbleBrilliance", color: "#97d3e5", image: "/images/finishes/pebbletec/pebblebrilliance-aqua-falls.webp", note: "Aggregate set with glass beads for light-catching sparkle" },
  { id: "pt-pebblebrilliance-vivid-shores", name: "Vivid Shores", collection: "PebbleBrilliance", color: "#a3d4e4", image: "/images/finishes/pebbletec/pebblebrilliance-vivid-shores.webp", note: "Aggregate set with glass beads for light-catching sparkle" },
  { id: "pt-pebblebrilliance-glacier-bay", name: "Glacier Bay", collection: "PebbleBrilliance", color: "#b8dbe5", image: "/images/finishes/pebbletec/pebblebrilliance-glacier-bay.webp", note: "Aggregate set with glass beads for light-catching sparkle" },

  /* PebbleQuartz® — Quartz aggregate — bright, colour-true water */
  { id: "pt-pebblequartz-white-classic", name: "White Classic", collection: "PebbleQuartz", color: "#daeaf0", image: "/images/finishes/pebbletec/pebblequartz-white-classic.webp", note: "Quartz aggregate — bright, colour-true water" },
  { id: "pt-pebblequartz-aquarius", name: "Aquarius", collection: "PebbleQuartz", color: "#b9d7dd", image: "/images/finishes/pebbletec/pebblequartz-aquarius.webp", note: "Quartz aggregate — bright, colour-true water" },
  { id: "pt-pebblequartz-baja-blue", name: "Baja Blue", collection: "PebbleQuartz", color: "#b5deec", image: "/images/finishes/pebbletec/pebblequartz-baja-blue.webp", note: "Quartz aggregate — bright, colour-true water" },
  { id: "pt-pebblequartz-coastal-grey", name: "Coastal Grey", collection: "PebbleQuartz", color: "#b2cbd1", image: "/images/finishes/pebbletec/pebblequartz-coastal-grey.webp", note: "Quartz aggregate — bright, colour-true water" },

  /* PebbleBreeze® — Light, airy aggregate blend for shallow, luminous water */
  { id: "pt-pebblebreeze-silver-sea", name: "Silver Sea", collection: "PebbleBreeze", color: "#adc8ce", image: "/images/finishes/pebbletec/pebblebreeze-silver-sea.webp", note: "Light, airy aggregate blend for shallow, luminous water" },
  { id: "pt-pebblebreeze-fresh-water", name: "Fresh Water", collection: "PebbleBreeze", color: "#a1d3e3", image: "/images/finishes/pebbletec/pebblebreeze-fresh-water.webp", note: "Light, airy aggregate blend for shallow, luminous water" },
  { id: "pt-pebblebreeze-gulf-shores", name: "Gulf Shores", collection: "PebbleBreeze", color: "#cee2e7", image: "/images/finishes/pebbletec/pebblebreeze-gulf-shores.webp", note: "Light, airy aggregate blend for shallow, luminous water" },
];

export const PEBBLE_TEC_PRICE_LABEL = "Priced per shell surface area";

export const pebbleTecCollections = [
  "Pebble Tec",
  "PebbleSheen",
  "PebbleFina",
  "PebbleBrilliance",
  "PebbleQuartz",
  "PebbleBreeze",
] as const;
