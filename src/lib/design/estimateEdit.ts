/**
 * Editing the live estimate
 * =========================
 * Every priced line on the Global Design Board dossier is traceable back to the
 * drawing: a base line knows its layer, an option line knows both the drawn
 * element and the option that was picked. That is what lets the estimate carry
 * an X on each line — removing a line is a real edit of the drawing, never a
 * cosmetic hide, so the take-off, specs and payment schedule all follow.
 */
/** Any priced estimate row, wherever it was rendered from. */
export type EditableLine = {
  label: string;
  shapeId?: string;
  featureId?: string;
  layer?: string;
};
import type { SitePlanData } from "@/components/blueprint/SiteDrawingBoard";
import { getFlipBoardValue, setFlipBoardValue } from "@/components/flip/flipBoardStore";

/** Can this line be taken off the estimate by the reader? */
export const isRemovableLine = (line: EditableLine) =>
  Boolean(line.featureId || line.shapeId || line.layer);

/** Plain-language label for the X button's tooltip. */
export const removeLineHint = (line: EditableLine) =>
  line.featureId
    ? `Remove ${line.label} from this element`
    : `Erase every ${line.label.toLowerCase()} element drawn on the sheet`;

/**
 * Apply the removal to the shared drawing for `boardId`.
 * - option line → the option comes off that one element
 * - base line   → every element on that layer is erased
 */
export function removeEstimateLine(boardId: string, line: EditableLine) {
  const site = getFlipBoardValue(boardId).site as SitePlanData;
  if (!site?.shapes?.length) return;

  if (line.featureId && line.shapeId) {
    const shapes = site.shapes.map((s) =>
      s.id === line.shapeId
        ? { ...s, features: (s.features ?? []).filter((f) => f !== line.featureId) }
        : s,
    );
    setFlipBoardValue(boardId, { site: { ...site, shapes } });
    return;
  }

  if (line.shapeId) {
    setFlipBoardValue(boardId, { site: { ...site, shapes: site.shapes.filter((s) => s.id !== line.shapeId) } });
    return;
  }

  if (line.layer) {
    setFlipBoardValue(boardId, { site: { ...site, shapes: site.shapes.filter((s) => s.layer !== line.layer) } });
  }
}
