# screenadjusterauto

Automatic screen-fitting layer. Widgets expand with the viewport so wide and
ultra-wide monitors reach the corners instead of being boxed into a fixed
column.

```
screenadjusterauto/
  config/screenTiers.ts        tier table (gutters, shell/rail/overlay widths, card min)
  hooks/useScreenAdjuster.ts   viewport watcher -> tier + ready-made style objects
  components/AutoShell.tsx     AutoShell / AutoSplit / AutoOverlay / AutoBoard / AutoCardGrid
  index.ts                     public entry point
```

## Usage

```tsx
import { AutoShell, AutoSplit, useScreenAdjuster } from "@/screenadjusterauto";

<AutoShell as="main" className="py-10">
  <AutoSplit>
    <div className="min-w-0">…content…</div>
    <aside>…rail…</aside>
  </AutoSplit>
</AutoShell>
```

## Changing behaviour

Tune `SCREEN_TIERS` in `config/screenTiers.ts` — every consumer updates at
once. Do not reintroduce hardcoded `max-w-[1240px]` values in pages.
