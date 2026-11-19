/**
 * Material logic for the Belgard 3D tab (founder, 2026-11-03): every
 * material texture carries its own physical response — how its surface
 * takes light — the companion to the depth logic (normalMaps.ts). The
 * logic lives ON the material, resolved from what the material actually
 * is (porcelain body, cast concrete, natural field stone, wood-look,
 * Plaza finish), never one generic response for everything.
 *
 * The visualizer resolves the logic where the material is known and
 * carries it on the texture's userData (same channel as the depth
 * layer); the cut builders in lib/visual/paverCut3d.ts apply it to the
 * face material. Materials with no resolved logic keep the historical
 * plain response (roughness 0.95, metalness 0).
 */
import * as THREE from "three";
import { PORCELAIN_BODY_SLUGS } from "./belgardUnitLibrary";

export interface BelgardMaterialLogic {
  /** Material family the response was derived from. */
  family: string;
  roughness: number;
  metalness: number;
  envMapIntensity: number;
  /** Runtime relief scale for the material's own normal map. */
  normalScale: number;
  /** Why this material responds this way — recorded with the logic. */
  rule: string;
}

/** The historical plain response, used when no logic is resolved.
 *  Depth relief is kept calm everywhere (founder, 2026-11-03): the
 *  depth map gives the surface its texture only — it must not cast a
 *  dark shading over the photo. Reflection behaviour (roughness,
 *  metalness, env response) is the material logic's job alone. */
export const PLAIN_MATERIAL_RESPONSE = {
  roughness: 0.95,
  metalness: 0,
  envMapIntensity: 1,
  normalScale: 0.5,
} as const;

/** Porcelain-bodied lines (catalog notes: Mirage porcelain families and
 *  the Aqualine porcelain line) — dense, glazed, soft sheen. The slug
 *  list itself lives in belgardUnitLibrary (PORCELAIN_BODY_SLUGS), one
 *  home shared with the filling logic; Travertini is a member there
 *  but keeps its own honed-stone branch below, checked first. */
const PORCELAIN = new Set(
  [...PORCELAIN_BODY_SLUGS].filter((s) => s !== "travertini"),
);

/** 3D Wall tab (founder order 2026-11-04, completed 2026-11-05): the
 *  wall models carry their OWN material logic, resolved from the face
 *  each system actually has — smooth-molded, split-face cast stone,
 *  natural veneer, architectural panel, honed coping. One home here,
 *  shared with the pavers; wall slugs never fall through to a paver
 *  family. */
const WALL_SMOOTH = new Set(["diamond-pro-air", "diamond-10ds"]);
const WALL_VENEER = new Set(["ashlar-tandem-wall", "lamina-tandem", "melville-tandem-wall"]);
const WALL_PANELS = new Set(["artforms", "papyrus-artforms"]);
const WALL_COPING = new Set(["modena-coping", "delmaro-coping"]);
const WALL_SPLIT_FACE = new Set([
  "ab-classic-collection", "ab-europa-collection", "ab-metropolitan",
  "belair-wall", "belair-wall-2-0", "brisa", "castlemanor-grana",
  "castlemanor-rustic", "coventry-wall-iii", "diamond-9d",
  "diamond-pro-9d", "diamond-10d", "easton-stone", "highland-stone",
  "melville-wall", "sienastone", "stackstone", "vanguard-wall",
]);

export function belgardMaterialLogic(
  productSlug: string,
  optionLabel?: string
): BelgardMaterialLogic {
  if (WALL_SMOOTH.has(productSlug)) {
    return {
      family: "smooth-cast-stone",
      roughness: 0.8,
      metalness: 0,
      envMapIntensity: 0.8,
      normalScale: 0.35,
      rule: "Smooth-molded wall face (Diamond Smooth line): even mineral surface, shallow relief, a little more sheen than split face.",
    };
  }
  if (productSlug === "diamond-pro-pin-system") {
    return {
      family: "smooth-cast-stone",
      roughness: 0.85,
      metalness: 0,
      envMapIntensity: 0.75,
      normalScale: 0.4,
      rule: "Diamond Pro Pin System: molded smooth-split face, satin mineral response.",
    };
  }
  if (WALL_PANELS.has(productSlug)) {
    return {
      family: "architectural-panel",
      roughness: 0.78,
      metalness: 0,
      envMapIntensity: 0.8,
      normalScale: 0.3,
      rule: "Architectural concrete panel: smooth formed face, fine relief only.",
    };
  }
  if (WALL_COPING.has(productSlug)) {
    return {
      family: "honed-coping",
      roughness: 0.82,
      metalness: 0,
      envMapIntensity: 0.75,
      normalScale: 0.35,
      rule: "Wall coping: honed stone cap, satin response, shallow relief.",
    };
  }
  if (WALL_VENEER.has(productSlug)) {
    return {
      family: "natural-veneer",
      roughness: 0.9,
      metalness: 0,
      envMapIntensity: 0.65,
      normalScale: 0.5,
      rule: "Tandem natural stone veneer: matte stone, full face relief.",
    };
  }
  if (WALL_SPLIT_FACE.has(productSlug)) {
    return {
      family: "split-face-cast-stone",
      roughness: 0.93,
      metalness: 0,
      envMapIntensity: 0.65,
      normalScale: 0.55,
      rule: "Split-face cast stone wall block: rugged matte mineral face, full relief.",
    };
  }
  if (PORCELAIN.has(productSlug)) {
    return {
      family: "porcelain",
      roughness: 0.42,
      metalness: 0.05,
      envMapIntensity: 1.15,
      normalScale: 0.35,
      rule: "Porcelain body: dense glazed face — smooth, soft sheen, shallow relief.",
    };
  }
  // Features tab (FL16, founder order 2026-11-05): the coping/step
  // units resolve here too — Unico 2.0 is a Mirage porcelain body;
  // Marina is a smooth bullnose cap; Grava is a slate-textured cap
  // with deeper relief than a honed cap.
  if (productSlug === "unico-2-0") {
    return {
      family: "porcelain",
      roughness: 0.42,
      metalness: 0.05,
      envMapIntensity: 1.15,
      normalScale: 0.35,
      rule: "Unico 2.0 porcelain coping: same dense glazed body as the Mirage paver lines it coordinates with.",
    };
  }
  if (productSlug === "melville-fire-pit") {
    return {
      family: "smooth-cast-stone",
      roughness: 0.8,
      metalness: 0,
      envMapIntensity: 0.8,
      normalScale: 0.35,
      rule: "Melville wedge: smooth-faced cast stone, even mineral surface, a little more sheen than split face.",
    };
  }
  if (productSlug === "marina") {
    return {
      family: "honed-coping",
      roughness: 0.82,
      metalness: 0,
      envMapIntensity: 0.75,
      normalScale: 0.35,
      rule: "Marina Coping: smooth bullnose concrete cap, satin response, shallow relief.",
    };
  }
  if (productSlug === "grava") {
    return {
      family: "honed-coping",
      roughness: 0.85,
      metalness: 0,
      envMapIntensity: 0.7,
      normalScale: 0.5,
      rule: "Grava Coping: slate-textured concrete cap — satin response with the slate's full surface relief.",
    };
  }
  if (productSlug === "travertini") {
    return {
      family: "porcelain-stone",
      roughness: 0.58,
      metalness: 0.02,
      envMapIntensity: 0.9,
      normalScale: 0.45,
      rule: "Travertine-look porcelain: honed-stone response over a porcelain body.",
    };
  }
  if (productSlug === "belgian-cobble" || productSlug === "mega-arbel" || productSlug === "belgian-cobble-block-cut" || productSlug === "mega-arbel-block-cut") {
    return {
      family: "natural-field-stone",
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.6,
      normalScale: 0.55,
      rule: "Irregular natural stone field: fully matte, full relief.",
    };
  }
  if (productSlug === "wood-tiles") {
    return {
      family: "wood-look",
      roughness: 0.8,
      metalness: 0,
      envMapIntensity: 0.7,
      normalScale: 0.45,
      rule: "Wood-look plank: satin-matte grain.",
    };
  }
  if (productSlug === "classic-plaza-slab") {
    const opt = (optionLabel ?? "").toLowerCase();
    if (opt.includes("diamond")) {
      return {
        family: "plaza-finish",
        roughness: 0.78,
        metalness: 0,
        envMapIntensity: 0.8,
        normalScale: 0.5,
        rule: "Classic Plaza, Diamond finish: the embossed scallop faces catch angled light.",
      };
    }
    if (opt.includes("shot blast")) {
      return {
        family: "plaza-finish",
        roughness: 0.88,
        metalness: 0,
        envMapIntensity: 0.7,
        normalScale: 0.5,
        rule: "Classic Plaza, Shot Blast finish: fine exposed-aggregate matte.",
      };
    }
    return {
      family: "plaza-finish",
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.65,
      normalScale: 0.5,
      rule: "Classic Plaza, Matte finish: flat mineral matte.",
    };
  }
  return {
    family: "concrete-paver",
    roughness: 0.93,
    metalness: 0,
    envMapIntensity: 0.7,
    normalScale: 0.5,
    rule: "Cast concrete paver: matte mineral surface, full joint relief.",
  };
}

/**
 * Corner radius of the REAL unit, in inches (founder, 2026-11-05 —
 * Job 2 amendment): black corners in a render meant the block's shape
 * is not a sharp rectangle — real cast units have eased, rounded
 * corners, rough field stone more so. The geometry carries the radius
 * (wallBlock3d builds a rounded prism); the face texture is the flat
 * face, cut tight inside its joint, so no dark corner is ever painted
 * into a texture. Part of the material logic: it is a property of how
 * the unit is made, resolved per model family like the light response.
 */
export function belgardCornerRadiusIn(productSlug: string): number {
  if (productSlug === "vanguard-wall") return 0.05; // molded frame, near-square corners
  const { family } = belgardMaterialLogic(productSlug);
  switch (family) {
    case "split-face-cast-stone": return 0.22;
    case "natural-field-stone": return 0.25;
    case "natural-veneer": return 0.15;
    case "smooth-cast-stone": return 0.1;
    /* 0.12 (was 0.04): at 0.04 the fastened panels of the
     * Artforms systems butted into one seamless slab — no
     * joint line read at all in the founder's iPhone shots
     * (2026-11-15, defect: flat-slab bodies). Real fastened
     * panels sit with an eased edge and a shadow reveal;
     * 0.12 opens that reveal while staying square-cut. */
    case "architectural-panel": return 0.12;
    case "honed-coping": return 0.08;
    default: return 0.15;
  }
}

/**
 * Resolve the logic from a texture URL alone (the unit texture loader
 * knows only the URL): /textures/belgard-units/<product>--<option>/… and
 * /textures/belgard/<product>--<option>.webp both carry the product
 * slug before the "--" and the option words after it.
 */
export function belgardMaterialLogicForUrl(
  url: string
): BelgardMaterialLogic | undefined {
  const m = url.match(/\/textures\/(?:belgard-units|belgard|belgard-features)\/([^/]+)/);
  if (!m) {
    // 3D Wall tab: /app/wall-blocks/<model-slug>/<face>.jpg — wall
    // models resolve by slug alone into the wall branches above.
    const w = url.match(/\/wall-blocks\/([^/]+)\//);
    if (w) return belgardMaterialLogic(w[1]);
    return undefined;
  }
  const [productSlug, ...optionParts] = m[1].replace(/\.(webp|jpe?g|png)$/i, "").split("--");
  if (!productSlug) return undefined;
  return belgardMaterialLogic(productSlug, optionParts.join(" "));
}

/** Apply a resolved logic to a face material (depth layer included). */
export function applyBelgardMaterialLogic(
  mat: THREE.MeshStandardMaterial,
  logic?: BelgardMaterialLogic
): void {
  const l = logic ?? PLAIN_MATERIAL_RESPONSE;
  mat.roughness = l.roughness;
  mat.metalness = l.metalness;
  mat.envMapIntensity = l.envMapIntensity;
  if (mat.normalMap) mat.normalScale.setScalar(l.normalScale);
}
