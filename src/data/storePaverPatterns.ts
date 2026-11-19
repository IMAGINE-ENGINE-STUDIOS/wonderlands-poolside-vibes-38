/**
 * Store paver patterns — Job 8 (2026-11-02). ADDITIVE reference data for
 * the Foss STORE paver products (src/data/paverData.ts) that the catalog
 * pattern library (belgardPatterns.ts, sourced from Media & Logic) does
 * not itself cover. Kept OUT of belgardMediaLogic.ts / belgardPatterns.ts
 * on purpose: those files stay purely catalog-sourced; everything here is
 * store-level content keyed by the store product id.
 *
 * What is here:
 * - Appian / Catalina Grana / Catalina store color variants: no new
 *   patterns — each set references the catalog family patterns in
 *   belgardPatterns.ts that already cover the product (family.patternNames).
 * - Glocal single-format SKUs (24x48 / 48x48): the cuts were already
 *   inside the Glocal "Modular Mix" sizesUsed; this file adds the
 *   single-format layouts those SKUs are actually sold for, drawn at the
 *   nominal store dimensions, plus the exact printed faces in the notes.
 * - Travertini store line (7 variants, Mirage porcelain): sizes 24x24 / 24x48 — the verified
 *   Travertini folder sizes (only travertine sizes in any verified source
 *   we hold) — with standard ashlar / running bond / stacked layouts.
 * - Coralina: 24x24 as coded in the Foss store listing and documented in
 *   the Unverified folder file; NO Belgard match exists.
 * Every pattern defined in this file is source: "standard" (industry
 * layout, not catalog-printed) — the Job 3 honesty convention. Previews
 * render each module 2x2 filled with the store product's OWN existing
 * store image (read as fill only; no image file was altered). Reference
 * data only — feeds no quote, catalog, or Studio surface.
 */
import type { BelgardPattern } from "./belgardPatterns";
import { appAssetUrl } from "@/lib/design/kitchenAssetUrl";

export interface StorePaverSize {
  label: string;
  dimensions: string;
  note?: string;
}
export interface StorePaverFamilyRef {
  familySlug: string;
  familyProduct: string;
  patternNames: string[];
}
export interface StorePaverPatternSet {
  storeProductId: string;
  storeName: string;
  family?: StorePaverFamilyRef;
  sizes?: StorePaverSize[];
  patterns: BelgardPattern[];
  notes?: string;
}
export interface StorePaverNotBuildable {
  storeProductId: string;
  storeName: string;
  reason: string;
}
export const STORE_PAVER_PATTERNS: StorePaverPatternSet[] = [
 {
  "storeProductId": "appian-adobe",
  "storeName": "Appian Adobe",
  "family": {
   "familySlug": "appian-stone",
   "familyProduct": "Appian-Stone",
   "patternNames": [
    "2-Piece Tile",
    "2-Piece — 60MM",
    "2-Piece — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Appian-Stone catalog family; the family patterns in belgardPatterns.ts (built from the printed Appian-Stone sizes in Media & Logic) apply to this product unchanged."
 },
 {
  "storeProductId": "appian-amaretto",
  "storeName": "Appian Amaretto",
  "family": {
   "familySlug": "appian-stone",
   "familyProduct": "Appian-Stone",
   "patternNames": [
    "2-Piece Tile",
    "2-Piece — 60MM",
    "2-Piece — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Appian-Stone catalog family; the family patterns in belgardPatterns.ts (built from the printed Appian-Stone sizes in Media & Logic) apply to this product unchanged."
 },
 {
  "storeProductId": "appian-harvest-blend",
  "storeName": "Appian Harvest Blend",
  "family": {
   "familySlug": "appian-stone",
   "familyProduct": "Appian-Stone",
   "patternNames": [
    "2-Piece Tile",
    "2-Piece — 60MM",
    "2-Piece — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Appian-Stone catalog family; the family patterns in belgardPatterns.ts (built from the printed Appian-Stone sizes in Media & Logic) apply to this product unchanged."
 },
 {
  "storeProductId": "appian-knightsbridge",
  "storeName": "Appian Knightsbridge",
  "family": {
   "familySlug": "appian-stone",
   "familyProduct": "Appian-Stone",
   "patternNames": [
    "2-Piece Tile",
    "2-Piece — 60MM",
    "2-Piece — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Appian-Stone catalog family; the family patterns in belgardPatterns.ts (built from the printed Appian-Stone sizes in Media & Logic) apply to this product unchanged."
 },
 {
  "storeProductId": "appian-napoli",
  "storeName": "Appian Napoli",
  "family": {
   "familySlug": "appian-stone",
   "familyProduct": "Appian-Stone",
   "patternNames": [
    "2-Piece Tile",
    "2-Piece — 60MM",
    "2-Piece — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Appian-Stone catalog family; the family patterns in belgardPatterns.ts (built from the printed Appian-Stone sizes in Media & Logic) apply to this product unchanged."
 },
 {
  "storeProductId": "appian-rio",
  "storeName": "Appian Rio",
  "family": {
   "familySlug": "appian-stone",
   "familyProduct": "Appian-Stone",
   "patternNames": [
    "2-Piece Tile",
    "2-Piece — 60MM",
    "2-Piece — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Appian-Stone catalog family; the family patterns in belgardPatterns.ts (built from the printed Appian-Stone sizes in Media & Logic) apply to this product unchanged."
 },
 {
  "storeProductId": "appian-slate",
  "storeName": "Appian Slate",
  "family": {
   "familySlug": "appian-stone",
   "familyProduct": "Appian-Stone",
   "patternNames": [
    "2-Piece Tile",
    "2-Piece — 60MM",
    "2-Piece — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Appian-Stone catalog family; the family patterns in belgardPatterns.ts (built from the printed Appian-Stone sizes in Media & Logic) apply to this product unchanged."
 },
 {
  "storeProductId": "appian-titanium",
  "storeName": "Appian Titanium",
  "family": {
   "familySlug": "appian-stone",
   "familyProduct": "Appian-Stone",
   "patternNames": [
    "2-Piece Tile",
    "2-Piece — 60MM",
    "2-Piece — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Appian-Stone catalog family; the family patterns in belgardPatterns.ts (built from the printed Appian-Stone sizes in Media & Logic) apply to this product unchanged."
 },
 {
  "storeProductId": "appian-charcoal",
  "storeName": "Appian Charcoal",
  "family": {
   "familySlug": "appian-stone",
   "familyProduct": "Appian-Stone",
   "patternNames": [
    "2-Piece Tile",
    "2-Piece — 60MM",
    "2-Piece — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Appian-Stone catalog family; the family patterns in belgardPatterns.ts (built from the printed Appian-Stone sizes in Media & Logic) apply to this product unchanged."
 },
 {
  "storeProductId": "catalina-amaretto",
  "storeName": "Catalina Grana Amaretto",
  "family": {
   "familySlug": "catalina-grana",
   "familyProduct": "Catalina Grana",
   "patternNames": [
    "3-Piece Tile",
    "3-Piece — 60MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Catalina Grana catalog family; the family patterns in belgardPatterns.ts apply unchanged."
 },
 {
  "storeProductId": "catalina-napoli",
  "storeName": "Catalina Grana Napoli",
  "family": {
   "familySlug": "catalina-grana",
   "familyProduct": "Catalina Grana",
   "patternNames": [
    "3-Piece Tile",
    "3-Piece — 60MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Catalina Grana catalog family; the family patterns in belgardPatterns.ts apply unchanged."
 },
 {
  "storeProductId": "catalina-rio",
  "storeName": "Catalina Grana Rio",
  "family": {
   "familySlug": "catalina-grana",
   "familyProduct": "Catalina Grana",
   "patternNames": [
    "3-Piece Tile",
    "3-Piece — 60MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Catalina Grana catalog family; the family patterns in belgardPatterns.ts apply unchanged."
 },
 {
  "storeProductId": "catalina-scandina-gray",
  "storeName": "Catalina Grana Scandina Gray",
  "family": {
   "familySlug": "catalina-grana",
   "familyProduct": "Catalina Grana",
   "patternNames": [
    "3-Piece Tile",
    "3-Piece — 60MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Catalina Grana catalog family; the family patterns in belgardPatterns.ts apply unchanged."
 },
 {
  "storeProductId": "catalina-slate",
  "storeName": "Catalina Grana Slate",
  "family": {
   "familySlug": "catalina-grana",
   "familyProduct": "Catalina Grana",
   "patternNames": [
    "3-Piece Tile",
    "3-Piece — 60MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Catalina Grana catalog family; the family patterns in belgardPatterns.ts apply unchanged."
 },
 {
  "storeProductId": "catalina-titanium",
  "storeName": "Catalina Grana Titanium",
  "family": {
   "familySlug": "catalina-grana",
   "familyProduct": "Catalina Grana",
   "patternNames": [
    "3-Piece Tile",
    "3-Piece — 60MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Catalina Grana catalog family; the family patterns in belgardPatterns.ts apply unchanged."
 },
 {
  "storeProductId": "catalina-napoli-standard",
  "storeName": "Catalina Napoli",
  "family": {
   "familySlug": "catalina",
   "familyProduct": "Catalina",
   "patternNames": [
    "3-Piece Tile",
    "3-Piece Tile — 60MM",
    "3-Piece Tile — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Catalina catalog family; the family patterns in belgardPatterns.ts apply unchanged."
 },
 {
  "storeProductId": "catalina-slate-standard",
  "storeName": "Catalina Slate",
  "family": {
   "familySlug": "catalina",
   "familyProduct": "Catalina",
   "patternNames": [
    "3-Piece Tile",
    "3-Piece Tile — 60MM",
    "3-Piece Tile — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Catalina catalog family; the family patterns in belgardPatterns.ts apply unchanged."
 },
 {
  "storeProductId": "catalina-titanium-standard",
  "storeName": "Catalina Titanium",
  "family": {
   "familySlug": "catalina",
   "familyProduct": "Catalina",
   "patternNames": [
    "3-Piece Tile",
    "3-Piece Tile — 60MM",
    "3-Piece Tile — 80MM"
   ]
  },
  "patterns": [],
  "notes": "Store color variant of the Catalina catalog family; the family patterns in belgardPatterns.ts apply unchanged."
 },
 {
  "storeProductId": "glocal-ideal-48x48",
  "storeName": "Glocal Ideal 48x48",
  "family": {
   "familySlug": "glocal",
   "familyProduct": "Glocal",
   "patternNames": [
    "Modular Mix"
   ]
  },
  "sizes": [
   {
    "label": "48 x 48",
    "dimensions": "48 x 48",
    "note": "Nominal store cut; catalog printed exact face 47.17 x 47.17 x 3/4 in (Media & Logic, Glocal)."
   }
  ],
  "patterns": [
   {
    "name": "Large-Format Grid",
    "productSlug": "glocal-ideal-48x48",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "48 x 48"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "48 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 48.0,
       "rot": 0
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--glocal-ideal-48x48--large-format-grid.png")
   },
   {
    "name": "Large-Format Offset",
    "productSlug": "glocal-ideal-48x48",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "48 x 48"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 96.0,
     "tiles": [
      {
       "sizeLabel": "48 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 48.0,
       "rot": 0
      },
      {
       "sizeLabel": "48 x 48",
       "x": 48.0,
       "y": 0.0,
       "w": 48.0,
       "h": 48.0,
       "rot": 0
      },
      {
       "sizeLabel": "48 x 48",
       "x": 0.0,
       "y": 48.0,
       "w": 24.0,
       "h": 48.0,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "48 x 48",
       "x": 24.0,
       "y": 48.0,
       "w": 48.0,
       "h": 48.0,
       "rot": 0
      },
      {
       "sizeLabel": "48 x 48",
       "x": 72.0,
       "y": 48.0,
       "w": 24.0,
       "h": 48.0,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--glocal-ideal-48x48--large-format-offset.png")
   }
  ],
  "notes": "Single-format store SKU. The cut is the nominal size printed in the store product name — the same label as the Glocal catalog size in Media & Logic (printed exact face for 24 x 48 is 23.54 x 47.17 in; for 48 x 48 it is 47.17 x 47.17 in). Modules here are drawn at the nominal store dimensions. The mixed Modular Mix family pattern in belgardPatterns.ts also covers this cut."
 },
 {
  "storeProductId": "glocal-ideal-24x48",
  "storeName": "Glocal Ideal 24x48",
  "family": {
   "familySlug": "glocal",
   "familyProduct": "Glocal",
   "patternNames": [
    "Modular Mix"
   ]
  },
  "sizes": [
   {
    "label": "24 x 48",
    "dimensions": "24 x 48",
    "note": "Nominal store cut; catalog printed exact face 23.54 x 47.17 x 3/4 in (Media & Logic, Glocal)."
   }
  ],
  "patterns": [
   {
    "name": "Plank Stacked Bond",
    "productSlug": "glocal-ideal-24x48",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--glocal-ideal-24x48--plank-stacked-bond.png")
   },
   {
    "name": "Plank Running Bond",
    "productSlug": "glocal-ideal-24x48",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 48.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 72.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--glocal-ideal-24x48--plank-running-bond.png")
   }
  ],
  "notes": "Single-format store SKU. The cut is the nominal size printed in the store product name — the same label as the Glocal catalog size in Media & Logic (printed exact face for 24 x 48 is 23.54 x 47.17 in; for 48 x 48 it is 47.17 x 47.17 in). Modules here are drawn at the nominal store dimensions. The mixed Modular Mix family pattern in belgardPatterns.ts also covers this cut."
 },
 {
  "storeProductId": "glocal-absolute-48x48",
  "storeName": "Glocal Absolute 48x48",
  "family": {
   "familySlug": "glocal",
   "familyProduct": "Glocal",
   "patternNames": [
    "Modular Mix"
   ]
  },
  "sizes": [
   {
    "label": "48 x 48",
    "dimensions": "48 x 48",
    "note": "Nominal store cut; catalog printed exact face 47.17 x 47.17 x 3/4 in (Media & Logic, Glocal)."
   }
  ],
  "patterns": [
   {
    "name": "Large-Format Grid",
    "productSlug": "glocal-absolute-48x48",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "48 x 48"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "48 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 48.0,
       "rot": 0
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--glocal-absolute-48x48--large-format-grid.png")
   },
   {
    "name": "Large-Format Offset",
    "productSlug": "glocal-absolute-48x48",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "48 x 48"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 96.0,
     "tiles": [
      {
       "sizeLabel": "48 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 48.0,
       "rot": 0
      },
      {
       "sizeLabel": "48 x 48",
       "x": 48.0,
       "y": 0.0,
       "w": 48.0,
       "h": 48.0,
       "rot": 0
      },
      {
       "sizeLabel": "48 x 48",
       "x": 0.0,
       "y": 48.0,
       "w": 24.0,
       "h": 48.0,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "48 x 48",
       "x": 24.0,
       "y": 48.0,
       "w": 48.0,
       "h": 48.0,
       "rot": 0
      },
      {
       "sizeLabel": "48 x 48",
       "x": 72.0,
       "y": 48.0,
       "w": 24.0,
       "h": 48.0,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--glocal-absolute-48x48--large-format-offset.png")
   }
  ],
  "notes": "Single-format store SKU. The cut is the nominal size printed in the store product name — the same label as the Glocal catalog size in Media & Logic (printed exact face for 24 x 48 is 23.54 x 47.17 in; for 48 x 48 it is 47.17 x 47.17 in). Modules here are drawn at the nominal store dimensions. The mixed Modular Mix family pattern in belgardPatterns.ts also covers this cut."
 },
 {
  "storeProductId": "glocal-absolute-24x48",
  "storeName": "Glocal Absolute 24x48",
  "family": {
   "familySlug": "glocal",
   "familyProduct": "Glocal",
   "patternNames": [
    "Modular Mix"
   ]
  },
  "sizes": [
   {
    "label": "24 x 48",
    "dimensions": "24 x 48",
    "note": "Nominal store cut; catalog printed exact face 23.54 x 47.17 x 3/4 in (Media & Logic, Glocal)."
   }
  ],
  "patterns": [
   {
    "name": "Plank Stacked Bond",
    "productSlug": "glocal-absolute-24x48",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--glocal-absolute-24x48--plank-stacked-bond.png")
   },
   {
    "name": "Plank Running Bond",
    "productSlug": "glocal-absolute-24x48",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 48.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 72.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--glocal-absolute-24x48--plank-running-bond.png")
   }
  ],
  "notes": "Single-format store SKU. The cut is the nominal size printed in the store product name — the same label as the Glocal catalog size in Media & Logic (printed exact face for 24 x 48 is 23.54 x 47.17 in; for 48 x 48 it is 47.17 x 47.17 in). Modules here are drawn at the nominal store dimensions. The mixed Modular Mix family pattern in belgardPatterns.ts also covers this cut."
 },
 {
  "storeProductId": "travertini-light-vein",
  "storeName": "Travertini Light Vein",
  "sizes": [
   {
    "label": "24 x 24",
    "dimensions": "24 x 24",
    "note": "Verified Travertini folder size (Florida (FL) Travertini file, sourced from the 2026 Coastal catalog + Coastal cut sheet); 20mm thick."
   },
   {
    "label": "24 x 48",
    "dimensions": "24 x 48",
    "note": "Verified Travertini folder size (same source); 20mm thick."
   }
  ],
  "patterns": [
   {
    "name": "Ashlar Mix",
    "productSlug": "travertini-light-vein",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "24 x 24",
     "24 x 48"
    ],
    "module": {
     "widthIn": 72.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 24",
       "x": 48.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-light-vein--ashlar-mix.png")
   },
   {
    "name": "Running Bond",
    "productSlug": "travertini-light-vein",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 48.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 72.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-light-vein--running-bond.png")
   },
   {
    "name": "Stacked Grid",
    "productSlug": "travertini-light-vein",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-light-vein--stacked-grid.png")
   }
  ],
  "notes": "Sizes are the verified Travertini sizes held in the Belgard folder set (24x24 and 24x48, 20mm) — the only travertine sizes present in any verified source we hold; the store listing itself prints no sizes. Layouts are industry-standard for travertine-look porcelain, NOT catalog-printed for these store entries, so source is \"standard\". A true Versailles / French pattern needs the 4-piece ratio set (incl. a 24x36 piece) which appears in no verified source we hold, so it is not claimed; the Ashlar Mix gives the same mixed-format character from the two verified sizes only. Preview fill is this variant's existing store image, unaltered."
 },
 {
  "storeProductId": "travertini-dark-vein",
  "storeName": "Travertini Dark Vein",
  "sizes": [
   {
    "label": "24 x 24",
    "dimensions": "24 x 24",
    "note": "Verified Travertini folder size (Florida (FL) Travertini file, sourced from the 2026 Coastal catalog + Coastal cut sheet); 20mm thick."
   },
   {
    "label": "24 x 48",
    "dimensions": "24 x 48",
    "note": "Verified Travertini folder size (same source); 20mm thick."
   }
  ],
  "patterns": [
   {
    "name": "Ashlar Mix",
    "productSlug": "travertini-dark-vein",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "24 x 24",
     "24 x 48"
    ],
    "module": {
     "widthIn": 72.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 24",
       "x": 48.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-dark-vein--ashlar-mix.png")
   },
   {
    "name": "Running Bond",
    "productSlug": "travertini-dark-vein",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 48.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 72.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-dark-vein--running-bond.png")
   },
   {
    "name": "Stacked Grid",
    "productSlug": "travertini-dark-vein",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-dark-vein--stacked-grid.png")
   }
  ],
  "notes": "Sizes are the verified Travertini sizes held in the Belgard folder set (24x24 and 24x48, 20mm) — the only travertine sizes present in any verified source we hold; the store listing itself prints no sizes. Layouts are industry-standard for travertine-look porcelain, NOT catalog-printed for these store entries, so source is \"standard\". A true Versailles / French pattern needs the 4-piece ratio set (incl. a 24x36 piece) which appears in no verified source we hold, so it is not claimed; the Ashlar Mix gives the same mixed-format character from the two verified sizes only. Preview fill is this variant's existing store image, unaltered."
 },
 {
  "storeProductId": "travertini-misty-vein",
  "storeName": "Travertini Misty Vein",
  "sizes": [
   {
    "label": "24 x 24",
    "dimensions": "24 x 24",
    "note": "Verified Travertini folder size (Florida (FL) Travertini file, sourced from the 2026 Coastal catalog + Coastal cut sheet); 20mm thick."
   },
   {
    "label": "24 x 48",
    "dimensions": "24 x 48",
    "note": "Verified Travertini folder size (same source); 20mm thick."
   }
  ],
  "patterns": [
   {
    "name": "Ashlar Mix",
    "productSlug": "travertini-misty-vein",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "24 x 24",
     "24 x 48"
    ],
    "module": {
     "widthIn": 72.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 24",
       "x": 48.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-misty-vein--ashlar-mix.png")
   },
   {
    "name": "Running Bond",
    "productSlug": "travertini-misty-vein",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 48.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 72.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-misty-vein--running-bond.png")
   },
   {
    "name": "Stacked Grid",
    "productSlug": "travertini-misty-vein",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-misty-vein--stacked-grid.png")
   }
  ],
  "notes": "Sizes are the verified Travertini sizes held in the Belgard folder set (24x24 and 24x48, 20mm) — the only travertine sizes present in any verified source we hold; the store listing itself prints no sizes. Layouts are industry-standard for travertine-look porcelain, NOT catalog-printed for these store entries, so source is \"standard\". A true Versailles / French pattern needs the 4-piece ratio set (incl. a 24x36 piece) which appears in no verified source we hold, so it is not claimed; the Ashlar Mix gives the same mixed-format character from the two verified sizes only. Preview fill is this variant's existing store image, unaltered."
 },
 {
  "storeProductId": "travertini-light-cross",
  "storeName": "Travertini Light Cross",
  "sizes": [
   {
    "label": "24 x 24",
    "dimensions": "24 x 24",
    "note": "Verified Travertini folder size (Florida (FL) Travertini file, sourced from the 2026 Coastal catalog + Coastal cut sheet); 20mm thick."
   },
   {
    "label": "24 x 48",
    "dimensions": "24 x 48",
    "note": "Verified Travertini folder size (same source); 20mm thick."
   }
  ],
  "patterns": [
   {
    "name": "Ashlar Mix",
    "productSlug": "travertini-light-cross",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "24 x 24",
     "24 x 48"
    ],
    "module": {
     "widthIn": 72.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 24",
       "x": 48.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-light-cross--ashlar-mix.png")
   },
   {
    "name": "Running Bond",
    "productSlug": "travertini-light-cross",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 48.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 72.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-light-cross--running-bond.png")
   },
   {
    "name": "Stacked Grid",
    "productSlug": "travertini-light-cross",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-light-cross--stacked-grid.png")
   }
  ],
  "notes": "Sizes are the verified Travertini sizes held in the Belgard folder set (24x24 and 24x48, 20mm) — the only travertine sizes present in any verified source we hold; the store listing itself prints no sizes. Layouts are industry-standard for travertine-look porcelain, NOT catalog-printed for these store entries, so source is \"standard\". A true Versailles / French pattern needs the 4-piece ratio set (incl. a 24x36 piece) which appears in no verified source we hold, so it is not claimed; the Ashlar Mix gives the same mixed-format character from the two verified sizes only. Preview fill is this variant's existing store image, unaltered."
 },
 {
  "storeProductId": "travertini-pearly-cross",
  "storeName": "Travertini Pearly Cross",
  "sizes": [
   {
    "label": "24 x 24",
    "dimensions": "24 x 24",
    "note": "Verified Travertini folder size (Florida (FL) Travertini file, sourced from the 2026 Coastal catalog + Coastal cut sheet); 20mm thick."
   },
   {
    "label": "24 x 48",
    "dimensions": "24 x 48",
    "note": "Verified Travertini folder size (same source); 20mm thick."
   }
  ],
  "patterns": [
   {
    "name": "Ashlar Mix",
    "productSlug": "travertini-pearly-cross",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "24 x 24",
     "24 x 48"
    ],
    "module": {
     "widthIn": 72.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 24",
       "x": 48.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-pearly-cross--ashlar-mix.png")
   },
   {
    "name": "Running Bond",
    "productSlug": "travertini-pearly-cross",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 48.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 72.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-pearly-cross--running-bond.png")
   },
   {
    "name": "Stacked Grid",
    "productSlug": "travertini-pearly-cross",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-pearly-cross--stacked-grid.png")
   }
  ],
  "notes": "Sizes are the verified Travertini sizes held in the Belgard folder set (24x24 and 24x48, 20mm) — the only travertine sizes present in any verified source we hold; the store listing itself prints no sizes. Layouts are industry-standard for travertine-look porcelain, NOT catalog-printed for these store entries, so source is \"standard\". A true Versailles / French pattern needs the 4-piece ratio set (incl. a 24x36 piece) which appears in no verified source we hold, so it is not claimed; the Ashlar Mix gives the same mixed-format character from the two verified sizes only. Preview fill is this variant's existing store image, unaltered."
 },
 {
  "storeProductId": "travertini-misty-cross",
  "storeName": "Travertini Misty Cross",
  "sizes": [
   {
    "label": "24 x 24",
    "dimensions": "24 x 24",
    "note": "Verified Travertini folder size (Florida (FL) Travertini file, sourced from the 2026 Coastal catalog + Coastal cut sheet); 20mm thick."
   },
   {
    "label": "24 x 48",
    "dimensions": "24 x 48",
    "note": "Verified Travertini folder size (same source); 20mm thick."
   }
  ],
  "patterns": [
   {
    "name": "Ashlar Mix",
    "productSlug": "travertini-misty-cross",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "24 x 24",
     "24 x 48"
    ],
    "module": {
     "widthIn": 72.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 24",
       "x": 48.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-misty-cross--ashlar-mix.png")
   },
   {
    "name": "Running Bond",
    "productSlug": "travertini-misty-cross",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 48.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 72.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-misty-cross--running-bond.png")
   },
   {
    "name": "Stacked Grid",
    "productSlug": "travertini-misty-cross",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-misty-cross--stacked-grid.png")
   }
  ],
  "notes": "Sizes are the verified Travertini sizes held in the Belgard folder set (24x24 and 24x48, 20mm) — the only travertine sizes present in any verified source we hold; the store listing itself prints no sizes. Layouts are industry-standard for travertine-look porcelain, NOT catalog-printed for these store entries, so source is \"standard\". A true Versailles / French pattern needs the 4-piece ratio set (incl. a 24x36 piece) which appears in no verified source we hold, so it is not claimed; the Ashlar Mix gives the same mixed-format character from the two verified sizes only. Preview fill is this variant's existing store image, unaltered."
 },
 {
  "storeProductId": "travertini-rustic-cross",
  "storeName": "Travertini Rustic Cross",
  "sizes": [
   {
    "label": "24 x 24",
    "dimensions": "24 x 24",
    "note": "Verified Travertini folder size (Florida (FL) Travertini file, sourced from the 2026 Coastal catalog + Coastal cut sheet); 20mm thick."
   },
   {
    "label": "24 x 48",
    "dimensions": "24 x 48",
    "note": "Verified Travertini folder size (same source); 20mm thick."
   }
  ],
  "patterns": [
   {
    "name": "Ashlar Mix",
    "productSlug": "travertini-rustic-cross",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "24 x 24",
     "24 x 48"
    ],
    "module": {
     "widthIn": 72.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 24",
       "x": 48.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-rustic-cross--ashlar-mix.png")
   },
   {
    "name": "Running Bond",
    "productSlug": "travertini-rustic-cross",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 48.0,
       "y": 0.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "24 x 48",
       "x": 24.0,
       "y": 24.0,
       "w": 48.0,
       "h": 24.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 72.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-rustic-cross--running-bond.png")
   },
   {
    "name": "Stacked Grid",
    "productSlug": "travertini-rustic-cross",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--travertini-rustic-cross--stacked-grid.png")
   }
  ],
  "notes": "Sizes are the verified Travertini sizes held in the Belgard folder set (24x24 and 24x48, 20mm) — the only travertine sizes present in any verified source we hold; the store listing itself prints no sizes. Layouts are industry-standard for travertine-look porcelain, NOT catalog-printed for these store entries, so source is \"standard\". A true Versailles / French pattern needs the 4-piece ratio set (incl. a 24x36 piece) which appears in no verified source we hold, so it is not claimed; the Ashlar Mix gives the same mixed-format character from the two verified sizes only. Preview fill is this variant's existing store image, unaltered."
 },
 {
  "storeProductId": "coralina-blanco",
  "storeName": "Coralina",
  "sizes": [
   {
    "label": "24 x 24",
    "dimensions": "24 x 24",
    "note": "Size as coded in the Foss store listing ('Coralina Blanco 24x24 matte porcelain pavers') and documented in the Unverified folder file. NO Belgard/Oldcastle source exists for this product."
   }
  ],
  "patterns": [
   {
    "name": "Stacked Grid",
    "productSlug": "coralina-blanco",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 48.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--coralina-blanco--stacked-grid.png")
   },
   {
    "name": "Running Bond",
    "productSlug": "coralina-blanco",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 96.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 24.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 48.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 72.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0.0,
       "y": 24.0,
       "w": 12.0,
       "h": 24.0,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "24 x 24",
       "x": 12.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 36.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 60.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 84.0,
       "y": 24.0,
       "w": 12.0,
       "h": 24.0,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": appAssetUrl("/media/belgard-patterns/store--coralina-blanco--running-bond.png")
   }
  ],
  "notes": "Store-only product with NO Belgard match (filed Unverified). Size 24x24 is taken from the Foss store listing itself as documented in the Unverified folder file — the only size source in our data. Patterns are standard layouts at that size; nothing here is a Belgard catalog pattern."
 }
];

export const STORE_PAVER_NOT_BUILDABLE: StorePaverNotBuildable[] = [];
