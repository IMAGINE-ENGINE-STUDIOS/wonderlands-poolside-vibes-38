/**
 * Sauna Placement Tool — shared logic.
 *
 * WHAT: the typed seams and pure helpers behind the "See a sauna in your
 * space" page (`src/pages/suites/SaunaPlacement.tsx`). The page collects a
 * model and its complements from the Genius sauna pack, a base treatment,
 * and a photo of the customer's space; the customer taps the exact spot;
 * the Genius `visual-agent` function (action "sauna-placement") composes
 * the picture server side from the pack.
 *
 * CONTRACT (Genius lane, live 2026-11-19, both Supabase projects):
 * `POST {SUPABASE_URL}/functions/v1/visual-agent`, anon key as Bearer.
 *   { "action": "sauna-pack" } → { models[28], options[24] }
 *   { "action": "sauna-placement", photo_url, marked_photo_url,
 *     tap_percent {x, y} (0..100), model_id, reference_photos,
 *     dimensions_text, complements: [{ id, choice? }],
 *     base: { surface, paver_collection?, lighting }, width, height }
 *     → { image_url (durable stored URL, may be null), image_data
 *         (base64 JPEG), sauna: { footprint_used, dimension_status,
 *         applied_visual_options, excluded_options, warnings,
 *         three_d_url, base_applied, dimensions_text_received } }
 * The marked photo is the edit anchor: the marker pins the spot for the
 * image model and the server paints it out of the result. The tap is the
 * centre of the sauna's footprint, front facing the camera. The full
 * contract lives in ~/workspace/genius-sauna-pack/SAUNA-PACK.md. Callers
 * never write the prompt; the server composes it from the pack.
 *
 * PHOTO URLS: the app's live-shares bucket is not public readable (its
 * public URLs answer 400 to a credential free fetch, which is how the
 * generator loads them), so uploads are handed over as signed URLs —
 * proven live 2026-11-19 (see the P1 report, Problem #1).
 *
 * The pickers come from the pack, never from local catalogue files: the
 * generate call needs pack ids, so a failed pack load is an honest error
 * state with a retry, not a silent fallback.
 *
 * BASE: what the sauna sits on is a generation input (founder addition,
 * contract confirmed 2026-11-19). The pack serves the surface set under
 * "bases"; the payload carries the object form and the response reports
 * base_applied back. The field is omitted only for the untouched default
 * (existing ground, no lighting), which the server treats the same.
 */
import { supabase } from "@/integrations/supabase/client";
import { FUNCTIONS_BASE, SUPABASE_ANON_KEY } from "@/lib/supabaseEnv";
import { SCAN_BUCKET, mintScanToken } from "@/lib/ar/scanSession";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** A tap position as a fraction of the photo (0..1 on each axis). */
export interface PlacementTap {
  x: number;
  y: number;
}

/** One model as the page needs it, parsed from the pack response. */
export interface PackModel {
  id: string;
  name: string;
  form: string;
  capacity: string;
  stockHeater: string;
  /** Dimensions exactly as the catalogue states them. */
  dimensionsAsStated: string;
  /** The pack's own status line for the dimensions. */
  dimensionStatus: string;
  /**
   * The manufacturer's own assembled size line from the pack's
   * harvested knowledge (the additive `official` object, live
   * 2026-11-19 on both projects): the current truth for the model's
   * size, where the legacy dimensions block still flags gaps.
   */
  officialAssembled: string | null;
  /** The manufacturer's footprint in feet, from the official object. */
  officialFootprintFt: { w: number; d: number } | null;
  /** The manufacturer's height in feet, from the official object. */
  officialHeightFt: number | null;
  /** True when the pack flags the footprint as a gap (scale estimated). */
  scaleEstimated: boolean;
  heroPhoto: string;
  mediaPhotos: string[];
  /** Catalogue photo URLs sent to generation as appearance references. */
  referencePhotos: string[];
  /** The manufacturer's own 3D / AR page for this model, or null (named gap). */
  threeDUrl: string | null;
  /** The pack's status line for the 3D coverage. */
  threeDStatus: string;
}

/** One option group as the page needs it, parsed from the pack response. */
export interface PackOptionGroup {
  id: string;
  label: string;
  type: "selection" | "boolean";
  /** front | exterior | adjacent | interior | none (pack classification). */
  placementClass: string;
  visualEffect: string;
  /** Exact choice names for selection groups; empty for booleans. */
  choices: string[];
}

/** One base surface as the pack serves it under "bases". */
export interface PackBase {
  id: string;
  label: string;
}

export interface SaunaPack {
  models: PackModel[];
  optionGroups: PackOptionGroup[];
  bases: PackBase[];
}

/** One chosen complement, in the contract's shape. */
export interface PlacementOptionChoice {
  id: string;
  /** The exact choice name; present only for selection groups. */
  choice?: string;
}

export interface PlacementRequest {
  /** The customer's clean photo, as a URL the generator can load. */
  photoUrl: string;
  /** The same photo with the marker at the tap, as a loadable URL. */
  markedPhotoUrl: string;
  /** The tap internally as a fraction (0..1); the payload sends percent. */
  tapPct: PlacementTap;
  /** Pack model id. */
  modelId: string;
  /** The pack model's catalogue reference photo URLs. */
  referencePhotos: string[];
  /** The pack model's dimensions, exactly as stated. */
  dimensionsText: string;
  /** Chosen complements only, in contract shape. */
  complements: PlacementOptionChoice[];
  /** The chosen base treatment (surface, optional collection, lighting). */
  base: PlacementBaseSelection;
}

/** The honesty facts the generate call reports back about its picture. */
export interface PlacementMeta {
  footprintUsed: string | null;
  dimensionStatus: string | null;
  appliedVisualOptions: string[];
  excludedOptions: string[];
  warnings: string[];
  /** The model's manufacturer 3D / AR page, as returned per placement. */
  threeDUrl: string | null;
  /** The base the generator reports it rendered, or null when unreported. */
  baseApplied: PlacementBaseApplied | null;
  /**
   * Founder ruling (2026-11-19): the placed sauna must be the selected
   * model or nothing. When the generator reports it cannot render the
   * selected model faithfully (sauna.cannot_render), the page shows
   * that plainly instead of any substituted picture.
   */
  cannotRender: boolean;
  /** The generator's short plain reason, when it gives one. */
  cannotRenderReason: string | null;
  /**
   * The resolved model's own form and catalogue photo, as the server
   * reports them per placement (2026-11-19 hardening): the result
   * panel shows them beside the render so the placed sauna's identity
   * is checkable at a glance.
   */
  modelForm: string | null;
  modelHeroPhoto: string | null;
  /**
   * The v3 fidelity verdict the server reports per placement: on a
   * success, the render was judged against the model's own catalogue
   * photo and carries what the judge saw (form + finish). Null when
   * the response reports none.
   */
  fidelityVerdict: string | null;
  fidelitySeenForm: string | null;
  fidelitySeenFinish: string | null;
  /**
   * The manufacturer's official dimensions the placement itself
   * reports (additive meta, live 2026-11-19): the assembled size as a
   * string when the server spells one, and the height in feet. Null
   * when the response reports neither.
   */
  officialDimensions: string | null;
  heightFt: number | null;
}

/** The base_applied object the generate response reports back. */
export interface PlacementBaseApplied {
  surface: string;
  paverCollection: string | null;
  lighting: boolean;
}

export interface PlacementResult {
  /** The generated picture: the durable stored URL when the server
   *  returns one, otherwise a data URL built from image_data. */
  imageUrl: string;
  meta: PlacementMeta;
}

/** Thrown when the pack cannot be read or generation cannot run. */
export class PlacementUnavailableError extends Error {
  constructor(message = "Placement generation is not available right now.") {
    super(message);
    this.name = "PlacementUnavailableError";
  }
}

/* ------------------------------------------------------------------ */
/* Base treatments (what the sauna sits on)                            */
/* ------------------------------------------------------------------ */

/**
 * Base surfaces — the contract's set, served by the pack under "bases"
 * and grounded in the founder's list ("Belgard pavers, pebbles, concrete
 * pad, deck, grass, lighting"): lighting is not a surface of its own in
 * the contract; it is the boolean that rings any base with warm ground
 * spotlights, and "deck" is the wood-deck surface. The labels below are
 * the short plain labels the page shows; they are used only when the
 * pack serves no bases (the ids are contract constants, never invented).
 */
export const FALLBACK_BASES: PackBase[] = [
  { id: "existing", label: "Existing ground" },
  { id: "grass", label: "Grass" },
  { id: "pebbles", label: "Pebbles" },
  { id: "belgard-pavers", label: "Belgard pavers" },
  { id: "concrete-pad", label: "Concrete pad" },
  { id: "wood-deck", label: "Wood deck" },
];

/** The surface id whose selection may carry a paver collection. */
export const PAVER_BASE_ID = "belgard-pavers";

/** The page's base selection: a surface, an optional collection, lighting. */
export interface PlacementBaseSelection {
  /** A pack base id (one of the FALLBACK_BASES ids when unserved). */
  surface: string;
  /** A Belgard collection name; only meaningful for the paver surface. */
  paverCollection: string | null;
  /** Warm ground spotlights ringed around the base. */
  lighting: boolean;
}

/** The untouched default: the photo's own ground, no lighting. */
export const DEFAULT_BASE_SELECTION: PlacementBaseSelection = {
  surface: "existing",
  paverCollection: null,
  lighting: false,
};

/**
 * The payload's base object, or undefined when the selection is the
 * untouched default (existing ground, lighting off) — omitting the field
 * is the contract's own spelling of that default. The collection rides
 * only on the paver surface and only when one is chosen.
 */
export function buildBasePayload(
  base: PlacementBaseSelection,
): Record<string, unknown> | undefined {
  if (base.surface === "existing" && !base.lighting) return undefined;
  const out: Record<string, unknown> = {
    surface: base.surface,
    lighting: base.lighting,
  };
  if (base.surface === PAVER_BASE_ID && base.paverCollection) {
    out.paver_collection = base.paverCollection;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Pure helpers                                                        */
/* ------------------------------------------------------------------ */

const clamp01 = (n: number): number =>
  Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;

/** The rectangle shape the tap math needs (a DOMRect satisfies this). */
export interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Convert a pointer position (client coordinates) over the displayed photo
 * into a tap fraction of the photo. Points outside the photo clamp to the
 * nearest edge, so a slightly missed tap still lands on the picture.
 */
export function tapPctFromEvent(
  clientX: number,
  clientY: number,
  rect: RectLike,
): PlacementTap {
  return {
    x: rect.width > 0 ? clamp01((clientX - rect.left) / rect.width) : 0,
    y: rect.height > 0 ? clamp01((clientY - rect.top) / rect.height) : 0,
  };
}

/** The tap in the contract's percent form (0..100, whole numbers). */
export function tapPercentFor(tapPct: PlacementTap): { x: number; y: number } {
  return {
    x: Math.round(clamp01(tapPct.x) * 100),
    y: Math.round(clamp01(tapPct.y) * 100),
  };
}

/** The tap point in natural image pixels, for drawing the marker. */
export function markerPointFor(
  tapPct: PlacementTap,
  naturalW: number,
  naturalH: number,
): { x: number; y: number } {
  return {
    x: Math.round(clamp01(tapPct.x) * naturalW),
    y: Math.round(clamp01(tapPct.y) * naturalH),
  };
}

/**
 * The width and height to request from generation: the photo's natural
 * dimensions with the long edge capped (default 1536), aspect preserved.
 */
export function placementImageSize(
  naturalW: number,
  naturalH: number,
  cap = 1536,
): { width: number; height: number } {
  const w = Math.max(1, Math.round(naturalW));
  const h = Math.max(1, Math.round(naturalH));
  const long = Math.max(w, h);
  if (long <= cap) return { width: w, height: h };
  const scale = cap / long;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

/**
 * Render the customer's photo to a JPEG blob through a canvas, drawing
 * the placement marker when a tap is given. Rendering both uploads as
 * JPEG keeps phone formats the generator cannot read (such as HEIC) out
 * of the contract. Browser only (needs Image and canvas).
 *
 * The render is DOWNSCALED to the placement image size (long edge
 * capped, the same size generation is requested at): a phone photo at
 * full resolution (4000 px and up) is rejected by the editing side as
 * too large — the founder's own phone pass failed exactly that way on
 * 2026-11-19 — while the capped render is the size the editor works
 * at anyway. The tap is a percentage, so the marker maps onto the
 * resized image at the same relative spot and placement stays exact;
 * clean and marked renders share the size, so they stay in register.
 */
async function renderPhotoJpegBlob(
  source: Blob,
  tapPct: PlacementTap | null,
): Promise<Blob> {
  if (typeof document === "undefined" || typeof URL === "undefined") {
    throw new Error("Photo rendering needs a browser canvas.");
  }
  const objectUrl = URL.createObjectURL(source);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("The photo could not be read."));
      el.src = objectUrl;
    });
    const size = placementImageSize(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Photo rendering needs a browser canvas.");
    ctx.drawImage(img, 0, 0, size.width, size.height);
    if (tapPct) {
      const { x, y } = markerPointFor(tapPct, size.width, size.height);
      const r = Math.max(6, Math.round(size.width * 0.025));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220, 38, 38, 0.92)";
      ctx.fill();
      ctx.lineWidth = Math.max(2, Math.round(r / 3));
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.stroke();
    }
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) throw new Error("The photo could not be made.");
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** The customer's photo as a plain JPEG, ready to upload. */
export function renderCleanPhotoBlob(source: Blob): Promise<Blob> {
  return renderPhotoJpegBlob(source, null);
}

/**
 * Draw the placement marker onto the customer's photo: a filled circle
 * with a light ring at the tap point, sized at about 2.5 percent of the
 * image width so the generation side can find the exact spot at any
 * resolution. The server paints the marker out of the result. Returns a
 * JPEG blob ready to upload. Browser only (needs Image and canvas).
 */
export function renderMarkedPhotoBlob(
  source: Blob,
  tapPct: PlacementTap,
): Promise<Blob> {
  return renderPhotoJpegBlob(source, tapPct);
}

/* ------------------------------------------------------------------ */
/* Pack parsing (pure)                                                 */
/* ------------------------------------------------------------------ */

const asString = (v: unknown): string => (typeof v === "string" ? v : "");
const asStringOrNull = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;
const asStringList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/** Choice entries arrive as plain names; accept { name } objects too. */
const asChoiceList = (v: unknown): string[] =>
  Array.isArray(v)
    ? v
        .map((c) =>
          typeof c === "string"
            ? c
            : c && typeof c === "object"
              ? asString((c as { name?: unknown }).name)
              : "",
        )
        .filter((s) => s.length > 0)
    : [];

/** A model is scale estimated when the pack flags its footprint as a gap. */
export function modelScaleEstimated(dimensions: unknown): boolean {
  if (!dimensions || typeof dimensions !== "object") return true;
  const d = dimensions as { status?: unknown; footprintFt?: unknown };
  if (!d.footprintFt) return true;
  return /^gap/i.test(asString(d.status));
}

const asPositiveNumber = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;

/**
 * The pack's harvested manufacturer knowledge (the additive `official`
 * object): assembled dimensions including height, held for every model
 * (verified live 2026-11-19, all 28). Parsed defensively — a malformed
 * or absent object reads as all nulls and the legacy fields decide.
 */
function parseOfficial(raw: unknown): {
  assembled: string | null;
  footprintFt: { w: number; d: number } | null;
  heightFt: number | null;
} {
  const empty = { assembled: null, footprintFt: null, heightFt: null };
  if (!raw || typeof raw !== "object") return empty;
  const o = raw as Record<string, unknown>;
  const fp =
    o.footprintFt && typeof o.footprintFt === "object"
      ? (o.footprintFt as Record<string, unknown>)
      : null;
  const w = fp ? asPositiveNumber(fp.w) : null;
  const d = fp ? asPositiveNumber(fp.d) : null;
  return {
    assembled: asStringOrNull(o.assembled),
    footprintFt: w != null && d != null ? { w, d } : null,
    heightFt: asPositiveNumber(o.heightFt),
  };
}

function parsePackModel(raw: unknown): PackModel | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const id = asString(m.id);
  const name = asString(m.name);
  if (!id || !name) return null;
  const dims =
    m.dimensions && typeof m.dimensions === "object"
      ? (m.dimensions as Record<string, unknown>)
      : {};
  const anchor =
    m.anchorPhotos && typeof m.anchorPhotos === "object"
      ? (m.anchorPhotos as Record<string, unknown>)
      : {};
  const mediaPhotos = asStringList(m.mediaPhotos).length
    ? asStringList(m.mediaPhotos)
    : asStringList(m.anchorPhotos);
  const heroPhoto =
    asString(m.heroPhoto) ||
    asString(anchor.hero) ||
    mediaPhotos[0] ||
    asString(m.image);
  const referencePhotos = Array.from(
    new Set([heroPhoto, ...mediaPhotos].filter((u) => u.length > 0)),
  );
  const official = parseOfficial(m.official);
  return {
    id,
    name,
    form: asString(m.form),
    capacity: asString(m.capacity),
    stockHeater: asString(m.stockHeater),
    dimensionsAsStated: asString(dims.asStated),
    dimensionStatus: asString(dims.status),
    officialAssembled: official.assembled,
    officialFootprintFt: official.footprintFt,
    officialHeightFt: official.heightFt,
    /* A held manufacturer footprint is a real size, never an estimate,
     * whatever the legacy dimensions block still flags. */
    scaleEstimated: official.footprintFt
      ? false
      : modelScaleEstimated(m.dimensions),
    heroPhoto,
    mediaPhotos,
    referencePhotos,
    threeDUrl: asStringOrNull(m.threeDUrl),
    threeDStatus: asString(m.threeDStatus),
  };
}

function parsePackOptionGroup(raw: unknown): PackOptionGroup | null {
  if (!raw || typeof raw !== "object") return null;
  const g = raw as Record<string, unknown>;
  const id = asString(g.id);
  const label = asString(g.label);
  if (!id || !label) return null;
  const choices = asChoiceList(g.choices);
  const type =
    g.type === "boolean" || g.type === "selection"
      ? g.type
      : choices.length > 0
        ? "selection"
        : "boolean";
  return {
    id,
    label,
    type,
    placementClass: asString(g.placementClass),
    visualEffect: asString(g.visualEffect),
    choices,
  };
}

/**
 * Parse a sauna-pack response into the page's shapes. Throws
 * PlacementUnavailableError when the response carries no usable models —
 * the page shows its honest error state rather than guessing.
 */
export function parseSaunaPack(raw: unknown): SaunaPack {
  if (!raw || typeof raw !== "object") {
    throw new PlacementUnavailableError("The sauna catalogue could not be read.");
  }
  const r = raw as Record<string, unknown>;
  const models = (Array.isArray(r.models) ? r.models : [])
    .map(parsePackModel)
    .filter((m): m is PackModel => m !== null);
  if (models.length === 0) {
    throw new PlacementUnavailableError("The sauna catalogue could not be read.");
  }
  const optionGroups = (Array.isArray(r.options) ? r.options : [])
    .map(parsePackOptionGroup)
    .filter((g): g is PackOptionGroup => g !== null);
  const bases = (Array.isArray(r.bases) ? r.bases : [])
    .map((b): PackBase | null => {
      if (!b || typeof b !== "object") return null;
      const bb = b as Record<string, unknown>;
      const id = asString(bb.id);
      return id ? { id, label: asString(bb.label) || id } : null;
    })
    .filter((b): b is PackBase => b !== null);
  return {
    models,
    optionGroups,
    bases: bases.length > 0 ? bases : FALLBACK_BASES,
  };
}

/** Placement classes the placement flow may offer (the rest never show). */
export const CHOOSABLE_PLACEMENT_CLASSES = ["front", "exterior", "adjacent"];

/** The option groups this flow offers: front, exterior and adjacent only. */
export function choosableOptionGroups(pack: SaunaPack): PackOptionGroup[] {
  return pack.optionGroups.filter((g) =>
    CHOOSABLE_PLACEMENT_CLASSES.includes(g.placementClass),
  );
}

/**
 * The pack's groups split for the in-suite placement section (founder,
 * 2026-11-22 — the tool moves into the Sauna Suite and carries the
 * missing options): `visible` groups can show in the picture (the
 * choosable classes above); `rest` groups go with the sauna but never
 * show — interior fittings and personal items. The rest are still
 * offered and still ride the generation request: the server lists
 * them back as not visible in the picture, which the result panel
 * presents as such. Nothing in the pack is dropped.
 */
export function placementGroupsForDisplay(pack: SaunaPack): {
  visible: PackOptionGroup[];
  rest: PackOptionGroup[];
} {
  const visible = choosableOptionGroups(pack);
  const visibleIds = new Set(visible.map((g) => g.id));
  return {
    visible,
    rest: pack.optionGroups.filter((g) => !visibleIds.has(g.id)),
  };
}

/**
 * The complements payload for a set of groups from the customer's
 * selections: a selection group contributes its chosen choice, a
 * boolean group contributes itself when toggled on. Order follows the
 * group list given.
 */export function complementsFromSelections(
  groups: PackOptionGroup[],
  selections: Record<string, string>,
  toggles: Record<string, boolean>,
): PlacementOptionChoice[] {
  const out: PlacementOptionChoice[] = [];
  for (const g of groups) {
    if (g.type === "selection") {
      const choice = selections[g.id];
      if (choice) out.push({ id: g.id, choice });
    } else if (toggles[g.id]) {
      out.push({ id: g.id });
    }
  }
  return out;
}

/**
 * Carry-over from the suite configurator (founder strategy §2.4,
 * 2026-11-22): the placement section starts from the configuration
 * the customer already made in the suite above it. The suite's
 * extras record stores the chosen option NAME per feature id, and
 * the pack's groups share the same ids and choice names — so a
 * suite selection seeds the placement selection only when the pack
 * group exists AND the stored name is one of its choices. Anything
 * else (a "None" deselection, a quantity, a group the pack does
 * not carry) seeds nothing — never invented, never approximated.
 * Boolean pack groups seed from a stored boolean true.
 */
export function selectionsFromSuiteExtras(
  groups: PackOptionGroup[],
  extras: Record<string, unknown>,
): { selections: Record<string, string>; toggles: Record<string, boolean> } {
  const selections: Record<string, string> = {};
  const toggles: Record<string, boolean> = {};
  for (const g of groups) {
    const value = extras[g.id];
    if (g.type === "selection") {
      if (typeof value === "string" && g.choices.includes(value)) {
        selections[g.id] = value;
      }
    } else if (value === true) {
      toggles[g.id] = true;
    }
  }
  return { selections, toggles };
}

/**
 * The manufacturer's 3D / AR page for a model, read from the loaded pack
 * (the pack carries threeDUrl per model from the manufacturer's own
 * pages; 20 of 28 models have one, the rest are named gaps). Returns null
 * when the pack is not loaded, the model is unknown, or the model has no
 * manufacturer page — the page then shows catalogue photos instead.
 * Never invent or guess a URL here.
 */
export function arUrlForModel(
  pack: SaunaPack | null,
  modelId: string,
): string | null {
  if (!pack) return null;
  const model = pack.models.find((m) => m.id === modelId);
  return model?.threeDUrl ?? null;
}

/**
 * The size line the page shows for a model: the manufacturer's own
 * assembled dimensions when the pack's harvested knowledge carries
 * them (the current truth), else the catalogue's stated dimensions,
 * exactly as before the official object existed.
 */
export function modelSizeLine(model: PackModel): string {
  return model.officialAssembled ?? model.dimensionsAsStated;
}

/**
 * Whether the result panel must call the scale estimated: only when
 * neither the pack's harvested knowledge nor the placement itself
 * reports a real manufacturer size. The legacy gap flags stand down
 * wherever official dimensions are held.
 */
export function placementScaleEstimated(
  model: PackModel,
  meta: PlacementMeta,
): boolean {
  if (model.officialFootprintFt) return false;
  if (meta.officialDimensions || meta.heightFt != null) return false;
  return (
    model.scaleEstimated ||
    (meta.dimensionStatus ? /^gap/i.test(meta.dimensionStatus) : false)
  );
}

/* ------------------------------------------------------------------ */
/* Contract payload + response (pure)                                  */
/* ------------------------------------------------------------------ */

/**
 * The exact generate body for the reshaped contract. The tap converts to
 * percent (0..100). The base object rides whenever the selection differs
 * from the untouched default (see buildBasePayload).
 */
export function buildPlacementPayload(
  req: PlacementRequest,
  size: { width: number; height: number },
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    action: "sauna-placement",
    photo_url: req.photoUrl,
    marked_photo_url: req.markedPhotoUrl,
    tap_percent: tapPercentFor(req.tapPct),
    model_id: req.modelId,
    reference_photos: req.referencePhotos,
    dimensions_text: req.dimensionsText,
    complements: req.complements.map((c) =>
      c.choice !== undefined ? { id: c.id, choice: c.choice } : { id: c.id },
    ),
    width: size.width,
    height: size.height,
  };
  const base = buildBasePayload(req.base);
  if (base) body.base = base;
  return body;
}

/** Parse a generate response into the page's result shape. Pure. */
export function parsePlacementResponse(raw: unknown): PlacementResult {
  if (!raw || typeof raw !== "object") {
    throw new PlacementUnavailableError("The picture could not be made.");
  }
  const r = raw as Record<string, unknown>;
  const sauna =
    r.sauna && typeof r.sauna === "object"
      ? (r.sauna as Record<string, unknown>)
      : {};
  /* A cannot-render report is a complete, honest answer, not a
   * failure: it may carry no picture at all, and it must not throw. */
  const cannotRender = sauna.cannot_render === true;
  const storedUrl = asStringOrNull(r.image_url);
  const imageData = asString(r.image_data);
  const imageUrl = storedUrl ?? (imageData ? `data:image/jpeg;base64,${imageData}` : null);
  if (!imageUrl && !cannotRender) {
    throw new PlacementUnavailableError("The picture could not be made.");
  }
  return {
    imageUrl: imageUrl ?? "",
    meta: placementMetaFrom(
      sauna,
      cannotRender,
      asString(sauna.cannot_render_reason) || null,
    ),
  };
}

/** The result meta read from one sauna object (shared by the success
 * body and the refusal body, which carry the same meta shape). */
function placementMetaFrom(
  sauna: Record<string, unknown>,
  cannotRender: boolean,
  cannotRenderReason: string | null,
): PlacementMeta {
  const baseApplied =
    sauna.base_applied && typeof sauna.base_applied === "object"
      ? (sauna.base_applied as Record<string, unknown>)
      : null;
  const fidelity =
    sauna.fidelity && typeof sauna.fidelity === "object"
      ? (sauna.fidelity as Record<string, unknown>)
      : null;
  const officialDims = sauna.official_dimensions;
  return {
    footprintUsed: asString(sauna.footprint_used) || null,
    dimensionStatus: asString(sauna.dimension_status) || null,
    appliedVisualOptions: asStringList(sauna.applied_visual_options),
    excludedOptions: asStringList(sauna.excluded_options),
    warnings: asStringList(sauna.warnings),
    cannotRender,
    cannotRenderReason,
    modelForm: asString(sauna.model_form) || null,
    modelHeroPhoto: asStringOrNull(sauna.model_hero_photo),
    fidelityVerdict: fidelity ? asString(fidelity.verdict) || null : null,
    fidelitySeenForm: fidelity ? asString(fidelity.seen_form) || null : null,
    fidelitySeenFinish: fidelity
      ? asString(fidelity.seen_finish) || null
      : null,
    officialDimensions:
      asStringOrNull(officialDims) ??
      (officialDims && typeof officialDims === "object"
        ? asStringOrNull(
            (officialDims as Record<string, unknown>).assembled,
          )
        : null),
    heightFt: asPositiveNumber(sauna.height_ft),
    threeDUrl: asStringOrNull(sauna.three_d_url),
    baseApplied: baseApplied
      ? {
          surface: asString(baseApplied.surface) || "existing",
          paverCollection: asStringOrNull(baseApplied.paver_collection),
          lighting: baseApplied.lighting === true,
        }
      : null,
  };
}

/**
 * The v3 fidelity refusal (proven live 2026-11-19): when the generator
 * judges it cannot render the selected model faithfully, it answers
 * HTTP 422 with a plain refusal naming the model AND the full result
 * meta — no picture. That is the cannot-render answer in error
 * clothing: parse it into the same honest result so the page shows
 * its fidelity state (the model's own catalogue photo, another
 * choice) instead of a generic failure. Returns null when the body
 * is not that refusal.
 */
export function parseRefusalResponse(raw: unknown): PlacementResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!r.sauna || typeof r.sauna !== "object") return null;
  /* The machine-readable marker is the test: a body is a fidelity
   * verdict only when the sauna object carries cannot_render. An
   * error-only body (or one whose sauna object lacks the flag) is a
   * transient failure, never a refusal. */
  if ((r.sauna as Record<string, unknown>).cannot_render !== true) return null;
  const reason = asString(r.error);
  if (!reason) return null;
  return {
    imageUrl: "",
    meta: placementMetaFrom(
      r.sauna as Record<string, unknown>,
      true,
      reason,
    ),
  };
}

/* ------------------------------------------------------------------ */
/* Network (visual-agent + storage)                                    */
/* ------------------------------------------------------------------ */

type FetchImpl = typeof fetch;

function agentUrl(): string {
  return `${FUNCTIONS_BASE}/visual-agent`;
}

function agentHeaders(): Record<string, string> {
  const key = SUPABASE_ANON_KEY;
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
    "Content-Type": "application/json",
  };
}

/**
 * The user-facing message for a failed response. Only a 4xx carries
 * an authored message worth showing (a validation refusal in plain
 * words, e.g. "Unknown model"), and only when it is short and free of
 * anything address-shaped. A 5xx body is never shown: the live proof
 * of 2026-11-19 caught one carrying the provider's raw transport
 * error (its internal URL included) straight onto the customer's
 * screen. Server detail belongs in the function's logs, not here.
 */
async function serverError(res: Response): Promise<string> {
  if (res.status >= 400 && res.status < 500) {
    try {
      const body = (await res.json()) as Record<string, unknown>;
      const msg = asString(body?.error);
      if (msg && msg.length <= 200 && !msg.includes("://")) return msg;
    } catch {
      /* an unreadable error body decides nothing */
    }
  }
  return "The picture could not be made.";
}

/** Load the sauna pack (models + option groups) from the live contract. */
export async function fetchSaunaPack(
  fetchImpl: FetchImpl = fetch,
): Promise<SaunaPack> {
  let res: Response;
  try {
    res = await fetchImpl(agentUrl(), {
      method: "POST",
      headers: agentHeaders(),
      body: JSON.stringify({ action: "sauna-pack" }),
    });
  } catch {
    throw new PlacementUnavailableError("The sauna catalogue could not be loaded.");
  }
  if (!res.ok) {
    throw new PlacementUnavailableError(await serverError(res));
  }
  return parseSaunaPack(await res.json());
}

/** A fresh storage folder token for one placement session's uploads. */
export function placementUploadToken(): string {
  return mintScanToken();
}

/** How long a placement photo's signed URL stays loadable (seconds). */
export const PLACEMENT_URL_TTL_SECONDS = 3600;

/**
 * Upload one photo (clean or marked) to the app's live-shares bucket —
 * the same anonymous upload path the ScanPage uses — under
 * `sauna-placements/<token>/`, and return a SIGNED URL for it. The
 * bucket is not public readable, so a public URL would not load for the
 * generator (proven 2026-11-19, P1 report Problem #1); a signed URL
 * loads with no credentials and lives long enough for the generate call.
 */
export async function uploadPlacementPhoto(
  file: Blob,
  token: string,
  fileName: string,
): Promise<string> {
  const path = `sauna-placements/${token}/${fileName}`;
  const bucket = supabase.storage.from(SCAN_BUCKET);
  const up = await bucket.upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (up.error) {
    throw new PlacementUnavailableError("The photo could not be sent up.");
  }
  const signed = await bucket.createSignedUrl(
    path,
    PLACEMENT_URL_TTL_SECONDS,
  );
  const url = signed.data?.signedUrl;
  if (signed.error || !url) {
    throw new PlacementUnavailableError("The photo could not be sent up.");
  }
  return url;
}

/**
 * Ask Genius for the placement picture. Throws PlacementUnavailableError
 * (with the server's clean message when it sends one) on any failure —
 * the page lands in its never dead end fallback state.
 */
export async function generateSaunaPlacement(
  req: PlacementRequest,
  size: { width: number; height: number },
  fetchImpl: FetchImpl = fetch,
): Promise<PlacementResult> {
  let res: Response;
  try {
    res = await fetchImpl(agentUrl(), {
      method: "POST",
      headers: agentHeaders(),
      body: JSON.stringify(buildPlacementPayload(req, size)),
    });
  } catch {
    throw new PlacementUnavailableError("The picture could not be made.");
  }
  if (!res.ok) {
    /* A fidelity verdict is a complete answer, not a failure, on ANY
     * status: the refusal (422), the insufficient-references refusal
     * (422) and the unverifiable render (502) all carry
     * sauna.cannot_render in the body, and the parser keys on that
     * flag alone. A non-2xx body without it is a transient failure
     * (error only) and stays an error. */
    const refusal = parseRefusalResponse(
      await res.clone().json().catch(() => null),
    );
    if (refusal) return refusal;
    throw new PlacementUnavailableError(await serverError(res));
  }
  return parsePlacementResponse(await res.json());
}
