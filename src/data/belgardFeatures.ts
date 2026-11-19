/**
 * Belgard FEATURES — everything that is not purely a wall or purely a
 * deck: coping, steps, fire features and outdoor-kitchen kits, built
 * on the Belgard file page FIRST (founder order 2026-11-05 15:34 ET:
 * Belgard-first + logics updated in the same job). Studios and tools
 * pull from here only when the founder orders it.
 *
 * Faces are REAL Belgard faces, prepared with the same method as the
 * paver and wall libraries (whole published face -> gentle enhance ->
 * pre-built depth map registered in normalMaps.json). A product or
 * color with no published whole-face source ships with faceUrl null
 * and an honest note — no face is ever invented here.
 */

export interface BelgardFeatureVariant {
  name: string;
  /** Producing line for grouped variants (Unico colors are grouped by
   *  their Mirage paver family). */
  family?: string;
  faceUrl: string | null;
  /** Kit variants carry several real faces of the kit's unit, cycled
   *  across the assembled build so it never reads copy-paste. */
  faces?: string[];
  mean?: [number, number, number];
}

/** Assembled-kit composition, from Belgard's own kit sheets: the ring
 *  is built from the kit's real unit at its printed size and taper. */
export interface BelgardFeatureKit {
  shape: "ring" | "fireplace" | "island";
  /** Grill-island assemblies (Melville Series Grill Island): the
   *  kit's own row-by-row build from Belgard's installation guide
   *  BEL22-048 — ten 4-in brick rows in a pinwheel loop plus the
   *  3/4-in countertop row. Runs are listed in the guide's walking
   *  order: back left-to-right, right back-to-front, front
   *  right-to-left, left front-to-back. Segments are piece letters
   *  (lengths in pieceSizes; every brick is 10 in deep, 4 in thick)
   *  or an opening the row leaves ("GAP:<in>" storage / grill-head
   *  opening, "VENT:<in>" vent slot). */
  island?: {
    wIn: number;
    dIn: number;
    pieceSizes: Record<string, number>;
    rows: { back: string[]; right: string[]; front: string[]; left: string[] }[];
    countertop: {
      thickIn: number;
      overhangIn: number;
      kLenIn: number;
      lLenIn: number;
      cutoutWIn: number;
      cutoutDepthIn: number;
    };
  };
  /** Fireplace assemblies: overall box + firebox opening, coursed
   *  from the wall block at its printed size. */
  box?: {
    wIn: number;
    dIn: number;
    hIn: number;
    opening: { wIn: number; hIn: number; sillIn: number };
  };
  courses: number;
  /** Identical units per course (wedge kits). */
  perCourse?: number;
  /** Mixed-length kits: unit front lengths cycled along each course
   *  until the circle closes; the closing unit is cut to fit, as on
   *  site. When set, block.wIn is ignored. */
  coursePlan?: number[];
  /** Outside diameter of the assembled ring, inches. */
  odIn?: number;
  /** Square-kit plan (Coventry square form): the printed outside
   *  width of the square build, inches. The square is coursed from
   *  the same coursePlan lengths along its perimeter; corners take
   *  the system's printed corner unit. Belgard prints NO wall-block
   *  count for either Coventry form — counts are the plan's own,
   *  labeled as such wherever they surface. */
  squareIn?: number;
  /** Ring-kit cap course (Coventry): the kit's printed cap units
   *  standing on top of the wall courses — `pieces` identical arc
   *  segments closing the ring between the kit's printed outside
   *  diameter (odIn) and the cap ring's printed inside diameter
   *  (idIn); thickIn is the cap course's thickness. Round form
   *  only — the square plan does not read this field. */
  capRing?: { pieces: number; thickIn: number; idIn: number; label: string };
  block?: { wIn: number; hIn: number; dIn: number; backWIn: number };
  unitLabel: string;
}

export interface BelgardFeatureSize {
  label: string;
  wIn: number;
  dIn: number;
  hIn: number;
}

export interface BelgardFeature {
  product: string;
  slug: string;
  category: "Coping" | "Steps" | "Fireplaces & Fire Features" | "Outdoor Kitchen";
  kind: "unit" | "kit";
  /** How the unit is displayed: "cap" units lie flat (face on top);
   *  "block" units stand (face on the front). */
  display: "cap" | "block";
  blurb: string;
  source: string;
  sizes: BelgardFeatureSize[];
  variants: BelgardFeatureVariant[];
  /** Assembled composition for kind: "kit" entries. */
  kit?: BelgardFeatureKit;
  /** Kits Belgard publishes no assembled dimensions for: the kit's
   *  blocks are the named wall-library model's blocks (3D Wall tab),
   *  and the card presents those blocks — every size, real faces, and
   *  a coursed grid — until a verified dimension source lands
   *  (founder presentation order, 2026-11-06). */
  wallModelSlug?: string;
  /** Catalog colors Belgard lists but publishes no whole face for —
   *  shown in the tab as unfaced, never silently dropped. */
  unfacedColors?: string[];
  notes: string;
  /** Belgard's own product photo for entries without a 3D face yet. */
  photoUrl?: string;
}

export const BELGARD_FEATURES: BelgardFeature[] = [
  {
    product: "Unico 2.0",
    slug: "unico-2-0",
    category: "Coping",
    kind: "unit",
    display: "cap",
    blurb: "Porcelain coping / step unit (Mirage, 20mm) whose colors coordinate with the Glocal, Noon, Quarziti 2.0 and Travertini paver lines — the pool edge or step that matches the field.",
    source: "Belgard Coastal porcelain cut sheet BEL24-D-322250 (Unico 2.0 sheet) + belgardcommercial.com/products/unico/",
    sizes: [{ label: "11.62 x 23.54", wIn: 23.54, dIn: 11.62, hIn: 0.79 }],
    variants: [
    { name: "Daylight", family: "Noon", faceUrl: "/textures/belgard-features/unico-2-0--noon-daylight.png", mean: [173.89, 154.73, 136.07] },
    { name: "Ember", family: "Noon", faceUrl: "/textures/belgard-features/unico-2-0--noon-ember.png", mean: [143.71, 128.87, 114.28] },
    { name: "Honey", family: "Noon", faceUrl: "/textures/belgard-features/unico-2-0--noon-honey.png", mean: [101.69, 72.86, 53.18] },
    { name: "Absolute", family: "Glocal", faceUrl: "/textures/belgard-features/unico-2-0--glocal-absolute.png", mean: [57.8,63.81,63.81] },
    { name: "Chamois", family: "Glocal", faceUrl: "/textures/belgard-features/unico-2-0--glocal-chamois.png", mean: [162.66,150.77,136.35] },
    { name: "Classic", family: "Glocal", faceUrl: "/textures/belgard-features/unico-2-0--glocal-classic.png", mean: [95.43,96.43,90.43] },
    { name: "Clear", family: "Glocal", faceUrl: "/textures/belgard-features/unico-2-0--glocal-clear.png", mean: [220.08,217.43,211.89] },
    { name: "Ideal", family: "Glocal", faceUrl: "/textures/belgard-features/unico-2-0--glocal-ideal.png", mean: [136.79,136.79,124.86] },
    { name: "Perfect", family: "Glocal", faceUrl: "/textures/belgard-features/unico-2-0--glocal-perfect.png", mean: [172.77,172.77,164.77] },
    { name: "Type", family: "Glocal", faceUrl: "/textures/belgard-features/unico-2-0--glocal-type.png", mean: [135.45,125.75,111.67] },
    { name: "Light Cross", family: "Travertini", faceUrl: "/textures/belgard-features/unico-2-0--travertini-light-cross.png", mean: [204.02,191.16,172.51] },
    { name: "Misty Cross", family: "Travertini", faceUrl: "/textures/belgard-features/unico-2-0--travertini-misty-cross.png", mean: [213.01,209.07,198.58] },
    { name: "Pearly Cross", family: "Travertini", faceUrl: "/textures/belgard-features/unico-2-0--travertini-pearly-cross.png", mean: [235.69,232.17,222.26] },
    { name: "Rustic Cross", family: "Travertini", faceUrl: "/textures/belgard-features/unico-2-0--travertini-rustic-cross.png", mean: [193.1,181.04,154.81] },
    { name: "Glacier", family: "Quarziti 2.0", faceUrl: "/textures/belgard-features/unico-2-0--quarziti-20-glacier.png", mean: [197.78,197.53,190.06] },
    { name: "Mantle", family: "Quarziti 2.0", faceUrl: "/textures/belgard-features/unico-2-0--quarziti-20-mantle.png", mean: [85.63,87.31,84.46] },
    { name: "Mountains", family: "Quarziti 2.0", faceUrl: "/textures/belgard-features/unico-2-0--quarziti-20-mountains.png", mean: [188.83,183.76,164.52] },
    { name: "River", family: "Quarziti 2.0", faceUrl: "/textures/belgard-features/unico-2-0--quarziti-20-river.png", mean: [87.87,88.96,82.48] },
    { name: "Waterfall", family: "Quarziti 2.0", faceUrl: "/textures/belgard-features/unico-2-0--quarziti-20-waterfall.png", mean: [150.29,149.55,139.76] }
    ],
    notes: "Faces are true single-unit faces at the unit's own proportions: cut from the coordinating porcelain lines' published full-resolution fields (Glocal and Quarziti 2.0), from inside one tile where that field is a laid grid (Glocal Classic and Clear), from the cut sheet's labeled surface chips (Travertini colors), and — for the three Noon colors — from the manufacturer's published flat surface graphics for the line (Daylight from Permacon's published Noon Daylight surface photo; Ember and Honey from Mirage's published Noon surface graphics): one continuous surface at the unit's own proportions, never a laid field shown as if it were one unit, each with a pre-built depth map. Porcelain body: porcelain material branch (roughness 0.42). The sheet also lists a 12.99 x 23.54 size in national sources; the Florida Coastal sheet's unit is 11.62 x 23.54, which is what is built.",
  },
  {
    product: "Marina Coping",
    slug: "marina",
    category: "Coping",
    kind: "unit",
    display: "cap",
    blurb: "Smooth bullnose concrete coping for pools, steps, seat walls and outdoor kitchens.",
    source: "belgard.com/product/marina-coping/ + Coastal 2026 catalog (BEL25-D-577275) coping page",
    sizes: [{ label: "5 15/16 x 11 13/16", wIn: 11.8125, dIn: 5.9375, hIn: 2.375 }],
    variants: [
    { name: "Norvick Gray", faceUrl: "/textures/belgard-features/marina--norvick-gray.png", mean: [184.7, 182.02, 181.88] }
    ],
    unfacedColors: ["Midnight"],
    notes: "Face = Belgard's own published Norvick Gray swatch (flat smooth concrete), enlarged 2x, gently enhanced, pre-built depth map. Honed-coping material branch (roughness 0.82). Midnight is the color pictured in the 2026 Coastal catalog, but Belgard publishes no flat Midnight face — it is listed as unfaced rather than invented.",
  },
  {
    product: "Grava Coping",
    slug: "grava",
    category: "Coping",
    kind: "unit",
    display: "cap",
    blurb: "Large-format concrete coping with a natural slate texture — pools, steps, wall caps and fire-pit caps (DuraFusion).",
    source: "belgard.com/product/grava-coping/ + Grava cut sheet BEL25-D-562748 (specs) — marked Available Spring 2026",
    sizes: [{ label: "36 x 15", wIn: 36, dIn: 15, hIn: 2.375 }],
    variants: [
    { name: "Cheswick", faceUrl: "/textures/belgard-features/grava--cheswick.png", mean: [185.5, 180.71, 171.63] },
    { name: "Iron Bay", faceUrl: "/textures/belgard-features/grava--iron-bay.png", mean: [110.46, 104.59, 96.59] }
    ],
    unfacedColors: ["Ashwood", "Newport Gray", "Teak"],
    notes: "Faces are Belgard's own flat gallery fields for the two colors its product page pairs with a field in its own selector markup (Cheswick, Iron Bay), enlarged 2x, gently enhanced, pre-built depth maps; slate relief gets the deeper coping response in the material logic. The page publishes more fields than its markup can tie to a color with certainty, and the labeled cut sheet could not be retrieved — Ashwood, Newport Gray and Teak stay listed as unfaced until a labeled source is available. No field was assigned to a color by tone-guess.",
  },
  {
    product: "Fountainhead Coping",
    slug: "fountainhead",
    category: "Coping",
    kind: "unit",
    display: "cap",
    blurb: "Bullnose remodel coping with a rounded lip and a 4-inch drop for multilevel pool features — pools, steps and walls.",
    source: "belgard.com/product/fountainhead-coping/ + 2023 Coastal Collection (BEL22-D-33614) Coping Options table + 2021 Coastal catalog (BEL20-427)",
    sizes: [{ label: "4 x 9 x 1 3/16 | 4 inch drop", wIn: 9, dIn: 4, hIn: 1.1875 }],
    variants: [],
    unfacedColors: ["Amaretto", "Camel", "Charcoal", "Chestnut", "Cream", "Harvest Blend", "Malt", "Napoli", "Rio", "Slate", "Titanium"],
    photoUrl: "/textures/belgard-features/fountainhead-coping-unit.jpg",
    notes: "Belgard publishes this unit with an angled installed photo only (shown here) — no flat whole-face source exists in its page, catalog or cut-sheet library, so no 3D face is built yet; the unit ships with its printed size and Belgard's own photo rather than an invented texture. Belgard names eleven colors for the coping-options family this unit belongs to (2023 Coastal Collection Coping Options table; 2021 Coastal catalog Legacy coping spread) — all eleven are listed as unfaced. Belgard's current product page and the 2023 Coastal Collection print the unit 4 x 9 x 1 3/16 with a 4-inch drop, which is what is built; the 2021 Coastal catalog printed the same unit at 2 3/8 thick.",
  },
  {
    product: "Bullnose Coping",
    slug: "bullnose",
    category: "Coping",
    kind: "unit",
    display: "cap",
    blurb: "Heritage Coastal bullnose coping with a smooth surface and rounded edge — pools, steps and seat walls; small scale, ideal for freeform curves.",
    source: "belgard.com/product/bullnose-coping/ + 2023 Coastal Collection (BEL22-D-33614) Coping Options table + 2021 Coastal catalog (BEL20-427)",
    sizes: [{ label: "4 x 9 x 2 3/8", wIn: 9, dIn: 4, hIn: 2.375 }],
    variants: [],
    unfacedColors: ["Amaretto", "Camel", "Charcoal", "Chestnut", "Cream", "Harvest Blend", "Malt", "Napoli", "Rio", "Slate", "Titanium"],
    photoUrl: "/textures/belgard-features/bullnose-coping-unit.jpg",
    notes: "Belgard publishes this unit with an angled installed photo only (shown here) — no flat whole-face source exists in its page, catalog or cut-sheet library, so no 3D face is built yet; the unit ships with its printed size and Belgard's own photo rather than an invented texture. Belgard names eleven colors for the coping-options family this unit belongs to (2023 Coastal Collection Coping Options table; 2021 Coastal catalog Legacy coping spread) — all eleven are listed as unfaced. Heritage Coastal line: Bullnose Coping was superseded in Belgard's 2026 featured coping set (Marina, Modena, Grava, Delmaro), and its current Florida orderability is not established — Belgard's product page says availability varies by color and region.",
  },
  {
    product: "Oceanside Coping",
    slug: "oceanside",
    category: "Coping",
    kind: "unit",
    display: "cap",
    blurb: "Heritage Coastal coping in Belgard's Oceanside shell-aggregate finish — Bullnose profile and Seville drop profile, for pools, steps and seat walls.",
    source: "2021 Coastal catalog (BEL20-427), Oceanside Coping p.100 + Accessories pallet chart pp.116–117 (no live belgard.com product page — /product/oceanside-coping/ returns 404)",
    sizes: [
      { label: "4 x 9 x 2 3/8", wIn: 9, dIn: 4, hIn: 2.375 },
      { label: "4 x 9 x 2 3/8 | 2 1/2 inch drop", wIn: 9, dIn: 4, hIn: 2.375 },
    ],
    variants: [],
    unfacedColors: ["Cream", "Gray", "Malt", "White"],
    photoUrl: "/textures/belgard-features/oceanside-coping-unit.jpg",
    notes: "Belgard publishes this unit with an installed pool-edge photo only (shown here, from its own 2021 Coastal catalog page) — no flat whole-face source exists in its catalog or cut-sheet library, so no 3D face is built yet; the unit ships with its printed sizes and Belgard's own photo rather than an invented texture. Belgard names four colors for the Oceanside finish (Cream, Gray, Malt, White — printed on the Oceanside Coping page itself) — all four are listed as unfaced. Heritage Coastal line: Oceanside Coping is not in Belgard's 2026 featured coping set and has no current Belgard product page, and its current Florida orderability is not established — a dealer listing (paveroutlet.com) marks it 'Limited production', which is the dealer's wording, not Belgard's. Of the two printed sizes above, the pool tool's 3D band builds the plain bullnose form (the first size); the 2½-inch-drop form is recorded here exactly as Belgard prints it but is not yet built in 3D — a named remainder, not a dropped size.",
  },
  {
    product: "Modena Coping",
    slug: "modena",
    category: "Coping",
    kind: "unit",
    display: "cap",
    blurb: "Large-format coping with a smooth, architectural face and a graceful bullnose edge — pools, steps, walls and wall caps (DuraFusion).",
    source: "belgard.com/product/modena-coping/ + Modena cut sheets BEL25-D-562772 / BEL25-D-555950 (Jewell) — marked Available Spring 2026; faces carried from the harvested wall-library record (belgardWallBlocks 'modena-coping')",
    sizes: [{ label: "36 x 15", wIn: 36, dIn: 15, hIn: 2.375 }],
    variants: [
    { name: "Anthracite", faceUrl: "/app/wall-blocks/modena-coping/anthracite-lattice-1.jpg", mean: [88.16, 85.77, 83.17] },
    { name: "Hickory", faceUrl: "/app/wall-blocks/modena-coping/hickory-lattice-1.jpg", mean: [128.04, 116.15, 104.03] },
    { name: "Sepia", faceUrl: "/app/wall-blocks/modena-coping/sepia-lattice-1.jpg", mean: [175.7, 162.61, 141.25] }
    ],
    unfacedColors: ["Shaded Gray"],
    notes: "Faces are Belgard's own published fields for this unit, carried unchanged from the harvested wall-library record — the same fields the wall cap model wears, each with its pre-built depth map. Sepia is pictured by the first of its three harvested fields; the other two stay in the wall library. Belgard's Jewell cut sheet names four colors for the unit (Anthracite, Hickory, Sepia, Shaded Gray); Shaded Gray's fields could not be separated from Hickory's by the identity audit, so it is listed as unfaced rather than assigned a field by guess, and the audit's remaining unattributed fields stay in the wall library under that label. The Mid-Atlantic cut sheet (BEL25-D-542150) prints a wider regional color list (adding Cheswick, Cliffside, Iron Bay, Scandina Gray) — no fields are harvested under those names for this unit, so they are not listed. Orientation from the cut sheets' pallet table (54 ln ft/pallet; 3 units/layer; 6 layers): the 36-in side runs along the pool edge, the 15-in side across — at 15 in across the band is wider than the other copings', which is the product's real large-format size.",
  },
  {
    product: "Seville Coping",
    slug: "seville",
    category: "Coping",
    kind: "unit",
    display: "cap",
    blurb: "Scalloped bullnose remodel coping with a 2½-inch drop that laps the pool edge — pools, steps, planters and seat walls.",
    source: "belgard.com/product/seville-coping/ + Seville Coastal cut sheet BEL24-D-322250 (rev. 01/2025); faces carried from the harvested texture record (belgardTextures3d 'seville-coping')",
    sizes: [{ label: "4 x 9 x 1 3/16 | 2 1/2 inch drop", wIn: 9, dIn: 4, hIn: 1.1875 }],
    variants: [
    { name: "Amaretto", faceUrl: "/textures/belgard/seville-coping/amaretto/face.jpg", mean: [127.33, 113.0, 93.28] },
    { name: "Harvest Blend", faceUrl: "/textures/belgard/seville-coping/harvest-blend/face.jpg", mean: [101.41, 71.79, 53.99] },
    { name: "Cream", faceUrl: "/textures/belgard/seville-coping/cream/face.jpg", mean: [134.4, 125.43, 103.2] },
    { name: "Chestnut", faceUrl: "/textures/belgard/seville-coping/chestnut/face.jpg", mean: [103.49, 76.38, 52.11] },
    { name: "Napoli", faceUrl: "/textures/belgard/seville-coping/napoli/face.jpg", mean: [110.82, 101.33, 87.68] },
    { name: "Camel", faceUrl: "/textures/belgard/seville-coping/camel/face.jpg", mean: [98.28, 84.02, 67.3] },
    { name: "Malt", faceUrl: "/textures/belgard/seville-coping/malt/face.jpg", mean: [131.51, 113.48, 92.44] },
    { name: "Charcoal", faceUrl: "/textures/belgard/seville-coping/charcoal/face.jpg", mean: [60.82, 58.63, 52.29] },
    { name: "Rio", faceUrl: "/textures/belgard/seville-coping/rio/face.jpg", mean: [144.22, 130.34, 118.8] },
    { name: "Titanium", faceUrl: "/textures/belgard/seville-coping/titanium/face.jpg", mean: [139.74, 135.29, 133.74] }
    ],
    unfacedColors: ["Scandina Gray", "Slate"],
    notes: "Faces are Belgard's own published swatches for this unit, carried unchanged from the harvested texture record — the same faces the 3D texture set wears, each with its pre-built depth map. Belgard's current product page and Coastal cut sheet (BEL24-D-322250, rev. 01/2025) print the unit 4 x 9 x 1 3/16 with a 2 1/2-inch drop, which is what is built; the 2021 Coastal catalog printed the same unit at 2 3/8 thick (the figure the Media & Logic reference still carries from that catalog), and an earlier folder record misread the current sheet's fraction glyph as 1 13/16 — neither is built. Belgard names seven colors for Florida (Amaretto, Charcoal, Napoli, Rio, Scandina Gray, Slate, Titanium); Scandina Gray and Slate are published only as angled unit renders, so they are listed as unfaced rather than assigned a face. Orientation from Belgard's own cut sheet — its unit renders and installed photo show the unit's long axis along the run with the bullnose and drop leg on the long front edge, and its pallet weight (2,028 lb at 336 units) fits only that reading: the 9-in side runs along the pool edge, the 4-in side across.",
  },
  {
    product: "Landings Step",
    slug: "landings-step",
    category: "Steps",
    kind: "unit",
    display: "block",
    blurb: "Step unit with a quarried-limestone look for elevation changes, patios and entries.",
    source: "belgard.com/product/landings-step/ + Coastal 2026 catalog coping page (pictured in Midnight)",
    sizes: [{ label: "6 x 48 x 18", wIn: 48, dIn: 18, hIn: 6 }],
    variants: [
    { name: "Brown", faceUrl: null },
    ],
    unfacedColors: ["Midnight"],
    photoUrl: "/textures/belgard-features/landings-step-unit.jpg",
    notes: "Belgard publishes this unit as an angled product render only (shown here) — no flat whole-face source exists in its page, catalog or cut-sheet library, so no 3D face is built yet; the unit ships with its printed size and Belgard's own photo rather than an invented texture. Florida's pictured color is Midnight (Coastal 2026 catalog); the render's color is Brown.",
  },
  {
    product: "Melville Fire Pit",
    slug: "melville-fire-pit",
    category: "Fireplaces & Fire Features",
    kind: "kit",
    display: "block",
    blurb: "Round fire pit kit built from Melville Wall wedge blocks — 54 3/8 in outside diameter around a 34 in Elements smokeless wood insert or round gas burner (sold as kit options).",
    source: "Belgard Coastal Melville Kitchens & Fire cut sheet BEL24-D-322250 + belgard.com/product/melville-fire-pit/",
    sizes: [{ label: "54 3/8 round x 16 high", wIn: 54.375, dIn: 54.375, hIn: 16 }],
    kit: {
      shape: "ring",
      courses: 4,
      perCourse: 18,
      odIn: 54.375,
      block: { wIn: 9.5, hIn: 4, dIn: 10, backWIn: 6.0 },
      unitLabel: "Melville Wedge 4 x 9 1/2 x 10",
    },
    variants: [
    {
      name: "Anthracite",
      faceUrl: "/textures/belgard-features/melville-fire-pit--anthracite/variant-0.png",
      faces: ["/textures/belgard-features/melville-fire-pit--anthracite/variant-0.png", "/textures/belgard-features/melville-fire-pit--anthracite/variant-1.png", "/textures/belgard-features/melville-fire-pit--anthracite/variant-2.png", "/textures/belgard-features/melville-fire-pit--anthracite/variant-3.png", "/textures/belgard-features/melville-fire-pit--anthracite/variant-4.png"],
      mean: [92.05, 90.83, 87.8],
    },
    {
      name: "Napoli",
      faceUrl: "/textures/belgard-features/melville-fire-pit--napoli/variant-0.png",
      faces: ["/textures/belgard-features/melville-fire-pit--napoli/variant-0.png", "/textures/belgard-features/melville-fire-pit--napoli/variant-1.png", "/textures/belgard-features/melville-fire-pit--napoli/variant-2.png", "/textures/belgard-features/melville-fire-pit--napoli/variant-3.png", "/textures/belgard-features/melville-fire-pit--napoli/variant-4.png"],
      mean: [177.93, 168.92, 158.81],
    },
    {
      name: "Slate",
      faceUrl: "/textures/belgard-features/melville-fire-pit--slate/variant-0.png",
      faces: ["/textures/belgard-features/melville-fire-pit--slate/variant-0.png", "/textures/belgard-features/melville-fire-pit--slate/variant-1.png", "/textures/belgard-features/melville-fire-pit--slate/variant-2.png"],
      mean: [120.38, 121.25, 116.57],
    }
    ],
    notes: "Assembled as the kit builds: 18 wedge blocks per course (pi x 54.375 / 9.5 = 17.98) x 4 courses — Belgard's product page states the kit pallet holds the units to construct the pit 4 rows high (72 wedges); the sheet's hero photo shows a 3-course build, the kit as sold builds 4, half-step offset per course, each wedge tapered from its printed 9 1/2 in front to the 6.0 in back the ring geometry gives at the 34 3/8 in inside diameter — the 34 in Elements insert size the sheet specs. Faces are real blocks cut at the joints of the kit sheet's own labeled color chips (extraction order verified against the sheet by tone), enlarged and gently enhanced with pre-built depth maps; smooth-cast material branch. Caps are sold separately by Belgard and are not part of the kit build.",
  },
  {
    product: "Highland Stone Fire Pit",
    slug: "highland-stone-fire-pit",
    category: "Fireplaces & Fire Features",
    kind: "kit",
    display: "block",
    blurb: "Round fire pit kit built from Highland Stone wall units in mixed lengths — 63 in diameter, up to 5 courses high, with an 8-piece ring cap set.",
    source: "Belgard product page: belgard.com/product/highland-stone-fire-pit/ (kit contents and dimensions)",
    sizes: [{ label: "63 round x 24 high (4 courses shown; up to 5)", wIn: 63, dIn: 63, hIn: 24 }],
    kit: {
      shape: "ring",
      courses: 4,
      coursePlan: [18, 12, 6, 12],
      odIn: 63,
      block: { wIn: 12, hIn: 6, dIn: 9, backWIn: 8.57 },
      unitLabel: "Highland Stone 6 x 18 / 12 / 6 x 9",
    },
    variants: [
      {
        name: "Highland Stone",
        faceUrl: "/app/wall-blocks/highland-stone/d115cb1-0-0.jpg",
        faces: [
        "/app/wall-blocks/highland-stone/d115cb1-0-0.jpg",
        "/app/wall-blocks/highland-stone/d115cb1-1-0.jpg",
        "/app/wall-blocks/highland-stone/d115cb1-2-0.jpg",
        "/app/wall-blocks/highland-stone/d22cf75-1-1.jpg",
        "/app/wall-blocks/highland-stone/v22cf75-02.jpg",
        "/app/wall-blocks/highland-stone/v22cf75-03.jpg",
        "/app/wall-blocks/highland-stone/x22cf75-e0.jpg",
        "/app/wall-blocks/highland-stone/potomac-—-gms-mid-south-front-6x6x9-1.jpg",
        "/app/wall-blocks/highland-stone/potomac-—-gms-mid-south-front-6x6x9-2.jpg",
        "/app/wall-blocks/highland-stone/potomac-—-gms-mid-south-front-6x6x9-3.jpg",
        "/app/wall-blocks/highland-stone/carriage-house-front-6x6x9-1.jpg",
        "/app/wall-blocks/highland-stone/carriage-house-front-6x12x9-1.jpg",
        "/app/wall-blocks/highland-stone/savannah-—-gms-mid-south-front-6x6x9-1.jpg",
        "/app/wall-blocks/highland-stone/savannah-—-gms-mid-south-front-6x6x9-2.jpg",
        "/app/wall-blocks/highland-stone/savannah-—-gms-mid-south-front-6x6x9-3.jpg",
        "/app/wall-blocks/highland-stone/ashwood-—-mid-atlantic-front-6x18x9-1.jpg",
        "/app/wall-blocks/highland-stone/ashwood-—-mid-atlantic-front-6x18x9-2.jpg",
        "/app/wall-blocks/highland-stone/ashwood-—-mid-atlantic-front-6x6x9-1.jpg",
        "/app/wall-blocks/highland-stone/d59cad1-0-0.jpg",
        "/app/wall-blocks/highland-stone/d59cad1-2-0.jpg",
        "/app/wall-blocks/highland-stone/d6c58a1-0-0.jpg",
        "/app/wall-blocks/highland-stone/d6c58a1-2-0.jpg",
        "/app/wall-blocks/highland-stone/d6c7ddc-0-0.jpg",
        "/app/wall-blocks/highland-stone/d6c7ddc-2-0.jpg",
        "/app/wall-blocks/highland-stone/iron-bay-—-great-lakes-front-6x18x9-1.jpg",
        "/app/wall-blocks/highland-stone/iron-bay-—-great-lakes-front-6x6x9-1.jpg",
        "/app/wall-blocks/highland-stone/iron-bay-—-great-lakes-front-6x18x9-2.jpg",
        "/app/wall-blocks/highland-stone/d77971e-0-0.jpg",
        "/app/wall-blocks/highland-stone/d77971e-1-0.jpg",
        "/app/wall-blocks/highland-stone/d77971e-2-0.jpg",
        "/app/wall-blocks/highland-stone/misty-mountain-—-gms-mid-south-front-6x12x9-1.jpg",
        "/app/wall-blocks/highland-stone/da5e8a2-2-0.jpg",
        "/app/wall-blocks/highland-stone/va5e8a2-00.jpg",
        "/app/wall-blocks/highland-stone/va5e8a2-01.jpg",
        "/app/wall-blocks/highland-stone/daf2f38-1-0.jpg",
        "/app/wall-blocks/highland-stone/daf2f38-2-0.jpg",
        "/app/wall-blocks/highland-stone/dcb0e0e-0-0.jpg",
        "/app/wall-blocks/highland-stone/dcb0e0e-2-0.jpg",
        "/app/wall-blocks/highland-stone/sheffield-front-6x6x9-1.jpg",
        "/app/wall-blocks/highland-stone/de9182a-1-0.jpg",
        "/app/wall-blocks/highland-stone/v3db831-00.jpg",
        "/app/wall-blocks/highland-stone/vaef46e-03.jpg",
        "/app/wall-blocks/highland-stone/vaef46e-04.jpg",
        "/app/wall-blocks/highland-stone/xaef46e-e0.jpg"
        ],
      },
    ],
    notes: "Assembled as the kit builds: Highland Stone units (6 in high x 9 in deep, lengths 18 / 12 / 6) coursed around the printed 63 in outside diameter, each unit tapered by the ring geometry and the closing unit of each course cut to the remaining arc, as on site. Faces are this system's own Highland Stone wall faces — the kit is built from the same units; Belgard lists the kit colors incl. Ashwood and Iron Bay. The kit's 8-piece ring cap set (66 x 12 x 2 1/8) is not modeled in this build.",
  },
  {
    product: "Coventry Fire Pit",
    slug: "coventry-fire-pit",
    wallModelSlug: "coventry-wall-iii",
    category: "Fireplaces & Fire Features",
    kind: "kit",
    display: "block",
    blurb: "Fire pit kit built from Coventry Wall III tapered units — round or square — with bluestone caps, a copper wood-burning bowl, grate, poker and mesh dome cover.",
    source: "Belgard product page: belgard.com/product/coventry-fire-pit/ + Coventry Fire Pit Kit cut sheet BEL24-D-322219 (© 2025 Oldcastle APG, Metro, rev. 01/2025; deposited 2026-11-11)",
    sizes: [
      { label: "48 round x 23 high", wIn: 48, dIn: 30.5, hIn: 23 },
      { label: "50 x 50 square x 20 high", wIn: 50, dIn: 50, hIn: 20 },
    ],
    kit: {
      shape: "ring",
      courses: 4,
      coursePlan: [16, 10, 8],
      odIn: 48,
      squareIn: 50,
      capRing: { pieces: 4, thickIn: 3, idIn: 30.5, label: "Bluestone cap unit" },
      block: { wIn: 16, hIn: 6, dIn: 10, backWIn: 14 },
      unitLabel: "Coventry Wall III 6 x 16 / 14 x 10",
    },
    variants: [{ name: "Coventry Wall III units", faceUrl: "/app/wall-blocks/coventry-wall-iii/xb81161-e0.jpg", faces: [
      "/app/wall-blocks/coventry-wall-iii/xb81161-e0.jpg",
      "/app/wall-blocks/coventry-wall-iii/dakota-blend-front-6x10x10-2.jpg",
      "/app/wall-blocks/coventry-wall-iii/dakota-blend-front-6x10x10-3.jpg",
      "/app/wall-blocks/coventry-wall-iii/dakota-blend-front-6x8x10-1.jpg",
      "/app/wall-blocks/coventry-wall-iii/dakota-blend-front-6x8x10-2.jpg",
      "/app/wall-blocks/coventry-wall-iii/dakota-blend-front-6x10x10-1.jpg",
      "/app/wall-blocks/coventry-wall-iii/pewter-blend-front-6x10x10-1.jpg",
      "/app/wall-blocks/coventry-wall-iii/xe89daf-e0.jpg",
    ] }],
    photoUrl: "/media/belgard-folder/coventry-fire-pit/01.jpg",
    notes: "Assembled as the kit builds (census §7, 2026-11-09; cut sheet BEL24-D-322219 deposited 2026-11-11): printed Round 48 in outside diameter × 30.5 in inside diameter × 23 high, Square 50 × 50 × 20, from wedge-shaped Coventry Wall III units (6 in high × 10 in deep, published lengths 16/10/8 cycled along the course; Belgard prints NO wall-block count — every count is the plan's own, never Belgard's). Courses stand at 4: Belgard's own cut-sheet photographs count 4 courses of the 6-in unit under the caps. THE CAPS STAND (2026-11-11): the kit's FOUR printed bluestone cap units ('chiseled edge with a smooth top') close the ring on top of the wall courses — quarter-annulus segments between the printed diameters (radial depth (48 − 30.5)/2 = 8.75 in, derived from the printed pair; thickness 3 in is the plan's read — Belgard prints NO cap dimension). The caps carry NO face: no flat Belgard bluestone face exists in any record or on the cut sheet (its photographs are scenes) — plain material, the gap stated, never a borrowed or perspective-distorted cut. Height disagreement, flagged not averaged: the sheet prints '23 in high including cap', which Belgard's own 6-in unit across the photographed 4 courses plus the cap course (≈27 in as built) cannot compose; the printed total stands here beside the built one, unresolved in Belgard's own documents. The SQUARE form's caps are not modeled — no source we hold pictures or dimensions the square form's cap layout. Kit equipment per the cut sheet (34 in copper bowl, 24 in wood-burning grate, 36 in cooking grate, poker, retractable mesh dome) is equipment, not blocks, and is not modeled. Faces are this system's own Coventry Wall III wall faces (Fields 1–4) — the kit is built from the same units.",
  },
  {
    product: "Melville Series Fireplace",
    slug: "melville-series-fireplace",
    category: "Fireplaces & Fire Features",
    kind: "kit",
    display: "block",
    blurb: "Full outdoor fireplace from the Melville Series — built from Melville Wall blocks and caps, 4 ft 3 in wide x 2 ft 7 in deep x 7 ft 8 in high.",
    source: "Belgard Coastal catalog C26 (Melville Series) + Melville Wall cut sheet BEL24-D-322250; the series sheet is not published online",
    sizes: [{ label: "4'3\" W x 2'7\" D x 7'8\" H", wIn: 51, dIn: 31, hIn: 92 }],
    kit: {
      shape: "fireplace",
      courses: 23,
      box: { wIn: 51, dIn: 31, hIn: 92, opening: { wIn: 24, hIn: 28, sillIn: 8 } },
      block: { wIn: 20, hIn: 4, dIn: 10, backWIn: 20 },
      unitLabel: "Melville Wall Block 4 x 20 x 10",
    },
    variants: [
      {
        // REBUILT 2026-11-11 (recovery-pass remediation, chair's
        // order): PROVEN-Melville sources only. The previous
        // 65-face list was traced through the harvest manifests and
        // indicted — 26 of its faces were cut from WESTON-system
        // swatches (they are Weston faces, re-credited to Weston;
        // the old representative face v00fb36 was one of them), 2
        // were Amber Beige (a library colour this unit is not sold
        // in — they stay library faces, out of this kit's sets),
        // 23 came from unnamed sources and 12 were unmapped (all
        // removed; any returns only with its proof). What proven
        // sources yield for the colours this unit is SOLD in:
        name: "Scandina Gray",
        faceUrl: "/app/wall-blocks/melville-wall/v28efaa-00.jpg",
        faces: [
          // 2 field cuts from Belgard's own Scandina Gray Melville
          // swatch (508_Scandina_Gray_CM_Melville_Wall_Swatch_Web,
          // harvest manifest) + the BEL25 catalog chip cut for the
          // same colour (pilot path, BEL25-p2-ScandinaGray).
          "/app/wall-blocks/melville-wall/v28efaa-00.jpg",
          "/app/wall-blocks/melville-wall/v28efaa-01.jpg",
          "/app/wall-blocks/melville-wall/scandina-gray-front-4x20x10-1.jpg",
        ],
      },
      {
        // Midnight: NO proven face exists anywhere in the harvest
        // (no Midnight source in any manifest). The empty set is
        // the honest state — the gap is stated, never filled with
        // another colour's faces.
        name: "Midnight",
        faceUrl: null,
        faces: [],
      },
    ],
    notes: "Assembled from Melville Wall blocks (4 x 20 x 10) at their printed size: perimeter walls one block deep in running bond with a centered firebox opening, closing pieces cut to the run as on site. Overall dimensions are Belgard's printed Series dimensions; the internal coursing layout follows the block module (Belgard does not publish the Series cut sheet online). Series colors: Scandina Gray and Midnight — block faces are this system's own Melville Wall faces. Fireplace grate/insert not included in the block build. Count status (FP-R13, carried on the record 2026-11-10): the assembled build's 227 pieces and its 24 x 28 PORTRAIT opening at sill 8 are OUR DERIVATION — module arithmetic over the printed 51 x 31 x 92 — not Belgard figures; Belgard publishes neither a count nor an opening for this pre-assembled unit, and its labeled Coastal 2026 scene shows a wider, landscape opening under one wide lintel. The identity caveat stands unresolved on the FP-REVIEW register. Face pool status (2026-11-11 remediation): the variant face sets were rebuilt from proven-Melville sources only — Scandina Gray carries 3 proven faces, Midnight none (no proven Midnight face exists anywhere in the harvest); the earlier 65-face list was traced through the harvest manifests to mixed sources and removed (26 Weston-system cuts re-credited to Weston, 2 Amber Beige kept as library faces only, 35 unproven removed).",
  },
  {
    product: "Melville Series Linear Fireplace",
    slug: "melville-series-linear-fireplace",
    wallModelSlug: "melville-wall",
    category: "Fireplaces & Fire Features",
    kind: "kit",
    display: "block",
    blurb: "Linear fireplace from the Melville Series — pre-assembled modular unit; fireplaces can be retro-fitted for gas burning log sets and burners. Colors: Scandina Gray, Midnight.",
    source: "Belgard Melville Series cut sheet BEL24-D-322250 (Coastal, Rev. 01/2025), SHAPES & SIZES",
    sizes: [{ label: "3'6-1/2\"D x 7'8\"W x 4'5-1/4\"H (assembled unit, per the cut sheet)", wIn: 92, dIn: 42.5, hIn: 53.25 }],
    kit: {
      shape: "fireplace",
      courses: 13,
      box: { wIn: 92, dIn: 42.5, hIn: 53.25, opening: { wIn: 52, hIn: 24, sillIn: 20 } },
      block: { wIn: 20, hIn: 4, dIn: 10, backWIn: 20 },
      unitLabel: "Melville Wall Block 4 x 20 x 10",
    },
    variants: [{ name: "Melville Wall units", faceUrl: null }],
    notes: "Overall dimensions are the cut sheet's printed figures (pallet weight 4,000). The 2021 catalog (BEL20 p.90) prints this unit's width and height swapped (4'5-1/4\"W x 7'8\"H) — a superseded printing; the 2025 cut sheet governs. Companion Wood Boxes are printed on the same sheet at 2'1-1/4\"D x 3'3\"W x 3'1\"H each, sold as a pair. Belgard publishes no firebox opening or internal coursing for this pre-assembled unit. Belgard's note on the sheet: check with your local municipality for any codes that may affect your installation. Kit contract (2026-11-11): the assembled-build contract stands on this record — box from the cut sheet's printed overall, coursed from the Melville Wall block (13 courses; built height 52 against the printed 53.25 — the FP-R2 residual, whose cap-course arithmetic is a separate open item). THE OPENING IS OUR DERIVATION, never presented as published: its figures (52 wide × 24 high at a 20-in sill) are read two agreeing ways — Belgard's own product photograph (side piers one block wide, the opening spanning the middle) and the block module's arithmetic over the printed box (92 − 2 × 20 = 52; five base courses + six opening courses inside the thirteen). The assembled build dresses plain until a proven face set lands for this record — its variant carries none.",
  },
  {
    product: "Melville Series Linear Fire Table",
    slug: "melville-series-linear-fire-table",
    wallModelSlug: "melville-wall",
    category: "Fireplaces & Fire Features",
    kind: "kit",
    display: "block",
    blurb: "Linear fire table from the Melville Series — a fire table (not a fireplace). Colors: Scandina Gray, Midnight.",
    source: "Belgard Melville Series cut sheet BEL24-D-322250 (Coastal, Rev. 01/2025), SHAPES & SIZES",
    sizes: [{ label: "2'11\"D x 6'2\"W x 2'5\"H (assembled unit, per the cut sheet)", wIn: 74, dIn: 35, hIn: 29 }],
    variants: [{ name: "Melville Wall units", faceUrl: null }],
    notes: "This unit is a fire table, not a fireplace, and is labeled as one everywhere. Overall dimensions are the cut sheet's printed figures (pallet weight 2,500). Belgard publishes no firebox or burner dimensions for this unit, so none is recorded here. Kit contract (2026-11-11): NONE, stated as a gap — the kit contract's fireplace shape builds a front-opening box, and this unit's fire is a top trough; forcing that shape would misrepresent the product. The table's assembled build lives in the studio's layout path, which models the trough; a table-shaped kit contract is a named contract gap, not an oversight.",
  },
  {
    product: "Melville Series Grill Island",
    slug: "melville-series-grill-island",
    wallModelSlug: "melville-wall",
    category: "Outdoor Kitchen",
    kind: "kit",
    display: "block",
    blurb: "Grill island from the Melville Series, built from Melville Wall blocks and caps. Colors: Scandina Gray, Midnight. Grill & doors included (sheet).",
    source: "Melville Series cut sheet BEL24-D-322250 (Coastal, Rev. 01/2025), deposited copy ~/workspace/fireplaces/sources/melville-series-cutsheet-BEL24-D-322250.pdf — SHAPES & SIZES; assembled build from Belgard's Melville Wall Installation Guide — Grill Island, BEL22-048 (© 2022 Oldcastle APG), deposited copy ~/workspace/fireplaces/sources/melville-grill-island-install-guide-BEL22-048.pdf — BLOCK MATRIX + step diagrams",
    sizes: [{ label: "2'6\" D x 5'11\" W x 3'5\" H", wIn: 71, dIn: 30, hIn: 41 }],
    kit: {
      shape: "island",
      courses: 11,
      block: { wIn: 20, hIn: 4, dIn: 10, backWIn: 20 },
      unitLabel: "Melville Wall",
      island: {
        wIn: 70,
        dIn: 33,
        pieceSizes: { A: 20, B: 19.5, C: 15.5, D: 11.5, E: 10, F: 9.5, G: 5.5, H: 4.5, J: 3 },
        rows: [
          { back: ["A", "A", "A"], right: ["J", "A"], front: ["A", "A", "A"], left: ["J", "A"] },
          { back: ["C", "VENT:8", "D", "D", "VENT:8", "G"], right: ["A", "J"], front: ["A", "A", "A"], left: ["J", "A"] },
          { back: ["A", "A", "A"], right: ["J", "A"], front: ["E", "GAP:30", "A"], left: ["J", "A"] },
          { back: ["A", "A", "A"], right: ["A", "J"], front: ["A", "GAP:30", "E"], left: ["A", "J"] },
          { back: ["A", "A", "A"], right: ["J", "A"], front: ["E", "GAP:30", "A"], left: ["J", "A"] },
          { back: ["A", "A", "A"], right: ["A", "J"], front: ["A", "GAP:30", "E"], left: ["A", "J"] },
          { back: ["A", "A", "A"], right: ["J", "A"], front: ["E", "GAP:30", "A"], left: ["J", "A"] },
          { back: ["A", "A", "A"], right: ["A", "J"], front: ["C", "A", "A", "H"], left: ["A", "J"] },
          { back: ["A", "A", "A"], right: ["A", "J"], front: ["F", "GAP:31", "B"], left: ["J", "A"] },
          { back: ["A", "A", "A"], right: ["A", "J"], front: ["B", "GAP:31", "F"], left: ["A", "J"] },
        ],
        countertop: { thickIn: 0.75, overhangIn: 1.375, kLenIn: 35.75, lLenIn: 31, cutoutWIn: 31, cutoutDepthIn: 22.875 },
      },
    },
    variants: [
      {
        // REBUILT 2026-11-11 (recovery-pass remediation, chair's
        // order — the same remediation the fireplace kit received
        // in fd79b24): PROVEN-Melville sources only. The previous
        // 65-face list was traced through the harvest manifests and
        // indicted — 26 of its faces were cut from WESTON-system
        // swatches (they are Weston faces, re-credited to Weston;
        // the old representative face v00fb36 was one of them), 2
        // were Amber Beige (a library colour this unit is not sold
        // in — they stay library faces, out of this kit's sets),
        // 23 came from unnamed sources and 12 were unmapped (all
        // removed; any returns only with its proof). What proven
        // sources yield for the colours this unit is SOLD in:
        name: "Scandina Gray",
        faceUrl: "/app/wall-blocks/melville-wall/v28efaa-00.jpg",
        faces: [
          // 2 field cuts from Belgard's own Scandina Gray Melville
          // swatch (508_Scandina_Gray_CM_Melville_Wall_Swatch_Web,
          // harvest manifest) + the BEL25 catalog chip cut for the
          // same colour (pilot path, BEL25-p2-ScandinaGray).
          "/app/wall-blocks/melville-wall/v28efaa-00.jpg",
          "/app/wall-blocks/melville-wall/v28efaa-01.jpg",
          "/app/wall-blocks/melville-wall/scandina-gray-front-4x20x10-1.jpg",
        ],
      },
      {
        // Midnight: NO proven face exists anywhere in the harvest
        // (no Midnight source in any manifest). The empty set is
        // the honest state — the gap is stated, never filled with
        // another colour's faces.
        name: "Midnight",
        faceUrl: null,
        faces: [],
      },
    ],
    notes: "PUBLISHED dims (verified 2026-11-06 from the deposited Series cut sheet BEL24-D-322250): 2'6\"D x 5'11\"W x 3'5\"H, grill & doors included, pallet weight 3,260. ASSEMBLED BUILD (added 2026-11-09): Belgard's own installation guide for this kit (BEL22-048) decomposes it row by row — BLOCK MATRIX plus step diagrams — and the assembled view builds exactly that: ten 4-in brick rows in the guide's pinwheel layouts (back vent slots at row 2, storage opening in the front on rows 3-7, the bonded beam course closing it at row 8, grill head opening on rows 9-10) plus the 3/4-in countertop row (K and L pieces, 1-3/8-in overhang on all sides, grill cutout). Belgard's two documents round differently, recorded openly rather than absorbed: the guide's stack is 40-3/4 in against the sheet's printed 3'5\" (41 in) overall height, and the guide's step diagrams draw the body 70 x 33 in against the sheet's printed 5'11\" x 2'6\" (71 x 30 in) footprint — the assembled build follows the guide, the build document; the printed size above stays the sheet's. The island's openings therefore TRACE to BEL22-048's layer diagrams, superseding this record's earlier 'no internal coursing layout' statement (and the kitchens Job B audit's no-sheet statement for this element). Face pool status (2026-11-11 remediation): the variant face sets were rebuilt from proven-Melville sources only — Scandina Gray carries 3 proven faces, Midnight none (no proven Midnight face exists anywhere in the harvest); the earlier 65-face list was traced through the harvest manifests to mixed sources and removed (26 Weston-system cuts re-credited to Weston, 2 Amber Beige kept as library faces only, 35 unproven removed).",
  },
  {
    product: "Weston Stone Fire Pit",
    slug: "weston-stone-fire-pit",
    wallModelSlug: "weston-stone",
    category: "Fireplaces & Fire Features",
    kind: "kit",
    display: "block",
    blurb: "Round fire pit kit built from Weston Stone wall units (4 x 12 x 8 and the 2-piece combo) — the full kit ships on one pallet; the steel fire ring is included.",
    source: "Belgard product page: belgard.com/product/weston-stone-fire-pit/ + Weston Stone Fire Pit Installation Guide (estimating chart; FP-REVIEW deposit, 2026-11-09)",
    sizes: [{ label: "55\" OD x 16\" H (install guide estimating chart)", wIn: 55, dIn: 55, hIn: 16 }],
    variants: [
      {
        name: "Amaretto",
        faceUrl: "/app/wall-blocks/weston-stone/c551fc1-0.jpg",
        faces: [
          "/app/wall-blocks/weston-stone/c551fc1-0.jpg",
          "/app/wall-blocks/weston-stone/621a634-2.jpg",
          "/app/wall-blocks/weston-stone/606ab9f-4.jpg",
          "/app/wall-blocks/weston-stone/208df44-5.jpg",
          "/app/wall-blocks/weston-stone/0141033-1.jpg",
          "/app/wall-blocks/weston-stone/7056dfb-3.jpg",
        ],
      },
      {
        name: "Rainier",
        faceUrl: "/app/wall-blocks/weston-stone/9bd92ed-5.jpg",
        faces: [
          "/app/wall-blocks/weston-stone/9bd92ed-5.jpg",
          "/app/wall-blocks/weston-stone/d415rai-1-0.jpg",
          "/app/wall-blocks/weston-stone/a25aba0-0.jpg",
          "/app/wall-blocks/weston-stone/f681a58-4.jpg",
        ],
      },
      {
        name: "Magnolia",
        faceUrl: "/app/wall-blocks/weston-stone/d8100fb-0.jpg",
        faces: [
          "/app/wall-blocks/weston-stone/d8100fb-0.jpg",
          "/app/wall-blocks/weston-stone/75a0380-1.jpg",
          "/app/wall-blocks/weston-stone/f325302-6.jpg",
        ],
      },
      {
        name: "Pearl",
        faceUrl: "/app/wall-blocks/weston-stone/d10snc-1-0.jpg",
        faces: [
          "/app/wall-blocks/weston-stone/1194f27-2.jpg",
          "/app/wall-blocks/weston-stone/453d786-5.jpg",
          "/app/wall-blocks/weston-stone/d10snc-1-0.jpg",
          "/app/wall-blocks/weston-stone/b7c6a1e-0.jpg",
          "/app/wall-blocks/weston-stone/9088918-1.jpg",
          "/app/wall-blocks/weston-stone/5cd401c-6.jpg",
          "/app/wall-blocks/weston-stone/ec4bc4f-7.jpg",
          "/app/wall-blocks/weston-stone/80b43b6-23.jpg",
          "/app/wall-blocks/weston-stone/39608ba-24.jpg",
          "/app/wall-blocks/weston-stone/47e75f9-25.jpg",
          "/app/wall-blocks/weston-stone/488e217-26.jpg",
        ],
      },
    ],
    notes: "Assembled dimensions from the kit's own install guide estimating chart (FP-R5 record, corrected 2026-11-10 — this record previously denied Belgard publishes them): 55 in outside diameter x 16 in high; the chart's sequence is 8 Large + 10 Small units per course x 4 courses = 72 units, derived from the printed chart. The steel fire ring is INCLUDED in this kit; the 'gas insert sold separately' line that stood here before belonged to the Melville pit's rule, not this kit's. The kit's units are the Weston Stone blocks now in the 3D Wall tab (85 faces across its seven colours); the assembled build (FP-R5) sequences after the FP-R record fixes. Face set (recovery pass, 2026-11-11): this record's variants now carry the kit's faces ASSIGNED PER SHEET COLOUR from the Weston library pool, counted — Amaretto 6 (4 Large-class + 2 Small-class), Rainier 4 (2 + 2), Magnolia 3 (3 Large; NO Small-class face exists in the pool for Magnolia), Pearl 11 (3 Large + 8 Small — its Small class landed with the face-depth recovery splice 4565e75 and was filed onto this record 2026-11-11). Provenance: the harvest manifest maps the v-cut faces to their named colour sources and the direct cuts carry their swatch names in their filenames — colour-true. The library's other three colours (Rainier Untumbled 21, Brown Beige Charcoal 34, Cream Tan Brown 6) are deep library sets outside the kit's named colours, not assigned to this kit. A build in Magnolia has no Small-unit faces to draw — stated, not filled.",
  },
  {
    product: "Weston Stone Traditional Fireplace",
    slug: "weston-stone-traditional-fireplace",
    wallModelSlug: "weston-stone",
    category: "Fireplaces & Fire Features",
    kind: "kit",
    display: "block",
    blurb: "Traditional fireplace kit built from Weston Stone wall units — tumbled cut-stone look, arched firebox opening, site-built course by course from the kit's own blocks and fire bricks. Burns solid wood, plumbed propane or natural gas.",
    source: "Belgard product page belgard.com/product/weston-stone-traditional-fireplace/ (overall dimensions) + Installation Manual BEL25-D-422601 (Rev. 04/2025; kit composition, base, coursing)",
    sizes: [{ label: "4'4\"D x 5'W x 8'4\"H (assembled, per the product page; pallet weight 10,920)", wIn: 60, dIn: 52, hIn: 100 }],
    variants: [{ name: "Weston Stone units", faceUrl: null }],
    notes: "Kit composition per the installation manual (its listed dimensions are approximate, rounded): 259 Full Blocks 4 x 8 x 12 (A), 32 x 4 x 8 x 8 (B), 14 x 4 x 8 x 4 (C), 2 L-blocks 8 x 9 (D), 2 L-blocks 8 x 12 (E), 2 x 4 x 8 x 10 (F), 2 x 4 x 4 x 12 (G), 10 x 4 x 8 x 5 (H), 8 x 4 x 8 x 9 (I); fire bricks 28 x 4 x 9, 6 x 4 x 4, 4 x 2 x 9, 2 x 2 x 4, 4 x 4 x 8; caps 19 x 14 x 12 plus cut pieces; 2 arch lintels installed after courses 10-11. Course 1 base squares to 60 in wide x 51.5 in deep; 26 courses total; cap overhang about 2 in. Companion wood boxes ship as complete units (product page) but Belgard prints no wood-box dimensions — none recorded. The manual prints no clearance dimensions; its usage note requires compliance with local building codes and permits. Fireplace and wood boxes each ship as a complete unit per the product page.",
  },

];

export const BELGARD_FEATURE_CATEGORIES = [
  "Coping",
  "Steps",
  "Fireplaces & Fire Features",
  "Outdoor Kitchen",
] as const;
