/**
 * Product-specific photography for the FLIP dossiers.
 *
 * The editorial pages of a product book must only ever show imagery that
 * belongs to that product: its own plate, the plates of its own series (same
 * brand, same model family), and — when nothing else exists — verified
 * manufacturer photography for that brand and discipline. Images from other
 * models, other brands or other disciplines are never mixed in.
 */

export type GalleryProduct = { name: string; brand?: string; image?: string };

/** Verified manufacturer photography, keyed by brand then discipline. */
const BRAND_SCENES: Record<string, Record<string, string[]>> = {
  harvia: {
    saunas: [
      "https://www.datocms-assets.com/41658/1618982746-minklassikersauna2020-6-770x515.jpg",
      "https://www.datocms-assets.com/41658/1618999782-harviafortuna05-770x515.jpg",
      "https://www.datocms-assets.com/41658/1619081170-alpencamping-nenzing-2.jpg",
      "https://www.datocms-assets.com/41658/1619762241-harviapickala03032190.jpg",
    ],
  },
  pentair: {
    equipment: [
      "https://www.pentair.com/en-us/pool-spa/products/_jcr_content/par/section_183103816_co/image.img.jpg/1743437338860.jpg",
      "https://www.pentair.com/en-us/pool-spa/products/_jcr_content/par/section_2013138708_c/image.img.jpg/1743437308219.jpg",
    ],
  },
};

/** "Milan 8.14" -> "milan", "Bermuda 14 Deluxe" -> "bermuda", "Serafina" -> "serafina" */
export const seriesKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9. ]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !/^\d/.test(t) && !["deluxe", "xl", "pool", "spa", "sauna", "model"].includes(t))
    .slice(0, 2)
    .join(" ")
    .trim();

const brandKey = (brand?: string) => (brand ?? "").toLowerCase().trim();

/**
 * Build the ordered photography set for one product.
 * `siblings` are the other models of the same discipline — only those from the
 * same brand and the same series contribute images.
 */
export function resolveProductGallery({
  categoryId,
  name,
  brand,
  image,
  siblings = [],
}: {
  categoryId: string;
  name: string;
  brand?: string;
  image?: string;
  siblings?: GalleryProduct[];
}): string[] {
  const out: string[] = [];
  const push = (src?: string) => {
    if (src && !out.includes(src)) out.push(src);
  };

  push(image);

  const series = seriesKey(name);
  const bk = brandKey(brand);
  if (series) {
    siblings
      .filter((s) => brandKey(s.brand) === bk && seriesKey(s.name) === series)
      .forEach((s) => push(s.image));
  }

  (BRAND_SCENES[bk]?.[categoryId] ?? []).forEach(push);

  return out.filter(Boolean);
}
