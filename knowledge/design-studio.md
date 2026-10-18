# The Design Studio — what Genius must be able to do

Routes: `/design-studio` (2D designer + 3D MODE), boards also embedded in
FLIP design spreads and studio tools. Genius controls a board through the
design bus (`src/lib/geniusDesignBus.ts`): a board registers an agent,
Genius resolves speech/text against it. Local commands cost nothing;
anything beyond them routes by `model-routing.md` (`design` / `scene3d`).

## 2D designer — required abilities

- Draw on request: pools (any catalog shape or freeform), spas, decks,
  turf, fences, screen enclosures, lanais, driveways, patios and
  landscaping — including complex, multi-zone landscaping plans.
- Resize any shape to spoken dimensions ("make the pool 16 by 32"),
  in words or digits, feet or metres.
- Modify any spline: add/remove points, curve a straight edge, straighten
  a curve, reshape one side without touching the rest.
- Move objects: pools, decks, spas, furniture — by direction and distance
  ("move the pool two feet left"), by target ("centre it"), or by
  relationship ("next to the fence", "inside the screen").
- Restyle: change finishes of the waterline, pool shell, coping, deck,
  fence and screens from the real finish libraries
  (`src/data/pebbleTecFinishes.ts`, `src/data/copingEdgeProfiles.ts`,
  `src/data/textureLibrary.ts`).
- Adjust pool elements: tanning ledges, steps, benches, spas, covers.
- Price and describe the drawing at any moment from the live estimators.

## 3D MODE — required abilities

- Build complete scenes: pool + deck + enclosure + landscaping +
  furniture composed as one believable backyard, not a pile of objects.
- Add grass, flowers, palms and trees; vehicles; decorations; patio
  furniture; fireplaces and fire pits; BBQ and full outdoor kitchens.
- Use Sketchfab models (via the `sketchfab-download` function and
  `scene-genius`) **scaled to real-world size** — a chair is chair-sized,
  a palm is palm-sized; every imported object is normalised against its
  declared dimensions before it enters the scene.
- Restyle in 3D the same finishes as 2D (waterline, shell, coping, deck,
  fence, screen) and re-light / re-time scenes (day, dusk) on request.

## Placement rules (absolute)

1. **Never place plants — or anything — on top of a deck, a pool, a fence
   or a screen.** Plants live in soil/planter zones and open ground only.
2. Objects sit in the zone the guest names, and Genius must understand
   zone language:
   - "inside the screen" = within the screen enclosure's footprint,
     on its floor/deck or open areas inside it — never on the screen itself.
   - "inside the fenced area" / "the empty area inside the fence" = the
     open ground enclosed by the fence line.
   - "on the deck" is the only phrasing that puts objects on a deck,
     and only objects that belong there (furniture, BBQ, kitchen, fireplace).
3. Nothing overlaps the pool water except pool elements (ledges, covers,
   steps) and things explicitly meant to float.
4. Vehicles belong on driveways and hard standing, never on turf or decks.
5. When a requested placement breaks a rule, Genius moves the object to
   the nearest legal spot and says what it did — it never silently
   stacks objects.

## Conversation behaviour

- Every action is confirmed in words with the result ("The palms are in —
  two on the open turf inside the fence, clear of the deck.").
- "Make it beautiful" means: complete the scene with balanced planting,
  furniture and lighting in the open zones, respecting every rule above.
- Undo is always one word away ("undo", "put it back").
