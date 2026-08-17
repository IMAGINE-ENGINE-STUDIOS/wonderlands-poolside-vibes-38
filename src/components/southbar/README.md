# SouthBar

A long, glassmorphic bar docked to the south (bottom) edge of a page.

## Contents
- `SouthBar.tsx` — the rail plus its two sheets (search / chat).
- `index.ts` — public API (`SouthBar`, `SouthBarProps`).

## Behaviour
- **Left instrument — search.** Clicking opens a sheet above the rail rendering
  the existing `FlipSearch` engine. Results are handed back through
  `onOpenCategory` / `onOpenProduct`; without those props it navigates to `/flip`.
- **Right instrument — chatbox.** A minimal Genius input. Turns run through
  `useGenius`, so the local FLIP brain answers first and only free-form
  questions reach the paid support function. Suggestion chips of type
  `navigate` are routed through `safeGeniusPath` so admin routes stay protected.
- One sheet open at a time; `Esc` or the scrim closes it.

## Styling
Pure semantic tokens (`background`, `foreground`, `primary`, `muted-foreground`)
with `backdrop-blur-2xl` glass. No hardcoded colours, so it themes with the app.

## Responsiveness
Rail stacks vertically under `sm`, becomes a two-instrument row from `sm`, and
adds the context stamp from `lg`. Sheets are width-clamped to the viewport.

## Usage
```tsx
import { SouthBar } from "@/components/southbar";

<SouthBar contextLabel="Quote Atelier" onOpenCategory={...} onOpenProduct={...} />
```
Add bottom padding (~5rem) to the page content so the rail never covers it.
