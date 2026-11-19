/**
 * Floor & Decor display helper (paver port wiring Job 9) — the one place
 * the catalogue surfaces read the ported Floor & Decor registry
 * (data/floorDecorProducts) for display: the flooring products (every
 * registry record that is not a countertop), each product's own
 * dimension-true faces, its printed dimensions, its published spec
 * attributes, and its named gaps.
 *
 * DISPLAY ONLY. The registry's figures are Floor & Decor retail with
 * unstated bases (DIFF §5.7); none is a Wonderlands price, so nothing
 * here reads priceUsd / pricePerSqftUsd and no consumer of this helper
 * renders a price (WIRING-PLAN Job B5, blocked on a founder ruling).
 * Named gaps are shown as gaps, in the record's own words where the
 * record carries them — never filled with a substitute image, an
 * invented model, or another product's data. Alto Bianco appears only
 * at the size its registry record carries (24 x 48 matte); its extra
 * sizes exist only as cuts outside the registry and are not records.
 */
import {
  FLOOR_DECOR_PRODUCTS,
  floorDecorFaces,
  type FloorDecorProduct,
  type FloorDecorFace,
} from "@/data/floorDecorProducts";

/** The 26 flooring products, in registry order (countertops excluded —
 *  they are a different registry family and not part of this category). */
export const FLOORING_PRODUCTS: FloorDecorProduct[] = FLOOR_DECOR_PRODUCTS.filter(
  (p) => p.category !== "countertops",
);

/** The product's own dimension-true faces (empty only if the registry
 *  itself carries none; every flooring product currently carries a set). */
export const flooringFaces = (p: FloorDecorProduct): FloorDecorFace[] =>
  floorDecorFaces(p);

/** The product's own face image: its first cut face, falling back to the
 *  locally held display image, then the retailer's display asset. */
export const flooringFaceImage = (p: FloorDecorProduct): string =>
  flooringFaces(p)[0]?.url ?? p.displayImage ?? p.imageUrl;

/** Printed piece size, inches: "48.03 x 7.17 in". */
export const flooringDimensions = (p: FloorDecorProduct): string =>
  `${p.lengthIn} x ${p.widthIn} in`;

/** Dimensions line with the size label as printed, and the honest note
 *  when only the rounded listing size has been read so far. */
export const flooringMeta = (p: FloorDecorProduct): string =>
  [
    flooringDimensions(p),
    p.nominalLabel ? `Sold as ${p.nominalLabel}` : null,
    p.dimensionStatus === "nominal-only" ? "Listing size only" : null,
  ]
    .filter(Boolean)
    .join(" · ");

/** Published spec attributes, only the ones the product's own page
 *  prints — an absent attribute is simply not a row. */
export const flooringSpecRows = (p: FloorDecorProduct): Array<[string, string]> => {
  const rows: Array<[string, string | null | undefined]> = [
    ["Material", p.material],
    ["Finish", p.finish],
    ["Texture", p.texture],
    ["Look", p.look],
    ["Edge", p.edge],
    ["Shade", p.shade],
    ["Gloss", p.gloss],
    ["Wear layer", p.wearLayer],
    ["Attached pad", p.attachedPad],
    ["Installation", p.installType],
    ["Waterproof", p.waterproof ? "Yes" : null],
    ["Coverage per piece", p.coverageSqFtPerPiece ? `${p.coverageSqFtPerPiece} sq ft` : null],
    ["Box quantity", p.boxQuantity ? `${p.boxQuantity} pieces` : null],
    ["Warranty", p.warranty],
  ];
  return rows.filter((r): r is [string, string] => Boolean(r[1]));
};

const MODEL_GAP_RE = /no model|no full-length|no 3d model/i;

/**
 * The product's named gaps, as display lines. For a product whose
 * single-piece model is null, the gap is named in the record's own
 * words (its model gap entry, and its faces gap where it carries one);
 * where the record names neither, a plain data-state label says the
 * model is not built rather than letting the absence pass silently.
 * The registry's other gap entries (box facts, the retailer's own
 * offer figures) are sourcing notes, not display copy, and never
 * render here. Products with a model and no faces gap return [].
 */
export const flooringGapLines = (p: FloorDecorProduct): string[] => {
  if (p.model !== null) return p.facesGap ? [p.facesGap] : [];
  const lines: string[] = [];
  const modelGap = p.gaps.find((g) => MODEL_GAP_RE.test(g));
  if (modelGap) lines.push(modelGap);
  if (p.facesGap && p.facesGap !== modelGap) lines.push(p.facesGap);
  if (!lines.length) {
    lines.push(
      "Single-piece model: not yet built. The registry records this as a named gap, so no model or substitute image is shown.",
    );
  }
  return lines;
};

/** One-line summary for compact catalogue entries (FLIP console):
 *  material, finish class, wear layer, waterproofing, face count, and
 *  the named model gap where the product has one. No prices. */
export const flooringDetailSummary = (p: FloorDecorProduct): string =>
  [
    p.material,
    p.finish ?? p.texture ?? null,
    p.wearLayer ? `Wear layer ${p.wearLayer}` : null,
    p.waterproof ? "Waterproof" : null,
    `${flooringFaces(p).length} faces`,
    p.model === null ? "Named gap: no single-piece model yet" : null,
  ]
    .filter(Boolean)
    .join(" · ");
