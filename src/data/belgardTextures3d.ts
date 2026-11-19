/**
 * Belgard 3D-studio textures — generated 2026-11-02 from the Media & Logic
 * swatch set (Belgard 2021 Coastal catalog BEL20-427 placed assets).
 * Every texture: original catalog swatch -> RealESRGAN_x4plus upscale (run
 * locally, no hosted AI) -> center square crop -> seamless wrap blend ->
 * 512x512 jpg/webp pairs under public/textures/belgard/<product>/<option>/ (face.jpg + face.webp, depth beside them as face-normal.webp; restructured F6c 2026-11-17). Masters (1024x1024)
 * live in ~/workspace/belgard-textures-3d-masters/. Textures only — this file
 * carries no prices and no catalog products.
 * Appended 2026-11-02 (Job 7): textures for the Florida 2026 Commercial
 * Offering lines (Classic Plaza Slab, Wood Tiles, Artforms), same pipeline.
 * Appended 2026-11-02 (Job 10): textures for the Coastal 2026 Catalog
 * delta — November, Travertini, Diamond Pro Air Smooth/Straight and
 * the 2026 swatch colors for thirteen covered lines, same pipeline.
 */
export interface BelgardTexture3d {
  product: string;
  productSlug: string;
  option: string;
  qualifier: string | null;
  jpg: string;
  webp: string;
  sourceSwatch: string;
  /** Per-option infinite field (same meaning as the group fields): set
   *  when THIS option alone is a seamless field while sibling options
   *  still use per-piece views (Mega-Arbel Amaretto, founder 2026-11-03). */
  textureKind?: string;
  tileInches?: [number, number];
  servedTiles?: [number, number];
  /** Pattern logic for this option — same shape as the group field. */
  patternLogic?: {
  kind: "module" | "field";
    /** Catalog pattern name (kind "module"), as in belgardPatterns.ts. */
    pattern?: string;
    /** [w, h] inches of one pattern module (kind "module"). */
    moduleIn?: [number, number];
    /** [w, h] inches of real surface one served texture image covers (kind "field"). */
    surfaceIn?: [number, number];
    /** How the pattern / texture wraps so the surface never ends. */
    wrap: string;
    /** The standing rule a builder must obey for this product. */
    rule: string;
  };
}
export interface BelgardTextureGroup {
  product: string;
  productSlug: string;
  category: string;
  /** "infinite-field" = amorphous product: ONE seamless field texture on
   *  one geometry, never per-piece blocks (founder spec 2026-11-03). */
  textureKind?: string;
  /** Physical inches covered by ONE master tile [width, height]. */
  tileInches?: [number, number];
  /** How many master tiles ONE served texture image holds [across, down].
   *  Absent = [2, 1.422] (Belgian Cobble's founder-uploaded surface images,
   *  which contain 2 tiles across x 1.422 down). Mega-Arbel serves its
   *  masters directly: [1, 1], so the span equals the tile itself. */
  servedTiles?: [number, number];
  /** How this product builds an endless surface — written for ANY
   *  surface builder that consumes it (the Belgard 3D tab today; the
   *  2D Studio and the 3D Studio when the product moves there).
   *  Founder 2026-11-03: the logic lives ON the product; the studios
   *  are not wired to it yet. kind "field": the texture IS the
   *  surface; wrap repeats it at surfaceIn, never cut into blocks.
   *  kind "module": repeat the catalog pattern module at moduleIn. */
  patternLogic?: {
  kind: "module" | "field";
    /** Catalog pattern name (kind "module"), as in belgardPatterns.ts. */
    pattern?: string;
    /** [w, h] inches of one pattern module (kind "module"). */
    moduleIn?: [number, number];
    /** [w, h] inches of real surface one served texture image covers (kind "field"). */
    surfaceIn?: [number, number];
    /** How the pattern / texture wraps so the surface never ends. */
    wrap: string;
    /** The standing rule a builder must obey for this product. */
    rule: string;
  };
  textures: BelgardTexture3d[];
}
export const BELGARD_TEXTURES_3D: BelgardTextureGroup[] = [
 {
  "product": "Catalina Grana",
  "productSlug": "catalina-grana",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Catalina Grana",
    "productSlug": "catalina-grana",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/catalina-grana/amaretto/face.jpg",
    "webp": "/textures/belgard/catalina-grana/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Catalina Grana",
    "productSlug": "catalina-grana",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/catalina-grana/slate/face.jpg",
    "webp": "/textures/belgard/catalina-grana/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Catalina Grana",
    "productSlug": "catalina-grana",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/catalina-grana/napoli/face.jpg",
    "webp": "/textures/belgard/catalina-grana/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Catalina Grana",
    "productSlug": "catalina-grana",
    "option": "Titanium",
    "qualifier": null,
    "jpg": "/textures/belgard/catalina-grana/titanium/face.jpg",
    "webp": "/textures/belgard/catalina-grana/titanium/face.webp",
    "sourceSwatch": "swatch-titanium.png"
   },
   {
    "product": "Catalina Grana",
    "productSlug": "catalina-grana",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/catalina-grana/rio/face.jpg",
    "webp": "/textures/belgard/catalina-grana/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   },
   {
    "product": "Catalina Grana",
    "productSlug": "catalina-grana",
    "option": "Scandina Gray",
    "qualifier": null,
    "jpg": "/textures/belgard/catalina-grana/scandina-gray/face.jpg",
    "webp": "/textures/belgard/catalina-grana/scandina-gray/face.webp",
    "sourceSwatch": "swatch-scandina-gray.png"
   }
  ]
 },
 {
  "product": "Melville Plank",
  "productSlug": "melville-plank",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Melville Plank",
    "productSlug": "melville-plank",
    "option": "Foundry",
    "qualifier": null,
    "jpg": "/textures/belgard/melville-plank/foundry/face.jpg",
    "webp": "/textures/belgard/melville-plank/foundry/face.webp",
    "sourceSwatch": "swatch-foundry.png"
   },
   {
    "product": "Melville Plank",
    "productSlug": "melville-plank",
    "option": "Linen",
    "qualifier": null,
    "jpg": "/textures/belgard/melville-plank/linen/face.jpg",
    "webp": "/textures/belgard/melville-plank/linen/face.webp",
    "sourceSwatch": "swatch-linen.png"
   },
   {
    "product": "Melville Plank",
    "productSlug": "melville-plank",
    "option": "Midnight",
    "qualifier": null,
    "jpg": "/textures/belgard/melville-plank/midnight/face.jpg",
    "webp": "/textures/belgard/melville-plank/midnight/face.webp",
    "sourceSwatch": "swatch-midnight.png"
   }
  ]
 },
 {
  "product": "Catalina",
  "productSlug": "catalina",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Catalina",
    "productSlug": "catalina",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/catalina/amaretto/face.jpg",
    "webp": "/textures/belgard/catalina/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Catalina",
    "productSlug": "catalina",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/catalina/slate/face.jpg",
    "webp": "/textures/belgard/catalina/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Catalina",
    "productSlug": "catalina",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/catalina/napoli/face.jpg",
    "webp": "/textures/belgard/catalina/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Catalina",
    "productSlug": "catalina",
    "option": "Titanium",
    "qualifier": null,
    "jpg": "/textures/belgard/catalina/titanium/face.jpg",
    "webp": "/textures/belgard/catalina/titanium/face.webp",
    "sourceSwatch": "swatch-titanium.png"
   },
   {
    "product": "Catalina",
    "productSlug": "catalina",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/catalina/rio/face.jpg",
    "webp": "/textures/belgard/catalina/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   }
  ]
 },
 {
  "product": "Mega-Arbel",
  "productSlug": "mega-arbel",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Mega-Arbel",
    "productSlug": "mega-arbel",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-arbel/amaretto/face.jpg",
    "webp": "/textures/belgard/mega-arbel/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png",
    "textureKind": "infinite-field",
    "tileInches": [168, 168],
    "servedTiles": [1, 1],
    "patternLogic": {
     "kind": "field",
     "surfaceIn": [168, 168],
     "wrap": "The served image is one seamless field covering 168 x 168 in (14 ft). Wrap by repeating it on both axes at that span — no rotation, no mirror, no offset; the edges continue the stones, so the surface never ends.",
     "rule": "Amorphous product (irregular flagstone, no fixed module): never cut it into blocks and never lay it in a grid. Lay the field as ONE surface at any size, shape or direction."
    }
   },
   {
    "product": "Mega-Arbel",
    "productSlug": "mega-arbel",
    "option": "Harvest Blend",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-arbel/harvest-blend/face.jpg",
    "webp": "/textures/belgard/mega-arbel/harvest-blend/face.webp",
    "sourceSwatch": "swatch-harvest-blend.png",
    "textureKind": "infinite-field",
    "tileInches": [168, 168],
    "servedTiles": [1, 1],
    "patternLogic": {
     "kind": "field",
     "surfaceIn": [168, 168],
     "wrap": "The served image is one seamless field covering 168 x 168 in (14 ft). Wrap by repeating it on both axes at that span — no rotation, no mirror, no offset; the edges continue the stones, so the surface never ends.",
     "rule": "Amorphous product (irregular flagstone, no fixed module): never cut it into blocks and never lay it in a grid. Lay the field as ONE surface at any size, shape or direction."
    }
   },
   {
    "product": "Mega-Arbel",
    "productSlug": "mega-arbel",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-arbel/napoli/face.jpg",
    "webp": "/textures/belgard/mega-arbel/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png",
    "textureKind": "infinite-field",
    "tileInches": [168, 168],
    "servedTiles": [1, 1],
    "patternLogic": {
     "kind": "field",
     "surfaceIn": [168, 168],
     "wrap": "The served image is one seamless field covering 168 x 168 in (14 ft). Wrap by repeating it on both axes at that span — no rotation, no mirror, no offset; the edges continue the stones, so the surface never ends.",
     "rule": "Amorphous product (irregular flagstone, no fixed module): never cut it into blocks and never lay it in a grid. Lay the field as ONE surface at any size, shape or direction."
    }
   }
  ]
 },
 {
  "product": "Belgian Cobble",
  "productSlug": "belgian-cobble",
  "category": "Pavers & Slabs",
  "textureKind": "infinite-field",
  "tileInches": [32.24, 30.23],
  "patternLogic": {
   "kind": "field",
   "surfaceIn": [64.48, 42.99],
   "wrap": "The served image is one seamless field covering 64.48 x 42.99 in of real surface. Wrap by repeating it on both axes at that span — no rotation, no mirror, no offset; the edges continue the stones, so the surface never ends.",
   "rule": "Amorphous product (catalog size: Variable): never cut it into blocks and never lay it in a grid. Lay the field as ONE surface at any size, shape or direction."
  },
  "textures": [
   {
    "product": "Belgian Cobble",
    "productSlug": "belgian-cobble",
    "option": "Gray",
    "qualifier": null,
    "jpg": "/textures/belgard/belgian-cobble/gray/face.jpg",
    "webp": "/textures/belgard/belgian-cobble/gray/face.webp",
    "sourceSwatch": "swatch-gray.png"
   },
   {
    "product": "Belgian Cobble",
    "productSlug": "belgian-cobble",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/belgian-cobble/slate/face.jpg",
    "webp": "/textures/belgard/belgian-cobble/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Belgian Cobble",
    "productSlug": "belgian-cobble",
    "option": "Bourbon",
    "qualifier": null,
    "jpg": "/textures/belgard/belgian-cobble/bourbon/face.jpg",
    "webp": "/textures/belgard/belgian-cobble/bourbon/face.webp",
    "sourceSwatch": "swatch-bourbon.png"
   },
   {
    "product": "Belgian Cobble",
    "productSlug": "belgian-cobble",
    "option": "Midnight",
    "qualifier": null,
    "jpg": "/textures/belgard/belgian-cobble/midnight/face.jpg",
    "webp": "/textures/belgard/belgian-cobble/midnight/face.webp",
    "sourceSwatch": "swatch-midnight.png"
   },
   {
    "product": "Belgian Cobble",
    "productSlug": "belgian-cobble",
    "option": "Pearl",
    "qualifier": null,
    "jpg": "/textures/belgard/belgian-cobble/pearl/face.jpg",
    "webp": "/textures/belgard/belgian-cobble/pearl/face.webp",
    "sourceSwatch": "swatch-pearl.png"
   }
  ]
 },
 {
  "product": "Mega-Bergerac",
  "productSlug": "mega-bergerac",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Mega-Bergerac",
    "productSlug": "mega-bergerac",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-bergerac/amaretto/face.jpg",
    "webp": "/textures/belgard/mega-bergerac/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Mega-Bergerac",
    "productSlug": "mega-bergerac",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-bergerac/napoli/face.jpg",
    "webp": "/textures/belgard/mega-bergerac/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Mega-Bergerac",
    "productSlug": "mega-bergerac",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-bergerac/slate/face.jpg",
    "webp": "/textures/belgard/mega-bergerac/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   }
  ]
 },
 {
  "product": "Appian-Stone",
  "productSlug": "appian-stone",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Appian-Stone",
    "productSlug": "appian-stone",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/appian-stone/amaretto/face.jpg",
    "webp": "/textures/belgard/appian-stone/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Appian-Stone",
    "productSlug": "appian-stone",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/appian-stone/rio/face.jpg",
    "webp": "/textures/belgard/appian-stone/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   },
   {
    "product": "Appian-Stone",
    "productSlug": "appian-stone",
    "option": "Brown-Chestnut",
    "qualifier": null,
    "jpg": "/textures/belgard/appian-stone/brown-chestnut/face.jpg",
    "webp": "/textures/belgard/appian-stone/brown-chestnut/face.webp",
    "sourceSwatch": "swatch-brown-chestnut.png"
   },
   {
    "product": "Appian-Stone",
    "productSlug": "appian-stone",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/appian-stone/slate/face.jpg",
    "webp": "/textures/belgard/appian-stone/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Appian-Stone",
    "productSlug": "appian-stone",
    "option": "Harvest Blend",
    "qualifier": null,
    "jpg": "/textures/belgard/appian-stone/harvest-blend/face.jpg",
    "webp": "/textures/belgard/appian-stone/harvest-blend/face.webp",
    "sourceSwatch": "swatch-harvest-blend.png"
   },
   {
    "product": "Appian-Stone",
    "productSlug": "appian-stone",
    "option": "Titanium",
    "qualifier": null,
    "jpg": "/textures/belgard/appian-stone/titanium/face.jpg",
    "webp": "/textures/belgard/appian-stone/titanium/face.webp",
    "sourceSwatch": "swatch-titanium.png"
   },
   {
    "product": "Appian-Stone",
    "productSlug": "appian-stone",
    "option": "Knightsbridge",
    "qualifier": null,
    "jpg": "/textures/belgard/appian-stone/knightsbridge/face.jpg",
    "webp": "/textures/belgard/appian-stone/knightsbridge/face.webp",
    "sourceSwatch": "swatch-knightsbridge.png"
   },
   {
    "product": "Appian-Stone",
    "productSlug": "appian-stone",
    "option": "Adobe",
    "qualifier": null,
    "jpg": "/textures/belgard/appian-stone/adobe/face.jpg",
    "webp": "/textures/belgard/appian-stone/adobe/face.webp",
    "sourceSwatch": "swatch-adobe.png"
   },
   {
    "product": "Appian-Stone",
    "productSlug": "appian-stone",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/appian-stone/napoli/face.jpg",
    "webp": "/textures/belgard/appian-stone/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   }
  ]
 },
 {
  "product": "Cambridge Cobble",
  "productSlug": "cambridge-cobble",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Cambridge Cobble",
    "productSlug": "cambridge-cobble",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/cambridge-cobble/rio/face.jpg",
    "webp": "/textures/belgard/cambridge-cobble/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   },
   {
    "product": "Cambridge Cobble",
    "productSlug": "cambridge-cobble",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/cambridge-cobble/amaretto/face.jpg",
    "webp": "/textures/belgard/cambridge-cobble/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Cambridge Cobble",
    "productSlug": "cambridge-cobble",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/cambridge-cobble/slate/face.jpg",
    "webp": "/textures/belgard/cambridge-cobble/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Cambridge Cobble",
    "productSlug": "cambridge-cobble",
    "option": "Titanium",
    "qualifier": null,
    "jpg": "/textures/belgard/cambridge-cobble/titanium/face.jpg",
    "webp": "/textures/belgard/cambridge-cobble/titanium/face.webp",
    "sourceSwatch": "swatch-titanium.png"
   },
   {
    "product": "Cambridge Cobble",
    "productSlug": "cambridge-cobble",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/cambridge-cobble/napoli/face.jpg",
    "webp": "/textures/belgard/cambridge-cobble/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   }
  ]
 },
 {
  "product": "Holland Stone",
  "productSlug": "holland-stone",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Holland Stone",
    "productSlug": "holland-stone",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/holland-stone/amaretto/face.jpg",
    "webp": "/textures/belgard/holland-stone/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Holland Stone",
    "productSlug": "holland-stone",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/holland-stone/rio/face.jpg",
    "webp": "/textures/belgard/holland-stone/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   },
   {
    "product": "Holland Stone",
    "productSlug": "holland-stone",
    "option": "Brown-Chestnut",
    "qualifier": null,
    "jpg": "/textures/belgard/holland-stone/brown-chestnut/face.jpg",
    "webp": "/textures/belgard/holland-stone/brown-chestnut/face.webp",
    "sourceSwatch": "swatch-brown-chestnut.png"
   },
   {
    "product": "Holland Stone",
    "productSlug": "holland-stone",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/holland-stone/slate/face.jpg",
    "webp": "/textures/belgard/holland-stone/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Holland Stone",
    "productSlug": "holland-stone",
    "option": "Harvest Blend",
    "qualifier": null,
    "jpg": "/textures/belgard/holland-stone/harvest-blend/face.jpg",
    "webp": "/textures/belgard/holland-stone/harvest-blend/face.webp",
    "sourceSwatch": "swatch-harvest-blend.png"
   },
   {
    "product": "Holland Stone",
    "productSlug": "holland-stone",
    "option": "Charcoal",
    "qualifier": null,
    "jpg": "/textures/belgard/holland-stone/charcoal/face.jpg",
    "webp": "/textures/belgard/holland-stone/charcoal/face.webp",
    "sourceSwatch": "swatch-charcoal.png"
   },
   {
    "product": "Holland Stone",
    "productSlug": "holland-stone",
    "option": "Titanium",
    "qualifier": null,
    "jpg": "/textures/belgard/holland-stone/titanium/face.jpg",
    "webp": "/textures/belgard/holland-stone/titanium/face.webp",
    "sourceSwatch": "swatch-titanium.png"
   },
   {
    "product": "Holland Stone",
    "productSlug": "holland-stone",
    "option": "Knightsbridge",
    "qualifier": null,
    "jpg": "/textures/belgard/holland-stone/knightsbridge/face.jpg",
    "webp": "/textures/belgard/holland-stone/knightsbridge/face.webp",
    "sourceSwatch": "swatch-knightsbridge.png"
   },
   {
    "product": "Holland Stone",
    "productSlug": "holland-stone",
    "option": "Adobe",
    "qualifier": null,
    "jpg": "/textures/belgard/holland-stone/adobe/face.jpg",
    "webp": "/textures/belgard/holland-stone/adobe/face.webp",
    "sourceSwatch": "swatch-adobe.png"
   },
   {
    "product": "Holland Stone",
    "productSlug": "holland-stone",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/holland-stone/napoli/face.jpg",
    "webp": "/textures/belgard/holland-stone/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   }
  ]
 },
 {
  "product": "Mega-Cambridge",
  "productSlug": "mega-cambridge",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Mega-Cambridge",
    "productSlug": "mega-cambridge",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-cambridge/amaretto/face.jpg",
    "webp": "/textures/belgard/mega-cambridge/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Mega-Cambridge",
    "productSlug": "mega-cambridge",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-cambridge/slate/face.jpg",
    "webp": "/textures/belgard/mega-cambridge/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Mega-Cambridge",
    "productSlug": "mega-cambridge",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-cambridge/napoli/face.jpg",
    "webp": "/textures/belgard/mega-cambridge/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Mega-Cambridge",
    "productSlug": "mega-cambridge",
    "option": "Titanium",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-cambridge/titanium/face.jpg",
    "webp": "/textures/belgard/mega-cambridge/titanium/face.webp",
    "sourceSwatch": "swatch-titanium.png"
   },
   {
    "product": "Mega-Cambridge",
    "productSlug": "mega-cambridge",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-cambridge/rio/face.jpg",
    "webp": "/textures/belgard/mega-cambridge/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   }
  ]
 },
 {
  "product": "Oceanside Series",
  "productSlug": "oceanside-series",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Oceanside Series",
    "productSlug": "oceanside-series",
    "option": "White",
    "qualifier": null,
    "jpg": "/textures/belgard/oceanside-series/white/face.jpg",
    "webp": "/textures/belgard/oceanside-series/white/face.webp",
    "sourceSwatch": "swatch-white.png"
   },
   {
    "product": "Oceanside Series",
    "productSlug": "oceanside-series",
    "option": "Malt",
    "qualifier": null,
    "jpg": "/textures/belgard/oceanside-series/malt/face.jpg",
    "webp": "/textures/belgard/oceanside-series/malt/face.webp",
    "sourceSwatch": "swatch-malt.png"
   },
   {
    "product": "Oceanside Series",
    "productSlug": "oceanside-series",
    "option": "Gray",
    "qualifier": null,
    "jpg": "/textures/belgard/oceanside-series/gray/face.jpg",
    "webp": "/textures/belgard/oceanside-series/gray/face.webp",
    "sourceSwatch": "swatch-gray.png"
   },
   {
    "product": "Oceanside Series",
    "productSlug": "oceanside-series",
    "option": "Cream",
    "qualifier": null,
    "jpg": "/textures/belgard/oceanside-series/cream/face.jpg",
    "webp": "/textures/belgard/oceanside-series/cream/face.webp",
    "sourceSwatch": "swatch-cream.png"
   }
  ]
 },
 {
  "product": "Aqualine",
  "productSlug": "aqualine",
  "category": "Permeable Pavers",
  "textures": [
   {
    "product": "Aqualine",
    "productSlug": "aqualine",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/aqualine/slate/face.jpg",
    "webp": "/textures/belgard/aqualine/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Aqualine",
    "productSlug": "aqualine",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/aqualine/napoli/face.jpg",
    "webp": "/textures/belgard/aqualine/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Aqualine",
    "productSlug": "aqualine",
    "option": "Titanium",
    "qualifier": null,
    "jpg": "/textures/belgard/aqualine/titanium/face.jpg",
    "webp": "/textures/belgard/aqualine/titanium/face.webp",
    "sourceSwatch": "swatch-titanium.png"
   }
  ]
 },
 {
  "product": "Turfstone",
  "productSlug": "turfstone",
  "category": "Permeable Pavers",
  "textures": [
   {
    "product": "Turfstone",
    "productSlug": "turfstone",
    "option": "Gray",
    "qualifier": null,
    "jpg": "/textures/belgard/turfstone/gray/face.jpg",
    "webp": "/textures/belgard/turfstone/gray/face.webp",
    "sourceSwatch": "swatch-gray.png"
   }
  ]
 },
 {
  "product": "Glocal",
  "productSlug": "glocal",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Glocal",
    "productSlug": "glocal",
    "option": "Classic",
    "qualifier": "GC 05",
    "jpg": "/textures/belgard/glocal/classic/face.jpg",
    "webp": "/textures/belgard/glocal/classic/face.webp",
    "sourceSwatch": "swatch-classic.png"
   },
   {
    "product": "Glocal",
    "productSlug": "glocal",
    "option": "Type",
    "qualifier": "GC 04",
    "jpg": "/textures/belgard/glocal/type/face.jpg",
    "webp": "/textures/belgard/glocal/type/face.webp",
    "sourceSwatch": "swatch-type.png"
   },
   {
    "product": "Glocal",
    "productSlug": "glocal",
    "option": "Clear",
    "qualifier": "GC 01",
    "jpg": "/textures/belgard/glocal/clear/face.jpg",
    "webp": "/textures/belgard/glocal/clear/face.webp",
    "sourceSwatch": "swatch-clear.png"
   },
   {
    "product": "Glocal",
    "productSlug": "glocal",
    "option": "Ideal",
    "qualifier": "GC 03",
    "jpg": "/textures/belgard/glocal/ideal/face.jpg",
    "webp": "/textures/belgard/glocal/ideal/face.webp",
    "sourceSwatch": "swatch-ideal.png"
   },
   {
    "product": "Glocal",
    "productSlug": "glocal",
    "option": "Chamois",
    "qualifier": "GC 08",
    "jpg": "/textures/belgard/glocal/chamois/face.jpg",
    "webp": "/textures/belgard/glocal/chamois/face.webp",
    "sourceSwatch": "swatch-chamois.png"
   },
   {
    "product": "Glocal",
    "productSlug": "glocal",
    "option": "Absolute",
    "qualifier": "GC 06",
    "jpg": "/textures/belgard/glocal/absolute/face.jpg",
    "webp": "/textures/belgard/glocal/absolute/face.webp",
    "sourceSwatch": "swatch-absolute.png"
   }
  ]
 },
 {
  "product": "Lagoon",
  "productSlug": "lagoon",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Lagoon",
    "productSlug": "lagoon",
    "option": "Atmosphere",
    "qualifier": "LG 03 ST",
    "jpg": "/textures/belgard/lagoon/atmosphere/face.jpg",
    "webp": "/textures/belgard/lagoon/atmosphere/face.webp",
    "sourceSwatch": "swatch-atmosphere.png"
   },
   {
    "product": "Lagoon",
    "productSlug": "lagoon",
    "option": "Moonbeam",
    "qualifier": "LG 01 ST",
    "jpg": "/textures/belgard/lagoon/moonbeam/face.jpg",
    "webp": "/textures/belgard/lagoon/moonbeam/face.webp",
    "sourceSwatch": "swatch-moonbeam.png"
   },
   {
    "product": "Lagoon",
    "productSlug": "lagoon",
    "option": "Sandshell",
    "qualifier": "LG 02 ST",
    "jpg": "/textures/belgard/lagoon/sandshell/face.jpg",
    "webp": "/textures/belgard/lagoon/sandshell/face.webp",
    "sourceSwatch": "swatch-sandshell.png"
   },
   {
    "product": "Lagoon",
    "productSlug": "lagoon",
    "option": "Cloudburst",
    "qualifier": "LG 05 ST",
    "jpg": "/textures/belgard/lagoon/cloudburst/face.jpg",
    "webp": "/textures/belgard/lagoon/cloudburst/face.webp",
    "sourceSwatch": "swatch-cloudburst.png"
   },
   {
    "product": "Lagoon",
    "productSlug": "lagoon",
    "option": "Sharkskin",
    "qualifier": "LG 04 ST",
    "jpg": "/textures/belgard/lagoon/sharkskin/face.jpg",
    "webp": "/textures/belgard/lagoon/sharkskin/face.webp",
    "sourceSwatch": "swatch-sharkskin.png"
   }
  ]
 },
 {
  "product": "Noon",
  "productSlug": "noon",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Noon",
    "productSlug": "noon",
    "option": "Honey",
    "qualifier": "NN 03 ST",
    "jpg": "/textures/belgard/noon/honey/face.jpg",
    "webp": "/textures/belgard/noon/honey/face.webp",
    "sourceSwatch": "swatch-honey.png"
   },
   {
    "product": "Noon",
    "productSlug": "noon",
    "option": "Ember",
    "qualifier": "NN 02 ST",
    "jpg": "/textures/belgard/noon/ember/face.jpg",
    "webp": "/textures/belgard/noon/ember/face.webp",
    "sourceSwatch": "swatch-ember.png"
   },
   {
    "product": "Noon",
    "productSlug": "noon",
    "option": "Daylight",
    "qualifier": "NN 01 ST",
    "jpg": "/textures/belgard/noon/daylight/face.jpg",
    "webp": "/textures/belgard/noon/daylight/face.webp",
    "sourceSwatch": "swatch-daylight.png"
   }
  ]
 },
 {
  "product": "Norr",
  "productSlug": "norr",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Norr",
    "productSlug": "norr",
    "option": "Svart",
    "qualifier": "RR 03 ST",
    "jpg": "/textures/belgard/norr/svart/face.jpg",
    "webp": "/textures/belgard/norr/svart/face.webp",
    "sourceSwatch": "swatch-svart.png"
   },
   {
    "product": "Norr",
    "productSlug": "norr",
    "option": "Gra",
    "qualifier": "RR 02 ST",
    "jpg": "/textures/belgard/norr/gra/face.jpg",
    "webp": "/textures/belgard/norr/gra/face.webp",
    "sourceSwatch": "swatch-gra.png"
   },
   {
    "product": "Norr",
    "productSlug": "norr",
    "option": "Vit",
    "qualifier": "RR 01 ST",
    "jpg": "/textures/belgard/norr/vit/face.jpg",
    "webp": "/textures/belgard/norr/vit/face.webp",
    "sourceSwatch": "swatch-vit.png"
   }
  ]
 },
 {
  "product": "Quarziti 2.0",
  "productSlug": "quarziti-2-0",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Quarziti 2.0",
    "productSlug": "quarziti-2-0",
    "option": "Waterfall",
    "qualifier": "QR 03 NAT",
    "jpg": "/textures/belgard/quarziti-2-0/waterfall/face.jpg",
    "webp": "/textures/belgard/quarziti-2-0/waterfall/face.webp",
    "sourceSwatch": "swatch-waterfall.png"
   },
   {
    "product": "Quarziti 2.0",
    "productSlug": "quarziti-2-0",
    "option": "Mantle",
    "qualifier": "QR 05 NAT",
    "jpg": "/textures/belgard/quarziti-2-0/mantle/face.jpg",
    "webp": "/textures/belgard/quarziti-2-0/mantle/face.webp",
    "sourceSwatch": "swatch-mantle.png"
   },
   {
    "product": "Quarziti 2.0",
    "productSlug": "quarziti-2-0",
    "option": "Glacier",
    "qualifier": "QR 01 NAT",
    "jpg": "/textures/belgard/quarziti-2-0/glacier/face.jpg",
    "webp": "/textures/belgard/quarziti-2-0/glacier/face.webp",
    "sourceSwatch": "swatch-glacier.png"
   },
   {
    "product": "Quarziti 2.0",
    "productSlug": "quarziti-2-0",
    "option": "River",
    "qualifier": "QR 04 NAT",
    "jpg": "/textures/belgard/quarziti-2-0/river/face.jpg",
    "webp": "/textures/belgard/quarziti-2-0/river/face.webp",
    "sourceSwatch": "swatch-river.png"
   },
   {
    "product": "Quarziti 2.0",
    "productSlug": "quarziti-2-0",
    "option": "Mountain",
    "qualifier": "QR 02 NAT",
    "jpg": "/textures/belgard/quarziti-2-0/mountain/face.jpg",
    "webp": "/textures/belgard/quarziti-2-0/mountain/face.webp",
    "sourceSwatch": "swatch-mountain.png"
   }
  ]
 },
 {
  "product": "Silverlake",
  "productSlug": "silverlake",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Silverlake",
    "productSlug": "silverlake",
    "option": "Nemi",
    "qualifier": "SK 04 ST",
    "jpg": "/textures/belgard/silverlake/nemi/face.jpg",
    "webp": "/textures/belgard/silverlake/nemi/face.webp",
    "sourceSwatch": "swatch-nemi.png"
   },
   {
    "product": "Silverlake",
    "productSlug": "silverlake",
    "option": "Mortiz",
    "qualifier": "SK 03 ST",
    "jpg": "/textures/belgard/silverlake/mortiz/face.jpg",
    "webp": "/textures/belgard/silverlake/mortiz/face.webp",
    "sourceSwatch": "swatch-mortiz.png"
   },
   {
    "product": "Silverlake",
    "productSlug": "silverlake",
    "option": "Orsi",
    "qualifier": "SK 06 ST",
    "jpg": "/textures/belgard/silverlake/orsi/face.jpg",
    "webp": "/textures/belgard/silverlake/orsi/face.webp",
    "sourceSwatch": "swatch-orsi.png"
   },
   {
    "product": "Silverlake",
    "productSlug": "silverlake",
    "option": "Braies",
    "qualifier": "SK 01 ST",
    "jpg": "/textures/belgard/silverlake/braies/face.jpg",
    "webp": "/textures/belgard/silverlake/braies/face.webp",
    "sourceSwatch": "swatch-braies.png"
   },
   {
    "product": "Silverlake",
    "productSlug": "silverlake",
    "option": "Moro",
    "qualifier": "SK 05 ST",
    "jpg": "/textures/belgard/silverlake/moro/face.jpg",
    "webp": "/textures/belgard/silverlake/moro/face.webp",
    "sourceSwatch": "swatch-moro.png"
   },
   {
    "product": "Silverlake",
    "productSlug": "silverlake",
    "option": "Resia",
    "qualifier": "SK 02 ST",
    "jpg": "/textures/belgard/silverlake/resia/face.jpg",
    "webp": "/textures/belgard/silverlake/resia/face.webp",
    "sourceSwatch": "swatch-resia.png"
   }
  ]
 },
 {
  "product": "Belair Wall 2.0",
  "productSlug": "belair-wall-2-0",
  "category": "Walls",
  "textures": [
   {
    "product": "Belair Wall 2.0",
    "productSlug": "belair-wall-2-0",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/belair-wall-2-0/napoli/face.jpg",
    "webp": "/textures/belgard/belair-wall-2-0/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Belair Wall 2.0",
    "productSlug": "belair-wall-2-0",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/belair-wall-2-0/amaretto/face.jpg",
    "webp": "/textures/belgard/belair-wall-2-0/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Belair Wall 2.0",
    "productSlug": "belair-wall-2-0",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/belair-wall-2-0/rio/face.jpg",
    "webp": "/textures/belgard/belair-wall-2-0/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   },
   {
    "product": "Belair Wall 2.0",
    "productSlug": "belair-wall-2-0",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/belair-wall-2-0/slate/face.jpg",
    "webp": "/textures/belgard/belair-wall-2-0/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   }
  ]
 },
 {
  "product": "Castlemanor Grana",
  "productSlug": "castlemanor-grana",
  "category": "Walls",
  "textures": [
   {
    "product": "Castlemanor Grana",
    "productSlug": "castlemanor-grana",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/castlemanor-grana/amaretto/face.jpg",
    "webp": "/textures/belgard/castlemanor-grana/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Castlemanor Grana",
    "productSlug": "castlemanor-grana",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/castlemanor-grana/napoli/face.jpg",
    "webp": "/textures/belgard/castlemanor-grana/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Castlemanor Grana",
    "productSlug": "castlemanor-grana",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/castlemanor-grana/rio/face.jpg",
    "webp": "/textures/belgard/castlemanor-grana/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   },
   {
    "product": "Castlemanor Grana",
    "productSlug": "castlemanor-grana",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/castlemanor-grana/slate/face.jpg",
    "webp": "/textures/belgard/castlemanor-grana/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   }
  ]
 },
 {
  "product": "Castlemanor (standard)",
  "productSlug": "castlemanor",
  "category": "Walls",
  "textures": [
   {
    "product": "Castlemanor (standard)",
    "productSlug": "castlemanor",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/castlemanor/slate/face.jpg",
    "webp": "/textures/belgard/castlemanor/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Castlemanor (standard)",
    "productSlug": "castlemanor",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/castlemanor/amaretto/face.jpg",
    "webp": "/textures/belgard/castlemanor/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Castlemanor (standard)",
    "productSlug": "castlemanor",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/castlemanor/napoli/face.jpg",
    "webp": "/textures/belgard/castlemanor/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Castlemanor (standard)",
    "productSlug": "castlemanor",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/castlemanor/rio/face.jpg",
    "webp": "/textures/belgard/castlemanor/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   }
  ]
 },
 {
  "product": "Weston Stone",
  "productSlug": "weston-stone",
  "category": "Walls",
  "textures": [
   {
    "product": "Weston Stone",
    "productSlug": "weston-stone",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/weston-stone/amaretto/face.jpg",
    "webp": "/textures/belgard/weston-stone/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Weston Stone",
    "productSlug": "weston-stone",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/weston-stone/napoli/face.jpg",
    "webp": "/textures/belgard/weston-stone/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Weston Stone",
    "productSlug": "weston-stone",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/weston-stone/rio/face.jpg",
    "webp": "/textures/belgard/weston-stone/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   },
   {
    "product": "Weston Stone",
    "productSlug": "weston-stone",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/weston-stone/slate/face.jpg",
    "webp": "/textures/belgard/weston-stone/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   }
  ]
 },
 {
  "product": "Easton Stone",
  "productSlug": "easton-stone",
  "category": "Walls",
  "textures": [
   {
    "product": "Easton Stone",
    "productSlug": "easton-stone",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/easton-stone/amaretto/face.jpg",
    "webp": "/textures/belgard/easton-stone/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Easton Stone",
    "productSlug": "easton-stone",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/easton-stone/napoli/face.jpg",
    "webp": "/textures/belgard/easton-stone/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Easton Stone",
    "productSlug": "easton-stone",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/easton-stone/slate/face.jpg",
    "webp": "/textures/belgard/easton-stone/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Easton Stone",
    "productSlug": "easton-stone",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/easton-stone/rio/face.jpg",
    "webp": "/textures/belgard/easton-stone/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   }
  ]
 },
 {
  "product": "Diamond Pro 9D",
  "productSlug": "diamond-pro-9d",
  "category": "Walls",
  "textures": [
   {
    "product": "Diamond Pro 9D",
    "productSlug": "diamond-pro-9d",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro-9d/napoli/face.jpg",
    "webp": "/textures/belgard/diamond-pro-9d/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Diamond Pro 9D",
    "productSlug": "diamond-pro-9d",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro-9d/slate/face.jpg",
    "webp": "/textures/belgard/diamond-pro-9d/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Diamond Pro 9D",
    "productSlug": "diamond-pro-9d",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro-9d/rio/face.jpg",
    "webp": "/textures/belgard/diamond-pro-9d/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   },
   {
    "product": "Diamond Pro 9D",
    "productSlug": "diamond-pro-9d",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro-9d/amaretto/face.jpg",
    "webp": "/textures/belgard/diamond-pro-9d/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   }
  ]
 },
 {
  "product": "Diamond Pro",
  "productSlug": "diamond-pro",
  "category": "Walls",
  "textures": [
   {
    "product": "Diamond Pro",
    "productSlug": "diamond-pro",
    "option": "Pebble",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro/pebble/face.jpg",
    "webp": "/textures/belgard/diamond-pro/pebble/face.webp",
    "sourceSwatch": "swatch-pebble.png"
   },
   {
    "product": "Diamond Pro",
    "productSlug": "diamond-pro",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro/napoli/face.jpg",
    "webp": "/textures/belgard/diamond-pro/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Diamond Pro",
    "productSlug": "diamond-pro",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro/slate/face.jpg",
    "webp": "/textures/belgard/diamond-pro/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   }
  ]
 },
 {
  "product": "Bordeaux Series",
  "productSlug": "bordeaux-series",
  "category": "Fire & Outdoor Kitchens",
  "textures": [
   {
    "product": "Bordeaux Series",
    "productSlug": "bordeaux-series",
    "option": "Sienna",
    "qualifier": "Body Color",
    "jpg": "/textures/belgard/bordeaux-series/sienna/face.jpg",
    "webp": "/textures/belgard/bordeaux-series/sienna/face.webp",
    "sourceSwatch": "swatch-sienna.png"
   },
   {
    "product": "Bordeaux Series",
    "productSlug": "bordeaux-series",
    "option": "Buff",
    "qualifier": "Accent Color",
    "jpg": "/textures/belgard/bordeaux-series/buff/face.jpg",
    "webp": "/textures/belgard/bordeaux-series/buff/face.webp",
    "sourceSwatch": "swatch-buff.png"
   },
   {
    "product": "Bordeaux Series",
    "productSlug": "bordeaux-series",
    "option": "Midnight",
    "qualifier": "Body Color",
    "jpg": "/textures/belgard/bordeaux-series/midnight/face.jpg",
    "webp": "/textures/belgard/bordeaux-series/midnight/face.webp",
    "sourceSwatch": "swatch-midnight.png"
   },
   {
    "product": "Bordeaux Series",
    "productSlug": "bordeaux-series",
    "option": "Pewter",
    "qualifier": "Body Color",
    "jpg": "/textures/belgard/bordeaux-series/pewter/face.jpg",
    "webp": "/textures/belgard/bordeaux-series/pewter/face.webp",
    "sourceSwatch": "swatch-pewter.png"
   }
  ]
 },
 {
  "product": "Seville Coping",
  "productSlug": "seville-coping",
  "category": "Coping & Steps",
  "textures": [
   {
    "product": "Seville Coping",
    "productSlug": "seville-coping",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/seville-coping/amaretto/face.jpg",
    "webp": "/textures/belgard/seville-coping/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Seville Coping",
    "productSlug": "seville-coping",
    "option": "Harvest Blend",
    "qualifier": null,
    "jpg": "/textures/belgard/seville-coping/harvest-blend/face.jpg",
    "webp": "/textures/belgard/seville-coping/harvest-blend/face.webp",
    "sourceSwatch": "swatch-harvest-blend.png"
   },
   {
    "product": "Seville Coping",
    "productSlug": "seville-coping",
    "option": "Cream",
    "qualifier": null,
    "jpg": "/textures/belgard/seville-coping/cream/face.jpg",
    "webp": "/textures/belgard/seville-coping/cream/face.webp",
    "sourceSwatch": "swatch-cream.png"
   },
   {
    "product": "Seville Coping",
    "productSlug": "seville-coping",
    "option": "Chestnut",
    "qualifier": null,
    "jpg": "/textures/belgard/seville-coping/chestnut/face.jpg",
    "webp": "/textures/belgard/seville-coping/chestnut/face.webp",
    "sourceSwatch": "swatch-chestnut.png"
   },
   {
    "product": "Seville Coping",
    "productSlug": "seville-coping",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/seville-coping/napoli/face.jpg",
    "webp": "/textures/belgard/seville-coping/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Seville Coping",
    "productSlug": "seville-coping",
    "option": "Camel",
    "qualifier": null,
    "jpg": "/textures/belgard/seville-coping/camel/face.jpg",
    "webp": "/textures/belgard/seville-coping/camel/face.webp",
    "sourceSwatch": "swatch-camel.png"
   },
   {
    "product": "Seville Coping",
    "productSlug": "seville-coping",
    "option": "Malt",
    "qualifier": null,
    "jpg": "/textures/belgard/seville-coping/malt/face.jpg",
    "webp": "/textures/belgard/seville-coping/malt/face.webp",
    "sourceSwatch": "swatch-malt.png"
   },
   {
    "product": "Seville Coping",
    "productSlug": "seville-coping",
    "option": "Charcoal",
    "qualifier": null,
    "jpg": "/textures/belgard/seville-coping/charcoal/face.jpg",
    "webp": "/textures/belgard/seville-coping/charcoal/face.webp",
    "sourceSwatch": "swatch-charcoal.png"
   },
   {
    "product": "Seville Coping",
    "productSlug": "seville-coping",
    "option": "Rio",
    "qualifier": null,
    "jpg": "/textures/belgard/seville-coping/rio/face.jpg",
    "webp": "/textures/belgard/seville-coping/rio/face.webp",
    "sourceSwatch": "swatch-rio.png"
   },
   {
    "product": "Seville Coping",
    "productSlug": "seville-coping",
    "option": "Titanium",
    "qualifier": null,
    "jpg": "/textures/belgard/seville-coping/titanium/face.jpg",
    "webp": "/textures/belgard/seville-coping/titanium/face.webp",
    "sourceSwatch": "swatch-titanium.png"
   }
  ]
 },
 {
  "product": "Classic Plaza Slab",
  "productSlug": "classic-plaza-slab",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "CHAMOIS",
    "qualifier": "Shot Blast",
    "jpg": "/textures/belgard/classic-plaza-slab/chamois-shot-blast/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/chamois-shot-blast/face.webp",
    "sourceSwatch": "swatch-chamois-shot-blast.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "CHAMOIS",
    "qualifier": "Matte",
    "jpg": "/textures/belgard/classic-plaza-slab/chamois-matte/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/chamois-matte/face.webp",
    "sourceSwatch": "swatch-chamois-matte.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "BROOKLYN",
    "qualifier": "Diamond",
    "jpg": "/textures/belgard/classic-plaza-slab/brooklyn-diamond/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/brooklyn-diamond/face.webp",
    "sourceSwatch": "swatch-brooklyn-diamond.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "SRI WHITE",
    "qualifier": "Shot Blast",
    "jpg": "/textures/belgard/classic-plaza-slab/sri-white-shot-blast/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/sri-white-shot-blast/face.webp",
    "sourceSwatch": "swatch-sri-white-shot-blast.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "SRI WHITE",
    "qualifier": "Matte",
    "jpg": "/textures/belgard/classic-plaza-slab/sri-white-matte/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/sri-white-matte/face.webp",
    "sourceSwatch": "swatch-sri-white-matte.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "RED",
    "qualifier": "Diamond",
    "jpg": "/textures/belgard/classic-plaza-slab/red-diamond/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/red-diamond/face.webp",
    "sourceSwatch": "swatch-red-diamond.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "SRI WHITE",
    "qualifier": "Diamond",
    "jpg": "/textures/belgard/classic-plaza-slab/sri-white-diamond/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/sri-white-diamond/face.webp",
    "sourceSwatch": "swatch-sri-white-diamond.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "CHARCOAL",
    "qualifier": "Shot Blast",
    "jpg": "/textures/belgard/classic-plaza-slab/charcoal-shot-blast/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/charcoal-shot-blast/face.webp",
    "sourceSwatch": "swatch-charcoal-shot-blast.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "CHARCOAL",
    "qualifier": "Matte",
    "jpg": "/textures/belgard/classic-plaza-slab/charcoal-matte/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/charcoal-matte/face.webp",
    "sourceSwatch": "swatch-charcoal-matte.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "CHAMOIS",
    "qualifier": "Diamond",
    "jpg": "/textures/belgard/classic-plaza-slab/chamois-diamond/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/chamois-diamond/face.webp",
    "sourceSwatch": "swatch-chamois-diamond.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "CINNAMON",
    "qualifier": "Shot Blast",
    "jpg": "/textures/belgard/classic-plaza-slab/cinnamon-shot-blast/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/cinnamon-shot-blast/face.webp",
    "sourceSwatch": "swatch-cinnamon-shot-blast.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "CINNAMON",
    "qualifier": "Matte",
    "jpg": "/textures/belgard/classic-plaza-slab/cinnamon-matte/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/cinnamon-matte/face.webp",
    "sourceSwatch": "swatch-cinnamon-matte.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "CHARCOAL",
    "qualifier": "Diamond",
    "jpg": "/textures/belgard/classic-plaza-slab/charcoal-diamond/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/charcoal-diamond/face.webp",
    "sourceSwatch": "swatch-charcoal-diamond.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "GINGER",
    "qualifier": "Shot Blast",
    "jpg": "/textures/belgard/classic-plaza-slab/ginger-shot-blast/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/ginger-shot-blast/face.webp",
    "sourceSwatch": "swatch-ginger-shot-blast.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "GINGER",
    "qualifier": "Matte",
    "jpg": "/textures/belgard/classic-plaza-slab/ginger-matte/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/ginger-matte/face.webp",
    "sourceSwatch": "swatch-ginger-matte.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "CINNAMON",
    "qualifier": "Diamond",
    "jpg": "/textures/belgard/classic-plaza-slab/cinnamon-diamond/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/cinnamon-diamond/face.webp",
    "sourceSwatch": "swatch-cinnamon-diamond.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "LIMESTONE",
    "qualifier": "Shot Blast",
    "jpg": "/textures/belgard/classic-plaza-slab/limestone-shot-blast/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/limestone-shot-blast/face.webp",
    "sourceSwatch": "swatch-limestone-shot-blast.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "LIMESTONE",
    "qualifier": "Matte",
    "jpg": "/textures/belgard/classic-plaza-slab/limestone-matte/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/limestone-matte/face.webp",
    "sourceSwatch": "swatch-limestone-matte.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "GINGER",
    "qualifier": "Diamond",
    "jpg": "/textures/belgard/classic-plaza-slab/ginger-diamond/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/ginger-diamond/face.webp",
    "sourceSwatch": "swatch-ginger-diamond.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "NATURAL",
    "qualifier": "Shot Blast",
    "jpg": "/textures/belgard/classic-plaza-slab/natural-shot-blast/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/natural-shot-blast/face.webp",
    "sourceSwatch": "swatch-natural-shot-blast.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "NATURAL",
    "qualifier": "Matte",
    "jpg": "/textures/belgard/classic-plaza-slab/natural-matte/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/natural-matte/face.webp",
    "sourceSwatch": "swatch-natural-matte.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "LIMESTONE",
    "qualifier": "Diamond",
    "jpg": "/textures/belgard/classic-plaza-slab/limestone-diamond/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/limestone-diamond/face.webp",
    "sourceSwatch": "swatch-limestone-diamond.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "RED",
    "qualifier": "Shot Blast",
    "jpg": "/textures/belgard/classic-plaza-slab/red-shot-blast/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/red-shot-blast/face.webp",
    "sourceSwatch": "swatch-red-shot-blast.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "RED",
    "qualifier": "Matte",
    "jpg": "/textures/belgard/classic-plaza-slab/red-matte/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/red-matte/face.webp",
    "sourceSwatch": "swatch-red-matte.png"
   },
   {
    "product": "Classic Plaza Slab",
    "productSlug": "classic-plaza-slab",
    "option": "NATURAL",
    "qualifier": "Diamond",
    "jpg": "/textures/belgard/classic-plaza-slab/natural-diamond/face.jpg",
    "webp": "/textures/belgard/classic-plaza-slab/natural-diamond/face.webp",
    "sourceSwatch": "swatch-natural-diamond.png"
   }
  ]
 },
 {
  "product": "Wood Tiles",
  "productSlug": "wood-tiles",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Wood Tiles",
    "productSlug": "wood-tiles",
    "option": "GARAPA",
    "qualifier": "Wood Paver",
    "jpg": "/textures/belgard/wood-tiles/garapa/face.jpg",
    "webp": "/textures/belgard/wood-tiles/garapa/face.webp",
    "sourceSwatch": "swatch-garapa.png"
   },
   {
    "product": "Wood Tiles",
    "productSlug": "wood-tiles",
    "option": "CUMARU",
    "qualifier": "Wood Paver",
    "jpg": "/textures/belgard/wood-tiles/cumaru/face.jpg",
    "webp": "/textures/belgard/wood-tiles/cumaru/face.webp",
    "sourceSwatch": "swatch-cumaru.png"
   },
   {
    "product": "Wood Tiles",
    "productSlug": "wood-tiles",
    "option": "ITAUBA",
    "qualifier": "Wood Paver",
    "jpg": "/textures/belgard/wood-tiles/itauba/face.jpg",
    "webp": "/textures/belgard/wood-tiles/itauba/face.webp",
    "sourceSwatch": "swatch-itauba.png"
   },
   {
    "product": "Wood Tiles",
    "productSlug": "wood-tiles",
    "option": "IPE",
    "qualifier": "Wood Paver",
    "jpg": "/textures/belgard/wood-tiles/ipe/face.jpg",
    "webp": "/textures/belgard/wood-tiles/ipe/face.webp",
    "sourceSwatch": "swatch-ipe.png"
   },
   {
    "product": "Wood Tiles",
    "productSlug": "wood-tiles",
    "option": "TIGERWOOD",
    "qualifier": "Wood Paver",
    "jpg": "/textures/belgard/wood-tiles/tigerwood/face.jpg",
    "webp": "/textures/belgard/wood-tiles/tigerwood/face.webp",
    "sourceSwatch": "swatch-tigerwood.png"
   }
  ]
 },
 {
  "product": "Artforms",
  "productSlug": "artforms",
  "category": "Walls",
  "textures": [
   {
    "product": "Artforms",
    "productSlug": "artforms",
    "option": "Anthracite",
    "qualifier": "Smooth",
    "jpg": "/textures/belgard/artforms/anthracite-smooth/face.jpg",
    "webp": "/textures/belgard/artforms/anthracite-smooth/face.webp",
    "sourceSwatch": "swatch-anthracite-smooth.png"
   },
   {
    "product": "Artforms",
    "productSlug": "artforms",
    "option": "Hickory",
    "qualifier": "Smooth",
    "jpg": "/textures/belgard/artforms/hickory-smooth/face.jpg",
    "webp": "/textures/belgard/artforms/hickory-smooth/face.webp",
    "sourceSwatch": "swatch-hickory-smooth.png"
   },
   {
    "product": "Artforms",
    "productSlug": "artforms",
    "option": "Hickory",
    "qualifier": "Papyrus",
    "jpg": "/textures/belgard/artforms/hickory-papyrus/face.jpg",
    "webp": "/textures/belgard/artforms/hickory-papyrus/face.webp",
    "sourceSwatch": "swatch-hickory-papyrus.png"
   },
   {
    "product": "Artforms",
    "productSlug": "artforms",
    "option": "Scandina Gray",
    "qualifier": "Smooth",
    "jpg": "/textures/belgard/artforms/scandina-gray-smooth/face.jpg",
    "webp": "/textures/belgard/artforms/scandina-gray-smooth/face.webp",
    "sourceSwatch": "swatch-scandina-gray-smooth.png"
   },
   {
    "product": "Artforms",
    "productSlug": "artforms",
    "option": "Scandina Gray",
    "qualifier": "Papyrus",
    "jpg": "/textures/belgard/artforms/scandina-gray-papyrus/face.jpg",
    "webp": "/textures/belgard/artforms/scandina-gray-papyrus/face.webp",
    "sourceSwatch": "swatch-scandina-gray-papyrus.png"
   }
  ]
 },
 {
  "product": "Dimensions",
  "productSlug": "dimensions",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Dimensions",
    "productSlug": "dimensions",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/dimensions/napoli/face.jpg",
    "webp": "/textures/belgard/dimensions/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Dimensions",
    "productSlug": "dimensions",
    "option": "Shaded Gray",
    "qualifier": "Dimensions 12 & 18",
    "jpg": "/textures/belgard/dimensions/shaded-gray/face.jpg",
    "webp": "/textures/belgard/dimensions/shaded-gray/face.webp",
    "sourceSwatch": "swatch-shaded-gray.png"
   },
   {
    "product": "Dimensions",
    "productSlug": "dimensions",
    "option": "Sepia",
    "qualifier": "Dimensions 12 & 18",
    "jpg": "/textures/belgard/dimensions/sepia/face.jpg",
    "webp": "/textures/belgard/dimensions/sepia/face.webp",
    "sourceSwatch": "swatch-sepia.png"
   },
   {
    "product": "Dimensions",
    "productSlug": "dimensions",
    "option": "Anthracite",
    "qualifier": null,
    "jpg": "/textures/belgard/dimensions/anthracite/face.jpg",
    "webp": "/textures/belgard/dimensions/anthracite/face.webp",
    "sourceSwatch": "swatch-anthracite.png"
   },
   {
    "product": "Dimensions",
    "productSlug": "dimensions",
    "option": "Hickory",
    "qualifier": "Slab",
    "jpg": "/textures/belgard/dimensions/hickory/face.jpg",
    "webp": "/textures/belgard/dimensions/hickory/face.webp",
    "sourceSwatch": "swatch-hickory.png"
   }
  ]
 },
 {
  "product": "Hexagon Series",
  "productSlug": "hexagon-series",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Hexagon Series",
    "productSlug": "hexagon-series",
    "option": "Anthracite",
    "qualifier": null,
    "jpg": "/textures/belgard/hexagon-series/anthracite/face.jpg",
    "webp": "/textures/belgard/hexagon-series/anthracite/face.webp",
    "sourceSwatch": "swatch-anthracite.png"
   },
   {
    "product": "Hexagon Series",
    "productSlug": "hexagon-series",
    "option": "Scandina Gray",
    "qualifier": null,
    "jpg": "/textures/belgard/hexagon-series/scandina-gray/face.jpg",
    "webp": "/textures/belgard/hexagon-series/scandina-gray/face.webp",
    "sourceSwatch": "swatch-scandina-gray.png"
   }
  ]
 },
 {
  "product": "Brooklyn",
  "productSlug": "brooklyn",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Brooklyn",
    "productSlug": "brooklyn",
    "option": "Bourbon",
    "qualifier": null,
    "jpg": "/textures/belgard/brooklyn/bourbon/face.jpg",
    "webp": "/textures/belgard/brooklyn/bourbon/face.webp",
    "sourceSwatch": "swatch-bourbon.png"
   },
   {
    "product": "Brooklyn",
    "productSlug": "brooklyn",
    "option": "Midnight",
    "qualifier": null,
    "jpg": "/textures/belgard/brooklyn/midnight/face.jpg",
    "webp": "/textures/belgard/brooklyn/midnight/face.webp",
    "sourceSwatch": "swatch-midnight.png"
   },
   {
    "product": "Brooklyn",
    "productSlug": "brooklyn",
    "option": "Rosewood",
    "qualifier": null,
    "jpg": "/textures/belgard/brooklyn/rosewood/face.jpg",
    "webp": "/textures/belgard/brooklyn/rosewood/face.webp",
    "sourceSwatch": "swatch-rosewood.png"
   }
  ]
 },
 {
  "product": "Charlestone",
  "productSlug": "charlestone",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Charlestone",
    "productSlug": "charlestone",
    "option": "Ashwood",
    "qualifier": null,
    "jpg": "/textures/belgard/charlestone/ashwood/face.jpg",
    "webp": "/textures/belgard/charlestone/ashwood/face.webp",
    "sourceSwatch": "swatch-ashwood.png"
   },
   {
    "product": "Charlestone",
    "productSlug": "charlestone",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/charlestone/napoli/face.jpg",
    "webp": "/textures/belgard/charlestone/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Charlestone",
    "productSlug": "charlestone",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/charlestone/slate/face.jpg",
    "webp": "/textures/belgard/charlestone/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   },
   {
    "product": "Charlestone",
    "productSlug": "charlestone",
    "option": "Titanium",
    "qualifier": null,
    "jpg": "/textures/belgard/charlestone/titanium/face.jpg",
    "webp": "/textures/belgard/charlestone/titanium/face.webp",
    "sourceSwatch": "swatch-titanium.png"
   }
  ]
 },
 {
  "product": "Empire",
  "productSlug": "empire",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Empire",
    "productSlug": "empire",
    "option": "Midnight",
    "qualifier": null,
    "jpg": "/textures/belgard/empire/midnight/face.jpg",
    "webp": "/textures/belgard/empire/midnight/face.webp",
    "sourceSwatch": "swatch-midnight.png"
   },
   {
    "product": "Empire",
    "productSlug": "empire",
    "option": "Scandina Gray",
    "qualifier": null,
    "jpg": "/textures/belgard/empire/scandina-gray/face.jpg",
    "webp": "/textures/belgard/empire/scandina-gray/face.webp",
    "sourceSwatch": "swatch-scandina-gray.png"
   }
  ]
 },
 {
  "product": "Origins 12",
  "productSlug": "origins-12",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Origins 12",
    "productSlug": "origins-12",
    "option": "Cheswick",
    "qualifier": null,
    "jpg": "/textures/belgard/origins-12/cheswick/face.jpg",
    "webp": "/textures/belgard/origins-12/cheswick/face.webp",
    "sourceSwatch": "swatch-cheswick.png"
   },
   {
    "product": "Origins 12",
    "productSlug": "origins-12",
    "option": "Ashwood",
    "qualifier": null,
    "jpg": "/textures/belgard/origins-12/ashwood/face.jpg",
    "webp": "/textures/belgard/origins-12/ashwood/face.webp",
    "sourceSwatch": "swatch-ashwood.png"
   },
   {
    "product": "Origins 12",
    "productSlug": "origins-12",
    "option": "Iron Bay",
    "qualifier": "Origins 12 only",
    "jpg": "/textures/belgard/origins-12/iron-bay/face.jpg",
    "webp": "/textures/belgard/origins-12/iron-bay/face.webp",
    "sourceSwatch": "swatch-iron-bay.png"
   },
   {
    "product": "Origins 12",
    "productSlug": "origins-12",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/origins-12/napoli/face.jpg",
    "webp": "/textures/belgard/origins-12/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Origins 12",
    "productSlug": "origins-12",
    "option": "Teak",
    "qualifier": "Origins 12 only",
    "jpg": "/textures/belgard/origins-12/teak/face.jpg",
    "webp": "/textures/belgard/origins-12/teak/face.webp",
    "sourceSwatch": "swatch-teak.png"
   }
  ]
 },
 {
  "product": "Origins 18",
  "productSlug": "origins-18",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Origins 18",
    "productSlug": "origins-18",
    "option": "Ashwood",
    "qualifier": null,
    "jpg": "/textures/belgard/origins-18/ashwood/face.jpg",
    "webp": "/textures/belgard/origins-18/ashwood/face.webp",
    "sourceSwatch": "swatch-ashwood.png"
   },
   {
    "product": "Origins 18",
    "productSlug": "origins-18",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/origins-18/napoli/face.jpg",
    "webp": "/textures/belgard/origins-18/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   }
  ]
 },
 {
  "product": "Papyrus 18",
  "productSlug": "papyrus-18",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Papyrus 18",
    "productSlug": "papyrus-18",
    "option": "Scandina Gray",
    "qualifier": null,
    "jpg": "/textures/belgard/papyrus-18/scandina-gray/face.jpg",
    "webp": "/textures/belgard/papyrus-18/scandina-gray/face.webp",
    "sourceSwatch": "swatch-scandina-gray.png"
   },
   {
    "product": "Papyrus 18",
    "productSlug": "papyrus-18",
    "option": "Sepia",
    "qualifier": null,
    "jpg": "/textures/belgard/papyrus-18/sepia/face.jpg",
    "webp": "/textures/belgard/papyrus-18/sepia/face.webp",
    "sourceSwatch": "swatch-sepia.png"
   }
  ]
 },
 {
  "product": "Melville Wall",
  "productSlug": "melville-wall",
  "category": "Walls",
  "textures": [
   {
    "product": "Melville Wall",
    "productSlug": "melville-wall",
    "option": "Anthracite",
    "qualifier": null,
    "jpg": "/textures/belgard/melville-wall/anthracite/face.jpg",
    "webp": "/textures/belgard/melville-wall/anthracite/face.webp",
    "sourceSwatch": "swatch-anthracite.png"
   },
   {
    "product": "Melville Wall",
    "productSlug": "melville-wall",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/melville-wall/napoli/face.jpg",
    "webp": "/textures/belgard/melville-wall/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Melville Wall",
    "productSlug": "melville-wall",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/melville-wall/slate/face.jpg",
    "webp": "/textures/belgard/melville-wall/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   }
  ]
 },
 {
  "product": "November",
  "productSlug": "november",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "November",
    "productSlug": "november",
    "option": "Rain",
    "qualifier": null,
    "jpg": "/textures/belgard/november/rain/face.jpg",
    "webp": "/textures/belgard/november/rain/face.webp",
    "sourceSwatch": "swatch-rain.png"
   },
   {
    "product": "November",
    "productSlug": "november",
    "option": "Wind",
    "qualifier": null,
    "jpg": "/textures/belgard/november/wind/face.jpg",
    "webp": "/textures/belgard/november/wind/face.webp",
    "sourceSwatch": "swatch-wind.png"
   },
   {
    "product": "November",
    "productSlug": "november",
    "option": "Warm",
    "qualifier": null,
    "jpg": "/textures/belgard/november/warm/face.jpg",
    "webp": "/textures/belgard/november/warm/face.webp",
    "sourceSwatch": "swatch-warm.png"
   },
   {
    "product": "November",
    "productSlug": "november",
    "option": "Land",
    "qualifier": null,
    "jpg": "/textures/belgard/november/land/face.jpg",
    "webp": "/textures/belgard/november/land/face.webp",
    "sourceSwatch": "swatch-land.png"
   }
  ]
 },
 {
  "product": "Foundation",
  "productSlug": "foundation",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Foundation",
    "productSlug": "foundation",
    "option": "Amber Beige",
    "qualifier": null,
    "jpg": "/textures/belgard/foundation/amber-beige/face.jpg",
    "webp": "/textures/belgard/foundation/amber-beige/face.webp",
    "sourceSwatch": "belgard-coastal-cutsheet-foundation"
   },
   {
    "product": "Foundation",
    "productSlug": "foundation",
    "option": "Scandina Gray",
    "qualifier": null,
    "jpg": "/textures/belgard/foundation/scandina-gray/face.jpg",
    "webp": "/textures/belgard/foundation/scandina-gray/face.webp",
    "sourceSwatch": "belgard-coastal-cutsheet-foundation"
   }
  ]
 },
 {
  "product": "Genoa",
  "productSlug": "genoa",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Genoa",
    "productSlug": "genoa",
    "option": "Blanco",
    "qualifier": null,
    "jpg": "/textures/belgard/genoa/blanco/face.jpg",
    "webp": "/textures/belgard/genoa/blanco/face.webp",
    "sourceSwatch": "belgard-genoa-flat-render-blanco"
   },
   {
    "product": "Genoa",
    "productSlug": "genoa",
    "option": "Crema",
    "qualifier": null,
    "jpg": "/textures/belgard/genoa/crema/face.jpg",
    "webp": "/textures/belgard/genoa/crema/face.webp",
    "sourceSwatch": "belgard-genoa-flat-render-crema"
   }
  ]
 },
 {
  "product": "Jurupa",
  "productSlug": "jurupa",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Jurupa",
    "productSlug": "jurupa",
    "option": "Cool",
    "qualifier": null,
    "jpg": "/textures/belgard/jurupa/cool/face.jpg",
    "webp": "/textures/belgard/jurupa/cool/face.webp",
    "sourceSwatch": "belgard-jurupa-flat-render-cool"
   },
   {
    "product": "Jurupa",
    "productSlug": "jurupa",
    "option": "Master",
    "qualifier": null,
    "jpg": "/textures/belgard/jurupa/master/face.jpg",
    "webp": "/textures/belgard/jurupa/master/face.webp",
    "sourceSwatch": "belgard-jurupa-flat-render-master"
   },
   {
    "product": "Jurupa",
    "productSlug": "jurupa",
    "option": "Camp",
    "qualifier": null,
    "jpg": "/textures/belgard/jurupa/camp/face.jpg",
    "webp": "/textures/belgard/jurupa/camp/face.webp",
    "sourceSwatch": "belgard-jurupa-flat-render-camp"
   }
  ]
 },
 {
  "product": "Oudh",
  "productSlug": "oudh",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Oudh",
    "productSlug": "oudh",
    "option": "Copahu",
    "qualifier": null,
    "jpg": "/textures/belgard/oudh/copahu/face.jpg",
    "webp": "/textures/belgard/oudh/copahu/face.webp",
    "sourceSwatch": "belgardcommercial-oudh-render-copahu"
   },
   {
    "product": "Oudh",
    "productSlug": "oudh",
    "option": "Elem",
    "qualifier": null,
    "jpg": "/textures/belgard/oudh/elem/face.jpg",
    "webp": "/textures/belgard/oudh/elem/face.webp",
    "sourceSwatch": "belgardcommercial-oudh-render-elem"
   },
   {
    "product": "Oudh",
    "productSlug": "oudh",
    "option": "Jinkoh",
    "qualifier": null,
    "jpg": "/textures/belgard/oudh/jinkoh/face.jpg",
    "webp": "/textures/belgard/oudh/jinkoh/face.webp",
    "sourceSwatch": "belgardcommercial-oudh-render-jinkoh"
   },
   {
    "product": "Oudh",
    "productSlug": "oudh",
    "option": "Pino",
    "qualifier": null,
    "jpg": "/textures/belgard/oudh/pino/face.jpg",
    "webp": "/textures/belgard/oudh/pino/face.webp",
    "sourceSwatch": "belgardcommercial-oudh-render-pino"
   },
   {
    "product": "Oudh",
    "productSlug": "oudh",
    "option": "Laos",
    "qualifier": null,
    "jpg": "/textures/belgard/oudh/laos/face.jpg",
    "webp": "/textures/belgard/oudh/laos/face.webp",
    "sourceSwatch": "belgardcommercial-oudh-render-laos"
   },
   {
    "product": "Oudh",
    "productSlug": "oudh",
    "option": "Ladano",
    "qualifier": null,
    "jpg": "/textures/belgard/oudh/ladano/face.jpg",
    "webp": "/textures/belgard/oudh/ladano/face.webp",
    "sourceSwatch": "belgardcommercial-oudh-render-ladano"
   },
   {
    "product": "Oudh",
    "productSlug": "oudh",
    "option": "Cedro",
    "qualifier": null,
    "jpg": "/textures/belgard/oudh/cedro/face.jpg",
    "webp": "/textures/belgard/oudh/cedro/face.webp",
    "sourceSwatch": "belgardcommercial-oudh-render-cedro"
   }
  ]
 },
 {
  "product": "Kao",
  "productSlug": "kao",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Kao",
    "productSlug": "kao",
    "option": "Hazelnut",
    "qualifier": null,
    "jpg": "/textures/belgard/kao/hazelnut/face.jpg",
    "webp": "/textures/belgard/kao/hazelnut/face.webp",
    "sourceSwatch": "belgard-kao-flat-render-hazelnut"
   },
   {
    "product": "Kao",
    "productSlug": "kao",
    "option": "Hazelnut Raw",
    "qualifier": null,
    "jpg": "/textures/belgard/kao/hazelnut-raw/face.jpg",
    "webp": "/textures/belgard/kao/hazelnut-raw/face.webp",
    "sourceSwatch": "belgard-kao-flat-render-hazelnut-raw"
   },
   {
    "product": "Kao",
    "productSlug": "kao",
    "option": "Caramel",
    "qualifier": null,
    "jpg": "/textures/belgard/kao/caramel/face.jpg",
    "webp": "/textures/belgard/kao/caramel/face.webp",
    "sourceSwatch": "belgard-kao-flat-render-caramel"
   },
   {
    "product": "Kao",
    "productSlug": "kao",
    "option": "Caramel Raw",
    "qualifier": null,
    "jpg": "/textures/belgard/kao/caramel-raw/face.jpg",
    "webp": "/textures/belgard/kao/caramel-raw/face.webp",
    "sourceSwatch": "belgard-kao-flat-render-caramel-raw"
   },
   {
    "product": "Kao",
    "productSlug": "kao",
    "option": "Spice",
    "qualifier": null,
    "jpg": "/textures/belgard/kao/spice/face.jpg",
    "webp": "/textures/belgard/kao/spice/face.webp",
    "sourceSwatch": "belgard-kao-flat-render-spice"
   },
   {
    "product": "Kao",
    "productSlug": "kao",
    "option": "Spice Raw",
    "qualifier": null,
    "jpg": "/textures/belgard/kao/spice-raw/face.jpg",
    "webp": "/textures/belgard/kao/spice-raw/face.webp",
    "sourceSwatch": "belgard-kao-flat-render-spice-raw"
   }
  ]
 },
 {
  "product": "Dijon",
  "productSlug": "dijon",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Dijon",
    "productSlug": "dijon",
    "option": "Couches",
    "qualifier": null,
    "jpg": "/textures/belgard/dijon/couches/face.jpg",
    "webp": "/textures/belgard/dijon/couches/face.webp",
    "sourceSwatch": "belgardcommercial-dijon-swatch-couches"
   },
   {
    "product": "Dijon",
    "productSlug": "dijon",
    "option": "Commarin",
    "qualifier": null,
    "jpg": "/textures/belgard/dijon/commarin/face.jpg",
    "webp": "/textures/belgard/dijon/commarin/face.webp",
    "sourceSwatch": "belgardcommercial-dijon-swatch-commarin"
   },
   {
    "product": "Dijon",
    "productSlug": "dijon",
    "option": "Rochepot",
    "qualifier": null,
    "jpg": "/textures/belgard/dijon/rochepot/face.jpg",
    "webp": "/textures/belgard/dijon/rochepot/face.webp",
    "sourceSwatch": "belgardcommercial-dijon-swatch-rochepot"
   },
   {
    "product": "Dijon",
    "productSlug": "dijon",
    "option": "Bazoches",
    "qualifier": null,
    "jpg": "/textures/belgard/dijon/bazoches/face.jpg",
    "webp": "/textures/belgard/dijon/bazoches/face.webp",
    "sourceSwatch": "belgardcommercial-dijon-swatch-bazoches"
   }
  ]
 },
 {
  "product": "Na.Me",
  "productSlug": "na-me",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Na.Me",
    "productSlug": "na-me",
    "option": "Jura Beige",
    "qualifier": null,
    "jpg": "/textures/belgard/na-me/jura-beige/face.jpg",
    "webp": "/textures/belgard/na-me/jura-beige/face.webp",
    "sourceSwatch": "belgardcommercial-na-me-face-jura-beige"
   },
   {
    "product": "Na.Me",
    "productSlug": "na-me",
    "option": "Bourgogne",
    "qualifier": null,
    "jpg": "/textures/belgard/na-me/bourgogne/face.jpg",
    "webp": "/textures/belgard/na-me/bourgogne/face.webp",
    "sourceSwatch": "belgardcommercial-na-me-face-bourgogne"
   },
   {
    "product": "Na.Me",
    "productSlug": "na-me",
    "option": "Gris Belge",
    "qualifier": null,
    "jpg": "/textures/belgard/na-me/gris-belge/face.jpg",
    "webp": "/textures/belgard/na-me/gris-belge/face.webp",
    "sourceSwatch": "belgardcommercial-na-me-face-gris-belge"
   }
  ]
 },
 {
  "product": "Travertini",
  "productSlug": "travertini",
  "category": "Porcelain Pavers",
  "textures": [
   {
    "product": "Travertini",
    "productSlug": "travertini",
    "option": "Pearly Cross",
    "qualifier": null,
    "jpg": "/textures/belgard/travertini/pearly-cross/face.jpg",
    "webp": "/textures/belgard/travertini/pearly-cross/face.webp",
    "sourceSwatch": "swatch-pearly-cross.png"
   },
   {
    "product": "Travertini",
    "productSlug": "travertini",
    "option": "Misty Cross",
    "qualifier": null,
    "jpg": "/textures/belgard/travertini/misty-cross/face.jpg",
    "webp": "/textures/belgard/travertini/misty-cross/face.webp",
    "sourceSwatch": "swatch-misty-cross.png"
   },
   {
    "product": "Travertini",
    "productSlug": "travertini",
    "option": "Light Vein",
    "qualifier": "24 x 48 only",
    "jpg": "/textures/belgard/travertini/light-vein/face.jpg",
    "webp": "/textures/belgard/travertini/light-vein/face.webp",
    "sourceSwatch": "swatch-light-vein.png"
   },
   {
    "product": "Travertini",
    "productSlug": "travertini",
    "option": "Misty Vein",
    "qualifier": "24 x 48 only",
    "jpg": "/textures/belgard/travertini/misty-vein/face.jpg",
    "webp": "/textures/belgard/travertini/misty-vein/face.webp",
    "sourceSwatch": "swatch-misty-vein.png"
   }
  ]
 },
 {
  "product": "Diamond Pro Air Smooth",
  "productSlug": "diamond-pro-air-smooth",
  "category": "Walls",
  "textures": [
   {
    "product": "Diamond Pro Air Smooth",
    "productSlug": "diamond-pro-air-smooth",
    "option": "Anthracite",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro-air-smooth/anthracite/face.jpg",
    "webp": "/textures/belgard/diamond-pro-air-smooth/anthracite/face.webp",
    "sourceSwatch": "swatch-anthracite.png"
   },
   {
    "product": "Diamond Pro Air Smooth",
    "productSlug": "diamond-pro-air-smooth",
    "option": "Hickory",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro-air-smooth/hickory/face.jpg",
    "webp": "/textures/belgard/diamond-pro-air-smooth/hickory/face.webp",
    "sourceSwatch": "swatch-hickory.png"
   },
   {
    "product": "Diamond Pro Air Smooth",
    "productSlug": "diamond-pro-air-smooth",
    "option": "Shaded Gray",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro-air-smooth/shaded-gray/face.jpg",
    "webp": "/textures/belgard/diamond-pro-air-smooth/shaded-gray/face.webp",
    "sourceSwatch": "swatch-shaded-gray.png"
   }
  ]
 },
 {
  "product": "Diamond Pro Air Straight",
  "productSlug": "diamond-pro-air-straight",
  "category": "Walls",
  "textures": [
   {
    "product": "Diamond Pro Air Straight",
    "productSlug": "diamond-pro-air-straight",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro-air-straight/napoli/face.jpg",
    "webp": "/textures/belgard/diamond-pro-air-straight/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   },
   {
    "product": "Diamond Pro Air Straight",
    "productSlug": "diamond-pro-air-straight",
    "option": "Slate",
    "qualifier": null,
    "jpg": "/textures/belgard/diamond-pro-air-straight/slate/face.jpg",
    "webp": "/textures/belgard/diamond-pro-air-straight/slate/face.webp",
    "sourceSwatch": "swatch-slate.png"
   }
  ]
 }
,
 {
  "product": "Belgian Cobble — Block Cut (v2)",
  "productSlug": "belgian-cobble-block-cut",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Belgian Cobble — Block Cut (v2)",
    "productSlug": "belgian-cobble-block-cut",
    "option": "Bourbon",
    "qualifier": null,
    "jpg": "/textures/belgard/belgian-cobble-block-cut/bourbon/face.jpg",
    "webp": "/textures/belgard/belgian-cobble-block-cut/bourbon/face.webp",
    "sourceSwatch": "swatch-bourbon.png"
   },
   {
    "product": "Belgian Cobble — Block Cut (v2)",
    "productSlug": "belgian-cobble-block-cut",
    "option": "Midnight",
    "qualifier": null,
    "jpg": "/textures/belgard/belgian-cobble-block-cut/midnight/face.jpg",
    "webp": "/textures/belgard/belgian-cobble-block-cut/midnight/face.webp",
    "sourceSwatch": "swatch-midnight.png"
   },
   {
    "product": "Belgian Cobble — Block Cut (v2)",
    "productSlug": "belgian-cobble-block-cut",
    "option": "Pearl",
    "qualifier": null,
    "jpg": "/textures/belgard/belgian-cobble-block-cut/pearl/face.jpg",
    "webp": "/textures/belgard/belgian-cobble-block-cut/pearl/face.webp",
    "sourceSwatch": "swatch-pearl.png"
   }
  ]
 },
 {
  "product": "Mega-Arbel — Block Cut (v2)",
  "productSlug": "mega-arbel-block-cut",
  "category": "Pavers & Slabs",
  "textures": [
   {
    "product": "Mega-Arbel — Block Cut (v2)",
    "productSlug": "mega-arbel-block-cut",
    "option": "Amaretto",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-arbel-block-cut/amaretto/face.jpg",
    "webp": "/textures/belgard/mega-arbel-block-cut/amaretto/face.webp",
    "sourceSwatch": "swatch-amaretto.png"
   },
   {
    "product": "Mega-Arbel — Block Cut (v2)",
    "productSlug": "mega-arbel-block-cut",
    "option": "Napoli",
    "qualifier": null,
    "jpg": "/textures/belgard/mega-arbel-block-cut/napoli/face.jpg",
    "webp": "/textures/belgard/mega-arbel-block-cut/napoli/face.webp",
    "sourceSwatch": "swatch-napoli.png"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "bellflower-blonde",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "bellflower-blonde",
    "option": "Bellflower Blonde",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-a.webp",
    "sourceSwatch": "bellflower-blonde_display_w2000.jpg"
   }
  ]
 },
 {
  "product": "Alto Bianco",
  "productSlug": "alto-bianco-matte-porcelain-tile",
  "category": "Tile",
  "textures": [
   {
    "product": "Alto Bianco",
    "productSlug": "alto-bianco-matte-porcelain-tile",
    "option": "White",
    "qualifier": null,
    "jpg": "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-0.png",
    "webp": "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-0.webp",
    "sourceSwatch": "101138949_alto-bianco-matte-porcelain-tile_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "alamo-oak",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "alamo-oak",
    "option": "Alamo Oak",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/alamo-oak/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/alamo-oak/face-top-a.webp",
    "sourceSwatch": "101068468_alamo-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "winter-peak",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "winter-peak",
    "option": "Winter Peak",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/winter-peak/face-top-i.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/winter-peak/face-top-i.webp",
    "sourceSwatch": "100956788_winter-peak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "piedmont-bend",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "piedmont-bend",
    "option": "Piedmont Bend",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-a.webp",
    "sourceSwatch": "100885144_piedmont-bend-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "highguard-silver",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "highguard-silver",
    "option": "Highguard Silver",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-a.webp",
    "sourceSwatch": "101066991_highguard-silver-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "stormy-elm",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "stormy-elm",
    "option": "Stormy Elm",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-a.webp",
    "sourceSwatch": "101068476_stormy-elm-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "lorraine-sienna",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "lorraine-sienna",
    "option": "Lorraine Sienna",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-l.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-l.webp",
    "sourceSwatch": "101058436_lorraine-sienna-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "paisley-cape",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "paisley-cape",
    "option": "Paisley Cape",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-a.webp",
    "sourceSwatch": "100978162_paisley-cape-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "farro-oak",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "farro-oak",
    "option": "Farro Oak",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/farro-oak/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/farro-oak/face-top-a.webp",
    "sourceSwatch": "125532735_farro-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "raven",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "raven",
    "option": "Raven",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/raven/face-top-b.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/raven/face-top-b.webp",
    "sourceSwatch": "101066975_raven-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "timber-saddle",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "timber-saddle",
    "option": "Timber Saddle",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-a.webp",
    "sourceSwatch": "101068484_timber-saddle-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "pelham-peak",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "pelham-peak",
    "option": "Pelham Peak",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-a.webp",
    "sourceSwatch": "101317709_pelham-peak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "trenton-tradition",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "trenton-tradition",
    "option": "Trenton Tradition",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-d.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-d.webp",
    "sourceSwatch": "100978170_trenton-tradition-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "bolton-ridge",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "bolton-ridge",
    "option": "Bolton Ridge",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-a.webp",
    "sourceSwatch": "101443125_bolton-ridge-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "stallion-springs",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "stallion-springs",
    "option": "Stallion Springs",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-a.webp",
    "sourceSwatch": "199241184_stallion-springs-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "stonecastle",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "stonecastle",
    "option": "Stonecastle",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/stonecastle/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/stonecastle/face-top-a.webp",
    "sourceSwatch": "101442291_stonecastle-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "rocky-road",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "rocky-road",
    "option": "Rocky Road",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/rocky-road/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/rocky-road/face-top-a.webp",
    "sourceSwatch": "141369283_rocky-road-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "boardwalk-oak",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "boardwalk-oak",
    "option": "Boardwalk Oak",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-a.webp",
    "sourceSwatch": "101068492_boardwalk-oak-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "ansleigh-cottage",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "ansleigh-cottage",
    "option": "Ansleigh Cottage",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-f.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-f.webp",
    "sourceSwatch": "100885136_ansleigh-cottage-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "clam-shell",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "clam-shell",
    "option": "Clam Shell",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/clam-shell/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/clam-shell/face-top-a.webp",
    "sourceSwatch": "152255713_clam-shell-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "manchester-cove",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "manchester-cove",
    "option": "Manchester Cove",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-a.webp",
    "sourceSwatch": "101058402_manchester-cove-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "lincoln-trail",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "lincoln-trail",
    "option": "Lincoln Trail",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-i.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-i.webp",
    "sourceSwatch": "101445153_lincoln-trail-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "timberwolf-trail",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "timberwolf-trail",
    "option": "Timberwolf Trail",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-d.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-d.webp",
    "sourceSwatch": "101074722_timberwolf-trail-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "DuraLux Performance",
  "productSlug": "auburn-glen",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "DuraLux Performance",
    "productSlug": "auburn-glen",
    "option": "Auburn Glen",
    "qualifier": null,
    "jpg": "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-a.jpg",
    "webp": "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-a.webp",
    "sourceSwatch": "101075240_auburn-glen-waterproof-rigid-core-luxury-vinyl-plank---foam-pad_display"
   }
  ]
 },
 {
  "product": "NuCore Performance",
  "productSlug": "amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad",
  "category": "Vinyl Flooring",
  "textures": [
   {
    "product": "NuCore Performance",
    "productSlug": "amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad",
    "option": "Amsterdam Ash",
    "qualifier": null,
    "jpg": "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-d.jpg",
    "webp": "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-d.webp",
    "sourceSwatch": "101329514_amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad_display"
   }
  ]
 }
];
export const BELGARD_TEXTURES_3D_COUNT = 247; // reconciled F6c 2026-11-17: texture pairs on disk under public/textures/belgard/ (was 239, stale)

/**
 * INFINITE FIELD span (founder spec 2026-11-03): ONE served image spans
 * servedTiles × tileInches of real surface. Belgian Cobble's served images
 * hold 2 master tiles across and 1.422 down (the default when servedTiles
 * is absent), so one image spans 64.48 × 42.99 in. Mega-Arbel serves its
 * masters directly (servedTiles [1, 1]), so its span equals its tile.
 * Mega-Arbel's field is per-option: Amaretto's master tile is
 * 168 × 168 in (a ~14 ft AI field grounded in the real swatch, founder
 * 2026-11-03); its sibling options are not fields. Every surface that maps a field texture from
 * world-foot UVs uses repeat = 12 / spanIn per foot; surfaces with
 * 0..1 UVs use repeats = surfaceInches / spanIn. Returns null for any
 * product that is not an infinite field.
 */
export interface InfiniteFieldSpan {
  spanWIn: number;
  spanHIn: number;
}
export function infiniteFieldSpan(
  group?: {
    textureKind?: string;
    tileInches?: [number, number];
    servedTiles?: [number, number];
  } | null
): InfiniteFieldSpan | null {
  if (!group || group.textureKind !== "infinite-field" || !group.tileInches)
    return null;
  const served = group.servedTiles ?? [2, 1.422];
  return {
    spanWIn: group.tileInches[0] * served[0],
    spanHIn: group.tileInches[1] * served[1],
  };
}
export function infiniteFieldSpanForUrl(
  url?: string | null
): InfiniteFieldSpan | null {
  if (!url) return null;
  for (const g of BELGARD_TEXTURES_3D) {
    const t = g.textures.find((x) => x.webp === url || x.jpg === url);
    if (!t) continue;
    // A per-option field (Mega-Arbel Amaretto) wins over the group span.
    return infiniteFieldSpan(t) ?? infiniteFieldSpan(g);
  }
  return null;
}
