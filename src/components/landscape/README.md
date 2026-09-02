# Landscape (Planting Studio)

The planting side of the Wonderlands design boards.

- `LandscapeDrawingBoard.tsx` — the board. Beds are traced on the shared
  **10 px = 1 ft** grid (identical to the site, turf, fence and enclosure
  boards) so a planting plan can be merged into the global design board with no
  rescaling. Plants are placed as real catalog items and drawn from above at
  their true mature canopy for the chosen container size, with foliage colour,
  form (mound / tree / palm / grass / mat / spike) and flowers rendered.

Supporting logic lives outside the component so the cost leaves and suites can
price a plan without loading the canvas:

- `src/lib/landscape/plantSpecs.ts` — plan-view botany derived from the price
  list: canopy spread, mature height, on-centre spacing, foliage colour and
  bloom colour (read from the colour word already in the catalog name).
- `src/lib/landscape/landscapeEstimate.ts` — layout types, geometry, bed
  surfaces (mulch / shell / rock / sod), and the take-off: bed sq ft, edging lf,
  mulch cu yd, plant schedule by species and installed total.

## Tools

| Tool | Behaviour |
| --- | --- |
| Plant | click sets one plant; drag sweeps a natural drift at on-centre spacing |
| Hedge run | click a polyline, double-click / Enter to space the plant along it |
| Bed | trace an outline, double-click / Enter to close; `C` rounds a vertex |
| Select | drag plants, restyle or delete beds, `Delete` removes the selection |
| Mass-plant bed | fills the selected bed on a staggered grid at spacing |

Layout shape (persisted per discipline in `flipBoardStore`):

```ts
{ beds: LandscapeBed[]; plantings: LandscapePlanting[]; irrigation?: boolean }
```
