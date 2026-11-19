import * as THREE from 'three';
import {
  applyBelgardMaterialLogic,
  type BelgardMaterialLogic,
} from './belgardMaterialLogic';

/**
 * Paver size cuts for Design Studio 3D.
 * One paver cut = one simple BoxGeometry at its exact catalog face
 * dimensions and thickness (inches, 1 unit = 1 inch), origin at floor
 * centre so cuts can be laid into pattern modules directly.
 * Sizes come from src/data/belgardPatterns.ts (sizesUsed).
 * Descriptions are short forms of the Belgard Products folder data
 * (src/data/belgardProductsFolder.ts) — never invented copy.
 * Each cut also has a workspace file in
 * ~/workspace/Belgard Products/3D Paver Files/ (see `fileName`) and is
 * rendered on /belgard-products under the "3D paver files" tab.
 */
export interface PaverCutSpec {
  /** URL/anchor slug, e.g. "catalina-grana-brick" */
  slug: string;
  name: string;
  /** Catalog size label, e.g. "8 x 12 x 1 3/16" */
  size: string;
  w: number; // face width, inches
  d: number; // face depth, inches
  t: number; // thickness, inches
  color: number;
  /** Slug of this cut's texture group in src/data/belgardTextures3d.ts */
  textureProductSlug: string;
  /** Unit silhouette (Job G11). Absent = rectangular prism (the original
   *  behaviour for every existing spec). "hexagon" = a regular hexagonal
   *  prism whose across-corners measure is `w` (so its side is w / 2),
   *  built by buildHexPaverCut. Only the Hexagon Series spec carries it.
   *  "silhouette" (Job 3, 2026-11-06) = the stone's own traced outline,
   *  carried in `outline`, built by buildSilhouettePaverCut — the block-cut
   *  (v2) Belgian Cobble / Mega-Arbel sets; never a parallelepiped. */
  shape?: 'hexagon' | 'silhouette';
  /** Traced stone outline for shape "silhouette": [x, y] points normalized
   *  0..1 over the stone texture's own frame, y DOWN as in the image
   *  (src/data/belgardStoneOutlines.ts). */
  outline?: [number, number][];
  /** Short description, sourced from the Belgard Products folder data.
   *  Optional (Job U3b): synthetic per-unit visualizer specs carry no
   *  folder description — no copy is invented for them. */
  description?: string;
  /** Workspace markdown file in "Belgard Products/3D Paver Files/".
   *  Optional (Job U3b): synthetic per-unit specs have no workspace file. */
  fileName?: string;
}

const CATALINA_GRANA_DESC =
  'Catalina Grana® pavers feature a textured surface and rich color blends, bringing timeless style and lasting durability to patios, pool decks and walkways. The Grana finish is the textured, granite-like face in the Catalina family.';

export const PAVER_CUT_SPECS: PaverCutSpec[] = [
  {
    slug: 'catalina-grana-brick',
    name: 'Catalina Grana — Brick',
    size: '4 x 8 x 1 3/16',
    w: 4, d: 8, t: 1.1875, color: 0xb08968,
    textureProductSlug: 'catalina-grana',
    description: CATALINA_GRANA_DESC,
    fileName: 'Catalina Grana - Brick.md',
  },
  {
    slug: 'appian-stone-square',
    name: 'Appian Stone — Square',
    size: '6 x 6 x 1 3/16',
    w: 6, d: 6, t: 1.1875, color: 0x9c6644,
    textureProductSlug: 'appian-stone',
    description:
      'Inspired by Europe’s Appian Way, Appian-Stone® pavers bring an old-world feel to patios and driveways with added strength for pedestrian and vehicular use. In Florida it is a Coastal-made concrete paver offered in tile (30mm overlay) and full-depth formats.',
    fileName: 'Appian Stone - Square.md',
  },
  {
    slug: 'catalina-grana-rectangle',
    name: 'Catalina Grana — Rectangle',
    size: '8 x 12 x 1 3/16',
    w: 8, d: 12, t: 1.1875, color: 0x7f5539,
    textureProductSlug: 'catalina-grana',
    description: CATALINA_GRANA_DESC,
    fileName: 'Catalina Grana - Rectangle.md',
  },
  {
    slug: 'melville-plank',
    name: 'Melville — Plank',
    size: '5 x 19 11/16 x 2 3/8',
    w: 5, d: 19.6875, t: 2.375, color: 0x6c5849,
    textureProductSlug: 'melville-plank',
    description:
      'Plank-format concrete paver in the Melville family, in three lengths for linear, contemporary patterns that coordinate with Melville Wall and Melville coping. Florida lists only the 5-inch width; the wider 7½-inch plank in national sources is not in the Florida documents.',
    fileName: 'Melville - Plank.md',
  },
  {
    slug: 'turfstone-large-slab',
    name: 'Turfstone — Large Slab',
    size: '15 3/4 x 23 5/8 x 3 1/8',
    w: 15.75, d: 23.625, t: 3.125, color: 0x8a8d8f,
    textureProductSlug: 'turfstone',
    description:
      'Permeable paver. The Belgard Products folder carries no prose description for Turfstone — its product files record a description compiled from the region’s 2026 catalog/cutsheets (see Region evidence in the product file); no copy is invented here.',
    fileName: 'Turfstone - Large Slab.md',
  },
];

/**
 * Build one paver cut. Without a texture it renders in the spec's plain
 * color (original behaviour). With a texture, the texture becomes the
 * material map on every face and the base color goes white so the
 * texture shows true; the caller owns cloning/repeat setup.
 */
export function buildPaverCut(spec: PaverCutSpec, texture?: THREE.Texture | null): THREE.Group {
  const geo = new THREE.BoxGeometry(spec.w, spec.t, spec.d);
  // Depth layer: the caller registers the texture's own normal map on
  // userData (see lib/visual/normalMaps.ts); plain cuts stay untouched.
  const normalMap = (texture?.userData?.normalMap as THREE.Texture | undefined) ?? undefined;
  const mat = texture
    ? new THREE.MeshStandardMaterial({ map: texture, ...(normalMap ? { normalMap } : {}), roughness: 0.95, metalness: 0 })
    : new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.95, metalness: 0 });
  // Material logic: the material's own physical response, carried on the
  // texture's userData by the visualizer (lib/visual/belgardMaterialLogic.ts).
  if (texture) {
    applyBelgardMaterialLogic(
      mat,
      texture.userData?.materialLogic as BelgardMaterialLogic | undefined
    );
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = spec.t / 2;
  mesh.castShadow = true;
  // No drawn border lines on any geometry (founder, 2026-11-03): piece
  // boundaries read from the real joint gaps and the materials alone —
  // absolute realism, nothing outlined.
  const group = new THREE.Group();
  group.add(mesh);
  return group;
}

/**
 * D14 side law (founder's one-casting rule, ratified for decks
 * 2026-11-10 — the same rule D5 shipped for wall blocks): a
 * piece's sides are REAL CROPS of the piece's own face at each
 * side's true aspect — cropped, never stretched, no plain
 * mean-colour sides, the normal map riding the same UVs so it
 * stays in register.
 *
 * Hexagonal prism sides: CylinderGeometry's own side UVs wrap
 * the face's full width once around a perimeter of six sides
 * (a 3:1 stretch for the w-wide face). This remap is computed
 * from POSITIONS, so it holds whatever three's UV convention
 * does: each side (length w/2) samples the face's centre half
 * at face scale (u 0.25–0.75 across the side's length), and
 * the side's height (the thickness t) samples a strip t tall
 * at face scale down from the face's top edge (v from 1 − t/w
 * to 1). `faceW` and the geometry must be in the SAME units
 * (inches in this file, feet in the deck builder) — the
 * ratios are what matter. Cap vertices (normal ±y) and the
 * caps' centre vertices are never touched.
 */
export function applyHexSideFaceUVs(
  geo: THREE.BufferGeometry,
  faceW: number,
): void {
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = geo.attributes.uv;
  if (!pos || !nor || !uv || faceW <= 0) return;
  // The prism's height from its own positions (centred on 0).
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    yMin = Math.min(yMin, pos.getY(i));
    yMax = Math.max(yMax, pos.getY(i));
  }
  const height = yMax - yMin;
  if (!(height > 0)) return;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(nor.getY(i)) > 0.5) continue; // a cap vertex
    const x = pos.getX(i);
    const z = pos.getZ(i);
    if (x === 0 && z === 0) continue;
    // Vertices point along ±x (the builders rotate the
    // cylinder), so side k spans angles [k·60° − 30°, k·60° +
    // 30°); the fraction across the side is exact at the
    // shared rim vertices of both neighbours by symmetry.
    let ang = Math.atan2(z, x);
    if (ang < 0) ang += Math.PI * 2;
    const seg = (ang + Math.PI / 6) / (Math.PI / 3);
    const frac = seg - Math.floor(seg);
    const depthFromTop = yMax - pos.getY(i);
    uv.setXY(i, 0.25 + 0.5 * frac, 1 - depthFromTop / faceW);
  }
  uv.needsUpdate = true;
}

/**
 * Build one hexagonal-prism cut (Job G11, Hexagon Series). The unit is a
 * regular hexagon: `spec.w` is the printed across measure (the pattern
 * data's bounding measure — Hexagon 6 prints 12 x 12 in BEL25 p.44), so
 * the circumradius is w / 2 and the side is w / 2 (BELCOMM26 p.4 prints
 * the Hexagon side as 6 in for the 12 in unit). Vertices point along ±x;
 * flat faces face ±z. `faceGapIn` shrinks the apothem so neighbouring
 * units in a honeycomb deck keep that face-to-face joint gap (deck use);
 * single pieces pass 0.
 *
 * Materials (D14, 2026-11-10 — supersedes the task's original
 * plain-side rule quoted in git history): the TOP face carries
 * the texture (flat top material, planar cap UVs) and the
 * sides carry a real crop of the same face at their true
 * aspect (applyHexSideFaceUVs), the bottom reuses the side
 * material (it seats on the bedding and is never seen). With
 * no texture the sides stay the spec's plain color.
 * Material order matches CylinderGeometry's groups: [side, top, bottom].
 * Same group shape as buildPaverCut (textured mesh first, edges second),
 * so paverCutMesh / disposeGroup keep working unchanged.
 */
export function buildHexPaverCut(
  spec: PaverCutSpec,
  texture?: THREE.Texture | null,
  faceGapIn = 0
): THREE.Group {
  const radius = Math.max(0.1, spec.w / 2 - faceGapIn / Math.sqrt(3));
  const geo = new THREE.CylinderGeometry(radius, radius, spec.t, 6, 1);
  // CylinderGeometry's first vertex sits at +z; rotate so vertices point
  // along ±x and the across-corners measure runs along x.
  geo.rotateY(Math.PI / 2);
  // Texture registration (checked 2026-11-06, job2/remake): the cap's
  // UVs sample the photograph so the photo's hexagon lands on the
  // prism outline WITHOUT any extra rotation — a full cap-render
  // simulation (job2/remake/hex-rho-compare.jpg) shows the un-rotated
  // face as clean uniform stone, while a ±90° texture rotation slashes
  // grout lines across the corners. Do NOT rotate here. The two
  // earlier causes of "wrong angle / black corners" are fixed
  // elsewhere: (1) assignUnitTexture returns rotation 0 for
  // hexagon-series (a random quarter turn is a 30° misalignment on a
  // hexagon), and (2) the shipped faces are the 576x576 generation
  // whose hexagon fits the cap's UV circle (the old 870x762 faces
  // overflowed it and sampled neighbours' grout at the corners).
  applyHexSideFaceUVs(geo, spec.w);
  const sideNormal = (texture?.userData?.normalMap as THREE.Texture | undefined) ?? undefined;
  const side = texture
    ? new THREE.MeshStandardMaterial({ map: texture, ...(sideNormal ? { normalMap: sideNormal } : {}), roughness: 0.95, metalness: 0 })
    : new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: 0.95,
        metalness: 0,
      });
  if (texture) {
    applyBelgardMaterialLogic(
      side,
      texture.userData?.materialLogic as BelgardMaterialLogic | undefined
    );
  }
  const topNormal = (texture?.userData?.normalMap as THREE.Texture | undefined) ?? undefined;
  const top = texture
    ? new THREE.MeshStandardMaterial({ map: texture, ...(topNormal ? { normalMap: topNormal } : {}), roughness: 0.95, metalness: 0 })
    : new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.95, metalness: 0 });
  if (texture) {
    applyBelgardMaterialLogic(
      top,
      texture.userData?.materialLogic as BelgardMaterialLogic | undefined
    );
  }
  const mesh = new THREE.Mesh(geo, [side, top, side]);
  mesh.position.y = spec.t / 2;
  mesh.castShadow = true;
  // No drawn border lines (founder, 2026-11-03) — see buildPaverCut.
  const group = new THREE.Group();
  group.add(mesh);
  return group;
}

/**
 * Build one silhouette cut (Job 3, 2026-11-06): a prism extruded from the
 * stone's OWN traced outline — the block-cut (v2) Belgian Cobble and
 * Mega-Arbel stones. The founder ruled the v2 blocks broken as plain
 * parallelepiped boxes; each stone now stands in its real shape.
 *
 * The outline points are normalized 0..1 over the stone texture's frame
 * (y down, as in the image); the shape is built in inches at the stone's
 * own w × d, extruded to the set thickness, and laid flat (base at y=0,
 * matching buildPaverCut's group convention). Cap UVs are planar over
 * the stone's bounding box, so the RGBA texture lands on the cap exactly
 * as cut — the transparent surround of the file falls outside the
 * outline and is never sampled. Materials (D14, 2026-11-10):
 * caps carry the texture; the side walls carry a real crop of
 * the same face — each side vertex samples the face point as
 * far INSIDE the outline as the vertex sits below the top
 * surface, so the face reads as wrapping over the edge and
 * down the side at true scale, cropped never stretched, the
 * normal map in register on the same UVs. ExtrudeGeometry groups:
 * 0 = caps (top + bottom), 1 = side walls.
 */
export function buildSilhouettePaverCut(
  spec: PaverCutSpec,
  texture?: THREE.Texture | null
): THREE.Group {
  const pts = spec.outline ?? [];
  const shape = new THREE.Shape();
  pts.forEach(([px, py], i) => {
    const x = (px - 0.5) * spec.w;
    const y = (0.5 - py) * spec.d;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: spec.t,
    bevelEnabled: false,
  });
  // Shape XY + extrusion Z -> world: X across, Y up (0..t), Z = -shapeY.
  geo.rotateX(-Math.PI / 2);
  // Planar cap UVs from world positions: u over w, v over d (image top
  // py=0 sits at shapeY +d/2 -> world z -d/2 -> v = 0.5 - z/d = 1 at the
  // image's top edge under three's v-up texture convention... the stone
  // files were cut top-down from the field photo, and the cap samples
  // u = x/w + 0.5, v = 0.5 - z/d, which reproduces the file exactly.
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  // Side-wall vertex range (ExtrudeGeometry is non-indexed;
  // group 1 = the walls). Cap vertices keep the planar rule;
  // wall vertices sample the face inset from their own outline
  // point by their depth below the top (the D14 wrap rule in
  // this function's header). The outline centroid is the inset
  // target — the traced stones are near-convex cobbles, so the
  // direction is true for every wall point.
  const sideGroup = geo.groups[1];
  const sideStart = sideGroup ? sideGroup.start : -1;
  const sideEnd = sideGroup ? sideGroup.start + sideGroup.count : -1;
  let cenX = 0;
  let cenZ = 0;
  for (const [px, py] of pts) {
    cenX += (px - 0.5) * spec.w;
    cenZ += (py - 0.5) * spec.d;
  }
  if (pts.length > 0) {
    cenX /= pts.length;
    cenZ /= pts.length;
  }
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    if (i >= sideStart && i < sideEnd) {
      const depth = spec.t - pos.getY(i);
      let sx = x;
      let sz = z;
      if (depth > 0) {
        const dx = cenX - x;
        const dz = cenZ - z;
        const dist = Math.hypot(dx, dz);
        if (dist > 1e-9) {
          const step = Math.min(depth, dist);
          sx = x + (dx / dist) * step;
          sz = z + (dz / dist) * step;
        }
      }
      uv.setXY(i, sx / spec.w + 0.5, 0.5 - sz / spec.d);
    } else {
      uv.setXY(i, x / spec.w + 0.5, 0.5 - z / spec.d);
    }
  }
  uv.needsUpdate = true;
  const normalMap = (texture?.userData?.normalMap as THREE.Texture | undefined) ?? undefined;
  const cap = texture
    ? new THREE.MeshStandardMaterial({ map: texture, ...(normalMap ? { normalMap } : {}), roughness: 0.95, metalness: 0 })
    : new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.95, metalness: 0 });
  if (texture) {
    applyBelgardMaterialLogic(
      cap,
      texture.userData?.materialLogic as BelgardMaterialLogic | undefined
    );
  }
  const side = texture
    ? new THREE.MeshStandardMaterial({ map: texture, ...(normalMap ? { normalMap } : {}), roughness: 0.95, metalness: 0 })
    : new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: 0.95,
        metalness: 0,
      });
  if (texture) {
    applyBelgardMaterialLogic(
      side,
      texture.userData?.materialLogic as BelgardMaterialLogic | undefined
    );
  }
  const mesh = new THREE.Mesh(geo, [cap, side]);
  mesh.castShadow = true;
  // No drawn border lines (founder, 2026-11-03) — see buildPaverCut.
  const group = new THREE.Group();
  group.add(mesh);
  return group;
}

/** The textured mesh inside a group returned by buildPaverCut. */
export function paverCutMesh(group: THREE.Group): THREE.Mesh | null {
  for (const child of group.children) {
    if ((child as THREE.Mesh).isMesh) return child as THREE.Mesh;
  }
  return null;
}
