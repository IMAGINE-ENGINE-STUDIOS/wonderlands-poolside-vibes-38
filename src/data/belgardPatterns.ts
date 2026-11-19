/**
 * Belgard laying patterns — generated 2026-11-02 from the Media & Logic size
 * data (printed dimensions in src/data/belgardMediaLogic.ts, Belgard 2021
 * Coastal catalog BEL20-427). Each pattern is a repeating module of placed
 * rectangles (inches, rotation 0/90) computed from the printed face
 * dimensions. `source: "catalog"` = the size combination is a set Belgard
 * prints as a group (3-Piece / 2-Piece / Ashlar); the module arrangement is
 * the standard modular layout for that set. `source: "standard"` = an
 * industry-standard layout chosen because the catalog prints no pattern for
 * that size set. Previews render the module 2x2 with the product's own
 * 3D-studio texture as unit fill. Reference data only — feeds no quote,
 * catalog, or Studio surface.
 * Appended 2026-11-02 (Job 7): pattern groups for the Florida 2026
 * Commercial Offering lines added to Media & Logic the same day, built
 * under the same rules from that book's printed dimensions.
 * Appended 2026-11-02 (Job G11): the Classic Plaza Slab group — layout per
 * the Commercial Offering's printed installation photo (stacked grid, p.28),
 * sizes/thickness per its rooftop table (p.26). See the group's pattern notes.
 * Appended 2026-11-03 (repair Phase 3): the Classic Plaza Slab Ashlar Mix
 * pattern (printed 12/24/36 sizes in one module). NOTE: this file was
 * regenerated the same day from the live bundle's verified data after a
 * bad scripted edit corrupted it; content verified pattern-for-pattern
 * against the pre-edit snapshot (only the Dimensions order differs, as
 * intended by the Phase 4.1 reorder).
 * Appended 2026-11-02 (Job 10): patterns for the Coastal 2026 Catalog
 * delta — November, Travertini and the Diamond Pro Air Smooth/Straight
 * groups, plus Dimensions 6, Belgian Cobble 60MM, Hexagon 6 and the
 * Melville Wall wedge/cap courses, built under the same rules from
 * that book's printed dimensions.
 * Amended 2026-11-10 (Product Verification Family 2, field-preview
 * defect): the pattern groups for Belgian Cobble, Mega-Arbel and
 * their Block Cut variants are REMOVED. Those products are fields
 * and traced-silhouette fields — the deck layout classifies them
 * before patterns are ever consulted — and the rectangular module
 * patterns recorded here (a "Running Bond" for Mega-Arbel, "Random
 * Ashlar" grids for the cobbles) presented them as gridded tile,
 * the false presentation the founder's field rule names. A field
 * product carries no laying pattern; that absence is now the data.
 * Appended 2026-11-06 (pattern library expansion, founder order):
 * Herringbone 90°, Pinwheel, Basket Weave, Modular Ashlar, Running
 * Bond 1/3 Offset and Stacked Grid entries at printed sizes — every
 * module machine-verified to tile exactly (whole faces, or cut pieces
 * marked cut). Herringbone 45° is NOT offered: the module system
 * lays axis-aligned rectangles only, and a 45° lay cannot be
 * represented without deforming faces.
 */
export interface BelgardPatternTile {
  sizeLabel: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  cut?: boolean;
}
export interface BelgardPattern {
  name: string;
  /** Carried by the enclosing BelgardProductPatterns group; present only on flat entries. */
  productSlug?: string;
  mixed: boolean;
  source: "catalog" | "standard";
  sizesUsed: string[];
  module: { widthIn: number; heightIn: number; tiles: BelgardPatternTile[] };
  preview: string;
  notes?: string;
}
export interface BelgardProductPatterns {
  product: string;
  productSlug: string;
  category: string;
  patterns: BelgardPattern[];
}
export const BELGARD_PATTERNS: BelgardProductPatterns[] = [
 {
  "product": "Catalina Grana",
  "productSlug": "catalina-grana",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "3-Piece Tile",
    "productSlug": "catalina-grana",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "4 x 8 x 1 3/16",
     "8 x 8 x 1 3/16",
     "8 x 12 x 1 3/16"
    ],
    "module": {
     "widthIn": 20,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "8 x 8 x 1 3/16",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 1 3/16",
       "x": 8,
       "y": 0,
       "w": 12,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 0,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 4,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 1 3/16",
       "x": 8,
       "y": 8,
       "w": 12,
       "h": 8,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/catalina-grana--3-piece-tile.png"
   },
   {
    "name": "3-Piece — 60MM",
    "productSlug": "catalina-grana",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "4 x 8 x 2 3/8",
     "8 x 8 x 2 3/8",
     "8 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 20,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "8 x 8 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 2 3/8",
       "x": 8,
       "y": 0,
       "w": 12,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 4,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 2 3/8",
       "x": 8,
       "y": 8,
       "w": 12,
       "h": 8,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/catalina-grana--3-piece-60mm.png"
   },
   {
    "name": "Modular Ashlar \u2014 60MM",
    "productSlug": "catalina-grana",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "4 x 8 x 2 3/8",
     "8 x 8 x 2 3/8",
     "8 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "8 x 8 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 2 3/8",
       "x": 8,
       "y": 0,
       "w": 12,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 20,
       "y": 0,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 2 3/8",
       "x": 0,
       "y": 8,
       "w": 12,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 12,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 8 x 2 3/8",
       "x": 16,
       "y": 8,
       "w": 8,
       "h": 8,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/catalina-grana--modular-ashlar-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Two 8 in bands with the three printed sizes in opposed order \u2014 a second, wider ashlar module beside the catalog 3-Piece; all whole units."
   }
  ]
 },
{
  "product": "Melville Plank",
  "productSlug": "melville-plank",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "3-Piece",
    "productSlug": "melville-plank",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "5 x 11 13/16 x 2 3/8",
     "5 x 15 3/4 x 2 3/8",
     "5 x 19 11/16 x 2 3/8"
    ],
    "module": {
     "widthIn": 20,
     "heightIn": 47.25,
     "tiles": [
      {
       "sizeLabel": "5 x 11 13/16 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 5,
       "h": 11.8125,
       "rot": 0
      },
      {
       "sizeLabel": "5 x 11 13/16 x 2 3/8",
       "x": 5,
       "y": 0,
       "w": 5,
       "h": 11.8125,
       "rot": 0
      },
      {
       "sizeLabel": "5 x 11 13/16 x 2 3/8",
       "x": 10,
       "y": 0,
       "w": 5,
       "h": 11.8125,
       "rot": 0
      },
      {
       "sizeLabel": "5 x 11 13/16 x 2 3/8",
       "x": 15,
       "y": 0,
       "w": 5,
       "h": 11.8125,
       "rot": 0
      },
      {
       "sizeLabel": "5 x 15 3/4 x 2 3/8",
       "x": 0,
       "y": 11.8125,
       "w": 5,
       "h": 15.75,
       "rot": 0
      },
      {
       "sizeLabel": "5 x 15 3/4 x 2 3/8",
       "x": 5,
       "y": 11.8125,
       "w": 5,
       "h": 15.75,
       "rot": 0
      },
      {
       "sizeLabel": "5 x 15 3/4 x 2 3/8",
       "x": 10,
       "y": 11.8125,
       "w": 5,
       "h": 15.75,
       "rot": 0
      },
      {
       "sizeLabel": "5 x 15 3/4 x 2 3/8",
       "x": 15,
       "y": 11.8125,
       "w": 5,
       "h": 15.75,
       "rot": 0
      },
      {
       "sizeLabel": "5 x 19 11/16 x 2 3/8",
       "x": 0,
       "y": 27.5625,
       "w": 5,
       "h": 19.6875,
       "rot": 0
      },
      {
       "sizeLabel": "5 x 19 11/16 x 2 3/8",
       "x": 5,
       "y": 27.5625,
       "w": 5,
       "h": 19.6875,
       "rot": 0
      },
      {
       "sizeLabel": "5 x 19 11/16 x 2 3/8",
       "x": 10,
       "y": 27.5625,
       "w": 5,
       "h": 19.6875,
       "rot": 0
      },
      {
       "sizeLabel": "5 x 19 11/16 x 2 3/8",
       "x": 15,
       "y": 27.5625,
       "w": 5,
       "h": 19.6875,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/melville-plank--3-piece.png"
   }
  ]
 },
{
  "product": "Catalina",
  "productSlug": "catalina",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "3-Piece Tile",
    "productSlug": "catalina",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "4 x 8 x 1 3/16",
     "8 x 8 x 1 3/16",
     "8 x 12 x 1 3/16"
    ],
    "module": {
     "widthIn": 20,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "8 x 8 x 1 3/16",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 1 3/16",
       "x": 8,
       "y": 0,
       "w": 12,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 0,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 4,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 1 3/16",
       "x": 8,
       "y": 8,
       "w": 12,
       "h": 8,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/catalina--3-piece-tile.png"
   },
   {
    "name": "3-Piece Tile — 60MM",
    "productSlug": "catalina",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "4 x 8 x 2 3/8",
     "8 x 8 x 2 3/8",
     "8 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 20,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "8 x 8 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 2 3/8",
       "x": 8,
       "y": 0,
       "w": 12,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 4,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 2 3/8",
       "x": 8,
       "y": 8,
       "w": 12,
       "h": 8,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/catalina--3-piece-tile-60mm.png"
   },
   {
    "name": "3-Piece Tile — 80MM",
    "productSlug": "catalina",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "4 x 8 x 3 1/8",
     "8 x 8 x 3 1/8",
     "8 x 12 x 3 1/8"
    ],
    "module": {
     "widthIn": 20,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "8 x 8 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 3 1/8",
       "x": 8,
       "y": 0,
       "w": 12,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 3 1/8",
       "x": 0,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 3 1/8",
       "x": 4,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 3 1/8",
       "x": 8,
       "y": 8,
       "w": 12,
       "h": 8,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/catalina--3-piece-tile-80mm.png"
   },
   {
    "name": "Modular Ashlar \u2014 60MM",
    "productSlug": "catalina",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "4 x 8 x 2 3/8",
     "8 x 8 x 2 3/8",
     "8 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "8 x 8 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 2 3/8",
       "x": 8,
       "y": 0,
       "w": 12,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 20,
       "y": 0,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 2 3/8",
       "x": 0,
       "y": 8,
       "w": 12,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 12,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 8 x 2 3/8",
       "x": 16,
       "y": 8,
       "w": 8,
       "h": 8,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/catalina--modular-ashlar-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Two 8 in bands with the three printed sizes in opposed order \u2014 a second, wider ashlar module beside the catalog 3-Piece; all whole units."
   }
  ]
 },
{
  "product": "Mega-Bergerac",
  "productSlug": "mega-bergerac",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "3-Piece",
    "productSlug": "mega-bergerac",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "4 3/4 x 9 1/2 x 3 1/8",
     "9 1/2 x 9 1/2 x 3 1/8",
     "9 1/2 x 14 1/4 x 3 1/8",
     "14 1/4 x 14 1/4 x 3 1/8"
    ],
    "module": {
     "widthIn": 28.5,
     "heightIn": 28.5,
     "tiles": [
      {
       "sizeLabel": "4 3/4 x 9 1/2 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 9.5,
       "h": 4.75,
       "rot": 90
      },
      {
       "sizeLabel": "4 3/4 x 9 1/2 x 3 1/8",
       "x": 9.5,
       "y": 0,
       "w": 9.5,
       "h": 4.75,
       "rot": 90
      },
      {
       "sizeLabel": "4 3/4 x 9 1/2 x 3 1/8",
       "x": 19,
       "y": 0,
       "w": 9.5,
       "h": 4.75,
       "rot": 90
      },
      {
       "sizeLabel": "4 3/4 x 9 1/2 x 3 1/8",
       "x": 0,
       "y": 4.75,
       "w": 4.75,
       "h": 9.5,
       "rot": 0
      },
      {
       "sizeLabel": "9 1/2 x 9 1/2 x 3 1/8",
       "x": 4.75,
       "y": 4.75,
       "w": 9.5,
       "h": 9.5,
       "rot": 0
      },
      {
       "sizeLabel": "9 1/2 x 14 1/4 x 3 1/8",
       "x": 14.25,
       "y": 4.75,
       "w": 14.25,
       "h": 9.5,
       "rot": 90
      },
      {
       "sizeLabel": "14 1/4 x 14 1/4 x 3 1/8",
       "x": 0,
       "y": 14.25,
       "w": 14.25,
       "h": 14.25,
       "rot": 0
      },
      {
       "sizeLabel": "14 1/4 x 14 1/4 x 3 1/8",
       "x": 14.25,
       "y": 14.25,
       "w": 14.25,
       "h": 14.25,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/mega-bergerac--3-piece.png"
   },
   {
    "name": "Modular Ashlar",
    "productSlug": "mega-bergerac",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "4 3/4 x 9 1/2 x 3 1/8",
     "9 1/2 x 9 1/2 x 3 1/8",
     "9 1/2 x 14 1/4 x 3 1/8"
    ],
    "module": {
     "widthIn": 28.5,
     "heightIn": 19,
     "tiles": [
      {
       "sizeLabel": "9 1/2 x 9 1/2 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 9.5,
       "h": 9.5,
       "rot": 0
      },
      {
       "sizeLabel": "9 1/2 x 14 1/4 x 3 1/8",
       "x": 9.5,
       "y": 0,
       "w": 14.25,
       "h": 9.5,
       "rot": 90
      },
      {
       "sizeLabel": "4 3/4 x 9 1/2 x 3 1/8",
       "x": 23.75,
       "y": 0,
       "w": 4.75,
       "h": 9.5,
       "rot": 0
      },
      {
       "sizeLabel": "9 1/2 x 14 1/4 x 3 1/8",
       "x": 0,
       "y": 9.5,
       "w": 14.25,
       "h": 9.5,
       "rot": 90
      },
      {
       "sizeLabel": "4 3/4 x 9 1/2 x 3 1/8",
       "x": 14.25,
       "y": 9.5,
       "w": 4.75,
       "h": 9.5,
       "rot": 0
      },
      {
       "sizeLabel": "9 1/2 x 9 1/2 x 3 1/8",
       "x": 19,
       "y": 9.5,
       "w": 9.5,
       "h": 9.5,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/mega-bergerac--modular-ashlar.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Two 9 1/2 in bands with three of the family's printed sizes in opposed order; all whole units."
   }
  ]
 },
{
  "product": "Appian-Stone",
  "productSlug": "appian-stone",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "2-Piece Tile",
    "productSlug": "appian-stone",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 6 x 1 3/16",
     "6 x 9 x 1 3/16"
    ],
    "module": {
     "widthIn": 12,
     "heightIn": 15,
     "tiles": [
      {
       "sizeLabel": "6 x 6 x 1 3/16",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 1 3/16",
       "x": 6,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 1 3/16",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 1 3/16",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 9,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/appian-stone--2-piece-tile.png"
   },
   {
    "name": "2-Piece — 60MM",
    "productSlug": "appian-stone",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 6 x 2 3/8",
     "6 x 9 x 2 3/8",
     "Rectangle"
    ],
    "module": {
     "widthIn": 12,
     "heightIn": 15,
     "tiles": [
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 6,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "Rectangle",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 9,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/appian-stone--2-piece-60mm.png"
   },
   {
    "name": "2-Piece — 80MM",
    "productSlug": "appian-stone",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 6 x 3 1/8",
     "6 x 9 x 3 1/8"
    ],
    "module": {
     "widthIn": 12,
     "heightIn": 15,
     "tiles": [
      {
       "sizeLabel": "6 x 6 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 3 1/8",
       "x": 6,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 3 1/8",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 3 1/8",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 9,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/appian-stone--2-piece-80mm.png"
   },
   {
    "name": "Modular Ashlar \u2014 60MM",
    "productSlug": "appian-stone",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "6 x 6 x 2 3/8",
     "6 x 9 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 12,
     "tiles": [
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 9,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 9,
       "y": 0,
       "w": 9,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 18,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 6,
       "y": 6,
       "w": 9,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 15,
       "y": 6,
       "w": 9,
       "h": 6,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/appian-stone--modular-ashlar-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Two opposed rows alternating the pair's two printed sizes; all whole units."
   }
  ]
 },
{
  "product": "Cambridge Cobble",
  "productSlug": "cambridge-cobble",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "3-Piece Tile",
    "productSlug": "cambridge-cobble",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "3 x 6 x 1 3/16",
     "6 x 6 x 1 3/16",
     "6 x 9 x 1 3/16"
    ],
    "module": {
     "widthIn": 15,
     "heightIn": 12,
     "tiles": [
      {
       "sizeLabel": "6 x 6 x 1 3/16",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 1 3/16",
       "x": 6,
       "y": 0,
       "w": 9,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 6 x 1 3/16",
       "x": 0,
       "y": 6,
       "w": 3,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 6 x 1 3/16",
       "x": 3,
       "y": 6,
       "w": 3,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 1 3/16",
       "x": 6,
       "y": 6,
       "w": 9,
       "h": 6,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/cambridge-cobble--3-piece-tile.png"
   },
   {
    "name": "3-Piece — 60MM",
    "productSlug": "cambridge-cobble",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "3 x 6 x 2 3/8",
     "6 x 6 x 2 3/8",
     "6 x 9 x 2 3/8"
    ],
    "module": {
     "widthIn": 15,
     "heightIn": 12,
     "tiles": [
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 6,
       "y": 0,
       "w": 9,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 6 x 2 3/8",
       "x": 0,
       "y": 6,
       "w": 3,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 6 x 2 3/8",
       "x": 3,
       "y": 6,
       "w": 3,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 6,
       "y": 6,
       "w": 9,
       "h": 6,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/cambridge-cobble--3-piece-60mm.png"
   }
  ]
 },
{
  "product": "Holland Stone",
  "productSlug": "holland-stone",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Running Bond — 30MM Tile",
    "productSlug": "holland-stone",
    "mixed": false,
    "source": "catalog",
    "sizesUsed": [
     "4 x 8 x 1 3/16"
    ],
    "module": {
     "widthIn": 16,
     "heightIn": 8,
     "tiles": [
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 8,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 0,
       "y": 4,
       "w": 4,
       "h": 4,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 4,
       "y": 4,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 12,
       "y": 4,
       "w": 4,
       "h": 4,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/holland-stone--running-bond-30mm-tile.png",
    "notes": "Catalog lay (BEL20-427 p.48): the catalog's own Holland Stone swatch fields and hero photo lay the 4 x 8 face in running bond. Holland Stone prints one 4 x 8 face in four thicknesses; this thickness carries its own copy of the module, identical except for the printed thickness in the size label. Exception printed on the same page: the 100MM thickness is herringbone only — see the Herringbone — 100MM pattern."
   },
   {
    "name": "Running Bond — 60MM",
    "productSlug": "holland-stone",
    "mixed": false,
    "source": "catalog",
    "sizesUsed": [
     "4 x 8 x 2 3/8"
    ],
    "module": {
     "widthIn": 16,
     "heightIn": 8,
     "tiles": [
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 8,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 4,
       "w": 4,
       "h": 4,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 4,
       "y": 4,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 12,
       "y": 4,
       "w": 4,
       "h": 4,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/holland-stone--running-bond-60mm.png",
    "notes": "Catalog lay (BEL20-427 p.48): the catalog's own Holland Stone swatch fields and hero photo lay the 4 x 8 face in running bond. Holland Stone prints one 4 x 8 face in four thicknesses; this thickness carries its own copy of the module, identical except for the printed thickness in the size label. Exception printed on the same page: the 100MM thickness is herringbone only — see the Herringbone — 100MM pattern."
   },
   {
    "name": "Running Bond — 80MM",
    "productSlug": "holland-stone",
    "mixed": false,
    "source": "catalog",
    "sizesUsed": [
     "4 x 8 x 3 1/8"
    ],
    "module": {
     "widthIn": 16,
     "heightIn": 8,
     "tiles": [
      {
       "sizeLabel": "4 x 8 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 3 1/8",
       "x": 8,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 3 1/8",
       "x": 0,
       "y": 4,
       "w": 4,
       "h": 4,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "4 x 8 x 3 1/8",
       "x": 4,
       "y": 4,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 3 1/8",
       "x": 12,
       "y": 4,
       "w": 4,
       "h": 4,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/holland-stone--running-bond-80mm.png",
    "notes": "Catalog lay (BEL20-427 p.48): the catalog's own Holland Stone swatch fields and hero photo lay the 4 x 8 face in running bond. Holland Stone prints one 4 x 8 face in four thicknesses; this thickness carries its own copy of the module, identical except for the printed thickness in the size label. Exception printed on the same page: the 100MM thickness is herringbone only — see the Herringbone — 100MM pattern."
   },
   {
    "name": "Herringbone — 100MM",
    "productSlug": "holland-stone",
    "mixed": false,
    "source": "catalog",
    "sizesUsed": [
     "4 x 8 x 4"
    ],
    "module": {
     "widthIn": 12.0,
     "heightIn": 12.0,
     "tiles": [
      {
       "sizeLabel": "4 x 8 x 4",
       "x": 0.0,
       "y": 0.0,
       "w": 8.0,
       "h": 4.0,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 4",
       "x": 8.0,
       "y": 0.0,
       "w": 4.0,
       "h": 8.0,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 4",
       "x": 4.0,
       "y": 8.0,
       "w": 8.0,
       "h": 4.0,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 4",
       "x": 0.0,
       "y": 4.0,
       "w": 4.0,
       "h": 8.0,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 4",
       "x": 4.0,
       "y": 4.0,
       "w": 4.0,
       "h": 4.0,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/holland-stone--herringbone-100mm.png",
    "notes": "Catalog lay: BEL20-427 p.48 prints the footnote '†100MM: Herringbone only' for Holland Stone, and BELCOMM26 p.11 photographs Holland in Harvest Blend laid in herringbone. The module is the standard 90-degree pinwheel herringbone for the 4 x 8 face; the pinwheel centre takes a 4 x 4 piece cut from a stone, marked cut. This replaces the earlier Running Bond — 100MM entry, which contradicted the printed restriction."
   },
   {
    "name": "Basket Weave \u2014 60MM",
    "productSlug": "holland-stone",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "4 x 8 x 2 3/8"
    ],
    "module": {
     "widthIn": 16,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 4,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 4,
       "y": 0,
       "w": 4,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 8,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 8,
       "y": 4,
       "w": 8,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 8,
       "w": 8,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 12,
       "w": 8,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 8,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 12,
       "y": 8,
       "w": 4,
       "h": 8,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/holland-stone--basket-weave-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Pairs of 4 x 8 alternate vertical/horizontal in 8 in squares; all whole stones."
   },
   {
    "name": "Stacked Grid \u2014 60MM",
    "productSlug": "holland-stone",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "4 x 8 x 2 3/8"
    ],
    "module": {
     "widthIn": 16,
     "heightIn": 8,
     "tiles": [
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 8,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 4,
       "w": 8,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 8,
       "y": 4,
       "w": 8,
       "h": 4,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/holland-stone--stacked-grid-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Aligned grid, all whole stones."
   }
  ]
 },
{
  "product": "Mega-Cambridge",
  "productSlug": "mega-cambridge",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "3-Piece Tile",
    "productSlug": "mega-cambridge",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 9 x 1 3/16",
     "9 x 9 x 1 3/16",
     "9 x 12 x 1 3/16"
    ],
    "module": {
     "widthIn": 21,
     "heightIn": 18,
     "tiles": [
      {
       "sizeLabel": "9 x 9 x 1 3/16",
       "x": 0,
       "y": 0,
       "w": 9,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 12 x 1 3/16",
       "x": 9,
       "y": 0,
       "w": 12,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 9 x 1 3/16",
       "x": 0,
       "y": 9,
       "w": 6,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 1 3/16",
       "x": 6,
       "y": 9,
       "w": 6,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 9 x 1 3/16",
       "x": 12,
       "y": 9,
       "w": 9,
       "h": 9,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/mega-cambridge--3-piece-tile.png"
   },
   {
    "name": "3-Piece — 60MM",
    "productSlug": "mega-cambridge",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 9 x 2 3/8",
     "9 x 9 x 2 3/8",
     "9 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 21,
     "heightIn": 18,
     "tiles": [
      {
       "sizeLabel": "9 x 9 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 9,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 12 x 2 3/8",
       "x": 9,
       "y": 0,
       "w": 12,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 0,
       "y": 9,
       "w": 6,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 6,
       "y": 9,
       "w": 6,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 9 x 2 3/8",
       "x": 12,
       "y": 9,
       "w": 9,
       "h": 9,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/mega-cambridge--3-piece-60mm.png"
   },
   {
    "name": "3-Piece — 80MM",
    "productSlug": "mega-cambridge",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 9 x 3 1/8",
     "9 x 9 x 3 1/8",
     "9 x 12 x 3 1/8"
    ],
    "module": {
     "widthIn": 21,
     "heightIn": 18,
     "tiles": [
      {
       "sizeLabel": "9 x 9 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 9,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 12 x 3 1/8",
       "x": 9,
       "y": 0,
       "w": 12,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 9 x 3 1/8",
       "x": 0,
       "y": 9,
       "w": 6,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 3 1/8",
       "x": 6,
       "y": 9,
       "w": 6,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 9 x 3 1/8",
       "x": 12,
       "y": 9,
       "w": 9,
       "h": 9,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/mega-cambridge--3-piece-80mm.png"
   },
   {
    "name": "Modular Ashlar \u2014 60MM",
    "productSlug": "mega-cambridge",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "6 x 9 x 2 3/8",
     "9 x 9 x 2 3/8",
     "9 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 27,
     "heightIn": 18,
     "tiles": [
      {
       "sizeLabel": "9 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "9 x 9 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 9,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 21,
       "y": 0,
       "w": 6,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 0,
       "y": 9,
       "w": 6,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 9 x 2 3/8",
       "x": 6,
       "y": 9,
       "w": 9,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 12 x 2 3/8",
       "x": 15,
       "y": 9,
       "w": 12,
       "h": 9,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/mega-cambridge--modular-ashlar-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Two 9 in bands with the three printed sizes in opposed order; all whole units."
   }
  ]
 },
{
  "product": "Oceanside Series",
  "productSlug": "oceanside-series",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Modular Mix",
    "productSlug": "oceanside-series",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "4 x 8 x 1 3/16",
     "12 x 12 x 1 3/16"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 8,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 1 3/16",
       "x": 16,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 12 x 1 3/16",
       "x": 0,
       "y": 4,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 1 3/16",
       "x": 12,
       "y": 4,
       "w": 12,
       "h": 12,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/oceanside-series--modular-mix.png",
    "notes": "Standard layout: BELCOMM26 (Florida 2026 Commercial Offering) prints the Oceanside Series as individual units in its table (p.11) with no laying pattern or combination set, so this modular mix is a standard layout built from the printed sizes, never a catalog pattern."
   },
   {
    "name": "Modular Mix — 60MM",
    "productSlug": "oceanside-series",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "4 x 8 x 2 3/8",
     "8 x 8 x 2 3/8",
     "8 x 12 x 2 3/8",
     "12 x 12 x 2 3/8",
     "16 x 16 x 2 3/8"
    ],
    "module": {
     "widthIn": 32,
     "heightIn": 40,
     "tiles": [
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 8,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 16,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 24,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 4,
       "w": 4,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 8 x 2 3/8",
       "x": 4,
       "y": 4,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 8 x 2 3/8",
       "x": 12,
       "y": 4,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 12 x 2 3/8",
       "x": 20,
       "y": 4,
       "w": 12,
       "h": 8,
       "rot": 90
      },
      {
       "sizeLabel": "8 x 12 x 2 3/8",
       "x": 0,
       "y": 12,
       "w": 8,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 8,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 20,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "16 x 16 x 2 3/8",
       "x": 0,
       "y": 24,
       "w": 16,
       "h": 16,
       "rot": 0
      },
      {
       "sizeLabel": "16 x 16 x 2 3/8",
       "x": 16,
       "y": 24,
       "w": 16,
       "h": 16,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/oceanside-series--modular-mix-60mm.png",
    "notes": "Standard layout: BELCOMM26 (Florida 2026 Commercial Offering) prints the Oceanside Series as individual units in its table (p.11) with no laying pattern or combination set, so this modular mix is a standard layout built from the printed sizes, never a catalog pattern."
   }
  ]
 },
{
  "product": "Aqualine",
  "productSlug": "aqualine",
  "category": "Permeable Pavers",
  "patterns": [
   {
    "name": "3-Piece Ashlar",
    "productSlug": "aqualine",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "4 1/2 x 4 1/2 x 3 1/8",
     "4 1/2 x 9 x 3 1/8",
     "9 x 9 x 3 1/8"
    ],
    "module": {
     "widthIn": 13.5,
     "heightIn": 13.5,
     "tiles": [
      {
       "sizeLabel": "4 1/2 x 4 1/2 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 4.5,
       "h": 4.5,
       "rot": 0
      },
      {
       "sizeLabel": "4 1/2 x 9 x 3 1/8",
       "x": 4.5,
       "y": 0,
       "w": 9,
       "h": 4.5,
       "rot": 90
      },
      {
       "sizeLabel": "4 1/2 x 9 x 3 1/8",
       "x": 0,
       "y": 4.5,
       "w": 4.5,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 9 x 3 1/8",
       "x": 4.5,
       "y": 4.5,
       "w": 9,
       "h": 9,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/aqualine--3-piece-ashlar.png"
   },
   {
    "name": "Modular Ashlar",
    "productSlug": "aqualine",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "4 1/2 x 4 1/2 x 3 1/8",
     "4 1/2 x 9 x 3 1/8",
     "9 x 9 x 3 1/8"
    ],
    "module": {
     "widthIn": 18,
     "heightIn": 13.5,
     "tiles": [
      {
       "sizeLabel": "4 1/2 x 9 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 9,
       "h": 4.5,
       "rot": 90
      },
      {
       "sizeLabel": "4 1/2 x 4 1/2 x 3 1/8",
       "x": 9,
       "y": 0,
       "w": 4.5,
       "h": 4.5,
       "rot": 0
      },
      {
       "sizeLabel": "4 1/2 x 4 1/2 x 3 1/8",
       "x": 13.5,
       "y": 0,
       "w": 4.5,
       "h": 4.5,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 9 x 3 1/8",
       "x": 0,
       "y": 4.5,
       "w": 9,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "4 1/2 x 9 x 3 1/8",
       "x": 9,
       "y": 4.5,
       "w": 4.5,
       "h": 9,
       "rot": 0
      },
      {
       "sizeLabel": "4 1/2 x 9 x 3 1/8",
       "x": 13.5,
       "y": 4.5,
       "w": 4.5,
       "h": 9,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/aqualine--modular-ashlar.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. A 4 1/2 in band over a 9 in band mixing all three printed sizes \u2014 a second ashlar module beside the catalog 3-Piece Ashlar; all whole units."
   }
  ]
 },
{
  "product": "Turfstone",
  "productSlug": "turfstone",
  "category": "Permeable Pavers",
  "patterns": [
   {
    "name": "Running Bond",
    "productSlug": "turfstone",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "15 3/4 x 23 5/8 x 3 1/8"
    ],
    "module": {
     "widthIn": 47.25,
     "heightIn": 31.5,
     "tiles": [
      {
       "sizeLabel": "15 3/4 x 23 5/8 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 23.625,
       "h": 15.75,
       "rot": 90
      },
      {
       "sizeLabel": "15 3/4 x 23 5/8 x 3 1/8",
       "x": 23.625,
       "y": 0,
       "w": 23.625,
       "h": 15.75,
       "rot": 90
      },
      {
       "sizeLabel": "15 3/4 x 23 5/8 x 3 1/8",
       "x": 0,
       "y": 15.75,
       "w": 11.8125,
       "h": 15.75,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "15 3/4 x 23 5/8 x 3 1/8",
       "x": 11.8125,
       "y": 15.75,
       "w": 23.625,
       "h": 15.75,
       "rot": 90
      },
      {
       "sizeLabel": "15 3/4 x 23 5/8 x 3 1/8",
       "x": 35.4375,
       "y": 15.75,
       "w": 11.8125,
       "h": 15.75,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/turfstone--running-bond.png"
   }
  ]
 },
{
  "product": "Glocal",
  "productSlug": "glocal",
  "category": "Porcelain Pavers",
  "patterns": [
   {
    "name": "Modular Mix",
    "productSlug": "glocal",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "24 x 24",
     "24 x 48",
     "36 x 36",
     "48 x 48"
    ],
    "module": {
     "widthIn": 70.71,
     "heightIn": 106.06,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 23.54,
       "y": 0,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "36 x 36",
       "x": 0,
       "y": 23.54,
       "w": 35.35,
       "h": 35.35,
       "rot": 0
      },
      {
       "sizeLabel": "36 x 36",
       "x": 35.35,
       "y": 23.54,
       "w": 35.35,
       "h": 35.35,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0,
       "y": 58.89,
       "w": 23.54,
       "h": 47.17,
       "rot": 0
      },
      {
       "sizeLabel": "48 x 48",
       "x": 23.54,
       "y": 58.89,
       "w": 47.17,
       "h": 47.17,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/glocal--modular-mix.png",
    "notes": "Module width is set to the true tile extent: the printed exact dimensions are independently rounded metric conversions (the long unit prints 47.17 while 2 x 23.54 = 47.08), so a hairline joint variance of up to 0.09 in appears where modules repeat."
   }
  ]
 },
{
  "product": "Lagoon",
  "productSlug": "lagoon",
  "category": "Porcelain Pavers",
  "patterns": [
   {
    "name": "Running Bond",
    "productSlug": "lagoon",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 94.34,
     "heightIn": 47.08,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0,
       "y": 0,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 47.17,
       "y": 0,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0,
       "y": 23.54,
       "w": 23.585,
       "h": 23.54,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "24 x 48",
       "x": 23.585,
       "y": 23.54,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 70.755,
       "y": 23.54,
       "w": 23.585,
       "h": 23.54,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/lagoon--running-bond.png"
   },
   {
    "name": "Stacked Grid",
    "productSlug": "lagoon",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 94.34,
     "heightIn": 47.08,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0,
       "y": 0,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 47.17,
       "y": 0,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0,
       "y": 23.54,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 47.17,
       "y": 23.54,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/lagoon--stacked-grid.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Aligned grid at the face's true metric size, all whole tiles."
   }
  ]
 },
{
  "product": "Noon",
  "productSlug": "noon",
  "category": "Porcelain Pavers",
  "patterns": [
   {
    "name": "Modular Mix",
    "productSlug": "noon",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "8 x 48",
     "12 x 48"
    ],
    "module": {
     "widthIn": 46.38,
     "heightIn": 47.17,
     "tiles": [
      {
       "sizeLabel": "8 x 48",
       "x": 0,
       "y": 0,
       "w": 7.64,
       "h": 47.17,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 48",
       "x": 7.64,
       "y": 0,
       "w": 7.64,
       "h": 47.17,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 48",
       "x": 15.28,
       "y": 0,
       "w": 7.64,
       "h": 47.17,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 48",
       "x": 22.92,
       "y": 0,
       "w": 11.73,
       "h": 47.17,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 48",
       "x": 34.65,
       "y": 0,
       "w": 11.73,
       "h": 47.17,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/noon--modular-mix.png"
   },
   {
    "name": "Running Bond \u2014 1/3 Offset",
    "productSlug": "noon",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 48"
    ],
    "module": {
     "widthIn": 141.51,
     "heightIn": 35.19,
     "tiles": [
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 0,
       "w": 47.17,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 47.17,
       "y": 0,
       "w": 47.17,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 94.34,
       "y": 0,
       "w": 47.17,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 11.73,
       "w": 31.45,
       "h": 11.73,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 31.45,
       "y": 11.73,
       "w": 47.17,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 78.62,
       "y": 11.73,
       "w": 47.17,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 125.79,
       "y": 11.73,
       "w": 15.72,
       "h": 11.73,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 23.46,
       "w": 15.72,
       "h": 11.73,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 15.72,
       "y": 23.46,
       "w": 47.17,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 62.89,
       "y": 23.46,
       "w": 47.17,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 110.06,
       "y": 23.46,
       "w": 31.45,
       "h": 11.73,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/noon--running-bond-1-3-offset.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Each row shifts one third of the plank length (thirds of the 47.17 in face: 15.72/31.45); row-end pieces are third cuts of the same plank (marked cut)."
   }
  ]
 },
{
  "product": "Norr",
  "productSlug": "norr",
  "category": "Porcelain Pavers",
  "patterns": [
   {
    "name": "Modular Mix",
    "productSlug": "norr",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "24 x 24",
     "36 x 36"
    ],
    "module": {
     "widthIn": 70.7,
     "heightIn": 58.89,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 23.54,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 47.08,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "36 x 36",
       "x": 0,
       "y": 23.54,
       "w": 35.35,
       "h": 35.35,
       "rot": 0
      },
      {
       "sizeLabel": "36 x 36",
       "x": 35.35,
       "y": 23.54,
       "w": 35.35,
       "h": 35.35,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/norr--modular-mix.png",
    "notes": "Module width is set to the true tile extent: the printed exact dimensions are independently rounded metric conversions (the long unit prints 47.17 while 2 x 23.54 = 47.08), so a hairline joint variance of up to 0.09 in appears where modules repeat."
   },
   {
    "name": "Stacked Grid",
    "productSlug": "norr",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 47.08,
     "heightIn": 47.08,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 23.54,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 0,
       "y": 23.54,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 23.54,
       "y": 23.54,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/norr--stacked-grid.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Aligned grid at the face's true metric size, all whole tiles."
   }
  ]
 },
{
  "product": "Quarziti 2.0",
  "productSlug": "quarziti-2-0",
  "category": "Porcelain Pavers",
  "patterns": [
   {
    "name": "Modular Mix",
    "productSlug": "quarziti-2-0",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "12 x 24",
     "18 x 36",
     "24 x 48"
    ],
    "module": {
     "widthIn": 70.63,
     "heightIn": 70.62,
     "tiles": [
      {
       "sizeLabel": "12 x 24",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24",
       "x": 23.54,
       "y": 0,
       "w": 23.54,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24",
       "x": 47.08,
       "y": 0,
       "w": 23.54,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24",
       "x": 0,
       "y": 11.73,
       "w": 11.73,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 24",
       "x": 11.73,
       "y": 11.73,
       "w": 11.73,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 23.46,
       "y": 11.73,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "18 x 36",
       "x": 0,
       "y": 35.27,
       "w": 17.64,
       "h": 35.35,
       "rot": 0
      },
      {
       "sizeLabel": "18 x 36",
       "x": 17.64,
       "y": 35.27,
       "w": 17.64,
       "h": 35.35,
       "rot": 0
      },
      {
       "sizeLabel": "18 x 36",
       "x": 35.28,
       "y": 35.27,
       "w": 17.64,
       "h": 35.35,
       "rot": 0
      },
      {
       "sizeLabel": "18 x 36",
       "x": 52.92,
       "y": 35.27,
       "w": 17.64,
       "h": 35.35,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/quarziti-2-0--modular-mix.png",
    "notes": "Module width is set to the true tile extent: the printed exact dimensions are independently rounded metric conversions (the long unit prints 47.17 while 2 x 23.54 = 47.08), so a hairline joint variance of up to 0.09 in appears where modules repeat."
   },
   {
    "name": "Grid",
    "productSlug": "quarziti-2-0",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 23.54,
     "heightIn": 23.54,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/quarziti-2-0--grid.png"
   },
   {
    "name": "Running Bond \u2014 12 x 24",
    "productSlug": "quarziti-2-0",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 24"
    ],
    "module": {
     "widthIn": 47.08,
     "heightIn": 23.46,
     "tiles": [
      {
       "sizeLabel": "12 x 24",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24",
       "x": 23.54,
       "y": 0,
       "w": 23.54,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24",
       "x": 0,
       "y": 11.73,
       "w": 11.77,
       "h": 11.73,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 24",
       "x": 11.77,
       "y": 11.73,
       "w": 23.54,
       "h": 11.73,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24",
       "x": 35.31,
       "y": 11.73,
       "w": 11.77,
       "h": 11.73,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/quarziti-2-0--running-bond-12-x-24.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Half-bond rows at the face's true metric size; row ends are half cuts of the same tile (marked cut)."
   }
  ]
 },
{
  "product": "Silverlake",
  "productSlug": "silverlake",
  "category": "Porcelain Pavers",
  "patterns": [
   {
    "name": "Modular Mix",
    "productSlug": "silverlake",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "24 x 24",
     "24 x 48"
    ],
    "module": {
     "widthIn": 47.17,
     "heightIn": 47.08,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 23.54,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0,
       "y": 23.54,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/silverlake--modular-mix.png",
    "notes": "Module width is set to the true tile extent: the printed exact dimensions are independently rounded metric conversions (the long unit prints 47.17 while 2 x 23.54 = 47.08), so a hairline joint variance of up to 0.09 in appears where modules repeat."
   },
   {
    "name": "Stacked Grid",
    "productSlug": "silverlake",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 94.34,
     "heightIn": 47.08,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0,
       "y": 0,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 47.17,
       "y": 0,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0,
       "y": 23.54,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 47.17,
       "y": 23.54,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/silverlake--stacked-grid.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Aligned grid at the face's true metric size, all whole tiles."
   }
  ]
 },
{
  "product": "Unico 2.0",
  "productSlug": "unico-2-0",
  "category": "Coping & Steps",
  "patterns": [
   {
    "name": "Running Bond",
    "productSlug": "unico-2-0",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "Unico"
    ],
    "module": {
     "widthIn": 47.08,
     "heightIn": 25.98,
     "tiles": [
      {
       "sizeLabel": "Unico",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 12.99,
       "rot": 90
      },
      {
       "sizeLabel": "Unico",
       "x": 23.54,
       "y": 0,
       "w": 23.54,
       "h": 12.99,
       "rot": 90
      },
      {
       "sizeLabel": "Unico",
       "x": 0,
       "y": 12.99,
       "w": 11.77,
       "h": 12.99,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "Unico",
       "x": 11.77,
       "y": 12.99,
       "w": 23.54,
       "h": 12.99,
       "rot": 90
      },
      {
       "sizeLabel": "Unico",
       "x": 35.31,
       "y": 12.99,
       "w": 11.77,
       "h": 12.99,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/unico-2-0--running-bond.png"
   }
  ]
 },
{
  "product": "Belair Wall 2.0",
  "productSlug": "belair-wall-2-0",
  "category": "Walls",
  "patterns": [
   {
    "name": "Freestanding Coursing — 6 in",
    "productSlug": "belair-wall-2-0",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "6 x 6 x 5",
     "6 x 10 x 5"
    ],
    "module": {
     "widthIn": 18,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "6 x 6 x 5",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 5",
       "x": 6,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 5",
       "x": 12,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 10 x 5",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 10,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 10 x 5",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 10,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 10 x 5",
       "x": 12,
       "y": 6,
       "w": 6,
       "h": 10,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/belair-wall-2-0--freestanding-coursing-6-in.png"
   },
   {
    "name": "Retaining Coursing & Cap — 6 in",
    "productSlug": "belair-wall-2-0",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "6 x 16 x 5",
     "6 x 6 x 8",
     "6 x 10 x 8",
     "6 x 16 x 8",
     "6 x 16 x 8 [Column/Corner Cap]",
     "3 x 7/8 x 13 1/2"
    ],
    "module": {
     "widthIn": 54,
     "heightIn": 15,
     "tiles": [
      {
       "sizeLabel": "3 x 7/8 x 13 1/2",
       "x": 0,
       "y": 0,
       "w": 13.5,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 7/8 x 13 1/2",
       "x": 13.5,
       "y": 0,
       "w": 13.5,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 7/8 x 13 1/2",
       "x": 27,
       "y": 0,
       "w": 13.5,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 7/8 x 13 1/2",
       "x": 40.5,
       "y": 0,
       "w": 13.5,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 16 x 5",
       "x": 0,
       "y": 3,
       "w": 16,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 8",
       "x": 16,
       "y": 3,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 16 x 8",
       "x": 22,
       "y": 3,
       "w": 16,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 16 x 8 [Column/Corner Cap]",
       "x": 38,
       "y": 3,
       "w": 16,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 16 x 5",
       "x": 0,
       "y": 9,
       "w": 16,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 8",
       "x": 16,
       "y": 9,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 8",
       "x": 22,
       "y": 9,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 10 x 8",
       "x": 28,
       "y": 9,
       "w": 10,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 16 x 8",
       "x": 38,
       "y": 9,
       "w": 16,
       "h": 6,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/belair-wall-2-0--retaining-coursing-cap-6-in.png"
   }
  ]
 },
{
  "product": "Castlemanor Grana",
  "productSlug": "castlemanor-grana",
  "category": "Walls",
  "patterns": [
   {
    "name": "3-Piece Coursing",
    "productSlug": "castlemanor-grana",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 6/4 x 10",
     "6 x 12 / 10 x 10",
     "6 x 16 / 14 x 10"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 32,
     "tiles": [
      {
       "sizeLabel": "6 x 12 / 10 x 10",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 / 10 x 10",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6/4 x 10",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 10,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 6/4 x 10",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 10,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 6/4 x 10",
       "x": 12,
       "y": 6,
       "w": 6,
       "h": 10,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 6/4 x 10",
       "x": 18,
       "y": 6,
       "w": 6,
       "h": 10,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 16 / 14 x 10",
       "x": 0,
       "y": 16,
       "w": 6,
       "h": 16,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 16 / 14 x 10",
       "x": 6,
       "y": 16,
       "w": 6,
       "h": 16,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 16 / 14 x 10",
       "x": 12,
       "y": 16,
       "w": 6,
       "h": 16,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 16 / 14 x 10",
       "x": 18,
       "y": 16,
       "w": 6,
       "h": 16,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/castlemanor-grana--3-piece-coursing.png"
   },
   {
    "name": "Cap & Corner Course",
    "productSlug": "castlemanor-grana",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "Pins",
     "3 x 12 x 10"
    ],
    "module": {
     "widthIn": 6,
     "heightIn": 12.375,
     "tiles": [
      {
       "sizeLabel": "Pins",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 0.375,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 10",
       "x": 0,
       "y": 0.375,
       "w": 3,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 10",
       "x": 3,
       "y": 0.375,
       "w": 3,
       "h": 12,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/castlemanor-grana--cap-corner-course.png"
   }
  ]
 },
{
  "product": "Castlemanor (standard)",
  "productSlug": "castlemanor",
  "category": "Walls",
  "patterns": [
   {
    "name": "3-Piece Coursing",
    "productSlug": "castlemanor",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 6/4 x 10",
     "6 x 12 / 10 x 10",
     "6 x 16 / 14 x 10"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 32,
     "tiles": [
      {
       "sizeLabel": "6 x 12 / 10 x 10",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 / 10 x 10",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6/4 x 10",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 10,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 6/4 x 10",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 10,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 6/4 x 10",
       "x": 12,
       "y": 6,
       "w": 6,
       "h": 10,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 6/4 x 10",
       "x": 18,
       "y": 6,
       "w": 6,
       "h": 10,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 16 / 14 x 10",
       "x": 0,
       "y": 16,
       "w": 6,
       "h": 16,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 16 / 14 x 10",
       "x": 6,
       "y": 16,
       "w": 6,
       "h": 16,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 16 / 14 x 10",
       "x": 12,
       "y": 16,
       "w": 6,
       "h": 16,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 16 / 14 x 10",
       "x": 18,
       "y": 16,
       "w": 6,
       "h": 16,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/castlemanor--3-piece-coursing.png"
   },
   {
    "name": "Cap & Corner Course",
    "productSlug": "castlemanor",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "Pins",
     "3 x 12 x 10"
    ],
    "module": {
     "widthIn": 6,
     "heightIn": 12.375,
     "tiles": [
      {
       "sizeLabel": "Pins",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 0.375,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 10",
       "x": 0,
       "y": 0.375,
       "w": 3,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 10",
       "x": 3,
       "y": 0.375,
       "w": 3,
       "h": 12,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/castlemanor--cap-corner-course.png"
   }
  ]
 },
{
  "product": "Weston Stone",
  "productSlug": "weston-stone",
  "category": "Walls",
  "patterns": [
   {
    "name": "3-Piece Wall Coursing",
    "productSlug": "weston-stone",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "Universal",
     "4 x 8/5 x 8",
     "4 x 12 / 9 x 8",
     "4 x 16 / 13 x 8"
    ],
    "module": {
     "widthIn": 16,
     "heightIn": 20,
     "tiles": [
      {
       "sizeLabel": "4 x 16 / 13 x 8",
       "x": 0,
       "y": 0,
       "w": 16,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8/5 x 8",
       "x": 0,
       "y": 4,
       "w": 8,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8/5 x 8",
       "x": 8,
       "y": 4,
       "w": 8,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "Universal",
       "x": 0,
       "y": 8,
       "w": 4,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "Universal",
       "x": 4,
       "y": 8,
       "w": 4,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "Universal",
       "x": 8,
       "y": 8,
       "w": 4,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 12 / 9 x 8",
       "x": 12,
       "y": 8,
       "w": 4,
       "h": 12,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/weston-stone--3-piece-wall-coursing.png"
   }
  ]
 },
{
  "product": "Easton Stone",
  "productSlug": "easton-stone",
  "category": "Walls",
  "patterns": [
   {
    "name": "3-Piece Wall Coursing",
    "productSlug": "easton-stone",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "Universal",
     "4 x 8/5 x 8",
     "4 x 12 / 9 x 8",
     "4 x 16 / 13 x 8"
    ],
    "module": {
     "widthIn": 16,
     "heightIn": 20,
     "tiles": [
      {
       "sizeLabel": "4 x 16 / 13 x 8",
       "x": 0,
       "y": 0,
       "w": 16,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8/5 x 8",
       "x": 0,
       "y": 4,
       "w": 8,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 8/5 x 8",
       "x": 8,
       "y": 4,
       "w": 8,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "Universal",
       "x": 0,
       "y": 8,
       "w": 4,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "Universal",
       "x": 4,
       "y": 8,
       "w": 4,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "Universal",
       "x": 8,
       "y": 8,
       "w": 4,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 12 / 9 x 8",
       "x": 12,
       "y": 8,
       "w": 4,
       "h": 12,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/easton-stone--3-piece-wall-coursing.png"
   }
  ]
 },
{
  "product": "Diamond Pro 9D",
  "productSlug": "diamond-pro-9d",
  "category": "Walls",
  "patterns": [
   {
    "name": "Running Coursing",
    "productSlug": "diamond-pro-9d",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "6 x 17 3/4 x 9",
     "6 x 18 x 6"
    ],
    "module": {
     "widthIn": 18,
     "heightIn": 23.75,
     "tiles": [
      {
       "sizeLabel": "6 x 18 x 6",
       "x": 0,
       "y": 0,
       "w": 18,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 17 3/4 x 9",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 17.75,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 17 3/4 x 9",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 17.75,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 17 3/4 x 9",
       "x": 12,
       "y": 6,
       "w": 6,
       "h": 17.75,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/diamond-pro-9d--running-coursing.png"
   }
  ]
 },
{
  "product": "Diamond Pro",
  "productSlug": "diamond-pro",
  "category": "Walls",
  "patterns": [
   {
    "name": "Running Coursing",
    "productSlug": "diamond-pro",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "8 x 18 x 12",
     "8 x 18 x 12 [diagram 5]",
     "Large Unit",
     "Small & Medium Units",
     "8 x 11 x 12"
    ],
    "module": {
     "widthIn": 32,
     "heightIn": 41,
     "tiles": [
      {
       "sizeLabel": "8 x 11 x 12",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 11,
       "rot": 90
      },
      {
       "sizeLabel": "8 x 11 x 12",
       "x": 8,
       "y": 0,
       "w": 8,
       "h": 11,
       "rot": 90
      },
      {
       "sizeLabel": "8 x 11 x 12",
       "x": 16,
       "y": 0,
       "w": 8,
       "h": 11,
       "rot": 90
      },
      {
       "sizeLabel": "8 x 11 x 12",
       "x": 24,
       "y": 0,
       "w": 8,
       "h": 11,
       "rot": 90
      },
      {
       "sizeLabel": "Small & Medium Units",
       "x": 0,
       "y": 11,
       "w": 8,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "Small & Medium Units",
       "x": 8,
       "y": 11,
       "w": 8,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "Small & Medium Units",
       "x": 16,
       "y": 11,
       "w": 8,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "Small & Medium Units",
       "x": 24,
       "y": 11,
       "w": 8,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "8 x 18 x 12",
       "x": 0,
       "y": 23,
       "w": 8,
       "h": 18,
       "rot": 90
      },
      {
       "sizeLabel": "8 x 18 x 12",
       "x": 8,
       "y": 23,
       "w": 8,
       "h": 18,
       "rot": 90
      },
      {
       "sizeLabel": "8 x 18 x 12 [diagram 5]",
       "x": 16,
       "y": 23,
       "w": 8,
       "h": 18,
       "rot": 90
      },
      {
       "sizeLabel": "Large Unit",
       "x": 24,
       "y": 23,
       "w": 8,
       "h": 18,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/diamond-pro--running-coursing.png"
   },
   {
    "name": "Cap & Corner Course",
    "productSlug": "diamond-pro",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "XL Cap",
     "Pro Cap",
     "Pro Corner",
     "5” Lx 0.5” D"
    ],
    "module": {
     "widthIn": 18,
     "heightIn": 15.5,
     "tiles": [
      {
       "sizeLabel": "XL Cap",
       "x": 0,
       "y": 0,
       "w": 18,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "Pro Cap",
       "x": 0,
       "y": 3,
       "w": 17,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "Pro Corner",
       "x": 0,
       "y": 7,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "5” Lx 0.5” D",
       "x": 0,
       "y": 15,
       "w": 5,
       "h": 0.5,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/diamond-pro--cap-corner-course.png"
   }
  ]
 },
{
  "product": "Torpedo Base Block",
  "productSlug": "torpedo-base-block",
  "category": "Walls",
  "patterns": [
   {
    "name": "Running Coursing",
    "productSlug": "torpedo-base-block",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "4 x 15 3/4 x 11"
    ],
    "module": {
     "widthIn": 31.5,
     "heightIn": 8,
     "tiles": [
      {
       "sizeLabel": "4 x 15 3/4 x 11",
       "x": 0,
       "y": 0,
       "w": 15.75,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 15 3/4 x 11",
       "x": 15.75,
       "y": 0,
       "w": 15.75,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 15 3/4 x 11",
       "x": 0,
       "y": 4,
       "w": 7.875,
       "h": 4,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "4 x 15 3/4 x 11",
       "x": 7.875,
       "y": 4,
       "w": 15.75,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 15 3/4 x 11",
       "x": 23.625,
       "y": 4,
       "w": 7.875,
       "h": 4,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/torpedo-base-block--running-coursing.png"
   }
  ]
 },
{
  "product": "Bordeaux Series",
  "productSlug": "bordeaux-series",
  "category": "Fire & Outdoor Kitchens",
  "patterns": [
   {
    "name": "Kit Footprints",
    "productSlug": "bordeaux-series",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "Fireplace Wood Boxes",
     "Fireplace Wood Boxes [diagram 2]",
     "Grill Island",
     "Fireplace",
     "Linear Fire Table",
     "Linear Fireplace"
    ],
    "module": {
     "widthIn": 327.25,
     "heightIn": 42.5,
     "tiles": [
      {
       "sizeLabel": "Fireplace Wood Boxes",
       "x": 0,
       "y": 17.25,
       "w": 39,
       "h": 25.25,
       "rot": 0
      },
      {
       "sizeLabel": "Fireplace Wood Boxes [diagram 2]",
       "x": 39,
       "y": 17.25,
       "w": 39,
       "h": 25.25,
       "rot": 0
      },
      {
       "sizeLabel": "Grill Island",
       "x": 78,
       "y": 12.5,
       "w": 71,
       "h": 30,
       "rot": 0
      },
      {
       "sizeLabel": "Fireplace",
       "x": 149,
       "y": 11.5,
       "w": 51,
       "h": 31,
       "rot": 0
      },
      {
       "sizeLabel": "Linear Fire Table",
       "x": 200,
       "y": 7.5,
       "w": 74,
       "h": 35,
       "rot": 0
      },
      {
       "sizeLabel": "Linear Fireplace",
       "x": 274,
       "y": 0,
       "w": 53.25,
       "h": 42.5,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/bordeaux-series--kit-footprints.png",
    "notes": "Bordeaux sizes are complete kit footprints (W x D as printed), not laying units; shown as a footprint layout."
   }
  ]
 },
{
  "product": "Seville Coping",
  "productSlug": "seville-coping",
  "category": "Coping & Steps",
  "patterns": [
   {
    "name": "Running Bond",
    "productSlug": "seville-coping",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "4 x 9 x 2 3/8 | 2 1/2 inch drop"
    ],
    "module": {
     "widthIn": 18,
     "heightIn": 8,
     "tiles": [
      {
       "sizeLabel": "4 x 9 x 2 3/8 | 2 1/2 inch drop",
       "x": 0,
       "y": 0,
       "w": 9,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 9 x 2 3/8 | 2 1/2 inch drop",
       "x": 9,
       "y": 0,
       "w": 9,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 9 x 2 3/8 | 2 1/2 inch drop",
       "x": 0,
       "y": 4,
       "w": 4.5,
       "h": 4,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "4 x 9 x 2 3/8 | 2 1/2 inch drop",
       "x": 4.5,
       "y": 4,
       "w": 9,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 9 x 2 3/8 | 2 1/2 inch drop",
       "x": 13.5,
       "y": 4,
       "w": 4.5,
       "h": 4,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/seville-coping--running-bond.png"
   }
  ]
 },
{
  "product": "Dimensions",
  "productSlug": "dimensions",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Dimensions 12 — 3-Piece | 60MM",
    "productSlug": "dimensions",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 12 x 2 3/8",
     "12 x 12 x 2 3/8",
     "12 x 18 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 24,
     "tiles": [
      {
       "sizeLabel": "12 x 18 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 18,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 18,
       "y": 0,
       "w": 6,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 0,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 12,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 18,
       "w": 12,
       "h": 6,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--dimensions-12-3-piece-60mm.png"
   },
   {
    "name": "Dimensions 6 — 3-Piece | 60MM",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "3 x 6 x 2 3/8",
     "6 x 6 x 2 3/8",
     "6 x 9 x 2 3/8"
    ],
    "module": {
     "widthIn": 12,
     "heightIn": 12,
     "tiles": [
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 9,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 6 x 2 3/8",
       "x": 9,
       "y": 0,
       "w": 3,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 6 x 2 3/8",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 6 x 2 3/8",
       "x": 6,
       "y": 9,
       "w": 6,
       "h": 3,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--dimensions-6-3-piece-60mm.png"
   },
   {
    "name": "Dimensions 18 — 3-Piece | 60MM",
    "productSlug": "dimensions",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "9 x 18 x 2 3/8",
     "18 x 18 x 2 3/8",
     "18 x 27 x 2 3/8"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 36,
     "tiles": [
      {
       "sizeLabel": "18 x 27 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 27,
       "h": 18,
       "rot": 90
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 27,
       "y": 0,
       "w": 9,
       "h": 18,
       "rot": 0
      },
      {
       "sizeLabel": "18 x 18 x 2 3/8",
       "x": 0,
       "y": 18,
       "w": 18,
       "h": 18,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 18,
       "y": 18,
       "w": 18,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 18,
       "y": 27,
       "w": 18,
       "h": 9,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--dimensions-18-3-piece-60mm.png"
   },
   {
    "name": "Dimensions 12 — 3-Piece | 80MM",
    "productSlug": "dimensions",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 12 x 3 1/8",
     "12 x 12 x 3 1/8",
     "12 x 18 x 3 1/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 24,
     "tiles": [
      {
       "sizeLabel": "12 x 18 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 18,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 3 1/8",
       "x": 18,
       "y": 0,
       "w": 6,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 3 1/8",
       "x": 0,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 3 1/8",
       "x": 12,
       "y": 12,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 3 1/8",
       "x": 12,
       "y": 18,
       "w": 12,
       "h": 6,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--dimensions-12-3-piece-80mm.png"
   },
   {
    "name": "Stacked Grid — 3x12 | 60MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "3 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 6,
     "tiles": [
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 0,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 12,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--stacked-grid-3x12-60mm.png"
   },
   {
    "name": "Stacked Grid — 3x12 | 80MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "3 x 12 x 3 1/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 6,
     "tiles": [
      {
       "sizeLabel": "3 x 12 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 3 1/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 3 1/8",
       "x": 0,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 3 1/8",
       "x": 12,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--stacked-grid-3x12-80mm.png"
   },
   {
    "name": "Stacked Grid — 3x12 | 101.6MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "3 x 12 x 4"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 6,
     "tiles": [
      {
       "sizeLabel": "3 x 12 x 4",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 4",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 4",
       "x": 0,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 4",
       "x": 12,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--stacked-grid-3x12-101-6mm.png"
   },
   {
    "name": "Stacked Grid — 6x6 | 60MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "6 x 6 x 2 3/8"
    ],
    "module": {
     "widthIn": 12,
     "heightIn": 12,
     "tiles": [
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 6,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--stacked-grid-6x6-60mm.png"
   },
   {
    "name": "Stacked Grid — 6x6 | 80MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "6 x 6 x 3 1/8"
    ],
    "module": {
     "widthIn": 12,
     "heightIn": 12,
     "tiles": [
      {
       "sizeLabel": "6 x 6 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 3 1/8",
       "x": 6,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 3 1/8",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 3 1/8",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--stacked-grid-6x6-80mm.png"
   },
   {
    "name": "Running Bond — 6x12 | 60MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "6 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 12,
     "tiles": [
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 6,
       "y": 6,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 18,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--running-bond-6x12-60mm.png"
   },
   {
    "name": "Running Bond — 6x12 | 80MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "6 x 12 x 3 1/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 12,
     "tiles": [
      {
       "sizeLabel": "6 x 12 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 3 1/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 3 1/8",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "6 x 12 x 3 1/8",
       "x": 6,
       "y": 6,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 3 1/8",
       "x": 18,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--running-bond-6x12-80mm.png"
   },
   {
    "name": "Stacked Grid — 12x12 | 60MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 24,
     "tiles": [
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 0,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 12,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--stacked-grid-12x12-60mm.png"
   },
   {
    "name": "Running Bond — 9x18 | 60MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "9 x 18 x 2 3/8"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 18,
     "tiles": [
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 18,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 18,
       "y": 0,
       "w": 18,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 0,
       "y": 9,
       "w": 9,
       "h": 9,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 9,
       "y": 9,
       "w": 18,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 27,
       "y": 9,
       "w": 9,
       "h": 9,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--running-bond-9x18-60mm.png"
   },
   {
    "name": "Running Bond — 12x24 | 60MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 24 x 2 3/8"
    ],
    "module": {
     "widthIn": 48,
     "heightIn": 24,
     "tiles": [
      {
       "sizeLabel": "12 x 24 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 24,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 2 3/8",
       "x": 24,
       "y": 0,
       "w": 24,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 2 3/8",
       "x": 0,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 24 x 2 3/8",
       "x": 12,
       "y": 12,
       "w": 24,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 2 3/8",
       "x": 36,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--running-bond-12x24-60mm.png"
   },
   {
    "name": "Running Bond — 15x30 | 60MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "15 x 30 x 2 3/8"
    ],
    "module": {
     "widthIn": 60,
     "heightIn": 30,
     "tiles": [
      {
       "sizeLabel": "15 x 30 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 30,
       "h": 15,
       "rot": 90
      },
      {
       "sizeLabel": "15 x 30 x 2 3/8",
       "x": 30,
       "y": 0,
       "w": 30,
       "h": 15,
       "rot": 90
      },
      {
       "sizeLabel": "15 x 30 x 2 3/8",
       "x": 0,
       "y": 15,
       "w": 15,
       "h": 15,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "15 x 30 x 2 3/8",
       "x": 15,
       "y": 15,
       "w": 30,
       "h": 15,
       "rot": 90
      },
      {
       "sizeLabel": "15 x 30 x 2 3/8",
       "x": 45,
       "y": 15,
       "w": 15,
       "h": 15,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--running-bond-15x30-60mm.png"
   },
   {
    "name": "Stacked Grid — 24x24 | 60MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24 x 2 3/8"
    ],
    "module": {
     "widthIn": 48,
     "heightIn": 48,
     "tiles": [
      {
       "sizeLabel": "24 x 24 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 24,
       "h": 24,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24 x 2 3/8",
       "x": 24,
       "y": 0,
       "w": 24,
       "h": 24,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24 x 2 3/8",
       "x": 0,
       "y": 24,
       "w": 24,
       "h": 24,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24 x 2 3/8",
       "x": 24,
       "y": 24,
       "w": 24,
       "h": 24,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--stacked-grid-24x24-60mm.png"
   },
   {
    "name": "Stacked Grid — 24x36 | 60MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 36 x 2 3/8"
    ],
    "module": {
     "widthIn": 72,
     "heightIn": 48,
     "tiles": [
      {
       "sizeLabel": "24 x 36 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 36,
       "h": 24,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 36 x 2 3/8",
       "x": 36,
       "y": 0,
       "w": 36,
       "h": 24,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 36 x 2 3/8",
       "x": 0,
       "y": 24,
       "w": 36,
       "h": 24,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 36 x 2 3/8",
       "x": 36,
       "y": 24,
       "w": 36,
       "h": 24,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--stacked-grid-24x36-60mm.png"
   },
   {
    "name": "Pinwheel \u2014 6x12 | 60MM",
    "productSlug": "dimensions",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "6 x 12 x 2 3/8",
     "6 x 6 x 2 3/8"
    ],
    "module": {
     "widthIn": 18,
     "heightIn": 18,
     "tiles": [
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 6,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 6,
       "y": 12,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--pinwheel-6x12-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Four 6 x 12 planks pinwheeled around a whole printed 6 x 6 \u2014 no cut pieces."
   },
   {
    "name": "Basket Weave \u2014 6x12 | 60MM",
    "productSlug": "dimensions",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "6 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 24,
     "tiles": [
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 6,
       "y": 0,
       "w": 6,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 6,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 12,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 18,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 12,
       "w": 6,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 18,
       "y": 12,
       "w": 6,
       "h": 12,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/dimensions--basket-weave-6x12-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Pairs of 6 x 12 alternate vertical/horizontal in 12 in squares; all whole units."
   }
  ]
 },
{
  "product": "Geometric Shapes",
  "productSlug": "geometric-shapes",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Geometric Accent Layout",
    "productSlug": "geometric-shapes",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "Diamond",
     "Parallelogram",
     "Hexagon"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 18,
     "tiles": [
      {
       "sizeLabel": "Diamond",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "Hexagon",
       "x": 12,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "Hexagon",
       "x": 18,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "Hexagon",
       "x": 12,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "Hexagon",
       "x": 18,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "Parallelogram",
       "x": 0,
       "y": 12,
       "w": 12,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "Parallelogram",
       "x": 0,
       "y": 15,
       "w": 12,
       "h": 3,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/geometric-shapes--geometric-accent-layout.png",
    "notes": "Shapes are placed by their bounding rectangles; the offering prints side lengths only, so the module is a layout schematic, not a cutting diagram."
   }
  ]
 },
{
  "product": "Hexagon Series",
  "productSlug": "hexagon-series",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Honeycomb Layout — 8 in",
    "productSlug": "hexagon-series",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "8\" Hexagon"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "8\" Hexagon",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8\" Hexagon",
       "x": 8,
       "y": 0,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8\" Hexagon",
       "x": 16,
       "y": 0,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8\" Hexagon",
       "x": 4,
       "y": 8,
       "w": 8,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8\" Hexagon",
       "x": 12,
       "y": 8,
       "w": 8,
       "h": 8,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/hexagon-series--honeycomb-layout-8-in.svg",
    "notes": "Hexagonal units shown by their square bounding boxes in offset rows; the offering prints nominal hexagon sizes only."
   },
   {
    "name": "Honeycomb Layout — 12 in",
    "productSlug": "hexagon-series",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12\" Hexagon"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 24,
     "tiles": [
      {
       "sizeLabel": "12\" Hexagon",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12\" Hexagon",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12\" Hexagon",
       "x": 24,
       "y": 0,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12\" Hexagon",
       "x": 6,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12\" Hexagon",
       "x": 18,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/hexagon-series--honeycomb-layout-12-in.svg",
    "notes": "Hexagonal units shown by their square bounding boxes in offset rows; the offering prints nominal hexagon sizes only."
   },
   {
    "name": "Honeycomb Layout — 16 in",
    "productSlug": "hexagon-series",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "16\" Hexagon"
    ],
    "module": {
     "widthIn": 48,
     "heightIn": 32,
     "tiles": [
      {
       "sizeLabel": "16\" Hexagon",
       "x": 0,
       "y": 0,
       "w": 16,
       "h": 16,
       "rot": 0
      },
      {
       "sizeLabel": "16\" Hexagon",
       "x": 16,
       "y": 0,
       "w": 16,
       "h": 16,
       "rot": 0
      },
      {
       "sizeLabel": "16\" Hexagon",
       "x": 32,
       "y": 0,
       "w": 16,
       "h": 16,
       "rot": 0
      },
      {
       "sizeLabel": "16\" Hexagon",
       "x": 8,
       "y": 16,
       "w": 16,
       "h": 16,
       "rot": 0
      },
      {
       "sizeLabel": "16\" Hexagon",
       "x": 24,
       "y": 16,
       "w": 16,
       "h": 16,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/hexagon-series--honeycomb-layout-16-in.svg",
    "notes": "Hexagonal units shown by their square bounding boxes in offset rows; the offering prints nominal hexagon sizes only."
   },
   {
    "name": "Honeycomb Layout — 6 in",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "Hexagon 6"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 24,
     "tiles": [
      {
       "sizeLabel": "Hexagon 6",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "Hexagon 6",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "Hexagon 6",
       "x": 24,
       "y": 0,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "Hexagon 6",
       "x": 6,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "Hexagon 6",
       "x": 18,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/hexagon-series--honeycomb-layout-6-in.svg"
   }
  ]
 },
{
  "product": "Brooklyn",
  "productSlug": "brooklyn",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Herringbone",
    "productSlug": "brooklyn",
    "mixed": false,
    "source": "catalog",
    "sizesUsed": [
     "3 x 9 x 2 3/8"
    ],
    "module": {
     "widthIn": 18.0,
     "heightIn": 18.0,
     "tiles": [
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 0.0,
       "y": 0.0,
       "w": 6.0,
       "h": 3.0,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 15.0,
       "y": 0.0,
       "w": 3.0,
       "h": 3.0,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 9.0,
       "y": 0.0,
       "w": 3.0,
       "h": 6.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 12.0,
       "y": 0.0,
       "w": 3.0,
       "h": 3.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 6.0,
       "y": 0.0,
       "w": 3.0,
       "h": 9.0,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 0.0,
       "y": 3.0,
       "w": 3.0,
       "h": 3.0,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 3.0,
       "y": 3.0,
       "w": 3.0,
       "h": 9.0,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 12.0,
       "y": 3.0,
       "w": 6.0,
       "h": 3.0,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 0.0,
       "y": 6.0,
       "w": 3.0,
       "h": 9.0,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 9.0,
       "y": 6.0,
       "w": 9.0,
       "h": 3.0,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 6.0,
       "y": 9.0,
       "w": 9.0,
       "h": 3.0,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 15.0,
       "y": 9.0,
       "w": 3.0,
       "h": 9.0,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 12.0,
       "y": 12.0,
       "w": 3.0,
       "h": 6.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 3.0,
       "y": 12.0,
       "w": 9.0,
       "h": 3.0,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 9.0,
       "y": 15.0,
       "w": 3.0,
       "h": 3.0,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 0.0,
       "y": 15.0,
       "w": 9.0,
       "h": 3.0,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/brooklyn--herringbone.png",
    "notes": "True lay added 2026-11-03 (pattern truth pass): Brooklyn's catalog field photo (the source of this product's unit cuts) lays a true herringbone — each 3 x 9 stone at 90 degrees to its neighbour, points alternating. The 18 x 18 in module's stone positions were read from the photo's own verified cut lattice (the 10 complete stones cut for the unit sets sit on it); whole stones plus the edge pieces the repeat cuts, marked cut. This replaces the earlier standard Stacked Grid entry, which contradicted the product's own patternLogic. The module repeats by translation in both axes."
   },
   {
    "name": "Basket Weave",
    "productSlug": "brooklyn",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "3 x 9 x 2 3/8"
    ],
    "module": {
     "widthIn": 18,
     "heightIn": 18,
     "tiles": [
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 3,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 3,
       "y": 0,
       "w": 3,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 6,
       "y": 0,
       "w": 3,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 9,
       "y": 0,
       "w": 9,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 9,
       "y": 3,
       "w": 9,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 9,
       "y": 6,
       "w": 9,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 0,
       "y": 9,
       "w": 9,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 0,
       "y": 12,
       "w": 9,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 0,
       "y": 15,
       "w": 9,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 9,
       "y": 9,
       "w": 3,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 12,
       "y": 9,
       "w": 3,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 9 x 2 3/8",
       "x": 15,
       "y": 9,
       "w": 3,
       "h": 9,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/brooklyn--basket-weave.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. The 3:1 basket weave: squares of three 3 x 9 stones alternate orientation; all whole stones."
   }
  ]
 },
{
  "product": "Charlestone",
  "productSlug": "charlestone",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "3-Piece | 60MM",
    "productSlug": "charlestone",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 6 x 2 3/8",
     "6 x 9 x 2 3/8",
     "6 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 18,
     "tiles": [
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 18,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 0,
       "y": 6,
       "w": 9,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 9,
       "y": 6,
       "w": 9,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 18,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 0,
       "y": 12,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 6,
       "y": 12,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 18,
       "y": 12,
       "w": 6,
       "h": 6,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/charlestone--ashlar-mix.png",
    "notes": "Catalog combination: BEL25 p.38 heads Charlestone '3-Piece Paver | 60mm' with modular sizing and prints the three sizes together (6 x 6, 6 x 9, 6 x 12); the module arrangement is the standard modular layout for that printed set. Renamed from 'Ashlar Mix' (which was labeled standard) in the 2026-11-03 pattern truth pass."
   },
   {
    "name": "Basket Weave \u2014 60MM",
    "productSlug": "charlestone",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "6 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 24,
     "tiles": [
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 6,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 6,
       "y": 0,
       "w": 6,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 6,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 12,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 18,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 12,
       "w": 6,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 18,
       "y": 12,
       "w": 6,
       "h": 12,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/charlestone--basket-weave-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Pairs of 6 x 12 alternate vertical/horizontal in 12 in squares; all whole units."
   },
   {
    "name": "Modular Ashlar",
    "productSlug": "charlestone",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "6 x 6 x 2 3/8",
     "6 x 9 x 2 3/8",
     "6 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 27,
     "heightIn": 12,
     "tiles": [
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 6,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 18,
       "y": 0,
       "w": 9,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 9 x 2 3/8",
       "x": 0,
       "y": 6,
       "w": 9,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 9,
       "y": 6,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 6 x 2 3/8",
       "x": 21,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/charlestone--modular-ashlar.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Two opposed rows mixing all three printed lengths; all whole units."
   }
  ]
 },
{
  "product": "Empire",
  "productSlug": "empire",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Stacked Grid — 60MM",
    "productSlug": "empire",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "3 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 6,
     "tiles": [
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 0,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 12,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/empire--stacked-grid-60mm.png",
    "notes": "Standard layout: BEL25 p.41 prints only the Empire 3 x 12 ribbed plank. Belgard's printed combination designs (BEL25 p.21, Pinwheel and Angled Lattice Grid) pair Empire with Dimensions slabs — two-product designs, not an Empire-only lay — so no Empire-only catalog pattern exists. No L-shaped Empire piece is printed in any held source."
   },
   {
    "name": "Stacked Grid — 80MM",
    "productSlug": "empire",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "3 x 12 x 3 1/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 6,
     "tiles": [
      {
       "sizeLabel": "3 x 12 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 3 1/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 3 1/8",
       "x": 0,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 90
      },
      {
       "sizeLabel": "3 x 12 x 3 1/8",
       "x": 12,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/empire--stacked-grid-80mm.png",
    "notes": "Standard layout: BEL25 p.41 prints only the Empire 3 x 12 ribbed plank. Belgard's printed combination designs (BEL25 p.21, Pinwheel and Angled Lattice Grid) pair Empire with Dimensions slabs — two-product designs, not an Empire-only lay — so no Empire-only catalog pattern exists. No L-shaped Empire piece is printed in any held source."
   },
   {
    "name": "Running Bond \u2014 60MM",
    "productSlug": "empire",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "3 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 6,
     "tiles": [
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 0,
       "y": 3,
       "w": 6,
       "h": 3,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 6,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 18,
       "y": 3,
       "w": 6,
       "h": 3,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/empire--running-bond-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Half-bond rows; the row ends are half-length cuts of the same plank (marked cut)."
   },
   {
    "name": "Running Bond \u2014 1/3 Offset \u2014 60MM",
    "productSlug": "empire",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "3 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 9,
     "tiles": [
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 24,
       "y": 0,
       "w": 12,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 0,
       "y": 3,
       "w": 8,
       "h": 3,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 8,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 20,
       "y": 3,
       "w": 12,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 32,
       "y": 3,
       "w": 4,
       "h": 3,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 0,
       "y": 6,
       "w": 4,
       "h": 3,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 4,
       "y": 6,
       "w": 12,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 16,
       "y": 6,
       "w": 12,
       "h": 3,
       "rot": 0
      },
      {
       "sizeLabel": "3 x 12 x 2 3/8",
       "x": 28,
       "y": 6,
       "w": 8,
       "h": 3,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/empire--running-bond-1-3-offset-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Each row shifts one third of the plank length; row-end pieces are third cuts of the same plank (marked cut)."
   }
  ]
 },
{
  "product": "Origins 12",
  "productSlug": "origins-12",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Origins 12 — 3-Piece | 60MM",
    "productSlug": "origins-12",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 12 x 2 3/8",
     "12 x 12 x 2 3/8",
     "12 x 18 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 24,
     "tiles": [
      {
       "sizeLabel": "12 x 18 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 18,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 18,
       "y": 0,
       "w": 6,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 0,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 12,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 18,
       "w": 12,
       "h": 6,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/origins-12--origins-12-3-piece-60mm.png"
   },
   {
    "name": "Origins 12 — 3-Piece | 80MM",
    "productSlug": "origins-12",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "6 x 12 x 3 1/8",
     "12 x 12 x 3 1/8",
     "12 x 18 x 3 1/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 24,
     "tiles": [
      {
       "sizeLabel": "12 x 18 x 3 1/8",
       "x": 0,
       "y": 0,
       "w": 18,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 3 1/8",
       "x": 18,
       "y": 0,
       "w": 6,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 3 1/8",
       "x": 0,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 3 1/8",
       "x": 12,
       "y": 12,
       "w": 12,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 3 1/8",
       "x": 12,
       "y": 18,
       "w": 12,
       "h": 6,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/origins-12--origins-12-3-piece-80mm.png"
   },
   {
    "name": "Origins 12 \u2014 Herringbone 90\u00b0 | 60MM",
    "productSlug": "origins-12",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "6 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 18,
     "heightIn": 18,
     "tiles": [
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 6,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 6,
       "y": 12,
       "w": 12,
       "h": 6,
       "rot": 0
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 0,
       "y": 6,
       "w": 6,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 12 x 2 3/8",
       "x": 6,
       "y": 6,
       "w": 6,
       "h": 6,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/origins-12--origins-12-herringbone-90-60mm.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Pinwheel herringbone: four whole 6 x 12 planks around a 6 x 6 centre cut from a fifth plank (marked cut), the Holland 100MM module form at this size."
   }
  ]
 },
{
  "product": "Origins 18",
  "productSlug": "origins-18",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Origins 18 — 3-Piece | 60MM",
    "productSlug": "origins-18",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "9 x 18 x 2 3/8",
     "18 x 18 x 2 3/8",
     "18 x 27 x 2 3/8"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 36,
     "tiles": [
      {
       "sizeLabel": "18 x 27 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 27,
       "h": 18,
       "rot": 90
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 27,
       "y": 0,
       "w": 9,
       "h": 18,
       "rot": 0
      },
      {
       "sizeLabel": "18 x 18 x 2 3/8",
       "x": 0,
       "y": 18,
       "w": 18,
       "h": 18,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 18,
       "y": 18,
       "w": 18,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 18,
       "y": 27,
       "w": 18,
       "h": 9,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/origins-18--origins-18-3-piece-60mm.png"
   }
  ]
 },
{
  "product": "Papyrus 18",
  "productSlug": "papyrus-18",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Papyrus 18 — 3-Piece | 60MM",
    "productSlug": "papyrus-18",
    "mixed": true,
    "source": "catalog",
    "sizesUsed": [
     "9 x 18 x 2 3/8",
     "18 x 18 x 2 3/8",
     "18 x 27 x 2 3/8"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 36,
     "tiles": [
      {
       "sizeLabel": "18 x 27 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 27,
       "h": 18,
       "rot": 90
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 27,
       "y": 0,
       "w": 9,
       "h": 18,
       "rot": 0
      },
      {
       "sizeLabel": "18 x 18 x 2 3/8",
       "x": 0,
       "y": 18,
       "w": 18,
       "h": 18,
       "rot": 0
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 18,
       "y": 18,
       "w": 18,
       "h": 9,
       "rot": 90
      },
      {
       "sizeLabel": "9 x 18 x 2 3/8",
       "x": 18,
       "y": 27,
       "w": 18,
       "h": 9,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/papyrus-18--papyrus-18-3-piece-60mm.png"
   }
  ]
 },
{
  "product": "Truncated Dome",
  "productSlug": "truncated-dome",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Running Bond",
    "productSlug": "truncated-dome",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "4 x 8 x 2 3/8"
    ],
    "module": {
     "widthIn": 16,
     "heightIn": 8,
     "tiles": [
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 8,
       "y": 0,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 0,
       "y": 4,
       "w": 4,
       "h": 4,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 4,
       "y": 4,
       "w": 8,
       "h": 4,
       "rot": 90
      },
      {
       "sizeLabel": "4 x 8 x 2 3/8",
       "x": 12,
       "y": 4,
       "w": 4,
       "h": 4,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/truncated-dome--running-bond.png"
   },
   {
    "name": "Stacked Grid",
    "productSlug": "truncated-dome",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 12 x 2 3/8"
    ],
    "module": {
     "widthIn": 24,
     "heightIn": 24,
     "tiles": [
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 0,
       "y": 0,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 12,
       "y": 0,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 0,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 12 x 2 3/8",
       "x": 12,
       "y": 12,
       "w": 12,
       "h": 12,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/truncated-dome--stacked-grid.png"
   }
  ]
 },
{
  "product": "Diamond Pro Air",
  "productSlug": "diamond-pro-air",
  "category": "Walls",
  "patterns": [
   {
    "name": "Wall Coursing — 8 in",
    "productSlug": "diamond-pro-air",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "8 x 18 x 11 1/2"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "8 x 18 x 11 1/2",
       "x": 0,
       "y": 0,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 18 x 11 1/2",
       "x": 18,
       "y": 0,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 18 x 11 1/2",
       "x": 0,
       "y": 8,
       "w": 9,
       "h": 8,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "8 x 18 x 11 1/2",
       "x": 9,
       "y": 8,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "8 x 18 x 11 1/2",
       "x": 27,
       "y": 8,
       "w": 9,
       "h": 8,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/diamond-pro-air--wall-coursing-8-in.png",
    "notes": "Wall coursing schematic (face view), as with the other wall lines."
   }
  ]
 },
{
  "product": "Melville Wall",
  "productSlug": "melville-wall",
  "category": "Walls",
  "patterns": [
   {
    "name": "Wall Coursing — 4 in",
    "productSlug": "melville-wall",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "4 x 20 x 10"
    ],
    "module": {
     "widthIn": 40,
     "heightIn": 8,
     "tiles": [
      {
       "sizeLabel": "4 x 20 x 10",
       "x": 0,
       "y": 0,
       "w": 20,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 20 x 10",
       "x": 20,
       "y": 0,
       "w": 20,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 20 x 10",
       "x": 0,
       "y": 4,
       "w": 10,
       "h": 4,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "4 x 20 x 10",
       "x": 10,
       "y": 4,
       "w": 20,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "4 x 20 x 10",
       "x": 30,
       "y": 4,
       "w": 10,
       "h": 4,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/melville-wall--wall-coursing-4-in.png",
    "notes": "Wall coursing schematic (face view), as with the other wall lines."
   },
   {
    "name": "Wedge Course",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "Wedge"
    ],
    "module": {
     "widthIn": 19,
     "heightIn": 4,
     "tiles": [
      {
       "sizeLabel": "Wedge",
       "x": 0,
       "y": 0,
       "w": 9.5,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "Wedge",
       "x": 9.5,
       "y": 0,
       "w": 9.5,
       "h": 4,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/melville-wall--wedge-course.png"
   },
   {
    "name": "Cap Course",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "Cap"
    ],
    "module": {
     "widthIn": 40,
     "heightIn": 2,
     "tiles": [
      {
       "sizeLabel": "Cap",
       "x": 0,
       "y": 0,
       "w": 20,
       "h": 2,
       "rot": 0
      },
      {
       "sizeLabel": "Cap",
       "x": 20,
       "y": 0,
       "w": 20,
       "h": 2,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/melville-wall--cap-course.png"
   }
  ]
 },
{
  "product": "Artforms",
  "productSlug": "artforms",
  "category": "Walls",
  "patterns": [
   {
    "name": "Panel Arrangement",
    "productSlug": "artforms",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "18 x 36 x 3",
     "6 x 36 x 3"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 42,
     "tiles": [
      {
       "sizeLabel": "18 x 36 x 3",
       "x": 0,
       "y": 0,
       "w": 36,
       "h": 18,
       "rot": 90
      },
      {
       "sizeLabel": "6 x 36 x 3",
       "x": 0,
       "y": 18,
       "w": 36,
       "h": 6,
       "rot": 90
      },
      {
       "sizeLabel": "18 x 36 x 3",
       "x": 0,
       "y": 24,
       "w": 36,
       "h": 18,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/artforms--panel-arrangement.png",
    "notes": "Face-view arrangement of the two printed panel sizes."
   }
  ]
 },
{
  "product": "November",
  "productSlug": "november",
  "category": "Porcelain Pavers",
  "patterns": [
   {
    "name": "Grid",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 23.54,
     "heightIn": 23.54,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/november--grid.png"
   }
  ]
 },
{
  "product": "Travertini",
  "productSlug": "travertini",
  "category": "Porcelain Pavers",
  "patterns": [
   {
    "name": "Modular Mix",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "24 x 24",
     "24 x 48"
    ],
    "module": {
     "widthIn": 47.17,
     "heightIn": 47.08,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24",
       "x": 23.54,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0,
       "y": 23.54,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/travertini--modular-mix.png"
   },
   {
    "name": "Stacked Grid",
    "productSlug": "travertini",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 48"
    ],
    "module": {
     "widthIn": 94.34,
     "heightIn": 47.08,
     "tiles": [
      {
       "sizeLabel": "24 x 48",
       "x": 0,
       "y": 0,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 47.17,
       "y": 0,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 0,
       "y": 23.54,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 48",
       "x": 47.17,
       "y": 23.54,
       "w": 47.17,
       "h": 23.54,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/travertini--stacked-grid.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Aligned grid at the face's true metric size, all whole tiles."
   }
  ]
 },
{
  "product": "Diamond Pro Air Smooth",
  "productSlug": "diamond-pro-air-smooth",
  "category": "Walls",
  "patterns": [
   {
    "name": "Wall Coursing — 8 in",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "Wall Block"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "Wall Block",
       "x": 0,
       "y": 0,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "Wall Block",
       "x": 18,
       "y": 0,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "Wall Block",
       "x": 0,
       "y": 8,
       "w": 9,
       "h": 8,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "Wall Block",
       "x": 9,
       "y": 8,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "Wall Block",
       "x": 27,
       "y": 8,
       "w": 9,
       "h": 8,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/diamond-pro-air-smooth--wall-coursing-8-in.png"
   },
   {
    "name": "Cap & Corner Course",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "Corner",
     "Cap"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 12,
     "tiles": [
      {
       "sizeLabel": "Cap",
       "x": 0,
       "y": 0,
       "w": 18,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "Cap",
       "x": 18,
       "y": 0,
       "w": 18,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "Corner",
       "x": 0,
       "y": 4,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "Corner",
       "x": 18,
       "y": 4,
       "w": 18,
       "h": 8,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/diamond-pro-air-smooth--cap-corner-course.png"
   }
  ]
 },
{
  "product": "Diamond Pro Air Straight",
  "productSlug": "diamond-pro-air-straight",
  "category": "Walls",
  "patterns": [
   {
    "name": "Wall Coursing — 8 in",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "Wall Block"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 16,
     "tiles": [
      {
       "sizeLabel": "Wall Block",
       "x": 0,
       "y": 0,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "Wall Block",
       "x": 18,
       "y": 0,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "Wall Block",
       "x": 0,
       "y": 8,
       "w": 9,
       "h": 8,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "Wall Block",
       "x": 9,
       "y": 8,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "Wall Block",
       "x": 27,
       "y": 8,
       "w": 9,
       "h": 8,
       "rot": 0,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/diamond-pro-air-straight--wall-coursing-8-in.png"
   },
   {
    "name": "Cap & Corner Course",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "Corner",
     "Cap"
    ],
    "module": {
     "widthIn": 36,
     "heightIn": 12,
     "tiles": [
      {
       "sizeLabel": "Cap",
       "x": 0,
       "y": 0,
       "w": 16,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "Cap",
       "x": 16,
       "y": 0,
       "w": 16,
       "h": 4,
       "rot": 0
      },
      {
       "sizeLabel": "Cap",
       "x": 32,
       "y": 0,
       "w": 4,
       "h": 4,
       "rot": 0,
       "cut": true
      },
      {
       "sizeLabel": "Corner",
       "x": 0,
       "y": 4,
       "w": 18,
       "h": 8,
       "rot": 0
      },
      {
       "sizeLabel": "Corner",
       "x": 18,
       "y": 4,
       "w": 18,
       "h": 8,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/diamond-pro-air-straight--cap-corner-course.png"
   }
  ]
 },
{
  "product": "Classic Plaza Slab",
  "productSlug": "classic-plaza-slab",
  "category": "Pavers & Slabs",
  "patterns": [
   {
    "name": "Ashlar Mix — 12/24/36",
    "productSlug": "classic-plaza-slab",
    "mixed": true,
    "source": "standard",
    "sizesUsed": [
     "12 x 24 x 1 31/32",
     "24 x 24 x 1 31/32",
     "24 x 36 x 1 31/32"
    ],
    "module": {
     "widthIn": 72.0,
     "heightIn": 48.0,
     "tiles": [
      {
       "sizeLabel": "24 x 36 x 1 31/32",
       "x": 0.0,
       "y": 0.0,
       "w": 36.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24 x 1 31/32",
       "x": 36.0,
       "y": 0.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 60.0,
       "y": 0.0,
       "w": 12.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 0.0,
       "y": 24.0,
       "w": 24.0,
       "h": 12.0,
       "rot": 90
      },
      {
       "sizeLabel": "24 x 24 x 1 31/32",
       "x": 24.0,
       "y": 24.0,
       "w": 24.0,
       "h": 24.0,
       "rot": 0
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 48.0,
       "y": 24.0,
       "w": 24.0,
       "h": 12.0,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 0.0,
       "y": 36.0,
       "w": 24.0,
       "h": 12.0,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 48.0,
       "y": 36.0,
       "w": 24.0,
       "h": 12.0,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/classic-plaza-slab--ashlar-mix.png",
    "notes": "Combination deck added 2026-11-03 (founder flag: the Plaza deck laid only the 24 x 24 size). The three sizes are the product's printed rooftop sizes (BELCOMM26 p.26); the layout is the standard modular ashlar for those sizes — Belgard prints no pattern diagram for this product, so this pattern is labeled standard, never catalog. The fourth printed size, 17 3/4 x 17 3/4, does not tessellate with the 12-inch family and keeps its own Stacked Grid pattern."
   },
   {
    "name": "Stacked Grid",
    "productSlug": "classic-plaza-slab",
    "mixed": false,
    "source": "catalog",
    "sizesUsed": [
     "24 x 24 x 1 31/32"
    ],
    "module": {
     "widthIn": 48,
     "heightIn": 48,
     "tiles": [
      {
       "sizeLabel": "24 x 24 x 1 31/32",
       "x": 0,
       "y": 0,
       "w": 24,
       "h": 24,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24 x 1 31/32",
       "x": 24,
       "y": 0,
       "w": 24,
       "h": 24,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24 x 1 31/32",
       "x": 0,
       "y": 24,
       "w": 24,
       "h": 24,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 24 x 1 31/32",
       "x": 24,
       "y": 24,
       "w": 24,
       "h": 24,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/classic-plaza-slab--stacked-grid.png",
    "notes": "Layout per catalog diagram: the 2026 Commercial Offering (BELCOMM26) prints Classic Plaza Slab laid in a stacked grid (installation photo, p.28, \"Classic Plaza Slab in Natural\"); sizes and the 50 mm slab thickness come from its rooftop table (p.26), the thickness shown as 1 31/32 in (50 mm). Group added 2026-11-02 (Job G11) so the product's per-unit texture sets resolve in the visualizer; no other source book prints this line."
   },
   {
    "name": "Stacked Grid — 12 x 24",
    "productSlug": "classic-plaza-slab",
    "mixed": false,
    "source": "catalog",
    "sizesUsed": [
     "12 x 24 x 1 31/32"
    ],
    "module": {
     "widthIn": 48,
     "heightIn": 48,
     "tiles": [
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 0,
       "y": 0,
       "w": 24,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 24,
       "y": 0,
       "w": 24,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 0,
       "y": 12,
       "w": 24,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 24,
       "y": 12,
       "w": 24,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 0,
       "y": 24,
       "w": 24,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 24,
       "y": 24,
       "w": 24,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 0,
       "y": 36,
       "w": 24,
       "h": 12,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24 x 1 31/32",
       "x": 24,
       "y": 36,
       "w": 24,
       "h": 12,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/classic-plaza-slab--stacked-grid-12-x-24.png",
    "notes": "Layout per catalog diagram: the 2026 Commercial Offering (BELCOMM26) prints Classic Plaza Slab laid in a stacked grid (installation photo, p.28, \"Classic Plaza Slab in Natural\"); sizes and the 50 mm slab thickness come from its rooftop table (p.26), the thickness shown as 1 31/32 in (50 mm). Group added 2026-11-02 (Job G11) so the product's per-unit texture sets resolve in the visualizer; no other source book prints this line."
   },
   {
    "name": "Stacked Grid — 17 3/4",
    "productSlug": "classic-plaza-slab",
    "mixed": false,
    "source": "catalog",
    "sizesUsed": [
     "17 3/4 x 17 3/4 x 1 31/32"
    ],
    "module": {
     "widthIn": 35.5,
     "heightIn": 35.5,
     "tiles": [
      {
       "sizeLabel": "17 3/4 x 17 3/4 x 1 31/32",
       "x": 0,
       "y": 0,
       "w": 17.75,
       "h": 17.75,
       "rot": 0
      },
      {
       "sizeLabel": "17 3/4 x 17 3/4 x 1 31/32",
       "x": 17.75,
       "y": 0,
       "w": 17.75,
       "h": 17.75,
       "rot": 0
      },
      {
       "sizeLabel": "17 3/4 x 17 3/4 x 1 31/32",
       "x": 0,
       "y": 17.75,
       "w": 17.75,
       "h": 17.75,
       "rot": 0
      },
      {
       "sizeLabel": "17 3/4 x 17 3/4 x 1 31/32",
       "x": 17.75,
       "y": 17.75,
       "w": 17.75,
       "h": 17.75,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/classic-plaza-slab--stacked-grid-17-3-4.png",
    "notes": "Layout per catalog diagram: the 2026 Commercial Offering (BELCOMM26) prints Classic Plaza Slab laid in a stacked grid (installation photo, p.28, \"Classic Plaza Slab in Natural\"); sizes and the 50 mm slab thickness come from its rooftop table (p.26), the thickness shown as 1 31/32 in (50 mm). Group added 2026-11-02 (Job G11) so the product's per-unit texture sets resolve in the visualizer; no other source book prints this line."
   },
   {
    "name": "Stacked Grid — 24 x 36",
    "productSlug": "classic-plaza-slab",
    "mixed": false,
    "source": "catalog",
    "sizesUsed": [
     "24 x 36 x 1 31/32"
    ],
    "module": {
     "widthIn": 48,
     "heightIn": 72,
     "tiles": [
      {
       "sizeLabel": "24 x 36 x 1 31/32",
       "x": 0,
       "y": 0,
       "w": 24,
       "h": 36,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 36 x 1 31/32",
       "x": 24,
       "y": 0,
       "w": 24,
       "h": 36,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 36 x 1 31/32",
       "x": 0,
       "y": 36,
       "w": 24,
       "h": 36,
       "rot": 0
      },
      {
       "sizeLabel": "24 x 36 x 1 31/32",
       "x": 24,
       "y": 36,
       "w": 24,
       "h": 36,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/classic-plaza-slab--stacked-grid-24-x-36.png",
    "notes": "Layout per catalog diagram: the 2026 Commercial Offering (BELCOMM26) prints Classic Plaza Slab laid in a stacked grid (installation photo, p.28, \"Classic Plaza Slab in Natural\"); sizes and the 50 mm slab thickness come from its rooftop table (p.26), the thickness shown as 1 31/32 in (50 mm). Group added 2026-11-02 (Job G11) so the product's per-unit texture sets resolve in the visualizer; no other source book prints this line."
   }
  ]
 },
{
  "product": "Foundation",
  "productSlug": "foundation",
  "category": "Porcelain Pavers",
  "patterns": [
   {
    "name": "Grid",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "24 x 24"
    ],
    "module": {
     "widthIn": 23.54,
     "heightIn": 23.54,
     "tiles": [
      {
       "sizeLabel": "24 x 24",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 23.54,
       "rot": 0
      }
     ]
    },
    "preview": "/media/belgard-patterns/foundation--grid.png"
   }
  ]
 },
{
  "product": "Genoa",
  "productSlug": "genoa",
  "source": "Belgard Genoa product page (belgard.com/product/genoa/) + Florida (FL) research file: sizes 12x24 + 24x24, 20mm porcelain (Mirage); actuals 11.62x23.54 / 23.54x23.54 per the Mirage standard printed on the Foundation Coastal cut sheet BEL24-D-322250. Module composed as Belgard's own Genoa pattern render lays the two sizes.",
  "patterns": [
   {
    "name": "Modular Mix",
    "source": "catalog",
    "colors": ["Blanco", "Crema"],
    "jointIn": 0.1875,
    "preview": "/media/belgard-patterns/genoa--grid.png",
    "sizesUsed": [
      "24 x 24",
      "12 x 24",
     ],
     "module": { "widthIn": 47.08, "heightIn": 47.08, "tiles": [{ "sizeLabel": "12 x 24", "x": 0, "y": 0, "w": 23.54, "h": 11.62, "rot": 90 }, { "sizeLabel": "12 x 24", "x": 0, "y": 11.62, "w": 23.54, "h": 11.62, "rot": 90 }, { "sizeLabel": "24 x 24", "x": 0, "y": 23.54, "w": 23.54, "h": 23.54, "rot": 0 }, { "sizeLabel": "12 x 24", "x": 23.54, "y": 0, "w": 23.54, "h": 11.62, "rot": 90 }, { "sizeLabel": "24 x 24", "x": 23.54, "y": 11.62, "w": 23.54, "h": 23.54, "rot": 0 }, { "sizeLabel": "12 x 24", "x": 23.54, "y": 35.16, "w": 23.54, "h": 11.62, "rot": 90 }] }
   },
   {
    "name": "Running Bond \u2014 12 x 24",
    "productSlug": "genoa",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 24"
    ],
    "module": {
     "widthIn": 47.08,
     "heightIn": 23.24,
     "tiles": [
      {
       "sizeLabel": "12 x 24",
       "x": 0,
       "y": 0,
       "w": 23.54,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24",
       "x": 23.54,
       "y": 0,
       "w": 23.54,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24",
       "x": 0,
       "y": 11.62,
       "w": 11.77,
       "h": 11.62,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 24",
       "x": 11.77,
       "y": 11.62,
       "w": 23.54,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 24",
       "x": 35.31,
       "y": 11.62,
       "w": 11.77,
       "h": 11.62,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/genoa--running-bond-12-x-24.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Half-bond rows at the face's true metric size; row ends are half cuts of the same tile (marked cut)."
   }
  ]
 },
{
  "product": "Jurupa",
  "productSlug": "jurupa",
  "source": "Belgard Jurupa product page (belgard.com/product/jurupa/) + Florida (FL) research file: size 12x48, 20mm porcelain wood-look plank (Mirage); actuals 11.62x47.08 per the Mirage convention printed on the Foundation Coastal cut sheet BEL24-D-322250.",
  "patterns": [
   {
    "name": "Running Bond",
    "source": "standard",
    "colors": ["Cool", "Master", "Camp"],
    "jointIn": 0.1875,
    "preview": "/media/belgard-patterns/jurupa--grid.png",
    "sizesUsed": [
      "12 x 48",
     ],
     "module": { "widthIn": 94.16, "heightIn": 23.24, "tiles": [{ "sizeLabel": "12 x 48", "x": 0, "y": 0, "w": 47.08, "h": 11.62, "rot": 90 }, { "sizeLabel": "12 x 48", "x": 47.08, "y": 0, "w": 47.08, "h": 11.62, "rot": 90 }, { "sizeLabel": "12 x 48", "x": 0, "y": 11.62, "w": 23.54, "h": 11.62, "rot": 90, "cut": true }, { "sizeLabel": "12 x 48", "x": 23.54, "y": 11.62, "w": 47.08, "h": 11.62, "rot": 90 }, { "sizeLabel": "12 x 48", "x": 70.62, "y": 11.62, "w": 23.54, "h": 11.62, "rot": 90, "cut": true }] }
   },
   {
    "name": "Running Bond \u2014 1/3 Offset",
    "productSlug": "jurupa",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 48"
    ],
    "module": {
     "widthIn": 141.24,
     "heightIn": 34.86,
     "tiles": [
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 47.08,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 94.16,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 11.62,
       "w": 31.39,
       "h": 11.62,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 31.39,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 78.47,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 125.55,
       "y": 11.62,
       "w": 15.69,
       "h": 11.62,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 23.24,
       "w": 15.69,
       "h": 11.62,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 15.69,
       "y": 23.24,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 62.77,
       "y": 23.24,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 109.85,
       "y": 23.24,
       "w": 31.39,
       "h": 11.62,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/jurupa--running-bond-1-3-offset.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Each row shifts one third of the plank length (thirds of the 47.08 in face: 15.69/31.39); row-end pieces are third cuts of the same plank (marked cut)."
   },
   {
    "name": "Stacked Grid",
    "productSlug": "jurupa",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 48"
    ],
    "module": {
     "widthIn": 94.16,
     "heightIn": 23.24,
     "tiles": [
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 47.08,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 47.08,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/jurupa--stacked-grid.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Aligned grid at the face's true metric size, all whole tiles."
   }
  ]
 },
{
  "product": "Kao",
  "productSlug": "kao",
  "source": "Belgard Kao product page (belgard.com/product/kao/) + Florida (FL) research file: size 12x48, 20mm porcelain wood-look plank (Mirage); actuals 11.62x47.08 per the Mirage convention printed on the Foundation Coastal cut sheet BEL24-D-322250.",
  "patterns": [
   {
    "name": "Running Bond",
    "source": "standard",
    "colors": ["Hazelnut", "Hazelnut Raw", "Caramel", "Caramel Raw", "Spice", "Spice Raw"],
    "jointIn": 0.1875,
    "preview": "/media/belgard-patterns/kao--grid.png",
    "sizesUsed": [
      "12 x 48",
     ],
     "module": { "widthIn": 94.16, "heightIn": 23.24, "tiles": [{ "sizeLabel": "12 x 48", "x": 0, "y": 0, "w": 47.08, "h": 11.62, "rot": 90 }, { "sizeLabel": "12 x 48", "x": 47.08, "y": 0, "w": 47.08, "h": 11.62, "rot": 90 }, { "sizeLabel": "12 x 48", "x": 0, "y": 11.62, "w": 23.54, "h": 11.62, "rot": 90, "cut": true }, { "sizeLabel": "12 x 48", "x": 23.54, "y": 11.62, "w": 47.08, "h": 11.62, "rot": 90 }, { "sizeLabel": "12 x 48", "x": 70.62, "y": 11.62, "w": 23.54, "h": 11.62, "rot": 90, "cut": true }] }
   },
   {
    "name": "Running Bond \u2014 1/3 Offset",
    "productSlug": "kao",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 48"
    ],
    "module": {
     "widthIn": 141.24,
     "heightIn": 34.86,
     "tiles": [
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 47.08,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 94.16,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 11.62,
       "w": 31.39,
       "h": 11.62,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 31.39,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 78.47,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 125.55,
       "y": 11.62,
       "w": 15.69,
       "h": 11.62,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 23.24,
       "w": 15.69,
       "h": 11.62,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 15.69,
       "y": 23.24,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 62.77,
       "y": 23.24,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 109.85,
       "y": 23.24,
       "w": 31.39,
       "h": 11.62,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/kao--running-bond-1-3-offset.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Each row shifts one third of the plank length (thirds of the 47.08 in face: 15.69/31.39); row-end pieces are third cuts of the same plank (marked cut)."
   },
   {
    "name": "Stacked Grid",
    "productSlug": "kao",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 48"
    ],
    "module": {
     "widthIn": 94.16,
     "heightIn": 23.24,
     "tiles": [
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 47.08,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 47.08,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/kao--stacked-grid.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Aligned grid at the face's true metric size, all whole tiles."
   }
  ]
 },
{
  "product": "Dijon",
  "productSlug": "dijon",
  "source": "Belgard Commercial Dijon page (belgardcommercial.com/products/dijon/) + Florida (FL) research file: sizes 24x24 + 24x36 + 24x48, 20mm porcelain (Mirage). Faces exist for 24x24 only (the swatch grids are squares); actual 23.54x23.54 per the Mirage convention printed on the Foundation Coastal cut sheet BEL24-D-322250.",
  "patterns": [
   {
    "name": "Grid",
    "source": "standard",
    "colors": ["Couches", "Commarin", "Rochepot", "Bazoches"],
    "jointIn": 0.1875,
    "preview": "/media/belgard-patterns/dijon--grid.png",
    "sizesUsed": [
      "24 x 24",
     ],
     "module": { "widthIn": 23.54, "heightIn": 23.54, "tiles": [{ "sizeLabel": "24 x 24", "x": 0, "y": 0, "w": 23.54, "h": 23.54, "rot": 0 }] }
   }
  ]
 },
{
  "product": "Oudh",
  "productSlug": "oudh",
  "source": "Belgard Commercial Oudh page (belgardcommercial.com/products/oudh/): size 12x48, 20mm porcelain wood-look plank (Mirage); actuals 11.62x47.08 per the Mirage convention printed on the Foundation Coastal cut sheet BEL24-D-322250.",
  "patterns": [
   {
    "name": "Running Bond",
    "source": "standard",
    "colors": ["Copahu", "Elem", "Jinkoh", "Pino", "Laos", "Ladano", "Cedro"],
    "jointIn": 0.1875,
    "preview": "/media/belgard-patterns/oudh--grid.png",
    "sizesUsed": [
      "12 x 48",
     ],
     "module": { "widthIn": 94.16, "heightIn": 23.24, "tiles": [{ "sizeLabel": "12 x 48", "x": 0, "y": 0, "w": 47.08, "h": 11.62, "rot": 90 }, { "sizeLabel": "12 x 48", "x": 47.08, "y": 0, "w": 47.08, "h": 11.62, "rot": 90 }, { "sizeLabel": "12 x 48", "x": 0, "y": 11.62, "w": 23.54, "h": 11.62, "rot": 90, "cut": true }, { "sizeLabel": "12 x 48", "x": 23.54, "y": 11.62, "w": 47.08, "h": 11.62, "rot": 90 }, { "sizeLabel": "12 x 48", "x": 70.62, "y": 11.62, "w": 23.54, "h": 11.62, "rot": 90, "cut": true }] }
   },
   {
    "name": "Running Bond \u2014 1/3 Offset",
    "productSlug": "oudh",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 48"
    ],
    "module": {
     "widthIn": 141.24,
     "heightIn": 34.86,
     "tiles": [
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 47.08,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 94.16,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 11.62,
       "w": 31.39,
       "h": 11.62,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 31.39,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 78.47,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 125.55,
       "y": 11.62,
       "w": 15.69,
       "h": 11.62,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 23.24,
       "w": 15.69,
       "h": 11.62,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "12 x 48",
       "x": 15.69,
       "y": 23.24,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 62.77,
       "y": 23.24,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 109.85,
       "y": 23.24,
       "w": 31.39,
       "h": 11.62,
       "rot": 90,
       "cut": true
      }
     ]
    },
    "preview": "/media/belgard-patterns/oudh--running-bond-1-3-offset.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Each row shifts one third of the plank length (thirds of the 47.08 in face: 15.69/31.39); row-end pieces are third cuts of the same plank (marked cut)."
   },
   {
    "name": "Stacked Grid",
    "productSlug": "oudh",
    "mixed": false,
    "source": "standard",
    "sizesUsed": [
     "12 x 48"
    ],
    "module": {
     "widthIn": 94.16,
     "heightIn": 23.24,
     "tiles": [
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 47.08,
       "y": 0,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 0,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      },
      {
       "sizeLabel": "12 x 48",
       "x": 47.08,
       "y": 11.62,
       "w": 47.08,
       "h": 11.62,
       "rot": 90
      }
     ]
    },
    "preview": "/media/belgard-patterns/oudh--stacked-grid.png",
    "notes": "Pattern library expansion 2026-11-06 (founder order): industry-standard layout at the family's printed sizes; module verified to tile exactly. Aligned grid at the face's true metric size, all whole tiles."
   }
  ]
 },
{
  "product": "Na.Me",
  "productSlug": "na-me",
  "source": "Belgard Commercial Na.Me page (belgardcommercial.com/products/na-me/): sizes 24x24 + 18x36 + 24x48, 20mm porcelain (Mirage). Faces exist for 24x24 only (one published flat face per color); actual 23.54x23.54 per the Mirage convention printed on the Foundation Coastal cut sheet BEL24-D-322250.",
  "patterns": [
   {
    "name": "Grid",
    "source": "standard",
    "colors": ["Jura Beige", "Bourgogne", "Gris Belge"],
    "jointIn": 0.1875,
    "preview": "/media/belgard-patterns/na-me--grid.png",
    "sizesUsed": [
      "24 x 24",
     ],
     "module": { "widthIn": 23.54, "heightIn": 23.54, "tiles": [{ "sizeLabel": "24 x 24", "x": 0, "y": 0, "w": 23.54, "h": 23.54, "rot": 0 }] }
   }
  ]
 },
// Bellflower Blonde — merged from Floor & Decor 2026-11-16 (F&D merge
// pilot): printed plank 48 x 7 x 0.197 in per its F&D registry record.
// Module composed as the standard running bond at the printed size,
// following the Jurupa/Kao plank-pattern template in this file; cut
// pieces marked cut, as there.
{
  "product": "Bellflower Blonde",
  "productSlug": "bellflower-blonde",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/bellflower-blonde/face-top-a.jpg",
    "sizesUsed": [
      "48 x 7 x 0.197"
     ],
     "module": { "widthIn": 96, "heightIn": 28, "tiles": [{ "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 0, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 48, "y": 0, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 7, "w": 24, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 24, "y": 7, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 72, "y": 7, "w": 24, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 14, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 48, "y": 14, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 21, "w": 17.43, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 17.43, "y": 21, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 65.43, "y": 21, "w": 30.57, "h": 7, "rot": 90, "cut": true }] }
   }
  ]
 },
// Alto Bianco — merged from Floor & Decor 2026-11-16 (F&D merge, tile
// proof): porcelain tile 48 x 24 in per its F&D registry record. Module
// is the single-tile stacked grid, following the Dijon grid template in
// this file.
{
  "product": "Alto Bianco",
  "productSlug": "alto-bianco-matte-porcelain-tile",
  "category": "Tile",
  "patterns": [
   {
    "name": "Grid",
    "mixed": false,
    "source": "standard",
    "preview": "/textures/floor-decor/alto-bianco-matte-porcelain-tile/variant-0.png",
    "sizesUsed": [
      "48 x 24"
     ],
     "module": { "widthIn": 48, "heightIn": 24, "tiles": [{ "sizeLabel": "48 x 24", "x": 0, "y": 0, "w": 48, "h": 24, "rot": 0 }] }
   }
  ]
 },
// Alamo Oak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.03 x 7.17 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Alamo Oak",
  "productSlug": "alamo-oak",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/alamo-oak/face-top-a.jpg",
    "sizesUsed": [
     "48.03 x 7.17 x 0.197"
    ],
    "module": {
     "widthIn": 96.06,
     "heightIn": 14.34,
     "tiles": [
      {
       "sizeLabel": "48.03 x 7.17 x 0.197",
       "x": 0,
       "y": 0,
       "w": 48.03,
       "h": 7.17,
       "rot": 90
      },
      {
       "sizeLabel": "48.03 x 7.17 x 0.197",
       "x": 48.03,
       "y": 0,
       "w": 48.03,
       "h": 7.17,
       "rot": 90
      },
      {
       "sizeLabel": "48.03 x 7.17 x 0.197",
       "x": 0,
       "y": 7.17,
       "w": 24.015,
       "h": 7.17,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "48.03 x 7.17 x 0.197",
       "x": 24.015,
       "y": 7.17,
       "w": 48.03,
       "h": 7.17,
       "rot": 90
      },
      {
       "sizeLabel": "48.03 x 7.17 x 0.197",
       "x": 72.045,
       "y": 7.17,
       "w": 24.015,
       "h": 7.17,
       "rot": 90,
       "cut": true
      }
     ]
    }
   }
  ]
 },
// Winter Peak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): porcelain-class vinyl plank; module at the longest honest print. NAMED GAP: no full-length face exists in this product's imagery (longest print 36.22 in; the real plank is 48.03 in) — the module is built at the longest print length. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Winter Peak",
  "productSlug": "winter-peak",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/winter-peak/face-top-i.jpg",
    "sizesUsed": [
     "36.22 x 7.2 x 0.197"
    ],
    "module": { "widthIn": 72.44, "heightIn": 28.8, "tiles": [{ "sizeLabel": "36.22 x 7.2 x 0.197", "x": 0, "y": 0, "w": 36.22, "h": 7.2, "rot": 90 }, { "sizeLabel": "36.22 x 7.2 x 0.197", "x": 36.22, "y": 0, "w": 36.22, "h": 7.2, "rot": 90 }, { "sizeLabel": "36.22 x 7.2 x 0.197", "x": 0, "y": 7.2, "w": 18.11, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "36.22 x 7.2 x 0.197", "x": 18.11, "y": 7.2, "w": 36.22, "h": 7.2, "rot": 90 }, { "sizeLabel": "36.22 x 7.2 x 0.197", "x": 54.33, "y": 7.2, "w": 18.11, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "36.22 x 7.2 x 0.197", "x": 0, "y": 14.4, "w": 36.22, "h": 7.2, "rot": 90 }, { "sizeLabel": "36.22 x 7.2 x 0.197", "x": 36.22, "y": 14.4, "w": 36.22, "h": 7.2, "rot": 90 }, { "sizeLabel": "36.22 x 7.2 x 0.197", "x": 0, "y": 21.6, "w": 13.87, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "36.22 x 7.2 x 0.197", "x": 13.87, "y": 21.6, "w": 36.22, "h": 7.2, "rot": 90 }, { "sizeLabel": "36.22 x 7.2 x 0.197", "x": 50.09, "y": 21.6, "w": 22.35, "h": 7.2, "rot": 90, "cut": true }] }
   }
  ]
 },
// Piedmont Bend Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.03 x 7.2 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Piedmont Bend",
  "productSlug": "piedmont-bend",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/piedmont-bend/face-top-a.jpg",
    "sizesUsed": [
     "48.03 x 7.2 x 0.197"
    ],
    "module": { "widthIn": 96.06, "heightIn": 28.8, "tiles": [{ "sizeLabel": "48.03 x 7.2 x 0.197", "x": 0, "y": 0, "w": 48.03, "h": 7.2, "rot": 90 }, { "sizeLabel": "48.03 x 7.2 x 0.197", "x": 48.03, "y": 0, "w": 48.03, "h": 7.2, "rot": 90 }, { "sizeLabel": "48.03 x 7.2 x 0.197", "x": 0, "y": 7.2, "w": 24.015, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.2 x 0.197", "x": 24.015, "y": 7.2, "w": 48.03, "h": 7.2, "rot": 90 }, { "sizeLabel": "48.03 x 7.2 x 0.197", "x": 72.045, "y": 7.2, "w": 24.015, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.2 x 0.197", "x": 0, "y": 14.4, "w": 48.03, "h": 7.2, "rot": 90 }, { "sizeLabel": "48.03 x 7.2 x 0.197", "x": 48.03, "y": 14.4, "w": 48.03, "h": 7.2, "rot": 90 }, { "sizeLabel": "48.03 x 7.2 x 0.197", "x": 0, "y": 21.6, "w": 16.85, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.2 x 0.197", "x": 16.85, "y": 21.6, "w": 48.03, "h": 7.2, "rot": 90 }, { "sizeLabel": "48.03 x 7.2 x 0.197", "x": 64.88, "y": 21.6, "w": 31.18, "h": 7.2, "rot": 90, "cut": true }] }
   }
  ]
 },
// Highguard Silver Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.62 x 7.01 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Highguard Silver",
  "productSlug": "highguard-silver",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/highguard-silver/face-top-a.jpg",
    "sizesUsed": [
     "48.62 x 7.01 x 0.197"
    ],
    "module": {
     "widthIn": 97.24,
     "heightIn": 14.02,
     "tiles": [
      {
       "sizeLabel": "48.62 x 7.01 x 0.197",
       "x": 0,
       "y": 0,
       "w": 48.62,
       "h": 7.01,
       "rot": 90
      },
      {
       "sizeLabel": "48.62 x 7.01 x 0.197",
       "x": 48.62,
       "y": 0,
       "w": 48.62,
       "h": 7.01,
       "rot": 90
      },
      {
       "sizeLabel": "48.62 x 7.01 x 0.197",
       "x": 0,
       "y": 7.01,
       "w": 24.31,
       "h": 7.01,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "48.62 x 7.01 x 0.197",
       "x": 24.31,
       "y": 7.01,
       "w": 48.62,
       "h": 7.01,
       "rot": 90
      },
      {
       "sizeLabel": "48.62 x 7.01 x 0.197",
       "x": 72.93,
       "y": 7.01,
       "w": 24.31,
       "h": 7.01,
       "rot": 90,
       "cut": true
      }
     ]
    }
   }
  ]
 },
// Stormy Elm Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.03 x 7.17 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Stormy Elm",
  "productSlug": "stormy-elm",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/stormy-elm/face-top-a.jpg",
    "sizesUsed": [
     "48.03 x 7.17 x 0.197"
    ],
    "module": {
     "widthIn": 96.06,
     "heightIn": 14.34,
     "tiles": [
      {
       "sizeLabel": "48.03 x 7.17 x 0.197",
       "x": 0,
       "y": 0,
       "w": 48.03,
       "h": 7.17,
       "rot": 90
      },
      {
       "sizeLabel": "48.03 x 7.17 x 0.197",
       "x": 48.03,
       "y": 0,
       "w": 48.03,
       "h": 7.17,
       "rot": 90
      },
      {
       "sizeLabel": "48.03 x 7.17 x 0.197",
       "x": 0,
       "y": 7.17,
       "w": 24.015,
       "h": 7.17,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "48.03 x 7.17 x 0.197",
       "x": 24.015,
       "y": 7.17,
       "w": 48.03,
       "h": 7.17,
       "rot": 90
      },
      {
       "sizeLabel": "48.03 x 7.17 x 0.197",
       "x": 72.045,
       "y": 7.17,
       "w": 24.015,
       "h": 7.17,
       "rot": 90,
       "cut": true
      }
     ]
    }
   }
  ]
 },
// Lorraine Sienna Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): porcelain-class vinyl plank; module at the longest honest print. NAMED GAP: no full-length face exists in this product's imagery (longest print 36.73 in; the real plank is 48.03 in) — the module is built at the longest print length. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Lorraine Sienna",
  "productSlug": "lorraine-sienna",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/lorraine-sienna/face-top-l.jpg",
    "sizesUsed": [
     "36.73 x 7.13 x 0.197"
    ],
    "module": { "widthIn": 73.46, "heightIn": 28.52, "tiles": [{ "sizeLabel": "36.73 x 7.13 x 0.197", "x": 0, "y": 0, "w": 36.73, "h": 7.13, "rot": 90 }, { "sizeLabel": "36.73 x 7.13 x 0.197", "x": 36.73, "y": 0, "w": 36.73, "h": 7.13, "rot": 90 }, { "sizeLabel": "36.73 x 7.13 x 0.197", "x": 0, "y": 7.13, "w": 18.365, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "36.73 x 7.13 x 0.197", "x": 18.365, "y": 7.13, "w": 36.73, "h": 7.13, "rot": 90 }, { "sizeLabel": "36.73 x 7.13 x 0.197", "x": 55.095, "y": 7.13, "w": 18.365, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "36.73 x 7.13 x 0.197", "x": 0, "y": 14.26, "w": 36.73, "h": 7.13, "rot": 90 }, { "sizeLabel": "36.73 x 7.13 x 0.197", "x": 36.73, "y": 14.26, "w": 36.73, "h": 7.13, "rot": 90 }, { "sizeLabel": "36.73 x 7.13 x 0.197", "x": 0, "y": 21.39, "w": 13.35, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "36.73 x 7.13 x 0.197", "x": 13.35, "y": 21.39, "w": 36.73, "h": 7.13, "rot": 90 }, { "sizeLabel": "36.73 x 7.13 x 0.197", "x": 50.08, "y": 21.39, "w": 23.38, "h": 7.13, "rot": 90, "cut": true }] }
   }
  ]
 },
// Paisley Cape Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.62 x 7.56 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Paisley Cape",
  "productSlug": "paisley-cape",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/paisley-cape/face-top-a.jpg",
    "sizesUsed": [
     "48.62 x 7.56 x 0.197"
    ],
    "module": {
     "widthIn": 97.24,
     "heightIn": 15.12,
     "tiles": [
      {
       "sizeLabel": "48.62 x 7.56 x 0.197",
       "x": 0,
       "y": 0,
       "w": 48.62,
       "h": 7.56,
       "rot": 90
      },
      {
       "sizeLabel": "48.62 x 7.56 x 0.197",
       "x": 48.62,
       "y": 0,
       "w": 48.62,
       "h": 7.56,
       "rot": 90
      },
      {
       "sizeLabel": "48.62 x 7.56 x 0.197",
       "x": 0,
       "y": 7.56,
       "w": 24.31,
       "h": 7.56,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "48.62 x 7.56 x 0.197",
       "x": 24.31,
       "y": 7.56,
       "w": 48.62,
       "h": 7.56,
       "rot": 90
      },
      {
       "sizeLabel": "48.62 x 7.56 x 0.197",
       "x": 72.93,
       "y": 7.56,
       "w": 24.31,
       "h": 7.56,
       "rot": 90,
       "cut": true
      }
     ]
    }
   }
  ]
 },
// Farro Oak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48 x 7 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Farro Oak",
  "productSlug": "farro-oak",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/farro-oak/face-top-a.jpg",
    "sizesUsed": [
     "48 x 7 x 0.197"
    ],
    "module": { "widthIn": 96, "heightIn": 28, "tiles": [{ "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 0, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 48, "y": 0, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 7, "w": 24, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 24, "y": 7, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 72, "y": 7, "w": 24, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 14, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 48, "y": 14, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 21, "w": 18.16, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 18.16, "y": 21, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 66.16, "y": 21, "w": 29.84, "h": 7, "rot": 90, "cut": true }] }
   }
  ]
 },
// Raven Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): porcelain-class vinyl plank; module at the longest honest print. NAMED GAP: no full-length face exists in this product's imagery (longest print 16.33 in; the real plank is 48.62 in) — the module is built at the longest print length. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Raven",
  "productSlug": "raven",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/raven/face-top-b.jpg",
    "sizesUsed": [
     "16.33 x 7.01 x 0.197"
    ],
    "module": {
     "widthIn": 32.66,
     "heightIn": 14.02,
     "tiles": [
      {
       "sizeLabel": "16.33 x 7.01 x 0.197",
       "x": 0,
       "y": 0,
       "w": 16.33,
       "h": 7.01,
       "rot": 90
      },
      {
       "sizeLabel": "16.33 x 7.01 x 0.197",
       "x": 16.33,
       "y": 0,
       "w": 16.33,
       "h": 7.01,
       "rot": 90
      },
      {
       "sizeLabel": "16.33 x 7.01 x 0.197",
       "x": 0,
       "y": 7.01,
       "w": 8.165,
       "h": 7.01,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "16.33 x 7.01 x 0.197",
       "x": 8.165,
       "y": 7.01,
       "w": 16.33,
       "h": 7.01,
       "rot": 90
      },
      {
       "sizeLabel": "16.33 x 7.01 x 0.197",
       "x": 24.495,
       "y": 7.01,
       "w": 8.165,
       "h": 7.01,
       "rot": 90,
       "cut": true
      }
     ]
    }
   }
  ]
 },
// Timber Saddle Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.03 x 7.13 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Timber Saddle",
  "productSlug": "timber-saddle",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/timber-saddle/face-top-a.jpg",
    "sizesUsed": [
     "48.03 x 7.13 x 0.197"
    ],
    "module": { "widthIn": 96.06, "heightIn": 28.52, "tiles": [{ "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 0, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 48.03, "y": 0, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 7.13, "w": 24.015, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 24.015, "y": 7.13, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 72.045, "y": 7.13, "w": 24.015, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 14.26, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 48.03, "y": 14.26, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 21.39, "w": 10.41, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 10.41, "y": 21.39, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 58.44, "y": 21.39, "w": 37.62, "h": 7.13, "rot": 90, "cut": true }] }
   }
  ]
 },
// Pelham Peak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.03 x 7.09 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Pelham Peak",
  "productSlug": "pelham-peak",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/pelham-peak/face-top-a.jpg",
    "sizesUsed": [
     "48.03 x 7.09 x 0.197"
    ],
    "module": { "widthIn": 96.06, "heightIn": 28.36, "tiles": [{ "sizeLabel": "48.03 x 7.09 x 0.197", "x": 0, "y": 0, "w": 48.03, "h": 7.09, "rot": 90 }, { "sizeLabel": "48.03 x 7.09 x 0.197", "x": 48.03, "y": 0, "w": 48.03, "h": 7.09, "rot": 90 }, { "sizeLabel": "48.03 x 7.09 x 0.197", "x": 0, "y": 7.09, "w": 24.015, "h": 7.09, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.09 x 0.197", "x": 24.015, "y": 7.09, "w": 48.03, "h": 7.09, "rot": 90 }, { "sizeLabel": "48.03 x 7.09 x 0.197", "x": 72.045, "y": 7.09, "w": 24.015, "h": 7.09, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.09 x 0.197", "x": 0, "y": 14.18, "w": 48.03, "h": 7.09, "rot": 90 }, { "sizeLabel": "48.03 x 7.09 x 0.197", "x": 48.03, "y": 14.18, "w": 48.03, "h": 7.09, "rot": 90 }, { "sizeLabel": "48.03 x 7.09 x 0.197", "x": 0, "y": 21.27, "w": 20.17, "h": 7.09, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.09 x 0.197", "x": 20.17, "y": 21.27, "w": 48.03, "h": 7.09, "rot": 90 }, { "sizeLabel": "48.03 x 7.09 x 0.197", "x": 68.2, "y": 21.27, "w": 27.86, "h": 7.09, "rot": 90, "cut": true }] }
   }
  ]
 },
// Trenton Tradition Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): porcelain-class vinyl plank; module at the longest honest print. NAMED GAP: no full-length face exists in this product's imagery (longest print 29.7 in; the real plank is 48.62 in) — the module is built at the longest print length. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Trenton Tradition",
  "productSlug": "trenton-tradition",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/trenton-tradition/face-top-d.jpg",
    "sizesUsed": [
     "29.7 x 7.56 x 0.197"
    ],
    "module": { "widthIn": 59.4, "heightIn": 30.24, "tiles": [{ "sizeLabel": "29.7 x 7.56 x 0.197", "x": 0, "y": 0, "w": 29.7, "h": 7.56, "rot": 90 }, { "sizeLabel": "29.7 x 7.56 x 0.197", "x": 29.7, "y": 0, "w": 29.7, "h": 7.56, "rot": 90 }, { "sizeLabel": "29.7 x 7.56 x 0.197", "x": 0, "y": 7.56, "w": 14.85, "h": 7.56, "rot": 90, "cut": true }, { "sizeLabel": "29.7 x 7.56 x 0.197", "x": 14.85, "y": 7.56, "w": 29.7, "h": 7.56, "rot": 90 }, { "sizeLabel": "29.7 x 7.56 x 0.197", "x": 44.55, "y": 7.56, "w": 14.85, "h": 7.56, "rot": 90, "cut": true }, { "sizeLabel": "29.7 x 7.56 x 0.197", "x": 0, "y": 15.12, "w": 29.7, "h": 7.56, "rot": 90 }, { "sizeLabel": "29.7 x 7.56 x 0.197", "x": 29.7, "y": 15.12, "w": 29.7, "h": 7.56, "rot": 90 }, { "sizeLabel": "29.7 x 7.56 x 0.197", "x": 0, "y": 22.68, "w": 7.56, "h": 7.56, "rot": 90, "cut": true }, { "sizeLabel": "29.7 x 7.56 x 0.197", "x": 7.56, "y": 22.68, "w": 29.7, "h": 7.56, "rot": 90 }, { "sizeLabel": "29.7 x 7.56 x 0.197", "x": 37.26, "y": 22.68, "w": 22.14, "h": 7.56, "rot": 90, "cut": true }] }
   }
  ]
 },
// Bolton Ridge Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.03 x 7.13 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Bolton Ridge",
  "productSlug": "bolton-ridge",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/bolton-ridge/face-top-a.jpg",
    "sizesUsed": [
     "48.03 x 7.13 x 0.197"
    ],
    "module": { "widthIn": 96.06, "heightIn": 28.52, "tiles": [{ "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 0, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 48.03, "y": 0, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 7.13, "w": 24.015, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 24.015, "y": 7.13, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 72.045, "y": 7.13, "w": 24.015, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 14.26, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 48.03, "y": 14.26, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 21.39, "w": 19.99, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 19.99, "y": 21.39, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 68.02, "y": 21.39, "w": 28.04, "h": 7.13, "rot": 90, "cut": true }] }
   }
  ]
 },
// Stallion Springs Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.03 x 7.13 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Stallion Springs",
  "productSlug": "stallion-springs",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/stallion-springs/face-top-a.jpg",
    "sizesUsed": [
     "48.03 x 7.13 x 0.197"
    ],
    "module": {
     "widthIn": 96.06,
     "heightIn": 14.26,
     "tiles": [
      {
       "sizeLabel": "48.03 x 7.13 x 0.197",
       "x": 0,
       "y": 0,
       "w": 48.03,
       "h": 7.13,
       "rot": 90
      },
      {
       "sizeLabel": "48.03 x 7.13 x 0.197",
       "x": 48.03,
       "y": 0,
       "w": 48.03,
       "h": 7.13,
       "rot": 90
      },
      {
       "sizeLabel": "48.03 x 7.13 x 0.197",
       "x": 0,
       "y": 7.13,
       "w": 24.015,
       "h": 7.13,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "48.03 x 7.13 x 0.197",
       "x": 24.015,
       "y": 7.13,
       "w": 48.03,
       "h": 7.13,
       "rot": 90
      },
      {
       "sizeLabel": "48.03 x 7.13 x 0.197",
       "x": 72.045,
       "y": 7.13,
       "w": 24.015,
       "h": 7.13,
       "rot": 90,
       "cut": true
      }
     ]
    }
   }
  ]
 },
// Stonecastle Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48 x 7 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Stonecastle",
  "productSlug": "stonecastle",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/stonecastle/face-top-a.jpg",
    "sizesUsed": [
     "48 x 7 x 0.197"
    ],
    "module": { "widthIn": 96, "heightIn": 28, "tiles": [{ "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 0, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 48, "y": 0, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 7, "w": 24, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 24, "y": 7, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 72, "y": 7, "w": 24, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 14, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 48, "y": 14, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 21, "w": 17.68, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 17.68, "y": 21, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 65.68, "y": 21, "w": 30.32, "h": 7, "rot": 90, "cut": true }] }
   }
  ]
 },
// Rocky Road Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.62 x 7.56 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Rocky Road",
  "productSlug": "rocky-road",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/rocky-road/face-top-a.jpg",
    "sizesUsed": [
     "48.62 x 7.56 x 0.197"
    ],
    "module": { "widthIn": 97.24, "heightIn": 30.24, "tiles": [{ "sizeLabel": "48.62 x 7.56 x 0.197", "x": 0, "y": 0, "w": 48.62, "h": 7.56, "rot": 90 }, { "sizeLabel": "48.62 x 7.56 x 0.197", "x": 48.62, "y": 0, "w": 48.62, "h": 7.56, "rot": 90 }, { "sizeLabel": "48.62 x 7.56 x 0.197", "x": 0, "y": 7.56, "w": 24.31, "h": 7.56, "rot": 90, "cut": true }, { "sizeLabel": "48.62 x 7.56 x 0.197", "x": 24.31, "y": 7.56, "w": 48.62, "h": 7.56, "rot": 90 }, { "sizeLabel": "48.62 x 7.56 x 0.197", "x": 72.93, "y": 7.56, "w": 24.31, "h": 7.56, "rot": 90, "cut": true }, { "sizeLabel": "48.62 x 7.56 x 0.197", "x": 0, "y": 15.12, "w": 48.62, "h": 7.56, "rot": 90 }, { "sizeLabel": "48.62 x 7.56 x 0.197", "x": 48.62, "y": 15.12, "w": 48.62, "h": 7.56, "rot": 90 }, { "sizeLabel": "48.62 x 7.56 x 0.197", "x": 0, "y": 22.68, "w": 19.2, "h": 7.56, "rot": 90, "cut": true }, { "sizeLabel": "48.62 x 7.56 x 0.197", "x": 19.2, "y": 22.68, "w": 48.62, "h": 7.56, "rot": 90 }, { "sizeLabel": "48.62 x 7.56 x 0.197", "x": 67.82, "y": 22.68, "w": 29.42, "h": 7.56, "rot": 90, "cut": true }] }
   }
  ]
 },
// Boardwalk Oak Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.03 x 7.13 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Boardwalk Oak",
  "productSlug": "boardwalk-oak",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/boardwalk-oak/face-top-a.jpg",
    "sizesUsed": [
     "48.03 x 7.13 x 0.197"
    ],
    "module": { "widthIn": 96.06, "heightIn": 28.52, "tiles": [{ "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 0, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 48.03, "y": 0, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 7.13, "w": 24.015, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 24.015, "y": 7.13, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 72.045, "y": 7.13, "w": 24.015, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 14.26, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 48.03, "y": 14.26, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 21.39, "w": 19.27, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 19.27, "y": 21.39, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 67.3, "y": 21.39, "w": 28.76, "h": 7.13, "rot": 90, "cut": true }] }
   }
  ]
 },
// Ansleigh Cottage Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): porcelain-class vinyl plank; module at the longest honest print. NAMED GAP: no full-length face exists in this product's imagery (longest print 32.96 in; the real plank is 48.03 in) — the module is built at the longest print length. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Ansleigh Cottage",
  "productSlug": "ansleigh-cottage",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/ansleigh-cottage/face-top-f.jpg",
    "sizesUsed": [
     "32.96 x 7.2 x 0.197"
    ],
    "module": { "widthIn": 65.92, "heightIn": 28.8, "tiles": [{ "sizeLabel": "32.96 x 7.2 x 0.197", "x": 0, "y": 0, "w": 32.96, "h": 7.2, "rot": 90 }, { "sizeLabel": "32.96 x 7.2 x 0.197", "x": 32.96, "y": 0, "w": 32.96, "h": 7.2, "rot": 90 }, { "sizeLabel": "32.96 x 7.2 x 0.197", "x": 0, "y": 7.2, "w": 16.48, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "32.96 x 7.2 x 0.197", "x": 16.48, "y": 7.2, "w": 32.96, "h": 7.2, "rot": 90 }, { "sizeLabel": "32.96 x 7.2 x 0.197", "x": 49.44, "y": 7.2, "w": 16.48, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "32.96 x 7.2 x 0.197", "x": 0, "y": 14.4, "w": 32.96, "h": 7.2, "rot": 90 }, { "sizeLabel": "32.96 x 7.2 x 0.197", "x": 32.96, "y": 14.4, "w": 32.96, "h": 7.2, "rot": 90 }, { "sizeLabel": "32.96 x 7.2 x 0.197", "x": 0, "y": 21.6, "w": 12.89, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "32.96 x 7.2 x 0.197", "x": 12.89, "y": 21.6, "w": 32.96, "h": 7.2, "rot": 90 }, { "sizeLabel": "32.96 x 7.2 x 0.197", "x": 45.85, "y": 21.6, "w": 20.07, "h": 7.2, "rot": 90, "cut": true }] }
   }
  ]
 },
// Clam Shell Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48 x 7 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Clam Shell",
  "productSlug": "clam-shell",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/clam-shell/face-top-a.jpg",
    "sizesUsed": [
     "48 x 7 x 0.197"
    ],
    "module": { "widthIn": 96, "heightIn": 28, "tiles": [{ "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 0, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 48, "y": 0, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 7, "w": 24, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 24, "y": 7, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 72, "y": 7, "w": 24, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 14, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 48, "y": 14, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 0, "y": 21, "w": 18.47, "h": 7, "rot": 90, "cut": true }, { "sizeLabel": "48 x 7 x 0.197", "x": 18.47, "y": 21, "w": 48, "h": 7, "rot": 90 }, { "sizeLabel": "48 x 7 x 0.197", "x": 66.47, "y": 21, "w": 29.53, "h": 7, "rot": 90, "cut": true }] }
   }
  ]
 },
// Manchester Cove Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.03 x 7.13 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Manchester Cove",
  "productSlug": "manchester-cove",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/manchester-cove/face-top-a.jpg",
    "sizesUsed": [
     "48.03 x 7.13 x 0.197"
    ],
    "module": { "widthIn": 96.06, "heightIn": 28.52, "tiles": [{ "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 0, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 48.03, "y": 0, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 7.13, "w": 24.015, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 24.015, "y": 7.13, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 72.045, "y": 7.13, "w": 24.015, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 14.26, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 48.03, "y": 14.26, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 0, "y": 21.39, "w": 13.32, "h": 7.13, "rot": 90, "cut": true }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 13.32, "y": 21.39, "w": 48.03, "h": 7.13, "rot": 90 }, { "sizeLabel": "48.03 x 7.13 x 0.197", "x": 61.35, "y": 21.39, "w": 34.71, "h": 7.13, "rot": 90, "cut": true }] }
   }
  ]
 },
// Lincoln Trail Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): porcelain-class vinyl plank; module at the longest honest print. NAMED GAP: no full-length face exists in this product's imagery (longest print 24.04 in; the real plank is 48.62 in) — the module is built at the longest print length. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Lincoln Trail",
  "productSlug": "lincoln-trail",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/lincoln-trail/face-top-i.jpg",
    "sizesUsed": [
     "24.04 x 7.56 x 0.197"
    ],
    "module": { "widthIn": 48.08, "heightIn": 30.24, "tiles": [{ "sizeLabel": "24.04 x 7.56 x 0.197", "x": 0, "y": 0, "w": 24.04, "h": 7.56, "rot": 90 }, { "sizeLabel": "24.04 x 7.56 x 0.197", "x": 24.04, "y": 0, "w": 24.04, "h": 7.56, "rot": 90 }, { "sizeLabel": "24.04 x 7.56 x 0.197", "x": 0, "y": 7.56, "w": 12.02, "h": 7.56, "rot": 90, "cut": true }, { "sizeLabel": "24.04 x 7.56 x 0.197", "x": 12.02, "y": 7.56, "w": 24.04, "h": 7.56, "rot": 90 }, { "sizeLabel": "24.04 x 7.56 x 0.197", "x": 36.06, "y": 7.56, "w": 12.02, "h": 7.56, "rot": 90, "cut": true }, { "sizeLabel": "24.04 x 7.56 x 0.197", "x": 0, "y": 15.12, "w": 24.04, "h": 7.56, "rot": 90 }, { "sizeLabel": "24.04 x 7.56 x 0.197", "x": 24.04, "y": 15.12, "w": 24.04, "h": 7.56, "rot": 90 }, { "sizeLabel": "24.04 x 7.56 x 0.197", "x": 0, "y": 22.68, "w": 7.56, "h": 7.56, "rot": 90, "cut": true }, { "sizeLabel": "24.04 x 7.56 x 0.197", "x": 7.56, "y": 22.68, "w": 24.04, "h": 7.56, "rot": 90 }, { "sizeLabel": "24.04 x 7.56 x 0.197", "x": 31.6, "y": 22.68, "w": 16.48, "h": 7.56, "rot": 90, "cut": true }] }
   }
  ]
 },
// Timberwolf Trail Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): porcelain-class vinyl plank; module at the longest honest print. NAMED GAP: no full-length face exists in this product's imagery (longest print 28.84 in; the real plank is 48.03 in) — the module is built at the longest print length. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Timberwolf Trail",
  "productSlug": "timberwolf-trail",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/timberwolf-trail/face-top-d.jpg",
    "sizesUsed": [
     "28.84 x 7.2 x 0.197"
    ],
    "module": { "widthIn": 57.68, "heightIn": 28.8, "tiles": [{ "sizeLabel": "28.84 x 7.2 x 0.197", "x": 0, "y": 0, "w": 28.84, "h": 7.2, "rot": 90 }, { "sizeLabel": "28.84 x 7.2 x 0.197", "x": 28.84, "y": 0, "w": 28.84, "h": 7.2, "rot": 90 }, { "sizeLabel": "28.84 x 7.2 x 0.197", "x": 0, "y": 7.2, "w": 14.42, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "28.84 x 7.2 x 0.197", "x": 14.42, "y": 7.2, "w": 28.84, "h": 7.2, "rot": 90 }, { "sizeLabel": "28.84 x 7.2 x 0.197", "x": 43.26, "y": 7.2, "w": 14.42, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "28.84 x 7.2 x 0.197", "x": 0, "y": 14.4, "w": 28.84, "h": 7.2, "rot": 90 }, { "sizeLabel": "28.84 x 7.2 x 0.197", "x": 28.84, "y": 14.4, "w": 28.84, "h": 7.2, "rot": 90 }, { "sizeLabel": "28.84 x 7.2 x 0.197", "x": 0, "y": 21.6, "w": 7.2, "h": 7.2, "rot": 90, "cut": true }, { "sizeLabel": "28.84 x 7.2 x 0.197", "x": 7.2, "y": 21.6, "w": 28.84, "h": 7.2, "rot": 90 }, { "sizeLabel": "28.84 x 7.2 x 0.197", "x": 36.04, "y": 21.6, "w": 21.64, "h": 7.2, "rot": 90, "cut": true }] }
   }
  ]
 },
// Auburn Glen Waterproof Rigid Core Luxury Vinyl Plank - Foam Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): printed plank 48.62 x 7.01 x 0.197 in per its F&D registry record. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Auburn Glen",
  "productSlug": "auburn-glen",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/app/floor-and-decor/duralux-performance/auburn-glen/face-top-a.jpg",
    "sizesUsed": [
     "48.62 x 7.01 x 0.197"
    ],
    "module": { "widthIn": 97.24, "heightIn": 28.04, "tiles": [{ "sizeLabel": "48.62 x 7.01 x 0.197", "x": 0, "y": 0, "w": 48.62, "h": 7.01, "rot": 90 }, { "sizeLabel": "48.62 x 7.01 x 0.197", "x": 48.62, "y": 0, "w": 48.62, "h": 7.01, "rot": 90 }, { "sizeLabel": "48.62 x 7.01 x 0.197", "x": 0, "y": 7.01, "w": 24.31, "h": 7.01, "rot": 90, "cut": true }, { "sizeLabel": "48.62 x 7.01 x 0.197", "x": 24.31, "y": 7.01, "w": 48.62, "h": 7.01, "rot": 90 }, { "sizeLabel": "48.62 x 7.01 x 0.197", "x": 72.93, "y": 7.01, "w": 24.31, "h": 7.01, "rot": 90, "cut": true }, { "sizeLabel": "48.62 x 7.01 x 0.197", "x": 0, "y": 14.02, "w": 48.62, "h": 7.01, "rot": 90 }, { "sizeLabel": "48.62 x 7.01 x 0.197", "x": 48.62, "y": 14.02, "w": 48.62, "h": 7.01, "rot": 90 }, { "sizeLabel": "48.62 x 7.01 x 0.197", "x": 0, "y": 21.03, "w": 17.62, "h": 7.01, "rot": 90, "cut": true }, { "sizeLabel": "48.62 x 7.01 x 0.197", "x": 17.62, "y": 21.03, "w": 48.62, "h": 7.01, "rot": 90 }, { "sizeLabel": "48.62 x 7.01 x 0.197", "x": 66.24, "y": 21.03, "w": 31, "h": 7.01, "rot": 90, "cut": true }] }
   }
  ]
 },
// Amsterdam Ash Waterproof Rigid Core Luxury Vinyl Plank - Cork Pad — merged from Floor & Decor 2026-11-16 (F&D merge, batch): porcelain-class vinyl plank; module at the longest honest print. NAMED GAP: no full-length face exists in this product's imagery (longest print 21.86 in; the real plank is 47.64 in) — the module is built at the longest print length. Running bond at the printed width, following the Jurupa/Kao plank-pattern template in this file; cut pieces marked cut, as there.
 {
  "product": "Amsterdam Ash",
  "productSlug": "amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad",
  "category": "Vinyl Flooring",
  "patterns": [
   {
    "name": "Running Bond",
    "mixed": false,
    "source": "standard",
    "preview": "/textures/floor-decor/amsterdam-ash-waterproof-rigid-core-luxury-vinyl-plank---cork-pad/face-top-d.jpg",
    "sizesUsed": [
     "21.86 x 7.72 x 0.256"
    ],
    "module": {
     "widthIn": 43.72,
     "heightIn": 15.44,
     "tiles": [
      {
       "sizeLabel": "21.86 x 7.72 x 0.256",
       "x": 0,
       "y": 0,
       "w": 21.86,
       "h": 7.72,
       "rot": 90
      },
      {
       "sizeLabel": "21.86 x 7.72 x 0.256",
       "x": 21.86,
       "y": 0,
       "w": 21.86,
       "h": 7.72,
       "rot": 90
      },
      {
       "sizeLabel": "21.86 x 7.72 x 0.256",
       "x": 0,
       "y": 7.72,
       "w": 10.93,
       "h": 7.72,
       "rot": 90,
       "cut": true
      },
      {
       "sizeLabel": "21.86 x 7.72 x 0.256",
       "x": 10.93,
       "y": 7.72,
       "w": 21.86,
       "h": 7.72,
       "rot": 90
      },
      {
       "sizeLabel": "21.86 x 7.72 x 0.256",
       "x": 32.79,
       "y": 7.72,
       "w": 10.93,
       "h": 7.72,
       "rot": 90,
       "cut": true
      }
     ]
    }
   }
  ]
 }
];

export const BELGARD_PATTERNS_COUNT = 155;
