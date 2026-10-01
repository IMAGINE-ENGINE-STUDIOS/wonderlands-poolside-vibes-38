/**
 * FLIP V3 — category importer.
 * Turns any Wonderlands category (same catalogue the main magazine reads, via
 * flipConsoleData) into editable pages: cover, contents (jump buttons to each
 * product page) and one page per product with photo, price and Add to cart.
 * Product order is kept exactly as the catalogue returns it (never shuffled).
 * `offset` = pages already in the book, so contents buttons point to the right page.
 */
import { uid, type Block, type BuilderPage } from "./flipBuilderTypes";
import { formatEntryPrice, loadCategoryEntries } from "./flipConsoleData";

const MAX_CONTENTS = 12;

export async function buildCategoryBook(categoryId: string, offset: number, insertAfter?: number): Promise<BuilderPage[]> {
  const [{ ITEMS }, entries] = await Promise.all([import("@/components/FlipIndex"), loadCategoryEntries(categoryId)]);
  const item = ITEMS.find((i) => i.id === categoryId);
  if (!item || !entries.length) return [];
  const label = item.label;
  // inserted right after the current page, so the first new page is (insertAfter ?? offset-1)+2
  const firstNew = (insertAfter ?? offset - 1) + 2;
  const productStart = firstNew + 2;

  const cover: BuilderPage = {
    id: uid(), name: label, tone: "cover", transition: "flip",
    background: item.images?.[0],
    blocks: [
      { id: uid(), kind: "text", x: 8, y: 62, w: 84, h: 6, text: item.tagline ?? "Wonderlands", style: "eyebrow", tone: "light" },
      { id: uid(), kind: "text", x: 8, y: 68, w: 84, h: 14, text: label, style: "title", tone: "light", animation: "rise" },
      { id: uid(), kind: "text", x: 8, y: 84, w: 84, h: 10, text: item.description ?? "", style: "body", tone: "light" },
    ],
  };

  const contentsBlocks: Block[] = [
    { id: uid(), kind: "text", x: 8, y: 6, w: 84, h: 5, text: "Contents", style: "eyebrow" },
    { id: uid(), kind: "text", x: 8, y: 11, w: 84, h: 9, text: `The ${label} collection`, style: "subtitle" },
  ];
  entries.slice(0, MAX_CONTENTS).forEach((e, i) => {
    contentsBlocks.push({
      id: uid(), kind: "button", x: 8, y: 24 + i * 6, w: 84, h: 5,
      text: `${String(productStart + i).padStart(2, "0")} · ${e.name}`,
      action: "page", targetPage: productStart + i,
    });
  });
  const contents: BuilderPage = { id: uid(), name: "Contents", tone: "paper", transition: "flip", blocks: contentsBlocks };

  const products: BuilderPage[] = entries.map((e) => ({
    id: uid(), name: e.name, tone: "paper", transition: "flip",
    blocks: [
      { id: uid(), kind: "image", x: 6, y: 5, w: 88, h: 52, src: e.image, text: e.name, animation: "ken" },
      { id: uid(), kind: "text", x: 6, y: 60, w: 88, h: 4, text: e.brand ?? e.meta ?? label, style: "eyebrow" },
      { id: uid(), kind: "text", x: 6, y: 65, w: 88, h: 10, text: e.name, style: "subtitle" },
      { id: uid(), kind: "text", x: 6, y: 77, w: 88, h: 5, text: formatEntryPrice(e), style: "body" },
      {
        id: uid(), kind: "button", x: 6, y: 86, w: 42, h: 7, text: "Add to cart",
        action: "cart", productName: e.name, price: e.price ?? 0, productImage: e.image, productCategory: label,
      },
      { id: uid(), kind: "button", x: 52, y: 86, w: 42, h: 7, text: "Contents", action: "page", targetPage: firstNew + 1 },
    ],
  }));

  return [cover, contents, ...products];
}
