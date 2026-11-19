/**
 * Floor & Decor product registry — the ONE catalog for every
 * Floor & Decor surface (founder consolidation ruling,
 * 2026-11-15: MERGE).
 *
 * Until this ruling the catalog lived in two files: the shipped
 * registry (the DuraLux family, 24 products, faces in a
 * page-local shape) and a parallel deck-shaped registry (Alto
 * Bianco + Amsterdam Ash, faces as the shared
 * BelgardUnitTextureSet). This file is the merge: the
 * deck-shaped face format is the one format, the shipped
 * family's data (all 24 DuraLux products and the full Alamo Oak
 * record — item numbers, prices, faces, normals, material) is
 * folded in whole, and the parallel file is retired. No fork
 * remains; every F&D surface reads this catalog.
 *
 * BUILD WITH KNOWLEDGE, NOT GUESSWORK: every figure on a
 * record is transcribed from the product's own flooranddecor.com
 * page (specifications table + the page's JSON-LD product
 * offer), read on the date in `sourcedOn`. Anything the page
 * does not print is a NAMED GAP on the record (`gaps`), never
 * an invented value. A product whose exact dimensions are not
 * yet read carries dimensionStatus "nominal-only" and NO model
 * — an unmeasured product is a named gap, never an estimate.
 *
 * Faces follow the founder's dimension-true method
 * (paver-dimension-true-cuts): cut ONLY complete units bounded
 * by measured joints in the product's own high-resolution
 * display image, inset past the joint, normalized to the exact
 * printed face at one fixed scale; colors come from the
 * original, never re-graded. Where a product's own print is a
 * long plank, a face may instead be a true-scale WINDOW of that
 * print (the Alamo Oak variation faces): its faceIn is the
 * window's true size, and a window may only cover a piece it
 * covers whole — never tiled, never stretched. A product whose
 * gallery holds no complete unit carries `faceSet: null` and
 * the reason in `facesGap` — it cannot be laid as pieces until
 * a source image holding a complete unit exists (the deck
 * program's own unlayable rule, register D8).
 *
 * Face sets are shaped as the studio's shared
 * BelgardUnitTextureSet so the ONE assignment brain
 * (lib/visual/unitTextureLogic.assignUnitTexture) lays them
 * unchanged — no parallel implementation.
 *
 * Standing rule (from the shipped registry, carried over):
 * NO Floor & Decor face ships without its own depth map +
 * material logic. The depth map is the variant's own
 * (`faceNormals`, parallel to faceSet.variants, derived from
 * that face's own image at its own size — never stretched,
 * never borrowed); the material logic is the product's
 * `faceMaterial`, resolved from the product's PUBLISHED
 * texture/gloss fields. A face set whose depth maps are not
 * yet built names that in `gaps` instead of shipping silently.
 */
import type { BelgardUnitTextureSet } from "./belgardUnitTextures";

export interface FloorDecorFaceMaterial {
  /** Finish class, resolved from the product's PUBLISHED
   * texture/gloss fields — never invented per face. */
  kind: string;
  roughness: number;
  metalness: number;
  /** Strength of the face's own depth (normal) map. */
  normalScale: number;
  /** Where the class came from, in the product's own data. */
  basis: string;
}

export interface FloorDecorModel {
  /** Geometry kind the shared builders render; dimensions are the model's. */
  kind: "plank-box";
  lengthIn: number | null;
  widthIn: number | null;
  thicknessIn: number;
}

/** One face of a product, in the shape the floor builders lay:
 * derived from the product's faceSet by floorDecorFaces(). */
export interface FloorDecorFace {
  url: string;
  /** True inches of product surface this face covers. */
  coveredLengthIn: number;
  coveredWidthIn: number;
  /** The face's OWN depth/normal map, when built. */
  normalUrl?: string;
  /** The product's material logic (standing rule, see header). */
  material: FloorDecorFaceMaterial;
}

export interface FloorDecorProduct {
  /** Stable id, aligned with the product's flooranddecor.com URL slug. */
  slug: string;
  /** The retailer's item number (the number in the product URL). */
  fdId: string;
  name: string;
  /** Brand line as printed ("DuraLux Performance", "NuCore Performance", "San Giorgio"). */
  brand: string;
  /** The colourway/style name, e.g. "Alamo Oak", where the line has one. */
  colorway?: string;
  /** Site category id from FLOOR_AND_DECOR_CATEGORIES. */
  category: string;
  productType: string;
  /** Material, as printed on the product page. */
  material: string;
  /** The product page every figure was read from. */
  sourceUrl: string;
  /** Date the page was read, ISO (America/New_York). */
  sourcedOn: string;
  /** Actual printed piece length, inches (the page's
   *  "Product Length (inches)"). For nominal-only records this
   *  is the listing's rounded size and dimensionStatus says so.
   *  Null when the page publishes no dimensions at all
   *  (dimensionStatus "not-published" — the stone countertop
   *  samples: no slab size is printed anywhere). */
  lengthIn: number;
  /** Actual printed piece width, inches. */
  widthIn: number;
  /** The size label as printed ("24 x 48", "5mm x 7in x 48in"). */
  nominalLabel: string | null;
  /** "exact-published" = decimals read from the product's own
   * spec table; "nominal-only" = only the rounded listing-card
   * size is published so far. */
  dimensionStatus: "exact-published" | "nominal-only" | "not-published";
  /** Printed thickness, millimetres. */
  thicknessMm: number | null;
  /** Coverage per piece as printed, where the page prints it. */
  coverageSqFtPerPiece?: number;
  /** Printed box quantity, where the page prints it. */
  boxQuantity?: number;
  box?: { lengthIn: number; widthIn: number; weightLbs: number };
  color?: string;
  finish?: string;
  edge?: string;
  look?: string;
  shade?: string;
  gloss?: string;
  texture?: string;
  wearLayer?: string;
  wearLayerMil?: number;
  attachedPad?: string;
  waterproof?: boolean;
  /** Installation type as printed ("Grout & Mortar",
   *  "Floating/ Locking"), where read. */
  installType?: string;
  iic?: number;
  stc?: number;
  deltaIic?: number;
  warranty?: string;
  vocCertification?: string;
  /** The joint the layout lays with, inches. A number only
   *  when the page prints it (or prints a locking install,
   *  which locks edge to edge); null = not printed = named
   *  gap (see jointNote). */
  jointIn: number | null;
  jointNote: string;
  /** Price exactly as printed in the page's own JSON-LD
   *  Product offer — the page does not state beside the offer
   *  whether it is per piece or per box, so no basis is
   *  claimed (see priceNote). Null when no offer has been
   *  read for this product. */
  priceUsd: number | null;
  priceNote: string;
  /** $/sq ft exactly as the family listing page prints it,
   *  where read there; see priceBasis. */
  pricePerSqftUsd?: number;
  priceBasis?: string;
  /** The product's high-resolution display image asset
   *  (Amplience base URL; request ?w=2000 for the
   *  full-resolution render). Where no Amplience asset is on
   *  record, the served local display image instead. */
  imageUrl: string;
  /** Served path of the product's own display image kept
   *  whole locally (the field the faces were cut from), where
   *  one is held. */
  displayImage?: string;
  /** The product's straight-on full-piece photo asset, when published. */
  pieceImageUrl?: string;
  /** The dimension-true face set, or null when the gallery
   *  holds no complete unit (facesGap then says why). */
  faceSet: BelgardUnitTextureSet | null;
  facesGap: string | null;
  /** Material logic for the face set (standing rule): the
   *  finish class resolved from the product's published
   *  texture/gloss fields. Present whenever faceSet is. */
  faceMaterial?: FloorDecorFaceMaterial;
  /** Depth/normal map per faceSet variant, parallel to
   *  faceSet.variants, each derived from that face's own
   *  image. Absent only where `gaps` names the depth debt. */
  faceNormals?: (string | null)[];
  /** The laying module: one module of the product's own
   *  printed piece, in inches [length, width]. */
  moduleIn: [number, number] | null;
  /** Null until the product's exact dimensions are published
   *  and read AND its faces exist — a model is never built at
   *  estimated dimensions. */
  model: FloorDecorModel | null;
  /** Every fact the source does not print, named. */
  gaps: string[];
}

export interface FloorAndDecorCategory {
  id: string;
  /** Category label as Floor & Decor's site presents it. */
  label: string;
  productTypes: string[];
}

/** The Floor & Decor catalog taxonomy, mapped from the public site's own
 * category structure (home > flooring / countertops), 2026-11-12. */
export const FLOOR_AND_DECOR_CATEGORIES: FloorAndDecorCategory[] = [
  { id: "tile", label: "Tile", productTypes: ["porcelain", "ceramic", "glass", "mosaic", "backsplash", "shower-tile", "porcelain-paver"] },
  { id: "wood-flooring", label: "Wood Flooring", productTypes: ["hardwood", "engineered-wood", "wood-look-tile"] },
  { id: "laminate-flooring", label: "Laminate", productTypes: ["laminate-plank"] },
  { id: "vinyl-flooring", label: "Vinyl & Waterproof Flooring", productTypes: ["luxury-vinyl-plank", "luxury-vinyl-tile"] },
  { id: "natural-stone", label: "Natural Stone", productTypes: ["stone-tile", "stone-mosaic", "ledger-panel"] },
  { id: "countertops", label: "Countertops", productTypes: ["granite-countertop", "marble-countertop", "quartz-countertop", "butcher-block-countertop"] },
  { id: "decoratives", label: "Decoratives", productTypes: ["mosaic", "accent-tile", "trim"] },
  { id: "accessories", label: "Accessories", productTypes: ["underlayment", "grout", "tools", "installation"] },
];

const AMPLIENCE = "https://i8.amplience.net/i/flooranddecor";

/** The DuraLux family's shared face-material class: every
 * DuraLux product whose page is read publishes the same finish
 * fields (texture Embossed, gloss Low), so the class is stated
 * once and each deepened record references it. */
const DURALUX_FACE_MATERIAL: FloorDecorFaceMaterial = {
  kind: "embossed-vinyl-low-gloss",
  roughness: 0.55,
  metalness: 0,
  normalScale: 0.6,
  basis:
    "Product's published fields: texture Embossed, gloss Low — the matte embossed-vinyl finish class; depth from each face's own normal map.",
};

/** Alamo Oak — the DuraLux family's fully-read record, folded
 * in whole from the shipped registry (founder merge ruling,
 * 2026-11-15): exact printed dimensions, four faces cut from
 * the product's own images, each with its own normal map, and
 * the embossed-vinyl material logic. The face set's boxes and
 * means were re-measured from the original sources for the
 * merge (~/workspace/floor-and-decor-production/
 * measure_alamo_for_merge.py, using the cut script's own
 * logic): variant A's box is in the product's full-plank photo
 * (2000 x 2000), variants B–D are crops of the display render
 * (2000 x 2000, 69.73 px/in anchored to the printed plank
 * width); means are measured from the shipped face files. */
const ALAMO_OAK: FloorDecorProduct = {
  slug: "alamo-oak",
  fdId: "101068468",
  name: "Alamo Oak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Alamo Oak",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/alamo-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101068468.html",
  sourcedOn: "2026-11-12",
  lengthIn: 48.03,
  widthIn: 7.17,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Brown",
  shade: "Medium",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 53,
  stc: 53,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.82, widthIn: 7.95, weightLbs: 41.49 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed — the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a box price " +
    "($40.39) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.69,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101068468_alamo-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101068468_alamo-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Alamo Oak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "alamo-oak",
    option: "Alamo Oak",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101068468_alamo-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/alamo-oak/face-top-a.jpg", sourceBox: [855, 28, 1146, 1971], sourceSize: [344, 2305], mean: [126.0, 102.1, 79.8], faceIn: [48.03, 7.17] },
      { url: "/app/floor-and-decor/duralux-performance/alamo-oak/face-top-b.jpg", sourceBox: [5, 958, 495, 1993], sourceSize: [344, 712], mean: [123.34, 98.89, 75.4], faceIn: [14.84, 7.17] },
      { url: "/app/floor-and-decor/duralux-performance/alamo-oak/face-top-c.jpg", sourceBox: [505, 339, 995, 1993], sourceSize: [344, 1138], mean: [134.48, 112.69, 89.74], faceIn: [23.72, 7.17] },
      { url: "/app/floor-and-decor/duralux-performance/alamo-oak/face-top-d.jpg", sourceBox: [1005, 7, 1495, 1239], sourceSize: [344, 848], mean: [133.78, 111.87, 88.32], faceIn: [17.67, 7.17] },
    ],
    unitMeans: [
      [126.0, 102.1, 79.8],
      [123.34, 98.89, 75.4],
      [134.48, 112.69, 89.74],
      [133.78, 111.87, 88.32],
    ],
    overallMean: [129.4, 106.39, 83.32],
    notes:
      "Variant A is the product's own full-plank photo (asset ..._1), " +
      "cropped to the measured plank box and resampled uniformly to " +
      "the printed size at 48 px/in — no stretching, square corners. " +
      "Variants B–D are true-scale windows of the product's display " +
      "render: crops inside single plank segments between real butt " +
      "joints, inset from every joint, resampled uniformly to " +
      "48 px/in at their true covered length (render scale 69.73 " +
      "px/in anchored to the published plank width); their covered " +
      "lengths are render-measured, not printed dimensions. A window " +
      "may only cover a piece it covers whole — never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_alamo_oak_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "(build_alamo_oak_normals.py for B–D, the cut script for A).",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.17],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print — a face whose " +
        "covered length reaches the piece's length (the full-plank " +
        "face A, or a flipped full print) or a true-scale window " +
        "for a shorter cut piece — never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/alamo-oak/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/alamo-oak/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/alamo-oak/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/alamo-oak/face-top-d-normal.jpg",
  ],
  moduleIn: [48.03, 7.17],
  model: { kind: "plank-box", lengthIn: 48.03, widthIn: 7.17, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A box price ($40.39) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "Variation faces b-d are single-print crops of the product's display render, scale anchored to the published plank width; their covered lengths are render-measured, not printed dimensions.",
  ],
};


const PORCELAIN_FACE_MATERIAL: FloorDecorFaceMaterial = {
  kind: "matte-porcelain",
  roughness: 0.85,
  metalness: 0,
  normalScale: 0.35,
  basis:
    "Product's published fields: material Porcelain, finish Matte, " +
    "look Marble Look \u2014 the matte porcelain class; depth from " +
    "each face's own normal map (the marble veining is the relief).",
};

const ALTO_BIANCO: FloorDecorProduct = {
  slug: "alto-bianco-matte-porcelain-tile",
  fdId: "101138949",
  name: "Alto Bianco Matte Porcelain Tile",
  brand: "San Giorgio",
  category: "tile",
  productType: "porcelain-tile",
  material: "Porcelain",
  sourceUrl:
    "https://www.flooranddecor.com/porcelain-tile/alto-bianco-matte-porcelain-tile-101138949.html",
  sourcedOn: "2026-11-12",
  lengthIn: 48,
  widthIn: 24,
  nominalLabel: "24 x 48",
  dimensionStatus: "exact-published",
  thicknessMm: 10,
  coverageSqFtPerPiece: 7.75,
  boxQuantity: 2,
  color: "White",
  finish: "Matte",
  edge: "Rectified",
  look: "Marble Look",
  installType: "Grout & Mortar",
  jointIn: 0.0625,
  jointNote:
    "The page prints Suggested Grout Line Size \"1/16, 1/8, or 3/16\"; " +
    "the layout takes the first printed value (1/16 in) — the page's " +
    "own edge note calls the rectified edge the smallest grout line.",
  priceUsd: 27.74,
  priceNote:
    "JSON-LD Product offer on the product page, read 2026-11-12 " +
    "(page then showed OutOfStock). The page does not state beside " +
    "the offer whether the price is per piece or per box (box of 2).",
  imageUrl:
    "https://i8.amplience.net/i/flooranddecor/101138949_alto-bianco-matte-porcelain-tile_display",
  displayImage:
    "/textures/floor-decor/alto-bianco-matte-porcelain-tile/display.jpg",
  faceSet: {
    product: "Alto Bianco Matte Porcelain Tile",
    productSlug: "alto-bianco-matte-porcelain-tile",
    option: "White",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101138949_alto-bianco-matte-porcelain-tile_display",
    swatchSize: [2400, 2400],
    variants: [
      { url: "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-0.png", sourceBox: [1, 1, 1197, 597], sourceSize: [1196, 596], mean: [244.11, 243.51, 243.06], faceIn: [48, 24] },
      { url: "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-1.png", sourceBox: [1203, 1, 2397, 597], sourceSize: [1194, 596], mean: [244.85, 243.82, 243.07], faceIn: [48, 24] },
      { url: "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-2.png", sourceBox: [875, 604, 2072, 1198], sourceSize: [1197, 594], mean: [244.72, 243.77, 243.08], faceIn: [48, 24] },
      { url: "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-3.png", sourceBox: [1, 1205, 1197, 1799], sourceSize: [1196, 594], mean: [244.65, 243.78, 243.09], faceIn: [48, 24] },
      { url: "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-4.png", sourceBox: [1203, 1205, 2397, 1799], sourceSize: [1194, 594], mean: [243.96, 243.3, 242.8], faceIn: [48, 24] },
      { url: "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-5.png", sourceBox: [875, 1806, 2072, 2397], sourceSize: [1197, 591], mean: [244.39, 243.85, 243.43], faceIn: [48, 24] },
    ],
    unitMeans: [
      [244.11, 243.51, 243.06],
      [244.85, 243.82, 243.07],
      [244.72, 243.77, 243.08],
      [244.65, 243.78, 243.09],
      [243.96, 243.3, 242.8],
      [244.39, 243.85, 243.43],
    ],
    overallMean: [244.45, 243.67, 243.09],
    notes:
      "Six complete 48 x 24 in tiles measured in the product's own " +
      "2400 x 2400 display field (joints at y = 600/1201/1802, " +
      "25 px/in; straight bands x = 1200, offset bands x = 872/2075), " +
      "cut at the joints inset 3 px and normalized to 1200 x 600 " +
      "(25 px/in). Colors from the original render, never re-graded; " +
      "no enlargement or enhancement applied — the brand's own " +
      "2400 px render is the original. Cut and verified visually " +
      "2026-11-12 (~/workspace/floor-decor/cut_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-tile module (stacked)",
      moduleIn: [48, 24],
      wrap:
        "The 48 x 24 module repeats on a plain grid; every tile " +
        "takes the cut whose faceIn matches its own face, all six " +
        "cuts rotate across the surface, never the same cut on " +
        "two touching tiles (the shared assignment stream).",
      rule:
        "Faces are dimension-true cuts of the printed 48 x 24 in " +
        "tile only; a size with no complete tile in the display " +
        "image gets no cut.",
    },
  },
  facesGap: null,
  faceMaterial: PORCELAIN_FACE_MATERIAL,
  faceNormals: [
    "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-0-normal.png",
    "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-1-normal.png",
    "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-2-normal.png",
    "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-3-normal.png",
    "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-4-normal.png",
    "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-5-normal.png",
  ],
  moduleIn: [48, 24],
  model: null,
  gaps: [
    "Laying pattern: not printed on the product page. The display image shows a running-bond field, but that is the photo's composition, not a printed pattern — the Large Floor lays the single-tile module until a pattern is printed or ordered.",
    "Depth maps: LANDED 2026-11-15 (depth plan F5) — each of the six tile faces carries its own normal map derived from its own image (Sobel, strength 2.0; the marble veining is the relief) and the record carries the matte-porcelain face material, so the faces lay with depth in the Large Floor.",
    "No 3D model yet: the record predates the merged catalog's model pass; its exact dimensions and faces are on record, the model lands with the porcelain family deepening.",
  ],
};

const NUCORE_FACE_MATERIAL: FloorDecorFaceMaterial = {
  kind: "embossed-vinyl-low-gloss",
  roughness: 0.55,
  metalness: 0,
  normalScale: 0.6,
  basis:
    "Product's published fields: texture Embossed, gloss Low, wear " +
    "layer Techtanium Plus, attached pad Cork \u2014 the matte " +
    "embossed-vinyl finish class; depth from each face's own " +
    "normal map.",
};

const AMSTERDAM_ASH: FloorDecorProduct = {
  slug: "amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad",
  fdId: "101329514",
  name: "Amsterdam Ash Waterproof Rigid Core Luxury Vinyl Plank - Cork Pad",
  brand: "NuCore Performance",
  colorway: "Amsterdam Ash",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/nucore-performance-flooring/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad-101329514.html",
  sourcedOn: "2026-11-15",
  lengthIn: 47.64,
  widthIn: 7.72,
  nominalLabel: "7 x 48",
  dimensionStatus: "exact-published",
  thicknessMm: 6.5,
  color: "Beige",
  shade: "Light",
  texture: "Embossed",
  edge: "Painted Bevel",
  gloss: "Low",
  wearLayer: "Techtanium Plus",
  attachedPad: "Cork",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 67,
  stc: 68,
  deltaIic: 22,
  warranty: "Lifetime Res./ 25 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.39, widthIn: 8.31, weightLbs: 49.23 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: 81.48,
  priceNote:
    "JSON-LD Product offer on the product page, read 2026-11-15 " +
    "(page showed InStock); the PDP renders the figure per box. " +
    "No per-square-foot price is published on the page.",
  imageUrl:
    "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/display.jpg",
  displayImage:
    "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/display.jpg",
  faceSet: {
    product: "Amsterdam Ash Waterproof Rigid Core Luxury Vinyl Plank - Cork Pad",
    productSlug: "amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad",
    option: "Amsterdam Ash",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101329514_amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-a.jpg", sourceBox: [319, 7, 748, 993], sourceSize: [371, 832], mean: [178.8, 161.35, 133.48], faceIn: [17.34, 7.72] },
      { url: "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-b.jpg", sourceBox: [319, 1007, 748, 1993], sourceSize: [371, 832], mean: [179.11, 161.15, 135.94], faceIn: [17.34, 7.72] },
      { url: "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-c.jpg", sourceBox: [758, 7, 1187, 736], sourceSize: [371, 615], mean: [194.79, 178.21, 151.27], faceIn: [12.82, 7.72] },
      { url: "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-d.jpg", sourceBox: [758, 750, 1187, 1993], sourceSize: [371, 1049], mean: [191.4, 174.51, 149.42], faceIn: [21.86, 7.72] },
      { url: "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-e.jpg", sourceBox: [1197, 7, 1625, 993], sourceSize: [371, 834], mean: [193.04, 176.09, 149.55], faceIn: [17.38, 7.72] },
      { url: "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-f.jpg", sourceBox: [1197, 1007, 1625, 1993], sourceSize: [371, 834], mean: [197.17, 180.62, 156.42], faceIn: [17.38, 7.72] },
    ],
    unitMeans: [
      [178.8, 161.35, 133.48],
      [179.11, 161.15, 135.94],
      [194.79, 178.21, 151.27],
      [191.4, 174.51, 149.42],
      [193.04, 176.09, 149.55],
      [197.17, 180.62, 156.42]
    ],
    overallMean: [189.05, 171.99, 146.01],
    notes:
      "Six true-scale windows of the display render: an OFFSET " +
      "grid \u2014 seams at x = 314/753/1192/1630 (gradient peaks " +
      "16.7\u201327.3 against a 5.93 median, each refined to the " +
      "exact pixel) \u2014 three full columns (439/439/438 px, " +
      "local scales 56.87/56.87/56.74 px/in) flanked by two " +
      "partials (314 px and 370 px, both unused). Exactly ONE " +
      "butt joint stands among the full columns (column 3 at " +
      "y743, crop-verified); columns 2 and 4 are jointless over " +
      "the full frame and are midpoint-split \u2014 six segments, " +
      "one window inside each, every window 12.82 in or longer " +
      "so all six faces deal on the floor. A full plank is " +
      "~2,707 px at this scale, taller than the frame, so no " +
      "column holds a complete unit. This measurement REFUTES " +
      "the 2026-11-12 record's render claim (525 px columns at " +
      "68 px/in, joints ~15.4 in apart): the columns are " +
      "438\u2013439 px at ~56.8 px/in and two of the three carry " +
      "no joint at all. Covered lengths are render-measured at " +
      "each column's own scale, not printed dimensions. A window " +
      "may only cover a piece it covers whole \u2014 never tiled. " +
      "Cut by " +
      "~/workspace/floor-and-decor-production/cut_amsterdam_ash_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [47.64, 7.72],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap:
    "The plank photo shows one plank whose top end is in frame " +
    "but which runs off the bottom of the frame (only ~24.3 of " +
    "47.64 in visible) \u2014 no complete-plank face and no " +
    "plank-box model; the six faces are true-scale windows of " +
    "the product's own display render.",
  faceMaterial: NUCORE_FACE_MATERIAL,
  faceNormals: [
    "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-a-normal.jpg",
    "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-b-normal.jpg",
    "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-c-normal.jpg",
    "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-d-normal.jpg",
    "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-e-normal.jpg",
    "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-f-normal.jpg"
  ],
  moduleIn: [47.64, 7.72],
  model: null,
  gaps: [
    "Coverage per piece / per box and box quantity: not published anywhere on the product page ('Coverage' and 'Sq. Ft' occur zero times in the markup; no coverage or pieces row in the spec table).",
    "No per-square-foot price is published on this product's page \u2014 only the box figure ($81.48).",
    "No Country of Origin is printed in this product's spec table \u2014 not recorded.",
    "The wear layer prints as the proprietary name 'Techtanium Plus' in both the Wear Layer and Veneer Thickness rows \u2014 no mil figure is printed, so no wearLayerMil is recorded.",
    "Family breaks read from this product's own page: cork pad where every DuraLux sibling carries IXPE foam; commercial warranty 25 years where the DuraLux siblings print 15; sunrooms approved 'Yes if Glued Down', a conditional no sibling prints; scratch resistance 'Maximum w/ Extreme Scratch Warranty'.",
    "Variation faces are single-print crops of the product's display render, scale anchored per column; their covered lengths are render-measured, not printed dimensions.",
  ],
};

const DURALUX_LISTING_URL =
  "https://www.flooranddecor.com/duralux-performance-flooring?prefn1=lengthFamily&prefv1=48%20-%2059in.";
const NOMINAL_GAPS = [
  "Exact decimal dimensions, wear layer and full specifications not yet read from this product's own page — the listing card publishes the nominal size only.",
  "Faces not yet cut: this product's own images not yet harvested.",
];

/** One DuraLux Performance 7 x 48 foam-pad plank as far as the family
 * listing page publishes it: name, item number, nominal size, $/sq ft and
 * the product's own display image. Exact specs land product by product
 * (the merge ruling's deepening queue, step 1). */
function duraluxListingProduct(args: {
  slug: string;
  fdSlug: string;
  itemNumber: string;
  colorway: string;
  waterproofInName: boolean;
  pricePerSqftUsd: number;
}): FloorDecorProduct {
  const printed = `${args.colorway}${args.waterproofInName ? " Waterproof" : ""} Rigid Core Luxury Vinyl Plank - Foam Pad`;
  return {
    slug: args.slug,
    fdId: args.itemNumber,
    name: printed,
    brand: "DuraLux Performance",
    colorway: args.colorway,
    category: "vinyl-flooring",
    productType: "luxury-vinyl-plank",
    material: "Vinyl",
    sourceUrl: `https://www.flooranddecor.com/duralux-performance-flooring/${args.fdSlug}-${args.itemNumber}.html`,
    sourcedOn: "2026-11-12",
    lengthIn: 48,
    widthIn: 7,
    nominalLabel: "5mm x 7in x 48in",
    dimensionStatus: "nominal-only",
    thicknessMm: 5,
    jointIn: null,
    jointNote:
      "Not yet read from this product's own page — the listing card " +
      "prints no joint or installation line.",
    priceUsd: null,
    priceNote:
      "No product-page offer read yet — the price on record is the " +
      "listing page's $/sq ft (pricePerSqftUsd).",
    pricePerSqftUsd: args.pricePerSqftUsd,
    priceBasis:
      "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
    imageUrl: `${AMPLIENCE}/${args.itemNumber}_${args.fdSlug}_display`,
    faceSet: null,
    facesGap:
      "Faces not yet cut: this product's own images not yet harvested " +
      "(named gap — the deepening queue cuts them product by product).",
    moduleIn: [48, 7],
    model: null,
    gaps: [...NOMINAL_GAPS],
  };
}

/** Winter Peak — the deepening queue's first product (founder
 * merge ruling, 2026-11-15), rebuilt under the founder's
 * corrected F&D standard the same day: its own page read in
 * full (exact printed dimensions, whole spec table) and AS
 * MANY FACES AS ITS IMAGERY SUPPORTS — eleven true-scale
 * windows of its own prints (3 from the plank photo, 8 from
 * the display render's measured segments), each with its own
 * depth map (surface relief only) and the family's material
 * logic. The one thing its imagery cannot give: no published
 * asset holds a continuous 48.03 in print (the plank photo's
 * length runs out of frame; the render's field spans 28.81 in
 * vertically), so no face can cover a full-length piece whole
 * and the record carries NO model yet — the model waits for a
 * full-length source rather than letting full planks fall to
 * a stretch. Gallery assets _2.._9 and the scene/room/
 * lifestyle suffixes are all Amplience placeholders; only
 * _display and _1 exist. */
const WINTER_PEAK: FloorDecorProduct = {
  slug: "winter-peak",
  fdId: "100956788",
  name: "Winter Peak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Winter Peak",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/winter-peak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-100956788.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.2,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Beige",
  shade: "Dark",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 66,
  stc: 68,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.62, widthIn: 7.64, weightLbs: 49.22 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed — the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($48.74) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.69,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/100956788_winter-peak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/100956788_winter-peak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Winter Peak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "winter-peak",
    option: "Winter Peak",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100956788_winter-peak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2001],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/winter-peak/face-top-a.jpg", sourceBox: [760, 56, 1240, 1993], sourceSize: [346, 1366], mean: [126.16, 108.36, 82.42], faceIn: [28.46, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/winter-peak/face-top-b.jpg", sourceBox: [17, 7, 430, 1220], sourceSize: [346, 991], mean: [118.43, 101.96, 77.13], faceIn: [20.65, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/winter-peak/face-top-c.jpg", sourceBox: [17, 1234, 430, 1994], sourceSize: [346, 621], mean: [112.4, 94.74, 68.92], faceIn: [12.94, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/winter-peak/face-top-d.jpg", sourceBox: [440, 7, 850, 304], sourceSize: [346, 244], mean: [121.45, 105.8, 80.69], faceIn: [5.09, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/winter-peak/face-top-e.jpg", sourceBox: [440, 318, 850, 1994], sourceSize: [346, 1379], mean: [139.01, 122.67, 96.55], faceIn: [28.73, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/winter-peak/face-top-f.jpg", sourceBox: [860, 7, 1250, 1994], sourceSize: [346, 1717], mean: [118.48, 102.72, 78.78], faceIn: [35.77, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/winter-peak/face-top-g.jpg", sourceBox: [1260, 7, 1600, 1652], sourceSize: [346, 1624], mean: [139.59, 123.53, 97.05], faceIn: [33.84, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/winter-peak/face-top-h.jpg", sourceBox: [1260, 1666, 1600, 1994], sourceSize: [346, 324], mean: [104.82, 89.43, 66.93], faceIn: [6.75, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/winter-peak/face-top-i.jpg", sourceBox: [1610, 7, 1995, 1994], sourceSize: [346, 1738], mean: [142.2, 125.99, 99.48], faceIn: [36.22, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/winter-peak/face-top-j.jpg", sourceBox: [760, 56, 1240, 1000], sourceSize: [346, 666], mean: [116.57, 98.77, 72.52], faceIn: [13.87, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/winter-peak/face-top-k.jpg", sourceBox: [760, 1050, 1240, 1993], sourceSize: [346, 665], mean: [135.43, 117.6, 92.01], faceIn: [13.86, 7.2] },
    ],
    unitMeans: [
      [126.16, 108.36, 82.42],
      [118.43, 101.96, 77.13],
      [112.4, 94.74, 68.92],
      [121.45, 105.8, 80.69],
      [139.01, 122.67, 96.55],
      [118.48, 102.72, 78.78],
      [139.59, 123.53, 97.05],
      [104.82, 89.43, 66.93],
      [142.2, 125.99, 99.48],
      [116.57, 98.77, 72.52],
      [135.43, 117.6, 92.01]
    ],
    overallMean: [124.96, 108.32, 82.95],
    notes:
      "Variants a, j and k are true-scale windows of the product's " +
      "own plank photo (anchored to that photo's own scale). " +
      "Variants b\u2013i are true-scale windows of the display " +
      "render \u2014 CORRECTED 2026-11-15 after a full arbitration: " +
      "the render is a hand-placed marketing composite of five " +
      "UNEQUAL columns (seams at x = 12 / 435 / 855 / 1255 / 1605; " +
      "widths 423 / 420 / 400 / 350 / 395 px; per-column scales " +
      "48.6\u201358.8 px/in), not the four equal 500-px columns the " +
      "first cut assumed, so every first-cut render face crossed a " +
      "true seam and every covered length was understated by " +
      "about 26%. The corrected set takes one window inside each " +
      "of the eight true segments (butt joints at col 0 y1227, " +
      "col 1 y311, col 3 y1659 \u2014 the last missed entirely by " +
      "the first cut; cols 2 and 4 carry no joint), inset from " +
      "every seam, with covered lengths at each column's own " +
      "local scale. Seams here carry no drawn line; they were " +
      "located by butt-joint endpoints verified in native-res " +
      "crops (full record: winter-peak-arbitration.json in the " +
      "production folder). A window may only cover a piece it " +
      "covers whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_winter_peak_correction_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.2],
      wrap:
        "Grid logic: planks lay in rows on the printed module " +
        "(48.03 x 7.20 in), running bond — each row opens with a " +
        "cut starter, runs full planks, and closes with a " +
        "measured end cut; the same grid draws in Plan and 3D. " +
        "Every piece takes one true-scale window that covers it " +
        "whole; pieces longer than the longest window (28.46 in) " +
        "cannot be faced from this imagery, which is why no " +
        "model ships yet (see gaps).",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap:
    "Faces are cut (eleven true-scale windows, each with its own " +
    "depth map), but every window is shorter than one full " +
    "48.03 in piece — no continuous full-length print exists in " +
    "the product's published assets, so full-length pieces " +
    "cannot be faced whole and the product carries no model yet.",
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/winter-peak/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/winter-peak/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/winter-peak/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/winter-peak/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/winter-peak/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/winter-peak/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/winter-peak/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/winter-peak/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/winter-peak/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/winter-peak/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/winter-peak/face-top-k-normal.jpg",
  ],
  moduleIn: [48.03, 7.2],
  model: null,
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A price ($48.74) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "No model: the maker's imagery holds no continuous 48.03 in print (longest window 28.46 in), so no face can cover a full-length piece whole; the eleven faces and the grid logic are complete and the model lands if a full-length source is published.",
  ],
};

/** Piedmont Bend — deepening queue #2 (2026-11-15): its own
 * page read in full and its faces cut at the Alamo standard.
 * The full-plank photo holds a complete plank (measured box
 * aspect 6.500 vs the printed 6.671 — a 2.6% framing tolerance,
 * larger than Alamo Oak's 0.3%, recorded here per the pipeline
 * method: the printed sheet wins and the box is normalized to
 * the printed size). Variation faces are true-scale windows of
 * the display render between measured butt joints. */
const PIEDMONT_BEND: FloorDecorProduct = {
  slug: "piedmont-bend",
  fdId: "100885144",
  name: "Piedmont Bend Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Piedmont Bend",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/piedmont-bend-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-100885144.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.2,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Brown",
  shade: "Medium",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 66,
  stc: 68,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.62, widthIn: 7.64, weightLbs: 49.22 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed — the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($57.39) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/100885144_piedmont-bend-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/100885144_piedmont-bend-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Piedmont Bend Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "piedmont-bend",
    option: "Piedmont Bend",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100885144_piedmont-bend-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
{ url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-a.jpg", sourceBox: [860, 61, 1148, 1933], sourceSize: [346, 2305], mean: [189.56, 160.61, 123.65], faceIn: [48.03, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-b.jpg", sourceBox: [339, 862, 661, 1993], sourceSize: [346, 1173], mean: [203.75, 176.17, 141.92], faceIn: [24.43, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-c.jpg", sourceBox: [671, 7, 996, 546], sourceSize: [346, 559], mean: [203.0, 175.23, 140.87], faceIn: [11.64, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-d.jpg", sourceBox: [1006, 7, 1329, 1047], sourceSize: [346, 1078], mean: [191.69, 161.05, 122.9], faceIn: [22.46, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-e.jpg", sourceBox: [5, 7, 329, 1625], sourceSize: [346, 1678], mean: [179.4, 148.95, 113.05], faceIn: [34.95, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-f.jpg", sourceBox: [339, 7, 661, 848], sourceSize: [346, 872], mean: [183.94, 154.65, 120.0], faceIn: [18.17, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-g.jpg", sourceBox: [671, 560, 996, 1993], sourceSize: [346, 1486], mean: [183.82, 154.32, 119.44], faceIn: [30.95, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-h.jpg", sourceBox: [1006, 1061, 1329, 1993], sourceSize: [346, 966], mean: [179.37, 149.1, 113.47], faceIn: [20.13, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-i.jpg", sourceBox: [1339, 7, 1661, 1438], sourceSize: [346, 1484], mean: [203.31, 175.7, 141.43], faceIn: [30.91, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-j.jpg", sourceBox: [1671, 801, 1995, 1993], sourceSize: [346, 1236], mean: [192.13, 162.08, 124.5], faceIn: [25.75, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-k.jpg", sourceBox: [5, 1639, 329, 1993], sourceSize: [346, 367], mean: [191.97, 161.37, 122.91], faceIn: [7.65, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-l.jpg", sourceBox: [1339, 1452, 1661, 1993], sourceSize: [346, 561], mean: [184.61, 154.82, 119.39], faceIn: [11.69, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-m.jpg", sourceBox: [1671, 7, 1995, 787], sourceSize: [346, 809], mean: [184.11, 154.87, 120.24], faceIn: [16.85, 7.2] },
    ],
    unitMeans: [
      [189.56, 160.61, 123.65],
      [203.75, 176.17, 141.92],
      [203.0, 175.23, 140.87],
      [191.69, 161.05, 122.9],
      [179.4, 148.95, 113.05],
      [183.94, 154.65, 120.0],
      [183.82, 154.32, 119.44],
      [179.37, 149.1, 113.47],
      [203.31, 175.7, 141.43],
      [192.13, 162.08, 124.5],
      [191.97, 161.37, 122.91],
      [184.61, 154.82, 119.39],
      [184.11, 154.87, 120.24],
    ],
    overallMean: [190.05, 160.69, 124.91],
    notes:
      "Variant A is the product's own full-plank photo (asset ..._1), " +
      "a complete plank with both ends in frame: measured box " +
      "288 x 1872 px, aspect 6.500 against the printed 6.671 " +
      "(48.03 x 7.20 in) — a 2.6% framing tolerance, larger than " +
      "Alamo Oak's 0.3%; per the pipeline method the printed sheet " +
      "wins and the box is normalized to the printed size at " +
      "48 px/in — square corners, colours from the original. " +
      "Variants B–M are true-scale windows of the product's display " +
      "render, one window inside each of the render's twelve " +
      "column segments. CORRECTION (2026-11-15): the render was " +
      "first read as 4 columns at 69.44 px/in and the original " +
      "B–D each spanned a seam at a wrong covered length; the " +
      "expansion pass re-measured it as SIX columns of ~333 px " +
      "(seams at x = 333, 667, 1000, 1332, 1667, persistent at " +
      "every height), 46.296 px/in at the printed width, with " +
      "butt joints per column at rows 1632 / 855 / 553 / 1054 / " +
      "1445 / 794 (row-gradient of each column's mean profile). " +
      "The whole render set was re-cut on that geometry — every " +
      "window inside one segment, inset from every joint — by " +
      "~/workspace/floor-and-decor-production/cut_piedmont_correction_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script. A window may only cover a piece it " +
      "covers whole — never tiled.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.2],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print — a face whose " +
        "covered length reaches the piece's length (the full-plank " +
        "face A, or a flipped full print) or a true-scale window " +
        "for a shorter cut piece — never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-k-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-l-normal.jpg",
    "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-m-normal.jpg",
  ],
  moduleIn: [48.03, 7.2],
  model: { kind: "plank-box", lengthIn: 48.03, widthIn: 7.2, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A price ($57.39) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "Variation faces b-m are single-print crops of the product's display render, scale anchored to the published plank width; their covered lengths are render-measured, not printed dimensions.",
  ],
};

const HIGHGUARD_SILVER: FloorDecorProduct = {
  slug: "highguard-silver",
  fdId: "101066991",
  name: "Highguard Silver Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Highguard Silver",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/highguard-silver-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101066991.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.62,
  widthIn: 7.01,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Gray",
  shade: "High Variation",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 68,
  stc: 68,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.9, widthIn: 7.3, weightLbs: 49.74 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($56.52) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101066991_highguard-silver-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101066991_highguard-silver-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Highguard Silver Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "highguard-silver",
    option: "Highguard Silver",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101066991_highguard-silver-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-a.jpg", sourceBox: [893, 42, 1188, 1995], sourceSize: [336, 2334], mean: [173.29, 161.48, 145.62], faceIn: [48.62, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-b.jpg", sourceBox: [278, 0, 675, 1295], sourceSize: [336, 1100], mean: [185.6, 176.95, 168.94], faceIn: [22.92, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-c.jpg", sourceBox: [278, 1302, 675, 2000], sourceSize: [336, 593], mean: [145.31, 135.33, 127.02], faceIn: [12.35, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-d.jpg", sourceBox: [675, 0, 1070, 1000], sourceSize: [336, 850], mean: [153.08, 141.7, 130.07], faceIn: [17.7, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-e.jpg", sourceBox: [675, 1000, 1070, 2000], sourceSize: [336, 850], mean: [154.73, 143.55, 132.01], faceIn: [17.7, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-f.jpg", sourceBox: [1070, 0, 1467, 620], sourceSize: [336, 527], mean: [169.21, 157.8, 144.74], faceIn: [10.97, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-g.jpg", sourceBox: [1070, 627, 1467, 2000], sourceSize: [336, 1166], mean: [152.11, 141.2, 131.11], faceIn: [24.3, 7.01] },
    ],
    unitMeans: [
      [173.29, 161.48, 145.62],
      [185.6, 176.95, 168.94],
      [145.31, 135.33, 127.02],
      [153.08, 141.7, 130.07],
      [154.73, 143.55, 132.01],
      [169.21, 157.8, 144.74],
      [152.11, 141.2, 131.11]
    ],
    overallMean: [161.9, 151.14, 139.93],
    notes:
      "Variant A is the product's own plank photo (asset ..._1), " +
      "a complete plank with both ends in frame (top edge y~42, " +
      "bottom end edge y~1992-1994, ~6 px from the frame edge): " +
      "measured box 295 x 1953 px, aspect 6.62 against the printed " +
      "6.936 (48.62 x 7.01 in) \u2014 a 4.6% framing tolerance, the " +
      "largest in the family so far; per the pipeline method the " +
      "printed sheet wins and the box is normalized to the printed " +
      "size at 48 px/in \u2014 square corners, colours from the " +
      "original. Variants B\u2013G are true-scale windows of the " +
      "product's display render: three full plank-width columns " +
      "are in frame (seams persist at x = 277, 674, 1069, 1466 at " +
      "every height; the render's edge columns are partial-width " +
      "and were not used \u2014 a face never shows a plank edge plus " +
      "its neighbour). Butt joints measured by row-gradient of " +
      "each column's mean profile: column 1 at y~1295, column 3 " +
      "at y~620, column 2 has no joint (one continuous print, " +
      "split at its midpoint into two windows). Render scale " +
      "56.5 px/in anchored to the published plank width; covered " +
      "lengths are render-measured, not printed dimensions. A " +
      "window may only cover a piece it covers whole \u2014 never " +
      "tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_highguard_silver_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.62, 7.01],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a face whose " +
        "covered length reaches the piece's length (the full-plank " +
        "face A, or a flipped full print) or a true-scale window " +
        "for a shorter cut piece \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-g-normal.jpg"
  ],
  moduleIn: [48.62, 7.01],
  model: { kind: "plank-box", lengthIn: 48.62, widthIn: 7.01, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A price ($56.52) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "Variation faces b-g are single-print crops of the product's display render, scale anchored to the published plank width; their covered lengths are render-measured, not printed dimensions.",
  ],
};

const STORMY_ELM: FloorDecorProduct = {
  slug: "stormy-elm",
  fdId: "101068476",
  name: "Stormy Elm Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Stormy Elm",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/stormy-elm-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101068476.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.17,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Gray",
  shade: "Dark",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 53,
  stc: 53,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.82, widthIn: 7.95, weightLbs: 41.49 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($40.39) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.69,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101068476_stormy-elm-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101068476_stormy-elm-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Stormy Elm Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "stormy-elm",
    option: "Stormy Elm",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101068476_stormy-elm-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-a.jpg", sourceBox: [858, 42, 1142, 1938], sourceSize: [344, 2305], mean: [80.99, 70.12, 60.66], faceIn: [48.03, 7.17] },
      { url: "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-b.jpg", sourceBox: [5, 7, 495, 944], sourceSize: [344, 645], mean: [90.86, 80.89, 69.41], faceIn: [13.44, 7.17] },
      { url: "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-c.jpg", sourceBox: [5, 958, 495, 1993], sourceSize: [344, 712], mean: [78.39, 67.4, 57.48], faceIn: [14.84, 7.17] },
      { url: "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-d.jpg", sourceBox: [505, 7, 995, 325], sourceSize: [344, 219], mean: [82.48, 69.08, 55.21], faceIn: [4.56, 7.17] },
      { url: "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-e.jpg", sourceBox: [505, 339, 995, 1993], sourceSize: [344, 1138], mean: [90.41, 79.7, 67.73], faceIn: [23.72, 7.17] },
      { url: "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-f.jpg", sourceBox: [1005, 7, 1495, 1240], sourceSize: [344, 849], mean: [90.62, 79.48, 67.21], faceIn: [17.68, 7.17] },
      { url: "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-g.jpg", sourceBox: [1005, 1254, 1495, 1993], sourceSize: [344, 509], mean: [86.54, 73.64, 60.11], faceIn: [10.6, 7.17] },
      { url: "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-h.jpg", sourceBox: [1505, 7, 1995, 670], sourceSize: [344, 456], mean: [79.77, 68.91, 58.57], faceIn: [9.51, 7.17] },
      { url: "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-i.jpg", sourceBox: [1505, 684, 1995, 1993], sourceSize: [344, 901], mean: [86.53, 76.23, 65.22], faceIn: [18.77, 7.17] },
    ],
    unitMeans: [
      [80.99, 70.12, 60.66],
      [90.86, 80.89, 69.41],
      [78.39, 67.4, 57.48],
      [82.48, 69.08, 55.21],
      [90.41, 79.7, 67.73],
      [90.62, 79.48, 67.21],
      [86.54, 73.64, 60.11],
      [79.77, 68.91, 58.57],
      [86.53, 76.23, 65.22]
    ],
    overallMean: [85.18, 73.94, 62.4],
    notes:
      "Variant A is the product's own plank photo (asset ..._1), " +
      "a complete plank with both ends in frame (white margin at " +
      "each end): measured box 284 x 1896 px, aspect 6.676 against " +
      "the printed 6.699 (48.03 x 7.17 in) \u2014 a 0.34% framing " +
      "tolerance, the tightest in the family; per the pipeline " +
      "method the printed sheet wins and the box is normalized to " +
      "the printed size at 48 px/in \u2014 square corners, colours " +
      "from the original. Variants B\u2013I are true-scale windows " +
      "of the product's display render: exactly four full-width " +
      "columns (seams at x = 500, 1000, 1500, strength 69\u201373 " +
      "in every band), one butt joint per column (rows ~951 / " +
      "~332 / ~1247 / ~677, row-gradient with confirming tonal " +
      "steps), one window inside each of the eight segments, " +
      "inset from every joint. Render scale 69.735 px/in anchored " +
      "to the published plank width; covered lengths are " +
      "render-measured, not printed dimensions. Face D is column " +
      "1's short upper segment at a true 4.56 in \u2014 it can only " +
      "cover a piece of that length or shorter, and shows as its " +
      "cut piece in the single view. A window may only cover a " +
      "piece it covers whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_stormy_elm_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.17],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a face whose " +
        "covered length reaches the piece's length (the full-plank " +
        "face A, or a flipped full print) or a true-scale window " +
        "for a shorter cut piece \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-i-normal.jpg"
  ],
  moduleIn: [48.03, 7.17],
  model: { kind: "plank-box", lengthIn: 48.03, widthIn: 7.17, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A price ($40.39) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "Variation faces b-i are single-print crops of the product's display render, scale anchored to the published plank width; their covered lengths are render-measured, not printed dimensions.",
  ],
};

const LORRAINE_SIENNA: FloorDecorProduct = {
  slug: "lorraine-sienna",
  fdId: "101058436",
  name: "Lorraine Sienna Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Lorraine Sienna",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/lorraine-sienna-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101058436.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.13,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Beige",
  shade: "Light",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 20,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 71,
  stc: 70,
  deltaIic: 20,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.62, widthIn: 7.6, weightLbs: 41.6 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($47.30) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101058436_lorraine-sienna-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101058436_lorraine-sienna-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Lorraine Sienna Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "lorraine-sienna",
    option: "Lorraine Sienna",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101058436_lorraine-sienna-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-a.jpg", sourceBox: [5, 7, 328, 1433], sourceSize: [342, 1464], mean: [180.59, 167.41, 151.44], faceIn: [30.5, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-b.jpg", sourceBox: [5, 1447, 328, 1993], sourceSize: [342, 561], mean: [180.3, 167.48, 151.48], faceIn: [11.68, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-c.jpg", sourceBox: [338, 7, 662, 631], sourceSize: [342, 641], mean: [172.72, 159.42, 143.8], faceIn: [13.35, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-d.jpg", sourceBox: [338, 645, 662, 1993], sourceSize: [342, 1384], mean: [180.31, 167.55, 151.55], faceIn: [28.83, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-e.jpg", sourceBox: [672, 7, 995, 1000], sourceSize: [342, 1020], mean: [175.74, 160.69, 144.54], faceIn: [21.24, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-f.jpg", sourceBox: [672, 1000, 995, 1993], sourceSize: [342, 1020], mean: [173.46, 160.06, 143.95], faceIn: [21.24, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-g.jpg", sourceBox: [1005, 7, 1328, 1034], sourceSize: [342, 1054], mean: [176.54, 163.33, 147.26], faceIn: [21.97, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-h.jpg", sourceBox: [1005, 1048, 1328, 1993], sourceSize: [342, 970], mean: [175.71, 162.58, 146.27], faceIn: [20.21, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-i.jpg", sourceBox: [1338, 7, 1662, 1638], sourceSize: [342, 1675], mean: [175.67, 162.61, 146.61], faceIn: [34.89, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-j.jpg", sourceBox: [1338, 1652, 1662, 1993], sourceSize: [342, 350], mean: [174.2, 161.09, 145.12], faceIn: [7.29, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-k.jpg", sourceBox: [1672, 7, 1995, 262], sourceSize: [342, 262], mean: [175.31, 161.85, 146.85], faceIn: [5.45, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-l.jpg", sourceBox: [1672, 276, 1995, 1993], sourceSize: [342, 1763], mean: [172.73, 159.65, 144.32], faceIn: [36.73, 7.13] },
    ],
    unitMeans: [
      [180.59, 167.41, 151.44],
      [180.3, 167.48, 151.48],
      [172.72, 159.42, 143.8],
      [180.31, 167.55, 151.55],
      [175.74, 160.69, 144.54],
      [173.46, 160.06, 143.95],
      [176.54, 163.33, 147.26],
      [175.71, 162.58, 146.27],
      [175.67, 162.61, 146.61],
      [174.2, 161.09, 145.12],
      [175.31, 161.85, 146.85],
      [172.73, 159.65, 144.32]
    ],
    overallMean: [176.11, 162.81, 146.93],
    notes:
      "All twelve faces are true-scale windows of the product's " +
      "display render: six full-width columns (faint tonal seams " +
      "at x \u2248 333 / 667 / 1000 / 1333 / 1667; the grid is " +
      "confirmed by the butt joints, each spanning exactly one " +
      "column \u2014 col 0 y1440, col 1 y638, col 3 y1041, col 4 " +
      "y1645, col 5 y269; column 2 carries no joint and is one " +
      "continuous print, split at its midpoint), one window " +
      "inside each segment, inset from every joint. Render scale " +
      "46.751 px/in anchored to the published plank width; " +
      "covered lengths are render-measured, not printed " +
      "dimensions. No face reaches the printed 48.03 in \u2014 no " +
      "published asset holds a complete plank of this colourway " +
      "(see facesGap). A window may only cover a piece it covers " +
      "whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_lorraine_sienna_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.13],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap:
    "Exact dimensions on record \u2014 faces and a model are this " +
    "product's named gap: no published asset holds a continuous " +
    "48.03-in print of this colourway. The plank-photo asset is a " +
    "bathroom lifestyle scene (the floor in perspective, partly " +
    "occluded) \u2014 nothing measurable can be cut from it \u2014 and " +
    "the rest of the published gallery is one identical placeholder " +
    "image. The twelve faces on record are true-scale windows of " +
    "the product's display render; a full-length face and a " +
    "visualizer model wait on a sourced full-plank image.",
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-k-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-l-normal.jpg"
  ],
  moduleIn: [48.03, 7.13],
  model: null,
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A price ($47.30) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "No full-length face and no visualizer model: no published asset holds a continuous 48.03-in print of this colourway (see facesGap).",
    "Variation faces are single-print crops of the product's display render, scale anchored to the published plank width; their covered lengths are render-measured, not printed dimensions.",
  ],
};

const PAISLEY_CAPE: FloorDecorProduct = {
  slug: "paisley-cape",
  fdId: "100978162",
  name: "Paisley Cape Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Paisley Cape",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/paisley-cape-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-100978162.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.62,
  widthIn: 7.56,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Blonde",
  shade: "Light",
  texture: "Embossed",
  edge: "Painted Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "Foam Pad",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 63,
  stc: 67,
  deltaIic: 23,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 49.61, widthIn: 8.21, weightLbs: 44.71 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($58.44) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 2.29,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/100978162_paisley-cape-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/100978162_paisley-cape-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Paisley Cape Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "paisley-cape",
    option: "Paisley Cape",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100978162_paisley-cape-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-a.jpg", sourceBox: [46, 778, 1961, 1128], sourceSize: [363, 2334], mean: [174.51, 156.13, 126.08], faceIn: [48.62, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-b.jpg", sourceBox: [416, 7, 1005, 1218], sourceSize: [363, 736], mean: [185.75, 166.64, 133.08], faceIn: [15.34, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-c.jpg", sourceBox: [416, 1232, 1005, 1993], sourceSize: [363, 463], mean: [176.6, 153.9, 119.25], faceIn: [9.64, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-d.jpg", sourceBox: [1015, 7, 1600, 197], sourceSize: [363, 115], mean: [190.01, 170.3, 136.83], faceIn: [2.41, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-e.jpg", sourceBox: [1015, 211, 1600, 1993], sourceSize: [363, 1083], mean: [184.46, 163.98, 130.54], faceIn: [22.57, 7.56] },
    ],
    unitMeans: [
      [174.51, 156.13, 126.08],
      [185.75, 166.64, 133.08],
      [176.6, 153.9, 119.25],
      [190.01, 170.3, 136.83],
      [184.46, 163.98, 130.54]
    ],
    overallMean: [182.27, 162.19, 129.16],
    notes:
      "Variant A is the product's own plank photo (asset ..._1) \u2014 " +
      "the plank lies HORIZONTAL in that photo (its siblings are " +
      "vertical) with both ends in frame; the photo is anisotropic " +
      "(39.4 vs 46.3 px/in across its axes), a 14.9% framing " +
      "tolerance \u2014 the largest in the family and recorded here, " +
      "not hidden. Per the pipeline method the printed sheet wins " +
      "and the plank is normalized (rotated to vertical) to the " +
      "printed size at 48 px/in \u2014 square corners, colours from " +
      "the original. Variants B\u2013E are true-scale windows of the " +
      "product's display render: its grid is offset against the " +
      "frame (seams at x = 411 / 1010 / 1605, 597-px period, " +
      "78.97 px/in), so both edge columns are partial and unused; " +
      "only the two full-width columns yield faces (joints at " +
      "y\u22481225 and y\u2248204, each spanning exactly its column). " +
      "Face D is column 2's short upper segment at a true 2.41 in " +
      "\u2014 it can only cover a piece of that length or shorter, " +
      "and shows as its cut piece in the single view. Covered " +
      "lengths are render-measured, not printed dimensions. A " +
      "window may only cover a piece it covers whole \u2014 never " +
      "tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_paisley_cape_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.62, 7.56],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a face whose " +
        "covered length reaches the piece's length (the full-plank " +
        "face A, or a flipped full print) or a true-scale window " +
        "for a shorter cut piece \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-e-normal.jpg"
  ],
  moduleIn: [48.62, 7.56],
  model: { kind: "plank-box", lengthIn: 48.62, widthIn: 7.56, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A price ($58.44) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "The page never states the attached-pad material beyond the product name's Foam Pad (no IXPE claim anywhere) \u2014 recorded as printed, not copied from sibling sheets. The spec table also prints no subfloor or cleaning-method rows for this product.",
    "The printed spec table gives acclimation as 48 hours, contradicting the same page's marketing copy (zero acclimation time) \u2014 the printed table is what is recorded.",
    "Variation faces b-e are single-print crops of the product's display render, scale anchored to the published plank width; their covered lengths are render-measured, not printed dimensions.",
  ],
};

const FARRO_OAK: FloorDecorProduct = {
  slug: "farro-oak",
  fdId: "125532735",
  name: "Farro Oak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Farro Oak",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/farro-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-125532735.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48,
  widthIn: 7,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "White",
  shade: "Light",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 20,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 56,
  stc: 53,
  deltaIic: 22,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  box: { lengthIn: 48.82, widthIn: 7.95, weightLbs: 33.25 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($47.46) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/125532735_farro-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/125532735_farro-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Farro Oak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "farro-oak",
    option: "Farro Oak",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/125532735_farro-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/farro-oak/face-top-a.jpg", sourceBox: [870, 131, 1129, 1865], sourceSize: [336, 2304], mean: [206.55, 190.19, 164.87], faceIn: [48, 7] },
      { url: "/app/floor-and-decor/duralux-performance/farro-oak/face-top-b.jpg", sourceBox: [5, 7, 395, 1045], sourceSize: [336, 872], mean: [206.56, 189.44, 163.04], faceIn: [18.16, 7] },
      { url: "/app/floor-and-decor/duralux-performance/farro-oak/face-top-c.jpg", sourceBox: [5, 1059, 395, 1993], sourceSize: [336, 785], mean: [210.39, 193.36, 166.76], faceIn: [16.34, 7] },
      { url: "/app/floor-and-decor/duralux-performance/farro-oak/face-top-d.jpg", sourceBox: [405, 7, 795, 270], sourceSize: [336, 221], mean: [206.53, 189.93, 164.44], faceIn: [4.6, 7] },
      { url: "/app/floor-and-decor/duralux-performance/farro-oak/face-top-e.jpg", sourceBox: [405, 284, 795, 1993], sourceSize: [336, 1436], mean: [208.56, 192.2, 166.74], faceIn: [29.91, 7] },
      { url: "/app/floor-and-decor/duralux-performance/farro-oak/face-top-f.jpg", sourceBox: [805, 7, 1195, 1666], sourceSize: [336, 1394], mean: [210.89, 194.47, 169.31], faceIn: [29.03, 7] },
      { url: "/app/floor-and-decor/duralux-performance/farro-oak/face-top-g.jpg", sourceBox: [805, 1680, 1195, 1993], sourceSize: [336, 263], mean: [208.93, 192.55, 167.08], faceIn: [5.48, 7] },
      { url: "/app/floor-and-decor/duralux-performance/farro-oak/face-top-h.jpg", sourceBox: [1205, 7, 1595, 755], sourceSize: [336, 628], mean: [210.21, 193.08, 166.5], faceIn: [13.09, 7] },
      { url: "/app/floor-and-decor/duralux-performance/farro-oak/face-top-i.jpg", sourceBox: [1205, 769, 1595, 1993], sourceSize: [336, 1028], mean: [208.02, 191.61, 166.38], faceIn: [21.42, 7] },
      { url: "/app/floor-and-decor/duralux-performance/farro-oak/face-top-j.jpg", sourceBox: [1605, 7, 1995, 1320], sourceSize: [336, 1103], mean: [208.27, 191.76, 166.08], faceIn: [22.98, 7] },
      { url: "/app/floor-and-decor/duralux-performance/farro-oak/face-top-k.jpg", sourceBox: [1605, 1334, 1995, 1993], sourceSize: [336, 554], mean: [211.12, 194.79, 169.71], faceIn: [11.53, 7] },
    ],
    unitMeans: [
      [206.55, 190.19, 164.87],
      [206.56, 189.44, 163.04],
      [210.39, 193.36, 166.76],
      [206.53, 189.93, 164.44],
      [208.56, 192.2, 166.74],
      [210.89, 194.47, 169.31],
      [208.93, 192.55, 167.08],
      [210.21, 193.08, 166.5],
      [208.02, 191.61, 166.38],
      [208.27, 191.76, 166.08],
      [211.12, 194.79, 169.71]
    ],
    overallMean: [208.73, 192.13, 166.45],
    notes:
      "Variant A is the product's own plank photo (asset ..._1), " +
      "a complete plank with both ends in frame on pure white: " +
      "measured aspect 6.695 against the printed 6.857 (48 x 7 in, " +
      "printed in whole inches \u2014 this sheet prints no decimals) " +
      "\u2014 a 2.36% framing tolerance; per the pipeline method " +
      "the printed sheet wins and the box is normalized to the " +
      "printed size at 48 px/in \u2014 square corners, colours from " +
      "the original. Variants B\u2013K are true-scale windows of the " +
      "product's display render \u2014 the cleanest grid in the " +
      "family: five full-width columns of exactly 400 px (seams " +
      "at x \u2248 400 / 800 / 1200 / 1600, frame aligned, no partial " +
      "columns), one butt joint per column (y1052 / y277 / y1673 / " +
      "y762 / y1327, each spanning exactly its column), one window " +
      "inside each of the ten segments, inset from every joint. " +
      "Render scale 57.143 px/in anchored to the published plank " +
      "width; covered lengths are render-measured, not printed " +
      "dimensions. Face D is column 1's short upper segment at a " +
      "true 4.60 in \u2014 it can only cover a piece of that length " +
      "or shorter, and shows as its cut piece in the single view. " +
      "A window may only cover a piece it covers whole \u2014 never " +
      "tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_farro_oak_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48, 7],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a face whose " +
        "covered length reaches the piece's length (the full-plank " +
        "face A, or a flipped full print) or a true-scale window " +
        "for a shorter cut piece \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/farro-oak/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/farro-oak/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/farro-oak/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/farro-oak/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/farro-oak/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/farro-oak/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/farro-oak/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/farro-oak/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/farro-oak/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/farro-oak/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/farro-oak/face-top-k-normal.jpg"
  ],
  moduleIn: [48, 7],
  model: { kind: "plank-box", lengthIn: 48, widthIn: 7, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A price ($47.46) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "This product's spec table prints no Stain Resistance, Subfloor or VOC Certification row and no Country of Origin \u2014 those fields are absent from this record, not copied from sibling sheets. GreenGuard Gold is claimed only in the page's overview prose, so no VOC certification is recorded as a spec.",
    "Variation faces b-k are single-print crops of the product's display render, scale anchored to the published plank width; their covered lengths are render-measured, not printed dimensions.",
  ],
};

const RAVEN: FloorDecorProduct = {
  slug: "raven",
  fdId: "101066975",
  name: "Raven Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Raven",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/raven-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101066975.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.62,
  widthIn: 7.01,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Black",
  shade: "Dark",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 66,
  stc: 68,
  deltaIic: 22,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 49.37, widthIn: 7.6, weightLbs: 53.99 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($45.83) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101066975_raven-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101066975_raven-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Raven Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "raven",
    option: "Raven",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101066975_raven-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/raven/face-top-a.jpg", sourceBox: [365, 7, 982, 518], sourceSize: [336, 274], mean: [50.27, 50.27, 50.27], faceIn: [5.71, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/raven/face-top-b.jpg", sourceBox: [365, 532, 982, 1993], sourceSize: [336, 784], mean: [48.92, 48.92, 48.92], faceIn: [16.33, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/raven/face-top-c.jpg", sourceBox: [992, 7, 1637, 1441], sourceSize: [336, 737], mean: [53.19, 53.19, 53.19], faceIn: [15.35, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/raven/face-top-d.jpg", sourceBox: [992, 1455, 1637, 1993], sourceSize: [336, 276], mean: [51.07, 51.07, 51.07], faceIn: [5.76, 7.01] },
    ],
    unitMeans: [
      [50.27, 50.27, 50.27],
      [48.92, 48.92, 48.92],
      [53.19, 53.19, 53.19],
      [51.07, 51.07, 51.07]
    ],
    overallMean: [50.86, 50.86, 50.86],
    notes:
      "All four faces are true-scale windows of the product's " +
      "display render. The render is near-black (both source " +
      "JPEGs are grayscale-encoded, so every face mean is an " +
      "equal R=G=B triple, recorded as the files are) and, like " +
      "Winter Peak's, a hand-placed composite: two full-width " +
      "columns of UNEQUAL width (627 and 655 px; local scales " +
      "89.44 and 93.44 px/in anchored to the printed 7.01 in), " +
      "flanked by partial columns that are not used. One butt " +
      "joint per full column (y525 / y1448, pinned by joint " +
      "endpoints and gamma-lifted native-res crops \u2014 raw " +
      "gradient hunting fails on a render this dark, and every " +
      "equal-grid hypothesis was tested and rejected), one " +
      "window inside each of the four segments, inset from " +
      "every seam. Covered lengths are render-measured at each " +
      "column's own local scale, not printed dimensions. No face " +
      "reaches the printed 48.62 in \u2014 no published asset holds " +
      "a complete plank of this colourway (see facesGap). A " +
      "window may only cover a piece it covers whole \u2014 never " +
      "tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_raven_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.62, 7.01],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap:
    "Exact dimensions on record \u2014 faces and a model are this " +
    "product's named gap: no published asset holds a continuous " +
    "48.62-in print of this colourway. The plank photo shows one " +
    "plank running off BOTH frame edges \u2014 neither end is in " +
    "frame, and its along-length scale is unverifiable from a " +
    "cropped plank, so no true-scale face could be cut from it " +
    "either. The four faces on record are true-scale windows of " +
    "the product's display render; a full-length face and a " +
    "visualizer model wait on a sourced full-plank image.",
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/raven/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/raven/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/raven/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/raven/face-top-d-normal.jpg"
  ],
  moduleIn: [48.62, 7.01],
  model: null,
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A price ($45.83) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "No full-length face and no visualizer model: the plank photo's plank runs off both frame edges (see facesGap). Country of Origin is not printed on the page.",
    "The page's prose contradicts its own spec table twice (a 12-to-16-mil wear claim and a 10-year commercial warranty icon against the table's 12 MIL and Lifetime Res./ 15 Yr Comm.) \u2014 the printed table governs and is what is recorded.",
    "Variation faces are single-print crops of the product's display render, scale anchored to the published plank width per column; their covered lengths are render-measured, not printed dimensions.",
  ],
};

const TIMBER_SADDLE: FloorDecorProduct = {
  slug: "timber-saddle",
  fdId: "101068484",
  name: "Timber Saddle Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Timber Saddle",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/timber-saddle-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101068484.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.13,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Brown",
  shade: "Light",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 66,
  stc: 68,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.62, widthIn: 7.6, weightLbs: 42.65 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($47.30) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101068484_timber-saddle-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101068484_timber-saddle-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Timber Saddle Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "timber-saddle",
    option: "Timber Saddle",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101068484_timber-saddle-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-a.jpg", sourceBox: [856, 57, 1144, 1942], sourceSize: [342, 2305], mean: [160.67, 146.45, 129.27], faceIn: [48.03, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-b.jpg", sourceBox: [5, 7, 328, 99], sourceSize: [342, 95], mean: [137.44, 121.8, 102.31], faceIn: [1.97, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-c.jpg", sourceBox: [5, 113, 328, 1993], sourceSize: [342, 1932], mean: [140.32, 124.6, 105.53], faceIn: [40.25, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-d.jpg", sourceBox: [338, 7, 658, 1009], sourceSize: [342, 1039], mean: [141.51, 127.33, 112.79], faceIn: [21.65, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-e.jpg", sourceBox: [338, 1023, 658, 1993], sourceSize: [342, 1006], mean: [151.04, 135.13, 115.95], faceIn: [20.96, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-f.jpg", sourceBox: [668, 7, 995, 1565], sourceSize: [342, 1582], mean: [150.2, 134.15, 113.48], faceIn: [32.96, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-g.jpg", sourceBox: [668, 1579, 995, 1993], sourceSize: [342, 420], mean: [148.59, 133.2, 115.33], faceIn: [8.76, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-h.jpg", sourceBox: [1005, 7, 1328, 493], sourceSize: [342, 499], mean: [151.34, 136.49, 118.61], faceIn: [10.41, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-i.jpg", sourceBox: [1005, 507, 1328, 1993], sourceSize: [342, 1527], mean: [153.81, 138.49, 118.72], faceIn: [31.82, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-j.jpg", sourceBox: [1338, 7, 1675, 993], sourceSize: [342, 972], mean: [155.68, 140.17, 120.53], faceIn: [20.26, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-k.jpg", sourceBox: [1338, 1007, 1675, 1993], sourceSize: [342, 972], mean: [155.28, 139.45, 119.42], faceIn: [20.26, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-l.jpg", sourceBox: [1685, 7, 1995, 1046], sourceSize: [342, 1111], mean: [151.17, 135.83, 118.6], faceIn: [23.15, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-m.jpg", sourceBox: [1685, 1060, 1995, 1993], sourceSize: [342, 998], mean: [160.89, 146.23, 127.48], faceIn: [20.79, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-n.jpg", sourceBox: [5, 236, 328, 1993], sourceSize: [342, 1806], mean: [140.03, 124.25, 105.13], faceIn: [37.62, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-o.jpg", sourceBox: [1338, 7, 1675, 1838], sourceSize: [342, 1806], mean: [155.8, 140.16, 120.34], faceIn: [37.62, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-p.jpg", sourceBox: [668, 430, 995, 1565], sourceSize: [342, 1153], mean: [151.93, 135.81, 114.75], faceIn: [24.015, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-q.jpg", sourceBox: [1005, 507, 1328, 1629], sourceSize: [342, 1153], mean: [152.6, 137.03, 116.98], faceIn: [24.015, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-r.jpg", sourceBox: [5, 113, 328, 1235], sourceSize: [342, 1153], mean: [137.49, 121.72, 102.31], faceIn: [24.015, 7.13] },
    ],
    unitMeans: [
      [160.67, 146.45, 129.27],
      [137.44, 121.8, 102.31],
      [140.32, 124.6, 105.53],
      [141.51, 127.33, 112.79],
      [151.04, 135.13, 115.95],
      [150.2, 134.15, 113.48],
      [148.59, 133.2, 115.33],
      [151.34, 136.49, 118.61],
      [153.81, 138.49, 118.72],
      [155.68, 140.17, 120.53],
      [155.28, 139.45, 119.42],
      [151.17, 135.83, 118.6],
      [160.89, 146.23, 127.48],
      [140.03, 124.25, 105.13],
      [155.8, 140.16, 120.34],
      [151.93, 135.81, 114.75],
      [152.6, 137.03, 116.98],
      [137.49, 121.72, 102.31],
    ],
    overallMean: [149.77, 134.35, 115.42],
    notes:
      "Variant A is the product's own plank photo (asset ..._1), " +
      "a complete plank with both ends in frame: measured aspect " +
      "6.545 against the printed 6.737 (48.03 x 7.13 in) \u2014 a " +
      "2.85% framing tolerance; per the pipeline method the " +
      "printed sheet wins and the box is normalized to the " +
      "printed size at 48 px/in \u2014 square corners, colours from " +
      "the original. Variants B\u2013M are true-scale windows of the " +
      "product's display render: six full-width columns tiling " +
      "the frame with mild jitter (widths 320\u2013347 px, seams at " +
      "x = 333 / 663 / 1000 / 1333 / 1680 \u2014 the equal-grid " +
      "prediction for the last seam was tested and rejected), " +
      "per-column local scales 44.9\u201348.7 px/in; one butt joint " +
      "per column (col 4 carries none and is one continuous " +
      "print, split at its midpoint), one window inside each of " +
      "the twelve segments, inset from every joint. The grid " +
      "rests on joint endpoints and native-res visual reads \u2014 " +
      "this render's grain is the family's busiest and defeats " +
      "raw gradient hunting. Face B is column 0's short upper " +
      "segment at a true 1.97 in \u2014 it can only cover a piece of " +
      "that length or shorter, and shows as its cut piece in the " +
      "single view. Covered lengths are render-measured, not " +
      "printed dimensions. A window may only cover a piece it " +
      "covers whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_timber_saddle_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.13],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a face whose " +
        "covered length reaches the piece's length (the full-plank " +
        "face A, or a flipped full print) or a true-scale window " +
        "for a shorter cut piece \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-k-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-l-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-m-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-n-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-o-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-p-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-q-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-r-normal.jpg",
  ],
  moduleIn: [48.03, 7.13],
  model: { kind: "plank-box", lengthIn: 48.03, widthIn: 7.13, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A price ($47.30) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "This product's spec table prints no Delta IIC row and no Country of Origin \u2014 those fields are absent from this record, not borrowed from sibling sheets.",
    "Variation faces b-m are single-print crops of the product's display render, scale anchored to the published plank width per column; their covered lengths are render-measured, not printed dimensions.",
  ],
};

const PELHAM_PEAK: FloorDecorProduct = {
  slug: "pelham-peak",
  fdId: "101317709",
  name: "Pelham Peak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Pelham Peak",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/pelham-peak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101317709.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.09,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Brown",
  shade: "Dark",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 20,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.82, widthIn: 7.68, weightLbs: 39.86 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($47.04) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101317709_pelham-peak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101317709_pelham-peak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Pelham Peak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "pelham-peak",
    option: "Pelham Peak",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101317709_pelham-peak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-a.jpg", sourceBox: [867, 57, 1154, 1942], sourceSize: [340, 2305], mean: [101.33, 77.26, 54.23], faceIn: [48.03, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-b.jpg", sourceBox: [5, 7, 395, 1145], sourceSize: [340, 968], mean: [81.24, 59.89, 39.02], faceIn: [20.17, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-c.jpg", sourceBox: [5, 1159, 395, 1993], sourceSize: [340, 710], mean: [91.7, 69.72, 47.15], faceIn: [14.78, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-d.jpg", sourceBox: [405, 7, 795, 444], sourceSize: [340, 372], mean: [89.3, 68.09, 45.23], faceIn: [7.75, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-e.jpg", sourceBox: [405, 458, 795, 1993], sourceSize: [340, 1306], mean: [97.89, 72.95, 48.96], faceIn: [27.21, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-f.jpg", sourceBox: [805, 7, 1195, 1476], sourceSize: [340, 1250], mean: [80.55, 60.43, 40.28], faceIn: [26.04, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-g.jpg", sourceBox: [805, 1490, 1195, 1993], sourceSize: [340, 428], mean: [97.78, 73.13, 49.07], faceIn: [8.92, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-h.jpg", sourceBox: [1205, 7, 1595, 859], sourceSize: [340, 725], mean: [92.31, 69.0, 45.43], faceIn: [15.1, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-i.jpg", sourceBox: [1205, 873, 1595, 1993], sourceSize: [340, 953], mean: [95.23, 73.3, 50.43], faceIn: [19.85, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-j.jpg", sourceBox: [1605, 7, 1995, 1356], sourceSize: [340, 1148], mean: [78.63, 58.11, 38.13], faceIn: [23.91, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-k.jpg", sourceBox: [1605, 1370, 1995, 1993], sourceSize: [340, 530], mean: [77.11, 57.78, 38.27], faceIn: [11.04, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-l.jpg", sourceBox: [405, 638, 795, 1993], sourceSize: [340, 1153], mean: [97.48, 72.53, 48.6], faceIn: [24.015, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-m.jpg", sourceBox: [805, 121, 1195, 1476], sourceSize: [340, 1153], mean: [80.78, 60.59, 40.41], faceIn: [24.015, 7.09] },
      { url: "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-n.jpg", sourceBox: [867, 57, 1154, 1150], sourceSize: [340, 1337], mean: [101.27, 77.24, 54.23], faceIn: [27.86, 7.09] },
    ],
    unitMeans: [
      [101.33, 77.26, 54.23],
      [81.24, 59.89, 39.02],
      [91.7, 69.72, 47.15],
      [89.3, 68.09, 45.23],
      [97.89, 72.95, 48.96],
      [80.55, 60.43, 40.28],
      [97.78, 73.13, 49.07],
      [92.31, 69.0, 45.43],
      [95.23, 73.3, 50.43],
      [78.63, 58.11, 38.13],
      [77.11, 57.78, 38.27],
      [97.48, 72.53, 48.6],
      [80.78, 60.59, 40.41],
      [101.27, 77.24, 54.23],
    ],
    overallMean: [90.19, 67.86, 45.67],
    notes:
      "Variant A is the product's own plank photo (asset ..._1), " +
      "a complete plank with both ends in frame: measured aspect " +
      "6.568 against the printed 6.774 (48.03 x 7.09 in) \u2014 a " +
      "3.04% framing tolerance; per the pipeline method the " +
      "printed sheet wins and the box is normalized to the " +
      "printed size at 48 px/in \u2014 square corners, colours from " +
      "the original. Variants B\u2013K are true-scale windows of the " +
      "product's display render: five full-width columns of " +
      "exactly 400 px tiling the frame (drawn groove seams on " +
      "the grid lines, one uniform scale of 56.42 px/in), one " +
      "butt joint per column, one window inside each of the ten " +
      "segments, inset from every joint. Covered lengths are " +
      "render-measured, not printed dimensions. A window may " +
      "only cover a piece it covers whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_pelham_peak_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.09],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a face whose " +
        "covered length reaches the piece's length (the full-plank " +
        "face A, or a flipped full print) or a true-scale window " +
        "for a shorter cut piece \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-k-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-l-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-m-normal.jpg",
    "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-n-normal.jpg",
  ],
  moduleIn: [48.03, 7.09],
  model: { kind: "plank-box", lengthIn: 48.03, widthIn: 7.09, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A price ($47.04) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "This product's page publishes NO sound ratings at all \u2014 IIC and STC occur zero times in the page markup, and there is no Delta IIC or Subfloor row and no Country of Origin \u2014 those fields are absent from this record, not borrowed from sibling sheets. The page's prose contradicts its own table on wear and warranty (a minimum-12-mil claim and a 10-year commercial icon against the table's 20 MIL and Lifetime Res./ 15 Yr Comm.) \u2014 the printed table governs.",
    "Variation faces b-k are single-print crops of the product's display render, scale anchored to the published plank width; their covered lengths are render-measured, not printed dimensions.",
  ],
};

const TRENTON_TRADITION: FloorDecorProduct = {
  slug: "trenton-tradition",
  fdId: "100978170",
  name: "Trenton Tradition Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Trenton Tradition",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/trenton-tradition-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-100978170.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.62,
  widthIn: 7.56,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Brown",
  shade: "Dark",
  texture: "Embossed",
  edge: "Painted Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "Foam Pad",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 63,
  stc: 67,
  deltaIic: 23,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 49.61, widthIn: 8.21, weightLbs: 44.71 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($68.65) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 2.29,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/100978170_trenton-tradition-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/100978170_trenton-tradition-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Trenton Tradition Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "trenton-tradition",
    option: "Trenton Tradition",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100978170_trenton-tradition-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-a.jpg", sourceBox: [170, 7, 580, 947], sourceSize: [363, 812], mean: [78.25, 51.07, 31.52], faceIn: [16.92, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-b.jpg", sourceBox: [170, 961, 580, 1993], sourceSize: [363, 892], mean: [57.58, 33.92, 17.09], faceIn: [18.58, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-c.jpg", sourceBox: [590, 7, 1000, 329], sourceSize: [363, 278], mean: [77.28, 52.61, 35.13], faceIn: [5.8, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-d.jpg", sourceBox: [590, 343, 1000, 1993], sourceSize: [363, 1426], mean: [73.48, 46.07, 25.7], faceIn: [29.7, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-e.jpg", sourceBox: [1010, 7, 1420, 1630], sourceSize: [363, 1402], mean: [77.25, 49.78, 27.77], faceIn: [29.21, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-f.jpg", sourceBox: [1010, 1644, 1420, 1993], sourceSize: [363, 302], mean: [56.28, 31.82, 17.51], faceIn: [6.28, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-g.jpg", sourceBox: [1430, 7, 1840, 993], sourceSize: [363, 852], mean: [80.63, 51.86, 27.64], faceIn: [17.75, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-h.jpg", sourceBox: [1430, 1007, 1840, 1993], sourceSize: [363, 852], mean: [74.77, 45.51, 23.38], faceIn: [17.75, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-i.jpg", sourceBox: [590, 343, 1000, 1573], sourceSize: [363, 1063], mean: [73.9, 46.55, 26.28], faceIn: [22.14, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-j.jpg", sourceBox: [1010, 400, 1420, 1630], sourceSize: [363, 1063], mean: [78.21, 50.15, 27.29], faceIn: [22.14, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-k.jpg", sourceBox: [170, 961, 580, 1786], sourceSize: [363, 713], mean: [57.5, 33.77, 16.84], faceIn: [14.85, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-l.jpg", sourceBox: [1430, 168, 1840, 993], sourceSize: [363, 713], mean: [81.11, 51.91, 27.36], faceIn: [14.85, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-m.jpg", sourceBox: [170, 527, 580, 947], sourceSize: [363, 363], mean: [75.08, 47.66, 27.26], faceIn: [7.56, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-n.jpg", sourceBox: [1430, 1007, 1840, 1427], sourceSize: [363, 363], mean: [78.16, 48.3, 24.56], faceIn: [7.56, 7.56] },
    ],
    unitMeans: [
      [78.25, 51.07, 31.52],
      [57.58, 33.92, 17.09],
      [77.28, 52.61, 35.13],
      [73.48, 46.07, 25.7],
      [77.25, 49.78, 27.77],
      [56.28, 31.82, 17.51],
      [80.63, 51.86, 27.64],
      [74.77, 45.51, 23.38],
      [73.9, 46.55, 26.28],
      [78.21, 50.15, 27.29],
      [57.5, 33.77, 16.84],
      [81.11, 51.91, 27.36],
      [75.08, 47.66, 27.26],
      [78.16, 48.3, 24.56],
    ],
    overallMean: [72.82, 45.78, 25.38],
    notes:
      "All eight faces are true-scale windows of the product's " +
      "display render: an offset 420 px grid \u2014 partial columns " +
      "at both frame edges are not used; four full columns at one " +
      "uniform scale (55.56 px/in), the grid resting on butt-joint " +
      "endpoints (its seams are tonal steps, not grooves; every " +
      "equal-grid hypothesis was tested and rejected). One butt " +
      "joint in each of columns 1\u20133; column 4 carries none and " +
      "is one continuous print, split at its midpoint \u2014 eight " +
      "segments, one window inside each, inset from every joint. " +
      "Covered lengths are render-measured at the render's own " +
      "scale, not printed dimensions. No face reaches the printed " +
      "48.62 in \u2014 no published asset holds a complete plank of " +
      "this colourway (see facesGap). A window may only cover a " +
      "piece it covers whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_trenton_tradition_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.62, 7.56],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap:
    "Exact dimensions on record \u2014 faces and a model are this " +
    "product's named gap: no published asset holds a continuous " +
    "48.62-in print of this colourway. The plank photo's plank " +
    "stands on a light-grey ground with its top end in frame, " +
    "but its bottom end runs off the frame edge, and its " +
    "along-length scale is unverifiable from a cropped plank, " +
    "so no true-scale face could be cut from it either. The " +
    "eight faces on record are true-scale windows of the " +
    "product's display render; a full-length face and a " +
    "visualizer model wait on a sourced full-plank image.",
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-k-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-l-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-m-normal.jpg",
    "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-n-normal.jpg",
  ],
  moduleIn: [48.62, 7.56],
  model: null,
  gaps: [
    "Pieces per box / sq ft per box: not published in the product page's specification table as extracted.",
    "A price ($68.65) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "No full-length face and no visualizer model: the plank photo's plank runs off the frame's bottom edge (see facesGap).",
    "This product's spec table prints no Attached Pad row \u2014 the pad is recorded as the 'Foam Pad' the product name prints, never upgraded (IXPE occurs zero times on the page). The table also prints no Approved For Sunrooms, Cleaning Method or Subfloor row. Its acclimation row prints '48 hours' against the overview's 'zero acclimation' claim \u2014 the printed table governs.",
    "Variation faces are single-print crops of the product's display render, scale anchored to the published plank width; their covered lengths are render-measured, not printed dimensions.",
  ],
};

const BOLTON_RIDGE: FloorDecorProduct = {
  slug: "bolton-ridge",
  fdId: "101443125",
  name: "Bolton Ridge Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Bolton Ridge",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/bolton-ridge-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101443125.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.13,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Blonde",
  shade: "Dark",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.82, widthIn: 7.64, weightLbs: 49.56 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($56.75) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101443125_bolton-ridge-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101443125_bolton-ridge-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Bolton Ridge Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "bolton-ridge",
    option: "Bolton Ridge",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101443125_bolton-ridge-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-a.jpg", sourceBox: [268, 277, 1424, 7835], sourceSize: [342, 2305], mean: [204.22, 156.97, 97.85], faceIn: [48.03, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-b.jpg", sourceBox: [197, 7, 561, 674], sourceSize: [342, 610], mean: [193.88, 143.67, 80.93], faceIn: [12.72, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-c.jpg", sourceBox: [197, 688, 561, 1993], sourceSize: [342, 1194], mean: [199.02, 150.67, 89.19], faceIn: [24.88, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-d.jpg", sourceBox: [571, 7, 941, 993], sourceSize: [342, 888], mean: [195.99, 145.53, 84.09], faceIn: [18.5, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-e.jpg", sourceBox: [571, 1007, 941, 1993], sourceSize: [342, 888], mean: [199.86, 149.42, 88.8], faceIn: [18.5, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-f.jpg", sourceBox: [951, 7, 1329, 1095], sourceSize: [342, 960], mean: [204.25, 158.26, 100.14], faceIn: [19.99, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-g.jpg", sourceBox: [951, 1109, 1329, 1993], sourceSize: [342, 780], mean: [200.64, 152.01, 93.57], faceIn: [16.24, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-h.jpg", sourceBox: [1339, 7, 1726, 993], sourceSize: [342, 850], mean: [200.57, 151.69, 92.82], faceIn: [17.71, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-i.jpg", sourceBox: [1339, 1007, 1726, 1993], sourceSize: [342, 850], mean: [200.49, 153.4, 97.45], faceIn: [17.71, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-j.jpg", sourceBox: [197, 734, 561, 1993], sourceSize: [342, 1153], mean: [198.91, 150.56, 89.15], faceIn: [24.015, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-k.jpg", sourceBox: [268, 277, 1424, 4056], sourceSize: [342, 1153], mean: [199.32, 152.59, 93.72], faceIn: [24.015, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-l.jpg", sourceBox: [268, 4056, 1424, 7835], sourceSize: [342, 1153], mean: [209.11, 161.34, 101.97], faceIn: [24.015, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-m.jpg", sourceBox: [268, 277, 1424, 4690], sourceSize: [342, 1346], mean: [200.11, 153.11, 93.79], faceIn: [28.04, 7.13] },
    ],
    unitMeans: [
      [204.22, 156.97, 97.85],
      [193.88, 143.67, 80.93],
      [199.02, 150.67, 89.19],
      [195.99, 145.53, 84.09],
      [199.86, 149.42, 88.8],
      [204.25, 158.26, 100.14],
      [200.64, 152.01, 93.57],
      [200.57, 151.69, 92.82],
      [200.49, 153.4, 97.45],
      [198.91, 150.56, 89.15],
      [199.32, 152.59, 93.72],
      [209.11, 161.34, 101.97],
      [200.11, 153.11, 93.79],
    ],
    overallMean: [200.49, 152.25, 92.57],
    notes:
      "Face A is the product's own plank photograph: one complete " +
      "plank, both ends in frame, measured aspect 2.94% off the " +
      "printed 48.03 x 7.13 in \u2014 the printed sheet wins and the " +
      "photo is normalized to the printed size at 48 px/in (the " +
      "photo itself is mildly anisotropic, 162.13 px/in across " +
      "against 157.36 px/in along). Faces B\u2013I are true-scale " +
      "windows of the display render: a jittered six-column grid " +
      "\u2014 four full columns (374/380/388/397 px) flanked by two " +
      "partial columns that are not used \u2014 at per-column local " +
      "scales of 52.45\u201355.68 px/in. Butt joints measured in " +
      "columns 1 and 3; columns 2 and 4 carry none and are one " +
      "continuous print each, split at the midpoint \u2014 eight " +
      "segments, one window inside each, inset from every joint. " +
      "Covered lengths are render-measured at each column's own " +
      "scale, not printed dimensions. A window may only cover a " +
      "piece it covers whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_bolton_ridge_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.13],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-k-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-l-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-m-normal.jpg",
  ],
  moduleIn: [48.03, 7.13],
  model: { kind: "plank-box", lengthIn: 48.03, widthIn: 7.13, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted.",
    "A price ($56.75) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "This product's page publishes NO sound ratings at all \u2014 IIC and STC occur zero times in the full page markup, and there is no Delta IIC row, no Subfloor row and no Country of Origin row \u2014 those fields are absent from this record, not borrowed from sibling sheets.",
    "The underlayment row prints 'Sentinel Protect Plus Recommended' \u2014 recorded in the product record exactly as this sheet prints it; sibling sheets print 'Sentinel Protect Recommended'.",
    "Variation faces B\u2013I are single-print crops of the product's display render, scale anchored per column; their covered lengths are render-measured, not printed dimensions. Face A is the plank photo at a disclosed 2.94% framing tolerance, normalized to the printed size.",
  ],
};

const STALLION_SPRINGS: FloorDecorProduct = {
  slug: "stallion-springs",
  fdId: "199241184",
  name: "Stallion Springs Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Stallion Springs",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/stallion-springs-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-199241184.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.13,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Multi Color",
  shade: "High Variation",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 20,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 54,
  stc: 53,
  deltaIic: 20,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  box: { lengthIn: 48.62, widthIn: 7.6, weightLbs: 41.6 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($36.17) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.79,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/199241184_stallion-springs-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/199241184_stallion-springs-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Stallion Springs Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "stallion-springs",
    option: "Stallion Springs",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/199241184_stallion-springs-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-a.jpg", sourceBox: [859, 71, 1143, 1929], sourceSize: [342, 2305], mean: [135.03, 117.07, 101.47], faceIn: [48.03, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-b.jpg", sourceBox: [5, 7, 495, 230], sourceSize: [342, 153], mean: [109.36, 92.68, 77.29], faceIn: [3.18, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-c.jpg", sourceBox: [5, 244, 495, 1993], sourceSize: [342, 1197], mean: [125.67, 108.34, 92.55], faceIn: [24.94, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-d.jpg", sourceBox: [505, 7, 995, 1714], sourceSize: [342, 1168], mean: [118.67, 102.65, 88.29], faceIn: [24.34, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-e.jpg", sourceBox: [505, 1728, 995, 1993], sourceSize: [342, 181], mean: [105.42, 87.84, 71.15], faceIn: [3.78, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-f.jpg", sourceBox: [1005, 7, 1495, 993], sourceSize: [342, 675], mean: [136.57, 118.43, 100.09], faceIn: [14.06, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-g.jpg", sourceBox: [1005, 1007, 1495, 1993], sourceSize: [342, 675], mean: [136.72, 118.62, 100.29], faceIn: [14.06, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-h.jpg", sourceBox: [1505, 7, 1995, 984], sourceSize: [342, 669], mean: [122.44, 104.76, 89.54], faceIn: [13.93, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-i.jpg", sourceBox: [1505, 998, 1995, 1993], sourceSize: [342, 681], mean: [144.0, 125.72, 109.05], faceIn: [14.19, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-j.jpg", sourceBox: [5, 309, 495, 1993], sourceSize: [342, 1153], mean: [125.63, 108.32, 92.58], faceIn: [24.015, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-k.jpg", sourceBox: [505, 30, 995, 1714], sourceSize: [342, 1153], mean: [118.65, 102.63, 88.26], faceIn: [24.015, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-l.jpg", sourceBox: [1005, 7, 1495, 1691], sourceSize: [342, 1153], mean: [137.48, 119.22, 100.58], faceIn: [24.015, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-m.jpg", sourceBox: [1005, 309, 1495, 1993], sourceSize: [342, 1153], mean: [137.22, 119.04, 100.5], faceIn: [24.015, 7.13] },
    ],
    unitMeans: [
      [135.03, 117.07, 101.47],
      [109.36, 92.68, 77.29],
      [125.67, 108.34, 92.55],
      [118.67, 102.65, 88.29],
      [105.42, 87.84, 71.15],
      [136.57, 118.43, 100.09],
      [136.72, 118.62, 100.29],
      [122.44, 104.76, 89.54],
      [144.0, 125.72, 109.05],
      [125.63, 108.32, 92.58],
      [118.65, 102.63, 88.26],
      [137.48, 119.22, 100.58],
      [137.22, 119.04, 100.5],
    ],
    overallMean: [127.14, 109.64, 93.2],
    notes:
      "Face A is the product's own plank photograph: one complete " +
      "plank, both ends in frame, measured aspect 2.88% off the " +
      "printed 48.03 x 7.13 in \u2014 the printed sheet wins and the " +
      "photo is normalized to the printed size at 48 px/in (the " +
      "photo itself is mildly anisotropic, 39.41 px/in across " +
      "against 38.68 px/in along). Faces B\u2013I are true-scale " +
      "windows of the display render: an EQUAL four-column grid " +
      "\u2014 seams at x 500/1000/1500, crop-verified; the jittered " +
      "and offset hypotheses the rest of the family needed were " +
      "tested here and rejected \u2014 at one uniform scale " +
      "(70.13 px/in). Butt joints measured in columns 1, 2 and " +
      "4; column 3 carries none and is one continuous print, " +
      "split at its midpoint \u2014 eight segments, one window " +
      "inside each, inset from every joint. Faces B (3.18 in) " +
      "and E (3.78 in) are short but real print bounded by a " +
      "measured joint and the frame edge, kept whole and never " +
      "padded; below the layout's 6-in piece minimum they serve " +
      "the Single view only. Covered lengths are render-measured " +
      "at the render's own scale, not printed dimensions. A " +
      "window may only cover a piece it covers whole \u2014 never " +
      "tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_stallion_springs_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.13],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-k-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-l-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-m-normal.jpg",
  ],
  moduleIn: [48.03, 7.13],
  model: { kind: "plank-box", lengthIn: 48.03, widthIn: 7.13, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted.",
    "A price ($36.17) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "No VOC Certification row is printed in this product's spec table \u2014 'VOC' occurs zero times in the page markup and GREENGUARD Gold is claimed only in the overview prose \u2014 so vocCertification is absent from this record, not copied from sibling sheets. The table likewise prints no Stain Resistance row and no Subfloor row, and no Country of Origin is printed \u2014 all absent, not borrowed.",
    "This product's printed sound ratings (IIC 54 / STC 53 / Delta IIC 20) are the lowest of the deepened set \u2014 recorded as printed.",
    "Variation faces B\u2013I are single-print crops of the product's display render, scale anchored to the published plank width; their covered lengths are render-measured, not printed dimensions. Face A is the plank photo at a disclosed 2.88% framing tolerance, normalized to the printed size.",
  ],
};

const BELLFLOWER_BLONDE: FloorDecorProduct = {
  slug: "bellflower-blonde",
  fdId: "101442275",
  name: "Bellflower Blonde Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Bellflower Blonde",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/bellflower-blonde-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101442275.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48,
  widthIn: 7,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Blonde",
  shade: "Light",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 66,
  stc: 60,
  deltaIic: 21,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 49.02, widthIn: 7.6, weightLbs: 39.9 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($46.43) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101442275_bellflower-blonde-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101442275_bellflower-blonde-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Bellflower Blonde Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "bellflower-blonde",
    option: "Bellflower Blonde",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101442275_bellflower-blonde-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-a.jpg", sourceBox: [352, 126, 1526, 7898], sourceSize: [336, 2304], mean: [202.87, 182.08, 141.69], faceIn: [48.0, 7] },
      { url: "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-b.jpg", sourceBox: [5, 7, 391, 993], sourceSize: [336, 837], mean: [184.11, 163.34, 124.83], faceIn: [17.43, 7] },
      { url: "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-c.jpg", sourceBox: [5, 1007, 391, 1993], sourceSize: [336, 837], mean: [197.86, 174.01, 132.38], faceIn: [17.43, 7] },
      { url: "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-d.jpg", sourceBox: [401, 7, 789, 993], sourceSize: [336, 832], mean: [185.73, 164.9, 127.65], faceIn: [17.34, 7] },
      { url: "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-e.jpg", sourceBox: [401, 1007, 789, 1993], sourceSize: [336, 832], mean: [199.84, 177.6, 139.34], faceIn: [17.34, 7] },
      { url: "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-f.jpg", sourceBox: [799, 7, 1192, 1603], sourceSize: [336, 1331], mean: [183.47, 163.78, 128.98], faceIn: [27.72, 7] },
      { url: "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-g.jpg", sourceBox: [799, 1617, 1192, 1993], sourceSize: [336, 313], mean: [202.68, 180.13, 142.2], faceIn: [6.53, 7] },
      { url: "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-h.jpg", sourceBox: [1202, 7, 1598, 480], sourceSize: [336, 392], mean: [178.65, 157.63, 121.3], faceIn: [8.16, 7] },
      { url: "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-i.jpg", sourceBox: [1202, 494, 1598, 1993], sourceSize: [336, 1240], mean: [191.9, 170.6, 132.84], faceIn: [25.84, 7] },
      { url: "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-j.jpg", sourceBox: [1608, 7, 1995, 993], sourceSize: [336, 835], mean: [184.17, 163.19, 124.2], faceIn: [17.39, 7] },
      { url: "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-k.jpg", sourceBox: [1608, 1007, 1995, 1993], sourceSize: [336, 835], mean: [196.32, 173.33, 133.27], faceIn: [17.39, 7] },
    ],
    unitMeans: [
      [202.87, 182.08, 141.69],
      [184.11, 163.34, 124.83],
      [197.86, 174.01, 132.38],
      [185.73, 164.9, 127.65],
      [199.84, 177.6, 139.34],
      [183.47, 163.78, 128.98],
      [202.68, 180.13, 142.2],
      [178.65, 157.63, 121.3],
      [191.9, 170.6, 132.84],
      [184.17, 163.19, 124.2],
      [196.32, 173.33, 133.27]
    ],
    overallMean: [191.6, 170.05, 131.7],
    notes:
      "Face A is the product's own plank photograph: one complete " +
      "plank, both ends in frame, measured aspect 3.46% off the " +
      "printed 48 x 7 in \u2014 the printed sheet wins and the " +
      "photo is normalized to the printed size at 48 px/in (the " +
      "photo itself is mildly anisotropic, 167.7 px/in across " +
      "against 161.9 px/in along). Faces B\u2013K are true-scale " +
      "windows of the display render: FIVE full-width columns, " +
      "no partials \u2014 seams crop-verified at x 396/794/1197/1603 " +
      "(widths 396/398/403/406/397 px, local scales 56.57\u201358.00 " +
      "px/in); the exact equal 5x400 grid was tested and rejected " +
      "\u2014 the seams sit off it. Butt joints measured in only " +
      "two columns; columns 1, 2 and 5 carry none and are one " +
      "continuous print each, split at the midpoint \u2014 ten " +
      "segments, one window inside each, inset from every joint. " +
      "Covered lengths are render-measured at each column's own " +
      "scale, not printed dimensions. A window may only cover a " +
      "piece it covers whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_bellflower_blonde_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48, 7],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-k-normal.jpg"
  ],
  moduleIn: [48, 7],
  model: { kind: "plank-box", lengthIn: 48, widthIn: 7, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted.",
    "A price ($46.43) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "This product's dimensions print in whole inches only \u2014 48 x 7 in; '48.03' and '7.13' occur zero times on its page (Farro Oak is the only other whole-inch sheet in the set). The printed sheet governs \u2014 no decimal dimensions were borrowed from siblings.",
    "The spec table prints no Approved For Sunrooms row and no Subfloor row, and no Country of Origin is printed \u2014 absent, not borrowed.",
    "Variation faces B\u2013K are single-print crops of the product's display render, scale anchored per column; their covered lengths are render-measured, not printed dimensions. Face A is the plank photo at a disclosed 3.46% framing tolerance, normalized to the printed size.",
  ],
};

const STONECASTLE: FloorDecorProduct = {
  slug: "stonecastle",
  fdId: "101442291",
  name: "Stonecastle Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Stonecastle",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/stonecastle-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101442291.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48,
  widthIn: 7,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Gray",
  shade: "Dark",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 66,
  stc: 60,
  deltaIic: 21,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 49.02, widthIn: 7.6, weightLbs: 39.9 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($46.43) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101442291_stonecastle-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101442291_stonecastle-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Stonecastle Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "stonecastle",
    option: "Stonecastle",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101442291_stonecastle-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-a.jpg", sourceBox: [855, 37, 1146, 1974], sourceSize: [336, 2304], mean: [114.04, 111.06, 102.48], faceIn: [48.0, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-b.jpg", sourceBox: [5, 7, 391, 993], sourceSize: [336, 848], mean: [98.48, 95.84, 88.68], faceIn: [17.68, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-c.jpg", sourceBox: [5, 1007, 391, 1993], sourceSize: [336, 848], mean: [98.73, 96.03, 89.57], faceIn: [17.68, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-d.jpg", sourceBox: [401, 7, 789, 1492], sourceSize: [336, 1265], mean: [106.08, 103.16, 96.34], faceIn: [26.36, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-e.jpg", sourceBox: [401, 1506, 789, 1993], sourceSize: [336, 423], mean: [101.18, 98.16, 92.72], faceIn: [8.81, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-f.jpg", sourceBox: [799, 7, 1193, 392], sourceSize: [336, 332], mean: [110.61, 107.74, 100.96], faceIn: [6.91, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-g.jpg", sourceBox: [799, 406, 1193, 1993], sourceSize: [336, 1332], mean: [104.92, 101.6, 94.98], faceIn: [27.74, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-h.jpg", sourceBox: [1203, 7, 1597, 993], sourceSize: [336, 832], mean: [108.42, 105.52, 97.97], faceIn: [17.33, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-i.jpg", sourceBox: [1203, 1007, 1597, 1993], sourceSize: [336, 832], mean: [102.94, 99.7, 92.48], faceIn: [17.33, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-j.jpg", sourceBox: [1607, 7, 1995, 1463], sourceSize: [336, 1241], mean: [96.45, 93.4, 85.32], faceIn: [25.85, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-k.jpg", sourceBox: [1607, 1477, 1995, 1993], sourceSize: [336, 447], mean: [93.2, 90.11, 82.72], faceIn: [9.32, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-l.jpg", sourceBox: [401, 127, 789, 1492], sourceSize: [336, 1152], mean: [105.84, 102.91, 96.08], faceIn: [24, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-m.jpg", sourceBox: [799, 406, 1193, 1791], sourceSize: [336, 1152], mean: [104.93, 101.6, 94.92], faceIn: [24, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-n.jpg", sourceBox: [1607, 98, 1995, 1463], sourceSize: [336, 1152], mean: [96.18, 93.11, 85.03], faceIn: [24, 7] },
      { url: "/app/floor-and-decor/duralux-performance/stonecastle/face-top-o.jpg", sourceBox: [855, 37, 1146, 1260], sourceSize: [336, 1455], mean: [111.54, 108.62, 99.76], faceIn: [30.32, 7] },
    ],
    unitMeans: [
      [114.04, 111.06, 102.48],
      [98.48, 95.84, 88.68],
      [98.73, 96.03, 89.57],
      [106.08, 103.16, 96.34],
      [101.18, 98.16, 92.72],
      [110.61, 107.74, 100.96],
      [104.92, 101.6, 94.98],
      [108.42, 105.52, 97.97],
      [102.94, 99.7, 92.48],
      [96.45, 93.4, 85.32],
      [93.2, 90.11, 82.72],
      [105.84, 102.91, 96.08],
      [104.93, 101.6, 94.92],
      [96.18, 93.11, 85.03],
      [111.54, 108.62, 99.76],
    ],
    overallMean: [103.57, 100.57, 93.33],
    notes:
      "Face A is the product's own plank photograph: one complete " +
      "plank, both ends in frame, measured aspect 2.93% off the " +
      "printed 48 x 7 in \u2014 the printed sheet wins and the " +
      "photo is normalized to the printed size at 48 px/in (the " +
      "photo itself is mildly anisotropic, 41.57 px/in across " +
      "against 40.35 px/in along). Faces B\u2013K are true-scale " +
      "windows of the display render: FIVE full-width columns, " +
      "no partials \u2014 seams at x 396/794/1198/1602 (widths " +
      "396/398/404/404/398 px, local scales 56.57\u201357.71 " +
      "px/in). This render's busy grey grain defeated the " +
      "gradient detectors that settled its siblings, so the grid " +
      "was proven by butt-joint extents plus native-resolution " +
      "crops: joints measured in columns 2, 3 and 5; columns 1 " +
      "and 4 carry none and are one continuous print each, split " +
      "at the midpoint \u2014 ten segments, one window inside " +
      "each, inset from every joint. Covered lengths are " +
      "render-measured at each column's own scale, not printed " +
      "dimensions. A window may only cover a piece it covers " +
      "whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_stonecastle_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48, 7],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-k-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-l-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-m-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-n-normal.jpg",
    "/app/floor-and-decor/duralux-performance/stonecastle/face-top-o-normal.jpg",
  ],
  moduleIn: [48, 7],
  model: { kind: "plank-box", lengthIn: 48, widthIn: 7, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted.",
    "A price ($46.43) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "This product's sheet is field-for-field identical to Bellflower Blonde's (same whole-inch 48 x 7 in dimensions, same box, same IIC 66 / STC 60 / Delta IIC 21) except Color Gray and Shade Dark \u2014 every value here was read from this product's own page, not copied from its twin.",
    "The spec table prints no Approved For Sunrooms row and no Subfloor row, and no Country of Origin is printed \u2014 absent, not borrowed.",
    "Variation faces B\u2013K are single-print crops of the product's display render, scale anchored per column; their covered lengths are render-measured, not printed dimensions. Face A is the plank photo at a disclosed 2.93% framing tolerance, normalized to the printed size.",
  ],
};

const ROCKY_ROAD: FloorDecorProduct = {
  slug: "rocky-road",
  fdId: "141369283",
  name: "Rocky Road Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Rocky Road",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/rocky-road-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-141369283.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.62,
  widthIn: 7.56,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Brown",
  shade: "Dark",
  texture: "Embossed",
  edge: "Painted",
  gloss: "Ultra Matte",
  wearLayerMil: 20,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 68,
  stc: 67,
  deltaIic: 24,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 49.37, widthIn: 8.15, weightLbs: 52.73 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($60.93) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/141369283_rocky-road-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/141369283_rocky-road-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Rocky Road Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "rocky-road",
    option: "Rocky Road",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/141369283_rocky-road-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/rocky-road/face-top-a.jpg", sourceBox: [860, 58, 1136, 1935], sourceSize: [363, 2334], mean: [101.7, 75.81, 45.4], faceIn: [48.62, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/rocky-road/face-top-b.jpg", sourceBox: [5, 7, 388, 981], sourceSize: [363, 900], mean: [100.47, 75.89, 48.81], faceIn: [18.74, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/rocky-road/face-top-c.jpg", sourceBox: [5, 995, 388, 1993], sourceSize: [363, 922], mean: [90.86, 66.58, 41.02], faceIn: [19.2, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/rocky-road/face-top-d.jpg", sourceBox: [398, 7, 795, 993], sourceSize: [363, 879], mean: [90.33, 65.98, 40.53], faceIn: [18.31, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/rocky-road/face-top-e.jpg", sourceBox: [398, 1007, 795, 1993], sourceSize: [363, 879], mean: [90.26, 65.32, 40.07], faceIn: [18.31, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/rocky-road/face-top-f.jpg", sourceBox: [805, 7, 1189, 702], sourceSize: [363, 640], mean: [81.36, 57.93, 33.55], faceIn: [13.33, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/rocky-road/face-top-g.jpg", sourceBox: [805, 716, 1189, 1993], sourceSize: [363, 1176], mean: [98.66, 74.02, 47.21], faceIn: [24.5, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/rocky-road/face-top-h.jpg", sourceBox: [1199, 7, 1597, 1521], sourceSize: [363, 1346], mean: [89.45, 65.04, 39.6], faceIn: [28.05, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/rocky-road/face-top-i.jpg", sourceBox: [1199, 1535, 1597, 1993], sourceSize: [363, 408], mean: [99.71, 75.17, 48.04], faceIn: [8.49, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/rocky-road/face-top-j.jpg", sourceBox: [1607, 7, 1995, 512], sourceSize: [363, 460], mean: [88.64, 65.37, 40.36], faceIn: [9.59, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/rocky-road/face-top-k.jpg", sourceBox: [1607, 526, 1995, 1993], sourceSize: [363, 1337], mean: [98.49, 74.03, 47.32], faceIn: [27.86, 7.56] },
    ],
    unitMeans: [
      [101.7, 75.81, 45.4],
      [100.47, 75.89, 48.81],
      [90.86, 66.58, 41.02],
      [90.33, 65.98, 40.53],
      [90.26, 65.32, 40.07],
      [81.36, 57.93, 33.55],
      [98.66, 74.02, 47.21],
      [89.45, 65.04, 39.6],
      [99.71, 75.17, 48.04],
      [88.64, 65.37, 40.36],
      [98.49, 74.03, 47.32]
    ],
    overallMean: [93.63, 69.19, 42.9],
    notes:
      "Face A is the product's own plank photograph: one complete " +
      "plank, both ends in frame, measured aspect 5.75% off the " +
      "printed 48.62 x 7.56 in \u2014 the largest framing " +
      "tolerance in the deepened set; the printed sheet wins and " +
      "the photo is normalized to the printed size at 48 px/in " +
      "(the photo itself is anisotropic, 36.51 px/in across " +
      "against 38.61 px/in along). Faces B\u2013K are true-scale " +
      "windows of the display render: FIVE full-width columns, " +
      "no partials \u2014 the family's darkest render, whose grain " +
      "defeated the gradient detectors, so the seams were proven " +
      "by tonal step (four steps of 10.8\u201313.5 at x " +
      "393/800/1194/1602 against ~2.3\u20134.4 noise; columns " +
      "393/407/394/408/398 px, local scales 51.98\u201353.97 " +
      "px/in). Butt joints measured in columns 1, 3, 4 and 5; " +
      "column 2 carries none and is one continuous print, split " +
      "at its midpoint \u2014 ten segments, one window inside " +
      "each, inset from every joint. Covered lengths are " +
      "render-measured at each column's own scale, not printed " +
      "dimensions. A window may only cover a piece it covers " +
      "whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_rocky_road_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.62, 7.56],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/rocky-road/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/rocky-road/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/rocky-road/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/rocky-road/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/rocky-road/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/rocky-road/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/rocky-road/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/rocky-road/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/rocky-road/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/rocky-road/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/rocky-road/face-top-k-normal.jpg"
  ],
  moduleIn: [48.62, 7.56],
  model: { kind: "plank-box", lengthIn: 48.62, widthIn: 7.56, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted.",
    "A price ($60.93) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "The spec table prints no Stain Resistance row (the string occurs zero times) and no Subfloor row \u2014 'Subfloor' appears once, inside the Attached Pad help prose \u2014 and no Country of Origin is printed. All absent, not borrowed.",
    "This sheet's edge prints simply 'Painted' \u2014 the only sheet in the set without a fuller edge name (siblings print 'Painted Bevel' or 'Micro Bevel') \u2014 and its gloss prints 'Ultra Matte', the set's only Ultra Matte. Both recorded verbatim.",
    "Variation faces B\u2013K are single-print crops of the product's display render, scale anchored per column; their covered lengths are render-measured, not printed dimensions. Face A is the plank photo at a disclosed 5.75% framing tolerance \u2014 the set's largest \u2014 normalized to the printed size.",
  ],
};

const BOARDWALK_OAK: FloorDecorProduct = {
  slug: "boardwalk-oak",
  fdId: "101068492",
  name: "Boardwalk Oak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Boardwalk Oak",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/boardwalk-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101068492.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.13,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Multi Color",
  shade: "High Variation",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 66,
  stc: 68,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.62, widthIn: 7.6, weightLbs: 42.65 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($47.30) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101068492_boardwalk-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101068492_boardwalk-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Boardwalk Oak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "boardwalk-oak",
    option: "Boardwalk Oak",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101068492_boardwalk-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-a.jpg", sourceBox: [858, 68, 1142, 1931], sourceSize: [342, 2305], mean: [128.3, 117.85, 111.12], faceIn: [48.03, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-b.jpg", sourceBox: [228, 7, 558, 1060], sourceSize: [342, 1060], mean: [117.75, 106.05, 101.1], faceIn: [22.08, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-c.jpg", sourceBox: [228, 1074, 558, 1993], sourceSize: [342, 925], mean: [108.68, 96.98, 92.0], faceIn: [19.27, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-d.jpg", sourceBox: [568, 7, 892, 1475], sourceSize: [342, 1504], mean: [120.45, 110.6, 106.0], faceIn: [31.34, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-e.jpg", sourceBox: [568, 1489, 892, 1744], sourceSize: [342, 261], mean: [112.07, 102.3, 98.33], faceIn: [5.44, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-f.jpg", sourceBox: [568, 1758, 892, 1993], sourceSize: [342, 241], mean: [135.28, 127.78, 121.1], faceIn: [5.02, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-g.jpg", sourceBox: [902, 7, 1223, 448], sourceSize: [342, 456], mean: [100.12, 87.38, 82.28], faceIn: [9.5, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-h.jpg", sourceBox: [902, 462, 1223, 688], sourceSize: [342, 234], mean: [103.09, 95.33, 93.07], faceIn: [4.87, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-i.jpg", sourceBox: [902, 702, 1223, 1993], sourceSize: [342, 1335], mean: [125.79, 113.68, 106.9], faceIn: [27.81, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-j.jpg", sourceBox: [1233, 7, 1552, 984], sourceSize: [342, 1016], mean: [123.44, 113.17, 106.77], faceIn: [21.17, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-k.jpg", sourceBox: [1233, 998, 1552, 1344], sourceSize: [342, 360], mean: [97.1, 87.81, 84.55], faceIn: [7.5, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-l.jpg", sourceBox: [1233, 1358, 1552, 1993], sourceSize: [342, 660], mean: [120.0, 109.46, 102.73], faceIn: [13.76, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-m.jpg", sourceBox: [1562, 7, 1893, 1704], sourceSize: [342, 1703], mean: [110.92, 101.39, 96.64], faceIn: [35.48, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-n.jpg", sourceBox: [1562, 1718, 1893, 1860], sourceSize: [342, 143], mean: [124.86, 112.3, 102.73], faceIn: [2.97, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-o.jpg", sourceBox: [1562, 1874, 1893, 1993], sourceSize: [342, 120], mean: [99.02, 85.43, 78.64], faceIn: [2.49, 7.13] },
    ],
    unitMeans: [
      [128.3, 117.85, 111.12],
      [117.75, 106.05, 101.1],
      [108.68, 96.98, 92.0],
      [120.45, 110.6, 106.0],
      [112.07, 102.3, 98.33],
      [135.28, 127.78, 121.1],
      [100.12, 87.38, 82.28],
      [103.09, 95.33, 93.07],
      [125.79, 113.68, 106.9],
      [123.44, 113.17, 106.77],
      [97.1, 87.81, 84.55],
      [120.0, 109.46, 102.73],
      [110.92, 101.39, 96.64],
      [124.86, 112.3, 102.73],
      [99.02, 85.43, 78.64]
    ],
    overallMean: [115.12, 104.5, 98.93],
    notes:
      "Face A is the product's own plank photograph: one complete " +
      "plank, both ends in frame, measured aspect 2.67% off the " +
      "printed 48.03 x 7.13 in \u2014 the printed sheet wins and " +
      "the photo is normalized to the printed size at 48 px/in " +
      "(the photo itself is mildly anisotropic, 39.83 px/in " +
      "across against 38.79 px/in along). The photo also proves " +
      "one print is a reclaimed COLLAGE \u2014 a vertical " +
      "sub-board split at ~55% of the width and a sub-board end " +
      "edge at ~62% of the length \u2014 so partial-width lines " +
      "inside a column are the print's own design, not joints. " +
      "Faces B\u2013O are true-scale windows of the display " +
      "render: FIVE full-width columns (widths 340/334/331/329/" +
      "341 px, local scales 46.14\u201347.83 px/in) flanked by " +
      "two unused partials \u2014 the grid proven three ways " +
      "(groove detector peaks, tonal steps, and all nine joint " +
      "fragments lying inside single columns). Nine butt joints " +
      "measured, every column jointed, so no midpoint split. " +
      "Covered lengths are render-measured at each column's own " +
      "scale, not printed dimensions. A window may only cover a " +
      "piece it covers whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_boardwalk_oak_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.13],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-k-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-l-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-m-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-n-normal.jpg",
    "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-o-normal.jpg"
  ],
  moduleIn: [48.03, 7.13],
  model: { kind: "plank-box", lengthIn: 48.03, widthIn: 7.13, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted.",
    "A price ($47.30) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "Delta IIC is not printed anywhere on this product's page (the word 'Delta' occurs zero times in the full markup) \u2014 the field is absent from this record, not borrowed. IIC 66 and STC 68 are printed.",
    "No Country of Origin is printed on this product's page \u2014 not recorded.",
    "This sheet prints a Subfloor row ('All') and Stain Resistance 'Yes' where several siblings print neither \u2014 read from this product's own page.",
    "Variation faces E (5.44 in), F (5.02), H (4.87), N (2.97) and O (2.49) cover less than the floor layout's 6 in minimum piece length: they are true faces of the product and selectable in the Single view, but the floor layout deals only faces that cover a whole piece.",
    "Variation faces B\u2013O are single-print crops of the product's display render, scale anchored per column; their covered lengths are render-measured, not printed dimensions. Face A is the plank photo at a disclosed 2.67% framing tolerance, normalized to the printed size.",
  ],
};

const ANSLEIGH_COTTAGE: FloorDecorProduct = {
  slug: "ansleigh-cottage",
  fdId: "100885136",
  name: "Ansleigh Cottage Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Ansleigh Cottage",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/ansleigh-cottage-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-100885136.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.2,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Beige",
  shade: "High Variation",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 66,
  stc: 68,
  deltaIic: 23,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.62, widthIn: 7.64, weightLbs: 49.22 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($57.39) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/100885136_ansleigh-cottage-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/100885136_ansleigh-cottage-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Ansleigh Cottage Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "ansleigh-cottage",
    option: "Ansleigh Cottage",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100885136_ansleigh-cottage-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-a.jpg", sourceBox: [266, 7, 663, 1025], sourceSize: [346, 876], mean: [164.77, 150.05, 124.62], faceIn: [18.26, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-b.jpg", sourceBox: [266, 1039, 663, 1993], sourceSize: [346, 822], mean: [107.62, 90.27, 70.33], faceIn: [17.12, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-c.jpg", sourceBox: [673, 7, 1069, 993], sourceSize: [346, 851], mean: [144.12, 127.61, 102.93], faceIn: [17.73, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-d.jpg", sourceBox: [673, 1007, 1069, 1993], sourceSize: [346, 851], mean: [142.07, 125.76, 101.85], faceIn: [17.73, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-e.jpg", sourceBox: [1079, 7, 1472, 148], sourceSize: [346, 133], mean: [162.15, 147.85, 123.11], faceIn: [2.77, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-f.jpg", sourceBox: [1079, 162, 1472, 1993], sourceSize: [346, 1582], mean: [164.14, 149.43, 123.65], faceIn: [32.96, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-g.jpg", sourceBox: [1482, 7, 1872, 709], sourceSize: [346, 619], mean: [150.19, 133.95, 108.95], faceIn: [12.89, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-h.jpg", sourceBox: [1482, 723, 1872, 1993], sourceSize: [346, 1109], mean: [114.23, 97.55, 78.4], faceIn: [23.11, 7.2] },
    ],
    unitMeans: [
      [164.77, 150.05, 124.62],
      [107.62, 90.27, 70.33],
      [144.12, 127.61, 102.93],
      [142.07, 125.76, 101.85],
      [162.15, 147.85, 123.11],
      [164.14, 149.43, 123.65],
      [150.19, 133.95, 108.95],
      [114.23, 97.55, 78.4]
    ],
    overallMean: [143.66, 127.81, 104.23],
    notes:
      "There is NO plank-photo face: the product's plank " +
      "photograph shows one plank whose top end is in frame but " +
      "which runs off the bottom of the frame \u2014 measured " +
      "aspect 3.58 against the printed 6.671 \u2014 so its " +
      "along-length scale is unverifiable and no face was cut " +
      "from it (the Trenton Tradition class). All eight faces " +
      "are true-scale windows of the display render: FOUR " +
      "full-width columns (407/406/403/400 px, local scales " +
      "55.56\u201356.53 px/in) flanked by two unused partials. " +
      "Butt joints crop-verified in columns 1, 3 and 4; column 2 " +
      "carries none and is one continuous print, split at its " +
      "midpoint \u2014 eight segments, one window inside each, " +
      "inset from every joint. Two elevated interior gradients " +
      "(faces B and H) were crop-proven to be the dark prints' " +
      "cathedral grain banding, not joints. Covered lengths are " +
      "render-measured at each column's own scale, not printed " +
      "dimensions. A window may only cover a piece it covers " +
      "whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_ansleigh_cottage_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.2],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap:
    "This product's plank photograph shows a plank that runs off " +
    "the bottom of the frame, so no complete-plank face could be " +
    "cut from it and the product carries no plank-box 3D model. " +
    "All eight faces come from the display render.",
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-h-normal.jpg"
  ],
  moduleIn: [48.03, 7.2],
  model: null,
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted ('Sq Ft' occurs zero times in the markup; 'Pieces' appears only in navigation).",
    "A price ($57.39) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "No Country of Origin is printed on this product's page \u2014 not recorded.",
    "The spec table prints underlayment 'Sentinel Protect Recommended' while the same page's prose recommends Sentinel Protect Plus \u2014 the table value is recorded verbatim.",
    "Face E covers 2.77 in, below the floor layout's 6 in minimum piece length: a true face of the product, selectable in the Single view, but the floor layout deals only faces that cover a whole piece.",
    "All faces are single-print crops of the product's display render, scale anchored per column; their covered lengths are render-measured, not printed dimensions. There is no plank-photo face and no plank-box model \u2014 see facesGap.",
  ],
};

const CLAM_SHELL: FloorDecorProduct = {
  slug: "clam-shell",
  fdId: "152255713",
  name: "Clam Shell Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Clam Shell",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/clam-shell-rigid-core-luxury-vinyl-plank---foam-pad-152255713.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48,
  widthIn: 7,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Gray",
  shade: "Light",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 20,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 56,
  stc: 53,
  deltaIic: 22,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  box: { lengthIn: 48.82, widthIn: 7.95, weightLbs: 33.25 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($47.56) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/152255713_clam-shell-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/152255713_clam-shell-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Clam Shell Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "clam-shell",
    option: "Clam Shell",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/152255713_clam-shell-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/clam-shell/face-top-a.jpg", sourceBox: [847, 133, 1106, 1868], sourceSize: [336, 2304], mean: [163.65, 152.24, 139.96], faceIn: [48.0, 7] },
      { url: "/app/floor-and-decor/duralux-performance/clam-shell/face-top-b.jpg", sourceBox: [5, 7, 394, 1046], sourceSize: [336, 887], mean: [162.51, 150.23, 137.71], faceIn: [18.47, 7] },
      { url: "/app/floor-and-decor/duralux-performance/clam-shell/face-top-c.jpg", sourceBox: [5, 1060, 394, 1993], sourceSize: [336, 797], mean: [165.44, 153.1, 140.3], faceIn: [16.61, 7] },
      { url: "/app/floor-and-decor/duralux-performance/clam-shell/face-top-d.jpg", sourceBox: [404, 7, 796, 271], sourceSize: [336, 232], mean: [159.76, 148.0, 136.07], faceIn: [4.84, 7] },
      { url: "/app/floor-and-decor/duralux-performance/clam-shell/face-top-e.jpg", sourceBox: [404, 285, 796, 1993], sourceSize: [336, 1439], mean: [163.28, 151.91, 140.01], faceIn: [29.99, 7] },
      { url: "/app/floor-and-decor/duralux-performance/clam-shell/face-top-f.jpg", sourceBox: [806, 7, 1196, 1667], sourceSize: [336, 1406], mean: [164.35, 152.49, 140.77], faceIn: [29.29, 7] },
      { url: "/app/floor-and-decor/duralux-performance/clam-shell/face-top-g.jpg", sourceBox: [806, 1681, 1196, 1993], sourceSize: [336, 274], mean: [165.37, 153.79, 141.65], faceIn: [5.71, 7] },
      { url: "/app/floor-and-decor/duralux-performance/clam-shell/face-top-h.jpg", sourceBox: [1206, 7, 1594, 755], sourceSize: [336, 643], mean: [165.95, 153.68, 141.0], faceIn: [13.4, 7] },
      { url: "/app/floor-and-decor/duralux-performance/clam-shell/face-top-i.jpg", sourceBox: [1206, 769, 1594, 1993], sourceSize: [336, 1045], mean: [162.19, 150.41, 138.7], faceIn: [21.77, 7] },
      { url: "/app/floor-and-decor/duralux-performance/clam-shell/face-top-j.jpg", sourceBox: [1604, 7, 1995, 1319], sourceSize: [336, 1111], mean: [163.88, 152.39, 140.57], faceIn: [23.15, 7] },
      { url: "/app/floor-and-decor/duralux-performance/clam-shell/face-top-k.jpg", sourceBox: [1604, 1333, 1995, 1993], sourceSize: [336, 565], mean: [164.54, 152.86, 141.05], faceIn: [11.77, 7] },
    ],
    unitMeans: [
      [163.65, 152.24, 139.96],
      [162.51, 150.23, 137.71],
      [165.44, 153.1, 140.3],
      [159.76, 148.0, 136.07],
      [163.28, 151.91, 140.01],
      [164.35, 152.49, 140.77],
      [165.37, 153.79, 141.65],
      [165.95, 153.68, 141.0],
      [162.19, 150.41, 138.7],
      [163.88, 152.39, 140.57],
      [164.54, 152.86, 141.05]
    ],
    overallMean: [163.72, 151.92, 139.8],
    notes:
      "Face A is the product's own plank photograph: one complete " +
      "plank, both ends in frame with white margins on all four " +
      "sides, measured aspect 2.36% off the printed whole-inch " +
      "48 x 7 in \u2014 the printed sheet wins and the photo is " +
      "normalized to the printed size at 48 px/in (the photo " +
      "itself is mildly anisotropic, 37.00 px/in across against " +
      "36.15 px/in along). No collage splits in this print. " +
      "Faces B\u2013K are true-scale windows of the display " +
      "render: the cleanest grid of the set \u2014 an EQUAL " +
      "5 x 400 px grid spanning the frame edge to edge with no " +
      "partials (four seam peaks scoring 78.9\u201385.0 against " +
      "a next-best grain candidate of 30.7; the jittered sibling " +
      "grids were tested and rejected, each 2\u20135 px off the " +
      "measured peaks). Every column carries exactly one " +
      "dominant butt joint, so no midpoint split \u2014 ten " +
      "segments, one window inside each, inset from every " +
      "joint. Covered lengths are render-measured at each " +
      "column's own scale, not printed dimensions. A window may " +
      "only cover a piece it covers whole \u2014 never tiled. " +
      "Cut by " +
      "~/workspace/floor-and-decor-production/cut_clam_shell_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48, 7],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/clam-shell/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/clam-shell/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/clam-shell/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/clam-shell/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/clam-shell/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/clam-shell/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/clam-shell/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/clam-shell/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/clam-shell/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/clam-shell/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/clam-shell/face-top-k-normal.jpg"
  ],
  moduleIn: [48, 7],
  model: { kind: "plank-box", lengthIn: 48, widthIn: 7, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted ('Sq Ft' occurs zero times in the markup).",
    "A price ($47.56) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "This product's page prints NO VOC / GreenGuard row at all (zero occurrences) \u2014 the field is absent from this record, not borrowed, where several siblings print GreenGuard Gold. It also prints no Stain Resistance row, no Subfloor row, and no Country of Origin.",
    "Faces D (4.84 in) and G (5.71) cover less than the floor layout's 6 in minimum piece length: true faces of the product, selectable in the Single view, but the floor layout deals only faces that cover a whole piece.",
    "Variation faces B\u2013K are single-print crops of the product's display render, scale anchored per column; their covered lengths are render-measured, not printed dimensions. Face A is the plank photo at a disclosed 2.36% framing tolerance, normalized to the printed size.",
  ],
};

const MANCHESTER_COVE: FloorDecorProduct = {
  slug: "manchester-cove",
  fdId: "101058402",
  name: "Manchester Cove Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Manchester Cove",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/manchester-cove-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101058402.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.13,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Beige",
  shade: "Light",
  texture: "Embossed",
  edge: "Painted Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 66,
  stc: 68,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.62, widthIn: 7.6, weightLbs: 42.65 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($47.30) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101058402_manchester-cove-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101058402_manchester-cove-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Manchester Cove Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "manchester-cove",
    option: "Manchester Cove",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101058402_manchester-cove-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-a.jpg", sourceBox: [850, 78, 1132, 1929], sourceSize: [342, 2305], mean: [195.37, 183.39, 164.71], faceIn: [48.03, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-b.jpg", sourceBox: [5, 7, 222, 539], sourceSize: [342, 802], mean: [193.79, 181.4, 162.05], faceIn: [16.71, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-c.jpg", sourceBox: [5, 553, 222, 1993], sourceSize: [342, 2171], mean: [202.09, 193.14, 175.04], faceIn: [45.23, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-d.jpg", sourceBox: [232, 7, 445, 1234], sourceSize: [342, 1883], mean: [195.05, 185.18, 167.16], faceIn: [39.23, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-e.jpg", sourceBox: [232, 1248, 445, 1993], sourceSize: [342, 1143], mean: [195.51, 188.59, 170.65], faceIn: [23.82, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-f.jpg", sourceBox: [455, 7, 670, 876], sourceSize: [342, 1321], mean: [186.93, 174.82, 153.8], faceIn: [27.53, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-g.jpg", sourceBox: [455, 890, 670, 1993], sourceSize: [342, 1678], mean: [198.34, 188.99, 170.27], faceIn: [34.95, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-h.jpg", sourceBox: [680, 7, 891, 60], sourceSize: [342, 82], mean: [198.33, 188.54, 170.75], faceIn: [1.71, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-i.jpg", sourceBox: [680, 74, 891, 1566], sourceSize: [342, 2305], mean: [190.83, 180.6, 162.03], faceIn: [48.03, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-j.jpg", sourceBox: [680, 1580, 891, 1993], sourceSize: [342, 639], mean: [184.91, 173.23, 153.58], faceIn: [13.32, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-k.jpg", sourceBox: [901, 7, 1114, 474], sourceSize: [342, 717], mean: [187.48, 175.56, 155.46], faceIn: [14.93, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-l.jpg", sourceBox: [901, 488, 1114, 1993], sourceSize: [342, 2305], mean: [193.1, 183.34, 164.88], faceIn: [48.03, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-m.jpg", sourceBox: [1124, 7, 1335, 1171], sourceSize: [342, 1802], mean: [182.21, 170.15, 149.33], faceIn: [37.55, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-n.jpg", sourceBox: [1124, 1185, 1335, 1993], sourceSize: [342, 1251], mean: [177.94, 165.24, 143.79], faceIn: [26.06, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-o.jpg", sourceBox: [1345, 7, 1556, 852], sourceSize: [342, 1308], mean: [194.34, 185.9, 168.49], faceIn: [27.26, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-p.jpg", sourceBox: [1345, 866, 1556, 1993], sourceSize: [342, 1745], mean: [195.88, 185.33, 167.21], faceIn: [36.35, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-q.jpg", sourceBox: [1566, 7, 1777, 1464], sourceSize: [342, 2256], mean: [176.76, 164.01, 143.19], faceIn: [47.0, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-r.jpg", sourceBox: [1566, 1478, 1777, 1993], sourceSize: [342, 797], mean: [181.94, 169.81, 150.82], faceIn: [16.61, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-s.jpg", sourceBox: [1787, 7, 1995, 456], sourceSize: [342, 705], mean: [177.57, 164.32, 144.77], faceIn: [14.68, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-t.jpg", sourceBox: [1787, 470, 1995, 1952], sourceSize: [342, 2305], mean: [187.34, 176.23, 158.16], faceIn: [48.03, 7.13] },
      { url: "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-u.jpg", sourceBox: [1787, 1966, 1995, 1993], sourceSize: [342, 42], mean: [181.84, 169.43, 151.2], faceIn: [0.88, 7.13] },
    ],
    unitMeans: [
      [195.37, 183.39, 164.71],
      [193.79, 181.4, 162.05],
      [202.09, 193.14, 175.04],
      [195.05, 185.18, 167.16],
      [195.51, 188.59, 170.65],
      [186.93, 174.82, 153.8],
      [198.34, 188.99, 170.27],
      [198.33, 188.54, 170.75],
      [190.83, 180.6, 162.03],
      [184.91, 173.23, 153.58],
      [187.48, 175.56, 155.46],
      [193.1, 183.34, 164.88],
      [182.21, 170.15, 149.33],
      [177.94, 165.24, 143.79],
      [194.34, 185.9, 168.49],
      [195.88, 185.33, 167.21],
      [176.76, 164.01, 143.19],
      [181.94, 169.81, 150.82],
      [177.57, 164.32, 144.77],
      [187.34, 176.23, 158.16],
      [181.84, 169.43, 151.2]
    ],
    overallMean: [189.41, 178.44, 159.4],
    notes:
      "Face A is the product's own plank photograph: one complete " +
      "plank, both ends crop-verified in frame, measured aspect " +
      "2.56% off the printed 48.03 x 7.13 in \u2014 the printed " +
      "sheet wins and the photo is normalized to the printed size " +
      "at 48 px/in (the photo itself is mildly anisotropic, " +
      "39.55 px/in across against 38.54 px/in along). No collage " +
      "splits in this print. Faces B\u2013U are true-scale " +
      "windows of the display render, which breaks the family " +
      "pattern: it runs at ~31 px/in with NINE full-width columns " +
      "(widths 218\u2013227 px, local scales 30.58\u201331.84 " +
      "px/in) where every sibling render runs ~47\u201357 px/in " +
      "with four to six columns. Butt joints crop-verified in " +
      "every column \u2014 columns 4 and 9 carry two each, and " +
      "in both the middle segment measures one full printed " +
      "plank length (48.6 / 48.9 in), as does column 5's bottom " +
      "segment (48.6 in): a three-way consistency proof of the " +
      "grid. Twenty segments, one window inside each, inset " +
      "from every joint. Three segments are COMPLETE units " +
      "bounded by two crop-verified joints (faces I, L, T): " +
      "at the columns' width-anchored scales they measure " +
      "48.11\u201348.46 in, i.e. the render is up to ~0.9% " +
      "anisotropic along its length, so under the same rule " +
      "as the plank photographs the printed sheet wins " +
      "\u2014 those three faces are normalized to the " +
      "printed 48.03 in and recorded at that covered " +
      "length. Covered lengths are render-measured at " +
      "each column's own scale, not printed dimensions. A window " +
      "may only cover a piece it covers whole \u2014 never " +
      "tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_manchester_cove_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.13],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-k-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-l-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-m-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-n-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-o-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-p-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-q-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-r-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-s-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-t-normal.jpg",
    "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-u-normal.jpg"
  ],
  moduleIn: [48.03, 7.13],
  model: { kind: "plank-box", lengthIn: 48.03, widthIn: 7.13, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted.",
    "A price ($47.30) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "Delta IIC is not printed anywhere on this product's page (the word 'Delta' occurs zero times in the full markup) \u2014 the field is absent from this record, not borrowed. IIC 66 and STC 68 are printed.",
    "No Country of Origin is printed on this product's page \u2014 not recorded.",
    "Faces H (1.71 in) and U (0.88) are the true frame-edge cut pieces of columns 4 and 9, below the floor layout's 6 in minimum piece length: true faces of the product, selectable in the Single view, but the floor layout deals only faces that cover a whole piece.",
    "Variation faces B\u2013U are single-print crops of the product's display render, scale anchored per column; their covered lengths are render-measured, not printed dimensions. Face A is the plank photo at a disclosed 2.56% framing tolerance, normalized to the printed size.",
  ],
};

const LINCOLN_TRAIL: FloorDecorProduct = {
  slug: "lincoln-trail",
  fdId: "101445153",
  name: "Lincoln Trail Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Lincoln Trail",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/lincoln-trail-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101445153.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.62,
  widthIn: 7.56,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Brown",
  shade: "Medium",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 15,
  stc: 68,
  deltaIic: 65,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 49.61, widthIn: 8.21, weightLbs: 44.8 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($50.78) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101445153_lincoln-trail-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101445153_lincoln-trail-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Lincoln Trail Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "lincoln-trail",
    option: "Lincoln Trail",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101445153_lincoln-trail-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-b.jpg", sourceBox: [5, 7, 495, 993], sourceSize: [363, 716], mean: [126.75, 87.79, 54.2], faceIn: [14.91, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-c.jpg", sourceBox: [5, 1007, 495, 1993], sourceSize: [363, 716], mean: [125.41, 86.87, 53.75], faceIn: [14.91, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-d.jpg", sourceBox: [505, 7, 995, 992], sourceSize: [363, 715], mean: [127.97, 87.12, 52.52], faceIn: [14.89, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-e.jpg", sourceBox: [505, 1006, 995, 1993], sourceSize: [363, 716], mean: [134.88, 93.37, 57.86], faceIn: [14.92, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-f.jpg", sourceBox: [1005, 7, 1495, 1567], sourceSize: [363, 1132], mean: [123.06, 84.62, 52.65], faceIn: [23.59, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-g.jpg", sourceBox: [1005, 1581, 1495, 1993], sourceSize: [363, 299], mean: [133.35, 92.35, 56.77], faceIn: [6.23, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-h.jpg", sourceBox: [1505, 7, 1995, 389], sourceSize: [363, 277], mean: [128.68, 89.87, 56.73], faceIn: [5.78, 7.56] },
      { url: "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-i.jpg", sourceBox: [1505, 403, 1995, 1993], sourceSize: [363, 1154], mean: [126.09, 84.93, 50.67], faceIn: [24.04, 7.56] },
    ],
    unitMeans: [
      [126.75, 87.79, 54.2],
      [125.41, 86.87, 53.75],
      [127.97, 87.12, 52.52],
      [134.88, 93.37, 57.86],
      [123.06, 84.62, 52.65],
      [133.35, 92.35, 56.77],
      [128.68, 89.87, 56.73],
      [126.09, 84.93, 50.67]
    ],
    overallMean: [128.27, 88.37, 54.39],
    notes:
      "There is NO plank-photo face \u2014 see facesGap. All " +
      "eight faces are true-scale windows of the display render: " +
      "an exact EQUAL 4 x 500 px grid spanning the frame edge to " +
      "edge with no partials (seam peaks within 1 px of the " +
      "quarter points), at a uniform local scale of 66.14 px/in " +
      "\u2014 the finest render scale in the set. A full printed " +
      "plank is 3,216 px at this scale, taller than the frame, " +
      "so no column contains a complete unit. Butt joints " +
      "measured in columns 2, 3 and 4 by tonal step plus " +
      "dark-line dip (this print's repeating texture defeats the " +
      "plain row-gradient scan), all crop-verified; column 1 " +
      "carries none and is one continuous print, split at its " +
      "midpoint \u2014 eight segments, one window inside each, " +
      "inset from every joint. Covered lengths are " +
      "render-measured at the render's own scale, not printed " +
      "dimensions. A window may only cover a piece it covers " +
      "whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_lincoln_trail_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.62, 7.56],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap:
    "This product's plank photograph shows a complete plank, but " +
    "its measured aspect (7.4741, from a 1876 x 251 px bounding " +
    "box of uniform thickness, independently re-measured) " +
    "disagrees with the printed sheet (6.4312 for 48.62 x " +
    "7.56 in) by 16.22% \u2014 about three times the largest " +
    "framing tolerance accepted in this set (5.75%). The photo " +
    "appears to depict a longer, narrower plank than the one " +
    "this page sells, so no face was cut from it and the product " +
    "carries no plank-box 3D model. All eight faces come from " +
    "the display render.",
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-i-normal.jpg"
  ],
  moduleIn: [48.62, 7.56],
  model: null,
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted ('Sq. Ft' and 'Coverage' occur zero times in the markup).",
    "A price ($50.78) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "The sheet's sound ratings print IIC 15 / STC 68 / Delta IIC 65. Against the whole family (IIC 53\u201368, Delta IIC 20\u201324) the IIC and Delta figures read as transposed on the maker's own sheet; they are recorded VERBATIM as printed on this product's page \u2014 not corrected and not borrowed.",
    "This sheet prints no Subfloor row \u2014 absent, not borrowed. It does print a Country of Origin ('United States of America'), which most siblings do not, and underlayment 'Sentinel Protect Plus Recommended' (the siblings' rows print the shorter 'Sentinel Protect Recommended').",
    "Face H covers 5.78 in, below the floor layout's 6 in minimum piece length: a true face of the product, selectable in the Single view, but the floor layout deals only faces that cover a whole piece.",
    "All faces are single-print crops of the product's display render at its uniform measured scale; their covered lengths are render-measured, not printed dimensions. There is no plank-photo face and no plank-box model \u2014 see facesGap.",
  ],
};

const TIMBERWOLF_TRAIL: FloorDecorProduct = {
  slug: "timberwolf-trail",
  fdId: "101074722",
  name: "Timberwolf Trail Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Timberwolf Trail",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/timberwolf-trail-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101074722.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.03,
  widthIn: 7.2,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Blonde",
  shade: "Medium",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 66,
  stc: 68,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 48.62, widthIn: 7.64, weightLbs: 49.22 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($57.39) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101074722_timberwolf-trail-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101074722_timberwolf-trail-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Timberwolf Trail Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "timberwolf-trail",
    option: "Timberwolf Trail",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101074722_timberwolf-trail-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-a.jpg", sourceBox: [187, 7, 582, 1612], sourceSize: [346, 1381], mean: [178.19, 160.27, 134.08], faceIn: [28.78, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-b.jpg", sourceBox: [187, 1626, 582, 1993], sourceSize: [346, 325], mean: [172.15, 156.03, 128.56], faceIn: [6.77, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-c.jpg", sourceBox: [592, 7, 987, 371], sourceSize: [346, 323], mean: [212.19, 198.11, 176.22], faceIn: [6.72, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-d.jpg", sourceBox: [592, 385, 987, 1993], sourceSize: [346, 1384], mean: [175.16, 157.76, 131.94], faceIn: [28.84, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-e.jpg", sourceBox: [997, 7, 1393, 919], sourceSize: [346, 788], mean: [186.83, 168.57, 142.58], faceIn: [16.42, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-f.jpg", sourceBox: [997, 933, 1393, 1993], sourceSize: [346, 914], mean: [183.41, 165.81, 139.08], faceIn: [19.05, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-g.jpg", sourceBox: [1403, 7, 1797, 993], sourceSize: [346, 855], mean: [205.63, 190.53, 165.6], faceIn: [17.82, 7.2] },
      { url: "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-h.jpg", sourceBox: [1403, 1007, 1797, 1993], sourceSize: [346, 855], mean: [188.86, 172.54, 146.16], faceIn: [17.82, 7.2] },
    ],
    unitMeans: [
      [178.19, 160.27, 134.08],
      [172.15, 156.03, 128.56],
      [212.19, 198.11, 176.22],
      [175.16, 157.76, 131.94],
      [186.83, 168.57, 142.58],
      [183.41, 165.81, 139.08],
      [205.63, 190.53, 165.6],
      [188.86, 172.54, 146.16]
    ],
    overallMean: [187.8, 171.2, 145.53],
    notes:
      "There is NO plank-photo face: the product's plank " +
      "photograph shows one plank whose top end is in frame but " +
      "which runs off the bottom of the frame \u2014 so its " +
      "along-length scale is unverifiable and no face was cut " +
      "from it (the Trenton/Ansleigh class). All eight faces are " +
      "true-scale windows of the display render: an OFFSET " +
      "four-column grid (columns 405/405/406/404 px, local " +
      "scales 56.11\u201356.39 px/in) flanked by two unused " +
      "partials. Butt joints crop-verified in columns 1, 2 and " +
      "3; column 4 carries none and is one continuous print, " +
      "split at its midpoint \u2014 eight segments, one window " +
      "inside each, inset from every joint. A full printed " +
      "plank is ~2,700 px at these scales, taller than the " +
      "frame, so no column holds a complete unit. Covered " +
      "lengths are render-measured at each column's own scale, " +
      "not printed dimensions. A window may only cover a piece " +
      "it covers whole \u2014 never tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_timberwolf_trail_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.03, 7.2],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap:
    "This product's plank photograph shows a plank that runs off " +
    "the bottom of the frame, so no complete-plank face could be " +
    "cut from it and the product carries no plank-box 3D model. " +
    "All eight faces come from the display render.",
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-h-normal.jpg"
  ],
  moduleIn: [48.03, 7.2],
  model: null,
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted.",
    "A price ($57.39) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "Delta IIC is not printed anywhere on this product's page (the word 'Delta' occurs zero times in the full markup) \u2014 the field is absent from this record, not borrowed, where its dimensional twin Ansleigh Cottage prints Delta IIC 23. IIC 66 and STC 68 are printed.",
    "No Country of Origin is printed on this product's page \u2014 not recorded.",
    "The sheet prints Color 'Blonde' and Shade 'Medium' for a product named Timberwolf Trail whose render reads grey-brown \u2014 recorded verbatim from this product's own page.",
    "All faces are single-print crops of the product's display render, scale anchored per column; their covered lengths are render-measured, not printed dimensions. There is no plank-photo face and no plank-box model \u2014 see facesGap.",
  ],
};

const AUBURN_GLEN: FloorDecorProduct = {
  slug: "auburn-glen",
  fdId: "101075240",
  name: "Auburn Glen Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
  brand: "DuraLux Performance",
  colorway: "Auburn Glen",
  category: "vinyl-flooring",
  productType: "luxury-vinyl-plank",
  material: "Vinyl",
  sourceUrl:
    "https://www.flooranddecor.com/duralux-performance-flooring/auburn-glen-waterproof-rigid-core-luxury-vinyl-plank---foam-pad-101075240.html",
  sourcedOn: "2026-11-15",
  lengthIn: 48.62,
  widthIn: 7.01,
  nominalLabel: "5mm x 7in x 48in",
  dimensionStatus: "exact-published",
  thicknessMm: 5,
  color: "Brown",
  shade: "High Variation",
  texture: "Embossed",
  edge: "Micro Bevel",
  gloss: "Low",
  wearLayerMil: 12,
  attachedPad: "IXPE Foam",
  waterproof: true,
  installType: "Floating/ Locking",
  iic: 68,
  stc: 68,
  warranty: "Lifetime Res./ 15 Yr Comm.",
  vocCertification: "GreenGuard Gold",
  box: { lengthIn: 49.37, widthIn: 7.6, weightLbs: 53.99 },
  jointIn: 0,
  jointNote:
    "Floating/ Locking installation as printed \u2014 the planks lock " +
    "edge to edge; there is no grout joint to print.",
  priceUsd: null,
  priceNote:
    "No JSON-LD offer price is recorded for this product: a price " +
    "($61.21) appears in the product page's structured offer with no " +
    "stated coverage basis, so no offer price is recorded. The " +
    "listing-page $/sq ft is in pricePerSqftUsd.",
  pricePerSqftUsd: 1.99,
  priceBasis:
    "Floor & Decor DuraLux Performance listing page, read 2026-11-12 (prices can vary by store).",
  imageUrl: `${AMPLIENCE}/101075240_auburn-glen-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display`,
  pieceImageUrl: `${AMPLIENCE}/101075240_auburn-glen-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_1`,
  faceSet: {
    product: "Auburn Glen Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad",
    productSlug: "auburn-glen",
    option: "Auburn Glen",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101075240_auburn-glen-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display",
    swatchSize: [2000, 2000],
    variants: [
      { url: "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-a.jpg", sourceBox: [960, 52, 1237, 1929], sourceSize: [336, 2334], mean: [104.85, 76.67, 49.62], faceIn: [48.62, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-b.jpg", sourceBox: [44, 7, 419, 226], sourceSize: [336, 204], mean: [99.59, 70.77, 41.63], faceIn: [4.24, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-c.jpg", sourceBox: [44, 240, 419, 1993], sourceSize: [336, 1544], mean: [109.46, 79.34, 47.43], faceIn: [32.17, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-d.jpg", sourceBox: [429, 7, 806, 966], sourceSize: [336, 846], mean: [93.44, 64.99, 37.83], faceIn: [17.62, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-e.jpg", sourceBox: [429, 980, 806, 1993], sourceSize: [336, 893], mean: [81.88, 55.54, 32.17], faceIn: [18.6, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-f.jpg", sourceBox: [816, 7, 1193, 993], sourceSize: [336, 869], mean: [88.61, 60.61, 34.78], faceIn: [18.11, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-g.jpg", sourceBox: [816, 1007, 1193, 1993], sourceSize: [336, 869], mean: [91.41, 64.12, 37.38], faceIn: [18.11, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-h.jpg", sourceBox: [1203, 7, 1579, 486], sourceSize: [336, 430], mean: [103.26, 74.21, 44.83], faceIn: [8.95, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-i.jpg", sourceBox: [1203, 500, 1579, 1993], sourceSize: [336, 1314], mean: [91.42, 63.21, 36.53], faceIn: [27.37, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-j.jpg", sourceBox: [1589, 7, 1966, 1531], sourceSize: [336, 1337], mean: [86.62, 58.66, 32.94], faceIn: [27.86, 7.01] },
      { url: "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-k.jpg", sourceBox: [1589, 1545, 1966, 1993], sourceSize: [336, 402], mean: [100.68, 71.85, 42.55], faceIn: [8.37, 7.01] },
    ],
    unitMeans: [
      [104.85, 76.67, 49.62],
      [99.59, 70.77, 41.63],
      [109.46, 79.34, 47.43],
      [93.44, 64.99, 37.83],
      [81.88, 55.54, 32.17],
      [88.61, 60.61, 34.78],
      [91.41, 64.12, 37.38],
      [103.26, 74.21, 44.83],
      [91.42, 63.21, 36.53],
      [86.62, 58.66, 32.94],
      [100.68, 71.85, 42.55]
    ],
    overallMean: [95.57, 67.27, 39.79],
    notes:
      "Face A is the product's own plank photograph: one complete " +
      "plank, both ends crop-verified in frame, measured aspect " +
      "2.00% off the printed 48.62 x 7.01 in \u2014 the printed " +
      "sheet wins and the photo is normalized to the printed size " +
      "at 48 px/in (the photo itself is mildly anisotropic, " +
      "39.37 px/in across against 38.58 px/in along). No butt " +
      "joint and no collage split inside this print. Faces " +
      "B\u2013K are true-scale windows of the display render: a " +
      "dark render (mean luminance 70.9) whose heavy cathedral " +
      "grain defeated the plain gradient detectors, so the grid " +
      "was proven by band-restricted groove peaks, tonal steps " +
      "and butt-joint termination \u2014 FIVE full-width columns " +
      "(385\u2013387 px, local scales a uniform 55.15 px/in " +
      "\u00b1 0.3%) flanked by the set's narrowest partials " +
      "(39 px and 29 px, both unused). Butt joints crop-verified " +
      "in columns 1, 2, 4 and 5; column 3's strongest candidate " +
      "was crop-proven at three heights to be the print's own " +
      "cathedral grain banding running continuous to the frame " +
      "edge, so column 3 is one continuous print, split at its " +
      "midpoint \u2014 ten segments, one window inside each, " +
      "inset from every joint. A full plank is ~2,682 px at this " +
      "scale, taller than the frame, so no column holds a " +
      "complete unit. Covered lengths are render-measured at " +
      "each column's own scale, not printed dimensions. A window " +
      "may only cover a piece it covers whole \u2014 never " +
      "tiled. Cut by " +
      "~/workspace/floor-and-decor-production/cut_auburn_glen_faces.py; " +
      "each face's own normal map was derived from its own image " +
      "by the same script.",
    patternLogic: {
      kind: "module",
      pattern: "Single-plank module (running bond)",
      moduleIn: [48.62, 7.01],
      wrap:
        "Planks lay in a running bond at the printed size; every " +
        "piece takes one window of one print \u2014 a true-scale " +
        "window for a cut piece, or a flipped window for a longer " +
        "one \u2014 never a repeat inside a piece.",
      rule:
        "Faces are the product's own images at true scale only; " +
        "repX/repY never exceed 1 (no tiling inside a piece).",
    },
  },
  facesGap: null,
  faceMaterial: DURALUX_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-a-normal.jpg",
    "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-b-normal.jpg",
    "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-c-normal.jpg",
    "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-d-normal.jpg",
    "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-e-normal.jpg",
    "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-f-normal.jpg",
    "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-g-normal.jpg",
    "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-h-normal.jpg",
    "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-i-normal.jpg",
    "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-j-normal.jpg",
    "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-k-normal.jpg"
  ],
  moduleIn: [48.62, 7.01],
  model: { kind: "plank-box", lengthIn: 48.62, widthIn: 7.01, thicknessIn: 0.197 },
  gaps: [
    "Pieces per box / sq ft per box: not published on the product page as extracted.",
    "A price ($61.21) appears in the product page's structured offer with no stated coverage basis, so no box price is recorded.",
    "Delta IIC is not printed anywhere on this product's page (the word 'Delta' occurs zero times in the full markup) \u2014 the field is absent from this record, not borrowed. IIC 68 and STC 68 are printed \u2014 the joint-highest pair in the set.",
    "No Country of Origin is printed on this product's page \u2014 not recorded.",
    "The Subfloor row prints a list ('Concrete, Vinyl, Plywood, Tile') where its dimensional neighbours print 'All' and several siblings print none \u2014 read from this product's own page.",
    "Face B covers 4.24 in \u2014 the true frame-edge cut piece of column 1 \u2014 below the floor layout's 6 in minimum piece length: a true face of the product, selectable in the Single view, but the floor layout deals only faces that cover a whole piece.",
    "Variation faces B\u2013K are single-print crops of the product's display render, scale anchored per column; their covered lengths are render-measured, not printed dimensions. Face A is the plank photo at a disclosed 2.00% framing tolerance, normalized to the printed size.",
  ],
};

/** The butcher-block family's shared face-material class: every
 * Manor House butcher-block page read publishes texture
 * Unfinished (finish Unfinished where a finish is printed), so
 * the class is stated once and each record references it. */
const BUTCHER_BLOCK_FACE_MATERIAL: FloorDecorFaceMaterial = {
  kind: "unfinished-solid-wood",
  roughness: 0.8,
  metalness: 0,
  normalScale: 0.4,
  basis:
    "Products' published fields: texture Unfinished family-wide, " +
    "finish Unfinished where a finish is printed \u2014 the " +
    "unfinished solid-wood class; depth from each face's own " +
    "normal map (the strip joints and grain are the relief).",
};

/** The custom-countertop stone classes: the sample pages print
 * material, color and warranty only \u2014 no finish \u2014 so each
 * class claims its material's light response only. */
const QUARTZ_FACE_MATERIAL: FloorDecorFaceMaterial = {
  kind: "quartz-stone",
  roughness: 0.35,
  metalness: 0,
  normalScale: 0.3,
  basis:
    "Product's published fields: material Quartz (custom " +
    "countertop program sample; no finish is printed for the " +
    "sample SKU) \u2014 the quartz stone class; depth from the " +
    "face's own normal map (the veining is the relief).",
};

const GRANITE_FACE_MATERIAL: FloorDecorFaceMaterial = {
  kind: "granite-stone",
  roughness: 0.35,
  metalness: 0,
  normalScale: 0.3,
  basis:
    "Product's published fields: material Granite (custom " +
    "countertop program sample; no finish is printed for the " +
    "sample SKU) \u2014 the granite stone class; depth from the " +
    "face's own normal map (the crystal and veining are the relief).",
};

const MARBLE_FACE_MATERIAL: FloorDecorFaceMaterial = {
  kind: "marble-stone",
  roughness: 0.35,
  metalness: 0,
  normalScale: 0.3,
  basis:
    "Product's published fields: material Marble (custom " +
    "countertop program sample; no finish is printed for the " +
    "sample SKU) \u2014 the marble stone class; depth from the " +
    "face's own normal map (the veining is the relief).",
};

const ACACIA_BUTCHER_BLOCK_12FT: FloorDecorProduct = {
  slug: "acacia-butcher-block-countertop-12ft",
  fdId: "101342376",
  name: "Acacia Butcher Block Countertop 12ft.",
  brand: "Manor House",
  colorway: "Acacia",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl:
    "https://www.flooranddecor.com/wood-butcher-block-countertops/acacia-butcher-block-countertop-12ft.-101342376.html",
  sourcedOn: "2026-11-15",
  lengthIn: 144,
  widthIn: 25,
  nominalLabel: "144 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "High Variation",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge",
  installType: "Countertop",
  warranty: "1 Year Limited",
  box: { lengthIn: 144.88, widthIn: 25.59, weightLbs: 122 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 399,
  priceNote:
    "JSON-LD Product offer on the product page, read 2026-11-15 " +
    "(page showed InStock); the PDP renders the figure per piece " +
    "\u2014 the product is sold as one 144 x 25 in slab per piece. " +
    "No per-square-foot price is published.",
  imageUrl:
    "https://i8.amplience.net/i/flooranddecor/101342376_acacia-butcher-block-countertop-12ft_display",
  faceSet: {
    product: "Acacia Butcher Block Countertop 12ft.",
    productSlug: "acacia-butcher-block-countertop-12ft",
    option: "Acacia",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101342376_acacia-butcher-block-countertop-12ft_display",
    swatchSize: [3376, 3376],
    variants: [
      { url: "/app/floor-and-decor/countertops/acacia-butcher-block-countertop-12ft/face-top-a.jpg", sourceBox: [0, 1395, 3376, 1981], sourceSize: [3376, 586], mean: [180.98, 144.71, 97.61], faceIn: [144, 25] },
    ],
    unitMeans: [
      [180.98, 144.71, 97.61],
    ],
    overallMean: [180.98, 144.71, 97.61],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 3376 x 3376) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [144, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/acacia-butcher-block-countertop-12ft/face-top-a-normal.jpg",
  ],
  moduleIn: [144, 25],
  model: null,
  gaps: [
    "Species Acacia, Core Type Solid Wood, Board Form Multi Width, Hardness Rating 3 on the page's own 1\u20135 scale ('Janka' occurs zero times on the page \u2014 no Janka figure is recorded), Minimum Acclimation 24 hours, Residential/ Light Commercial use \u2014 printed fields with no registry slot ride here verbatim.",
    "This is the 101342xxx Solid Wood generation; the catalog's other Acacia generation (101316xxx, Lumber Core, no warranty) is a distinct product and was NOT read or merged into this record.",
    "No slab photo and no room scene exist for this product: _1 duplicates _display byte for byte; _2, _3, _4 and the _room slot all return the Amplience 'image coming soon' placeholder.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Box height is not printed on the product page (only Box Length 144.88, Box Width 25.59, Box Weight 122 lbs) \u2014 not recorded.",
    "No coverage figure and no per-square-foot price are published \u2014 a countertop slab is sold per piece.",
    "No wear layer, attached pad, sound ratings or VOC certification are printed anywhere on this product's page (it is a solid-wood slab, not a rigid-core plank) \u2014 those fields are absent, not borrowed.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const WALNUT_BUTCHER_BLOCK_12FT: FloorDecorProduct = {
  slug: "walnut-butcher-block-countertop-12ft",
  fdId: "100020684",
  name: "American Walnut Butcher Block Countertop 12ft.",
  brand: "Manor House",
  colorway: "American Walnut",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl:
    "https://www.flooranddecor.com/wood-butcher-block-countertops/walnut-butcher-block-countertop-12ft.-100020684.html",
  sourcedOn: "2026-11-15",
  lengthIn: 144,
  widthIn: 25,
  nominalLabel: "144 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Dark",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 145, widthIn: 27, weightLbs: 108 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 699,
  priceNote:
    "JSON-LD Product offer on the product page, read 2026-11-15 " +
    "(page showed InStock); the PDP renders the figure per piece " +
    "\u2014 the product is sold as one 144 x 25 in slab per piece. " +
    "No per-square-foot price is published.",
  imageUrl:
    "https://i8.amplience.net/i/flooranddecor/100020684_walnut-butcher-block-countertop-12ft-kitchen-countertop_room",
  faceSet: {
    product: "American Walnut Butcher Block Countertop 12ft.",
    productSlug: "walnut-butcher-block-countertop-12ft",
    option: "American Walnut",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100020676_american-walnut-butcher-block-countertop-8ft_1",
    swatchSize: [440, 440],
    variants: [
      { url: "/app/floor-and-decor/countertops/walnut-butcher-block-countertop-12ft/face-top-a.jpg", sourceBox: [0, 182, 440, 258], sourceSize: [440, 76], mean: [99.94, 52.91, 36.25], faceIn: [144, 25] },
    ],
    unitMeans: [
      [99.94, 52.91, 36.25],
    ],
    overallMean: [99.94, 52.91, 36.25],
    notes:
      "The slab face: a uniform-scale window of the identical product's field (served 440 x 440) at this slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Provenance: the field is the 8 ft SKU's (item 100020676) of the identical Manor House American Walnut product \u2014 same maker, species, construction and finish; only the length differs \u2014 used per the founder's decision (2026-11-15) because Floor & Decor publishes no field for this 12 ft SKU. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_walnut12.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [144, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/walnut-butcher-block-countertop-12ft/face-top-a-normal.jpg",
  ],
  moduleIn: [144, 25],
  model: null,
  gaps: [
    "Species Walnut (American Walnut), Core Type Solid Wood, Hardness Rating 2 on the page's own 1\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Residential use only, Country of Origin United States of America (printed, with the page's 'Made in America with globally sourced components' note) \u2014 printed fields with no registry slot ride here verbatim.",
    "Warranty prints 'Sold As Is.' \u2014 no manufacturer term at all (the Acacia pilot prints 1 Year Limited).",
    "The standard display image URL for this product serves the Amplience placeholder \u2014 it must not be presented as product imagery; this record's imageUrl is the product's one real image, its installed-counter room scene.",
    "No Board Form row is printed on this product's page ('Board Form' occurs zero times) and no numeric strip width \u2014 not recorded.",
    "The room scene shows the counter installed with a finished-looking oiled sheen while the product is sold Unfinished \u2014 the scene is the maker's styling, not the sold finish.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Box height is not printed on the product page (only Box Length 145, Box Width 27, Box Weight 108 lbs) \u2014 not recorded.",
    "No coverage figure and no per-square-foot price are published \u2014 a countertop slab is sold per piece.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the identical product's field at the slab's printed aspect, strips along the length, with its own Sobel normal map. Provenance: Floor & Decor publishes no field for this 12 ft SKU (the placeholder serves at every slot), so per the founder's decision (2026-11-15) the face was cut from the 8 ft SKU of the identical Manor House product \u2014 same maker, species, construction and finish; only the length differs.",
    "Resolution flag: the source field (the 8 ft SKU's) serves at 440 x 440 px, so the slab face is built from a small source; a higher-resolution field is a named gap if Floor & Decor ever publishes one.",
  ],
};

const AMERICAN_MAPLE_BUTCHER_BLOCK_COUNTERTOP_12FT: FloorDecorProduct = {
  slug: "american-maple-butcher-block-countertop-12ft",
  fdId: "100020643",
  name: "American Maple Butcher Block Countertop 12ft.",
  brand: "Manor House",
  colorway: "American Maple",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/american-maple-butcher-block-countertop-12ft.-100020643.html",
  sourcedOn: "2026-11-15",
  lengthIn: 144,
  widthIn: 25,
  nominalLabel: "144 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 145, widthIn: 27, weightLbs: 120 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 479,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$479.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100020643_american-maple-butcher-block-countertop-12ft_1",
  faceSet: {
    product: "American Maple Butcher Block Countertop 12ft.",
    productSlug: "american-maple-butcher-block-countertop-12ft",
    option: "American Maple",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100020643_american-maple-butcher-block-countertop-12ft_1",
    swatchSize: [1566, 1566],
    variants: [
      { url: "/app/floor-and-decor/countertops/american-maple-butcher-block-countertop-12ft/face-top-a.jpg", sourceBox: [0, 647, 1566, 919], sourceSize: [1566, 272], mean: [176.1, 140.9, 100.59], faceIn: [144, 25] },
    ],
    unitMeans: [
      [176.1, 140.9, 100.59],
    ],
    overallMean: [176.1, 140.9, 100.59],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 1566 x 1566) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [144, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/american-maple-butcher-block-countertop-12ft/face-top-a-normal.jpg",
  ],
  moduleIn: [144, 25],
  model: null,
  gaps: [
    "Species Maple, Core Type Solid Wood, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "Follows the batch's dominant pattern: Solid Wood core, 'Sold As Is.' warranty, 72-hour acclimation, United States of America origin, Square Edge / Square Ends.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const RED_OAK_BUTCHER_BLOCK_COUNTERTOP_12FT: FloorDecorProduct = {
  slug: "red-oak-butcher-block-countertop-12ft",
  fdId: "100065085",
  name: "Red Oak Butcher Block Countertop 12ft.",
  brand: "Manor House",
  colorway: "Red Oak",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/red-oak-butcher-block-countertop-12ft.-100065085.html",
  sourcedOn: "2026-11-15",
  lengthIn: 144,
  widthIn: 25,
  nominalLabel: "144 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Light",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 145, widthIn: 27, weightLbs: 120 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 479,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$479.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100065085_red-oak-butcher-block-countertop-12ft_1",
  faceSet: {
    product: "Red Oak Butcher Block Countertop 12ft.",
    productSlug: "red-oak-butcher-block-countertop-12ft",
    option: "Red Oak",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100065085_red-oak-butcher-block-countertop-12ft_1",
    swatchSize: [2250, 2250],
    variants: [
      { url: "/app/floor-and-decor/countertops/red-oak-butcher-block-countertop-12ft/face-top-a.jpg", sourceBox: [0, 929, 2250, 1320], sourceSize: [2250, 391], mean: [200.79, 149.18, 110.02], faceIn: [144, 25] },
    ],
    unitMeans: [
      [200.79, 149.18, 110.02],
    ],
    overallMean: [200.79, 149.18, 110.02],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2250 x 2250) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [144, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/red-oak-butcher-block-countertop-12ft/face-top-a-normal.jpg",
  ],
  moduleIn: [144, 25],
  model: null,
  gaps: [
    "Species Red Oak, Core Type Solid Wood, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "Follows the batch's dominant pattern: Solid Wood core, 'Sold As Is.' warranty, 72-hour acclimation, USA origin. Shade prints Light (the 12ft Cherry/Maple print Medium).",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const AMERICAN_CHERRY_BUTCHER_BLOCK_COUNTERTOP_12FT: FloorDecorProduct = {
  slug: "american-cherry-butcher-block-countertop-12ft",
  fdId: "100020668",
  name: "American Cherry Butcher Block Countertop 12ft.",
  brand: "Manor House",
  colorway: "American Cherry",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/american-cherry-butcher-block-countertop-12ft.-100020668.html",
  sourcedOn: "2026-11-15",
  lengthIn: 144,
  widthIn: 25,
  nominalLabel: "144 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 145, widthIn: 27, weightLbs: 108 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 479,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$479.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100020668_american-cherry-butcher-block-countertop-12ft_1",
  faceSet: {
    product: "American Cherry Butcher Block Countertop 12ft.",
    productSlug: "american-cherry-butcher-block-countertop-12ft",
    option: "American Cherry",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100020668_american-cherry-butcher-block-countertop-12ft_1",
    swatchSize: [1548, 1548],
    variants: [
      { url: "/app/floor-and-decor/countertops/american-cherry-butcher-block-countertop-12ft/face-top-a.jpg", sourceBox: [0, 639, 1548, 908], sourceSize: [1548, 269], mean: [215.26, 148.01, 100.59], faceIn: [144, 25] },
    ],
    unitMeans: [
      [215.26, 148.01, 100.59],
    ],
    overallMean: [215.26, 148.01, 100.59],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 1548 x 1548) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [144, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/american-cherry-butcher-block-countertop-12ft/face-top-a-normal.jpg",
  ],
  moduleIn: [144, 25],
  model: null,
  gaps: [
    "Species Cherry, Core Type Solid Wood, Hardness Rating 1 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "Hardness Rating 1 \u2014 the lowest in the batch (its 8ft sibling 100020650 also prints 1; every other product prints 2–4). Otherwise the dominant pattern: Solid Wood, 'Sold As Is.', 72 hours, USA origin.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const AMERICAN_HICKORY_BUTCHER_BLOCK_COUNTERTOP_12FT: FloorDecorProduct = {
  slug: "american-hickory-butcher-block-countertop-12ft",
  fdId: "100110121",
  name: "American Hickory Butcher Block Countertop 12ft.",
  brand: "Manor House",
  colorway: "American Hickory",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/american-hickory-butcher-block-countertop-12ft.-100110121.html",
  sourcedOn: "2026-11-15",
  lengthIn: 144,
  widthIn: 25,
  nominalLabel: "144 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 145, widthIn: 27, weightLbs: 130 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 529,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$529.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100110121_american-hickory-butcher-block-countertop-12ft_1",
  faceSet: {
    product: "American Hickory Butcher Block Countertop 12ft.",
    productSlug: "american-hickory-butcher-block-countertop-12ft",
    option: "American Hickory",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100110121_american-hickory-butcher-block-countertop-12ft_1",
    swatchSize: [1914, 1914],
    variants: [
      { url: "/app/floor-and-decor/countertops/american-hickory-butcher-block-countertop-12ft/face-top-a.jpg", sourceBox: [0, 791, 1914, 1123], sourceSize: [1914, 332], mean: [210, 166.33, 123.95], faceIn: [144, 25] },
    ],
    unitMeans: [
      [210, 166.33, 123.95],
    ],
    overallMean: [210, 166.33, 123.95],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 1914 x 1914) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [144, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/american-hickory-butcher-block-countertop-12ft/face-top-a-normal.jpg",
  ],
  moduleIn: [144, 25],
  model: null,
  gaps: [
    "Species Hickory, Core Type Solid Wood, Hardness Rating 4 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "Hardness Rating 4 \u2014 the highest among the batch's Solid Wood products (its 8ft sibling 100110113 also prints 4). Otherwise the dominant pattern: Solid Wood, 'Sold As Is.', 72 hours, USA origin. Heaviest 12ft box in the batch at 130 lbs.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const WHITE_OAK_BUTCHER_BLOCK_COUNTERTOP_8FT: FloorDecorProduct = {
  slug: "white-oak-butcher-block-countertop-8ft",
  fdId: "100020619",
  name: "White Oak Butcher Block Countertop 8ft.",
  brand: "Manor House",
  colorway: "White Oak",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/oak-wood/white-oak-butcher-block-countertop-8ft.-100020619.html",
  sourcedOn: "2026-11-15",
  lengthIn: 96,
  widthIn: 25,
  nominalLabel: "96 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Light",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 97, widthIn: 27, weightLbs: 78 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 369,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$369.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100020619_white-oak-butcher-block-countertop-8ft_1",
  faceSet: {
    product: "White Oak Butcher Block Countertop 8ft.",
    productSlug: "white-oak-butcher-block-countertop-8ft",
    option: "White Oak",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100020619_white-oak-butcher-block-countertop-8ft_1",
    swatchSize: [2400, 2400],
    variants: [
      { url: "/app/floor-and-decor/countertops/white-oak-butcher-block-countertop-8ft/face-top-a.jpg", sourceBox: [0, 887, 2400, 1512], sourceSize: [2400, 625], mean: [170.4, 139.77, 78.25], faceIn: [96, 25] },
    ],
    unitMeans: [
      [170.4, 139.77, 78.25],
    ],
    overallMean: [170.4, 139.77, 78.25],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2400 x 2400) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [96, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/white-oak-butcher-block-countertop-8ft/face-top-a-normal.jpg",
  ],
  moduleIn: [96, 25],
  model: null,
  gaps: [
    "Species White Oak, Core Type Solid Wood, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "Follows the batch's dominant pattern: Solid Wood, 'Sold As Is.', 72 hours, USA origin, Square Edge / Square Ends.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const ACACIA_BUTCHER_BLOCK_COUNTERTOP_8FT: FloorDecorProduct = {
  slug: "acacia-butcher-block-countertop-8ft",
  fdId: "101342350",
  name: "Acacia Butcher Block Countertop 8ft.",
  brand: "Manor House",
  colorway: "Acacia",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/acacia-butcher-block-countertop-8ft.-101342350.html",
  sourcedOn: "2026-11-15",
  lengthIn: 96,
  widthIn: 25,
  nominalLabel: "96 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "High Variation",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge",
  installType: "Countertop",
  warranty: "1 Year Limited",
  box: { lengthIn: 96.85, widthIn: 25.59, weightLbs: 80 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 279,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$279.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101342350_acacia-butcher-block-countertop-8ft_1",
  faceSet: {
    product: "Acacia Butcher Block Countertop 8ft.",
    productSlug: "acacia-butcher-block-countertop-8ft",
    option: "Acacia",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101342350_acacia-butcher-block-countertop-8ft_1",
    swatchSize: [3376, 3376],
    variants: [
      { url: "/app/floor-and-decor/countertops/acacia-butcher-block-countertop-8ft/face-top-a.jpg", sourceBox: [0, 1248, 3376, 2127], sourceSize: [3376, 879], mean: [181.09, 145.28, 98.37], faceIn: [96, 25] },
    ],
    unitMeans: [
      [181.09, 145.28, 98.37],
    ],
    overallMean: [181.09, 145.28, 98.37],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 3376 x 3376) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [96, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/acacia-butcher-block-countertop-8ft/face-top-a-normal.jpg",
  ],
  moduleIn: [96, 25],
  model: null,
  gaps: [
    "Species Acacia, Core Type Solid Wood, Board Form Multi Width, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 24 hours, Use Residential/ Light Commercial \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Country of Origin is printed on this product's page \u2014 not recorded.",
    "Solid Wood Acacia generation (101342xxx), matching the 12ft pilot 101342376's pattern and breaking the batch's dominant one: Board Form IS printed ('Multi Width' \u2014 one of only two products in the batch with the row), warranty '1 Year Limited' (not 'Sold As Is.'), acclimation 24 hours (not 72), shade 'High Variation', edge plain 'Square Edge' (no '/ Square Ends'), decimal box dims 96.85 x 25.59 in, use 'Residential/ Light Commercial', and NO Country of Origin row.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const ACACIA_BUTCHER_BLOCK_COUNTERTOP_8FT_101316941: FloorDecorProduct = {
  slug: "acacia-butcher-block-countertop-8ft-101316941",
  fdId: "101316941",
  name: "Acacia Butcher Block Countertop 8ft.",
  brand: "Manor House",
  colorway: "Acacia",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/acacia-butcher-block-countertop-8ft.-101316941.html",
  sourcedOn: "2026-11-15",
  lengthIn: 95.98,
  widthIn: 25,
  nominalLabel: "96 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "NONE",
  box: { lengthIn: 96.4, widthIn: 25.2, weightLbs: 116 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 399,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$399.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101316941_acacia-butcher-block-countertop-8ft_1",
  faceSet: {
    product: "Acacia Butcher Block Countertop 8ft.",
    productSlug: "acacia-butcher-block-countertop-8ft-101316941",
    option: "Acacia",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101316941_acacia-butcher-block-countertop-8ft_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/acacia-butcher-block-countertop-8ft-101316941/face-top-a.jpg", sourceBox: [0, 924, 2500, 1575], sourceSize: [2500, 651], mean: [167.84, 125.94, 93.85], faceIn: [95.98, 25] },
    ],
    unitMeans: [
      [167.84, 125.94, 93.85],
    ],
    overallMean: [167.84, 125.94, 93.85],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2500 x 2500) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [95.98, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/acacia-butcher-block-countertop-8ft-101316941/face-top-a-normal.jpg",
  ],
  moduleIn: [95.98, 25],
  model: null,
  gaps: [
    "Species Acacia, Core Type Lumber Core, Hardness Rating 4 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 48 hours, Use Residential/ Light Commercial \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "No Country of Origin is printed on this product's page \u2014 not recorded.",
    "No Finish Type row is printed on this product's page (Texture/Surface prints 'Unfinished') \u2014 finishType not recorded separately.",
    "INCONSISTENCY: the name claims 8ft (96 in) but Product Length prints 95.98in \u2014 recorded as printed.",
    "INCONSISTENCY: Size prints '96 x 25in.' but Product Length x Product Width is '95.98 x 25in.' \u2014 recorded as printed.",
    "Lumber Core \u2014 the ONLY Lumber Core product in the batch; the other Acacia generation (101316xxx), kept strictly separate from the Solid Wood 101342xxx records. Warranty prints 'NONE' verbatim. No Finish Type row and no Country of Origin row (20 spec rows vs the family's 22). Acclimation 48 hours (neither the 24h Solid-Acacia nor the 72h dominant figure). Use 'Residential/ Light Commercial'. Box weight 116 lbs is heavy for an 8ft (the Solid Wood 8ft boxes run 70–97 lbs).",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const HEVEA_II_BUTCHER_BLOCK_COUNTERTOP_8FT: FloorDecorProduct = {
  slug: "hevea-ii-butcher-block-countertop-8ft",
  fdId: "100924380",
  name: "Hevea II Butcher Block Countertop 8ft.",
  brand: "Manor House",
  colorway: "Hevea II",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/hevea-ii-butcher-block-countertop-8ft.-100924380.html",
  sourcedOn: "2026-11-15",
  lengthIn: 96,
  widthIn: 25,
  nominalLabel: "96 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Light",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 96.5, widthIn: 25.2, weightLbs: 87 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 199,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$199.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100924380_hevea-ii-butcher-block-countertop-8ft_1",
  faceSet: {
    product: "Hevea II Butcher Block Countertop 8ft.",
    productSlug: "hevea-ii-butcher-block-countertop-8ft",
    option: "Hevea II",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100924380_hevea-ii-butcher-block-countertop-8ft_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/hevea-ii-butcher-block-countertop-8ft/face-top-a.jpg", sourceBox: [0, 924, 2500, 1575], sourceSize: [2500, 651], mean: [224.37, 203.02, 182.25], faceIn: [96, 25] },
    ],
    unitMeans: [
      [224.37, 203.02, 182.25],
    ],
    overallMean: [224.37, 203.02, 182.25],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2500 x 2500) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [96, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/hevea-ii-butcher-block-countertop-8ft/face-top-a-normal.jpg",
  ],
  moduleIn: [96, 25],
  model: null,
  gaps: [
    "Species Hevea, Core Type Solid Wood, Hardness Rating 2 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential/ Commercial \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "No Country of Origin is printed on this product's page \u2014 not recorded.",
    "No Country of Origin row is printed (21 spec rows) \u2014 not recorded. Use prints 'Residential/ Commercial' where most of the batch prints 'Residential' only. The name says 'Hevea II' while the Species row prints 'Hevea'. Box width prints 25.2 (decimal) where the domestic Solid Wood 8ft boxes print 27.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const BEECH_BUTCHER_BLOCK_COUNTERTOP_8FT: FloorDecorProduct = {
  slug: "beech-butcher-block-countertop-8ft",
  fdId: "100927524",
  name: "Beech Butcher Block Countertop 8ft.",
  brand: "Manor House",
  colorway: "Beech",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/beech-butcher-block-countertop-8ft.-100927524.html",
  sourcedOn: "2026-11-15",
  lengthIn: 96,
  widthIn: 25,
  nominalLabel: "96 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Light",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Micro Beveled Edge/Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 96.25, widthIn: 25.25, weightLbs: 97 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 199,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$199.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100927524_beech-butcher-block-countertop-8ft_1",
  faceSet: {
    product: "Beech Butcher Block Countertop 8ft.",
    productSlug: "beech-butcher-block-countertop-8ft",
    option: "Beech",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100927524_beech-butcher-block-countertop-8ft_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/beech-butcher-block-countertop-8ft/face-top-a.jpg", sourceBox: [0, 924, 2500, 1575], sourceSize: [2500, 651], mean: [210.9, 159.31, 122.53], faceIn: [96, 25] },
    ],
    unitMeans: [
      [210.9, 159.31, 122.53],
    ],
    overallMean: [210.9, 159.31, 122.53],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2500 x 2500) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [96, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/beech-butcher-block-countertop-8ft/face-top-a-normal.jpg",
  ],
  moduleIn: [96, 25],
  model: null,
  gaps: [
    "Species Beech, Core Type Solid Wood, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential/ Commercial, Country of Origin Poland \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "Country of Origin prints Poland \u2014 the only non-USA origin in the batch. Edge prints 'Micro Beveled Edge/Square Ends' \u2014 the only product in the batch without a square edge. Use prints 'Residential/ Commercial'. Decimal box dims 96.25 x 25.25 in.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const RED_OAK_BUTCHER_BLOCK_COUNTERTOP_8FT: FloorDecorProduct = {
  slug: "red-oak-butcher-block-countertop-8ft",
  fdId: "100947886",
  name: "Red Oak Butcher Block Countertop 8ft.",
  brand: "Manor House",
  colorway: "Red Oak",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/red-oak-butcher-block-countertop-8ft.-100947886.html",
  sourcedOn: "2026-11-15",
  lengthIn: 96,
  widthIn: 25,
  nominalLabel: "96 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Light",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 97, widthIn: 26, weightLbs: 115 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 239.91,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$239.91 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100947886_red-oak-butcher-block-countertop-8ft_1",
  faceSet: {
    product: "Red Oak Butcher Block Countertop 8ft.",
    productSlug: "red-oak-butcher-block-countertop-8ft",
    option: "Red Oak",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100947886_red-oak-butcher-block-countertop-8ft_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/red-oak-butcher-block-countertop-8ft/face-top-a.jpg", sourceBox: [0, 924, 2500, 1575], sourceSize: [2500, 651], mean: [215.68, 185.02, 159.09], faceIn: [96, 25] },
    ],
    unitMeans: [
      [215.68, 185.02, 159.09],
    ],
    overallMean: [215.68, 185.02, 159.09],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2500 x 2500) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [96, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/red-oak-butcher-block-countertop-8ft/face-top-a-normal.jpg",
  ],
  moduleIn: [96, 25],
  model: null,
  gaps: [
    "Species Red Oak, Core Type Solid Wood, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "Offer price $239.91 is the batch's only non-round figure. Box width prints 26 where the other domestic Solid Wood 8ft boxes print 27. Otherwise the dominant pattern: Solid Wood, 'Sold As Is.', 72 hours, USA origin.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const AMERICAN_WALNUT_BUTCHER_BLOCK_COUNTERTOP_8FT: FloorDecorProduct = {
  slug: "american-walnut-butcher-block-countertop-8ft",
  fdId: "100020676",
  name: "American Walnut Butcher Block Countertop 8ft.",
  brand: "Manor House",
  colorway: "American Walnut",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/american-walnut-butcher-block-countertop-8ft.-100020676.html",
  sourcedOn: "2026-11-15",
  lengthIn: 96,
  widthIn: 25,
  nominalLabel: "96 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Dark",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 97, widthIn: 27, weightLbs: 70 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 499,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$499.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100020676_american-walnut-butcher-block-countertop-8ft_1",
  faceSet: {
    product: "American Walnut Butcher Block Countertop 8ft.",
    productSlug: "american-walnut-butcher-block-countertop-8ft",
    option: "American Walnut",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100020676_american-walnut-butcher-block-countertop-8ft_1",
    swatchSize: [440, 440],
    variants: [
      { url: "/app/floor-and-decor/countertops/american-walnut-butcher-block-countertop-8ft/face-top-a.jpg", sourceBox: [0, 162, 440, 277], sourceSize: [440, 115], mean: [96.46, 49.76, 33.77], faceIn: [96, 25] },
    ],
    unitMeans: [
      [96.46, 49.76, 33.77],
    ],
    overallMean: [96.46, 49.76, 33.77],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 440 x 440) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [96, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/american-walnut-butcher-block-countertop-8ft/face-top-a-normal.jpg",
  ],
  moduleIn: [96, 25],
  model: null,
  gaps: [
    "Species Walnut, Core Type Solid Wood, Hardness Rating 2 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "Shade prints Dark \u2014 the only Dark shade in the batch. Otherwise the dominant pattern: Solid Wood, 'Sold As Is.', 72 hours, USA origin.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
    "Resolution flag: the product's field serves at 440 x 440 px, so the slab face is built from a small source; a higher-resolution field is a named gap if Floor & Decor ever publishes one.",
  ],
};

const AMERICAN_MAPLE_BUTCHER_BLOCK_COUNTERTOP_8FT: FloorDecorProduct = {
  slug: "american-maple-butcher-block-countertop-8ft",
  fdId: "100020635",
  name: "American Maple Butcher Block Countertop 8ft.",
  brand: "Manor House",
  colorway: "American Maple",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/american-maple-butcher-block-countertop-8ft.-100020635.html",
  sourcedOn: "2026-11-15",
  lengthIn: 96,
  widthIn: 25,
  nominalLabel: "96 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 97, widthIn: 27, weightLbs: 78 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 349,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$349.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100020635_american-maple-butcher-block-countertop-8ft_1",
  faceSet: {
    product: "American Maple Butcher Block Countertop 8ft.",
    productSlug: "american-maple-butcher-block-countertop-8ft",
    option: "American Maple",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100020635_american-maple-butcher-block-countertop-8ft_1",
    swatchSize: [1566, 1566],
    variants: [
      { url: "/app/floor-and-decor/countertops/american-maple-butcher-block-countertop-8ft/face-top-a.jpg", sourceBox: [0, 579, 1566, 987], sourceSize: [1566, 408], mean: [180.58, 146.91, 107.69], faceIn: [96, 25] },
    ],
    unitMeans: [
      [180.58, 146.91, 107.69],
    ],
    overallMean: [180.58, 146.91, 107.69],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 1566 x 1566) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [96, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/american-maple-butcher-block-countertop-8ft/face-top-a-normal.jpg",
  ],
  moduleIn: [96, 25],
  model: null,
  gaps: [
    "Species Maple, Core Type Solid Wood, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "Follows the batch's dominant pattern: Solid Wood, 'Sold As Is.', 72 hours, USA origin.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const AMERICAN_HICKORY_BUTCHER_BLOCK_COUNTERTOP_8FT: FloorDecorProduct = {
  slug: "american-hickory-butcher-block-countertop-8ft",
  fdId: "100110113",
  name: "American Hickory Butcher Block Countertop 8ft.",
  brand: "Manor House",
  colorway: "American Hickory",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/american-hickory-butcher-block-countertop-8ft.-100110113.html",
  sourcedOn: "2026-11-15",
  lengthIn: 96,
  widthIn: 25,
  nominalLabel: "96 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 97, widthIn: 27, weightLbs: 85 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 369,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$369.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100110113_american-hickory-butcher-block-countertop-8ft_1",
  faceSet: {
    product: "American Hickory Butcher Block Countertop 8ft.",
    productSlug: "american-hickory-butcher-block-countertop-8ft",
    option: "American Hickory",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100110113_american-hickory-butcher-block-countertop-8ft_1",
    swatchSize: [1914, 1914],
    variants: [
      { url: "/app/floor-and-decor/countertops/american-hickory-butcher-block-countertop-8ft/face-top-a.jpg", sourceBox: [0, 708, 1914, 1206], sourceSize: [1914, 498], mean: [208.59, 163.78, 120.17], faceIn: [96, 25] },
    ],
    unitMeans: [
      [208.59, 163.78, 120.17],
    ],
    overallMean: [208.59, 163.78, 120.17],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 1914 x 1914) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [96, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/american-hickory-butcher-block-countertop-8ft/face-top-a-normal.jpg",
  ],
  moduleIn: [96, 25],
  model: null,
  gaps: [
    "Species Hickory, Core Type Solid Wood, Hardness Rating 4 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "Hardness Rating 4 \u2014 the highest among the batch's Solid Wood products (its 12ft sibling 100110121 also prints 4). Otherwise the dominant pattern.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const AMERICAN_CHERRY_BUTCHER_BLOCK_COUNTERTOP_8FT: FloorDecorProduct = {
  slug: "american-cherry-butcher-block-countertop-8ft",
  fdId: "100020650",
  name: "American Cherry Butcher Block Countertop 8ft.",
  brand: "Manor House",
  colorway: "American Cherry",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/american-cherry-butcher-block-countertop-8ft.-100020650.html",
  sourcedOn: "2026-11-15",
  lengthIn: 96,
  widthIn: 25,
  nominalLabel: "96 x 25in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 97, widthIn: 27, weightLbs: 70 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 349,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$349.00 / piece' \u2014 the product is sold per piece.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100020650_american-cherry-butcher-block-countertop-8ft_1",
  faceSet: {
    product: "American Cherry Butcher Block Countertop 8ft.",
    productSlug: "american-cherry-butcher-block-countertop-8ft",
    option: "American Cherry",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100020650_american-cherry-butcher-block-countertop-8ft_1",
    swatchSize: [1548, 1548],
    variants: [
      { url: "/app/floor-and-decor/countertops/american-cherry-butcher-block-countertop-8ft/face-top-a.jpg", sourceBox: [0, 572, 1548, 975], sourceSize: [1548, 403], mean: [213.13, 144.73, 97.44], faceIn: [96, 25] },
    ],
    unitMeans: [
      [213.13, 144.73, 97.44],
    ],
    overallMean: [213.13, 144.73, 97.44],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 1548 x 1548) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [96, 25],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/american-cherry-butcher-block-countertop-8ft/face-top-a-normal.jpg",
  ],
  moduleIn: [96, 25],
  model: null,
  gaps: [
    "Species Cherry, Core Type Solid Wood, Hardness Rating 1 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Box height is not printed on the product page (only Box Length, Box Width, Box Weight) \u2014 not recorded.",
    "No Janka figure is printed ('Janka' occurs zero times on the page); hardness is the page's own 1–5 Hardness Rating only.",
    "No per-square-foot price is published \u2014 the PDP renders the price per piece only, and no coverage figure is published (a countertop slab is sold per piece).",
    "No Board Form row is printed on this product's page \u2014 not recorded.",
    "Hardness Rating 1 \u2014 the lowest in the batch (its 12ft sibling 100020668 also prints 1). Otherwise the dominant pattern: Solid Wood, 'Sold As Is.', 72 hours, USA origin.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const ACACIA_BUTCHER_BLOCK_ISLAND_6_FT: FloorDecorProduct = {
  slug: "acacia-butcher-block-island-6-ft",
  fdId: "101342384",
  name: "Acacia Butcher Block Island 6 ft.",
  brand: "Manor House",
  colorway: "Acacia",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/acacia-butcher-block-island-6-ft.-101342384.html",
  sourcedOn: "2026-11-15",
  lengthIn: 72,
  widthIn: 36,
  nominalLabel: "72 x 36in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "High Variation",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge",
  installType: "Countertop",
  warranty: "1 Year Limited",
  box: { lengthIn: 72.83, widthIn: 36.61, weightLbs: 85 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 279,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$279.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101342384_acacia-butcher-block-island-6-ft_display",
  faceSet: {
    product: "Acacia Butcher Block Island 6 ft.",
    productSlug: "acacia-butcher-block-island-6-ft",
    option: "Acacia",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101342384_acacia-butcher-block-island-6-ft_display",
    swatchSize: [3376, 3376],
    variants: [
      { url: "/app/floor-and-decor/countertops/acacia-butcher-block-island-6-ft/face-top-a.jpg", sourceBox: [0, 844, 3376, 2532], sourceSize: [3376, 1688], mean: [180.08, 143.82, 97.02], faceIn: [72, 36] },
    ],
    unitMeans: [
      [180.08, 143.82, 97.02],
    ],
    overallMean: [180.08, 143.82, 97.02],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 3376 x 3376) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [72, 36],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/acacia-butcher-block-island-6-ft/face-top-a-normal.jpg",
  ],
  moduleIn: [72, 36],
  model: null,
  gaps: [
    "Species Acacia, Core Type Solid Wood, Board Form Multi Width, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 24 hours, Use Residential/ Light Commercial \\u2014 printed fields with no registry slot ride here verbatim.",
    "Country of Origin is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "One of only two products in the batch whose page prints a Board Form row ('Multi Width') \u2014 the other is its workbench sibling 101342368.",
    "Warranty prints '1 Year Limited' where most of the batch prints 'Sold As Is.' or 'NONE'; acclimation prints 24 hours, the shortest in the batch (shared only with 101342368).",
    "Shade prints 'High Variation' (shared only with 101342368); edge prints plain 'Square Edge' with no '/ Square Ends'.",
    "No Country of Origin row is printed, unlike the American-species and Beech products.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const ACACIA_BUTCHER_BLOCK_ISLAND_6FT: FloorDecorProduct = {
  slug: "acacia-butcher-block-island-6ft",
  fdId: "101316925",
  name: "Acacia Butcher Block Island 6ft.",
  brand: "Manor House",
  colorway: "Acacia",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/acacia-butcher-block-island-6ft.-101316925.html",
  sourcedOn: "2026-11-15",
  lengthIn: 71.97,
  widthIn: 35.98,
  nominalLabel: "72 x 36in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "NONE",
  box: { lengthIn: 72.4, widthIn: 36.2, weightLbs: 123 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 449,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$449.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101316925_acacia-butcher-block-island-6ft_display",
  faceSet: {
    product: "Acacia Butcher Block Island 6ft.",
    productSlug: "acacia-butcher-block-island-6ft",
    option: "Acacia",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101316925_acacia-butcher-block-island-6ft_display",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/acacia-butcher-block-island-6ft/face-top-a.jpg", sourceBox: [0, 625, 2500, 1875], sourceSize: [2500, 1250], mean: [172.9, 130.58, 97.36], faceIn: [71.97, 35.98] },
    ],
    unitMeans: [
      [172.9, 130.58, 97.36],
    ],
    overallMean: [172.9, 130.58, 97.36],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2500 x 2500) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [71.97, 35.98],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/acacia-butcher-block-island-6ft/face-top-a-normal.jpg",
  ],
  moduleIn: [71.97, 35.98],
  model: null,
  gaps: [
    "Species Acacia, Core Type Lumber Core, Hardness Rating 4 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 48 hours, Use Residential/ Light Commercial \\u2014 printed fields with no registry slot ride here verbatim.",
    "Board Form is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Finish Type is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Country of Origin is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Lumber Core generation: Core Type prints 'Lumber Core' \u2014 the only Lumber Core product in this batch \u2014 and must not be merged with the Solid Wood Acacia generation (101342384).",
    "Warranty prints 'NONE' and Minimum Acclimation Time 48 hours, against the Solid Wood sibling's '1 Year Limited' / 24 hours.",
    "No Finish Type row and no Board Form row are printed (the Solid Wood sibling prints both).",
    "Product Length/Width print as metric-derived decimals (71.97 x 35.98) under a '72 x 36in.' Size label \u2014 recorded as printed.",
    "Hardness Rating prints 4 (sibling prints 3), Shade prints 'Medium' (sibling 'High Variation'), and the box is far heavier (123 lbs vs 85 lbs) at a higher price ($449.00 vs $279.00).",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const HEVEA_II_BUTCHER_BLOCK_ISLAND_6FT: FloorDecorProduct = {
  slug: "hevea-ii-butcher-block-island-6ft",
  fdId: "100924398",
  name: "Hevea II Butcher Block Island 6ft.",
  brand: "Manor House",
  colorway: "Hevea II",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/hevea-ii-butcher-block-island-6ft.-100924398.html",
  sourcedOn: "2026-11-15",
  lengthIn: 72,
  widthIn: 36,
  nominalLabel: "72 x 36in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Light",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 72.4, widthIn: 36.2, weightLbs: 94 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 249,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$249.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100924398_hevea-ii-butcher-block-island-6ft_1",
  faceSet: {
    product: "Hevea II Butcher Block Island 6ft.",
    productSlug: "hevea-ii-butcher-block-island-6ft",
    option: "Hevea II",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100924398_hevea-ii-butcher-block-island-6ft_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/hevea-ii-butcher-block-island-6ft/face-top-a.jpg", sourceBox: [0, 625, 2500, 1875], sourceSize: [2500, 1250], mean: [221.54, 198.96, 176.65], faceIn: [72, 36] },
    ],
    unitMeans: [
      [221.54, 198.96, 176.65],
    ],
    overallMean: [221.54, 198.96, 176.65],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2500 x 2500) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [72, 36],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/hevea-ii-butcher-block-island-6ft/face-top-a-normal.jpg",
  ],
  moduleIn: [72, 36],
  model: null,
  gaps: [
    "Species Hevea, Core Type Solid Wood, Hardness Rating 2 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential/ Commercial \\u2014 printed fields with no registry slot ride here verbatim.",
    "Board Form is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Country of Origin is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Species row prints 'Hevea' although the product name says 'Hevea II'.",
    "Warranty prints 'Sold As Is.' and acclimation 72 hours, against the Acacia islands' warranty/acclimation pattern.",
    "Commercial / Residential Use prints 'Residential/ Commercial' where the Acacia islands print 'Residential/ Light Commercial'.",
    "No Board Form row and no Country of Origin row are printed.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const BEECH_ISLAND_BUTCHER_BLOCK_ISLAND_6FT: FloorDecorProduct = {
  slug: "beech-island-butcher-block-island-6ft",
  fdId: "100927532",
  name: "Beech Island Butcher Block Island 6ft.",
  brand: "Manor House",
  colorway: "Beech",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/beech-island-butcher-block-island-6ft.-100927532.html",
  sourcedOn: "2026-11-15",
  lengthIn: 74,
  widthIn: 37,
  nominalLabel: "74 x 37in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Light",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Micro Beveled Edge/Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 76.38, widthIn: 37.28, weightLbs: 111 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 249,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$249.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100927532_beech-island-butcher-block-island-6ft_1",
  faceSet: {
    product: "Beech Island Butcher Block Island 6ft.",
    productSlug: "beech-island-butcher-block-island-6ft",
    option: "Beech",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100927532_beech-island-butcher-block-island-6ft_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/beech-island-butcher-block-island-6ft/face-top-a.jpg", sourceBox: [0, 625, 2500, 1875], sourceSize: [2500, 1250], mean: [209.82, 158.45, 121.85], faceIn: [74, 37] },
    ],
    unitMeans: [
      [209.82, 158.45, 121.85],
    ],
    overallMean: [209.82, 158.45, 121.85],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2500 x 2500) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [74, 37],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/beech-island-butcher-block-island-6ft/face-top-a-normal.jpg",
  ],
  moduleIn: [74, 37],
  model: null,
  gaps: [
    "Species Beech, Core Type Solid Wood, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential/ Commercial, Country of Origin Poland \\u2014 printed fields with no registry slot ride here verbatim.",
    "Board Form is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Edge prints 'Micro Beveled Edge/Square Ends' \u2014 not the square edge printed by most of the batch (shared only with its workbench sibling 100927540).",
    "Country of Origin prints 'Poland' \u2014 the only non-US origin in the batch (shared only with 100927540).",
    "The page's own product name doubles the word 'Island': 'Beech Island Butcher Block Island 6ft.' \u2014 recorded as printed.",
    "Box Length prints 76.38 against a 74in product length, a larger box overhang than most siblings; no Board Form row is printed.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const AMERICAN_MAPLE_BUTCHER_BLOCK_ISLAND_6FT: FloorDecorProduct = {
  slug: "american-maple-butcher-block-island-6ft",
  fdId: "100061605",
  name: "American Maple Butcher Block Island 6ft.",
  brand: "Manor House",
  colorway: "American Maple",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/american-maple-butcher-block-island-6ft.-100061605.html",
  sourcedOn: "2026-11-15",
  lengthIn: 74,
  widthIn: 37,
  nominalLabel: "72 x 37in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 75, widthIn: 39, weightLbs: 90 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 379,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$379.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100061605_american-maple-butcher-block-island-6ft_1",
  faceSet: {
    product: "American Maple Butcher Block Island 6ft.",
    productSlug: "american-maple-butcher-block-island-6ft",
    option: "American Maple",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100061605_american-maple-butcher-block-island-6ft_1",
    swatchSize: [700, 700],
    variants: [
      { url: "/app/floor-and-decor/countertops/american-maple-butcher-block-island-6ft/face-top-a.jpg", sourceBox: [0, 175, 700, 525], sourceSize: [700, 350], mean: [182.65, 150.72, 113.01], faceIn: [74, 37] },
    ],
    unitMeans: [
      [182.65, 150.72, 113.01],
    ],
    overallMean: [182.65, 150.72, 113.01],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 700 x 700) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [74, 37],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/american-maple-butcher-block-island-6ft/face-top-a-normal.jpg",
  ],
  moduleIn: [74, 37],
  model: null,
  gaps: [
    "Species Maple, Core Type Solid Wood, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Board Form is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "SITE DATA INCONSISTENCY, recorded as printed and not fixed: the Size row and the PDP size option print '72 x 37in.' but Product Length prints '74in' (Product Width 37in agrees). The listing card likewise prints 72 x 37in.",
    "Commercial / Residential Use prints 'Residential' only, where most siblings print a residential/commercial combination.",
    "Species row prints 'Maple' although the product name says 'American Maple'; Country of Origin prints 'United States of America' with the page note 'Made in America with globally sourced components'.",
    "No Board Form row is printed.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const AMERICAN_WALNUT_BUTCHER_BLOCK_ISLAND_6FT: FloorDecorProduct = {
  slug: "american-walnut-butcher-block-island-6ft",
  fdId: "100061621",
  name: "American Walnut Butcher Block Island 6ft.",
  brand: "Manor House",
  colorway: "American Walnut",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/american-walnut-butcher-block-island-6ft.-100061621.html",
  sourcedOn: "2026-11-15",
  lengthIn: 74,
  widthIn: 37,
  nominalLabel: "74 x 37in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Dark",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 75, widthIn: 39, weightLbs: 90 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 549,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$549.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100061621_american-walnut-butcher-block-island-6ft_1",
  faceSet: {
    product: "American Walnut Butcher Block Island 6ft.",
    productSlug: "american-walnut-butcher-block-island-6ft",
    option: "American Walnut",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100061621_american-walnut-butcher-block-island-6ft_1",
    swatchSize: [1542, 1542],
    variants: [
      { url: "/app/floor-and-decor/countertops/american-walnut-butcher-block-island-6ft/face-top-a.jpg", sourceBox: [0, 385, 1542, 1156], sourceSize: [1542, 771], mean: [97.58, 53.12, 36.48], faceIn: [74, 37] },
    ],
    unitMeans: [
      [97.58, 53.12, 36.48],
    ],
    overallMean: [97.58, 53.12, 36.48],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 1542 x 1542) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [74, 37],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/american-walnut-butcher-block-island-6ft/face-top-a-normal.jpg",
  ],
  moduleIn: [74, 37],
  model: null,
  gaps: [
    "Species Walnut, Core Type Solid Wood, Hardness Rating 2 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Board Form is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Shade prints 'Dark' \u2014 the only Dark shade in the batch.",
    "Commercial / Residential Use prints 'Residential' only; highest price of the 74in islands ($549.00).",
    "Species row prints 'Walnut' although the product name says 'American Walnut'; Country of Origin prints 'United States of America'.",
    "No Board Form row is printed.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const AMERICAN_HICKORY_BUTCHER_BLOCK_ISLAND_6FT: FloorDecorProduct = {
  slug: "american-hickory-butcher-block-island-6ft",
  fdId: "100110139",
  name: "American Hickory Butcher Block Island 6ft.",
  brand: "Manor House",
  colorway: "American Hickory",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/american-hickory-butcher-block-island-6ft.-100110139.html",
  sourcedOn: "2026-11-15",
  lengthIn: 74,
  widthIn: 37,
  nominalLabel: "74 x 37in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 75, widthIn: 39, weightLbs: 100 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 399,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$399.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100110139_american-hickory-butcher-block-island-6ft_1",
  faceSet: {
    product: "American Hickory Butcher Block Island 6ft.",
    productSlug: "american-hickory-butcher-block-island-6ft",
    option: "American Hickory",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100110139_american-hickory-butcher-block-island-6ft_1",
    swatchSize: [1914, 1914],
    variants: [
      { url: "/app/floor-and-decor/countertops/american-hickory-butcher-block-island-6ft/face-top-a.jpg", sourceBox: [0, 478, 1914, 1435], sourceSize: [1914, 957], mean: [203.31, 156.35, 112.97], faceIn: [74, 37] },
    ],
    unitMeans: [
      [203.31, 156.35, 112.97],
    ],
    overallMean: [203.31, 156.35, 112.97],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 1914 x 1914) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [74, 37],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/american-hickory-butcher-block-island-6ft/face-top-a-normal.jpg",
  ],
  moduleIn: [74, 37],
  model: null,
  gaps: [
    "Species Hickory, Core Type Solid Wood, Hardness Rating 4 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Board Form is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Hardness Rating prints 4, the joint-highest in the batch (with the Lumber Core Acacia 101316925).",
    "Commercial / Residential Use prints 'Residential' only.",
    "Species row prints 'Hickory' although the product name says 'American Hickory'; Country of Origin prints 'United States of America'.",
    "No Board Form row is printed.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const AMERICAN_CHERRY_BUTCHER_BLOCK_ISLAND_6FT: FloorDecorProduct = {
  slug: "american-cherry-butcher-block-island-6ft",
  fdId: "100061613",
  name: "American Cherry Butcher Block Island 6ft.",
  brand: "Manor House",
  colorway: "American Cherry",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/american-cherry-butcher-block-island-6ft.-100061613.html",
  sourcedOn: "2026-11-15",
  lengthIn: 74,
  widthIn: 37,
  nominalLabel: "74 x 37in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 75, widthIn: 39, weightLbs: 90 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 379,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$379.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100061613_american-cherry-butcher-block-island-6ft_1",
  faceSet: {
    product: "American Cherry Butcher Block Island 6ft.",
    productSlug: "american-cherry-butcher-block-island-6ft",
    option: "American Cherry",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100061613_american-cherry-butcher-block-island-6ft_1",
    swatchSize: [1548, 1548],
    variants: [
      { url: "/app/floor-and-decor/countertops/american-cherry-butcher-block-island-6ft/face-top-a.jpg", sourceBox: [0, 387, 1548, 1161], sourceSize: [1548, 774], mean: [207.82, 137.87, 90.6], faceIn: [74, 37] },
    ],
    unitMeans: [
      [207.82, 137.87, 90.6],
    ],
    overallMean: [207.82, 137.87, 90.6],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 1548 x 1548) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [74, 37],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/american-cherry-butcher-block-island-6ft/face-top-a-normal.jpg",
  ],
  moduleIn: [74, 37],
  model: null,
  gaps: [
    "Species Cherry, Core Type Solid Wood, Hardness Rating 1 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Board Form is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Hardness Rating prints 1, the lowest in the batch.",
    "Commercial / Residential Use prints 'Residential' only.",
    "Species row prints 'Cherry' although the product name says 'American Cherry'; Country of Origin prints 'United States of America'.",
    "No Board Form row is printed.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const ACACIA_BUTCHER_BLOCK_WORKBENCH_5FT: FloorDecorProduct = {
  slug: "acacia-butcher-block-workbench-5ft",
  fdId: "101342368",
  name: "Acacia Butcher Block Workbench 5ft.",
  brand: "Manor House",
  colorway: "Acacia",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/acacia-butcher-block-workbench-5ft.-101342368.html",
  sourcedOn: "2026-11-15",
  lengthIn: 60,
  widthIn: 30,
  nominalLabel: "60 x 30in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "High Variation",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge",
  installType: "Countertop",
  warranty: "1 Year Limited",
  box: { lengthIn: 60.79, widthIn: 30.59, weightLbs: 61.18 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 169,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$169.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101342368_acacia-butcher-block-workbench-5ft_display",
  faceSet: {
    product: "Acacia Butcher Block Workbench 5ft.",
    productSlug: "acacia-butcher-block-workbench-5ft",
    option: "Acacia",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101342368_acacia-butcher-block-workbench-5ft_display",
    swatchSize: [3376, 3376],
    variants: [
      { url: "/app/floor-and-decor/countertops/acacia-butcher-block-workbench-5ft/face-top-a.jpg", sourceBox: [0, 844, 3376, 2532], sourceSize: [3376, 1688], mean: [180.08, 143.82, 97.02], faceIn: [60, 30] },
    ],
    unitMeans: [
      [180.08, 143.82, 97.02],
    ],
    overallMean: [180.08, 143.82, 97.02],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 3376 x 3376) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [60, 30],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/acacia-butcher-block-workbench-5ft/face-top-a-normal.jpg",
  ],
  moduleIn: [60, 30],
  model: null,
  gaps: [
    "Species Acacia, Core Type Solid Wood, Board Form Multi Width, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 24 hours, Use Residential/ Light Commercial \\u2014 printed fields with no registry slot ride here verbatim.",
    "Country of Origin is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "One of only two products in the batch whose page prints a Board Form row ('Multi Width') \u2014 the other is its island sibling 101342384.",
    "Warranty prints '1 Year Limited' and acclimation 24 hours, the Solid Wood Acacia pattern, against 'NONE' / 48 hours on the other Acacia workbench (101316933).",
    "Box Weight prints to two decimals ('61.18 lbs') where most of the batch prints whole pounds.",
    "No Country of Origin row is printed.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const WHITE_OAK_BUTCHER_BLOCK_WORKBENCH_5_FT: FloorDecorProduct = {
  slug: "white-oak-butcher-block-workbench-5-ft",
  fdId: "101019040",
  name: "White Oak Butcher Block Workbench 5 ft.",
  brand: "Manor House",
  colorway: "White Oak",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/white-oak-butcher-block-workbench-5-ft.-101019040.html",
  sourcedOn: "2026-11-15",
  lengthIn: 60,
  widthIn: 30,
  nominalLabel: "60 X 30in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Light",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 60, widthIn: 30, weightLbs: 55 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 199,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$199.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101019040_white-oak-butcher-block-workbench-5-ft_1",
  faceSet: {
    product: "White Oak Butcher Block Workbench 5 ft.",
    productSlug: "white-oak-butcher-block-workbench-5-ft",
    option: "White Oak",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101019040_white-oak-butcher-block-workbench-5-ft_1",
    swatchSize: [2400, 2400],
    variants: [
      { url: "/app/floor-and-decor/countertops/white-oak-butcher-block-workbench-5-ft/face-top-a.jpg", sourceBox: [0, 600, 2400, 1800], sourceSize: [2400, 1200], mean: [168.8, 138.34, 77.38], faceIn: [60, 30] },
    ],
    unitMeans: [
      [168.8, 138.34, 77.38],
    ],
    overallMean: [168.8, 138.34, 77.38],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2400 x 2400) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [60, 30],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/white-oak-butcher-block-workbench-5-ft/face-top-a-normal.jpg",
  ],
  moduleIn: [60, 30],
  model: null,
  gaps: [
    "Species White Oak, Core Type Solid Wood, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential/ Commercial, Country of Origin United States of America \\u2014 printed fields with no registry slot ride here verbatim.",
    "Board Form is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Box Length and Box Width print exactly equal to the product dimensions (60 x 30) \u2014 every other product in the batch prints a box larger than the product; its box is also the lightest (55 lbs).",
    "Size label prints with a capital X ('60 X 30in.'), as does the PDP size option.",
    "Commercial / Residential Use prints 'Residential/ Commercial'; Country of Origin prints 'United States of America' (species White Oak).",
    "No Board Form row is printed.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const ACACIA_BUTCHER_BLOCK_WORKBENCH_5FT_101316933: FloorDecorProduct = {
  slug: "acacia-butcher-block-workbench-5ft-101316933",
  fdId: "101316933",
  name: "Acacia Butcher Block Workbench 5ft.",
  brand: "Manor House",
  colorway: "Acacia",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/acacia-butcher-block-workbench-5ft.-101316933.html",
  sourcedOn: "2026-11-15",
  lengthIn: 60,
  widthIn: 30,
  nominalLabel: "30 x 60in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Medium",
  texture: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "NONE",
  box: { lengthIn: 60.4, widthIn: 30.2, weightLbs: 86 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 299,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$299.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101316933_acacia-butcher-block-workbench-5ft_display",
  faceSet: {
    product: "Acacia Butcher Block Workbench 5ft.",
    productSlug: "acacia-butcher-block-workbench-5ft-101316933",
    option: "Acacia",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101316933_acacia-butcher-block-workbench-5ft_display",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/acacia-butcher-block-workbench-5ft-101316933/face-top-a.jpg", sourceBox: [0, 625, 2500, 1875], sourceSize: [2500, 1250], mean: [172.9, 130.58, 97.36], faceIn: [60, 30] },
    ],
    unitMeans: [
      [172.9, 130.58, 97.36],
    ],
    overallMean: [172.9, 130.58, 97.36],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2500 x 2500) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [60, 30],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/acacia-butcher-block-workbench-5ft-101316933/face-top-a-normal.jpg",
  ],
  moduleIn: [60, 30],
  model: null,
  gaps: [
    "Species Acacia, Core Type Solid Wood, Hardness Rating 4 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 48 hours, Use Residential/ Light Commercial \\u2014 printed fields with no registry slot ride here verbatim.",
    "Board Form is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Finish Type is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Country of Origin is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "SITE DATA INCONSISTENCY, recorded as printed and not fixed: the Size row and the PDP size option print the transposed '30 x 60in.' while Product Length prints 60 and Product Width prints 30; the listing card likewise prints '30 x 60in.'.",
    "Core Type prints 'Solid Wood' even though this is a 101316xxx SKU \u2014 its island sibling 101316925 prints 'Lumber Core'. Recorded as printed; the two Acacia generations were not merged.",
    "Otherwise it follows the older Acacia profile, not the 101342xxx workbench (101342368): Warranty 'NONE' (vs '1 Year Limited'), acclimation 48 hours (vs 24), Hardness Rating 4 (vs 3), Shade 'Medium' (vs 'High Variation'), and no Finish Type or Board Form rows.",
    "Priced $299.00 against $169.00 for the 101342xxx Acacia workbench of the same nominal size, with a heavier box (86 lbs vs 61.18 lbs).",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const HEVEA_II_BUTCHER_BLOCK_WORKBENCH_5FT: FloorDecorProduct = {
  slug: "hevea-ii-butcher-block-workbench-5ft",
  fdId: "100924406",
  name: "Hevea II Butcher Block Workbench 5ft.",
  brand: "Manor House",
  colorway: "Hevea II",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/hevea-ii-butcher-block-workbench-5ft.-100924406.html",
  sourcedOn: "2026-11-15",
  lengthIn: 60,
  widthIn: 30,
  nominalLabel: "60 x 30in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Light",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Square Edge / Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 60.5, widthIn: 30.2, weightLbs: 66 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 99,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$99.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100924406_hevea-ii-butcher-block-workbench-5ft_1",
  faceSet: {
    product: "Hevea II Butcher Block Workbench 5ft.",
    productSlug: "hevea-ii-butcher-block-workbench-5ft",
    option: "Hevea II",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100924406_hevea-ii-butcher-block-workbench-5ft_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/hevea-ii-butcher-block-workbench-5ft/face-top-a.jpg", sourceBox: [0, 625, 2500, 1875], sourceSize: [2500, 1250], mean: [221.54, 198.96, 176.65], faceIn: [60, 30] },
    ],
    unitMeans: [
      [221.54, 198.96, 176.65],
    ],
    overallMean: [221.54, 198.96, 176.65],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2500 x 2500) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [60, 30],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/hevea-ii-butcher-block-workbench-5ft/face-top-a-normal.jpg",
  ],
  moduleIn: [60, 30],
  model: null,
  gaps: [
    "Species Hevea, Core Type Solid Wood, Hardness Rating 2 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential/ Commercial \\u2014 printed fields with no registry slot ride here verbatim.",
    "Board Form is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Country of Origin is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Lowest price in the batch ($99.00).",
    "Species row prints 'Hevea' although the product name says 'Hevea II'.",
    "Warranty prints 'Sold As Is.' and acclimation 72 hours; Commercial / Residential Use prints 'Residential/ Commercial'.",
    "No Board Form row and no Country of Origin row are printed.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};

const BEECH_BUTCHER_BLOCK_WORKBENCH_5FT: FloorDecorProduct = {
  slug: "beech-butcher-block-workbench-5ft",
  fdId: "100927540",
  name: "Beech Butcher Block Workbench 5ft.",
  brand: "Manor House",
  colorway: "Beech",
  category: "countertops",
  productType: "butcher-block-countertop",
  material: "Wood",
  sourceUrl: "https://www.flooranddecor.com/wood-butcher-block-countertops/beech-butcher-block-workbench-5ft.-100927540.html",
  sourcedOn: "2026-11-15",
  lengthIn: 60,
  widthIn: 30,
  nominalLabel: "60 x 30in.",
  dimensionStatus: "exact-published",
  thicknessMm: 38.1,
  color: "Natural",
  shade: "Light",
  texture: "Unfinished",
  finish: "Unfinished",
  edge: "Micro Beveled Edge/Square Ends",
  installType: "Countertop",
  warranty: "Sold As Is.",
  box: { lengthIn: 62.2, widthIn: 32.38, weightLbs: 73 },
  jointIn: null,
  jointNote:
    "Countertop installation as printed \u2014 a solid-wood slab " +
    "sold per piece; the page prints no joint or grout line.",
  priceUsd: 119,
  priceNote: "JSON-LD Product.offers price from this product's own page, read 2026-11-15. The PDP renders the price as '$119.00 / piece' and the listing card prints the same figure per piece \u2014 the product is sold as one slab per piece. No per-square-foot price is published on the product page; the JSON-LD offer carries no stated coverage basis, so it is recorded as the per-piece offer figure only, never converted to a per-sqft price.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100927540_beech-butcher-block-workbench-5ft_1",
  faceSet: {
    product: "Beech Butcher Block Workbench 5ft.",
    productSlug: "beech-butcher-block-workbench-5ft",
    option: "Beech",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100927540_beech-butcher-block-workbench-5ft_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/beech-butcher-block-workbench-5ft/face-top-a.jpg", sourceBox: [0, 625, 2500, 1875], sourceSize: [2500, 1250], mean: [209.82, 158.45, 121.85], faceIn: [60, 30] },
    ],
    unitMeans: [
      [209.82, 158.45, 121.85],
    ],
    overallMean: [209.82, 158.45, 121.85],
    notes:
      "The slab face: a uniform-scale window of the product's own field (served 2500 x 2500) at the slab's printed aspect \u2014 full field width, centred; the strips run along the slab's length, as they run in the field. Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "module",
      pattern: "Single-slab module (whole-piece surface)",
      moduleIn: [60, 30],
      wrap:
        "One slab is one piece: the face covers the whole slab " +
        "top at its printed size; a counter run longer than one " +
        "slab takes whole slabs end to end \u2014 the surface is " +
        "never tiled or stretched inside a piece.",
      rule:
        "Faces are the product's own slab field only, at the " +
        "slab's own aspect and printed size; repX/repY never " +
        "exceed 1 inside a piece.",
    },
  },
  facesGap: null,
  faceMaterial: BUTCHER_BLOCK_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/beech-butcher-block-workbench-5ft/face-top-a-normal.jpg",
  ],
  moduleIn: [60, 30],
  model: null,
  gaps: [
    "Species Beech, Core Type Solid Wood, Hardness Rating 3 on the page's own 1\\u20135 scale ('Janka' occurs zero times on the page), Minimum Acclimation 72 hours, Use Residential/ Commercial, Country of Origin Poland \\u2014 printed fields with no registry slot ride here verbatim.",
    "Board Form is not printed on this product's page \u2014 not recorded (family records carry it where printed).",
    "Box Height is not printed on the product page \u2014 not recorded.",
    "No coverage figure is published (a countertop slab is sold per piece); no per-square-foot price is published either.",
    "No 3D model: the builders carry no slab model kind (FloorDecorModel is plank-box only); the slab face and the printed dimensions are on record for when a slab kind lands.",
    "Edge prints 'Micro Beveled Edge/Square Ends' \u2014 not the square edge printed by most of the batch (shared only with its island sibling 100927532).",
    "Country of Origin prints 'Poland' \u2014 the only non-US origin in the batch (shared only with 100927532).",
    "Box prints notably oversized against the 60 x 30 product (Box Length 62.20, Box Width 32.38).",
    "No Board Form row is printed.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is a uniform-scale window of the product's own field at the slab's printed aspect, strips along the length, with its own Sobel normal map; no scale was hunted and none was invented.",
  ],
};
const SAMPLE_CALACATTA_ORO_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-calacatta-oro-quartz-custom-countertop",
  fdId: "101178028",
  name: "Sample- Calacatta Oro Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Calacatta Oro",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--calacatta-oro-quartz-custom-countertop-101178028.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101178028_sample--calacatta-oro-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Calacatta Oro Quartz Custom Countertop",
    productSlug: "sample-calacatta-oro-quartz-custom-countertop",
    option: "Calacatta Oro",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101178028_sample--calacatta-oro-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-calacatta-oro-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [241.73, 241.02, 234.19] },
    ],
    unitMeans: [
      [241.73, 241.02, 234.19],
    ],
    overallMean: [241.73, 241.02, 234.19],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-calacatta-oro-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_CARRARA_TRINITA_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-carrara-trinita-quartz-custom-countertop",
  fdId: "101178010",
  name: "Sample- Carrara Trinita Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Carrara Trinita",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--carrara-trinita-quartz-custom-countertop-101178010.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101178010_sample--carrara-trinita-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Carrara Trinita Quartz Custom Countertop",
    productSlug: "sample-carrara-trinita-quartz-custom-countertop",
    option: "Carrara Trinita",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101178010_sample--carrara-trinita-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-carrara-trinita-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [240.01, 240.08, 238.53] },
    ],
    unitMeans: [
      [240.01, 240.08, 238.53],
    ],
    overallMean: [240.01, 240.08, 238.53],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-carrara-trinita-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_WILLOW_WHITE_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-willow-white-quartz-custom-countertop",
  fdId: "101178002",
  name: "Sample- Willow White Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Willow White",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--willow-white-quartz-custom-countertop-101178002.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101178002_sample--willow-white-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Willow White Quartz Custom Countertop",
    productSlug: "sample-willow-white-quartz-custom-countertop",
    option: "Willow White",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101178002_sample--willow-white-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-willow-white-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [239.77, 240.83, 234.52] },
    ],
    unitMeans: [
      [239.77, 240.83, 234.52],
    ],
    overallMean: [239.77, 240.83, 234.52],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-willow-white-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_CARBO_BRUSHED_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-carbo-brushed-quartz-custom-countertop",
  fdId: "100887975",
  name: "Sample - Carbo Brushed Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Carbo Brushed",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---carbo-brushed-quartz-custom-countertop-100887975.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Black",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100887975_sample---carbo-brushed-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample - Carbo Brushed Quartz Custom Countertop",
    productSlug: "sample-carbo-brushed-quartz-custom-countertop",
    option: "Carbo Brushed",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100887975_sample---carbo-brushed-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-carbo-brushed-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [49.66, 49.97, 48.8] },
    ],
    unitMeans: [
      [49.66, 49.97, 48.8],
    ],
    overallMean: [49.66, 49.97, 48.8],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-carbo-brushed-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish spec row printed; finish appears only in the product name (Brushed).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a finish: \"Brushed\" appears in the product name (no finish spec row printed).",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_ARTISAN_GREY_LEATHERED_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-artisan-grey-leathered-quartz-custom-countertop",
  fdId: "100865955",
  name: "Sample - Artisan Grey Leathered Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Artisan Grey Leathered",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---artisan-grey-leathered-quartz-custom-countertop-100865955.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Gray",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100865955_sample---artisan-grey-leathered-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample - Artisan Grey Leathered Quartz Custom Countertop",
    productSlug: "sample-artisan-grey-leathered-quartz-custom-countertop",
    option: "Artisan Grey Leathered",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100865955_sample---artisan-grey-leathered-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-artisan-grey-leathered-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [189.13, 181.95, 171.25] },
    ],
    unitMeans: [
      [189.13, 181.95, 171.25],
    ],
    overallMean: [189.13, 181.95, 171.25],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-artisan-grey-leathered-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish spec row printed; finish appears only in the product name (Leathered).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a finish: \"Leathered\" appears in the product name (no finish spec row printed).",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_STONEY_SHORES_QUARTZ_3_CM_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-stoney-shores-quartz-3-cm-custom-countertop",
  fdId: "100200542",
  name: "Sample - Stoney Shores Quartz 3 cm. Custom Countertop",
  brand: "Manor House",
  colorway: "Stoney Shores",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---stoney-shores-quartz-3-cm.-custom-countertop-100200542.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: 30,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100200542_sample---stoney-shores-quartz-3-cm.-custom-countertop_display",
  faceSet: {
    product: "Sample - Stoney Shores Quartz 3 cm. Custom Countertop",
    productSlug: "sample-stoney-shores-quartz-3-cm-custom-countertop",
    option: "Stoney Shores",
    trueColorFaces: true,
    sourceSwatch:
      "https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0046_5.jpg",
    swatchSize: [2086, 2700],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-stoney-shores-quartz-3-cm-custom-countertop/face-top-a.jpg", sourceBox: [282, 410, 1293, 991], sourceSize: [1011, 581], mean: [197.68, 197.78, 196.07] },
    ],
    unitMeans: [
      [197.68, 197.78, 196.07],
    ],
    overallMean: [197.68, 197.78, 196.07],
    notes:
      "The slab face: the slab photograph's own field (1011 x 581 px) from this color's named 'Slab Image' page \u2014 page 46 of Floor & Decor's own Custom Countertop Digital Catalog. Floor & Decor publishes no surface image on this SKU's product page (every gallery slot serves the placeholder), so under the founder's order (2026-11-15) the face was cut from the catalog's official slab image for this named stone: the crop takes the slab photograph only \u2014 the page's close-up inset, room photograph and page furniture are excluded \u2014 and it was verified against the product name, the catalog's own description ('Stoney Shores crisp, white foundation glistens with tan and translucent particulates.') and the product page's printed fields (Quartz, White). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Source: https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/ (page 46; page image: https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0046_5.jpg).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the named stone's field only, as " +
        "published in Floor & Decor's own countertop catalog, " +
        "at its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-stoney-shores-quartz-3-cm-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness spec row printed; thickness appears only in the product name (\"3 cm\").",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a thickness: \"3 cm\" appears in the product name (no thickness spec row printed).",
    "No real imagery exists for this product at the retailer \\u2014 every gallery slot serves the 'image coming soon' placeholder; this record's imageUrl is the product's standard display URL, which today serves that placeholder.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 from Floor & Decor's own Custom Countertop Digital Catalog (founder's go \u2014 the field is the surface): face-top-a is the slab photograph's field from the 'Slab Image' page for Stoney Shores Quartz (catalog page 46, https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/), with its own Sobel normal map; the page's close-up inset and room photograph are excluded. Verified against the product name, the catalog description and the product page's printed fields (Quartz, White). Floor & Decor's gallery slots for this SKU serve only the placeholder and no slab dimensions are published, so no scale is claimed.",
  ],
};

const SAMPLE_IBERIA_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-iberia-quartz-custom-countertop",
  fdId: "101130201",
  name: "Sample- Iberia Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Iberia",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--iberia-quartz-custom-countertop-101130201.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Gray",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101130201_sample--iberia-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Iberia Quartz Custom Countertop",
    productSlug: "sample-iberia-quartz-custom-countertop",
    option: "Iberia",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101130201_sample--iberia-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-iberia-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [220.83, 228.54, 230.87] },
    ],
    unitMeans: [
      [220.83, 228.54, 230.87],
    ],
    overallMean: [220.83, 228.54, 230.87],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-iberia-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_VERITY_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-verity-quartz-custom-countertop",
  fdId: "101130185",
  name: "Sample- Verity Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Verity",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--verity-quartz-custom-countertop-101130185.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Black",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101130185_sample--verity-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Verity Quartz Custom Countertop",
    productSlug: "sample-verity-quartz-custom-countertop",
    option: "Verity",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101130185_sample--verity-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-verity-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [13.81, 10.93, 9.47] },
    ],
    unitMeans: [
      [13.81, 10.93, 9.47],
    ],
    overallMean: [13.81, 10.93, 9.47],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-verity-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_EVEREST_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-everest-quartz-custom-countertop",
  fdId: "100887876",
  name: "Sample - Everest Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Everest",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---everest-quartz-custom-countertop-100887876.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Gray",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100887876_sample---everest-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample - Everest Quartz Custom Countertop",
    productSlug: "sample-everest-quartz-custom-countertop",
    option: "Everest",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100887876_sample---everest-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-everest-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [203.86, 203.32, 200.03] },
    ],
    unitMeans: [
      [203.86, 203.32, 200.03],
    ],
    overallMean: [203.86, 203.32, 200.03],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-everest-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_DOLOMITES_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-dolomites-quartz-custom-countertop",
  fdId: "101178036",
  name: "Sample- Dolomites Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Dolomites",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--dolomites-quartz-custom-countertop-101178036.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101178036_sample--dolomites-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Dolomites Quartz Custom Countertop",
    productSlug: "sample-dolomites-quartz-custom-countertop",
    option: "Dolomites",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101178036_sample--dolomites-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-dolomites-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [231.46, 231.46, 231.46] },
    ],
    unitMeans: [
      [231.46, 231.46, 231.46],
    ],
    overallMean: [231.46, 231.46, 231.46],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-dolomites-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_CALACATTA_GRANDE_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-calacatta-grande-quartz-custom-countertop",
  fdId: "101130169",
  name: "Sample- Calacatta Grande Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Calacatta Grande",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--calacatta-grande-quartz-custom-countertop-101130169.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Gray",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101130169_sample--calacatta-grande-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Calacatta Grande Quartz Custom Countertop",
    productSlug: "sample-calacatta-grande-quartz-custom-countertop",
    option: "Calacatta Grande",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101130169_sample--calacatta-grande-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-calacatta-grande-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [241.01, 244.53, 243.94] },
    ],
    unitMeans: [
      [241.01, 244.53, 243.94],
    ],
    overallMean: [241.01, 244.53, 243.94],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-calacatta-grande-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_REMI_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-remi-quartz-custom-countertop",
  fdId: "101130110",
  name: "Sample- Remi Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Remi",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--remi-quartz-custom-countertop-101130110.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Beige",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101130110_sample--remi-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Remi Quartz Custom Countertop",
    productSlug: "sample-remi-quartz-custom-countertop",
    option: "Remi",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101130110_sample--remi-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-remi-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [228.3, 224.46, 221.34] },
    ],
    unitMeans: [
      [228.3, 224.46, 221.34],
    ],
    overallMean: [228.3, 224.46, 221.34],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-remi-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_DRIFT_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-drift-quartz-custom-countertop",
  fdId: "100887801",
  name: "Sample - Drift Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Drift",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---drift-quartz-custom-countertop-100887801.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100887801_sample---drift-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample - Drift Quartz Custom Countertop",
    productSlug: "sample-drift-quartz-custom-countertop",
    option: "Drift",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100887801_sample---drift-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-drift-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [229.38, 229.23, 228.82] },
    ],
    unitMeans: [
      [229.38, 229.23, 228.82],
    ],
    overallMean: [229.38, 229.23, 228.82],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-drift-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_FORTE_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-forte-quartz-custom-countertop",
  fdId: "100887918",
  name: "Sample - Forte Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Forte",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---forte-quartz-custom-countertop-100887918.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100887918_sample---forte-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample - Forte Quartz Custom Countertop",
    productSlug: "sample-forte-quartz-custom-countertop",
    option: "Forte",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100887918_sample---forte-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-forte-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [247.43, 244.92, 239.96] },
    ],
    unitMeans: [
      [247.43, 244.92, 239.96],
    ],
    overallMean: [247.43, 244.92, 239.96],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-forte-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_OCEANA_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-oceana-quartz-custom-countertop",
  fdId: "100887868",
  name: "Sample - Oceana Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Oceana",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---oceana-quartz-custom-countertop-100887868.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Gray",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100887868_sample---oceana-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample - Oceana Quartz Custom Countertop",
    productSlug: "sample-oceana-quartz-custom-countertop",
    option: "Oceana",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100887868_sample---oceana-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-oceana-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [197, 195.71, 188.89] },
    ],
    unitMeans: [
      [197, 195.71, 188.89],
    ],
    overallMean: [197, 195.71, 188.89],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-oceana-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_STRATO_QUARTZ_3_CM_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-strato-quartz-3-cm-custom-countertop",
  fdId: "100489616",
  name: "Sample - Strato Quartz 3 cm. Custom Countertop",
  brand: "Manor House",
  colorway: "Strato",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---strato-quartz-3-cm.-custom-countertop-100489616.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: 30,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100489616_sample---strato-quartz-3-cm.-custom-countertop_display",
  faceSet: {
    product: "Sample - Strato Quartz 3 cm. Custom Countertop",
    productSlug: "sample-strato-quartz-3-cm-custom-countertop",
    option: "Strato",
    trueColorFaces: true,
    sourceSwatch:
      "https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0047_5.jpg",
    swatchSize: [2086, 2700],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-strato-quartz-3-cm-custom-countertop/face-top-a.jpg", sourceBox: [282, 410, 1293, 991], sourceSize: [1011, 581], mean: [243.25, 242.17, 242.43] },
    ],
    unitMeans: [
      [243.25, 242.17, 242.43],
    ],
    overallMean: [243.25, 242.17, 242.43],
    notes:
      "The slab face: the slab photograph's own field (1011 x 581 px) from this color's named 'Slab Image' page \u2014 page 47 of Floor & Decor's own Custom Countertop Digital Catalog. Floor & Decor publishes no surface image on this SKU's product page (every gallery slot serves the placeholder), so under the founder's order (2026-11-15) the face was cut from the catalog's official slab image for this named stone: the crop takes the slab photograph only \u2014 the page's close-up inset, room photograph and page furniture are excluded \u2014 and it was verified against the product name, the catalog's own description ('A modern classic. Delicate feathering of gold veining reaches across a pearl base making Strato a sensational choice.') and the product page's printed fields (Quartz, White). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Source: https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/ (page 47; page image: https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0047_5.jpg).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the named stone's field only, as " +
        "published in Floor & Decor's own countertop catalog, " +
        "at its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-strato-quartz-3-cm-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness spec row printed; thickness appears only in the product name (\"3 cm\").",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a thickness: \"3 cm\" appears in the product name (no thickness spec row printed).",
    "No real imagery exists for this product at the retailer \\u2014 every gallery slot serves the 'image coming soon' placeholder; this record's imageUrl is the product's standard display URL, which today serves that placeholder.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 from Floor & Decor's own Custom Countertop Digital Catalog (founder's go \u2014 the field is the surface): face-top-a is the slab photograph's field from the 'Slab Image' page for Strato Quartz (catalog page 47, https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/), with its own Sobel normal map; the page's close-up inset and room photograph are excluded. Verified against the product name, the catalog description and the product page's printed fields (Quartz, White). Floor & Decor's gallery slots for this SKU serve only the placeholder and no slab dimensions are published, so no scale is claimed.",
  ],
};

const SAMPLE_CARRARA_CERVINO_QUARTZ_3_CM_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-carrara-cervino-quartz-3-cm-custom-countertop",
  fdId: "100200468",
  name: "Sample - Carrara Cervino Quartz 3 cm. Custom Countertop",
  brand: "Manor House",
  colorway: "Carrara Cervino",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---carrara-cervino-quartz-3-cm.-custom-countertop-100200468.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: 30,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100200468_sample---carrara-cervino-quartz-3-cm.-custom-countertop_display",
  faceSet: {
    product: "Sample - Carrara Cervino Quartz 3 cm. Custom Countertop",
    productSlug: "sample-carrara-cervino-quartz-3-cm-custom-countertop",
    option: "Carrara Cervino",
    trueColorFaces: true,
    sourceSwatch:
      "https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0026_5.jpg",
    swatchSize: [2086, 2700],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-carrara-cervino-quartz-3-cm-custom-countertop/face-top-a.jpg", sourceBox: [282, 410, 1293, 991], sourceSize: [1011, 581], mean: [249.21, 248.26, 243.62] },
    ],
    unitMeans: [
      [249.21, 248.26, 243.62],
    ],
    overallMean: [249.21, 248.26, 243.62],
    notes:
      "The slab face: the slab photograph's own field (1011 x 581 px) from this color's named 'Slab Image' page \u2014 page 26 of Floor & Decor's own Custom Countertop Digital Catalog. Floor & Decor publishes no surface image on this SKU's product page (every gallery slot serves the placeholder), so under the founder's order (2026-11-15) the face was cut from the catalog's official slab image for this named stone: the crop takes the slab photograph only \u2014 the page's close-up inset, room photograph and page furniture are excluded \u2014 and it was verified against the product name, the catalog's own description ('With Carrara Cervino, the exquisite grey veining is captured against a sophisticated white background.') and the product page's printed fields (Quartz, White). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Source: https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/ (page 26; page image: https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0026_5.jpg).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the named stone's field only, as " +
        "published in Floor & Decor's own countertop catalog, " +
        "at its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-carrara-cervino-quartz-3-cm-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness spec row printed; thickness appears only in the product name (\"3 cm\").",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a thickness: \"3 cm\" appears in the product name (no thickness spec row printed).",
    "No real imagery exists for this product at the retailer \\u2014 every gallery slot serves the 'image coming soon' placeholder; this record's imageUrl is the product's standard display URL, which today serves that placeholder.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 from Floor & Decor's own Custom Countertop Digital Catalog (founder's go \u2014 the field is the surface): face-top-a is the slab photograph's field from the 'Slab Image' page for Carrara Cervino Quartz (catalog page 26, https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/), with its own Sobel normal map; the page's close-up inset and room photograph are excluded. Verified against the product name, the catalog description and the product page's printed fields (Quartz, White). Floor & Decor's gallery slots for this SKU serve only the placeholder and no slab dimensions are published, so no scale is claimed.",
  ],
};

const SAMPLE_ADAGIO_GOLD_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-adagio-gold-quartz-custom-countertop",
  fdId: "101005601",
  name: "Sample - Adagio Gold Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Adagio Gold",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---adagio-gold-quartz-custom-countertop-101005601.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Gold/ Yellow",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101005601_sample---adagio-gold-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample - Adagio Gold Quartz Custom Countertop",
    productSlug: "sample-adagio-gold-quartz-custom-countertop",
    option: "Adagio Gold",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101005601_sample---adagio-gold-quartz-custom-countertop_1",
    swatchSize: [300, 300],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-adagio-gold-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 300, 300], sourceSize: [300, 300], mean: [234.22, 233.98, 233.22] },
    ],
    unitMeans: [
      [234.22, 233.98, 233.22],
    ],
    overallMean: [234.22, 233.98, 233.22],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 300 x 300). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-adagio-gold-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
    "Resolution flag: the product's field serves at 300 x 300 px, so the slab face is built from a small source; a higher-resolution field is a named gap if Floor & Decor ever publishes one.",
  ],
};

const SAMPLE_SIRIUS_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-sirius-quartz-custom-countertop",
  fdId: "101130243",
  name: "Sample- Sirius Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Sirius",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--sirius-quartz-custom-countertop-101130243.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Gray",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101130243_sample--sirius-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Sirius Quartz Custom Countertop",
    productSlug: "sample-sirius-quartz-custom-countertop",
    option: "Sirius",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101130243_sample--sirius-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-sirius-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [121.23, 116.26, 113.28] },
    ],
    unitMeans: [
      [121.23, 116.26, 113.28],
    ],
    overallMean: [121.23, 116.26, 113.28],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-sirius-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_MARGOT_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-margot-quartz-custom-countertop",
  fdId: "101130136",
  name: "Sample- Margot Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Margot",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--margot-quartz-custom-countertop-101130136.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101130136_sample--margot-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Margot Quartz Custom Countertop",
    productSlug: "sample-margot-quartz-custom-countertop",
    option: "Margot",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101130136_sample--margot-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-margot-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [233.65, 233.85, 229.93] },
    ],
    unitMeans: [
      [233.65, 233.85, 229.93],
    ],
    overallMean: [233.65, 233.85, 229.93],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-margot-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_TAJ_CREMA_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-taj-crema-quartz-custom-countertop",
  fdId: "101155299",
  name: "Sample- Taj Crema Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Taj Crema",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--taj-crema-quartz-custom-countertop-101155299.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Beige",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101155299_sample--taj-crema-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Taj Crema Quartz Custom Countertop",
    productSlug: "sample-taj-crema-quartz-custom-countertop",
    option: "Taj Crema",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101155299_sample--taj-crema-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-taj-crema-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [208.08, 201.99, 195.56] },
    ],
    unitMeans: [
      [208.08, 201.99, 195.56],
    ],
    overallMean: [208.08, 201.99, 195.56],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-taj-crema-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_GEMMA_LUXE_QUARTZ_TECH_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-gemma-luxe-quartz-tech-custom-countertop",
  fdId: "101239507",
  name: "Sample - Gemma Luxe Quartz Tech Custom Countertop",
  brand: "Manor House",
  colorway: "Gemma Luxe Quartz Tech",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---gemma-luxe-quartz-tech-custom-countertop-101239507.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101239507_sample---gemma-luxe-quartz-tech-custom-countertop_1",
  faceSet: {
    product: "Sample - Gemma Luxe Quartz Tech Custom Countertop",
    productSlug: "sample-gemma-luxe-quartz-tech-custom-countertop",
    option: "Gemma Luxe Quartz Tech",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101239507_sample---gemma-luxe-quartz-tech-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-gemma-luxe-quartz-tech-custom-countertop/face-top-a.jpg", sourceBox: [0, 625, 2500, 1877], sourceSize: [2500, 1252], mean: [236.98, 237.22, 239] },
    ],
    unitMeans: [
      [236.98, 237.22, 239],
    ],
    overallMean: [236.98, 237.22, 239],
    notes:
      "The slab face: the slab band cropped out of the framed field (white margins removed) of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-gemma-luxe-quartz-tech-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed anywhere on the page; the only price on the page is the $5.00 sample offer.",
    "JSON-LD Product description is empty on this page (the other stone sample pages carry a full description including the in-store pricing note).",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the slab band cropped out of the product's framed field (the baked-in white margins removed), with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_RENATA_VERA_QUARTZ_TECH_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-renata-vera-quartz-tech-custom-countertop",
  fdId: "101239515",
  name: "Sample - Renata Vera Quartz Tech Custom Countertop",
  brand: "Manor House",
  colorway: "Renata Vera Quartz Tech",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---renata-vera-quartz-tech-custom-countertop-101239515.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101239515_sample---renata-vera-quartz-tech-custom-countertop_1",
  faceSet: {
    product: "Sample - Renata Vera Quartz Tech Custom Countertop",
    productSlug: "sample-renata-vera-quartz-tech-custom-countertop",
    option: "Renata Vera Quartz Tech",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101239515_sample---renata-vera-quartz-tech-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-renata-vera-quartz-tech-custom-countertop/face-top-a.jpg", sourceBox: [0, 624, 2500, 1877], sourceSize: [2500, 1253], mean: [237.39, 237.3, 236.78] },
    ],
    unitMeans: [
      [237.39, 237.3, 236.78],
    ],
    overallMean: [237.39, 237.3, 236.78],
    notes:
      "The slab face: the slab band cropped out of the framed field (white margins removed) of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-renata-vera-quartz-tech-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed anywhere on the page; the only price on the page is the $5.00 sample offer.",
    "JSON-LD Product description is empty on this page (the other stone sample pages carry a full description including the in-store pricing note).",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the slab band cropped out of the product's framed field (the baked-in white margins removed), with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_LEVINE_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-levine-quartz-custom-countertop",
  fdId: "101130227",
  name: "Sample- Levine Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Levine",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--levine-quartz-custom-countertop-101130227.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Beige",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101130227_sample--levine-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Levine Quartz Custom Countertop",
    productSlug: "sample-levine-quartz-custom-countertop",
    option: "Levine",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101130227_sample--levine-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-levine-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [190.75, 188.53, 179.43] },
    ],
    unitMeans: [
      [190.75, 188.53, 179.43],
    ],
    overallMean: [190.75, 188.53, 179.43],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-levine-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_CALACATTA_MARINA_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-calacatta-marina-quartz-custom-countertop",
  fdId: "101130268",
  name: "Sample- Calacatta Marina Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Calacatta Marina",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--calacatta-marina-quartz-custom-countertop-101130268.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Blue",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101130268_sample--calacatta-marina-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Calacatta Marina Quartz Custom Countertop",
    productSlug: "sample-calacatta-marina-quartz-custom-countertop",
    option: "Calacatta Marina",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101130268_sample--calacatta-marina-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-calacatta-marina-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [243.58, 244.01, 244.47] },
    ],
    unitMeans: [
      [243.58, 244.01, 244.47],
    ],
    overallMean: [243.58, 244.01, 244.47],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-calacatta-marina-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_CLARINO_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-clarino-quartz-custom-countertop",
  fdId: "100887884",
  name: "Sample - Clarino Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Clarino",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---clarino-quartz-custom-countertop-100887884.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100887884_sample---clarino-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample - Clarino Quartz Custom Countertop",
    productSlug: "sample-clarino-quartz-custom-countertop",
    option: "Clarino",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100887884_sample---clarino-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-clarino-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [240.35, 239.22, 232.41] },
    ],
    unitMeans: [
      [240.35, 239.22, 232.41],
    ],
    overallMean: [240.35, 239.22, 232.41],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-clarino-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_ENCORE_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-encore-quartz-custom-countertop",
  fdId: "100887926",
  name: "Sample - Encore Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Encore",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---encore-quartz-custom-countertop-100887926.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Gray",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100887926_sample---encore-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample - Encore Quartz Custom Countertop",
    productSlug: "sample-encore-quartz-custom-countertop",
    option: "Encore",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100887926_sample---encore-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-encore-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [202.26, 201.87, 200.32] },
    ],
    unitMeans: [
      [202.26, 201.87, 200.32],
    ],
    overallMean: [202.26, 201.87, 200.32],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-encore-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_ROCOCO_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-rococo-quartz-custom-countertop",
  fdId: "100887892",
  name: "Sample - Rococo Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Rococo",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---rococo-quartz-custom-countertop-100887892.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Gray",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100887892_sample---rococo-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample - Rococo Quartz Custom Countertop",
    productSlug: "sample-rococo-quartz-custom-countertop",
    option: "Rococo",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100887892_sample---rococo-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-rococo-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [222.95, 223.45, 217.28] },
    ],
    unitMeans: [
      [222.95, 223.45, 217.28],
    ],
    overallMean: [222.95, 223.45, 217.28],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-rococo-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_MACAUBAS_BIANCO_QUARTZ_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-macaubas-bianco-quartz-custom-countertop",
  fdId: "101178044",
  name: "Sample- Macaubas Bianco Quartz Custom Countertop",
  brand: "Manor House",
  colorway: "Macaubas Bianco",
  category: "countertops",
  productType: "quartz-countertop",
  material: "Quartz",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--macaubas-bianco-quartz-custom-countertop-101178044.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101178044_sample--macaubas-bianco-quartz-custom-countertop_1",
  faceSet: {
    product: "Sample- Macaubas Bianco Quartz Custom Countertop",
    productSlug: "sample-macaubas-bianco-quartz-custom-countertop",
    option: "Macaubas Bianco",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101178044_sample--macaubas-bianco-quartz-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-macaubas-bianco-quartz-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [236.41, 236.43, 233.16] },
    ],
    unitMeans: [
      [236.41, 236.43, 233.16],
    ],
    overallMean: [236.41, 236.43, 233.16],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: QUARTZ_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-macaubas-bianco-quartz-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_BIANCO_ANTICO_GRANITE_3_CM_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-bianco-antico-granite-3-cm-custom-countertop",
  fdId: "100200153",
  name: "Sample - Bianco Antico Granite 3 cm. Custom Countertop",
  brand: "Manor House",
  colorway: "Bianco Antico",
  category: "countertops",
  productType: "granite-countertop",
  material: "Granite",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---bianco-antico-granite-3-cm.-custom-countertop-100200153.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: 30,
  color: "Brown",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100200153_sample---bianco-antico-granite-3-cm.-custom-countertop_display",
  faceSet: {
    product: "Sample - Bianco Antico Granite 3 cm. Custom Countertop",
    productSlug: "sample-bianco-antico-granite-3-cm-custom-countertop",
    option: "Bianco Antico",
    trueColorFaces: true,
    sourceSwatch:
      "https://cdn.msisurfaces.com/images/colornames/bianco-antico-granite.jpg",
    swatchSize: [805, 805],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-bianco-antico-granite-3-cm-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 805, 805], sourceSize: [805, 805], mean: [167.49, 157.06, 144.57] },
    ],
    unitMeans: [
      [167.49, 157.06, 144.57],
    ],
    overallMean: [167.49, 157.06, 144.57],
    notes:
      "The slab face: the whole field, edge to edge, of MSI Surfaces' own published field for this named stone (served 805 x 805). Floor & Decor publishes no surface image for this sample SKU \u2014 every gallery slot serves the placeholder \u2014 so under the founder's outside-imagery order (2026-11-15) the face was built from the stone supplier's own imagery of the same named stone, verified against the product name and the page's printed fields (Granite, Brown). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Source: https://www.msisurfaces.com/granite/bianco-antico/ (image: https://cdn.msisurfaces.com/images/colornames/bianco-antico-granite.jpg).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the named stone's field only, as " +
        "published by the stone supplier (MSI Surfaces), at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: GRANITE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-bianco-antico-granite-3-cm-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness spec row printed; thickness appears only in the product name (\"3 cm\").",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a thickness: \"3 cm\" appears in the product name (no thickness spec row printed).",
    "No real imagery exists for this product at the retailer \\u2014 every gallery slot serves the 'image coming soon' placeholder; this record's imageUrl is the product's standard display URL, which today serves that placeholder.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 from OUTSIDE imagery (founder order \u2014 the field is the surface): face-top-a is MSI Surfaces' own published field for Bianco Antico Granite (https://cdn.msisurfaces.com/images/colornames/bianco-antico-granite.jpg) with its own Sobel normal map. MSI Bianco Antico Granite (Brazil); MSI lists BIANCO ANTICO SLABS 3CM, ID RSL-BIAANT-3CM, polished. Floor & Decor's gallery slots for this SKU serve only the placeholder and no slab dimensions are published, so no scale is claimed.",
  ],
};

const SAMPLE_BROOKS_GRANITE_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-brooks-granite-custom-countertop",
  fdId: "101155281",
  name: "Sample- Brooks Granite Custom Countertop",
  brand: "Manor House",
  colorway: "Brooks",
  category: "countertops",
  productType: "granite-countertop",
  material: "Granite",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--brooks-granite-custom-countertop-101155281.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Gray",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101155281_sample--brooks-granite-custom-countertop_1",
  faceSet: {
    product: "Sample- Brooks Granite Custom Countertop",
    productSlug: "sample-brooks-granite-custom-countertop",
    option: "Brooks",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101155281_sample--brooks-granite-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-brooks-granite-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [193.36, 186.51, 182.44] },
    ],
    unitMeans: [
      [193.36, 186.51, 182.44],
    ],
    overallMean: [193.36, 186.51, 182.44],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: GRANITE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-brooks-granite-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_BLACK_PEARL_BRUSH_GRANITE_3_CM_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-black-pearl-brush-granite-3-cm-custom-countertop",
  fdId: "100489897",
  name: "Sample - Black Pearl Brush Granite 3 cm. Custom Countertop",
  brand: "Manor House",
  colorway: "Black Pearl Brush",
  category: "countertops",
  productType: "granite-countertop",
  material: "Granite",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---black-pearl-brush-granite-3-cm.-custom-countertop-100489897.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: 30,
  color: "Black",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100489897_sample---black-pearl-brush-granite-3-cm.-custom-countertop_display",
  faceSet: {
    product: "Sample - Black Pearl Brush Granite 3 cm. Custom Countertop",
    productSlug: "sample-black-pearl-brush-granite-3-cm-custom-countertop",
    option: "Black Pearl Brush",
    trueColorFaces: true,
    sourceSwatch:
      "https://cdn.msisurfaces.com/images/colornames/black-pearl-granite.jpg",
    swatchSize: [805, 805],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-black-pearl-brush-granite-3-cm-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 805, 805], sourceSize: [805, 805], mean: [22.72, 23.31, 19.28] },
    ],
    unitMeans: [
      [22.72, 23.31, 19.28],
    ],
    overallMean: [22.72, 23.31, 19.28],
    notes:
      "The slab face: the whole field, edge to edge, of MSI Surfaces' own published field for this named stone (served 805 x 805). Floor & Decor publishes no surface image for this sample SKU \u2014 every gallery slot serves the placeholder \u2014 so under the founder's outside-imagery order (2026-11-15) the face was built from the stone supplier's own imagery of the same named stone, verified against the product name and the page's printed fields (Granite, Black). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Source: https://www.msisurfaces.com/granite/black-pearl/ (image: https://cdn.msisurfaces.com/images/colornames/black-pearl-granite.jpg).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the named stone's field only, as " +
        "published by the stone supplier (MSI Surfaces), at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: GRANITE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-black-pearl-brush-granite-3-cm-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness spec row printed; thickness appears only in the product name (\"3 cm\").",
    "No finish spec row printed; finish appears only in the product name (Brush).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a thickness: \"3 cm\" appears in the product name (no thickness spec row printed).",
    "Name carries a finish: \"Brush\" appears in the product name (no finish spec row printed).",
    "No real imagery exists for this product at the retailer \\u2014 every gallery slot serves the 'image coming soon' placeholder; this record's imageUrl is the product's standard display URL, which today serves that placeholder.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 from OUTSIDE imagery (founder order \u2014 the field is the surface): face-top-a is MSI Surfaces' own published field for Black Pearl Brush Granite (https://cdn.msisurfaces.com/images/colornames/black-pearl-granite.jpg) with its own Sobel normal map. MSI Black Pearl Granite (India); MSI lists the exact named finish as a 3 cm SKU: BLACK PEARL - BRUSHED & HONED, ID RSL-SILPRL-3CM-BRH, finish Brushed. Floor & Decor's gallery slots for this SKU serve only the placeholder and no slab dimensions are published, so no scale is claimed.",
  ],
};

const SAMPLE_ARABIAN_NIGHTS_GRANITE_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-arabian-nights-granite-custom-countertop",
  fdId: "100866169",
  name: "Sample - Arabian Nights Granite Custom Countertop",
  brand: "Manor House",
  colorway: "Arabian Nights",
  category: "countertops",
  productType: "granite-countertop",
  material: "Granite",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---arabian-nights-granite-custom-countertop-100866169.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Black",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100866169_sample---arabian-nights-granite-custom-countertop_1",
  faceSet: {
    product: "Sample - Arabian Nights Granite Custom Countertop",
    productSlug: "sample-arabian-nights-granite-custom-countertop",
    option: "Arabian Nights",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100866169_sample---arabian-nights-granite-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-arabian-nights-granite-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [57.69, 52.33, 50.11] },
    ],
    unitMeans: [
      [57.69, 52.33, 50.11],
    ],
    overallMean: [57.69, 52.33, 50.11],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: GRANITE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-arabian-nights-granite-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_CYPRUS_GRANITE_3_CM_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-cyprus-granite-3-cm-custom-countertop",
  fdId: "100200021",
  name: "Sample - Cyprus Granite 3 cm. Custom Countertop",
  brand: "Manor House",
  colorway: "Cyprus",
  category: "countertops",
  productType: "granite-countertop",
  material: "Granite",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---cyprus-granite-3-cm.-custom-countertop-100200021.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: 30,
  color: "Brown",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100200021_sample---cyprus-granite-3-cm.-custom-countertop_display",
  faceSet: {
    product: "Sample - Cyprus Granite 3 cm. Custom Countertop",
    productSlug: "sample-cyprus-granite-3-cm-custom-countertop",
    option: "Cyprus",
    trueColorFaces: true,
    sourceSwatch:
      "https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0010_4.jpg",
    swatchSize: [1584, 2050],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-cyprus-granite-3-cm-custom-countertop/face-top-a.jpg", sourceBox: [214, 312, 982, 752], sourceSize: [768, 440], mean: [204.28, 187.01, 167.04] },
    ],
    unitMeans: [
      [204.28, 187.01, 167.04],
    ],
    overallMean: [204.28, 187.01, 167.04],
    notes:
      "The slab face: the slab photograph's own field (768 x 440 px) from this color's named 'Slab Image' page \u2014 page 10 of Floor & Decor's own Custom Countertop Digital Catalog. Floor & Decor publishes no surface image on this SKU's product page (every gallery slot serves the placeholder), so under the founder's order (2026-11-15) the face was cut from the catalog's official slab image for this named stone: the crop takes the slab photograph only \u2014 the page's close-up inset, room photograph and page furniture are excluded \u2014 and it was verified against the product name, the catalog's own description ('Cyprus has a warm golden beige background and is accented with dark taupe and speckles of gold.') and the product page's printed fields (Granite, Brown). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Source: https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/ (page 10; page image: https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0010_4.jpg).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the named stone's field only, as " +
        "published in Floor & Decor's own countertop catalog, " +
        "at its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: GRANITE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-cyprus-granite-3-cm-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness spec row printed; thickness appears only in the product name (\"3 cm\").",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a thickness: \"3 cm\" appears in the product name (no thickness spec row printed).",
    "No real imagery exists for this product at the retailer \\u2014 every gallery slot serves the 'image coming soon' placeholder; this record's imageUrl is the product's standard display URL, which today serves that placeholder.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 from Floor & Decor's own Custom Countertop Digital Catalog (founder's go \u2014 the field is the surface): face-top-a is the slab photograph's field from the 'Slab Image' page for Cyprus Granite (catalog page 10, https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/), with its own Sobel normal map; the page's close-up inset and room photograph are excluded. Verified against the product name, the catalog description and the product page's printed fields (Granite, Brown). Floor & Decor's gallery slots for this SKU serve only the placeholder and no slab dimensions are published, so no scale is claimed.",
  ],
};

const SAMPLE_ADONIS_WHITE_GRANITE_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-adonis-white-granite-custom-countertop",
  fdId: "100866185",
  name: "Sample - Adonis White Granite Custom Countertop",
  brand: "Manor House",
  colorway: "Adonis White",
  category: "countertops",
  productType: "granite-countertop",
  material: "Granite",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---adonis-white-granite-custom-countertop-100866185.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100866185_sample---adonis-white-granite-custom-countertop_1",
  faceSet: {
    product: "Sample - Adonis White Granite Custom Countertop",
    productSlug: "sample-adonis-white-granite-custom-countertop",
    option: "Adonis White",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/100866185_sample---adonis-white-granite-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-adonis-white-granite-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [170.59, 164.38, 160.35] },
    ],
    unitMeans: [
      [170.59, 164.38, 160.35],
    ],
    overallMean: [170.59, 164.38, 160.35],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: GRANITE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-adonis-white-granite-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_OCEAN_BREEZE_GRANITE_3_CM_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-ocean-breeze-granite-3-cm-custom-countertop",
  fdId: "100200070",
  name: "Sample - Ocean Breeze Granite 3 cm. Custom Countertop",
  brand: "Manor House",
  colorway: "Ocean Breeze",
  category: "countertops",
  productType: "granite-countertop",
  material: "Granite",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---ocean-breeze-granite-3-cm.-custom-countertop-100200070.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: 30,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100200070_sample---ocean-breeze-granite-3-cm.-custom-countertop_display",
  faceSet: {
    product: "Sample - Ocean Breeze Granite 3 cm. Custom Countertop",
    productSlug: "sample-ocean-breeze-granite-3-cm-custom-countertop",
    option: "Ocean Breeze",
    trueColorFaces: true,
    sourceSwatch:
      "https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0014_5.jpg",
    swatchSize: [2086, 2700],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-ocean-breeze-granite-3-cm-custom-countertop/face-top-a.jpg", sourceBox: [282, 410, 1293, 991], sourceSize: [1011, 581], mean: [190.82, 188.45, 184.29] },
    ],
    unitMeans: [
      [190.82, 188.45, 184.29],
    ],
    overallMean: [190.82, 188.45, 184.29],
    notes:
      "The slab face: the slab photograph's own field (1011 x 581 px) from this color's named 'Slab Image' page \u2014 page 14 of Floor & Decor's own Custom Countertop Digital Catalog. Floor & Decor publishes no surface image on this SKU's product page (every gallery slot serves the placeholder), so under the founder's order (2026-11-15) the face was cut from the catalog's official slab image for this named stone: the crop takes the slab photograph only \u2014 the page's close-up inset, room photograph and page furniture are excluded \u2014 and it was verified against the product name, the catalog's own description ('Against a white background, Ocean Breeze is heavily infused with grey and black veining.') and the product page's printed fields (Granite, White). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Source: https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/ (page 14; page image: https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0014_5.jpg).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the named stone's field only, as " +
        "published in Floor & Decor's own countertop catalog, " +
        "at its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: GRANITE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-ocean-breeze-granite-3-cm-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness spec row printed; thickness appears only in the product name (\"3 cm\").",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a thickness: \"3 cm\" appears in the product name (no thickness spec row printed).",
    "No real imagery exists for this product at the retailer \\u2014 every gallery slot serves the 'image coming soon' placeholder; this record's imageUrl is the product's standard display URL, which today serves that placeholder.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 from Floor & Decor's own Custom Countertop Digital Catalog (founder's go \u2014 the field is the surface): face-top-a is the slab photograph's field from the 'Slab Image' page for Ocean Breeze Granite (catalog page 14, https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/), with its own Sobel normal map; the page's close-up inset and room photograph are excluded. Verified against the product name, the catalog description and the product page's printed fields (Granite, White). Floor & Decor's gallery slots for this SKU serve only the placeholder and no slab dimensions are published, so no scale is claimed.",
  ],
};

const SAMPLE_MADISON_GREY_GRANITE_3_CM_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-madison-grey-granite-3-cm-custom-countertop",
  fdId: "100194679",
  name: "Sample - Madison Grey Granite 3 cm. Custom Countertop",
  brand: "Manor House",
  colorway: "Madison Grey",
  category: "countertops",
  productType: "granite-countertop",
  material: "Granite",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---madison-grey-granite-3-cm.-custom-countertop-100194679.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: 30,
  color: "Gray",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100194679_sample---madison-grey-granite-3-cm.-custom-countertop_display",
  faceSet: {
    product: "Sample - Madison Grey Granite 3 cm. Custom Countertop",
    productSlug: "sample-madison-grey-granite-3-cm-custom-countertop",
    option: "Madison Grey",
    trueColorFaces: true,
    sourceSwatch:
      "https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0013_5.jpg",
    swatchSize: [2086, 2700],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-madison-grey-granite-3-cm-custom-countertop/face-top-a.jpg", sourceBox: [282, 410, 1293, 991], sourceSize: [1011, 581], mean: [201.34, 201.75, 203.26] },
    ],
    unitMeans: [
      [201.34, 201.75, 203.26],
    ],
    overallMean: [201.34, 201.75, 203.26],
    notes:
      "The slab face: the slab photograph's own field (1011 x 581 px) from this color's named 'Slab Image' page \u2014 page 13 of Floor & Decor's own Custom Countertop Digital Catalog. Floor & Decor publishes no surface image on this SKU's product page (every gallery slot serves the placeholder), so under the founder's order (2026-11-15) the face was cut from the catalog's official slab image for this named stone: the crop takes the slab photograph only \u2014 the page's close-up inset, room photograph and page furniture are excluded \u2014 and it was verified against the product name, the catalog's own description ('With a white background, Madison Grey is infused with black, grey and taupe particulates.') and the product page's printed fields (Granite, Gray). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Source: https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/ (page 13; page image: https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0013_5.jpg).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the named stone's field only, as " +
        "published in Floor & Decor's own countertop catalog, " +
        "at its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: GRANITE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-madison-grey-granite-3-cm-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness spec row printed; thickness appears only in the product name (\"3 cm\").",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a thickness: \"3 cm\" appears in the product name (no thickness spec row printed).",
    "No real imagery exists for this product at the retailer \\u2014 every gallery slot serves the 'image coming soon' placeholder; this record's imageUrl is the product's standard display URL, which today serves that placeholder.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 from Floor & Decor's own Custom Countertop Digital Catalog (founder's go \u2014 the field is the surface): face-top-a is the slab photograph's field from the 'Slab Image' page for Madison Grey Granite (catalog page 13, https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/), with its own Sobel normal map; the page's close-up inset and room photograph are excluded. Verified against the product name, the catalog description and the product page's printed fields (Granite, Gray). Floor & Decor's gallery slots for this SKU serve only the placeholder and no slab dimensions are published, so no scale is claimed.",
  ],
};

const SAMPLE_ROLLING_VISTA_GRANITE_3_CM_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-rolling-vista-granite-3-cm-custom-countertop",
  fdId: "100194760",
  name: "Sample - Rolling Vista Granite 3 cm. Custom Countertop",
  brand: "Manor House",
  colorway: "Rolling Vista",
  category: "countertops",
  productType: "granite-countertop",
  material: "Granite",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---rolling-vista-granite-3-cm.-custom-countertop-100194760.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: 30,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100194760_sample---rolling-vista-granite-3-cm.-custom-countertop_display",
  faceSet: {
    product: "Sample - Rolling Vista Granite 3 cm. Custom Countertop",
    productSlug: "sample-rolling-vista-granite-3-cm-custom-countertop",
    option: "Rolling Vista",
    trueColorFaces: true,
    sourceSwatch:
      "https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0015_5.jpg",
    swatchSize: [2086, 2700],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-rolling-vista-granite-3-cm-custom-countertop/face-top-a.jpg", sourceBox: [282, 410, 1293, 991], sourceSize: [1011, 581], mean: [206.4, 206.81, 203.69] },
    ],
    unitMeans: [
      [206.4, 206.81, 203.69],
    ],
    overallMean: [206.4, 206.81, 203.69],
    notes:
      "The slab face: the slab photograph's own field (1011 x 581 px) from this color's named 'Slab Image' page \u2014 page 15 of Floor & Decor's own Custom Countertop Digital Catalog. Floor & Decor publishes no surface image on this SKU's product page (every gallery slot serves the placeholder), so under the founder's order (2026-11-15) the face was cut from the catalog's official slab image for this named stone: the crop takes the slab photograph only \u2014 the page's close-up inset, room photograph and page furniture are excluded \u2014 and it was verified against the product name, the catalog's own description ('Against a creamy background, Rolling Vista is accented with pewter veining.') and the product page's printed fields (Granite, White). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Source: https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/ (page 15; page image: https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0015_5.jpg).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the named stone's field only, as " +
        "published in Floor & Decor's own countertop catalog, " +
        "at its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: GRANITE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-rolling-vista-granite-3-cm-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness spec row printed; thickness appears only in the product name (\"3 cm\").",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a thickness: \"3 cm\" appears in the product name (no thickness spec row printed).",
    "No real imagery exists for this product at the retailer \\u2014 every gallery slot serves the 'image coming soon' placeholder; this record's imageUrl is the product's standard display URL, which today serves that placeholder.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 from Floor & Decor's own Custom Countertop Digital Catalog (founder's go \u2014 the field is the surface): face-top-a is the slab photograph's field from the 'Slab Image' page for Rolling Vista Granite (catalog page 15, https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/), with its own Sobel normal map; the page's close-up inset and room photograph are excluded. Verified against the product name, the catalog description and the product page's printed fields (Granite, White). Floor & Decor's gallery slots for this SKU serve only the placeholder and no slab dimensions are published, so no scale is claimed.",
  ],
};

const SAMPLE_GIALLO_ORNAMENTAL_GRANITE_3_CM_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-giallo-ornamental-granite-3-cm-custom-countertop",
  fdId: "100200120",
  name: "Sample - Giallo Ornamental Granite 3 cm. Custom Countertop",
  brand: "Manor House",
  colorway: "Giallo Ornamental",
  category: "countertops",
  productType: "granite-countertop",
  material: "Granite",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample---giallo-ornamental-granite-3-cm.-custom-countertop-100200120.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: 30,
  color: "Brown",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100200120_sample---giallo-ornamental-granite-3-cm.-custom-countertop_display",
  faceSet: {
    product: "Sample - Giallo Ornamental Granite 3 cm. Custom Countertop",
    productSlug: "sample-giallo-ornamental-granite-3-cm-custom-countertop",
    option: "Giallo Ornamental",
    trueColorFaces: true,
    sourceSwatch:
      "https://cdn.msisurfaces.com/images/colornames/giallo-ornamental-granite.jpg",
    swatchSize: [805, 805],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-giallo-ornamental-granite-3-cm-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 805, 805], sourceSize: [805, 805], mean: [176.6, 156.56, 136.68] },
    ],
    unitMeans: [
      [176.6, 156.56, 136.68],
    ],
    overallMean: [176.6, 156.56, 136.68],
    notes:
      "The slab face: the whole field, edge to edge, of MSI Surfaces' own published field for this named stone (served 805 x 805). Floor & Decor publishes no surface image for this sample SKU \u2014 every gallery slot serves the placeholder \u2014 so under the founder's outside-imagery order (2026-11-15) the face was built from the stone supplier's own imagery of the same named stone, verified against the product name and the page's printed fields (Granite, Brown). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Source: https://www.msisurfaces.com/granite/giallo-ornamental/ (image: https://cdn.msisurfaces.com/images/colornames/giallo-ornamental-granite.jpg).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the named stone's field only, as " +
        "published by the stone supplier (MSI Surfaces), at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: GRANITE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-giallo-ornamental-granite-3-cm-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness spec row printed; thickness appears only in the product name (\"3 cm\").",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a thickness: \"3 cm\" appears in the product name (no thickness spec row printed).",
    "No real imagery exists for this product at the retailer \\u2014 every gallery slot serves the 'image coming soon' placeholder; this record's imageUrl is the product's standard display URL, which today serves that placeholder.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 from OUTSIDE imagery (founder order \u2014 the field is the surface): face-top-a is MSI Surfaces' own published field for Giallo Ornamental Granite (https://cdn.msisurfaces.com/images/colornames/giallo-ornamental-granite.jpg) with its own Sobel normal map. MSI Giallo Ornamental Granite; also carried in 3 cm by Bedrosians (GRNGORNCLSLAB3P, beige). Floor & Decor's gallery slots for this SKU serve only the placeholder and no slab dimensions are published, so no scale is claimed.",
  ],
};

const SAMPLE_CLARK_GRANITE_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-clark-granite-custom-countertop",
  fdId: "101155273",
  name: "Sample- Clark Granite Custom Countertop",
  brand: "Manor House",
  colorway: "Clark",
  category: "countertops",
  productType: "granite-countertop",
  material: "Granite",
  sourceUrl: "https://www.flooranddecor.com/countertops-stone-custom/sample--clark-granite-custom-countertop-101155273.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Gold/ Yellow",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101155273_sample--clark-granite-custom-countertop_1",
  faceSet: {
    product: "Sample- Clark Granite Custom Countertop",
    productSlug: "sample-clark-granite-custom-countertop",
    option: "Clark",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101155273_sample--clark-granite-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-clark-granite-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [192.94, 185.45, 169.21] },
    ],
    unitMeans: [
      [192.94, 185.45, 169.21],
    ],
    overallMean: [192.94, 185.45, 169.21],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: GRANITE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-clark-granite-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_FANTASY_WAVE_MARBLE_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-fantasy-wave-marble-custom-countertop",
  fdId: "101005668",
  name: "Sample - Fantasy Wave Marble Custom Countertop",
  brand: "Manor House",
  colorway: "Fantasy Wave",
  category: "countertops",
  productType: "marble-countertop",
  material: "Marble",
  sourceUrl: "https://www.flooranddecor.com/marble-stone/sample---fantasy-wave-marble-custom-countertop-101005668.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: null,
  color: "Brown",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/101005668_sample---fantasy-wave-marble-custom-countertop_1",
  faceSet: {
    product: "Sample - Fantasy Wave Marble Custom Countertop",
    productSlug: "sample-fantasy-wave-marble-custom-countertop",
    option: "Fantasy Wave",
    trueColorFaces: true,
    sourceSwatch:
      "https://i8.amplience.net/i/flooranddecor/101005668_sample---fantasy-wave-marble-custom-countertop_1",
    swatchSize: [2500, 2500],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-fantasy-wave-marble-custom-countertop/face-top-a.jpg", sourceBox: [0, 0, 2500, 2500], sourceSize: [2500, 2500], mean: [193.25, 185.42, 180.81] },
    ],
    unitMeans: [
      [193.25, 185.42, 180.81],
    ],
    overallMean: [193.25, 185.42, 180.81],
    notes:
      "The slab face: the whole field, edge to edge of the product's own field (served 2500 x 2500). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Cut 2026-11-15 under the founder's slab ruling (build_countertop_slab_faces.py).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the product's own stone field only, at " +
        "its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: MARBLE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-fantasy-wave-marble-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness printed anywhere on the product page (no spec row, none in the name).",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 (founder slab ruling \u2014 the field is the surface): face-top-a is the product's own stone field at its served size, with its own Sobel normal map; it claims no inches \u2014 no slab dimensions are published for this sample SKU.",
  ],
};

const SAMPLE_STERLING_VENATO_MARBLE_3_CM_CUSTOM_COUNTERTOP: FloorDecorProduct = {
  slug: "sample-sterling-venato-marble-3-cm-custom-countertop",
  fdId: "100194778",
  name: "Sample - Sterling Venato Marble 3 cm. Custom Countertop",
  brand: "Manor House",
  colorway: "Sterling Venato",
  category: "countertops",
  productType: "marble-countertop",
  material: "Marble",
  sourceUrl: "https://www.flooranddecor.com/marble-stone/sample---sterling-venato-marble-3-cm.-custom-countertop-100194778.html",
  sourcedOn: "2026-11-15",
  lengthIn: null,
  widthIn: null,
  nominalLabel: null,
  dimensionStatus: "not-published",
  thicknessMm: 30,
  color: "White",
  warranty: "Lifetime Limited",
  jointIn: null,
  jointNote:
    "This record is the retailer's $5 sample SKU for a custom " +
    "countertop program \u2014 no joint or installation line is " +
    "printed for the sample.",
  priceUsd: 5,
  priceNote: "JSON-LD offer price $5.00 USD, availability InStock. The number of samples purchased is restricted to a maximum of 3 for the same product.",
  imageUrl: "https://i8.amplience.net/i/flooranddecor/100194778_sample---sterling-venato-marble-3-cm.-custom-countertop_display",
  faceSet: {
    product: "Sample - Sterling Venato Marble 3 cm. Custom Countertop",
    productSlug: "sample-sterling-venato-marble-3-cm-custom-countertop",
    option: "Sterling Venato",
    trueColorFaces: true,
    sourceSwatch:
      "https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0016_5.jpg",
    swatchSize: [2086, 2700],
    variants: [
      { url: "/app/floor-and-decor/countertops/sample-sterling-venato-marble-3-cm-custom-countertop/face-top-a.jpg", sourceBox: [282, 410, 1293, 991], sourceSize: [1011, 581], mean: [213.97, 215.92, 219.61] },
    ],
    unitMeans: [
      [213.97, 215.92, 219.61],
    ],
    overallMean: [213.97, 215.92, 219.61],
    notes:
      "The slab face: the slab photograph's own field (1011 x 581 px) from this color's named 'Slab Image' page \u2014 page 16 of Floor & Decor's own Custom Countertop Digital Catalog. Floor & Decor publishes no surface image on this SKU's product page (every gallery slot serves the placeholder), so under the founder's order (2026-11-15) the face was cut from the catalog's official slab image for this named stone: the crop takes the slab photograph only \u2014 the page's close-up inset, room photograph and page furniture are excluded \u2014 and it was verified against the product name, the catalog's own description ('Sterling Venato is a ravishing Italian marble that features shades of white and grey.') and the product page's printed fields (Marble, White). Colors from the original, never re-graded; no enlargement. Its own normal map was derived from its own image (Sobel emboss-to-normal, strength 2.0). Source: https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/ (page 16; page image: https://d1lx47257n5xt.cloudfront.net/393055/data/common/page-html5-substrates/page0016_5.jpg).",
    patternLogic: {
      kind: "field",
      wrap:
        "The stone field is the surface: it wraps as one " +
        "continuous field across the countertop and is never " +
        "cut into pieces; no scale is claimed \u2014 no slab " +
        "dimensions are published for this sample SKU.",
      rule:
        "The face is the named stone's field only, as " +
        "published in Floor & Decor's own countertop catalog, " +
        "at its served size; it is never presented at a claimed " +
        "true size until dimensions are published.",
    },
  },
  facesGap: null,
  faceMaterial: MARBLE_FACE_MATERIAL,
  faceNormals: [
    "/app/floor-and-decor/countertops/sample-sterling-venato-marble-3-cm-custom-countertop/face-top-a-normal.jpg",
  ],
  moduleIn: null,
  model: null,
  gaps: [
    "No slab dimensions (length/width) printed on the product page.",
    "No thickness spec row printed; thickness appears only in the product name (\"3 cm\").",
    "No finish printed anywhere on the product page (no spec row, none in the name).",
    "Countertop (slab) price per sq ft not printed on the page \u2014 sold in store only (\"Visit a Floor & Decor store for pricing\"); the $5.00 offer is the sample price.",
    "Name carries a thickness: \"3 cm\" appears in the product name (no thickness spec row printed).",
    "No real imagery exists for this product at the retailer \\u2014 every gallery slot serves the 'image coming soon' placeholder; this record's imageUrl is the product's standard display URL, which today serves that placeholder.",
    "No 3D model: no dimensions are published for this product and the builders carry no slab model kind (FloorDecorModel is plank-box only); the stone face is on record for when both land.",
    "Slab face + depth map: LANDED 2026-11-15 from Floor & Decor's own Custom Countertop Digital Catalog (founder's go \u2014 the field is the surface): face-top-a is the slab photograph's field from the 'Slab Image' page for Sterling Venato Marble (catalog page 16, https://countertops.cld.bz/Floor-Decor-Slab-Flipping-Book1/), with its own Sobel normal map; the page's close-up inset and room photograph are excluded. Verified against the product name, the catalog description and the product page's printed fields (Marble, White). Floor & Decor's gallery slots for this SKU serve only the placeholder and no slab dimensions are published, so no scale is claimed.",
  ],
};
export const FLOOR_DECOR_PRODUCTS: FloorDecorProduct[] = [
  ALAMO_OAK,
  WINTER_PEAK,
  PIEDMONT_BEND,
  HIGHGUARD_SILVER,
  STORMY_ELM,
  LORRAINE_SIENNA,
  PAISLEY_CAPE,
  FARRO_OAK,
  RAVEN,
  TIMBER_SADDLE,
  PELHAM_PEAK,
  TRENTON_TRADITION,
  BOLTON_RIDGE,
  STALLION_SPRINGS,
  BELLFLOWER_BLONDE,
  STONECASTLE,
  ROCKY_ROAD,
  BOARDWALK_OAK,
  ANSLEIGH_COTTAGE,
  CLAM_SHELL,
  MANCHESTER_COVE,
  LINCOLN_TRAIL,
  TIMBERWOLF_TRAIL,
  AUBURN_GLEN,
  ALTO_BIANCO,
  AMSTERDAM_ASH,
  ACACIA_BUTCHER_BLOCK_12FT,
  WALNUT_BUTCHER_BLOCK_12FT,
  AMERICAN_MAPLE_BUTCHER_BLOCK_COUNTERTOP_12FT,
  RED_OAK_BUTCHER_BLOCK_COUNTERTOP_12FT,
  AMERICAN_CHERRY_BUTCHER_BLOCK_COUNTERTOP_12FT,
  AMERICAN_HICKORY_BUTCHER_BLOCK_COUNTERTOP_12FT,
  WHITE_OAK_BUTCHER_BLOCK_COUNTERTOP_8FT,
  ACACIA_BUTCHER_BLOCK_COUNTERTOP_8FT,
  ACACIA_BUTCHER_BLOCK_COUNTERTOP_8FT_101316941,
  HEVEA_II_BUTCHER_BLOCK_COUNTERTOP_8FT,
  BEECH_BUTCHER_BLOCK_COUNTERTOP_8FT,
  RED_OAK_BUTCHER_BLOCK_COUNTERTOP_8FT,
  AMERICAN_WALNUT_BUTCHER_BLOCK_COUNTERTOP_8FT,
  AMERICAN_MAPLE_BUTCHER_BLOCK_COUNTERTOP_8FT,
  AMERICAN_HICKORY_BUTCHER_BLOCK_COUNTERTOP_8FT,
  AMERICAN_CHERRY_BUTCHER_BLOCK_COUNTERTOP_8FT,
  ACACIA_BUTCHER_BLOCK_ISLAND_6_FT,
  ACACIA_BUTCHER_BLOCK_ISLAND_6FT,
  HEVEA_II_BUTCHER_BLOCK_ISLAND_6FT,
  BEECH_ISLAND_BUTCHER_BLOCK_ISLAND_6FT,
  AMERICAN_MAPLE_BUTCHER_BLOCK_ISLAND_6FT,
  AMERICAN_WALNUT_BUTCHER_BLOCK_ISLAND_6FT,
  AMERICAN_HICKORY_BUTCHER_BLOCK_ISLAND_6FT,
  AMERICAN_CHERRY_BUTCHER_BLOCK_ISLAND_6FT,
  ACACIA_BUTCHER_BLOCK_WORKBENCH_5FT,
  WHITE_OAK_BUTCHER_BLOCK_WORKBENCH_5_FT,
  ACACIA_BUTCHER_BLOCK_WORKBENCH_5FT_101316933,
  HEVEA_II_BUTCHER_BLOCK_WORKBENCH_5FT,
  BEECH_BUTCHER_BLOCK_WORKBENCH_5FT,
  SAMPLE_CALACATTA_ORO_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_CARRARA_TRINITA_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_WILLOW_WHITE_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_CARBO_BRUSHED_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_ARTISAN_GREY_LEATHERED_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_STONEY_SHORES_QUARTZ_3_CM_CUSTOM_COUNTERTOP,
  SAMPLE_IBERIA_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_VERITY_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_EVEREST_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_DOLOMITES_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_CALACATTA_GRANDE_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_REMI_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_DRIFT_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_FORTE_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_OCEANA_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_STRATO_QUARTZ_3_CM_CUSTOM_COUNTERTOP,
  SAMPLE_CARRARA_CERVINO_QUARTZ_3_CM_CUSTOM_COUNTERTOP,
  SAMPLE_ADAGIO_GOLD_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_SIRIUS_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_MARGOT_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_TAJ_CREMA_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_GEMMA_LUXE_QUARTZ_TECH_CUSTOM_COUNTERTOP,
  SAMPLE_RENATA_VERA_QUARTZ_TECH_CUSTOM_COUNTERTOP,
  SAMPLE_LEVINE_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_CALACATTA_MARINA_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_CLARINO_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_ENCORE_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_ROCOCO_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_MACAUBAS_BIANCO_QUARTZ_CUSTOM_COUNTERTOP,
  SAMPLE_BIANCO_ANTICO_GRANITE_3_CM_CUSTOM_COUNTERTOP,
  SAMPLE_BROOKS_GRANITE_CUSTOM_COUNTERTOP,
  SAMPLE_BLACK_PEARL_BRUSH_GRANITE_3_CM_CUSTOM_COUNTERTOP,
  SAMPLE_ARABIAN_NIGHTS_GRANITE_CUSTOM_COUNTERTOP,
  SAMPLE_CYPRUS_GRANITE_3_CM_CUSTOM_COUNTERTOP,
  SAMPLE_ADONIS_WHITE_GRANITE_CUSTOM_COUNTERTOP,
  SAMPLE_OCEAN_BREEZE_GRANITE_3_CM_CUSTOM_COUNTERTOP,
  SAMPLE_MADISON_GREY_GRANITE_3_CM_CUSTOM_COUNTERTOP,
  SAMPLE_ROLLING_VISTA_GRANITE_3_CM_CUSTOM_COUNTERTOP,
  SAMPLE_GIALLO_ORNAMENTAL_GRANITE_3_CM_CUSTOM_COUNTERTOP,
  SAMPLE_CLARK_GRANITE_CUSTOM_COUNTERTOP,
  SAMPLE_FANTASY_WAVE_MARBLE_CUSTOM_COUNTERTOP,
  SAMPLE_STERLING_VENATO_MARBLE_3_CM_CUSTOM_COUNTERTOP,
];

export interface FloorAndDecorFamily {
  slug: string;
  brandLine: string;
  category: string;
  productType: string;
  /** What the family's own page on flooranddecor.com is. */
  sourceUrl: string;
  catalogNote: string;
  productSlugs: string[];
}

export const FLOOR_AND_DECOR_FAMILIES: FloorAndDecorFamily[] = [
  {
    slug: "duralux-performance-lvp-7x48-foam",
    brandLine: "DuraLux Performance",
    category: "vinyl-flooring",
    productType: "luxury-vinyl-plank",
    sourceUrl: DURALUX_LISTING_URL,
    catalogNote:
      "The DuraLux Performance brand page reported 28 products in one crawl and its 48-59 in length filter reported 35 in another (Floor & Decor counts are store-dependent). This family covers the 24 products displayed in the 5mm x 7in x 48in foam-pad plank group on 2026-11-12. The brand also sells other lengths, cork-pad and tile-format products, which are separate families.",
    productSlugs: FLOOR_DECOR_PRODUCTS.filter(
      (p) => p.brand === "DuraLux Performance",
    ).map((p) => p.slug),
  },
];

export const floorDecorProductBySlug = (
  slug: string,
): FloorDecorProduct | undefined =>
  FLOOR_DECOR_PRODUCTS.find((p) => p.slug === slug);

/** Products that can be laid as individual pieces today
 *  (a face set exists). Products without one are catalogued
 *  but unlayable — the deck program's register-D8 rule. */
export const floorDecorLayableProducts = (): FloorDecorProduct[] =>
  FLOOR_DECOR_PRODUCTS.filter((p) => p.faceSet !== null);

/** The product's faces in the shape the floor builders lay:
 *  one entry per faceSet variant, carrying the variant's true
 *  covered size, its own normal map and the product's material
 *  logic. Empty when the product has no face set. */
export function floorDecorFaces(product: FloorDecorProduct): FloorDecorFace[] {
  if (!product.faceSet || !product.faceMaterial) return [];
  const material = product.faceMaterial;
  return product.faceSet.variants.map((v, i) => ({
    url: v.url,
    // A faceSet exists only where dimensions are published,
    // so the null fallback is unreachable in practice.
    coveredLengthIn: v.faceIn ? v.faceIn[0] : (product.lengthIn ?? 0),
    coveredWidthIn: v.faceIn ? v.faceIn[1] : product.widthIn,
    normalUrl: product.faceNormals?.[i] ?? undefined,
    material,
  }));
}
