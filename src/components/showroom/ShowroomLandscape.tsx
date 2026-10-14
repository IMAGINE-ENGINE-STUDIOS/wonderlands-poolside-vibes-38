/**
 * Showroom Landscaping widget — the Landscape Studio behind a starting screen
 * (same pattern as the 2D/3D pre-screens). "View in 3D" opens the plan in the
 * embedded 3D studio right below instead of leaving the showroom.
 */
import * as React from "react";
import { Button } from "@/components/ui/button";
import { LANDSCAPE_LOOKS } from "@/lib/landscape/presets";

const LandscapeStudio = React.lazy(() => import("@/components/landscape/LandscapeStudio"));
const ShowroomStudio3D = React.lazy(() => import("@/components/showroom/ShowroomStudio3D"));

export default function ShowroomLandscape() {
  const [entered, setEntered] = React.useState(false);
  const [show3D, setShow3D] = React.useState(false);
  if (!entered) {
    return (
      <div className="border border-border/70 bg-background p-6 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Wonderlands · Landscape Studio</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight md:text-5xl">Plant the garden around your pool.</h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Start from a look, draw beds, place real plants at real spacing, ask Genius for changes, see the live take-off and price — then walk it in 3D.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {LANDSCAPE_LOOKS.map((l) => (
            <div key={l.id} className="border border-border/60 p-3">
              <div className="flex gap-1">{l.palette.map((c) => <span key={c} className="h-4 flex-1" style={{ background: c }} />)}</div>
              <div className="mt-2 font-serif text-sm">{l.title}</div>
            </div>
          ))}
        </div>
        <Button onClick={() => setEntered(true)} className="mt-6 rounded-none px-8 text-[10px] uppercase tracking-[0.3em]">Enter the Landscape Studio</Button>
      </div>
    );
  }
  return (
    <React.Suspense fallback={<div className="p-10 text-center text-sm text-muted-foreground">Opening the Landscape Studio…</div>}>
      <LandscapeStudio compact onView3D={() => setShow3D(true)} />
      {show3D && <div className="mt-6"><ShowroomStudio3D height={620} /></div>}
    </React.Suspense>
  );
}
