# Design Studio — complete feature atlas (2D + 3D)

The Genius knowledge base for `/design-studio`. Everything here was verified
against the app's own code (audit 2026-10-18). When a guest asks for anything
in this document, Genius must be able to do it or route it — never claim the
Studio cannot do something listed here.

**One board, one truth** (the Studio's own invariant): 2D and 3D are the same
design. 2D = `PoolBuilder` (canonical pool + auto-attached deck + extra bodies
+ features) + `SiteElementsLayer` (fences, screen enclosures, turf, drawn
decks) sharing one board and one coordinate world (10 px = 1 ft). 3D =
`UnifiedPoolVisualizer` rendering exactly that design; 3D edits flow back to
2D. Switching to 3D without a drawn pool is refused ("Draw your pool first").

## EDIT-IN-PLACE DOCTRINE (founder rule, absolute)

- The guest's design EXISTS. Every request edits it. Genius returns/applies
  ONLY what the request changes; everything unnamed stays exactly as drawn.
- "Make the pool 2 feet larger" resizes the CURRENT outline (length +2,
  width +2, around its own centre, spline points and curve types preserved).
  "Longer" = length only, "wider" = width only, "deeper/shallower" adjusts
  the depth anchors, "bigger deck" widens the deck ring.
- Spline edits (curve a corner, straighten an edge, round the corners) change
  only the shape/curve data of the current outline — never a redraw.
- A NEW design is produced only when the guest explicitly asks: "new pool",
  "start over", "replace it", "draw me a different pool".
- Preset shapes and catalog picks REPLACE an outline in the app's own UI too
  (and clear features) — Genius must therefore never route an edit through a
  preset/pick; edits go through point transforms.

## 2D — PoolBuilder (the pool board)

- **Shapes:** presets rectangle / kidney / freeform ("Lagoon") at 15 × 35 ft;
  the Genius/3D vocabulary is wider: rectangle, oval, kidney, l-shape,
  freeform, roman. **Circular pool = oval with length == width** (there is no
  circle preset anywhere in the app).
- **Catalog pools:** picking a model drops a rectangle of its real dimensions
  — as the main pool, or as an EXTRA pool beside it (own 3 ft deck) when a
  main pool already exists.
- **Deck:** an auto-attached hardscape ring generated from the pool outline
  (offset default 3 ft, min 3 ft); changing the offset regenerates the ring
  AROUND the existing pool — the pool spline is untouched. Extra hand-drawn
  decks exist per-id, each with its own offset.
- **Depth:** anchors `{position 0–1, depth 1–12 ft}`, dragged on the profile
  editor; click water to add an anchor, minimum 2 anchors. Zero-entry/beach
  entry is applied through the depth anchors (shared with 3D).
- **Extra water bodies** (`additionalPools`): pools and spas, incl.
  **spillover spas** and **tanning ledges** attached to the main pool's edge
  (perimeter-anchored, position 0–1 along the edge), each with its own
  materials, depth and shape (rectangle/kidney/freeform).
- **Feature tools:** Stairs (step count adjustable), Seat, Wall, Light, Jet,
  Diving board, Slide, Pool cover, accessories; wall-attached features snap
  to a wall segment with a position along it.
- **Landscape tools:** Grass Region, Pathway (straight/curved/circular),
  Edging, Tree (palm, oak, pine, willow, maple, cypress), Shrub (round,
  flowering, hedge), Hedge Row, Plant Row, **Rock / Boulder (small, medium,
  large)**, Path Light.
- **Water features:** Fountain, Pond, Stream, Waterfall, Deck Jet, Sprinkler,
  Water Curtain.
- **Utilities:** Dimension, Text Label, Area, Lot Boundary.
- **PoolBuilder's own fence:** points + `fenceDoors` {segment, position,
  width}, smooth/straight runs, **height 3–10 ft (default 6)**.
- **Editing:** drag points (12-in grid snap, toggleable), drag the whole
  outline, per-point coordinate editor (X/Y in feet), per-point curve type:
  **Straight (sharp) / Curve (smooth bezier) / Arc (true circular arc) /
  Freeform**; freehand draw with symmetry; undo/redo (whole-board snapshots).

## 2D — SiteElementsLayer (the site board, same canvas)

Product-first: an element is drawn after choosing its product. Elements:
**fence** (click each post, open line), **screen enclosure**, **turf**,
**drawn deck** (click corners, close the loop). Every element has a spline
menu: edit spline, add a point, move, retexture, erase. Elements persist and
broadcast their full list to the rest of the Studio.

- **Fences:** Aluminum picket / Vinyl privacy / Glass pool fence; colors
  black, bronze, white. Heights (fenceConfigurator): 36" $40/ft
  (non-compliant), 48" $45/ft (pool-barrier compliant), 54" $50/ft, 60"…
  **Gates:** Walk Gate 36" $850 · Walk Gate 48" $850 · Double Gate 6 ft
  $1,700 · Double Gate 10 ft $1,700.
- **Screen enclosures:** Standard cage (8/10 ft), Deluxe cage (10/12 ft),
  2-story Premium cage (18/20 ft); frame bronze/white/black; 3D roof mansard
  or flat + optional kick plate. **Doors:** Self-Latching Single Swing 36"
  $1,500 · Self-Latching Double Swing 6 ft $1,500 · Self-Latching Wide 42"
  (ADA) · standard-hinge single/double · Sliding Screen Door 6 ft · Pet Door
  Panel · self-latching kits, door alarms.
- **Turf:** artificial grass products priced per sq ft; turf is CUT around
  pool and deck automatically (net-area engine — water and coping are
  protected; existing decks/turf win overlaps).
- **Drawn decks:** any paver product (families below), priced per sq ft.

## 3D — UnifiedPoolVisualizer + StudioDock

- Everything from 2D carries over (converter keeps the guest's custom points
  as the source of truth). Extra bodies keep their own finish, coping,
  waterline, stairs, seating, elevation in 3D.
- **Camera:** orbit + presets top / front / side / isometric, fly-to,
  walkthrough (WASD), **day/night toggle** (night switches pool lights on).
- **3D editors:** SplineEditPanel (pool-floor, coping, deck, stairs, seating,
  waterline; add/remove points, per-point depth, uniform depth, widths,
  corner radius), Depth Profile Editor (anchors + movable depth axis +
  zero-entry), TerrainEditor, BoardElementEditor (3D fence/screen/water
  edits), perimeter stairs + pool elevation + deck levels, annotations,
  measurements, scene-layer visibility, undo/redo.
- **StudioDock Genius** applies plans to the main pool AND to named bodies
  ("the spa", "pool 2", "the other pool", "all pools"): shape, size, depth,
  zero-entry, finishes, coping width, deck, stairs, seating, lights, night,
  tile scale ("bigger tiles" ×1.5). When only the corner radius changes, the
  existing outline points are preserved and re-rounded in place.
- **Sketchfab models:** Genius adds models ONLY when the guest names them
  (every query word must appear in the request; max 6). Kinds: object, tree,
  terrain, skydome. Placed on a ring OUTSIDE the deck; terrain/skydome at the
  origin. (Known gap: models land at scale 1 with autoFit — no per-category
  real-world scaling yet; Genius must keep them off the pool and deck.)
- **Projects:** named scene snapshots; **Music:** ambient loop.

## Finishes & materials (the real catalog names)

Source of truth: the catalog texture library (finishes + pavers + coping +
waterlines). EVERY water body owns its materials — changing one body's finish
never touches another's.

- **Pool finish / interior (12):** Sapphire Blue, Ocean Blue, Night Sky,
  Shale Gray, Coastal Bronze, Pearl White, Tahoe Blue, Tropics Blue,
  Yosemite, Aqua White, Marina Blue, Midnight Blue (Crystite Crystal
  fiberglass + Mini Pebbles collections; groups Deep & Dramatic / Light &
  Tranquil / Rich & Vibrant).
- **Waterline tile:** liners — Paradise, Water Lilies, Sail Boat, Stormy,
  Ballad, Galant, Melody, Soul, Glacier (glass); Tikal, Port Royal,
  Alexandria (porcelain); San Marino, Firenze, Naples, Milan (Italian stone);
  border tiles Mountain, Carnegie, Panama. (A texture pick in 3D; in 2D the
  waterline is a per-body feature/rate.)
- **Coping:** any paver name works as coping in the texture system; classic
  catalog — Bullnose (White/Cream/Gray/Charcoal), Cantilever (Concrete Gray/
  Sandstone/Charcoal/White), Natural Stone (Bluestone/Limestone/Travertine/
  Granite), Tile (Ocean Blue/Pearl White/Sandy Beige/Slate Gray). Edge
  profile: squared or bullnose.
- **Deck pavers (36):** Appian (Adobe, Amaretto, Harvest Blend,
  Knightsbridge, Napoli, Rio, Slate, Titanium, Charco) · Catalina Grana
  (Amaretto, Napoli, Rio, Scandina Gray, Slate, Titanium) · Catalina
  (Napoli, Slate, Titanium) · Coralina · Gloca Mirage
  (Ideal/Concrete/Chairmues, 48×48 and 24×48) · Travertine (Light, Dark,
  Misty, Steel, Pearly, Silver, Rustic, Classic, Tumbled, Honed).
- **Fence / screen / turf / lanai / covers:** fence materials and gates as
  above; screens Standard $22 / Deluxe $24 / Premium $26 per sq ft; lanai
  Standard $60 / Deluxe $80 / Premium $100 per sq ft; automatic covers
  Eclipse $27,000 · CS3000 $30,000 · Infinity 4000 $32,000 · Atom $25,000.

## Pool elements (what plans can carry)

- **Stairs:** classic / wedding-cake / bench / floating; width 3–14 ft;
  position along the wall 0–1; soft edge 0–0.5.
- **Seating:** bench / lounge (the "Tanning Ledge" preset 2.5 × 6 ft) /
  corner / barstool (1–8) / contour (wall-swept, bends around corners).
- **Lights:** 0–8 per plan, spread along the wall, color + gradient modes,
  on at night.
- **Zero entry:** a depth-anchor rewrite over the entry length (4–15 ft).

## Splines — three systems, never conflate them

1. **PoolBuilder points** `{x, y, curveType: linear|curve|arc|freeform}` —
   the Design Studio's pool/deck/extra-body outlines. Per-point curvature;
   no global tension.
2. **Site element polylines** — fences, enclosures, turf, drawn decks;
   spline menu editing (add point, drag, retexture).
3. **Blueprint board shapes** (SitePlanData — the FLIP/permit board, NOT the
   Design Studio): layers property, building, driveway, patio, pool, spa,
   ledge, deck, enclosure, turf, solar, gravel, fence, equipment; shapes
   carry per-point curves/arcs/fillets/tension. The design bus (moves,
   group moves, reshapes, placement rules) operates on THIS board.

## Placement rules (absolute, all boards)

- NOTHING is placed on top of a pool, spa or tanning ledge.
- Plants and turf never go on a deck, patio, driveway or building — open
  ground, inside the fenced area, or inside the screen enclosure's floor.
- Furniture, fire features, outdoor kitchens and decor MAY sit on the deck
  when the guest asks. Vehicles belong on the driveway only.
- "Inside the screen" = inside the enclosure polygon; "inside the fenced
  area" = inside the closed fence line; never ON the screen or fence itself.
  A fence goes AROUND the deck when asked ("a fence around the deck" = the
  fence line follows outside the deck edge).

## How Genius reaches the Studio (seams, for the record)

Window events: `design-studio:board-command` (undo/redo/save/projects),
`design-studio:selection` / `:select` (material target: `__pool`, `__deck`,
`__xp:<id>`, `__xd:<id>`, or a site element id), `design-studio:site-restyle`
(restyle a site element), `design-studio:add-gate` + `:gate-result` (gates
and screen doors), `design-studio:site-elements` (element list),
`studio3d:globalDesign` (2D→3D hand-off). PoolBuilder props:
`onExternalUpdate` is the channel Genius results enter through;
`externalTool` arms any tool above by name; `renderOverlay` shares the view.

## Known gaps (be honest, route around them)

- Sauna: a catalog exists but no Studio add-on is wired — offer the catalog,
  don't promise placement.
- CAD/DXF import in the shape panel is a stub.
- 2D has no typed-dimension resize in the UI (dimension labels are
  read-only) — Genius point transforms are the way.
- Sketchfab models lack per-category real-world scaling (see 3D above).
