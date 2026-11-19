/**
 * Filling logic for the Belgard 3D tab (founder, 2026-11-03): the joint
 * filler — the material that sits IN the gaps between pavers and
 * porcelain tiles. First home is this tab, the testing room, before it
 * goes anywhere else.
 *
 * The no-collision rule is geometric, not cosmetic: a deck's tiles are
 * drawn smaller than their layout cells by exactly the product's joint
 * width, and the filler is ONE surface underneath the whole deck whose
 * top sits recessed below the tile tops. The tiles cover it everywhere
 * except the joint network, so the filler can only ever be visible
 * inside the joints — it cannot overlap a tile face by construction.
 *
 * Joint width varies by product (porcelain is laid on spacers, standard
 * pavers tight, permeable grids wide), and every filler declares the
 * joint range it suits: fine fillers for tight joints, coarse stone for
 * wide ones. A filler outside a product's joint range is shown marked
 * in the picker, never silently applied.
 */
import * as THREE from "three";
import { PORCELAIN_BODY_SLUGS } from "./belgardUnitLibrary";

export interface JointFiller {
  id: string;
  /** The name the founder picks by — shown verbatim in the picker. */
  name: string;
  kind: "open" | "sand" | "polymeric" | "grout" | "stone" | "coping";
  /** Joint widths this filler suits, inches. */
  minIn: number;
  maxIn: number;
  /** World inches one texture tile of the filler's grain covers. */
  spanIn: number;
  /** How far below the tile top the fill surface sits, inches. */
  recessIn: number;
  base: string;
  tones: string[];
  grain: "plain" | "speckle" | "pebbles" | "mottled";
  rule: string;
}

export const JOINT_FILLERS: JointFiller[] = [
  {
    id: "open",
    name: "Open joint — no fill",
    kind: "open",
    minIn: 0,
    maxIn: 99,
    spanIn: 0,
    recessIn: 0,
    base: "#4a423a",
    tones: [],
    grain: "plain",
    rule: "Unfilled joints: the shadow gap, as the deck was first shown.",
  },
  {
    id: "jointing-sand",
    name: "Jointing Sand",
    kind: "sand",
    minIn: 1 / 16,
    maxIn: 1 / 4,
    spanIn: 6,
    recessIn: 0.09,
    base: "#b49b72",
    tones: ["#c8ae84", "#9d8259", "#d3bd97", "#8a6f47"],
    grain: "speckle",
    rule: "Plain kiln-dried sand swept into tight paver joints.",
  },
  {
    id: "polymeric-sand",
    name: "Polymeric Sand",
    kind: "polymeric",
    minIn: 1 / 16,
    maxIn: 1 / 2,
    spanIn: 6,
    recessIn: 0.09,
    base: "#9a8f7c",
    tones: ["#ada18d", "#877d68", "#bab09c", "#77694f"],
    grain: "speckle",
    rule: "Sand with polymer binder: locks in place, the standard paver joint fill up to 1/2 in.",
  },
  {
    id: "porcelain-grout",
    name: "Porcelain Grout — resin joint compound",
    kind: "grout",
    minIn: 1 / 16,
    maxIn: 3 / 8,
    spanIn: 8,
    recessIn: 0.03,
    base: "#8d8d89",
    tones: ["#97978f", "#82827c", "#a3a39b"],
    grain: "mottled",
    rule: "Fine resin grout for porcelain: sits nearly flush in tight spacer joints.",
  },
  {
    id: "crushed-fine",
    name: "Crushed Stone — 1/4 in chip",
    kind: "stone",
    minIn: 1 / 4,
    maxIn: 5 / 8,
    spanIn: 9,
    recessIn: 0.1,
    base: "#6f6a61",
    tones: ["#8a8478", "#7c766a", "#97907f", "#5d594f", "#a39a87"],
    grain: "pebbles",
    rule: "Fine angular chip for wide paver joints and permeable work.",
  },
  {
    id: "crushed-coarse",
    name: "Crushed Stone — 3/8 in chip",
    kind: "stone",
    minIn: 3 / 8,
    maxIn: 1,
    spanIn: 12,
    recessIn: 0.1,
    base: "#67625a",
    tones: ["#837d70", "#746e61", "#90897a", "#575349", "#9b9484"],
    grain: "pebbles",
    rule: "Coarse chip: only the widest joints take it without bridging.",
  },
  {
    id: "coping",
    name: "Coping",
    kind: "coping",
    minIn: 1 / 8,
    maxIn: 1 / 2,
    spanIn: 10,
    recessIn: 0.05,
    base: "#b6b0a2",
    tones: ["#c2bcb0", "#aaa393", "#beb8ab"],
    grain: "mottled",
    rule: "The smooth stone-toned joint fill the founder names Coping.",
  },
];

export const fillerById = (id: string): JointFiller =>
  JOINT_FILLERS.find((f) => f.id === id) ?? JOINT_FILLERS[0];

/**
 * The joint width a product is laid with, inches: porcelain on spacers
 * (3/16), large slabs a touch wider (1/4), permeable grid pavers wide
 * (1/2), standard pavers the classic 1/8 sand joint. The porcelain
 * list itself lives in belgardUnitLibrary (PORCELAIN_BODY_SLUGS) —
 * one home, shared with the material logic.
 */
/** Merged Floor & Decor vinyl products (F&D merge, 2026-11-16):
 * click-lock planks butt tight — the visible joint is the
 * micro-bevel groove, 0.06 in, the F&D visualizer's own bevel
 * read. Slugs join this set as their products merge, in the
 * Part E census order. */
const FD_VINYL_JOINT_SLUGS = new Set([
  "bellflower-blonde",
  "alamo-oak",
  "winter-peak",
  "piedmont-bend",
  "highguard-silver",
  "stormy-elm",
  "lorraine-sienna",
  "paisley-cape",
  "farro-oak",
  "raven",
  "timber-saddle",
  "pelham-peak",
  "trenton-tradition",
  "bolton-ridge",
  "stallion-springs",
  "stonecastle",
  "rocky-road",
  "boardwalk-oak",
  "ansleigh-cottage",
  "clam-shell",
  "manchester-cove",
  "lincoln-trail",
  "timberwolf-trail",
  "auburn-glen",
  "amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad",
]);

export function jointWidthInFor(productSlug: string): number {
  if (FD_VINYL_JOINT_SLUGS.has(productSlug)) return 0.06;
  if (PORCELAIN_BODY_SLUGS.has(productSlug)) return 3 / 16;
  if (productSlug === "classic-plaza-slab") return 1 / 4;
  if (productSlug === "turfstone") return 1 / 2;
  // Block-cut (v2) amorphous fields are laid stone-to-stone at field
  // joints, not the 1/8 sand joint of the rectangular pavers: cobble
  // at 3/8, the big flagstone pieces at 1/2 — the widths the deck
  // layout actually packs to, so the picker recommends a filler that
  // suits the real joint.
  if (productSlug === "belgian-cobble-block-cut") return 3 / 8;
  if (productSlug === "mega-arbel-block-cut") return 1 / 2;
  return 1 / 8;
}

export function fillerSuitability(
  filler: JointFiller,
  jointIn: number
): { ok: boolean; reason?: string } {
  if (jointIn < filler.minIn) {
    return {
      ok: false,
      reason: `too coarse for ${formatJointIn(jointIn)} joints`,
    };
  }
  if (jointIn > filler.maxIn) {
    return {
      ok: false,
      reason: `${formatJointIn(jointIn)} joints are too wide for it`,
    };
  }
  return { ok: true };
}

/** The filler's own recommendation for a product, before any override. */
export function recommendedFiller(
  productSlug: string,
  jointIn: number
): JointFiller {
  if (PORCELAIN_BODY_SLUGS.has(productSlug)) return fillerById("porcelain-grout");
  if (jointIn >= 3 / 8) return fillerById("crushed-fine");
  return fillerById("polymeric-sand");
}

/** 0.1875 → 3/16″ · 0.125 → 1/8″ · 0.5 → 1/2″ */
export function formatJointIn(inches: number): string {
  const sixteenths = Math.round(inches * 16);
  const whole = Math.floor(sixteenths / 16);
  let rem = sixteenths % 16;
  if (rem === 0) return `${whole}″`;
  let den = 16;
  while (rem % 2 === 0) {
    rem /= 2;
    den /= 2;
  }
  return whole > 0 ? `${whole} ${rem}/${den}″` : `${rem}/${den}″`;
}

// ---------- the filler surface ----------

function hashCode(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Paint a filler's grain onto a 2D canvas of sizePx² — the
 * one painter behind both the 3D grain texture (below) and
 * the 2D module canvas (belgardDeck2d), so a joint reads the
 * same on every surface. The canvas spans the filler's
 * spanIn inches of real surface.
 */
export function paintFillerGrain(
  filler: JointFiller,
  sizePx: number,
): HTMLCanvasElement {
  const S = sizePx;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const rng = mulberry32(hashCode(filler.id));
  ctx.fillStyle = filler.base;
  ctx.fillRect(0, 0, S, S);
  if (filler.grain === "speckle") {
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle =
        filler.tones[Math.floor(rng() * filler.tones.length)];
      ctx.globalAlpha = 0.35 + rng() * 0.5;
      const r = rng() < 0.92 ? 1 : 2;
      ctx.fillRect(rng() * S, rng() * S, r, r);
    }
  } else if (filler.grain === "pebbles") {
    // Angular chips at true scale: the canvas spans spanIn inches, so a
    // chip of the filler's size is spanIn-relative pixels wide.
    const chipPx = (filler.id === "crushed-coarse" ? 0.375 : 0.25) / filler.spanIn * S;
    for (let i = 0; i < 260; i++) {
      const cx = rng() * S;
      const cy = rng() * S;
      const r = chipPx * (0.6 + rng() * 0.7);
      ctx.fillStyle =
        filler.tones[Math.floor(rng() * filler.tones.length)];
      ctx.globalAlpha = 0.85 + rng() * 0.15;
      ctx.beginPath();
      const n = 5 + Math.floor(rng() * 3);
      for (let k = 0; k < n; k++) {
        const ang = (k / n) * Math.PI * 2 + rng() * 0.5;
        const rr = r * (0.7 + rng() * 0.5);
        const x = cx + Math.cos(ang) * rr;
        const y = cy + Math.sin(ang) * rr;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }
  } else if (filler.grain === "mottled") {
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle =
        filler.tones[Math.floor(rng() * filler.tones.length)];
      ctx.globalAlpha = 0.05 + rng() * 0.08;
      ctx.beginPath();
      ctx.ellipse(
        rng() * S,
        rng() * S,
        12 + rng() * 42,
        8 + rng() * 30,
        rng() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  return canvas;
}

const grainTextureCache = new Map<string, THREE.Texture>();
function grainTexture(filler: JointFiller): THREE.Texture {
  let tex = grainTextureCache.get(filler.id);
  if (tex) return tex;
  tex = new THREE.CanvasTexture(paintFillerGrain(filler, 256));
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  grainTextureCache.set(filler.id, tex);
  return tex;
}

/**
 * The filler surface for a deck of widthIn × depthIn whose tile tops sit
 * at tileTopY: one plane under the whole deck, its top recessed below
 * the tile tops by the filler's own recess — visible only in the joints,
 * which is the whole of the no-collision guarantee. The open joint keeps
 * the original shadow-gap plane at the deck's base.
 */
export function jointFillMesh(
  filler: JointFiller,
  widthIn: number,
  depthIn: number,
  tileTopY: number
): THREE.Mesh {
  if (filler.kind === "open") {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(widthIn, depthIn),
      new THREE.MeshStandardMaterial({
        color: 0x4a423a,
        roughness: 1,
        // The recess below the tile tops is sub-millimetre
        // at scene scale: without a depth offset the filler
        // z-fights the blocks at distance (gray patches
        // when zoomed out, founder 2026-11-05).
        polygonOffset: true,
        polygonOffsetFactor: 2,
        polygonOffsetUnits: 2,
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = -0.005;
    m.receiveShadow = true;
    return m;
  }
  const tex = grainTexture(filler).clone();
  tex.needsUpdate = true;
  tex.repeat.set(widthIn / filler.spanIn, depthIn / filler.spanIn);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(widthIn, depthIn),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 1,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: 2,
      polygonOffsetUnits: 2,
    })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = tileTopY - filler.recessIn;
  m.receiveShadow = true;
  return m;
}

/**
 * The filler surface for a deck REGION (studio decks: any
 * shape the net engine returns), in the caller's world
 * units: `ringsXZ` are the region's polygons (outer ring
 * first, then holes), `inchesPerUnit` converts them to the
 * inches the grain span is recorded in (12 for the board
 * channel's feet, 1 for the tab's inches). One surface per
 * polygon, tops recessed below the tile tops by the filler's
 * own recess — the same no-collision construction as
 * jointFillMesh, over the region instead of a rectangle.
 * The open joint keeps the shadow-gap surface at the base.
 * (ShapeGeometry generates UVs equal to the shape's XY
 * coordinates, so the grain repeat below is in world units —
 * stated so the next reader does not "fix" it.)
 */
export function jointFillSurface(
  filler: JointFiller,
  ringsXZ: Array<Array<Array<{ x: number; z: number }>>>,
  tileTop: number,
  inchesPerUnit: number,
): THREE.Group {
  const group = new THREE.Group();
  const y =
    filler.kind === "open"
      ? tileTop - 0.005 / inchesPerUnit
      : tileTop - filler.recessIn / inchesPerUnit;
  for (const poly of ringsXZ) {
    if (!poly || poly.length === 0 || poly[0].length < 3) continue;
    const shape = new THREE.Shape();
    poly[0].forEach((p, i) =>
      i === 0 ? shape.moveTo(p.x, -p.z) : shape.lineTo(p.x, -p.z),
    );
    shape.closePath();
    for (const holeRing of poly.slice(1)) {
      if (holeRing.length < 3) continue;
      const hole = new THREE.Path();
      holeRing.forEach((p, i) =>
        i === 0 ? hole.moveTo(p.x, -p.z) : hole.lineTo(p.x, -p.z),
      );
      hole.closePath();
      shape.holes.push(hole);
    }
    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    let mat: THREE.MeshStandardMaterial;
    // Depth offset on every filler material: the recess is
    // 0.03–0.1 in below the block tops, far under the depth
    // buffer's precision at studio zoom distances — without
    // it the surface z-fights the blocks into gray patches
    // (founder report 2026-11-05). The geometric recess
    // still governs the close-up look.
    if (filler.kind === "open") {
      mat = new THREE.MeshStandardMaterial({
        color: 0x4a423a,
        roughness: 1,
        polygonOffset: true,
        polygonOffsetFactor: 2,
        polygonOffsetUnits: 2,
      });
    } else {
      const tex = grainTexture(filler).clone();
      tex.needsUpdate = true;
      // World-registered grain: the shape's UVs are its own
      // XY (our XZ) coordinates, so repeat is per-unit.
      tex.repeat.set(
        inchesPerUnit / filler.spanIn,
        inchesPerUnit / filler.spanIn,
      );
      mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 1,
        metalness: 0,
        polygonOffset: true,
        polygonOffsetFactor: 2,
        polygonOffsetUnits: 2,
      });
    }
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = y;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return group;
}

/** The filler a deck actually gets: an explicit stored id,
 *  else the product's recommended filler (the picker's
 *  "Auto"). Stored ids are JOINT_FILLERS ids or undefined. */
export function effectiveFillerId(
  productSlug: string,
  fillerId?: string,
): string {
  if (fillerId && JOINT_FILLERS.some((f) => f.id === fillerId))
    return fillerId;
  return recommendedFiller(productSlug, jointWidthInFor(productSlug)).id;
}
